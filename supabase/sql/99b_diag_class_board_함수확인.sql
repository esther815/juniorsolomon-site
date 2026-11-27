select proname, pg_get_functiondef(oid) as def
from pg_proc
where proname in ('staff_requests','my_notices','teacher_assignments','my_assignments','feedback_week','my_makeup','makeup_board','is_admin')
order by proname;
