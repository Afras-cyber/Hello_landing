
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Edit } from 'lucide-react';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';

interface Career {
  id: string;
  title: string;
  location: string;
  type: string;
  description: string;
  created_at: string;
}

interface CareerFormData {
  title: string;
  location: string;
  type: string;
  description: string;
}

const AdminCareers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<Career | null>(null);
  const [deleteCareer, setDeleteCareer] = useState<Career | null>(null);
  const [formData, setFormData] = useState<CareerFormData>({
    title: '',
    location: '',
    type: '',
    description: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: careers, isLoading } = useQuery({
    queryKey: ['admin-careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Career[];
    }
  });

  const createCareerMutation = useMutation({
    mutationFn: async (data: CareerFormData) => {
      const { error } = await supabase
        .from('careers')
        .insert([data]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      setIsFormOpen(false);
      resetForm();
      toast({
        title: 'Onnistui!',
        description: 'Työpaikka lisätty onnistuneesti.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Virhe',
        description: 'Työpaikan lisääminen epäonnistui.',
        variant: 'destructive',
      });
    }
  });

  const updateCareerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CareerFormData }) => {
      const { error } = await supabase
        .from('careers')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      setEditingCareer(null);
      setIsFormOpen(false);
      resetForm();
      toast({
        title: 'Onnistui!',
        description: 'Työpaikka päivitetty onnistuneesti.',
      });
    },
    onError: () => {
      toast({
        title: 'Virhe',
        description: 'Työpaikan päivittäminen epäonnistui.',
        variant: 'destructive',
      });
    }
  });

  const deleteCareerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('careers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-careers'] });
      queryClient.invalidateQueries({ queryKey: ['careers'] });
      setDeleteCareer(null);
      toast({
        title: 'Onnistui!',
        description: 'Työpaikka poistettu onnistuneesti.',
      });
    },
    onError: () => {
      toast({
        title: 'Virhe',
        description: 'Työpaikan poistaminen epäonnistui.',
        variant: 'destructive',
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      type: '',
      description: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCareer) {
      updateCareerMutation.mutate({ id: editingCareer.id, data: formData });
    } else {
      createCareerMutation.mutate(formData);
    }
  };

  const handleEdit = (career: Career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title,
      location: career.location,
      type: career.type,
      description: career.description
    });
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingCareer(null);
    resetForm();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-redhat tracking-tight">Työpaikat</h1>
          <p className="text-lg text-gray-300 mt-2 font-redhat">Hallitse avoimia työpaikkoja ja uramahdollisuuksia</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-3 bg-blondify-blue hover:bg-blondify-blue/90 text-white font-redhat font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl">
          <Plus className="h-5 w-5" />
          Lisää työpaikka
        </Button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <Card className="bg-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white font-redhat text-2xl font-semibold">
              {editingCareer ? 'Muokkaa työpaikkaa' : 'Lisää uusi työpaikka'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white font-redhat font-medium text-base">Työpaikan nimi</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white font-redhat text-base py-3 focus:ring-2 focus:ring-blondify-blue focus:border-transparent"
                  placeholder="Esim. Kampaaja / Blonde Specialist"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white font-redhat font-medium text-base">Sijainti</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white font-redhat text-base py-3 focus:ring-2 focus:ring-blondify-blue focus:border-transparent"
                  placeholder="Esim. Helsinki, Espoo"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-white font-redhat font-medium text-base">Työn tyyppi</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white font-redhat text-base py-3 focus:ring-2 focus:ring-blondify-blue">
                    <SelectValue placeholder="Valitse työn tyyppi" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="Kokoaikainen" className="font-redhat">Kokoaikainen</SelectItem>
                    <SelectItem value="Osa-aikainen" className="font-redhat">Osa-aikainen</SelectItem>
                    <SelectItem value="Määräaikainen" className="font-redhat">Määräaikainen</SelectItem>
                    <SelectItem value="Harjoittelija" className="font-redhat">Harjoittelija</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white font-redhat font-medium text-base">Kuvaus</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-800 border-gray-600 text-white font-redhat text-base min-h-[120px] leading-relaxed focus:ring-2 focus:ring-blondify-blue focus:border-transparent"
                  placeholder="Kirjoita työpaikan kuvaus, vaatimukset ja edut..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  disabled={createCareerMutation.isPending || updateCareerMutation.isPending}
                  className="bg-blondify-blue hover:bg-blondify-blue/90 text-white font-redhat font-medium px-8 py-3 rounded-lg transition-all duration-200"
                >
                  {editingCareer ? 'Päivitä työpaikka' : 'Lisää työpaikka'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel}
                  className="border-gray-600 text-white hover:bg-gray-800 font-redhat font-medium px-8 py-3 rounded-lg transition-all duration-200"
                >
                  Peruuta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Careers List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white font-redhat mb-4">Nykyiset työpaikat</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blondify-blue"></div>
            <p className="text-gray-300 ml-4 font-redhat text-lg">Ladataan työpaikkoja...</p>
          </div>
        ) : careers && careers.length > 0 ? (
          careers.map((career) => (
            <Card key={career.id} className="bg-gray-900 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-200 hover:border-gray-600">
              <CardContent className="p-8">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white font-redhat mb-3">{career.title}</h3>
                    <div className="flex gap-6 mb-4">
                      <span className="text-base bg-gray-800 px-4 py-2 rounded-full text-gray-200 font-redhat font-medium border border-gray-700">
                        📍 {career.location}
                      </span>
                      <span className="text-base bg-gray-800 px-4 py-2 rounded-full text-gray-200 font-redhat font-medium border border-gray-700">
                        ⏰ {career.type}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-6 font-redhat text-base leading-relaxed whitespace-pre-line">
                      {career.description}
                    </p>
                    <p className="text-sm text-gray-500 font-redhat">
                      Lisätty: {new Date(career.created_at).toLocaleDateString('fi-FI', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex gap-3 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(career)}
                      className="border-gray-600 text-white hover:bg-gray-800 font-redhat px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Muokkaa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteCareer(career)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20 hover:border-red-500 font-redhat px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Poista
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-900 border-gray-700 shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="space-y-4">
                <div className="text-6xl">💼</div>
                <h3 className="text-2xl font-bold text-white font-redhat">Ei avoimia työpaikkoja</h3>
                <p className="text-gray-400 font-redhat text-lg">Luo ensimmäinen työpaikka yllä olevalla painikkeella</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteCareer && (
        <DeleteConfirmation
          title="Poista työpaikka"
          message={`Haluatko varmasti poistaa työpaikan "${deleteCareer.title}"?`}
          onConfirm={() => deleteCareerMutation.mutate(deleteCareer.id)}
          onCancel={() => setDeleteCareer(null)}
          isDeleting={deleteCareerMutation.isPending}
        />
      )}
    </div>
  );
};

export default AdminCareers;
