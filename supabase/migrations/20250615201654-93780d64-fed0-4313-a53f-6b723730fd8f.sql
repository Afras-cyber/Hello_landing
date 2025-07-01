
-- Lisätään sarakkeet palveluiden dynaamisia alasivuja varten
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS has_landing_page BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS landing_page_content JSONB,
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

-- Lisätään selitteet uusiin sarakkeisiin
COMMENT ON COLUMN public.services.has_landing_page IS 'Jos totta, palvelulla on oma alasivu. Jos epätotta, ohjaa suoraan ajanvaraukseen.';
COMMENT ON COLUMN public.services.landing_page_content IS 'JSONB-sisältö dynaamiselle alasivulle, joka sisältää erilaisia sisältöblokkeja.';
COMMENT ON COLUMN public.services.meta_title IS 'SEO meta-otsikko palvelun alasivulle.';
COMMENT ON COLUMN public.services.meta_description IS 'SEO meta-kuvaus palvelun alasivulle.';
COMMENT ON COLUMN public.services.meta_keywords IS 'SEO meta-avainsanat palvelun alasivulle.';

