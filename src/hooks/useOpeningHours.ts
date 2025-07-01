
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OpeningHour {
  id: string;
  day_of_week: string;
  opening_time: string | null;
  closing_time: string | null;
  is_closed: boolean;
  display_order: number;
}

export const useOpeningHours = () => {
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOpeningHours();
  }, []);

  const fetchOpeningHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('opening_hours')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setOpeningHours(data || []);
    } catch (err) {
      console.error('Error fetching opening hours:', err);
      setError('Aukioloaikojen hakeminen epäonnistui');
    } finally {
      setLoading(false);
    }
  };

  const formatOpeningHours = (hours: OpeningHour[]) => {
    if (hours.length === 0) return [];

    const formatted = hours.map(hour => ({
      day: hour.day_of_week,
      time: hour.is_closed ? 'Suljettu' : `${hour.opening_time || ''} - ${hour.closing_time || ''}`,
      isClosed: hour.is_closed,
      originalHour: hour
    }));

    // Group consecutive days with same hours
    const grouped = [];
    let i = 0;

    while (i < formatted.length) {
      const current = formatted[i];
      let j = i + 1;

      // Find consecutive days with same time and status
      while (j < formatted.length && 
             formatted[j].time === current.time && 
             formatted[j].isClosed === current.isClosed) {
        j++;
      }

      if (j - i > 1) {
        // Multiple consecutive days with same hours
        const startDay = current.day;
        const endDay = formatted[j - 1].day;
        
        // Special handling for common patterns
        if (startDay === 'Ma' && endDay === 'Pe') {
          grouped.push({
            day: 'Ma - Pe',
            time: current.time,
            isClosed: current.isClosed
          });
        } else if (startDay === 'La' && endDay === 'Su') {
          grouped.push({
            day: 'La - Su',
            time: current.time,
            isClosed: current.isClosed
          });
        } else {
          grouped.push({
            day: `${startDay} - ${endDay}`,
            time: current.time,
            isClosed: current.isClosed
          });
        }
      } else {
        // Single day
        grouped.push(current);
      }

      i = j;
    }

    return grouped;
  };

  return {
    openingHours,
    formattedHours: formatOpeningHours(openingHours),
    loading,
    error,
    refetch: fetchOpeningHours
  };
};
