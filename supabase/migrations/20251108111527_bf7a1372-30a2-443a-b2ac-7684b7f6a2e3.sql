-- Add avatar_url column to patients table
ALTER TABLE patients ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create storage bucket for patient avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-avatars', 'patient-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for patient avatars bucket
CREATE POLICY "Healthcare staff can upload patient avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patient-avatars' AND
  (has_role(auth.uid(), 'admin') OR 
   has_role(auth.uid(), 'doctor') OR 
   has_role(auth.uid(), 'nurse'))
);

CREATE POLICY "Healthcare staff can update patient avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patient-avatars' AND
  (has_role(auth.uid(), 'admin') OR 
   has_role(auth.uid(), 'doctor') OR 
   has_role(auth.uid(), 'nurse'))
);

CREATE POLICY "Anyone can view patient avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'patient-avatars');

CREATE POLICY "Healthcare staff can delete patient avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patient-avatars' AND
  (has_role(auth.uid(), 'admin') OR 
   has_role(auth.uid(), 'doctor') OR 
   has_role(auth.uid(), 'nurse'))
);