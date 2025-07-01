
import React from 'react';
import CampaignTrackingAnalytics from '@/components/admin/CampaignTrackingAnalytics';
import ConversionValidation from '@/components/admin/ConversionValidation';
import AnalyticsHelpGuide from '@/components/admin/AnalyticsHelpGuide';
import EnhancedBookingAnalytics from '@/components/admin/EnhancedBookingAnalytics';
import ScreenshotGallery from '@/components/admin/ScreenshotGallery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminBookingAnalytics = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blondify Analytiikka</h1>
          <p className="text-gray-400">Seuraa kampanjoita, varauksia ja asiakaspolkuja</p>
        </div>
        
        <Tabs defaultValue="enhanced-analytics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="enhanced-analytics" className="text-purple-400">
              🔍 Parannettu Analytiikka
            </TabsTrigger>
            <TabsTrigger value="campaign-tracking" className="text-blue-400">
              📊 Kampanjaseuranta
            </TabsTrigger>
            <TabsTrigger value="screenshots" className="text-green-400">
              📸 Screenshotit
            </TabsTrigger>
            <TabsTrigger value="validation" className="text-yellow-400">
              ✅ Validointi
            </TabsTrigger>
            <TabsTrigger value="help" className="text-gray-400">
              ❓ Ohje
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="enhanced-analytics">
            <div className="bg-gray-900 rounded-lg p-6">
              <EnhancedBookingAnalytics />
            </div>
          </TabsContent>
          
          <TabsContent value="campaign-tracking">
            <div className="bg-gray-900 rounded-lg p-6">
              <CampaignTrackingAnalytics />
            </div>
          </TabsContent>
          
          <TabsContent value="screenshots">
            <div className="bg-gray-900 rounded-lg p-6">
              <ScreenshotGallery />
            </div>
          </TabsContent>
          
          <TabsContent value="validation">
            <div className="bg-gray-900 rounded-lg p-6">
              <ConversionValidation />
            </div>
          </TabsContent>
          
          <TabsContent value="help">
            <div className="bg-gray-900 rounded-lg p-6">
              <AnalyticsHelpGuide />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminBookingAnalytics;
