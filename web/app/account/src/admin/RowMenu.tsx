import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

export interface RowAction { label: string; icon?: LucideIcon; onClick: () => void; danger?: boolean; hidden?: boolean; disabled?: boolean }

export function RowMenu({ actions, label = "Row actions" }: { actions: RowAction[]; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", key); };
  }, [open]);
  const visible = actions.filter((a) => !a.hidden);
  if (!visible.length) return null;
  return (
    <div ref={ref} className="relative inline-block text-left">
      <button onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }} aria-label={label} aria-haspopup="menu" aria-expanded={open}
        className="rounded-md p-1.5 text-steel transition-colors hover:bg-white/[0.06] hover:text-snow">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="admin-pop absolute right-0 z-30 mt-1 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#0d141c] py-1 shadow-2xl">
          {visible.map((a, i) => (
            <button key={a.label} role="menuitem" disabled={a.disabled}
              onClick={(e) => { e.stopPropagation(); setOpen(false); a.onClick(); }}
              className={cn("flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-white/[0.05] disabled:opacity-40",
                a.danger ? "text-red-100" : "text-snow/90", a.danger && i > 0 && "border-t border-white/[0.06]")}>
              {a.icon && <a.icon className="h-3.5 w-3.5 text-steel" aria-hidden />}{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
