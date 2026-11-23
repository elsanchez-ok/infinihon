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
// Este archivo es la copia de referencia versionada en git. El despliegue
// real vive en Supabase (proyecto "Infinihon Vanguard", funcion
// "welcome-email") y se actualiza con la Supabase CLI o el MCP de Supabase,
// no con el build de este repo.
//
// Secrets requeridos en el proyecto de Supabase (ya existen, compartidos
// con la funcion "contact-form"):
//   RESEND_API_KEY -> API key de resend.com (cuenta gratuita)

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

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  if (!resendApiKey) {
    console.error("welcome-email: RESEND_API_KEY no configurada");
    return json({ ok: true, sent: false });
  }

  const greeting = firstName ? `¡Hola, ${firstName}!` : "¡Hola!";
  const textLines = [
    greeting,
    "",
    "Soy Zuri, la asistente virtual de la plataforma InfiniHon. Quería darte una",
    "bienvenida personal ahora que ya tienes acceso a tu cuenta.",
    "",
    "Desde tu portal puedes dar seguimiento a tus solicitudes y pedidos, gestionar",
    "tus datos y resolver dudas sobre nuestros servicios. Y si en algún momento",
    "necesitas ayuda, solo abre el ícono de chat dentro de tu cuenta — con gusto",
    "te atiendo ahí mismo.",
    "",
    "Un gusto tenerte con nosotros.",
    "",
    "— Zuri",
    "Asistente de la plataforma InfiniHon",
  ];

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Zuri · InfiniHon <onboarding@resend.dev>",
        to: [toEmail],
        subject: "¡Bienvenido(a) a InfiniHon! Soy Zuri 👋",
        text: textLines.join("\n"),
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("welcome-email: resend failed", res.status, body);
      return json({ ok: true, sent: false });
    }
  } catch (e) {
    // La bandera ya quedo marcada: preferimos no reintentar en bucle si
    // Resend falla una vez, antes que arriesgarnos a mandar el correo varias
    // veces por una carrera de reintentos del cliente.
    console.error("welcome-email: send failed", e);
    return json({ ok: true, sent: false });
  }

  return json({ ok: true, sent: true });
});
