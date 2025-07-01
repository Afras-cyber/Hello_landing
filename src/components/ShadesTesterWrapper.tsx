
import React from 'react';
import ShadesTester from './ShadesTester';

interface ShadesTesterWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
    button_text?: string;
    button_url?: string;
  };
}

const ShadesTesterWrapper: React.FC<ShadesTesterWrapperProps> = ({ content }) => {
  // For now, just render the original ShadesTester component
  // In the future, this can be enhanced to use the content props
  return <ShadesTester />;
};

export default ShadesTesterWrapper;
