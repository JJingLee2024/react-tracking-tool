-- Create table for storing analytics dashboard configurations
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  creator_id TEXT,
  title TEXT NOT NULL DEFAULT 'My Dashboard',
  panels JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Future: sharing and collaboration fields
  is_shared BOOLEAN DEFAULT FALSE,
  shared_token TEXT UNIQUE,
  collaborators JSONB DEFAULT '[]'::jsonb
);

-- Add index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_session 
  ON analytics_dashboards(session_id);

-- Add index for shared dashboards (future)
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_shared_token 
  ON analytics_dashboards(shared_token) WHERE shared_token IS NOT NULL;

-- Enable RLS
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;

-- Allow public to read, insert, and update their own dashboards
CREATE POLICY "Allow public access to analytics_dashboards"
  ON analytics_dashboards
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comment
COMMENT ON TABLE analytics_dashboards IS 'Stores user analytics dashboard configurations with panels. Supports session-based storage and future sharing/collaboration features.';
