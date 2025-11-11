import React from 'react';
import PatientTimeline from '@/components/timeline/PatientTimeline';

interface TimelineTabProps {
  patientId: string;
}

const TimelineTab: React.FC<TimelineTabProps> = ({ patientId }) => {
  return (
    <div className="space-y-6">
      <PatientTimeline patientId={patientId} />
    </div>
  );
};

export default TimelineTab;
