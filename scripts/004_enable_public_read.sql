-- Enable public read access to analytics data
-- This allows the dashboard to display data without authentication

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for all users" ON tracking_events;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON tracking_events;
DROP POLICY IF EXISTS "Enable insert for all users" ON tracking_sessions;
DROP POLICY IF EXISTS "Enable read for authenticated users only" ON tracking_sessions;

-- Create new policies with public read access
CREATE POLICY "Enable insert for all users" ON tracking_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable public read access" ON tracking_events
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Enable insert for all users" ON tracking_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable public read access" ON tracking_sessions
  FOR SELECT TO anon, authenticated
  USING (true);
