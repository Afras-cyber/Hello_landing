
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from 'lucide-react';

interface DeleteConfirmationProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-gray-800 rounded-lg p-6 max-w-sm w-full">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-12 w-12 rounded-full bg-red-900/20 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">{title}</h2>
          <p className="text-gray-400">{message}</p>
        </div>
        
        <div className="flex justify-center gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Peruuta
          </Button>
          <Button 
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Poistetaan...' : 'Poista'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
