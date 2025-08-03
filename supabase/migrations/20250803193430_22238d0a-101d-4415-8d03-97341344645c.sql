-- Remove all mock/sample data from database tables

-- Delete mock patients
DELETE FROM patients WHERE first_name IN ('Jane', 'Robert', 'Maria', 'David', 'John', 'Sarah', 'Michael', 'Lisa', 'Test');

-- Delete mock appointments
DELETE FROM appointments WHERE created_at < NOW() - INTERVAL '1 hour' AND notes LIKE '%sample%' OR notes LIKE '%mock%' OR notes LIKE '%test%';

-- Delete mock chart records
DELETE FROM chart_records WHERE notes LIKE '%sample%' OR notes LIKE '%mock%' OR notes LIKE '%test%' OR diagnosis LIKE '%sample%';

-- Delete mock care plans
DELETE FROM care_plans WHERE title LIKE '%sample%' OR title LIKE '%mock%' OR title LIKE '%test%' OR description LIKE '%example%';

-- Delete mock prescriptions
DELETE FROM prescriptions WHERE instructions LIKE '%sample%' OR instructions LIKE '%mock%' OR instructions LIKE '%test%';

-- Delete mock vital signs with obviously fake data
DELETE FROM vital_signs WHERE heart_rate > 200 OR heart_rate < 20 OR temperature > 110 OR temperature < 90;

-- Delete mock wounds
DELETE FROM wounds WHERE description LIKE '%sample%' OR description LIKE '%mock%' OR description LIKE '%test%';

-- Delete mock call lights
DELETE FROM call_lights WHERE reason LIKE '%test%' OR reason LIKE '%sample%' OR reason LIKE '%mock%';

-- Delete mock tasks
DELETE FROM tasks WHERE task_description LIKE '%sample%' OR task_description LIKE '%mock%' OR task_description LIKE '%test%';

-- Delete mock immunizations
DELETE FROM immunizations WHERE source LIKE '%sample%' OR source LIKE '%mock%' OR source LIKE '%test%';

-- Delete mock medical diagnoses
DELETE FROM medical_diagnoses WHERE description LIKE '%sample%' OR description LIKE '%mock%' OR description LIKE '%test%';

-- Delete mock medication orders
DELETE FROM medication_orders WHERE instructions LIKE '%sample%' OR instructions LIKE '%mock%' OR instructions LIKE '%test%';

-- Delete mock health predictions
DELETE FROM health_predictions WHERE status = 'pending' AND created_at < NOW() - INTERVAL '1 hour';

-- Delete mock food orders
DELETE FROM food_orders WHERE special_instructions LIKE '%sample%' OR special_instructions LIKE '%mock%' OR special_instructions LIKE '%test%';