-- 07. 원생번호는 학생에게 붙습니다 (JS-0001~0010은 비워 두고 JS-0011부터)
--  · 지금 재원·휴원생: 입학일 순서로 JS-0011부터 한 번에 부여
--  · 앞으로 메이크에듀에 새로 등록되는 학생: 들어오는 순간 자동 부여
--  · 학부모 승인: 연결된 학생의 번호를 그대로 사용 (학생이 아직 메이크에듀에 없으면 새 번호를 먼저 주고, 나중에 등록되면 그 번호로 이어 붙임)

-- 번호 발급기: 11부터, 두 표 어디에도 없는 번호만
select setval('public.solomon_no_seq', greatest(10, coalesce((select max(substring(x from 4)::int) from (
  select student_no x from public.profiles where student_no ~ '^JS-[0-9]+$'
  union all select solomon_no from public.me_students where solomon_no ~ '^JS-[0-9]+$') t), 10)), true);

create or replace function public.next_solomon_no() returns text
language plpgsql security definer set search_path = public as $$
declare v text;
begin
  loop
    v := 'JS-' || lpad(nextval('solomon_no_seq')::text, 4, '0');
    exit when not exists (select 1 from profiles where student_no = v)
          and not exists (select 1 from me_students where solomon_no = v);
  end loop;
  return v;
end $$;
revoke all on function public.next_solomon_no() from public, anon, authenticated;

-- 승인 대기·승인 회원 중 이 학생과 맞는 사람 (한 명일 때만)
create or replace function public.match_profile(p_name text, p_birth date, p_phone text) returns uuid
language sql stable security definer set search_path = public as $$
  select case when count(*) = 1 then (array_agg(id))[1] end from profiles
   where me_student_id is null and status in ('pending','approved')
     and regexp_replace(coalesce(child_name,''), '\s', '', 'g') = regexp_replace(coalesce(p_name,''), '\s', '', 'g')
     and ((child_birth is not null and child_birth = p_birth) or (phone is not null and phone = p_phone))
$$;
revoke all on function public.match_profile(text, date, text) from public, anon, authenticated;

-- 학생이 들어오거나 재원·휴원이 되면 번호 부여
create or replace function public.give_solomon_no() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pid uuid; v_no text;
begin
  -- INSERT … ON CONFLICT 때 이미 있는 학생에게 번호를 낭비하지 않음
  if tg_op = 'INSERT' and exists (select 1 from me_students where me_id = new.me_id) then return new; end if;
  if tg_op = 'UPDATE' then new.solomon_no := coalesce(new.solomon_no, old.solomon_no); end if;
  if new.solomon_no is null and new.status in ('재원','휴원') then
    v_pid := public.match_profile(new.name, new.birth, new.guardian_phone);
    if v_pid is not null then select student_no into v_no from profiles where id = v_pid and status = 'approved'; end if;
    new.solomon_no := coalesce(v_no, public.next_solomon_no());
  end if;
  return new;
end $$;
drop trigger if exists give_solomon_no on public.me_students;
create trigger give_solomon_no before insert or update of status on public.me_students
  for each row execute function public.give_solomon_no();

-- 승인된 회원과 학생을 잇기
create or replace function public.link_new_me_student() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_pid uuid;
begin
  if new.status = '퇴원' then return null; end if;
  v_pid := public.match_profile(new.name, new.birth, new.guardian_phone);
  if v_pid is null then return null; end if;
  update profiles set me_student_id = new.me_id,
         student_no = case when status = 'approved' then coalesce(new.solomon_no, student_no) else student_no end
   where id = v_pid;
  return null;
end $$;
drop trigger if exists link_new_me_student on public.me_students;
create trigger link_new_me_student after insert or update of name, birth, guardian_phone, status on public.me_students
  for each row execute function public.link_new_me_student();

-- 승인: 학생 번호가 있으면 그 번호, 없으면 새 번호
drop function if exists public.approve_member(uuid, text);
create or replace function public.approve_member(target uuid, sno text default null) returns text
language plpgsql security definer set search_path = public as $$
declare v_no text; v_me text; p public.profiles%rowtype; s public.me_students%rowtype;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  select * into p from profiles where id = target for update;
  if not found then raise exception '회원을 찾을 수 없습니다'; end if;
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
revoke all on function public.approve_member(uuid, text) from public, anon;
grant execute on function public.approve_member(uuid, text) to authenticated;

-- 지금 재원·휴원생에게 입학일 순서로 번호 부여 (이미 번호가 있는 학생은 그대로)
do $$ declare r record; begin
  for r in select me_id from public.me_students
            where solomon_no is null and status in ('재원','휴원')
            order by joined_on nulls last, me_id loop
    update public.me_students set solomon_no = public.next_solomon_no() where me_id = r.me_id;
  end loop;
end $$;

select count(*) filter (where solomon_no is not null) as 번호받은학생, min(solomon_no) as 첫번호, max(solomon_no) as 끝번호
  from public.me_students where status in ('재원','휴원');
