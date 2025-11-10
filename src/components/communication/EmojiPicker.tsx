import React, { useState, useRef, useEffect } from 'react';
import EmojiPickerReact, { EmojiClickData } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={pickerRef}>
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Smile className="h-4 w-4" />
        </Button>
      )}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-50">
          <EmojiPickerReact onEmojiClick={handleEmojiClick} />
        </div>
      )}
    </div>
  );
};

export default EmojiPicker;
