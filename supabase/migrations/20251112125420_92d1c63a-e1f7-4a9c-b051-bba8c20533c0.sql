-- ============================================
-- PHASE 2: SECURITY AUDIT - COMPREHENSIVE FIX
-- ============================================

-- ============================================
-- 1. FIX RLS POLICIES ON DRIVERS TABLE
-- ============================================

DO $$ 
BEGIN
  -- Drop all existing driver policies
  DROP POLICY IF EXISTS "Anyone can view available drivers" ON public.drivers;
  DROP POLICY IF EXISTS "Authenticated users can view basic driver info" ON public.drivers;
  DROP POLICY IF EXISTS "Authenticated users see available drivers" ON public.drivers;
  DROP POLICY IF EXISTS "Drivers can update own profile" ON public.drivers;
  DROP POLICY IF EXISTS "Admins can view all drivers" ON public.drivers;
  DROP POLICY IF EXISTS "Drivers can view and update own profile" ON public.drivers;
  DROP POLICY IF EXISTS "Anyone can view drivers" ON public.drivers;
END $$;

-- Create new secure policies
CREATE POLICY "Authenticated users see available drivers" 
ON public.drivers 
FOR SELECT 
TO authenticated
USING (status = 'online' OR auth.uid() = user_id);

CREATE POLICY "Drivers can update own profile" 
ON public.drivers 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all drivers" 
ON public.drivers 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ============================================
-- 2. FIX FUNCTION SEARCH_PATH
-- ============================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY CASE role
    WHEN 'admin' THEN 1
    WHEN 'doctor' THEN 2
    WHEN 'nurse' THEN 3
    WHEN 'therapist' THEN 4
    WHEN 'pharmacist' THEN 5
    WHEN 'social_worker' THEN 6
    WHEN 'cna' THEN 7
    WHEN 'phlebotomist' THEN 8
    WHEN 'receptionist' THEN 9
    WHEN 'billing' THEN 10
    ELSE 99
  END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.increment_balance(user_id uuid, amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET care_coins_balance = COALESCE(care_coins_balance, 0) + amount
  WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_distance(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  earth_radius NUMERIC := 6371;
  dlat NUMERIC;
  dlon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dlat := radians(lat2 - lat1);
  dlon := radians(lon2 - lon1);
  
  a := sin(dlat/2) * sin(dlat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dlon/2) * sin(dlon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN earth_radius * c;
END;
$$;

-- ============================================
-- 3. CARECOIN RATE LIMITING
-- ============================================

CREATE TABLE IF NOT EXISTS public.carecoin_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mint_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mint_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mint_date)
);

ALTER TABLE public.carecoin_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rate limits" ON public.carecoin_rate_limits;
DROP POLICY IF EXISTS "Admins can view all rate limits" ON public.carecoin_rate_limits;

CREATE POLICY "Users can view own rate limits" 
ON public.carecoin_rate_limits 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all rate limits" 
ON public.carecoin_rate_limits 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_carecoin_rate_limits_user_date 
ON public.carecoin_rate_limits(user_id, mint_date);

CREATE OR REPLACE FUNCTION public.check_carecoin_rate_limit(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  max_mints_per_day INTEGER := 100;
BEGIN
  SELECT COALESCE(mint_count, 0) INTO current_count
  FROM public.carecoin_rate_limits
  WHERE user_id = _user_id AND mint_date = CURRENT_DATE;
  
  IF current_count >= max_mints_per_day THEN
    RETURN false;
  END IF;
  
  INSERT INTO public.carecoin_rate_limits (user_id, mint_date, mint_count)
  VALUES (_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, mint_date) 
  DO UPDATE SET 
    mint_count = public.carecoin_rate_limits.mint_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$$;

-- ============================================
-- 4. MULTI-SIG WALLET INFRASTRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS public.multisig_signers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  signer_wallet_address TEXT NOT NULL,
  signer_role TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(wallet_address, signer_wallet_address)
);

ALTER TABLE public.multisig_signers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage multisig signers" ON public.multisig_signers;

CREATE POLICY "Admins can manage multisig signers" 
ON public.multisig_signers 
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.multisig_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  transaction_type TEXT NOT NULL,
  to_address TEXT,
  amount NUMERIC,
  transaction_data JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  required_signatures INTEGER NOT NULL DEFAULT 2,
  current_signatures INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

ALTER TABLE public.multisig_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage multisig transactions" ON public.multisig_transactions;

CREATE POLICY "Admins can manage multisig transactions" 
ON public.multisig_transactions 
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_multisig_transactions_status 
ON public.multisig_transactions(status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.multisig_signatures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID NOT NULL REFERENCES public.multisig_transactions(id) ON DELETE CASCADE,
  signer_wallet_address TEXT NOT NULL,
  signer_user_id UUID REFERENCES auth.users(id),
  signature TEXT NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(transaction_id, signer_wallet_address)
);

ALTER TABLE public.multisig_signatures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view multisig signatures" ON public.multisig_signatures;
DROP POLICY IF EXISTS "Signers can add signatures" ON public.multisig_signatures;

CREATE POLICY "Admins can view multisig signatures" 
ON public.multisig_signatures 
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Signers can add signatures" 
ON public.multisig_signatures 
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') AND
  EXISTS (
    SELECT 1 FROM public.multisig_signers ms
    WHERE ms.signer_wallet_address = multisig_signatures.signer_wallet_address
    AND ms.is_active = true
  )
);

-- ============================================
-- 5. UPDATE CARECOIN DISTRIBUTION
-- ============================================

CREATE OR REPLACE FUNCTION public.distribute_carecoins_on_data_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  provider_user_id UUID;
  patient_user_id UUID;
  operation_type TEXT;
  chart_type_name TEXT;
  rate_limit_ok BOOLEAN;
BEGIN
  IF TG_OP = 'INSERT' THEN
    chart_type_name := TG_TABLE_NAME || '_insert';
  ELSIF TG_OP = 'UPDATE' THEN
    chart_type_name := TG_TABLE_NAME || '_update';
  ELSE
    chart_type_name := TG_TABLE_NAME || '_delete';
  END IF;

  provider_user_id := auth.uid();
  
  IF provider_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  rate_limit_ok := public.check_carecoin_rate_limit(provider_user_id);
  
  IF NOT rate_limit_ok THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  INSERT INTO public.charting_profits (
    patient_id,
    provider_id,
    chart_type,
    chart_record_id,
    total_amount,
    patient_share,
    provider_share,
    admin_share,
    status
  ) VALUES (
    COALESCE(NEW.patient_id, OLD.patient_id),
    provider_user_id,
    chart_type_name,
    COALESCE(NEW.id, OLD.id),
    100,
    40,
    50,
    10,
    'pending'
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================
-- 6. SECURITY AUDIT LOG
-- ============================================

CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address TEXT,
  user_agent TEXT,
  details JSONB,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view security logs" ON public.security_audit_log;

CREATE POLICY "Admins can view security logs" 
ON public.security_audit_log 
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_security_audit_log_created 
ON public.security_audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_audit_log_severity 
ON public.security_audit_log(severity, created_at DESC);