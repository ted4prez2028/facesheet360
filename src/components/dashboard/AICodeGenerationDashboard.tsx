import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GitBranch, GitCommit, Code, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { GitHubConfigTest } from './GitHubConfigTest';

interface AICodeGenerationDashboardProps {
  onImprovementTriggered?: () => void;
}

export function AICodeGenerationDashboard({ onImprovementTriggered }: AICodeGenerationDashboardProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [lastImplementation, setLastImplementation] = useState<any>(null);
  const { toast } = useToast();

  const triggerAICodeGeneration = async () => {
    setIsTriggering(true);
    
    try {
      console.log('🤖 Triggering AI Code Generation...');
      console.log('📁 Target repository:', githubRepo || 'Not specified');
      
      const { data, error } = await supabase.functions.invoke('ai-code-generation', {
        body: { 
          github_repo: githubRepo || undefined,
          timestamp: new Date().toISOString()
        }
      });

      if (error) {
        console.error('AI Code Generation Error:', error);
        toast({
          title: "AI Generation Failed",
          description: error.message || "Unknown error occurred during AI code generation",
          variant: "destructive",
        });
        return;
      }

      console.log('AI Generation Response:', data);
      
      if (data?.success) {
        const deploymentStatus = data.deployment_status === 'deployed' 
          ? 'Successfully deployed to GitHub!' 
          : data.github_configured 
            ? 'Generated but GitHub deployment failed'
            : 'Generated (configure GitHub for deployment)';
        
        toast({
          title: "AI Code Generation Successful! 🤖",
          description: `${data.improvement_implemented} - ${deploymentStatus}`,
          variant: "default",
        });

        if (data.commit_url) {
          console.log('📁 Pull Request created:', data.commit_url);
        }

        setLastImplementation({
          success: true,
          improvement_implemented: data.improvement_implemented,
          deployment_status: data.deployment_status || 'unknown',
          code_changes_applied: data.code_changes_applied,
          commit_url: data.commit_url,
          github_configured: data.github_configured,
          duration: data.duration,
          timestamp: new Date().toISOString()
        });

        onImprovementTriggered?.();
      } else {
        toast({
          title: "AI Generation Failed",
          description: data?.message || "Failed to generate AI improvement",
          variant: "destructive",
        });
        
        setLastImplementation({
          success: false,
          error: data?.message || "Unknown error",
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "AI Generation Failed",
        description: "An unexpected error occurred during AI code generation",
        variant: "destructive",
      });
      
      setLastImplementation({
        success: false,
        error: error.message || "Unexpected error",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-primary" />
          <CardTitle>AI Code Generation & Deployment</CardTitle>
        </div>
        <CardDescription>
          Autonomous AI system that generates and deploys actual code improvements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <Label htmlFor="github-repo" className="text-sm font-medium">
              GitHub Repository (optional)
            </Label>
          </div>
          <Input
            id="github-repo"
            placeholder="e.g., username/repository-name"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Configure GitHub integration to automatically create pull requests with code changes.
            Requires GITHUB_TOKEN secret to be configured.
          </p>
        </div>

        <Separator />

        {/* Status Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">OpenAI Integration</span>
            <Badge variant="default">Active</Badge>
          </div>
          <div className="flex items-center gap-2">
            <GitCommit className="h-4 w-4 text-blue-500" />
            <span className="text-sm">GitHub API</span>
            <Badge variant={githubRepo ? "default" : "secondary"}>
              {githubRepo ? "Configured" : "Optional"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Auto Deploy</span>
            <Badge variant="outline">Ready</Badge>
          </div>
        </div>

        {/* Last Implementation Results */}
        {lastImplementation && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                {lastImplementation.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                Last Implementation
              </h4>
              <div className="text-sm space-y-1">
                {lastImplementation.success ? (
                  <>
                    <p><strong>Improvement:</strong> {lastImplementation.improvement_implemented}</p>
                    <p>
                      <strong>Deployment Status:</strong> 
                      <Badge 
                        variant={lastImplementation.deployment_status === 'deployed' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {lastImplementation.deployment_status === 'deployed' ? 'Deployed to GitHub' : 
                         lastImplementation.github_configured ? 'Deployment Failed' : 'GitHub Not Configured'}
                      </Badge>
                    </p>
                    {lastImplementation.commit_url && (
                      <p>
                        <strong>Pull Request:</strong> 
                        <a 
                          href={lastImplementation.commit_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline ml-1"
                        >
                          View on GitHub →
                        </a>
                      </p>
                    )}
                    <p><strong>Duration:</strong> {lastImplementation.duration}ms</p>
                  </>
                ) : (
                  <p className="text-red-500"><strong>Error:</strong> {lastImplementation.error}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {new Date(lastImplementation.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* GitHub Configuration Test */}
        <GitHubConfigTest />

        <Separator />

        {/* Action Section */}
        <div className="space-y-4">
          <Button 
            onClick={triggerAICodeGeneration}
            disabled={isTriggering}
            className="w-full"
            size="lg"
          >
            {isTriggering ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating & Implementing Code...
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-2" />
                Trigger AI Code Generation
              </>
            )}
          </Button>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">What this does:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Analyzes current codebase and recent improvements</li>
              <li>• Generates specific, implementable code improvements</li>
              <li>• Creates actual React/TypeScript code changes</li>
              <li>• Applies changes via GitHub API (if configured)</li>
              <li>• Creates pull requests for review</li>
              <li>• Triggers automated deployment workflows</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}