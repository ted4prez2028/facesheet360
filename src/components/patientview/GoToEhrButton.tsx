
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GoToEhrButtonProps {
  patientId: string;
  variant?: 'default' | 'outline' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  text?: string;
}

const GoToEhrButton: React.FC<GoToEhrButtonProps> = ({ 
  patientId, 
  variant = 'outline', 
  size = 'sm',
  className = '',
  text = 'PointClickCare Connect' 
}) => {
  return (
    <Button asChild variant={variant} size={size} className={`flex items-center gap-2 ${className}`}>
      <Link to={`/patients/${patientId}/detail`}>
        <FileText className="h-4 w-4" />
        <span>{text}</span>
      </Link>
    </Button>
  );
};

export default GoToEhrButton;
