
import React from 'react';

interface LogoProps {
  className?: string;
  invert?: boolean;
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  invert = false,
  variant = 'default'
}) => {
  const logoSrc = variant === 'white' 
    ? "/lovable-uploads/e21d3b7d-e0cf-42fd-81f7-7c37a52b177e.png" 
    : "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/ccf678e5-b0b0-490d-bf9b-716614eaa7a8.png";
  
  return (
    <img 
      src={logoSrc}
      alt="Blondify Logo" 
      className={`h-8 w-auto object-contain ${className}`}
      style={{ 
        objectFit: 'contain',
        maxHeight: '32px'
      }}
    />
  );
};

export default Logo;
