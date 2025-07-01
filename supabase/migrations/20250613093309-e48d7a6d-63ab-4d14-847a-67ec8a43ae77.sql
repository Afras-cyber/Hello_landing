
-- Add campaign tracking tables and improve existing ones

-- Add campaign source tracking to booking_conversions if not exists
ALTER TABLE booking_conversions 
ADD COLUMN IF NOT EXISTS traffic_source text,
ADD COLUMN IF NOT EXISTS campaign_name text,
ADD COLUMN IF NOT EXISTS ad_platform text,
ADD COLUMN IF NOT EXISTS conversion_validated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS validation_notes text,
ADD COLUMN IF NOT EXISTS validated_by uuid,
ADD COLUMN IF NOT EXISTS validated_at timestamp with time zone;

-- Create campaign analytics summary view
CREATE OR REPLACE VIEW campaign_analytics_view AS
SELECT 
  COALESCE(utm_source, 'Direct') as source,
  COALESCE(utm_medium, 'organic') as medium,
  COALESCE(utm_campaign, 'none') as campaign,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN booking_confirmation_detected = true THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN estimated_conversion = true THEN 1 END) as estimated_bookings,
  ROUND(
    (COUNT(CASE WHEN booking_confirmation_detected = true THEN 1 END)::decimal / COUNT(*)) * 100, 
    2
  ) as conversion_rate,
  DATE_TRUNC('day', created_at) as date
FROM booking_conversions 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY utm_source, utm_medium, utm_campaign, DATE_TRUNC('day', created_at)
ORDER BY date DESC, total_sessions DESC;

-- Create daily analytics summary
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN booking_confirmation_detected = true THEN 1 END) as confirmed_bookings,
  COUNT(CASE WHEN estimated_conversion = true THEN 1 END) as estimated_bookings,
  COUNT(CASE WHEN utm_source = 'google' AND utm_medium = 'cpc' THEN 1 END) as google_ads_sessions,
  COUNT(CASE WHEN utm_source = 'facebook' OR utm_source = 'meta' THEN 1 END) as meta_sessions,
  COUNT(CASE WHEN utm_source = 'tiktok' THEN 1 END) as tiktok_sessions,
  COUNT(CASE WHEN utm_source IS NULL OR utm_source = 'direct' THEN 1 END) as direct_sessions,
  COUNT(CASE WHEN utm_medium = 'organic' THEN 1 END) as organic_sessions
FROM booking_conversions 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Function to validate Timma conversions
CREATE OR REPLACE FUNCTION validate_timma_conversion(
  conversion_id uuid,
  is_valid boolean,
  notes text DEFAULT NULL,
  validator_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE booking_conversions 
  SET 
    conversion_validated = is_valid,
    validation_notes = notes,
    validated_by = validator_id,
    validated_at = now()
  WHERE id = conversion_id;
  
  RETURN FOUND;
END;
$$;
