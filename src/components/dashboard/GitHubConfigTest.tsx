import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Loader2, Github } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GitHubTestResults {
  token_configured: boolean;
  repo_configured: boolean;
  repo_format_valid: boolean;
  api_connection_working: boolean;
  repo_accessible: boolean;
  error_details: string[];
}

interface GitHubTestResponse {
  success: boolean;
  github_configured_properly: boolean;
  test_results: GitHubTestResults;
  message: string;
}

export function GitHubConfigTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<GitHubTestResponse | null>(null);

  const handleTestGitHub = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-github-config');
      
      if (error) {
        toast.error('Failed to test GitHub configuration');
        console.error('GitHub test error:', error);
        return;
      }

      setTestResults(data);
      
      if (data.github_configured_properly) {
        toast.success('GitHub is properly configured!');
      } else {
        toast.error('GitHub configuration has issues');
      }
    } catch (error) {
      toast.error('Failed to test GitHub configuration');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"} className="text-xs">
        {status ? "✅ Pass" : "❌ Fail"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Github className="h-5 w-5" />
          GitHub Configuration Test
        </CardTitle>
        <CardDescription>
          Test your GitHub integration settings for AI code deployment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleTestGitHub} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing GitHub Configuration...
            </>
          ) : (
            <>
              <Github className="h-4 w-4 mr-2" />
              Test GitHub Configuration
            </>
          )}
        </Button>

        {testResults && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <span className="font-medium">Overall Status</span>
              {testResults.github_configured_properly ? (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ✅ Configured Properly
                </Badge>
              ) : (
                <Badge variant="destructive">
                  ❌ Issues Found
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Configuration Checks:</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.test_results.token_configured)}
                    <span>GitHub Token</span>
                  </div>
                  {getStatusBadge(testResults.test_results.token_configured)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.test_results.repo_configured)}
                    <span>Repository Setting</span>
                  </div>
                  {getStatusBadge(testResults.test_results.repo_configured)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.test_results.repo_format_valid)}
                    <span>Repository Format</span>
                  </div>
                  {getStatusBadge(testResults.test_results.repo_format_valid)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.test_results.api_connection_working)}
                    <span>API Connection</span>
                  </div>
                  {getStatusBadge(testResults.test_results.api_connection_working)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.test_results.repo_accessible)}
                    <span>Repository Access</span>
                  </div>
                  {getStatusBadge(testResults.test_results.repo_accessible)}
                </div>
              </div>
            </div>

            {testResults.test_results.error_details.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-600">Issues Found:</h4>
                <div className="space-y-1">
                  {testResults.test_results.error_details.map((error, index) => (
                    <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                      {error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
              <strong>Message:</strong> {testResults.message}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}