
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import FooterMap from './FooterMap';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useOpeningHours } from '@/hooks/useOpeningHours';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { formattedHours, loading, error } = useOpeningHours();

  // Fallback aukioloajat jos database-haku epäonnistuu
  const fallbackHours = [
    { day: 'Ma - Pe', time: '10:00 - 20:00', isClosed: false },
    { day: 'La', time: '10:00 - 18:00', isClosed: false },
    { day: 'Su', time: '10:00 - 18:00', isClosed: false }
  ];

  const displayHours = error ? fallbackHours : formattedHours;
  
  return (
    <footer className="bg-black text-white">
      {/* Content section - matching map container width */}
      <div className="blondify-container py-12 md:py-16">
        {/* Logo and tagline */}
        <div className="flex flex-col items-center mb-12">
          <div className="mb-6">
            <img 
              src="https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/yk_logot/ccf678e5-b0b0-490d-bf9b-716614eaa7a8.png" 
              alt="Blondify Logo" 
              className="h-12 w-auto"
            />
          </div>
          <p className="text-gray-300 max-w-xl text-center font-redhat text-base leading-relaxed">
            <span className="text-blondify-blue font-semibold">#1 kampaamo</span> blondeille Pohjoismaissa
          </p>
        </div>

        {/* Three-column footer layout */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {/* Column 1: Sivut - jaettu kahteen sarakkeeseen */}
            <div className="flex flex-col items-start">
              <h3 className="font-bold text-lg mb-5 text-white">
                Sivut
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 w-full text-left">
                <FooterLink to="/palvelut" label="Palvelut" />
                <FooterLink to="/varaa-aika" label="Varaa aika" />
                <FooterLink to="/blonde-specialistit" label="Tiimi" />
                <FooterLink to="/savyt" label="Sävyt" />
                <FooterLink to="/portfolio" label="Portfolio" />
                <FooterLink to="/blogi" label="Blogi" />
                <FooterLink to="/ukk" label="UKK" />
                <FooterLink to="/vastuullisuus" label="Vastuullisuus" />
                <FooterLink to="/tarina" label="Tarina" />
                <FooterLink to="/ura" label="Ura" />
                <FooterLink to="/uutiskirje" label="Uutiskirje" />
              </div>
            </div>

            {/* Column 2: Yhteystiedot */}
            <div className="flex flex-col items-start">
              <h3 className="font-bold text-lg mb-5 text-white">
                Yhteystiedot
              </h3>
              <ul className="space-y-4 text-left">
                <li className="flex items-start justify-start">
                  <MapPin className="h-4 w-4 mr-3 text-blondify-blue mt-1" />
                  <div className="text-gray-300 text-sm">
                    <div>Atlantinkatu 16</div>
                    <div>00220 Helsinki</div>
                  </div>
                </li>
                <li className="flex items-center justify-start">
                  <Phone className="h-4 w-4 mr-3 text-blondify-blue" />
                  <span className="text-gray-300 text-sm">040 526 0124</span>
                </li>
                <li className="flex items-center justify-start">
                  <Mail className="h-4 w-4 mr-3 text-blondify-blue" />
                  <span className="text-gray-300 text-sm">jatkasaari@blondify.fi</span>
                </li>
              </ul>
            </div>
            
            {/* Column 3: Aukioloajat */}
            <div className="flex flex-col items-start">
              <h3 className="font-bold text-lg mb-5 text-white">
                Aukioloajat
              </h3>
              {loading ? (
                <div className="text-gray-300 text-sm">Ladataan...</div>
              ) : (
                <ul className="space-y-2 text-left">
                  {displayHours.map((hour, index) => (
                    <li key={index} className="flex items-center justify-start">
                      {index === 0 && <Clock className="h-4 w-4 mr-3 text-blondify-blue" />}
                      {index > 0 && <div className="w-4 mr-3"></div>}
                      <div className={`text-gray-300 text-sm ${hour.isClosed ? 'text-red-400' : ''}`}>
                        <span className="font-medium">{hour.day}</span> {hour.time}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Map section - consistent container */}
      <div className="blondify-container pb-8">
        <div className="relative w-full h-[280px] md:h-[320px] rounded-[20px] overflow-hidden shadow-2xl border border-gray-800/50">
          <FooterMap />
        </div>
      </div>
      
      <div className="bg-black py-4 text-center text-gray-400 text-sm border-t border-gray-800/30">
        <div className="blondify-container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <div className="text-gray-400">© {currentYear} Blondify Oy</div>
            <FooterLink to="/tietosuoja" label="Tietosuoja" />
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterLinkProps {
  to: string;
  label: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, label }) => (
  <Link 
    to={to} 
    className="text-gray-300 hover:text-blondify-blue transition-colors duration-300 text-sm"
  >
    {label}
  </Link>
);

export default Footer;
