
import { EnhancedPharmacyDashboard } from '@/components/pharmacy/EnhancedPharmacyDashboard';

export default function PharmacistDashboard() {
  return <EnhancedPharmacyDashboard />;
}

export default function PharmacistDashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      // Mock data since we don't have the full database relationships
      const mockPrescriptions: Prescription[] = [
        {
          id: '1',
          patient_id: 'patient-1',
          provider_id: 'provider-1',
          medication_name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          start_date: '2024-01-01',
          status: 'prescribed',
          instructions: 'Take with food',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      setPrescriptions(mockPrescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast.error('Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminister = async (prescriptionId: string) => {
    try {
      const { error } = await supabase
        .from('prescriptions')
        .update({
          status: 'administered',
          administered_at: new Date().toISOString()
        })
        .eq('id', prescriptionId);

      if (error) throw error;

      setPrescriptions(prev => 
        prev.map(p => 
          p.id === prescriptionId 
            ? { ...p, status: 'administered' as const, administered_at: new Date().toISOString() }
            : p
        )
      );

      toast.success('Medication administered successfully');
    } catch (error) {
      console.error('Error administering medication:', error);
      toast.error('Failed to administer medication');
    }
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (prescription.patient_id && prescription.patient_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pharmacy Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <PharmacyStats 
        pendingCount={filteredPrescriptions.filter(p => p.status === 'prescribed').length}
        filledCount={filteredPrescriptions.filter(p => p.status === 'administered').length}
        totalPatients={prescriptions.length}
      />

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Prescriptions</TabsTrigger>
          <TabsTrigger value="administered">Administered</TabsTrigger>
          <TabsTrigger value="discontinued">Discontinued</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {loading ? (
              <div className="text-center py-8">Loading prescriptions...</div>
            ) : filteredPrescriptions.filter(p => p.status === 'prescribed').length > 0 ? (
              filteredPrescriptions
                .filter(p => p.status === 'prescribed')
                .map(prescription => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    onAdminister={() => handleAdminister(prescription.id)}
                  />
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No active prescriptions found
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="administered" className="space-y-4">
          <div className="grid gap-4">
            {filteredPrescriptions
              .filter(p => p.status === 'administered')
              .map(prescription => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onAdminister={() => handleAdminister(prescription.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="discontinued" className="space-y-4">
          <div className="grid gap-4">
            {filteredPrescriptions
              .filter(p => p.status === 'discontinued')
              .map(prescription => (
                <PrescriptionCard
                  key={prescription.id}
                  prescription={prescription}
                  onAdminister={() => handleAdminister(prescription.id)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
