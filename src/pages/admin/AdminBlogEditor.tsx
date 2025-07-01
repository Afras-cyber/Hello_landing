import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft } from 'lucide-react';
import RichTextEditorWithImages from '@/components/admin/RichTextEditorWithImages';
import ArticleMetaForm from '@/components/admin/ArticleMetaForm';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageurl: string;
  date: string;
}

const AdminBlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check if we're creating a new article - more explicit check
  const isNew = !id || id === 'new';
  
  console.log('🎯 AdminBlogEditor: Component loaded with id:', id, 'isNew:', isNew);

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [hasNewImage, setHasNewImage] = useState(false);
  
  const [post, setPost] = useState<Partial<BlogPost>>({
    title: '',
    excerpt: '',
    content: '',
    imageurl: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    console.log('🔄 AdminBlogEditor: useEffect triggered, isNew:', isNew, 'id:', id);
    if (!isNew && id && id !== 'new') {
      fetchPost();
    } else {
      console.log('✅ AdminBlogEditor: Ready for new article creation');
      setIsLoading(false);
    }
  }, [id, isNew]);

  const fetchPost = async () => {
    if (!id || id === 'new') {
      console.log('⚠️ AdminBlogEditor: Skipping fetch for new article');
      return;
    }

    console.log('🔍 Fetching post with ID:', id);
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error('❌ Error fetching article:', error);
        throw error;
      }
      
      if (data) {
        console.log('✅ Article fetched successfully:', data);
        setPost(data);
        
        // Reset image states when fetching existing post
        setImageFile(null);
        setHasNewImage(false);
        
        if (data.imageurl) {
          // Add cache-busting parameter for updated images
          const imageUrl = data.imageurl.includes('?') 
            ? `${data.imageurl}&t=${Date.now()}`
            : `${data.imageurl}?t=${Date.now()}`;
          setImagePreview(imageUrl);
        } else {
          setImagePreview('');
        }
      }
    } catch (error) {
      console.error('💥 Fatal error in fetchPost:', error);
      toast({
        title: 'Virhe',
        description: `Artikkelin hakeminen epäonnistui: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`,
        variant: 'destructive'
      });
      navigate('/admin/blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof BlogPost, value: string) => {
    console.log(`📝 Field ${field} changed to:`, value);
    setPost(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🖼️ Legacy image change triggered');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('📁 Selected file:', { name: file.name, size: file.size, type: file.type });
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('❌ File too large:', file.size);
        toast({
          title: 'Virhe',
          description: 'Kuva on liian suuri. Maksimikoko on 5MB.',
          variant: 'destructive'
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.error('❌ Invalid file type:', file.type);
        toast({
          title: 'Virhe',
          description: 'Valitse kelvollinen kuvatiedosto (JPG, PNG, WebP).',
          variant: 'destructive'
        });
        return;
      }

      setImageFile(file);
      setHasNewImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('✅ Image preview created');
        setImagePreview(reader.result as string);
      };
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        toast({
          title: 'Virhe',
          description: 'Kuvan lukeminen epäonnistui.',
          variant: 'destructive'
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePrimaryImageChange = async (imageUrl: string) => {
    console.log('🖼️ Primary image changed:', imageUrl);
    
    // Update the post state immediately
    setPost(prev => ({ ...prev, imageurl: imageUrl }));
    setImagePreview(imageUrl);
    
    // If we have an existing article, update the database immediately
    if (!isNew && id) {
      try {
        console.log('💾 Updating article imageurl in database:', imageUrl);
        const { error } = await supabase
          .from('articles')
          .update({ imageurl: imageUrl })
          .eq('id', id);
          
        if (error) {
          console.error('❌ Error updating article imageurl:', error);
          toast({
            title: 'Virhe',
            description: 'Pääkuvan päivittäminen epäonnistui',
            variant: 'destructive'
          });
        } else {
          console.log('✅ Article imageurl updated successfully');
          toast({
            title: 'Pääkuva päivitetty',
            description: 'Artikkelin pääkuva on päivitetty onnistuneesti.',
          });
        }
      } catch (error) {
        console.error('💥 Fatal error updating imageurl:', error);
        toast({
          title: 'Virhe',
          description: 'Pääkuvan päivittäminen epäonnistui',
          variant: 'destructive'
        });
      }
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) {
      console.log('ℹ️ No new image to upload, using existing URL');
      return post.imageurl || null;
    }
    
    console.log('☁️ Starting image upload process');
    try {
      // Create a unique file path
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `article_images/${fileName}`;
      
      console.log('📤 Uploading to path:', filePath);

      // Check if media bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('❌ Error checking buckets:', bucketsError);
        throw new Error(`Bucket-tarkistus epäonnistui: ${bucketsError.message}`);
      }

      const mediaBucket = buckets?.find(bucket => bucket.name === 'media');
      if (!mediaBucket) {
        console.error('❌ Media bucket not found');
        throw new Error('Media-säilytysämpäri ei ole saatavilla. Ota yhteyttä ylläpitoon.');
      }

      console.log('✅ Media bucket found, proceeding with upload');

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('media')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw new Error(`Kuvan lataus epäonnistui: ${uploadError.message}`);
      }
      
      console.log('✅ Upload successful:', uploadData);
      
      // Get public URL
      const { data } = supabase.storage
        .from('media')
        .getPublicUrl(filePath);
        
      console.log('✅ Public URL generated:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('💥 Fatal error in uploadImage:', error);
      throw error;
    }
  };

  const validatePostData = (postData: Partial<BlogPost>): string[] => {
    const errors: string[] = [];
    
    if (!postData.title?.trim()) {
      errors.push('Otsikko on pakollinen');
    }
    
    if (!postData.excerpt?.trim()) {
      errors.push('Lyhyt kuvaus on pakollinen');
    }
    
    if (!postData.content?.trim()) {
      errors.push('Sisältö on pakollinen');
    }
    
    if (!postData.date) {
      errors.push('Päivämäärä on pakollinen');
    }

    // Validate date format
    if (postData.date && !/^\d{4}-\d{2}-\d{2}$/.test(postData.date)) {
      errors.push('Päivämäärän muoto on virheellinen');
    }

    console.log('🔍 Validation results:', { errors, postData });
    return errors;
  };

  const handleSave = async () => {
    console.log('💾 Save process started');
    console.log('📋 Current post state:', post);
    console.log('🔍 Is new article:', isNew);
    console.log('🆔 Article ID:', id);
    
    // Validate required fields
    const validationErrors = validatePostData(post);
    if (validationErrors.length > 0) {
      console.error('❌ Validation failed:', validationErrors);
      toast({
        title: 'Virheelliset tiedot',
        description: validationErrors.join(', '),
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setIsSaving(true);
      console.log('🔄 Setting saving state to true');
      
      // Upload the image if a new one is selected
      let imageUrl = post.imageurl;
      if (hasNewImage && imageFile) {
        console.log('🖼️ New image detected, uploading...');
        imageUrl = await uploadImage();
        console.log('✅ Image upload completed:', imageUrl);
      }
      
      // Ensure all required fields are present and sanitized
      const postData = {
        title: post.title?.trim() || '',
        excerpt: post.excerpt?.trim() || '',
        content: post.content?.trim() || '',
        imageurl: imageUrl || '',
        date: post.date || new Date().toISOString().split('T')[0]
      };
      
      console.log('📤 Prepared data for save:', postData);
      
      let result;
      
      if (isNew) {
        console.log('➕ Creating new article');
        result = await supabase
          .from('articles')
          .insert(postData)
          .select()
          .single();
      } else {
        console.log('✏️ Updating existing article with ID:', id);
        result = await supabase
          .from('articles')
          .update(postData)
          .eq('id', id)
          .select()
          .single();
      }
      
      console.log('📊 Database operation result:', result);
      
      if (result?.error) {
        console.error('❌ Database error:', result.error);
        throw new Error(`Tietokantavirhe: ${result.error.message}`);
      }

      if (!result?.data && !isNew) {
        console.error('❌ No data returned from update operation');
        throw new Error('Artikkelia ei löytynyt päivitettäväksi. Se on ehkä poistettu.');
      }
      
      console.log('✅ Save operation completed successfully');
      
      toast({
        title: 'Tallennettu',
        description: isNew ? 'Uusi artikkeli luotu onnistuneesti' : 'Artikkeli päivitetty onnistuneesti',
      });
      
      // Always navigate back to the blog list after successful save
      console.log('🔄 Navigating back to blog list');
      navigate('/admin/blog');
      
    } catch (error) {
      console.error('💥 Fatal error in handleSave:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tuntematon virhe tallennuksessa';
      toast({
        title: 'Tallennusvirhe',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
      console.log('🔄 Setting saving state to false');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
      </div>
    );
  }

  console.log('🎨 AdminBlogEditor: Rendering editor, isNew:', isNew, 'post:', post);

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold font-redhat text-white">
            {isNew ? 'Luo uusi artikkeli' : 'Muokkaa artikkelia'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Tallennetaan...' : 'Tallenna'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enhanced Rich Text Editor with Images */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Artikkelin sisältö</h2>
            <RichTextEditorWithImages
              value={post.content || ''}
              onChange={(value) => handleInputChange('content', value)}
              placeholder="Kirjoita artikkelin sisältö tähän..."
            />
          </div>
        </div>

        {/* Sidebar with metadata and image management */}
        <div className="lg:col-span-1">
          <ArticleMetaForm
            title={post.title || ''}
            excerpt={post.excerpt || ''}
            date={post.date || ''}
            imagePreview={imagePreview}
            onTitleChange={(value) => handleInputChange('title', value)}
            onExcerptChange={(value) => handleInputChange('excerpt', value)}
            onDateChange={(value) => handleInputChange('date', value)}
            onImageChange={handleImageChange}
            articleId={isNew ? undefined : id}
            onPrimaryImageChange={handlePrimaryImageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminBlogEditor;
