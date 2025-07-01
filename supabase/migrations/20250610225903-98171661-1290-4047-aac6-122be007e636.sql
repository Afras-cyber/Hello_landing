
-- Create tables for comprehensive content management system

-- Homepage content management
CREATE TABLE public.homepage_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Site-wide settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Page content for static pages
CREATE TABLE public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_slug TEXT NOT NULL UNIQUE,
  page_title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  meta_description TEXT,
  meta_keywords TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Testimonials management
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_image TEXT,
  testimonial_text TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  service_type TEXT,
  location TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Navigation items management
CREATE TABLE public.navigation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  parent_id UUID REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  target TEXT DEFAULT '_self',
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default homepage sections
INSERT INTO public.homepage_content (section_name, content) VALUES
('hero', '{
  "title": "Pohjoismaiden #1 kampaamo blondeille",
  "subtitle": "Vaalennukset, balayaget, raidat tai mikä tahansa muu ihana lopputulos.",
  "cta_text": "Varaa aika",
  "background_image": "/hero-bg.jpg"
}'),
('stats', '{
  "items": [
    {"label": "Tyytyväistä asiakasta", "value": "10,000+"},
    {"label": "Blondi-spesialistia", "value": "50+"},
    {"label": "Kaupunkia", "value": "25+"},
    {"label": "Vuotta kokemusta", "value": "15+"}
  ]
}'),
('services_intro', '{
  "title": "Palvelumme",
  "description": "Tarjoamme laajan valikoiman blondi-palveluita ammattitaitoisilla spesialisteilla."
}');

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, category, description) VALUES
('company_info', '{
  "name": "Blondify",
  "tagline": "Pohjoismaiden #1 kampaamo blondeille",
  "phone": "+358 XX XXX XXXX",
  "email": "info@blondify.fi",
  "address": "Helsinki, Finland"
}', 'general', 'Basic company information'),
('footer_content', '{
  "columns": [
    {
      "title": "Palvelut",
      "links": [
        {"label": "Vaalennukset", "url": "/palvelut/vaalennukset"},
        {"label": "Raidoitukset", "url": "/palvelut/raidoitukset"},
        {"label": "Balayage", "url": "/palvelut/balayage"}
      ]
    },
    {
      "title": "Yhteystiedot",
      "links": [
        {"label": "Ota yhteyttä", "url": "/contact"},
        {"label": "Varaa aika", "url": "/varaa-aika"}
      ]
    }
  ]
}', 'footer', 'Footer navigation and content'),
('social_media', '{
  "instagram": "https://instagram.com/blondify",
  "facebook": "https://facebook.com/blondify",
  "tiktok": "https://tiktok.com/@blondify"
}', 'social', 'Social media links');

-- Insert default navigation items
INSERT INTO public.navigation_items (label, url, display_order) VALUES
('Etusivu', '/', 0),
('Tutki sävyjä', '/savyt', 1),
('Palvelut', '/palvelut', 2),
('Blonde Specialistit', '/blonde-specialistit', 3),
('Verkkokauppa', '/verkkokauppa', 4);

-- Enable Row Level Security
ALTER TABLE public.homepage_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access only
CREATE POLICY "Admin can manage homepage content" ON public.homepage_content
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can manage site settings" ON public.site_settings
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can manage page content" ON public.page_content
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can manage testimonials" ON public.testimonials
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

CREATE POLICY "Admin can manage navigation" ON public.navigation_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));

-- Public read access for published content
CREATE POLICY "Public can read published homepage content" ON public.homepage_content
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Public can read published page content" ON public.page_content
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read published testimonials" ON public.testimonials
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read active navigation" ON public.navigation_items
  FOR SELECT USING (is_active = true);
