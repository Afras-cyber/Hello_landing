
import React, { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { getRedirectTarget } from '@/hooks/useCampaignRedirects';

const RedirectHandler: React.FC = () => {
  const location = useLocation();
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const path = location.pathname.replace(/^\//, ''); // Remove leading slash
  
  // Comprehensive list of known routes to skip redirect checks
  const knownRoutes = [
    '', // homepage
    'varaa-aika', 'booking', 'palvelut', 'savyt', 'blonde-specialistit', 
    'artikkelit', 'faq', 'ukk', 'yhteystiedot', 'blogi', 'kampaamot',
    'tiimi', 'hinnasto', 'tarina', 'kampanjat', 'savymaailma',
    'vaalennus', 'raidoitus', 'yllapito', 'ura', 'vastuullisuus',
    'uutiskirje', 'blondify-tarina', 'portfolio', 'meista'
  ];
  
  // Check if path starts with any known route patterns
  const isKnownRoute = () => {
    if (knownRoutes.includes(path)) return true;
    
    // Check for dynamic routes
    if (path.startsWith('admin/')) return true;
    if (path.startsWith('kampanja/')) return true;
    if (path.startsWith('palvelut/')) return true;
    if (path.startsWith('artikkelit/')) return true;
    if (path.startsWith('blonde-specialistit/')) return true;
    if (path.startsWith('tiimi/')) return true;
    
    return false;
  };
  
  useEffect(() => {
    // Skip redirect check for known routes entirely
    if (isKnownRoute()) {
      setLoading(false);
      return;
    }
    
    // Only check for redirects on unknown paths
    const checkForRedirect = async () => {
      try {
        const target = await getRedirectTarget(path);
        setTargetPath(target);
      } catch (error) {
        console.error('Error checking redirect:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkForRedirect();
  }, [path]);
  
  // Don't render anything for known routes
  if (isKnownRoute()) {
    return null;
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }
  
  if (targetPath) {
    return <Navigate to={`/${targetPath}`} replace />;
  }
  
  return null; // Let the 404 page handle non-matching paths
};

export default RedirectHandler;
