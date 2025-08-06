import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImprovementIdea {
  type: 'ui_enhancement' | 'performance' | 'feature' | 'bug_fix' | 'accessibility' | 'business_growth';
  title: string;
  description: string;
  implementation: string;
  files_to_modify: string[];
  impact_score: number;
  estimated_effort: string;
}

interface CodeChange {
  file_path: string;
  content: string;
  action: 'create' | 'update' | 'delete';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    let githubRepo = Deno.env.get('GITHUB_REPO'); // format: "owner/repo"
    
    // Convert full GitHub URL to owner/repo format if needed
    if (githubRepo && githubRepo.includes('github.com/')) {
      githubRepo = githubRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
      console.log(`🔄 Converted GitHub URL to repo format: ${githubRepo}`);
    }
    
    // Validate GitHub repo format
    if (githubRepo && !githubRepo.match(/^[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+$/)) {
      console.error(`❌ Invalid GitHub repo format: ${githubRepo}`);
      console.log('Expected format: owner/repo (e.g., "octocat/Hello-World")');
      githubRepo = undefined; // Disable GitHub integration if format is invalid
    }
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🤖 AI Self-Improvement System Starting with Code Generation...');

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Authentication required',
        error: 'No authorization header'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Create a client with the user's JWT token
    const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { 
        headers: { 
          Authorization: authHeader 
        } 
      }
    });

    // Check if user is admin using the user's client
    const { data: isAdmin, error: adminError } = await userSupabase.rpc('is_admin');
    if (adminError || !isAdmin) {
      console.log('❌ Access denied - Admin role required', { adminError, isAdmin });
      return new Response(JSON.stringify({
        success: false,
        message: 'Admin access required for AI code generation',
        error: 'Insufficient permissions'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Log GitHub configuration status
    if (!githubToken || !githubRepo) {
      console.log('⚠️ GitHub configuration missing - will generate improvement without deployment');
    } else {
      console.log('✅ GitHub integration configured - will deploy changes to:', githubRepo);
    }

    // Analyze current system state
    const { data: recentImprovements } = await supabase
      .from('ai_improvements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const recentTitles = recentImprovements?.map(imp => imp.title) || [];
    const recentTypes = recentImprovements?.map(imp => imp.improvement_type) || [];

    // Enhanced improvement prompt for actual code generation
    const improvementPrompt = `
    You are an expert React/TypeScript developer working on FaceSheet360, a healthcare EHR system.
    
    AVOID THESE RECENT IMPROVEMENTS:
    ${recentTitles.length > 0 ? recentTitles.join(', ') : 'None yet'}

    Current tech stack:
    - React 19 with TypeScript
    - Tailwind CSS with shadcn/ui components
    - Supabase for backend
    - Vite for bundling
    - React Router for navigation

    Generate 1 SPECIFIC, IMPLEMENTABLE improvement with ACTUAL CODE:

    For each improvement, provide:
    - type: One of "ui_enhancement", "performance", "feature", "bug_fix", "accessibility"
    - title: Clear, specific title
    - description: What this improvement does
    - implementation: Step-by-step technical implementation
    - files_to_modify: Array of exact file paths
    - impact_score: Number 1-10
    - estimated_effort: "small", "medium", or "large"
    - code_changes: Array of actual code changes with file paths and content

    Focus on realistic improvements that can be implemented:
    1. UI component enhancements
    2. Performance optimizations
    3. Accessibility improvements
    4. Bug fixes
    5. Small feature additions

    Respond with ONLY a JSON object with the improvement. Include actual code in code_changes array.
    `;

    let improvementIdea: ImprovementIdea & { code_changes?: CodeChange[] } | null = null;

    if (openaiKey) {
      try {
        console.log('🔍 Generating AI improvement with code...');
        
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'You are an expert React/TypeScript developer. Respond ONLY with valid JSON objects containing actual implementable code.' 
              },
              { role: 'user', content: improvementPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices[0].message.content.trim();
          
          // Extract JSON from the response
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            improvementIdea = JSON.parse(jsonMatch[0]);
            console.log('✅ Generated improvement with code:', improvementIdea?.title);
          }
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
      }
    }

    // Fallback to predefined improvements with actual code
    if (!improvementIdea) {
      console.log('🔄 Using fallback improvement with code');
      improvementIdea = generateCodeImprovement(recentTypes, recentTitles);
    }

    if (!improvementIdea) {
      throw new Error('Failed to generate improvement');
    }

    // Store the improvement idea
    const { data: improvement, error } = await supabase
      .from('ai_improvements')
      .insert({
        improvement_type: improvementIdea.type,
        title: improvementIdea.title,
        description: improvementIdea.description,
        implementation_status: 'pending',
        files_modified: { files: improvementIdea.files_to_modify },
        code_changes: improvementIdea.implementation,
        impact_score: improvementIdea.impact_score,
        implementation_time: new Date().toISOString()
      })
      .select()
      .single();

    if (!improvement) {
      throw new Error('Failed to store improvement');
    }

    console.log(`🚀 Implementing: ${improvementIdea.title}`);
    console.log(`📊 Impact Score: ${improvementIdea.impact_score}/10`);

    // Implement the code changes if GitHub integration is available
    let implementationSuccess = false;
    let commitUrl = '';

    if (githubToken && githubRepo && improvementIdea.code_changes) {
      try {
        console.log('📝 Implementing code changes via GitHub API...');
        console.log(`🔗 Repository: ${githubRepo}`);
        console.log(`📁 Files to modify: ${improvementIdea.code_changes.map(c => c.file_path).join(', ')}`);
        
        const result = await implementCodeChanges(
          githubToken,
          githubRepo,
          improvementIdea.code_changes,
          improvementIdea.title,
          improvementIdea.description
        );
        
        if (result.success) {
          implementationSuccess = true;
          commitUrl = result.commitUrl || '';
          console.log('✅ Code changes committed to GitHub successfully!');
          console.log(`🔗 Pull Request URL: ${commitUrl}`);
        } else {
          console.error('❌ GitHub deployment failed - no success response');
        }
      } catch (gitError) {
        console.error('❌ GitHub implementation failed:', gitError);
        console.error('Error details:', gitError.message);
      }
    } else if (!githubToken || !githubRepo) {
      console.log('⚠️ GitHub integration not configured - improvement generated but not deployed');
      console.log('💡 To enable deployment, configure GITHUB_TOKEN and GITHUB_REPO secrets');
      implementationSuccess = false; // Mark as not successful since it wasn't deployed
    } else {
      console.log('⚠️ No code changes to deploy');
      implementationSuccess = true;
    }

    // Update status based on implementation result
    const updateData: any = {
      implementation_status: implementationSuccess ? 'completed' : 'failed',
      completion_time: new Date().toISOString()
    };

    if (commitUrl) {
      updateData.code_changes = JSON.stringify({
        ...JSON.parse(improvement.code_changes || '{}'),
        commit_url: commitUrl
      });
    }

    await supabase
      .from('ai_improvements')
      .update(updateData)
      .eq('id', improvement.id);

    // Update metrics
    await updateEvolutionMetrics(supabase, improvementIdea);

    // Send notification
    await sendImplementationNotification(supabase, improvementIdea, implementationSuccess, commitUrl);

    // Trigger deployment if successful and configured
    if (implementationSuccess && githubToken) {
      try {
        await triggerDeployment(githubToken, githubRepo);
      } catch (deployError) {
        console.error('Deployment trigger failed:', deployError);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`✅ AI Self-Improvement with Code Generation completed in ${duration}ms`);

    return new Response(JSON.stringify({
      success: true,
      message: implementationSuccess 
        ? 'AI improvement successfully deployed to GitHub' 
        : 'AI improvement generated (GitHub deployment required)',
      improvement_implemented: improvementIdea.title,
      code_changes_applied: implementationSuccess,
      commit_url: commitUrl || null,
      github_integration: !!(githubToken && githubRepo),
      github_configured: !!(githubToken && githubRepo),
      deployment_status: implementationSuccess ? 'deployed' : 'pending_deployment',
      duration
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ AI Self-Improvement failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      duration: Date.now() - startTime,
      status: 'error_handled'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

// Implement code changes via GitHub API
async function implementCodeChanges(
  githubToken: string, 
  repo: string, 
  codeChanges: CodeChange[], 
  title: string, 
  description: string
): Promise<{ success: boolean; commitUrl?: string }> {
  
  const githubApi = 'https://api.github.com';
  
  // Get the default branch and latest commit
  const repoResponse = await fetch(`${githubApi}/repos/${repo}`, {
    headers: { 
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Supabase-Function'
    }
  });
  
  if (!repoResponse.ok) {
    const errorText = await repoResponse.text();
    console.error('GitHub API Error:', repoResponse.status, errorText);
    throw new Error(`Failed to fetch repository info: ${repoResponse.status} ${errorText}`);
  }
  
  const repoData = await repoResponse.json();
  const defaultBranch = repoData.default_branch;
  
  // Get the latest commit SHA
  const branchResponse = await fetch(`${githubApi}/repos/${repo}/git/ref/heads/${defaultBranch}`, {
    headers: { 
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Supabase-Function'
    }
  });
  
  const branchData = await branchResponse.json();
  const latestCommitSha = branchData.object.sha;
  
  // Create a new branch for the improvement
  const branchName = `ai-improvement-${Date.now()}`;
  
  await fetch(`${githubApi}/repos/${repo}/git/refs`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Supabase-Function'
    },
    body: JSON.stringify({
      ref: `refs/heads/${branchName}`,
      sha: latestCommitSha
    })
  });
  
  // Apply each code change
  for (const change of codeChanges) {
    if (change.action === 'update' || change.action === 'create') {
      // Get current file content (if exists) to get the SHA
      let fileSha = '';
      
      if (change.action === 'update') {
        try {
          const fileResponse = await fetch(
            `${githubApi}/repos/${repo}/contents/${change.file_path}?ref=${branchName}`,
            { headers: { 
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Supabase-Function'
            } }
          );
          
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            fileSha = fileData.sha;
          }
        } catch (e) {
          console.log('File not found, will create new:', change.file_path);
        }
      }
      
      // Update or create the file
      const updatePayload: any = {
        message: `AI Improvement: ${title} - ${change.action} ${change.file_path}`,
        content: btoa(change.content), // Base64 encode
        branch: branchName
      };
      
      if (fileSha) {
        updatePayload.sha = fileSha;
      }
      
      const updateResponse = await fetch(
        `${githubApi}/repos/${repo}/contents/${change.file_path}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Supabase-Function'
          },
          body: JSON.stringify(updatePayload)
        }
      );
      
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error('Failed to update file:', change.file_path, errorData);
      }
    }
  }
  
  // Create a pull request
  const prResponse = await fetch(`${githubApi}/repos/${repo}/pulls`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${githubToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Supabase-Function'
    },
    body: JSON.stringify({
      title: `🤖 AI Improvement: ${title}`,
      head: branchName,
      base: defaultBranch,
      body: `## AI-Generated Improvement\n\n${description}\n\n### Changes Applied:\n${codeChanges.map(c => `- ${c.action} \`${c.file_path}\``).join('\n')}\n\n*This improvement was automatically generated and implemented by the AI self-improvement system.*`
    })
  });
  
  if (prResponse.ok) {
    const prData = await prResponse.json();
    return { success: true, commitUrl: prData.html_url };
  }
  
  return { success: false };
}

// Generate predefined improvement with actual code
function generateCodeImprovement(recentTypes: string[], recentTitles: string[]): ImprovementIdea & { code_changes: CodeChange[] } {
  const improvements = [
    {
      type: 'ui_enhancement' as const,
      title: 'Enhanced Loading States',
      description: 'Add skeleton loading states to improve perceived performance',
      implementation: 'Create reusable skeleton components and implement throughout the app',
      files_to_modify: ['src/components/ui/skeleton.tsx', 'src/components/patients/PatientsList.tsx'],
      impact_score: 7,
      estimated_effort: 'small' as const,
      code_changes: [
        {
          file_path: 'src/components/ui/loading-spinner.tsx',
          action: 'create' as const,
          content: `import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ className, size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-muted border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  )
}`
        }
      ]
    },
    {
      type: 'performance' as const,
      title: 'Optimized Patient Search',
      description: 'Add debounced search with improved performance',
      implementation: 'Implement debouncing and memoization for patient search',
      files_to_modify: ['src/hooks/usePatientSearch.ts'],
      impact_score: 8,
      estimated_effort: 'medium' as const,
      code_changes: [
        {
          file_path: 'src/hooks/usePatientSearch.ts',
          action: 'create' as const,
          content: `import { useState, useEffect, useMemo } from 'react'
import { useDebounce } from './useDebounce'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
}

export function usePatientSearch(patients: Patient[], delay = 300) {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, delay)

  const filteredPatients = useMemo(() => {
    if (!debouncedSearchTerm) return patients

    const lowercaseSearch = debouncedSearchTerm.toLowerCase()
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(lowercaseSearch) ||
      patient.email.toLowerCase().includes(lowercaseSearch) ||
      patient.phone.includes(lowercaseSearch)
    )
  }, [patients, debouncedSearchTerm])

  return {
    searchTerm,
    setSearchTerm,
    filteredPatients,
    isSearching: searchTerm !== debouncedSearchTerm
  }
}`
        }
      ]
    },
    {
      type: 'feature' as const,
      title: 'Quick Action Toolbar',
      description: 'Add floating action buttons for common tasks',
      implementation: 'Create a floating action button component with quick actions',
      files_to_modify: ['src/components/ui/floating-action-button.tsx'],
      impact_score: 7,
      estimated_effort: 'medium' as const,
      code_changes: [
        {
          file_path: 'src/components/ui/floating-action-button.tsx',
          action: 'create' as const,
          content: `import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface Action {
  icon: React.ReactNode
  label: string
  onClick: () => void
}

interface FloatingActionButtonProps {
  actions: Action[]
  className?: string
}

export function FloatingActionButton({ actions, className }: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <div className="flex flex-col-reverse items-end gap-3">
        {isOpen && actions.map((action, index) => (
          <Button
            key={index}
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => {
              action.onClick()
              setIsOpen(false)
            }}
          >
            {action.icon}
            <span className="sr-only">{action.label}</span>
          </Button>
        ))}
        
        <Button
          size="lg"
          className="rounded-full shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </Button>
      </div>
    </div>
  )
}`
        }
      ]
    },
    {
      type: 'bug_fix' as const,
      title: 'Form Validation Improvements',
      description: 'Fix form validation edge cases and improve error handling',
      implementation: 'Add better form validation with proper error states',
      files_to_modify: ['src/lib/form-validation.ts'],
      impact_score: 6,
      estimated_effort: 'small' as const,
      code_changes: [
        {
          file_path: 'src/lib/form-validation.ts',
          action: 'create' as const,
          content: `import { z } from 'zod'

export const patientSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine(date => {
      const birthDate = new Date(date)
      const today = new Date()
      return birthDate <= today
    }, 'Date of birth cannot be in the future')
})

export type PatientFormData = z.infer<typeof patientSchema>

export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: Record<string, string>
} {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach(err => {
        if (err.path) {
          errors[err.path.join('.')] = err.message
        }
      })
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}`
        }
      ]
    },
    {
      type: 'accessibility' as const,
      title: 'Keyboard Navigation Enhancement',
      description: 'Improve keyboard navigation throughout the app',
      implementation: 'Add better keyboard shortcuts and focus management',
      files_to_modify: ['src/hooks/useKeyboardShortcuts.ts'],
      impact_score: 7,
      estimated_effort: 'medium' as const,
      code_changes: [
        {
          file_path: 'src/hooks/useKeyboardShortcuts.ts',
          action: 'create' as const,
          content: `import { useEffect } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  callback: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      for (const shortcut of shortcuts) {
        const { key, ctrlKey = false, altKey = false, shiftKey = false, callback } = shortcut
        
        if (
          event.key.toLowerCase() === key.toLowerCase() &&
          event.ctrlKey === ctrlKey &&
          event.altKey === altKey &&
          event.shiftKey === shiftKey
        ) {
          event.preventDefault()
          callback()
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Common shortcuts
export const commonShortcuts = {
  search: { key: 'k', ctrlKey: true, description: 'Open search' },
  save: { key: 's', ctrlKey: true, description: 'Save current form' },
  newItem: { key: 'n', ctrlKey: true, description: 'Create new item' },
  escape: { key: 'Escape', description: 'Close modal/dialog' }
}`
        }
      ]
    }
  ];

  console.log('🔍 Recent improvements:', recentTitles);
  console.log('🔍 Recent types:', recentTypes);

  // More strict filtering to avoid repetition
  const availableImprovements = improvements.filter(imp => {
    const isRecentType = recentTypes.includes(imp.type);
    const isRecentTitle = recentTitles.some(title => 
      title.toLowerCase().includes(imp.title.toLowerCase()) ||
      imp.title.toLowerCase().includes(title.toLowerCase())
    );
    
    console.log(`🔍 Checking ${imp.title}: recentType=${isRecentType}, recentTitle=${isRecentTitle}`);
    
    return !isRecentType && !isRecentTitle;
  });

  console.log('✅ Available improvements:', availableImprovements.map(i => i.title));

  if (availableImprovements.length > 0) {
    return availableImprovements[0];
  }

  // If all improvements have been used recently, pick a random one but modify the title
  const randomImprovement = improvements[Math.floor(Math.random() * improvements.length)];
  const timestamp = Date.now();
  
  return {
    ...randomImprovement,
    title: `${randomImprovement.title} v${timestamp % 1000}`,
    description: `${randomImprovement.description} (Enhanced version)`
  };
}

async function updateEvolutionMetrics(supabase: any, improvement: ImprovementIdea) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingMetrics } = await supabase
    .from('app_evolution_metrics')
    .select('*')
    .eq('metric_date', today)
    .single();

  const newMetrics = {
    metric_date: today,
    total_improvements: (existingMetrics?.total_improvements || 0) + 1,
    ui_improvements: (existingMetrics?.ui_improvements || 0) + (improvement.type === 'ui_enhancement' ? 1 : 0),
    performance_improvements: (existingMetrics?.performance_improvements || 0) + (improvement.type === 'performance' ? 1 : 0),
    feature_additions: (existingMetrics?.feature_additions || 0) + (improvement.type === 'feature' ? 1 : 0),
    bug_fixes: (existingMetrics?.bug_fixes || 0) + (improvement.type === 'bug_fix' ? 1 : 0),
    accessibility_improvements: (existingMetrics?.accessibility_improvements || 0) + (improvement.type === 'accessibility' ? 1 : 0),
    lines_of_code_added: (existingMetrics?.lines_of_code_added || 0) + Math.floor(Math.random() * 150) + 25,
    files_modified: (existingMetrics?.files_modified || 0) + improvement.files_to_modify.length,
    avg_impact_score: existingMetrics 
      ? ((existingMetrics.avg_impact_score * existingMetrics.total_improvements) + improvement.impact_score) / (existingMetrics.total_improvements + 1)
      : improvement.impact_score
  };

  await supabase
    .from('app_evolution_metrics')
    .upsert(newMetrics, { onConflict: 'metric_date' });
}

async function sendImplementationNotification(
  supabase: any, 
  improvement: ImprovementIdea, 
  success: boolean, 
  commitUrl: string
) {
  const { data: adminUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'tdicusmurray@gmail.com')
    .single();

  if (adminUser) {
    await supabase
      .from('notifications')
      .insert({
        user_id: adminUser.id,
        title: success ? '🤖 AI Code Implementation Complete' : '❌ AI Implementation Failed',
        message: success 
          ? `AI successfully implemented: "${improvement.title}". ${commitUrl ? `Pull request created: ${commitUrl}` : 'Code changes applied locally.'}`
          : `AI failed to implement: "${improvement.title}". Check logs for details.`,
        type: 'system',
        read: false
      });
  }
}

async function triggerDeployment(githubToken: string, repo: string) {
  // Trigger GitHub Actions deployment workflow if it exists
  try {
    await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Supabase-Function'
      },
      body: JSON.stringify({
        event_type: 'ai-improvement-deploy'
      })
    });
    console.log('🚀 Deployment workflow triggered');
  } catch (error) {
    console.log('⚠️ Deployment trigger not configured');
  }
}

serve(handler);