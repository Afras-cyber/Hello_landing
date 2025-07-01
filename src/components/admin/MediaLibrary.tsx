
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUnifiedPortfolio, useAddUnifiedPortfolioImage, useDeleteUnifiedPortfolioImage } from '@/hooks/useUnifiedPortfolio';
import { Upload, Trash2, Star, Search, Filter, Grid, List, Move, Eye } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface MediaLibraryProps {
  onImageSelect?: (imageUrl: string) => void;
  selectedCategory?: string;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ onImageSelect, selectedCategory }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>(selectedCategory || 'all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const { data: images = [], isLoading } = useUnifiedPortfolio();
  const addImageMutation = useAddUnifiedPortfolioImage();
  const deleteImageMutation = useDeleteUnifiedPortfolioImage();

  // Get unique categories
  const categories = [...new Set(images.map(img => img.category).filter(Boolean))];

  // Filter images based on search and category
  const filteredImages = images.filter(img => {
    const matchesSearch = img.alt_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         img.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || img.category === filterCategory || 
                           (filterCategory === 'uncategorized' && !img.category);
    return matchesSearch && matchesCategory;
  });

  const handleBulkUpload = async () => {
    if (uploadFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add to unified portfolio with default values
        await addImageMutation.mutateAsync({
          image_url: URL.createObjectURL(file), // Temporary - should be replaced with actual upload
          source_type: 'portfolio',
          alt_text: file.name.split('.')[0],
          category: filterCategory !== 'all' ? filterCategory : undefined,
          display_order: 0,
          is_featured: false
        });
      }
      setUploadFiles([]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Haluatko varmasti poistaa ${selectedImages.length} kuvaa?`)) {
      selectedImages.forEach(imageId => {
        deleteImageMutation.mutate(imageId);
      });
      setSelectedImages([]);
      setBulkEditMode(false);
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Media Library</h2>
          <p className="text-gray-400">Hallitse kaikkia sivuston kuvia keskitetysti</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={bulkEditMode ? "destructive" : "outline"}
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            {bulkEditMode ? 'Lopeta valinta' : 'Bulk-muokkaus'}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blondify-blue hover:bg-blondify-blue/90">
                <Upload className="w-4 h-4 mr-2" />
                Lataa kuvia
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Lataa uusia kuvia</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Valitse kuvat</Label>
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
                {uploadFiles.length > 0 && (
                  <div className="text-sm text-gray-400">
                    {uploadFiles.length} tiedostoa valittu
                  </div>
                )}
                <Button 
                  onClick={handleBulkUpload}
                  disabled={isUploading || uploadFiles.length === 0}
                  className="bg-blondify-blue hover:bg-blondify-blue/90 w-full"
                >
                  {isUploading ? 'Lataa...' : 'Lataa kuvat'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Etsi kuvia..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all">Kaikki kategoriat</SelectItem>
                <SelectItem value="uncategorized">Luokittelemattomat</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-gray-600"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-gray-600"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {bulkEditMode && selectedImages.length > 0 && (
        <Card className="bg-red-900/20 border-red-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-white">
                {selectedImages.length} kuvaa valittu
              </span>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Poista valitut
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImages([])}
                  className="border-gray-600"
                >
                  Tyhjennä valinta
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images Grid/List */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          {filteredImages.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Ei kuvia löytynyt hakuehdoilla.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              : "space-y-4"
            }>
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative group ${
                    viewMode === 'list' 
                      ? 'flex items-center gap-4 p-4 bg-gray-800 rounded-lg'
                      : 'bg-gray-800 rounded-lg overflow-hidden'
                  }`}
                >
                  {bulkEditMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedImages.includes(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="w-4 h-4"
                      />
                    </div>
                  )}

                  <div className={viewMode === 'list' ? 'w-20 h-20' : 'aspect-square'}>
                    <img
                      src={image.image_url}
                      alt={image.alt_text || 'Media'}
                      className="w-full h-full object-cover rounded cursor-pointer"
                      onClick={() => onImageSelect?.(image.image_url)}
                    />
                  </div>

                  {viewMode === 'list' && (
                    <div className="flex-1">
                      <h4 className="text-white font-medium truncate">
                        {image.alt_text || 'Nimetön kuva'}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {image.category || 'Ei kategoriaa'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {image.source_type} • {new Date(image.created_at).toLocaleDateString('fi-FI')}
                      </p>
                    </div>
                  )}

                  <div className={`${
                    viewMode === 'grid' 
                      ? 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                      : 'flex gap-2'
                  }`}>
                    {image.is_featured && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    {onImageSelect && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onImageSelect(image.image_url)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteImageMutation.mutate(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {viewMode === 'grid' && (
                    <div className="p-3">
                      <h4 className="text-white text-sm font-medium truncate">
                        {image.alt_text || 'Nimetön kuva'}
                      </h4>
                      <p className="text-gray-400 text-xs">
                        {image.category || 'Ei kategoriaa'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaLibrary;
