
-- Create enhanced booking details table to store extracted booking information
CREATE TABLE public.enhanced_booking_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  service_names TEXT[],
  service_prices NUMERIC[],
  total_amount NUMERIC,
  booking_date TIMESTAMP WITH TIME ZONE,
  appointment_date TIMESTAMP WITH TIME ZONE,
  appointment_time TEXT,
  location TEXT,
  cancellation_policy TEXT,
  extracted_text TEXT,
  raw_ocr_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_enhanced_booking_session_id ON enhanced_booking_details(session_id);

-- Update the analyze_screenshot_conversion function to extract detailed booking information
CREATE OR REPLACE FUNCTION public.analyze_screenshot_conversion(
  p_session_id text, 
  p_screenshot_path text, 
  p_ocr_text text, 
  p_extracted_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  recording_id uuid;
  local_confidence_score numeric := 0;
  conversion_detected boolean := false;
  keywords_found text[] := ARRAY[]::text[];
  
  -- Enhanced extraction variables
  service_names text[] := ARRAY[]::text[];
  service_prices numeric[] := ARRAY[]::numeric[];
  total_amount numeric;
  customer_name text;
  customer_email text;
  appointment_date_text text;
  appointment_time_text text;
  location_text text;
  
BEGIN
  -- Finnish conversion keywords
  IF p_ocr_text ILIKE '%varauksesi on nyt vahvistettu%' OR
     p_ocr_text ILIKE '%varaus vahvistettu%' OR
     p_ocr_text ILIKE '%kiitos varauksesta%' OR
     p_ocr_text ILIKE '%aika varattu%' OR
     p_ocr_text ILIKE '%varasit ajan onnistuneesti%' THEN
    conversion_detected := true;
    local_confidence_score := local_confidence_score + 0.8;
    keywords_found := array_append(keywords_found, 'confirmation_text');
  END IF;

  -- Extract prices (€ symbol with Finnish formatting)
  IF p_ocr_text ~ '\d+[,.]?\d*\s*€' THEN
    local_confidence_score := local_confidence_score + 0.2;
    keywords_found := array_append(keywords_found, 'price_found');
    
    -- Extract all prices from text
    WITH price_matches AS (
      SELECT (regexp_replace(match[1], ',', '.', 'g'))::numeric as price
      FROM regexp_split_to_table(p_ocr_text, E'\n') AS line,
           regexp_matches(line, '(\d+[,.]?\d*)\s*€', 'g') AS match
      WHERE match[1] IS NOT NULL AND match[1] != ''
    )
    SELECT array_agg(price) INTO service_prices FROM price_matches;
    
    -- Calculate total if multiple prices found
    IF array_length(service_prices, 1) > 0 THEN
      SELECT sum(price) INTO total_amount FROM unnest(service_prices) AS price;
    END IF;
  END IF;

  -- Extract service names (lines that contain prices)
  WITH service_lines AS (
    SELECT 
      trim(regexp_replace(line_text, '\d+[,.]?\d*\s*€.*', '', 'g')) as potential_service
    FROM regexp_split_to_table(p_ocr_text, E'\n') AS line_text
    WHERE line_text ~ '\d+[,.]?\d*\s*€'
      AND length(trim(line_text)) > 3
  )
  SELECT array_agg(DISTINCT potential_service) 
  INTO service_names 
  FROM service_lines 
  WHERE length(potential_service) > 2
    AND potential_service !~ '^\d+$'
    AND potential_service !~ '^[€\d\s,.-]+$'
    AND potential_service != '';

  -- Extract appointment date and time (Finnish format)
  appointment_date_text := (
    SELECT match[1]
    FROM regexp_matches(
      p_ocr_text, 
      '(\d{1,2}\.\s*[a-zA-ZäöåÄÖÅ]+\s*\d{4})',
      'gi'
    ) AS match
    LIMIT 1
  );
  
  appointment_time_text := (
    SELECT match[1]
    FROM regexp_matches(
      p_ocr_text, 
      'klo\s*(\d{1,2}[:.]\d{2}(?:\s*-\s*\d{1,2}[:.]\d{2})?)',
      'gi'
    ) AS match
    LIMIT 1
  );

  -- Extract location
  IF p_ocr_text ILIKE '%blondify%' THEN
    location_text := 'Blondify | Jätkäsaari';
  END IF;

  -- Insert screenshot record
  INSERT INTO session_recordings (
    session_id,
    recording_type,
    file_path,
    ocr_text,
    ocr_confidence,
    conversion_keywords,
    screenshot_analysis,
    metadata
  ) VALUES (
    p_session_id,
    'conversion_screenshot',
    p_screenshot_path,
    p_ocr_text,
    local_confidence_score,
    to_jsonb(keywords_found),
    p_extracted_data,
    jsonb_build_object(
      'conversion_detected', conversion_detected,
      'analysis_timestamp', now(),
      'confidence_score', local_confidence_score,
      'extracted_services', service_names,
      'extracted_prices', service_prices,
      'total_amount', total_amount,
      'appointment_date', appointment_date_text,
      'appointment_time', appointment_time_text,
      'location', location_text
    )
  ) RETURNING id INTO recording_id;

  -- Store enhanced booking details if conversion detected
  IF conversion_detected AND local_confidence_score > 0.7 THEN
    -- Insert detailed booking information
    INSERT INTO enhanced_booking_details (
      session_id,
      service_names,
      service_prices,
      total_amount,
      appointment_date,
      appointment_time,
      location,
      extracted_text,
      raw_ocr_data
    ) VALUES (
      p_session_id,
      service_names,
      service_prices,
      total_amount,
      CASE 
        WHEN appointment_date_text IS NOT NULL THEN 
          to_timestamp(appointment_date_text, 'DD. Month YYYY')
        ELSE NULL 
      END,
      appointment_time_text,
      location_text,
      p_ocr_text,
      jsonb_build_object(
        'keywords_found', keywords_found,
        'screenshot_id', recording_id,
        'extraction_timestamp', now(),
        'confidence_score', local_confidence_score
      )
    )
    ON CONFLICT (session_id) DO UPDATE SET
      service_names = EXCLUDED.service_names,
      service_prices = EXCLUDED.service_prices,
      total_amount = EXCLUDED.total_amount,
      appointment_date = EXCLUDED.appointment_date,
      appointment_time = EXCLUDED.appointment_time,
      location = EXCLUDED.location,
      extracted_text = EXCLUDED.extracted_text,
      raw_ocr_data = EXCLUDED.raw_ocr_data,
      updated_at = now();

    -- Update booking conversion
    INSERT INTO booking_conversions (
      session_id,
      booking_confirmation_detected,
      estimated_conversion,
      confidence_score,
      verification_notes,
      success_indicators
    ) VALUES (
      p_session_id,
      true,
      true,
      local_confidence_score,
      'Enhanced screenshot OCR analysis detected conversion with service details',
      jsonb_build_object(
        'detection_method', 'enhanced_screenshot_ocr',
        'keywords_found', keywords_found,
        'screenshot_id', recording_id,
        'ocr_confidence', local_confidence_score,
        'services_extracted', service_names,
        'prices_extracted', service_prices,
        'total_amount', total_amount,
        'appointment_details', jsonb_build_object(
          'date', appointment_date_text,
          'time', appointment_time_text,
          'location', location_text
        )
      )
    )
    ON CONFLICT (session_id) DO UPDATE SET
      booking_confirmation_detected = true,
      confidence_score = GREATEST(booking_conversions.confidence_score, EXCLUDED.confidence_score),
      success_indicators = booking_conversions.success_indicators || EXCLUDED.success_indicators;
  END IF;

  RETURN recording_id;
END;
$$;

-- Add function to retrieve enhanced booking details
CREATE OR REPLACE FUNCTION public.get_enhanced_booking_details(session_ids text[])
RETURNS TABLE(
  session_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_names text[],
  total_amount numeric,
  booking_date timestamp with time zone,
  appointment_date timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ebd.session_id,
    ebd.customer_name,
    ebd.customer_email,
    ebd.customer_phone,
    ebd.service_names,
    ebd.total_amount,
    ebd.booking_date,
    ebd.appointment_date
  FROM enhanced_booking_details ebd
  WHERE ebd.session_id = ANY(session_ids);
END;
$$;
