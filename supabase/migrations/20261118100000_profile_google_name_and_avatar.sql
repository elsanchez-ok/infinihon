-- Hasta ahora, el trigger que crea la fila en public.profiles al registrarse
-- solo leía las claves personalizadas 'firstName'/'lastName' que pone el
-- formulario de registro por correo+contraseña. El login con Google (vía
-- grant_type=id_token) puebla raw_user_meta_data con las claves normalizadas
-- de Supabase: 'name' / 'full_name' y 'avatar_url' — así que esos usuarios
-- quedaban con el perfil vacío y sin foto aunque Google sí las provee.
--
-- Esta migración:
--   1. Agrega la columna profiles.avatar_url.
--   2. Actualiza handle_new_user() para usar esas claves como respaldo
--      (separando el nombre completo en primer nombre / resto) cuando no
--      vengan las claves 'firstName'/'lastName' del registro propio.
--   3. Rellena (backfill) los perfiles YA creados antes de este fix que
--      iniciaron sesión con Google y quedaron con nombre/foto vacíos.

alter table public.profiles add column if not exists avatar_url text;

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
begin
  if google_full_name is not null then
    guess_first := split_part(google_full_name, ' ', 1);
    guess_last := nullif(trim(regexp_replace(google_full_name, '^\S+\s*', '')), '');
  end if;

  insert into public.profiles (id, email, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(meta->>'firstName', ''), nullif(meta->>'given_name', ''), guess_first, ''),
    coalesce(nullif(meta->>'lastName', ''), nullif(meta->>'family_name', ''), guess_last, ''),
    nullif(coalesce(meta->>'avatar_url', meta->>'picture'), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- Backfill: perfiles existentes sin nombre o sin foto, cuando auth.users sí
-- tiene esos datos (típicamente cuentas de Google creadas antes de este fix).
with google_meta as (
  select
    u.id,
    nullif(trim(coalesce(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', '')), '') as full_name,
    nullif(coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'), '') as avatar_url
  from auth.users u
)
update public.profiles p
set
  first_name = coalesce(nullif(p.first_name, ''), split_part(g.full_name, ' ', 1), p.first_name),
  last_name = coalesce(nullif(p.last_name, ''), nullif(trim(regexp_replace(g.full_name, '^\S+\s*', '')), ''), p.last_name),
  avatar_url = coalesce(p.avatar_url, g.avatar_url),
  updated_at = now()
from google_meta g
where g.id = p.id
  and g.full_name is not null
  and (nullif(p.first_name, '') is null or nullif(p.last_name, '') is null or p.avatar_url is null);
