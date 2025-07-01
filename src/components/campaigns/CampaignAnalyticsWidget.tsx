
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, TrendingUp, Clock } from 'lucide-react';
import { useAffiliateAnalytics } from '@/hooks/useAffiliateAnalytics';

interface CampaignAnalyticsWidgetProps {
  campaignId: string;
  showDetailed?: boolean;
}

const CampaignAnalyticsWidget: React.FC<CampaignAnalyticsWidgetProps> = ({
  campaignId,
  showDetailed = false
}) => {
  const { data: analytics, isLoading } = useAffiliateAnalytics(campaignId);

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics || analytics.length === 0) {
    return null;
  }

  const campaignData = analytics[0];

  const stats = [
    {
      title: 'Klikkaukset',
      value: campaignData.total_clicks.toLocaleString(),
      subtitle: `+${campaignData.clicks_last_24h} viimeisen 24h`,
      icon: Eye,
      color: 'text-blue-400'
    },
    {
      title: 'Uniikkivierailijat',
      value: campaignData.unique_visitors.toLocaleString(),
      icon: Users,
      color: 'text-green-400'
    },
    {
      title: 'Konversiot',
      value: campaignData.total_conversions.toLocaleString(),
      subtitle: `+${campaignData.conversions_last_24h} viimeisen 24h`,
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      title: 'Konversioprosentti',
      value: `${campaignData.conversion_rate}%`,
      icon: Clock,
      color: 'text-orange-400'
    }
  ];

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blondify-blue" />
          Reaaliaikaiset tilastot
        </CardTitle>
        <CardDescription className="text-gray-300">
          Kampanjan suorituskyky tänään
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.title} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 mb-2`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.title}</div>
                {stat.subtitle && (
                  <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
                )}
              </div>
            );
          })}
        </div>

        {showDetailed && campaignData.total_revenue > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                €{campaignData.total_revenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Kokonaistulot</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignAnalyticsWidget;
