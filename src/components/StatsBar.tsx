import React from 'react';
import { Check, Star, Award, Users, Heart, Sparkles, Calendar } from 'lucide-react';

interface StatsBarProps {
  content?: {
    stats?: Array<{
      value: string;
      label: string;
      icon: string;
    }>;
  };
}

const StatsBar: React.FC<StatsBarProps> = ({ content }) => {
  // Always use these hardcoded stats, ignore database content
  const stats = [
    { value: "100%", label: "Tyytyväisyystakuu", icon: "check" },
    { value: "3200x", label: "Tyytyväistä blondia", icon: "users" },
    { value: "+25 000", label: "Yhteisön jäsentä", icon: "heart" },
    { value: "Blondien", label: "erikoispalvelut", icon: "sparkles" },
    { value: "Ilmainen", label: "Konsultaatio", icon: "calendar" },
    { value: "4,87", label: "Palaute", icon: "star" }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'star': return <Star className="h-5 w-5 text-blondify-blue" />;
      case 'check': return <Check className="h-5 w-5 text-blondify-blue" />;
      case 'users': return <Users className="h-5 w-5 text-blondify-blue" />;
      case 'heart': return <Heart className="h-5 w-5 text-blondify-blue" />;
      case 'sparkles': return <Sparkles className="h-5 w-5 text-blondify-blue" />;
      case 'calendar': return <Calendar className="h-5 w-5 text-blondify-blue" />;
      case 'award': return <Award className="h-5 w-5 text-blondify-blue" />;
      default: return <Star className="h-5 w-5 text-blondify-blue" />;
    }
  };

  return (
    <div className="w-full py-6 bg-black border-t border-gray-800 overflow-hidden"> 
      <div className="w-full px-3 md:px-6"> 
        <div className="stats-scroll-container relative w-full overflow-hidden">
          <div className="stats-scroll-content flex will-change-transform">
            {stats.map((stat, index) => (
              <StatItem
                key={index}
                icon={getIcon(stat.icon)}
                value={stat.value}
                label={stat.label}
              />
            ))}
            
            {/* Single duplicate set for seamless loop */}
            {stats.map((stat, index) => (
              <StatItem
                key={`duplicate-${index}`}
                icon={getIcon(stat.icon)}
                value={stat.value}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, label }) => {
  return (
    <div className="flex items-center gap-4 min-w-[200px] mr-12 text-center"> 
      <div className="flex-shrink-0 p-2 bg-opacity-10 bg-blue-500 rounded-full min-h-[48px] min-w-[48px] flex items-center justify-center"> 
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <span className="text-2xl font-bold text-white font-redhat leading-tight">{value}</span>
        <span className="text-sm text-gray-400 font-redhat-light">{label}</span>
      </div>
    </div>
  );
};

export default StatsBar;
