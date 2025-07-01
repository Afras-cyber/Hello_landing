
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface NewBooking {
  session_id: string;
  utm_source: string;
  utm_campaign: string;
  confidence_score: number;
  created_at: string;
}

const BookingNotifications = () => {
  const [todayBookings, setTodayBookings] = useState<NewBooking[]>([]);

  useEffect(() => {
    // Set up real-time subscription for new bookings
    const subscription = supabase
      .channel('new-bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_conversions'
        },
        (payload) => {
          const newBooking = payload.new as NewBooking;
          
          // Only show notifications for high-confidence bookings
          if (newBooking.confidence_score > 0.7) {
            const source = newBooking.utm_source || 'Suora vierailu';
            const campaign = newBooking.utm_campaign || 'Ei kampanjaa';
            
            toast.success(
              `🎉 Uusi varaus! Lähde: ${source} (${campaign})`,
              {
                duration: 5000,
                action: {
                  label: 'Näytä',
                  onClick: () => window.location.href = '/admin/analytics'
                }
              }
            );
            
            // Add to today's bookings list
            setTodayBookings(prev => [newBooking, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    // Fetch today's bookings on component mount  
    const fetchTodayBookings = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .gte('created_at', `${today}T00:00:00`)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (!error && data) {
        setTodayBookings(data);
      }
    };

    fetchTodayBookings();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (todayBookings.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-green-500" />
          <span className="font-semibold text-white">Tänään varattu</span>
          <Badge variant="secondary">{todayBookings.length}</Badge>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {todayBookings.slice(0, 5).map((booking, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">
                  {booking.utm_source || 'Direct'}
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{new Date(booking.created_at).toLocaleTimeString('fi-FI', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}</span>
              </div>
            </div>
          ))}
        </div>
        
        {todayBookings.length > 5 && (
          <p className="text-xs text-gray-400 mt-2">
            +{todayBookings.length - 5} muuta varausta
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingNotifications;
