
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

const NewsletterManager = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['newsletter-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });

  const updateSettings = useMutation({
    mutationFn: async (updatedSettings: any) => {
      const { error } = await supabase
        .from('newsletter_settings')
        .update(updatedSettings)
        .eq('id', settings?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-settings'] });
      toast.success('Uutiskirjeasetukset päivitetty!');
    },
    onError: () => {
      toast.error('Virhe päivittäessä asetuksia');
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = settings?.image_url;
    
    // Handle image upload if new file selected
    if (imageFile) {
      const fileName = `newsletter-${Date.now()}.${imageFile.name.split('.').pop()}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, imageFile);
        
      if (uploadError) {
        toast.error('Virhe kuvan latauksessa');
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      imageUrl = publicUrl;
    }

    const updatedSettings = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      button_text: formData.get('button_text') as string,
      success_message: formData.get('success_message') as string,
      delay_seconds: parseInt(formData.get('delay_seconds') as string),
      is_enabled: formData.get('is_enabled') === 'on',
      image_url: imageUrl,
      brevo_list_id: parseInt(formData.get('brevo_list_id') as string)
    };

    updateSettings.mutate(updatedSettings);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Uutiskirjeasetukset</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="is_enabled">Uutiskirje käytössä</Label>
            <Switch 
              id="is_enabled"
              name="is_enabled"
              defaultChecked={settings?.is_enabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Otsikko</Label>
            <Input
              id="title"
              name="title"
              defaultValue={settings?.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Kuvaus</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={settings?.description}
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="button_text">Painikkeen teksti</Label>
            <Input
              id="button_text"
              name="button_text"
              defaultValue={settings?.button_text}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_message">Onnistumisviesti</Label>
            <Input
              id="success_message"
              name="success_message"
              defaultValue={settings?.success_message}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay_seconds">Viive (sekuntia)</Label>
            <Input
              id="delay_seconds"
              name="delay_seconds"
              type="number"
              defaultValue={settings?.delay_seconds}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brevo_list_id">Brevo Lista ID</Label>
            <Input
              id="brevo_list_id"
              name="brevo_list_id"
              type="number"
              defaultValue={settings?.brevo_list_id}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Kuva</Label>
            <div className="flex items-center space-x-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              {settings?.image_url && (
                <img 
                  src={settings.image_url} 
                  alt="Current newsletter image" 
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
          </div>

          <Button type="submit" disabled={updateSettings.isPending}>
            {updateSettings.isPending ? 'Päivitetään...' : 'Tallenna muutokset'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterManager;
