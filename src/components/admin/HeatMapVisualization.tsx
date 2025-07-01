
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface HeatMapData {
  x_coordinate: number;
  y_coordinate: number;
  click_count: number;
  page_url: string;
}

const HeatMapVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: heatMapData, isLoading } = useQuery({
    queryKey: ['heat-map-visualization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heat_map_data')
        .select('x_coordinate, y_coordinate, click_count, page_url')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return data as HeatMapData[];
    }
  });

  useEffect(() => {
    if (!heatMapData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Find max click count for color intensity
    const maxClicks = Math.max(...heatMapData.map(d => d.click_count));

    // Draw heat map points
    heatMapData.forEach((point) => {
      const intensity = point.click_count / maxClicks;
      const radius = Math.max(5, intensity * 20);
      
      // Scale coordinates to canvas size (assuming 1920x1080 source)
      const x = (point.x_coordinate / 1920) * canvas.width;
      const y = (point.y_coordinate / 1080) * canvas.height;

      // Create gradient for heat effect
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${intensity * 0.8})`);
      gradient.addColorStop(0.5, `rgba(255, 255, 0, ${intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(255, 255, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Add click count text for significant points
      if (point.click_count > 3) {
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(point.click_count.toString(), x, y + 3);
      }
    });

  }, [heatMapData]);

  if (isLoading) {
    return <div>Ladataan heat map dataa...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Heat Map - Klikkaukset (7 päivää)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef}
            className="border border-gray-300 max-w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Punainen = Enemmän klikkauksia, Keltainen = Vähemmän klikkauksia</p>
          <p>Yhteensä {heatMapData?.length || 0} klikkauspistettä</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeatMapVisualization;
