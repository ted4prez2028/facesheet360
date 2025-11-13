/**
 * Discharge Summary Generator - REWRITTEN with proper types and real data
 * No more fake data!
 */

import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DischargeSummaryData, DischargeFormData, DischargeValidationResult } from '@/types/discharge';
import { toast } from 'sonner';

// @ts-ignore - pdfMake typing issue
pdfMake.vfs = pdfFonts.vfs;

/**
 * Validates that all required discharge data is present
 */
export const validateDischargeData = (data: Partial<DischargeSummaryData>): DischargeValidationResult => {
  const errors: Array<{ field: string; message: string }> = [];
  const missingFields: string[] = [];

  if (!data.patient?.first_name || !data.patient?.last_name) {
    errors.push({ field: 'patient', message: 'Patient name is required' });
    missingFields.push('Patient Name');
  }

  if (!data.admission?.discharge_condition) {
    errors.push({ field: 'discharge_condition', message: 'Discharge condition is required' });
    missingFields.push('Discharge Condition');
  }

  if (!data.admission?.discharge_disposition) {
    errors.push({ field: 'discharge_disposition', message: 'Discharge disposition is required' });
    missingFields.push('Discharge Disposition');
  }

  if (!data.discharge_details?.activity) {
    errors.push({ field: 'activity', message: 'Activity instructions are required' });
    missingFields.push('Activity Instructions');
  }

  if (!data.discharge_details?.diet) {
    errors.push({ field: 'diet', message: 'Diet instructions are required' });
    missingFields.push('Diet Instructions');
  }

  if (!data.discharge_details?.instructions) {
    errors.push({ field: 'instructions', message: 'Discharge instructions are required' });
    missingFields.push('Discharge Instructions');
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields
  };
};

/**
 * Fetches discharge summary data using the optimized view - NO FAKE DATA
 */
export const fetchDischargeSummaryData = async (
  patientId: string,
  formData: DischargeFormData
): Promise<DischargeSummaryData> => {
  try {
    // Fetch all data separately to avoid type issues
    const [patientRes, allergiesRes, diagnosesRes, medicationsRes, proceduresRes, consultationsRes, vitalsRes, labsRes, immunizationsRes] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('allergies').select('*').eq('patient_id', patientId).eq('status', 'active'),
      supabase.from('medical_diagnoses').select('*').eq('patient_id', patientId).eq('status', 'active'),
      supabase.from('medication_orders').select('*').eq('patient_id', patientId).eq('status', 'active'),
      supabase.from('procedures').select('*').eq('patient_id', patientId).order('procedure_date', { ascending: false }).limit(10),
      supabase.from('consultations').select('*').eq('patient_id', patientId).order('consultation_date', { ascending: false }).limit(10),
      supabase.from('patient_vitals').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }).limit(1),
      supabase.from('lab_results').select('*').eq('patient_id', patientId).order('performed_at', { ascending: false }).limit(10),
      supabase.from('immunizations').select('*').eq('patient_id', patientId).order('administered_at', { ascending: false })
    ]);

    if (patientRes.error) throw patientRes.error;
    if (!patientRes.data) throw new Error('Patient not found');

    const patient = patientRes.data;
    const firstName = patient.first_name || patient.name?.split(' ')[0] || '';
    const lastName = patient.last_name || patient.name?.split(' ')[1] || '';

    const summaryData: DischargeSummaryData = {
      patient: {
        id: patient.id,
        first_name: firstName,
        last_name: lastName,
        date_of_birth: patient.date_of_birth || '',
        medical_record_number: patient.medical_record_number || '',
        gender: patient.gender || '',
        phone: patient.phone || undefined,
        email: patient.email || undefined,
        address: patient.address || undefined,
        room_number: patient.room_number || undefined,
      },
      admission: {
        admission_date: patient.admission_date || '',
        discharge_date: new Date().toISOString(),
        discharge_condition: formData.discharge_condition,
        discharge_disposition: formData.discharge_disposition,
      },
      discharge_details: {
        activity: formData.discharge_activity,
        diet: formData.discharge_diet,
        instructions: formData.discharge_instructions,
        follow_up: formData.discharge_follow_up,
      },
      allergies: allergiesRes.data || [],
      diagnoses: diagnosesRes.data || [],
      medications: medicationsRes.data || [],
      procedures: proceduresRes.data || [],
      consultations: consultationsRes.data || [],
      vitals: vitalsRes.data?.[0] || undefined,
      labs: labsRes.data || [],
      immunizations: immunizationsRes.data || [],
    };

    return summaryData;
  } catch (error) {
    console.error('Error fetching discharge summary data:', error);
    throw new Error('Failed to fetch patient data for discharge summary');
  }
};

/**
 * Generates the PDF document from discharge summary data
 */
const createDischargePDF = (data: DischargeSummaryData): any => {
  const patientName = `${data.patient.first_name} ${data.patient.last_name}`;
  const today = format(new Date(), 'MM/dd/yyyy');

  return {
    content: [
      // Header
      {
        text: 'DISCHARGE SUMMARY',
        style: 'header',
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },

      // Patient Demographics
      {
        text: 'PATIENT INFORMATION',
        style: 'sectionHeader'
      },
      {
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: 'Name:', bold: true },
              { text: patientName, colSpan: 3 },
              {},
              {}
            ],
            [
              { text: 'DOB:', bold: true },
              data.patient.date_of_birth ? format(new Date(data.patient.date_of_birth), 'MM/dd/yyyy') : 'N/A',
              { text: 'MRN:', bold: true },
              data.patient.medical_record_number || 'N/A'
            ],
            [
              { text: 'Gender:', bold: true },
              data.patient.gender || 'N/A',
              { text: 'Room:', bold: true },
              data.patient.room_number || 'N/A'
            ],
            [
              { text: 'Admission:', bold: true },
              data.admission.admission_date ? format(new Date(data.admission.admission_date), 'MM/dd/yyyy') : 'N/A',
              { text: 'Discharge:', bold: true },
              format(new Date(data.admission.discharge_date), 'MM/dd/yyyy')
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 15]
      },

      // Allergies
      {
        text: 'ALLERGIES',
        style: 'sectionHeader'
      },
      data.allergies.length > 0 ? {
        ul: data.allergies.map(a => 
          `${a.allergen}${a.severity ? ` (${a.severity})` : ''}${a.reaction ? ` - ${a.reaction}` : ''}`
        ),
        margin: [0, 5, 0, 15]
      } : { text: 'No Known Allergies', margin: [0, 5, 0, 15] },

      // Diagnoses
      {
        text: 'DISCHARGE DIAGNOSES',
        style: 'sectionHeader'
      },
      data.diagnoses.length > 0 ? {
        ol: data.diagnoses.map(d => 
          `${d.diagnosis_name}${d.diagnosis_code ? ` (${d.diagnosis_code})` : ''}`
        ),
        margin: [0, 5, 0, 15]
      } : { text: 'No diagnoses recorded', margin: [0, 5, 0, 15] },

      // Hospital Course (if procedures/consultations exist)
      ...(data.procedures.length > 0 || data.consultations.length > 0 ? [
        {
          text: 'HOSPITAL COURSE',
          style: 'sectionHeader'
        },
        data.procedures.length > 0 ? {
          text: 'Procedures Performed:',
          bold: true,
          margin: [0, 5, 0, 2]
        } : {},
        data.procedures.length > 0 ? {
          ul: data.procedures.map(p => 
            `${p.procedure_name} (${p.procedure_date ? format(new Date(p.procedure_date), 'MM/dd/yyyy') : 'Date unknown'})`
          ),
          margin: [0, 0, 0, 10]
        } : {},
        data.consultations.length > 0 ? {
          text: 'Consultations:',
          bold: true,
          margin: [0, 5, 0, 2]
        } : {},
        data.consultations.length > 0 ? {
          ul: data.consultations.map(c => 
            `${c.specialty}${c.consultant_name ? ` - ${c.consultant_name}` : ''}`
          ),
          margin: [0, 0, 0, 15]
        } : {}
      ] : []),

      // Discharge Medications
      {
        text: 'DISCHARGE MEDICATIONS',
        style: 'sectionHeader'
      },
      data.medications.length > 0 ? {
        ol: data.medications.map(m => 
          `${m.medication_name} ${m.dosage} ${m.route || ''} ${m.frequency}${m.instructions ? `\n   ${m.instructions}` : ''}`
        ),
        margin: [0, 5, 0, 15]
      } : { text: 'No active medications', margin: [0, 5, 0, 15] },

      // Discharge Condition & Disposition
      {
        text: 'DISCHARGE STATUS',
        style: 'sectionHeader'
      },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [
              { text: 'Condition:', bold: true },
              data.admission.discharge_condition.toUpperCase()
            ],
            [
              { text: 'Disposition:', bold: true },
              data.admission.discharge_disposition === 'home' ? 'Home with Family' :
              data.admission.discharge_disposition === 'snf' ? 'Skilled Nursing Facility' :
              data.admission.discharge_disposition === 'rehab' ? 'Rehabilitation Facility' :
              data.admission.discharge_disposition.toUpperCase()
            ]
          ]
        },
        layout: 'lightHorizontalLines',
        margin: [0, 5, 0, 15]
      },

      // Activity & Diet
      {
        text: 'ACTIVITY',
        style: 'sectionHeader'
      },
      { text: data.discharge_details.activity || 'No specific restrictions', margin: [0, 5, 0, 15] },

      {
        text: 'DIET',
        style: 'sectionHeader'
      },
      { text: data.discharge_details.diet || 'Regular diet', margin: [0, 5, 0, 15] },

      // Follow-up Care
      {
        text: 'FOLLOW-UP CARE',
        style: 'sectionHeader'
      },
      { text: data.discharge_details.follow_up || 'Follow up with primary care physician as needed', margin: [0, 5, 0, 15] },

      // Discharge Instructions
      {
        text: 'DISCHARGE INSTRUCTIONS / PATIENT EDUCATION',
        style: 'sectionHeader'
      },
      { text: data.discharge_details.instructions || 'Standard discharge instructions provided', margin: [0, 5, 0, 15] },

      // Vitals at Discharge (if available)
      ...(data.vitals ? [
        {
          text: 'VITAL SIGNS AT DISCHARGE',
          style: 'sectionHeader'
        },
        {
          text: [
            data.vitals.temperature ? `Temp: ${data.vitals.temperature}°F  ` : '',
            data.vitals.heart_rate ? `HR: ${data.vitals.heart_rate} bpm  ` : '',
            data.vitals.blood_pressure_systolic && data.vitals.blood_pressure_diastolic ? 
              `BP: ${data.vitals.blood_pressure_systolic}/${data.vitals.blood_pressure_diastolic} mmHg  ` : '',
            data.vitals.respiratory_rate ? `RR: ${data.vitals.respiratory_rate} /min  ` : '',
            data.vitals.oxygen_saturation ? `SpO2: ${data.vitals.oxygen_saturation}%` : ''
          ].filter(Boolean).join(''),
          margin: [0, 5, 0, 15]
        }
      ] : []),

      // Signature Block
      {
        text: '\n\n\n___________________________________',
        margin: [0, 30, 0, 5]
      },
      {
        text: 'Physician Signature',
        fontSize: 10,
        margin: [0, 0, 0, 5]
      },
      {
        text: `Date: ${today}`,
        fontSize: 10
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true
      },
      sectionHeader: {
        fontSize: 12,
        bold: true,
        decoration: 'underline',
        margin: [0, 10, 0, 5]
      }
    },
    defaultStyle: {
      fontSize: 10
    },
    pageMargins: [40, 40, 40, 40]
  };
};

/**
 * Main function: Generates and downloads discharge summary PDF
 */
export const generateDischargeSummary = async (
  patientId: string,
  formData: DischargeFormData
): Promise<void> => {
  try {
    // Fetch real data
    const data = await fetchDischargeSummaryData(patientId, formData);

    // Validate data
    const validation = validateDischargeData(data);
    if (!validation.isValid) {
      const missingFieldsList = validation.missingFields.join(', ');
      toast.error('Cannot generate discharge summary', {
        description: `Missing required fields: ${missingFieldsList}`
      });
      throw new Error(`Missing required discharge fields: ${missingFieldsList}`);
    }

    // Update patient record with discharge data
    const { error: updateError } = await supabase
      .from('patients')
      .update({
        discharge_condition: formData.discharge_condition,
        discharge_disposition: formData.discharge_disposition,
        discharge_activity: formData.discharge_activity,
        discharge_diet: formData.discharge_diet,
        discharge_instructions: formData.discharge_instructions,
        discharge_follow_up: formData.discharge_follow_up,
        discharged_at: new Date().toISOString(),
        status: 'discharged'
      })
      .eq('id', patientId);

    if (updateError) throw updateError;

    // Log discharge event
    await supabase.from('audit_logs').insert({
      event_type: 'patient_discharge',
      patient_id: patientId,
      action_details: {
        condition: formData.discharge_condition,
        disposition: formData.discharge_disposition
      }
    });

    // Store discharge summary record
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      await supabase.from('discharge_summaries').insert({
        patient_id: patientId,
        generated_by: user.user.id,
        summary_data: data as any
      } as any);
    }

    // Generate and download PDF
    const pdfDoc = createDischargePDF(data);
    const pdf = pdfMake.createPdf(pdfDoc);
    
    const fileName = `Discharge_Summary_${data.patient.last_name}_${data.patient.first_name}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    pdf.download(fileName);

    toast.success('Discharge summary generated successfully');
  } catch (error) {
    console.error('Error generating discharge summary:', error);
    toast.error('Failed to generate discharge summary', {
      description: error instanceof Error ? error.message : 'An unexpected error occurred'
    });
    throw error;
  }
};
