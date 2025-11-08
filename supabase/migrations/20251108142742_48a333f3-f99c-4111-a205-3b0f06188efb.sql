-- Create pharmacy inventory table
CREATE TABLE IF NOT EXISTS public.pharmacy_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name TEXT NOT NULL,
  ndc_code TEXT,
  quantity NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'tablets',
  reorder_threshold NUMERIC NOT NULL DEFAULT 50,
  reorder_quantity NUMERIC NOT NULL DEFAULT 100,
  location TEXT, -- Pixis location
  expiration_date DATE,
  lot_number TEXT,
  cost_per_unit NUMERIC,
  last_restocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prescription fills tracking table
CREATE TABLE IF NOT EXISTS public.prescription_fills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_order_id UUID REFERENCES medication_orders(id),
  patient_id UUID REFERENCES patients(id) NOT NULL,
  medication_name TEXT NOT NULL,
  filled_by UUID REFERENCES auth.users(id),
  filled_at TIMESTAMPTZ DEFAULT NOW(),
  quantity_filled NUMERIC NOT NULL,
  inventory_id UUID REFERENCES pharmacy_inventory(id),
  status TEXT DEFAULT 'filled' CHECK (status IN ('filled', 'verified', 'dispensed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create medication administration records (MAR)
CREATE TABLE IF NOT EXISTS public.medication_administration_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_order_id UUID REFERENCES medication_orders(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route TEXT,
  administered_by UUID REFERENCES auth.users(id) NOT NULL,
  administered_at TIMESTAMPTZ NOT NULL,
  scheduled_time TIMESTAMPTZ,
  status TEXT DEFAULT 'given' CHECK (status IN ('given', 'refused', 'held', 'missed', 'late')),
  reason TEXT, -- for refused, held, missed
  site TEXT, -- injection site if applicable
  witness_id UUID REFERENCES auth.users(id), -- for controlled substances
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create prescription deliveries table
CREATE TABLE IF NOT EXISTS public.prescription_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_fill_id UUID REFERENCES prescription_fills(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) NOT NULL,
  delivery_method TEXT DEFAULT 'nurse' CHECK (delivery_method IN ('nurse', 'courier', 'patient_pickup', 'pixis')),
  assigned_to UUID REFERENCES auth.users(id),
  room_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'failed', 'returned')),
  scheduled_delivery_time TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  delivered_by UUID REFERENCES auth.users(id),
  signature_required BOOLEAN DEFAULT true,
  signature_obtained BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create pharmacy analytics table for predictive insights
CREATE TABLE IF NOT EXISTS public.pharmacy_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name TEXT NOT NULL,
  patient_id UUID REFERENCES patients(id),
  metric_type TEXT NOT NULL CHECK (metric_type IN ('daily_usage', 'refill_pattern', 'adherence_rate', 'stock_projection')),
  metric_value NUMERIC NOT NULL,
  projection_date DATE,
  confidence_score NUMERIC, -- 0-1 confidence in prediction
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pharmacy_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_fills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_administration_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pharmacy_inventory
CREATE POLICY "Pharmacists can manage inventory"
  ON public.pharmacy_inventory FOR ALL
  USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can view inventory"
  ON public.pharmacy_inventory FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'pharmacist'::app_role));

-- RLS Policies for prescription_fills
CREATE POLICY "Pharmacists can manage prescription fills"
  ON public.prescription_fills FOR ALL
  USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can view prescription fills"
  ON public.prescription_fills FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'pharmacist'::app_role));

-- RLS Policies for medication_administration_records
CREATE POLICY "Healthcare staff can create MAR"
  ON public.medication_administration_records FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'pharmacist'::app_role));

CREATE POLICY "Healthcare staff can view MAR"
  ON public.medication_administration_records FOR SELECT
  USING (has_role(auth.uid(), 'doctor'::app_role) OR has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Healthcare staff can update MAR"
  ON public.medication_administration_records FOR UPDATE
  USING (has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

-- RLS Policies for prescription_deliveries
CREATE POLICY "Healthcare staff can manage deliveries"
  ON public.prescription_deliveries FOR ALL
  USING (has_role(auth.uid(), 'nurse'::app_role) OR has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for pharmacy_analytics
CREATE POLICY "Pharmacists and admins can view analytics"
  ON public.pharmacy_analytics FOR SELECT
  USING (has_role(auth.uid(), 'pharmacist'::app_role) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'doctor'::app_role));

CREATE POLICY "System can insert analytics"
  ON public.pharmacy_analytics FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_pharmacy_inventory_medication ON pharmacy_inventory(medication_name);
CREATE INDEX idx_pharmacy_inventory_location ON pharmacy_inventory(location);
CREATE INDEX idx_pharmacy_inventory_expiration ON pharmacy_inventory(expiration_date);
CREATE INDEX idx_prescription_fills_patient ON prescription_fills(patient_id);
CREATE INDEX idx_prescription_fills_order ON prescription_fills(medication_order_id);
CREATE INDEX idx_mar_patient ON medication_administration_records(patient_id);
CREATE INDEX idx_mar_administered_at ON medication_administration_records(administered_at);
CREATE INDEX idx_mar_order ON medication_administration_records(medication_order_id);
CREATE INDEX idx_deliveries_status ON prescription_deliveries(status);
CREATE INDEX idx_deliveries_patient ON prescription_deliveries(patient_id);
CREATE INDEX idx_analytics_medication ON pharmacy_analytics(medication_name);
CREATE INDEX idx_analytics_patient ON pharmacy_analytics(patient_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pharmacy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_pharmacy_inventory_timestamp
  BEFORE UPDATE ON pharmacy_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_pharmacy_updated_at();

CREATE TRIGGER update_prescription_deliveries_timestamp
  BEFORE UPDATE ON prescription_deliveries
  FOR EACH ROW
  EXECUTE FUNCTION update_pharmacy_updated_at();