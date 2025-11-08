-- Add profit tracking for charting activities
CREATE TABLE IF NOT EXISTS charting_profits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_record_id UUID REFERENCES patient_notes(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL,
  provider_id UUID NOT NULL,
  chart_type TEXT NOT NULL,
  total_amount NUMERIC NOT NULL DEFAULT 100,
  patient_share NUMERIC NOT NULL DEFAULT 40,
  provider_share NUMERIC NOT NULL DEFAULT 50,
  admin_share NUMERIC NOT NULL DEFAULT 10,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE charting_profits ENABLE ROW LEVEL SECURITY;

-- Admins can view all profits
CREATE POLICY "Admins can view all charting profits"
  ON charting_profits FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Providers can view their own profits
CREATE POLICY "Providers can view own charting profits"
  ON charting_profits FOR SELECT
  USING (provider_id = auth.uid());

-- System can insert profits
CREATE POLICY "System can insert charting profits"
  ON charting_profits FOR INSERT
  WITH CHECK (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_charting_profits_patient ON charting_profits(patient_id);
CREATE INDEX IF NOT EXISTS idx_charting_profits_provider ON charting_profits(provider_id);
CREATE INDEX IF NOT EXISTS idx_charting_profits_created ON charting_profits(created_at);

-- Add column to track if care_coins have been distributed for a note
ALTER TABLE patient_notes 
ADD COLUMN IF NOT EXISTS carecoins_distributed BOOLEAN DEFAULT FALSE;

-- Create analytics table for admin
CREATE TABLE IF NOT EXISTS carecoin_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  total_transactions INTEGER DEFAULT 0,
  total_volume NUMERIC DEFAULT 0,
  inflow NUMERIC DEFAULT 0,
  outflow NUMERIC DEFAULT 0,
  charting_revenue NUMERIC DEFAULT 0,
  admin_fees NUMERIC DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date)
);

-- Enable RLS for analytics
ALTER TABLE carecoin_analytics ENABLE ROW LEVEL SECURITY;

-- Only admins can view analytics
CREATE POLICY "Only admins can view carecoin analytics"
  ON carecoin_analytics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert/update analytics
CREATE POLICY "System can manage analytics"
  ON carecoin_analytics FOR ALL
  USING (true);

COMMENT ON TABLE charting_profits IS 'Tracks profit distribution from charting activities: 40% patient, 50% provider, 10% admin';
COMMENT ON TABLE carecoin_analytics IS 'Daily analytics for CareCoins money flow (admin only)';