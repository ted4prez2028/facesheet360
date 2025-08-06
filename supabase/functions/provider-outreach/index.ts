import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProviderOutreachRequest {
  campaign_type: string;
  improvement_context?: string;
  target_specialties?: string[];
  geographic_areas?: string[];
}

interface HealthcareProvider {
  email: string;
  name: string;
  specialty: string;
  organization: string;
  location: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendKey) {
      throw new Error('RESEND_API_KEY not configured');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);
    
    const { campaign_type, improvement_context }: ProviderOutreachRequest = await req.json();
    
    console.log(`🔍 Starting provider outreach campaign: ${campaign_type}`);

    // **ETHICAL IMPLEMENTATION**: Only contact providers who have opted in or shown interest
    // In a real implementation, you would:
    // 1. Use legitimate provider directories with consent
    // 2. Only contact those who have opted into marketing
    // 3. Respect all anti-spam regulations
    
    // Simulated provider discovery (replace with ethical data sources)
    const discoveredProviders = await findHealthcareProviders();
    
    // Filter to only those who have consented to marketing (crucial for compliance)
    const consentedProviders = await filterConsentedProviders(supabase, discoveredProviders);
    
    let accountsCreated = 0;
    let emailsSent = 0;
    
    for (const provider of consentedProviders.slice(0, 10)) { // Limit for testing
      try {
        // Create trial account
        const trialAccount = await createTrialAccount(supabase, provider);
        
        if (trialAccount.success) {
          accountsCreated++;
          
          // Send welcome email with trial details
          const emailSent = await sendTrialInvitation(resend, provider, trialAccount.credentials);
          
          if (emailSent) {
            emailsSent++;
          }
          
          // Log the outreach activity
          await supabase.from('provider_outreach_log').insert({
            provider_email: provider.email,
            campaign_type,
            status: 'trial_created',
            account_id: trialAccount.account_id,
            trial_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
            created_at: new Date().toISOString()
          });
        }
      } catch (providerError) {
        console.error(`Failed to process provider ${provider.email}:`, providerError);
        
        // Log failed attempts
        await supabase.from('provider_outreach_log').insert({
          provider_email: provider.email,
          campaign_type,
          status: 'failed',
          error_message: providerError.message,
          created_at: new Date().toISOString()
        });
      }
    }
    
    // Update campaign statistics
    await supabase.from('outreach_campaigns').insert({
      campaign_type,
      providers_discovered: discoveredProviders.length,
      providers_contacted: consentedProviders.length,
      accounts_created: accountsCreated,
      emails_sent: emailsSent,
      improvement_context,
      created_at: new Date().toISOString()
    });
    
    console.log(`✅ Provider outreach completed: ${accountsCreated} accounts created, ${emailsSent} emails sent`);
    
    return new Response(JSON.stringify({
      success: true,
      providers_discovered: discoveredProviders.length,
      providers_contacted: consentedProviders.length,
      accounts_created: accountsCreated,
      emails_sent: emailsSent,
      duration: Date.now() - startTime
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ Provider outreach failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    }), {
      status: 200, // Return 200 to prevent UI errors
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

// **CRITICAL**: This function should only use ethical, consented data sources
async function findHealthcareProviders(): Promise<HealthcareProvider[]> {
  // In a real implementation, this would:
  // 1. Use legitimate healthcare directories (NPI registry, state licensing boards)
  // 2. Only access publicly available, opt-in contact information
  // 3. Respect robots.txt and terms of service
  // 4. Implement rate limiting and respectful scraping practices
  
  // Simulated data for demonstration (replace with ethical sources)
  return [
    {
      email: "demo.provider1@example.com",
      name: "Dr. Sarah Johnson",
      specialty: "Family Medicine",
      organization: "Community Health Center",
      location: "Austin, TX"
    },
    {
      email: "demo.provider2@example.com", 
      name: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      organization: "Metro Medical Group",
      location: "Seattle, WA"
    },
    // Add more demo providers...
  ];
}

async function filterConsentedProviders(supabase: any, providers: HealthcareProvider[]): Promise<HealthcareProvider[]> {
  // **CRUCIAL**: Only return providers who have explicitly opted in to marketing
  // Check against opt-in database, CAN-SPAM compliance, etc.
  
  const { data: optedInEmails } = await supabase
    .from('marketing_consent')
    .select('email')
    .eq('consented', true)
    .eq('active', true);
    
  const consentedEmailSet = new Set(optedInEmails?.map(row => row.email) || []);
  
  // For demo purposes, we'll simulate consent for demo emails
  return providers.filter(provider => 
    provider.email.includes('demo.') || consentedEmailSet.has(provider.email)
  );
}

async function createTrialAccount(supabase: any, provider: HealthcareProvider) {
  try {
    // Generate temporary credentials
    const tempPassword = generateSecurePassword();
    
    // Create the auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: provider.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: provider.name,
        specialty: provider.specialty,
        organization: provider.organization,
        location: provider.location,
        account_type: 'trial',
        trial_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    
    if (authError) throw authError;
    
    // Create profile record
    await supabase.from('users').insert({
      id: authUser.user.id,
      name: provider.name,
      email: provider.email,
      role: 'doctor',
      specialty: provider.specialty,
      organization: provider.organization,
      is_trial: true,
      trial_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    return {
      success: true,
      account_id: authUser.user.id,
      credentials: {
        email: provider.email,
        password: tempPassword
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendTrialInvitation(resend: any, provider: HealthcareProvider, credentials: any): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: 'FaceSheet360 <trials@facesheet360.com>',
      to: [provider.email],
      subject: '🏥 Your 5-Day FaceSheet360 EHR Trial is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">Welcome to FaceSheet360!</h1>
          
          <p>Dear ${provider.name},</p>
          
          <p>We're excited to offer you a <strong>5-day free trial</strong> of FaceSheet360, the next-generation EHR system designed specifically for modern healthcare providers.</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Your Trial Account Details:</h3>
            <p><strong>Email:</strong> ${credentials.email}</p>
            <p><strong>Temporary Password:</strong> ${credentials.password}</p>
            <p><strong>Trial Period:</strong> 5 days (expires automatically)</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://facesheet360.com/login" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Start Your Trial →
            </a>
          </div>
          
          <h3 style="color: #1e40af;">What's Included in Your Trial:</h3>
          <ul>
            <li>✅ Complete patient management system</li>
            <li>✅ AI-powered care plan generation</li>
            <li>✅ Advanced appointment scheduling</li>
            <li>✅ Integrated communication tools</li>
            <li>✅ CareCoins rewards system</li>
            <li>✅ Full analytics dashboard</li>
          </ul>
          
          <p style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong>No Credit Card Required:</strong> This is a completely free trial. Your account will automatically expire after 5 days with no charges.
          </p>
          
          <p>If you have any questions or need assistance, our support team is here to help at <a href="mailto:support@facesheet360.com">support@facesheet360.com</a>.</p>
          
          <p>Best regards,<br>
          The FaceSheet360 Team</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            You received this email because our AI system identified you as a healthcare provider who might benefit from FaceSheet360. 
            If you'd prefer not to receive these emails, <a href="https://facesheet360.com/unsubscribe">click here to unsubscribe</a>.
          </p>
        </div>
      `,
    });
    
    return !error;
  } catch (error) {
    console.error('Failed to send trial invitation:', error);
    return false;
  }
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

serve(handler);