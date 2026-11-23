// Edge Function: contact-form
// Recibe los envios del formulario de contacto de /contacto (landing) y:
//   1) Los guarda siempre en public.contact_submissions (nunca se pierde un mensaje).
//   2) Envia una notificacion por correo a CONTACT_TO_EMAIL con Reply-To del visitante,
//      usando la API de Gmail (OAuth2, cuenta infinihon.hn@gmail.com) — no Resend:
//      Resend en su plan gratuito solo entrega al dueño de la cuenta hasta verificar
//      un dominio propio, asi que nunca llegaba de forma confiable.
// Publica (verify_jwt=false): cualquier visitante del sitio puede llamarla sin sesion.
//
// Este archivo es la copia de referencia versionada en git. El despliegue real
// vive en Supabase (proyecto "Infinihon Vanguard", funcion "contact-form") y se
// actualiza con la Supabase CLI o el MCP de Supabase, no con el build de este repo.
//
// Secrets requeridos en el proyecto de Supabase:
//   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN,
//   GMAIL_SENDER_ADDRESS (infinihon.hn@gmail.com)
//   CONTACT_TO_EMAIL -> infinihon.hn@gmail.com (buzón de destino)
//
// La logica de envio esta duplicada en este archivo y en welcome-email/index.ts
// porque el despliegue de cada funcion sube un solo archivo (no hay módulos
// compartidos entre funciones en este flujo).

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, max = 4000): string {
  return String(value ?? "").trim().slice(0, max);
}

/* ───────────── Envio de correo via la API de Gmail (OAuth2) ───────────── */

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getGmailAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get("GMAIL_CLIENT_ID");
  const clientSecret = Deno.env.get("GMAIL_CLIENT_SECRET");
  const refreshToken = Deno.env.get("GMAIL_REFRESH_TOKEN");
  if (!clientId || !clientSecret || !refreshToken) return null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
    });
    if (!res.ok) {
      console.error("contact-form: gmail token refresh failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    return data.access_token ?? null;
  } catch (e) {
    console.error("contact-form: gmail token refresh error", e);
    return null;
  }
}

function encodeHeaderWord(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return `=?UTF-8?B?${base64UrlEncode(bytes).replace(/-/g, "+").replace(/_/g, "/")}?=`;
}

async function sendGmail(to: string, subject: string, text: string, replyTo?: string, fromName?: string): Promise<boolean> {
  const accessToken = await getGmailAccessToken();
  if (!accessToken) return false;
  const senderAddress = Deno.env.get("GMAIL_SENDER_ADDRESS") ?? "infinihon.hn@gmail.com";
  const fromHeader = fromName ? `${encodeHeaderWord(fromName)} <${senderAddress}>` : senderAddress;
  const lines = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Subject: ${encodeHeaderWord(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
  ];
  if (replyTo) lines.push(`Reply-To: ${replyTo}`);
  lines.push("", text);
  const raw = base64UrlEncode(new TextEncoder().encode(lines.join("\r\n")));
  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) {
      console.error("contact-form: gmail send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("contact-form: gmail send error", e);
    return false;
  }
}

/* ───────────────────────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ ok: false, error: "method-not-allowed" }, 405);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "invalid-json" }, 400);
  }

  // Honeypot: campo oculto que solo los bots rellenan. Si llega con contenido,
  // respondemos "ok" sin guardar ni enviar nada (no delatamos la trampa).
  if (clean(payload.website)) return json({ ok: true });

  const name = clean(payload.name, 200);
  const company = clean(payload.company, 200);
  const email = clean(payload.email, 320);
  const interest = clean(payload.interest, 200);
  const message = clean(payload.message, 6000);

  if (!name || !message) return json({ ok: false, error: "missing-fields" }, 400);
  if (!email || !EMAIL_RE.test(email)) return json({ ok: false, error: "invalid-email" }, 400);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Rate limiting basico (defensa en profundidad contra flood/spam): la funcion
  // es publica y sin esto cualquiera podia llenar la tabla o agotar la cuota
  // gratuita de envios con peticiones repetidas. Limites: por IP y por email.
  const clientIp = (req.headers.get("x-forwarded-for")?.split(",")[0]?.trim())
    || req.headers.get("cf-connecting-ip")
    || null;

  const shortWindow = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 min
  const longWindow = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hora

  if (clientIp) {
    const { count: byIp } = await supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("client_ip", clientIp)
      .gte("created_at", shortWindow);
    if ((byIp ?? 0) >= 3) return json({ ok: false, error: "rate-limited" }, 429);
  }

  const { count: byEmail } = await supabase
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", longWindow);
  if ((byEmail ?? 0) >= 5) return json({ ok: false, error: "rate-limited" }, 429);

  const { data: inserted, error: insertError } = await supabase
    .from("contact_submissions")
    .insert({ name, company, email, interest, message, client_ip: clientIp })
    .select("id")
    .single();

  if (insertError) {
    console.error("contact-form: insert failed", insertError);
    return json({ ok: false, error: "storage-failed" }, 500);
  }

  const toEmail = Deno.env.get("CONTACT_TO_EMAIL");

  if (toEmail) {
    const lines = [
      `Nombre: ${name}`,
      `Empresa: ${company || "(no indicada)"}`,
      `Email: ${email}`,
      `Interes: ${interest || "(no indicado)"}`,
      "",
      message,
      "",
      "---",
      "Enviado desde el formulario de /contacto en infinihon.vercel.app",
    ];

    const sent = await sendGmail(toEmail, `Nuevo contacto — ${company || name}`, lines.join("\n"), email, "InfiniHon Web");
    if (sent) {
      await supabase.from("contact_submissions").update({ emailed: true }).eq("id", inserted.id);
    }
  }

  return json({ ok: true });
});
