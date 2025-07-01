
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpecialistForm from '@/components/admin/SpecialistForm';
import SpecialistPortfolioManager from '@/components/admin/SpecialistPortfolioManager';
import SpecialistTestimonialsManager from '@/components/admin/SpecialistTestimonialsManager';

const AdminSpecialistDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [specialist, setSpecialist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    fetchSpecialist();
  }, [id]);
  
  const fetchSpecialist = async () => {
    try {
      setLoading(true);
      
      if (id === 'new') {
        // For new specialist, set isEditing to true immediately
        setSpecialist(null);
        setIsEditing(true);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setSpecialist(data);
    } catch (error) {
      console.error('Error fetching specialist:', error);
      toast({
        title: "Virhe",
        description: "Spesialistin tietojen hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/admin/specialists');
  };
  
  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchSpecialist();
    toast({
      title: "Tallennettu",
      description: "Spesialistin tiedot päivitetty onnistuneesti."
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blondify-blue" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold font-redhat">
          {id === 'new' ? 'Uusi specialist' : specialist?.name || 'Spesialistin tiedot'}
        </h1>
      </div>
      
      {(isEditing || id === 'new') ? (
        <SpecialistForm 
          onClose={() => {
            setIsEditing(false);
            if (id === 'new') {
              navigate('/admin/specialists');
            }
          }}
          onSuccess={handleEditSuccess}
          editingSpecialist={specialist}
          isInline={true}
        />
      ) : (
        <div>
          {specialist && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="basic" className="data-[state=active]:bg-blondify-blue">
                  Perustiedot
                </TabsTrigger>
                <TabsTrigger value="portfolio" className="data-[state=active]:bg-blondify-blue">
                  Portfolio
                </TabsTrigger>
                <TabsTrigger value="testimonials" className="data-[state=active]:bg-blondify-blue">
                  Asiakaspalautteet
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                      {specialist.image_path && (
                        <img 
                          src={specialist.image_path}
                          alt={specialist.name}
                          className="w-full aspect-[3/4] object-cover rounded-lg"
                        />
                      )}
                    </div>
                    
                    <div className="w-full md:w-2/3">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold mb-2">{specialist.name}</h2>
                        <p className="text-blondify-blue">{specialist.role}</p>
                        <p className="text-gray-400 mt-1">{specialist.location}</p>
                        
                        {specialist.is_active ? (
                          <div className="inline-block bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-1 rounded-md text-xs mt-2">
                            Aktiivinen
                          </div>
                        ) : (
                          <div className="inline-block bg-gray-800 text-gray-400 border border-gray-700 px-2 py-1 rounded-md text-xs mt-2">
                            Ei aktiivinen
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Erikoisalat</h3>
                        <div className="flex flex-wrap gap-2">
                          {specialist.specialties && specialist.specialties.length > 0 ? (
                            specialist.specialties.map((specialty: string, index: number) => (
                              <div key={index} className="bg-gray-700 px-2 py-1 rounded-md text-xs">
                                {specialty}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Ei erikoisaloja</p>
                          )}
                        </div>
                      </div>
                      
                      {specialist.bio && (
                        <div className="mb-6">
                          <h3 className="text-sm font-semibold text-gray-400 mb-2">Biografia</h3>
                          <p className="text-sm text-gray-300">{specialist.bio}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-3 mt-8">
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-blondify-blue hover:bg-blue-600"
                        >
                          Muokkaa tietoja
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="portfolio" className="mt-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <SpecialistPortfolioManager specialistId={specialist.id} />
                </div>
              </TabsContent>
              
              <TabsContent value="testimonials" className="mt-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <SpecialistTestimonialsManager specialistId={specialist.id} />
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSpecialistDetail;
