
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MousePointer, Smartphone, Monitor, Calendar, Download } from 'lucide-react';

interface HeatMapPoint {
  x_coordinate: number;
  y_coordinate: number;
  click_count: number;
  element_selector?: string;
  page_url: string;
  device_type: string;
  date: string;
}

interface PageHeatMap {
  page_url: string;
  total_clicks: number;
  unique_elements: number;
  points: HeatMapPoint[];
}

const EnhancedHeatMapVisualization: React.FC = () => {
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [heatMapData, setHeatMapData] = useState<HeatMapPoint[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch available pages
  const { data: pages = [] } = useQuery({
    queryKey: ['heat-map-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heat_map_data')
        .select('page_url')
        .order('page_url');
      
      if (error) throw error;
      
      // Get unique pages
      const uniquePages = [...new Set(data.map(item => item.page_url))];
      return uniquePages;
    }
  });

  // Fetch heat map data
  const { data: rawHeatMapData = [] } = useQuery({
    queryKey: ['heat-map-data', selectedPage, selectedDevice, dateRange],
    queryFn: async (): Promise<HeatMapPoint[]> => {
      let query = supabase
        .from('heat_map_data')
        .select('*');
      
      if (selectedPage) {
        query = query.eq('page_url', selectedPage);
      }
      
      if (selectedDevice !== 'all') {
        query = query.eq('device_type', selectedDevice);
      }
      
      // Date filtering
      const daysAgo = parseInt(dateRange.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);
      query = query.gte('date', startDate.toISOString().split('T')[0]);
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!selectedPage
  });

  // Set default page when pages load
  useEffect(() => {
    if (pages.length > 0 && !selectedPage) {
      setSelectedPage(pages[0]);
    }
  }, [pages, selectedPage]);

  // Update heat map data when raw data changes
  useEffect(() => {
    setHeatMapData(rawHeatMapData);
  }, [rawHeatMapData]);

  // Draw heat map on canvas
  useEffect(() => {
    if (!canvasRef.current || heatMapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const container = containerRef.current;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = 600;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find max click count for intensity scaling
    const maxClicks = Math.max(...heatMapData.map(point => point.click_count));

    // Create gradient for heat map colors
    const createGradient = (intensity: number) => {
      const normalizedIntensity = intensity / maxClicks;
      
      if (normalizedIntensity < 0.2) return `rgba(0, 255, 0, ${normalizedIntensity * 0.3})`;
      if (normalizedIntensity < 0.5) return `rgba(255, 255, 0, ${normalizedIntensity * 0.5})`;
      if (normalizedIntensity < 0.8) return `rgba(255, 165, 0, ${normalizedIntensity * 0.7})`;
      return `rgba(255, 0, 0, ${normalizedIntensity * 0.9})`;
    };

    // Draw heat map points
    heatMapData.forEach(point => {
      // Scale coordinates to canvas size (assuming typical viewport sizes)
      const scaleX = canvas.width / 1920; // Assuming max viewport width
      const scaleY = canvas.height / 1080; // Assuming max viewport height
      
      const x = point.x_coordinate * scaleX;
      const y = point.y_coordinate * scaleY;
      
      // Ensure points are within canvas bounds
      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        const radius = Math.max(10, Math.min(50, point.click_count * 5));
        
        // Create radial gradient for smooth heat effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, createGradient(point.click_count));
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add click count label for high-traffic areas
        if (point.click_count > 5) {
          ctx.fillStyle = '#000';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(point.click_count.toString(), x, y + 4);
        }
      }
    });
  }, [heatMapData]);

  // Generate heat map summary statistics
  const generateStats = () => {
    if (heatMapData.length === 0) return null;

    const totalClicks = heatMapData.reduce((sum, point) => sum + point.click_count, 0);
    const uniqueElements = new Set(heatMapData.map(point => point.element_selector)).size;
    const avgClicksPerPoint = totalClicks / heatMapData.length;
    
    // Find hotspots (top 10% of click density)
    const sortedPoints = [...heatMapData].sort((a, b) => b.click_count - a.click_count);
    const hotspots = sortedPoints.slice(0, Math.max(1, Math.floor(sortedPoints.length * 0.1)));

    return {
      totalClicks,
      uniqueElements,
      avgClicksPerPoint: Math.round(avgClicksPerPoint * 100) / 100,
      hotspots
    };
  };

  const stats = generateStats();

  const downloadHeatMapData = () => {
    if (heatMapData.length === 0) return;

    const csvContent = [
      ['X Coordinate', 'Y Coordinate', 'Click Count', 'Element', 'Device Type', 'Date'].join(','),
      ...heatMapData.map(point => [
        point.x_coordinate,
        point.y_coordinate,
        point.click_count,
        point.element_selector || 'Unknown',
        point.device_type,
        point.date
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `heatmap-${selectedPage.replace(/[^a-z0-9]/gi, '_')}-${dateRange}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointer className="h-5 w-5" />
            Heat Map Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Page</label>
              <Select value={selectedPage} onValueChange={setSelectedPage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select page" />
                </SelectTrigger>
                <SelectContent>
                  {pages.map(page => (
                    <SelectItem key={page} value={page}>
                      {page}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Device Type</label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="mobile">Mobile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button onClick={downloadHeatMapData} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.totalClicks}</div>
              <p className="text-sm text-muted-foreground">Total Clicks</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.uniqueElements}</div>
              <p className="text-sm text-muted-foreground">Unique Elements</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">{stats.avgClicksPerPoint}</div>
              <p className="text-sm text-muted-foreground">Avg Clicks/Element</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">{stats.hotspots.length}</div>
              <p className="text-sm text-muted-foreground">Hotspots</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Heat Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Click Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={containerRef} className="relative w-full">
            <canvas
              ref={canvasRef}
              className="border border-gray-200 w-full"
              style={{ maxHeight: '600px' }}
            />
            {heatMapData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <p className="text-gray-500">No heat map data available for the selected criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hotspots List */}
      {stats && stats.hotspots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Hotspots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.hotspots.slice(0, 10).map((hotspot, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <div className="font-medium">
                      {hotspot.element_selector || 'Unknown Element'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Position: ({hotspot.x_coordinate}, {hotspot.y_coordinate})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{hotspot.click_count} clicks</Badge>
                    <Badge variant="outline">{hotspot.device_type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedHeatMapVisualization;
