import React, { Suspense, lazy, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Booking = lazy(() => import("./pages/Booking"));
const BlondeSpecialists = lazy(() => import("./pages/BlondeSpecialists"));
const BlondeSpecialistDetail = lazy(() => import("./pages/BlondeSpecialistDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Articles = lazy(() => import("./pages/Articles"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ShadesExplorer = lazy(() => import("./pages/ShadesExplorer"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const StoryPage = lazy(() => import("./pages/StoryPage"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const SalonsPage = lazy(() => import("./pages/SalonsPage"));
const CampaignPage = lazy(() => import("./pages/CampaignPage"));
const CampaignsListPage = lazy(() => import("./pages/CampaignsListPage"));
const BlondifyCareer = lazy(() => import("./pages/BlondifyCareer"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminRoutes = lazy(() => import("./components/admin/AdminRoutes"));
const AdminProtectedRoute = lazy(() => import("./components/admin/AdminProtectedRoute"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ScrollToTop = lazy(() => import("./components/ScrollToTop"));
const RedirectHandler = lazy(() => import("./components/RedirectHandler"));
const TagManager = lazy(() => import("./components/TagManager"));
const ComprehensiveSiteTracker = lazy(() => import("./components/ComprehensiveSiteTracker"));
const NewsletterPopup = lazy(() => import("./components/NewsletterPopup"));
const StickyBookingButton = lazy(() => import("./components/StickyBookingButton"));
const VersionUpdateNotification = lazy(() => import('@/components/VersionUpdateNotification'));
const VaalnennuksetService = lazy(() => import("./pages/services/VaalnennuksetService"));
const RaidoitusService = lazy(() => import("./pages/services/RaidoitusService"));
const YllapitoService = lazy(() => import("./pages/services/YllapitoService"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const ConditionalComponents = React.memo(() => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  return (
    <>
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <NewsletterPopup />}
      {!isAdminRoute && <StickyBookingButton />}
    </>
  );
});

const ConditionalFooter = React.memo(() => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  if (isAdminRoute) return null;
  return <Footer />;
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-black text-white">
              <Suspense fallback={<div>Loading...</div>}>
                <ConditionalComponents />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/palvelut" element={<Services />} />
                  <Route path="/palvelut/:slug" element={<ServiceDetail />} />
                  <Route path="/raidoitus" element={<RaidoitusService />} />
                  <Route path="/vaalennukset" element={<VaalnennuksetService />} />
                  <Route path="/yllapito" element={<YllapitoService />} />
                  <Route path="/kampaamot" element={<SalonsPage />} />
                  <Route path="/tiimi" element={<BlondeSpecialists />} />
                  <Route path="/blonde-specialistit" element={<BlondeSpecialists />} />
                  <Route path="/blonde-specialistit/:id" element={<BlondeSpecialistDetail />} />
                  <Route path="/meista" element={<About />} />
                  <Route path="/tarina" element={<StoryPage />} />
                  <Route path="/blogi" element={<Blog />} />
                  <Route path="/artikkelit" element={<Articles />} />
                  <Route path="/artikkelit/:slug" element={<ArticleDetail />} />
                  <Route path="/blogi/:slug" element={<ArticleDetail />} />
                  <Route path="/ura" element={<BlondifyCareer />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/savyt" element={<ShadesExplorer />} />
                  <Route path="/varaa-aika" element={<Booking />} />
                  <Route path="/tietosuoja" element={<PrivacyPolicy />} />
                  <Route path="/ukk" element={<FAQPage />} />
                  <Route path="/usein-kysytyt-kysymykset" element={<FAQPage />} />
                  <Route path="/vastuullisuus" element={<Sustainability />} />
                  <Route path="/uutiskirje" element={<NewsletterPage />} />
                  <Route path="/kampanjat" element={<CampaignsListPage />} />
                  <Route path="/kampanja/:slug" element={<CampaignPage />} />
                  {/* Admin routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/articles" element={<Navigate to="/admin/blog" replace />} />
                  <Route path="/admin/articles/*" element={<Navigate to="/admin/blog" replace />} />
                  <Route path="/admin/*" element={
                    <AdminProtectedRoute>
                      <AdminLayout>
                        <AdminRoutes />
                      </AdminLayout>
                    </AdminProtectedRoute>
                  } />
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ConditionalFooter />
                <RedirectHandler />
                <ComprehensiveSiteTracker sessionId="default-session" />
                <TagManager />
                <ScrollToTop />
              </Suspense>
            </div>
          </Router>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;