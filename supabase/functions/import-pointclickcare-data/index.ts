import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, facilityId } = await req.json();

    if (!apiKey || !facilityId) {
      throw new Error('API key and facility ID are required');
    }

    // Call PointClickCare API
    const pccResponse = await fetch(
      `https://api.pointclickcare.com/api/public/preview1/facilities/${facilityId}/residents`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!pccResponse.ok) {
      throw new Error('Failed to fetch data from PointClickCare');
    }

    const pccData = await pccResponse.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Transform PointClickCare data to our schema
    const transformedPatients = pccData.residents.map((resident: any) => ({
      first_name: resident.firstName,
      last_name: resident.lastName,
      date_of_birth: resident.dateOfBirth,
      gender: resident.gender,
      medical_record_number: resident.residentId,
      room_number: resident.roomNumber,
      phone_number: resident.phoneNumber,
      address: `${resident.address?.street}, ${resident.address?.city}, ${resident.address?.state} ${resident.address?.zip}`,
      emergency_contact_name: resident.emergencyContact?.name,
      emergency_contact_phone: resident.emergencyContact?.phone,
      pointclickcare_id: resident.id, // Store PCC's ID for reference
    }));

    // Insert patients
    const { data, error } = await supabaseClient
      .from('patients')
      .insert(transformedPatients)
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        recordsCount: data.length,
        patientId: data[0]?.id // Return first patient ID for facial capture
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
