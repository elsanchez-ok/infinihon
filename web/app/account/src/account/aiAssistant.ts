/**
 * Cliente del asistente de IA del portal de usuario. Llama a la función Edge
 * de Supabase "ai-chat", que a su vez llama a la API de NVIDIA del lado del
 * servidor — la clave de NVIDIA nunca viaja al navegador. La función exige
 * sesión iniciada (verify_jwt), así que se envía el access token del usuario.
 */
import { sb, getAccessToken, SupabaseError } from "../lib/supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type AskResult =
  | { ok: true; reply: string }
  | { ok: false; reason: "unauthenticated" | "network" | "rate-limited" | "server" };

export async function askAssistant(messages: ChatMessage[]): Promise<AskResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, reason: "unauthenticated" };
  try {
    const j = await sb("/functions/v1/ai-chat", { method: "POST", body: { messages }, token });
    const reply = typeof j?.reply === "string" ? j.reply.trim() : "";
    if (!reply) return { ok: false, reason: "server" };
    return { ok: true, reply };
  } catch (e) {
    if (e instanceof SupabaseError) {
      if (e.status === 429) return { ok: false, reason: "rate-limited" };
      if (e.status === 0) return { ok: false, reason: "network" };
    }
    return { ok: false, reason: "server" };
  }
}
