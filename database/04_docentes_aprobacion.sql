do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.perfiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%rol%'
  loop
    execute format('alter table public.perfiles drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.perfiles
add constraint perfiles_rol_check
check (rol in ('admin','alumno','docente_pendiente'));

alter table public.perfiles
add column if not exists actualizado_en timestamp with time zone default now();

update public.perfiles
set activo = true
where rol = 'admin';
