
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, ExternalLink, Target, DollarSign, Users, MousePointer } from 'lucide-react';

interface CampaignData {
  source: string;
  medium: string;
  campaign: string;
  total_sessions: number;
  confirmed_bookings: number;
  estimated_bookings: number;
  conversion_rate: number;
  date: string;
}

interface DailyStats {
  date: string;
  total_sessions: number;
  confirmed_bookings: number;
  estimated_bookings: number;
  google_ads_sessions: number;
  meta_sessions: number;
  tiktok_sessions: number;
  direct_sessions: number;
  organic_sessions: number;
}

const CampaignTrackingAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7'); // days

  const { data: campaignData, isLoading: campaignLoading } = useQuery({
    queryKey: ['campaign-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_analytics_view')
        .select('*')
        .gte('date', new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString())
        .limit(50);
      
      if (error) throw error;
      return data as CampaignData[];
    }
  });

  const { data: dailyStats } = useQuery({
    queryKey: ['daily-analytics', selectedPeriod],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_analytics_summary')
        .select('*')
        .gte('date', new Date(Date.now() - parseInt(selectedPeriod) * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false })
        .limit(30);
      
      if (error) throw error;
      return data as DailyStats[];
    }
  });

  // Calculate totals and channel performance
  const channelStats = React.useMemo(() => {
    if (!dailyStats) return null;
    
    const totals = dailyStats.reduce((acc, day) => ({
      total_sessions: acc.total_sessions + day.total_sessions,
      confirmed_bookings: acc.confirmed_bookings + day.confirmed_bookings,
      google_ads: acc.google_ads + day.google_ads_sessions,
      meta: acc.meta + day.meta_sessions,
      tiktok: acc.tiktok + day.tiktok_sessions,
      direct: acc.direct + day.direct_sessions,
      organic: acc.organic + day.organic_sessions,
    }), {
      total_sessions: 0,
      confirmed_bookings: 0,
      google_ads: 0,
      meta: 0,
      tiktok: 0,
      direct: 0,
      organic: 0,
    });

    const conversionRate = totals.total_sessions > 0 
      ? ((totals.confirmed_bookings / totals.total_sessions) * 100).toFixed(2)
      : '0.00';

    return {
      ...totals,
      conversionRate: parseFloat(conversionRate)
    };
  }, [dailyStats]);

  const getChannelColor = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('google')) return 'bg-blue-600';
    if (lowerSource.includes('meta') || lowerSource.includes('facebook')) return 'bg-blue-700';
    if (lowerSource.includes('tiktok')) return 'bg-pink-600';
    if (lowerSource.includes('organic') || lowerSource === 'organic') return 'bg-green-600';
    if (lowerSource.includes('direct')) return 'bg-gray-600';
    return 'bg-purple-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Kampanjaseuranta</h2>
          <p className="text-gray-400">Seuraa mistä varauksesi tulevat ja mitkä kanavat toimivat parhaiten</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border rounded px-3 py-2 bg-gray-800 text-white border-gray-600"
          >
            <option value="1">Tänään</option>
            <option value="7">Viimeinen viikko</option>
            <option value="30">Viimeinen kuukausi</option>
            <option value="90">Viimeiset 3 kuukautta</option>
          </select>
          
          <a 
            href="https://analytics.google.com/analytics/web/#/p485301747/reports/intelligenthome"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Google Analytics
          </a>
        </div>
      </div>

      {/* Channel Performance Overview */}
      {channelStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Yhteensä istuntoja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{channelStats.total_sessions}</div>
              <p className="text-xs text-gray-400">Kaikki kanavat</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                Vahvistetut varaukset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{channelStats.confirmed_bookings}</div>
              <p className="text-xs text-gray-400">{channelStats.conversionRate}% konversio</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-purple-500" />
                Paras kanava
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-white">
                {channelStats.google_ads > channelStats.meta && channelStats.google_ads > channelStats.tiktok ? 'Google Ads' :
                 channelStats.meta > channelStats.tiktok ? 'Meta Ads' : 'TikTok Ads'}
              </div>
              <p className="text-xs text-gray-400">Eniten istuntoja</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                Arvioitu arvo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {(channelStats.confirmed_bookings * 200).toLocaleString()}€
              </div>
              <p className="text-xs text-gray-400">~200€ per varaus</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Kanavittainen liikenne</CardTitle>
          </CardHeader>
          <CardContent>
            {channelStats && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-600/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-white font-medium">Google Ads</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{channelStats.google_ads}</div>
                    <div className="text-xs text-gray-400">istuntoa</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-700/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-700 rounded-full"></div>
                    <span className="text-white font-medium">Meta/Facebook</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{channelStats.meta}</div>
                    <div className="text-xs text-gray-400">istuntoa</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-pink-600/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                    <span className="text-white font-medium">TikTok Ads</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{channelStats.tiktok}</div>
                    <div className="text-xs text-gray-400">istuntoa</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-600/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-white font-medium">Organic</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{channelStats.organic}</div>
                    <div className="text-xs text-gray-400">istuntoa</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-600/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                    <span className="text-white font-medium">Suora liikenne</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{channelStats.direct}</div>
                    <div className="text-xs text-gray-400">istuntoa</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Parhaat kampanjat</CardTitle>
          </CardHeader>
          <CardContent>
            {campaignLoading ? (
              <div className="text-gray-400">Ladataan kampanjatietoja...</div>
            ) : campaignData && campaignData.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {campaignData
                  .filter(campaign => campaign.total_sessions > 0)
                  .sort((a, b) => b.conversion_rate - a.conversion_rate)
                  .slice(0, 10)
                  .map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={getChannelColor(campaign.source)}>
                          {campaign.source}
                        </Badge>
                        <div>
                          <div className="text-white font-medium text-sm">
                            {campaign.campaign !== 'none' ? campaign.campaign : campaign.source}
                          </div>
                          <div className="text-xs text-gray-400">
                            {campaign.medium} • {campaign.total_sessions} istuntoa
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-bold">
                          {campaign.conversion_rate}%
                        </div>
                        <div className="text-xs text-green-400">
                          {campaign.confirmed_bookings} varausta
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">
                Ei kampanjatietoja valitulta ajanjaksolta
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Päivittäinen kehitys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyStats && dailyStats.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 text-gray-300">Päivä</th>
                    <th className="text-center py-2 text-gray-300">Istunnot</th>
                    <th className="text-center py-2 text-gray-300">Varaukset</th>
                    <th className="text-center py-2 text-gray-300">Konversio%</th>
                    <th className="text-center py-2 text-gray-300">Google</th>
                    <th className="text-center py-2 text-gray-300">Meta</th>
                    <th className="text-center py-2 text-gray-300">TikTok</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyStats.slice(0, 14).map((day) => {
                    const conversionRate = day.total_sessions > 0 
                      ? ((day.confirmed_bookings / day.total_sessions) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <tr key={day.date} className="border-b border-gray-800">
                        <td className="py-2 text-gray-300">
                          {new Date(day.date).toLocaleDateString('fi-FI')}
                        </td>
                        <td className="py-2 text-center text-white font-medium">
                          {day.total_sessions}
                        </td>
                        <td className="py-2 text-center">
                          <Badge variant={day.confirmed_bookings > 0 ? "default" : "secondary"}>
                            {day.confirmed_bookings}
                          </Badge>
                        </td>
                        <td className="py-2 text-center text-green-400 font-medium">
                          {conversionRate}%
                        </td>
                        <td className="py-2 text-center text-blue-400">
                          {day.google_ads_sessions}
                        </td>
                        <td className="py-2 text-center text-blue-300">
                          {day.meta_sessions}
                        </td>
                        <td className="py-2 text-center text-pink-400">
                          {day.tiktok_sessions}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-400 text-center py-8">
              Ei päivittäistä dataa saatavilla
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignTrackingAnalytics;
