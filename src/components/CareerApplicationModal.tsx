
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCareerEmail } from '@/hooks/useCareerEmail';

interface CareerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  isOpenApplication?: boolean;
}

const CareerApplicationModal: React.FC<CareerApplicationModalProps> = ({
  isOpen,
  onClose,
  jobTitle,
  isOpenApplication = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendCareerEmail } = useCareerEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      return;
    }

    setIsSubmitting(true);
    
    const success = await sendCareerEmail({
      type: isOpenApplication ? 'open_application' : 'job_application',
      jobTitle,
      applicantName: formData.name,
      applicantEmail: formData.email,
      message: formData.message
    });

    if (success) {
      setFormData({ name: '', email: '', message: '' });
      onClose();
    }
    
    setIsSubmitting(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="font-redhat text-xl">
            {isOpenApplication ? 'Lähetä avoin hakemus' : `Hae paikkaa: ${jobTitle}`}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-gray-300 font-redhat">
              Nimi *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white font-redhat"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="text-gray-300 font-redhat">
              Sähköposti *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white font-redhat"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="message" className="text-gray-300 font-redhat">
              Viesti
            </Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white font-redhat min-h-[100px]"
              placeholder={isOpenApplication 
                ? "Kerro itsestäsi ja miksi haluaisit työskennellä Blondifylla..."
                : "Kerro miksi olet kiinnostunut tästä työpaikasta..."
              }
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 font-redhat"
            >
              Peruuta
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.name || !formData.email}
              className="flex-1 bg-blondify-blue hover:bg-blue-600 font-redhat"
            >
              {isSubmitting ? 'Lähetetään...' : 'Lähetä hakemus'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CareerApplicationModal;
