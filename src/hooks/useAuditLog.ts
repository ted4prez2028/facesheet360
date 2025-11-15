/**
 * Hook for HIPAA-compliant audit logging
 */

import { useAuth } from '@/hooks/useAuth';
import { auditLogger, AuditEventType } from '@/utils/auditLogger';

export const useAuditLog = () => {
  const { user } = useAuth();

  const logEvent = async (
    eventType: AuditEventType,
    patientId?: string,
    resourceId?: string,
    actionDetails?: Record<string, any>
  ) => {
    if (!user) {
      console.warn('Audit log skipped: User not authenticated');
      return;
    }

    console.log('Logging audit event:', { eventType, patientId, userId: user.id });

    await auditLogger.log({
      event_type: eventType,
      user_id: user.id,
      patient_id: patientId,
      resource_id: resourceId,
      action_details: actionDetails
    });
  };

  return { logEvent };
};
