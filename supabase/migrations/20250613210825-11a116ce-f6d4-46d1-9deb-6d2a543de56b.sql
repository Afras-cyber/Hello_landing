
-- Remove RLS from session_recordings table to allow public access
ALTER TABLE public.session_recordings DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if any
DROP POLICY IF EXISTS "Users can view their own recordings" ON public.session_recordings;
DROP POLICY IF EXISTS "Users can create their own recordings" ON public.session_recordings;
DROP POLICY IF EXISTS "Users can update their own recordings" ON public.session_recordings;
DROP POLICY IF EXISTS "Users can delete their own recordings" ON public.session_recordings;

-- Create a simple policy that allows anyone to insert/select session recordings
ALTER TABLE public.session_recordings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert session recordings (no authentication required)
CREATE POLICY "Anyone can create session recordings" 
ON public.session_recordings 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to view session recordings (for admin purposes)
CREATE POLICY "Anyone can view session recordings" 
ON public.session_recordings 
FOR SELECT 
USING (true);

-- Update booking_conversions table to also allow public access
ALTER TABLE public.booking_conversions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own conversions" ON public.booking_conversions;
DROP POLICY IF EXISTS "Users can create their own conversions" ON public.booking_conversions;

ALTER TABLE public.booking_conversions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert/update booking conversions
CREATE POLICY "Anyone can create booking conversions" 
ON public.booking_conversions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update booking conversions" 
ON public.booking_conversions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view booking conversions" 
ON public.booking_conversions 
FOR SELECT 
USING (true);

-- Update iframe_interactions table
ALTER TABLE public.iframe_interactions DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own interactions" ON public.iframe_interactions;
DROP POLICY IF EXISTS "Users can create their own interactions" ON public.iframe_interactions;

ALTER TABLE public.iframe_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create iframe interactions" 
ON public.iframe_interactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view iframe interactions" 
ON public.iframe_interactions 
FOR SELECT 
USING (true);

-- Update enhanced_booking_details table
ALTER TABLE public.enhanced_booking_details DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own booking details" ON public.enhanced_booking_details;
DROP POLICY IF EXISTS "Users can create their own booking details" ON public.enhanced_booking_details;

ALTER TABLE public.enhanced_booking_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create enhanced booking details" 
ON public.enhanced_booking_details 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update enhanced booking details" 
ON public.enhanced_booking_details 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can view enhanced booking details" 
ON public.enhanced_booking_details 
FOR SELECT 
USING (true);
