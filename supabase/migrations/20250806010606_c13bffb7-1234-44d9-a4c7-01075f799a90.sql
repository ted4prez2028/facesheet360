-- Reset AI improvements and metrics for real code generation
-- Delete all existing simulated improvements
DELETE FROM ai_improvements;

-- Reset evolution metrics to start fresh
DELETE FROM app_evolution_metrics;

-- Reset any related notifications about old improvements
DELETE FROM notifications WHERE type = 'system' AND (title LIKE '%AI%' OR message LIKE '%improvement%');

-- Add a fresh start record
INSERT INTO app_evolution_metrics (
  metric_date,
  total_improvements,
  ui_improvements,
  performance_improvements,
  feature_additions,
  bug_fixes,
  accessibility_improvements,
  lines_of_code_added,
  files_modified,
  avg_impact_score
) VALUES (
  CURRENT_DATE,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
);

-- Add a system notification about the reset
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  read
) 
SELECT 
  id,
  '🔄 AI System Reset Complete',
  'All previous simulated improvements have been cleared. The AI system is now ready for real code generation and deployment.',
  'system',
  false
FROM users 
WHERE email = 'tdicusmurray@gmail.com';