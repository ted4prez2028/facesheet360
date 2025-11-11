-- Enable realtime for patient vitals monitoring
ALTER TABLE patient_vitals REPLICA IDENTITY FULL;
ALTER TABLE medication_administration_records REPLICA IDENTITY FULL;
ALTER TABLE lab_results REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE patient_vitals;
ALTER PUBLICATION supabase_realtime ADD TABLE medication_administration_records;
ALTER PUBLICATION supabase_realtime ADD TABLE lab_results;