
-- First, let's clean up the pages table by removing duplicates and keeping only the pages we want to edit
-- We'll keep only the specific pages that should be editable in the admin

-- Delete old/duplicate pages that we don't want in admin
DELETE FROM public.pages WHERE slug IN ('/', 'portfolio', 'faq', 'blogi', 'yhteystiedot');

-- Make sure we have the correct pages with proper settings
-- Update existing pages or insert if they don't exist
INSERT INTO public.pages (slug, title, description, is_system_page, is_active) VALUES
('vastuullisuus', 'Vastuullisuus', 'Tietoa Blondifyn vastuullisista toimintaperiaatteista.', false, true),
('savyt', 'Tutki sävyjä', 'Tutustu hiussävyvaihtoehtoihin.', false, true),
('palvelut', 'Palvelut', 'Katso kaikki Blondifyn palvelut.', false, true),
('blonde-specialistit', 'Blonde Specialistit', 'Tapaa asiantuntevat vaalennusammattilaisemme.', false, true),
('varaa-aika', 'Varaa aika', 'Varaa aikasi kätevästi verkossa.', false, true),
('ukk', 'Usein kysytyt kysymykset', 'Löydä vastaukset yleisempiin kysymyksiin.', false, true),
('ura', 'Ura', 'Tule osaksi Blondifyn tiimiä.', false, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_system_page = EXCLUDED.is_system_page,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Ensure all our target pages have basic content sections
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'hero_title',
  'Hero otsikko',
  'text',
  jsonb_build_object('text', p.title),
  1
FROM public.pages p
WHERE p.slug IN ('vastuullisuus', 'savyt', 'palvelut', 'blonde-specialistit', 'varaa-aika', 'ukk', 'ura')
  AND NOT EXISTS (
    SELECT 1 FROM public.page_sections ps 
    WHERE ps.page_id = p.id AND ps.section_key = 'hero_title'
  );

-- Add main content sections
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'main_content',
  'Pääsisältö',
  'richtext',
  jsonb_build_object('text', '<p>Tämä on ' || p.title || ' sivun pääsisältö. Muokkaa tätä sisältöä hallintapaneelista.</p>'),
  2
FROM public.pages p
WHERE p.slug IN ('vastuullisuus', 'savyt', 'palvelut', 'blonde-specialistit', 'varaa-aika', 'ukk', 'ura')
  AND NOT EXISTS (
    SELECT 1 FROM public.page_sections ps 
    WHERE ps.page_id = p.id AND ps.section_key = 'main_content'
  );
