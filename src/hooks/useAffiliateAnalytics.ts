
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AffiliateAnalytics {
  campaign_id: string;
  campaign_name: string;
  influencer_name: string;
  total_clicks: number;
  unique_visitors: number;
  total_conversions: number;
  conversion_rate: number;
  total_revenue: number;
  clicks_last_24h: number;
  conversions_last_24h: number;
}

export function useAffiliateAnalytics(campaignId?: string) {
  const fetchAnalytics = async (): Promise<AffiliateAnalytics[]> => {
    let query = supabase
      .from('campaign_analytics_summary')
      .select('*');
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching analytics:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };

  return useQuery({
    queryKey: ['affiliate_analytics', campaignId],
    queryFn: fetchAnalytics,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

export function useAffiliateClicks(campaignId: string, timeRange: '24h' | '7d' | '30d' = '7d') {
  const fetchClicks = async () => {
    const timeFilter = {
      '24h': new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const { data, error } = await supabase
      .from('affiliate_clicks')
      .select(`
        *,
        campaign_redirects(source_path, target_path)
      `)
      .eq('campaign_id', campaignId)
      .gte('clicked_at', timeFilter[timeRange])
      .order('clicked_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching clicks:', error);
      throw new Error(error.message);
    }
    
    return data;
  };

  return useQuery({
    queryKey: ['affiliate_clicks', campaignId, timeRange],
    queryFn: fetchClicks,
    enabled: !!campaignId,
  });
}
