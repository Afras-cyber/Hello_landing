
import React from 'react';
import ArticlesSection from './ArticlesSection';

interface ArticlesSectionWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
    show_more_button_text?: string;
    show_more_button_url?: string;
  };
}

const ArticlesSectionWrapper: React.FC<ArticlesSectionWrapperProps> = ({ content }) => {
  // For now, just render the original ArticlesSection component
  // In the future, this can be enhanced to use the content props
  return <ArticlesSection />;
};

export default ArticlesSectionWrapper;
