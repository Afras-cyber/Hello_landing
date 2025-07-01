
-- Add pages for newsletter, story and faq to the pages system
INSERT INTO pages (slug, title, description, is_system_page, is_active) VALUES 
  ('uutiskirje', 'Uutiskirje', 'Uutiskirjeen tilaussivu', false, true),
  ('tarina', 'Meidän tarinamme', 'Blondifyn tarina ja historia', false, true),
  ('ukk', 'Usein kysytyt kysymykset', 'FAQ-sivu', false, true)
ON CONFLICT (slug) DO NOTHING;

-- Add page sections for newsletter page
INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Hero otsikko', 'text', '{"text": "Tilaa uutiskirjeemme"}', 1, true
FROM pages p WHERE p.slug = 'uutiskirje'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_description', 'Hero kuvaus', 'text', '{"text": "Pysy ajan tasalla uusimmista vaaleiden hiusten trendeistä, saat eksklusiivisia tarjouksia ja asiantuntijavinkkejä suoraan sähköpostiisi"}', 2, true
FROM pages p WHERE p.slug = 'uutiskirje'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'benefits_title', 'Edut-osion otsikko', 'text', '{"text": "Mitä saat tilaajana?"}', 3, true
FROM pages p WHERE p.slug = 'uutiskirje'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'benefits_subtitle', 'Edut-osion alaotsikko', 'text', '{"text": "Liity yli 10,000 vaaleiden hiusten ystävän joukkoon"}', 4, true
FROM pages p WHERE p.slug = 'uutiskirje'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'form_title', 'Lomakkeen otsikko', 'text', '{"text": "Aloita tilaus"}', 5, true
FROM pages p WHERE p.slug = 'uutiskirje'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'form_description', 'Lomakkeen kuvaus', 'text', '{"text": "Täytä tiedot alle niin lähetämme sinulle ensimmäisen uutiskirjeen"}', 6, true
FROM pages p WHERE p.slug = 'uutiskirje'
ON CONFLICT DO NOTHING;

-- Add page sections for story page (updating existing data structure)
INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Hero otsikko', 'text', '{"text": "Meidän tarinamme"}', 1, true
FROM pages p WHERE p.slug = 'tarina'
ON CONFLICT DO NOTHING;

INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_description', 'Hero kuvaus', 'text', '{"text": "Intohimosta vaaleisiin hiuksiin syntyi Jätkäsaaren johtava vaaleiden hiusten erikoisliike"}', 2, true
FROM pages p WHERE p.slug = 'tarina'
ON CONFLICT DO NOTHING;

-- Ensure FAQ items are properly linked to the ukk page
UPDATE faq_items SET category = 'ukk' WHERE category IS NULL OR category = '';
