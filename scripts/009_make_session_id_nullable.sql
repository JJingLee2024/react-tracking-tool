-- Make session_id nullable in analytics_dashboards table
ALTER TABLE analytics_dashboards ALTER COLUMN session_id DROP NOT NULL;
