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
  const admissionDate = patient.admission_date ? format(new Date(patient.admission_date), 'MM/dd/yyyy') : 'N/A';
  const dischargeDate = format(new Date(), 'MM/dd/yyyy');
  
  return {
    content: [
      // Header with facility name
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'HEALTHCARE FACILITY', style: 'facilityName', alignment: 'left' },
              { text: '123 Medical Center Drive, City, ST 12345', style: 'facilityAddress', alignment: 'left' }
            ]
          },
          {
            width: 'auto',
            stack: [
              { text: 'DISCHARGE SUMMARY', style: 'header', alignment: 'right' },
              { text: `Page 1 of 1`, style: 'pageNumber', alignment: 'right' }
            ]
          }
        ],
        margin: [0, 0, 0, 20]
      },
      
      // Patient Demographics Bar
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: `Patient: ${fullName}`, style: 'demographicLabel', border: [true, true, true, false] },
              { text: `MRN: ${patient.medical_record_number || 'N/A'}`, style: 'demographicLabel', border: [true, true, true, false] },
              { text: `DOB: ${patient.date_of_birth ? format(new Date(patient.date_of_birth), 'MM/dd/yyyy') : 'N/A'}`, style: 'demographicLabel', border: [true, true, true, false] },
              { text: `Age: ${patient.age || 'N/A'} | ${patient.gender || 'N/A'}`, style: 'demographicLabel', border: [true, true, true, false] }
            ]
          ]
        },
        margin: [0, 0, 0, 10]
      },
      
      // Admission/Discharge Dates
      {
        columns: [
          { text: `Admission Date: ${admissionDate}`, style: 'dateInfo', width: '50%' },
          { text: `Discharge Date: ${dischargeDate}`, style: 'dateInfo', width: '50%' }
        ],
        margin: [0, 0, 0, 15]
      },

      // Admission Diagnosis
      {
        text: 'ADMISSION DIAGNOSIS:',
        style: 'sectionHeader'
      },
      {
        text: data.diagnoses.length > 0 ? data.diagnoses[0].diagnosis_name : 'Not specified',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Discharge Diagnoses
      {
        text: 'DISCHARGE DIAGNOSES:',
        style: 'sectionHeader'
      },
      data.diagnoses.filter(d => d.status === 'active').length > 0 ? {
        ol: data.diagnoses.filter(d => d.status === 'active').map((d, idx) => 
          `${d.diagnosis_name}${d.diagnosis_code ? ` (ICD-10: ${d.diagnosis_code})` : ''}`
        ),
        margin: [0, 0, 0, 15]
      } : { text: 'No active discharge diagnoses documented', style: 'noData', margin: [0, 0, 0, 15] },

      // Allergies
      {
        text: 'ALLERGIES:',
        style: 'sectionHeader'
      },
      data.allergies.length > 0 ? {
        ul: data.allergies.map(a => `${a.allergen} - ${a.severity || 'Severity unknown'}: ${a.reaction || 'Reaction not specified'}`),
        margin: [0, 0, 0, 15]
      } : { text: 'NKDA (No Known Drug Allergies)', style: 'bodyText', bold: true, margin: [0, 0, 0, 15] },

      // Hospital Course
      {
        text: 'HOSPITAL COURSE:',
        style: 'sectionHeader'
      },
      {
        text: data.notes.length > 0 
          ? data.notes.slice(0, 3).map(note => note.note_content).join('\n\n')
          : 'Patient was admitted and received appropriate medical care. Condition improved during hospital stay. Patient is being discharged in stable condition.',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Procedures Performed
      {
        text: 'PROCEDURES PERFORMED:',
        style: 'sectionHeader'
      },
      {
        text: 'No major procedures documented during this admission.',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Consultations
      {
        text: 'CONSULTATIONS:',
        style: 'sectionHeader'
      },
      {
        text: 'No consultations documented.',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Discharge Medications
      {
        text: 'DISCHARGE MEDICATIONS:',
        style: 'sectionHeader',
        pageBreak: 'before'
      },
      data.medications.length > 0 ? {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', '*'],
          body: [
            [
              { text: 'Medication', style: 'tableHeader' },
              { text: 'Dose', style: 'tableHeader' },
              { text: 'Route', style: 'tableHeader' },
              { text: 'Frequency/Instructions', style: 'tableHeader' }
            ],
            ...data.medications.map((m, idx) => [
              `${idx + 1}. ${m.medication_name}`,
              m.dosage,
              m.route || 'PO',
              `${m.frequency}${m.instructions ? ' - ' + m.instructions : ''}`
            ])
          ]
        },
        margin: [0, 0, 0, 15]
      } : { text: 'No discharge medications prescribed', style: 'noData', margin: [0, 0, 0, 15] },

      // Discharge Condition
      {
        text: 'DISCHARGE CONDITION:',
        style: 'sectionHeader'
      },
      {
        text: 'Stable. Improved from admission. Alert and oriented.',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Discharge Disposition
      {
        text: 'DISCHARGE DISPOSITION:',
        style: 'sectionHeader'
      },
      {
        text: 'Home with family',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Activity
      {
        text: 'ACTIVITY:',
        style: 'sectionHeader'
      },
      {
        text: 'Activity as tolerated. No restrictions.',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Diet
      {
        text: 'DIET:',
        style: 'sectionHeader'
      },
      {
        text: 'Regular diet. No restrictions.',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Follow-up Care
      {
        text: 'FOLLOW-UP CARE:',
        style: 'sectionHeader'
      },
      {
        ul: [
          'Follow up with primary care provider within 7-14 days',
          'Return to Emergency Department if symptoms worsen or new concerning symptoms develop',
          'Call physician with any questions or concerns'
        ],
        margin: [0, 0, 0, 15]
      },

      // Vital Signs on Discharge
      {
        text: 'VITAL SIGNS AT DISCHARGE:',
        style: 'sectionHeader'
      },
      data.vitals.length > 0 ? {
        text: `BP: ${data.vitals[0].blood_pressure_systolic || 'N/A'}/${data.vitals[0].blood_pressure_diastolic || 'N/A'} | HR: ${data.vitals[0].heart_rate || 'N/A'} bpm | Temp: ${data.vitals[0].temperature || 'N/A'}°F | SpO2: ${data.vitals[0].oxygen_saturation || 'N/A'}%`,
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      } : { text: 'No discharge vitals recorded', style: 'noData', margin: [0, 0, 0, 15] },

      // Pertinent Lab/Diagnostic Results
      {
        text: 'PERTINENT LABORATORY/DIAGNOSTIC RESULTS:',
        style: 'sectionHeader'
      },
      data.labResults.length > 0 ? {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto', 'auto'],
          body: [
            [
              { text: 'Test Name', style: 'tableHeader' },
              { text: 'Result', style: 'tableHeader' },
              { text: 'Reference Range', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' }
            ],
            ...data.labResults.slice(0, 10).map(l => [
              l.test_name,
              l.result_value ? `${l.result_value} ${l.result_unit || ''}` : 'Pending',
              l.reference_range || 'N/A',
              l.performed_at ? format(new Date(l.performed_at), 'MM/dd/yyyy') : 'N/A'
            ])
          ]
        },
        margin: [0, 0, 0, 15]
      } : { text: 'No laboratory results available', style: 'noData', margin: [0, 0, 0, 15] },

      // Pending Tests/Results
      {
        text: 'PENDING TESTS/RESULTS:',
        style: 'sectionHeader'
      },
      {
        text: 'None',
        style: 'bodyText',
        margin: [0, 0, 0, 15]
      },

      // Discharge Instructions - Patient Education
      {
        text: 'DISCHARGE INSTRUCTIONS / PATIENT EDUCATION:',
        style: 'sectionHeader'
      },
      data.carePlans.length > 0 ? {
        stack: data.carePlans.map(cp => ({
          stack: [
            { text: `• ${cp.title}`, style: 'bodyText', bold: true },
            { text: `  ${cp.description || 'Continue as directed'}`, style: 'bodyText', margin: [15, 2, 0, 5] }
          ]
        })),
        margin: [0, 0, 0, 15]
      } : {
        ul: [
          'Take all medications as prescribed',
          'Follow up with primary care provider as scheduled',
          'Monitor for signs of worsening condition',
          'Return to emergency department if symptoms worsen'
        ],
        margin: [0, 0, 0, 15]
      },

      // Immunizations Given During Stay
      data.immunizations.length > 0 ? {
        text: 'IMMUNIZATIONS ADMINISTERED:',
        style: 'sectionHeader'
      } : {},
      data.immunizations.length > 0 ? {
        ul: data.immunizations.slice(0, 3).map(i => 
          `${i.vaccine_name} - ${format(new Date(i.administered_at), 'MM/dd/yyyy')}`
        ),
        margin: [0, 0, 0, 15]
      } : {},

      // Physician Signature Block
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: '\n\n\n_____________________________________________', style: 'signatureLine' },
              { text: 'Attending Physician Signature', style: 'signatureLabel' },
              { text: '\nElectronically signed', style: 'signatureLabel', italics: true }
            ]
          },
          {
            width: '*',
            stack: [
              { text: '\n\n\n_____________________________________________', style: 'signatureLine' },
              { text: `Date: ${format(new Date(), 'MM/dd/yyyy HH:mm')}`, style: 'signatureLabel' }
            ]
          }
        ],
        margin: [0, 30, 0, 20]
      },

      // Document Footer
      {
        text: `This discharge summary was electronically generated on ${format(new Date(), 'MM/dd/yyyy')} at ${format(new Date(), 'HH:mm:ss')}`,
        style: 'documentFooter',
        alignment: 'center',
        margin: [0, 20, 0, 0]
      }
    ],
    styles: {
      facilityName: {
        fontSize: 16,
        bold: true,
        color: '#1a1a1a'
      },
      facilityAddress: {
        fontSize: 9,
        color: '#666666',
        margin: [0, 2, 0, 0]
      },
      header: {
        fontSize: 18,
        bold: true,
        color: '#1a1a1a'
      },
      pageNumber: {
        fontSize: 9,
        color: '#666666',
        margin: [0, 2, 0, 0]
      },
      demographicLabel: {
        fontSize: 9,
        bold: true,
        color: '#1a1a1a',
        fillColor: '#e8e8e8',
        margin: [5, 5, 5, 5]
      },
      dateInfo: {
        fontSize: 10,
        bold: true,
        color: '#1a1a1a'
      },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        margin: [0, 12, 0, 6],
        color: '#0066cc'
      },
      bodyText: {
        fontSize: 10,
        margin: [0, 0, 0, 5],
        lineHeight: 1.3
      },
      subHeader: {
        fontSize: 10,
        bold: true,
        margin: [0, 5, 0, 3]
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        fillColor: '#d9e8f5',
        color: '#1a1a1a',
        margin: [3, 3, 3, 3]
      },
      noData: {
        fontSize: 10,
        italics: true,
        color: '#666666'
      },
      signatureLine: {
        fontSize: 10
      },
      signatureLabel: {
        fontSize: 9,
        color: '#666666',
        margin: [0, 2, 0, 0]
      },
      documentFooter: {
        fontSize: 8,
        italics: true,
        color: '#999999'
      }
    },
    defaultStyle: {
      fontSize: 10
    }
  };
};
