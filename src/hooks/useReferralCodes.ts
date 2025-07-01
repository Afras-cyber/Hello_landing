
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReferralCode {
  id: string;
  campaign_id: string;
  code: string;
  influencer_name: string;
  discount_percentage: number;
  max_uses: number;
  current_uses: number;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useReferralCodes(campaignId?: string) {
  const fetchReferralCodes = async (): Promise<ReferralCode[]> => {
    let query = supabase
      .from('referral_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching referral codes:', error);
      throw new Error(error.message);
    }
    
    return data || [];
  };

  return useQuery({
    queryKey: ['referral_codes', campaignId],
    queryFn: fetchReferralCodes,
  });
}

export function useCreateReferralCode() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newCode: Omit<ReferralCode, 'id' | 'created_at' | 'updated_at' | 'current_uses'>) => {
      const { data, error } = await supabase
        .from('referral_codes')
        .insert([newCode])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral_codes'] });
      toast({
        title: "Onnistui",
        description: "Alennuskoodi luotu onnistuneesti!",
      });
    },
    onError: (error) => {
      console.error('Error creating referral code:', error);
      toast({
        title: "Virhe",
        description: "Alennuskoodin luominen epäonnistui.",
        variant: "destructive"
      });
    },
  });
}

export function useValidateReferralCode() {
  return useMutation({
    mutationFn: async (code: string): Promise<boolean> => {
      const { data, error } = await supabase
        .rpc('increment_referral_code_usage', { code_param: code });

      if (error) {
        console.error('Error validating referral code:', error);
        return false;
      }

      return data;
    },
  });
}
