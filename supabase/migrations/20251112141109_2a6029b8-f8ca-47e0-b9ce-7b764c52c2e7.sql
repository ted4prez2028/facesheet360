-- Create virtual_cards table for CareCoin virtual card management
CREATE TABLE IF NOT EXISTS public.virtual_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_type TEXT NOT NULL DEFAULT 'virtual' CHECK (card_type IN ('virtual', 'physical')),
  card_number TEXT,
  last_four TEXT,
  cvv_encrypted TEXT,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'cancelled')),
  limit_amount NUMERIC NOT NULL DEFAULT 500,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indices for virtual_cards
CREATE INDEX IF NOT EXISTS idx_virtual_cards_user_id ON public.virtual_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_virtual_cards_status ON public.virtual_cards(status);

-- Enable RLS on virtual_cards
ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;

-- RLS policies for virtual_cards
CREATE POLICY "Users can view own virtual cards"
  ON public.virtual_cards FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own virtual cards"
  ON public.virtual_cards FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own virtual cards"
  ON public.virtual_cards FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all virtual cards"
  ON public.virtual_cards FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Fix bill_payments table to ensure proper schema
ALTER TABLE public.bill_payments 
  DROP COLUMN IF EXISTS care_coins_amount,
  DROP COLUMN IF EXISTS biller_name;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_payments' AND column_name = 'bill_type') THEN
    ALTER TABLE public.bill_payments ADD COLUMN bill_type TEXT NOT NULL DEFAULT 'other';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_payments' AND column_name = 'recipient_name') THEN
    ALTER TABLE public.bill_payments ADD COLUMN recipient_name TEXT NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_payments' AND column_name = 'recipient_account') THEN
    ALTER TABLE public.bill_payments ADD COLUMN recipient_account TEXT NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bill_payments' AND column_name = 'bill_info') THEN
    ALTER TABLE public.bill_payments ADD COLUMN bill_info JSONB;
  END IF;
END $$;

-- Update trigger for virtual_cards
CREATE OR REPLACE FUNCTION public.update_virtual_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_virtual_cards_updated_at
  BEFORE UPDATE ON public.virtual_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_virtual_cards_updated_at();