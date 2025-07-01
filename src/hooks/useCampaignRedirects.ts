
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CampaignRedirect {
  id: string;
  source_path: string;
  target_path: string;
  is_active: boolean;
  click_count: number;
  created_at: string;
  updated_at: string;
}

// This hook is useful for admin interfaces to manage all redirects
export function useCampaignRedirects() {
  const fetchRedirects = async (): Promise<CampaignRedirect[]> => {
    try {
      const { data, error } = await supabase
        .from('campaign_redirects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching redirects:', error);
        throw new Error(error.message);
      }
      
      return data || [];
    } catch (err) {
      console.error('Error in redirects fetch:', err);
      throw err;
    }
  };

  return useQuery({
    queryKey: ['campaign_redirects'],
    queryFn: fetchRedirects,
  });
}

// This function is used for the redirect mechanism
export async function getRedirectTarget(path: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('campaign_redirects')
      .select('target_path')
      .eq('source_path', path)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      console.error('Redirect not found or inactive:', path);
      return null;
    }

    // Increment the click count asynchronously
    supabase.rpc('increment_redirect_click_count', { source_path_param: path })
      .then(({ error }) => {
        if (error) console.error('Failed to increment click count:', error);
      });
    
    return data.target_path;
  } catch (err) {
    console.error('Error getting redirect target:', err);
    return null;
  }
}
