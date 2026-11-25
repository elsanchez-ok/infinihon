// Edge Function: verify-email-code
// Confirma el codigo de 6 digitos enviado por send-verification-code. Si es
// correcto y no ha vencido, marca public.profiles.email_verified_at para el
// usuario de la sesion que llama (identificado por su propio JWT, nunca por
// un id que llegue en el body).
//
// verify_jwt=true: requiere el JWT de la sesion en Authorization.
//
// Defensas:
//   - Maximo 5 intentos fallidos por codigo: al agotarse, hay que pedir uno
//     nuevo (send-verification-code) en vez de seguir probando.
//   - El codigo vencido (10 minutos) tambien obliga a reenviar.
//   - El hash se compara con el mismo HMAC simple (SHA-256 + pepper +
//     user_id) que genera send-verification-code.
//
// Este archivo es la copia de referencia versionada en git. El despliegue
// real vive en Supabase (proyecto "Infinihon Vanguard", funcion
// "verify-email-code") y se actualiza con la Supabase CLI o el MCP de
// Supabase, no con el build de este repo.
//
// Secrets requeridos en el proyecto de Supabase: EMAIL_CODE_PEPPER

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = "https://jcizfmpagprxyhvzuymx.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_f8X-zd5BTDecZwdGSKLZsw_9P6Dm8Uf";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

async function hashCode(code: string, userId: string): Promise<string> {
  const pepper = Deno.env.get("EMAIL_CODE_PEPPER") ?? "";
  const data = new TextEncoder().encode(`${code}:${userId}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const MAX_ATTEMPTS = 5;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ ok: false, error: "method-not-allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "missing-auth" }, 401);
  const userToken = authHeader.replace(/^Bearer\s+/i, "");

  let userId: string;
  try {
    const whoRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: `Bearer ${userToken}` },
    });
    if (!whoRes.ok) return json({ ok: false, error: "invalid-token" }, 401);
    const who = await whoRes.json();
    if (!who?.id) return json({ ok: false, error: "invalid-token" }, 401);
    userId = who.id as string;
  } catch {
    return json({ ok: false, error: "auth-lookup-failed" }, 502);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "invalid-json" }, 400);
  }
  const code = String(payload.code ?? "").trim();
  if (!/^\d{6}$/.test(code)) return json({ ok: false, reason: "invalid-code" });

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, serviceRoleKey);

  const { data: row, error: fetchError } = await admin
    .from("email_verification_codes")
    .select("id, code_hash, expires_at, attempts, consumed_at")
    .eq("user_id", userId)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("verify-email-code: fetch failed", fetchError);
    return json({ ok: false, error: "db-error" }, 500);
  }
  if (!row) return json({ ok: false, reason: "expired" });
  if (new Date(row.expires_at as string).getTime() < Date.now()) return json({ ok: false, reason: "expired" });
  if ((row.attempts as number) >= MAX_ATTEMPTS) return json({ ok: false, reason: "too-many-attempts" });

  const candidateHash = await hashCode(code, userId);
  if (candidateHash !== row.code_hash) {
    await admin.from("email_verification_codes").update({ attempts: (row.attempts as number) + 1 }).eq("id", row.id);
    const remaining = MAX_ATTEMPTS - ((row.attempts as number) + 1);
    return json({ ok: false, reason: remaining > 0 ? "invalid-code" : "too-many-attempts" });
  }

  await admin.from("email_verification_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
  const { error: updateError } = await admin
    .from("profiles")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", userId)
    .is("email_verified_at", null);
  if (updateError) {
    console.error("verify-email-code: profile update failed", updateError);
    return json({ ok: false, error: "db-error" }, 500);
  }

  return json({ ok: true });
});
