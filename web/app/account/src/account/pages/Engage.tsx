import { useState } from "react";
import { ArrowLeft, Headphones, Inbox, LifeBuoy, Paperclip, Plus, Send } from "lucide-react";
import {
  fmtDateTime, fmtDate, priorities, requestStatuses, requestTypeOptions,
  ticketCategories, ticketStatuses, type Priority, type RequestType, type TicketCategory,
} from "../data";
import { useAccount } from "../store";
import {
  Button, ConfirmDialog, EmptyState, Field, Modal, PageHeader, Panel,
  ResourceTable, StatusBadge, Timeline, inputCls, type Column,
} from "../ui";

/* ─────────── Mis solicitudes ─────────── */

export function RequestsPage() {
  const { data, navigate } = useAccount();
  const [filter, setFilter] = useState("Todas");
  const rows = filter === "Todas" ? data.requests : data.requests.filter((r) => r.status === filter);
  const columns: Column<typeof data.requests[number]>[] = [
    { key: "title", header: "Solicitud", render: (r) => <div><div className="font-semibold text-snow">{r.title}</div><div className="mt-0.5 font-mono text-[11px] text-steel">{r.id}</div></div> },
    { key: "type", header: "Tipo", render: (r) => r.type },
    { key: "date", header: "Fecha", render: (r) => <span className="text-steel">{fmtDate(r.created)}</span> },
    { key: "status", header: "Estado", render: (r) => <StatusBadge status={r.status} /> },
    { key: "updated", header: "Última actualización", render: (r) => <span className="text-xs text-steel">{fmtDate(r.updated)}</span> },
  ];
  return (
    <>
      <PageHeader eyebrow="Mi InfiniHon" title="Mis solicitudes" description="Consulta el progreso de tus solicitudes."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Mis solicitudes" }]}
        actions={<Button variant="primary" icon={Plus} onClick={() => navigate("/account/requests/new")}>Nueva solicitud</Button>} />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {["Todas", ...requestStatuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${filter === s ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow"}`}>
            {s} <span className="ml-1 font-mono text-[10px] text-steel">{s === "Todas" ? data.requests.length : data.requests.filter((r) => r.status === s).length}</span>
          </button>
        ))}
      </div>

      <Panel padded={false}>
        <ResourceTable caption="Mis solicitudes" columns={columns} rows={rows} getKey={(r) => r.id} onRowClick={(r) => navigate(`/account/requests/${r.id}`)}
          empty={<EmptyState icon={Inbox} title={data.requests.length ? "Ninguna solicitud con este estado." : "Aún no tienes solicitudes"}
            description={data.requests.length ? "Prueba con otro filtro." : "¿Necesitas algo de InfiniHon? Crea una solicitud y el equipo te responderá."}
            action={!data.requests.length && <Button variant="primary" icon={Plus} onClick={() => navigate("/account/requests/new")}>Solicitar un servicio</Button>} />} />
      </Panel>
    </>
  );
}

export function RequestFormPage() {
  const { createRequest, navigate, toast, data } = useAccount();
  const [form, setForm] = useState({ title: "", type: "Cotización" as RequestType, description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.title.trim().length < 4) e.title = "Escribe un título breve y claro.";
    if (form.description.trim().length < 20) e.description = "Describe lo que necesitas con al menos 20 caracteres.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const created = await createRequest(form);
    toast("Solicitud enviada. Te contactaremos con una propuesta.");
    navigate(`/account/requests/${created.id}`);
  };

  return (
    <>
      <PageHeader eyebrow="Nueva solicitud" title="Solicitar un servicio" description="Cuéntanos qué necesitas. Recibirás una respuesta con alcance y propuesta."
        breadcrumbs={[{ label: "Mis solicitudes", to: "/account/requests" }, { label: "Nueva" }]} />
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Panel>
          <div className="space-y-5">
            <Field label="Título" htmlFor="rq-title" required error={errors.title} hint="Ej.: Conectar tres sucursales con VPN">
              <input id="rq-title" className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Resume lo que necesitas" />
            </Field>
            <Field label="Tipo de solicitud" htmlFor="rq-type" required>
              <select id="rq-type" className={`${inputCls} [&>option]:bg-ink`} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as RequestType })}>
                {requestTypeOptions.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Descripción" htmlFor="rq-desc" required error={errors.description} hint="Contexto, tamaño de la operación, plazos y cualquier restricción.">
              <textarea id="rq-desc" rows={6} className={`${inputCls} h-auto py-3`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe tu situación actual y qué quieres lograr…" />
            </Field>
            <Field label="Adjunto" htmlFor="rq-file" hint="Requiere almacenamiento de archivos conectado.">
              <div className="flex items-center gap-2">
                <button id="rq-file" type="button" disabled className={`${inputCls} text-left text-steel`} onClick={() => undefined}>Adjuntar archivo</button>
              </div>
              
            </Field>
            <div className="flex flex-col gap-2 border-t border-white/[0.06] pt-5 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => navigate("/account/requests")}>Cancelar</Button>
              <Button variant="primary" icon={Send} onClick={submit}>Enviar solicitud</Button>
            </div>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title="Qué pasa después">
            <Timeline entries={[
              { label: "Envías la solicitud", date: new Date().toISOString(), note: "Queda registrada en tu cuenta." },
              { label: "El equipo la revisa", date: new Date(Date.now() + 864e5).toISOString(), note: "Podemos pedirte más detalles." },
              { label: "Recibes una propuesta", date: new Date(Date.now() + 3 * 864e5).toISOString(), note: "Con alcance y siguientes pasos." },
            ]} />
          </Panel>
          <Panel title="Servicios relacionados">
            <ul className="space-y-2 text-[13px] text-steel">
              {data.catalog.slice(0, 5).map((s) => <li key={s.id} className="flex gap-2"><span className="text-volt">·</span>{s.name}</li>)}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}

export function RequestDetailPage({ id }: { id: string }) {
  const { data, cancelRequest, navigate, toast } = useAccount();
  const request = data.requests.find((r) => r.id === id);
  const [reply, setReply] = useState("");
  const [confirm, setConfirm] = useState(false);

  if (!request) {
    return (
      <>
        <PageHeader eyebrow="Solicitud" title="Solicitud no disponible" breadcrumbs={[{ label: "Mis solicitudes", to: "/account/requests" }, { label: "Detalle" }]} />
        <Panel><EmptyState icon={Inbox} title="Esta solicitud no está en tu cuenta."
          description="Cada usuario solo puede ver sus propias solicitudes."
          action={<Button onClick={() => navigate("/account/requests")}>Volver a mis solicitudes</Button>} /></Panel>
      </>
    );
  }

  const canCancel = !["Completada", "Cancelada"].includes(request.status);
  const service = data.catalog.find((s) => request.title.toLowerCase().includes(s.name.toLowerCase()));

  return (
    <>
      <PageHeader eyebrow={`Solicitud ${request.id}`} title={request.title}
        breadcrumbs={[{ label: "Mis solicitudes", to: "/account/requests" }, { label: request.id }]}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={request.status} /><span className="text-xs text-steel">Creada {fmtDate(request.created)}</span></span>}
        actions={<Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/account/requests")}>Volver</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Panel title="Descripción"><p className="whitespace-pre-line text-sm leading-relaxed text-snow/90">{request.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4 text-xs text-steel">
              <span className="rounded border border-white/10 px-2 py-1">Tipo: {request.type}</span>
              {request.attachments.length === 0 && <span className="rounded border border-dashed border-white/10 px-2 py-1">Sin archivos adjuntos</span>}
            </div>
          </Panel>

          <Panel title="Mensajes" description="Comunicación sobre esta solicitud.">
            {request.messages.length ? (
              <ul className="space-y-3">
                {request.messages.map((m, i) => (
                  <li key={i} className={`rounded-xl border p-3.5 ${m.from === "Tú" ? "border-tech/30 bg-tech/[0.07]" : "border-white/[0.07] bg-white/[0.02]"}`}>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-steel"><span className="font-semibold text-snow/90">{m.from}</span><time dateTime={m.date}>{fmtDateTime(m.date)}</time></div>
                    <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-snow/90">{m.text}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-steel">Todavía no hay mensajes. El equipo de InfiniHon te escribirá aquí.</p>}

            {!canCancel && (
              <div className="mt-4">
                <label htmlFor="rq-reply" className="mb-1.5 block text-[13px] font-semibold text-snow/90">Añadir información</label>
                <textarea id="rq-reply" rows={3} className={`${inputCls} h-auto py-3`} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Escribe un mensaje…" />
                <div className="mt-2 flex justify-end"><Button size="sm" variant="primary" icon={Send} disabled={reply.trim().length < 2}
                  onClick={() => { setReply(""); toast("Mensaje registrado. Se enviará cuando el backend de mensajería esté conectado.", "info"); }}>Enviar</Button></div>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Estado"><div className="flex flex-col gap-3"><StatusBadge status={request.status} /><p className="text-xs leading-relaxed text-steel">Última actualización {fmtDateTime(request.updated)}.</p></div></Panel>
          <Panel title="Actividad"><Timeline entries={request.timeline} /></Panel>
          <Panel title="Acciones">
            <div className="flex flex-col gap-2">
              <Button icon={Headphones} onClick={() => navigate(`/account/support?request=${request.id}`)}>Necesito ayuda</Button>
              {service && <Button variant="ghost" onClick={() => navigate("/account/favorites")}>Ver servicio relacionado</Button>}
              {canCancel && <Button variant="danger" onClick={() => setConfirm(true)}>Cancelar solicitud</Button>}
            </div>
          </Panel>
        </div>
      </div>

      <ConfirmDialog open={confirm} onClose={() => setConfirm(false)} title="Cancelar solicitud" confirmLabel="Cancelar solicitud"
        message={`¿Seguro que quieres cancelar «${request.title}»? El equipo dejará de trabajar en ella.`}
        onConfirm={() => { cancelRequest(request.id); toast("Solicitud cancelada.", "info"); }} />
    </>
  );
}

/* ─────────── Soporte ─────────── */

export function SupportPage() {
  const { data, createTicket, navigate, toast } = useAccount();
  const [open, setOpen] = useState(true);
  const [form, setForm] = useState({ subject: "", category: "Cuenta" as TicketCategory, priority: "Normal" as Priority, description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const e: Record<string, string> = {};
    if (form.subject.trim().length < 4) e.subject = "Escribe un asunto claro.";
    if (form.description.trim().length < 20) e.description = "Cuéntanos más detalle (mínimo 20 caracteres).";
    setErrors(e);
    if (Object.keys(e).length) return;
    const t = await createTicket(form);
    toast("Ticket creado. El equipo de soporte lo revisará.");
    navigate(`/account/support/tickets/${t.id}`);
  };

  return (
    <>
      <PageHeader eyebrow="Soporte" title="Soporte" description="Estamos aquí para ayudarte."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Soporte" }]}
        actions={<Button icon={Inbox} onClick={() => navigate("/account/support/tickets")}>Ver mis tickets</Button>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Panel title="Nueva solicitud de soporte" description="Describe el problema y te responderemos por este mismo canal.">
          <div className="space-y-5">
            <Field label="Asunto" htmlFor="tk-subject" required error={errors.subject}>
              <input id="tk-subject" className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Resume el problema" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Categoría" htmlFor="tk-cat" required>
                <select id="tk-cat" className={`${inputCls} [&>option]:bg-ink`} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as TicketCategory })}>
                  {ticketCategories.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Prioridad" htmlFor="tk-pri" hint="La usamos para ordenar la revisión.">
                <select id="tk-pri" className={`${inputCls} [&>option]:bg-ink`} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
                  {priorities.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Descripción" htmlFor="tk-desc" required error={errors.description}>
              <textarea id="tk-desc" rows={6} className={`${inputCls} h-auto py-3`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="¿Qué está pasando? ¿Desde cuándo? ¿Qué ya probaste?" />
            </Field>
            <Field label="Adjunto" htmlFor="tk-file" hint="Requiere almacenamiento de archivos conectado.">
              <button id="tk-file" type="button" disabled className={`${inputCls} text-left text-steel`}>Adjuntar archivo</button>
            </Field>
            <div className="flex justify-end border-t border-white/[0.06] pt-5"><Button variant="primary" icon={LifeBuoy} onClick={submit}>Crear ticket</Button></div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Tus tickets" description="Conversaciones con soporte." padded={false}>
            {data.tickets.length ? (
              <ul className="divide-y divide-white/[0.05]">
                {data.tickets.slice(0, 5).map((t) => (
                  <li key={t.id}><button onClick={() => navigate(`/account/support/tickets/${t.id}`)} className="w-full px-5 py-3 text-left hover:bg-white/[0.02]">
                    <div className="flex items-center justify-between gap-2"><span className="truncate text-[13px] font-medium text-snow">{t.subject}</span><StatusBadge status={t.status} /></div>
                    <span className="mt-0.5 block font-mono text-[11px] text-steel">{t.id} · {fmtDate(t.updated)}</span>
                  </button></li>
                ))}
              </ul>
            ) : <p className="px-5 py-6 text-center text-sm text-steel">Sin conversaciones todavía.</p>}
          </Panel>
          <Panel title="Antes de escribir">
            <ul className="space-y-2 text-[13px] leading-relaxed text-steel">
              <li className="flex gap-2"><span className="text-volt">·</span>Revisa el centro de ayuda: quizá ya hay una respuesta.</li>
              <li className="flex gap-2"><span className="text-volt">·</span>Incluye capturas o mensajes de error cuando puedas.</li>
              <li className="flex gap-2"><span className="text-volt">·</span>No compartas contraseñas ni datos de tarjeta.</li>
            </ul>
          </Panel>
        </div>
      </div>

      <Modal open={open && false} onClose={() => setOpen(false)} title="">​</Modal>
    </>
  );
}

export function TicketsPage() {
  const { data, navigate } = useAccount();
  const [filter, setFilter] = useState("Todos");
  const rows = filter === "Todos" ? data.tickets : data.tickets.filter((t) => t.status === filter);
  const columns: Column<typeof data.tickets[number]>[] = [
    { key: "id", header: "Ticket", render: (t) => <div><div className="font-mono text-[11px] text-steel">{t.id}</div><div className="mt-0.5 font-semibold text-snow">{t.subject}</div></div> },
    { key: "category", header: "Categoría", render: (t) => t.category },
    { key: "status", header: "Estado", render: (t) => <StatusBadge status={t.status} /> },
    { key: "updated", header: "Última actualización", render: (t) => <span className="text-xs text-steel">{fmtDate(t.updated)}</span> },
  ];
  return (
    <>
      <PageHeader eyebrow="Soporte" title="Mis tickets" description="Todas tus conversaciones con el equipo de soporte."
        breadcrumbs={[{ label: "Soporte", to: "/account/support" }, { label: "Mis tickets" }]}
        actions={<Button variant="primary" icon={Plus} onClick={() => navigate("/account/support")}>Nuevo ticket</Button>} />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {["Todos", ...ticketStatuses].map((s) => (
          <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${filter === s ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow"}`}>
            {s} <span className="ml-1 font-mono text-[10px] text-steel">{s === "Todos" ? data.tickets.length : data.tickets.filter((t) => t.status === s).length}</span>
          </button>
        ))}
      </div>
      <Panel padded={false}>
        <ResourceTable caption="Mis tickets de soporte" columns={columns} rows={rows} getKey={(t) => t.id} onRowClick={(t) => navigate(`/account/support/tickets/${t.id}`)}
          empty={<EmptyState icon={LifeBuoy} title={data.tickets.length ? "Ningún ticket con este estado." : "Sin conversaciones de soporte"}
            description={data.tickets.length ? "Prueba con otro filtro." : "Cuando contactes a soporte, tus tickets aparecerán aquí."}
            action={!data.tickets.length && <Button variant="primary" onClick={() => navigate("/account/support")}>Contactar soporte</Button>} />} />
      </Panel>
    </>
  );
}

export function TicketDetailPage({ id }: { id: string }) {
  const { data, replyTicket, navigate, toast } = useAccount();
  const ticket = data.tickets.find((t) => t.id === id);
  const [text, setText] = useState("");

  if (!ticket) {
    return (
      <>
        <PageHeader eyebrow="Ticket" title="Ticket no disponible" breadcrumbs={[{ label: "Mis tickets", to: "/account/support/tickets" }, { label: "Detalle" }]} />
        <Panel><EmptyState icon={LifeBuoy} title="Este ticket no está en tu cuenta."
          description="Solo puedes ver tus propias conversaciones de soporte."
          action={<Button onClick={() => navigate("/account/support/tickets")}>Volver a mis tickets</Button>} /></Panel>
      </>
    );
  }

  const send = async () => {
    if (text.trim().length < 2) return;
    try {
      await replyTicket(ticket.id, text.trim());
      setText("");
      toast("Respuesta guardada en el ticket.");
    } catch {
      toast("No se pudo enviar el mensaje. Revisa la conexión e inténtalo de nuevo.", "error");
    }
  };

  return (
    <>
      <PageHeader eyebrow={`Ticket ${ticket.id}`} title={ticket.subject}
        breadcrumbs={[{ label: "Mis tickets", to: "/account/support/tickets" }, { label: ticket.id }]}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={ticket.status} /><span className="text-xs text-steel">{ticket.category} · prioridad {ticket.priority.toLowerCase()} · abierto {fmtDate(ticket.created)}</span></span>}
        actions={<Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/account/support/tickets")}>Volver</Button>} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Conversación" description="Tú y el equipo de soporte de InfiniHon.">
            <ul className="space-y-3">
              {ticket.messages.map((m, i) => (
                <li key={i} className={`rounded-xl border p-3.5 ${m.from === "Tú" ? "border-tech/30 bg-tech/[0.07]" : "border-white/[0.07] bg-white/[0.02]"}`}>
                  <div className="flex items-center justify-between gap-3 text-[11px] text-steel"><span className="font-semibold text-snow/90">{m.from}</span><time dateTime={m.date}>{fmtDateTime(m.date)}</time></div>
                  <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-snow/90">{m.text}</p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-white/[0.06] pt-4">
              <label htmlFor="tk-reply" className="mb-1.5 block text-[13px] font-semibold text-snow/90">Responder</label>
              <textarea id="tk-reply" rows={4} className={`${inputCls} h-auto py-3`} value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe tu respuesta…" />
              <div className="mt-2.5 flex items-center justify-between gap-3">
                <button type="button" disabled className="flex items-center gap-1.5 text-xs text-steel" title="Requiere almacenamiento de archivos conectado"><Paperclip className="h-3.5 w-3.5" />Adjuntar</button>
                <Button size="sm" variant="primary" icon={Send} disabled={text.trim().length < 2} onClick={() => void send()}>Enviar respuesta</Button>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Detalles">
            <dl className="space-y-3 text-sm">
              {[["Ticket", ticket.id], ["Categoría", ticket.category], ["Prioridad", ticket.priority], ["Creado", fmtDateTime(ticket.created)], ["Actualizado", fmtDateTime(ticket.updated)]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3"><dt className="text-steel">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
          </Panel>
          <Panel title="Archivos adjuntos">
            {ticket.attachments.length ? <ul className="space-y-2 text-sm">{ticket.attachments.map((a) => <li key={a.name} className="flex items-center gap-2"><Paperclip className="h-3.5 w-3.5 text-steel" />{a.name}</li>)}</ul>
              : <p className="text-sm text-steel">Sin archivos adjuntos.</p>}
          </Panel>
          <Panel title="¿Necesitas más ayuda?">
            <p className="text-[13px] leading-relaxed text-steel">Si el problema es urgente, abre un nuevo ticket marcándolo con prioridad alta.</p>
            <Button size="sm" className="mt-3 w-full" onClick={() => navigate("/account/support")}>Nuevo ticket</Button>
          </Panel>
        </div>
      </div>
    </>
  );
}

/* ─────────── Mensajes ─────────── */

export function MessagesPage() {
  const { data, navigate } = useAccount();
  const [openId, setOpenId] = useState<string | null>(data.tickets[0]?.id ?? null);
  const open = data.tickets.find((t) => t.id === openId) ?? null;

  return (
    <>
      <PageHeader eyebrow="Soporte" title="Mensajes" description="Comunicación profesional entre tú y el equipo de InfiniHon."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Mensajes" }]} />
      {data.tickets.length === 0 ? (
        <Panel><EmptyState icon={Inbox} title="No tienes mensajes"
          description="Cuando escribas a soporte, la conversación aparecerá aquí."
          action={<Button variant="primary" onClick={() => window.location.assign("/account/support")}>Contactar soporte</Button>} /></Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Panel title="Conversaciones" padded={false}>
            <ul className="divide-y divide-white/[0.05]">
              {data.tickets.map((t) => (
                <li key={t.id}>
                  <button onClick={() => setOpenId(t.id)} aria-current={openId === t.id}
                    className={`w-full px-4 py-3.5 text-left transition-colors ${openId === t.id ? "bg-hn/30" : "hover:bg-white/[0.02]"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-snow">{t.subject}</span>
                      <span className="font-mono text-[10px] text-steel">{fmtDate(t.updated)}</span>
                    </div>
                    <span className="mt-1 block truncate text-[12px] text-steel">{t.messages[t.messages.length - 1]?.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {open ? (
            <Panel title={open.subject} description={`${open.id} · ${open.category}`} action={<StatusBadge status={open.status} />}>
              <ul className="space-y-3">
                {open.messages.map((m, i) => (
                  <li key={i} className={`max-w-[85%] rounded-xl border p-3.5 ${m.from === "Tú" ? "ml-auto border-tech/30 bg-tech/[0.07]" : "border-white/[0.07] bg-white/[0.02]"}`}>
                    <div className="flex items-center justify-between gap-3 text-[11px] text-steel"><span className="font-semibold text-snow/90">{m.from}</span><time dateTime={m.date}>{fmtDateTime(m.date)}</time></div>
                    <p className="mt-1.5 whitespace-pre-line text-[13px] leading-relaxed text-snow/90">{m.text}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t border-white/[0.06] pt-4 text-[11.5px] text-steel">Responde desde el ticket para añadir mensajes a esta conversación.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" icon={ArrowLeft} onClick={() => navigate(`/account/support/tickets/${open.id}`)}>Abrir ticket</Button>
              </div>
            </Panel>
          ) : (
            <Panel><EmptyState icon={Inbox} title="Selecciona una conversación" /></Panel>
          )}
        </div>
      )}
    </>
  );
}
