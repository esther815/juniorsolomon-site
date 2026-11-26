select json_build_object(
  'ns_tables', (select json_agg(tablename order by tablename) from pg_tables where schemaname='public' and tablename like 'ns\_%'),
  'ns_triggers', (select json_agg(tgname order by tgname) from pg_trigger where tgname like 'ns_solomon%'),
  'solomon_enrolled', (select count(*) from public.ns_enrolled where site='solomon'),
  'solomon_subscribed', (select count(*) from public.ns_subscriptions where site='solomon' and is_on),
  'sophos_enrolled', (select count(*) from public.ns_enrolled where site='sophos')
) as result;
