// Edge Function: contact-form
// Recibe los envios del formulario de contacto de /contacto (landing) y:
//   1) Los guarda siempre en public.contact_submissions (nunca se pierde un mensaje).
//   2) Si hay una API key de Resend configurada (secret RESEND_API_KEY), envia una
//      notificacion por correo a CONTACT_TO_EMAIL con Reply-To del visitante.
// Publica (verify_jwt=false): cualquier visitante del sitio puede llamarla sin sesion.
//
// Este archivo es la copia de referencia versionada en git. El despliegue real
// vive en Supabase (proyecto "Infinihon Vanguard", función "contact-form") y se
// actualiza con la Supabase CLI o el MCP de Supabase, no con el build de este repo.
//
// Secrets requeridos en el proyecto de Supabase:
//   RESEND_API_KEY   -> API key de resend.com (cuenta gratuita)
//   CONTACT_TO_EMAIL -> infinihon.hn@gmail.com (buzón de destino)
//
// Nota sobre entregabilidad: mientras se use el remitente compartido
// onboarding@resend.dev, Gmail puede clasificar el correo como Spam.
// Para que llegue siempre a la bandeja principal, verificar un dominio propio
// en resend.com/domains y cambiar el "from" de este archivo a esa dirección.

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
  // gratuita de Resend con peticiones repetidas. Limites: por IP y por email.
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

  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const toEmail = Deno.env.get("CONTACT_TO_EMAIL");

  if (resendApiKey && toEmail) {
    try {
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

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "InfiniHon Web <onboarding@resend.dev>",
          to: [toEmail],
          reply_to: email,
          subject: `Nuevo contacto \u2014 ${company || name}`,
          text: lines.join("\n"),
        }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error("contact-form: resend failed", res.status, body);
      } else {
        await supabase.from("contact_submissions").update({ emailed: true }).eq("id", inserted.id);
      }
    } catch (e) {
      // El mensaje ya quedo guardado en la base de datos aunque el correo falle.
      console.error("contact-form: email send failed", e);
    }
  }

  return json({ ok: true });
});
