
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Globe, Home } from 'lucide-react';

interface PageStatusIndicatorProps {
  isActive: boolean;
  isHomepage?: boolean;
  sectionsCount?: number;
}

const PageStatusIndicator: React.FC<PageStatusIndicatorProps> = ({
  isActive,
  isHomepage = false,
  sectionsCount = 0
}) => {
  return (
    <div className="flex items-center gap-2">
      {isHomepage ? (
        <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
          <Home className="w-3 h-3 mr-1" />
          Etusivu
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-300">
          <Globe className="w-3 h-3 mr-1" />
          Sivu
        </Badge>
      )}
      
      <Badge 
        variant="outline" 
        className={`${
          isActive 
            ? 'bg-green-500/10 border-green-500/30 text-green-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}
      >
        {isActive ? (
          <>
            <Eye className="w-3 h-3 mr-1" />
            Näkyvä
          </>
        ) : (
          <>
            <EyeOff className="w-3 h-3 mr-1" />
            Piilotettu
          </>
        )}
      </Badge>

      {sectionsCount > 0 && (
        <Badge variant="outline" className="bg-gray-500/10 border-gray-500/30 text-gray-300">
          {sectionsCount} tekstialuetta
        </Badge>
      )}
    </div>
  );
};

export default PageStatusIndicator;
