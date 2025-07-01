
-- Create global_settings table for storing site-wide configuration
CREATE TABLE public.global_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert some default settings
INSERT INTO public.global_settings (key, value, category, description) VALUES
  ('site_name', '"Blondify"', 'general', 'Website name'),
  ('site_description', '"Vaaleita hiuksia erikoisliike Jätkäsaaressa"', 'general', 'Website description'),
  ('primary_color', '"#0099cc"', 'design', 'Primary brand color'),
  ('accent_color', '"#ff6b6b"', 'design', 'Accent color'),
  ('company_phone', '"+358 XX XXX XXXX"', 'contact', 'Company phone number'),
  ('company_email', '"info@blondify.fi"', 'contact', 'Company email'),
  ('company_address', '"Jätkäsaari, Helsinki"', 'contact', 'Company address'),
  ('instagram_url', '""', 'social', 'Instagram profile URL'),
  ('facebook_url', '""', 'social', 'Facebook profile URL'),
  ('tiktok_url', '""', 'social', 'TikTok profile URL');

-- Enable RLS
ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to manage global settings
CREATE POLICY "Admin users can manage global settings" ON public.global_settings
  FOR ALL USING (is_admin());
