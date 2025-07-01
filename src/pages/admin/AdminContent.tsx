
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Layout, 
  Settings, 
  Database,
  Image,
  Globe,
  Users,
  BarChart3
} from 'lucide-react';
import EnhancedPortfolioManager from '@/components/admin/EnhancedPortfolioManager';
import MediaLibrary from '@/components/admin/MediaLibrary';
import ContentEditor from '@/components/admin/ContentEditor';
import GlobalSettings from '@/components/admin/GlobalSettings';
import AdminPagesOverview from '@/components/admin/AdminPagesOverview';
import { usePages } from '@/hooks/usePages';
import { usePageSectionsCount } from '@/hooks/usePageSectionsCount';

const AdminContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { pages, isLoading: pagesLoading } = usePages();
  const { data: sectionsData, isLoading: sectionsLoading } = usePageSectionsCount();

  const editablePages = pages?.filter(page => !page.is_system_page) || [];
  const activePages = editablePages.filter(page => page.is_active).length;
  const totalPages = editablePages.length + 1; // +1 for homepage
  const totalSections = sectionsData?.totalSections || 0;

  const adminStats = [
    { 
      label: 'Sivut', 
      value: totalPages, 
      subtext: `${activePages + 1} aktiivista`, 
      icon: Globe,
      color: 'blue' 
    },
    { 
      label: 'Sisältöblokit', 
      value: totalSections, 
      subtext: 'yhteensä', 
      icon: FileText,
      color: 'green' 
    },
    { 
      label: 'Portfolio-kuvat', 
      value: '42', 
      subtext: '5 kategoriaa', 
      icon: Image,
      color: 'purple' 
    },
    { 
      label: 'Media-tiedostot', 
      value: '156', 
      subtext: '2.4 GB käytössä', 
      icon: Database,
      color: 'orange' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Sisällönhallinta</h1>
        <p className="text-gray-400">Kattava hallintakeskus koko sivuston sisällön muokkaamiseen</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 mb-6">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blondify-blue">
            <BarChart3 className="w-4 h-4 mr-2" />
            Yleiskatsaus
          </TabsTrigger>
          <TabsTrigger value="content-editor" className="data-[state=active]:bg-blondify-blue">
            <Layout className="w-4 h-4 mr-2" />
            Sisältöeditori
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-blondify-blue">
            <Image className="w-4 h-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="media" className="data-[state=active]:bg-blondify-blue">
            <Database className="w-4 h-4 mr-2" />
            Media Library
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-blondify-blue">
            <Settings className="w-4 h-4 mr-2" />
            Sivusto-asetukset
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {adminStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-300">{stat.label}</p>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                          <p className="text-xs text-gray-400">{stat.subtext}</p>
                        </div>
                        <div className={`p-3 rounded-full bg-${stat.color}-500/10`}>
                          <Icon className={`h-6 w-6 text-${stat.color}-400`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Pika-toiminnot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setActiveTab('content-editor')}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                  >
                    <Layout className="h-8 w-8 text-blondify-blue mb-2" />
                    <h3 className="font-semibold text-white">Muokkaa etusivua</h3>
                    <p className="text-sm text-gray-400">Muokkaa etusivun sisältöjä visuaalisesti</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('portfolio')}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                  >
                    <Image className="h-8 w-8 text-green-400 mb-2" />
                    <h3 className="font-semibold text-white">Päivitä portfolio</h3>
                    <p className="text-sm text-gray-400">Lisää uusia töitä portfolioon</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('media')}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                  >
                    <Database className="h-8 w-8 text-purple-400 mb-2" />
                    <h3 className="font-semibold text-white">Hallinnoi mediaa</h3>
                    <p className="text-sm text-gray-400">Organisoi kuvat ja videot</p>
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left"
                  >
                    <Settings className="h-8 w-8 text-orange-400 mb-2" />
                    <h3 className="font-semibold text-white">Sivusto-asetukset</h3>
                    <p className="text-sm text-gray-400">Yleiset asetukset ja ulkoasu</p>
                  </button>
                  
                  <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left">
                    <Users className="h-8 w-8 text-yellow-400 mb-2" />
                    <h3 className="font-semibold text-white">Käyttäjänhallinta</h3>
                    <p className="text-sm text-gray-400">Hallitse admin-käyttäjiä</p>
                  </button>
                  
                  <button className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors text-left">
                    <BarChart3 className="h-8 w-8 text-red-400 mb-2" />
                    <h3 className="font-semibold text-white">Analytiikka</h3>
                    <p className="text-sm text-gray-400">Sivuston käyttötilastot</p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Viimeisimmät muutokset</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'Portfolio-kuva lisätty', time: '5 min sitten', type: 'portfolio' },
                    { action: 'Palvelut-sivu päivitetty', time: '1 tunti sitten', type: 'content' },
                    { action: 'Uusi blog-artikkeli julkaistu', time: '2 tuntia sitten', type: 'blog' },
                    { action: 'Yhteystiedot päivitetty', time: '1 päivä sitten', type: 'settings' },
                    { action: 'Media-tiedosto poistettu', time: '2 päivää sitten', type: 'media' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'portfolio' ? 'bg-green-400' :
                          activity.type === 'content' ? 'bg-blue-400' :
                          activity.type === 'blog' ? 'bg-purple-400' :
                          activity.type === 'settings' ? 'bg-orange-400' :
                          'bg-gray-400'
                        }`} />
                        <span className="text-white text-sm">{activity.action}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Editor Tab */}
        <TabsContent value="content-editor">
          <ContentEditor />
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio">
          <EnhancedPortfolioManager />
        </TabsContent>

        {/* Media Library Tab */}
        <TabsContent value="media">
          <MediaLibrary />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <GlobalSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
