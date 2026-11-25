-- 강사 전화번호 대장 — 상담 요청함에서 번호로 "강사"를 구분하기 위한 표
-- 원장님이 Supabase 대시보드 SQL Editor에서 한 번만 실행하면 됩니다.

create table if not exists public.staff_directory (
  phone text primary key,         -- 숫자만 (예: 01012345678)
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.staff_directory enable row level security;

drop policy if exists staff_directory_admin_read on public.staff_directory;
create policy staff_directory_admin_read on public.staff_directory
  for select using (is_admin());

drop policy if exists staff_directory_admin_write on public.staff_directory;
create policy staff_directory_admin_write on public.staff_directory
  for all using (is_admin()) with check (is_admin());

-- 강사 번호 넣는 법 (숫자만, 하이픈 없이):
-- insert into public.staff_directory (phone, name) values
--   ('01000000000', '손수영'),
--   ('01000000000', '류다윤')
-- on conflict (phone) do update set name = excluded.name;
