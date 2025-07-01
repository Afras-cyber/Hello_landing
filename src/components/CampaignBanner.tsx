
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CampaignBannerProps {
  content?: any;
}

const CampaignBanner: React.FC<CampaignBannerProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Get banner settings from content
  const bannerText = content?.content?.text || '';
  const linkUrl = content?.content?.link_url || '';
  const linkText = content?.content?.link_text || 'Lue lisää';
  const targetBlank = content?.content?.target_blank || false;
  const isCloseable = content?.layout_settings?.closeable !== false;
  
  // Get color scheme
  const backgroundColor = content?.color_scheme?.background_color || '#3B82F6';
  const textColor = content?.color_scheme?.text_color || '#FFFFFF';
  const linkColor = content?.color_scheme?.link_color || '#FFFFFF';

  // Check if banner was previously closed
  useEffect(() => {
    if (isCloseable) {
      const isClosed = localStorage.getItem('campaign-banner-closed') === 'true';
      setIsVisible(!isClosed);
    }
  }, [isCloseable]);

  const handleClose = () => {
    setIsVisible(false);
    if (isCloseable) {
      localStorage.setItem('campaign-banner-closed', 'true');
    }
  };

  if (!isVisible || !bannerText) {
    return null;
  }

  return (
    <div 
      className="w-full py-3 px-4 relative z-50"
      style={{ backgroundColor }}
    >
      <div className="blondify-container flex items-center justify-center">
        <div className="flex items-center justify-center flex-wrap gap-2 text-center">
          <span 
            className="text-sm md:text-base font-medium"
            style={{ color: textColor }}
          >
            {bannerText}
          </span>
          {linkUrl && (
            <a
              href={linkUrl}
              target={targetBlank ? '_blank' : '_self'}
              rel={targetBlank ? 'noopener noreferrer' : undefined}
              className="underline font-semibold hover:opacity-80 transition-opacity"
              style={{ color: linkColor }}
            >
              {linkText}
            </a>
          )}
        </div>
        
        {isCloseable && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
            aria-label="Sulje banneri"
          >
            <X className="w-4 h-4" style={{ color: textColor }} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignBanner;
