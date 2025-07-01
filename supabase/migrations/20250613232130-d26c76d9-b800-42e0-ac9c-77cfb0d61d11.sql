
-- Päivitä enhanced_booking_details taulua asiakastietojen ja markkinointiluvan tallentamiseksi
ALTER TABLE enhanced_booking_details 
ADD COLUMN IF NOT EXISTS client_address TEXT,
ADD COLUMN IF NOT EXISTS client_city TEXT,
ADD COLUMN IF NOT EXISTS client_postal_code TEXT,
ADD COLUMN IF NOT EXISTS accept_email_marketing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accept_sms_marketing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS client_message TEXT,
ADD COLUMN IF NOT EXISTS social_security_number TEXT,
ADD COLUMN IF NOT EXISTS console_detection_method TEXT,
ADD COLUMN IF NOT EXISTS console_raw_data JSONB DEFAULT '{}';

-- Päivitä booking_conversions taulua console-havainnointiin
ALTER TABLE booking_conversions
ADD COLUMN IF NOT EXISTS console_detected BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS console_detection_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_contact_data JSONB DEFAULT '{}';
