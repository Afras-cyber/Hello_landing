
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useCreateSalon, useUpdateSalon } from '@/hooks/useAdminSalons';
import ImageUploadSetting from './ImageUploadSetting';

interface AdminSalonFormProps {
  salon?: any;
  onClose: () => void;
}

const AdminSalonForm: React.FC<AdminSalonFormProps> = ({ salon, onClose }) => {
  const [formData, setFormData] = useState({
    name: salon?.name || '',
    address: salon?.address || '',
    city: salon?.city || '',
    postal_code: salon?.postal_code || '',
    latitude: salon?.latitude || 0,
    longitude: salon?.longitude || 0,
    phone: salon?.phone || '',
    email: salon?.email || '',
    description: salon?.description || '',
    image_url: salon?.image_url || '',
    is_active: salon?.is_active ?? true,
    display_order: salon?.display_order || 0,
    opening_hours: {
      mon_fri: salon?.opening_hours?.mon_fri || '',
      sat: salon?.opening_hours?.sat || '',
      sun: salon?.opening_hours?.sun || ''
    }
  });

  const createSalon = useCreateSalon();
  const updateSalon = useUpdateSalon();

  const isEditing = !!salon;
  const isLoading = createSalon.isPending || updateSalon.isPending;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpeningHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: value
      }
    }));
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      display_order: Number(formData.display_order)
    };

    if (isEditing) {
      updateSalon.mutate({ id: salon.id, ...submitData }, {
        onSuccess: onClose
      });
    } else {
      createSalon.mutate(submitData, {
        onSuccess: onClose
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Takaisin
        </Button>
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Muokkaa kampaamo' : 'Lisää uusi kampaamo'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Perustiedot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Nimi *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label className="text-white">Osoite *</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Kaupunki *</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Postinumero</Label>
                  <Input
                    value={formData.postal_code}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Leveysaste *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white">Pituusaste *</Label>
                  <Input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Yhteystiedot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Puhelinnumero</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Sähköposti</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-white">Järjestysnumero</Label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => handleInputChange('display_order', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-white">Aktiivinen</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Aukioloajat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-white">Maanantai - Perjantai</Label>
                <Input
                  placeholder="esim. 10:00 - 20:00"
                  value={formData.opening_hours.mon_fri}
                  onChange={(e) => handleOpeningHoursChange('mon_fri', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Lauantai</Label>
                <Input
                  placeholder="esim. 10:00 - 18:00"
                  value={formData.opening_hours.sat}
                  onChange={(e) => handleOpeningHoursChange('sat', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label className="text-white">Sunnuntai</Label>
                <Input
                  placeholder="esim. 10:00 - 18:00"
                  value={formData.opening_hours.sun}
                  onChange={(e) => handleOpeningHoursChange('sun', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Kuvaus ja kuva</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white">Kuvaus</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white min-h-24"
                placeholder="Kerro kampaamosta..."
              />
            </div>

            <ImageUploadSetting
              label="Kampaamon kuva"
              currentImageUrl={formData.image_url}
              onUpload={handleImageUpload}
              storageBucket="media"
              storageFolder="kampaamot"
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Peruuta
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blondify-blue hover:bg-blondify-blue/80"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Tallenna muutokset' : 'Lisää kampaamo'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSalonForm;
