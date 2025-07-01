import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import ServiceForm from '@/components/admin/ServiceForm';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LandingPageBuilder from '@/components/admin/LandingPageBuilder';

const AdminServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for landing page settings form
  const [landingPageSettings, setLandingPageSettings] = useState({
    has_landing_page: false,
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    landing_page_content: [] as any[]
  });
  const [isSavingLandingPage, setIsSavingLandingPage] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  useEffect(() => {
    if (service) {
      setLandingPageSettings({
        has_landing_page: service.has_landing_page || false,
        meta_title: service.meta_title || '',
        meta_description: service.meta_description || '',
        meta_keywords: service.meta_keywords || '',
        landing_page_content: service.landing_page_content || []
      });
    }
  }, [service]);
  
  const fetchService = async () => {
    try {
      setLoading(true);
      
      if (id === 'new') {
        // For new service, set isEditing to true immediately
        setService(null);
        setIsEditing(true);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('services')
        .select('*, service_categories(name)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setService(data);
    } catch (error) {
      console.error('Error fetching service:', error);
      toast({
        title: "Virhe",
        description: "Palvelun tietojen hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoBack = () => {
    navigate('/admin/services');
  };
  
  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchService();
    toast({
      title: "Tallennettu",
      description: "Palvelun tiedot päivitetty onnistuneesti."
    });
  };

  const handleLandingPageSettingsChange = (field: string, value: any) => {
    setLandingPageSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveLandingPageSettings = async () => {
    if (!id || id === 'new') return;
    setIsSavingLandingPage(true);
    try {
      const contentToSave = landingPageSettings.landing_page_content;
      
      const { error } = await supabase
        .from('services')
        .update({
          has_landing_page: landingPageSettings.has_landing_page,
          meta_title: landingPageSettings.meta_title,
          meta_description: landingPageSettings.meta_description,
          meta_keywords: landingPageSettings.meta_keywords,
          landing_page_content: contentToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Tallennettu",
        description: "Alasivun asetukset päivitetty onnistuneesti."
      });
      fetchService(); // Refetch to update data
    } catch (error) {
      console.error('Error saving landing page settings:', error);
      toast({
        title: "Virhe",
        description: "Alasivun asetusten tallentaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setIsSavingLandingPage(false);
    }
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
          {id === 'new' ? 'Uusi palvelu' : service?.name || 'Palvelun tiedot'}
        </h1>
      </div>
      
      {(isEditing || id === 'new') ? (
        <ServiceForm 
          onClose={() => {
            setIsEditing(false);
            if (id === 'new') {
              navigate('/admin/services');
            }
          }}
          onSuccess={handleEditSuccess}
          editingService={service}
          isInline={true}
        />
      ) : (
        <div>
          {service && (
            <>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    {service.image_path && (
                      <img 
                        src={service.image_path}
                        alt={service.name}
                        className="w-full aspect-[3/4] object-cover rounded-lg"
                      />
                    )}
                  </div>
                  
                  <div className="w-full md:w-2/3">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold mb-2">{service.name}</h2>
                      <p className="text-blondify-blue">{service.price}</p>
                      <p className="text-gray-400 mt-1">{service.service_categories?.name || 'Ei kategoriaa'}</p>
                      
                      {service.featured ? (
                        <div className="inline-block bg-green-900/30 text-green-400 border border-green-900/50 px-2 py-1 rounded-md text-xs mt-2">
                          Suositeltu
                        </div>
                      ) : (
                        <div className="inline-block bg-gray-800 text-gray-400 border border-gray-700 px-2 py-1 rounded-md text-xs mt-2">
                          Ei suositeltu
                        </div>
                      )}
                    </div>
                    
                    {service.description && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">Kuvaus</h3>
                        <p className="text-sm text-gray-300">{service.description}</p>
                      </div>
                    )}
                    
                    {service.slug && (
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-400 mb-2">URL-polku</h3>
                        <p className="text-sm text-gray-300">/palvelut/{service.slug}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-3 mt-8">
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-blondify-blue hover:bg-blue-600"
                      >
                        Muokkaa perustietoja
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Alasivun Asetukset</h2>
                  <Button onClick={handleSaveLandingPageSettings} disabled={isSavingLandingPage}>
                    {isSavingLandingPage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Tallenna alasivun asetukset
                  </Button>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="has_landing_page"
                      checked={landingPageSettings.has_landing_page}
                      onCheckedChange={(checked) => handleLandingPageSettingsChange('has_landing_page', checked)}
                    />
                    <Label htmlFor="has_landing_page" className="text-base">Aktivoi oma alasivu tälle palvelulle</Label>
                  </div>
                  
                  {landingPageSettings.has_landing_page && (
                    <div className="space-y-4 pt-4 border-t border-gray-700">
                      <div>
                        <Label htmlFor="meta_title">Meta Otsikko (SEO)</Label>
                        <Input
                          id="meta_title"
                          value={landingPageSettings.meta_title}
                          onChange={(e) => handleLandingPageSettingsChange('meta_title', e.target.value)}
                          placeholder="Esim. Upeat vaalennukset ammattitaidolla | Blondify"
                        />
                      </div>
                      <div>
                        <Label htmlFor="meta_description">Meta Kuvaus (SEO)</Label>
                        <Textarea
                          id="meta_description"
                          value={landingPageSettings.meta_description}
                          onChange={(e) => handleLandingPageSettingsChange('meta_description', e.target.value)}
                          placeholder="Kuvaile palvelua lyhyesti hakukoneita varten."
                        />
                      </div>
                      <div>
                        <Label htmlFor="meta_keywords">Meta Avainsanat (SEO)</Label>
                        <Input
                          id="meta_keywords"
                          value={landingPageSettings.meta_keywords}
                          onChange={(e) => handleLandingPageSettingsChange('meta_keywords', e.target.value)}
                          placeholder="Esim. vaalennus, hiusten vaalennus, kampaamo helsinki"
                        />
                      </div>
                      <div>
                        <Label htmlFor="landing_page_content">Alasivun sisältö</Label>
                        <LandingPageBuilder
                          value={landingPageSettings.landing_page_content}
                          onChange={(content) => handleLandingPageSettingsChange('landing_page_content', content)}
                        />
                         <p className="text-xs text-gray-400 mt-2">
                          Rakenna alasivun sisältö lisäämällä ja muokkaamalla sisältöblokkeja.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminServiceDetail;
