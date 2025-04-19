
import React from 'react';
import { useHealthPredictions } from '@/hooks/useHealthPredictions';
import { HealthPredictionCard } from './HealthPredictionCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, AlertTriangle } from 'lucide-react';

interface HealthPredictionsProps {
  patientId: string;
}

export const HealthPredictions = ({ patientId }: HealthPredictionsProps) => {
  const { predictions, isLoading, assessRisks } = useHealthPredictions(patientId);

  const handleNewAssessment = () => {
    assessRisks.mutate({
      vital_signs: {
        blood_pressure: '120/80',
        heart_rate: 75,
        temperature: 98.6,
        respiratory_rate: 16,
        oxygen_saturation: 98
      },
      lifestyle_factors: {
        smoking: false,
        alcohol_consumption: 'moderate',
        exercise_frequency: 'weekly'
      }
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Health Predictions
        </h2>
        <Button onClick={handleNewAssessment} disabled={assessRisks.isPending}>
          {assessRisks.isPending ? 'Processing...' : 'New Assessment'}
        </Button>
      </div>

      {predictions && predictions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {predictions.map((prediction) => (
            <HealthPredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No predictions available yet. Start by running a new assessment.</p>
        </div>
      )}
    </div>
  );
};
