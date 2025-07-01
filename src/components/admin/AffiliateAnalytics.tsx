
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAffiliateAnalytics, useAffiliateClicks } from '@/hooks/useAffiliateAnalytics';
import { useReferralCodes } from '@/hooks/useReferralCodes';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, MousePointer, DollarSign, Target, QrCode, Share2 } from 'lucide-react';
import { generateAffiliateLink, generateQRCode } from '@/utils/affiliateLinks';

interface AffiliateAnalyticsProps {
  campaignId?: string;
  campaignSlug?: string;
  influencerName?: string;
}

const AffiliateAnalytics: React.FC<AffiliateAnalyticsProps> = ({ 
  campaignId, 
  campaignSlug, 
  influencerName 
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  
  const { data: analytics, isLoading: analyticsLoading } = useAffiliateAnalytics(campaignId);
  const { data: clicks, isLoading: clicksLoading } = useAffiliateClicks(campaignId || '', timeRange);
  const { data: referralCodes } = useReferralCodes(campaignId);

  const currentAnalytics = analytics?.[0];

  const generateLinks = () => {
    if (!campaignSlug || !influencerName) return [];

    const sources = ['instagram', 'tiktok', 'youtube', 'website'] as const;
    return sources.map(source => {
      const link = generateAffiliateLink(campaignSlug, influencerName, source);
      return {
        source,
        ...link,
        qrCode: generateQRCode(link.url)
      };
    });
  };

  const affiliateLinks = generateLinks();

  // Process clicks data for charts
  const clicksData = clicks?.reduce((acc: any[], click) => {
    const date = new Date(click.clicked_at).toLocaleDateString('fi-FI');
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.clicks += 1;
    } else {
      acc.push({ date, clicks: 1 });
    }
    
    return acc;
  }, []) || [];

  if (analyticsLoading) {
    return <div className="flex items-center justify-center p-8">Ladataan analytiikkaa...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kokonaisklikkaukset</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics?.total_clicks || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{currentAnalytics?.clicks_last_24h || 0} viimeisen 24h aikana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uniikit kävijät</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics?.unique_visitors || 0}</div>
            <p className="text-xs text-muted-foreground">
              Keskimäärin {Math.round((currentAnalytics?.total_clicks || 0) / Math.max(currentAnalytics?.unique_visitors || 1, 1) * 100) / 100} klikkaus/kävijä
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konversioprosentti</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics?.conversion_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {currentAnalytics?.total_conversions || 0} konversiota yhteensä
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liikevaihto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentAnalytics?.total_revenue || 0}€</div>
            <p className="text-xs text-muted-foreground">
              Provisio ~{Math.round((currentAnalytics?.total_revenue || 0) * 0.1)}€ (10%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Yleiskatsaus</TabsTrigger>
          <TabsTrigger value="links">Affiliate-linkit</TabsTrigger>
          <TabsTrigger value="codes">Alennuskoodit</TabsTrigger>
          <TabsTrigger value="detailed">Yksityiskohtaiset tiedot</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <Select value={timeRange} onValueChange={(value: '24h' | '7d' | '30d') => setTimeRange(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Valitse aikaväli" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Viimeinen 24h</SelectItem>
                <SelectItem value="7d">Viimeinen viikko</SelectItem>
                <SelectItem value="30d">Viimeinen kuukausi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Klikkaukset ajanjaksolla</CardTitle>
              <CardDescription>
                Klikkaukset päivittäin valitulla aikavälillä
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={clicksData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Affiliate-linkit ja QR-koodit
              </CardTitle>
              <CardDescription>
                Käytä näitä linkkejä sosiaalisen median julkaisuissa seurantaa varten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {affiliateLinks.map((link) => (
                  <div key={link.source} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {link.source}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(link.url)}
                      >
                        Kopioi linkki
                      </Button>
                    </div>
                    
                    <div className="text-sm break-all bg-gray-100 p-2 rounded font-mono">
                      {link.url}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <QrCode className="h-4 w-4 mx-auto mb-1" />
                        <img 
                          src={link.qrCode} 
                          alt={`QR koodi ${link.source}`}
                          className="w-24 h-24 mx-auto border rounded"
                        />
                      </div>
                      <div className="flex-1 text-xs text-gray-600">
                        <p><strong>UTM Source:</strong> {link.utmParams.source}</p>
                        <p><strong>UTM Medium:</strong> {link.utmParams.medium}</p>
                        <p><strong>UTM Campaign:</strong> {link.utmParams.campaign}</p>
                        <p><strong>UTM Content:</strong> {link.utmParams.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alennuskoodit</CardTitle>
              <CardDescription>
                Kampanjaan liitetyt alennuskoodit ja niiden käyttö
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referralCodes && referralCodes.length > 0 ? (
                <div className="space-y-4">
                  {referralCodes.map((code) => (
                    <div key={code.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-mono font-bold text-lg">{code.code}</div>
                        <div className="text-sm text-gray-600">
                          {code.discount_percentage}% alennus • {code.influencer_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          Käytetty {code.current_uses}/{code.max_uses || '∞'} kertaa
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={code.is_active ? "default" : "secondary"}>
                          {code.is_active ? "Aktiivinen" : "Ei aktiivinen"}
                        </Badge>
                        {code.expires_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            Vanhenee: {new Date(code.expires_at).toLocaleDateString('fi-FI')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Ei alennuskoodeja vielä luotu tälle kampanjalle
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yksityiskohtaiset klikkaukset</CardTitle>
              <CardDescription>
                Kaikki kampanjan klikkaukset yksityiskohtaisilla tiedoilla
              </CardDescription>
            </CardHeader>
            <CardContent>
              {clicksLoading ? (
                <div className="text-center py-8">Ladataan klikkauksia...</div>
              ) : clicks && clicks.length > 0 ? (
                <div className="space-y-2">
                  {clicks.slice(0, 50).map((click: any) => (
                    <div key={click.id} className="flex items-center justify-between p-3 border rounded text-sm">
                      <div>
                        <div className="font-medium">
                          {click.utm_source && (
                            <Badge variant="outline" className="mr-2">
                              {click.utm_source}
                            </Badge>
                          )}
                          {new Date(click.clicked_at).toLocaleString('fi-FI')}
                        </div>
                        {click.referrer_url && (
                          <div className="text-gray-600 text-xs">
                            Lähde: {new URL(click.referrer_url).hostname}
                          </div>
                        )}
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{click.ip_address}</div>
                        <div>{click.device_type}</div>
                      </div>
                    </div>
                  ))}
                  {clicks.length > 50 && (
                    <div className="text-center text-gray-500 text-sm py-2">
                      Näytetään 50 viimeisintä klikkaa ({clicks.length} yhteensä)
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Ei klikkauksia valitulla aikavälillä
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateAnalytics;
