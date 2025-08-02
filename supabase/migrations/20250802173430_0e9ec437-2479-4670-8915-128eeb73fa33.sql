-- First add sample patients (this should work fine)
INSERT INTO patients (first_name, last_name, medical_record_number, date_of_birth, gender, phone, email) VALUES
('John', 'Doe', 'MRN001', '1980-05-15', 'Male', '555-0101', 'john.doe@email.com'),
('Jane', 'Smith', 'MRN002', '1975-08-22', 'Female', '555-0102', 'jane.smith@email.com'),
('Robert', 'Johnson', 'MRN003', '1990-03-10', 'Male', '555-0103', 'robert.j@email.com'),
('Maria', 'Garcia', 'MRN004', '1985-12-05', 'Female', '555-0104', 'maria.garcia@email.com'),
('David', 'Wilson', 'MRN005', '1970-07-18', 'Male', '555-0105', 'david.wilson@email.com')
ON CONFLICT (medical_record_number) DO NOTHING;

-- Add medication orders without prescribed_by constraint (set to NULL for now)
INSERT INTO medication_orders (
  patient_id, 
  medication_name, 
  dosage, 
  frequency, 
  route, 
  start_date, 
  status, 
  instructions
) SELECT 
  p.id,
  med.name,
  med.dosage,
  med.frequency,
  med.route,
  CURRENT_DATE - INTERVAL '1 day' * (ROW_NUMBER() OVER ()),
  med.status,
  med.instructions
FROM patients p
CROSS JOIN (
  VALUES 
    ('Metformin', '500mg', 'Twice daily', 'oral', 'active', 'Take with meals'),
    ('Lisinopril', '10mg', 'Once daily', 'oral', 'active', 'Take in the morning'),
    ('Atorvastatin', '20mg', 'Once daily', 'oral', 'administered', 'Take at bedtime'),
    ('Aspirin', '81mg', 'Once daily', 'oral', 'active', 'Take with food'),
    ('Levothyroxine', '50mcg', 'Once daily', 'oral', 'discontinued', 'Take on empty stomach'),
    ('Omeprazole', '20mg', 'Once daily', 'oral', 'active', 'Take before breakfast'),
    ('Amlodipine', '5mg', 'Once daily', 'oral', 'administered', 'Can be taken with or without food')
) AS med(name, dosage, frequency, route, status, instructions)
WHERE p.medical_record_number IN ('MRN001', 'MRN002', 'MRN003')
LIMIT 15;