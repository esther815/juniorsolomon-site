select
  count(*) as 전체,
  count(joined_on) as joined_on있음,
  count(left_on) as left_on있음,
  count(*) filter (where status='재원') as 재원,
  count(*) filter (where status='휴원') as 휴원,
  count(*) filter (where status='퇴원') as 퇴원,
  count(*) filter (where joined_on >= date_trunc('month', now() at time zone 'Asia/Seoul')::date) as 이번달가입,
  count(*) filter (where left_on >= date_trunc('month', now() at time zone 'Asia/Seoul')::date) as 이번달퇴원,
  max(joined_on) as 최근joined_on,
  max(left_on) as 최근left_on
from me_students;
