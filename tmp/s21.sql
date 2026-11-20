-- 21. 퇴원·휴원 학부모 화면 · 대기 명단 · 보강권·보강 달력
--  A. 학부모 화면: 재원 = 전부 / 휴원 = 공지만 / 퇴원·미등록만 남으면 닫힘
--  B. 대기 명단: 반마다 대기 3명까지, 다 차면 홈페이지에 「대기 마감」
--  C. 보강: 결석 사유가 병결·학교 행사·학원 사정이면 보강권 → 강사가 연 보강 시간에 학부모가 신청 → 강사가 출석 체크

-- ═════════ A. 퇴원·휴원 ═════════
create or replace function public.children_of(p_parent uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c record; s public.me_students%rowtype; v_classes jsonb; v_att jsonb; v_out jsonb := '[]';
begin
  for c in select * from children where parent_id = p_parent and status = 'approved' order by created_at loop
    if c.me_student_id is null then
      v_out := v_out || jsonb_build_object('id', c.id, 'linked', false, 'name', c.name, 'solomon_no', c.student_no, 'grade', c.grade, 'access', 'open');
      continue;
    end if;
    select * into s from me_students where me_id = c.me_student_id;
    if not found or s.status in ('퇴원','미등록') then
      v_out := v_out || jsonb_build_object('id', c.id, 'linked', true, 'name', coalesce(s.name, c.name), 'status', '퇴원', 'access', 'closed');
      continue;
    end if;
    if s.status = '휴원' then
      v_out := v_out || jsonb_build_object('id', c.id, 'linked', true, 'name', s.name, 'solomon_no', coalesce(s.solomon_no, c.student_no),
                                           'status', '휴원', 'grade', s.grade, 'school', s.school, 'access', 'paused');
      continue;
    end if;
    select coalesce(jsonb_agg(jsonb_build_object('id', k.me_id, 'name', coalesce(k.display_name, k.name), 'teacher', k.teacher,
                     'weekday', k.weekday, 'starts', to_char(k.starts,'HH24:MI'), 'minutes', k.minutes)
                     order by k.weekday nulls last, k.starts), '[]')
      into v_classes from me_enrollments e join me_classes k on k.me_id = e.class_id and k.active where e.student_id = s.me_id;
    select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status, 'class', a.class_id) order by a.day desc), '[]')
      into v_att from (select day, status, class_id from me_attendance
                        where student_id = s.me_id and day > current_date - 120 order by day desc limit 80) a;
    v_out := v_out || jsonb_build_object('id', c.id, 'linked', true, 'name', s.name, 'solomon_no', coalesce(s.solomon_no, c.student_no), 'status', s.status,
                                         'grade', s.grade, 'school', s.school, 'classes', v_classes, 'attendance', v_att, 'access', 'open');
  end loop;
  return v_out;
end $$;

-- 학부모 상태: open(재원·연결 대기 자녀가 있음) / paused(휴원만) / closed(퇴원·미등록만)
create or replace function public.parent_access(p_parent uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when not exists (select 1 from children c where c.parent_id = p_parent and c.status = 'approved') then 'open'
    when exists (select 1 from children c left join me_students s on s.me_id = c.me_student_id
                  where c.parent_id = p_parent and c.status = 'approved' and (c.me_student_id is null or s.status = '재원')) then 'open'
    when exists (select 1 from children c join me_students s on s.me_id = c.me_student_id
                  where c.parent_id = p_parent and c.status = 'approved' and s.status = '휴원') then 'paused'
    else 'closed' end
$$;
revoke all on function public.children_of(uuid), public.parent_access(uuid) from public, anon, authenticated;

create or replace function public.my_children() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype;
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' then return '[]'; end if;
  return public.children_of(p.id);
end $$;

create or replace function public.admin_preview_children(p_parent uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception '원장만 볼 수 있습니다'; end if;
  return public.children_of(p_parent);
end $$;

-- 퇴원만 남은 학부모는 공지도 닫음
create or replace function public.my_notices() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; adm boolean := public.is_admin();
begin
  select * into p from profiles where id = auth.uid();
  if not found then return '[]'; end if;
  if not adm and p.status <> 'approved' then return '[]'; end if;
  if p.role = 'parent' and public.parent_access(p.id) = 'closed' then return '[]'; end if;
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

-- 휴원·퇴원 자녀로는 신청을 보내지 않음
create or replace function public.parent_request(p_child uuid, p_kind text, p_to text, p_method text, p_day date, p_memo text) returns bigint
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; c public.children%rowtype; v_t text; v_id bigint; v_n int; v_st text;
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' or p.status <> 'approved' then raise exception '승인된 학부모만 보낼 수 있습니다'; end if;
  select * into c from children where id = p_child and parent_id = p.id and status = 'approved';
  if not found then raise exception '자녀를 골라 주세요'; end if;
  if c.me_student_id is not null then
    select status into v_st from me_students where me_id = c.me_student_id;
    if coalesce(v_st,'퇴원') <> '재원' then raise exception '휴원·퇴원 중에는 앱으로 보낼 수 없습니다. 학원(02-794-8123)으로 연락 주세요'; end if;
  end if;
  select count(*) into v_n from parent_requests where parent_id = p.id and created_at > now() - interval '1 day';
  if v_n >= 10 then raise exception '오늘은 더 보낼 수 없습니다. 학원(02-794-8123)으로 연락 주세요'; end if;
  select case when k.name like '%원장%' then '원장' else k.teacher end into v_t from me_enrollments e join me_classes k on k.me_id = e.class_id and k.active
   where e.student_id = c.me_student_id order by k.weekday nulls last limit 1;
  insert into parent_requests(branch_id, parent_id, child_id, child_name, kind, to_whom, teacher, method, wish_day, memo)
  values (p.branch_id, p.id, c.id, c.name, p_kind, p_to, v_t, nullif(p_method,''), p_day, left(btrim(coalesce(p_memo,'')),1000))
  returning id into v_id;
  perform public.notify_admin('[주니어솔로몬] 앱 ' || p_kind || ' → ' || case when p_to = '담임' then case when v_t = '원장' then '담임 원장' else coalesce(v_t,'담임') || ' 선생님' end else p_to end || chr(10) ||
                              c.name || coalesce(' · 희망 ' || to_char(p_day,'MM/DD'), '') || coalesce(' · ' || nullif(p_method,''), '') || chr(10) ||
                              left(coalesce(p_memo,''), 100));
  return v_id;
end $$;

-- ═════════ B. 대기 명단 ═════════
create table if not exists public.waitlist (
  id            bigserial primary key,
  branch_id     text not null default 'ichon' references public.branches(id),
  site_key      text,
  class_id      text,
  class_label   text not null check (char_length(class_label) <= 80),
  child_name    text not null check (char_length(child_name) between 1 and 40),
  grade         text check (char_length(grade) <= 20),
  guardian_name text check (char_length(guardian_name) <= 40),
  phone         text check (phone is null or phone ~ '^0[0-9]{8,10}$'),
  source        text not null default '원장' check (source in ('홈페이지','전화','카톡','방문','원장')),
  memo          text check (char_length(memo) <= 300),
  status        text not null default '대기' check (status in ('대기','연락함','등록','취소')),
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  handled_at    timestamptz
);
create index if not exists waitlist_site_idx on public.waitlist(site_key, status);
create index if not exists waitlist_class_idx on public.waitlist(class_id, status);
create index if not exists waitlist_branch_idx on public.waitlist(branch_id, created_at desc);
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;

create or replace function public.wait_cap() returns int language sql immutable as $$ select 3 $$;

-- 반의 활성 대기 수(대기·연락함)
create or replace function public.wait_count(p_site text, p_class text) returns int
language sql stable security definer set search_path = public as $$
  select count(*)::int from waitlist w
   where w.status in ('대기','연락함')
     and ((p_site is not null and w.site_key = p_site) or (p_class is not null and w.class_id = p_class))
$$;
revoke all on function public.wait_count(text,text), public.wait_cap() from public, anon, authenticated;

-- 홈페이지 자리 단계: full 이고 대기 3명이 차면 waitfull(대기 마감)
create or replace function public.seat_status() returns table(site_key text, stage text)
language sql stable security definer set search_path = public as $$
  select sc.site_key,
         case when k.stage = 'full' and public.wait_count(sc.site_key, c.me_id) >= public.wait_cap() then 'waitfull' else k.stage end
    from site_classes sc
    join me_classes c on c.name = sc.me_name and c.active
    join public.class_counts() k on k.class_id = c.me_id
   where k.stage is not null
$$;
revoke all on function public.seat_status() from public;
grant execute on function public.seat_status() to anon, authenticated;

-- 홈페이지 상담·대기 신청: 대기 신청이면 대기 명단에 자동으로 올림(3명까지)
drop function if exists public.consult_ping(text, text, text, text, text);
create or replace function public.consult_ping(p_kind text, p_wish text default null, p_name text default null, p_phone text default null,
                                               p_page text default null, p_key text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_phone text; v_label text; v_recent int; v_msg text; v_class text; v_wait text := '';
begin
  if p_kind not in ('form','wait','tel','sms','kakao') then return 'bad'; end if;
  delete from consult_requests where created_at < now() - interval '1 year';   -- 보유 기간 1년
  select count(*) into v_recent from consult_requests where created_at > now() - interval '1 hour';
  if v_recent >= 40 then return 'busy'; end if;
  v_phone := nullif(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), '');
  if p_kind in ('form','wait') then
    if coalesce(btrim(p_name),'') = '' or v_phone !~ '^0[0-9]{8,10}$' then return 'bad'; end if;
    if exists (select 1 from consult_requests where phone = v_phone and coalesce(wish,'') = coalesce(left(p_wish,200),'') and created_at > now() - interval '10 minutes') then return 'dup'; end if;
  end if;
  insert into consult_requests(kind, wish, guardian_name, phone, page)
  values (p_kind, left(p_wish,200), left(btrim(p_name),40), case when p_kind in ('form','wait') then v_phone end, left(p_page,40));

  if p_kind = 'wait' and p_key is not null and exists (select 1 from site_classes where site_key = p_key) then
    select c.me_id into v_class from site_classes sc join me_classes c on c.name = sc.me_name and c.active where sc.site_key = p_key limit 1;
    if public.wait_count(p_key, v_class) >= public.wait_cap() then
      v_wait := chr(10) || '※ 이 반 대기 ' || public.wait_cap() || '명이 이미 차서 대기 명단에는 넣지 않았습니다';
    elsif not exists (select 1 from waitlist where phone = v_phone and site_key = p_key and status in ('대기','연락함')) then
      insert into waitlist(site_key, class_id, class_label, child_name, guardian_name, phone, source)
      values (p_key, v_class, left(coalesce(p_wish,'홈페이지 대기'),80), '상담 때 확인', left(btrim(p_name),40), v_phone, '홈페이지');
      v_wait := chr(10) || '대기 명단에 올렸습니다 (' || public.wait_count(p_key, v_class) || '/' || public.wait_cap() || ')';
    end if;
  end if;

  v_label := case p_kind when 'form' then '상담 신청' when 'wait' then '대기 신청'
                         when 'tel' then '전화 상담 버튼' when 'sms' then '문자·카톡(010-3212-8123) 버튼'
                         else '카카오톡 채널 상담 버튼' end;
  if p_kind in ('form','wait') then
    v_msg := '[주니어솔로몬] 홈페이지 ' || v_label || chr(10) || coalesce(left(p_wish,120),'') || chr(10) ||
             '보호자 ' || left(btrim(p_name),40) || ' · ' || regexp_replace(v_phone, '^(\d{3})(\d{3,4})(\d{4})$', '\1-\2-\3') || v_wait;
  else
    v_msg := '[주니어솔로몬] 학부모가 홈페이지에서 「' || v_label || '」을 눌렀습니다' ||
             case when coalesce(p_wish,'') <> '' then chr(10) || '보던 수업: ' || left(p_wish,120) else '' end ||
             chr(10) || '곧 연락이 올 수 있습니다.';
  end if;
  perform public.notify_admin(v_msg);
  return 'ok';
end $$;
revoke all on function public.consult_ping(text,text,text,text,text,text) from public;
grant execute on function public.consult_ping(text,text,text,text,text,text) to anon, authenticated;

-- 직원(원장·지점장·관리자) 대기 명단
create or replace function public.waitlist_board() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_staff() then raise exception '직원만 볼 수 있습니다'; end if;
  return jsonb_build_object(
    'cap', public.wait_cap(),
    'items', coalesce((select jsonb_agg(jsonb_build_object('id', w.id, 'class_id', w.class_id, 'site_key', w.site_key, 'class_label', w.class_label,
                 'class_name', coalesce(c.display_name, c.name), 'child', w.child_name, 'grade', w.grade, 'guardian', w.guardian_name,
                 'phone', w.phone, 'source', w.source, 'memo', w.memo, 'status', w.status, 'created_at', w.created_at) order by w.created_at)
               from waitlist w left join me_classes c on c.me_id = coalesce(w.class_id, (select k.me_id from site_classes s join me_classes k on k.name = s.me_name where s.site_key = w.site_key limit 1))
              where public.can_branch(w.branch_id) and (w.status in ('대기','연락함') or w.handled_at > now() - interval '30 days')), '[]'),
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.me_id, 'name', coalesce(c.display_name, c.name), 'stage', k.stage) order by c.name)
               from me_classes c join public.class_counts() k on k.class_id = c.me_id where c.active and public.can_branch(c.branch_id)), '[]'));
end $$;

create or replace function public.waitlist_add(p_class text, p_child text, p_grade text, p_guardian text, p_phone text, p_source text, p_memo text) returns bigint
language plpgsql security definer set search_path = public as $$
declare c public.me_classes%rowtype; v_site text; v_phone text; v_id bigint;
begin
  if not public.is_staff() then raise exception '직원만 넣을 수 있습니다'; end if;
  select * into c from me_classes where me_id = p_class and active;
  if not found or not public.can_branch(c.branch_id) then raise exception '반을 골라 주세요'; end if;
  if coalesce(btrim(p_child),'') = '' then raise exception '학생 이름을 적어 주세요'; end if;
  select site_key into v_site from site_classes where me_name = c.name limit 1;
  if public.wait_count(v_site, c.me_id) >= public.wait_cap() then raise exception '이 반은 대기 %명이 이미 찼습니다', public.wait_cap(); end if;
  v_phone := nullif(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), '');
  if v_phone is not null and v_phone !~ '^0[0-9]{8,10}$' then raise exception '연락처를 확인해 주세요'; end if;
  insert into waitlist(branch_id, site_key, class_id, class_label, child_name, grade, guardian_name, phone, source, memo, created_by)
  values (c.branch_id, v_site, c.me_id, left(coalesce(c.display_name, c.name),80), left(btrim(p_child),40), nullif(left(btrim(coalesce(p_grade,'')),20),''),
          nullif(left(btrim(coalesce(p_guardian,'')),40),''), v_phone, coalesce(nullif(p_source,''),'원장'), nullif(left(btrim(coalesce(p_memo,'')),300),''), auth.uid())
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.waitlist_set(p_id bigint, p_status text, p_class text default null) returns void
language plpgsql security definer set search_path = public as $$
declare w public.waitlist%rowtype; c public.me_classes%rowtype; v_site text;
begin
  if not public.is_staff() then raise exception '직원만 바꿀 수 있습니다'; end if;
  select * into w from waitlist where id = p_id;
  if not found or not public.can_branch(w.branch_id) then raise exception '대기 기록을 찾을 수 없습니다'; end if;
  if p_status not in ('대기','연락함','등록','취소') then raise exception '상태를 확인해 주세요'; end if;
  if p_class is not null and p_class <> coalesce(w.class_id,'') then        -- 반 옮기기
    select * into c from me_classes where me_id = p_class and active;
    if not found then raise exception '반을 골라 주세요'; end if;
    select site_key into v_site from site_classes where me_name = c.name limit 1;
    if public.wait_count(v_site, c.me_id) >= public.wait_cap() then raise exception '그 반은 대기 %명이 이미 찼습니다', public.wait_cap(); end if;
    update waitlist set class_id = c.me_id, site_key = v_site, class_label = left(coalesce(c.display_name, c.name),80) where id = p_id;
  end if;
  update waitlist set status = p_status, handled_at = case when p_status in ('등록','취소') then now() else handled_at end where id = p_id;
end $$;

revoke all on function public.waitlist_board(), public.waitlist_add(text,text,text,text,text,text,text), public.waitlist_set(bigint,text,text) from public, anon;
grant execute on function public.waitlist_board(), public.waitlist_add(text,text,text,text,text,text,text), public.waitlist_set(bigint,text,text) to authenticated;

-- ═════════ C. 보강권·보강 달력 ═════════
create table if not exists public.makeup_slots (
  id           bigserial primary key,
  branch_id    text not null default 'ichon' references public.branches(id),
  teacher_id   uuid references public.profiles(id) on delete set null,
  teacher_name text not null check (char_length(teacher_name) <= 30),
  day          date not null,
  starts       time not null,
  minutes      int not null default 90 check (minutes between 30 and 240),
  grades       text[] not null default '{}',                 -- 비어 있으면 학년 무관
  cap          int not null default 4 check (cap between 1 and 8),
  memo         text check (char_length(memo) <= 200),
  status       text not null default '대기' check (status in ('대기','열림','닫힘')),
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  decided_at   timestamptz
);
create index if not exists makeup_slots_day_idx on public.makeup_slots(branch_id, day);

create table if not exists public.makeup_tickets (
  id            bigserial primary key,
  branch_id     text not null default 'ichon' references public.branches(id),
  me_student_id text not null references public.me_students(me_id) on delete cascade,
  absent_day    date not null,
  class_id      text not null default '',
  reason        text not null check (reason in ('병결','학교 행사','학원 사정','기타 인정')),
  expires       date not null,
  status        text not null default '발급' check (status in ('발급','완료','취소')),
  request_id    bigint references public.parent_requests(id) on delete set null,
  memo          text check (char_length(memo) <= 200),
  issued_by     uuid references public.profiles(id) on delete set null,
  issued_at     timestamptz not null default now(),
  unique (me_student_id, absent_day, class_id)
);
create index if not exists makeup_tickets_student_idx on public.makeup_tickets(me_student_id, status);
create index if not exists makeup_tickets_branch_idx on public.makeup_tickets(branch_id, issued_at desc);

create table if not exists public.makeup_bookings (
  id          bigserial primary key,
  ticket_id   bigint not null references public.makeup_tickets(id) on delete cascade,
  slot_id     bigint not null references public.makeup_slots(id) on delete cascade,
  status      text not null default '신청' check (status in ('신청','출석','결석','취소')),
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  decided_at  timestamptz
);
create unique index if not exists makeup_one_active_booking on public.makeup_bookings(ticket_id) where status in ('신청','출석','결석');
create index if not exists makeup_bookings_slot_idx on public.makeup_bookings(slot_id, status);

alter table public.makeup_slots enable row level security;
alter table public.makeup_tickets enable row level security;
alter table public.makeup_bookings enable row level security;
revoke all on public.makeup_slots, public.makeup_tickets, public.makeup_bookings from anon, authenticated;

-- 보강 기한: 그 달 15일까지 결석 → 그 달 말일 / 16일 이후 결석 → 다음 달 말일 (학원 규약)
create or replace function public.makeup_expiry(d date) returns date language sql immutable as $$
  select case when extract(day from d) <= 15 then (date_trunc('month', d) + interval '1 month - 1 day')::date
              else (date_trunc('month', d) + interval '2 month - 1 day')::date end
$$;

-- 이 사람이 이 학생의 담임(또는 원장·관리자)인지
create or replace function public.can_handle_student(p_student text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; v_name text;
begin
  if public.is_staff() then
    return exists (select 1 from me_students s where s.me_id = p_student and public.can_branch(s.branch_id));
  end if;
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'teacher' or p.status <> 'approved' then return false; end if;
  v_name := public.js_norm_name(p.teacher_name);
  return v_name <> '' and exists (select 1 from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active
                                   where e.student_id = p_student and (public.js_norm_name(c.teacher) = v_name or position(v_name in c.name) > 0));
end $$;

-- 학년 표기 맞추기: 유치원7세·7세반·특수7 → 7세 / 초3·초등3 → 초3 / 중1 → 중1 / 고1 → 고1
create or replace function public.norm_grade(t text) returns text language sql immutable as $$
  select case
    when t is null then ''
    when t ~ '([0-9])\s*세' then (regexp_match(t, '([0-9])\s*세'))[1] || '세'
    when t ~ '^특수\s*[0-9]' then (regexp_match(t, '([0-9])'))[1] || '세'
    when t ~ '^초(등)?\s*[0-9]' then '초' || (regexp_match(t, '([0-9])'))[1]
    when t ~ '^중(등|학)?\s*[0-9]' then '중' || (regexp_match(t, '([0-9])'))[1]
    when t ~ '^고(등)?\s*[0-9]' then '고' || (regexp_match(t, '([0-9])'))[1]
    else btrim(t) end
$$;
create or replace function public.grade_fits(p_grades text[], p_grade text) returns boolean language sql immutable as $$
  select coalesce(array_length(p_grades,1),0) = 0 or public.norm_grade(p_grade) = any(p_grades)
$$;

revoke all on function public.makeup_expiry(date), public.can_handle_student(text), public.grade_fits(text[],text), public.norm_grade(text) from public, anon, authenticated;

-- 보강권 발급 (원장·관리자·담임)
create or replace function public.makeup_issue(p_student text, p_day date, p_reason text, p_class text default null, p_memo text default null, p_request bigint default null) returns bigint
language plpgsql security definer set search_path = public as $$
declare s public.me_students%rowtype; v_class text; v_id bigint;
begin
  if not public.can_handle_student(p_student) then raise exception '이 학생의 보강권을 발급할 권한이 없습니다'; end if;
  if p_reason not in ('병결','학교 행사','학원 사정','기타 인정') then raise exception '보강 사유는 병결·학교 행사·학원 사정·기타 인정만 됩니다'; end if;
  if p_day is null or p_day > current_date + 60 or p_day < current_date - 62 then raise exception '결석한 날을 확인해 주세요'; end if;
  select * into s from me_students where me_id = p_student;
  if not found or s.status <> '재원' then raise exception '재원생만 발급할 수 있습니다'; end if;
  v_class := coalesce(p_class, (select c.me_id from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active
                                  where e.student_id = p_student and c.weekday = extract(dow from p_day)::int limit 1), '');
  insert into makeup_tickets(branch_id, me_student_id, absent_day, class_id, reason, expires, request_id, memo, issued_by)
  values (s.branch_id, p_student, p_day, v_class, p_reason, public.makeup_expiry(p_day), p_request, nullif(left(btrim(coalesce(p_memo,'')),200),''), auth.uid())
  on conflict (me_student_id, absent_day, class_id) do update set status = case when makeup_tickets.status = '취소' then '발급' else makeup_tickets.status end
  returning id into v_id;
  if p_request is not null then update parent_requests set status = '완료', handled_at = now() where id = p_request; end if;
  return v_id;
end $$;

-- 학부모 결석 알림에서 바로 발급
create or replace function public.makeup_issue_from_request(p_request bigint) returns bigint
language plpgsql security definer set search_path = public as $$
declare r public.parent_requests%rowtype; v_student text; v_reason text;
begin
  select * into r from parent_requests where id = p_request;
  if not found or r.kind <> '결석 알림' then raise exception '결석 알림만 보강권으로 바꿀 수 있습니다'; end if;
  select me_student_id into v_student from children where id = r.child_id;
  if v_student is null then raise exception '원생 명부와 연결되지 않은 자녀입니다'; end if;
  v_reason := case when r.memo like '[사유: 병결]%' then '병결' when r.memo like '[사유: 학교 행사]%' then '학교 행사' else null end;
  if v_reason is null then raise exception '개인 사정·기타 결석은 보강하지 않습니다(학원 규약). 꼭 필요하면 「기타 인정」으로 직접 발급해 주세요'; end if;
  return public.makeup_issue(v_student, r.wish_day, v_reason, null, null, p_request);
end $$;

-- 학원 사정 휴강: 그 반 재원생 모두에게 발급
create or replace function public.makeup_issue_class(p_class text, p_day date, p_memo text default null) returns int
language plpgsql security definer set search_path = public as $$
declare v_n int := 0; s record;
begin
  if not public.is_staff() then raise exception '원장·관리자만 할 수 있습니다'; end if;
  for s in select st.me_id from me_enrollments e join me_students st on st.me_id = e.student_id and st.status = '재원' where e.class_id = p_class loop
    perform public.makeup_issue(s.me_id, p_day, '학원 사정', p_class, p_memo, null); v_n := v_n + 1;
  end loop;
  return v_n;
end $$;

create or replace function public.makeup_ticket_cancel(p_ticket bigint) returns void
language plpgsql security definer set search_path = public as $$
declare t public.makeup_tickets%rowtype;
begin
  select * into t from makeup_tickets where id = p_ticket;
  if not found or not public.can_handle_student(t.me_student_id) then raise exception '권한이 없습니다'; end if;
  if exists (select 1 from makeup_bookings where ticket_id = p_ticket and status in ('출석','결석')) then raise exception '이미 보강한 보강권은 취소할 수 없습니다'; end if;
  update makeup_bookings set status = '취소', decided_at = now() where ticket_id = p_ticket and status = '신청';
  update makeup_tickets set status = '취소' where id = p_ticket;
end $$;

-- 보강 시간 열기: 강사가 올리면 「대기」 → 원장·관리자가 열면 「열림」(원장·관리자가 올리면 바로 열림)
create or replace function public.makeup_slot_add(p_day date, p_starts time, p_minutes int, p_grades text[], p_cap int, p_memo text, p_teacher text default null) returns bigint
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; v_staff boolean := public.is_staff(); v_id bigint; v_name text;
begin
  select * into p from profiles where id = auth.uid();
  if not found or not (v_staff or (p.role = 'teacher' and p.status = 'approved')) then raise exception '선생님·원장·관리자만 열 수 있습니다'; end if;
  if p_day is null or p_day < current_date or p_day > current_date + 70 then raise exception '날짜를 확인해 주세요(오늘부터 10주 안)'; end if;
  if p_starts < time '09:00' or p_starts > time '21:00' then raise exception '시간을 확인해 주세요(오전 9시~오후 9시 시작)'; end if;
  v_name := case when v_staff then coalesce(nullif(btrim(p_teacher),''), p.teacher_name, '원장') else p.teacher_name end;
  if coalesce(btrim(v_name),'') = '' then raise exception '선생님 이름이 없습니다'; end if;
  insert into makeup_slots(branch_id, teacher_id, teacher_name, day, starts, minutes, grades, cap, memo, status, created_by, decided_at)
  values (p.branch_id, case when v_staff and nullif(btrim(p_teacher),'') is not null then (select id from profiles where role = 'teacher' and status = 'approved' and public.js_norm_name(teacher_name) = public.js_norm_name(p_teacher) limit 1) else p.id end,
          left(btrim(v_name),30), p_day, p_starts, coalesce(p_minutes,90), coalesce(p_grades,'{}'), coalesce(p_cap,4),
          nullif(left(btrim(coalesce(p_memo,'')),200),''), case when v_staff then '열림' else '대기' end, p.id, case when v_staff then now() end)
  returning id into v_id;
  if not v_staff then
    perform public.notify_admin('[주니어솔로몬] 보강 가능 시간 등록 — 확인해 열어 주세요' || chr(10) || v_name || ' 선생님 · ' || to_char(p_day,'MM/DD') || ' ' || to_char(p_starts,'HH24:MI'));
  end if;
  return v_id;
end $$;

create or replace function public.makeup_slot_set(p_slot bigint, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare s public.makeup_slots%rowtype; v_mine boolean;
begin
  select * into s from makeup_slots where id = p_slot;
  if not found then raise exception '보강 시간을 찾을 수 없습니다'; end if;
  v_mine := s.teacher_id = auth.uid();
  if not ((public.is_staff() and public.can_branch(s.branch_id)) or (v_mine and p_status = '닫힘')) then raise exception '권한이 없습니다'; end if;
  if p_status not in ('열림','닫힘') then raise exception '상태를 확인해 주세요'; end if;
  update makeup_slots set status = p_status, decided_at = now() where id = p_slot;
  if p_status = '닫힘' then                       -- 닫으면 신청한 보강권은 다시 쓸 수 있게
    update makeup_bookings set status = '취소', decided_at = now() where slot_id = p_slot and status = '신청';
  end if;
end $$;

-- 학부모: 내 자녀 보강권과 신청할 수 있는 보강 시간
create or replace function public.my_makeup() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; v_now timestamp := (now() at time zone 'Asia/Seoul');
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' or p.status <> 'approved' then return '[]'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object(
      'child_id', c.id, 'name', s.name, 'grade', s.grade,
      'tickets', coalesce((select jsonb_agg(jsonb_build_object(
          'id', t.id, 'absent_day', t.absent_day, 'reason', t.reason, 'expires', t.expires,
          'state', case when t.status = '완료' then '완료' when b.id is not null then '신청' when t.expires < current_date then '만료' else '발급' end,
          'booking', case when b.id is null then null else jsonb_build_object('id', b.id, 'status', b.status, 'day', ms.day, 'starts', to_char(ms.starts,'HH24:MI'),
                       'minutes', ms.minutes, 'teacher', ms.teacher_name) end,
          'slots', case when t.status = '발급' and b.id is null and t.expires >= current_date then coalesce((
              select jsonb_agg(jsonb_build_object('id', z.id, 'day', z.day, 'starts', to_char(z.starts,'HH24:MI'), 'minutes', z.minutes, 'teacher', z.teacher_name, 'memo', z.memo)
                               order by z.day, z.starts)
                from makeup_slots z
               where z.status = '열림' and z.branch_id = s.branch_id and z.day <= t.expires and (z.day + z.starts) > v_now + interval '3 hours'
                 and public.grade_fits(z.grades, s.grade)
                 and (select count(*) from makeup_bookings x where x.slot_id = z.id and x.status in ('신청','출석','결석')) < z.cap), '[]') else '[]' end
        ) order by t.absent_day desc)
        from makeup_tickets t
        left join makeup_bookings b on b.ticket_id = t.id and b.status in ('신청','출석','결석')
        left join makeup_slots ms on ms.id = b.slot_id
       where t.me_student_id = s.me_id and t.status <> '취소' and t.absent_day > current_date - 100), '[]')
    ) order by c.created_at)
    from children c join me_students s on s.me_id = c.me_student_id and s.status = '재원'
   where c.parent_id = p.id and c.status = 'approved'), '[]');
end $$;

create or replace function public.makeup_book(p_ticket bigint, p_slot bigint) returns bigint
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; t public.makeup_tickets%rowtype; s public.me_students%rowtype; z public.makeup_slots%rowtype; v_n int; v_id bigint;
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' or p.status <> 'approved' then raise exception '승인된 학부모만 신청할 수 있습니다'; end if;
  select * into t from makeup_tickets where id = p_ticket and status = '발급';
  if not found or not exists (select 1 from children c where c.parent_id = p.id and c.status = 'approved' and c.me_student_id = t.me_student_id) then raise exception '보강권을 찾을 수 없습니다'; end if;
  if t.expires < current_date then raise exception '보강 기한(%)이 지났습니다. 담임 선생님과 상의해 주세요', to_char(t.expires,'MM/DD'); end if;
  if exists (select 1 from makeup_bookings where ticket_id = t.id and status in ('신청','출석','결석')) then raise exception '이미 신청한 보강권입니다'; end if;
  select * into s from me_students where me_id = t.me_student_id;
  select * into z from makeup_slots where id = p_slot for update;        -- 동시에 눌러도 정원을 넘지 않게
  if not found or z.status <> '열림' or z.branch_id <> s.branch_id then raise exception '신청할 수 없는 보강 시간입니다'; end if;
  if z.day > t.expires then raise exception '보강 기한(%) 안의 날짜만 고를 수 있습니다', to_char(t.expires,'MM/DD'); end if;
  if (z.day + z.starts) <= (now() at time zone 'Asia/Seoul') + interval '3 hours' then raise exception '시작 3시간 전까지만 신청할 수 있습니다'; end if;
  if not public.grade_fits(z.grades, s.grade) then raise exception '학년이 맞지 않는 보강 시간입니다'; end if;
  select count(*) into v_n from makeup_bookings where slot_id = z.id and status in ('신청','출석','결석');
  if v_n >= z.cap then raise exception '방금 자리가 찼습니다. 다른 시간을 골라 주세요'; end if;
  insert into makeup_bookings(ticket_id, slot_id, created_by) values (t.id, z.id, p.id) returning id into v_id;
  perform public.notify_admin('[주니어솔로몬] 보강 신청' || chr(10) || s.name || ' · ' || to_char(z.day,'MM/DD') || ' ' || to_char(z.starts,'HH24:MI') ||
                              ' · ' || z.teacher_name || ' 선생님' || chr(10) || to_char(t.absent_day,'MM/DD') || ' 결석분(' || t.reason || ')');
  return v_id;
end $$;

create or replace function public.makeup_cancel(p_booking bigint) returns void
language plpgsql security definer set search_path = public as $$
declare b public.makeup_bookings%rowtype; z public.makeup_slots%rowtype; t public.makeup_tickets%rowtype; v_parent boolean;
begin
  select * into b from makeup_bookings where id = p_booking and status = '신청';
  if not found then raise exception '취소할 신청이 없습니다'; end if;
  select * into z from makeup_slots where id = b.slot_id;
  select * into t from makeup_tickets where id = b.ticket_id;
  v_parent := exists (select 1 from children c where c.parent_id = auth.uid() and c.status = 'approved' and c.me_student_id = t.me_student_id);
  if not (v_parent or public.can_handle_student(t.me_student_id)) then raise exception '권한이 없습니다'; end if;
  if v_parent and not public.is_staff() and (z.day + z.starts) <= (now() at time zone 'Asia/Seoul') + interval '3 hours' then
    raise exception '시작 3시간 전부터는 앱에서 취소할 수 없습니다. 학원(02-794-8123)으로 연락 주세요';
  end if;
  update makeup_bookings set status = '취소', decided_at = now() where id = p_booking;
  if v_parent then perform public.notify_admin('[주니어솔로몬] 보강 취소' || chr(10) || to_char(z.day,'MM/DD') || ' ' || to_char(z.starts,'HH24:MI') || ' · ' || z.teacher_name || ' 선생님'); end if;
end $$;

-- 강사·원장: 보강 출석 체크 → 출석이면 보강권 완료, 결석(무단)이어도 보강권은 사용한 것으로 봄
create or replace function public.makeup_mark(p_booking bigint, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare b public.makeup_bookings%rowtype; z public.makeup_slots%rowtype;
begin
  if p_status not in ('출석','결석','신청') then raise exception '상태를 확인해 주세요'; end if;
  select * into b from makeup_bookings where id = p_booking and status in ('신청','출석','결석');
  if not found then raise exception '신청을 찾을 수 없습니다'; end if;
  select * into z from makeup_slots where id = b.slot_id;
  if not ((public.is_staff() and public.can_branch(z.branch_id)) or z.teacher_id = auth.uid()) then raise exception '이 보강의 담당 선생님만 체크할 수 있습니다'; end if;
  update makeup_bookings set status = p_status, decided_at = now() where id = p_booking;
  update makeup_tickets set status = case when p_status = '신청' then '발급' else '완료' end where id = b.ticket_id;
end $$;

-- 강사: 내가 연 보강 시간과 신청한 학생(학생 이름·학년·원래 결석일만)
-- 원장·관리자: 전체(대기 중인 시간, 열린 시간, 쓰지 않은 보강권)
create or replace function public.makeup_board() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; v_staff boolean := public.is_staff(); v_name text;
begin
  select * into p from profiles where id = auth.uid();
  if not found or not (v_staff or (p.role = 'teacher' and p.status = 'approved')) then raise exception '선생님·원장·관리자만 볼 수 있습니다'; end if;
  v_name := public.js_norm_name(p.teacher_name);
  return jsonb_build_object(
    'staff', v_staff,
    'slots', coalesce((select jsonb_agg(jsonb_build_object('id', z.id, 'day', z.day, 'starts', to_char(z.starts,'HH24:MI'), 'minutes', z.minutes,
                 'teacher', z.teacher_name, 'grades', z.grades, 'cap', z.cap, 'memo', z.memo, 'status', z.status, 'mine', z.teacher_id = p.id,
                 'bookings', coalesce((select jsonb_agg(jsonb_build_object('id', b.id, 'status', b.status, 'name', s.name, 'grade', s.grade,
                                  'absent_day', t.absent_day, 'reason', t.reason) order by s.name)
                               from makeup_bookings b join makeup_tickets t on t.id = b.ticket_id join me_students s on s.me_id = t.me_student_id
                              where b.slot_id = z.id and b.status in ('신청','출석','결석')), '[]')) order by z.day, z.starts)
               from makeup_slots z
              where z.day >= current_date - 14
                and ((v_staff and public.can_branch(z.branch_id)) or z.teacher_id = p.id or (v_name <> '' and public.js_norm_name(z.teacher_name) = v_name))), '[]'),
    'tickets', case when v_staff then coalesce((select jsonb_agg(jsonb_build_object('id', t.id, 'name', s.name, 'grade', s.grade, 'absent_day', t.absent_day,
                 'reason', t.reason, 'expires', t.expires,
                 'state', case when t.status = '완료' then '완료' when exists (select 1 from makeup_bookings b where b.ticket_id = t.id and b.status = '신청') then '신청'
                               when t.expires < current_date then '만료' else '발급' end) order by t.expires, s.name)
               from makeup_tickets t join me_students s on s.me_id = t.me_student_id
              where public.can_branch(t.branch_id) and t.status <> '취소' and t.absent_day > current_date - 62), '[]') else '[]' end,
    'students', case when v_staff then coalesce((select jsonb_agg(jsonb_build_object('id', s.me_id, 'name', s.name, 'grade', s.grade) order by s.name)
               from me_students s where s.status = '재원' and public.can_branch(s.branch_id)), '[]')
                 else coalesce((select jsonb_agg(distinct jsonb_build_object('id', s.me_id, 'name', s.name, 'grade', s.grade))
               from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active join me_students s on s.me_id = e.student_id and s.status = '재원'
              where v_name <> '' and (public.js_norm_name(c.teacher) = v_name or position(v_name in c.name) > 0)), '[]') end,
    'classes', case when v_staff then coalesce((select jsonb_agg(jsonb_build_object('id', c.me_id, 'name', coalesce(c.display_name, c.name)) order by c.name)
               from me_classes c where c.active and public.can_branch(c.branch_id)), '[]') else '[]' end);
end $$;

revoke all on function public.makeup_issue(text,date,text,text,text,bigint), public.makeup_issue_from_request(bigint), public.makeup_issue_class(text,date,text),
  public.makeup_ticket_cancel(bigint), public.makeup_slot_add(date,time,int,text[],int,text,text), public.makeup_slot_set(bigint,text), public.my_makeup(),
  public.makeup_book(bigint,bigint), public.makeup_cancel(bigint), public.makeup_mark(bigint,text), public.makeup_board() from public, anon;
grant execute on function public.makeup_issue(text,date,text,text,text,bigint), public.makeup_issue_from_request(bigint), public.makeup_issue_class(text,date,text),
  public.makeup_ticket_cancel(bigint), public.makeup_slot_add(date,time,int,text[],int,text,text), public.makeup_slot_set(bigint,text), public.my_makeup(),
  public.makeup_book(bigint,bigint), public.makeup_cancel(bigint), public.makeup_mark(bigint,text), public.makeup_board() to authenticated;

select '퇴원·휴원 · 대기 명단 · 보강 준비 완료' as 결과;
