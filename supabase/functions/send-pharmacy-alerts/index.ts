import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { insights, urgentOnly = false } = await req.json();

    // Get pharmacists and doctors with their notification preferences
    const { data: recipients, error: recipientsError } = await supabaseClient
      .from('profiles')
      .select(`
        email, 
        name, 
        role,
        id,
        pharmacy_notification_preferences (
          email_enabled,
          safety_alerts_enabled,
          safety_alerts_min_priority,
          refill_alerts_enabled,
          refill_alerts_min_urgency,
          adherence_alerts_enabled,
          inventory_alerts_enabled,
          cost_savings_alerts_enabled
        )
      `)
      .in('role', ['pharmacist', 'doctor'])
      .not('email', 'is', null);

    if (recipientsError) throw recipientsError;

    // Filter recipients based on their preferences
    const filteredRecipients = recipients?.filter((r: any) => {
      const prefs = r.pharmacy_notification_preferences?.[0];
      
      // If no preferences set, include by default
      if (!prefs) return true;
      
      // Check if email is enabled
      if (!prefs.email_enabled) return false;
      
      // Check specific alert type preferences
      const hasSafetyAlerts = insights.safetyAlerts?.length > 0 && prefs.safety_alerts_enabled;
      const hasRefillAlerts = insights.refillPredictions?.length > 0 && prefs.refill_alerts_enabled;
      const hasAdherenceAlerts = insights.adherenceInsights?.length > 0 && prefs.adherence_alerts_enabled;
      
      return hasSafetyAlerts || hasRefillAlerts || hasAdherenceAlerts;
    }) || [];

    console.log(`Found ${filteredRecipients.length} recipients after filtering preferences`);

    // Prepare email content
    const refillAlerts = insights.refillPredictions?.filter((p: any) => 
      p.urgency === 'high' || !urgentOnly
    ) || [];

    const safetyAlerts = insights.safetyAlerts || [];
    const adherenceIssues = insights.adherenceInsights?.filter((i: any) => 
      urgentOnly ? i.concern.toLowerCase().includes('critical') || i.concern.toLowerCase().includes('urgent') : true
    ) || [];

    if (refillAlerts.length === 0 && safetyAlerts.length === 0 && adherenceIssues.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No alerts to send',
        emailsSent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate HTML email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #ef4444; }
          .warning-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #f59e0b; }
          .info-section { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
          .alert-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
          .alert-item { margin: 15px 0; padding: 15px; background: #f9fafb; border-radius: 6px; }
          .medication { font-weight: bold; color: #667eea; }
          .urgent { color: #ef4444; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🏥 Facesheet360 Pharmacy Alerts</h1>
            <p style="margin: 10px 0 0 0;">Daily AI-Generated Insights Report</p>
            <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="content">
            ${safetyAlerts.length > 0 ? `
              <div class="alert-section">
                <div class="alert-title">⚠️ Safety Alerts (${safetyAlerts.length})</div>
                ${safetyAlerts.map((alert: any) => `
                  <div class="alert-item">
                    <div><span class="urgent">${alert.priority.toUpperCase()}</span> Priority</div>
                    <div style="margin-top: 8px;"><strong>Alert:</strong> ${alert.alert}</div>
                    <div style="margin-top: 8px;"><strong>Required Action:</strong> ${alert.action}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${refillAlerts.length > 0 ? `
              <div class="warning-section">
                <div class="alert-title">📋 Medication Refills Needed (${refillAlerts.length})</div>
                ${refillAlerts.map((pred: any) => `
                  <div class="alert-item">
                    <div class="medication">${pred.medication}</div>
                    <div style="margin-top: 8px;">
                      <strong>Reorder in:</strong> ${pred.daysUntilReorder} days
                      ${pred.urgency === 'high' ? '<span class="urgent"> - URGENT</span>' : ''}
                    </div>
                    <div style="margin-top: 8px; color: #6b7280;">${pred.reasoning}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${adherenceIssues.length > 0 ? `
              <div class="info-section">
                <div class="alert-title">💊 Adherence Concerns (${adherenceIssues.length})</div>
                ${adherenceIssues.map((issue: any) => `
                  <div class="alert-item">
                    <div class="medication">${issue.medication}</div>
                    <div style="margin-top: 8px;"><strong>Concern:</strong> ${issue.concern}</div>
                    <div style="margin-top: 8px;"><strong>Recommendation:</strong> ${issue.recommendation}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${insights.costSavings && insights.costSavings.length > 0 ? `
              <div class="info-section">
                <div class="alert-title">💰 Cost Savings Opportunities</div>
                ${insights.costSavings.map((saving: any) => `
                  <div class="alert-item">
                    <div><strong>${saving.opportunity}</strong></div>
                    <div style="margin-top: 8px; color: #059669;">Estimated savings: ${saving.estimatedSavings}</div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="footer">
              <p>This is an automated alert from Facesheet360 Pharmacy Management System</p>
              <p>Making healthcare accessible through AI-powered insights</p>
              <p style="margin-top: 15px; font-size: 12px;">
                Log in to your dashboard to view detailed analytics and take action
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails to filtered recipients
    const emailPromises = filteredRecipients.map(async (recipient: any) => {
      try {
        const result = await resend.emails.send({
          from: "Facesheet360 Pharmacy <onboarding@resend.dev>",
          to: [recipient.email],
          subject: `🚨 Pharmacy Alert: ${safetyAlerts.length} Safety Alerts, ${refillAlerts.length} Refills Needed`,
          html: emailHtml,
        });
        console.log(`Email sent to ${recipient.email}:`, result);
        return { success: true, email: recipient.email };
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
        return { success: false, email: recipient.email, error };
      }
    }) || [];

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Sent ${successCount} of ${results.length} emails successfully`);

    return new Response(JSON.stringify({
      success: true,
      emailsSent: successCount,
      totalRecipients: results.length,
      results
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-pharmacy-alerts:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
