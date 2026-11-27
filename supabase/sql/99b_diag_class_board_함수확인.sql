select
  count(*) as 전체,
  count(joined_on) as joined_on있음,
  count(left_on) as left_on있음,
  (select (public.admin_ops_stats()->'growth')) as growth;
