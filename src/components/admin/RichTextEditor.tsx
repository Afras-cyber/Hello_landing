
import React, { useCallback, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './quill-theme.css';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, Eye, Edit3 } from 'lucide-react';
import EmojiPickerComponent from './EmojiPicker';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Kirjoita sisältö tähän...",
  className = ""
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const quillRef = useRef<ReactQuill>(null);

  // Custom toolbar configuration with Finnish labels
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

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
      
      // Insert emoji at cursor position
      quill.insertText(index, emoji);
      
      // Move cursor after the emoji - fix the selection API call
      quill.setSelection({ index: index + emoji.length, length: 0 });
      
      // Focus back to editor
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
              className="prose prose-invert max-w-none"
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

export default RichTextEditor;
