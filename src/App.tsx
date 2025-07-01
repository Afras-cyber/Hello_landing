import React, { Suspense, lazy, useMemo, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';

// Optimized Loading Component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      <p className="text-white/70 text-sm">Ladataan...</p>
    </div>
  </div>
);

// Critical components loaded immediately (no lazy loading)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

// High-priority pages (loaded with higher priority)
const Index = lazy(() => 
  import("./pages/Index").then(module => ({ default: module.default }))
);
const Services = lazy(() => 
  import("./pages/Services").then(module => ({ default: module.default }))
);
const Booking = lazy(() => 
  import("./pages/Booking").then(module => ({ default: module.default }))
);

// Medium-priority pages (standard lazy loading)
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const About = lazy(() => import("./pages/About"));
const BlondeSpecialists = lazy(() => import("./pages/BlondeSpecialists"));
const Blog = lazy(() => import("./pages/Blog"));
const SalonsPage = lazy(() => import("./pages/SalonsPage"));

// Low-priority pages (loaded with lower priority)
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const BlondeSpecialistDetail = lazy(() => import("./pages/BlondeSpecialistDetail"));
const ArticleDetail = lazy(() => import("./pages/ArticleDetail"));
const Articles = lazy(() => import("./pages/Articles"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const ShadesExplorer = lazy(() => import("./pages/ShadesExplorer"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Sustainability = lazy(() => import("./pages/Sustainability"));
const StoryPage = lazy(() => import("./pages/StoryPage"));
const NewsletterPage = lazy(() => import("./pages/NewsletterPage"));
const CampaignPage = lazy(() => import("./pages/CampaignPage"));
const CampaignsListPage = lazy(() => import("./pages/CampaignsListPage"));
const BlondifyCareer = lazy(() => import("./pages/BlondifyCareer"));
const VaalnennuksetService = lazy(() => import("./pages/services/VaalnennuksetService"));
const RaidoitusService = lazy(() => import("./pages/services/RaidoitusService"));
const YllapitoService = lazy(() => import("./pages/services/YllapitoService"));



// Admin components (loaded only when needed)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminRoutes = lazy(() => import("./components/admin/AdminRoutes"));
const AdminProtectedRoute = lazy(() => import("./components/admin/AdminProtectedRoute"));

// Utility components (loaded with delay)
const RedirectHandler = lazy(() => import("./components/RedirectHandler"));
const TagManager = lazy(() => import("./components/TagManager"));
const ComprehensiveSiteTracker = lazy(() => import("./components/ComprehensiveSiteTracker"));
const NewsletterPopup = lazy(() => import("./components/NewsletterPopup"));
const StickyBookingButton = lazy(() => import("./components/StickyBookingButton"));
const VersionUpdateNotification = lazy(() => import('@/components/VersionUpdateNotification'));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized QueryClient with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes
      gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
      retry: 1, // Reduce retries for faster failure
      refetchOnWindowFocus: false, // Reduce unnecessary requests
      refetchOnMount: false, // Reduce unnecessary requests
    },
  },
});

// Optimized conditional components with better memoization
const ConditionalComponents = React.memo(() => {
  const location = useLocation();
  const isAdminRoute = useMemo(() => 
    location.pathname.startsWith('/admin'), 
    [location.pathname]
  );
  
  if (isAdminRoute) return null;
  
  return (
    <>
      <Navbar />
      <Suspense fallback={null}>
        <NewsletterPopup />
        <StickyBookingButton />
      </Suspense>
    </>
  );
});

const ConditionalFooter = React.memo(() => {
  const location = useLocation();
  const isAdminRoute = useMemo(() => 
    location.pathname.startsWith('/admin'), 
    [location.pathname]
  );
  
  if (isAdminRoute) return null;
  return <Footer />;
});

// Utility components with delayed loading
const UtilityComponents = React.memo(() => {
  const location = useLocation();
  const isAdminRoute = useMemo(() => 
    location.pathname.startsWith('/admin'), 
    [location.pathname]
  );

  return (
    <Suspense fallback={null}>
      <RedirectHandler />
      <ComprehensiveSiteTracker sessionId="default-session" />
      <TagManager />
      <ScrollToTop />
      {!isAdminRoute && <VersionUpdateNotification />}
    </Suspense>
  );
});

// Preload critical routes based on user behavior
const useRoutePreloading = () => {
  const preloadRoute = useCallback((routeImport: () => Promise<any>) => {
    // Preload on mouse enter or touch start
    const preload = () => {
      routeImport().catch(() => {}); // Silently fail if preload fails
    };
    
    return preload;
  }, []);

  return preloadRoute;
};

function App() {
  const preloadRoute = useRoutePreloading();

  // Preload critical routes after initial load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      // Preload most likely next routes
      import("./pages/Services").catch(() => {});
      import("./pages/Booking").catch(() => {});
    }, 2000); // Preload after 2 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Router>
            <div className="min-h-screen bg-black text-white">
              <ConditionalComponents />
              
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/palvelut" element={<Services />} />
                  <Route path="/varaa-aika" element={<Booking />} />
                  
                  {/* Service routes */}
                  <Route path="/palvelut/:slug" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ServiceDetail />
                    </Suspense>
                  } />
                  <Route path="/raidoitus" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <RaidoitusService />
                    </Suspense>
                  } />
                  <Route path="/vaalennukset" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <VaalnennuksetService />
                    </Suspense>
                  } />
                  <Route path="/yllapito" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <YllapitoService />
                    </Suspense>
                  } />
                  
                  {/* Main navigation routes */}
                  <Route path="/kampaamot" element={<SalonsPage />} />
                  <Route path="/tiimi" element={<BlondeSpecialists />} />
                  <Route path="/blonde-specialistit" element={<BlondeSpecialists />} />
                  <Route path="/meista" element={<About />} />
                  <Route path="/blogi" element={<Blog />} />
                  
                  {/* Detail routes */}
                  <Route path="/blonde-specialistit/:id" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <BlondeSpecialistDetail />
                    </Suspense>
                  } />
                  <Route path="/artikkelit" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Articles />
                    </Suspense>
                  } />
                  <Route path="/artikkelit/:slug" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ArticleDetail />
                    </Suspense>
                  } />
                  <Route path="/blogi/:slug" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ArticleDetail />
                    </Suspense>
                  } />
                  
                  {/* Secondary routes */}
                  <Route path="/tarina" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <StoryPage />
                    </Suspense>
                  } />
                  <Route path="/ura" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <BlondifyCareer />
                    </Suspense>
                  } />
                  <Route path="/portfolio" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Portfolio />
                    </Suspense>
                  } />
                  <Route path="/savyt" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <ShadesExplorer />
                    </Suspense>
                  } />
                  
                  {/* Utility routes */}
                  <Route path="/tietosuoja" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <PrivacyPolicy />
                    </Suspense>
                  } />
                  <Route path="/ukk" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <FAQPage />
                    </Suspense>
                  } />
                  <Route path="/usein-kysytyt-kysymykset" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <FAQPage />
                    </Suspense>
                  } />
                  <Route path="/vastuullisuus" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <Sustainability />
                    </Suspense>
                  } />
                  <Route path="/uutiskirje" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <NewsletterPage />
                    </Suspense>
                  } />
                  <Route path="/kampanjat" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <CampaignsListPage />
                    </Suspense>
                  } />
                  <Route path="/kampanja/:slug" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <CampaignPage />
                    </Suspense>
                  } />
                  
                  {/* Admin routes */}
                  <Route path="/admin/login" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminLogin />
                    </Suspense>
                  } />
                  <Route path="/admin/articles" element={<Navigate to="/admin/blog" replace />} />
                  <Route path="/admin/articles/*" element={<Navigate to="/admin/blog" replace />} />
                  <Route path="/admin/*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <AdminProtectedRoute>
                        <AdminLayout>
                          <AdminRoutes />
                        </AdminLayout>
                      </AdminProtectedRoute>
                    </Suspense>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <NotFound />
                    </Suspense>
                  } />
                </Routes>
              </Suspense>
              
              <ConditionalFooter />
              <UtilityComponents />
              
              {/* Toast components */}
              <Toaster />
              <Sonner />
            </div>
          </Router>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;