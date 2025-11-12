-- Add wallet_address column to profiles table to store MetaMask addresses
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;