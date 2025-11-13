import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle2, Loader2 } from 'lucide-react';

export interface ModelProgress {
  name: string;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  progress: number;
}

interface ModelLoadingProgressProps {
  models: ModelProgress[];
  onClose?: () => void;
}

export default function ModelLoadingProgress({ models, onClose }: ModelLoadingProgressProps) {
  const completedCount = models.filter(m => m.status === 'completed').length;
  const totalCount = models.length;
  const allCompleted = completedCount === totalCount;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allCompleted ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Models Loaded
            </>
          ) : (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading Face Detection Models
            </>
          )}
        </CardTitle>
        <CardDescription>
          {allCompleted 
            ? 'All facial recognition models loaded successfully'
            : `Loading model files from CDN... (${completedCount}/${totalCount})`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        <div className="space-y-3">
          {models.map((model, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {model.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                  {model.status === 'downloading' && (
                    <Download className="h-4 w-4 text-primary animate-pulse" />
                  )}
                  {model.status === 'pending' && (
                    <div className="h-4 w-4 rounded-full border-2 border-muted" />
                  )}
                  {model.status === 'error' && (
                    <div className="h-4 w-4 rounded-full bg-destructive" />
                  )}
                  <span className="font-mono text-xs truncate max-w-[200px]">
                    {model.name}
                  </span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {model.status === 'completed' 
                    ? '100%' 
                    : model.status === 'downloading'
                    ? `${Math.round(model.progress)}%`
                    : model.status === 'error'
                    ? 'Error'
                    : 'Waiting'
                  }
                </span>
              </div>
              {model.status === 'downloading' && (
                <Progress value={model.progress} className="h-1" />
              )}
            </div>
          ))}
        </div>

        {allCompleted && onClose && (
          <button
            onClick={onClose}
            className="w-full text-sm text-primary hover:underline"
          >
            Close
          </button>
        )}
      </CardContent>
    </Card>
  );
}
