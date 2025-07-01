
-- Add missing routes to page_content table from App.tsx
INSERT INTO page_content (page_slug, page_title, content, meta_description, is_published) 
VALUES 
  ('/', 'Etusivu - Blondify', '{}', 'Pohjoismaiden #1 kampaamo blondeille. Vaalennus, balayage, raidat tai mikä tahansa muu ihana lopputulos.', true),
  ('/blonde-specialistit', 'Blonde Specialistit - Blondify', '{}', 'Tutustu ammattitaitoisiin blonde-specialisteihin ja valitse itsellesi sopiva kampaaja.', true),
  ('/palvelut', 'Palvelut - Blondify', '{}', 'Kaikki vaalennus- ja hiuspalvelumme yhdessä paikassa. Löydä itsellesi sopiva palvelu.', true),
  ('/varaa-aika', 'Varaa aika - Blondify', '{}', 'Varaa aika helposti verkossa. Valitse palvelu, aika ja kampaaja.', true),
  ('/tarina', 'Tarinamme - Blondify', '{}', 'Lue Blondifyn tarina ja tutus siihen mikä meitä motivoi.', true),
  ('/yhteystiedot', 'Yhteystiedot - Blondify', '{}', 'Ota yhteyttä Blondifyyn. Löydät meidät Helsingistä, Jatkasaaresta.', true),
  ('/usein-kysytyt-kysymykset', 'Usein kysytyt kysymykset - Blondify', '{}', 'Löydä vastaukset yleisimpiin kysymyksiin vaaleista hiuksista ja palveluistamme.', true),
  ('/artikkelit', 'Artikkelit - Blondify', '{}', 'Lue hyödyllisiä artikkeleita hiustenhoidosta ja vaalennuksesta.', true),
  ('/savymaailma', 'Sävymaailma - Blondify', '{}', 'Tutustu erilaisiin vaaleiden hiusten sävyihin ja löydä itsellesi sopiva.', true),
  ('/savyt', 'Sävyt - Blondify', '{}', 'Tutustu erilaisiin vaaleiden hiusten sävyihin ja löydä itsellesi sopiva.', true),
  ('/tiimi', 'Tiimi - Blondify', '{}', 'Tutustu Blondifyn ammattitaitoiseen tiimiin.', true),
  ('/blondify-tarina', 'Blondify tarina - Blondify', '{}', 'Lue Blondifyn tarina ja historia.', true),
  ('/portfolio', 'Portfolio - Blondify', '{}', 'Katso esimerkkejä töistämme ja inspiroidu.', true),
  ('/kampanjat', 'Kampanjat - Blondify', '{}', 'Tutustu ajankohtaisiin kampanjoihimme ja tarjouksiimme.', true),
  ('/vaalennus', 'Vaalennus - Blondify', '{}', 'Kaikki vaalennuspalvelumme yhdessä paikassa.', true),
  ('/raidoitus', 'Raidoitus - Blondify', '{}', 'Raidoituspalvelumme vaaleille hiuksille.', true),
  ('/yllapito', 'Ylläpito - Blondify', '{}', 'Vaaleiden hiusten ylläpitopalvelut.', true),
  ('/ura', 'Ura Blondifyssa - Blondify', '{}', 'Liity Blondifyn tiimiin. Katso avoimet työpaikat.', true),
  ('/vastuullisuus', 'Vastuullisuus - Blondify', '{}', 'Lue Blondifyn vastuullisuusperiaatteista.', true),
  ('/hinnasto', 'Hinnasto - Blondify', '{}', 'Blondifyn palveluiden hinnat ja tiedot.', true),
  ('/uutiskirje', 'Uutiskirje - Blondify', '{}', 'Tilaa Blondifyn uutiskirje ja saa alennuksia sekä hiusoppaita.', true),
  ('/blogi', 'Blogi - Blondify', '{}', 'Lue Blondifyn blogia hiustrendejä ja hoitoneuvoja.', true)
ON CONFLICT (page_slug) DO NOTHING;

-- Enhance campaigns table for better campaign page features
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS background_image text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS booking_calendar_enabled boolean DEFAULT true;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS featured_products jsonb DEFAULT '[]'::jsonb;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS campaign_text text;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS custom_styles jsonb DEFAULT '{}'::jsonb;

-- Add campaign analytics view for better performance
CREATE OR REPLACE VIEW campaign_performance AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.influencer_name,
  c.is_active,
  COALESCE(click_stats.total_clicks, 0) as total_clicks,
  COALESCE(conversion_stats.total_conversions, 0) as total_conversions,
  CASE 
    WHEN COALESCE(click_stats.total_clicks, 0) > 0 
    THEN ROUND((COALESCE(conversion_stats.total_conversions, 0)::decimal / click_stats.total_clicks * 100), 2)
    ELSE 0 
  END as conversion_rate
FROM campaigns c
LEFT JOIN (
  SELECT campaign_id, COUNT(*) as total_clicks
  FROM affiliate_clicks 
  GROUP BY campaign_id
) click_stats ON c.id = click_stats.campaign_id
LEFT JOIN (
  SELECT campaign_id, COUNT(*) as total_conversions
  FROM campaign_conversions 
  GROUP BY campaign_id
) conversion_stats ON c.id = conversion_stats.campaign_id;
