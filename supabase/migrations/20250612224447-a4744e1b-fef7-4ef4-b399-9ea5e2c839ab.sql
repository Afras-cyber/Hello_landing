
-- First, let's clean up duplicate conversions and then apply the constraints
-- Keep only the most recent conversion per session_id
DELETE FROM booking_conversions 
WHERE id NOT IN (
  SELECT DISTINCT ON (session_id) id
  FROM booking_conversions 
  ORDER BY session_id, created_at DESC
);

-- Now add the unique constraint
ALTER TABLE booking_conversions 
ADD CONSTRAINT unique_session_conversion 
UNIQUE (session_id);

-- Add missing columns for better tracking
ALTER TABLE booking_conversions 
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS manually_verified boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_notes text,
ADD COLUMN IF NOT EXISTS admin_verified_by uuid,
ADD COLUMN IF NOT EXISTS admin_verified_at timestamp with time zone;

-- Create table for head scripts management
CREATE TABLE IF NOT EXISTS head_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  script_content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  script_type text NOT NULL DEFAULT 'custom',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

-- Add RLS policies for head_scripts (admin only)
ALTER TABLE head_scripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage head scripts" ON head_scripts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE admin_users.id = auth.uid()
  )
);

-- Update iframe_interactions to better track Timma-specific data
ALTER TABLE iframe_interactions 
ADD COLUMN IF NOT EXISTS confidence_level numeric(3,2) DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS is_booking_related boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS booking_step text;

-- Create function to get validated Timma conversions
CREATE OR REPLACE FUNCTION get_validated_timma_conversions()
RETURNS TABLE (
  id uuid,
  session_id text,
  created_at timestamp with time zone,
  confidence_score numeric,
  booking_confirmation_detected boolean,
  estimated_conversion boolean,
  manually_verified boolean,
  iframe_interactions integer,
  booking_page_time integer,
  utm_source text,
  utm_medium text,
  utm_campaign text
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.id,
    bc.session_id,
    bc.created_at,
    bc.confidence_score,
    bc.booking_confirmation_detected,
    bc.estimated_conversion,
    bc.manually_verified,
    bc.iframe_interactions,
    bc.booking_page_time,
    bc.utm_source,
    bc.utm_medium,
    bc.utm_campaign
  FROM booking_conversions bc
  WHERE 
    (bc.booking_confirmation_detected = true OR bc.manually_verified = true)
    AND bc.confidence_score > 0.7
  ORDER BY bc.created_at DESC;
END;
$$;
