import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FacialRecognitionGallery from '@/components/facial-recognition/FacialRecognitionGallery';

const FacialRecognitionGalleryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Facial Recognition Gallery</h1>
          <p className="text-muted-foreground">
            Browse and compare captured facial recognition data
          </p>
        </div>
      </div>

      <FacialRecognitionGallery />
    </div>
  );
};

export default FacialRecognitionGalleryPage;
