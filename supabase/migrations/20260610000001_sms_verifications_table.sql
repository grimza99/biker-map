CREATE TABLE public.sms_verifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sms_verifications_user_id ON public.sms_verifications(user_id);
