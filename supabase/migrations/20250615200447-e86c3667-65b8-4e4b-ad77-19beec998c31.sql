
INSERT INTO global_settings (key, value, category, description)
VALUES 
  ('articles_newsletter_title', '{"value": "Saa alennuksia ja hiusoppaita"}', 'Uutiskirje (Artikkelit-sivu)', 'Otsikko artikkelisivun uutiskirje-osioon.'),
  ('articles_newsletter_description', '{"value": "Tilaa uutiskirjeemme ja saat ensimmäisenä tietää uusimmista palveluista, sesongin trendeistä sekä yksinoikeudella alennuksia ja etuja."}', 'Uutiskirje (Artikkelit-sivu)', 'Kuvaus artikkelisivun uutiskirje-osioon.'),
  ('articles_newsletter_image_url', '{"value": "https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"}', 'Uutiskirje (Artikkelit-sivu)', 'Kuvan URL artikkelisivun uutiskirje-osioon.'),
  ('articles_newsletter_button_text', '{"value": "Tilaa uutiskirje"}', 'Uutiskirje (Artikkelit-sivu)', 'Painikkeen teksti artikkelisivun uutiskirje-osioon.'),
  ('articles_newsletter_privacy_text', '{"value": "Voit perua tilauksesi milloin tahansa. Emme koskaan jaa tietojasi kolmansille osapuolille."}', 'Uutiskirje (Artikkelit-sivu)', 'Yksityisyysteksti artikkelisivun uutiskirje-osioon.'),
  ('articles_newsletter_brevo_list_id', '{"value": 42}', 'Uutiskirje (Artikkelit-sivu)', 'Brevo-listan ID artikkelisivun uutiskirje-osioon.')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  category = EXCLUDED.category,
  description = EXCLUDED.description;
