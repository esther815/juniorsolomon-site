select proname, pg_get_functiondef(oid) as def from pg_proc where proname in ('branch_overview','branch_week_absences') order by proname;
