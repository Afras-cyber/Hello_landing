
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Plus, Calendar, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageurl: string; // Note: keeping database column name
  date: string;
  created_at: string;
  updated_at: string;
}

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      console.log('🔍 AdminBlog: Starting to fetch articles...');
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📡 AdminBlog: Supabase response:', { data, error });
      
      if (error) {
        console.error('❌ AdminBlog: Database error:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('⚠️ AdminBlog: No articles found in database');
        setPosts([]);
        return;
      }
      
      console.log('✅ AdminBlog: Successfully fetched articles:', data.length);
      setPosts(data);
      
    } catch (error) {
      console.error('💥 AdminBlog: Fatal error fetching blog posts:', error);
      toast({
        title: 'Virhe',
        description: `Artikkeleiden hakeminen epäonnistui: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPost = (postId: string) => {
    console.log('✏️ AdminBlog: Navigating to edit post:', postId);
    navigate(`/admin/blog/${postId}`);
  };

  const handleCreateNewArticle = () => {
    console.log('➕ AdminBlog: Creating new article');
    // Navigate directly to the editor with 'new' as the ID
    navigate('/admin/blog/new');
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Haluatko varmasti poistaa tämän artikkelin?')) return;
    
    try {
      console.log('🗑️ AdminBlog: Deleting post:', id);
      
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('❌ AdminBlog: Delete error:', error);
        throw error;
      }
      
      console.log('✅ AdminBlog: Post deleted successfully');
      toast({
        title: 'Poistettu',
        description: 'Artikkeli poistettu onnistuneesti'
      });
      
      fetchPosts();
    } catch (error) {
      console.error('💥 AdminBlog: Fatal error deleting blog post:', error);
      toast({
        title: 'Virhe',
        description: `Poistaminen epäonnistui: ${error instanceof Error ? error.message : 'Tuntematon virhe'}`,
        variant: 'destructive'
      });
    }
  };

  console.log('🎯 AdminBlog: Component render state:', { 
    postsCount: posts.length, 
    isLoading, 
    posts: posts.slice(0, 2) // Log first 2 posts for debugging
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-redhat text-white">Artikkeleiden hallinta</h1>
        
        <Button
          onClick={handleCreateNewArticle}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Luo uusi artikkeli
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blondify-blue"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-900">
              <TableRow>
                <TableHead className="text-white">Otsikko</TableHead>
                <TableHead className="text-white w-[180px]">Päivämäärä</TableHead>
                <TableHead className="text-white w-[150px] text-center">Toiminnot</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                    <div className="flex flex-col items-center gap-4">
                      <Image size={48} className="text-gray-600" />
                      <div>
                        <p className="text-lg font-medium">Ei artikkeleita löytynyt</p>
                        <p className="text-sm">Aloita luomalla ensimmäinen artikkelisi</p>
                      </div>
                      <Button
                        onClick={handleCreateNewArticle}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Luo ensimmäinen artikkeli
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-gray-700/50">
                    <TableCell>
                      <div className="flex items-center gap-4">
                        {post.imageurl ? (
                          <div className="h-12 w-12 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={post.imageurl} 
                              alt={post.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                console.error('❌ AdminBlog: Failed to load image:', post.imageurl);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 bg-gray-700 rounded flex items-center justify-center text-gray-400 flex-shrink-0">
                            <Image size={20} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">{post.title || 'Ei otsikkoa'}</p>
                          <p className="text-gray-400 text-sm line-clamp-2 break-words">{post.excerpt || 'Ei kuvausta'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{post.date || 'Ei päivämäärää'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditPost(post.id)}
                          className="hover:bg-blondify-blue/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
