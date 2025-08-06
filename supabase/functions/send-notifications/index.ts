import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  patientId: string;
  message: string;
  subject?: string;
  type: 'appointment_reminder' | 'same_day_appointment' | 'ride_notification' | 'general';
  scheduledFor?: string;
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  user_id: string | null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      throw new Error('Twilio credentials not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { patientId, message, subject, type }: NotificationRequest = await req.json();

    console.log(`📱 Sending ${type} notification to patient ${patientId}`);

    // Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, email, phone, user_id')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      throw new Error('Patient not found');
    }

    const results = {
      sms: false,
      email: false,
      appNotification: false
    };

    // Send SMS if phone number exists
    if (patient.phone && twilioAccountSid && twilioAuthToken) {
      try {
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        
        const smsResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: twilioPhoneNumber,
            To: patient.phone,
            Body: `Hi ${patient.first_name}, ${message}`
          }),
        });

        if (smsResponse.ok) {
          results.sms = true;
          console.log(`✅ SMS sent to ${patient.phone}`);
        } else {
          const errorText = await smsResponse.text();
          console.error('Twilio SMS error:', errorText);
        }
      } catch (error) {
        console.error('SMS sending error:', error);
      }
    }

    // Send Email if email exists
    if (patient.email && resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        
        const emailResponse = await resend.emails.send({
          from: 'FaceSheet360 <notifications@yourdomain.com>',
          to: [patient.email],
          subject: subject || 'Healthcare Notification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Hello ${patient.first_name},</h2>
              <p style="font-size: 16px; line-height: 1.5;">${message}</p>
              <div style="margin-top: 20px; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #6b7280;">
                  This message was sent from FaceSheet360 Healthcare Management System.
                </p>
              </div>
            </div>
          `,
        });

        if (emailResponse.data) {
          results.email = true;
          console.log(`✅ Email sent to ${patient.email}`);
        }
      } catch (error) {
        console.error('Email sending error:', error);
      }
    }

    // Send in-app notification if user has account
    if (patient.user_id) {
      try {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: patient.user_id,
            type: type,
            title: subject || 'Healthcare Notification',
            message: message,
            read: false
          });

        if (!notificationError) {
          results.appNotification = true;
          console.log(`✅ In-app notification sent to user ${patient.user_id}`);
        }
      } catch (error) {
        console.error('In-app notification error:', error);
      }
    }

    // Log the notification attempt
    await supabase
      .from('notification_logs')
      .insert({
        patient_id: patientId,
        notification_type: type,
        message: message,
        sms_sent: results.sms,
        email_sent: results.email,
        app_notification_sent: results.appNotification,
        phone_number: patient.phone,
        email_address: patient.email
      });

    console.log(`📊 Notification results:`, results);

    return new Response(
      JSON.stringify({ 
        success: true, 
        results,
        message: 'Notifications sent successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in send-notifications function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});