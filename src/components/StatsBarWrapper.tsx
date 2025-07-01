
import React from 'react';
import StatsBar from './StatsBar';

interface StatsBarWrapperProps {
  content?: {
    stats?: Array<{
      label: string;
      value: string;
      icon?: string;
    }>;
  };
}

const StatsBarWrapper: React.FC<StatsBarWrapperProps> = ({ content }) => {
  // For now, just render the original StatsBar component
  // In the future, this can be enhanced to use the content props
  return <StatsBar />;
};

export default StatsBarWrapper;
