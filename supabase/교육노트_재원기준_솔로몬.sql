-- 주니어솔로몬 교육 노트 알림톡 — 재원생 가족 자동 판정 (원장님 결정 '가', 2026-11-25)
--
-- 순서: ① 소포스 저장소의 supabase/입시노트_알림톡_설정.sql 을 먼저 실행 (ns_ 표·함수 생성)
--       ② 이 파일을 Supabase 대시보드 > SQL Editor 에 붙여 넣고 실행. 여러 번 실행해도 안전하다.
--
-- 하는 일
--  솔로몬은 원장님이 이미 하는 회원 승인을 그대로 재원 기준으로 쓴다. 따로 한 번 더 승인하지 않는다.
--  재원생 가족 = profiles.status = 'approved'  그리고  강사·데스크·지점장이 아님
--               그리고 children 중 status = 'approved' 인 자녀가 한 명 이상
--  위 조건이 되면 ns_enrolled(site='solomon') 에 자동으로 넣고, 조건이 깨지면 빼고 구독도 끈다.
--  공용 발송 함수(news-dispatch)와 공용 SQL 은 고치지 않는다 — ns_enrolled 를 그대로 읽기 때문이다.
--
-- 주의
--  - 원장실의 솔로몬 '재원 승인' 버튼(ns_admin_set_enrolled)으로 바꿔도 다음 회원·자녀 변경 때 이 규칙으로 다시 맞춰진다.
--    솔로몬 칸은 승인 버튼 대신 '자동(회원 승인 기준)'으로 보여 주는 것이 맞다. (소포스 저장소 담당 채팅에 전달)
--  - 퇴원생 학부모: 자녀 승인(children.status)이 퇴원 뒤에도 'approved' 로 남는다면 이 규칙만으로는 빠지지 않는다.
--    퇴원 시 children.status 를 바꾸는지, 아니면 me_students 의 재원 상태로 걸러야 하는지 원장님 확인 후 보완한다.

create or replace function public.ns_solomon_qualifies(p_user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from profiles p
    where p.id = p_user
      and p.status = 'approved'
      and coalesce(p.role, '') not in ('teacher', 'desk', 'manager')
      and exists(select 1 from children c where c.parent_id = p.id and c.status = 'approved')
  );
$$;

create or replace function public.ns_solomon_sync(p_user uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null then return; end if;
  if ns_solomon_qualifies(p_user) then
    insert into ns_enrolled(user_id, site) values (p_user, 'solomon')
    on conflict (user_id, site) do nothing;
  else
    delete from ns_enrolled where user_id = p_user and site = 'solomon';
    update ns_subscriptions set is_on = false, updated_at = now()
     where user_id = p_user and site = 'solomon' and is_on;
  end if;
end $$;

-- 회원 정보가 바뀔 때
create or replace function public.ns_solomon_trg_profiles()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform ns_solomon_sync(old.id); return old;
  end if;
  perform ns_solomon_sync(new.id); return new;
end $$;

-- 자녀 정보가 바뀔 때
create or replace function public.ns_solomon_trg_children()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then perform ns_solomon_sync(old.parent_id); end if;
  if tg_op in ('INSERT', 'UPDATE') then perform ns_solomon_sync(new.parent_id); end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

drop trigger if exists ns_solomon_profiles on public.profiles;
create trigger ns_solomon_profiles
  after insert or update of status, role or delete on public.profiles
  for each row execute function public.ns_solomon_trg_profiles();

drop trigger if exists ns_solomon_children on public.children;
create trigger ns_solomon_children
  after insert or update of status, parent_id or delete on public.children
  for each row execute function public.ns_solomon_trg_children();

-- 지금 있는 회원 한 번에 맞추기
select public.ns_solomon_sync(p.id) from public.profiles p;
delete from public.ns_enrolled e
 where e.site = 'solomon' and not exists(select 1 from public.profiles p where p.id = e.user_id);

revoke all on function public.ns_solomon_qualifies(uuid), public.ns_solomon_sync(uuid) from public, anon, authenticated;

-- 확인: 솔로몬 재원생 가족 수
-- select count(*) from public.ns_enrolled where site = 'solomon';
