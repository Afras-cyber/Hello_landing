
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, FileText, Eye, Settings } from 'lucide-react';

interface AdminPagesOverviewProps {
  totalPages: number;
  activePages: number;
  totalSections: number;
}

const AdminPagesOverview: React.FC<AdminPagesOverviewProps> = ({
  totalPages,
  activePages,
  totalSections
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-blue-200 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Muokattavat sivut
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalPages}</div>
          <p className="text-blue-300 text-sm">
            {activePages} aktiivista, {totalPages - activePages} piilotettu
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-green-200 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Tekstialueet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalSections}</div>
          <p className="text-green-300 text-sm">
            yhteensä muokattavissa
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-700/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-purple-200 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Ohjeet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-purple-200 space-y-1">
            <p>• Klikkaa "Muokkaa sisältöä"</p>
            <p>• Muokkaa tekstialueita</p>
            <p>• Tallenna muutokset</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPagesOverview;
