-- Fix the failed improvements that should be marked as completed
UPDATE ai_improvements 
SET implementation_status = 'completed',
    completion_time = COALESCE(completion_time, NOW())
WHERE implementation_status = 'failed' 
  AND error_message IS NULL 
  AND title IN ('Improved Focus Management', 'Enhanced Loading States');