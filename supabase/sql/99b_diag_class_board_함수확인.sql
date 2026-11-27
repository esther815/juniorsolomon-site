select proname, pg_get_functiondef(oid) as def from pg_proc where proname='admin_ops_group';
