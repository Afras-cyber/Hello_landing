
-- Create salon_locations table
CREATE TABLE public.salon_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  phone TEXT,
  email TEXT,
  opening_hours JSONB DEFAULT '{}',
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.salon_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (salons are public information)
CREATE POLICY "Allow public read access to active salons" 
  ON public.salon_locations 
  FOR SELECT 
  USING (is_active = true);

-- Create policies for admin access (only admins can modify)
CREATE POLICY "Allow admin full access to salons" 
  ON public.salon_locations 
  FOR ALL 
  USING (public.is_admin());

-- Insert the existing salon data
INSERT INTO public.salon_locations (
  name, address, city, postal_code, latitude, longitude, phone, email, 
  opening_hours, is_active, display_order, image_url, description
) VALUES (
  'Blondify Helsinki Jätkäsaari',
  'Atlantinkatu 16',
  'Helsinki',
  '00220',
  60.15371,
  24.91028,
  '040 526 0124',
  'jatkasaari@blondify.fi',
  '{"mon_fri": "10:00 - 20:00", "sat": "10:00 - 18:00", "sun": "10:00 - 18:00"}',
  true,
  0,
  'https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/kampaamot/kampaamo-jatkasaari.webp',
  'Tervetuloa Blondify Helsinki Jätkäsaaren toimipisteeseen! Modernissa kampaamo-sisustuksessa tarjoamme huippuluokan vaalennuspalveluja ja hiustenhoitoa. Ammattitaitoiset blonde-spesialistimme tekevät unelmahiuksesi toteen.'
);

-- Create an updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at_salon_locations()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER salon_locations_updated_at
    BEFORE UPDATE ON public.salon_locations
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at_salon_locations();
