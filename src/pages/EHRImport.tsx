import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EpicImport from '@/components/ehr/EpicImport';
import PointClickCareImport from '@/components/ehr/PointClickCareImport';
import { FileText, Database } from 'lucide-react';

const EHRImport = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">EHR Data Import</h1>
        <p className="text-muted-foreground">
          Import patient records from Epic or PointClickCare and attach facial recognition data
        </p>
      </div>

      <Tabs defaultValue="epic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="epic" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Epic EHR
          </TabsTrigger>
          <TabsTrigger value="pointclickcare" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            PointClickCare
          </TabsTrigger>
        </TabsList>

        <TabsContent value="epic" className="mt-6">
          <EpicImport />
        </TabsContent>

        <TabsContent value="pointclickcare" className="mt-6">
          <PointClickCareImport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EHRImport;
