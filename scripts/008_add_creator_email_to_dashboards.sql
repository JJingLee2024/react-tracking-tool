-- Add creator_email column to analytics_dashboards table
ALTER TABLE analytics_dashboards
ADD COLUMN IF NOT EXISTS creator_email TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_creator_email 
ON analytics_dashboards(creator_email);

-- Update existing dashboards with creator emails if possible
-- (This will need to be done manually or via a migration script that has admin access)
