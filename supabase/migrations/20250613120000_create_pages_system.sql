
-- Create pages table for page management
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system_page BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create page sections table for editable content blocks
CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  section_name TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  content JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert existing pages into the system
INSERT INTO public.pages (slug, title, description, is_system_page) VALUES
('/', 'Etusivu', 'Blondify kotisivu', true),
('savyt', 'Tutki sävyjä', 'Hiussävyjen tutkimissivu', false),
('palvelut', 'Palvelut', 'Kaikki Blondify palvelut', false),
('blonde-specialistit', 'Blonde Specialistit', 'Tiimimme esittely', false),
('varaa-aika', 'Varaa aika', 'Ajanvaraussivu', true),
('portfolio', 'Portfolio', 'Töiden näyte', false),
('faq', 'Usein kysytyt kysymykset', 'FAQ sivu', false),
('blogi', 'Blogi', 'Blondify blogi', false),
('yhteystiedot', 'Yhteystiedot', 'Ota yhteyttä', false);

-- Insert some default content sections for existing pages
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'hero_title',
  'Hero otsikko',
  'text',
  jsonb_build_object('text', CASE 
    WHEN p.slug = 'portfolio' THEN 'Portfolio'
    WHEN p.slug = 'faq' THEN 'Usein kysytyt kysymykset'
    WHEN p.slug = 'palvelut' THEN 'Palvelumme'
    WHEN p.slug = 'blonde-specialistit' THEN 'Blonde Specialistit'
    ELSE p.title
  END),
  1
FROM public.pages p
WHERE p.slug IN ('portfolio', 'faq', 'palvelut', 'blonde-specialistit');

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage pages" ON public.pages FOR ALL USING (public.is_admin());
CREATE POLICY "Admin can manage page sections" ON public.page_sections FOR ALL USING (public.is_admin());

-- Allow public read access to active pages
CREATE POLICY "Public can view active pages" ON public.pages FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active page sections" ON public.page_sections FOR SELECT USING (is_active = true);
