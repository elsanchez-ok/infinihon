-- Endurecimiento de seguridad (auditoria de plataforma, nov-2026).
-- Aplicado directamente al proyecto en vivo via Supabase MCP; este archivo es
-- la copia versionada en git para que el historial de migraciones quede en el repo.

-- 1) Evita que un usuario autenticado se auto-promueva a administrador
--    (o cambie su rol/estado de plataforma) via PATCH directo a /rest/v1/profiles.
--    Antes de esto, la politica RLS "profiles update own" solo exigia
--    auth.uid() = id, sin restringir columnas, y authenticated/anon tenian
--    GRANT UPDATE sobre is_admin a nivel de Postgres: cualquiera que se
--    registrara podia hacer PATCH {"is_admin": true} sobre su propia fila y
--    obtener acceso total de administrador.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- El propio backend (service_role) y los administradores si pueden cambiar estos campos.
  if auth.role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  new.is_admin := old.is_admin;
  new.role_id := old.role_id;
  new.role_label := old.role_label;
  new.platform_status := old.platform_status;
  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields_trigger on public.profiles;
create trigger protect_profile_privileged_fields_trigger
  before update on public.profiles
  for each row
  execute function public.protect_profile_privileged_fields();

-- 2) Restringe el bucket de Storage "app-updates" (APKs de la app, lectura publica)
--    para que solo administradores puedan subir/editar/borrar archivos.
--    Antes, cualquier usuario autenticado (cualquiera que se registre) podia
--    hacerlo, lo que habria permitido distribuir un APK malicioso como
--    "actualizacion oficial".
drop policy if exists "Authenticated upload app-updates" on storage.objects;
create policy "Authenticated upload app-updates" on storage.objects
  for insert
  with check (bucket_id = 'app-updates' and public.is_admin());

drop policy if exists "Authenticated update app-updates" on storage.objects;
create policy "Authenticated update app-updates" on storage.objects
  for update
  using (bucket_id = 'app-updates' and public.is_admin())
  with check (bucket_id = 'app-updates' and public.is_admin());

drop policy if exists "Authenticated delete app-updates" on storage.objects;
create policy "Authenticated delete app-updates" on storage.objects
  for delete
  using (bucket_id = 'app-updates' and public.is_admin());

-- 3) Columna + indices de apoyo para rate-limiting en la Edge Function contact-form
--    (ver supabase/functions/contact-form/index.ts): limita envios repetidos por
--    IP y por email para evitar flood/spam y agotamiento de la cuota de Resend.
alter table public.contact_submissions add column if not exists client_ip text;
create index if not exists contact_submissions_ip_created_idx on public.contact_submissions (client_ip, created_at desc);
create index if not exists contact_submissions_email_created_idx on public.contact_submissions (email, created_at desc);
