
-- Luodaan taulu uutiskirjeen tilauksille
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  subscription_source TEXT DEFAULT 'website',
  brevo_contact_id TEXT,
  brevo_list_id INTEGER,
  is_active BOOLEAN DEFAULT true,
  subscription_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lisätään RLS (Row Level Security)
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Luodaan policy joka sallii kaikkien lukea ja lisätä (julkinen tilaussivu)
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscriptions 
  FOR INSERT 
  WITH CHECK (true);

-- Luodaan policy joka sallii adminien lukea kaikki tilaukset
CREATE POLICY "Admins can view all subscriptions" 
  ON public.newsletter_subscriptions 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Luodaan policy joka sallii adminien päivittää tilauksia
CREATE POLICY "Admins can update subscriptions" 
  ON public.newsletter_subscriptions 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Lisätään indeksi sähköpostille
CREATE INDEX idx_newsletter_subscriptions_email ON public.newsletter_subscriptions(email);
CREATE INDEX idx_newsletter_subscriptions_active ON public.newsletter_subscriptions(is_active);
