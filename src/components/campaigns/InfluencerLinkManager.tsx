
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, ExternalLink, QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCampaignLinks, generateQRCode } from '@/utils/utmGenerator';

interface InfluencerLinkManagerProps {
  campaignSlug: string;
  influencerName: string;
  socialMediaUrls?: Record<string, any>;
}

const InfluencerLinkManager: React.FC<InfluencerLinkManagerProps> = ({
  campaignSlug,
  influencerName,
  socialMediaUrls = {}
}) => {
  const { toast } = useToast();
  const [showQRCodes, setShowQRCodes] = useState(false);

  const platforms = ['instagram', 'tiktok', 'youtube', 'twitter'];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopioitu!",
      description: `${type} kopioitu leikepöydälle`,
    });
  };

  const copyAllLinks = () => {
    const allLinks: string[] = [];
    
    platforms.forEach(platform => {
      const links = generateCampaignLinks(campaignSlug, influencerName, platform);
      const platformUrls = socialMediaUrls[platform];
      
      if (platformUrls) {
        allLinks.push(`\n=== ${platform.toUpperCase()} ===`);
        if (platformUrls.bio_link) allLinks.push(`Bio: ${platformUrls.bio_link}`);
        if (platformUrls.story_link) allLinks.push(`Story: ${platformUrls.story_link}`);
        if (platformUrls.post_link) allLinks.push(`Post: ${platformUrls.post_link}`);
      }
    });

    navigator.clipboard.writeText(allLinks.join('\n'));
    toast({
      title: "Kaikki linkit kopioitu!",
      description: "Kaikki kampanjalinkit kopioitu leikepöydälle",
    });
  };

  const downloadAsText = () => {
    const allLinks: string[] = [`Kampanja: ${campaignSlug}`, `Vaikuttaja: ${influencerName}`, ''];
    
    platforms.forEach(platform => {
      const platformUrls = socialMediaUrls[platform];
      
      if (platformUrls && (platformUrls.bio_link || platformUrls.story_link || platformUrls.post_link)) {
        allLinks.push(`=== ${platform.toUpperCase()} ===`);
        if (platformUrls.bio_link) allLinks.push(`Bio-linkki: ${platformUrls.bio_link}`);
        if (platformUrls.story_link) allLinks.push(`Story-linkki: ${platformUrls.story_link}`);
        if (platformUrls.post_link) allLinks.push(`Post-linkki: ${platformUrls.post_link}`);
        allLinks.push('');
      }
    });

    const blob = new Blob([allLinks.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${campaignSlug}-linkit.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span>Kampanjalinkkien hallinta</span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={copyAllLinks}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Copy className="w-4 h-4 mr-1" />
              Kopioi kaikki
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadAsText}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-1" />
              Lataa
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowQRCodes(!showQRCodes)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              <QrCode className="w-4 h-4 mr-1" />
              QR-koodit
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {platforms.map(platform => {
            const platformUrls = socialMediaUrls[platform];
            
            if (!platformUrls || (!platformUrls.bio_link && !platformUrls.story_link && !platformUrls.post_link)) {
              return null;
            }

            return (
              <div key={platform} className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-3 capitalize flex items-center gap-2">
                  {platform}
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </h3>
                
                <div className="space-y-3">
                  {platformUrls.bio_link && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Bio-linkki</label>
                      <div className="flex gap-2">
                        <Input 
                          value={platformUrls.bio_link}
                          readOnly
                          className="bg-gray-700 border-gray-600 text-white text-xs"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(platformUrls.bio_link, 'Bio-linkki')}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(platformUrls.bio_link, '_blank')}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      {showQRCodes && (
                        <div className="mt-2">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(platformUrls.bio_link)}`}
                            alt="Bio-linkin QR-koodi"
                            className="border border-gray-600 rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {platformUrls.story_link && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Story-linkki</label>
                      <div className="flex gap-2">
                        <Input 
                          value={platformUrls.story_link}
                          readOnly
                          className="bg-gray-700 border-gray-600 text-white text-xs"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(platformUrls.story_link, 'Story-linkki')}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(platformUrls.story_link, '_blank')}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      {showQRCodes && (
                        <div className="mt-2">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(platformUrls.story_link)}`}
                            alt="Story-linkin QR-koodi"
                            className="border border-gray-600 rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {platformUrls.post_link && (
                    <div className="space-y-2">
                      <label className="text-sm text-gray-300">Post-linkki</label>
                      <div className="flex gap-2">
                        <Input 
                          value={platformUrls.post_link}
                          readOnly
                          className="bg-gray-700 border-gray-600 text-white text-xs"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyToClipboard(platformUrls.post_link, 'Post-linkki')}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.open(platformUrls.post_link, '_blank')}
                          className="border-gray-600 text-white hover:bg-gray-700"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                      {showQRCodes && (
                        <div className="mt-2">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(platformUrls.post_link)}`}
                            alt="Post-linkin QR-koodi"
                            className="border border-gray-600 rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(socialMediaUrls).length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>Ei määritettyjä somekanavia.</p>
            <p className="text-sm">Lisää linkit kampanjan asetuksista.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InfluencerLinkManager;
