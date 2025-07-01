
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  link: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 'vilma',
    name: 'Vilma',
    role: 'Founder of Blondify',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/team/monica-blondify%20(4)-min.png',
    link: '/blonde-specialistit/vilma'
  },
  {
    id: 'jenni',
    name: 'Jenni',
    role: 'Senior Blonde Specialist',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/team/jenni-blondify%20(1)-min.png',
    link: '/blonde-specialistit/jenni'
  },
  {
    id: 'monica',
    name: 'Monica',
    role: 'Senior Blonde Specialist',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/team/monica-blondify%20(4)-min.png',
    link: '/blonde-specialistit/monica'
  },
  {
    id: 'ester',
    name: 'Ester',
    role: 'Blonde Specialist',
    image: 'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/team/ester-blondify%20(1)-min.png',
    link: '/blonde-specialistit/ester'
  }
];

const TeamSection: React.FC = () => {
  return (
    <section className="py-16 bg-black">
      <div className="blondify-container">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center font-redhat">Tutusta tiimimme jäseniin</h2>
        <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto font-redhat">
          Blondify-tiimi koostuu blonde-spesialisteista, jotka ovat erikoistuneet vaaleisiin hiuksiin. Jokainen specialistimme on saanut kattavan koulutuksen ja omaa vuosien kokemuksen alalta.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <TeamCard key={member.id} member={member} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button asChild variant="outline" className="border-blondify-blue text-blondify-blue hover:bg-blondify-blue hover:text-white font-redhat">
            <Link to="/blonde-specialistit">Tutustu koko tiimiin</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface TeamCardProps {
  member: TeamMember;
}

const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
  return (
    <Link to={member.link}>
      <Card className="bg-black border border-gray-800 overflow-hidden hover:border-blondify-blue transition-all duration-300 relative">
        <div className="relative">
          <div className="h-72 overflow-hidden">
            <img 
              src={member.image} 
              alt={member.name} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-black/70 backdrop-blur-sm rounded-full p-2 shadow-lg border border-gray-800">
              <Star size={18} className="text-blondify-blue" />
            </div>
          </div>
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="bg-blondify-blue rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="text-xl font-semibold font-redhat">{member.name}</h3>
          <p className="text-blondify-blue font-redhat">{member.role}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeamSection;
