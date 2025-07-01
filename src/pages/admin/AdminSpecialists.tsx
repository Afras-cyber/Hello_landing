
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import SpecialistForm from '@/components/admin/SpecialistForm';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

const AdminSpecialists: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [specialists, setSpecialists] = useState<any[]>([]);
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState<any>(null);
  const [deletingSpecialist, setDeletingSpecialist] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecialists();
  }, []);

  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setSpecialists(data || []);
    } catch (error) {
      console.error('Error fetching specialists:', error);
      toast({
        title: "Virhe",
        description: "Spesialistien hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (specialist: any) => {
    navigate(`/admin/specialists/${specialist.id}`);
  };

  const handleAddClick = () => {
    navigate('/admin/specialists/new');
  };

  const handleDeleteClick = (specialist: any) => {
    setDeletingSpecialist(specialist);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSpecialist) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', deletingSpecialist.id);
        
      if (error) throw error;
      
      // Remove from local state
      setSpecialists(specialists.filter(s => s.id !== deletingSpecialist.id));
      
      toast({
        title: "Poistettu",
        description: "Specialist poistettu onnistuneesti."
      });
    } catch (error) {
      console.error('Error deleting specialist:', error);
      toast({
        title: "Virhe",
        description: "Specialistin poistaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingSpecialist(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-redhat">Blonde Specialistit</h1>
        <Button 
          variant="default" 
          className="bg-blondify-blue hover:bg-blue-600"
          onClick={handleAddClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Lisää uusi specialist
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialists.length > 0 ? (
            specialists.map((specialist) => (
              <div 
                key={specialist.id} 
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blondify-blue transition-all relative group cursor-pointer"
                onClick={() => handleEditClick(specialist)}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 bg-gray-800/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(specialist);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 hover:text-red-500 bg-gray-800/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(specialist);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-4 items-center">
                  {specialist.image_path && (
                    <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                      <img 
                        src={specialist.image_path} 
                        alt={specialist.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{specialist.name}</h3>
                    <p className="text-blondify-blue text-sm">{specialist.role}</p>
                    <p className="text-gray-400 text-sm">{specialist.location}</p>
                  </div>
                </div>
                
                <div className="mt-3">
                  {specialist.is_active ? (
                    <Badge className="bg-green-900/30 text-green-400 border-green-900/50">
                      Aktiivinen
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-400 border-gray-700">
                      Ei aktiivinen
                    </Badge>
                  )}
                </div>

                {specialist.specialties && specialist.specialties.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {specialist.specialties.map((specialty: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-700 text-gray-400">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {specialist.bio && (
                  <p className="text-gray-400 text-xs mt-3 line-clamp-2">
                    {specialist.bio}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center py-10 text-gray-400">
              Ei blonde specialisteja. Lisää uusi specialist aloittaaksesi.
            </p>
          )}
        </div>
      )}
      
      {deletingSpecialist && (
        <DeleteConfirmation 
          title="Poista specialist"
          message={`Haluatko varmasti poistaa specialistin "${deletingSpecialist.name}"? Tätä toimintoa ei voi perua.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingSpecialist(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminSpecialists;
