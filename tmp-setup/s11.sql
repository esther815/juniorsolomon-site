-- 10. 홈페이지 상담 요청 → 원장님 카톡 알림
--  · 상담 신청하기(이름·연락처) : consult_requests 에 저장 + 카톡 알림
--  · 전화 상담 / 문자·카톡 버튼 누름 : 누가 눌렀는지는 알 수 없음 → 「버튼 누름」 알림만
create table if not exists public.consult_requests (
  id bigserial primary key,
  kind text not null check (kind in ('form','wait','tel','sms','kakao')),
  wish text,
  guardian_name text,
  phone text,
  page text,
  created_at timestamptz not null default now(),
  handled_at timestamptz
);
alter table public.consult_requests enable row level security;
revoke all on public.consult_requests from anon, authenticated;
grant select, update (handled_at) on public.consult_requests to authenticated;
drop policy if exists "원장만" on public.consult_requests;
create policy "원장만" on public.consult_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());
grant usage, select on sequence public.consult_requests_id_seq to authenticated;

create or replace function public.consult_ping(p_kind text, p_wish text default null, p_name text default null, p_phone text default null, p_page text default null)
returns text language plpgsql security definer set search_path = public as $$
declare v_phone text; v_label text; v_recent int; v_msg text;
begin
  if p_kind not in ('form','wait','tel','sms','kakao') then return 'bad'; end if;
  delete from consult_requests where created_at < now() - interval '1 year';   -- 보유 기간 1년
  -- 스팸 방지: 최근 1시간 40건 넘으면 저장만 멈춤
  select count(*) into v_recent from consult_requests where created_at > now() - interval '1 hour';
  if v_recent >= 40 then return 'busy'; end if;
  v_phone := nullif(regexp_replace(coalesce(p_phone,''), '\D', '', 'g'), '');
  if p_kind in ('form','wait') then
    if coalesce(btrim(p_name),'') = '' or v_phone !~ '^0[0-9]{8,10}$' then return 'bad'; end if;
    -- 같은 번호로 10분 안에 같은 신청이 또 오면 저장하지 않음
    if exists (select 1 from consult_requests where phone = v_phone and coalesce(wish,'') = coalesce(left(p_wish,200),'') and created_at > now() - interval '10 minutes') then return 'dup'; end if;
  end if;
  insert into consult_requests(kind, wish, guardian_name, phone, page)
  values (p_kind, left(p_wish,200), left(btrim(p_name),40), case when p_kind in ('form','wait') then v_phone end, left(p_page,40));

  v_label := case p_kind when 'form' then '상담 신청' when 'wait' then '대기 신청'
                         when 'tel' then '전화 상담 버튼' when 'sms' then '문자·카톡(010-3212-8123) 버튼'
                         else '카카오톡 채널 상담 버튼' end;
  if p_kind in ('form','wait') then
    v_msg := '[주니어솔로몬] 홈페이지 ' || v_label || chr(10) || coalesce(left(p_wish,120),'') || chr(10) ||
             '보호자 ' || left(btrim(p_name),40) || ' · ' || regexp_replace(v_phone, '^(\d{3})(\d{3,4})(\d{4})$', '\1-\2-\3');
  else
    v_msg := '[주니어솔로몬] 학부모가 홈페이지에서 「' || v_label || '」을 눌렀습니다' ||
             case when coalesce(p_wish,'') <> '' then chr(10) || '보던 수업: ' || left(p_wish,120) else '' end ||
             chr(10) || '곧 연락이 올 수 있습니다.';
  end if;
  perform public.notify_admin(v_msg);
  return 'ok';
end $$;
revoke all on function public.consult_ping(text,text,text,text,text) from public;
grant execute on function public.consult_ping(text,text,text,text,text) to anon, authenticated;
-- 11. 학부모 한 명에 자녀 여러 명 (최대 5명)
--  · 자녀마다 원생번호·메이크에듀 연결·승인 상태를 따로 가짐
--  · 이미 가입한 학부모의 자녀 1명은 그대로 옮겨 옴
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 30),
  grade text, school text, birth date,
  student_phone text check (student_phone is null or student_phone ~ '^01[0-9]{8,9}$'),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  me_student_id text unique,
  student_no text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children(parent_id);
alter table public.children enable row level security;
revoke all on public.children from anon, authenticated;
grant select on public.children to authenticated;
drop policy if exists "본인 자녀 또는 원장" on public.children;
create policy "본인 자녀 또는 원장" on public.children for select to authenticated
  using (parent_id = auth.uid() or public.is_admin());

-- 기존 학부모 자녀 1명 옮기기
insert into public.children (parent_id, name, grade, school, birth, student_phone, status, me_student_id, student_no, created_at)
select p.id, btrim(p.child_name), p.child_grade, p.child_school, p.child_birth, p.student_phone,
       p.status, p.me_student_id, p.student_no, p.created_at
  from public.profiles p
 where p.role = 'parent' and coalesce(btrim(p.child_name),'') <> ''
   and not exists (select 1 from public.children c where c.parent_id = p.id);

-- 번호 발급기: 세 곳 어디에도 없는 번호만
create or replace function public.next_solomon_no() returns text
language plpgsql security definer set search_path = public as $$
declare v text;
begin
  loop
    v := 'JS-' || lpad(nextval('solomon_no_seq')::text, 4, '0');
    exit when not exists (select 1 from profiles where student_no = v)
          and not exists (select 1 from children where student_no = v)
          and not exists (select 1 from me_students where solomon_no = v);
  end loop;
  return v;
end $$;
revoke all on function public.next_solomon_no() from public, anon, authenticated;

-- 메이크에듀 학생과 맞는 자녀 (한 명일 때만)
create or replace function public.match_child(p_name text, p_birth date, p_phone text) returns uuid
language sql stable security definer set search_path = public as $$
  select case when count(*) = 1 then (array_agg(c.id))[1] end
    from children c join profiles p on p.id = c.parent_id
   where c.me_student_id is null and c.status in ('pending','approved')
     and regexp_replace(c.name, '\s', '', 'g') = regexp_replace(coalesce(p_name,''), '\s', '', 'g')
     and ((c.birth is not null and c.birth = p_birth) or (p.phone is not null and p.phone = p_phone))
$$;
revoke all on function public.match_child(text, date, text) from public, anon, authenticated;

create or replace function public.give_solomon_no() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_cid uuid; v_no text;
begin
  if tg_op = 'INSERT' and exists (select 1 from me_students where me_id = new.me_id) then return new; end if;
  if tg_op = 'UPDATE' then new.solomon_no := coalesce(new.solomon_no, old.solomon_no); end if;
  if new.solomon_no is null and new.status in ('재원','휴원') then
    v_cid := public.match_child(new.name, new.birth, new.guardian_phone);
    if v_cid is not null then select student_no into v_no from children where id = v_cid and status = 'approved'; end if;
    new.solomon_no := coalesce(v_no, public.next_solomon_no());
  end if;
  return new;
end $$;

create or replace function public.link_new_me_student() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_cid uuid;
begin
  if new.status = '퇴원' then return null; end if;
  v_cid := public.match_child(new.name, new.birth, new.guardian_phone);
  if v_cid is null then return null; end if;
  update children set me_student_id = new.me_id,
         student_no = case when status = 'approved' then coalesce(new.solomon_no, student_no) else student_no end,
         updated_at = now()
   where id = v_cid;
  return null;
end $$;

-- 학부모가 연락처·자녀 목록 저장 (가입 때와 자녀 추가 때 같은 함수)
--  p_items: [{id?, name, grade, school, birth:'YYYY-MM-DD', student_phone?}]
--  승인된 자녀는 이름·생년월일을 바꾸지 않음(휴대폰 번호만), 승인 전 자녀는 고치거나 뺄 수 있음
create or replace function public.save_my_children(p_phone text, p_items jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; it jsonb; v_id uuid; v_keep uuid[] := '{}'; v_new int := 0;
        v_name text; v_birth date; v_sp text; v_list text; c record;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  select * into p from profiles where id = auth.uid() for update;
  if not found or p.role <> 'parent' then raise exception 'not allowed'; end if;
  if coalesce(p_phone,'') !~ '^01[0-9]{8,9}$' then raise exception '학부모 휴대폰 번호를 확인해 주세요'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then raise exception '자녀를 한 명 이상 적어 주세요'; end if;
  if jsonb_array_length(p_items) > 5 then raise exception '자녀는 5명까지 적을 수 있습니다'; end if;

  for it in select * from jsonb_array_elements(p_items) loop
    v_name := btrim(coalesce(it->>'name',''));
    v_sp := nullif(regexp_replace(coalesce(it->>'student_phone',''), '\D', '', 'g'), '');
    begin v_birth := (it->>'birth')::date; exception when others then v_birth := null; end;
    if v_name = '' or v_birth is null or coalesce(it->>'grade','') = '' or btrim(coalesce(it->>'school','')) = '' then
      raise exception '자녀 이름·생년월일·학년·학교를 모두 적어 주세요';
    end if;
    if v_sp is not null and v_sp !~ '^01[0-9]{8,9}$' then raise exception '자녀 휴대폰 번호를 확인해 주세요'; end if;
    v_id := nullif(it->>'id','')::uuid;
    if v_id is not null and exists (select 1 from children where id = v_id and parent_id = p.id) then
      update children set
        name   = case when status = 'pending' then v_name else name end,
        birth  = case when status = 'pending' then v_birth else birth end,
        grade  = case when status = 'pending' then it->>'grade' else grade end,
        school = case when status = 'pending' then btrim(it->>'school') else school end,
        student_phone = v_sp, updated_at = now()
       where id = v_id;
    else
      insert into children(parent_id, name, grade, school, birth, student_phone)
      values (p.id, v_name, it->>'grade', btrim(it->>'school'), v_birth, v_sp) returning id into v_id;
      v_new := v_new + 1;
    end if;
    v_keep := v_keep || v_id;
  end loop;
  -- 목록에서 뺀 자녀: 승인 전이면 지움(승인된 자녀는 원장님만 정리)
  delete from children where parent_id = p.id and status = 'pending' and not (id = any(v_keep));

  update profiles set phone = p_phone, guardian_consent_at = now(),
         status = case when status = 'rejected' then 'pending' else status end, updated_at = now()
   where id = p.id;

  if v_new > 0 then
    select string_agg(name || ' · ' || coalesce(grade,'') || ' · ' || coalesce(school,''), chr(10) order by created_at)
      into v_list from children where parent_id = p.id and status = 'pending';
    perform public.notify_admin('[주니어솔로몬] ' || case when p.status = 'approved' then '자녀 추가 승인 대기' else '학부모 승인 대기' end
      || chr(10) || coalesce(v_list,''));
  end if;
  return v_new;
end $$;
revoke all on function public.save_my_children(text, jsonb) from public, anon;
grant execute on function public.save_my_children(text, jsonb) to authenticated;

-- 승인: 학부모 + 승인 대기 자녀 모두 (자녀마다 번호)
create or replace function public.approve_member(target uuid, sno text default null) returns text
language plpgsql security definer set search_path = public as $$
declare p public.profiles%rowtype; c record; v_me text; v_no text; v_out text := ''; s public.me_students%rowtype;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select * into p from profiles where id = target for update;
  if not found then raise exception '회원을 찾을 수 없습니다'; end if;
  if p.role = 'teacher' then
    update profiles set status = 'approved', updated_at = now() where id = target;
    return null;
  end if;
  for c in select * from children where parent_id = target and status in ('pending','rejected') order by created_at for update loop
    v_me := coalesce(c.me_student_id, public.find_me_student(c.name, c.birth, p.phone));
    if v_me is not null and exists (select 1 from children where me_student_id = v_me and id <> c.id) then v_me := null; end if;
    v_no := null;
    if v_me is not null then
      select * into s from me_students where me_id = v_me;
      if s.solomon_no is null then
        update me_students set solomon_no = coalesce(c.student_no, public.next_solomon_no()) where me_id = v_me returning solomon_no into v_no;
      else v_no := s.solomon_no; end if;
    else
      v_no := coalesce(c.student_no, public.next_solomon_no());
    end if;
    update children set status = 'approved', student_no = v_no, me_student_id = v_me, updated_at = now() where id = c.id;
    v_out := v_out || case when v_out = '' then '' else ', ' end || c.name || ' ' || v_no;
  end loop;
  -- 예전 화면 호환: 첫째 자녀 정보를 profiles 에도 남김
  update profiles pr set status = 'approved', updated_at = now(),
         child_name = f.name, child_grade = f.grade, child_school = f.school, child_birth = f.birth,
         student_no = f.student_no, me_student_id = f.me_student_id
    from (select * from children where parent_id = target order by created_at limit 1) f
   where pr.id = target;
  update profiles set status = 'approved', updated_at = now() where id = target and status <> 'approved';
  return nullif(v_out, '');
end $$;
revoke all on function public.approve_member(uuid, text) from public, anon;
grant execute on function public.approve_member(uuid, text) to authenticated;

-- 원장님 화면: 자녀별 메이크에듀 연결 미리보기
drop function if exists public.admin_member_matches();
create or replace function public.admin_member_matches()
returns table (profile_id uuid, child_id uuid, me_id text, me_name text, me_school text, me_grade text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query
    select c.parent_id, c.id, s.me_id, s.name, s.school, s.grade
      from children c join profiles p on p.id = c.parent_id
      join me_students s on s.me_id = coalesce(c.me_student_id, public.find_me_student(c.name, c.birth, p.phone));
end $$;
revoke all on function public.admin_member_matches() from public, anon;
grant execute on function public.admin_member_matches() to authenticated;

-- 학부모: 우리 아이들 수업 정보 (승인된 자녀만)
create or replace function public.my_children() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; c record; s public.me_students%rowtype; v_classes jsonb; v_att jsonb; v_out jsonb := '[]';
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'parent' then return '[]'; end if;
  for c in select * from children where parent_id = p.id and status = 'approved' order by created_at loop
    if c.me_student_id is null then
      v_out := v_out || jsonb_build_object('linked', false, 'name', c.name, 'solomon_no', c.student_no, 'grade', c.grade);
      continue;
    end if;
    select * into s from me_students where me_id = c.me_student_id;
    select coalesce(jsonb_agg(jsonb_build_object('name', coalesce(k.display_name, k.name), 'teacher', k.teacher) order by k.name), '[]')
      into v_classes from me_enrollments e join me_classes k on k.me_id = e.class_id and k.active where e.student_id = s.me_id;
    select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status) order by a.day desc), '[]')
      into v_att from (select day, status from me_attendance where student_id = s.me_id order by day desc limit 10) a;
    v_out := v_out || jsonb_build_object('linked', true, 'name', s.name, 'solomon_no', coalesce(s.solomon_no, c.student_no), 'status', s.status,
                                         'grade', s.grade, 'school', s.school, 'classes', v_classes, 'attendance', v_att);
  end loop;
  return v_out;
end $$;
revoke all on function public.my_children() from public, anon;
grant execute on function public.my_children() to authenticated;

-- 승인 대기 알림: 학부모는 save_my_children 에서 보내므로 여기서는 강사만
create or replace function public.on_pending_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role = 'teacher' and new.status = 'pending' and new.phone is not null
     and (tg_op = 'INSERT' or old.phone is null or old.status is distinct from 'pending' or old.role is distinct from new.role) then
    perform public.notify_admin('[주니어솔로몬] 강사 승인 대기' || chr(10) || coalesce(new.teacher_name,'') || ' 선생님 · ' || coalesce(new.teacher_subject,''));
  end if;
  return null;
end $$;

-- 학부모가 profiles 를 직접 고치던 권한은 닫음 (이제 save_my_children 으로만)
revoke update on public.profiles from authenticated;

select (select count(*) from public.children) as 자녀_수, '자녀 여러 명 준비 완료' as 결과;
