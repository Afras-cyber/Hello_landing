
-- Add testimonials for Monica (assuming her name is 'Monica' in team_members table)
INSERT INTO specialist_testimonials (
  specialist_id,
  customer_name,
  customer_age,
  testimonial_text,
  is_featured,
  created_at
) 
SELECT 
  tm.id,
  'Emma K.',
  28,
  'Monica on todella taitava ja ammattitaitoinen! Sain juuri sen vaalean sävyn mitä halusin. Suosittelen lämpimästi!',
  true,
  now()
FROM team_members tm 
WHERE tm.name ILIKE '%monica%'
LIMIT 1;

INSERT INTO specialist_testimonials (
  specialist_id,
  customer_name,
  customer_age,
  testimonial_text,
  is_featured,
  created_at
) 
SELECT 
  tm.id,
  'Liisa M.',
  35,
  'Erinomainen palvelu ja lopputulos ylitti odotukset. Monica kuunteli toiveitani ja toteutti ne täydellisesti.',
  false,
  now()
FROM team_members tm 
WHERE tm.name ILIKE '%monica%'
LIMIT 1;

INSERT INTO specialist_testimonials (
  specialist_id,
  customer_name,
  customer_age,
  testimonial_text,
  is_featured,
  created_at
) 
SELECT 
  tm.id,
  'Anna S.',
  24,
  'Hiukset näyttävät upealta! Monica on erittäin osaava ja ystävällinen. Tulen varmasti uudelleen.',
  false,
  now()
FROM team_members tm 
WHERE tm.name ILIKE '%monica%'
LIMIT 1;

INSERT INTO specialist_testimonials (
  specialist_id,
  customer_name,
  customer_age,
  testimonial_text,
  is_featured,
  created_at
) 
SELECT 
  tm.id,
  'Marja P.',
  42,
  'Ammattitaitoinen ja huolellinen työ. Monica neuvoi hyvin ja lopputulos on juuri sitä mitä toivoin.',
  false,
  now()
FROM team_members tm 
WHERE tm.name ILIKE '%monica%'
LIMIT 1;
