import { useState } from "react";
import { Ban, Briefcase, Check, Copy, Eye, FileText, KeyRound, Lock, Pencil, Plus, RotateCcw, Trash2, UserCog, UserPlus, Users } from "lucide-react";
import { permissionModules, type AccountStatus, type Administrator, type ContentItem, type PlatformUser, type PublishStatus, type Role, type Service } from "../data";
import { fmtDate, newId, useAdmin } from "../store";
import { RowMenu } from "../RowMenu";
import {
  Button, ConfirmDialog, DataTable, DemoTag, Drawer, EmptyState, Field, FilterBar, Forbidden, Modal, PageHeader, Panel,
  SearchInput, Select, StatusBadge, Toggle, inputCls, type Column,
} from "../ui";
import { cn } from "../../utils/cn";

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

/* ─────────── Users ─────────── */

export function UsersPage() {
  const { data, mutate, can, toast } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [viewing, setViewing] = useState<PlatformUser | null>(null);
  const [editing, setEditing] = useState<PlatformUser | null>(null);
  const [confirm, setConfirm] = useState<{ user: PlatformUser; kind: "suspend" | "delete" } | null>(null);
  if (!can("users.view")) return <Forbidden permission="users.view" />;
  const rows = data.users.filter((u) => (status === "all" || u.status === status) && (!q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())));

  const setUserStatus = (u: PlatformUser, s: AccountStatus) => {
    mutate("users", (l) => l.map((x) => x.id === u.id ? { ...x, status: s } : x), { action: s === "Suspended" ? "Suspended user" : "Reactivated user", module: "Users", target: u.name });
    toast(`${u.name} is now ${s.toLowerCase()}.`);
  };

  const columns: Column<PlatformUser>[] = [
    { key: "name", header: "Name", render: (u) => <div className="flex items-center gap-2"><span className="font-semibold">{u.name}</span>{u.demo && <DemoTag />}</div> },
    { key: "email", header: "Email", render: (u) => <span className="text-steel">{u.email}</span> },
    { key: "role", header: "Role", render: (u) => u.role },
    { key: "status", header: "Status", render: (u) => <StatusBadge status={u.status} /> },
    { key: "last", header: "Last active", render: (u) => <span className="text-xs text-steel">{u.lastActive ? fmtDate(u.lastActive) : "Never"}</span> },
    { key: "created", header: "Created", render: (u) => <span className="text-xs text-steel">{fmtDate(u.created)}</span>, hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader eyebrow="Platform" title="Users" description="Accounts that use InfiniHon's platform and store. Administrators are managed separately."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Users" }]} />
      <Panel padded={false}>
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Search name or email" label="Search users" />
          <Select label="Status" value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, "Active", "Pending", "Suspended"]} className="sm:w-36" />
        </FilterBar>
        <DataTable caption="Users" columns={columns} rows={rows} getKey={(u) => u.id} onRowClick={setViewing}
          empty={<EmptyState icon={Users} title="No users found." description="Platform accounts appear here once registration is enabled." />}
          rowActions={(u) => <RowMenu actions={[
            { label: "View", icon: Eye, onClick: () => setViewing(u) },
            { label: "Edit", icon: Pencil, onClick: () => setEditing({ ...u }), hidden: !can("users.edit") },
            u.status === "Suspended"
              ? { label: "Reactivate", icon: RotateCcw, onClick: () => setUserStatus(u, "Active"), hidden: !can("users.suspend") }
              : { label: "Suspend", icon: Ban, onClick: () => setConfirm({ user: u, kind: "suspend" }), hidden: !can("users.suspend") },
            { label: "Delete", icon: Trash2, danger: true, onClick: () => setConfirm({ user: u, kind: "delete" }), hidden: !can("users.delete") },
          ]} />} />
      </Panel>

      <Drawer open={!!viewing} onClose={() => setViewing(null)} title="User details">
        {viewing && (
          <dl className="space-y-4 text-sm">
            <div className="flex items-center gap-2 text-lg font-bold">{viewing.name}{viewing.demo && <DemoTag />}</div>
            {[["Email", viewing.email], ["Role", viewing.role], ["Last active", viewing.lastActive ? fmtDate(viewing.lastActive) : "Never"], ["Created", fmtDate(viewing.created)]].map(([k, v]) => (
              <div key={k}><dt className="text-xs text-steel">{k}</dt><dd className="mt-0.5">{v}</dd></div>
            ))}
            <div><dt className="text-xs text-steel">Status</dt><dd className="mt-1"><StatusBadge status={viewing.status} /></dd></div>
          </dl>
        )}
      </Drawer>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit user"
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" disabled={!editing?.name.trim() || !emailOk(editing?.email ?? "")} onClick={() => {
          if (!editing) return; mutate("users", (l) => l.map((x) => x.id === editing.id ? editing : x), { action: "Updated user", module: "Users", target: editing.name }); toast("User updated."); setEditing(null);
        }}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Name" htmlFor="u-name" error={editing.name.trim() ? undefined : "Name is required."}><input id="u-name" className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Email" htmlFor="u-email" error={emailOk(editing.email) ? undefined : "Enter a valid email address."}><input id="u-email" type="email" className={inputCls} value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <Select hideLabel={false} label="Account type" value={editing.role} onChange={(v) => setEditing({ ...editing, role: v })} options={["Customer account", "Partner account"]} />
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title={confirm?.kind === "delete" ? "Delete user" : "Suspend user"} confirmLabel={confirm?.kind === "delete" ? "Delete" : "Suspend"}
        message={confirm?.kind === "delete" ? `Are you sure you want to delete ${confirm?.user.name}? This cannot be undone.` : `Suspend ${confirm?.user.name}? They will lose access until reactivated.`}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "delete") { mutate("users", (l) => l.filter((x) => x.id !== confirm.user.id), { action: "Deleted user", module: "Users", target: confirm.user.name }); toast("User deleted."); }
          else setUserStatus(confirm.user, "Suspended");
        }} />
    </>
  );
}

/* ─────────── Administrators ─────────── */

export function AdministratorsPage() {
  const { data, mutate, can, toast, navigate } = useAdmin();
  const [editing, setEditing] = useState<Administrator | null>(null);
  const [confirm, setConfirm] = useState<{ admin: Administrator; kind: "suspend" | "remove" } | null>(null);
  const [touched, setTouched] = useState(false);
  if (!can("administrators.view")) return <Forbidden permission="administrators.view" />;
  const roleName = (id: string) => data.roles.find((r) => r.id === id)?.name ?? "Unknown role";
  const activeSupers = data.admins.filter((a) => a.roleId === "super" && a.status === "Active").length;
  const isNew = editing ? !data.admins.some((a) => a.id === editing.id) : false;
  const emailTaken = editing ? data.admins.some((a) => a.email.toLowerCase() === editing.email.trim().toLowerCase() && a.id !== editing.id) : false;
  const valid = editing && editing.name.trim() && emailOk(editing.email) && !emailTaken;

  const save = () => {
    setTouched(true);
    if (!editing || !valid) return;
    mutate("admins", (l) => isNew ? [...l, editing] : l.map((a) => a.id === editing.id ? editing : a), { action: isNew ? "Created administrator" : "Updated administrator", module: "Administrators", target: editing.name });
    toast(isNew ? `Invitation prepared for ${editing.email}. Email delivery is not configured.` : "Administrator updated.", isNew ? "info" : "success");
    setEditing(null);
  };

  const columns: Column<Administrator>[] = [
    { key: "name", header: "Administrator", render: (a) => (
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md border border-white/10 bg-obsidian text-[11px] font-bold text-steel">{a.name.split(" ").map((w) => w[0]).slice(-2).join("")}</span>
        <div><div className="flex items-center gap-2 font-semibold">{a.name}{a.demo && <DemoTag />}</div></div>
      </div>
    ) },
    { key: "email", header: "Email", render: (a) => <span className="text-steel">{a.email}</span> },
    { key: "role", header: "Role", render: (a) => <span className={cn("inline-flex items-center gap-1.5", a.roleId === "super" && "text-[#9cc6ff]")}>{a.roleId === "super" && <KeyRound className="h-3 w-3" aria-hidden />}{roleName(a.roleId)}</span> },
    { key: "status", header: "Status", render: (a) => <StatusBadge status={a.status} /> },
    { key: "login", header: "Last login", render: (a) => <span className="text-xs text-steel">{a.lastLogin ? fmtDate(a.lastLogin) : "Never"}</span> },
    { key: "created", header: "Created", render: (a) => <span className="text-xs text-steel">{fmtDate(a.created)}</span>, hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader eyebrow="Platform" title="Administrators" description="People who can operate the Control Center. Every administrator is limited by their role."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Administrators" }]}
        actions={<>
          {can("roles.view") && <Button icon={KeyRound} onClick={() => navigate("/admin/roles")}>Roles</Button>}
          {can("administrators.create") && <Button variant="primary" icon={UserPlus} onClick={() => { setTouched(false); setEditing({ id: newId("a"), name: "", email: "", roleId: "editor", status: "Pending", lastLogin: null, created: new Date().toISOString(), demo: false }); }}>Add administrator</Button>}
        </>} />
      <Panel padded={false}>
        <DataTable caption="Administrators" columns={columns} rows={data.admins} getKey={(a) => a.id}
          empty={<EmptyState icon={UserCog} title="No administrators." />}
          rowActions={(a) => {
            const lastSuper = a.roleId === "super" && a.status === "Active" && activeSupers <= 1;
            return <RowMenu actions={[
              { label: "Edit", icon: Pencil, onClick: () => { setTouched(false); setEditing({ ...a }); }, hidden: !can("administrators.edit") },
              a.status === "Suspended"
                ? { label: "Reactivate", icon: RotateCcw, onClick: () => { mutate("admins", (l) => l.map((x) => x.id === a.id ? { ...x, status: "Active" } : x), { action: "Reactivated administrator", module: "Administrators", target: a.name }); toast("Administrator reactivated."); }, hidden: !can("administrators.edit") }
                : { label: "Suspend", icon: Ban, disabled: lastSuper, onClick: () => setConfirm({ admin: a, kind: "suspend" }), hidden: !can("administrators.edit") },
              { label: "Remove", icon: Trash2, danger: true, disabled: lastSuper, onClick: () => setConfirm({ admin: a, kind: "remove" }), hidden: !can("administrators.remove") },
            ]} />;
          }} />
      </Panel>
      <p className="mt-3 text-[11px] text-steel">The last active Super Administrator cannot be suspended or removed, to prevent losing access to the Control Center.</p>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Add administrator" : "Edit administrator"}
        description={isNew ? "The new administrator will appear as Pending until they accept an invitation (requires email integration)." : undefined}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" onClick={save}>{isNew ? "Add administrator" : "Save changes"}</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Full name" htmlFor="ad-name" error={touched && !editing.name.trim() ? "Name is required." : undefined}><input id="ad-name" autoFocus className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Work email" htmlFor="ad-email" error={touched && !emailOk(editing.email) ? "Enter a valid email address." : emailTaken ? "An administrator with this email already exists." : undefined}><input id="ad-email" type="email" className={inputCls} value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></Field>
            <div>
              <div className="mb-1.5 text-xs font-semibold text-snow/90">Role</div>
              <div className="grid gap-2" role="radiogroup" aria-label="Role">
                {data.roles.filter((r) => r.id !== "super" || can("roles.edit")).map((r) => (
                  <button key={r.id} type="button" role="radio" aria-checked={editing.roleId === r.id} onClick={() => setEditing({ ...editing, roleId: r.id })}
                    className={cn("flex items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors", editing.roleId === r.id ? "border-tech bg-tech/10" : "border-white/10 hover:border-white/20")}>
                    <span><span className="block text-sm font-semibold">{r.name}</span><span className="mt-0.5 block text-[11px] text-steel">{r.description}</span></span>
                    <span className="shrink-0 font-mono text-[10px] text-steel">{r.permissions.length} perms</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)} confirmLabel={confirm?.kind === "remove" ? "Remove" : "Suspend"}
        title={confirm?.kind === "remove" ? "Remove administrator" : "Suspend administrator"}
        message={confirm?.kind === "remove" ? `Are you sure you want to remove ${confirm?.admin.name}? They will immediately lose access to the Control Center.` : `Suspend ${confirm?.admin.name}? Their access is paused until reactivated.`}
        onConfirm={() => {
          if (!confirm) return;
          if (confirm.kind === "remove") mutate("admins", (l) => l.filter((x) => x.id !== confirm.admin.id), { action: "Removed administrator", module: "Administrators", target: confirm.admin.name });
          else mutate("admins", (l) => l.map((x) => x.id === confirm.admin.id ? { ...x, status: "Suspended" } : x), { action: "Suspended administrator", module: "Administrators", target: confirm.admin.name });
          toast(confirm.kind === "remove" ? "Administrator removed." : "Administrator suspended.");
        }} />
    </>
  );
}

/* ─────────── Roles & permissions ─────────── */

export function RolesPage() {
  const { data, mutate, can, toast } = useAdmin();
  const [selected, setSelected] = useState("admin");
  const [draft, setDraft] = useState<string[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [toDelete, setToDelete] = useState<Role | null>(null);
  if (!can("roles.view")) return <Forbidden permission="roles.view" />;
  const role = data.roles.find((r) => r.id === selected) ?? data.roles[0];
  const perms = draft ?? role.permissions;
  const editable = can("roles.edit") && !role.locked;
  const assigned = (id: string) => data.admins.filter((a) => a.roleId === id).length;
  const toggle = (p: string) => setDraft((perms.includes(p) ? perms.filter((x) => x !== p) : [...perms, p]));
  const toggleModule = (module: string, actions: string[]) => {
    const keys = actions.map((a) => `${module}.${a}`);
    const allOn = keys.every((k) => perms.includes(k));
    setDraft(allOn ? perms.filter((p) => !keys.includes(p)) : [...new Set([...perms, ...keys])]);
  };

  return (
    <>
      <PageHeader eyebrow="Platform" title="Roles & Permissions" description="Define what each role can see and do. The interface hides disallowed actions; the backend must enforce the same rules."
        breadcrumbs={[{ label: "Administrators", to: "/admin/administrators" }, { label: "Roles & Permissions" }]}
        actions={can("roles.edit") && <Button variant="primary" icon={Plus} onClick={() => { setNewName(""); setCreating(true); }}>New role</Button>} />
      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        <Panel padded={false} title="Roles">
          <ul className="p-2">
            {data.roles.map((r) => (
              <li key={r.id}>
                <button onClick={() => { setSelected(r.id); setDraft(null); }} aria-current={selected === r.id}
                  className={cn("w-full rounded-lg px-3 py-2.5 text-left transition-colors", selected === r.id ? "bg-hn/40" : "hover:bg-white/[0.03]")}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 text-sm font-semibold">{r.locked && <Lock className="h-3 w-3 text-volt" aria-label="Locked role" />}{r.name}</span>
                    <span className="font-mono text-[10px] text-steel">{assigned(r.id)} admin{assigned(r.id) === 1 ? "" : "s"}</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-steel">{r.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel padded={false} title={<span className="flex items-center gap-2">{role.name}{role.locked && <span className="font-mono text-[10px] font-normal uppercase tracking-[0.12em] text-volt">Full access · locked</span>}</span>}
          description={`${perms.length} of ${permissionModules.reduce((s, m) => s + m.actions.length, 0)} permissions`}
          action={editable && (
            <div className="flex gap-2">
              {!["admin", "manager", "editor", "support"].includes(role.id) && <Button size="sm" variant="ghost" icon={Trash2} disabled={assigned(role.id) > 0} title={assigned(role.id) ? "Reassign administrators first" : undefined} onClick={() => setToDelete(role)}>Delete</Button>}
              <Button size="sm" variant="ghost" disabled={!draft} onClick={() => setDraft(null)}>Discard</Button>
              <Button size="sm" variant="primary" icon={Check} disabled={!draft} onClick={() => { mutate("roles", (l) => l.map((r) => r.id === role.id ? { ...r, permissions: perms } : r), { action: "Changed permissions", module: "Roles", target: role.name }); setDraft(null); toast(`Permissions updated for ${role.name}.`); }}>Save</Button>
            </div>
          )}>
          <div className="divide-y divide-white/[0.05]">
            {permissionModules.map((m) => {
              const keys = m.actions.map((a) => `${m.module}.${a}`);
              const on = keys.filter((k) => perms.includes(k)).length;
              return (
                <div key={m.module} className="grid gap-3 px-5 py-3.5 sm:grid-cols-[200px_1fr] sm:items-center">
                  <div className="flex items-center justify-between sm:justify-start sm:gap-3">
                    <span className="text-sm font-semibold">{m.label}</span>
                    <button disabled={!editable} onClick={() => toggleModule(m.module, m.actions)} className="font-mono text-[10px] text-steel hover:text-snow disabled:hover:text-steel">{on}/{keys.length}</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {m.actions.map((a) => {
                      const key = `${m.module}.${a}`;
                      const active = perms.includes(key);
                      return (
                        <button key={key} disabled={!editable} onClick={() => toggle(key)} aria-pressed={active} title={key}
                          className={cn("inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs capitalize transition-colors disabled:cursor-default",
                            active ? "border-tech/60 bg-tech/15 text-snow" : "border-white/10 text-steel", editable && !active && "hover:border-white/25 hover:text-snow")}>
                          <span className={cn("flex h-3 w-3 items-center justify-center rounded-sm border", active ? "border-volt bg-volt text-obsidian" : "border-steel/50")} aria-hidden>{active && <Check className="h-2.5 w-2.5" strokeWidth={3} />}</span>
                          {a}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          {!editable && <p className="border-t border-white/[0.06] px-5 py-3 text-[11px] text-steel">{role.locked ? "Super Administrator always has every permission and cannot be edited." : "Your role cannot edit permissions."}</p>}
        </Panel>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New role" description="Starts with view-only access to Overview. Add permissions after creating."
        footer={<><Button variant="ghost" onClick={() => setCreating(false)}>Cancel</Button><Button variant="primary" disabled={!newName.trim() || data.roles.some((r) => r.name.toLowerCase() === newName.trim().toLowerCase())} onClick={() => {
          const r: Role = { id: newId("role"), name: newName.trim(), description: "Custom role.", permissions: [] };
          mutate("roles", (l) => [...l, r], { action: "Created role", module: "Roles", target: r.name }); setSelected(r.id); setDraft(null); setCreating(false); toast("Role created.");
        }}>Create role</Button></>}>
        <Field label="Role name" htmlFor="role-name" error={data.roles.some((r) => r.name.toLowerCase() === newName.trim().toLowerCase()) ? "A role with this name already exists." : undefined}>
          <input id="role-name" autoFocus className={inputCls} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Warehouse" />
        </Field>
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete role" message={`Are you sure you want to delete the role “${toDelete?.name}”?`}
        onConfirm={() => { if (!toDelete) return; mutate("roles", (l) => l.filter((r) => r.id !== toDelete.id), { action: "Deleted role", module: "Roles", target: toDelete.name }); setSelected("admin"); toast("Role deleted."); }} />
    </>
  );
}

/* ─────────── Services ─────────── */

/** Lista de etiquetas editable: se escribe y se confirma con Enter. */
function TagInput({ label, hint, value, onChange, placeholder }: { label: string; hint?: string; value: string[]; onChange: (next: string[]) => void; placeholder: string }) {
  const [text, setText] = useState("");
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-snow/90">{label}</label>
      <input className={inputCls} value={text} placeholder={placeholder} aria-label={label}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { e.preventDefault(); onChange([...value, text.trim()]); setText(""); } }} />
      {hint && <p className="mt-1 text-[11px] text-steel">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {value.map((f, i) => <button key={f + i} type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="rounded border border-white/10 px-2 py-0.5 text-xs text-snow/90 hover:border-red-300/40" aria-label={`Remove ${f}`}>{f} ×</button>)}
      </div>
    </div>
  );
}

export function ServicesPage() {
  const { data, mutate, can, toast } = useAdmin();
  const [editing, setEditing] = useState<Service | null>(null);
  const [toDelete, setToDelete] = useState<Service | null>(null);
  if (!can("services.view")) return <Forbidden permission="services.view" />;
  const isNew = editing ? !data.services.some((s) => s.id === editing.id) : false;
  const categoryLabel = (id: string) => data.categories.find((c) => c.id === id)?.name ?? id;
  const save = () => {
    if (!editing?.name.trim()) return;
    const next = { ...editing, updated: new Date().toISOString() };
    mutate("services", (l) => isNew ? [next, ...l] : l.map((s) => s.id === next.id ? next : s), { action: isNew ? "Created service" : "Changed service configuration", module: "Services", target: next.name });
    toast(isNew ? "Service created." : "Service updated."); setEditing(null);
  };

  return (
    <>
      <PageHeader eyebrow="Platform" title="Services" description="Professional services InfiniHon offers. Services use quotes instead of fixed prices."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Services" }]}
        actions={can("services.create") && <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: newId("s"), name: "", description: "", category: "services", status: "Draft", cta: "Request a Quote", features: [], visible: false, updated: new Date().toISOString(), demo: false, scope: [], deliverables: [], tech: [], duration: "" })}>New service</Button>} />
      {data.services.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.services.map((s) => (
            <article key={s.id} className="group flex flex-col rounded-xl border border-white/[0.07] bg-ink/80 p-5 transition-colors hover:border-tech/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/[0.08] bg-obsidian text-steel group-hover:text-volt"><Briefcase className="h-4 w-4" aria-hidden /></div>
                <RowMenu label={`Actions for ${s.name}`} actions={[
                  { label: "Edit", icon: Pencil, onClick: () => setEditing({ ...s }), hidden: !can("services.edit") },
                  { label: "Duplicate", icon: Copy, onClick: () => { mutate("services", (l) => [{ ...s, id: newId("s"), name: `${s.name} (copy)`, status: "Draft", visible: false, demo: false }, ...l], { action: "Duplicated service", module: "Services", target: s.name }); toast("Service duplicated as draft."); }, hidden: !can("services.create") },
                  { label: "Delete", icon: Trash2, danger: true, onClick: () => setToDelete(s), hidden: !can("services.delete") },
                ]} />
              </div>
              <h3 className="mt-4 flex items-center gap-2 text-base font-bold">{s.name}{s.demo && <DemoTag />}</h3>
              <p className="mt-1 text-sm leading-relaxed text-steel">{s.description}</p>
              {s.duration && <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-steel">Duration: {s.duration}</p>}
              {s.scope.length > 0 && (
                <div className="mt-3">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel/70">Scope</div>
                  <ul className="mt-1 space-y-0.5 text-xs text-steel">{s.scope.slice(0, 3).map((x) => <li key={x}>· {x}</li>)}</ul>
                </div>
              )}
              {s.deliverables.length > 0 && (
                <div className="mt-2">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-steel/70">Deliverables</div>
                  <ul className="mt-1 space-y-0.5 text-xs text-steel">{s.deliverables.slice(0, 3).map((x) => <li key={x}>· {x}</li>)}</ul>
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {s.tech.slice(0, 6).map((f) => <span key={f} className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-steel">{f}</span>)}
              </div>
              <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 mt-4 text-xs">
                <span className="text-steel">{categoryLabel(s.category)} · CTA: <span className="text-snow/90">{s.cta}</span></span>
                <span className="flex items-center gap-2">{!s.visible && <span className="text-steel">Hidden</span>}<StatusBadge status={s.status} /></span>
              </div>
            </article>
          ))}
        </div>
      ) : <Panel><EmptyState icon={Briefcase} title="No services yet." description="Create a service to show it in the public site." /></Panel>}

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={isNew ? "New service" : "Edit service"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" disabled={!editing?.name.trim()} onClick={save}>Save service</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Name" htmlFor="sv-name" error={editing.name.trim() ? undefined : "Name is required."}><input id="sv-name" className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="Description" htmlFor="sv-desc"><textarea id="sv-desc" rows={3} className={cn(inputCls, "h-auto py-2")} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Select hideLabel={false} label="Category" value={editing.category} onChange={(v) => setEditing({ ...editing, category: v })} options={data.categories.map((c) => ({ value: c.id, label: c.name }))} />
              <Select hideLabel={false} label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v as PublishStatus })} options={["Published", "Draft", "Scheduled", "Archived"]} />
            </div>
            <Field label="Estimated duration" htmlFor="sv-dur" hint="Shown on the public service page."><input id="sv-dur" className={inputCls} value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="e.g. 2-4 weeks" /></Field>
            <Select hideLabel={false} label="Call to action" value={editing.cta} onChange={(v) => setEditing({ ...editing, cta: v })} options={["Request a Quote", "Talk to an expert", "Book a consultation"]} />
            <Field label="Image" htmlFor="sv-img" hint="Requires object storage integration (not configured)."><button id="sv-img" type="button" disabled className={cn(inputCls, "text-left text-steel")}>Upload image</button></Field>
            <TagInput label="Scope" hint="Shown as the first bullets of the public service card." value={editing.scope} onChange={(next) => setEditing({ ...editing, scope: next })} placeholder="Add a scope item and press Enter" />
            <TagInput label="Deliverables" hint="What the customer receives at the end." value={editing.deliverables} onChange={(next) => setEditing({ ...editing, deliverables: next })} placeholder="Add a deliverable and press Enter" />
            <TagInput label="Technologies" hint="Tags rendered on the public service card." value={editing.tech} onChange={(next) => setEditing({ ...editing, tech: next })} placeholder="Add a technology and press Enter" />
            <TagInput label="Features" value={editing.features} onChange={(next) => setEditing({ ...editing, features: next })} placeholder="Add a feature and press Enter" />
            <Toggle label="Visible on public site" description="Hidden services stay available to administrators only." checked={editing.visible} onChange={(v) => setEditing({ ...editing, visible: v })} />
          </div>
        )}
      </Drawer>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete service" message={`Are you sure you want to delete the service “${toDelete?.name}”?`}
        onConfirm={() => { if (!toDelete) return; mutate("services", (l) => l.filter((s) => s.id !== toDelete.id), { action: "Deleted service", module: "Services", target: toDelete.name }); toast("Service deleted."); }} />
    </>
  );
}

/* ─────────── Content ─────────── */

const contentTypes = ["Homepage", "Services", "Store", "Insights", "Announcement", "Banner", "FAQ"];

export function ContentPage() {
  const { data, mutate, can, toast } = useAdmin();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ContentItem | null>(null);
  const [toDelete, setToDelete] = useState<ContentItem | null>(null);
  if (!can("content.view")) return <Forbidden permission="content.view" />;
  const rows = data.content.filter((c) => (type === "all" || c.type === type) && (status === "all" || c.status === status) && (!q || c.title.toLowerCase().includes(q.toLowerCase())));
  const isNew = editing ? !data.content.some((c) => c.id === editing.id) : false;
  const setItemStatus = (c: ContentItem, s: PublishStatus) => { mutate("content", (l) => l.map((x) => x.id === c.id ? { ...x, status: s, updated: new Date().toISOString() } : x), { action: `Set content to ${s.toLowerCase()}`, module: "Content", target: c.title }); toast(`“${c.title}” is now ${s.toLowerCase()}.`); };

  const columns: Column<ContentItem>[] = [
    { key: "title", header: "Title", render: (c) => <div className="flex items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-steel" aria-hidden /><span className="font-semibold">{c.title}</span>{c.demo && <DemoTag />}</div> },
    { key: "type", header: "Type", render: (c) => <span className="font-mono text-xs text-steel">{c.type}</span> },
    { key: "status", header: "Status", render: (c) => <StatusBadge status={c.status} /> },
    { key: "author", header: "Author", render: (c) => <span className="text-steel">{c.author}</span> },
    { key: "updated", header: "Updated", render: (c) => <span className="text-xs text-steel">{fmtDate(c.updated)}</span> },
  ];

  return (
    <>
      <PageHeader eyebrow="Platform" title="Content" description="Homepage, services, store copy, insights, announcements, banners and FAQs."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "Content" }]}
        actions={can("content.create") && <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: newId("ct"), title: "", type: "Insights", status: "Draft", updated: new Date().toISOString(), author: "Demo session", demo: false })}>New content</Button>} />
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["Published", "Draft", "Scheduled", "Archived"] as PublishStatus[]).map((s) => (
          <button key={s} onClick={() => setStatus(status === s ? "all" : s)} aria-pressed={status === s} className={cn("rounded-xl border p-4 text-left transition-colors", status === s ? "border-tech bg-tech/10" : "border-white/[0.07] bg-ink/80 hover:border-white/15")}>
            <div className="text-xs text-steel">{s}</div><div className="mt-1 text-2xl font-extrabold tabular-nums">{data.content.filter((c) => c.status === s).length}</div>
          </button>
        ))}
      </div>
      <Panel padded={false}>
        <FilterBar>
          <SearchInput value={q} onChange={setQ} placeholder="Search content" label="Search content" />
          <Select label="Type" value={type} onChange={setType} options={[{ value: "all", label: "All types" }, ...contentTypes]} className="sm:w-40" />
        </FilterBar>
        <DataTable caption="Content" columns={columns} rows={rows} getKey={(c) => c.id} onRowClick={can("content.edit") ? (c) => setEditing({ ...c }) : undefined}
          empty={<EmptyState icon={FileText} title="No content found." />}
          rowActions={(c) => <RowMenu actions={[
            { label: "Edit", icon: Pencil, onClick: () => setEditing({ ...c }), hidden: !can("content.edit") },
            { label: "Publish", icon: Check, onClick: () => setItemStatus(c, "Published"), hidden: !can("content.edit") || c.status === "Published" },
            { label: "Archive", icon: Ban, onClick: () => setItemStatus(c, "Archived"), hidden: !can("content.edit") || c.status === "Archived" },
            { label: "Delete", icon: Trash2, danger: true, onClick: () => setToDelete(c), hidden: !can("content.delete") },
          ]} />} />
      </Panel>
      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "New content" : "Edit content"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button variant="primary" disabled={!editing?.title.trim()} onClick={() => {
          if (!editing) return; const next = { ...editing, updated: new Date().toISOString() };
          mutate("content", (l) => isNew ? [next, ...l] : l.map((c) => c.id === next.id ? next : c), { action: isNew ? "Created content" : "Updated content", module: "Content", target: next.title }); toast("Content saved."); setEditing(null);
        }}>Save</Button></>}>
        {editing && (
          <div className="space-y-4">
            <Field label="Title" htmlFor="ct-title"><input id="ct-title" autoFocus className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Select hideLabel={false} label="Type" value={editing.type} onChange={(v) => setEditing({ ...editing, type: v })} options={contentTypes} />
              <Select hideLabel={false} label="Status" value={editing.status} onChange={(v) => setEditing({ ...editing, status: v as PublishStatus })} options={["Draft", "Published", "Scheduled", "Archived"]} />
            </div>
            {editing.status === "Scheduled" && <p className="text-[11px] text-steel">Scheduled publishing runs on the server. Without a backend, scheduled items stay unpublished.</p>}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={!!toDelete} onClose={() => setToDelete(null)} title="Delete content" message={`Are you sure you want to delete “${toDelete?.title}”?`}
        onConfirm={() => { if (!toDelete) return; mutate("content", (l) => l.filter((c) => c.id !== toDelete.id), { action: "Deleted content", module: "Content", target: toDelete.title }); toast("Content deleted."); }} />
    </>
  );
}
