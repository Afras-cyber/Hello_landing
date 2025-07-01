
-- Clear all existing Timma tracking data for fresh testing
-- This will remove all conversion data, interactions, and session events
-- while preserving admin users and other critical data

-- Clear booking conversions
DELETE FROM booking_conversions;

-- Clear iframe interactions 
DELETE FROM iframe_interactions;

-- Clear session events
DELETE FROM session_events;

-- Clear session recordings (optional - these might be useful to keep)
DELETE FROM session_recordings;

-- Clear session replays (optional - these might be useful to keep)  
DELETE FROM session_replays;

-- Clear user sessions (this will reset all session tracking)
DELETE FROM user_sessions;

-- Reset any heat map data (optional - might want to keep for other analytics)
DELETE FROM heat_map_data WHERE page_url LIKE '%booking%' OR page_url LIKE '%timma%';

-- Add some debug logging to track when data gets cleared
INSERT INTO session_events (
  session_id,
  event_type, 
  element_text,
  timestamp_offset,
  event_data,
  page_url
) VALUES (
  'admin-reset-' || extract(epoch from now())::text,
  'admin_data_reset',
  'All Timma data cleared for testing',
  0,
  jsonb_build_object(
    'reset_timestamp', now(),
    'reset_by', 'admin',
    'reason', 'testing_timma_tracking'
  ),
  '/admin/settings'
);
