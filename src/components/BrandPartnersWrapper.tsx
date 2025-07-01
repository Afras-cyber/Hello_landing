
import React from 'react';
import BrandPartners from './BrandPartners';

interface BrandPartnersWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
  };
}

const BrandPartnersWrapper: React.FC<BrandPartnersWrapperProps> = ({ content }) => {
  // For now, just render the original BrandPartners component
  // In the future, this can be enhanced to use the content props
  return <BrandPartners />;
};

export default BrandPartnersWrapper;
