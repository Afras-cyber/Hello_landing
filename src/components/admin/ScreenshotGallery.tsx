
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Download, Clock } from 'lucide-react';

interface ScreenshotGalleryProps {
  sessionId?: string;
}

const ScreenshotGallery: React.FC<ScreenshotGalleryProps> = ({ sessionId }) => {
  const { data: screenshots, isLoading } = useQuery({
    queryKey: ['session-screenshots', sessionId],
    queryFn: async () => {
      let query = supabase
        .from('session_recordings')
        .select('*')
        .eq('recording_type', 'conversion_screenshot')
        .order('created_at', { ascending: false });
      
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const getScreenshotUrl = (filePath: string) => {
    // For now, we'll show a placeholder since we don't have actual storage setup
    return `https://via.placeholder.com/300x200?text=Screenshot`;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Ladataan kuvakaappauksia...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Tallennetut Screenshotit
          <Badge variant="outline">{screenshots?.length || 0} kuvaa</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {screenshots && screenshots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screenshots.map((screenshot) => (
              <div key={screenshot.id} className="border rounded-lg p-3 space-y-3">
                <div className="aspect-video bg-gray-100 rounded overflow-hidden">
                  <img 
                    src={getScreenshotUrl(screenshot.file_path)} 
                    alt="Screenshot"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Session: {screenshot.session_id.substring(0, 8)}...
                    </span>
                    <Badge 
                      variant={screenshot.ocr_confidence > 0.7 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {((screenshot.ocr_confidence || 0) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(screenshot.created_at).toLocaleString('fi-FI')}
                  </div>
                  
                  {screenshot.metadata && typeof screenshot.metadata === 'object' && (
                    <div className="text-xs space-y-1">
                      {(screenshot.metadata as any).conversion_detected && (
                        <div className="text-green-600 font-medium">✅ Konversio havaittu</div>
                      )}
                      {(screenshot.metadata as any).extracted_services && (
                        <div className="text-blue-600">
                          Palvelut: {(screenshot.metadata as any).extracted_services.slice(0, 2).join(', ')}
                        </div>
                      )}
                      {(screenshot.metadata as any).total_amount && (
                        <div className="text-green-600 font-medium">
                          Summa: {(screenshot.metadata as any).total_amount}€
                        </div>
                      )}
                      {(screenshot.metadata as any).appointment_date && (
                        <div className="text-purple-600">
                          Aika: {(screenshot.metadata as any).appointment_date}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {screenshot.ocr_text && (
                    <div className="text-xs text-gray-600 max-h-20 overflow-y-auto">
                      <div className="font-medium mb-1">OCR Text:</div>
                      <div className="bg-gray-50 p-2 rounded text-xs">
                        {screenshot.ocr_text.substring(0, 200)}...
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button 
                      className="flex-1 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
                      onClick={() => window.open(getScreenshotUrl(screenshot.file_path), '_blank')}
                    >
                      <Eye className="h-3 w-3 inline mr-1" />
                      Näytä
                    </button>
                    <button 
                      className="flex-1 bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = getScreenshotUrl(screenshot.file_path);
                        link.download = `screenshot_${screenshot.session_id}_${new Date(screenshot.created_at).getTime()}.jpg`;
                        link.click();
                      }}
                    >
                      <Download className="h-3 w-3 inline mr-1" />
                      Lataa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            Ei tallennettuja kuvakaappauksia
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScreenshotGallery;
