
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, MapPin, Sparkles } from 'lucide-react';
import { useAffiliateClicks } from '@/hooks/useAffiliateAnalytics';

interface SocialProofWidgetProps {
  campaignId: string;
}

const SocialProofWidget: React.FC<SocialProofWidgetProps> = ({ campaignId }) => {
  const { data: recentClicks, isLoading } = useAffiliateClicks(campaignId, '24h');

  if (isLoading || !recentClicks || recentClicks.length === 0) {
    return null;
  }

  // Get unique recent activities (limit to last 5)
  const recentActivities = recentClicks
    .slice(0, 5)
    .map((click, index) => {
      const timeAgo = new Date(click.clicked_at).toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return {
        id: click.id,
        message: `Joku klikkasi linkkiä ${click.utm_source || 'sivustolta'}`,
        timeAgo,
        source: click.utm_source || 'website',
        city: click.city || 'Suomi'
      };
    });

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blondify-blue" />
          Viimeaikaista aktiviteettia
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div 
              key={activity.id}
              className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
            >
              <div className="w-8 h-8 bg-blondify-blue rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{activity.message}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{activity.city}</span>
                  <span>•</span>
                  <span>{activity.timeAgo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recentClicks.length > 5 && (
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              +{recentClicks.length - 5} muuta aktiviteettia viimeisen 24h aikana
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialProofWidget;
