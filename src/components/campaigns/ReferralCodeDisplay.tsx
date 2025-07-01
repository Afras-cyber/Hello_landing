
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Tag, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useReferralCodes } from '@/hooks/useReferralCodes';

interface ReferralCodeDisplayProps {
  campaignId: string;
}

const ReferralCodeDisplay: React.FC<ReferralCodeDisplayProps> = ({ campaignId }) => {
  const { data: referralCodes, isLoading } = useReferralCodes(campaignId);
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Koodi kopioitu!",
      description: "Alennuskoodi kopioitu leikepöydälle",
    });
  };

  if (isLoading || !referralCodes || referralCodes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {referralCodes.map((code) => (
        <Card key={code.id} className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-blondify-blue" />
              Erikoiskoodi: {code.code}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Code Display */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-l-md text-center text-lg">
                  {code.code}
                </div>
                <Button 
                  variant="outline" 
                  className="rounded-r-md border-l-0 border-white"
                  onClick={() => copyCode(code.code)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* Code Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {code.discount_percentage}%
                  </div>
                  <div className="text-xs text-gray-400">Alennus</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {code.current_uses}
                  </div>
                  <div className="text-xs text-gray-400">Käytetty</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    {code.max_uses ? code.max_uses - code.current_uses : '∞'}
                  </div>
                  <div className="text-xs text-gray-400">Jäljellä</div>
                </div>
              </div>

              {/* Usage Bar */}
              {code.max_uses && (
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Käyttöaste</span>
                    <span>{Math.round((code.current_uses / code.max_uses) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blondify-blue to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((code.current_uses / code.max_uses) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Expiry Info */}
              {code.expires_at && (
                <div className="text-xs text-gray-400 text-center">
                  Voimassa: {new Date(code.expires_at).toLocaleDateString('fi-FI')} asti
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReferralCodeDisplay;
