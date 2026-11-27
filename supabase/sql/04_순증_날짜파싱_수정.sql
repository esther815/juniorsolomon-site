-- 원인: apply_snapshot이 joined_on/left_on을 'YYYYMMDD'(순수 8자리)만 받아들이는데,
-- 메이크에듀는 "2026-07-01" 같은 대시 포함 날짜를 준다(실제 동기화 응답으로 확인).
-- 그래서 모든 학생의 joined_on/left_on이 계속 NULL이었고, admin_ops_stats()의
-- "이번 달 순증"(join_month-left_month)이 항상 0으로 나왔다.
-- 고침: 대시 포함 날짜(YYYY-MM-DD, 뒤에 시각이 와도 됨)도 받아들이도록 파싱만 수정.
-- 그 외 로직은 기존과 완전히 동일.
begin;

CREATE OR REPLACE FUNCTION public.apply_snapshot(p_source text, p_students jsonb, p_classes jsonb, p_enrollments jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_run bigint; v_changes int := 0; v_n int;
begin
  if not (public.is_admin() or coalesce(current_setting('request.jwt.claims', true)::jsonb->>'role','') = 'service_role'
          or current_user in ('postgres','service_role')) then
    raise exception 'not allowed';
  end if;
  if jsonb_array_length(coalesce(p_students,'[]')) = 0 then raise exception '원생 자료가 비어 있습니다'; end if;

  insert into sync_runs(source, ok) values (p_source, false) returning id into v_run;

  -- 이전 자리 단계
  create temp table _before on commit drop as select class_id, stage from public.class_counts();

  -- 받은 자료 정리
  create temp table _c on commit drop as
    select nullif(trim(x->>'me_id'),'') me_id, coalesce(nullif(trim(x->>'name'),''), x->>'me_id') name,
           nullif(trim(x->>'teacher'),'') teacher,
           case when (x->>'cap') ~ '^[0-9]+$' and (x->>'cap')::int between 1 and 99 then (x->>'cap')::int end cap,
           nullif(trim(x->>'target'),'') target
      from jsonb_array_elements(coalesce(p_classes,'[]')) x;
  delete from _c where me_id is null;

  create temp table _s on commit drop as
    select nullif(trim(x->>'me_id'),'') me_id,
           trim(regexp_replace(coalesce(x->>'name',''), '[0-9]{4}$', '')) name,
           nullif(trim(x->>'school'),'') school, nullif(trim(x->>'grade'),'') grade,
           case when x->>'status' in ('재원','휴원','퇴원') then x->>'status' else '퇴원' end status,
           case when (x->>'birth') ~ '^(19|20)[0-9]{2}-?(0[1-9]|1[0-2])-?(0[1-9]|[12][0-9]|3[01])$'
                then to_date(replace(x->>'birth','-',''),'YYYYMMDD') end birth,
           nullif(regexp_replace(coalesce(x->>'guardian_phone',''),'[^0-9]','','g'),'') guardian_phone,
           case
             when (x->>'joined_on') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' then substr(x->>'joined_on',1,10)::date
             when (x->>'joined_on') ~ '^[0-9]{8}$' then to_date(x->>'joined_on','YYYYMMDD')
           end joined_on,
           case
             when (x->>'left_on') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' then substr(x->>'left_on',1,10)::date
             when (x->>'left_on') ~ '^[0-9]{8}$' then to_date(x->>'left_on','YYYYMMDD')
           end left_on
      from jsonb_array_elements(p_students) x;
  delete from _s where me_id is null or name = '';
  update _s set birth = null where birth is not null and (birth >= current_date or birth < date '1990-01-01');
  update _s set guardian_phone = null where guardian_phone !~ '^0[0-9]{8,10}$';

  create temp table _e on commit drop as
    select distinct trim(x->>'class_id') class_id, trim(x->>'student_id') student_id
      from jsonb_array_elements(coalesce(p_enrollments,'[]')) x;
  -- 목록에 없는 반이 나오면 반을 만들어 둡니다(정원 미정).
  insert into _c(me_id, name) select distinct class_id, class_id from _e
   where class_id <> '' and class_id not in (select me_id from _c);
  delete from _e where student_id not in (select me_id from _s) or class_id = '';

  -- 상담 후 미등록: 휴원인데 반이 없는 학생
  update _s set status = '미등록'
   where status = '휴원' and not exists (select 1 from _e where _e.student_id = _s.me_id);

  -- 반: 새 반 기록, 넣기·고치기, 빠진 반은 비활성
  insert into change_log(kind, class_id, after, run_id)
    select '새 반', c.me_id, c.name, v_run from _c c where not exists (select 1 from me_classes m where m.me_id = c.me_id)
       and exists (select 1 from me_classes limit 1);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;
  insert into change_log(kind, class_id, before, run_id)
    select '반 없어짐', m.me_id, m.name, v_run from me_classes m where m.active and m.me_id not in (select me_id from _c);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  insert into me_classes(me_id, name, teacher, cap, target, active, updated_at)
    select me_id, name, teacher, cap, target, true, now() from _c
  on conflict (me_id) do update set name = excluded.name, teacher = excluded.teacher,
     cap = coalesce(excluded.cap, me_classes.cap), target = excluded.target, active = true, updated_at = now();
  update me_classes set active = false, updated_at = now() where active and me_id not in (select me_id from _c);

  -- 원생: 신규·상태 변동 기록 후 넣기
  insert into change_log(kind, student_id, after, run_id)
    select '신규', s.me_id, s.status, v_run from _s s
     where s.status in ('재원','휴원') and not exists (select 1 from me_students m where m.me_id = s.me_id)
       and exists (select 1 from me_students limit 1);          -- 첫 적재 때는 기록하지 않음
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;
  insert into change_log(kind, student_id, before, after, run_id)
    select '상태', s.me_id, m.status, s.status, v_run from _s s join me_students m on m.me_id = s.me_id
     where m.status <> s.status;
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  insert into me_students(me_id, name, school, grade, status, birth, guardian_phone, joined_on, left_on, updated_at)
    select me_id, name, school, grade, status, birth, guardian_phone, joined_on, left_on, now() from _s
  on conflict (me_id) do update set name = excluded.name, school = excluded.school, grade = excluded.grade,
     status = excluded.status, seat_hold = case when excluded.status = '휴원' then me_students.seat_hold else false end, birth = coalesce(excluded.birth, me_students.birth), guardian_phone = excluded.guardian_phone,
     joined_on = excluded.joined_on, left_on = excluded.left_on, updated_at = now();

  -- 수업별 원생: 받은 학생 기준으로 갈아 끼우며 들고 남을 기록
  insert into change_log(kind, student_id, class_id, run_id)
    select '반 빠짐', e.student_id, e.class_id, v_run from me_enrollments e
     where e.student_id in (select me_id from _s)
       and not exists (select 1 from _e n where n.class_id = e.class_id and n.student_id = e.student_id)
       and exists (select 1 from sync_runs r where r.ok);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;
  insert into change_log(kind, student_id, class_id, run_id)
    select '반 들어감', n.student_id, n.class_id, v_run from _e n
     where not exists (select 1 from me_enrollments e where e.class_id = n.class_id and e.student_id = n.student_id)
       and exists (select 1 from sync_runs r where r.ok);
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  delete from me_enrollments e where not (e.manual and coalesce(e.manual_until, 'infinity'::date) >= current_date) and e.student_id in (select me_id from _s)
     and not exists (select 1 from _e n where n.class_id = e.class_id and n.student_id = e.student_id);
  insert into me_enrollments(class_id, student_id) select class_id, student_id from _e on conflict do nothing;

  -- 자리 단계 변화
  insert into change_log(kind, class_id, before, after, run_id)
    select '자리 단계', a.class_id, b.stage, a.stage, v_run
      from public.class_counts() a join _before b on b.class_id = a.class_id
     where a.stage is distinct from b.stage;
  get diagnostics v_n = row_count; v_changes := v_changes + v_n;

  update sync_runs set ok = true,
     students = (select count(*) from _s), classes = (select count(*) from _c),
     enrollments = (select count(*) from _e), changes = v_changes
   where id = v_run;
  return jsonb_build_object('run', v_run, 'students', (select count(*) from _s),
     'classes', (select count(*) from _c), 'enrollments', (select count(*) from _e), 'changes', v_changes);
end $function$;

select '함수 교체 완료' as 단계;

commit;
