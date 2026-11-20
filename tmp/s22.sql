-- 22. 원장 「숫자 기록」 — 하루 방문·가입·승인·탈퇴·상담
--  · 홈페이지 방문: 기기 번호 없이 하루 합계만 저장(페이지별 조회수·그날 첫 방문 수). 개인을 알아볼 수 있는 값은 받지 않음
--  · 가입·승인·탈퇴: 회원 기록(account_log). 탈퇴해도 숫자는 남음
--  · 2년 지난 방문 기록은 자동 삭제

create table if not exists public.site_daily (
  day date not null default (now() at time zone 'Asia/Seoul')::date,
  page text not null check (page ~ '^[a-z0-9\-]{1,30}$'),
  views int not null default 0,
  visitors int not null default 0,
  app_views int not null default 0,
  primary key (day, page)
);
alter table public.site_daily enable row level security;
revoke all on public.site_daily from anon, authenticated;

create or replace function public.site_ping(p_page text, p_new boolean default false, p_app boolean default false) returns void
language plpgsql security definer set search_path = public as $$
declare v_day date := (now() at time zone 'Asia/Seoul')::date; v_page text := lower(coalesce(p_page,''));
begin
  if v_page !~ '^[a-z0-9\-]{1,30}$' then return; end if;
  if (select coalesce(sum(views),0) from site_daily where day = v_day) >= 200000 then return; end if;
  delete from site_daily where day < v_day - 730;
  insert into site_daily(day, page, views, visitors, app_views)
  values (v_day, v_page, 1, case when p_new then 1 else 0 end, case when p_app then 1 else 0 end)
  on conflict (day, page) do update set views = site_daily.views + 1,
     visitors = site_daily.visitors + case when p_new then 1 else 0 end,
     app_views = site_daily.app_views + case when p_app then 1 else 0 end;
end $$;
revoke all on function public.site_ping(text, boolean, boolean) from public;
grant execute on function public.site_ping(text, boolean, boolean) to anon, authenticated;

-- 회원 기록
create table if not exists public.account_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  kind text not null check (kind in ('가입','승인','탈퇴')),
  role text,
  uid uuid,
  enrolled boolean
);
create index if not exists account_log_at_idx on public.account_log(at);
alter table public.account_log enable row level security;
revoke all on public.account_log from anon, authenticated;

-- 재원(휴원 포함) 자녀가 연결된 학부모인가
create or replace function public.is_enrolled_parent(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from children c join me_students s on s.me_id = c.me_student_id
                  where c.parent_id = p and c.status = 'approved' and s.status in ('재원','휴원'))
      or exists (select 1 from profiles pr join me_students s on s.me_id = pr.me_student_id
                  where pr.id = p and s.status in ('재원','휴원'));
$$;
revoke all on function public.is_enrolled_parent(uuid) from public, anon, authenticated;

create or replace function public.log_profile_events() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into account_log(kind, role, uid) values ('가입', new.role, new.id);
  elsif new.status = 'approved' and old.status is distinct from 'approved' then
    insert into account_log(kind, role, uid) values ('승인', new.role, new.id);
  end if;
  return new;
end $$;
drop trigger if exists profiles_log on public.profiles;
create trigger profiles_log after insert or update of status on public.profiles
  for each row execute function public.log_profile_events();

-- 기존 회원은 가입일로 한 번 채움
insert into public.account_log(at, kind, role, uid)
select p.created_at, '가입', p.role, p.id from public.profiles p
 where not exists (select 1 from public.account_log l where l.uid = p.id and l.kind = '가입');

-- 탈퇴: 숫자만 남기고 지움
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare v uuid := auth.uid(); v_role text; v_enr boolean;
begin
  if v is null then raise exception 'not signed in'; end if;
  if public.is_admin() then raise exception '원장 계정은 앱에서 탈퇴할 수 없습니다'; end if;
  select role into v_role from profiles where id = v;
  v_enr := public.is_enrolled_parent(v);
  insert into account_log(kind, role, uid, enrolled) values ('탈퇴', v_role, null, v_enr);
  update account_log set uid = null where uid = v;
  delete from public.children where parent_id = v;
  delete from public.profiles where id = v;
  delete from auth.users where id = v;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 원장 화면: 최근 N일 숫자
create or replace function public.admin_daily_stats(p_days int default 14) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_today date := (now() at time zone 'Asia/Seoul')::date; v_from date; v_days jsonb; v_tot jsonb;
begin
  if not public.is_admin() then raise exception '원장만 볼 수 있습니다'; end if;
  v_from := v_today - (least(greatest(coalesce(p_days,14),1),90) - 1);
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', d::date,
      'visitors', (select coalesce(sum(visitors),0) from site_daily where day = d),
      'views',    (select coalesce(sum(views),0) from site_daily where day = d),
      'app',      (select count(*) from app_opens where day = d),
      'join_parent',  (select count(*) from account_log where kind='가입' and role='parent'  and (at at time zone 'Asia/Seoul')::date = d),
      'join_staff',   (select count(*) from account_log where kind='가입' and role<>'parent' and (at at time zone 'Asia/Seoul')::date = d),
      'ok_enrolled',  (select count(*) from account_log l where kind='승인' and role='parent' and (at at time zone 'Asia/Seoul')::date = d
                          and l.uid is not null and public.is_enrolled_parent(l.uid)),
      'ok_other',     (select count(*) from account_log l where kind='승인' and role='parent' and (at at time zone 'Asia/Seoul')::date = d
                          and (l.uid is null or not public.is_enrolled_parent(l.uid))),
      'ok_staff',     (select count(*) from account_log where kind='승인' and role<>'parent' and (at at time zone 'Asia/Seoul')::date = d),
      'out_enrolled', (select count(*) from account_log where kind='탈퇴' and enrolled and (at at time zone 'Asia/Seoul')::date = d),
      'out_other',    (select count(*) from account_log where kind='탈퇴' and not coalesce(enrolled,false) and (at at time zone 'Asia/Seoul')::date = d),
      'consult',      (select count(*) from consult_requests where kind in ('form','tel','sms','kakao') and (created_at at time zone 'Asia/Seoul')::date = d),
      'wait',         (select count(*) from consult_requests where kind = 'wait' and (created_at at time zone 'Asia/Seoul')::date = d),
      'beta',         (select count(*) from beta_signups where (created_at at time zone 'Asia/Seoul')::date = d)
    ) order by d desc), '[]')
    into v_days
    from generate_series(v_from, v_today, interval '1 day') d;

  select jsonb_build_object(
      'students',         (select count(*) from me_students where status = '재원'),
      'students_linked',  (select count(distinct s.me_id) from me_students s
                            where s.status = '재원' and (exists (select 1 from children c where c.me_student_id = s.me_id and c.status = 'approved')
                                                      or exists (select 1 from profiles p where p.me_student_id = s.me_id and p.status = 'approved'))),
      'parents',          (select count(*) from profiles where role = 'parent' and status = 'approved'),
      'parents_enrolled', (select count(*) from profiles p where role = 'parent' and status = 'approved' and public.is_enrolled_parent(p.id)),
      'teachers',         (select count(*) from profiles where role = 'teacher' and status = 'approved'),
      'pending',          (select count(*) from profiles where status = 'pending'),
      'out_total',        (select count(*) from account_log where kind = '탈퇴'),
      'pages',            (select coalesce(jsonb_agg(jsonb_build_object('page', page, 'views', v) order by v desc), '[]')
                             from (select page, sum(views) v from site_daily where day >= v_from group by page order by 2 desc limit 8) x)
    ) into v_tot;
  return jsonb_build_object('days', v_days, 'totals', v_tot);
end $$;
revoke all on function public.admin_daily_stats(int) from public, anon;
grant execute on function public.admin_daily_stats(int) to authenticated;
