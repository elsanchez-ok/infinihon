import { useState } from "react";
import { ArrowLeft, Inbox, LifeBuoy, Send } from "lucide-react";
import { useAdmin } from "../store";
import { Button, EmptyState, Forbidden, PageHeader, Panel, StatusBadge, inputCls } from "../ui";
import { fmtDateTime } from "../store";

export function SupportTicketsPage({ id }: { id?: string }) {
  const { data, can, navigate, sendTicketReply, toast } = useAdmin();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const ticket = id ? data.tickets.find((item) => item.id === id) : undefined;

  if (!can("customers.view")) return <Forbidden permission="customers.view" />;

  if (!id) {
    return (
      <>
        <PageHeader eyebrow="Support" title="Support inbox" description="Customer support conversations from the account portal."
          breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Support inbox" }]} />
        <Panel padded={false}>
          {data.tickets.length ? (
            <ul className="divide-y divide-white/[0.05]">
              {data.tickets.map((item) => (
                <li key={item.id}>
                  <button onClick={() => navigate(`/admin/support/${item.id}`)} className="flex w-full flex-col gap-2 px-5 py-4 text-left transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-snow">{item.subject}{item.messages.at(-1)?.from === "Tú" && <span className="rounded border border-tech/40 px-1.5 py-0.5 font-mono text-[9px] uppercase text-[#9cc6ff]">New message</span>}</span>
                      <span className="mt-1 block truncate text-xs text-steel">{item.messages.at(-1)?.text ?? item.description}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs text-steel"><span className="font-mono">{item.id}</span><StatusBadge status={item.status} /><time dateTime={item.updated}>{fmtDateTime(item.updated)}</time></span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={Inbox} title="No support tickets yet." description="Tickets submitted from /account will appear here." />}
        </Panel>
      </>
    );
  }

  if (!ticket) {
    return <Panel><EmptyState icon={LifeBuoy} title="Ticket not found." description="It may have been removed or is no longer available." action={<Button onClick={() => navigate("/admin/support")}>Back to inbox</Button>} /></Panel>;
  }

  const send = async () => {
    const message = text.trim();
    if (message.length < 2 || sending) return;
    setSending(true);
    try {
      await sendTicketReply(ticket.id, message);
      setText("");
      toast("Reply sent to the customer.");
    } catch {
      toast("Could not send the reply. Check the connection and permissions.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow={`Ticket ${ticket.id}`} title={ticket.subject}
        description={<span className="flex flex-wrap items-center gap-2"><StatusBadge status={ticket.status} /><span className="text-xs text-steel">{ticket.category} · {ticket.priority} priority · updated {fmtDateTime(ticket.updated)}</span></span>}
        breadcrumbs={[{ label: "Support inbox", to: "/admin/support" }, { label: ticket.id }]}
        actions={<Button variant="ghost" icon={ArrowLeft} onClick={() => navigate("/admin/support")}>Back to inbox</Button>} />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Panel title="Conversation" description="Messages are shared with the customer's support ticket.">
          <ol className="space-y-3">
            {ticket.messages.map((message, index) => (
              <li key={`${message.date}-${index}`} className={`rounded-lg border p-4 ${message.from === "Tú" ? "border-white/[0.08] bg-white/[0.02]" : "border-tech/25 bg-tech/[0.06]"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-steel"><span className="font-semibold text-snow/90">{message.from}</span><time dateTime={message.date}>{fmtDateTime(message.date)}</time></div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-snow/90">{message.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <label htmlFor="support-reply" className="mb-1.5 block text-[13px] font-semibold text-snow/90">Reply</label>
            <textarea id="support-reply" rows={4} className={`${inputCls} h-auto py-3`} value={text} onChange={(event) => setText(event.target.value)} placeholder="Write a reply to the customer…" />
            <div className="mt-2 flex justify-end"><Button size="sm" variant="primary" icon={Send} disabled={text.trim().length < 2 || sending} onClick={() => void send()}>{sending ? "Sending…" : "Send reply"}</Button></div>
          </div>
        </Panel>
        <Panel title="Ticket details">
          <dl className="space-y-3 text-sm">
            {[ ["Ticket", ticket.id], ["Category", ticket.category], ["Priority", ticket.priority], ["Created", fmtDateTime(ticket.created)], ["Last updated", fmtDateTime(ticket.updated)] ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3"><dt className="text-steel">{label}</dt><dd className="text-right font-medium text-snow">{value}</dd></div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}