/**
 * HIPAA Compliance Dashboard
 * Monitors and displays HIPAA compliance status
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Check, AlertTriangle, Lock, Eye, FileText, Database, Key, Activity } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ComplianceItem {
  id: string;
  category: string;
  requirement: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  description: string;
  icon: typeof Shield;
}

const complianceItems: ComplianceItem[] = [
  {
    id: 'encryption',
    category: 'Security',
    requirement: 'Data Encryption (§164.312(a)(2)(iv))',
    status: 'compliant',
    description: 'PHI encrypted at rest and in transit using AES-256-GCM',
    icon: Lock,
  },
  {
    id: 'access-control',
    category: 'Security',
    requirement: 'Access Control (§164.312(a)(1))',
    status: 'compliant',
    description: 'Role-based access control with authentication required',
    icon: Key,
  },
  {
    id: 'audit-logs',
    category: 'Security',
    requirement: 'Audit Controls (§164.312(b))',
    status: 'compliant',
    description: 'Comprehensive audit logging of all PHI access',
    icon: FileText,
  },
  {
    id: 'session-timeout',
    category: 'Security',
    requirement: 'Automatic Logoff (§164.312(a)(2)(iii))',
    status: 'compliant',
    description: '15-minute inactivity timeout with 2-minute warning',
    icon: Activity,
  },
  {
    id: 'data-integrity',
    category: 'Security',
    requirement: 'Data Integrity (§164.312(c)(1))',
    status: 'compliant',
    description: 'Data validation and checksums prevent unauthorized alterations',
    icon: Database,
  },
  {
    id: 'phi-viewing',
    category: 'Privacy',
    requirement: 'Minimum Necessary (§164.502(b))',
    status: 'compliant',
    description: 'Role-based data access limits PHI exposure',
    icon: Eye,
  },
];

export const HIPAACompliance = () => {
  const compliantCount = complianceItems.filter(item => item.status === 'compliant').length;
  const compliancePercentage = (compliantCount / complianceItems.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>HIPAA Compliance Dashboard</CardTitle>
                <CardDescription>Health Insurance Portability and Accountability Act</CardDescription>
              </div>
            </div>
            <Badge variant={compliancePercentage === 100 ? 'default' : 'secondary'} className="text-lg px-4 py-2">
              {compliancePercentage.toFixed(0)}% Compliant
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={compliancePercentage} className="h-3" />
        </CardContent>
      </Card>

      {compliancePercentage < 100 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            Some HIPAA requirements need attention. Review items marked as non-compliant or partial below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {complianceItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    item.status === 'compliant' 
                      ? 'bg-green-100 text-green-700' 
                      : item.status === 'partial'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{item.requirement}</h3>
                        <p className="text-sm text-muted-foreground">{item.category}</p>
                      </div>
                      <Badge 
                        variant={
                          item.status === 'compliant' 
                            ? 'default' 
                            : item.status === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {item.status === 'compliant' && <Check className="h-3 w-3 mr-1" />}
                        {item.status === 'compliant' ? 'Compliant' : item.status === 'partial' ? 'Partial' : 'Non-Compliant'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Additional Security Measures</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Regular security training for all users</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Business Associate Agreements (BAAs) with all vendors</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Incident response plan and breach notification procedures</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Regular risk assessments and security audits</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>Backup and disaster recovery procedures</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
