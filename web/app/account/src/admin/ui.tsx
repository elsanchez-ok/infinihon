import { useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Info, Inbox, Search, X, type LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";
import { useAdmin } from "./store";

/* ─────────── Primitives ─────────── */

export const inputCls =
  "h-10 w-full rounded-md border border-white/10 bg-obsidian/60 px-3 text-sm text-snow placeholder:text-steel/60 outline-none transition-colors hover:border-white/20 focus:border-tech focus:ring-2 focus:ring-tech/25 disabled:cursor-not-allowed disabled:opacity-50";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md"; icon?: LucideIcon };
export function Button({ variant = "secondary", size = "md", icon: Icon, className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        size === "sm" ? "h-8 px-2.5 text-xs" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-tech text-snow hover:bg-[#1a75ff] shadow-[0_6px_20px_-10px_rgba(0,102,255,.8)]",
        variant === "secondary" && "border border-white/10 bg-white/[0.03] text-snow hover:border-white/20 hover:bg-white/[0.06]",
        variant === "ghost" && "text-steel hover:bg-white/[0.05] hover:text-snow",
        variant === "danger" && "border border-white/15 bg-white/[0.04] text-snow hover:border-red-400/60 hover:bg-red-500/10",
        className,
      )}
    >
      {Icon && <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />}
      {children}
    </button>
  );
}

export function DemoTag({ label = "Demo" }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded border border-dashed border-steel/40 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-steel" title="Illustrative sample data — not a real record">
      {label}
    </span>
  );
}

const positive = ["Active", "Published", "Completed", "Operational", "Connected", "In stock", "Read"];
const warning = ["Low stock", "Pending", "Processing", "Scheduled", "Warning", "Shipped"];
const negative = ["Suspended", "Out of stock", "Cancelled", "Offline", "Unavailable"];
export function StatusBadge({ status }: { status: string }) {
  const tone = positive.includes(status) ? "pos" : warning.includes(status) ? "warn" : negative.includes(status) ? "neg" : "neutral";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tone === "pos" && "border-tech/40 bg-tech/10 text-[#9cc6ff]",
        tone === "warn" && "border-amber-300/30 bg-amber-300/[0.06] text-amber-100",
        tone === "neg" && "border-red-300/30 bg-red-400/[0.07] text-red-100",
        tone === "neutral" && "border-white/10 bg-white/[0.03] text-steel",
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5", tone === "pos" && "rounded-full bg-volt", tone === "warn" && "rounded-full border border-amber-200", tone === "neg" && "rotate-45 bg-red-200", tone === "neutral" && "rounded-full bg-steel/60")} />
      {status}
    </span>
  );
}

/* ─────────── Layout blocks ─────────── */

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  const { navigate } = useAdmin();
  return (
    <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-steel">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-steel/50" aria-hidden />}
          {item.to ? (
            <a href={item.to} onClick={(e) => { e.preventDefault(); navigate(item.to!); }} className="hover:text-snow">{item.label}</a>
          ) : (
            <span className="text-snow/80" aria-current="page">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({ title, description, actions, breadcrumbs, eyebrow }: { title: string; description?: ReactNode; actions?: ReactNode; breadcrumbs?: { label: string; to?: string }[]; eyebrow?: string }) {
  return (
    <header className="mb-7">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {eyebrow && <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-volt">{eyebrow}</div>}
          <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.03em] text-snow md:text-[32px]">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-steel">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Panel({ title, description, action, children, className, padded = true }: { title?: ReactNode; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={cn("rounded-xl border border-white/[0.07] bg-ink/80", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div className="min-w-0">
            {title && <h2 className="text-sm font-bold text-snow">{title}</h2>}
            {description && <p className="mt-0.5 text-xs text-steel">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, change, period, icon: Icon, status, demo, onClick }: { label: string; value: ReactNode; change?: string; period: string; icon: LucideIcon; status?: string; demo?: boolean; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={cn("group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.07] bg-ink/80 p-4 text-left transition-colors", onClick && "hover:border-tech/40 hover:bg-[#0c131b]")}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-steel">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/[0.07] bg-obsidian text-steel transition-colors group-hover:text-volt"><Icon className="h-3.5 w-3.5" aria-hidden /></span>
      </div>
      <div className="mt-3 text-[26px] font-extrabold leading-none tracking-tight text-snow tabular-nums">{value}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-steel">
        <span className="font-mono">{change ?? "—"}</span>
        <span className="text-steel/40">·</span>
        <span>{period}</span>
        {status && <span className="ml-auto"><StatusBadge status={status} /></span>}
        {demo && !status && <span className="ml-auto"><DemoTag /></span>}
      </div>
    </Tag>
  );
}

/* ─────────── Data display ─────────── */

export interface Column<T> { key: string; header: string; render: (row: T) => ReactNode; className?: string; hideOnMobile?: boolean }

export function DataTable<T>({ columns, rows, getKey, onRowClick, empty, rowActions, pageSize = 8, caption }: {
  columns: Column<T>[]; rows: T[]; getKey: (row: T) => string; onRowClick?: (row: T) => void; empty?: ReactNode;
  rowActions?: (row: T) => ReactNode; pageSize?: number; caption: string;
}) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  useEffect(() => { if (page >= pages) setPage(0); }, [page, pages]);
  const visible = rows.slice(page * pageSize, page * pageSize + pageSize);
  if (!rows.length) return <>{empty ?? <EmptyState title="Nothing here yet." description="Records will appear here once they are created." />}</>;
  const [primary, ...rest] = columns;

  return (
    <div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-white/[0.06]">
              {columns.map((c) => <th key={c.key} scope="col" className={cn("px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-steel", c.className)}>{c.header}</th>)}
              {rowActions && <th scope="col" className="w-12 px-4"><span className="sr-only">Actions</span></th>}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr
                key={getKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("group border-b border-white/[0.04] transition-colors last:border-0", onRowClick && "cursor-pointer hover:bg-white/[0.025]")}
              >
                {columns.map((c) => <td key={c.key} className={cn("px-4 py-3 align-middle text-snow/90", c.className)}>{c.render(row)}</td>)}
                {rowActions && <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>{rowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-white/[0.05] md:hidden" aria-label={caption}>
        {visible.map((row) => (
          <li key={getKey(row)} className="relative p-4">
            <div className="flex items-start justify-between gap-3">
              <button type="button" className="min-w-0 flex-1 text-left" onClick={onRowClick ? () => onRowClick(row) : undefined} disabled={!onRowClick}>
                {primary.render(row)}
              </button>
              {rowActions && <div>{rowActions(row)}</div>}
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {rest.filter((c) => !c.hideOnMobile).map((c) => (
                <div key={c.key} className="min-w-0">
                  <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-steel/70">{c.header}</dt>
                  <dd className="mt-0.5 truncate text-[13px] text-snow/90">{c.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>

      {pages > 1 && <Pagination page={page} pages={pages} total={rows.length} onPage={setPage} />}
    </div>
  );
}

export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 text-xs text-steel">
      <span>{total} records · page {page + 1} of {pages}</span>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" icon={ChevronLeft} disabled={page === 0} onClick={() => onPage(page - 1)} aria-label="Previous page" />
        <Button size="sm" variant="ghost" icon={ChevronRight} disabled={page >= pages - 1} onClick={() => onPage(page + 1)} aria-label="Next page" />
      </div>
    </div>
  );
}

export function FilterBar({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-2 border-b border-white/[0.06] p-3 sm:flex-row sm:flex-wrap sm:items-center">{children}</div>;
}

export function SearchInput({ value, onChange, placeholder = "Search…", label = "Search" }: { value: string; onChange: (v: string) => void; placeholder?: string; label?: string }) {
  return (
    <label className="relative block min-w-0 sm:w-64">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" aria-hidden />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cn(inputCls, "pl-9")} />
    </label>
  );
}

export function Select({ value, onChange, options, label, className, hideLabel = true }: { value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; label: string; className?: string; hideLabel?: boolean }) {
  return (
    <label className={cn("block", className)}>
      <span className={hideLabel ? "sr-only" : "mb-1.5 block text-xs font-semibold text-snow/90"}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "pr-8 [&>option]:bg-ink")}>
        {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-snow/90">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-[11px] text-steel">{hint}</p>}
      {error && <p className="mt-1 flex items-center gap-1 text-[11px] text-red-200" role="alert"><AlertTriangle className="h-3 w-3" aria-hidden />{error}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <div className="text-sm font-medium text-snow">{label}</div>
        {description && <div className="mt-0.5 text-xs text-steel">{description}</div>}
      </div>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors disabled:opacity-40", checked ? "border-tech bg-tech" : "border-white/15 bg-white/[0.06]")}
      >
        <span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-snow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (t: string) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-white/[0.06]">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={value === t} onClick={() => onChange(t)}
          className={cn("relative whitespace-nowrap px-3 py-2.5 text-sm transition-colors", value === t ? "text-snow" : "text-steel hover:text-snow")}>
          {t}
          <span className={cn("absolute inset-x-2 -bottom-px h-px transition-colors", value === t ? "bg-volt" : "bg-transparent")} />
        </button>
      ))}
    </div>
  );
}

/* ─────────── Overlays ─────────── */

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);
}

export function Modal({ open, onClose, title, description, children, footer, size = "md" }: { open: boolean; onClose: () => void; title: string; description?: string; children: ReactNode; footer?: ReactNode; size?: "sm" | "md" | "lg" }) {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="admin-fade absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("admin-pop relative flex max-h-[92svh] w-full flex-col rounded-t-2xl border border-white/10 bg-ink shadow-2xl sm:rounded-xl", size === "sm" ? "sm:max-w-md" : size === "md" ? "sm:max-w-lg" : "sm:max-w-3xl")}>
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-snow">{title}</h2>
            {description && <p className="mt-1 text-xs leading-relaxed text-steel">{description}</p>}
          </div>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close" />
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function Drawer({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEscape(open, onClose);
  return (
    <>
      <div className={cn("fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")} onClick={onClose} />
      <aside role="dialog" aria-modal="true" aria-label={title} aria-hidden={!open}
        className={cn("fixed inset-y-0 right-0 z-[75] flex w-full max-w-md flex-col border-l border-white/10 bg-ink shadow-2xl transition-transform duration-300", open ? "translate-x-0" : "translate-x-full")}>
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-base font-bold">{title}</h2>
          <Button variant="ghost" size="sm" icon={X} onClick={onClose} aria-label="Close" />
        </div>
        <div className="flex-1 overflow-y-auto p-5">{open && children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">{footer}</div>}
      </aside>
    </>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onClose }: { open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" icon={AlertTriangle} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button></>}>
      <p className="text-sm leading-relaxed text-steel">{message}</p>
    </Modal>
  );
}

export function Toaster() {
  const { toasts, dismissToast } = useAdmin();
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? AlertTriangle : t.tone === "info" ? Info : CheckCircle2;
        return (
          <div key={t.id} className="admin-pop pointer-events-auto flex items-start gap-3 rounded-lg border border-white/10 bg-[#0d141c] px-4 py-3 text-sm shadow-xl">
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", t.tone === "error" ? "text-red-200" : "text-volt")} aria-hidden />
            <span className="flex-1 text-snow/90">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="text-steel hover:text-snow" aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── States ─────────── */

export function EmptyState({ icon: Icon = Inbox, title, description, action }: { icon?: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-obsidian text-steel">
        <Icon className="h-5 w-5" aria-hidden />
        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-ink bg-tech/70" />
      </div>
      <h3 className="text-sm font-bold text-snow">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs leading-relaxed text-steel">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = "Something could not be loaded.", description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-300/20 bg-red-400/[0.05] p-4" role="alert">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-200" aria-hidden />
      <div className="flex-1">
        <div className="text-sm font-semibold text-snow">{title}</div>
        <p className="mt-0.5 text-xs text-steel">{description}</p>
      </div>
      {onRetry && <Button size="sm" onClick={onRetry}>Retry</Button>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("admin-shimmer rounded-md bg-white/[0.04]", className)} />;
}
export function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="mb-2 h-3 w-32" />
      <Skeleton className="mb-7 h-8 w-64" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}</div>
      <Skeleton className="mt-4 h-72" />
    </div>
  );
}

export function NoData({ label = "No data available yet." }: { label?: string }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-lg border border-dashed border-white/10">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
        {[0.25, 0.5, 0.75].map((y) => <line key={y} x1="0" x2="100%" y1={`${y * 100}%`} y2={`${y * 100}%`} stroke="rgba(139,150,165,.1)" strokeDasharray="3 5" />)}
      </svg>
      <div className="relative flex h-full flex-col items-center justify-center gap-1 text-center">
        <span className="text-sm font-semibold text-snow/90">{label}</span>
        <span className="text-[11px] text-steel">Connect an analytics source to populate this chart.</span>
      </div>
    </div>
  );
}

export function ChartCard({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return <Panel title={title} description={description} action={action}>{children}</Panel>;
}

export function ActivityItem({ actor, action, target, module, date, demo, compact }: { actor: string; action: string; target: string; module: string; date: string; demo?: boolean; compact?: boolean }) {
  return (
    <li className="relative flex gap-3 pb-5 pl-1 last:pb-0">
      <span className="absolute left-[7px] top-4 bottom-0 w-px bg-white/[0.07] [li:last-child_&]:hidden" aria-hidden />
      <span className="relative mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full border border-tech bg-obsidian" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-snow/90">
          <span className="font-semibold text-snow">{actor}</span> <span className="text-steel">{action.toLowerCase()}</span> <span className="font-medium text-snow">{target}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-steel">
          <span className="font-mono uppercase tracking-[0.1em]">{module}</span>
          <span className="text-steel/40">·</span>
          <time dateTime={date}>{new Intl.DateTimeFormat("en-US", compact ? { month: "short", day: "numeric" } : { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(date))}</time>
          {demo ? <DemoTag /> : <span className="rounded border border-tech/40 px-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#9cc6ff]">This session</span>}
        </div>
      </div>
    </li>
  );
}

/** Generic "search + filter" helper used by list pages. */
export function useFiltered<T>(rows: T[], query: string, fields: (row: T) => string, predicate: (row: T) => boolean = () => true) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => predicate(r) && (!q || fields(r).toLowerCase().includes(q)));
  }, [rows, query, fields, predicate]);
}

export function Forbidden({ permission }: { permission: string }) {
  return (
    <Panel>
      <EmptyState icon={AlertTriangle} title="You don't have access to this module."
        description={`Your current role is missing the "${permission}" permission. Ask a Super Administrator to update your role.`} />
    </Panel>
  );
}
