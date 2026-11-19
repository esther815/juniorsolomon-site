-- 04. 메이크에듀 자료 저장소 · 자리 단계 자동 계산 · 변동 기록
-- Supabase SQL Editor에서 한 번만 Run. 다시 실행해도 안전합니다.

-- ── 저장소 ──────────────────────────────────────────────
create table if not exists public.me_classes (
  me_id        text primary key,              -- 메이크에듀 수업 고유값 (엑셀 연동 때는 수업명)
  name         text not null,                 -- 메이크에듀 수업명
  display_name text,                          -- 새 반 이름 (과정 · 요일 시각)
  teacher      text,
  cap          int  check (cap is null or cap between 1 and 99),
  target       text,
  active       boolean not null default true,
  updated_at   timestamptz not null default now()
);

create table if not exists public.me_students (
  me_id          text primary key,            -- 메이크에듀 원생 고유번호
  name           text not null,
  school         text,
  grade          text,
  status         text not null check (status in ('재원','휴원','퇴원','미등록')),
  birth          date,
  guardian_phone text check (guardian_phone is null or guardian_phone ~ '^0[0-9]{8,10}$'),
  joined_on      date,
  left_on        date,
  seat_hold      boolean not null default false,  -- 휴원 중 선납해서 자리를 지키는 학생 (원장님이 표시)
  updated_at     timestamptz not null default now()
);
alter table public.me_students add column if not exists seat_hold boolean not null default false;

create table if not exists public.me_enrollments (
  class_id   text not null references public.me_classes(me_id) on delete cascade,
  student_id text not null references public.me_students(me_id) on delete cascade,
  primary key (class_id, student_id)
);

create table if not exists public.me_attendance (
  student_id text not null,
  class_id   text not null default '',
  day        date not null,
  status     text not null,                   -- 출석·지각·결석 등 메이크에듀 값 그대로
  checked_at timestamptz,
  primary key (student_id, day, class_id)
);

create table if not exists public.change_log (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  kind       text not null,                   -- 신규 / 상태 / 반 들어감 / 반 빠짐 / 자리 단계 / 새 반 / 반 없어짐
  student_id text,
  class_id   text,
  before     text,
  after      text,
  run_id     bigint
);
create index if not exists change_log_at on public.change_log (at desc);

create table if not exists public.sync_runs (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  source      text not null,                  -- api / excel
  ok          boolean not null,
  students    int, classes int, enrollments int, changes int,
  error       text
);

-- 모든 표: 잠금. 원장님만 읽기, 쓰기는 아래 함수로만.
alter table public.me_classes     enable row level security;
alter table public.me_students    enable row level security;
alter table public.me_enrollments enable row level security;
alter table public.me_attendance  enable row level security;
alter table public.change_log     enable row level security;
alter table public.sync_runs      enable row level security;
revoke all on public.me_classes, public.me_students, public.me_enrollments,
              public.me_attendance, public.change_log, public.sync_runs from anon, authenticated;
grant select on public.me_classes, public.me_students, public.me_enrollments,
                public.me_attendance, public.change_log, public.sync_runs to authenticated;
grant update (display_name, cap) on public.me_classes to authenticated;
grant update (seat_hold) on public.me_students to authenticated;

do $$ declare t text; begin
  foreach t in array array['me_classes','me_students','me_enrollments','me_attendance','change_log','sync_runs'] loop
    execute format('drop policy if exists "원장만 읽기" on public.%I', t);
    execute format('create policy "원장만 읽기" on public.%I for select to authenticated using (public.is_admin())', t);
  end loop;
end $$;
drop policy if exists "원장만 반 정보 수정" on public.me_classes;
create policy "원장만 반 정보 수정" on public.me_classes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "원장만 자리 유지 표시" on public.me_students;
create policy "원장만 자리 유지 표시" on public.me_students for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ── 자리 단계 계산 (정원의 60% 이상 = 마감 임박) ─────────────
create or replace function public.seat_stage(n int, cap int) returns text
language sql immutable as $$
  select case when cap is null or cap <= 0 then null
              when n >= cap then 'full'
              when n >= ceil(cap * 0.6) then 'soon'
              else 'ok' end
$$;

-- 반별 인원: 재원생 + 선납해서 자리를 지키는 휴원생. 선납하지 않은 휴원생 자리는 빈자리로 봅니다.
create or replace function public.class_counts()
returns table (class_id text, n int, stage text)
language sql stable security definer set search_path = public as $$
  select c.me_id, count(s.me_id)::int,
         public.seat_stage(count(s.me_id)::int, c.cap)
    from me_classes c
    left join me_enrollments e on e.class_id = c.me_id
    left join me_students s on s.me_id = e.student_id
          and (s.status = '재원' or (s.status = '휴원' and s.seat_hold))
   where c.active
   group by c.me_id, c.cap
$$;
revoke all on function public.class_counts() from public, anon, authenticated;

-- 홈페이지 상담 페이지에 보여 줄 반만 여기에 등록합니다(메이크에듀 수업명 기준).
-- 여기 없는 반(특강·1:1 등)은 홈페이지에 절대 나가지 않습니다.
create table if not exists public.site_classes (
  site_key text primary key,
  me_name  text not null unique
);
alter table public.site_classes enable row level security;
revoke all on public.site_classes from anon, authenticated;
grant select on public.site_classes to authenticated;
drop policy if exists "원장만 읽기" on public.site_classes;
create policy "원장만 읽기" on public.site_classes for select to authenticated using (public.is_admin());

insert into public.site_classes(site_key, me_name) values
 ('mon-1430-jang', '3학년 하브루타 독서토론_장화연T (월2:30)'),
 ('mon-1500-ha',   '56학년 하브루타 독서토론_하정빈T (월3:00)'),
 ('mon-1700-ha',   '3학년 하브루타 독서토론_하정빈T (월5:00)'),
 ('mon-1700-son',  '2학년 하브루타 독서토론_손수영T (월5:00)'),
 ('tue-1630-son',  '7세 하브루타 독서토론_손수영T (화4:30)'),
 ('tue-1630-jang', '3학년 하브루타 독서토론_장화연원장 (화4:30)'),
 ('wed-1400-ha',   '56학년 하브루타 톡서토론_하정빈T (수2:00)'),
 ('wed-1500-son',  '1학년 하브루타 독서토론_손수영T (수3:00)'),
 ('wed-1600-ha',   '4학년 하브루타 독서토론_하정빈T (수4:00)'),
 ('wed-1700-son',  '2학년 하브루타 독서토론_손수영T (수5:00)'),
 ('thu-1500-ha',   '56학년 하브루타 독서토론_하정빈T (목3:00)'),
 ('thu-1630-son',  '1학년_손수영T (목4:30)'),
 ('thu-1700-ha',   '4학년_하정빈T (목5:00)'),
 ('fri-1500-son',  '7세_손수영T (금3:00)'),
 ('sat-0900-ryu',  '7세_류다윤T (토9:00)'),
 ('sat-0900-ha',   '글쓰기반_하정빈T (토9:00)'),
 ('sat-1100-jang', '2학년_장화연원장 (토11:00)'),
 ('sat-1100-ha',   '56학년_하정빈T (토11:00)')
on conflict (site_key) do update set me_name = excluded.me_name;

-- 홈페이지용: 숫자 없이 단계만 내보냅니다.
create or replace function public.seat_status()
returns table (site_key text, stage text)
language sql stable security definer set search_path = public as $$
  select sc.site_key, k.stage
    from site_classes sc
    join me_classes c on c.name = sc.me_name and c.active
    join public.class_counts() k on k.class_id = c.me_id
   where k.stage is not null
$$;
revoke all on function public.seat_status() from public;
grant execute on function public.seat_status() to anon, authenticated;

-- 원장님 화면용: 반별 인원과 단계
create or replace function public.admin_class_board()
returns table (me_id text, name text, display_name text, teacher text, cap int, n int, stage text, site_key text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query
    select c.me_id, c.name, c.display_name, c.teacher, c.cap, k.n, k.stage, sc.site_key
      from me_classes c join public.class_counts() k on k.class_id = c.me_id
      left join site_classes sc on sc.me_name = c.name
     order by c.name;
end $$;
revoke all on function public.admin_class_board() from public, anon;
grant execute on function public.admin_class_board() to authenticated;

-- 홈페이지에 연결된 반 중 메이크에듀에서 이름이 바뀌었거나 없어진 반 (보고서용)
create or replace function public.site_unlinked() returns setof text
language sql stable security definer set search_path = public as $$
  select sc.me_name from site_classes sc
   where not exists (select 1 from me_classes c where c.name = sc.me_name and c.active)
$$;
revoke all on function public.site_unlinked() from public, anon;
grant execute on function public.site_unlinked() to authenticated;

-- ── 자료 받아 넣기 (엑셀·API 공통) ────────────────────────
-- p_students: [{me_id,name,school,grade,status,birth,guardian_phone,joined_on,left_on}]
--   status는 재원/휴원/퇴원. 휴원인데 반이 없으면 자동으로 '미등록'(상담 후 미등록)으로 바뀝니다.
-- p_classes:  [{me_id,name,teacher,cap,target}]
-- p_enrollments: [{class_id,student_id}]
create or replace function public.apply_snapshot(
  p_source text, p_students jsonb, p_classes jsonb, p_enrollments jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_run bigint; v_changes int := 0; v_n int;
begin
  if not (public.is_admin() or coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role','') = 'service_role'
          or current_user in ('postgres','service_role')) then
    raise exception 'not allowed';
  end if;
  if jsonb_array_length(coalesce(p_students,'[]')) = 0 then raise exception '원생 자료가 비어 있습니다'; end if;

  insert into sync_runs(source, ok) values (p_source, false) returning id into v_run;

  -- 이전 자리 단계
  create temp table _before on commit drop as select class_id, stage from public.class_counts();

  -- 받은 자료 정리
  create temp table _c on commit drop as
    select nullif(trim(x->>'me_id'),'') me_id, coalesce(nullif(trim(x->>'name'),''), x->>'me_id') name,
           nullif(trim(x->>'teacher'),'') teacher,
           case when (x->>'cap') ~ '^[0-9]+$' and (x->>'cap')::int between 1 and 99 then (x->>'cap')::int end cap,
           nullif(trim(x->>'target'),'') target
      from jsonb_array_elements(coalesce(p_classes,'[]')) x;
  delete from _c where me_id is null;

  create temp table _s on commit drop as
    select nullif(trim(x->>'me_id'),'') me_id,
           trim(regexp_replace(coalesce(x->>'name',''), '[0-9]{4}$', '')) name,
           nullif(trim(x->>'school'),'') school, nullif(trim(x->>'grade'),'') grade,
           case when x->>'status' in ('재원','휴원','퇴원') then x->>'status' else '퇴원' end status,
           case when (x->>'birth') ~ '^(19|20)[0-9]{2}-?(0[1-9]|1[0-2])-?(0[1-9]|[12][0-9]|3[01])$'
                then to_date(replace(x->>'birth','-',''),'YYYYMMDD') end birth,
           nullif(regexp_replace(coalesce(x->>'guardian_phone',''),'[^0-9]','','g'),'') guardian_phone,
           case when (x->>'joined_on') ~ '^[0-9]{8}$' then to_date(x->>'joined_on','YYYYMMDD') end joined_on,
           case when (x->>'left_on') ~ '^[0-9]{8}$' then to_date(x->>'left_on','YYYYMMDD') end left_on
      from jsonb_array_elements(p_students) x;
  delete from _s where me_id is null or name = '';
  update _s set birth = null where birth is not null and (birth >= current_date or birth < date '1990-01-01');
  update _s set guardian_phone = null where guardian_phone !~ '^0[0-9]{8,10}$';

  create temp table _e on commit drop as
    select distinct trim(x->>'class_id') class_id, trim(x->>'student_id') student_id
      from jsonb_array_elements(coalesce(p_enrollments,'[]')) x;
  -- 목록에 없는 반이 나오면 반을 만들어 둡니다(정원 미정).
  insert into _c(me_id, name) select distinct class_id, class_id from _e
   where class_id <> '' and class_id not in (select me_id from _c);
  delete from _e where student_id not in (select me_id from _s) or class_id = '';

  -- 상담 후 미등록: 휴원인데 반이 없는 학생
  update _s set status = '미등록'
   where status = '휴원' and not exists (select 1 from _e where _e.student_id = _s.me_id);

  -- 반: 새 반 기록, 넣기·고치기, 빠진 반은 비활성
  insert into change_log(kind, class_id, after, run_id)
    select '새 반', c.me_id, c.name, v_run from _c c where not exists (select 1 from me_classes m where m.me_id = c.me_id)
       and exists (select 1 from me_classes limit 1);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;
  insert into change_log(kind, class_id, before, run_id)
    select '반 없어짐', m.me_id, m.name, v_run from me_classes m where m.active and m.me_id not in (select me_id from _c);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  insert into me_classes(me_id, name, teacher, cap, target, active, updated_at)
    select me_id, name, teacher, cap, target, true, now() from _c
  on conflict (me_id) do update set name = excluded.name, teacher = excluded.teacher,
     cap = coalesce(excluded.cap, me_classes.cap), target = excluded.target, active = true, updated_at = now();
  update me_classes set active = false, updated_at = now() where active and me_id not in (select me_id from _c);

  -- 원생: 신규·상태 변동 기록 후 넣기
  insert into change_log(kind, student_id, after, run_id)
    select '신규', s.me_id, s.status, v_run from _s s
     where s.status in ('재원','휴원') and not exists (select 1 from me_students m where m.me_id = s.me_id)
       and exists (select 1 from me_students limit 1);          -- 첫 적재 때는 기록하지 않음
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;
  insert into change_log(kind, student_id, before, after, run_id)
    select '상태', s.me_id, m.status, s.status, v_run from _s s join me_students m on m.me_id = s.me_id
     where m.status <> s.status;
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  insert into me_students(me_id, name, school, grade, status, birth, guardian_phone, joined_on, left_on, updated_at)
    select me_id, name, school, grade, status, birth, guardian_phone, joined_on, left_on, now() from _s
  on conflict (me_id) do update set name = excluded.name, school = excluded.school, grade = excluded.grade,
     status = excluded.status, seat_hold = case when excluded.status = '휴원' then me_students.seat_hold else false end, birth = excluded.birth, guardian_phone = excluded.guardian_phone,
     joined_on = excluded.joined_on, left_on = excluded.left_on, updated_at = now();

  -- 수업별 원생: 받은 학생 기준으로 갈아 끼우며 들고 남을 기록
  insert into change_log(kind, student_id, class_id, run_id)
    select '반 빠짐', e.student_id, e.class_id, v_run from me_enrollments e
     where e.student_id in (select me_id from _s)
       and not exists (select 1 from _e n where n.class_id = e.class_id and n.student_id = e.student_id)
       and exists (select 1 from sync_runs r where r.ok);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;
  insert into change_log(kind, student_id, class_id, run_id)
    select '반 들어감', n.student_id, n.class_id, v_run from _e n
     where not exists (select 1 from me_enrollments e where e.class_id = n.class_id and e.student_id = n.student_id)
       and exists (select 1 from sync_runs r where r.ok);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  delete from me_enrollments e where e.student_id in (select me_id from _s)
     and not exists (select 1 from _e n where n.class_id = e.class_id and n.student_id = e.student_id);
  insert into me_enrollments(class_id, student_id) select class_id, student_id from _e on conflict do nothing;

  -- 자리 단계 변화
  insert into change_log(kind, class_id, before, after, run_id)
    select '자리 단계', a.class_id, b.stage, a.stage, v_run
      from public.class_counts() a join _before b on b.class_id = a.class_id
     where a.stage is distinct from b.stage;
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  update sync_runs set ok = true,
     students = (select count(*) from _s), classes = (select count(*) from _c),
     enrollments = (select count(*) from _e), changes = v_changes
   where id = v_run;
  return jsonb_build_object('run', v_run, 'students', (select count(*) from _s),
     'classes', (select count(*) from _c), 'enrollments', (select count(*) from _e), 'changes', v_changes);
end $$;
revoke all on function public.apply_snapshot(text, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.apply_snapshot(text, jsonb, jsonb, jsonb) to authenticated, service_role;

-- 출결 넣기 (API 연결 후 사용)
create or replace function public.apply_attendance(p_rows jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare v int;
begin
  if not (public.is_admin() or coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role','') = 'service_role'
          or current_user in ('postgres','service_role')) then raise exception 'not allowed'; end if;
  insert into me_attendance(student_id, class_id, day, status, checked_at)
    select trim(x->>'student_id'), coalesce(trim(x->>'class_id'),''), (x->>'day')::date, trim(x->>'status'),
           nullif(x->>'checked_at','')::timestamptz
      from jsonb_array_elements(p_rows) x
     where x->>'student_id' is not null and x->>'day' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  on conflict (student_id, day, class_id) do update set status = excluded.status, checked_at = excluded.checked_at;
  get diagnostics v = row_count; return v;
end $$;
revoke all on function public.apply_attendance(jsonb) from public, anon;
grant execute on function public.apply_attendance(jsonb) to authenticated, service_role;

-- 동기화 실패 기록 (연결 프로그램이 오류를 남길 때)
create or replace function public.log_sync_error(p_source text, p_error text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not (public.is_admin() or coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role','') = 'service_role'
          or current_user in ('postgres','service_role')) then raise exception 'not allowed'; end if;
  insert into sync_runs(source, ok, error) values (p_source, false, left(p_error, 2000));
end $$;
revoke all on function public.log_sync_error(text, text) from public, anon;
grant execute on function public.log_sync_error(text, text) to authenticated, service_role;

select '메이크에듀 저장소 준비 완료' as 결과;
