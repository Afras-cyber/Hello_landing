
-- Update newsletter_settings table to include image support
ALTER TABLE newsletter_settings 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Tilaa uutiskirje'::text,
ADD COLUMN IF NOT EXISTS success_message TEXT DEFAULT 'Kiitos tilauksesta!'::text;

-- Create iframe_interactions table for tracking Timma calendar interactions
CREATE TABLE IF NOT EXISTS iframe_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL, -- 'click', 'form_fill', 'page_view', 'booking_confirmation'
  element_selector TEXT,
  element_text TEXT,
  x_coordinate INTEGER,
  y_coordinate INTEGER,
  timestamp_offset INTEGER NOT NULL,
  iframe_url TEXT,
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_iframe_interactions_session_type ON iframe_interactions(session_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_iframe_interactions_created_at ON iframe_interactions(created_at);

-- Update booking_conversions table to include more detailed tracking
ALTER TABLE booking_conversions 
ADD COLUMN IF NOT EXISTS booking_confirmation_detected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS timma_interaction_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_interaction_timestamp TIMESTAMP WITH TIME ZONE;

-- Create function to track iframe interactions
CREATE OR REPLACE FUNCTION track_iframe_interaction(
  p_session_id TEXT,
  p_interaction_type TEXT,
  p_element_selector TEXT DEFAULT NULL,
  p_element_text TEXT DEFAULT NULL,
  p_x_coordinate INTEGER DEFAULT NULL,
  p_y_coordinate INTEGER DEFAULT NULL,
  p_timestamp_offset INTEGER DEFAULT 0,
  p_iframe_url TEXT DEFAULT NULL,
  p_interaction_data JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  interaction_id UUID;
BEGIN
  INSERT INTO iframe_interactions (
    session_id,
    interaction_type,
    element_selector,
    element_text,
    x_coordinate,
    y_coordinate,
    timestamp_offset,
    iframe_url,
    interaction_data
  ) VALUES (
    p_session_id,
    p_interaction_type,
    p_element_selector,
    p_element_text,
    p_x_coordinate,
    p_y_coordinate,
    p_timestamp_offset,
    p_iframe_url,
    p_interaction_data
  ) RETURNING id INTO interaction_id;
  
  -- Update booking conversions if this is a booking confirmation
  IF p_interaction_type = 'booking_confirmation' THEN
    UPDATE booking_conversions 
    SET 
      booking_confirmation_detected = true,
      estimated_conversion = true,
      confidence_score = 0.95,
      last_interaction_timestamp = now()
    WHERE session_id = p_session_id;
    
    -- If no booking conversion record exists, create one
    IF NOT FOUND THEN
      INSERT INTO booking_conversions (
        session_id,
        booking_confirmation_detected,
        estimated_conversion,
        confidence_score,
        iframe_interactions,
        last_interaction_timestamp
      ) VALUES (
        p_session_id,
        true,
        true,
        0.95,
        1,
        now()
      );
    END IF;
  END IF;
  
  RETURN interaction_id;
END;
$$;
