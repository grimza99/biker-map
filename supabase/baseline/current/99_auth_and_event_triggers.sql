-- Triggers outside the public application tables.
-- Keep this file separate because it touches auth.users and event triggers.

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create event trigger ensure_rls
on ddl_command_end
execute function public.rls_auto_enable();
