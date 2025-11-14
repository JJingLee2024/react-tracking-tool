-- Add new tables for dashboard permissions and favorites

-- Table for dashboard viewers (who can view the dashboard)
CREATE TABLE IF NOT EXISTS dashboard_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT, -- creator_id who added this viewer
  UNIQUE(dashboard_id, user_email)
);

-- Table for dashboard editors (who can edit the dashboard)
CREATE TABLE IF NOT EXISTS dashboard_editors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by TEXT, -- creator_id who added this editor
  UNIQUE(dashboard_id, user_email)
);

-- Table for dashboard favorites
CREATE TABLE IF NOT EXISTS dashboard_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dashboard_id, user_id)
);

-- Add visibility field to analytics_dashboards
ALTER TABLE analytics_dashboards 
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public'));

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_viewers_dashboard 
  ON dashboard_viewers(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_viewers_email 
  ON dashboard_viewers(user_email);

CREATE INDEX IF NOT EXISTS idx_dashboard_editors_dashboard 
  ON dashboard_editors(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_editors_email 
  ON dashboard_editors(user_email);

CREATE INDEX IF NOT EXISTS idx_dashboard_favorites_dashboard 
  ON dashboard_favorites(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_favorites_user 
  ON dashboard_favorites(user_id);

-- Enable RLS
ALTER TABLE dashboard_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_editors ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_favorites ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (we'll handle permissions in app logic)
CREATE POLICY "Allow public access to dashboard_viewers"
  ON dashboard_viewers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to dashboard_editors"
  ON dashboard_editors FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public access to dashboard_favorites"
  ON dashboard_favorites FOR ALL USING (true) WITH CHECK (true);

-- Add comments
COMMENT ON TABLE dashboard_viewers IS 'Users who can view specific dashboards';
COMMENT ON TABLE dashboard_editors IS 'Users who can edit specific dashboards (co-editors)';
COMMENT ON TABLE dashboard_favorites IS 'User favorites for dashboards';
COMMENT ON COLUMN analytics_dashboards.visibility IS 'Dashboard visibility: private (only creator/editors/viewers) or public (anyone with link)';
