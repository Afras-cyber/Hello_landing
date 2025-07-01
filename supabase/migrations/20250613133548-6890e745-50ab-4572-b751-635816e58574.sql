
-- Create the missing RPC functions that the code is trying to call

-- Function to get enhanced booking details
CREATE OR REPLACE FUNCTION public.get_enhanced_booking_details(session_ids text[])
RETURNS TABLE (
  session_id text,
  customer_name text,
  customer_email text,
  customer_phone text,
  service_names text[],
  total_amount decimal,
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

-- Function to get customer journey data
CREATE OR REPLACE FUNCTION public.get_customer_journey_data(session_ids text[])
RETURNS TABLE (
  id uuid,
  session_id text,
  journey_step text,
  page_url text,
  referrer_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  step_data jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.id,
    cj.session_id,
    cj.journey_step,
    cj.page_url,
    cj.referrer_url,
    cj.utm_source,
    cj.utm_medium,
    cj.utm_campaign,
    cj.device_type,
    cj.browser,
    cj.step_data,
    cj.created_at
  FROM customer_journey cj
  WHERE cj.session_id = ANY(session_ids)
  ORDER BY cj.created_at ASC;
END;
$$;

-- Function to get session journey for a specific session
CREATE OR REPLACE FUNCTION public.get_session_journey(p_session_id text)
RETURNS TABLE (
  id uuid,
  session_id text,
  journey_step text,
  page_url text,
  referrer_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  device_type text,
  browser text,
  step_data jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cj.id,
    cj.session_id,
    cj.journey_step,
    cj.page_url,
    cj.referrer_url,
    cj.utm_source,
    cj.utm_medium,
    cj.utm_campaign,
    cj.device_type,
    cj.browser,
    cj.step_data,
    cj.created_at
  FROM customer_journey cj
  WHERE cj.session_id = p_session_id
  ORDER BY cj.created_at ASC;
END;
$$;
