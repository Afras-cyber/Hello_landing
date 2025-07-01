
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BookingAnalyticsData {
  session_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_names?: string[];
  total_amount?: number;
  booking_date?: string;
  appointment_date?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  confidence_score?: number;
  booking_confirmation_detected?: boolean;
  journey_steps?: any[];
  device_info?: any;
  total_session_duration?: number;
  page_views?: number;
}

interface CustomerJourneyStep {
  id: string;
  session_id: string;
  journey_step: string;
  page_url?: string;
  referrer_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  device_type?: string;
  browser?: string;
  step_data?: any;
  created_at: string;
}

export const useDetailedBookingAnalytics = (daysBack: number = 30) => {
  return useQuery({
    queryKey: ['detailed-booking-analytics', daysBack],
    queryFn: async (): Promise<BookingAnalyticsData[]> => {
      // Get booking conversions data
      const { data: bookings, error: bookingsError } = await supabase
        .from('booking_conversions')
        .select('*')
        .gte('created_at', new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Get enhanced booking details
      const { data: enhancedDetails, error: enhancedError } = await supabase
        .from('enhanced_booking_details')
        .select('*');

      if (enhancedError) throw enhancedError;

      // Create a map for enhanced details
      const enhancedMap = (enhancedDetails || []).reduce((acc, detail) => {
        acc[detail.session_id] = detail;
        return acc;
      }, {} as Record<string, any>);

      return bookings?.map(booking => {
        const enhanced = enhancedMap[booking.session_id];

        return {
          session_id: booking.session_id,
          customer_name: enhanced?.customer_name,
          customer_email: enhanced?.customer_email,
          customer_phone: enhanced?.customer_phone,
          service_names: enhanced?.service_names || [],
          total_amount: enhanced?.total_amount || 0,
          booking_date: booking.created_at,
          appointment_date: enhanced?.appointment_date,
          utm_source: booking.utm_source,
          utm_medium: booking.utm_medium,
          utm_campaign: booking.utm_campaign,
          confidence_score: booking.confidence_score,
          booking_confirmation_detected: booking.booking_confirmation_detected,
          journey_steps: [],
          device_info: {},
          total_session_duration: booking.booking_page_time,
          page_views: booking.iframe_interactions
        };
      }) || [];
    },
  });
};

export const useCustomerJourney = (sessionId: string) => {
  return useQuery({
    queryKey: ['customer-journey', sessionId],
    queryFn: async (): Promise<CustomerJourneyStep[]> => {
      // Get customer journey steps
      const { data, error } = await supabase
        .from('customer_journey')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map(journey => ({
        id: journey.id,
        session_id: journey.session_id,
        journey_step: journey.journey_step,
        page_url: journey.page_url,
        referrer_url: journey.referrer_url,
        utm_source: journey.utm_source,
        utm_medium: journey.utm_medium,
        utm_campaign: journey.utm_campaign,
        device_type: journey.device_type,
        browser: journey.browser,
        step_data: journey.step_data,
        created_at: journey.created_at
      }));
    },
    enabled: !!sessionId,
  });
};

export const useBookingSessionsOverview = () => {
  return useQuery({
    queryKey: ['booking-sessions-overview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });
};
