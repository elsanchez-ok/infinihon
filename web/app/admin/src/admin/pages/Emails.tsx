import { useState } from "react";
import { Save } from "lucide-react";
import type { EmailTemplate } from "../data";
import { fmtDateTime, useAdmin } from "../store";
import { Button, Field, Forbidden, PageHeader, Panel, inputCls } from "../ui";
import { useLocale } from "../locale";

const textareaCls = `${inputCls} h-auto min-h-[220px] resize-y py-2.5 font-mono text-[12.5px] leading-relaxed`;

/** Placeholders each template substitutes on send; informational only here —
 * the real substitution happens in the server function. */
const placeholdersByTemplate: Record<EmailTemplate["id"], { token: string; description: string }[]> = {
  welcome: [{ token: "{{firstName}}", description: "First name on the account." }],
  verification_code: [
    { token: "{{firstName}}", description: "First name on the account." },
    { token: "{{code}}", description: "The 6-digit code generated for this delivery." },
  ],
};

const templateMeta: Record<EmailTemplate["id"], { title: string; description: string }> = {
  welcome: { title: "Welcome email", description: "Sent once, the first time an account signs in (the server function is idempotent)." },
  verification_code: { title: "Verification code", description: "Sent on sign-up or sign-in by email and password while the account is unverified. The code expires after 10 minutes." },
};

function TemplateEditor({ template, editable }: { template: EmailTemplate; editable: boolean }) {
  const { mutate, toast } = useAdmin();
  const { t } = useLocale();
  const [form, setForm] = useState({ subject: template.subject, body: template.body });
  const [error, setError] = useState("");
  const dirty = form.subject !== template.subject || form.body !== template.body;
  const meta = templateMeta[template.id];
  const placeholders = placeholdersByTemplate[template.id];

  const save = () => {
    if (!form.subject.trim()) { setError(t("The subject cannot be empty.")); return; }
    if (!form.body.trim()) { setError(t("The body cannot be empty.")); return; }
    setError("");
    mutate("emailTemplates", (list) => list.map((item) => item.id === template.id
      ? { ...item, subject: form.subject.trim(), body: form.body, updatedAt: new Date().toISOString() }
      : item), { action: "Updated email template", module: "Emails", target: meta.title });
    toast(t("Template saved."));
  };

  const discard = () => { setForm({ subject: template.subject, body: template.body }); setError(""); };

  return (
    <Panel
      title={t(meta.title)}
      description={t(meta.description)}
      action={editable && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" disabled={!dirty} onClick={discard}>{t("Discard")}</Button>
          <Button variant="primary" icon={Save} disabled={!dirty} onClick={save}>{t("Save changes")}</Button>
        </div>
      )}
    >
      <fieldset disabled={!editable} className="space-y-4">
        <Field label={t("Subject")} htmlFor={`${template.id}-subject`} error={error && !form.subject.trim() ? error : undefined}>
          <input id={`${template.id}-subject`} className={inputCls} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
        </Field>
        <Field label={t("Body")} htmlFor={`${template.id}-body`} error={error && !form.body.trim() ? error : undefined}>
          <textarea id={`${template.id}-body`} className={textareaCls} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
        </Field>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-steel/70">{t("Available placeholders")}</p>
          <ul className="mt-2 space-y-1">
            {placeholders.map((p) => (
              <li key={p.token} className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-steel">
                <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[11.5px] text-volt">{p.token}</code>
                <span>{t(p.description)}</span>
              </li>
            ))}
          </ul>
        </div>
        {template.updatedAt && <p className="text-[11px] text-steel">{t("Last updated")}: {fmtDateTime(template.updatedAt)}</p>}
      </fieldset>
    </Panel>
  );
}

export function EmailsPage() {
  const { data, can } = useAdmin();
  const { t } = useLocale();
  if (!can("emails.view")) return <Forbidden permission="emails.view" />;
  const editable = can("emails.edit");
  return (
    <>
      <PageHeader eyebrow={t("Emails")} title={t("Automated emails")} description={t("Subject and content of the emails the system sends automatically.")}
        breadcrumbs={[{ label: t("Overview"), to: "/admin" }, { label: t("Emails") }]} />
      {!editable && <p className="mb-4 text-[12.5px] text-steel">{t("Your role can view these templates but cannot edit them.")}</p>}
      <div className="max-w-3xl space-y-5">
        {data.emailTemplates.map((template) => <TemplateEditor key={template.id} template={template} editable={editable} />)}
      </div>
    </>
  );
}
