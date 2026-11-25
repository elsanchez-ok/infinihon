// Edge Function: send-verification-code
// Genera un codigo de 6 digitos, lo guarda (solo su hash) en
// public.email_verification_codes y lo envia por correo al dueno de la
// sesion que llama a esta funcion. Lo invoca /auth justo despues de un
// registro o de un login cuyo perfil aun no tiene profiles.email_verified_at
// (ver verify-email-code para la confirmacion del codigo).
//
// verify_jwt=true: Supabase exige un JWT valido (la sesion recien creada,
// aunque todavia no este "verificada" a nivel de negocio) en el header
// Authorization antes de invocar esta funcion.
//
// Seguridad del codigo: solo se guarda SHA-256(codigo + pepper + user_id),
// nunca el codigo en claro — igual que una contrasena. EMAIL_CODE_PEPPER es
// un secreto del proyecto; sin el, un volcado de la tabla no alcanza para
// adivinar codigos validos.
//
// Plantilla editable: el asunto y el cuerpo salen de
// public.email_templates (id='verification_code'), editable desde
// /admin/emails. Si por algun motivo la fila no existe, se usa un texto de
// reserva para que el flujo nunca se rompa.
//
// Este archivo es la copia de referencia versionada en git. El despliegue
// real vive en Supabase (proyecto "Infinihon Vanguard", funcion
// "send-verification-code") y se actualiza con la Supabase CLI o el MCP de
// Supabase, no con el build de este repo.
//
// Secrets requeridos en el proyecto de Supabase:
//   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN,
//   GMAIL_SENDER_ADDRESS (infinihon.hn@gmail.com), EMAIL_CODE_PEPPER

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
      console.error("send-verification-code: gmail token refresh failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    return data.access_token ?? null;
  } catch (e) {
    console.error("send-verification-code: gmail token refresh error", e);
    return null;
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function encodeHeaderWord(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return `=?UTF-8?B?${base64UrlEncode(bytes).replace(/-/g, "+").replace(/_/g, "/")}?=`;
}

async function sendGmail(to: string, subject: string, text: string, fromName: string, html: string): Promise<boolean> {
  const accessToken = await getGmailAccessToken();
  if (!accessToken) return false;
  const senderAddress = Deno.env.get("GMAIL_SENDER_ADDRESS") ?? "infinihon.hn@gmail.com";
  const fromHeader = `${encodeHeaderWord(fromName)} <${senderAddress}>`;
  const boundary = `----=_InfiniHon_${crypto.randomUUID().replace(/-/g, "")}`;
  const lines = [
    `From: ${fromHeader}`,
    `To: ${to}`,
    `Subject: ${encodeHeaderWord(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    html,
    "",
    `--${boundary}--`,
  ];
  const raw = base64UrlEncode(new TextEncoder().encode(lines.join("\r\n")));
  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) {
      console.error("send-verification-code: gmail send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("send-verification-code: gmail send error", e);
    return false;
  }
}

/* ───────────── Codigo de 6 digitos + hash ───────────── */

function randomSixDigitCode(): string {
  // Rechazo simple para evitar el sesgo de modulo: solo acepta valores
  // dentro de un rango multiplo exacto de 1,000,000.
  const max = Math.floor(0xffffffff / 1_000_000) * 1_000_000;
  const buf = new Uint32Array(1);
  let n: number;
  do {
    crypto.getRandomValues(buf);
    n = buf[0];
  } while (n >= max);
  return String(n % 1_000_000).padStart(6, "0");
}

async function hashCode(code: string, userId: string): Promise<string> {
  const pepper = Deno.env.get("EMAIL_CODE_PEPPER") ?? "";
  const data = new TextEncoder().encode(`${code}:${userId}:${pepper}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ───────────── Plantilla ───────────── */

function renderTemplate(body: string, vars: Record<string, string>): string {
  let out = body;
  for (const [key, value] of Object.entries(vars)) {
    if (!value) {
      // Quita con elegancia ", {{key}}" cuando el valor viene vacío
      // (p.ej. "Hola, {{firstName}}." -> "Hola.") en vez de dejar ", .".
      out = out.replace(new RegExp(`,?\\s*\\{\\{\\s*${key}\\s*\\}\\}`, "g"), "");
    } else {
      out = out.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g"), value);
    }
  }
  return out;
}

const DEFAULT_SUBJECT = "Tu código de verificación de InfiniHon";
const DEFAULT_BODY = "Hola, {{firstName}}.\n\nUsa este código para verificar tu cuenta de InfiniHon:\n\n{{code}}\n\nEste código vence en 10 minutos. Si tú no solicitaste esto, puedes ignorar este correo con confianza: tu cuenta sigue segura.";

/* ───────────────────────────────────────────────────────────────────── */

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

  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, serviceRoleKey);

  const { data: profile } = await admin.from("profiles").select("email, first_name, email_verified_at").eq("id", userId).maybeSingle();
  if (!profile?.email) return json({ ok: false, error: "profile-not-found" }, 404);
  if (profile.email_verified_at) return json({ ok: true, alreadyVerified: true });

  // Rate limit: maximo 3 codigos por usuario cada 15 minutos (evita abuso de
  // la cuota de Gmail y de la tabla si alguien pulsa "reenviar" sin parar).
  const windowStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { count: recent } = await admin
    .from("email_verification_codes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", windowStart);
  if ((recent ?? 0) >= 3) return json({ ok: false, error: "rate-limited" }, 429);

  const code = randomSixDigitCode();
  const codeHash = await hashCode(code, userId);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: insertError } = await admin.from("email_verification_codes").insert({
    user_id: userId, code_hash: codeHash, expires_at: expiresAt,
  });
  if (insertError) {
    console.error("send-verification-code: insert failed", insertError);
    return json({ ok: false, error: "db-error" }, 500);
  }

  const { data: template } = await admin.from("email_templates").select("subject, body").eq("id", "verification_code").maybeSingle();
  const subject = template?.subject || DEFAULT_SUBJECT;
  const bodyTemplate = template?.body || DEFAULT_BODY;

  const firstName = (profile.first_name as string | null)?.trim() || "";
  const codeSpaced = `${code.slice(0, 3)} ${code.slice(3)}`;
  const renderedText = renderTemplate(bodyTemplate, { firstName, code: codeSpaced });
  const paragraphs = renderedText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  const htmlParagraphs = paragraphs.map((p) => {
    if (p === codeSpaced) {
      return `<p style="margin:0 0 16px 0;text-align:center;"><span style="display:inline-block;font-family:'Courier New',monospace;font-size:32px;font-weight:bold;letter-spacing:8px;color:#0A0F14;background-color:#F0F3F7;padding:14px 24px;border-radius:10px;">${escapeHtml(p)}</span></p>`;
    }
    return `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#333C46;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`;
  }).join("\n");

  const SITE_URL = "https://infinihon.vercel.app";
  const BG_URL = `${SITE_URL}/assets/email-bg.jpg`;
  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0B1E3A;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" background="${BG_URL}" bgcolor="#0B1E3A" style="background-color:#0B1E3A;background-image:url('${BG_URL}');background-repeat:no-repeat;background-position:center top;background-size:cover;padding:40px 16px;">
      <tr>
        <td align="center" background="${BG_URL}" bgcolor="#0B1E3A" style="background-image:url('${BG_URL}');background-repeat:no-repeat;background-position:center top;background-size:cover;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background-color:#FFFFFF;background-color:rgba(255,255,255,0.95);border-radius:16px;overflow:hidden;box-shadow:0 20px 50px rgba(5,7,10,0.35);">
            <tr>
              <td align="center" style="background-color:#05070A;line-height:0;font-size:0;">
                <img src="${SITE_URL}/assets/email-header-banner.png" width="560" alt="InfiniHon" style="display:block;border:0;outline:none;width:100%;max-width:560px;height:auto;color:#ffffff;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 24px 0 24px;">
                <img src="${SITE_URL}/assets/zuri-head.png" width="88" alt="Zuri" style="display:block;border:0;outline:none;width:88px;height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px 32px;font-family:Arial,Helvetica,sans-serif;">
                ${htmlParagraphs}
              </td>
            </tr>
          </table>
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
            <tr>
              <td align="center" style="padding:20px 24px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#F5F7FA;">
                InfiniHon Corp. · Tegucigalpa, Honduras<br />
                Recibiste este correo porque alguien intentó verificar una cuenta en infinihon.vercel.app con este correo.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const sent = await sendGmail(profile.email as string, subject, paragraphs.join("\n\n"), "InfiniHon", html);
  return json({ ok: true, sent });
});
