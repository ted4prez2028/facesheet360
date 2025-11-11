import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// @ts-expect-error - Ignoring type error as pdfMake expects this assignment
pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

interface DischargeData {
  patient: any;
  vitals: any[];
  medications: any[];
  diagnoses: any[];
  allergies: any[];
  carePlans: any[];
  notes: any[];
  labResults: any[];
  immunizations: any[];
}

export const generateDischargeSummary = async (patientId: string) => {
  try {
    // Fetch all patient data
    const [
      patientResult,
      vitalsResult,
      medicationsResult,
      diagnosesResult,
      allergiesResult,
      carePlansResult,
      notesResult,
      labResultsResult,
      immunizationsResult
    ] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('patient_vitals').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }).limit(10),
      supabase.from('medication_orders').select('*').eq('patient_id', patientId).eq('status', 'active'),
      supabase.from('medical_diagnoses').select('*').eq('patient_id', patientId),
      supabase.from('allergies').select('*').eq('patient_id', patientId).eq('status', 'active'),
      supabase.from('care_plans').select('*').eq('patient_id', patientId).eq('status', 'active'),
      supabase.from('patient_notes').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(5),
      supabase.from('lab_results').select('*').eq('patient_id', patientId).order('performed_at', { ascending: false }).limit(10),
      supabase.from('immunizations').select('*').eq('patient_id', patientId).order('administered_at', { ascending: false })
    ]);

    if (patientResult.error) throw patientResult.error;

    const data: DischargeData = {
      patient: patientResult.data,
      vitals: vitalsResult.data || [],
      medications: medicationsResult.data || [],
      diagnoses: diagnosesResult.data || [],
      allergies: allergiesResult.data || [],
      carePlans: carePlansResult.data || [],
      notes: notesResult.data || [],
      labResults: labResultsResult.data || [],
      immunizations: immunizationsResult.data || []
    };

    const docDefinition = createPDFDocument(data);
    pdfMake.createPdf(docDefinition as any).download(`Discharge_Summary_${data.patient.first_name}_${data.patient.last_name}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  } catch (error) {
    console.error('Error generating discharge summary:', error);
    throw error;
  }
};

const createPDFDocument = (data: DischargeData) => {
  const patient = data.patient;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  
  return {
    content: [
      // Header
      {
        text: 'PATIENT DISCHARGE SUMMARY',
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
        columns: [
          {
            width: '50%',
            stack: [
              { text: `Name: ${fullName}`, style: 'info' },
              { text: `MRN: ${patient.medical_record_number || 'N/A'}`, style: 'info' },
              { text: `DOB: ${patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MM/dd/yyyy') : 'N/A'}`, style: 'info' },
              { text: `Age: ${patient.age || 'N/A'}`, style: 'info' }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: `Gender: ${patient.gender || 'N/A'}`, style: 'info' },
              { text: `Room: ${patient.room_number || 'N/A'}`, style: 'info' },
              { text: `Discharge Date: ${format(new Date(), 'MM/dd/yyyy HH:mm')}`, style: 'info' }
            ]
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // Allergies
      {
        text: 'ALLERGIES',
        style: 'sectionHeader'
      },
      data.allergies.length > 0 ? {
        ul: data.allergies.map(a => `${a.allergen} (${a.severity || 'Unknown severity'}) - ${a.reaction || 'No reaction noted'}`),
        margin: [0, 0, 0, 15]
      } : { text: 'No known allergies', style: 'noData', margin: [0, 0, 0, 15] },

      // Active Diagnoses
      {
        text: 'ACTIVE DIAGNOSES',
        style: 'sectionHeader'
      },
      data.diagnoses.filter(d => d.status === 'active').length > 0 ? {
        ul: data.diagnoses.filter(d => d.status === 'active').map(d => 
          `${d.diagnosis_name}${d.diagnosis_code ? ` (${d.diagnosis_code})` : ''} - Onset: ${d.onset_date ? format(new Date(d.onset_date), 'MM/dd/yyyy') : 'Unknown'}`
        ),
        margin: [0, 0, 0, 15]
      } : { text: 'No active diagnoses', style: 'noData', margin: [0, 0, 0, 15] },

      // Care Plan Summary
      {
        text: 'CARE PLAN SUMMARY',
        style: 'sectionHeader'
      },
      ...data.carePlans.map(cp => ({
        stack: [
          { text: cp.title, style: 'subHeader' },
          { text: cp.description || 'No description', style: 'info' },
          { text: `Goals: ${cp.goals || 'No goals specified'}`, style: 'info' },
          { text: `Interventions: ${cp.interventions || 'No interventions specified'}`, style: 'info', margin: [0, 0, 0, 10] }
        ]
      })),
      data.carePlans.length === 0 ? { text: 'No active care plans', style: 'noData', margin: [0, 0, 0, 15] } : {},

      // Medications at Discharge
      {
        text: 'MEDICATIONS AT DISCHARGE',
        style: 'sectionHeader',
        pageBreak: data.carePlans.length > 2 ? 'before' : undefined
      },
      data.medications.length > 0 ? {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Medication', style: 'tableHeader' },
              { text: 'Dosage', style: 'tableHeader' },
              { text: 'Frequency', style: 'tableHeader' },
              { text: 'Route', style: 'tableHeader' }
            ],
            ...data.medications.map(m => [
              m.medication_name,
              m.dosage,
              m.frequency,
              m.route || 'N/A'
            ])
          ]
        },
        margin: [0, 0, 0, 15]
      } : { text: 'No active medications', style: 'noData', margin: [0, 0, 0, 15] },

      // Recent Vital Signs
      {
        text: 'RECENT VITAL SIGNS (Last 5 Readings)',
        style: 'sectionHeader'
      },
      data.vitals.slice(0, 5).length > 0 ? {
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Date', style: 'tableHeader' },
              { text: 'BP', style: 'tableHeader' },
              { text: 'HR', style: 'tableHeader' },
              { text: 'Temp', style: 'tableHeader' },
              { text: 'SpO2', style: 'tableHeader' },
              { text: 'Pain', style: 'tableHeader' }
            ],
            ...data.vitals.slice(0, 5).map(v => [
              format(new Date(v.recorded_at), 'MM/dd HH:mm'),
              v.blood_pressure_systolic && v.blood_pressure_diastolic ? `${v.blood_pressure_systolic}/${v.blood_pressure_diastolic}` : 'N/A',
              v.heart_rate ? `${v.heart_rate}` : 'N/A',
              v.temperature ? `${v.temperature}°F` : 'N/A',
              v.oxygen_saturation ? `${v.oxygen_saturation}%` : 'N/A',
              v.pain_scale ? `${v.pain_scale}/10` : 'N/A'
            ])
          ]
        },
        margin: [0, 0, 0, 15]
      } : { text: 'No recent vitals', style: 'noData', margin: [0, 0, 0, 15] },

      // Recent Lab Results
      {
        text: 'RECENT LAB RESULTS',
        style: 'sectionHeader'
      },
      data.labResults.length > 0 ? {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Test', style: 'tableHeader' },
              { text: 'Result', style: 'tableHeader' },
              { text: 'Reference', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' }
            ],
            ...data.labResults.map(l => [
              l.test_name,
              l.result_value ? `${l.result_value} ${l.result_unit || ''}` : 'Pending',
              l.reference_range || 'N/A',
              l.performed_at ? format(new Date(l.performed_at), 'MM/dd/yyyy') : 'N/A'
            ])
          ]
        },
        margin: [0, 0, 0, 15]
      } : { text: 'No recent lab results', style: 'noData', margin: [0, 0, 0, 15] },

      // Immunizations
      {
        text: 'IMMUNIZATION HISTORY',
        style: 'sectionHeader'
      },
      data.immunizations.length > 0 ? {
        ul: data.immunizations.map(i => 
          `${i.vaccine_name} - Administered: ${format(new Date(i.administered_at), 'MM/dd/yyyy')}`
        ),
        margin: [0, 0, 0, 15]
      } : { text: 'No immunization records', style: 'noData', margin: [0, 0, 0, 15] },

      // Recent Clinical Notes
      {
        text: 'RECENT CLINICAL NOTES',
        style: 'sectionHeader',
        pageBreak: 'before'
      },
      ...data.notes.map(note => ({
        stack: [
          { 
            text: `${note.note_type.toUpperCase()} - ${format(new Date(note.created_at), 'MM/dd/yyyy HH:mm')}`, 
            style: 'subHeader' 
          },
          { text: note.note_content, style: 'info', margin: [0, 0, 0, 10] }
        ]
      })),
      data.notes.length === 0 ? { text: 'No recent notes', style: 'noData', margin: [0, 0, 0, 15] } : {},

      // Footer
      {
        text: '\n\nDischarge Instructions: Follow up with primary care provider within 7-14 days. Contact physician immediately if symptoms worsen or new symptoms develop.',
        style: 'footer',
        margin: [0, 20, 0, 0]
      },
      {
        text: `\nGenerated on ${format(new Date(), 'MM/dd/yyyy HH:mm:ss')}`,
        style: 'footer',
        alignment: 'center'
      }
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true
      },
      sectionHeader: {
        fontSize: 14,
        bold: true,
        margin: [0, 10, 0, 5],
        decoration: 'underline'
      },
      subHeader: {
        fontSize: 12,
        bold: true,
        margin: [0, 5, 0, 3]
      },
      info: {
        fontSize: 10,
        margin: [0, 2, 0, 2]
      },
      tableHeader: {
        fontSize: 10,
        bold: true,
        fillColor: '#f0f0f0'
      },
      noData: {
        fontSize: 10,
        italics: true,
        color: '#666666'
      },
      footer: {
        fontSize: 9,
        italics: true
      }
    },
    defaultStyle: {
      fontSize: 10
    }
  };
};
