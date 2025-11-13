-- Fix RLS policies for all patient-related tables
-- Medication Orders
DROP POLICY IF EXISTS "Healthcare staff can view medication orders" ON medication_orders;
DROP POLICY IF EXISTS "Healthcare staff can insert medication orders" ON medication_orders;
DROP POLICY IF EXISTS "Healthcare staff can update medication orders" ON medication_orders;
DROP POLICY IF EXISTS "Healthcare staff can delete medication orders" ON medication_orders;

CREATE POLICY "Healthcare staff can view medication orders"
ON medication_orders FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'pharmacist']::text[]));

CREATE POLICY "Healthcare staff can insert medication orders"
ON medication_orders FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'pharmacist']::text[]));

CREATE POLICY "Healthcare staff can update medication orders"
ON medication_orders FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'pharmacist']::text[]));

CREATE POLICY "Healthcare staff can delete medication orders"
ON medication_orders FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Allergies
DROP POLICY IF EXISTS "Healthcare staff can view allergies" ON allergies;
DROP POLICY IF EXISTS "Healthcare staff can insert allergies" ON allergies;
DROP POLICY IF EXISTS "Healthcare staff can update allergies" ON allergies;
DROP POLICY IF EXISTS "Healthcare staff can delete allergies" ON allergies;

CREATE POLICY "Healthcare staff can view allergies"
ON allergies FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'pharmacist']::text[]));

CREATE POLICY "Healthcare staff can insert allergies"
ON allergies FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can update allergies"
ON allergies FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can delete allergies"
ON allergies FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Immunizations
DROP POLICY IF EXISTS "Healthcare staff can view immunizations" ON immunizations;
DROP POLICY IF EXISTS "Healthcare staff can insert immunizations" ON immunizations;
DROP POLICY IF EXISTS "Healthcare staff can update immunizations" ON immunizations;
DROP POLICY IF EXISTS "Healthcare staff can delete immunizations" ON immunizations;

CREATE POLICY "Healthcare staff can view immunizations"
ON immunizations FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can insert immunizations"
ON immunizations FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can update immunizations"
ON immunizations FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can delete immunizations"
ON immunizations FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Medical Diagnoses
DROP POLICY IF EXISTS "Healthcare staff can view diagnoses" ON medical_diagnoses;
DROP POLICY IF EXISTS "Healthcare staff can insert diagnoses" ON medical_diagnoses;
DROP POLICY IF EXISTS "Healthcare staff can update diagnoses" ON medical_diagnoses;
DROP POLICY IF EXISTS "Healthcare staff can delete diagnoses" ON medical_diagnoses;

CREATE POLICY "Healthcare staff can view diagnoses"
ON medical_diagnoses FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist']::text[]));

CREATE POLICY "Healthcare staff can insert diagnoses"
ON medical_diagnoses FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

CREATE POLICY "Healthcare staff can update diagnoses"
ON medical_diagnoses FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

CREATE POLICY "Healthcare staff can delete diagnoses"
ON medical_diagnoses FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Lab Results
DROP POLICY IF EXISTS "Healthcare staff can view lab results" ON lab_results;
DROP POLICY IF EXISTS "Healthcare staff can insert lab results" ON lab_results;
DROP POLICY IF EXISTS "Healthcare staff can update lab results" ON lab_results;
DROP POLICY IF EXISTS "Healthcare staff can delete lab results" ON lab_results;

CREATE POLICY "Healthcare staff can view lab results"
ON lab_results FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'phlebotomist']::text[]));

CREATE POLICY "Healthcare staff can insert lab results"
ON lab_results FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'phlebotomist']::text[]));

CREATE POLICY "Healthcare staff can update lab results"
ON lab_results FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'phlebotomist']::text[]));

CREATE POLICY "Healthcare staff can delete lab results"
ON lab_results FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Wound Assessments
DROP POLICY IF EXISTS "Healthcare staff can view wound assessments" ON wound_assessments;
DROP POLICY IF EXISTS "Healthcare staff can insert wound assessments" ON wound_assessments;
DROP POLICY IF EXISTS "Healthcare staff can update wound assessments" ON wound_assessments;
DROP POLICY IF EXISTS "Healthcare staff can delete wound assessments" ON wound_assessments;

CREATE POLICY "Healthcare staff can view wound assessments"
ON wound_assessments FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist']::text[]));

CREATE POLICY "Healthcare staff can insert wound assessments"
ON wound_assessments FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist']::text[]));

CREATE POLICY "Healthcare staff can update wound assessments"
ON wound_assessments FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist']::text[]));

CREATE POLICY "Healthcare staff can delete wound assessments"
ON wound_assessments FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Patient Notes
DROP POLICY IF EXISTS "Healthcare staff can view patient notes" ON patient_notes;
DROP POLICY IF EXISTS "Healthcare staff can insert patient notes" ON patient_notes;
DROP POLICY IF EXISTS "Healthcare staff can update patient notes" ON patient_notes;
DROP POLICY IF EXISTS "Healthcare staff can delete patient notes" ON patient_notes;

CREATE POLICY "Healthcare staff can view patient notes"
ON patient_notes FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist', 'social_worker']::text[]));

CREATE POLICY "Healthcare staff can insert patient notes"
ON patient_notes FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist', 'social_worker']::text[]));

CREATE POLICY "Healthcare staff can update patient notes"
ON patient_notes FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'therapist', 'social_worker']::text[]));

CREATE POLICY "Healthcare staff can delete patient notes"
ON patient_notes FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Procedures
DROP POLICY IF EXISTS "Healthcare staff can view procedures" ON procedures;
DROP POLICY IF EXISTS "Healthcare staff can insert procedures" ON procedures;
DROP POLICY IF EXISTS "Healthcare staff can update procedures" ON procedures;
DROP POLICY IF EXISTS "Healthcare staff can delete procedures" ON procedures;

CREATE POLICY "Healthcare staff can view procedures"
ON procedures FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can insert procedures"
ON procedures FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can update procedures"
ON procedures FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can delete procedures"
ON procedures FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));

-- Consultations
DROP POLICY IF EXISTS "Healthcare staff can view consultations" ON consultations;
DROP POLICY IF EXISTS "Healthcare staff can insert consultations" ON consultations;
DROP POLICY IF EXISTS "Healthcare staff can update consultations" ON consultations;
DROP POLICY IF EXISTS "Healthcare staff can delete consultations" ON consultations;

CREATE POLICY "Healthcare staff can view consultations"
ON consultations FOR SELECT
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse', 'social_worker']::text[]));

CREATE POLICY "Healthcare staff can insert consultations"
ON consultations FOR INSERT
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can update consultations"
ON consultations FOR UPDATE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor', 'nurse']::text[]));

CREATE POLICY "Healthcare staff can delete consultations"
ON consultations FOR DELETE
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['admin', 'doctor']::text[]));