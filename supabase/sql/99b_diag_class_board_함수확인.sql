select c.name, c.cap, k.n as 현재인원, k.stage
  from me_classes c join public.class_counts() k on k.class_id = c.me_id
 where c.active
 order by c.name;
