-- 메이크에듀 출결 동기화 — me_students 중복 정리 + apply_attendance_named 매칭 보강
-- 배경: 동기화가 돌 때마다 me_students에 기존 행을 덮어쓰지 않고 새 행을 쌓아
--       같은 학생(이름+학교)이 여러 행으로 중복됨(확인: 1662행/고유이름 772명).
--       apply_attendance_named의 매칭이 "정확히 1건일 때만" 매칭하도록 되어 있어
--       중복 때문에 대부분(93/96) 출결이 "unmatched"로 빠졌음.
-- 조치: ① 이름+학교가 같은 중복 행 중 가장 최근(me_id 최대) 1건만 남기고 삭제
--       ② 매칭 함수를 "이름+학교" "이름+반" 단계에서는 중복이 있어도 최신 1건을 채택하도록 보강
--          (이름만으로는 동명이인 보호를 위해 기존처럼 엄격하게 유지)
-- 여러 번 실행해도 안전(두 번째 실행부터는 삭제할 중복이 없고, 함수는 CREATE OR REPLACE).

begin;

delete from me_students a
using me_students b
where a.name = b.name
  and coalesce(a.school,'') = coalesce(b.school,'')
  and a.me_id < b.me_id;

CREATE OR REPLACE FUNCTION public.apply_attendance_named(p_rows jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare v_in int; v_un jsonb;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;

  drop table if exists _a;
  drop table if exists _k;

  create temp table _a on commit drop as
  select
    trim(x->>'name') n,
    coalesce(trim(x->>'school'),'') sc,
    coalesce(trim(x->>'class'),'') cl,
    (x->>'day')::date d,
    case trim(x->>'mark')
      when 'O' then '출석' when 'X' then '결석' else '기타'
    end st
  from jsonb_array_elements(p_rows) x
  where coalesce(trim(x->>'name'),'') <> ''
    and x->>'day' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and trim(x->>'mark') in ('O','X','△')
    and (x->>'day')::date <= (now() at time zone 'Asia/Seoul')::date;

  create temp table _k on commit drop as
  select distinct n, sc, cl, null::text sid from _a;

  update _k k set sid = (
    select min(s.me_id) from me_students s where s.name = k.n
  ) where (
    select count(*) from me_students s where s.name = k.n
  ) = 1;

  update _k k set sid = (
    select max(s.me_id) from me_students s
    where s.name = k.n and coalesce(s.school,'') = k.sc
  ) where sid is null
    and exists (
      select 1 from me_students s
      where s.name = k.n and coalesce(s.school,'') = k.sc
    );

  update _k k set sid = (
    select max(s.me_id) from me_students s
    join me_enrollments e on e.student_id = s.me_id
    where s.name = k.n and e.class_id = k.cl
  ) where sid is null
    and exists (
      select 1 from me_students s
      join me_enrollments e on e.student_id = s.me_id
      where s.name = k.n and e.class_id = k.cl
    );

  insert into me_attendance(student_id, class_id, day, status)
  select distinct on (k.sid, a.cl, a.d) k.sid, a.cl, a.d, a.st
  from _a a
  join _k k on k.n = a.n and k.sc = a.sc and k.cl = a.cl
  where k.sid is not null
  on conflict (student_id, day, class_id) do update set status = excluded.status;

  get diagnostics v_in = row_count;

  select coalesce(jsonb_agg(distinct n || case when sc <> '' then ' (' || sc || ')' else '' end), '[]')
  into v_un from _k where sid is null;

  return jsonb_build_object('saved', v_in, 'unmatched', v_un);
end
$function$;

commit;

select '정리 후 상태' as 단계, count(*) as 전체행, count(distinct name) as 고유이름수 from me_students;
