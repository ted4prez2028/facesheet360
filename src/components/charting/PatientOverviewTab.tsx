import { Card, CardContent } from "@/components/ui/card";
import { Heart, Pill, FileText } from "lucide-react";
import FaceRegistration from "@/components/facial-recognition/FaceRegistration";

interface PatientOverviewTabProps {
  selectedPatient: string;
  vitalSigns: any[];
  medications: any[];
  labResults: any[];
}

const PatientOverviewTab = ({ 
  selectedPatient, 
  vitalSigns, 
  medications, 
  labResults 
}: PatientOverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* Facial Recognition Section */}
      <FaceRegistration patientId={selectedPatient} />

      {/* Patient Info Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Latest Vitals</p>
                <p className="text-xs text-muted-foreground">
                  {vitalSigns.length > 0 ? 
                    new Date().toLocaleDateString() : 
                    'No vitals recorded'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pill className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Active Medications</p>
                <p className="text-xs text-muted-foreground">
                  {medications.filter(m => m.status === 'active').length} active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Recent Labs</p>
                <p className="text-xs text-muted-foreground">
                  {labResults.length} results
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientOverviewTab;
