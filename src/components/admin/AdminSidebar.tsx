
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  Scissors, 
  Palette, 
  FileText, 
  HelpCircle, 
  Settings, 
  FileImage,
  BarChart3,
  Megaphone,
  MailIcon,
  LogOut,
  Briefcase,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
      toast({
        title: 'Uloskirjautuminen onnistui',
        description: 'Olet kirjautunut ulos onnistuneesti.',
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Virhe',
        description: 'Uloskirjautumisessa tapahtui virhe.',
        variant: 'destructive',
      });
    }
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/services', icon: Scissors, label: 'Palvelut' },
    { path: '/admin/specialists', icon: Users, label: 'Asiantuntijat' },
    { path: '/admin/salons', icon: MapPin, label: 'Kampaamot' },
    { path: '/admin/shades', icon: Palette, label: 'Sävyt' },
    { path: '/admin/blog', icon: FileText, label: 'Blogi' },
    { path: '/admin/faq', icon: HelpCircle, label: 'UKK' },
    { path: '/admin/portfolio', icon: FileImage, label: 'Portfolio' },
    { path: '/admin/campaigns', icon: Megaphone, label: 'Kampanjat' },
    { path: '/admin/careers', icon: Briefcase, label: 'Työpaikat' },
    { path: '/admin/newsletter', icon: MailIcon, label: 'Uutiskirje' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/pages', icon: FileText, label: 'Sivut' },
    { path: '/admin/settings', icon: Settings, label: 'Asetukset' },
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen flex flex-col border-r border-gray-700">
      <div className="p-6">
        <h2 className="text-xl font-bold text-white">Blondify Admin</h2>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blondify-blue text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Kirjaudu ulos
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;
