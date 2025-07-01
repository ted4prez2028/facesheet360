import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, Video } from 'lucide-react';
import { EnhancedCommunicationSystem } from './EnhancedCommunicationSystem';

export const FloatingCommunicationOrb: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl z-40 animate-pulse"
        size="sm"
      >
        <MessageCircle className="h-8 w-8 text-white" />
      </Button>
      
      {isOpen && (
        <EnhancedCommunicationSystem onClose={() => setIsOpen(false)} />
      )}
    </>
  );
};