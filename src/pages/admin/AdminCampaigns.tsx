import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, RotateCcw } from 'lucide-react';
import DeleteConfirmation from '@/components/admin/DeleteConfirmation';
import { useNavigate } from 'react-router-dom';

interface Campaign {
  id: string;
  name: string;
  description: string;
  slug: string;
  banner_image?: string;
  is_active: boolean;
  type: string;
  created_at: string;
  updated_at: string;
}

const AdminCampaigns: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const { toast } = useToast();
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      // First check if user is authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.log('No active session found');
        setIsAdmin(false);
        navigate('/admin/login');
        return;
      }
      
      // Then check if user is an admin
      const { data: adminData, error } = await supabase.rpc('is_admin');
      
      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        navigate('/admin/login');
        return;
      }
      
      setIsAdmin(adminData);
      
      if (adminData) {
        fetchCampaigns();
      } else {
        console.log('User is not an admin');
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAdmin(false);
      navigate('/admin/login');
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      console.log('Fetching campaigns as admin...');
      
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching campaigns:', error);
        toast({
          title: "Virhe",
          description: "Kampanjoiden hakeminen epäonnistui.",
          variant: "destructive"
        });
        throw error;
      }
      
      console.log('Campaigns fetched successfully:', data?.length || 0);
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Virhe",
        description: "Kampanjoiden hakeminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/campaigns/${campaign.id}`);
  };

  const handleAddClick = () => {
    navigate('/admin/campaigns/new');
  };

  const handleAddInfluencerCampaign = () => {
    navigate('/admin/campaigns/new?type=influencer');
  };

  const handleDeleteClick = (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCampaign(campaign);
  };

  const handleToggleCampaignType = async (campaign: Campaign, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newType = campaign.type === 'influencer' ? 'basic' : 'influencer';
    
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ type: newType })
        .eq('id', campaign.id);
        
      if (error) {
        console.error('Error updating campaign type:', error);
        toast({
          title: "Virhe",
          description: "Kampanjan tyypin vaihtaminen epäonnistui.",
          variant: "destructive"
        });
        return;
      }
      
      // Update local state
      setCampaigns(campaigns.map(c => 
        c.id === campaign.id ? { ...c, type: newType } : c
      ));
      
      toast({
        title: "Päivitetty",
        description: `Kampanja muutettu ${newType === 'influencer' ? 'vaikuttaja' : 'perus'}kampanjaksi.`
      });
    } catch (error) {
      console.error('Error updating campaign type:', error);
      toast({
        title: "Virhe",
        description: "Kampanjan tyypin vaihtaminen epäonnistui.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCampaign) return;
    
    setIsDeleting(true);
    try {
      console.log('Deleting campaign:', deletingCampaign.id);
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', deletingCampaign.id);
        
      if (error) {
        console.error('Error deleting campaign:', error);
        throw error;
      }
      
      // Remove from local state
      setCampaigns(campaigns.filter(c => c.id !== deletingCampaign.id));
      
      toast({
        title: "Poistettu",
        description: "Kampanja poistettu onnistuneesti."
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Virhe",
        description: "Kampanjan poistaminen epäonnistui.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeletingCampaign(null);
    }
  };

  const handleCampaignCardClick = (campaign: Campaign) => {
    navigate(`/admin/campaigns/${campaign.id}`);
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  if (isAdmin === false) {
    return null; // Will redirect via navigate
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-redhat">Kampanjat</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
            onClick={handleAddInfluencerCampaign}
          >
            <Plus className="mr-2 h-4 w-4" />
            Somekampanja
          </Button>
          <Button 
            variant="default" 
            className="bg-blondify-blue hover:bg-blue-600"
            onClick={handleAddClick}
          >
            <Plus className="mr-2 h-4 w-4" />
            Peruskampanja
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blondify-blue transition-all cursor-pointer"
                onClick={() => handleCampaignCardClick(campaign)}
              >
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    {campaign.banner_image && (
                      <img 
                        src={campaign.banner_image} 
                        alt={campaign.name} 
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{campaign.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs ${
                          campaign.type === 'influencer' 
                            ? 'bg-purple-800 text-purple-200' 
                            : 'bg-blue-800 text-blue-200'
                        }`}>
                          {campaign.type === 'influencer' ? 'Somekampanja' : 'Peruskampanja'}
                        </span>
                      </div>
                      {campaign.is_active ? (
                        <span className="px-2 py-1 bg-green-800 text-green-200 rounded text-xs">Aktiivinen</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">Ei aktiivinen</span>
                      )}
                      <p className="text-sm text-gray-400 mt-1">URL: /kampanja/{campaign.slug}</p>
                    </div>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleToggleCampaignType(campaign, e)}
                      title={`Vaihda ${campaign.type === 'influencer' ? 'perus' : 'some'}kampanjaksi`}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => handleEditClick(campaign, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="hover:text-red-500"
                      onClick={(e) => handleDeleteClick(campaign, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  {campaign.description?.substring(0, 100)}
                  {campaign.description?.length > 100 ? '...' : ''}
                </p>
                <div className="flex justify-between mt-3 text-xs text-gray-400">
                  <span>Luotu: {new Date(campaign.created_at).toLocaleDateString('fi-FI')}</span>
                  <span>Päivitetty: {new Date(campaign.updated_at).toLocaleDateString('fi-FI')}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center py-10 text-gray-400">
              Ei kampanjoita. Lisää uusi kampanja aloittaaksesi.
            </p>
          )}
        </div>
      )}
      
      {deletingCampaign && (
        <DeleteConfirmation 
          title="Poista kampanja"
          message={`Haluatko varmasti poistaa kampanjan "${deletingCampaign.name}"? Tätä toimintoa ei voi perua.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingCampaign(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default AdminCampaigns;
