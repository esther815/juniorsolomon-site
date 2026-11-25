-- 솔로몬 저널 / 소포스 입시노트 공용 구독 스키마 (2026-11-25)
-- 두 사이트 공용. site 칸으로 구분. 발송은 앱 채팅의 kakao-alert·앱 푸시가 이 표를 읽어 보냄.

create table if not exists public.journal_subscriptions (
  user_id    uuid not null references auth.users(id) on delete cascade,
  site       text not null check (site in ('solomon','sophos')),
  active     boolean not null default true,     -- 구독 중 여부
  via_kakao  boolean not null default true,     -- 카카오 알림으로 받기
  via_push   boolean not null default false,    -- 앱 푸시로 받기
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, site)
);

-- 발송 기록(중복 발송 방지·확인용)
create table if not exists public.journal_deliveries (
  id        bigint generated always as identity primary key,
  issue_key text not null,                      -- 발행호 식별(예: 2026-11-25)
  site      text not null,
  user_id   uuid not null,
  channel   text not null check (channel in ('kakao','push')),
  status    text not null default 'sent',       -- sent | failed | test
  error     text,
  sent_at   timestamptz not null default now()
);
create index if not exists journal_deliveries_issue_idx on public.journal_deliveries(site, issue_key);

-- RLS: 회원은 자기 구독만 보고 고칠 수 있음. 발송(서비스 키)은 RLS 우회.
alter table public.journal_subscriptions enable row level security;
drop policy if exists js_self on public.journal_subscriptions;
create policy js_self on public.journal_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 회원 페이지에서 로그인 상태로 호출하는 구독 설정 RPC
create or replace function public.journal_subscribe(
  p_site text, p_active boolean, p_via_kakao boolean, p_via_push boolean
) returns void language plpgsql security invoker as $$
begin
  insert into public.journal_subscriptions (user_id, site, active, via_kakao, via_push, updated_at)
  values (auth.uid(), p_site, p_active, p_via_kakao, p_via_push, now())
  on conflict (user_id, site) do update
    set active = excluded.active,
        via_kakao = excluded.via_kakao,
        via_push = excluded.via_push,
        updated_at = now();
end $$;

-- 재원생 여부는 기존 profiles에서 판단(앱 채팅 영역). 발송 대상 = 구독 active 이면서
-- (원장 정책에 따라) 재원생 승인된 회원. 승인 칸이 profiles에 없으면 앱 채팅과 칸 이름 합의.
