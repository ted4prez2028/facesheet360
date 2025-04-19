
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { HealthPrediction } from '@/types/predictions';
import { format } from 'date-fns';

interface HealthPredictionCardProps {
  prediction: HealthPrediction;
}

export const HealthPredictionCard = ({ prediction }: HealthPredictionCardProps) => {
  const confidencePercentage = Math.round(prediction.confidence_score * 100);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          {prediction.prediction_type.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ')}
          <Badge 
            variant="secondary"
            className={`ml-auto ${getStatusColor(prediction.status)} text-white`}
          >
            <span className="flex items-center gap-1">
              {getStatusIcon(prediction.status)}
              {prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1)}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Confidence Score</span>
              <span>{confidencePercentage}%</span>
            </div>
            <Progress value={confidencePercentage} />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Key Findings</h4>
            <div className="text-sm text-muted-foreground">
              {Object.entries(prediction.prediction_data).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1 border-b last:border-0">
                  <span>{key.split('_').join(' ')}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground">
            Generated on {format(new Date(prediction.created_at), 'MMM d, yyyy HH:mm')}
            <br />
            Model version: {prediction.model_version}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
