
import React from 'react';
import ReviewsShowcase from './ReviewsShowcase';

interface ReviewsShowcaseWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
  };
}

const ReviewsShowcaseWrapper: React.FC<ReviewsShowcaseWrapperProps> = ({ content }) => {
  // For now, just render the original ReviewsShowcase component
  // In the future, this can be enhanced to use the content props
  return <ReviewsShowcase />;
};

export default ReviewsShowcaseWrapper;
