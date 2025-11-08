export interface AIImprovement {
  id: string;
  improvement_type: string;
  description: string;
  code_changes?: string;
  status: string;
  impact_score?: number;
  created_at?: string;
}

export interface EvolutionMetrics {
  id: string;
  metric_type: string;
  metric_value: number;
  recorded_at: string;
}
