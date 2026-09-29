import { useState } from "react";
import { ArrowRight, Clock, Copy, Fingerprint, KeyRound, Lock, Pencil, Save, ShieldCheck, User } from "lucide-react";
import { fmtDate, useAdmin } from "../store";
import { Button, Field, PageHeader, Panel, StatusBadge, inputCls } from "../ui";
import { updateProfileById } from "../supabaseSync";
import { cn } from "../../utils/cn";
import { useLocale } from "../locale";

const splitName = (name: string) => {
  const [first = "", ...rest] = name.trim().split(" ");
  return { first, last: rest.join(" ") };
};

export function ProfilePage() {
  const { locale, setLocale } = useLocale();
  const { data, user, role, mutate, toast, navigate } = useAdmin();
  const me = data.admins.find((a) => a.id === user?.id) ?? data.admins.find((a) => a.email === user?.email);
  const fallbackName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Administrator";
        <Panel title="Language" description="This preference is shared with your account portal.">
          <Field label="Language" htmlFor="profile-language">
            <select id="profile-language" className={cn(inputCls, "[&>option]:bg-ink")} value={locale} onChange={(event) => { setLocale(event.target.value as "en-US" | "es-HN"); toast("Language preference updated."); }}>
              <option value="en-US">English (United States)</option>
              <option value="es-HN">Español (Honduras)</option>
            </select>
          </Field>
        </Panel>
  const displayName = me?.name ?? fallbackName;
  const email = me?.email ?? user?.email ?? "";

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<{ first: string; last: string } | null>(null);
  const name = editing && draft ? draft : splitName(displayName);
  const dirty = JSON.stringify(name) !== JSON.stringify(splitName(displayName));

  const save = () => {
    const id = me?.id ?? user?.id;
    if (!id || !dirty) return;
    const first = name.first.trim();
    const last = name.last.trim();
    if (![first, last].join(" ").trim()) return;
    void updateProfileById(id, { first_name: first, last_name: last })
      .then(() => {
        if (me) mutate("admins", (l) => l.map((a) => a.id === me.id ? { ...a, name: `${first} ${last}`.trim() } : a), { action: "Updated own profile", module: "Administrators", target: user?.email ?? id });
        setEditing(false);
        setDraft(null);
        toast("Profile saved.");
      })
      .catch(() => toast("Could not save your profile.", "error"));
  };

  const copyText = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => toast("Copied to clipboard.")).catch(() => undefined);
  };

  return (
    <>
      <PageHeader eyebrow="System" title="My Profile" description="Your administrator account on the INFINIHON Control Center."
        breadcrumbs={[{ label: "Overview", to: "/admin" }, { label: "My Profile" }]}
        actions={editing ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => { setEditing(false); setDraft(null); }}>Cancel</Button>
            <Button variant="primary" icon={Save} onClick={save} disabled={!dirty}>Save changes</Button>
          </div>
        ) : (
          <Button icon={Pencil} onClick={() => { setDraft(splitName(displayName)); setEditing(true); }}>Edit profile</Button>
        )} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Administrator profile" description="Name details are saved to your account and shown across the platform." className="lg:col-span-2">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-tech/40 bg-hn/40 text-snow">
              <User className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <div className="text-lg font-semibold leading-tight">{displayName}</div>
              <div className="flex items-center gap-2"><span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9cc6ff]">{role.id === "super" && <KeyRound className="h-3 w-3" aria-hidden />}{role.name}</span><StatusBadge status={me?.status ?? "Active"} /></div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor="pf-first"><input id="pf-first" className={inputCls} value={name.first} disabled={!editing} onChange={(e) => editing && setDraft({ ...draft!, first: e.target.value })} /></Field>
            <Field label="Last name" htmlFor="pf-last"><input id="pf-last" className={inputCls} value={name.last} disabled={!editing} onChange={(e) => editing && setDraft({ ...draft!, last: e.target.value })} /></Field>
            <div className="sm:col-span-2">
              <Field label="Work email" htmlFor="pf-email" hint={editing ? "Email is managed by your authentication provider." : undefined}>
                <div className="flex items-center gap-2">
                  <input id="pf-email" type="email" className={cn(inputCls, "font-mono")} value={email} disabled readOnly />
                  <button type="button" aria-label="Copy email" onClick={() => copyText(email)} className="rounded-md border border-white/10 p-2 text-steel hover:text-snow"><Copy className="h-4 w-4" aria-hidden /></button>
                </div>
              </Field>
            </div>
          </div>
        </Panel>

        <Panel title="Account details" description="Status of your administrator account.">
          <dl className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <dt className="flex items-center gap-2 text-steel"><Fingerprint className="h-4 w-4" aria-hidden />Administrator ID</dt>
              <dd className="flex items-center gap-1.5"><span className="max-w-[140px] truncate font-mono text-xs text-snow/90">{me?.id ?? user?.id ?? "—"}</span><button type="button" aria-label="Copy ID" onClick={() => me?.id && copyText(me.id)} className="text-steel hover:text-snow"><Copy className="h-3.5 w-3.5" aria-hidden /></button></dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="flex items-center gap-2 text-steel"><Clock className="h-4 w-4" aria-hidden />Last login</dt>
              <dd className="text-xs text-snow/90">{fmtDate(me?.lastLogin ?? null)}</dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="flex items-center gap-2 text-steel"><ShieldCheck className="h-4 w-4" aria-hidden />Member since</dt>
              <dd className="text-xs text-snow/90">{fmtDate(me?.created ?? null)}</dd>
            </div>
          </dl>
          <div className="mt-5 border-t border-white/[0.06] pt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-snow/90"><KeyRound className="h-3.5 w-3.5 text-steel" aria-hidden />Role permissions · {role.permissions.length}</div>
            {role.permissions.length ? (
              <div className="flex flex-wrap gap-1.5">
                {role.permissions.slice(0, 10).map((p) => <span key={p} className="rounded border border-white/10 bg-obsidian/60 px-2 py-1 font-mono text-[10px] text-steel">{p}</span>)}
                {role.permissions.length > 10 && <span className="rounded border border-white/10 bg-obsidian/60 px-2 py-1 text-[10px] text-steel">+{role.permissions.length - 10} more</span>}
              </div>
            ) : <span className="text-xs text-steel">No permissions granted.</span>}
            <p className="mt-3 text-[11px] text-steel">Permissions are defined by your role and managed in <button className="text-tech hover:underline" onClick={() => navigate("/admin/roles")}>Roles</button>.</p>
          </div>
        </Panel>

        <Panel title="Security" description="Protect access to the Control Center." className="lg:col-span-3">
          <button onClick={() => navigate("/admin/security")} className="flex w-full items-center gap-3 rounded-lg border border-white/[0.07] bg-obsidian/40 p-4 text-left hover:border-white/20">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-ink text-steel"><Lock className="h-4 w-4" aria-hidden /></span>
            <span className="flex-1"><span className="block text-sm font-semibold">Security settings</span><span className="block text-xs text-steel">Password, two-factor authentication and recent sign-in activity.</span></span>
            <ArrowRight className="h-4 w-4 text-steel" aria-hidden />
          </button>
          <p className="mt-3 text-[11px] text-steel">Signed in as <span className="font-mono text-snow/80">{email}</span>. Sessions and sign-in history are provided by the authentication backend.</p>
        </Panel>
      </div>
    </>
  );
}