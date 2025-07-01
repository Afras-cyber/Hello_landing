import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Calendar, TrendingUp, Eye } from 'lucide-react';

const AdminDashboard = () => {
  // Stats queries
  const { data: newsletterStats } = useQuery({
    queryKey: ['newsletter-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('*', { count: 'exact' });
      
      if (error) throw error;
      return { total: data?.length || 0 };
    }
  });

  const { data: bookingStats } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_conversions')
        .select('*')
        .eq('booking_confirmation_detected', true);
      
      if (error) throw error;
      return { total: data?.length || 0 };
    }
  });

  const { data: pageViewStats } = useQuery({
    queryKey: ['page-view-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('heat_map_data')
        .select('*', { count: 'exact' })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (error) throw error;
      return { weeklyViews: data?.length || 0 };
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Yleisnäkymä sivuston toiminnasta</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Uutiskirjetilaajat</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{newsletterStats?.total || 0}</div>
            <p className="text-xs text-gray-500">Kaikki tilaajat</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Varaukset</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{bookingStats?.total || 0}</div>
            <p className="text-xs text-gray-500">Vahvistetut varaukset</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Viikon katselut</CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pageViewStats?.weeklyViews || 0}</div>
            <p className="text-xs text-gray-500">Sivujen katselut</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Kasvu</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">+12%</div>
            <p className="text-xs text-gray-500">Verrattuna viime kuuhun</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Pika-toiminnot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="bg-blondify-blue/20 p-3 rounded-lg mb-2">
                <Users className="h-6 w-6 text-blondify-blue mx-auto" />
              </div>
              <p className="text-sm text-gray-300">Hallitse tilaajia</p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 p-3 rounded-lg mb-2">
                <Calendar className="h-6 w-6 text-green-500 mx-auto" />
              </div>
              <p className="text-sm text-gray-300">Varausanalytiikka</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-500/20 p-3 rounded-lg mb-2">
                <Eye className="h-6 w-6 text-purple-500 mx-auto" />
              </div>
              <p className="text-sm text-gray-300">Sivuston seuranta</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-500/20 p-3 rounded-lg mb-2">
                <TrendingUp className="h-6 w-6 text-yellow-500 mx-auto" />
              </div>
              <p className="text-sm text-gray-300">Kasvuraportti</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
