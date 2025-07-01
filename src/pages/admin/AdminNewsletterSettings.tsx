
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewsletterManager from '@/components/admin/NewsletterManager';
import NewsletterSubscribers from '@/components/admin/NewsletterSubscribers';

const AdminNewsletterSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Uutiskirje</h1>
        <p className="text-gray-400">Hallitse uutiskirjeen asetuksia ja tilaajia</p>
      </div>
      
      <Tabs defaultValue="subscribers" className="space-y-6">
        <TabsList className="bg-gray-800">
          <TabsTrigger value="subscribers" className="data-[state=active]:bg-blondify-blue">
            Tilaajat
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blondify-blue">
            Asetukset
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <NewsletterSubscribers />
        </TabsContent>

        <TabsContent value="settings">
          <NewsletterManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminNewsletterSettings;
