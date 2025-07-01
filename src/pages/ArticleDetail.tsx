
import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useArticle } from '@/hooks/useArticle';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticle(slug || '');

  console.log('📄 ArticleDetail render:', { slug, article, isLoading, error });

  // Update document metadata manually instead of using Helmet
  useEffect(() => {
    if (article) {
      console.log('📄 Setting document metadata for article:', article.title);
      // Set title
      document.title = `${article.title} | Blondify`;
      
      // Find or create meta tags
      const updateMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = name;
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      const updateOgMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="og:${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', `og:${property}`);
          document.head.appendChild(meta);
        }
        meta.content = content;
      };

      // Update meta tags
      updateMetaTag('description', article.excerpt);
      updateOgMetaTag('title', article.title);
      updateOgMetaTag('description', article.excerpt);
      updateOgMetaTag('image', article.imageUrl);
      updateOgMetaTag('url', window.location.href);
      updateOgMetaTag('type', 'article');
    }
    
    // Clean up when component unmounts
    return () => {
      document.title = 'Blondify';
    };
  }, [article]);

  // Set up article view tracking
  useEffect(() => {
    if (article && window.dataLayer) {
      console.log('📄 Tracking article view:', article.id);
      // Track scroll depth
      const handleScroll = () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
        
        if (scrollPercentage > 75 && !window.articleDepthTracked) {
          window.dataLayer.push({
            event: 'article_read_depth',
            article_id: article.id,
            depth: 'deep'
          });
          window.articleDepthTracked = true;
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [article]);

  const handleShare = (platform: string) => {
    console.log('📄 Sharing article:', { platform, article: article?.title });
    const url = window.location.href;
    const shareText = article?.title;
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText || '')}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        // Use Web Share API if available
        if (navigator.share) {
          navigator.share({
            title: shareText,
            url: url
          }).catch(err => console.error('Error sharing:', err));
          return;
        }
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        alert('URL copied to clipboard!');
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Track share event
    if (window.dataLayer) {
      window.dataLayer.push({
        event: 'article_share',
        article_id: article?.id,
        platform: platform
      });
    }
  };

  // Show loading state
  if (isLoading) {
    console.log('⏳ Article loading...');
    return (
      <div className="min-h-screen bg-black text-white navbar-offset">
        <div className="blondify-container py-16">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-10 w-3/4 mb-4 bg-gray-800" />
            <Skeleton className="h-64 w-full mb-12 bg-gray-800" />
            <Skeleton className="h-6 w-full mb-4 bg-gray-800" />
            <Skeleton className="h-6 w-full mb-4 bg-gray-800" />
            <Skeleton className="h-6 w-3/4 mb-4 bg-gray-800" />
            <Skeleton className="h-6 w-5/6 mb-4 bg-gray-800" />
            <Skeleton className="h-6 w-full mb-4 bg-gray-800" />
          </div>
        </div>
      </div>
    );
  }

  // Show error or not found state
  if (error || !article) {
    console.log('❌ Article error or not found:', { error, article, slug });
    return (
      <div className="min-h-screen bg-black text-white navbar-offset">
        <div className="blondify-container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4 font-redhat">Artikkelia ei löytynyt</h1>
          <p className="mb-8 font-redhat">
            {error 
              ? 'Valitettavasti hakemaasi artikkelia ei löytynyt tai siinä tapahtui virhe.' 
              : 'Hakemaasi artikkelia ei löytynyt.'}
          </p>
          <Button asChild>
            <Link to="/artikkelit">Palaa artikkeleihin</Link>
          </Button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering article:', article.title);

  return (
    <div className="min-h-screen bg-black text-white navbar-offset">        
      {/* Article Content */}
      <div className="blondify-container py-8">
        {/* Back button */}
        <div className="max-w-4xl mx-auto mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mb-4 bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 hover:text-white font-redhat" 
            asChild
          >
            <Link to="/artikkelit" className="flex items-center">
              ← Takaisin artikkeleihin
            </Link>
          </Button>
        </div>

        {/* Article header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 font-redhat text-white leading-tight">
            {article.title}
          </h1>

          {/* Article image */}
          {article.imageUrl && (
            <div className="mb-8">
              <img 
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Share buttons - removed icons */}
          <div className="flex items-center space-x-4 mb-8">
            <span className="text-sm text-gray-300 font-redhat">Jaa artikkeli:</span>
            <button 
              onClick={() => handleShare('facebook')}
              className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-redhat"
              aria-label="Jaa Facebookissa"
            >
              Facebook
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-redhat"
              aria-label="Jaa Twitterissä"
            >
              Twitter
            </button>
            <button 
              onClick={() => handleShare('linkedin')}
              className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-redhat"
              aria-label="Jaa LinkedInissä"
            >
              LinkedIn
            </button>
          </div>
        </div>
        
        {/* Article content */}
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg prose-invert max-w-none font-redhat prose-headings:text-white prose-headings:font-redhat prose-p:text-gray-200 prose-strong:text-white prose-a:text-blondify-blue prose-img:rounded-lg prose-img:shadow-lg">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </div>
        </div>
        
        {/* Tags */}
        <div className="max-w-4xl mx-auto mt-12 mb-12 flex flex-wrap gap-3">
          <Link 
            to="/artikkelit"
            className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-sm font-redhat"
            data-gtm-element="article_tag"
          >
            Hiustenhoito
          </Link>
          <Link 
            to="/artikkelit"
            className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-sm font-redhat"
            data-gtm-element="article_tag"
          >
            Vinkit
          </Link>
          <Link 
            to="/artikkelit"
            className="px-4 py-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors text-sm font-redhat"
            data-gtm-element="article_tag"
          >
            Trendit
          </Link>
        </div>
      </div>
      
      {/* Related Articles */}
      <div className="blondify-container py-16">
        <h2 className="text-3xl font-bold mb-8 font-redhat">Lisää luettavaa</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            to="/artikkelit"
            className="bg-gray-900 rounded-lg overflow-hidden hover:bg-gray-800 transition-all group"
            data-gtm-element="related_articles"
          >
            <div className="h-64 md:h-80 overflow-hidden">
              <img 
                src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/services_images/Blondify%20Special%20Highlights-min.png?width=400&height=320&quality=75&format=webp"
                alt="Lue lisää artikkeleita hiustenhoidosta ja trendeistä"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                width="400"
                height="320"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2 font-redhat group-hover:text-blondify-blue transition-colors">Katso kaikki artikkelit</h3>
              <p className="text-gray-300 font-redhat">Lue lisää artikkeleita hiustenhoidosta ja trendeistä</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;

