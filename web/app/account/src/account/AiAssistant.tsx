import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Send, X } from "lucide-react";
import { cn } from "../utils/cn";
import { askAssistant, type ChatMessage } from "./aiAssistant";

interface Bubble extends ChatMessage {
  id: number;
  pending?: boolean;
  error?: boolean;
}

let nextId = 1;

const WELCOME: Bubble = {
  id: 0,
  role: "assistant",
  content: "¡Hola! Soy Zuri, el asistente de InfiniHon Corp. Puedo ayudarte con dudas sobre tu cuenta, servicios, pedidos o soporte. ¿En qué te ayudo?",
};

function errorText(reason: "unauthenticated" | "network" | "rate-limited" | "server") {
  if (reason === "unauthenticated") return "Tu sesión expiró. Vuelve a iniciar sesión para usar el asistente.";
  if (reason === "rate-limited") return "Hay demasiadas solicitudes en este momento. Espera un poco e inténtalo de nuevo.";
  if (reason === "network") return "No pudimos conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.";
  return "Zuri no pudo responder en este momento. Inténtalo de nuevo en unos segundos.";
}

function ZuriAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <span className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-tech/40 bg-hn/40", dim)} aria-hidden>
      <img src="/assets/zuri-head.png" alt="" className="h-full w-full object-cover" />
    </span>
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") return <ZuriAvatar size="sm" />;
  return <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-snow" aria-hidden>Tú</span>;
}

function AiAssistantPanel({ open, onClose, launcherRef }: { open: boolean; onClose: () => void; launcherRef: React.RefObject<HTMLButtonElement | null> }) {
  const [messages, setMessages] = useState<Bubble[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (panelRef.current?.contains(document.activeElement)) {
      // Antes de ocultar el panel con aria-hidden, le quitamos el foco al
      // elemento activo (p. ej. el botón de cerrar) para no dejar un
      // elemento enfocado dentro de un contenedor oculto a lectores de
      // pantalla; lo devolvemos al botón flotante que reabre el chat.
      launcherRef.current?.focus();
    }
  }, [open, launcherRef]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const userBubble: Bubble = { id: nextId++, role: "user", content: text };
    const history = [...messages, userBubble];
    setMessages(history);
    setInput("");
    setSending(true);
    const result = await askAssistant(history.filter((m) => !m.error).map(({ role, content }) => ({ role, content })));
    setSending(false);
    if (result.ok) {
      setMessages((current) => [...current, { id: nextId++, role: "assistant", content: result.reply }]);
    } else {
      setMessages((current) => [...current, { id: nextId++, role: "assistant", content: errorText(result.reason), error: true }]);
    }
  }

  return (
    <>
      <div
        className={cn("fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={onClose}
        aria-hidden
      />
      <aside
        ref={panelRef}
        aria-hidden={!open}
        role="dialog"
        aria-label="Zuri IA, asistente del portal"
        className={cn(
          "fixed inset-y-0 right-0 z-[75] flex w-full max-w-[400px] flex-col border-l border-white/[0.08] bg-[#070a0e] shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
          <div className="flex items-center gap-2.5">
            <ZuriAvatar />
            <div>
              <div className="text-sm font-semibold text-snow">Zuri IA</div>
              <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel/70">InfiniHon Corp.</div>
            </div>
          </div>
          <button onClick={onClose} tabIndex={open ? 0 : -1} className="rounded-md p-2 text-steel hover:bg-white/[0.05] hover:text-snow" aria-label="Cerrar asistente">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
          {messages.map((m) => (
            <div key={m.id} className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}>
              <Avatar role={m.role} />
              <div
                className={cn(
                  "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                  m.role === "user"
                    ? "rounded-tr-sm bg-tech text-snow"
                    : m.error
                      ? "rounded-tl-sm border border-red-400/25 bg-red-400/[0.07] text-red-100"
                      : "rounded-tl-sm border border-white/[0.06] bg-white/[0.04] text-snow/90",
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex items-start gap-2.5">
              <Avatar role="assistant" />
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-[13px] text-steel">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />Zuri está pensando...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={send} className="shrink-0 border-t border-white/[0.06] p-3">
          <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-ink/70 p-2 transition-colors focus-within:border-tech">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(e); } }}
              placeholder="Escribe tu pregunta a Zuri..."
              rows={1}
              disabled={sending}
              tabIndex={open ? 0 : -1}
              className="max-h-32 min-h-[36px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-sm text-snow placeholder:text-steel/60 outline-none"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              tabIndex={open ? 0 : -1}
              aria-label="Enviar mensaje"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tech text-snow transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 px-1 text-[10.5px] text-steel/60">Zuri puede cometer errores. Verifica la información importante.</p>
        </form>
      </aside>
    </>
  );
}

/** Botón flotante + panel del asistente. Vive una sola vez en el portal, por
 * encima de cualquier página de /account. */
export function AiAssistantLauncher() {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button
        ref={launcherRef}
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-5 right-5 z-[55] flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-tech shadow-[0_10px_30px_rgba(0,102,255,0.45)] transition-all hover:scale-105",
          open && "pointer-events-none scale-0 opacity-0",
        )}
        aria-label="Abrir Zuri, el asistente de IA"
        title="Zuri IA"
      >
        <img src="/assets/zuri-head.png" alt="" className="h-full w-full object-cover" />
      </button>
      <AiAssistantPanel open={open} onClose={() => setOpen(false)} launcherRef={launcherRef} />
    </>
  );
}
