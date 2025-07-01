import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import MobileNav from './MobileNav';
import Logo from './Logo';

interface MenuSection {
  title: string;
  items: {
    name: string;
    path: string;
  }[];
}

const Navbar: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isDropdownAnimating, setIsDropdownAnimating] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLUListElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isMobile } = useIsMobile();
  const location = useLocation();

  // Auto-close mobile menu when route changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  const menuSections: Record<string, MenuSection> = {
    palvelut: {
      title: "Palvelut",
      items: [{
        name: "Katso kaikki palvelut",
        path: "/palvelut"
      }, {
        name: "Vaalennukset",
        path: "/palvelut"
      }, {
        name: "Pidennykset",
        path: "/palvelut"
      }, {
        name: "Leikkaukset",
        path: "/palvelut"
      }]
    },
    lisaa: {
      title: "Lisää",
      items: [{
        name: "Portfolio",
        path: "/portfolio"
      }, {
        name: "Usein kysytyt kysymykset",
        path: "/ukk"
      }, {
        name: "Artikkelit",
        path: "/artikkelit"
      }, {
        name: "Kampaamot",
        path: "/kampaamot"
      }, {
        name: "Our story",
        path: "/tarina"
      }, {
        name: "Vastuullisuus",
        path: "/vastuullisuus"
      }, {
        name: "Ura Blondifyllä",
        path: "/ura"
      }, {
        name: "Tilaa uutiskirje",
        path: "/uutiskirje"
      }]
    }
  };

  const primaryMenuItems = [{
    name: "Tutki sävyjä",
    path: "/savyt",
    hasDropdown: false,
    key: "savyt",
    isExternal: false
  }, {
    name: "Palvelut",
    path: "/palvelut",
    hasDropdown: true,
    key: "palvelut",
    isExternal: false
  }, {
    name: "Blonde Specialistit",
    path: "/blonde-specialistit",
    hasDropdown: false,
    key: "blonde-specialistit",
    isExternal: false
  }, {
    name: "Verkkokauppa",
    path: "https://blondifystore.com/",
    hasDropdown: false,
    key: "verkkokauppa",
    isExternal: true
  }, {
    name: "Lisää",
    path: "#",
    hasDropdown: true,
    key: "lisaa",
    isExternal: false
  }];

  const handleExternalClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const showDropdown = (itemKey: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    setHoveredItem(itemKey);
    setDropdownVisible(true);
    setIsDropdownAnimating(true);
  };

  const hideDropdown = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hideTimeoutRef.current = setTimeout(() => {
      setIsDropdownAnimating(false);
      
      setTimeout(() => {
        setDropdownVisible(false);
        setHoveredItem(null);
      }, 600);
    }, 150);
  };

  const cancelHideDropdown = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleNavAreaEnter = () => {
    cancelHideDropdown();
  };

  const handleNavAreaLeave = () => {
    hideDropdown();
  };

  const handleDropdownAreaEnter = () => {
    cancelHideDropdown();
  };

  const handleDropdownAreaLeave = () => {
    hideDropdown();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          navItemsRef.current && !navItemsRef.current.contains(event.target as Node) &&
          navRef.current && !navRef.current.contains(event.target as Node)) {
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        setIsDropdownAnimating(false);
        setTimeout(() => {
          setDropdownVisible(false);
          setHoveredItem(null);
        }, 600);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  if (isMobile) {
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-gray-800">
          <div className="blondify-container flex justify-between items-center py-4">
            <Link to="/" className="flex items-center gap-2">
              <Logo />
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileNavOpen(true)}
              className="text-white hover:bg-gray-800 touch-manipulation min-h-[44px] min-w-[44px]"
              aria-label="Avaa menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.5} />
            </Button>
          </div>
        </nav>
        
        <MobileNav 
          isOpen={isMobileNavOpen} 
          onClose={() => setIsMobileNavOpen(false)} 
        />
      </>
    );
  }

  return (
    <>
      <nav 
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-gray-800"
        onMouseEnter={handleNavAreaEnter}
        onMouseLeave={handleNavAreaLeave}
      >
        <div className="blondify-container flex justify-between items-center py-5">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
          </Link>
          
          <div className="flex items-center gap-8">
            <ul ref={navItemsRef} className="flex items-center space-x-8">
              {primaryMenuItems.map(item => 
                <li 
                  key={item.name} 
                  className="relative"
                  onMouseEnter={() => {
                    if (item.hasDropdown) {
                      showDropdown(item.key || '');
                    }
                  }}
                >
                  {item.isExternal ? (
                    <button 
                      onClick={() => handleExternalClick(item.path)}
                      className="font-redhat-light text-sm py-2 hover:text-blondify-blue transition-colors flex items-center group"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link 
                      to={item.path} 
                      className="font-redhat-light text-sm py-2 hover:text-blondify-blue transition-colors flex items-center group"
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              )}
            </ul>
            
            <div className="">
              <Link 
                to="/varaa-aika"
                className="inline-flex items-center justify-center px-6 py-3 bg-blondify-blue text-white font-redhat font-semibold text-sm rounded-full 
                          hover:bg-blondify-blue/90 hover:shadow-lg hover:shadow-blondify-blue/25 hover:scale-105 
                          transition-all duration-300 ease-out transform active:scale-95
                          border-2 border-blondify-blue hover:border-blondify-blue/80"
              >
                Varaa aika
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Dropdown menu - 1.4x taller with Polestar-style layout */}
      {hoveredItem && dropdownVisible && (hoveredItem === 'palvelut' || hoveredItem === 'lisaa') && (
        <div 
          ref={dropdownRef} 
          className={cn(
            "fixed top-[73px] left-0 right-0 z-40 bg-black text-white shadow-2xl border-t border-gray-800 backdrop-blur-md overflow-hidden",
            "transform-origin-top transition-transform duration-500 ease-in-out",
            isDropdownAnimating ? "animate-slide-down-only" : "animate-slide-up-only"
          )}
          style={{ 
            marginTop: "-1px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          }}
          onMouseEnter={handleDropdownAreaEnter}
          onMouseLeave={handleDropdownAreaLeave}
        >
          <div className="blondify-container py-16">
            <div className={cn(
              hoveredItem === 'lisaa' 
                ? "max-w-4xl grid grid-cols-3 gap-x-16 gap-y-2" 
                : "max-w-sm"
            )}>
              {hoveredItem === 'lisaa' ? (
                <>
                  <ul className="space-y-2">
                    {menuSections[hoveredItem]?.items.slice(0, 3).map((subItem, index) => 
                      <li key={subItem.name} className="group">
                        <Link 
                          to={subItem.path} 
                          className="font-redhat-light block py-1.5 px-0 text-base tracking-wide hover:text-blondify-blue transition-colors relative leading-tight"
                          onClick={() => {
                            if (hideTimeoutRef.current) {
                              clearTimeout(hideTimeoutRef.current);
                            }
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                            }
                            setIsDropdownAnimating(false);
                            setTimeout(() => {
                              setDropdownVisible(false);
                              setHoveredItem(null);
                            }, 600);
                          }}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    )}
                  </ul>
                  <ul className="space-y-2">
                    {menuSections[hoveredItem]?.items.slice(3, 6).map((subItem, index) => 
                      <li key={subItem.name} className="group">
                        <Link 
                          to={subItem.path} 
                          className="font-redhat-light block py-1.5 px-0 text-base tracking-wide hover:text-blondify-blue transition-colors relative leading-tight"
                          onClick={() => {
                            if (hideTimeoutRef.current) {
                              clearTimeout(hideTimeoutRef.current);
                            }
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                            }
                            setIsDropdownAnimating(false);
                            setTimeout(() => {
                              setDropdownVisible(false);
                              setHoveredItem(null);
                            }, 600);
                          }}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    )}
                  </ul>
                  <ul className="space-y-2">
                    {menuSections[hoveredItem]?.items.slice(6).map((subItem, index) => 
                      <li key={subItem.name} className="group">
                        <Link 
                          to={subItem.path} 
                          className="font-redhat-light block py-1.5 px-0 text-base tracking-wide hover:text-blondify-blue transition-colors relative leading-tight"
                          onClick={() => {
                            if (hideTimeoutRef.current) {
                              clearTimeout(hideTimeoutRef.current);
                            }
                            if (hoverTimeoutRef.current) {
                              clearTimeout(hoverTimeoutRef.current);
                            }
                            setIsDropdownAnimating(false);
                            setTimeout(() => {
                              setDropdownVisible(false);
                              setHoveredItem(null);
                            }, 600);
                          }}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    )}
                  </ul>
                </>
              ) : (
                <ul className="space-y-2">
                  {menuSections[hoveredItem]?.items.map((subItem, index) => 
                    <li key={subItem.name} className="group">
                      <Link 
                        to={subItem.path} 
                        className={cn(
                          "font-redhat-light block py-1.5 px-0 text-base tracking-wide hover:text-blondify-blue transition-colors relative leading-tight",
                          index === 0 && "font-semibold text-blondify-blue"
                        )}
                        onClick={() => {
                          if (hideTimeoutRef.current) {
                            clearTimeout(hideTimeoutRef.current);
                          }
                          if (hoverTimeoutRef.current) {
                            clearTimeout(hoverTimeoutRef.current);
                          }
                          setIsDropdownAnimating(false);
                          setTimeout(() => {
                            setDropdownVisible(false);
                            setHoveredItem(null);
                          }, 600);
                        }}
                      >
                        {subItem.name}
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
