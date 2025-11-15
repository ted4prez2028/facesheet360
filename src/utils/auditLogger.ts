/**
 * HIPAA Compliant Audit Logging System
 * Clean implementation for tracking patient data access
 */

import { supabase } from '@/integrations/supabase/client';

export type AuditEventType = 
  | 'patient_view'
  | 'patient_create'
  | 'patient_update'
  | 'patient_delete'
  | 'chart_access'
  | 'prescription_view'
  | 'prescription_create'
  | 'appointment_create'
  | 'appointment_update'
  | 'login'
  | 'logout'
  | 'data_export';

interface AuditLogEntry {
  event_type: AuditEventType;
  user_id: string;
  patient_id?: string;
  resource_id?: string;
  action_details?: Record<string, any>;
}

class AuditLogger {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      const logEntry = {
        ...entry,
        ip_address: await this.getIpAddress(),
        user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      };

      const { error } = await supabase
        .from('audit_logs')
        .insert(logEntry);

      if (error) {
        console.error('Failed to write audit log:', error);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }
  }

  private async getIpAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json', {
        signal: AbortSignal.timeout(2000)
      });
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }
}

export const auditLogger = new AuditLogger();

// Convenience functions
export const logPatientView = (userId: string, patientId: string) => {
  auditLogger.log({
    event_type: 'patient_view',
    user_id: userId,
    patient_id: patientId
  });
};

export const logPatientUpdate = (userId: string, patientId: string, changes: Record<string, any>) => {
  auditLogger.log({
    event_type: 'patient_update',
    user_id: userId,
    patient_id: patientId,
    action_details: { changes }
  });
};

export const logChartAccess = (userId: string, patientId: string, chartId: string) => {
  auditLogger.log({
    event_type: 'chart_access',
    user_id: userId,
    patient_id: patientId,
    resource_id: chartId
  });
};

export const logDataExport = (userId: string, exportType: string, recordCount: number) => {
  auditLogger.log({
    event_type: 'data_export',
    user_id: userId,
    action_details: { exportType, recordCount }
  });
};
