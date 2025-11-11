import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Calendar,
  ArrowLeft,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { WoundRecord } from '@/hooks/useWoundCare';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface WoundProgressTrackerProps {
  woundRecords: WoundRecord[];
  location: string;
}

export const WoundProgressTracker: React.FC<WoundProgressTrackerProps> = ({
  woundRecords,
  location,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<[number, number]>([0, 1]);
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay' | 'timeline'>('side-by-side');

  // Filter and sort records by location
  const filteredRecords = useMemo(() => {
    return woundRecords
      .filter(record => record.location.toLowerCase().includes(location.toLowerCase()))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [woundRecords, location]);

  const record1 = filteredRecords[selectedIndices[0]];
  const record2 = filteredRecords[selectedIndices[1]];

  const calculateProgress = () => {
    if (!record1 || !record2) return null;

    const daysBetween = differenceInDays(
      new Date(record2.created_at),
      new Date(record1.created_at)
    );

    // Extract measurements if available
    const measurements1 = (record1 as any).measurements;
    const measurements2 = (record2 as any).measurements;

    let sizeChange = null;
    if (measurements1 && measurements2) {
      const area1 = measurements1.width * measurements1.height;
      const area2 = measurements2.width * measurements2.height;
      sizeChange = ((area2 - area1) / area1) * 100;
    }

    // Simple healing assessment based on stages
    const stages = ['Stage I', 'Stage II', 'Stage III', 'Stage IV'];
    const stage1Index = stages.findIndex(s => record1.stage?.includes(s));
    const stage2Index = stages.findIndex(s => record2.stage?.includes(s));
    
    let trend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (stage2Index < stage1Index || (sizeChange && sizeChange < -10)) {
      trend = 'improving';
    } else if (stage2Index > stage1Index || (sizeChange && sizeChange > 10)) {
      trend = 'worsening';
    }

    return {
      daysBetween,
      sizeChange,
      trend,
      stage1: record1.stage,
      stage2: record2.stage,
      infection1: record1.infection_status,
      infection2: record2.infection_status,
      healing1: record1.healing_status,
      healing2: record2.healing_status,
    };
  };

  const progress = calculateProgress();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'worsening':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'worsening':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const navigateComparison = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedIndices[0] > 0) {
      setSelectedIndices([selectedIndices[0] - 1, selectedIndices[1] - 1]);
    } else if (direction === 'next' && selectedIndices[1] < filteredRecords.length - 1) {
      setSelectedIndices([selectedIndices[0] + 1, selectedIndices[1] + 1]);
    }
  };

  if (filteredRecords.length < 2) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground">
            Need at least 2 wound records to track progress. Keep documenting to see healing trends.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Summary Card */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getTrendIcon(progress.trend)}
              Healing Progress Analysis
            </CardTitle>
            <CardDescription>
              Comparing {format(new Date(record1.created_at), 'PPp')} with {format(new Date(record2.created_at), 'PPp')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Time Elapsed</div>
                <div className="text-2xl font-bold">{progress.daysBetween} days</div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">Overall Trend</div>
                <Badge className={cn('text-sm', getTrendColor(progress.trend))}>
                  {progress.trend}
                </Badge>
              </div>

              {progress.sizeChange !== null && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Size Change</div>
                  <div className={cn(
                    'text-2xl font-bold',
                    progress.sizeChange < 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {progress.sizeChange > 0 ? '+' : ''}{progress.sizeChange.toFixed(1)}%
                  </div>
                </div>
              )}

              <div>
                <div className="text-sm text-muted-foreground mb-1">Stage Change</div>
                <div className="text-sm">
                  {progress.stage1 || 'Unknown'} → {progress.stage2 || 'Unknown'}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">Infection Status:</div>
                <div>{progress.infection1 || 'N/A'} → {progress.infection2 || 'N/A'}</div>
              </div>
              <div>
                <div className="font-medium mb-1">Healing Status:</div>
                <div>{progress.healing1 || 'N/A'} → {progress.healing2 || 'N/A'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Controls */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateComparison('prev')}
          disabled={selectedIndices[0] === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Earlier
        </Button>

        <div className="text-sm text-muted-foreground">
          Comparing records {selectedIndices[0] + 1} and {selectedIndices[1] + 1} of {filteredRecords.length}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigateComparison('next')}
          disabled={selectedIndices[1] === filteredRecords.length - 1}
        >
          Later
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          <TabsTrigger value="overlay">Overlay</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="side-by-side" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[record1, record2].map((record, idx) => (
              <Card key={record.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {format(new Date(record.created_at), 'PPp')}
                  </CardTitle>
                  {record.stage && (
                    <Badge variant="outline">{record.stage}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <img
                    src={record.image_url}
                    alt={`Wound ${idx + 1}`}
                    className="w-full h-auto rounded-lg border"
                  />
                  
                  {(record as any).measurements && (
                    <div className="mt-2 text-sm">
                      <div className="font-medium">Measurements:</div>
                      <div className="text-muted-foreground">
                        {(record as any).measurements.width}mm × {(record as any).measurements.height}mm
                      </div>
                    </div>
                  )}

                  {record.assessment && (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">
                      {record.assessment}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overlay">
          <Card>
            <CardContent className="p-6">
              <div className="relative">
                <img
                  src={record1.image_url}
                  alt="Base image"
                  className="w-full h-auto rounded-lg border"
                />
                <img
                  src={record2.image_url}
                  alt="Comparison image"
                  className="absolute inset-0 w-full h-auto rounded-lg border opacity-50 mix-blend-difference"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Images overlaid using difference blend mode to highlight changes
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-2">
            {filteredRecords.map((record, index) => (
              <Card 
                key={record.id}
                className={cn(
                  'cursor-pointer transition-all',
                  (index === selectedIndices[0] || index === selectedIndices[1]) && 'ring-2 ring-primary'
                )}
                onClick={() => {
                  if (index === selectedIndices[0]) return;
                  if (index < selectedIndices[1]) {
                    setSelectedIndices([index, selectedIndices[1]]);
                  } else {
                    setSelectedIndices([selectedIndices[0], index]);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium min-w-[120px]">
                      {format(new Date(record.created_at), 'PP')}
                    </div>
                    
                    <img
                      src={record.image_url}
                      alt="Wound"
                      className="w-20 h-20 object-cover rounded"
                    />

                    <div className="flex-1 space-y-1">
                      {record.stage && (
                        <Badge variant="outline" className="text-xs">
                          {record.stage}
                        </Badge>
                      )}
                      {(record as any).measurements && (
                        <div className="text-xs text-muted-foreground">
                          {(record as any).measurements.width}mm × {(record as any).measurements.height}mm
                        </div>
                      )}
                    </div>

                    {(index === selectedIndices[0] || index === selectedIndices[1]) && (
                      <Badge>
                        {index === selectedIndices[0] ? 'Baseline' : 'Comparison'}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
