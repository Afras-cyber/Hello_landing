
import React from 'react';
import ClientsShowcase from './ClientsShowcase';

interface ClientsShowcaseWrapperProps {
  content?: {
    title?: string;
    subtitle?: string;
  };
}

const ClientsShowcaseWrapper: React.FC<ClientsShowcaseWrapperProps> = ({ content }) => {
  // For now, just render the original ClientsShowcase component
  // In the future, this can be enhanced to use the content props
  return <ClientsShowcase />;
};

export default ClientsShowcaseWrapper;
