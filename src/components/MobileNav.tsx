
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const [currentLevel, setCurrentLevel] = useState<'main' | 'lisaa'>('main');

  const mobileMenuItems = [
    { name: "Etusivu", path: "/", isExternal: false },
    { name: "Tutki sävyjä", path: "/savyt", isExternal: false },
    { name: "Palvelut", path: "/palvelut", isExternal: false },
    { name: "Blonde Specialistit", path: "/blonde-specialistit", isExternal: false },
    { name: "Verkkokauppa", path: "https://blondifystore.com/", isExternal: true },
    { name: "Kampaamot", path: "/kampaamot", isExternal: false }
  ];

  const lisaaItems = [
    { name: "Portfolio", path: "/portfolio" },
    { name: "Usein kysytyt kysymykset", path: "/ukk" },
    { name: "Artikkelit", path: "/artikkelit" },
    { name: "Kampaamot", path: "/kampaamot" },
    { name: "Our story", path: "/tarina" },
    { name: "Vastuullisuus", path: "/vastuullisuus" },
    { name: "Ura Blondifyllä", path: "/ura" },
    { name: "Tilaa uutiskirje", path: "/uutiskirje" }
  ];

  // Handle external link clicks
  const handleExternalClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const openLisaaMenu = () => {
    setCurrentLevel('lisaa');
  };

  const backToMain = () => {
    setCurrentLevel('main');
  };

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Reset to main level when menu closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentLevel('main');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Full screen backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/95 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}
        onClick={onClose}
      />
      
      {/* Full screen navigation panel */}
      <div className={`
        fixed inset-0 bg-black flex flex-col
        transform transition-all duration-300 ease-out will-change-transform
        ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}>
        {/* Header with navigation and close button */}
        <div className="flex justify-between items-center px-6 py-6 border-b border-white/10 safe-area-inset-top">
          <div className="flex items-center">
            {currentLevel === 'lisaa' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={backToMain}
                className="text-white hover:bg-white/10 touch-manipulation h-10 w-10 rounded-full mr-3"
                aria-label="Takaisin päävalikkoon"
              >
                <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            )}
            <div className="text-white font-redhat text-lg font-light tracking-wider">
              {currentLevel === 'main' ? 'Menu' : 'Lisää'}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10 touch-manipulation h-12 w-12 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300"
            aria-label="Sulje menu"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </Button>
        </div>

        {/* Navigation items - Main level */}
        {currentLevel === 'main' && (
          <div className="flex-1 px-6 py-6 flex flex-col overflow-y-auto">
            <nav className="flex-1">
              {mobileMenuItems.map((item, index) => (
                item.isExternal ? (
                  <button
                    key={item.name}
                    onClick={() => handleExternalClick(item.path)}
                    className={`
                      group flex items-center justify-between w-full py-4 text-white font-redhat
                      text-lg tracking-wide hover:text-white/70 transition-all duration-300 touch-manipulation
                      border-b border-white/5 last:border-b-0 relative overflow-hidden min-h-[60px]
                      ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                    `}
                    style={{ 
                      transitionDelay: isOpen ? `${index * 100 + 200}ms` : '0ms',
                      transitionDuration: '500ms'
                    }}
                  >
                    <div className="absolute left-0 top-0 w-0 h-full bg-white/5 transition-all duration-300 group-hover:w-full -z-10" />
                    <span className="relative z-10 pb-1">{item.name}</span>
                  </button>
                ) : (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      group flex items-center justify-between py-4 text-white font-redhat text-lg tracking-wide
                      hover:text-white/70 transition-all duration-300 touch-manipulation
                      border-b border-white/5 last:border-b-0 relative overflow-hidden min-h-[60px]
                      ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                    `}
                    style={{ 
                      transitionDelay: isOpen ? `${index * 100 + 200}ms` : '0ms',
                      transitionDuration: '500ms'
                    }}
                  >
                    <div className="absolute left-0 top-0 w-0 h-full bg-white/5 transition-all duration-300 group-hover:w-full -z-10" />
                    <span className="relative z-10 pb-1">{item.name}</span>
                  </Link>
                )
              ))}

              {/* Lisää button that opens submenu */}
              <button
                onClick={openLisaaMenu}
                className={`
                  group flex items-center justify-between w-full py-4 text-white font-redhat
                  text-lg tracking-wide hover:text-white/70 transition-all duration-300 touch-manipulation
                  border-b border-white/5 relative overflow-hidden min-h-[60px]
                  ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
                style={{ 
                  transitionDelay: isOpen ? `${mobileMenuItems.length * 100 + 200}ms` : '0ms',
                  transitionDuration: '500ms'
                }}
              >
                <div className="absolute left-0 top-0 w-0 h-full bg-white/5 transition-all duration-300 group-hover:w-full -z-10" />
                <span className="relative z-10 pb-1">Lisää</span>
                <ChevronRight className="h-5 w-5 relative z-10" strokeWidth={1.5} />
              </button>
            </nav>

            {/* Mobile Varaa aika button */}
            <div className="mt-6 mb-6">
              <Link 
                to="/varaa-aika"
                onClick={onClose}
                className={`
                  inline-flex items-center justify-center w-full px-6 py-4 bg-blondify-blue text-white font-redhat font-semibold text-base rounded-full 
                  hover:bg-blondify-blue/90 hover:shadow-lg hover:shadow-blondify-blue/25 hover:scale-105 
                  transition-all duration-300 ease-out transform active:scale-95
                  border-2 border-blondify-blue hover:border-blondify-blue/80 touch-manipulation
                  ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
                `}
                style={{ 
                  transitionDelay: isOpen ? `${(mobileMenuItems.length + 1) * 100 + 300}ms` : '0ms',
                  transitionDuration: '500ms'
                }}
              >
                Varaa aika
              </Link>
            </div>
          </div>
        )}

        {/* Navigation items - Lisää level */}
        {currentLevel === 'lisaa' && (
          <div className="flex-1 px-6 py-6 flex flex-col overflow-y-auto">
            <nav className="flex-1">
              {lisaaItems.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    group flex items-center justify-between py-4 text-white font-redhat text-lg tracking-wide
                    hover:text-white/70 transition-all duration-300 touch-manipulation
                    border-b border-white/5 last:border-b-0 relative overflow-hidden min-h-[60px]
                    translate-y-0 opacity-100
                  `}
                  style={{ 
                    transitionDelay: `${index * 50 + 100}ms`,
                    transitionDuration: '300ms'
                  }}
                >
                  <div className="absolute left-0 top-0 w-0 h-full bg-white/5 transition-all duration-300 group-hover:w-full -z-10" />
                  <span className="relative z-10 pb-1">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}

        {/* Footer with branding */}
        <div className="px-6 py-4 border-t border-white/5 safe-area-inset-bottom">
          <div className="text-white/30 text-sm font-redhat-light tracking-widest uppercase">
            Blondify Studio
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
