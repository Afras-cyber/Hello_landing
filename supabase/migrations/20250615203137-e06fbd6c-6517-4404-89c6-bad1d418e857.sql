
-- Create a new unified table for all portfolio-related images
CREATE TABLE public.unified_portfolio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('portfolio', 'client_showcase', 'homepage')),
    category TEXT,
    alt_text TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments to columns for better understanding
COMMENT ON COLUMN public.unified_portfolio.source_type IS 'Type of image source (e.g., portfolio, client_showcase, homepage)';
COMMENT ON COLUMN public.unified_portfolio.display_order IS 'Order for displaying images in galleries';
COMMENT ON COLUMN public.unified_portfolio.is_featured IS 'Mark image as featured to highlight it';

-- Enable Row-Level Security
ALTER TABLE public.unified_portfolio ENABLE ROW LEVEL SECURITY;

-- Allow admin users full access to the table
CREATE POLICY "Allow full access to admins"
ON public.unified_portfolio
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Allow public read access for displaying images on the site
CREATE POLICY "Allow public read access"
ON public.unified_portfolio
FOR SELECT
USING (true);

-- Create a function to automatically update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION set_updated_at_on_unified_portfolio()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger that uses the function to update the timestamp on any row update
CREATE TRIGGER handle_unified_portfolio_update
BEFORE UPDATE ON public.unified_portfolio
FOR EACH ROW
EXECUTE FUNCTION set_updated_at_on_unified_portfolio();

-- Migrate existing data from the old 'portfolio' table to the new 'unified_portfolio' table
INSERT INTO public.unified_portfolio (id, image_url, alt_text, category, created_at, updated_at, source_type, is_featured, display_order)
SELECT id, image_url, alt_text, category, created_at, created_at, 'portfolio', false, 0
FROM public.portfolio
ON CONFLICT (id) DO NOTHING;
