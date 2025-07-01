
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Log the 404 error for debugging
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Special handling for direct navigation to admin routes
    if (location.pathname.startsWith('/admin')) {
      console.log("Admin route detected in NotFound component, redirecting to admin dashboard");
      
      // Prevent potential infinite loops
      if (!location.pathname.includes('not-found')) {
        // Check if this is a deeper admin path
        const adminPath = location.pathname.split('/').slice(2).join('/');
        if (adminPath) {
          navigate(`/admin/${adminPath}`);
        } else {
          // Default to admin dashboard
          navigate('/admin');
        }
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white navbar-offset py-12 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-blondify-blue">404</h1>
        <p className="text-2xl md:text-3xl font-semibold mb-4">Sivua ei löydy</p>
        <p className="text-gray-400 mb-8">
          Hakemaasi sivua ei valitettavasti löydy. Se on voitu poistaa, siirtää tai osoite on kirjoitettu väärin.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline" 
            className="w-full border-blondify-blue text-blondify-blue hover:bg-blondify-blue hover:text-white transition-colors"
          >
            Takaisin edelliselle sivulle
          </Button>
          
          <Link to="/" className="block">
            <Button 
              variant="default" 
              className="w-full bg-blondify-blue hover:bg-blue-700 text-white"
            >
              Siirry etusivulle
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
