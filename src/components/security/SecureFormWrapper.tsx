/**
 * Secure Form Wrapper with Validation and Audit Logging
 */

import { ReactNode, FormEvent } from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Form } from '@/components/ui/form';

interface SecureFormWrapperProps {
  children: ReactNode;
  onSubmit: (e: FormEvent) => void | Promise<void>;
  auditEventType?: string;
  patientId?: string;
  className?: string;
}

export const SecureFormWrapper = ({
  children,
  onSubmit,
  auditEventType,
  patientId,
  className
}: SecureFormWrapperProps) => {
  const { logEvent } = useAuditLog();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Log form submission for audit trail
    if (auditEventType) {
      await logEvent(auditEventType as any, patientId);
    }

    await onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
};
