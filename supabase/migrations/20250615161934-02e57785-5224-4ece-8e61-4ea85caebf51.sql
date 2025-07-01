
-- First, let's check if pages exist and add missing ones with correct slugs
INSERT INTO public.pages (slug, title, description, is_system_page, is_active) VALUES
('vastuullisuus', 'Vastuullisuus', 'Tietoa Blondifyn vastuullisista toimintaperiaatteista.', false, true),
('savyt', 'Tutki sävyjä', 'Tutustu hiussävyvaihtoehtoihin.', false, true),
('palvelut', 'Palvelut', 'Katso kaikki Blondifyn palvelut.', false, true),
('blonde-specialistit', 'Blonde Specialistit', 'Tapaa asiantuntevat vaalennusammattilaisemme.', false, true),
('varaa-aika', 'Varaa aika', 'Varaa aikasi kätevästi verkossa.', true, true),
('ukk', 'Usein kysytyt kysymykset', 'Löydä vastaukset yleisempiin kysymyksiin.', false, true),
('ura', 'Ura', 'Tule osaksi Blondifyn tiimiä.', false, true)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  is_system_page = EXCLUDED.is_system_page,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Add basic content sections for pages that need them
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'hero_title',
  'Hero otsikko',
  'text',
  jsonb_build_object('text', p.title),
  1
FROM public.pages p
WHERE p.slug IN ('vastuullisuus', 'savyt', 'palvelut', 'blonde-specialistit', 'ukk', 'ura')
ON CONFLICT DO NOTHING;

-- Add hero description sections
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'hero_description',
  'Hero kuvaus',
  'text',
  jsonb_build_object('text', p.description),
  2
FROM public.pages p
WHERE p.slug IN ('vastuullisuus', 'savyt', 'palvelut', 'blonde-specialistit', 'ukk', 'ura')
ON CONFLICT DO NOTHING;

-- Add main content sections for pages
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order) 
SELECT 
  p.id,
  'main_content',
  'Pääsisältö',
  'richtext',
  jsonb_build_object('text', '<p>Tämä on ' || p.title || ' sivun pääsisältö. Muokkaa tätä sisältöä hallintapaneelista.</p>'),
  3
FROM public.pages p
WHERE p.slug IN ('vastuullisuus', 'savyt', 'palvelut', 'blonde-specialistit', 'ukk', 'ura')
ON CONFLICT DO NOTHING;
