
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DetailedBookingAnalytics from '@/components/admin/DetailedBookingAnalytics';
import BookingAnalytics from '@/components/admin/BookingAnalytics';
import SessionAnalytics from '@/components/admin/SessionAnalytics';
import CustomerJourneyAnalytics from '@/components/admin/CustomerJourneyAnalytics';
import AnalyticsOverview from '@/components/admin/AnalyticsOverview';
import { BarChart3, Users, Calendar, TrendingUp, Eye, Route } from 'lucide-react';

const AdminAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Blondify Analytiikka</h1>
          <p className="text-gray-400">Kattava seuranta asiakkaista, varauksista ja asiakaspoluista</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Yleiskatsaus
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Käyttäjäsessiot
            </TabsTrigger>
            <TabsTrigger value="customer-journeys" className="flex items-center gap-2">
              <Route className="h-4 w-4" />
              Asiakaspolut
            </TabsTrigger>
            <TabsTrigger value="detailed-bookings" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Yksityiskohtaiset Varaukset
            </TabsTrigger>
            <TabsTrigger value="booking-overview" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Varaus Analytiikka
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="bg-gray-900 rounded-lg p-6">
              <AnalyticsOverview />
            </div>
          </TabsContent>

          <TabsContent value="sessions">
            <div className="bg-gray-900 rounded-lg p-6">
              <SessionAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="customer-journeys">
            <div className="bg-gray-900 rounded-lg p-6">
              <CustomerJourneyAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="detailed-bookings">
            <div className="bg-gray-900 rounded-lg p-6">
              <DetailedBookingAnalytics />
            </div>
          </TabsContent>

          <TabsContent value="booking-overview">
            <div className="bg-gray-900 rounded-lg p-6">
              <BookingAnalytics />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminAnalytics;
