
-- Varmistetaan että portfolio_images taulussa on specialist_id kenttä
ALTER TABLE portfolio_images 
ADD COLUMN IF NOT EXISTS specialist_id uuid REFERENCES team_members(id);

-- Luodaan indeksi hakuja varten
CREATE INDEX IF NOT EXISTS idx_portfolio_images_specialist_id ON portfolio_images(specialist_id);

-- Varmistetaan että specialist_testimonials taulussa on kaikki tarvittavat kentät
CREATE TABLE IF NOT EXISTS specialist_testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id uuid REFERENCES team_members(id) ON DELETE CASCADE NOT NULL,
  customer_name text NOT NULL,
  customer_age integer,
  testimonial_text text NOT NULL,
  image_url text,
  is_featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Luodaan indeksi specialist_testimonials tauluun
CREATE INDEX IF NOT EXISTS idx_specialist_testimonials_specialist_id ON specialist_testimonials(specialist_id);

-- Lisätään portfolio_images tauluun display_order jos ei ole
ALTER TABLE portfolio_images 
ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Lisätään portfolio_images tauluun description jos ei ole
ALTER TABLE portfolio_images 
ADD COLUMN IF NOT EXISTS description text;

-- Päivitetään aikaleima funktio specialist_testimonials tauluun
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Luodaan trigger specialist_testimonials tauluun
DROP TRIGGER IF EXISTS update_specialist_testimonials_updated_at ON specialist_testimonials;
CREATE TRIGGER update_specialist_testimonials_updated_at
    BEFORE UPDATE ON specialist_testimonials
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
