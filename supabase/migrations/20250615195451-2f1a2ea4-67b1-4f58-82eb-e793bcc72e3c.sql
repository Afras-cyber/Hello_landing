
-- Add more specific page sections for the career page ('ura')
-- This will allow for more granular control over the content from the admin panel.

DO $$
DECLARE
  ura_page_id UUID;
BEGIN
  -- Get the ID for the 'ura' page
  SELECT id INTO ura_page_id FROM pages WHERE slug = 'ura' LIMIT 1;

  IF ura_page_id IS NOT NULL THEN
    -- Why work at Blondify Title
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'why_work_title', 'Miksi työskennellä - Otsikko', 'text', '{"text": "Miksi työskennellä Blondifylla?"}', 10, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Miksi työskennellä Blondifylla?"}', section_name = 'Miksi työskennellä - Otsikko';

    -- Why work at Blondify Description
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'why_work_description', 'Miksi työskennellä - Kuvaus', 'richtext', '{"text": "<p>Blondify on erikoistunut vaaleiden hiusten kampaamoketju, jossa arvostamme ammattitaitoa, jatkuvaa kehittymistä ja asiakastyytyväisyyttä. Tarjoamme työntekijöillemme mahdollisuuden kehittyä alansa huippuosaajiksi ja työskennellä modernissa, inspiroivassa ympäristössä. Blondifylla on tavoitteena kasvaa Pohjoimaiden parhaimmaksi vaaleiden hiusten kampaamoketjuksi, joten urapolun ei tarvitse rajoittua vain kampaamossa toimivaksi Blonde Specialistiksi.</p>"}', 11, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "<p>Blondify on erikoistunut vaaleiden hiusten kampaamoketju, jossa arvostamme ammattitaitoa, jatkuvaa kehittymistä ja asiakastyytyväisyyttä. Tarjoamme työntekijöillemme mahdollisuuden kehittyä alansa huippuosaajiksi ja työskennellä modernissa, inspiroivassa ympäristössä. Blondifylla on tavoitteena kasvaa Pohjoimaiden parhaimmaksi vaaleiden hiusten kampaamoketjuksi, joten urapolun ei tarvitse rajoittua vain kampaamossa toimivaksi Blonde Specialistiksi.</p>"}', section_name = 'Miksi työskennellä - Kuvaus';

    -- Benefits Title
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'benefits_title', 'Edut - Otsikko', 'text', '{"text": "Edut"}', 12, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Edut"}', section_name = 'Edut - Otsikko';

    -- Benefits List
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'benefits_list', 'Edut - Lista', 'richtext', '{"text": "<ul><li>Jatkuva koulutus ja ammatillinen kehitys</li><li>Kilpailukykyinen palkka ja bonusjärjestelmä</li><li>Moderni työympäristö ja huippuluokan työvälineet</li><li>Yhteisöllinen ja kannustava työilmapiiri</li><li>Joustavat työajat ja yrittäjän etuudet</li></ul>"}', 13, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "<ul><li>Jatkuva koulutus ja ammatillinen kehitys</li><li>Kilpailukykyinen palkka ja bonusjärjestelmä</li><li>Moderni työympäristö ja huippuluokan työvälineet</li><li>Yhteisöllinen ja kannustava työilmapiiri</li><li>Joustavat työajat ja yrittäjän etuudet</li></ul>"}', section_name = 'Edut - Lista';
    
    -- Open Application Title
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'open_app_title', 'Avoin hakemus - Otsikko', 'text', '{"text": "Eikö sopivaa paikkaa ole avoinna?"}', 14, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Eikö sopivaa paikkaa ole avoinna?"}', section_name = 'Avoin hakemus - Otsikko';

    -- Open Application Description
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'open_app_description', 'Avoin hakemus - Kuvaus', 'text', '{"text": "Olemme aina kiinnostuneita tapaamaan osaavia ja innostuneita alan ammattilaisia. Lähetä avoin hakemus, niin otamme sinuun yhteyttä!"}', 15, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Olemme aina kiinnostuneita tapaamaan osaavia ja innostuneita alan ammattilaisia. Lähetä avoin hakemus, niin otamme sinuun yhteyttä!"}', section_name = 'Avoin hakemus - Kuvaus';
    
    -- Open Application Button Text
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'open_app_button', 'Avoin hakemus - Nappi', 'text', '{"text": "Lähetä avoin hakemus"}', 16, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Lähetä avoin hakemus"}', section_name = 'Avoin hakemus - Nappi';

    -- Open Positions Title
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'open_positions_title', 'Avoimet työpaikat - Otsikko', 'text', '{"text": "Avoimet työpaikat"}', 17, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Avoimet työpaikat"}', section_name = 'Avoimet työpaikat - Otsikko';
    
    -- No open positions text
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'no_open_positions', 'Ei avoimia paikkoja - Teksti', 'text', '{"text": "Ei avoimia työpaikkoja tällä hetkellä. Lähetä avoin hakemus kiinnostuksestasi!"}', 18, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Ei avoimia työpaikkoja tällä hetkellä. Lähetä avoin hakemus kiinnostuksestasi!"}', section_name = 'Ei avoimia paikkoja - Teksti';
    
    -- Error loading text
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'error_loading_title', 'Virhe ladatessa - Otsikko', 'text', '{"text": "Virhe ladattaessa työpaikkoja"}', 19, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Virhe ladattaessa työpaikkoja"}', section_name = 'Virhe ladatessa - Otsikko';
    
    INSERT INTO page_sections (page_id, section_key, section_name, content_type, content, display_order, is_active)
    VALUES (ura_page_id, 'error_loading_description', 'Virhe ladatessa - Kuvaus', 'text', '{"text": "Yritä päivittää sivu tai tarkista yhteytesi."}', 20, true)
    ON CONFLICT (page_id, section_key) DO UPDATE SET content = '{"text": "Yritä päivittää sivu tai tarkista yhteytesi."}', section_name = 'Virhe ladatessa - Kuvaus';

    -- Hero section content from existing component
    UPDATE page_sections
    SET content = '{"text": "Ura Blondifylla"}'
    WHERE page_id = ura_page_id AND section_key = 'hero_title';

    UPDATE page_sections
    SET content = '{"text": "Liity Suomen vaaleimpien hiusten asiantuntijatiimiin ja kehitä osaamistasi huippuammattilaisten seurassa"}'
    WHERE page_id = ura_page_id AND section_key = 'hero_description';

  END IF;
END $$;
