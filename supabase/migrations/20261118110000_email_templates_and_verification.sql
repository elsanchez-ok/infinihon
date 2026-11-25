-- Admin-editable automated emails + 6-digit email verification on signup ----
--
-- Dos piezas nuevas:
--   1) public.email_templates: contenido (asunto + cuerpo) de los correos
--      automáticos que el sistema envía, editable desde /admin. Hoy cubre
--      "welcome" (bienvenida, ya existente) y "verification_code" (nuevo).
--   2) public.email_verification_codes: códigos de 6 dígitos de un solo uso
--      que se exigen antes de dar acceso a una cuenta nueva (o, para cuentas
--      ya existentes de correo/contraseña, en su próximo inicio de sesión).
--
-- Las cuentas creadas por un proveedor externo (Google) ya probaron su
-- correo ante ese proveedor, así que no pasan por este código: quedan
-- marcadas como verificadas de inmediato (ver trigger handle_new_user y el
-- backfill de abajo).

/* ─────────── email_templates ─────────── */

create table if not exists public.email_templates (
  id text primary key,
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.email_templates enable row level security;

drop policy if exists "email_templates_select_authenticated" on public.email_templates;
create policy "email_templates_select_authenticated" on public.email_templates
  for select to authenticated using (true);

drop policy if exists "email_templates_admin_write" on public.email_templates;
create policy "email_templates_admin_write" on public.email_templates
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.email_templates (id, subject, body) values
  (
    'welcome',
    'Bienvenido a InfiniHon',
    E'Hola, {{firstName}}.\n\nSoy Zuri, la asistente virtual de la plataforma InfiniHon. Quería darte una bienvenida personal ahora que ya tienes acceso a tu cuenta.\n\nDesde tu portal puedes dar seguimiento a tus solicitudes y pedidos, gestionar tus datos y resolver dudas sobre nuestros servicios. Y si en algún momento necesitas ayuda, solo abre el ícono de chat dentro de tu cuenta, con gusto te atiendo ahí mismo.\n\nUn gusto tenerte con nosotros.'
  ),
  (
    'verification_code',
    'Tu código de verificación de InfiniHon',
    E'Hola, {{firstName}}.\n\nUsa este código para verificar tu cuenta de InfiniHon:\n\n{{code}}\n\nEste código vence en 10 minutos. Si tú no solicitaste esto, puedes ignorar este correo con confianza: tu cuenta sigue segura.'
  )
on conflict (id) do nothing;

/* ─────────── email_verification_codes ─────────── */

create table if not exists public.email_verification_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists email_verification_codes_user_idx
  on public.email_verification_codes (user_id, created_at desc);

alter table public.email_verification_codes enable row level security;
-- Sin policies: esta tabla solo la tocan las Edge Functions con la service
-- role key (que ignora RLS). Ningún cliente (anon/authenticated) puede leer
-- ni escribir códigos ajenos ni propios directamente.

/* ─────────── profiles.email_verified_at ─────────── */

alter table public.profiles add column if not exists email_verified_at timestamptz;

-- Backfill: cuentas ya existentes dadas de alta por un proveedor externo
-- (Google) se consideran verificadas. Las de correo/contraseña quedan NULL
-- a propósito: se les pedirá el código la próxima vez que inicien sesión.
update public.profiles p
set email_verified_at = now()
from auth.users u
where p.id = u.id
  and coalesce(u.raw_app_meta_data->>'provider', 'email') <> 'email'
  and p.email_verified_at is null;

-- handle_new_user: las cuentas nuevas por proveedor externo quedan
-- verificadas de inmediato; las de correo/contraseña quedan sin verificar
-- hasta confirmar el código de 6 dígitos.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  meta jsonb := new.raw_user_meta_data;
  google_full_name text := nullif(trim(coalesce(meta->>'full_name', meta->>'name', '')), '');
  guess_first text;
  guess_last text;
  provider text := coalesce(new.raw_app_meta_data->>'provider', 'email');
begin
  if google_full_name is not null then
    guess_first := split_part(google_full_name, ' ', 1);
    guess_last := nullif(trim(regexp_replace(google_full_name, '^\S+\s*', '')), '');
  end if;

  insert into public.profiles (id, email, first_name, last_name, avatar_url, email_verified_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(meta->>'firstName', ''), nullif(meta->>'given_name', ''), guess_first, ''),
    coalesce(nullif(meta->>'lastName', ''), nullif(meta->>'family_name', ''), guess_last, ''),
    nullif(coalesce(meta->>'avatar_url', meta->>'picture'), ''),
    case when provider <> 'email' then now() else null end
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- protect_profile_privileged_fields: email_verified_at debía protegerse
-- igual que is_admin/role_id/etc. — sin esto, cualquier usuario autenticado
-- podría auto-verificarse con un simple PATCH a /rest/v1/profiles (la policy
-- "profiles update own" permite editar la fila propia). Con este cambio,
-- solo el service role (Edge Functions) o un administrador pueden tocarlo.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  new.is_admin := old.is_admin;
  new.role_id := old.role_id;
  new.role_label := old.role_label;
  new.platform_status := old.platform_status;
  new.email_verified_at := old.email_verified_at;
  return new;
end;
$function$;
