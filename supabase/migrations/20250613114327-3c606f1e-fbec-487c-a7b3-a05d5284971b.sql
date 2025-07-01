
-- First, let's make sure we have the necessary tables and data for page content management

-- Insert pages if they don't exist
INSERT INTO pages (slug, title, description, is_active, is_system_page) 
VALUES 
  ('faq', 'Usein kysytyt kysymykset', 'UKK ja vastaukset', true, false),
  ('kampaamot', 'Kampaamot', 'Kampaamojen tiedot ja yhteystiedot', true, false),
  ('savyt', 'Sävykokeilu', 'Löydä täydellinen sävy hiuksillesi', true, false),
  ('palvelut', 'Palvelut', 'Blondifyn palveluvalikoima', true, false),
  ('blonde-specialistit', 'Blonde Specialistit', 'Tutustu asiantuntijoihimme', true, false)
ON CONFLICT (slug) DO NOTHING;

-- Add page sections for Services page
INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_title',
  'Palvelut - Pääotsikko',
  'text',
  '{"text": "Palvelut"}',
  1,
  true
FROM pages p WHERE p.slug = 'palvelut'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_description',
  'Palvelut - Kuvaus',
  'text',
  '{"text": "Erikoistumme vaaleisiin hiuksiin ja tarjoamme laajan valikoiman vaalennuspalveluita."}',
  2,
  true
FROM pages p WHERE p.slug = 'palvelut'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'services_section_title',
  'Palvelut - Osion otsikko',
  'text',
  '{"text": "Selaa palveluitamme kategorioittain"}',
  3,
  true
FROM pages p WHERE p.slug = 'palvelut'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'final_cta_title',
  'Valmis muutokseen - Otsikko',
  'text',
  '{"text": "Valmis muutokseen?"}',
  4,
  true
FROM pages p WHERE p.slug = 'palvelut'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'final_cta_description',
  'Valmis muutokseen - Kuvaus',
  'text',
  '{"text": "Ota yhteyttä ammattilaiseen ja löydä täydellinen palvelu sinun hiuksillesi."}',
  5,
  true
FROM pages p WHERE p.slug = 'palvelut'
ON CONFLICT DO NOTHING;

-- Add page sections for Shades Explorer
INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_title',
  'Sävykokeilu - Pääotsikko',
  'text',
  '{"text": "Sävykokeilu"}',
  1,
  true
FROM pages p WHERE p.slug = 'savyt'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_description',
  'Sävykokeilu - Kuvaus',
  'text',
  '{"text": "Löydä täydellinen sävy hiuksillesi. Kokeile eri sävyjä ja vertaile niitä keskenään."}',
  2,
  true
FROM pages p WHERE p.slug = 'savyt'
ON CONFLICT DO NOTHING;

-- Add page sections for Blonde Specialists
INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_title',
  'Blonde Specialistit - Pääotsikko',
  'text',
  '{"text": "Blonde Specialistit"}',
  1,
  true
FROM pages p WHERE p.slug = 'blonde-specialistit'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_description',
  'Blonde Specialistit - Kuvaus',
  'text',
  '{"text": "Tutustu huippuosaajiimme, joiden intohimona on luoda juuri sinulle täydelliset vaaleat hiukset"}',
  2,
  true
FROM pages p WHERE p.slug = 'blonde-specialistit'
ON CONFLICT DO NOTHING;

-- Add page sections for Salons/Kampaamot
INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_title',
  'Kampaamot - Pääotsikko',
  'text',
  '{"text": "Kampaamomme"}',
  1,
  true
FROM pages p WHERE p.slug = 'kampaamot'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT 
  p.id,
  'hero_description',
  'Kampaamot - Kuvaus',
  'text',
  '{"text": "Löydä lähin Blondify-kampaamo ja varaa aikasi huippuasiantuntijoillemme"}',
  2,
  true
FROM pages p WHERE p.slug = 'kampaamot'
ON CONFLICT DO NOTHING;

-- Add redirects for old URLs
INSERT INTO campaign_redirects (source_path, target_path, is_active, created_at, updated_at)
VALUES 
  ('/usein-kysytyt-kysymykset', '/faq', true, now(), now()),
  ('/salongit', '/kampaamot', true, now(), now())
ON CONFLICT (source_path) DO UPDATE SET
  target_path = EXCLUDED.target_path,
  is_active = EXCLUDED.is_active,
  updated_at = now();
