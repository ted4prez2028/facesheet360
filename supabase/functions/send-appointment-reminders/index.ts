import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Checking for appointments needing reminders...");

    // Get appointments scheduled in the next 24-26 hours that haven't had reminders sent
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    const { data: appointments, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        id,
        scheduled_time,
        appointment_type,
        notes,
        reminder_sent,
        patients:patient_id (
          id,
          name,
          email
        ),
        profiles:provider_id (
          name,
          specialty
        )
      `)
      .gte("scheduled_time", tomorrow.toISOString())
      .lte("scheduled_time", dayAfterTomorrow.toISOString())
      .in("status", ["scheduled", "confirmed"])
      .eq("reminder_sent", false);

    if (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${appointments?.length || 0} appointments needing reminders`);

    if (!appointments || appointments.length === 0) {
      return new Response(
        JSON.stringify({ message: "No appointments need reminders", count: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    let successCount = 0;
    let errorCount = 0;

    // Send reminders for each appointment
    for (const appointment of appointments) {
      try {
        const patient = appointment.patients as any;
        const provider = appointment.profiles as any;

        if (!patient?.email) {
          console.log(`Skipping appointment ${appointment.id}: No patient email`);
          continue;
        }

        const appointmentDate = new Date(appointment.scheduled_time);
        const formattedDate = appointmentDate.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });

        // Send email reminder
        const emailResult = await resend.emails.send({
          from: "Healthcare App <onboarding@resend.dev>",
          to: [patient.email],
          subject: `Appointment Reminder - Tomorrow at ${formattedTime}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #2563eb;">Appointment Reminder</h1>
              
              <p>Hello ${patient.name || "Patient"},</p>
              
              <p>This is a friendly reminder about your upcoming appointment:</p>
              
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Date:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${formattedTime}</p>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${appointment.appointment_type}</p>
                ${provider?.name ? `<p style="margin: 5px 0;"><strong>Provider:</strong> ${provider.name}${provider.specialty ? ` (${provider.specialty})` : ""}</p>` : ""}
                ${appointment.notes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
              </div>
              
              <p>Please arrive 10-15 minutes early to complete any necessary paperwork.</p>
              
              <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
              
              <p style="margin-top: 30px;">Thank you,<br>Healthcare Team</p>
            </div>
          `,
        });

        console.log(`Email sent for appointment ${appointment.id}:`, emailResult);

        // Mark reminder as sent
        const { error: updateError } = await supabase
          .from("appointments")
          .update({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString(),
          })
          .eq("id", appointment.id);

        if (updateError) {
          console.error(`Error updating appointment ${appointment.id}:`, updateError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing appointment ${appointment.id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        message: "Reminder processing complete",
        total: appointments.length,
        success: successCount,
        errors: errorCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-appointment-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);