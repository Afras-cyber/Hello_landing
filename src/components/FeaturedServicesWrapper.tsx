
import React from 'react';
import FeaturedServices from './FeaturedServices';

interface FeaturedServicesWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
    show_all_button_text?: string;
    show_all_button_url?: string;
  };
}

const FeaturedServicesWrapper: React.FC<FeaturedServicesWrapperProps> = ({ content }) => {
  // For now, just render the original FeaturedServices component
  // In the future, this can be enhanced to use the content props
  return <FeaturedServices />;
};

export default FeaturedServicesWrapper;
