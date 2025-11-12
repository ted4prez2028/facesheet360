import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  name: string;
  amount: number;
  usdAmount: number;
  paymentMethod: string;
  status: string;
  failureReason?: string;
}

const getEstimatedDeliveryDate = (paymentMethod: string): string => {
  const deliveryDays: Record<string, number> = {
    bank_transfer: 3,
    paypal: 1,
    venmo: 1,
    gift_card_amazon: 1,
    gift_card_visa: 2,
    gift_card_mastercard: 2,
    gift_card_target: 1,
    gift_card_walmart: 1,
    gift_card_starbucks: 1,
  };

  const days = deliveryDays[paymentMethod] || 3;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);
  
  return deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getEmailContent = (data: NotificationRequest) => {
  const { name, amount, usdAmount, paymentMethod, status, failureReason } = data;
  const methodName = paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  if (status === 'approved') {
    const estimatedDate = getEstimatedDeliveryDate(paymentMethod);
    return {
      subject: `✅ CareCoin Cash-Out Request Approved - $${usdAmount.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Cash-Out Approved!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hi ${name},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Great news! Your CareCoin cash-out request has been approved and is now being processed.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #667eea; margin: 20px 0;">
              <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Transaction Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">CareCoins:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">USD Amount:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right; font-size: 18px; color: #10b981;">$${usdAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Payment Method:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${methodName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Status:</td>
                  <td style="padding: 10px 0; text-align: right;">
                    <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: bold;">
                      ✓ Approved
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Estimated Delivery:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right; color: #667eea;">${estimatedDate}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                <strong>📧 What's Next?</strong><br/>
                Your payment is now being processed. You'll receive another email once the transaction is completed and the funds have been sent to your ${methodName} account.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
              Thank you for using CareCoin! Continue earning by documenting patient care.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>FaceSheet360 EHR - CareCoin Blockchain Rewards</p>
          </div>
        </div>
      `,
    };
  } else if (status === 'completed') {
    return {
      subject: `💰 CareCoin Cash-Out Completed - $${usdAmount.toFixed(2)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💰 Payment Sent!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hi ${name},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Excellent news! Your CareCoin cash-out has been completed successfully. The funds have been sent to your ${methodName} account.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #10b981; margin: 20px 0;">
              <h2 style="color: #10b981; margin-top: 0; font-size: 20px;">✓ Payment Confirmed</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">CareCoins Redeemed:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">USD Amount Sent:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right; font-size: 20px; color: #10b981;">$${usdAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Payment Method:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${methodName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Completed:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${new Date().toLocaleDateString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>💵 Funds Delivered</strong><br/>
                ${paymentMethod.includes('gift_card') 
                  ? 'Your gift card code has been sent to your email. Please check your inbox for the redemption details.'
                  : `The funds have been transferred to your ${methodName} account. Depending on your payment processor, it may take 1-2 business days to appear in your account.`
                }
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 15px;">
                Keep earning CareCoins by documenting patient care!
              </p>
              <a href="${Deno.env.get('SUPABASE_URL')}/carecoins" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                View My CareCoins
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>FaceSheet360 EHR - CareCoin Blockchain Rewards</p>
          </div>
        </div>
      `,
    };
  } else if (status === 'rejected') {
    return {
      subject: `❌ CareCoin Cash-Out Request - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Cash-Out Request Issue</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hi ${name},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              We're unable to process your CareCoin cash-out request at this time.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border: 2px solid #ef4444; margin: 20px 0;">
              <h2 style="color: #ef4444; margin-top: 0; font-size: 20px;">Request Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">CareCoins:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${amount.toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">USD Amount:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">$${usdAmount.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280;">Payment Method:</td>
                  <td style="padding: 10px 0; font-weight: bold; text-align: right;">${methodName}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>Reason:</strong><br/>
                ${failureReason || 'Unable to process this request. Please contact support for more details.'}
              </p>
            </div>
            
            <p style="font-size: 16px; color: #374151; margin-top: 20px;">
              Don't worry - your CareCoins have been returned to your account. You can submit a new cash-out request after addressing the issue above.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')}/carecoins" 
                 style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold;">
                View My CareCoins
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
              Need help? Contact our support team for assistance.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>FaceSheet360 EHR - CareCoin Blockchain Rewards</p>
          </div>
        </div>
      `,
    };
  }

  return {
    subject: 'CareCoin Cash-Out Update',
    html: `<p>Your cash-out request status has been updated to: ${status}</p>`,
  };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();
    
    console.log('Sending cash-out notification:', {
      email: data.email,
      status: data.status,
      amount: data.amount,
    });

    const { subject, html } = getEmailContent(data);

    const emailResponse = await resend.emails.send({
      from: "FaceSheet360 CareCoin <onboarding@resend.dev>",
      to: [data.email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-cashout-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
