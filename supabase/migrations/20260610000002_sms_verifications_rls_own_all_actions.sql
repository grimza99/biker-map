alter table public.sms_verifications enable row level security;

drop policy if exists "Users can view own sms verifications"
on public.sms_verifications;

drop policy if exists "Users can insert own sms verifications"
on public.sms_verifications;

drop policy if exists "Users can update own sms verifications"
on public.sms_verifications;


create policy "Users can view own sms verifications"
on public.sms_verifications
for select
using (
  auth.uid() = user_id
);

create policy "Users can insert own sms verifications"
on public.sms_verifications
for insert
with check (
  auth.uid() = user_id
);

create policy "Users can update own sms verifications"
on public.sms_verifications
for update
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);