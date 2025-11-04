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
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      throw new Error('No file provided');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const fileContent = await file.text();
    let patientData;

    // Parse CSV or JSON
    if (file.name.endsWith('.json')) {
      patientData = JSON.parse(fileContent);
    } else {
      // Simple CSV parsing (you may want to use a library for complex CSV)
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',');
      patientData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index]?.trim();
          return obj;
        }, {} as any);
      });
    }

    // Transform Epic data to our schema
    const patientsToInsert = Array.isArray(patientData) ? patientData : [patientData];
    const transformedPatients = patientsToInsert.map(patient => ({
      first_name: patient.firstName || patient.first_name,
      last_name: patient.lastName || patient.last_name,
      date_of_birth: patient.dateOfBirth || patient.date_of_birth,
      gender: patient.gender,
      medical_record_number: patient.mrn || patient.medical_record_number,
      room_number: patient.room || patient.room_number,
      phone_number: patient.phone || patient.phone_number,
      address: patient.address,
      emergency_contact_name: patient.emergencyContactName || patient.emergency_contact_name,
      emergency_contact_phone: patient.emergencyContactPhone || patient.emergency_contact_phone,
      epic_id: patient.id || patient.epicId, // Store Epic's ID for reference
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
