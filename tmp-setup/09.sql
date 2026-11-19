-- 09. 승인 대기(학부모·강사)가 생기면 원장님 카톡으로 알림
-- __ANON_JWT__, __SYNC_SECRET__ 는 실행할 때 실제 값으로 바꿔 넣습니다(저장소에는 남기지 않음).
create extension if not exists pg_net;

create table if not exists public.kakao_tokens (
  id int primary key check (id = 1),
  access_token text, refresh_token text not null, access_expires_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.kakao_tokens enable row level security;
revoke all on public.kakao_tokens from anon, authenticated;

create or replace function public.notify_admin(p_text text) returns void
language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://gyuuimwalbxsocnamtqk.supabase.co/functions/v1/kakao-alert',
    headers := jsonb_build_object('Content-Type','application/json',
                                  'Authorization','Bearer __ANON_JWT__',
                                  'x-sync-secret','__SYNC_SECRET__'),
    body := jsonb_build_object('action','notify','text',p_text));
exception when others then null;   -- 알림 실패가 가입을 막지 않도록
end $$;
revoke all on function public.notify_admin(text) from public, anon, authenticated;

create or replace function public.on_pending_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'pending' and new.phone is not null
     and (tg_op = 'INSERT' or old.phone is null or old.status is distinct from 'pending' or old.role is distinct from new.role) then
    if new.role = 'teacher' then
      perform public.notify_admin('[주니어솔로몬] 강사 승인 대기' || chr(10) || coalesce(new.teacher_name,'') || ' 선생님 · ' || coalesce(new.teacher_subject,''));
    else
      perform public.notify_admin('[주니어솔로몬] 학부모 승인 대기' || chr(10) || '자녀 ' || coalesce(new.child_name,'') || ' · ' || coalesce(new.child_grade,'') || ' · ' || coalesce(new.child_school,''));
    end if;
  end if;
  return null;
end $$;
drop trigger if exists on_pending_member on public.profiles;
create trigger on_pending_member after insert or update of status, phone, role on public.profiles
  for each row execute function public.on_pending_member();

select '카톡 알림 준비 완료' as 결과;
