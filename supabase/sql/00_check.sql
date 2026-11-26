select json_build_object(
  'profiles_cols', (select json_agg(column_name order by column_name) from information_schema.columns where table_schema='public' and table_name='profiles' and column_name in ('id','status','role','phone')),
  'children_cols', (select json_agg(column_name order by column_name) from information_schema.columns where table_schema='public' and table_name='children' and column_name in ('parent_id','status')),
  'is_admin', exists(select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='is_admin'),
  'ns_tables', (select json_agg(tablename order by tablename) from pg_tables where schemaname='public' and tablename like 'ns\_%'),
  'ns_funcs', (select json_agg(distinct p.proname) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'ns\_%'),
  'ns_triggers', (select json_agg(tgname) from pg_trigger where tgname like 'ns_solomon%'),
  'profile_roles', (select json_agg(distinct coalesce(role::text,'(없음)')) from public.profiles),
  'profile_status', (select json_agg(distinct status::text) from public.profiles),
  'child_status', (select json_agg(distinct status::text) from public.children)
) as result;
