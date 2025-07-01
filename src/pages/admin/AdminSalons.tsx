import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, MapPin, Phone, Mail, Clock, Search } from 'lucide-react';
import { useAdminSalons, useDeleteSalon } from '@/hooks/useAdminSalons';
import AdminSalonForm from '@/components/admin/AdminSalonForm';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';

const AdminSalons = () => {
  const { data: salons = [], isLoading } = useAdminSalons();
  const deleteSalon = useDeleteSalon();
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSalons = salons.filter(salon =>
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    salon.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (salon: any) => {
    setSelectedSalon(salon);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteSalon.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedSalon(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-white" />
      </div>
    );
  }

  if (isFormOpen) {
    return (
      <AdminSalonForm
        salon={selectedSalon}
        onClose={handleFormClose}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Kampaamot</h1>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="bg-blondify-blue hover:bg-blondify-blue/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Lisää kampaamo
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Hae kampaamoita..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSalons.map((salon) => (
          <Card key={salon.id} className="bg-gray-900 border-gray-700">
            {salon.image_url && (
              <div className="w-full h-48 overflow-hidden rounded-t-lg">
                <img
                  src={salon.image_url}
                  alt={salon.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg text-white mb-2">{salon.name}</CardTitle>
                  <Badge variant={salon.is_active ? "default" : "secondary"}>
                    {salon.is_active ? 'Aktiivinen' : 'Ei aktiivinen'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(salon)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(salon.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blondify-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{salon.address}</p>
                    <p>{salon.city} {salon.postal_code}</p>
                  </div>
                </div>

                {salon.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blondify-blue" />
                    <p>{salon.phone}</p>
                  </div>
                )}

                {salon.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blondify-blue" />
                    <p>{salon.email}</p>
                  </div>
                )}

                {salon.opening_hours && Object.keys(salon.opening_hours).length > 0 && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blondify-blue mt-0.5" />
                    <div className="text-xs">
                      {(salon.opening_hours as any).mon_fri && (
                        <p>Ma-Pe: {(salon.opening_hours as any).mon_fri}</p>
                      )}
                      {(salon.opening_hours as any).sat && (
                        <p>La: {(salon.opening_hours as any).sat}</p>
                      )}
                      {(salon.opening_hours as any).sun && (
                        <p>Su: {(salon.opening_hours as any).sun}</p>
                      )}
                    </div>
                  </div>
                )}

                {salon.description && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {salon.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSalons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {searchTerm ? 'Ei hakutuloksia.' : 'Ei kampaamoita lisätty.'}
          </p>
        </div>
      )}

      {!!deleteId && (
        <DeleteConfirmation
          title="Poista kampaamo"
          message="Haluatko varmasti poistaa tämän kampaamon? Tätä toimintoa ei voi peruuttaa."
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
          isDeleting={deleteSalon.isPending}
        />
      )}
    </div>
  );
};

export default AdminSalons;
