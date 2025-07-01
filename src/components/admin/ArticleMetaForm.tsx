
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ArticleImageManager from './ArticleImageManager';

interface ArticleMetaFormProps {
  title: string;
  excerpt: string;
  date: string;
  imagePreview: string;
  onTitleChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  articleId?: string;
  onPrimaryImageChange?: (imageUrl: string) => void;
}

const ArticleMetaForm: React.FC<ArticleMetaFormProps> = ({
  title,
  excerpt,
  date,
  imagePreview,
  onTitleChange,
  onExcerptChange,
  onDateChange,
  onImageChange,
  articleId,
  onPrimaryImageChange
}) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white mb-4">Artikkelin tiedot</h2>
      
      {/* Title */}
      <div>
        <Label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
          Otsikko *
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
          placeholder="Anna artikkelille kuvaava otsikko"
          required
        />
        <div className={`text-xs mt-1 ${title.length > 100 ? 'text-red-400' : 'text-gray-400'}`}>
          {title.length}/100 merkkiä (suositus: 50-60 merkkiä)
        </div>
      </div>

      {/* Excerpt */}
      <div>
        <Label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
          Lyhyt kuvaus * (SEO)
        </Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => onExcerptChange(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
          placeholder="Kirjoita houkutteleva ja informatiivinen kuvaus artikkelista. Tämä näkyy hakukoneissa ja sosiaalisessa mediassa."
          required
        />
        <div className={`text-xs mt-1 ${excerpt.length > 160 ? 'text-red-400' : 'text-gray-400'}`}>
          {excerpt.length}/160 merkkiä (suositus: 120-160 merkkiä)
        </div>
      </div>

      {/* Date */}
      <div>
        <Label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-2">
          Julkaisupäivämäärä *
        </Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-gray-700 border-gray-600 text-white"
          required
        />
      </div>

      {/* Article Images Manager */}
      {articleId && (
        <ArticleImageManager 
          articleId={articleId}
          onPrimaryImageChange={onPrimaryImageChange}
        />
      )}

      {/* Legacy single image upload - show only for new articles or as fallback */}
      {!articleId && (
        <div>
          <Label className="block text-sm font-medium text-gray-300 mb-2">
            Kansikuva (vanhentunut - käytä yllä olevaa kuvahallintaa)
          </Label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 opacity-50">
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
              id="legacy-image"
            />
            <label htmlFor="legacy-image" className="cursor-pointer">
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">Tallenna artikkeli ensin käyttääksesi uutta kuvahallintaa</p>
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleMetaForm;
