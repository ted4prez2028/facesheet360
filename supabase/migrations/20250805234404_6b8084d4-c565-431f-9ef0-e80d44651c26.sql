-- Create table to track AI improvements
CREATE TABLE public.ai_improvements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  improvement_type TEXT NOT NULL, -- 'ui_enhancement', 'performance', 'feature', 'bug_fix', 'accessibility'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  implementation_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  files_modified JSONB,
  code_changes TEXT,
  impact_score INTEGER DEFAULT 0, -- 1-10 score of expected impact
  implementation_time TIMESTAMP WITH TIME ZONE,
  completion_time TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_improvements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view AI improvements" 
ON public.ai_improvements 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage AI improvements" 
ON public.ai_improvements 
FOR ALL
USING (true);

-- Create function for updating timestamps
CREATE TRIGGER update_ai_improvements_updated_at
BEFORE UPDATE ON public.ai_improvements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table to track app evolution metrics
CREATE TABLE public.app_evolution_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_improvements INTEGER DEFAULT 0,
  ui_improvements INTEGER DEFAULT 0,
  performance_improvements INTEGER DEFAULT 0,
  feature_additions INTEGER DEFAULT 0,
  bug_fixes INTEGER DEFAULT 0,
  accessibility_improvements INTEGER DEFAULT 0,
  lines_of_code_added INTEGER DEFAULT 0,
  files_modified INTEGER DEFAULT 0,
  avg_impact_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_date)
);

-- Enable RLS for evolution metrics
ALTER TABLE public.app_evolution_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view evolution metrics" 
ON public.app_evolution_metrics 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage evolution metrics" 
ON public.app_evolution_metrics 
FOR ALL
USING (true);