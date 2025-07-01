
-- Add campaign banner data to homepage_content table
INSERT INTO public.homepage_content (
  section_name,
  content,
  is_active,
  display_order,
  color_scheme,
  layout_settings
) VALUES (
  'campaign_banner',
  '{
    "text": "🎉 Syksyn erikoistarjous! Saa 20% alennus kaikista vaalennuspalveluista - Varaa aikasi nyt!",
    "link_url": "/varaa-aika",
    "link_text": "Varaa aika",
    "target_blank": false
  }',
  false,
  -1,
  '{
    "background_color": "#3B82F6",
    "text_color": "#FFFFFF",
    "link_color": "#FFFFFF"
  }',
  '{
    "closeable": true,
    "sticky": true
  }'
)
ON CONFLICT (section_name) DO UPDATE SET
  content = EXCLUDED.content,
  color_scheme = EXCLUDED.color_scheme,
  layout_settings = EXCLUDED.layout_settings,
  updated_at = now()
WHERE homepage_content.section_name = 'campaign_banner';
