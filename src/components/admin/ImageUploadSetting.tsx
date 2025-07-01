
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Upload } from 'lucide-react';

interface ImageUploadSettingProps {
  label: string;
  currentImageUrl: string | null | undefined;
  onUpload: (url: string) => void;
  storageBucket?: string;
  storageFolder?: string;
}

const ImageUploadSetting: React.FC<ImageUploadSettingProps> = ({
  label,
  currentImageUrl,
  onUpload,
  storageBucket = 'media',
  storageFolder = 'settings',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Ei tiedostoa",
        description: "Valitse ensin kuva.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsUploading(true);
      const fileName = `${storageFolder}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from(storageBucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(storageBucket)
        .getPublicUrl(fileName);

      onUpload(publicUrl);
      setFile(null);

      toast({
        title: "Kuva ladattu",
        description: "Kuva on ladattu onnistuneesti.",
      });

    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Virhe",
        description: `Kuvan lataus epäonnistui: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-white">{label}</Label>
      <div className="flex items-center space-x-4">
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt="Nykyinen kuva"
            className="w-20 h-20 object-cover rounded-md border border-gray-600"
          />
        )}
        <div className="flex-grow space-y-2">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="bg-gray-800 border-gray-600 text-white"
            disabled={isUploading}
          />
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="bg-blondify-blue hover:bg-blondify-blue/80"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Lataa uusi kuva
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadSetting;
