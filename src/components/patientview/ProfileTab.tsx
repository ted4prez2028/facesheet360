
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileTabProps {
  patientId: string;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ patientId }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Patient Profile</CardTitle>
          <CardDescription>Personal and medical information</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Patient profile content will be implemented</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileTab;
