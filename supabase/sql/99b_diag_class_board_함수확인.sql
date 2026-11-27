select pg_get_functiondef(oid) from pg_proc where proname = 'admin_ops_stats';
