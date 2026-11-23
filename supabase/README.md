# Supabase (proyecto "Infinihon Vanguard")

Esta carpeta es documentación/versionado de lo que vive en Supabase; no se
construye ni se despliega con el build de `web/`. Los cambios reales se
aplican con la Supabase CLI o el MCP de Supabase, no copiando estos archivos.

- `migrations/` — espejo de las migraciones SQL aplicadas al proyecto.
- `functions/contact-form/` — copia de referencia de la Edge Function que
  recibe los envíos de `/contacto` (ver comentarios en el propio archivo).
- `functions/ai-chat/` — copia de referencia de la Edge Function que atiende
  el asistente "Zuri IA" del portal de usuario (`/account`): recibe el
  historial de chat de un usuario autenticado, arma un contexto con SUS
  propios datos (perfil, pedidos, solicitudes, tickets — vía su propio JWT,
  filtrado por las políticas RLS de cada tabla) y llama a la API de NVIDIA
  NIM del lado del servidor. La clave de NVIDIA nunca llega al navegador.

## Secrets del proyecto

| Secret             | Uso                                                        |
| ------------------ | ----------------------------------------------------------- |
| `RESEND_API_KEY`   | API key de [resend.com](https://resend.com) para enviar el correo de notificación de `/contacto`. |
| `CONTACT_TO_EMAIL` | Buzón de destino de esas notificaciones (`infinihon.hn@gmail.com`). |
| `NVIDIA_API_KEY`   | API key de [build.nvidia.com](https://build.nvidia.com) (`nvapi-...`) para el asistente "Zuri IA" de `/account` (función `ai-chat`). |

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

## Auditoría de seguridad (nov-2026)

Ver `migrations/20261117100000_security_hardening_profiles_storage_contact.sql`.
Hallazgos corregidos:

- **Crítico — auto-escalación a administrador.** Cualquier usuario autenticado
  podía hacer `PATCH /rest/v1/profiles?id=eq.<su-id>` con `{"is_admin": true}`
  y volverse administrador: la política RLS `profiles update own` solo exigía
  ser dueño de la fila, sin restringir columnas, y Postgres tenía `GRANT
  UPDATE` sobre `is_admin` para `authenticated`/`anon`. Se agregó el trigger
  `protect_profile_privileged_fields_trigger`, que revierte cambios a
  `is_admin`, `role_id`, `role_label` y `platform_status` salvo que quien edita
  ya sea admin o sea `service_role`. Verificado en vivo: el intento de
  auto-escalación ya no tiene efecto.
- **Alto — bucket `app-updates` (APKs) editable por cualquier autenticado.**
  Las políticas de `storage.objects` para ese bucket exigían solo
  `auth.role() = 'authenticated'`; ahora exigen además `is_admin()`, igual que
  `product-images`.
- **Medio — sin rate limiting en `contact-form`.** La Edge Function pública
  ahora rechaza (`429`) más de 3 envíos en 10 minutos desde la misma IP o más
  de 5 por hora desde el mismo email, usando la nueva columna
  `contact_submissions.client_ip`.

Pendiente de criterio del dueño del proyecto (no bloqueante, requiere decisión
de producto): activar CAPTCHA en Auth (`security_captcha_enabled` está en
`false`), revisar por qué el servicio `realtime` aparece `UNHEALTHY` en
`get_project_health`, y considerar subir `db_max_pool_size` (hoy 10) si el
tráfico concurrente crece.
