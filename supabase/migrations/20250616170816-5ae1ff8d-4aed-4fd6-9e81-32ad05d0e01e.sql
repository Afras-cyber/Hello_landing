
-- Poista duplikaatti stats osio ja säilytä vain stats_bar
DELETE FROM homepage_content WHERE section_name = 'stats' AND section_name != 'stats_bar';

-- Poista tuntematon services_intro osio
DELETE FROM homepage_content WHERE section_name = 'services_intro';

-- Korjaa display_order arvot jotta ne ovat järjestyksessä ja uniikkeja
UPDATE homepage_content SET display_order = 0 WHERE section_name = 'hero';
UPDATE homepage_content SET display_order = 1 WHERE section_name = 'stats_bar';
UPDATE homepage_content SET display_order = 2 WHERE section_name = 'featured_services';
UPDATE homepage_content SET display_order = 3 WHERE section_name = 'consultation_banner';
UPDATE homepage_content SET display_order = 4 WHERE section_name = 'project_list';
UPDATE homepage_content SET display_order = 5 WHERE section_name = 'clients_showcase';
UPDATE homepage_content SET display_order = 6 WHERE section_name = 'shades_tester';
UPDATE homepage_content SET display_order = 7 WHERE section_name = 'reviews_showcase';
UPDATE homepage_content SET display_order = 8 WHERE section_name = 'articles_section';
UPDATE homepage_content SET display_order = 9 WHERE section_name = 'brand_partners';

-- Varmista että kaikki osiot ovat aktiivisia
UPDATE homepage_content SET is_active = true WHERE is_active IS NULL OR is_active = false;
