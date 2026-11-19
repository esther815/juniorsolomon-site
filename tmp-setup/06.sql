-- 06. 원생번호 자동 부여 · 메이크에듀 명부 자동 연결
-- 승인을 누르면 JS-0001부터 겹치지 않는 번호가 자동으로 붙고, 새 원생 명부(me_students)에도 같은 번호가 들어갑니다.

create sequence if not exists public.solomon_no_seq start 1;
alter table public.profiles    add column if not exists me_student_id text;
alter table public.me_students add column if not exists solomon_no text;
do $$ begin
  alter table public.profiles add constraint profiles_student_no_key unique (student_no);
exception when duplicate_table or duplicate_object then null; end $$;
do $$ begin
  alter table public.me_students add constraint me_students_solomon_no_key unique (solomon_no);
exception when duplicate_table or duplicate_object then null; end $$;

-- 메이크에듀 원생 찾기: 이름 + (생년월일 또는 보호자 번호)가 한 명에게만 맞을 때만 연결
create or replace function public.find_me_student(p_name text, p_birth date, p_phone text) returns text
language sql stable security definer set search_path = public as $$
  select case when count(*) = 1 then min(me_id) end
    from me_students
   where status <> '퇴원'
     and regexp_replace(name, '\s', '', 'g') = regexp_replace(coalesce(p_name,''), '\s', '', 'g')
     and ((p_birth is not null and birth = p_birth) or (p_phone is not null and guardian_phone = p_phone))
$$;
revoke all on function public.find_me_student(text, date, text) from public, anon, authenticated;

drop function if exists public.approve_member(uuid, text);
create or replace function public.approve_member(target uuid, sno text default null) returns text
language plpgsql security definer set search_path = public as $$
declare v_no text; v_me text; p public.profiles%rowtype;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select * into p from profiles where id = target for update;
  if not found then raise exception '회원을 찾을 수 없습니다'; end if;

  v_no := p.student_no;
  if v_no is null then
    loop                                            -- 겹치면 다음 번호
      v_no := 'JS-' || lpad(nextval('solomon_no_seq')::text, 4, '0');
      exit when not exists (select 1 from profiles where student_no = v_no)
            and not exists (select 1 from me_students where solomon_no = v_no);
    end loop;
  end if;

  v_me := coalesce(p.me_student_id, public.find_me_student(p.child_name, p.child_birth, p.phone));
  update profiles set status = 'approved', student_no = v_no, me_student_id = v_me, updated_at = now() where id = target;
  if v_me is not null then
    update me_students set solomon_no = v_no where me_id = v_me and (solomon_no is null or solomon_no = v_no);
  end if;
  return v_no;
end $$;
revoke all on function public.approve_member(uuid, text) from public, anon;
grant execute on function public.approve_member(uuid, text) to authenticated;

-- 메이크에듀에 나중에 등록된 학생도 자동으로 연결 (승인된 회원 중 아직 연결 안 된 사람)
create or replace function public.link_new_me_student() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pid uuid; v_no text;
begin
  if new.status = '퇴원' or new.solomon_no is not null then return null; end if;
  select id, student_no into v_pid, v_no from profiles
   where status = 'approved' and me_student_id is null and student_no is not null
     and regexp_replace(child_name, '\s', '', 'g') = regexp_replace(new.name, '\s', '', 'g')
     and ((child_birth is not null and child_birth = new.birth) or (phone is not null and phone = new.guardian_phone))
   limit 2;
  if v_pid is null or (select count(*) from profiles
        where status = 'approved' and me_student_id is null
          and regexp_replace(child_name, '\s', '', 'g') = regexp_replace(new.name, '\s', '', 'g')
          and ((child_birth is not null and child_birth = new.birth) or (phone is not null and phone = new.guardian_phone))) <> 1 then
    return null;
  end if;
  update profiles set me_student_id = new.me_id where id = v_pid;
  update me_students set solomon_no = v_no where me_id = new.me_id;
  return null;
end $$;
drop trigger if exists link_new_me_student on public.me_students;
create trigger link_new_me_student after insert or update of name, birth, guardian_phone, status on public.me_students
  for each row execute function public.link_new_me_student();

-- 원장님 화면: 승인 전 메이크에듀 연결 미리보기
create or replace function public.admin_member_matches()
returns table (profile_id uuid, me_id text, me_name text, me_school text, me_grade text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  return query
    select p.id, s.me_id, s.name, s.school, s.grade
      from profiles p
      join me_students s on s.me_id = coalesce(p.me_student_id, public.find_me_student(p.child_name, p.child_birth, p.phone));
end $$;
revoke all on function public.admin_member_matches() from public, anon;
grant execute on function public.admin_member_matches() to authenticated;

select '원생번호 자동 부여 준비 완료' as 결과;
