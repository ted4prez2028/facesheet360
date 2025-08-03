import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients } from '@/hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stethoscope, Search, User, Eye } from 'lucide-react';
import { useState } from 'react';

const WoundCareDashboard = () => {
  const navigate = useNavigate();
  const { data: patients, isLoading } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients?.filter(patient =>
    patient.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.medical_record_number?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handlePatientSelect = (patientId: string) => {
    navigate(`/patients/${patientId}/wound-care`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Stethoscope className="mx-auto h-12 w-12 text-blue-500 animate-pulse" />
          <p className="mt-2 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Stethoscope className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wound Care Management</h1>
            <p className="text-gray-600">Select a patient to manage their wound care records</p>
          </div>
        </div>
        
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredPatients.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No patients found' : 'No patients available'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add patients to start managing wound care records'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/patients')}>
                Go to Patients
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      MRN: {patient.medical_record_number || 'N/A'}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div>
                    <strong>DOB:</strong> {new Date(patient.date_of_birth).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Gender:</strong> {patient.gender}
                  </div>
                  {patient.phone && (
                    <div>
                      <strong>Phone:</strong> {patient.phone}
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => handlePatientSelect(patient.id)}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Wound Care
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WoundCareDashboard;