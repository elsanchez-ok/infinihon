# Supabase (proyecto "Infinihon Vanguard")

Esta carpeta es documentación/versionado de lo que vive en Supabase; no se
construye ni se despliega con el build de `web/`. Los cambios reales se
aplican con la Supabase CLI o el MCP de Supabase, no copiando estos archivos.

- `migrations/` — espejo de las migraciones SQL aplicadas al proyecto.
- `functions/contact-form/` — copia de referencia de la Edge Function que
  recibe los envíos de `/contacto` (ver comentarios en el propio archivo).

## Secrets del proyecto

| Secret             | Uso                                                        |
| ------------------ | ----------------------------------------------------------- |
| `RESEND_API_KEY`   | API key de [resend.com](https://resend.com) para enviar el correo de notificación de `/contacto`. |
| `CONTACT_TO_EMAIL` | Buzón de destino de esas notificaciones (`infinihon.hn@gmail.com`). |

## Auth

- `mailer_autoconfirm = true` — el registro en `/auth` deja sesión iniciada de
  inmediato, sin depender del mailer de confirmación de Supabase (muy limitado
  en el plan gratuito). Si se vuelve a desactivar, revisar que los correos de
  confirmación realmente lleguen antes de hacerlo.
- Los correos de "recuperar contraseña" siguen usando el mailer por defecto de
  Supabase (no hay SMTP propio configurado). Para mejorarlo: Project Settings →
  Auth → Emails → SMTP Settings en el dashboard de Supabase.

## Entregabilidad del correo de `/contacto`

Mientras el remitente sea el dominio compartido `onboarding@resend.dev`,
Gmail puede clasificar el correo como Spam (ya probado: llega, pero a veces
cae ahí). Para que siempre llegue a la bandeja principal:

1. Verificar un dominio propio en <https://resend.com/domains> (agregar los
   registros DNS que indique Resend: SPF, DKIM, idealmente DMARC).
2. Cambiar el `from` en `functions/contact-form/index.ts` (y en el despliegue
   real vía MCP/CLI) de `onboarding@resend.dev` a una dirección de ese
   dominio verificado, p. ej. `contacto@infinihon.com`.
