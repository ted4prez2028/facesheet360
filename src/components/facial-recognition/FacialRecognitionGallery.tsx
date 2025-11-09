import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { Eye, User, Calendar } from 'lucide-react';
import FaceComparisonDialog from './FaceComparisonDialog';

const FacialRecognitionGallery: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const { data: patients, isLoading } = useQuery({
    queryKey: ['patients-with-facial-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .not('facial_data', 'is', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as Patient[];
    },
  });

  const handleViewComparison = (patient: Patient) => {
    setSelectedPatient(patient);
    setComparisonOpen(true);
  };

  const getFacialImage = (facialData: string | null) => {
    if (!facialData) return null;
    try {
      const parsed = JSON.parse(facialData);
      return parsed.image || null;
    } catch (err) {
      console.error('Error parsing facial data:', err);
      return null;
    }
  };

  const getFacialTimestamp = (facialData: string | null) => {
    if (!facialData) return null;
    try {
      const parsed = JSON.parse(facialData);
      return parsed.timestamp ? new Date(parsed.timestamp) : null;
    } catch (err) {
      console.error('Error parsing facial data:', err);
      return null;
    }
  };

  const getConfidence = (facialData: string | null) => {
    if (!facialData) return null;
    try {
      const parsed = JSON.parse(facialData);
      return parsed.confidence ? Math.round(parsed.confidence * 100) : null;
    } catch (err) {
      console.error('Error parsing facial data:', err);
      return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-muted-foreground">Loading gallery...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No facial recognition data found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Capture patient faces to see them here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Facial Recognition Gallery
            <Badge variant="secondary" className="ml-auto">
              {patients.length} {patients.length === 1 ? 'Patient' : 'Patients'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {patients.map((patient) => {
              const imageUrl = getFacialImage(patient.facial_data);
              const timestamp = getFacialTimestamp(patient.facial_data);
              const confidence = getConfidence(patient.facial_data);

              return (
                <div
                  key={patient.id}
                  className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-lg transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`${patient.first_name} ${patient.last_name}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-2"
                        onClick={() => handleViewComparison(patient)}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>

                    {/* Confidence Badge */}
                    {confidence && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-600/90 backdrop-blur-sm">
                          {confidence}% Match
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="p-3 space-y-2">
                    <div>
                      <p className="font-semibold text-sm truncate">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {patient.id.slice(0, 8)}...
                      </p>
                    </div>

                    {timestamp && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {format(timestamp, 'MMM dd, yyyy HH:mm')}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewComparison(patient)}
                    >
                      Compare Face
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedPatient && (
        <FaceComparisonDialog
          isOpen={comparisonOpen}
          onClose={() => {
            setComparisonOpen(false);
            setSelectedPatient(null);
          }}
          patient={selectedPatient}
        />
      )}
    </>
  );
};

export default FacialRecognitionGallery;
