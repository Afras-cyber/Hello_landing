
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { useHairShades, HairShade } from '@/hooks/useHairShades';
import ShadeEditForm from '@/components/admin/ShadeEditForm';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const AdminShades: React.FC = () => {
  const { data: shades, isLoading } = useHairShades();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingShade, setEditingShade] = useState<HairShade | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingShade, setDeletingShade] = useState<HairShade | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort shades by display_order for consistent display
  const sortedShades = shades ? [...shades].sort((a, b) => a.display_order - b.display_order) : [];

  const handleShadeClick = (shade: HairShade) => {
    setEditingShade(shade);
    setShowEditForm(true);
  };

  const handleAddClick = () => {
    setEditingShade(null);
    setShowEditForm(true);
  };

  const handleEditFormClose = () => {
    setShowEditForm(false);
    setEditingShade(null);
  };

  const handleEditFormSuccess = async () => {
    // Force a fresh refetch to ensure we have the latest data
    await queryClient.invalidateQueries({ queryKey: ['hairShades'] });
    await queryClient.refetchQueries({ queryKey: ['hairShades'] });
  };

  const handleDeleteClick = (shade: HairShade, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingShade(shade);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingShade) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('hair_shades')
        .delete()
        .eq('id', deletingShade.id);
        
      if (error) throw error;
      
      toast({
        title: "Poistettu",
        description: "Sävy poistettu onnistuneesti."
      });
      
      await queryClient.invalidateQueries({ queryKey: ['hairShades'] });
      await queryClient.refetchQueries({ queryKey: ['hairShades'] });
    } catch (error) {
      console.error('Error deleting shade:', error);
      toast({
        title: "Virhe",
        description: "Sävyn poistaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingShade(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-redhat">Hiussävyt</h1>
        <Button 
          variant="default" 
          className="bg-blondify-blue hover:bg-blue-600"
          onClick={handleAddClick}
        >
          <Plus className="mr-2 h-4 w-4" />
          Lisää uusi sävy
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-12 w-12 text-blondify-blue" />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedShades && sortedShades.length > 0 ? (
            // Group shades by rows of 4
            Array.from({ length: Math.ceil(sortedShades.length / 4) }, (_, rowIndex) => (
              <div key={rowIndex} className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Rivi {rowIndex + 1}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {sortedShades
                    .slice(rowIndex * 4, (rowIndex + 1) * 4)
                    .map((shade, indexInRow) => (
                      <div 
                        key={shade.id} 
                        className="bg-gray-800 rounded-lg border border-gray-700 hover:border-blondify-blue transition-all cursor-pointer overflow-hidden group relative"
                        onClick={() => handleShadeClick(shade)}
                      >
                        {shade.images && shade.images.length > 0 && shade.images[0]?.url && (
                          <div className="h-80 overflow-hidden">
                            <img 
                              src={shade.images[0].url} 
                              alt={shade.images[0].alt || shade.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="p-3">
                          <h3 className="text-lg font-bold">{shade.name}</h3>
                          <p className="text-sm text-gray-400 capitalize">{shade.category}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Järjestys: {shade.display_order} (Rivi {rowIndex + 1}, Kohta {indexInRow + 1})
                          </p>
                          {shade.images && shade.images.length > 1 && (
                            <p className="text-xs text-blondify-blue mt-1">
                              +{shade.images.length - 1} kuvaa
                            </p>
                          )}
                        </div>

                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShadeClick(shade);
                            }}
                            className="bg-black/50 hover:bg-black/70 text-white border-0"
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => handleDeleteClick(shade, e)}
                            className="bg-red-500/80 hover:bg-red-600/80 border-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-gray-400">
              Ei sävyjä. Lisää uusi sävy aloittaaksesi.
            </div>
          )}
        </div>
      )}

      <ShadeEditForm
        shade={editingShade}
        isOpen={showEditForm}
        onClose={handleEditFormClose}
        onSuccess={handleEditFormSuccess}
      />

      {deletingShade && (
        <DeleteConfirmation 
          title="Poista sävy"
          message={`Haluatko varmasti poistaa sävyn "${deletingShade.name}"? Tätä toimintoa ei voi perua.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingShade(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminShades;
