
-- Fix the analyze_screenshot_conversion function to resolve ambiguous column references
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
  confidence_score numeric := 0;
  conversion_detected boolean := false;
  keywords_found text[] := '{}';
BEGIN
  -- Finnish conversion keywords
  IF p_ocr_text ILIKE '%varauksesi on nyt vahvistettu%' OR
     p_ocr_text ILIKE '%varaus vahvistettu%' OR
     p_ocr_text ILIKE '%kiitos varauksesta%' OR
     p_ocr_text ILIKE '%aika varattu%' THEN
    conversion_detected := true;
    confidence_score := confidence_score + 0.8;
    keywords_found := array_append(keywords_found, 'confirmation_text');
  END IF;

  -- Check for prices (€ symbol)
  IF p_ocr_text ~ '\d+[,.]?\d*\s*€' THEN
    confidence_score := confidence_score + 0.2;
    keywords_found := array_append(keywords_found, 'price_found');
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
    confidence_score,
    to_jsonb(keywords_found),
    p_extracted_data,
    jsonb_build_object(
      'conversion_detected', conversion_detected,
      'analysis_timestamp', now(),
      'confidence_score', confidence_score
    )
  ) RETURNING id INTO recording_id;

  -- Update booking conversion if high confidence
  IF conversion_detected AND confidence_score > 0.7 THEN
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
      confidence_score,
      'Screenshot OCR analysis detected conversion',
      jsonb_build_object(
        'detection_method', 'screenshot_ocr',
        'keywords_found', keywords_found,
        'screenshot_id', recording_id,
        'ocr_confidence', confidence_score
      )
    )
    ON CONFLICT (session_id) DO UPDATE SET
      booking_confirmation_detected = true,
      confidence_score = GREATEST(booking_conversions.confidence_score, EXCLUDED.confidence_score),
      success_indicators = booking_conversions.success_indicators || jsonb_build_object(
        'screenshot_analysis', jsonb_build_object(
          'keywords_found', keywords_found,
          'screenshot_id', recording_id,
          'analysis_confidence', confidence_score
        )
      );
  END IF;

  RETURN recording_id;
END;
$$;
