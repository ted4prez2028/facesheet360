-- Create table to store global CareCoin contract information
CREATE TABLE public.carecoin_contract (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_address TEXT NOT NULL UNIQUE,
  deployer_address TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'sepolia',
  transaction_hash TEXT,
  deployed_by UUID REFERENCES auth.users(id),
  contract_details JSONB,
  abi JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.carecoin_contract ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the contract info
CREATE POLICY "Anyone can view CareCoin contract info" 
ON public.carecoin_contract 
FOR SELECT 
USING (true);

-- Only authenticated users can create contract records
CREATE POLICY "Authenticated users can deploy CareCoin" 
ON public.carecoin_contract 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND deployed_by = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_carecoin_contract_updated_at
BEFORE UPDATE ON public.carecoin_contract
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();