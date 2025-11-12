-- Create cashout_requests table to track all cash-out requests
CREATE TABLE IF NOT EXISTS public.cashout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  usd_amount DECIMAL(10, 2) NOT NULL CHECK (usd_amount > 0),
  exchange_rate DECIMAL(10, 4) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'paypal', 'venmo', 'amazon_gift_card', 'visa_gift_card', 'mastercard_gift_card')),
  account_info JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_hash TEXT,
  failure_reason TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on cashout_requests
ALTER TABLE public.cashout_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own cashout requests
CREATE POLICY "Users can view their own cashout requests"
ON public.cashout_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own cashout requests
CREATE POLICY "Users can create their own cashout requests"
ON public.cashout_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all cashout requests
CREATE POLICY "Admins can view all cashout requests"
ON public.cashout_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update cashout requests
CREATE POLICY "Admins can update cashout requests"
ON public.cashout_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_cashout_requests_user_id ON public.cashout_requests(user_id);
CREATE INDEX idx_cashout_requests_status ON public.cashout_requests(status);
CREATE INDEX idx_cashout_requests_created_at ON public.cashout_requests(created_at DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_cashout_requests_updated_at
BEFORE UPDATE ON public.cashout_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();