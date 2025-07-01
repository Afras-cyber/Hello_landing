
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MaintenanceSection: React.FC = () => {
  return (
    <section className="py-20 bg-black bg-no-repeat bg-cover bg-center relative" style={{
      backgroundImage: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1595476108050-9c3e97764053?ixlib=rb-4.0.3')"
    }}>
      <div className="blondify-container text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-5 font-redhat">Ylläpidä blondeja hiuksiasi</h2>
        <p className="max-w-2xl mx-auto mb-7 text-base font-redhat-light">
          Blondien hiusten ylläpito vaatii säännöllistä huolenpitoa. Varaa aika ammattilaisen käsittelyyn.
        </p>
        <Button asChild size="default" className="bg-blondify-blue hover:bg-blondify-blue/80 text-white font-redhat-light rounded-md">
          <Link to="/varaa-aika">Varaa aika</Link>
        </Button>
      </div>
    </section>
  );
};

export default MaintenanceSection;
