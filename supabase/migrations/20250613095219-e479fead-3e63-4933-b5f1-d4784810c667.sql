
-- First, let's add the vastuullisuus page if it doesn't exist
INSERT INTO public.pages (slug, title, description, is_system_page) 
VALUES ('vastuullisuus', 'Vastuullisuus', 'Vastuullisuus ja kestävä kehitys Blondifylla', false)
ON CONFLICT (slug) DO NOTHING;

-- Add content sections for the vastuullisuus page
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'hero_title',
  'Pääotsikko',
  'text',
  jsonb_build_object('text', 'Vastuullisuus'),
  1
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'hero_subtitle',
  'Alaotsikko',
  'text',
  jsonb_build_object('text', 'Haluamme tarjota kauniita hiuksia ympäristöä ja ihmisiä kunnioittaen'),
  2
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'intro_title',
  'Johdannon otsikko',
  'text',
  jsonb_build_object('text', 'Vastuullisuus Blondifylla'),
  3
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'intro_content',
  'Johdannon sisältö',
  'text',
  jsonb_build_object('text', 'Vaaleiden hiusten asiantuntijana ymmärrämme vastuumme sekä ympäristöä että asiakkaitamme kohtaan. Hiustenhoitoala käyttää perinteisesti paljon vettä, kemikaaleja ja energiaa, mutta olemme sitoutuneet tekemään parhaamme vähentääksemme ympäristövaikutuksiamme.

Olemme kehittäneet toimintaamme kestävämpään suuntaan monin tavoin, ja jatkamme jatkuvasti työtämme ympäristöjalanjälkemme pienentämiseksi. Samalla huolehdimme, että palvelumme laatu pysyy korkeana ja asiakkaiden hiukset terveinä.'),
  4
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'principles_title',
  'Periaatteiden otsikko',
  'text',
  jsonb_build_object('text', 'Kestävän kehityksen periaatteemme'),
  5
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'eco_products',
  'Ekologiset tuotteet',
  'text',
  jsonb_build_object('text', 'Käytämme mielellämme luonnonmukaisia ja eläinkokeettomuutta sekä kestävää kehitystä tukevia tuotteita. Kehitämme tietoisesti tuotevalikoimaamme ympäristöystävällisempään suuntaan.'),
  6
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'water_saving',
  'Veden säästö',
  'text',
  jsonb_build_object('text', 'Hiusten pesu kuluttaa paljon vettä. Käytämme vettä säästäviä suuttimia ja pesupaikkoja, ja huolehdimme, että vettä käytetään vain tarpeeseen.'),
  7
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'waste_sorting',
  'Jätteiden lajittelu',
  'text',
  jsonb_build_object('text', 'Jätteiden lajittelu on kampaamossamme arkipäivää. Lajittelemme muovit, metallit, pahvit ja kemialliset jätteet erikseen ja pyrimme jatkuvasti vähentämään kokonaisjätemäärää.'),
  8
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'energy_efficiency',
  'Energiatehokkuus',
  'text',
  jsonb_build_object('text', 'Olemme siirtyneet energiatehokkaisiin LED-valoihin ja käytämme mahdollisimman paljon energiatehokkaita laitteita. Sähkösopimuksemme perustuu uusiutuviin energialähteisiin.'),
  9
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'education',
  'Koulutus ja tietoisuus',
  'text',
  jsonb_build_object('text', 'Koulutamme henkilökuntaamme säännöllisesti kestäviin työskentelytapoihin ja kerromme asiakkaillemme avoimesti ympäristötyöstämme.'),
  10
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'eco_alternatives',
  'Ekologiset vaihtoehdot',
  'text',
  jsonb_build_object('text', 'Tarjoamme asiakkaillemme tietoa ja vaihtoehtoja ekologisempiin hiustenhoitoratkaisuihin, mukaan lukien ympäristöystävälliset kotihoitotuotteet ja kestävät hiustenhoidon käytännöt.'),
  11
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order)
SELECT 
  p.id,
  'commitment',
  'Sitoutuminen kestävään kauneuteen',
  'text',
  jsonb_build_object('text', 'Vastuullisuus on meille jatkuva kehitysprosessi. Otamme mielellämme vastaan ideoita ja palautetta siitä, miten voisimme tehdä toiminnastamme entistä ympäristöystävällisempää.'),
  12
FROM public.pages p
WHERE p.slug = 'vastuullisuus'
ON CONFLICT DO NOTHING;
