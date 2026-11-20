-- 20. 원장 미리보기: 원장이 학부모·강사 화면을 그 사람 자료 그대로 들여다봄 (원장만, 읽기만)
create or replace function public.admin_preview_children(p_parent uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c record; s public.me_students%rowtype; v_classes jsonb; v_att jsonb; v_out jsonb := '[]';
begin
  if not public.is_admin() then raise exception '원장만 볼 수 있습니다'; end if;
  for c in select * from children where parent_id = p_parent and status = 'approved' order by created_at loop
    if c.me_student_id is null then
      v_out := v_out || jsonb_build_object('id', c.id, 'linked', false, 'name', c.name, 'solomon_no', c.student_no, 'grade', c.grade);
      continue;
    end if;
    select * into s from me_students where me_id = c.me_student_id;
    select coalesce(jsonb_agg(jsonb_build_object('id', k.me_id, 'name', coalesce(k.display_name, k.name), 'teacher', k.teacher,
                     'weekday', k.weekday, 'starts', to_char(k.starts,'HH24:MI'), 'minutes', k.minutes)
                     order by k.weekday nulls last, k.starts), '[]')
      into v_classes from me_enrollments e join me_classes k on k.me_id = e.class_id and k.active where e.student_id = s.me_id;
    select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status, 'class', a.class_id) order by a.day desc), '[]')
      into v_att from (select day, status, class_id from me_attendance
                        where student_id = s.me_id and day > current_date - 120 order by day desc limit 80) a;
    v_out := v_out || jsonb_build_object('id', c.id, 'linked', true, 'name', s.name, 'solomon_no', coalesce(s.solomon_no, c.student_no), 'status', s.status,
                                         'grade', s.grade, 'school', s.school, 'classes', v_classes, 'attendance', v_att);
  end loop;
  return v_out;
end $$;

create or replace function public.admin_preview_requests(p_parent uuid) returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception '원장만 볼 수 있습니다'; end if;
  return coalesce((select jsonb_agg(jsonb_build_object('id', id, 'child', child_name, 'kind', kind, 'to', to_whom, 'teacher', teacher,
                  'method', method, 'day', wish_day, 'memo', memo, 'status', status, 'created_at', created_at) order by created_at desc)
    from (select * from parent_requests where parent_id = p_parent order by created_at desc limit 30) t), '[]');
end $$;

create or replace function public.admin_teacher_board(p_name text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_name text := public.js_norm_name(p_name); v_out jsonb := '[]'; k record; v_st jsonb;
begin
  if not public.is_admin() then raise exception '원장만 볼 수 있습니다'; end if;
  if v_name = '' then return '[]'; end if;
  for k in select c.me_id, c.name, c.display_name, c.cap from me_classes c
            where c.active and (public.js_norm_name(c.teacher) = v_name or position(v_name in c.name) > 0)
            order by c.name loop
    select coalesce(jsonb_agg(jsonb_build_object(
             'name', s.name, 'grade', s.grade, 'status', s.status,
             'att', (select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status) order by a.day desc), '[]')
                       from (select day, status from me_attendance
                              where student_id = s.me_id and (class_id = '' or class_id = k.me_id)
                              order by day desc limit 4) a)
           ) order by s.name), '[]')
      into v_st
      from me_enrollments e join me_students s on s.me_id = e.student_id
     where e.class_id = k.me_id and s.status in ('재원','휴원');
    v_out := v_out || jsonb_build_object('name', k.name, 'display_name', k.display_name, 'cap', k.cap, 'students', v_st);
  end loop;
  return v_out;
end $$;

-- 미리보기에서 고를 사람 목록 (원장만)
create or replace function public.admin_preview_people() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception '원장만 볼 수 있습니다'; end if;
  return jsonb_build_object(
    'parents', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'kids', (select string_agg(c.name || coalesce(' '||c.grade,''), ', ' order by c.created_at)
                                   from children c where c.parent_id = p.id and c.status = 'approved')) order by p.created_at desc)
                          from profiles p where p.role = 'parent' and p.status = 'approved'
                           and exists (select 1 from children c where c.parent_id = p.id and c.status = 'approved')), '[]'),
    'teachers', coalesce((select jsonb_agg(distinct t) from (
        select public.js_norm_name(teacher) t from me_classes where active and coalesce(teacher,'') <> ''
        union select public.js_norm_name(teacher_name) from profiles where role = 'teacher' and status = 'approved' and coalesce(teacher_name,'') <> '') x
        where t <> ''), '[]'));
end $$;

revoke all on function public.admin_preview_children(uuid), public.admin_preview_requests(uuid), public.admin_teacher_board(text), public.admin_preview_people() from public, anon;
grant execute on function public.admin_preview_children(uuid), public.admin_preview_requests(uuid), public.admin_teacher_board(text), public.admin_preview_people() to authenticated;
select 1;
