
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Terminal, AlertCircle, CheckCircle, Code, Folder, GitBranch } from 'lucide-react';

const DevSetupGuide = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Kehitysympäristön Setup</h1>
        <p className="text-gray-600">Ohjeet projektin paikalliseen ajamiseen ja yleisten ongelmien ratkaisemiseen</p>
      </div>

      {/* Prerequisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Edellytykset
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Node.js</Badge>
              <span className="text-sm">v18+ suositeltu</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">npm</Badge>
              <span className="text-sm">tai yarn/pnpm</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Git</Badge>
              <span className="text-sm">versionhallinta</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Asennusohjeet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">1</div>
              <div>
                <h3 className="font-medium">Kloonaa repositorio</h3>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                  git clone [repository-url]<br />
                  cd blondify
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">2</div>
              <div>
                <h3 className="font-medium">Asenna riippuvuudet</h3>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                  npm install
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">3</div>
              <div>
                <h3 className="font-medium">Ympäristömuuttujat</h3>
                <p className="text-sm text-gray-600 mt-1">Kopioi .env.example → .env ja täytä tarvittavat arvot</p>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                  cp .env.example .env
                </code>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">4</div>
              <div>
                <h3 className="font-medium">Käynnistä dev-palvelin</h3>
                <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                  npm run dev
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Yleiset ongelmat ja ratkaisut
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error: Cannot find module 'D:\vite\bin\vite.js'</strong><br />
              <span className="text-sm">
                Tämä virhe johtuu yleensä väärästä polusta tai puuttuvista riippuvuuksista.
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Ratkaisu 1: Tyhjennä node_modules</h4>
              <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                rm -rf node_modules package-lock.json<br />
                npm install<br />
                npm run dev
              </code>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Ratkaisu 2: Tarkista Node.js versio</h4>
              <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                node --version<br />
                npm --version
              </code>
              <p className="text-sm text-gray-600 mt-1">Varmista että Node.js on v18 tai uudempi</p>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Ratkaisu 3: Käytä npx</h4>
              <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                npx vite
              </code>
            </div>

            <div className="border-l-4 border-yellow-400 pl-4">
              <h4 className="font-medium">Ratkaisu 4: Windows polku-ongelmat</h4>
              <p className="text-sm text-gray-600">Jos käytät Windowsia ja polut sisältävät välilyöntejä:</p>
              <code className="block mt-1 p-2 bg-gray-100 rounded text-sm">
                # Siirrä projekti polulle ilman välilyöntejä<br />
                # Esim: C:\projects\blondify
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Projektin rakenne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm space-y-1">
            <div>📁 src/</div>
            <div className="ml-4">📁 components/ <span className="text-gray-500">- React komponentit</span></div>
            <div className="ml-4">📁 pages/ <span className="text-gray-500">- Sivut</span></div>
            <div className="ml-4">📁 hooks/ <span className="text-gray-500">- Custom React hooks</span></div>
            <div className="ml-4">📁 utils/ <span className="text-gray-500">- Apufunktiot</span></div>
            <div className="ml-4">📁 integrations/ <span className="text-gray-500">- Supabase yms.</span></div>
            <div>📁 public/ <span className="text-gray-500">- Staattiset tiedostot</span></div>
            <div>📁 supabase/ <span className="text-gray-500">- Tietokanta migraatiot</span></div>
          </div>
        </CardContent>
      </Card>

      {/* Useful Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Hyödylliset komennot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Kehitys</h4>
              <div className="space-y-1 text-sm">
                <code className="block p-2 bg-gray-100 rounded">npm run dev</code>
                <code className="block p-2 bg-gray-100 rounded">npm run build</code>
                <code className="block p-2 bg-gray-100 rounded">npm run preview</code>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Supabase</h4>
              <div className="space-y-1 text-sm">
                <code className="block p-2 bg-gray-100 rounded">supabase start</code>
                <code className="block p-2 bg-gray-100 rounded">supabase db reset</code>
                <code className="block p-2 bg-gray-100 rounded">supabase status</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevSetupGuide;
