
import React, { useCallback, useMemo, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-theme.css';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Eye, Edit3, Upload, Image as ImageIcon } from 'lucide-react';
import EmojiPickerComponent from './EmojiPicker';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Custom image handler for Quill
const ImageBlot = Quill.import('formats/image');
class CustomImageBlot extends ImageBlot {
  static create(value: any) {
    const node = super.create();
    node.setAttribute('src', value.src || value);
    node.setAttribute('alt', value.alt || '');
    node.setAttribute('style', 'max-width: 100%; height: auto; margin: 1rem 0;');
    node.className = 'ql-editor-image';
    return node;
  }
}
Quill.register(CustomImageBlot);

interface RichTextEditorWithImagesProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditorWithImages: React.FC<RichTextEditorWithImagesProps> = ({
  value,
  onChange,
  placeholder = "Kirjoita sisältö tähän...",
  className = ""
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [isUploadingImage, setIsUploadingImage] = React.useState(false);
  const quillRef = useRef<ReactQuill>(null);
  const { toast } = useToast();

  const uploadImageToStorage = async (file: File): Promise<string> => {
    console.log('🖼️ Starting content image upload:', file.name);
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Kuva on liian suuri. Maksimikoko on 5MB.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Valitse kelvollinen kuvatiedosto.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `content_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `article_content/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Kuvan lataus epäonnistui: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        setIsUploadingImage(true);
        const imageUrl = await uploadImageToStorage(file);
        
        // Insert image into editor
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          const index = range ? range.index : quill.getLength();
          
          quill.insertEmbed(index, 'image', {
            src: imageUrl,
            alt: file.name
          });
          
          quill.setSelection({ index: index + 1, length: 0 });
          quill.focus();
        }
        
        toast({
          title: 'Kuva lisätty',
          description: 'Kuva lisättiin onnistuneesti sisältöön.',
        });
      } catch (error) {
        toast({
          title: 'Virhe',
          description: error instanceof Error ? error.message : 'Kuvan lataus epäonnistui',
          variant: 'destructive'
        });
      } finally {
        setIsUploadingImage(false);
      }
    };
    
    input.click();
  }, [toast]);

  // Custom toolbar configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['image-upload'], // Custom image upload button
        [{ 'align': [] }],
        ['clean']
      ],
      handlers: {
        'image-upload': handleImageUpload
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [handleImageUpload]);

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'blockquote', 'code-block',
    'link', 'image', 'align'
  ];

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const index = range ? range.index : quill.getLength();
      
      quill.insertText(index, emoji);
      quill.setSelection({ index: index + emoji.length, length: 0 });
      quill.focus();
    }
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const editorClass = `
    ${className} 
    ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 p-4' : ''}
    ${showPreview ? 'grid grid-cols-2 gap-4' : ''}
  `;

  // Add custom toolbar button styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .ql-image-upload:after {
        content: '📷';
        font-size: 14px;
      }
      .ql-image-upload {
        width: 28px !important;
        height: 24px !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className={editorClass}>
      {/* Toolbar buttons */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={togglePreview}
            className="flex items-center gap-1"
          >
            {showPreview ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Muokkaa' : 'Esikatselu'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-1"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {isFullscreen ? 'Pienennä' : 'Täyskuva'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImageUpload}
            disabled={isUploadingImage}
            className="flex items-center gap-1"
          >
            {isUploadingImage ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            {isUploadingImage ? 'Ladataan...' : 'Lisää kuva'}
          </Button>

          <EmojiPickerComponent onEmojiSelect={handleEmojiSelect} />
        </div>
        
        {/* Character count */}
        <div className="text-sm text-gray-400">
          {value.replace(/<[^>]*>/g, '').length} merkkiä
        </div>
      </div>

      <div className={showPreview ? 'contents' : ''}>
        {/* Editor */}
        <div className={showPreview ? '' : 'w-full'}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={value}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            style={{
              height: isFullscreen ? 'calc(100vh - 200px)' : '400px',
              backgroundColor: '#374151',
              color: 'white'
            }}
            className="bg-gray-700 text-white [&_.ql-editor]:text-white [&_.ql-toolbar]:bg-gray-600 [&_.ql-toolbar]:border-gray-500 [&_.ql-container]:border-gray-500"
          />
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="border border-gray-600 rounded-lg p-4 bg-gray-800 overflow-y-auto" style={{
            height: isFullscreen ? 'calc(100vh - 200px)' : '400px'
          }}>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Esikatselu</h3>
            <div 
              className="prose prose-invert max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4"
              dangerouslySetInnerHTML={{ __html: value }}
            />
          </div>
        )}
      </div>

      {/* Fullscreen overlay backdrop */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
};

export default RichTextEditorWithImages;
