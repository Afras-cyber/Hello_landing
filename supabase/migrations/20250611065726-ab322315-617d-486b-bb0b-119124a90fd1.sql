
-- Expand homepage_content table with additional columns for better content management
ALTER TABLE public.homepage_content 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS background_url TEXT,
ADD COLUMN IF NOT EXISTS link_url TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT,
ADD COLUMN IF NOT EXISTS color_scheme JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS layout_settings JSONB DEFAULT '{}';

-- Insert comprehensive homepage sections with all content
INSERT INTO public.homepage_content (section_name, content, display_order, is_active) VALUES
('hero', '{
  "title": "Pohjoismaiden #1 kampaamo blondeille",
  "subtitle": "Vaalennus, balayage, raidat tai mikä tahansa muu ihana lopputulos",
  "primary_button_text": "Varaa aika",
  "primary_button_url": "/varaa-aika",
  "secondary_button_text": "Palvelut",
  "secondary_button_url": "/palvelut",
  "background_video_desktop": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/blondify_hero.mp4",
  "background_video_mobile": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/mobile_hero2025.mp4",
  "background_image_desktop": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/hero-blondify.jpeg",
  "background_image_mobile": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg"
}', 0, true),

('stats_bar', '{
  "stats": [
    {"label": "Tyytyväistä asiakasta", "value": "10,000+", "icon": "users"},
    {"label": "Blondi-spesialistia", "value": "50+", "icon": "star"},
    {"label": "Kaupunkia", "value": "25+", "icon": "map-pin"},
    {"label": "Vuotta kokemusta", "value": "15+", "icon": "award"}
  ]
}', 1, true),

('featured_services', '{
  "title": "Erikoispalvelumme",
  "subtitle": "Tarjoamme laajan valikoiman blondi-palveluita ammattitaitoisilla spesialisteilla",
  "show_all_button_text": "Katso kaikki palvelut",
  "show_all_button_url": "/palvelut"
}', 2, true),

('consultation_banner', '{
  "title": "Ilmainen 15 min konsultaatio",
  "description": "Etkö ole varma, mitä haluaisit hiuksillesi? Varaa maksuton 15 minuutin konsultaatio.",
  "button_text": "Varaa aika",
  "button_url": "/varaa-aika",
  "image_url": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/videos/herom-blondify.jpeg",
  "background_color": "#4F46E5"
}', 3, true),

('project_list', '{
  "title": "Muodonmuutokset",
  "subtitle": "Katso kuinka asiakkaamme ovat löytäneet unelmiensa blondin",
  "show_more_button_text": "Katso lisää",
  "show_more_button_url": "/portfolio"
}', 4, true),

('clients_showcase', '{
  "title": "Asiakkaiden kokemuksia",
  "subtitle": "Lue mitä asiakkaamme sanovat palveluistamme"
}', 5, true),

('shades_tester', '{
  "title": "Kokeile sävyjä",
  "subtitle": "Löydä täydellinen sävy hiuksillesi virtuaalisen sävytestaajamme avulla",
  "button_text": "Tutki sävyjä",
  "button_url": "/savyt"
}', 6, true),

('reviews_showcase', '{
  "title": "Asiakasarvostelut",
  "subtitle": "Mitä asiakkaamme sanovat meistä"
}', 7, true),

('articles_section', '{
  "title": "Hiusoppaat ja vinkit",
  "subtitle": "Lue asiantuntijoidemme kirjoittamia oppaita hiusten hoitoon",
  "show_more_button_text": "Lue lisää artikkeleita",
  "show_more_button_url": "/artikkelit"
}', 8, true),

('brand_partners', '{
  "title": "Luotetut kumppanit",
  "subtitle": "Käytämme vain parhaita tuotemerkkejä"
}', 9, true)

ON CONFLICT (section_name) DO UPDATE SET
content = EXCLUDED.content,
display_order = EXCLUDED.display_order,
updated_at = now();

-- Create a function to get homepage content in order
CREATE OR REPLACE FUNCTION get_homepage_content()
RETURNS TABLE (
  id UUID,
  section_name TEXT,
  content JSONB,
  is_active BOOLEAN,
  display_order INTEGER,
  image_url TEXT,
  background_url TEXT,
  link_url TEXT,
  button_text TEXT,
  color_scheme JSONB,
  layout_settings JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.section_name,
    h.content,
    h.is_active,
    h.display_order,
    h.image_url,
    h.background_url,
    h.link_url,
    h.button_text,
    h.color_scheme,
    h.layout_settings
  FROM homepage_content h
  WHERE h.is_active = true
  ORDER BY h.display_order ASC;
END;
$$;
