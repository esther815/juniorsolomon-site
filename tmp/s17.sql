-- 17. 앱 뼈대: 지점 · 역할 5단계(+지점장) · 수업 요일·시각 · 공지 · 학부모 요청
--  · 역할: 원장(admins) / 지점장(manager, 추후) / 관리자(desk) / 강사(teacher) / 학부모(parent) / 학생(student, 로그인 코드 단계에서 사용)
--  · 지점: 모든 반·학생·회원·요청·공지에 지점 꼬리표. 원장은 전 지점, 지점장·관리자는 자기 지점만.
--  · 다시 실행해도 안전합니다.

-- ── 지점 ───────────────────────────────────────────────
create table if not exists public.branches (
  id     text primary key check (id ~ '^[a-z0-9-]{2,20}$'),
  name   text not null,
  sort   int  not null default 0,
  active boolean not null default true
);
insert into public.branches(id, name, sort) values ('ichon', '이촌 본점', 1) on conflict (id) do nothing;
alter table public.branches enable row level security;
revoke all on public.branches from anon, authenticated;
grant select on public.branches to authenticated;
drop policy if exists "로그인 회원 읽기" on public.branches;
create policy "로그인 회원 읽기" on public.branches for select to authenticated using (true);

alter table public.profiles         add column if not exists branch_id text not null default 'ichon' references public.branches(id);
alter table public.me_classes       add column if not exists branch_id text not null default 'ichon' references public.branches(id);
alter table public.me_students      add column if not exists branch_id text not null default 'ichon' references public.branches(id);
alter table public.consult_requests add column if not exists branch_id text not null default 'ichon' references public.branches(id);
create index if not exists me_students_branch_idx on public.me_students(branch_id, status);
create index if not exists me_classes_branch_idx  on public.me_classes(branch_id) where active;
create index if not exists profiles_branch_idx    on public.profiles(branch_id, role, status);

-- ── 역할 ───────────────────────────────────────────────
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('parent','teacher','desk','manager','student'));

create or replace function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'manager' and status = 'approved');
$$;
create or replace function public.is_staff() returns boolean          -- 원장·지점장·관리자
language sql stable security definer set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.profiles where id = auth.uid() and role in ('desk','manager') and status = 'approved');
$$;
create or replace function public.my_branch() returns text
language sql stable security definer set search_path = public as $$
  select branch_id from public.profiles where id = auth.uid();
$$;
create or replace function public.can_branch(b text) returns boolean  -- 이 지점 자료를 다룰 수 있는가
language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_staff() and b is not distinct from public.my_branch());
$$;
revoke all on function public.is_manager(), public.is_staff(), public.my_branch(), public.can_branch(text) from public, anon;
grant execute on function public.is_manager(), public.is_staff(), public.my_branch(), public.can_branch(text) to authenticated;

-- 회원·자녀·상담 요청: 관리자·지점장은 자기 지점만
drop policy if exists "본인 또는 원장·데스크" on public.profiles;
create policy "본인 또는 원장·데스크" on public.profiles for select to authenticated
  using (id = auth.uid() or public.can_branch(branch_id));
drop policy if exists "본인 자녀 또는 원장·데스크" on public.children;
create policy "본인 자녀 또는 원장·데스크" on public.children for select to authenticated
  using (parent_id = auth.uid() or exists (select 1 from public.profiles p where p.id = parent_id and public.can_branch(p.branch_id)));
drop policy if exists "원장·데스크" on public.consult_requests;
create policy "원장·데스크" on public.consult_requests for all to authenticated
  using (public.can_branch(branch_id)) with check (public.can_branch(branch_id));

-- ── 수업 요일·시각 (메이크에듀 수업명 「… (월2:30)」에서 자동으로 읽음) ──
alter table public.me_classes add column if not exists weekday smallint check (weekday between 0 and 6);  -- 0=일 … 6=토
alter table public.me_classes add column if not exists starts  time;
alter table public.me_classes add column if not exists minutes smallint check (minutes between 30 and 240);

create or replace function public.js_class_slot(n text, out weekday smallint, out starts time)
language plpgsql immutable as $$
declare m text[]; h int;
begin
  m := regexp_match(coalesce(n,''), '\(\s*(일|월|화|수|목|금|토)\s*(\d{1,2})\s*[:시]\s*(\d{2})?');
  if m is null then return; end if;
  weekday := position(m[1] in '일월화수목금토') - 1;
  h := m[2]::int; if h between 1 and 8 then h := h + 12; end if;   -- 학원 수업은 오후 1~8시 → 13~20시
  if h > 23 then return; end if;
  starts := make_time(h, coalesce(m[3],'0')::int, 0);
end $$;

create or replace function public.me_classes_slot() returns trigger
language plpgsql as $$
declare s record;
begin
  if tg_op = 'INSERT' or new.name is distinct from old.name or new.weekday is null then
    select * into s from public.js_class_slot(coalesce(new.display_name, new.name));
    if s.weekday is null then select * into s from public.js_class_slot(new.name); end if;
    if s.weekday is not null then new.weekday := s.weekday; new.starts := s.starts; end if;
  end if;
  return new;
end $$;
drop trigger if exists me_classes_slot on public.me_classes;
create trigger me_classes_slot before insert or update on public.me_classes for each row execute function public.me_classes_slot();
update public.me_classes set weekday = null where weekday is null;   -- 기존 반에 요일·시각 채우기

-- ── 공지 ───────────────────────────────────────────────
create table if not exists public.notices (
  id         bigserial primary key,
  branch_id  text references public.branches(id),            -- 비어 있으면 전 지점
  audience   text not null default 'parents' check (audience in ('parents','staff','all')),
  title      text not null check (char_length(btrim(title)) between 1 and 80),
  body       text not null default '' check (char_length(body) <= 3000),
  pinned     boolean not null default false,
  author     text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists notices_recent_idx on public.notices(created_at desc);
create table if not exists public.notice_reads (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  notice_id bigint not null references public.notices(id) on delete cascade,
  read_at   timestamptz not null default now(),
  primary key (user_id, notice_id)
);
alter table public.notices enable row level security;
alter table public.notice_reads enable row level security;
revoke all on public.notices, public.notice_reads from anon, authenticated;   -- 아래 함수로만 읽고 씀

create or replace function public.my_notices() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; adm boolean := public.is_admin();
begin
  select * into p from profiles where id = auth.uid();
  if not found then return '[]'; end if;
  if not adm and p.status <> 'approved' then return '[]'; end if;
  return coalesce((select jsonb_agg(x order by x->>'pinned' desc, (x->>'created_at') desc) from (
    select jsonb_build_object('id', n.id, 'title', n.title, 'body', n.body, 'pinned', n.pinned, 'audience', n.audience,
             'branch', coalesce(b.name, '전 지점'), 'author', n.author, 'created_at', n.created_at,
             'read', exists (select 1 from notice_reads r where r.user_id = p.id and r.notice_id = n.id)) as x
      from notices n left join branches b on b.id = n.branch_id
     where n.created_at > now() - interval '180 days'
       and (adm or n.branch_id is null or n.branch_id = p.branch_id)
       and (adm or p.role in ('desk','manager')
            or (p.role = 'teacher' and n.audience in ('staff','all'))
            or (p.role in ('parent','student') and n.audience in ('parents','all')))
     order by n.created_at desc limit 60) t), '[]');
end $$;

create or replace function public.mark_notices_read(p_ids bigint[]) returns void
language sql security definer set search_path = public as $$
  insert into notice_reads(user_id, notice_id)
  select auth.uid(), i from unnest(p_ids) i where exists (select 1 from notices n where n.id = i)
  on conflict do nothing;
$$;

create or replace function public.post_notice(p_title text, p_body text, p_audience text default 'parents',
                                              p_branch text default null, p_pinned boolean default false) returns bigint
language plpgsql security definer set search_path = public as $$
declare v_b text := p_branch; v_id bigint; v_who text;
begin
  if not public.is_staff() then raise exception '공지는 원장·지점장·관리자만 올릴 수 있습니다'; end if;
  if not public.is_admin() then v_b := public.my_branch(); end if;              -- 지점장·관리자는 자기 지점에만
  if v_b is not null and not exists (select 1 from branches where id = v_b) then raise exception '없는 지점입니다'; end if;
  if p_audience not in ('parents','staff','all') then raise exception '받는 대상을 골라 주세요'; end if;
  select case when public.is_admin() then '원장' when role = 'manager' then '지점장' else '관리자' end into v_who from profiles where id = auth.uid();
  insert into notices(branch_id, audience, title, body, pinned, author)
  values (v_b, p_audience, btrim(p_title), coalesce(p_body,''), coalesce(p_pinned,false), coalesce(v_who,'원장'))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.delete_notice(p_id bigint) returns void
language plpgsql security definer set search_path = public as $$
declare v_b text;
begin
  select branch_id into v_b from notices where id = p_id;
  if not found then return; end if;
  if not (public.is_admin() or (v_b is not null and public.can_branch(v_b))) then raise exception '지울 권한이 없습니다'; end if;
  delete from notices where id = p_id;
end $$;

-- ── 학부모 요청: 상담 신청 · 결석 알림 · 보강 문의 ────────────────
create table if not exists public.parent_requests (
  id         bigserial primary key,
  branch_id  text not null default 'ichon' references public.branches(id),
  parent_id  uuid references public.profiles(id) on delete cascade,
  child_id   uuid references public.children(id) on delete set null,
  child_name text,
  kind       text not null check (kind in ('상담 신청','결석 알림','보강 문의')),
  to_whom    text not null check (to_whom in ('담임','원장','관리자')),
  teacher    text,
  method     text check (method in ('전화','카톡','방문')),
  wish_day   date,
  memo       text check (char_length(memo) <= 1000),
  status     text not null default '접수' check (status in ('접수','확인','완료')),
  created_at timestamptz not null default now(),
  handled_at timestamptz
);
create index if not exists parent_requests_recent_idx on public.parent_requests(branch_id, created_at desc);
alter table public.parent_requests enable row level security;
revoke all on public.parent_requests from anon, authenticated;

create or replace function public.parent_request(p_child uuid, p_kind text, p_to text, p_method text, p_day date, p_memo text) returns bigint
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; c public.children%rowtype; v_t text; v_id bigint; v_n int;
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' or p.status <> 'approved' then raise exception '승인된 학부모만 보낼 수 있습니다'; end if;
  select * into c from children where id = p_child and parent_id = p.id and status = 'approved';
  if not found then raise exception '자녀를 골라 주세요'; end if;
  select count(*) into v_n from parent_requests where parent_id = p.id and created_at > now() - interval '1 day';
  if v_n >= 10 then raise exception '오늘은 더 보낼 수 없습니다. 학원(02-794-8123)으로 연락 주세요'; end if;
  select case when k.name like '%원장%' then '원장' else k.teacher end into v_t from me_enrollments e join me_classes k on k.me_id = e.class_id and k.active
   where e.student_id = c.me_student_id order by k.weekday nulls last limit 1;
  insert into parent_requests(branch_id, parent_id, child_id, child_name, kind, to_whom, teacher, method, wish_day, memo)
  values (p.branch_id, p.id, c.id, c.name, p_kind, p_to, v_t, nullif(p_method,''), p_day, left(btrim(coalesce(p_memo,'')),1000))
  returning id into v_id;
  -- 학부모 요청은 받는 사람이 누구든 원장에게도 알림
  perform public.notify_admin('[주니어솔로몬] 앱 ' || p_kind || ' → ' || case when p_to = '담임' then case when v_t = '원장' then '담임 원장' else coalesce(v_t,'담임') || ' 선생님' end else p_to end || chr(10) ||
                              c.name || coalesce(' · 희망 ' || to_char(p_day,'MM/DD'), '') || coalesce(' · ' || nullif(p_method,''), '') || chr(10) ||
                              left(coalesce(p_memo,''), 100));
  return v_id;
end $$;

create or replace function public.my_requests() returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'child', child_name, 'kind', kind, 'to', to_whom, 'teacher', teacher,
                  'method', method, 'day', wish_day, 'memo', memo, 'status', status, 'created_at', created_at) order by created_at desc), '[]')
    from (select * from parent_requests where parent_id = auth.uid() order by created_at desc limit 30) t;
$$;

-- 받은 요청: 원장 전체 · 지점장·관리자 자기 지점 · 강사는 자기 앞으로 온 것(학부모 연락처 없음)
create or replace function public.staff_requests() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; staff boolean := public.is_staff(); v_name text;
begin
  select * into p from profiles where id = auth.uid();
  if not staff and not (found and p.role = 'teacher' and p.status = 'approved') then return '[]'; end if;
  v_name := public.js_norm_name(p.teacher_name);
  return coalesce((select jsonb_agg(x order by (x->>'created_at') desc) from (
    select jsonb_build_object('id', r.id, 'child', r.child_name, 'kind', r.kind, 'to', r.to_whom, 'teacher', r.teacher,
             'method', r.method, 'day', r.wish_day, 'memo', r.memo, 'status', r.status, 'created_at', r.created_at,
             'branch', b.name, 'parent', case when staff then pp.nickname end, 'phone', case when staff then pp.phone end) as x
      from parent_requests r join branches b on b.id = r.branch_id left join profiles pp on pp.id = r.parent_id
     where r.created_at > now() - interval '120 days'
       and (case when staff then public.can_branch(r.branch_id)
                 else r.to_whom = '담임' and v_name <> '' and public.js_norm_name(r.teacher) = v_name end)
     order by r.created_at desc limit 80) t), '[]');
end $$;

create or replace function public.set_request_status(p_id bigint, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare r public.parent_requests%rowtype; p public.profiles%rowtype;
begin
  if p_status not in ('확인','완료') then raise exception '상태가 올바르지 않습니다'; end if;
  select * into r from parent_requests where id = p_id;
  if not found then return; end if;
  select * into p from profiles where id = auth.uid();
  if not (public.can_branch(r.branch_id)
          or (p.role = 'teacher' and p.status = 'approved' and r.to_whom = '담임'
              and public.js_norm_name(r.teacher) = public.js_norm_name(p.teacher_name) and public.js_norm_name(p.teacher_name) <> '')) then
    raise exception '처리할 권한이 없습니다';
  end if;
  update parent_requests set status = p_status, handled_at = now() where id = p_id;
end $$;

-- ── 학부모 화면: 자녀별 반·요일·시각·담임·출결(최근 120일) ──────────
create or replace function public.my_children() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; c record; s public.me_students%rowtype; v_classes jsonb; v_att jsonb; v_out jsonb := '[]';
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' then return '[]'; end if;
  for c in select * from children where parent_id = p.id and status = 'approved' order by created_at loop
    if c.me_student_id is null then
      v_out := v_out || jsonb_build_object('id', c.id, 'linked', false, 'name', c.name, 'solomon_no', c.student_no, 'grade', c.grade);
      continue;
    end if;
    select * into s from me_students where me_id = c.me_student_id;
    select coalesce(jsonb_agg(jsonb_build_object('id', k.me_id, 'name', coalesce(k.display_name, k.name), 'teacher', k.teacher,
                     'weekday', k.weekday, 'starts', to_char(k.starts,'HH24:MI'), 'minutes', k.minutes)
                     order by k.weekday nulls last, k.starts), '[]')
      into v_classes from me_enrollments e join me_classes k on k.me_id = e.class_id and k.active where e.student_id = s.me_id;
    select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status, 'class', a.class_id) order by a.day desc), '[]')
      into v_att from (select day, status, class_id from me_attendance
                        where student_id = s.me_id and day > current_date - 120 order by day desc limit 80) a;
    v_out := v_out || jsonb_build_object('id', c.id, 'linked', true, 'name', s.name, 'solomon_no', coalesce(s.solomon_no, c.student_no), 'status', s.status,
                                         'grade', s.grade, 'school', s.school, 'classes', v_classes, 'attendance', v_att);
  end loop;
  return v_out;
end $$;

-- ── 원장·지점장 현황: 지점별 한눈에 ────────────────────────────
create or replace function public.branch_overview() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare adm boolean := public.is_admin(); mb text := public.my_branch();
begin
  if not public.is_staff() then return '[]'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'id', b.id, 'name', b.name,
      'students', (select count(*) from me_students s where s.branch_id = b.id and s.status = '재원'),
      'paused',   (select count(*) from me_students s where s.branch_id = b.id and s.status = '휴원'),
      'classes',  (select count(*) from me_classes k where k.branch_id = b.id and k.active),
      'att_week', (select jsonb_build_object('present', count(*) filter (where a.status in ('출석','지각')), 'total', count(*))
                     from me_attendance a join me_students s on s.me_id = a.student_id
                    where s.branch_id = b.id and a.day > current_date - 7 and a.day <= current_date),
      'pending',  (select count(*) from profiles p where p.branch_id = b.id and p.status = 'pending' and p.phone is not null),
      'requests', (select count(*) from parent_requests r where r.branch_id = b.id and r.status = '접수'),
      'consults', (select count(*) from consult_requests q where q.branch_id = b.id and q.handled_at is null and q.created_at > now() - interval '30 days')
    ) order by b.sort, b.id)
    from branches b where b.active and (adm or b.id = mb)), '[]');
end $$;

revoke all on function public.js_class_slot(text), public.my_notices(), public.mark_notices_read(bigint[]), public.post_notice(text,text,text,text,boolean),
  public.delete_notice(bigint), public.parent_request(uuid,text,text,text,date,text), public.my_requests(), public.staff_requests(),
  public.set_request_status(bigint,text), public.my_children(), public.branch_overview() from public, anon;
grant execute on function public.my_notices(), public.mark_notices_read(bigint[]), public.post_notice(text,text,text,text,boolean),
  public.delete_notice(bigint), public.parent_request(uuid,text,text,text,date,text), public.my_requests(), public.staff_requests(),
  public.set_request_status(bigint,text), public.my_children(), public.branch_overview() to authenticated;

select (select count(*) from public.me_classes where weekday is not null) as 요일_읽은_반,
       (select count(*) from public.me_classes where active) as 전체_반, '앱 뼈대 준비 완료' as 결과;
