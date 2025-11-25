import { supabase } from '@/integrations/supabase/client';

export type AuditEventType = 
  | 'patient_view'
  | 'patient_create' 
  | 'patient_update'
  | 'patient_delete'
  | 'vitals_view'
  | 'vitals_create'
  | 'vitals_update'
  | 'vitals_delete'
  | 'medication_view'
  | 'medication_create'
  | 'medication_update'
  | 'medication_delete'
  | 'lab_result_view'
  | 'note_view'
  | 'note_create'
  | 'data_export';

interface AuditLogParams {
  eventType: AuditEventType;
  patientId?: string;
  resourceId?: string;
  actionDetails?: Record<string, any>;
}

/**
 * Comprehensive HIPAA audit logging function
 * Logs all patient data access, modifications, and exports
 */
export const logAuditEvent = async ({
  eventType,
  patientId,
  resourceId,
  actionDetails = {}
}: AuditLogParams): Promise<void> => {
  try {
    // Get current user session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;

    // Get client IP and user agent from browser
    const userAgent = navigator.userAgent;
    
    // Log to audit_logs table
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId || null,
        event_type: eventType,
        patient_id: patientId || null,
        resource_id: resourceId || null,
        action_details: {
          ...actionDetails,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        },
        user_agent: userAgent,
        // IP address will be captured server-side if possible
        ip_address: null
      });

    if (error) {
      console.error('Failed to log audit event:', error);
      // Don't throw - we don't want audit logging failures to break the app
    }
  } catch (error) {
    console.error('Error in audit logging:', error);
    // Silent fail - audit logging should never break user operations
  }
};

/**
 * Log patient data access (read operations)
 */
export const logPatientView = async (patientId: string, patientName?: string) => {
  await logAuditEvent({
    eventType: 'patient_view',
    patientId,
    actionDetails: {
      action: 'Patient record accessed',
      patient_name: patientName
    }
  });
};

/**
 * Log patient creation
 */
export const logPatientCreate = async (patientId: string, patientData: any) => {
  await logAuditEvent({
    eventType: 'patient_create',
    patientId,
    actionDetails: {
      action: 'New patient record created',
      patient_name: `${patientData.first_name} ${patientData.last_name}`,
      fields_created: Object.keys(patientData)
    }
  });
};

/**
 * Log patient updates
 */
export const logPatientUpdate = async (
  patientId: string, 
  updatedFields: Record<string, any>,
  patientName?: string
) => {
  await logAuditEvent({
    eventType: 'patient_update',
    patientId,
    actionDetails: {
      action: 'Patient record modified',
      patient_name: patientName,
      fields_updated: Object.keys(updatedFields),
      changes: updatedFields
    }
  });
};

/**
 * Log patient deletion
 */
export const logPatientDelete = async (patientId: string, patientName?: string) => {
  await logAuditEvent({
    eventType: 'patient_delete',
    patientId,
    actionDetails: {
      action: 'Patient record deleted',
      patient_name: patientName,
      warning: 'PERMANENT DELETION'
    }
  });
};

/**
 * Log data exports
 */
export const logDataExport = async (exportType: string, patientId?: string, recordCount?: number) => {
  await logAuditEvent({
    eventType: 'data_export',
    patientId,
    actionDetails: {
      action: 'Data exported',
      export_type: exportType,
      record_count: recordCount
    }
  });
};
