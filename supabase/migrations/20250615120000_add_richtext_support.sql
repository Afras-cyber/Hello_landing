
-- This migration updates the content type of a specific page section to 'richtext'
-- to demonstrate and enable the new rich text editing capabilities in the admin panel.

-- Update the 'intro_content' section of the 'Vastuullisuus' page to use 'richtext'.
UPDATE public.page_sections
SET content_type = 'richtext'
WHERE 
  section_key = 'intro_content' AND 
  page_id = (SELECT id from public.pages WHERE slug = 'vastuullisuus');

