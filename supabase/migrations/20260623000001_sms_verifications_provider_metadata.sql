alter table public.sms_verifications
add column if not exists provider text,
add column if not exists provider_request_id text,
add column if not exists sent_at timestamp with time zone,
add column if not exists verified_at timestamp with time zone;

create index if not exists idx_sms_verifications_user_phone_created_at
on public.sms_verifications(user_id, phone_number, created_at desc);
