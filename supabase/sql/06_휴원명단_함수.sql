begin;

-- 한눈에 현황(지점별 카드)에서 "휴원" 숫자를 눌렀을 때 누가 휴원 중인지 보여 주는 함수.
-- 2026-11-28: 원장님 요청("휴원 숫자 누르면 누군지 나오도록")으로 신설.
-- branch_week_absences와 같은 권한 방식(직원 + 해당 지점 권한)을 써서 지점장도 자기 지점은 볼 수 있다.
create or replace function public.branch_paused_students(p_branch text)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
begin
  if not public.is_staff() then raise exception '직원만 볼 수 있습니다'; end if;
  if not public.can_branch(p_branch) then raise exception '지점 권한이 없습니다'; end if;
  return coalesce((
    with cls as (
      select e.student_id, string_agg(distinct coalesce(c.display_name, c.name), ', ') cls,
             min(public.js_norm_name(c.teacher)) teacher
      from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active
      group by 1
    )
    select jsonb_agg(jsonb_build_object(
        'id', s.me_id, 'name', s.name, 'grade', s.grade,
        'class', cls.cls, 'teacher', cls.teacher
      ) order by s.name)
    from me_students s left join cls on cls.student_id = s.me_id
    where s.branch_id = p_branch and s.status = '휴원'
  ), '[]');
end
$function$;

select '함수 생성 완료' as 단계;
commit;
