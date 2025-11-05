/**
 * Security & Compliance Dashboard
 * Unified view of HIPAA and OWASP compliance
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HIPAACompliance } from '@/components/security/HIPAACompliance';
import { OWASPCompliance } from '@/components/security/OWASPCompliance';
import { Shield, Lock } from 'lucide-react';

const SecurityCompliance = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Security & Compliance</h1>
          <p className="text-muted-foreground">HIPAA and OWASP security standards monitoring</p>
        </div>
      </div>

      <Tabs defaultValue="hipaa" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hipaa" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            HIPAA Compliance
          </TabsTrigger>
          <TabsTrigger value="owasp" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            OWASP Top 10
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hipaa" className="mt-6">
          <HIPAACompliance />
        </TabsContent>

        <TabsContent value="owasp" className="mt-6">
          <OWASPCompliance />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityCompliance;
