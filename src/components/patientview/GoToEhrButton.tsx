
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoToEhrButtonProps {
  patientId: string;
}

const GoToEhrButton: React.FC<GoToEhrButtonProps> = ({ patientId }) => {
  return (
    <Button asChild variant="outline" className="flex items-center gap-2">
      <Link to={`/patients/${patientId}/detail`}>
        <FileText className="h-4 w-4" />
        <span>View EHR Interface</span>
      </Link>
    </Button>
  );
};

export default GoToEhrButton;
