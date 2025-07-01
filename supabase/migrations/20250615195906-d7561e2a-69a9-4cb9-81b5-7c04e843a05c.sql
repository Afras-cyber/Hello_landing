
DO $$
DECLARE
  tarina_page_id UUID;
BEGIN
  -- Get the ID for the 'tarina' page
  SELECT id INTO tarina_page_id FROM pages WHERE slug = 'tarina' LIMIT 1;

  IF tarina_page_id IS NOT NULL THEN
    -- Update hero
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'hero_title', 'Hero - Otsikko', 'text', '{"text": "Blondify – Vaaleiden hiusten asiantuntijat"}', 1, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Blondify – Vaaleiden hiusten asiantuntijat"}', section_name = 'Hero - Otsikko';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'hero_description', 'Hero - Kuvaus', 'text', '{"text": "halusin paikan josta löydät kaikki vaaleiden hiusten palvelut - laadukkaasti ja turvallisesti"}', 2, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "halusin paikan josta löydät kaikki vaaleiden hiusten palvelut - laadukkaasti ja turvallisesti"}', section_name = 'Hero - Kuvaus';

    -- Section 1: Kuinka kaikki alkoi
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section1_title', 'Osa 1 - Otsikko', 'text', '{"text": "Kuinka kaikki alkoi"}', 3, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Kuinka kaikki alkoi"}', section_name = 'Osa 1 - Otsikko';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section1_content', 'Osa 1 - Sisältö', 'richtext', '{"text": "<p>Blondify sai alkunsa helmikuussa 2022, kun huomasin omien vaaleiden hiusteni katkenneen kampaamossa vaalennuksen jäljiltä. Mietin, miksi ei ole kampaamoa, joka keskittyisi pelkästään vaaleisiin hiuksiin ja niiden erityistarpeisiin. Ratkaisin ongelman perustamalla sellaisen itse.</p>"}', 4, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "<p>Blondify sai alkunsa helmikuussa 2022, kun huomasin omien vaaleiden hiusteni katkenneen kampaamossa vaalennuksen jäljiltä. Mietin, miksi ei ole kampaamoa, joka keskittyisi pelkästään vaaleisiin hiuksiin ja niiden erityistarpeisiin. Ratkaisin ongelman perustamalla sellaisen itse.</p>"}', section_name = 'Osa 1 - Sisältö';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section1_image_url', 'Osa 1 - Kuvan URL', 'text', '{"text": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/images/vilma-kotro.webp"}', 5, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "https://faytlsrwiszkvakznkux.supabase.co/storage/v1/object/public/media/images/vilma-kotro.webp"}', section_name = 'Osa 1 - Kuvan URL';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section1_image_alt', 'Osa 1 - Kuvan alt-teksti', 'text', '{"text": "Vilma Kotro, Blondifyn perustaja ja toimitusjohtaja"}', 6, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Vilma Kotro, Blondifyn perustaja ja toimitusjohtaja"}', section_name = 'Osa 1 - Kuvan alt-teksti';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section1_image_caption', 'Osa 1 - Kuvan kuvateksti', 'text', '{"text": "Vilma Kotro, 24, Founder & CEO, Blondify"}', 7, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Vilma Kotro, 24, Founder & CEO, Blondify"}', section_name = 'Osa 1 - Kuvan kuvateksti';

    -- Section 2: Laadun varmistus
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section2_title', 'Osa 2 - Otsikko', 'text', '{"text": "Laadun varmistus"}', 8, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Laadun varmistus"}', section_name = 'Osa 2 - Otsikko';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section2_content', 'Osa 2 - Sisältö', 'richtext', '{"text": "<p>Havaitsimme vuonna 2024, ettei pelkkä työkokemus ja hienot tittelit riitä saavuttamaan parasta tasoa. Siksi kehitimme Blonde Specialistin -koulutuksen, jonka jokainen Blondifyn- kampaaja suorittaa ennen itsenäisen työn aloittamista. Koulutus sisältää:</p><ul><li>Teoriaosuuden hiuksista ja vaalennuksista</li><li>Käytännön harjoituksia ja kokeita</li><li>Junior Blonde Specialist -harjoittelujakson</li></ul><p>Vasta hyväksytysti suoritetun ohjelman jälkeen Blonde Specialisti työskentelee itsenäisesti asiakkaidemme parissa.</p>"}', 9, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "<p>Havaitsimme vuonna 2024, ettei pelkkä työkokemus ja hienot tittelit riitä saavuttamaan parasta tasoa. Siksi kehitimme Blonde Specialistin -koulutuksen, jonka jokainen Blondifyn- kampaaja suorittaa ennen itsenäisen työn aloittamista. Koulutus sisältää:</p><ul><li>Teoriaosuuden hiuksista ja vaalennuksista</li><li>Käytännön harjoituksia ja kokeita</li><li>Junior Blonde Specialist -harjoittelujakson</li></ul><p>Vasta hyväksytysti suoritetun ohjelman jälkeen Blonde Specialisti työskentelee itsenäisesti asiakkaidemme parissa.</p>"}', section_name = 'Osa 2 - Sisältö';
    
    -- Section 3: Tulevaisuus
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section3_title', 'Osa 3 - Otsikko', 'text', '{"text": "Tulevaisuus"}', 10, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Tulevaisuus"}', section_name = 'Osa 3 - Otsikko';

    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'section3_content', 'Osa 3 - Sisältö', 'richtext', '{"text": "<p>Kasvatamme ja kehitämme koko ajan yritystä Pohjoismaiden parhaimmaksi ja luotettavimmaksi vaaleiden hiusten kampaamoksi, jotta kaikille Pohjoismaalaisille blondeille löytyisi turvallinen ja laadukas paikka. Tervetuloa Blondifyyn toteuttamaan oma blondiunelmasi.</p>"}', 11, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "<p>Kasvatamme ja kehitämme koko ajan yritystä Pohjoismaiden parhaimmaksi ja luotettavimmaksi vaaleiden hiusten kampaamoksi, jotta kaikille Pohjoismaalaisille blondeille löytyisi turvallinen ja laadukas paikka. Tervetuloa Blondifyyn toteuttamaan oma blondiunelmasi.</p>"}', section_name = 'Osa 3 - Sisältö';

    -- CTA Button
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (tarina_page_id, 'cta_button_text', 'Toimintakehote - Nappi', 'text', '{"text": "Varaa aika luoksemme"}', 12, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Varaa aika luoksemme"}', section_name = 'Toimintakehote - Nappi';

  END IF;
END $$;
