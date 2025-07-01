
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePages } from '@/hooks/usePages';
import { usePageSectionsCount } from '@/hooks/usePageSectionsCount';
import AdvancedHomepageContentManager from '@/components/admin/AdvancedHomepageContentManager';
import PageSectionManager from '@/components/admin/PageSectionManager';
import AdminPagesOverview from '@/components/admin/AdminPagesOverview';
import PageStatusIndicator from '@/components/admin/PageStatusIndicator';
import { 
  Globe, 
  Eye, 
  EyeOff,
  Settings,
  Loader2,
  Home,
  ArrowLeft,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Page {
  id: string;
  slug: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_system_page: boolean;
  created_at: string;
  updated_at: string;
}

const AdminPages = () => {
  const { pages, isLoading, updatePageStatus } = usePages();
  const { data: sectionsData, isLoading: sectionsLoading } = usePageSectionsCount();
  const [mode, setMode] = useState<'list' | 'edit-homepage' | 'edit-page'>('list');
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  const handleTogglePageStatus = (pageId: string, currentStatus: boolean, pageTitle: string) => {
    // If trying to hide a page, show confirmation
    if (currentStatus) {
      // This will be handled by the AlertDialog
      return;
    }
    
    updatePageStatus({
      pageId,
      isActive: !currentStatus
    });
  };

  const confirmTogglePageStatus = (pageId: string, currentStatus: boolean) => {
    updatePageStatus({
      pageId,
      isActive: !currentStatus
    });
  };

  const handleEditPage = (page: Page) => {
    setSelectedPage(page);
    setMode('edit-page');
  };
  
  const handleBackToList = () => {
    setMode('list');
    setSelectedPage(null);
  }

  const openPagePreview = (slug: string) => {
    const url = slug === 'homepage' ? '/' : `/${slug}`;
    window.open(url, '_blank');
  };

  if (isLoading || sectionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  if (mode === 'edit-homepage') {
    return (
      <div>
        <Button onClick={handleBackToList} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Takaisin listaan
        </Button>
        <AdvancedHomepageContentManager />
      </div>
    );
  }

  if (mode === 'edit-page' && selectedPage) {
    return (
      <PageSectionManager 
        pageId={selectedPage.id}
        pageTitle={selectedPage.title}
        onBack={handleBackToList}
      />
    );
  }
  
  // Filter to show only editable pages (not system pages) and sort alphabetically
  const editablePages = pages
    ?.filter(page => !page.is_system_page)
    ?.sort((a, b) => a.title.localeCompare(b.title)) || [];

  const activePages = editablePages.filter(page => page.is_active).length;
  const totalPages = editablePages.length + 1; // +1 for homepage
  const totalSections = sectionsData?.totalSections || 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Sivujen hallinta</h1>
          <p className="text-gray-400">Hallitse sivujen näkyvyyttä ja sisältöjä</p>
        </div>
        
        <AdminPagesOverview 
          totalPages={totalPages}
          activePages={activePages + 1} // +1 for always active homepage
          totalSections={totalSections}
        />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Muokattavat sivut</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Etusivu Card */}
            <Card className="transition-all bg-gray-900 border-gray-700 hover:border-blondify-blue">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Etusivu
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openPagePreview('homepage')}
                    className="text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <PageStatusIndicator 
                    isActive={true} 
                    isHomepage={true}
                  />
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  Sivuston pääsivu ja sen sisältöblokit.
                </p>
                <Button 
                  size="sm" 
                  className="w-full bg-blondify-blue hover:bg-blondify-blue/90"
                  onClick={() => setMode('edit-homepage')}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Muokkaa sisältöä
                </Button>
              </CardContent>
            </Card>

            {/* Editable pages from database */}
            {editablePages.map((page) => {
              const sectionsCount = sectionsData?.sectionsByPage[page.id] || 0;
              
              return (
                <Card 
                  key={page.id}
                  className={`transition-all bg-gray-900 border-gray-700 ${
                    page.is_active ? 'hover:border-blondify-blue' : 'opacity-75'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <Globe className="w-5 h-5" />
                        {page.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPagePreview(page.slug)}
                          className="text-gray-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        {page.is_active ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Switch checked={page.is_active} />
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-900 border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Piilota sivu</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Haluatko varmasti piilottaa sivun "{page.title}"? 
                                  Sivu ei näy enää sivustolla, mutta voit aktivoida sen myöhemmin.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                                  Peruuta
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => confirmTogglePageStatus(page.id, page.is_active)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Piilota sivu
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Switch
                            checked={page.is_active}
                            onCheckedChange={() => confirmTogglePageStatus(page.id, page.is_active)}
                          />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <PageStatusIndicator 
                        isActive={page.is_active} 
                        sectionsCount={sectionsCount}
                      />
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      {page.description || 'Ei kuvausta'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs text-gray-500">
                        /{page.slug}
                      </span>
                      {sectionsCount === 0 && (
                        <div className="flex items-center gap-1 text-orange-400">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs">Ei sisältöä</span>
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-blondify-blue hover:bg-blondify-blue/90"
                      onClick={() => handleEditPage(page)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Muokkaa sisältöä
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {editablePages.length === 0 && (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">
                  Ei muokattavia sivuja löytynyt järjestelmästä.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPages;
