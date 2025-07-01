
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Target, TrendingUp, Eye, CheckCircle, AlertTriangle } from 'lucide-react';

const AnalyticsHelpGuide = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Analytiikan käyttöohje</h2>
        <p className="text-gray-400">
          Opas Blondifyn analytiikkajärjestelmän käyttöön ja Timma-konversioiden ymmärtämiseen
        </p>
      </div>

      {/* Timma Conversion Explanation */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Miten Timma-konversiot toimivat?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Varauksen tunnistaminen</h3>
            <p className="mb-3">
              Järjestelmä tunnistaa varaukset automaattisesti seuraamalla asiakkaan toimintaa Timma-varausjärjestelmässä:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>URL-seuranta:</strong> Kun asiakas siirtyy varaa.timma.fi sivulle</li>
              <li><strong>Iframe-interaktiot:</strong> Klikkaukset varausjärjestelmässä (yli 5 = korkea todennäköisyys)</li>
              <li><strong>Aika sivulla:</strong> Yli 2 minuuttia varaussivulla = kiinnostunut asiakas</li>
              <li><strong>Vahvistusviestit:</strong> Varausjärjestelmän lähettämät vahvistusviestit</li>
            </ul>
          </div>

          <div className="bg-yellow-900/20 p-4 rounded-lg border border-yellow-600/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold text-yellow-300">Tärkeää tietää</span>
            </div>
            <p className="text-yellow-200">
              Kaikki konversiot eivät ole oikeita varauksia. Asiakas voi esimerkiksi peruuttaa varauksen 
              tai selata vaihtoehtoja tekemättä lopullista varausta. Siksi validointi on tärkeää.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Levels */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Luottamustasot ja niiden merkitys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Luottamustasot</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg border border-green-600/30">
                  <div>
                    <Badge className="bg-green-600 mb-2">80-100%</Badge>
                    <p className="text-green-300 font-medium">Korkea luottamus</p>
                    <p className="text-sm text-gray-400">Todennäköisesti oikea varaus</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                  <div>
                    <Badge className="bg-yellow-600 mb-2">60-79%</Badge>
                    <p className="text-yellow-300 font-medium">Kohtalainen luottamus</p>
                    <p className="text-sm text-gray-400">Vaatii tarkistusta</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-900/20 rounded-lg border border-orange-600/30">
                  <div>
                    <Badge className="bg-orange-600 mb-2">40-59%</Badge>
                    <p className="text-orange-300 font-medium">Matala luottamus</p>
                    <p className="text-sm text-gray-400">Epätodennäköinen varaus</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-900/20 rounded-lg border border-red-600/30">
                  <div>
                    <Badge className="bg-red-600 mb-2">0-39%</Badge>
                    <p className="text-red-300 font-medium">Epävarma</p>
                    <p className="text-sm text-gray-400">Tuskin oikea varaus</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Luottamuksen laskenta</h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <h4 className="font-medium text-white">Aika sivulla:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>5+ minuuttia = +30 pistettä</li>
                    <li>2-5 minuuttia = +20 pistettä</li>
                    <li>1-2 minuuttia = +10 pistettä</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-white">Interaktiot:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>10+ klikkausta = +25 pistettä</li>
                    <li>5-10 klikkausta = +15 pistettä</li>
                    <li>2-5 klikkausta = +10 pistettä</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-white">Lomakkeiden täyttö:</h4>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>3+ lomaketta = +25 pistettä</li>
                    <li>1-3 lomaketta = +15 pistettä</li>
                    <li>Yhteensä max 100%</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Tracking */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-500" />
            Kanavien seuranta
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Mistä liikenne tunnistetaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-400 mb-2">Maksettu mainonta</h4>
                <ul className="text-sm space-y-1">
                  <li><span className="text-blue-300">Google Ads:</span> utm_source=google + utm_medium=cpc</li>
                  <li><span className="text-blue-300">Meta Ads:</span> utm_source=facebook tai meta</li>
                  <li><span className="text-pink-300">TikTok Ads:</span> utm_source=tiktok</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-green-400 mb-2">Orgaaninen liikenne</h4>
                <ul className="text-sm space-y-1">
                  <li><span className="text-green-300">Organic:</span> utm_medium=organic tai ei UTM-parametreja</li>
                  <li><span className="text-gray-300">Direct:</span> Suoraan osoiteriville kirjoitettu</li>
                  <li><span className="text-purple-300">Affiliate:</span> Kumppanilinkkien kautta</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-5 w-5 text-blue-500" />
              <span className="font-semibold text-blue-300">UTM-parametrit</span>
            </div>
            <p className="text-blue-200 text-sm">
              UTM-parametrit ovat linkkien lopussa olevia koodinosia (esim. ?utm_source=google&utm_medium=cpc), 
              jotka kertovat mistä asiakas on tullut. Ne asetetaan mainoskampanjoissa automaattisesti.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Parhaat käytännöt
          </CardTitle>
        </CardHeader>
        <CardContent className="text-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Päivittäinen seuranta</h3>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Tarkista reaaliaikainen näkymä uusista varauksista</li>
                <li>Validoi korkean luottamuksen konversiot</li>
                <li>Seuraa parhaiten toimivia kampanjoita</li>
                <li>Vertaile kanavien suorituskykyä</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Validoinnin vinkit</h3>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li>Yli 80% luottamus = todennäköisesti oikea</li>
                <li>Vahvistettu booking_confirmation = varmasti oikea</li>
                <li>Alle 60% luottamus = tarkista tarkkaan</li>
                <li>Lisää muistiinpanoja epäselvistä tapauksista</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-green-900/20 rounded-lg border border-green-600/30">
            <h4 className="font-semibold text-green-300 mb-2">Tuki ja yhteystiedot</h4>
            <p className="text-green-200 text-sm">
              Jos kohtaat ongelmia tai tarvitset apua analytiikan kanssa, ota yhteyttä tekniseen tukeen. 
              Dokumentaatio päivittyy järjestelmän kehittyessä.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsHelpGuide;
