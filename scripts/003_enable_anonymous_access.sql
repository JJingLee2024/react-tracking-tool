-- Enable anonymous sign-ins in Supabase
-- Note: You may need to enable this in your Supabase dashboard under Authentication > Providers > Anonymous

-- Update RLS policies to allow anonymous users to view data
DROP POLICY IF EXISTS "Allow public event insertion" ON tracking_events;
DROP POLICY IF EXISTS "Allow authenticated users to view events" ON tracking_events;
DROP POLICY IF EXISTS "Allow authenticated users to view sessions" ON tracking_sessions;

-- Allow anyone (including anonymous users) to insert events
CREATE POLICY "Allow public event insertion"
  ON tracking_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users (including anonymous) to view all events
CREATE POLICY "Allow authenticated users to view events"
  ON tracking_events
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users (including anonymous) to view all sessions
CREATE POLICY "Allow authenticated users to view sessions"
  ON tracking_sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow anyone to insert sessions
CREATE POLICY "Allow public session insertion"
  ON tracking_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
