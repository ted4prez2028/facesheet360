import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getPatientById } from '@/lib/api/patientApi';

export default function PatientDetailView() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const patientData = await getPatientById(id);
        if (patientData) {
          setPatient(patientData);
        } else {
          setError(new Error('Patient not found'));
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(new Error(err instanceof Error ? err.message : 'Failed to fetch patient'));
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) {
    return <div>Loading patient details...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4">
        <Link to="/patients">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <strong>Name:</strong> {patient.first_name} {patient.last_name}
            </div>
            <div>
              <strong>Date of Birth:</strong> {patient.date_of_birth}
            </div>
            <div>
              <strong>Gender:</strong> {patient.gender}
            </div>
            <div>
              <strong>Medical Record Number:</strong> {patient.medical_record_number}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
