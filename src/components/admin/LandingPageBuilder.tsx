
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import RichTextEditorWithImages from './RichTextEditorWithImages';
import { nanoid } from 'nanoid';

interface Block {
  id: string;
  type: 'richtext';
  data: {
    html: string;
  };
}

interface LandingPageBuilderProps {
  value: Block[] | null | undefined;
  onChange: (value: Block[]) => void;
}

const LandingPageBuilder: React.FC<LandingPageBuilderProps> = ({ value, onChange }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (Array.isArray(value)) {
      setBlocks(value);
    } else {
      setBlocks([]);
    }
  }, [value]);

  const updateBlocks = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const addBlock = (type: 'richtext') => {
    const newBlock: Block = {
      id: nanoid(),
      type: 'richtext',
      data: { html: '' },
    };
    updateBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    updateBlocks(blocks.filter(block => block.id !== id));
  };

  const updateBlockData = (id: string, newData: any) => {
    updateBlocks(
      blocks.map(block => (block.id === id ? { ...block, data: newData } : block))
    );
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-700 p-4 bg-gray-900">
      <div className="space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="rounded-md border border-gray-600 p-4 relative bg-gray-800/50">
            <div className="absolute top-2 right-2">
              <Button variant="ghost" size="icon" onClick={() => removeBlock(block.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-900/20">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {block.type === 'richtext' && (
              <div>
                <label className="text-sm font-medium text-gray-400 mb-2 block">Tekstisisältö</label>
                <RichTextEditorWithImages
                  value={block.data.html}
                  onChange={(html) => updateBlockData(block.id, { html })}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>Ei sisältöä. Aloita lisäämällä ensimmäinen sisältöblokki.</p>
        </div>
      )}

      <div className="pt-4 border-t border-gray-700 mt-4">
        <Button onClick={() => addBlock('richtext')} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Lisää tekstikenttä
        </Button>
      </div>
    </div>
  );
};

export default LandingPageBuilder;
