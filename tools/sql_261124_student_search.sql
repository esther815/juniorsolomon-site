-- 2026-11-24 학생 검색(원장·관리자 전용) + 학생 카드 확장 + SL 레벨 직접 지정
create table if not exists public.student_levels(
  student_id text primary key,
  sl smallint not null check (sl between 1 and 14),
  set_by uuid,
  set_at timestamptz not null default now()
);
alter table public.student_levels enable row level security;

create or replace function public.student_level_set(p_id text, p_sl int) returns void
language plpgsql security definer set search_path to 'public' as $f$
begin
  if not public.is_staff() then raise exception '원장·관리자만 바꿀 수 있습니다'; end if;
  if p_sl is null then delete from student_levels where student_id = p_id; return; end if;
  if p_sl < 1 or p_sl > 14 then raise exception 'SL은 1~14 사이입니다'; end if;
  insert into student_levels(student_id, sl, set_by, set_at) values (p_id, p_sl, auth.uid(), now())
  on conflict (student_id) do update set sl = excluded.sl, set_by = excluded.set_by, set_at = now();
end $f$;

create or replace function public.student_search(p_q text) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $f$
declare q text := btrim(coalesce(p_q,'')); qd text; v jsonb; vw jsonb;
begin
  if not public.is_staff() then return '[]'; end if;   -- 강사·학부모는 검색 불가
  if char_length(q) < 1 then return '[]'; end if;
  qd := case when upper(replace(q,' ','')) ~ '^(JS-?)?[0-9]+$' then regexp_replace(upper(replace(q,' ','')),'^JS-?','') end;
  select coalesce(jsonb_agg(x order by ord, nm), '[]') into v from (
    select jsonb_build_object(
      'id', s.me_id, 'name', regexp_replace(s.name,'\s*[0-9]+$',''), 'grade', s.grade, 'status', s.status,
      'by', to_char(s.birth,'YYYY'), 'ph4', right(regexp_replace(coalesce(s.guardian_phone,''),'[^0-9]','','g'),4),
      'no', s.solomon_no, 'left_on', s.left_on,
      'cls', (select coalesce(c.display_name,c.name) || coalesce(' · '||(array['일','월','화','수','목','금','토'])[c.weekday+1]||' '||to_char(c.starts,'HH24:MI'),'')
              from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active
              where e.student_id = s.me_id order by c.weekday, c.starts limit 1)) x,
      case s.status when '재원' then 0 when '휴원' then 1 when '미등록' then 2 else 3 end ord, s.name nm
    from me_students s
    where regexp_replace(s.name,'\s*[0-9]+$','') like '%'||q||'%'
       or (qd is not null and upper(coalesce(s.solomon_no,'')) like '%'||qd||'%')
    order by ord, s.name limit 30) t;
  select coalesce(jsonb_agg(y), '[]') into vw from (
    select jsonb_build_object('wl', w.id, 'name', w.child_name, 'grade', w.grade, 'status', '대기',
      'ph4', right(regexp_replace(coalesce(w.phone,''),'[^0-9]','','g'),4), 'cls', w.class_label) y
    from waitlist w where w.status = '대기' and qd is null and w.child_name like '%'||q||'%'
    order by w.created_at limit 10) t2;
  return v || vw;
end $f$;

create or replace function public.student_card(p_id text) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $f$
declare st me_students%rowtype; v_staff boolean := public.is_staff(); v_today date := (now() at time zone 'Asia/Seoul')::date;
  v_ph text; v_pn text; v_pp text; v_ps text; v_sp text;
begin
  if not public.can_see_student(p_id) then raise exception '볼 수 없는 학생입니다'; end if;
  select * into st from me_students where me_id = p_id;
  if not found then raise exception '학생을 찾지 못했습니다'; end if;
  v_ph := regexp_replace(coalesce(st.guardian_phone,''),'[^0-9]','','g');
  select p.nickname, p.phone, p.status, ch.student_phone into v_pn, v_pp, v_ps, v_sp
    from children ch join profiles p on p.id = ch.parent_id
    where ch.me_student_id = p_id order by (ch.status='approved') desc, ch.updated_at desc nulls last limit 1;
  return jsonb_build_object(
    'id', st.me_id, 'name', regexp_replace(st.name,'\s*[0-9]+$',''), 'school', st.school, 'grade', st.grade, 'status', st.status,
    'no', st.solomon_no, 'birth', case when v_staff then st.birth end,
    'joined_on', st.joined_on, 'left_on', st.left_on, 'staff', v_staff,
    'sl', (select sl from student_levels where student_id = p_id),
    'phone', case when v_staff then st.guardian_phone end,
    'student_phone', case when v_staff then v_sp end,
    'classes', coalesce((select jsonb_agg(jsonb_build_object('id', c.me_id, 'name', coalesce(c.display_name, c.name), 'teacher', c.teacher, 'weekday', c.weekday, 'starts', c.starts, 'minutes', c.minutes) order by c.weekday, c.starts)
                from me_enrollments e join me_classes c on c.me_id = e.class_id and c.active where e.student_id = p_id), '[]'),
    'att', coalesce((select jsonb_agg(jsonb_build_object('day', day, 'status', status) order by day desc) from (select day, status from me_attendance where student_id = p_id order by day desc limit 8) a), '[]'),
    'abs30', (select count(*) from me_attendance where student_id = p_id and day > v_today - 30 and status = '결석'),
    'late30', (select count(*) from me_attendance where student_id = p_id and day > v_today - 30 and status = '지각'),
    'etc30', (select count(*) from me_attendance where student_id = p_id and day > v_today - 30 and status not in ('출석','결석','지각')),
    'tickets', coalesce((select jsonb_agg(jsonb_build_object('absent_day', t.absent_day, 'expires', t.expires, 'status', t.status, 'issued_at', t.issued_at,
                'booked', exists (select 1 from makeup_bookings b where b.ticket_id = t.id and b.status in ('신청','출석','결석'))) order by t.issued_at desc)
                from makeup_tickets t where t.me_student_id = p_id and t.issued_at > now() - interval '120 days'), '[]'),
    'upcoming', coalesce((select jsonb_agg(jsonb_build_object('day', z.day, 'starts', z.starts, 'teacher', z.teacher_name) order by z.day, z.starts)
                from makeup_bookings b join makeup_tickets t on t.id = b.ticket_id join makeup_slots z on z.id = b.slot_id
                where t.me_student_id = p_id and b.status = '신청' and z.day >= v_today), '[]'),
    'pay', case when v_staff then coalesce((select jsonb_agg(jsonb_build_object('month', month, 'billed', billed, 'paid', paid, 'unpaid', unpaid, 'status', status) order by month desc)
                from me_payments where name = st.name and grade is not distinct from st.grade), '[]') end,
    'feedback', coalesce((select jsonb_agg(jsonb_build_object('day', lesson_day, 'class', class_name, 'kind', kind, 'body', left(body, 400)) order by lesson_day desc)
                from (select f.* from class_feedback f where f.class_id in (select class_id from me_enrollments where student_id = p_id) order by f.lesson_day desc limit 3) f), '[]'),
    'asg', jsonb_build_object(
      'sent', (select count(*) from assignment_targets where me_student_id = p_id),
      'done', (select count(*) from assignment_submissions where me_student_id = p_id and status in ('제출','확인'))),
    'parent', jsonb_build_object(
      'linked', exists (select 1 from children where me_student_id = p_id and status = 'approved'),
      'pending', exists (select 1 from children where me_student_id = p_id and status = 'pending'),
      'name', case when v_staff then v_pn end,
      'phone', case when v_staff then v_pp end,
      'acct', v_ps),
    'requests', coalesce((select jsonb_agg(jsonb_build_object('kind', r.kind, 'status', r.status, 'at', r.created_at, 'day', r.wish_day) order by r.created_at desc)
                from (select pr2.* from parent_requests pr2 join children ch on ch.id = pr2.child_id where ch.me_student_id = p_id order by pr2.created_at desc limit 8) r), '[]'),
    'consults', case when v_staff and char_length(v_ph) >= 9 then coalesce((select jsonb_agg(jsonb_build_object('kind', c.kind, 'wish', left(c.wish,60), 'at', c.created_at, 'done', c.handled_at is not null) order by c.created_at desc)
                from (select * from consult_requests c where regexp_replace(coalesce(c.phone,''),'[^0-9]','','g') = v_ph order by created_at desc limit 5) c), '[]') end,
    'notes', coalesce((select jsonb_agg(jsonb_build_object('kind', kind, 'memo', memo, 'author', author, 'at', created_at) order by created_at desc)
                from (select * from student_notes where student_id = p_id order by created_at desc limit 10) n), '[]'));
end $f$;

-- 강사 「내 반 출결」: 학생 이름을 누르면 학생 카드(연락처·수납 없음)로 가도록 id 추가
create or replace function public.my_teacher_board() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $f$
declare p public.profiles%rowtype; v_name text; v_out jsonb := '[]'; k record; v_st jsonb;
begin
  select * into p from profiles where id = auth.uid();
  if not found or p.role <> 'teacher' or p.status <> 'approved' then return '[]'; end if;
  v_name := public.js_norm_name(p.teacher_name); if v_name = '' then return '[]'; end if;
  for k in select c.me_id, c.name, c.display_name, c.cap from me_classes c where c.active and (public.js_norm_name(c.teacher) = v_name or position(v_name in c.name) > 0) order by c.name loop
    select coalesce(jsonb_agg(jsonb_build_object('id', s.me_id, 'name', s.name, 'grade', s.grade, 'status', s.status,
      'att', (select coalesce(jsonb_agg(jsonb_build_object('day', a.day, 'status', a.status) order by a.day desc), '[]') from (select day, status from me_attendance where student_id = s.me_id and (class_id = '' or class_id = k.me_id) order by day desc limit 4) a)
      ) order by s.name), '[]') into v_st
    from me_enrollments e join me_students s on s.me_id = e.student_id where e.class_id = k.me_id and s.status in ('재원','휴원');
    v_out := v_out || jsonb_build_object('name', k.name, 'display_name', k.display_name, 'cap', k.cap, 'students', v_st);
  end loop;
  return v_out;
end $f$;
