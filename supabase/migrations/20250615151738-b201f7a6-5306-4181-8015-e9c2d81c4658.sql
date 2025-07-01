
-- Create new pages if they don't exist
INSERT INTO public.pages (slug, title, description, is_active, is_system_page) VALUES
('tarina', 'Meidän tarinamme', 'Blondifyn tarina', true, false),
('meista', 'Meistä', 'Tietoa Blondifysta', true, false),
('tiimi', 'Tiimi', 'Blondifyn tiimi', true, false)
ON CONFLICT (slug) DO NOTHING;

-- Update existing pages to be non-system pages if they exist
UPDATE public.pages SET is_system_page = false WHERE slug IN ('vastuullisuus', 'blogi', 'yhteystiedot');


-- Add default content for 'tarina' (StoryPage)
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Sivun pääotsikko', 'text', jsonb_build_object('text', 'Meidän tarinamme'), 1, true FROM public.pages p WHERE p.slug = 'tarina' ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_subtitle', 'Sivun alaotsikko', 'text', jsonb_build_object('text', 'Intohimosta vaaleisiin hiuksiin syntyi Jätkäsaaren johtava vaaleiden hiusten erikoisliike'), 2, true FROM public.pages p WHERE p.slug = 'tarina' ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_title', 'Esittelyn otsikko', 'text', jsonb_build_object('text', 'Kuinka kaikki alkoi'), 3, true FROM public.pages p WHERE p.slug = 'tarina' ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_content', 'Esittelyn sisältö', 'richtext', jsonb_build_object('text', '<p>Blondify syntyi vuonna 2022 perustajamme Vilma Kotron intohimosta vaaleisiin hiuksiin ja täydellisyyden tavoittelusta. Vilma oli työskennellyt pitkään kampaajana ja erikoistunut vaalennuksiin, mutta hän näki markkinoilla aukon: ei ollut olemassa kampaamoa, joka olisi keskittynyt pelkästään vaaleisiin hiuksiin ja niiden ylläpitoon.</p><p>Vilman visio oli luoda paikka, jossa vaaleiden hiusten rakastajat saisivat parhaan mahdollisen palvelun ilman kompromisseja. Hän tiesi, että vaalennukset ovat teknisesti vaativia ja vaativat erikoisosaamista, jota ei kaikilla yleiskampaajilla ole.</p><p>Ensimmäinen ja ainoa Blondify avattiin Helsingin Jätkäsaareen Atlantinkadulle vuonna 2022, ja se sai nopeasti mainetta laadukkaista vaalennuksistaan ja hiusten kuntoa kunnioittavasta lähestymistavastaan. Asiakkaat arvostavat sitä, että kaikki kampaajamme ovat erikoistuneet nimenomaan vaaleisiin hiuksiin.</p>'), 4, true FROM public.pages p WHERE p.slug = 'tarina' ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'today_title', 'Blondify tänään -otsikko', 'text', jsonb_build_object('text', 'Blondify tänään'), 5, true FROM public.pages p WHERE p.slug = 'tarina' ON CONFLICT DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'today_content', 'Blondify tänään -sisältö', 'richtext', jsonb_build_object('text', '<p>Tänään Blondify on Jätkäsaaren johtava vaaleiden hiusten asiantuntijaliike. Toimimme Atlantinkatu 16 osoitteessa, jossa tarjoamme parasta osaamista ja palvelua vaaleista hiuksista kiinnostuneille. Arvostamme laatua, jatkuvaa oppimista, hiusten terveyttä ja henkilökohtaista palvelua. Tavoitteemme on olla edelläkävijä vastuullisessa kauneudenhoitoalassa.</p>'), 6, true FROM public.pages p WHERE p.slug = 'tarina' ON CONFLICT DO NOTHING;


-- Add default content for 'vastuullisuus' (Sustainability)
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Sivun pääotsikko', 'text', jsonb_build_object('text', 'Vastuullisuus'), 1, true FROM public.pages p WHERE p.slug = 'vastuullisuus' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_subtitle', 'Sivun alaotsikko', 'text', jsonb_build_object('text', 'Haluamme tarjota kauniita hiuksia ympäristöä ja ihmisiä kunnioittaen'), 2, true FROM public.pages p WHERE p.slug = 'vastuullisuus' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_title', 'Esittely-otsikko', 'text', jsonb_build_object('text', 'Vastuullisuus Blondifylla'), 3, true FROM public.pages p WHERE p.slug = 'vastuullisuus' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_content', 'Esittely-sisältö', 'richtext', jsonb_build_object('text', '<p>Vaaleiden hiusten asiantuntijana ymmärrämme vastuumme sekä ympäristöä että asiakkaitamme kohtaan. Hiustenhoitoala käyttää perinteisesti paljon vettä, kemikaaleja ja energiaa, mutta olemme sitoutuneet tekemään parhaamme vähentääksemme ympäristövaikutuksiamme.</p><p>Olemme kehittäneet toimintaamme kestävämpään suuntaan monin tavoin, ja jatkamme jatkuvasti työtämme ympäristöjalanjälkemme pienentämiseksi. Samalla huolehdimme, että palvelumme laatu pysyy korkeana ja asiakkaiden hiukset terveinä.</p>'), 4, true FROM public.pages p WHERE p.slug = 'vastuullisuus' ON CONFLICT (page_id, section_key) DO UPDATE SET content_type = 'richtext', content = EXCLUDED.content;


-- Add content for 'blogi'
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Blogin pääotsikko', 'text', jsonb_build_object('text', 'Blogi'), 1, true FROM public.pages p WHERE p.slug = 'blogi' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_content', 'Blogin esittelyteksti', 'text', jsonb_build_object('text', 'Tämä sivu on kehityksen alla. Tarkempi sisältö tulee myöhemmin.'), 2, true FROM public.pages p WHERE p.slug = 'blogi' ON CONFLICT (page_id, section_key) DO NOTHING;


-- Add content for 'tiimi'
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Tiimi-sivun pääotsikko', 'text', jsonb_build_object('text', 'Tiimi'), 1, true FROM public.pages p WHERE p.slug = 'tiimi' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_content', 'Tiimi-sivun esittelyteksti', 'text', jsonb_build_object('text', 'Tämä sivu on kehityksen alla. Tarkempi sisältö tulee myöhemmin.'), 2, true FROM public.pages p WHERE p.slug = 'tiimi' ON CONFLICT (page_id, section_key) DO NOTHING;


-- Add content for 'meista' (About)
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Meistä-sivun pääotsikko', 'text', jsonb_build_object('text', 'Meistä'), 1, true FROM public.pages p WHERE p.slug = 'meista' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'intro_content', 'Meistä-sivun esittelyteksti', 'text', jsonb_build_object('text', 'Tämä sivu on kehityksen alla. Tarkempi sisältö tulee myöhemmin.'), 2, true FROM public.pages p WHERE p.slug = 'meista' ON CONFLICT (page_id, section_key) DO NOTHING;


-- Add content for 'yhteystiedot' (Contact)
INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_title', 'Yhteystiedot-sivun pääotsikko', 'text', jsonb_build_object('text', 'Yhteystiedot'), 1, true FROM public.pages p WHERE p.slug = 'yhteystiedot' ON CONFLICT (page_id, section_key) DO NOTHING;

INSERT INTO public.page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
SELECT p.id, 'hero_subtitle', 'Yhteystiedot-sivun alaotsikko', 'text', jsonb_build_object('text', 'Ota yhteyttä Blondifyn tiimiin'), 2, true FROM public.pages p WHERE p.slug = 'yhteystiedot' ON CONFLICT (page_id, section_key) DO NOTHING;
