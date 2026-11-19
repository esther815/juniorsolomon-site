-- 08. 강사 가입(초대 링크) · 학부모 「우리 아이 수업」 화면
alter table public.profiles add column if not exists role text not null default 'parent';
do $$ begin
  alter table public.profiles add constraint profiles_role_check check (role in ('parent','teacher'));
exception when duplicate_object then null; end $$;
alter table public.profiles add column if not exists teacher_name text;
alter table public.profiles add column if not exists teacher_subject text;

-- 원장님만 보는 설정 (강사 초대 코드)
create table if not exists public.app_settings (key text primary key, val text not null, updated_at timestamptz not null default now());
alter table public.app_settings enable row level security;
revoke all on public.app_settings from anon, authenticated;

create or replace function public.new_teacher_invite() returns text
language plpgsql security definer set search_path = public as $$
declare v text;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  v := substr(md5(random()::text || clock_timestamp()::text || random()::text), 1, 18);
  insert into app_settings(key, val) values ('teacher_invite', v)
  on conflict (key) do update set val = excluded.val, updated_at = now();
  return v;
end $$;
revoke all on function public.new_teacher_invite() from public, anon;
grant execute on function public.new_teacher_invite() to authenticated;

-- 초대 링크로 들어온 사람이 강사로 가입 신청
create or replace function public.claim_teacher(code text, p_name text, p_phone text, p_subject text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if code is null or code <> coalesce((select val from app_settings where key = 'teacher_invite'), '#') then
    raise exception '초대 링크가 맞지 않거나 만료되었습니다';
  end if;
  if coalesce(trim(p_name),'') = '' or coalesce(p_phone,'') !~ '^01[0-9]{8,9}$' then raise exception '이름과 휴대폰 번호를 확인해 주세요'; end if;
  update profiles set role = 'teacher', teacher_name = trim(p_name), phone = p_phone, teacher_subject = nullif(trim(p_subject),''),
         status = case when status = 'approved' and role = 'teacher' then status else 'pending' end,
         child_name = null, child_grade = null, child_school = null, child_birth = null, student_phone = null,
         updated_at = now()
   where id = auth.uid();
end $$;
revoke all on function public.claim_teacher(text, text, text, text) from public, anon;
grant execute on function public.claim_teacher(text, text, text, text) to authenticated;

-- 승인: 강사는 원생번호 없이 승인
create or replace function public.approve_member(target uuid, sno text default null) returns text
language plpgsql security definer set search_path = public as $$
declare v_no text; v_me text; p public.profiles%rowtype; s public.me_students%rowtype;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select * into p from profiles where id = target for update;
  if not found then raise exception '회원을 찾을 수 없습니다'; end if;
  if p.role = 'teacher' then
    update profiles set status = 'approved', updated_at = now() where id = target;
    return null;
  end if;
  v_me := coalesce(p.me_student_id, public.find_me_student(p.child_name, p.child_birth, p.phone));
  if v_me is not null then
    select * into s from me_students where me_id = v_me;
    if s.solomon_no is null then
      update me_students set solomon_no = coalesce(p.student_no, public.next_solomon_no()) where me_id = v_me returning solomon_no into v_no;
    else v_no := s.solomon_no; end if;
  else
    v_no := coalesce(p.student_no, public.next_solomon_no());
  end if;
  update profiles set status = 'approved', student_no = v_no, me_student_id = v_me, updated_at = now() where id = target;
  return v_no;
end $$;

-- 학부모: 우리 아이 수업 정보 (승인된 본인 자녀만)
create or replace function public.my_child() returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles%rowtype; s public.me_students%rowtype; v_classes jsonb; v_att jsonb;
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.status <> 'approved' or p.role <> 'parent' then return null; end if;
  if p.me_student_id is null then
    return jsonb_build_object('linked', false, 'name', p.child_name, 'solomon_no', p.student_no);
  end if;
  select * into s from me_students where me_id = p.me_student_id;
  select coalesce(jsonb_agg(jsonb_build_object('name', coalesce(c.display_name, c.name), 'teacher', c.teacher) order by c.name), '[]')
    into v_classes
    from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active
   where e.student_id = s.me_id;
  select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status) order by a.day desc), '[]')
    into v_att
    from (select day, status from me_attendance where student_id = s.me_id order by day desc limit 10) a;
  return jsonb_build_object('linked', true, 'name', s.name, 'solomon_no', s.solomon_no, 'status', s.status,
                            'grade', s.grade, 'school', s.school, 'classes', v_classes, 'attendance', v_att);
end $$;
revoke all on function public.my_child() from public, anon;
grant execute on function public.my_child() to authenticated;

select '강사 가입·우리 아이 수업 준비 완료' as 결과;
