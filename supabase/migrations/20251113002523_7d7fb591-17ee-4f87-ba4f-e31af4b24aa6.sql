-- Add missing columns to carecoin_deployment_status
ALTER TABLE carecoin_deployment_status
ADD COLUMN IF NOT EXISTS liquidity_pool_address TEXT,
ADD COLUMN IF NOT EXISTS polygonscan_verified BOOLEAN DEFAULT false;

-- Add missing columns to gas_wallet_monitoring
ALTER TABLE gas_wallet_monitoring
ADD COLUMN IF NOT EXISTS total_gas_spent NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS transaction_count INTEGER DEFAULT 0;