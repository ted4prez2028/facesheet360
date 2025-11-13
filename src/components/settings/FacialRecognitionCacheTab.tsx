import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trash2, RefreshCw, Database, HardDrive, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { clearModelCache, getModelCacheInfo } from '@/lib/facialRecognition';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function FacialRecognitionCacheTab() {
  const [cacheStats, setCacheStats] = useState<{
    count: number;
    models: string[];
    totalSize: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const loadCacheStats = async () => {
    setLoading(true);
    try {
      const stats = await getModelCacheInfo();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error loading cache stats:', error);
      toast.error('Failed to load cache statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCacheStats();
  }, []);

  const handleClearCache = async () => {
    setClearing(true);
    try {
      await clearModelCache();
      await loadCacheStats();
      toast.success('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearing(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Facial Recognition Cache</h3>
        <p className="text-sm text-muted-foreground">
          Manage cached facial recognition models to improve loading performance
        </p>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Facial recognition models are cached locally using IndexedDB to improve loading times. 
          The first load downloads models from the CDN (~5-10 MB), subsequent loads are instant.
        </AlertDescription>
      </Alert>

      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Cached Models
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cacheStats?.count || 0}</div>
                <p className="text-xs text-muted-foreground">
                  model files stored
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Size
                </CardTitle>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatBytes(cacheStats?.totalSize || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  disk space used
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Status
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cacheStats && cacheStats.count > 0 ? 'Active' : 'Empty'}
                </div>
                <p className="text-xs text-muted-foreground">
                  cache status
                </p>
              </CardContent>
            </Card>
          </div>

          {cacheStats && cacheStats.models.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cached Model Files</CardTitle>
                <CardDescription>
                  List of facial recognition model files stored in cache
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {cacheStats.models.map((model, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card text-card-foreground"
                    >
                      <span className="text-sm font-mono">{model}</span>
                      <span className="text-xs text-muted-foreground">Cached</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Cache Actions</CardTitle>
              <CardDescription>
                Manage your facial recognition cache
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={loadCacheStats}
                  disabled={loading}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Stats
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearCache}
                  disabled={clearing || !cacheStats || cacheStats.count === 0}
                >
                  {clearing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cache
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Clearing the cache will force models to be re-downloaded on the next use.
                This can help resolve issues with corrupted or outdated model files.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
