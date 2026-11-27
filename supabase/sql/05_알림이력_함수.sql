begin;

-- 알림 이력(알림함): 공지·상담요청·가입승인대기·과제제출을 시간순으로 모아 보여주는 함수.
-- 2026-11-27: 원장님 요청("어떤 것 때문에 알림이 왔는지 확인, 클릭하면 해당 상황으로 이동")으로 신설.
create or replace function public.recent_activity(p_limit int default 40)
returns jsonb
language plpgsql
stable security definer
set search_path to 'public'
as $function$
declare
  p public.profiles%rowtype;
  staff boolean := public.is_staff();
  adm boolean := public.is_admin();
  v_name text;
begin
  select * into p from profiles where id = auth.uid();
  if not found then return '[]'; end if;
  if not staff and not (p.role = 'teacher' and p.status = 'approved') then
    return '[]';
  end if;
  v_name := public.js_norm_name(p.teacher_name);

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'kind', t.kind, 'go', t.go, 'goarg', t.goarg,
      'title', t.title, 'detail', t.detail, 'created_at', t.created_at
    ) order by t.created_at desc)
    from (
      select 'notice'::text as kind, 'notice'::text as go, null::text as goarg,
             n.title as title, left(coalesce(n.body,''),60) as detail, n.created_at as created_at
      from notices n
      where n.created_at > now() - interval '30 days'
        and (adm or n.branch_id is null or n.branch_id = p.branch_id)
        and (adm or p.role in ('desk','manager') or (p.role='teacher' and n.audience in ('staff','all')))

      union all
      select 'sreq', 'sreq', null,
             r.kind || ' · ' || r.child_name, coalesce(r.memo,''), r.created_at
      from parent_requests r
      where r.created_at > now() - interval '30 days'
        and (case when staff then public.can_branch(r.branch_id)
                  else (r.to_whom='담임' or r.kind='상담 신청') and v_name <> '' and public.js_norm_name(r.teacher) = v_name end)

      union all
      select 'approve', 'approve', null,
             (case when pr.role='teacher' then coalesce(pr.teacher_name,'강사')||' 선생님 가입 신청'
                   when pr.role='desk' then coalesce(pr.nickname,'데스크')||' 가입 신청'
                   else coalesce(pr.nickname,'학부모')||' 가입 신청' end),
             '', pr.created_at
      from profiles pr
      where adm and pr.status='pending' and pr.created_at > now() - interval '30 days'

      union all
      select 'approve', 'approve', null,
             c.name || ' 자녀 추가 대기', '', c.created_at
      from children c
      where adm and c.status='pending' and c.created_at > now() - interval '30 days'

      union all
      select 'asg', 'asg', (a.id::text || '|' || s.me_id::text),
             s.name || ' 과제 제출', a.title, x.submitted_at
      from assignment_submissions x
      join assignments a on a.id = x.assignment_id
      join me_students s on s.me_id = x.me_student_id
      where x.status='제출' and x.submitted_at is not null and x.submitted_at > now() - interval '30 days'
        and (staff or a.created_by = auth.uid())

      order by created_at desc
      limit p_limit
    ) t
  ), '[]');
end
$function$;

select '함수 교체 완료' as 단계;
commit;
