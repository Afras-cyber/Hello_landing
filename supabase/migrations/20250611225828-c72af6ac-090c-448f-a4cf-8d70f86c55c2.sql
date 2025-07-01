
-- Add slug column to articles table
ALTER TABLE public.articles ADD COLUMN slug text;

-- Function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[åäöÅÄÖ]', 'a', 'g'),
        '[^a-zA-Z0-9\s]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Generate slugs for existing articles based on their titles
UPDATE public.articles 
SET slug = generate_slug(title) 
WHERE slug IS NULL;

-- Create unique constraint on slug
ALTER TABLE public.articles ADD CONSTRAINT articles_slug_unique UNIQUE (slug);

-- Function to automatically generate slug on insert/update
CREATE OR REPLACE FUNCTION articles_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  
  -- Ensure uniqueness by appending number if needed
  WHILE EXISTS(SELECT 1 FROM articles WHERE slug = NEW.slug AND id != NEW.id) LOOP
    NEW.slug := NEW.slug || '-' || floor(random() * 1000 + 1)::text;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate slugs
CREATE TRIGGER articles_slug_trigger
  BEFORE INSERT OR UPDATE ON public.articles
  FOR EACH ROW
  EXECUTE FUNCTION articles_generate_slug();
