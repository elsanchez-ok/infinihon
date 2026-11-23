// Edge Function: ai-chat
// Asistente de IA del portal de usuario (/account), llamado "Zuri". Recibe
// el historial de la conversación desde el navegador y llama a la API de
// NVIDIA NIM del lado del servidor: la clave de NVIDIA nunca viaja al
// cliente.
//
// verify_jwt=true: Supabase exige un JWT válido (la sesión del usuario) en
// el header Authorization antes de invocar esta función, así que solo
// usuarios con sesión iniciada en /account pueden usarla.
//
// Además, usamos ESE MISMO JWT para leer los datos del usuario desde la API
// REST de Supabase (PostgREST). Las tablas tienen Row Level Security (RLS)
// basada en auth.uid(), así que estas consultas devuelven únicamente las
// filas del usuario dueño del token: es imposible que Zuri vea datos de
// otra cuenta a través de este mecanismo.
//
// Este archivo es la copia de referencia versionada en git. El despliegue
// real vive en Supabase (proyecto "Infinihon Vanguard", función "ai-chat") y
// se actualiza con la Supabase CLI o el MCP de Supabase, no con el build de
// este repo.
//
// Secrets requeridos en el proyecto de Supabase:
//   NVIDIA_API_KEY -> API key de build.nvidia.com (nvapi-...)

const SUPABASE_URL = "https://jcizfmpagprxyhvzuymx.supabase.co";
// Clave "publishable" (anónima): es la misma que ya viaja en el bundle del
// navegador en lib/supabase.ts, no es secreta.
const PUBLISHABLE_KEY = "sb_publishable_f8X-zd5BTDecZwdGSKLZsw_9P6Dm8Uf";

const CORS_HEADERS = {
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

async function restGet(path: string, userToken: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}${path}`, {
      headers: { apikey: PUBLISHABLE_KEY, Authorization: userToken },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Arma un resumen compacto, en texto plano, de la cuenta del usuario que está
// hablando con Zuri en ESTE momento (según su propio token de sesión).
async function buildAccountContext(userToken: string): Promise<string> {
  const [profileRows, orders, requests, tickets] = await Promise.all([
    restGet("/rest/v1/profiles?select=first_name,last_name,email,company,position&limit=1", userToken),
    restGet("/rest/v1/orders?select=id,status,created_at,items&order=created_at.desc&limit=5", userToken),
    restGet("/rest/v1/requests?select=id,title,type,status,created_at&order=created_at.desc&limit=5", userToken),
    restGet("/rest/v1/tickets?select=id,subject,category,status,priority,created_at&order=created_at.desc&limit=5", userToken),
  ]);

  const lines: string[] = [];
  const profile = Array.isArray(profileRows) ? profileRows[0] : null;
  if (profile) {
    const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "(sin nombre registrado)";
    lines.push(`Nombre: ${name}`);
    if (profile.email) lines.push(`Correo: ${profile.email}`);
    if (profile.company) lines.push(`Empresa: ${profile.company}`);
    if (profile.position) lines.push(`Cargo: ${profile.position}`);
  }

  if (Array.isArray(orders) && orders.length > 0) {
    lines.push("Pedidos recientes:");
    for (const o of orders) {
      const items = Array.isArray(o.items) ? o.items.reduce((n: number, it: { qty?: number }) => n + (it.qty ?? 0), 0) : 0;
      lines.push(`- Pedido ${o.id}: estado ${o.status}, ${items} artículo(s), creado ${o.created_at}`);
    }
  } else {
    lines.push("Pedidos: el usuario no tiene pedidos registrados todavía.");
  }

  if (Array.isArray(requests) && requests.length > 0) {
    lines.push("Solicitudes recientes:");
    for (const r of requests) lines.push(`- Solicitud "${r.title}" (${r.type}): estado ${r.status}, creada ${r.created_at}`);
  } else {
    lines.push("Solicitudes: el usuario no tiene solicitudes registradas todavía.");
  }

  if (Array.isArray(tickets) && tickets.length > 0) {
    lines.push("Tickets de soporte recientes:");
    for (const tk of tickets) lines.push(`- Ticket "${tk.subject}" (${tk.category}, prioridad ${tk.priority}): estado ${tk.status}, creado ${tk.created_at}`);
  } else {
    lines.push("Tickets de soporte: el usuario no tiene tickets registrados todavía.");
  }

  // InfiniHon Corp. aún no activa "servicios contratados" por cuenta en la
  // base de datos (ver ServicesPage en el portal): no inventamos esa sección.
  lines.push("Servicios contratados activos: el sistema todavía no registra servicios activos por cuenta; esa sección del portal se llena desde el backend cuando se activa un servicio.");

  return lines.join("\n");
}

function systemPrompt(accountContext: string) {
  return (
    "Te llamas Zuri, el asistente virtual del portal de usuario de InfiniHon Corp. (una empresa hondureña de infraestructura y servicios tecnológicos). " +
    "Preséntate como Zuri si te lo preguntan. Responde siempre en español neutro/hondureño, de forma breve, clara, cordial y útil.\n\n" +
    "A continuación tienes el contexto REAL de la cuenta del usuario que te está escribiendo ahora mismo (ya filtrado por el sistema para que sea únicamente el suyo, nunca el de otra persona):\n" +
    "--- CONTEXTO DE LA CUENTA ---\n" + accountContext + "\n--- FIN DEL CONTEXTO ---\n\n" +
    "Usa este contexto para responder preguntas sobre su cuenta (pedidos, solicitudes, tickets, datos de perfil). No reveles, menciones ni inventes información de otras cuentas o usuarios: solo conoces este contexto. " +
    "Si el usuario pregunta algo que no está en el contexto (por ejemplo detalles de un servicio contratado que no existe aún en el sistema), dilo con honestidad y sugiere abrir un ticket en Soporte o revisar la sección correspondiente del portal. No inventes datos que no tengas."
  );
}

// NVIDIA retira modelos gratuitos con cierta frecuencia (end-of-life), así
// que probamos una lista de candidatos en orden hasta que uno responda bien,
// en vez de depender de un solo modelo fijo que puede dejar de existir.
const MODEL_CANDIDATES = [
  "nvidia/nemotron-3-ultra-550b-a55b",
  "openai/gpt-oss-20b",
  "z-ai/glm-5.3-flash",
  "google/gemma-4-31b-it",
  "meta/llama-3.1-8b-instruct",
];

async function callNvidia(apiKey: string, model: string, systemMessage: string, messages: { role: string; content: string }[]) {
  return await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: systemMessage }, ...messages],
      temperature: 0.4,
      max_tokens: 700,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "missing_auth", message: "missing_auth" }, 401);

  let payload: { messages?: { role: string; content: string }[] };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const incoming = Array.isArray(payload?.messages) ? payload.messages : [];
  if (incoming.length === 0) return json({ error: "messages_required" }, 400);

  // Solo los últimos turnos, y recorta cada mensaje para controlar costo/abuso.
  const messages = incoming
    .slice(-20)
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0) return json({ error: "messages_required" }, 400);

  const apiKey = Deno.env.get("NVIDIA_API_KEY");
  if (!apiKey) return json({ error: "missing_api_key", message: "missing_api_key" }, 500);

  const accountContext = await buildAccountContext(authHeader);
  const system = systemPrompt(accountContext);

  try {
    let lastStatus = 0;
    let lastDetail = "";
    let lastModel = "";

    for (const model of MODEL_CANDIDATES) {
      const upstream = await callNvidia(apiKey, model, system, messages);
      if (upstream.ok) {
        const data = await upstream.json();
        const reply = data?.choices?.[0]?.message?.content ?? "";
        if (reply) return json({ reply });
        lastStatus = 502;
        lastDetail = "empty_reply";
        lastModel = model;
        continue;
      }
      const detail = await upstream.text();
      console.error("nvidia upstream error", model, upstream.status, detail.slice(0, 500));
      lastStatus = upstream.status;
      lastDetail = detail.slice(0, 250);
      lastModel = model;
      // Si la clave es inválida/revocada, ningún otro modelo va a funcionar.
      if (upstream.status === 401 || upstream.status === 403) break;
    }

    return json({ error: "upstream_error", status: lastStatus, message: `nvidia ${lastModel} ${lastStatus}: ${lastDetail}` }, 502);
  } catch (e) {
    console.error("ai-chat error", e);
    return json({ error: "server_error", message: String(e).slice(0, 300) }, 500);
  }
});
