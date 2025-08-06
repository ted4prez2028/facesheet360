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
      const { data, error } = await supabase.functions.invoke('ai-code-generation', {
        body: JSON.stringify({
          repository: githubRepo || undefined
        })
      });

      if (error) throw error;

      setLastImplementation(data);
      
      toast({
        title: data.success ? "🤖 AI Implementation Complete" : "❌ Implementation Failed",
        description: data.success 
          ? `Successfully implemented: ${data.improvement_implemented}${data.commit_url ? ' (Pull request created)' : ''}`
          : `Failed: ${data.error}`,
        variant: data.success ? "default" : "destructive"
      });

      if (data.success && onImprovementTriggered) {
        onImprovementTriggered();
      }
    } catch (error: any) {
      console.error('AI Code Generation error:', error);
      toast({
        title: "Error",
        description: "Failed to trigger AI code generation. Check console for details.",
        variant: "destructive"
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
                <p><strong>Improvement:</strong> {lastImplementation.improvement_implemented}</p>
                <p><strong>Code Changes:</strong> {lastImplementation.code_changes_applied ? 'Applied' : 'Simulated'}</p>
                {lastImplementation.commit_url && (
                  <p>
                    <strong>Pull Request:</strong> 
                    <a 
                      href={lastImplementation.commit_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline ml-1"
                    >
                      View on GitHub
                    </a>
                  </p>
                )}
                <p><strong>Duration:</strong> {lastImplementation.duration}ms</p>
              </div>
            </div>
          </>
        )}

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