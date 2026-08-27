do $$
declare t text;
begin
  foreach t in array array['app_modules','documents','news_posts','audit_reports','publications'] loop
    execute format('drop trigger if exists portal_identity_lock_mask on public.%I', t);
    execute format('create trigger portal_identity_lock_mask before insert or update on public.%I for each row execute function private.portal_apply_identity_lock()', t);
  end loop;
end $$;
