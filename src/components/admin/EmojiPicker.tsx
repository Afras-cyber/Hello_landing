
import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({
  onEmojiSelect,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setIsOpen(false);
  };

  const togglePicker = () => {
    setIsOpen(!isOpen);
  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        size="sm"
        onClick={togglePicker}
        className={`flex items-center gap-1 ${isOpen ? 'bg-gray-600' : ''}`}
        title="Lisää emoji"
      >
        <Smile className="h-4 w-4" />
        Emoji
      </Button>
      
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 z-50 mt-2"
          style={{ zIndex: 9999 }}
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme={Theme.DARK}
            width={320}
            height={400}
            searchPlaceholder="Etsi emojia..."
            previewConfig={{
              showPreview: false
            }}
            skinTonesDisabled
          />
        </div>
      )}
    </div>
  );
};

export default EmojiPickerComponent;
