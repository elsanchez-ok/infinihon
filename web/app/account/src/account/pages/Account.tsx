import { useState } from "react";
import { AlertTriangle, Bell, Check, KeyRound, Monitor, ShieldCheck, Trash2 } from "lucide-react";
import { fmtDate, fmtDateTime, fmtRelative, initialPreferences, initialSecurity } from "../data";
import { capabilities } from "../accountService";
import { displayName, useAccount } from "../store";
import { authRecover } from "../../lib/supabase";
import { useLocale, type Locale } from "../locale";
import {
  Button, ConfirmDialog, DemoNote, EmptyState, Field, PageHeader, Panel, StatusBadge, Toggle, UserAvatar, inputCls,
} from "../ui";

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* ─────────── Perfil ─────────── */

export function ProfilePage() {
  const { data, toast, persistProfile } = useAccount();
  const [form, setForm] = useState(data.profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<string | null>(null);
  const dirty = JSON.stringify(form) !== JSON.stringify(data.profile);

  const save = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Escribe tu nombre.";
    if (!form.lastName.trim()) e.lastName = "Escribe tu apellido.";
    if (!emailOk(form.email)) e.email = "Introduce un correo electrónico válido.";
    if (form.phone && form.phone.replace(/\D/g, "").length < 7) e.phone = "Introduce un teléfono válido.";
    setErrors(e);
    if (Object.keys(e).length) { toast("Revisa los campos marcados.", "error"); return; }
    const clean = { ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim() };
    setForm(clean);
    void persistProfile(clean);
  };

  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Mi perfil" description="Administra tu información personal."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Mi perfil" }]}
        actions={<><Button variant="ghost" disabled={!dirty} onClick={() => { setForm(data.profile); setErrors({}); }}>Descartar</Button><Button variant="primary" disabled={!dirty} onClick={save}>Guardar cambios</Button></>} />

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <Panel title="Información personal" description="Solo pedimos lo necesario para atenderte.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="pf-first" required error={errors.firstName}>
              <input id="pf-first" className={inputCls} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} autoComplete="given-name" />
            </Field>
            <Field label="Apellido" htmlFor="pf-last" required error={errors.lastName}>
              <input id="pf-last" className={inputCls} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" />
            </Field>
            <Field label="Correo electrónico" htmlFor="pf-email" required error={errors.email} hint="Se usa para acceder y para las notificaciones.">
              <input id="pf-email" type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            </Field>
            <Field label="Teléfono" htmlFor="pf-phone" error={errors.phone}>
              <input id="pf-phone" type="tel" className={inputCls} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+504 0000 0000" autoComplete="tel" />
            </Field>
            <Field label="Empresa" htmlFor="pf-company">
              <input id="pf-company" className={inputCls} value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} autoComplete="organization" />
            </Field>
            <Field label="Cargo" htmlFor="pf-position">
              <input id="pf-position" className={inputCls} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} autoComplete="organization-title" />
            </Field>
          </div>
          {capabilities.profileUpdate && <div className="mt-5 text-[11px] text-steel">Los cambios se guardan en tu cuenta y quedan disponibles en cualquier dispositivo.</div>}
        </Panel>

        <div className="space-y-4">
          <Panel title="Foto de perfil">
            <div className="flex flex-col items-center gap-4">
              <UserAvatar name={displayName(form)} size="lg" src={photo} />
              <div className="flex flex-col gap-2 w-full">
                <Button size="sm" disabled={!capabilities.fileUpload} title={capabilities.fileUpload ? undefined : "Requiere almacenamiento de archivos conectado."}>Subir foto</Button>
                <Button size="sm" variant="ghost" disabled={!photo || !capabilities.fileUpload} onClick={() => setPhoto(null)}>Quitar</Button>
              </div>
              <p className="text-center text-[11px] leading-relaxed text-steel">Formatos habituales de imagen. InfiniHon no asigna una foto automática.</p>
            </div>
          </Panel>
          <Panel title="Estado de la cuenta">
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3"><dt className="text-steel">Perfil</dt><dd><StatusBadge status={data.profileCompleted ? "Completo" : "Incompleto"} /></dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-steel">Tipo de cuenta</dt><dd className="font-medium">Individual</dd></div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
/* ─────────── Seguridad ─────────── */
export function SecurityPage() {
  const sec = data.security;
  const activity = data.notifications.filter((n) => n.group === "Seguridad");

  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Seguridad" description="Protege y controla el acceso a tu cuenta."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Seguridad" }]} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Contraseña" description="Última actualización de tu contraseña.">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-snow">Contraseña</div>
              <div className="mt-0.5 text-xs text-steel">{sec.passwordUpdatedAt ? `Actualizada el ${fmtDate(sec.passwordUpdatedAt)}` : "Nunca actualizada en esta sesión"}</div>
            </div>
            <KeyRound className="h-5 w-5 shrink-0 text-steel" aria-hidden />
          </div>
          <Button className="mt-4 w-full" disabled={!capabilities.passwordChange}
            title={capabilities.passwordChange ? undefined : "Requiere un backend de autenticación."}
            onClick={() => {
              if (!data.profile.email) { toast("Completa tu perfil con tu correo primero.", "info"); return; }
              void authRecover(data.profile.email)
                .then(() => toast("Te enviamos las instrucciones por correo."))
                .catch(() => toast("No pudimos enviar el correo. Inténtalo de nuevo.", "error"));
            }}>Enviar instrucciones de cambio</Button>
          <p className="mt-3 text-[11px] leading-relaxed text-steel">Te enviaremos instrucciones por correo para restablecerla de forma segura.</p>
        </Panel>

        <Panel title="Verificación en dos pasos" description="Una capa extra al iniciar sesión.">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-snow">{sec.twoFactor === "Habilitado" ? "Habilitada" : "No configurada"}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-steel">
                {sec.twoFactor === "Habilitado" ? "Tu cuenta pide un segundo factor al iniciar sesión." : "Añade una capa más de protección a tu cuenta."}
              </div>
            </div>
            <ShieldCheck className={`h-5 w-5 shrink-0 ${sec.twoFactor === "Habilitado" ? "text-volt" : "text-steel"}`} aria-hidden />
          </div>
          <Button className="mt-4 w-full" disabled={!capabilities.twoFactor}
            title={capabilities.twoFactor ? undefined : "Requiere un backend de autenticación."}
            onClick={() => toast("La verificación en dos pasos requiere un backend de autenticación.", "info")}>
            {sec.twoFactor === "Habilitado" ? "Administrar" : "Configurar ahora"}
          </Button>
        </Panel>

        <Panel title="Sesiones activas" description="Dispositivos con acceso a tu cuenta." className="lg:col-span-2" padded={false}>
          <ul className="divide-y divide-white/[0.05]">
            {sec.sessions.map((s) => (
              <li key={s.id} className="flex items-center gap-4 px-5 py-4">
                <Monitor className="h-5 w-5 shrink-0 text-steel" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold text-snow">{s.device}</span>{s.current && <StatusBadge status="Sesión actual" />}</div>
                  <div className="mt-0.5 text-[11.5px] text-steel">{s.lastActive ? `Activa ${fmtRelative(s.lastActive)}` : "Sin actividad registrada"}</div>
                </div>
                {!s.current && <Button size="sm" variant="danger">Cerrar sesión</Button>}
              </li>
            ))}
          </ul>
          <div className="border-t border-white/[0.06] p-5"><DemoNote>Solo se muestra la sesión local de demostración. Las sesiones reales las lista el backend de autenticación.</DemoNote></div>
        </Panel>

        <Panel title="Actividad de seguridad" description="Inicios de sesión y cambios importantes." className="lg:col-span-2" padded={false}>
          {activity.length ? (
            <ul className="divide-y divide-white/[0.05]">
              {activity.map((n) => (
                <li key={n.id} className="px-5 py-3.5">
                  <div className="text-sm text-snow/90">{n.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-steel">{n.description} · <time dateTime={n.date}>{fmtDateTime(n.date)}</time></div>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon={ShieldCheck} title="Sin actividad registrada" description="Aquí verás inicios de sesión, cambios de contraseña, de correo y de verificación en dos pasos." />}
        </Panel>

        <Panel title="Cerrar sesión" className="lg:col-span-2 border-amber-200/15">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-steel">Cierra la sesión en este dispositivo. Tendrás que volver a autenticarte para entrar a tu espacio.</p>
            <Button variant="danger" icon={AlertTriangle} onClick={() => setConfirmSignOut(true)}>Cerrar sesión</Button>
          </div>
        </Panel>
      </div>

      <ConfirmDialog open={confirmSignOut} onClose={() => setConfirmSignOut(false)} title="Cerrar sesión" confirmLabel="Cerrar sesión"
        message="¿Quieres cerrar tu sesión en este dispositivo?"
        onConfirm={() => { patch({ security: { ...initialSecurity, sessions: initialSecurity.sessions.map((s) => ({ ...s, lastActive: new Date().toISOString() })) } }); window.location.assign("/auth"); }} />
    </>
  );
}

/* ─────────── Configuración ─────────── */

const timezones = ["America/Tegucigalpa", "America/Mexico_City", "America/Bogota", "America/New_York", "Europe/Madrid"];

export function SettingsPage() {
  const { data, patch, toast } = useAccount();
  const { locale, setLocale } = useLocale();
  const [prefs, setPrefs] = useState({ ...data.preferences, language: locale });
  const dirty = prefs.language !== locale || JSON.stringify({ ...prefs, language: data.preferences.language }) !== JSON.stringify(data.preferences);
  const set = <K extends keyof typeof prefs>(k: K, v: (typeof prefs)[K]) => setPrefs({ ...prefs, [k]: v });

  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Configuración" description="Preferencias de idioma, zona horaria y comunicación."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Configuración" }]}
          actions={<><Button variant="ghost" disabled={!dirty} onClick={() => setPrefs({ ...data.preferences, language: locale })}>Restaurar</Button>
            <Button variant="primary" disabled={!dirty} onClick={() => { patch({ preferences: prefs }); setLocale(prefs.language as Locale); toast("Preferencias guardadas para esta sesión."); }}>Guardar cambios</Button></>} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Preferencias">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Idioma" htmlFor="st-lang"><select id="st-lang" className={`${inputCls} [&>option]:bg-ink`} value={prefs.language} onChange={(e) => set("language", e.target.value)}>
                <option value="es-HN">Español (Honduras)</option><option value="en-US">Inglés (Estados Unidos)</option>
            </select></Field>
            <Field label="Zona horaria" htmlFor="st-tz"><select id="st-tz" className={`${inputCls} [&>option]:bg-ink`} value={prefs.timezone} onChange={(e) => set("timezone", e.target.value)}>
              {timezones.map((t) => <option key={t}>{t}</option>)}
            </select></Field>
          </div>
          <div className="mt-2 divide-y divide-white/[0.05]">
            <Toggle label="Notificaciones del navegador" description="Avisos en este dispositivo." checked={false} onChange={() => undefined} disabled={!capabilities.notifications} />
          </div>
        </Panel>

        <Panel title="Comunicación" description="Elige qué quieres recibir.">
          <div className="divide-y divide-white/[0.05]">
            <Toggle label="Notificaciones por correo" description="Requiere un servicio de correo conectado." checked={prefs.emailNotifications} onChange={(v) => set("emailNotifications", v)} disabled={!capabilities.notifications} />
            <Toggle label="Actualizaciones de pedidos" description="Cambios de estado en tus pedidos." checked={prefs.orderUpdates} onChange={(v) => set("orderUpdates", v)} />
            <Toggle label="Actualizaciones de servicios" description="Avances en tus servicios contratados." checked={prefs.serviceUpdates} onChange={(v) => set("serviceUpdates", v)} />
            <Toggle label="Respuestas de soporte" description="Cuando el equipo responde un ticket." checked={prefs.supportNotifications} onChange={(v) => set("supportNotifications", v)} />
            <Toggle label="Comunicaciones comerciales" description="Novedades y contenido de InfiniHon. Puedes desactivarlo cuando quieras." checked={prefs.marketing} onChange={(v) => set("marketing", v)} />
          </div>
          <div className="mt-4 flex items-center gap-2 text-[11px] text-steel"><Check className="h-3.5 w-3.5 text-volt" aria-hidden />Nunca vendemos ni compartimos tus datos.</div>
        </Panel>

        <Panel title="Restablecer" description="Vuelve a los valores iniciales del portal de demostración." className="lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] leading-relaxed text-steel">Borra las solicitudes, tickets y favoritos creados en esta sesión.</p>
            <Button variant="danger" icon={Trash2} onClick={() => { patch({ preferences: initialPreferences, security: initialSecurity, requests: [], tickets: [], favorites: [], notifications: [] }); toast("Se restableció el portal.", "info"); }}>Restablecer portal</Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ─────────── Notificaciones ─────────── */

const groups = ["Todas", "Sin leer", "Pedidos", "Servicios", "Seguridad", "Soporte", "Cuenta"] as const;

export function NotificationsPage() {
  const { data, markAllRead, markRead, navigate } = useAccount();
  const [group, setGroup] = useState<(typeof groups)[number]>("Todas");
  const rows = data.notifications.filter((n) =>
    group === "Todas" ? true : group === "Sin leer" ? !n.read : n.group === group);

  return (
    <>
      <PageHeader eyebrow="Cuenta" title="Notificaciones" description="Novedades de tus pedidos, servicios, seguridad y soporte."
        breadcrumbs={[{ label: "Inicio", to: "/account" }, { label: "Notificaciones" }]}
        actions={data.notifications.some((n) => !n.read) && <Button icon={Check} onClick={markAllRead}>Marcar todo como leído</Button>} />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {groups.map((g) => (
          <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors ${group === g ? "border-tech bg-tech/15 text-snow" : "border-white/10 text-steel hover:text-snow"}`}>{g}</button>
        ))}
      </div>

      <Panel padded={false}>
        {rows.length ? (
          <ul className="divide-y divide-white/[0.05]">
            {rows.map((n) => (
              <li key={n.id} className={`flex items-start gap-4 px-5 py-4 ${!n.read ? "bg-hn/[0.14]" : ""}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "border border-steel/50" : "bg-volt"}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-snow">{n.title}</div>
                  <div className="mt-0.5 text-[12.5px] leading-relaxed text-steel">{n.description}</div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-steel">
                    <span className="font-mono uppercase tracking-[0.12em]">{n.group}</span>·<time dateTime={n.date}>{fmtRelative(n.date)}</time>·<span>{n.read ? "Leída" : "Sin leer"}</span>
                  </div>
                </div>
                {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Marcar leída</Button>}
              </li>
            ))}
          </ul>
        ) : <EmptyState icon={Bell} title={data.notifications.length ? "Nada en esta categoría." : "No tienes notificaciones"} description="Cuando algo cambie en tu cuenta, te avisaremos aquí." action={<Button onClick={() => navigate("/account")}>Volver al inicio</Button>} />}
      </Panel>
    </>
  );
}
