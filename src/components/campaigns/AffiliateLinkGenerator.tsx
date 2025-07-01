
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, QrCode, ExternalLink, Instagram, Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateAffiliateLink, generateQRCode } from '@/utils/affiliateLinks';

const TikTok = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface AffiliateLinkGeneratorProps {
  campaignSlug: string;
  influencerName: string;
}

const AffiliateLinkGenerator: React.FC<AffiliateLinkGeneratorProps> = ({
  campaignSlug,
  influencerName
}) => {
  const [selectedSource, setSelectedSource] = useState<'instagram' | 'tiktok' | 'youtube' | 'website'>('instagram');
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const sources = [
    { value: 'instagram' as const, label: 'Instagram', icon: Instagram },
    { value: 'tiktok' as const, label: 'TikTok', icon: TikTok },
    { value: 'youtube' as const, label: 'YouTube', icon: Youtube },
    { value: 'website' as const, label: 'Website', icon: ExternalLink },
  ];

  const affiliateLink = generateAffiliateLink(campaignSlug, influencerName, selectedSource);
  const qrCodeUrl = generateQRCode(affiliateLink.url);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Kopioitu!",
      description: "Linkki kopioitu leikepöydälle",
    });
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Luo affiliate-linkki</CardTitle>
        <CardDescription className="text-gray-300">
          Generoi seurantalinkki eri sosiaalisen median alustoille
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Source Selection */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-3 block">
            Valitse lähde:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sources.map((source) => {
              const Icon = source.icon;
              return (
                <button
                  key={source.value}
                  onClick={() => setSelectedSource(source.value)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    selectedSource === source.value
                      ? 'border-blondify-blue bg-blue-900/20 text-blondify-blue'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{source.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generated Link */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Generoitu linkki:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={affiliateLink.url}
              readOnly
              className="flex-1 bg-gray-800 border border-gray-600 text-white p-2 rounded text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(affiliateLink.url)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* UTM Parameters */}
        <div className="bg-gray-800 p-3 rounded-lg">
          <h4 className="text-sm font-medium text-gray-300 mb-2">UTM-parametrit:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-400">Source:</span>
              <span className="text-white ml-1">{affiliateLink.utmParams.source}</span>
            </div>
            <div>
              <span className="text-gray-400">Medium:</span>
              <span className="text-white ml-1">{affiliateLink.utmParams.medium}</span>
            </div>
            <div>
              <span className="text-gray-400">Campaign:</span>
              <span className="text-white ml-1">{affiliateLink.utmParams.campaign}</span>
            </div>
            <div>
              <span className="text-gray-400">Content:</span>
              <span className="text-white ml-1">{affiliateLink.utmParams.content}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowQR(!showQR)}
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <QrCode className="w-4 h-4 mr-2" />
            {showQR ? 'Piilota QR' : 'Näytä QR-koodi'}
          </Button>
          
          <Button
            onClick={() => window.open(affiliateLink.url, '_blank')}
            className="bg-blondify-blue hover:bg-blue-600"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Testaa linkki
          </Button>
        </div>

        {showQR && (
          <div className="text-center">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="mx-auto border border-gray-600 rounded"
            />
            <p className="text-xs text-gray-400 mt-2">
              Skannaa QR-koodi mobiililaitteella
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AffiliateLinkGenerator;
