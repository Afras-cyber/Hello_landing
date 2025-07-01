
-- Fix the session_recordings table constraint to allow the new recording type
ALTER TABLE session_recordings DROP CONSTRAINT IF EXISTS session_recordings_recording_type_check;

-- Add the updated constraint with the new recording type
ALTER TABLE session_recordings ADD CONSTRAINT session_recordings_recording_type_check 
CHECK (recording_type IN ('screenshot', 'video', 'interaction_log', 'conversion_screenshot'));
