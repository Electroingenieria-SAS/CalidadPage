update public.app_modules set tags=array['app']::text[] where cardinality(tags)=0;
update public.documents set tags=array['documento']::text[] where cardinality(tags)=0;
update public.news_posts set tags=array['noticia']::text[] where cardinality(tags)=0;
update public.audit_reports set tags=array['auditoria']::text[] where cardinality(tags)=0;
update public.publications set tags=array['publicacion']::text[] where cardinality(tags)=0;
