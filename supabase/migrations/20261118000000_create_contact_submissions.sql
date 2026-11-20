create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  interest text,
  message text not null,
  source text not null default 'landing',
  emailed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

comment on table public.contact_submissions is 'Envios del formulario de contacto (/contacto). Solo accesible via service_role desde la Edge Function contact-form; sin politicas publicas de lectura/escritura.';
