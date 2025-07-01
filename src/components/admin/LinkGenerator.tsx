
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Copy, QrCode, Share2, Eye, EyeOff } from 'lucide-react';
import { generateUTMLink, generateQRCode, getAllLinksForCampaign } from '@/utils/utmGenerator';

interface LinkGeneratorProps {
  campaignSlug: string;
  influencerName: string;
}

const LinkGenerator: React.FC<LinkGeneratorProps> = ({
  campaignSlug,
  influencerName
}) => {
  const { toast } = useToast();
  const [linkType, setLinkType] = useState<'affiliate' | 'paid_social'>('affiliate');
  const [selectedChannel, setSelectedChannel] = useState<string>('instagram');
  const [showQRCodes, setShowQRCodes] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, any>>({});

  const channels = ['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin', 'twitter'];

  const generateSingleLink = () => {
    if (!campaignSlug || !influencerName) {
      toast({
        title: "Virhe",
        description: "Kampanjan tiedot puuttuvat",
        variant: "destructive"
      });
      return;
    }

    const baseUrl = `${window.location.origin}/kampanja/${campaignSlug}`;
    const utmParams = {
      utm_source: selectedChannel,
      utm_medium: linkType === 'affiliate' ? 'affiliate' : 'paid_social',
      utm_campaign: campaignSlug,
      utm_content: linkType === 'affiliate' ? 'commission' : 'paid_ad',
      utm_term: influencerName.toLowerCase().replace(/[^a-z0-9]/g, '')
    };

    const link = generateUTMLink(baseUrl, utmParams);
    const qrCode = generateQRCode(link);

    const linkData = {
      url: link,
      qrCode,
      utmParams,
      type: linkType,
      channel: selectedChannel
    };

    setGeneratedLinks({ [selectedChannel]: linkData });

    toast({
      title: "Linkki generoitu!",
      description: `${linkType === 'affiliate' ? 'Affiliate' : 'Maksetun markkinoinnin'} linkki luotu kanavalle ${selectedChannel}`
    });
  };

  const generateAllChannelLinks = () => {
    const allLinks: Record<string, any> = {};

    channels.forEach(channel => {
      const baseUrl = `${window.location.origin}/kampanja/${campaignSlug}`;
      const utmParams = {
        utm_source: channel,
        utm_medium: linkType === 'affiliate' ? 'affiliate' : 'paid_social',
        utm_campaign: campaignSlug,
        utm_content: linkType === 'affiliate' ? 'commission' : 'paid_ad',
        utm_term: influencerName.toLowerCase().replace(/[^a-z0-9]/g, '')
      };

      const link = generateUTMLink(baseUrl, utmParams);
      const qrCode = generateQRCode(link);

      allLinks[channel] = {
        url: link,
        qrCode,
        utmParams,
        type: linkType,
        channel
      };
    });

    setGeneratedLinks(allLinks);

    toast({
      title: "Kaikki linkit generoitu!",
      description: `${linkType === 'affiliate' ? 'Affiliate' : 'Maksetun markkinoinnin'} linkit luotu kaikille kanaville`
    });
  };

  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopioitu!",
      description: `${description} kopioitu leikepöydälle`
    });
  };

  const copyAllLinks = () => {
    const allLinksText = Object.entries(generatedLinks)
      .map(([channel, data]) => `${channel.toUpperCase()}: ${data.url}`)
      .join('\n');

    navigator.clipboard.writeText(allLinksText);
    toast({
      title: "Kaikki linkit kopioitu!",
      description: "Kaikki linkit kopioitu leikepöydälle"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Linkki-generaattori
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Link Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Linkin tyyppi</label>
          <Select value={linkType} onValueChange={(value: 'affiliate' | 'paid_social') => setLinkType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Valitse linkin tyyppi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="affiliate">
                Affiliate-linkki (provisioseurausta varten)
              </SelectItem>
              <SelectItem value="paid_social">
                Maksetun markkinoinnin linkki
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            {linkType === 'affiliate' 
              ? 'Käytä tätä kun somettaja markkinoi orgaanisesti ja saa provisiota'
              : 'Käytä tätä maksetussa mainonnassa (sponsoroidut postit, mainokset)'
            }
          </p>
        </div>

        {/* Channel Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Kanava</label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger>
              <SelectValue placeholder="Valitse kanava" />
            </SelectTrigger>
            <SelectContent>
              {channels.map(channel => (
                <SelectItem key={channel} value={channel} className="capitalize">
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={generateSingleLink} className="flex-1">
            Generoi linkki ({selectedChannel})
          </Button>
          <Button onClick={generateAllChannelLinks} variant="outline" className="flex-1">
            Generoi kaikille kanaville
          </Button>
        </div>

        {/* Generated Links Display */}
        {Object.keys(generatedLinks).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Generoidut linkit</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQRCodes(!showQRCodes)}
                >
                  {showQRCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showQRCodes ? 'Piilota' : 'Näytä'} QR-koodit
                </Button>
                <Button onClick={copyAllLinks} variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-1" />
                  Kopioi kaikki
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {Object.entries(generatedLinks).map(([channel, data]) => (
                <div key={channel} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {channel}
                      </Badge>
                      <Badge variant={data.type === 'affiliate' ? 'default' : 'secondary'}>
                        {data.type === 'affiliate' ? 'Affiliate' : 'Maksettu'}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(data.url, `${channel} linkki`)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Kopioi
                    </Button>
                  </div>

                  <div className="text-sm break-all bg-gray-100 p-2 rounded font-mono">
                    {data.url}
                  </div>

                  {showQRCodes && (
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <QrCode className="h-4 w-4 mx-auto mb-1" />
                        <img 
                          src={data.qrCode} 
                          alt={`QR koodi ${channel}`}
                          className="w-24 h-24 mx-auto border rounded"
                        />
                      </div>
                      <div className="flex-1 text-xs text-gray-600 space-y-1">
                        <p><strong>Source:</strong> {data.utmParams.utm_source}</p>
                        <p><strong>Medium:</strong> {data.utmParams.utm_medium}</p>
                        <p><strong>Campaign:</strong> {data.utmParams.utm_campaign}</p>
                        <p><strong>Content:</strong> {data.utmParams.utm_content}</p>
                        <p><strong>Term:</strong> {data.utmParams.utm_term}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LinkGenerator;
