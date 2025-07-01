
import { useToast } from '@/hooks/use-toast';

interface CareerEmailData {
  type: 'job_application' | 'open_application';
  jobTitle?: string;
  applicantName: string;
  applicantEmail: string;
  message?: string;
}

export function useCareerEmail() {
  const { toast } = useToast();

  const sendCareerEmail = async (data: CareerEmailData) => {
    try {
      const response = await fetch('/functions/v1/send-career-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: 'Hakemus lähetetty!',
        description: 'Hakemuksesi on lähetetty onnistuneesti. Otamme yhteyttä pian.',
      });

      return true;
    } catch (error) {
      console.error('Error sending career email:', error);
      toast({
        title: 'Virhe',
        description: 'Hakemuksen lähettäminen epäonnistui. Yritä uudelleen.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { sendCareerEmail };
}
