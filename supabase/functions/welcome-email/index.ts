// Edge Function: welcome-email
// Envia un correo de bienvenida profesional de Zuri (la asistente de la
// plataforma InfiniHon) la primera vez que un usuario inicia sesion — por
// correo/contrasena o con Google. /auth la llama justo despues de un login
// exitoso, pasando el access_token de la sesion recien creada.
//
// Idempotencia: public.profiles.welcome_email_sent_at es la bandera. El
// UPDATE de mas abajo solo tiene exito (devuelve una fila) la PRIMERA vez
// que se llama para un usuario — las siguientes veces (cada vez que ese
// mismo usuario vuelve a iniciar sesion) la condicion `is("welcome_email_
// sent_at", null)` ya no se cumple y no se reenvia nada. Es atomico: aunque
// esta funcion se llamara dos veces en paralelo para el mismo usuario
// (pestañas distintas, doble clic), solo una de las dos gana la carrera.
//
// verify_jwt=true: Supabase exige un JWT valido (la sesion recien creada)
// en el header Authorization antes de invocar esta funcion.
//
// Envio de correo: API de Gmail con OAuth2 (cuenta infinihon.hn@gmail.com),
// no Resend — Resend en su plan gratuito solo entrega al dueño de la cuenta
// hasta verificar un dominio propio, asi que nunca llegaba a los usuarios
// reales. La logica de envio esta duplicada en este archivo y en
// contact-form/index.ts porque el despliegue de cada funcion sube un solo
// archivo (no hay módulos compartidos entre funciones en este flujo).
//
// Nota de entregabilidad: asunto y remitente deliberadamente sin emojis ni
// signos de exclamacion para reducir la probabilidad de caer en Spam al
// enviar desde una cuenta de Gmail normal (sin dominio propio verificado).
//
// Este archivo es la copia de referencia versionada en git. El despliegue
// real vive en Supabase (proyecto "Infinihon Vanguard", funcion
// "welcome-email") y se actualiza con la Supabase CLI o el MCP de Supabase,
// no con el build de este repo.
//
// Secrets requeridos en el proyecto de Supabase:
//   GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN,
//   GMAIL_SENDER_ADDRESS (infinihon.hn@gmail.com)

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = "https://jcizfmpagprxyhvzuymx.supabase.co";
// Clave "publishable" (anonima): es la misma que ya viaja en el bundle del
// navegador en lib/supabase.ts, no es secreta.
const PUBLISHABLE_KEY = "sb_publishable_f8X-zd5BTDecZwdGSKLZsw_9P6Dm8Uf";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
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
      console.error("welcome-email: gmail token refresh failed", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = await res.json();
    return data.access_token ?? null;
  } catch (e) {
    console.error("welcome-email: gmail token refresh error", e);
    return null;
  }
}

function encodeHeaderWord(text: string): string {
  const bytes = new TextEncoder().encode(text);
  return `=?UTF-8?B?${base64UrlEncode(bytes).replace(/-/g, "+").replace(/_/g, "/")}?=`;
}

async function sendGmail(to: string, subject: string, text: string, fromName?: string): Promise<boolean> {
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
    "",
    text,
  ];
  const raw = base64UrlEncode(new TextEncoder().encode(lines.join("\r\n")));
  try {
    const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    });
    if (!res.ok) {
      console.error("welcome-email: gmail send failed", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (e) {
    console.error("welcome-email: gmail send error", e);
    return false;
  }
}

/* ───────────────────────────────────────────────────────────────────── */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ ok: false, error: "method-not-allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ ok: false, error: "missing-auth" }, 401);
  const userToken = authHeader.replace(/^Bearer\s+/i, "");

  // Identifica al dueño de la sesion con SU PROPIO token: las RLS de
  // profiles solo dejan ver la fila propia, asi que esta consulta nunca
  // puede devolver (ni confirmar la existencia de) la cuenta de otra persona.
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

  // Marca atomica: solo la primera llamada "gana" (actualiza una fila y la
  // devuelve). Si el usuario ya tenia welcome_email_sent_at, el filtro
  // `.is(...)` no encuentra ninguna fila y no se reenvia el correo.
  const { data: claimed, error: claimError } = await admin
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", userId)
    .is("welcome_email_sent_at", null)
    .select("email, first_name")
    .maybeSingle();

  if (claimError) {
    console.error("welcome-email: claim failed", claimError);
    return json({ ok: false, error: "db-error" }, 500);
  }
  if (!claimed) return json({ ok: true, sent: false }); // ya se habia enviado antes

  const toEmail = claimed.email as string | null;
  if (!toEmail) return json({ ok: true, sent: false });
  const firstName = (claimed.first_name as string | null)?.trim() || "";

  const greeting = firstName ? `Hola, ${firstName}.` : "Hola.";
  const textLines = [
    greeting,
    "",
    "Soy Zuri, la asistente virtual de la plataforma InfiniHon. Quería darte una",
    "bienvenida personal ahora que ya tienes acceso a tu cuenta.",
    "",
    "Desde tu portal puedes dar seguimiento a tus solicitudes y pedidos, gestionar",
    "tus datos y resolver dudas sobre nuestros servicios. Y si en algún momento",
    "necesitas ayuda, solo abre el ícono de chat dentro de tu cuenta, con gusto",
    "te atiendo ahí mismo.",
    "",
    "Un gusto tenerte con nosotros.",
    "",
    "Zuri",
    "Asistente de la plataforma InfiniHon",
  ];

  const sent = await sendGmail(toEmail, "Bienvenido a InfiniHon", textLines.join("\n"), "InfiniHon");
  return json({ ok: true, sent });
});
