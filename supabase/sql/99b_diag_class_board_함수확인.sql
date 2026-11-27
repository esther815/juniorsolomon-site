select
  (select count(*) from me_students) as 전체,
  (select count(joined_on) from me_students) as joined_on있음,
  (select count(left_on) from me_students) as left_on있음,
  (select (public.admin_ops_stats()->'growth')) as growth;
