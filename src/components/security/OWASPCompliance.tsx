/**
 * OWASP Top 10 Security Compliance Dashboard
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Shield, Check, AlertTriangle, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SecurityItem {
  id: string;
  rank: string;
  vulnerability: string;
  status: 'protected' | 'partial' | 'vulnerable';
  mitigation: string;
  details: string[];
}

const owaspTop10: SecurityItem[] = [
  {
    id: 'a01',
    rank: 'A01:2021',
    vulnerability: 'Broken Access Control',
    status: 'protected',
    mitigation: 'Row-Level Security (RLS) policies enforced at database level',
    details: [
      'Role-based access control (RBAC) implemented',
      'Supabase RLS policies prevent unauthorized data access',
      'Function-level security checks for all operations',
      'User roles stored in separate secured table',
    ],
  },
  {
    id: 'a02',
    rank: 'A02:2021',
    vulnerability: 'Cryptographic Failures',
    status: 'protected',
    mitigation: 'AES-256-GCM encryption for PHI, TLS 1.3 for transport',
    details: [
      'Client-side encryption using Web Crypto API',
      'Password hashing with bcrypt (server-side)',
      'Secure key storage in environment variables',
      'HTTPS enforced for all connections',
    ],
  },
  {
    id: 'a03',
    rank: 'A03:2021',
    vulnerability: 'Injection',
    status: 'protected',
    mitigation: 'Parameterized queries via Supabase client, input validation with Zod',
    details: [
      'All database queries use parameterized statements',
      'No raw SQL execution from client',
      'Input sanitization with Zod schemas',
      'Content Security Policy (CSP) headers',
    ],
  },
  {
    id: 'a04',
    rank: 'A04:2021',
    vulnerability: 'Insecure Design',
    status: 'protected',
    mitigation: 'Threat modeling, secure architecture patterns',
    details: [
      'Principle of least privilege applied',
      'Defense in depth strategy',
      'Secure session management',
      'HIPAA compliance by design',
    ],
  },
  {
    id: 'a05',
    rank: 'A05:2021',
    vulnerability: 'Security Misconfiguration',
    status: 'protected',
    mitigation: 'Hardened security headers, minimal permissions',
    details: [
      'Security headers configured (CSP, HSTS, X-Frame-Options)',
      'CORS properly configured',
      'No default credentials',
      'Error messages do not expose sensitive info',
    ],
  },
  {
    id: 'a06',
    rank: 'A06:2021',
    vulnerability: 'Vulnerable Components',
    status: 'protected',
    mitigation: 'Regular dependency updates, automated scanning',
    details: [
      'Dependencies regularly updated',
      'No known vulnerable packages',
      'Automated security scanning in CI/CD',
      'Third-party libraries vetted for security',
    ],
  },
  {
    id: 'a07',
    rank: 'A07:2021',
    vulnerability: 'Authentication Failures',
    status: 'protected',
    mitigation: 'Supabase Auth with MFA support, session timeout',
    details: [
      'Secure authentication via Supabase',
      'Session timeout after 15 minutes inactivity',
      'Failed login attempt tracking',
      'Password complexity requirements',
    ],
  },
  {
    id: 'a08',
    rank: 'A08:2021',
    vulnerability: 'Software/Data Integrity Failures',
    status: 'protected',
    mitigation: 'Code signing, integrity checks, audit logging',
    details: [
      'All data changes logged in audit trail',
      'Cryptographic checksums for critical data',
      'No untrusted deserialization',
      'CI/CD pipeline with security checks',
    ],
  },
  {
    id: 'a09',
    rank: 'A09:2021',
    vulnerability: 'Security Logging/Monitoring Failures',
    status: 'protected',
    mitigation: 'Comprehensive audit logging, real-time monitoring',
    details: [
      'All PHI access logged with user, time, action',
      'Failed authentication attempts tracked',
      'Suspicious activity alerts',
      'Log retention for compliance (7 years)',
    ],
  },
  {
    id: 'a10',
    rank: 'A10:2021',
    vulnerability: 'Server-Side Request Forgery',
    status: 'protected',
    mitigation: 'Input validation, whitelist allowed domains',
    details: [
      'URL validation for external requests',
      'Whitelist of allowed external services',
      'Network segmentation',
      'No user-controlled URLs in server requests',
    ],
  },
];

export const OWASPCompliance = () => {
  const protectedCount = owaspTop10.filter(item => item.status === 'protected').length;
  const securityScore = (protectedCount / owaspTop10.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>OWASP Top 10 Security Compliance</CardTitle>
                <CardDescription>Web Application Security Risks - 2021</CardDescription>
              </div>
            </div>
            <Badge variant={securityScore === 100 ? 'default' : 'destructive'} className="text-lg px-4 py-2">
              {securityScore.toFixed(0)}% Protected
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={securityScore} className="h-3" />
        </CardContent>
      </Card>

      {securityScore < 100 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Security Vulnerabilities Detected</AlertTitle>
          <AlertDescription>
            Critical security risks need immediate attention. Review vulnerable items below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {owaspTop10.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  item.status === 'protected' 
                    ? 'bg-green-100 text-green-700' 
                    : item.status === 'partial'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {item.status === 'protected' ? (
                    <Check className="h-6 w-6" />
                  ) : item.status === 'partial' ? (
                    <AlertTriangle className="h-6 w-6" />
                  ) : (
                    <XCircle className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{item.rank} - {item.vulnerability}</h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1">{item.mitigation}</p>
                    </div>
                    <Badge 
                      variant={
                        item.status === 'protected' 
                          ? 'default' 
                          : item.status === 'partial'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {item.status === 'protected' ? 'Protected' : item.status === 'partial' ? 'Partial' : 'Vulnerable'}
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {item.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
