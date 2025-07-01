
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { checkIsAdmin } from '@/integrations/supabase/is_admin';
import { Loader2 } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Not logged in, redirect to login
          navigate('/admin/login', { 
            state: { from: location },
            replace: true 
          });
          return;
        }

        // Check if user is admin
        const isAdmin = await checkIsAdmin();
        
        if (!isAdmin) {
          // Not an admin, redirect to login
          navigate('/admin/login', { 
            state: { from: location },
            replace: true 
          });
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking admin auth:', error);
        navigate('/admin/login', { 
          state: { from: location },
          replace: true 
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blondify-blue" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
