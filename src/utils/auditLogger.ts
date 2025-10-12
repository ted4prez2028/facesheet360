/**
 * HIPAA Compliant Audit Logging System
 * Tracks all patient data access and modifications
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
  ip_address?: string;
  user_agent?: string;
}

class AuditLogger {
  private static instance: AuditLogger;
  private queue: AuditLogEntry[] = [];
  private isProcessing = false;

  private constructor() {
    // Flush queue every 5 seconds
    setInterval(() => this.flushQueue(), 5000);
  }

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(entry: AuditLogEntry): Promise<void> {
    const enrichedEntry = {
      ...entry,
      ip_address: await this.getIpAddress(),
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    this.queue.push(enrichedEntry);

    // If queue is large, flush immediately
    if (this.queue.length >= 10) {
      await this.flushQueue();
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = [...this.queue];
    this.queue = [];

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert(batch);

      if (error) {
        console.error('Failed to write audit logs:', error);
        // Re-add to queue on failure
        this.queue.unshift(...batch);
      }
    } catch (error) {
      console.error('Audit logging error:', error);
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  private async getIpAddress(): Promise<string | undefined> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return undefined;
    }
  }
}

export const auditLogger = AuditLogger.getInstance();

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
