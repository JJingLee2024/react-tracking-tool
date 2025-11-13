-- 刪除舊的表格和視圖
DROP VIEW IF EXISTS event_summary;
DROP TABLE IF EXISTS tracking_events CASCADE;
DROP TABLE IF EXISTS tracking_sessions CASCADE;

-- 創建新的追蹤事件表（符合新規格）
CREATE TABLE IF NOT EXISTS tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 事件基本資訊
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'expose', 'disappear')),
  event_name TEXT NOT NULL, -- 格式: [type_page_component]
  page_name TEXT NOT NULL,
  component_name TEXT,
  
  -- 時間戳
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 保留參數
  refer TEXT, -- 上一頁
  expose_time INTEGER, -- 曝光時長（秒）
  
  -- 全局參數
  user_id TEXT,
  company_id TEXT,
  
  -- Session 資訊
  session_id TEXT NOT NULL,
  
  -- 設備資訊
  device_type TEXT, -- mobile, tablet, desktop
  device_model TEXT,
  os TEXT,
  os_version TEXT,
  browser TEXT,
  browser_version TEXT,
  
  -- 網路狀態
  network_type TEXT, -- wifi, cellular, ethernet, unknown
  network_effective_type TEXT, -- 4g, 3g, 2g, slow-2g
  
  -- 頁面資訊
  page_url TEXT,
  page_title TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- 自訂屬性（JSON）
  properties JSONB DEFAULT '{}'::jsonb,
  
  -- 索引優化
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 創建索引以提升查詢效能
CREATE INDEX idx_tracking_events_timestamp ON tracking_events(timestamp DESC);
CREATE INDEX idx_tracking_events_session_id ON tracking_events(session_id);
CREATE INDEX idx_tracking_events_event_type ON tracking_events(event_type);
CREATE INDEX idx_tracking_events_event_name ON tracking_events(event_name);
CREATE INDEX idx_tracking_events_page_name ON tracking_events(page_name);
CREATE INDEX idx_tracking_events_user_id ON tracking_events(user_id);
CREATE INDEX idx_tracking_events_created_at ON tracking_events(created_at DESC);

-- 創建 Session 表
CREATE TABLE IF NOT EXISTS tracking_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  company_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  
  -- Session 統計
  total_events INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  total_clicks INTEGER DEFAULT 0,
  total_exposes INTEGER DEFAULT 0,
  total_disappears INTEGER DEFAULT 0,
  
  -- 設備資訊
  device_type TEXT,
  device_model TEXT,
  os TEXT,
  browser TEXT,
  
  -- 地理位置
  country TEXT,
  city TEXT,
  
  -- 進入/離開頁面
  entry_page TEXT,
  exit_page TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tracking_sessions_started_at ON tracking_sessions(started_at DESC);
CREATE INDEX idx_tracking_sessions_user_id ON tracking_sessions(user_id);

-- 設置 RLS（完全公開讀寫）
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tracking_events" 
  ON tracking_events FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert access to tracking_events" 
  ON tracking_events FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow public read access to tracking_sessions" 
  ON tracking_sessions FOR SELECT 
  USING (true);

CREATE POLICY "Allow public insert/update access to tracking_sessions" 
  ON tracking_sessions FOR ALL 
  USING (true);

-- 創建分析視圖
CREATE OR REPLACE VIEW event_analytics AS
SELECT 
  event_type,
  event_name,
  page_name,
  COUNT(*) as count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('hour', timestamp) as hour
FROM tracking_events
GROUP BY event_type, event_name, page_name, hour
ORDER BY hour DESC, count DESC;
