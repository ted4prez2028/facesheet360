import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    let githubRepo = Deno.env.get('GITHUB_REPO');
    
    console.log('🔍 Testing GitHub Configuration...');
    console.log('GitHub Token:', githubToken ? '✅ Set' : '❌ Missing');
    console.log('GitHub Repo:', githubRepo ? `✅ Set: ${githubRepo}` : '❌ Missing');
    
    const results = {
      token_configured: !!githubToken,
      repo_configured: !!githubRepo,
      repo_format_valid: false,
      api_connection_working: false,
      repo_accessible: false,
      error_details: [] as string[]
    };

    if (!githubToken) {
      results.error_details.push('GITHUB_TOKEN secret is not configured');
    }
    
    if (!githubRepo) {
      results.error_details.push('GITHUB_REPO secret is not configured');
    }

    if (githubRepo) {
      // Convert full GitHub URL to owner/repo format if needed
      if (githubRepo.includes('github.com/')) {
        githubRepo = githubRepo.replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
        console.log(`🔄 Converted to repo format: ${githubRepo}`);
      }
      
      // Validate repo format
      const repoFormatRegex = /^[a-zA-Z0-9\-_.]+\/[a-zA-Z0-9\-_.]+$/;
      results.repo_format_valid = repoFormatRegex.test(githubRepo);
      
      if (!results.repo_format_valid) {
        results.error_details.push(`Invalid repo format: "${githubRepo}". Expected format: owner/repo`);
      }
    }

    // Test GitHub API connection if we have a token
    if (githubToken) {
      try {
        console.log('🔗 Testing GitHub API connection...');
        
        // Test basic API access
        const apiResponse = await fetch('https://api.github.com/user', {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Supabase-Function'
          }
        });
        
        results.api_connection_working = apiResponse.ok;
        
        if (!apiResponse.ok) {
          const errorText = await apiResponse.text();
          results.error_details.push(`GitHub API connection failed: ${apiResponse.status} ${errorText}`);
          console.error('GitHub API Error:', apiResponse.status, errorText);
        } else {
          const userData = await apiResponse.json();
          console.log('✅ GitHub API connection successful for user:', userData.login);
        }
        
        // Test repository access if repo is configured and API works
        if (githubRepo && results.repo_format_valid && results.api_connection_working) {
          console.log(`🏗️ Testing repository access: ${githubRepo}`);
          
          const repoResponse = await fetch(`https://api.github.com/repos/${githubRepo}`, {
            headers: {
              'Authorization': `token ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'Supabase-Function'
            }
          });
          
          results.repo_accessible = repoResponse.ok;
          
          if (!repoResponse.ok) {
            const errorText = await repoResponse.text();
            results.error_details.push(`Repository not accessible: ${repoResponse.status} ${errorText}`);
            console.error('Repository Error:', repoResponse.status, errorText);
          } else {
            const repoData = await repoResponse.json();
            console.log('✅ Repository accessible:', repoData.full_name);
            console.log('Repository permissions:', {
              admin: repoData.permissions?.admin,
              push: repoData.permissions?.push,
              pull: repoData.permissions?.pull
            });
          }
        }
        
      } catch (apiError) {
        results.error_details.push(`GitHub API test failed: ${apiError.message}`);
        console.error('GitHub API test error:', apiError);
      }
    }

    const overallStatus = results.token_configured && 
                         results.repo_configured && 
                         results.repo_format_valid && 
                         results.api_connection_working && 
                         results.repo_accessible;

    console.log('📊 GitHub Configuration Test Results:', {
      overall_status: overallStatus ? '✅ WORKING' : '❌ ISSUES FOUND',
      ...results
    });

    return new Response(JSON.stringify({
      success: true,
      github_configured_properly: overallStatus,
      test_results: results,
      message: overallStatus 
        ? 'GitHub integration is properly configured and working!' 
        : 'GitHub configuration has issues that need to be resolved'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error testing GitHub configuration:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      github_configured_properly: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});