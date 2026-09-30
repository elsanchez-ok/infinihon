import { useEffect, useRef, type ReactNode } from "react";
import {
  AlertTriangle, CheckCircle2, ChevronRight, Info, Inbox, Search, X, XCircle,
} from "lucide-react";
import { cn } from "../utils/cn";
import { useAccount } from "./store";
import { useLocale } from "./locale";
import { fmtDate, statusTone } from "./data";

/* ─────────── Marca ─────────── */

export function AccountMark({ href = "/account", onNavigate }: { href?: string; onNavigate?: (to: string) => void }) {
  return (
    <a href={href} onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(href); } }} className="flex flex-col items-center gap-1.5" aria-label="INFINIHON — inicio del portal">
      <img src="/assets/infinihon.png" alt="INFINIHON" className="h-9 w-auto shrink-0" />
      <span className="block font-mono text-[8px] uppercase leading-none tracking-[0.28em] text-steel">Infrastructure · Innovation · Honduras</span>
    </a>
  );
}

export function UserAvatar({ name, size = "md", src }: { name: string; size?: "sm" | "md" | "lg"; src?: string | null }) {
  const letters = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "IH";
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : size === "lg" ? "h-20 w-20 text-2xl" : "h-9 w-9 text-xs";
  if (src) return <img src={src} alt={name} className={cn(dim, "rounded-full object-cover")} />;
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full border border-tech/40 bg-hn/50 font-bold text-snow", dim)} aria-hidden>
      {letters}
    </span>
  );
}

/* ─────────── Estados ─────────── */

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLocale();
  const tone = statusTone(status);
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
      tone === "pos" && "border-tech/40 bg-tech/10 text-[#9cc6ff]",
      tone === "warn" && "border-amber-300/30 bg-amber-300/[0.07] text-amber-100",
      tone === "neg" && "border-red-300/30 bg-red-400/[0.07] text-red-100",
      tone === "neutral" && "border-white/10 bg-white/[0.03] text-steel",
    )}>
      <span aria-hidden className={cn(
        tone === "pos" && "h-1.5 w-1.5 rounded-full bg-volt",
        tone === "warn" && "h-1.5 w-1.5 rounded-full border border-amber-200",
        tone === "neg" && "h-1.5 w-1.5 rotate-45 bg-red-200",
        tone === "neutral" && "h-1.5 w-1.5 rounded-full bg-steel/60",
      )} />
      {t(status)}
    </span>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-steel/30 bg-white/[0.02] px-3.5 py-2.5">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-volt" aria-hidden />
      <p className="text-[11.5px] leading-relaxed text-steel">{children}</p>
    </div>
  );
}

/* ─────────── Estructura ─────────── */

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { navigate } = useAccount();
  const { t } = useLocale();
  return (
    <nav aria-label="Ruta" className="mb-2.5 flex flex-wrap items-center gap-1.5 text-xs text-steel">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-steel/50" aria-hidden />}
          {item.to
            ? <a href={item.to} onClick={(e) => { e.preventDefault(); navigate(item.to!); }} className="hover:text-snow">{t(item.label)}</a>
            : <span className="text-snow/80" aria-current="page">{t(item.label)}</span>}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ title, description, actions, breadcrumbs, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; breadcrumbs?: { label: string; to?: string }[]; eyebrow?: string }) {
  const { t } = useLocale();
  return (
    <header className="mb-6">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-volt">{t(eyebrow)}</div>}
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-snow md:text-[30px]">{t(title)}</h1>
          {description && <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-steel">{typeof description === "string" ? t(description) : description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Panel({ title, description, action, children, className, padded = true }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  const { t } = useLocale();
  return (
    <section className={cn("rounded-2xl border border-white/[0.07] bg-ink/70", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">{title && <h2 className="text-sm font-bold text-snow">{typeof title === "string" ? t(title) : title}</h2>}{description && <p className="mt-0.5 text-xs leading-relaxed text-steel">{typeof description === "string" ? t(description) : description}</p>}</div>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function DashboardCard({ label, value, hint, to, icon: Icon, state }: { label: string; value: ReactNode; hint: string; to?: string; icon: React.ComponentType<{ className?: string }>; state?: "empty" | "ok" }) {
  const { navigate } = useAccount();
  const body = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-steel">{label}</span>
        <Icon className="h-4 w-4 text-steel/70" aria-hidden />
      </div>
      <div className={cn("mt-3 text-[30px] font-extrabold leading-none tracking-tight tabular-nums", state === "empty" ? "text-snow/35" : "text-snow")}>{value}</div>
      <div className="mt-2.5 text-[11.5px] leading-snug text-steel">{hint}</div>
    </>
  );
  return to
    ? <button onClick={() => navigate(to)} className="group w-full rounded-2xl border border-white/[0.07] bg-ink/70 p-4 text-left transition-colors hover:border-tech/40 hover:bg-[#0b1219]">{body}</button>
    : <div className="rounded-2xl border border-white/[0.07] bg-ink/70 p-4">{body}</div>;
}

export function QuickAction({ label, description, icon: Icon, onClick }: { label: string; description: string; icon: React.ComponentType<{ className?: string }>; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.07] bg-ink/70 p-4 text-left transition-colors hover:border-tech/40 hover:bg-[#0b1219]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-obsidian text-steel transition-colors group-hover:border-tech/40 group-hover:text-volt"><Icon className="h-4 w-4" aria-hidden /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-snow">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-steel">{description}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-steel/50 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </button>
  );
}

/* ─────────── Tarjetas de recurso ─────────── */

export function ServiceCard({ name, status, startDate, nextAction, description, onOpen }: { name: string; status: string; startDate: string; nextAction: string; description: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group w-full rounded-2xl border border-white/[0.07] bg-ink/70 p-5 text-left transition-colors hover:border-tech/40">
      <div className="flex items-start justify-between gap-3"><h3 className="text-base font-bold text-snow group-hover:text-volt">{name}</h3><StatusBadge status={status} /></div>
      <p className="mt-2 text-sm leading-relaxed text-steel">{description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3">
        <div><dt className="text-[10.5px] uppercase tracking-[0.12em] text-steel/70">Inicio</dt><dd className="mt-0.5 text-[13px]">{startDate}</dd></div>
        <div><dt className="text-[10.5px] uppercase tracking-[0.12em] text-steel/70">Próxima acción</dt><dd className="mt-0.5 text-[13px]">{nextAction}</dd></div>
      </dl>
    </button>
  );
}

export function RequestCard({ title, type, date, status, updated, onOpen }: { title: string; type: string; date: string; status: string; updated: string; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="group w-full rounded-xl border border-white/[0.07] bg-ink/70 p-4 text-left transition-colors hover:border-tech/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><h3 className="truncate text-sm font-bold text-snow group-hover:text-volt">{title}</h3><p className="mt-1 text-xs text-steel">{type} · creada {fmtDate(date)}</p></div>
        <StatusBadge status={status} />
      </div>
      <p className="mt-2.5 text-[11.5px] text-steel">Última actualización {fmtDate(updated)}</p>
    </button>
  );
}

export function Timeline({ entries }: { entries: { label: string; date: string; note?: string }[] }) {
  if (!entries.length) return <p className="text-sm text-steel">Sin movimientos todavía.</p>;
  return (
    <ol className="relative">
      {entries.map((e, i) => (
        <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
          {i < entries.length - 1 && <span className="absolute left-[7px] top-5 bottom-0 w-px bg-white/[0.08]" aria-hidden />}
          <span className={cn("relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 bg-obsidian", i === entries.length - 1 ? "border-volt" : "border-steel/50")} aria-hidden />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="text-sm font-semibold text-snow">{e.label}</div>
            <div className="mt-0.5 text-[11.5px] text-steel"><time dateTime={e.date}>{fmtDate(e.date)}</time>{e.note && <span> · {e.note}</span>}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ─────────── Tabla → tarjetas ─────────── */

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode; hideOnMobile?: boolean }

export function ResourceTable<T>({ columns, rows, getKey, caption, onRowClick, empty }: {
  columns: Column<T>[]; rows: T[]; getKey: (r: T) => string; caption: string; onRowClick?: (r: T) => void; empty?: ReactNode;
}) {
  const { t } = useLocale();
  if (!rows.length) return <>{empty}</>;
  const [first, ...rest] = columns;
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead><tr className="border-b border-white/[0.06]">
            {columns.map((c) => <th key={c.key} scope="col" className="px-5 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-steel">{t(c.header)}</th>)}
            <th scope="col" className="w-10 px-5"><span className="sr-only">Abrir</span></th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={getKey(r)} onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cn("border-b border-white/[0.04] transition-colors last:border-0", onRowClick && "cursor-pointer hover:bg-white/[0.02]")}>
                {columns.map((c) => <td key={c.key} className="px-5 py-3.5 align-middle text-snow/90">{c.render(r)}</td>)}
                <td className="px-5 py-3.5 text-right text-steel">{onRowClick && <ChevronRight className="ml-auto h-4 w-4" aria-hidden />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-white/[0.05] md:hidden">
        {rows.map((r) => (
          <li key={getKey(r)}>
            <button onClick={onRowClick ? () => onRowClick(r) : undefined} disabled={!onRowClick} className="w-full p-4 text-left">
              {first.render(r)}
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {rest.filter((c) => !c.hideOnMobile).map((c) => (
                  <div key={c.key} className="min-w-0">
                    <dt className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-steel/70">{t(c.header)}</dt>
                    <dd className="mt-0.5 text-[13px] text-snow/90">{c.render(r)}</dd>
                  </div>
                ))}
              </dl>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ─────────── Formularios ─────────── */

export const inputCls = "h-11 w-full rounded-lg border border-white/10 bg-obsidian/60 px-3.5 text-sm text-snow placeholder:text-steel/50 outline-none transition-colors hover:border-white/20 focus:border-tech focus:ring-2 focus:ring-tech/20 disabled:cursor-not-allowed disabled:opacity-50";

export function Field({ label, htmlFor, hint, error, children, required }: { label: string; htmlFor: string; hint?: string; error?: string; children: ReactNode; required?: boolean }) {
  const { t } = useLocale();
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-snow/90">
        {t(label)}{required && <span className="ml-1 text-volt" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-[11.5px] text-steel">{t(hint)}</p>}
      {error && <p className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-red-200" role="alert"><AlertTriangle className="h-3 w-3" aria-hidden />{t(error)}</p>}
    </div>
  );
}

export function Select({ value, onChange, options, label, hideLabel, disabled, className }: { value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; label: string; hideLabel?: boolean; disabled?: boolean; className?: string }) {
  const { t } = useLocale();
  return (
    <label className={cn("block", className)}>
      <span className={hideLabel ? "sr-only" : "mb-1.5 block text-[13px] font-semibold text-snow/90"}>{t(label)}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-label={hideLabel ? t(label) : undefined} className={cn(inputCls, "pr-8 [&>option]:bg-ink")}>
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{t(o)}</option> : <option key={o.value} value={o.value}>{t(o.label)}</option>)}
      </select>
    </label>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const { t } = useLocale();
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div className="min-w-0">
        <div className="text-sm font-medium text-snow">{t(label)}</div>
        {description && <div className="mt-0.5 text-[11.5px] leading-relaxed text-steel">{t(description)}</div>}
      </div>
      <button type="button" role="switch" aria-checked={checked} aria-label={t(label)} disabled={disabled} onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors disabled:opacity-40", checked ? "border-tech bg-tech" : "border-white/15 bg-white/[0.06]")}>
        <span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-snow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function Button({ children, variant = "secondary", size = "md", className, icon: Icon, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md"; icon?: React.ComponentType<{ className?: string }> }) {
  const { t } = useLocale();
  return (
    <button {...props} className={cn(
      "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
      size === "sm" ? "h-9 px-3 text-xs" : "h-11 px-4 text-sm",
      variant === "primary" && "bg-tech text-snow hover:bg-[#1a75ff] shadow-[0_8px_24px_-14px_rgba(0,102,255,.9)]",
      variant === "secondary" && "border border-white/10 bg-white/[0.03] text-snow hover:border-white/20 hover:bg-white/[0.06]",
      variant === "ghost" && "text-steel hover:bg-white/[0.05] hover:text-snow",
      variant === "danger" && "border border-white/15 bg-white/[0.04] text-snow hover:border-red-400/50 hover:bg-red-500/10",
      className,
    )}>
      {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />}
      {typeof children === "string" ? t(children) : children}
    </button>
  );
}

/* ─────────── Estados vacíos / carga / error ─────────── */

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: React.ComponentType<{ className?: string }>; title: string; description?: string; action?: ReactNode }) {
  const { t } = useLocale();
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-obsidian text-steel">
        <Icon className="h-6 w-6" aria-hidden />
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-ink bg-tech/70" />
      </div>
      <h3 className="text-base font-bold text-snow">{t(title)}</h3>
      {description && <p className="mt-1.5 max-w-sm text-[13px] leading-relaxed text-steel">{t(description)}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) { return <div className={cn("acct-shimmer rounded-lg bg-white/[0.04]", className)} />; }
export function LoadingState({ label = "Cargando tu información…" }: { label?: string }) {
  return (
    <div aria-busy="true">
      <span className="sr-only">{label}</span>
      <Skeleton className="mb-2 h-3 w-28" /><Skeleton className="mb-7 h-9 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      <Skeleton className="mt-4 h-64" />
    </div>
  );
}
export function ErrorState({ description, onRetry }: { description: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-300/20 bg-red-400/[0.05] p-4">
      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-200" aria-hidden />
      <div className="flex-1"><div className="text-sm font-semibold text-snow">No pudimos cargar esto.</div><p className="mt-0.5 text-xs text-steel">{description}</p></div>
      {onRetry && <Button size="sm" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}
export function Unauthorized() {
  return (
    <Panel className="border-amber-200/20">
      <EmptyState icon={AlertTriangle} title="No tienes acceso a este recurso."
        description="Este contenido pertenece a otra cuenta o tu sesión no tiene permiso para verlo. Si crees que es un error, contacta a soporte." />
    </Panel>
  );
}
export function NotFoundState({ title = "No encontramos esta página.", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <Panel><EmptyState icon={Search} title={title} description={description} action={action} /></Panel>;
}

/* ─────────── Overlays ─────────── */

function useDismiss(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" }) {
  const { t } = useLocale();
  useDismiss(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={t(title)}>
      <div className="acct-fade absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("acct-pop relative flex max-h-[92svh] w-full flex-col rounded-t-2xl border border-white/10 bg-ink shadow-2xl sm:rounded-2xl", size === "sm" ? "sm:max-w-md" : "sm:max-w-xl")}>
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>{title && <h2 className="text-base font-bold text-snow">{t(title)}</h2>}{description && <p className="mt-1 text-xs leading-relaxed text-steel">{t(description)}</p>}</div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t("Cerrar")}><X className="h-4 w-4" /></Button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const { t } = useLocale();
  useDismiss(open, onClose);
  return (
    <>
      <div className={cn("fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={t(title)} aria-hidden={!open}
        className={cn("fixed inset-y-0 right-0 z-[75] flex w-full max-w-md flex-col border-l border-white/10 bg-ink shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-base font-bold">{t(title)}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label={t("Cerrar")}><X className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{open && children}</div>
      </aside>
    </>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirmar", onConfirm, onClose }: { open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button></>}>
      <p className="text-sm leading-relaxed text-steel">{message}</p>
    </Modal>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useAccount();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? AlertTriangle : t.tone === "info" ? Info : CheckCircle2;
        return (
          <div key={t.id} className="acct-pop pointer-events-auto flex items-start gap-3 rounded-xl border border-white/10 bg-[#0d141c] px-4 py-3 shadow-xl">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", t.tone === "error" ? "text-red-200" : "text-volt")} aria-hidden />
            <span className="flex-1 text-[13px] leading-relaxed text-snow/90">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} aria-label="Descartar" className="text-steel hover:text-snow"><X className="h-3.5 w-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── Utilidades ─────────── */

export function useOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", fn);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", fn); document.removeEventListener("keydown", key); };
  }, [onClose]);
  return ref;
}

export function onboardingSteps() {
  return [
    { title: "Bienvenido a InfiniHon", text: "Este es tu espacio personal: aquí gestionas tus servicios, pedidos y solicitudes." },
    { title: "Completa tu perfil", text: "Añade tu nombre y datos de contacto para que el equipo pueda atenderte mejor." },
    { title: "Explora los servicios", text: "Descubre lo que InfiniHon puede implementar para tu operación." },
    { title: "Configura tu seguridad", text: "Activa la verificación en dos pasos y revisa tus sesiones activas." },
    { title: "Todo listo", text: "Ya puedes empezar. Si necesitas ayuda, el soporte está a un clic." },
  ];
}

/** Diagrama conceptual: tu cuenta y sus áreas. */
export function SpaceDiagram({ counts }: { counts: { services: number; orders: number; requests: number; support: number } }) {
  const areas = [
    { label: "SERVICIOS", value: counts.services },
    { label: "PEDIDOS", value: counts.orders },
    { label: "SOLICITUDES", value: counts.requests },
    { label: "SOPORTE", value: counts.support },
  ];
  return (
    <svg viewBox="0 0 420 210" className="h-auto w-full" role="img" aria-label="Diagrama de tu espacio: tu cuenta conecta servicios, pedidos, solicitudes y soporte">
      <defs><linearGradient id="acct-g" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#0066FF" /><stop offset="1" stopColor="#003B73" /></linearGradient></defs>
      {areas.map((a, i) => {
        const y = 26 + i * 46;
        const d = `M104 96 C138 96 130 ${y + 16} 168 ${y + 16}`;
        return (
          <g key={a.label}>
            <path d={d} fill="none" stroke="#17304a" />
            <path d={d} fill="none" stroke="url(#acct-g)" strokeWidth="1.2" className="acct-flow" style={{ animationDelay: `${i * -1.2}s` }} />
            <rect x="168" y={y} width="146" height="32" rx="8" fill="#070b10" stroke="#284662" />
            <text x="182" y={y + 20} fill="#D5E1EE" fontSize="10" letterSpacing="1.3" fontFamily="JetBrains Mono, monospace">{a.label}</text>
            <text x="300" y={y + 20} textAnchor="end" fill="#8B96A5" fontSize="10" fontFamily="JetBrains Mono, monospace">{a.value || "—"}</text>
          </g>
        );
      })}
      <rect x="16" y="74" width="88" height="44" rx="10" fill="#05070A" stroke="#0066FF" />
      <circle cx="34" cy="96" r="3" fill="#00A8FF" className="acct-pulse" />
      <text x="46" y="100" fill="#F5F7FA" fontSize="10.5" letterSpacing="1.4" fontFamily="JetBrains Mono, monospace">CUENTA</text>
    </svg>
  );
}
