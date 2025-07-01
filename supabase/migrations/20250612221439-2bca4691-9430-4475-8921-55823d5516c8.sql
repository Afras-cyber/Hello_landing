
-- Create pages table to manage all pages in the system
CREATE TABLE public.pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  is_system_page boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert existing system pages
INSERT INTO public.pages (slug, title, description, is_active, is_system_page) VALUES
('/', 'Etusivu', 'Sivuston pääsivu ja ensivaikutelma', true, true),
('/palvelut', 'Palvelut', 'Palveluiden esittely ja hinnat', true, true),
('/varaa-aika', 'Varaa aika', 'Ajanvaraussivu ja kalenteri', true, true),
('/tiimi', 'Tiimi', 'Henkilökunnan esittely', true, true),
('/blogi', 'Blogi', 'Artikkelit ja vinkit', true, true),
('/tarina', 'Tarina', 'Yrityksen tarina ja arvot', true, true),
('/yhteystiedot', 'Yhteystiedot', 'Ota yhteyttä -sivu', true, true),
('/blonde-specialistit', 'Blonde Specialistit', 'Erikoistuneet kampaajat', true, true),
('/savyt', 'Sävyt', 'Hiussävyjen tutkiminen', true, true),
('/faq', 'FAQ', 'Usein kysytyt kysymykset', true, true);

-- Create content blocks table for page content management
CREATE TABLE public.page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES public.pages(id) ON DELETE CASCADE,
  section_key text NOT NULL,
  section_name text NOT NULL,
  content_type text NOT NULL DEFAULT 'text', -- text, html, image, etc.
  content jsonb NOT NULL DEFAULT '{}',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(page_id, section_key)
);

-- Add some default content sections for homepage
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'hero_title',
  'Hero-otsikko',
  'text',
  '{"text": "Tervetuloa Blondifyyn"}',
  1
FROM public.pages p WHERE p.slug = '/';

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'hero_subtitle',
  'Hero-alaotsikko', 
  'text',
  '{"text": "Täysin blondeihin erikoistunut kampaamo"}',
  2
FROM public.pages p WHERE p.slug = '/';

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow public read, admin only write)
CREATE POLICY "Anyone can view active pages" ON public.pages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all pages" ON public.pages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()
  ));

CREATE POLICY "Anyone can view active page sections" ON public.page_sections
  FOR SELECT USING (
    is_active = true AND 
    EXISTS (SELECT 1 FROM public.pages WHERE id = page_sections.page_id AND is_active = true)
  );

CREATE POLICY "Admins can manage all page sections" ON public.page_sections
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid()
  ));
