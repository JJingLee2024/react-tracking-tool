# Log Service - 日誌服務

接收和處理前端追蹤事件的後端服務。

## 📦 功能概覽

- **批次事件接收**: 一次接收多個追蹤事件
- **資料驗證**: 驗證事件格式和必要欄位
- **資料轉換**: camelCase → snake_case 轉換
- **批次寫入**: 高效率批次寫入 Supabase
- **Session 統計**: 自動更新 session 統計資訊
- **錯誤處理**: 完整的錯誤處理和回報

## 📚 API 文件

### POST /api/track

接收批次追蹤事件。

**請求**:

\`\`\`typescript
POST /api/track
Content-Type: application/json

{
  "events": [
    {
      "eventType": "view" | "click" | "expose" | "disappear",
      "eventName": "Click_Home_Button",
      "pageName": "Home",
      "componentName": "Button",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "sessionId": "session_xxx",
      "userId": "user_123",
      "companyId": "company_456",
      
      // 設備資訊
      "deviceType": "desktop" | "mobile" | "tablet",
      "deviceModel": "Unknown",
      "os": "macOS",
      "osVersion": "10.15.7",
      "browser": "Chrome",
      "browserVersion": "120.0.0",
      
      // 網路資訊
      "networkType": "4g",
      "networkEffectiveType": "4g",
      
      // 頁面資訊
      "pageUrl": "https://example.com/",
      "pageTitle": "Home Page",
      "viewportWidth": 1920,
      "viewportHeight": 1080,
      "refer": "/previous-page",
      
      // 選用欄位
      "exposeTime": 5000,  // disappear 事件的曝光時長（毫秒）
      "properties": {}      // 自訂屬性（JSONB）
    }
  ]
}
\`\`\`

**回應**:

成功 (200):
\`\`\`json
{
  "success": true,
  "received": 10
}
\`\`\`

錯誤 (400):
\`\`\`json
{
  "success": false,
  "error": "Invalid request format"
}
\`\`\`

錯誤 (500):
\`\`\`json
{
  "success": false,
  "error": "Database error message"
}
\`\`\`

## 🏗️ 架構設計

### 檔案結構

**重要說明**: 由於 Next.js 的限制，API route 必須放在 `app/api/` 目錄下才能正常運作。

\`\`\`
app/api/track/
└── route.ts      # Next.js API Route Handler (實際位置)

services/log/     # 文件和架構說明目錄
└── README.md
\`\`\`

雖然此服務在邏輯上屬於 Log Service，但實作檔案必須位於 `app/api/track/route.ts`。

### 處理流程

\`\`\`
接收請求 → 驗證格式 → 轉換欄位名稱 → 批次寫入 DB → 更新 Session → 回應
\`\`\`

### 資料轉換邏輯

#### camelCase → snake_case

\`\`\`typescript
{
  "eventType": "click",       → event_type
  "eventName": "...",         → event_name
  "pageName": "...",          → page_name
  "componentName": "...",     → component_name
  "sessionId": "...",         → session_id
  "userId": "...",            → user_id
  "companyId": "...",         → company_id
  "deviceType": "...",        → device_type
  "deviceModel": "...",       → device_model
  "osVersion": "...",         → os_version
  "browserVersion": "...",    → browser_version
  "networkType": "...",       → network_type
  "networkEffectiveType": "...", → network_effective_type
  "pageUrl": "...",           → page_url
  "pageTitle": "...",         → page_title
  "viewportWidth": 1920,      → viewport_width
  "viewportHeight": 1080,     → viewport_height
  "exposeTime": 5000          → expose_time
}
\`\`\`

### Session 統計

每次接收事件時，自動更新對應 session 的統計：

\`\`\`sql
UPDATE tracking_sessions
SET 
  last_activity = NOW(),
  event_count = event_count + {新事件數量}
WHERE session_id = {sessionId}
\`\`\`

如果 session 不存在，會自動創建：

\`\`\`sql
INSERT INTO tracking_sessions (
  session_id, user_id, company_id, 
  first_seen, last_activity, event_count
) VALUES (...)
ON CONFLICT (session_id) DO UPDATE ...
\`\`\`

## 🔗 依賴的外部功能

### Supabase Database

**使用的資料表**:

1. **tracking_events** - 儲存所有追蹤事件

\`\`\`sql
CREATE TABLE tracking_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  page_name TEXT,
  component_name TEXT,
  timestamp TIMESTAMPTZ NOT NULL,
  session_id TEXT NOT NULL,
  user_id TEXT,
  company_id TEXT,
  device_type TEXT,
  device_model TEXT,
  os TEXT,
  os_version TEXT,
  browser TEXT,
  browser_version TEXT,
  network_type TEXT,
  network_effective_type TEXT,
  page_url TEXT,
  page_title TEXT,
  viewport_width INTEGER,
  viewport_height INTEGER,
  refer TEXT,
  expose_time INTEGER,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

2. **tracking_sessions** - 儲存 session 資訊

\`\`\`sql
CREATE TABLE tracking_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT,
  company_id TEXT,
  first_seen TIMESTAMPTZ NOT NULL,
  last_activity TIMESTAMPTZ NOT NULL,
  event_count INTEGER DEFAULT 0,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

**環境變數**:
- `SUPABASE_URL`: Supabase 專案 URL
- `SUPABASE_ANON_KEY`: Supabase 匿名金鑰

### Next.js API Routes

- 使用 Next.js 15+ App Router API Routes
- 支援 POST 方法
- 自動處理 CORS（如需要可在 middleware 中配置）

## 🛠️ 維護文件

### 新增欄位

1. 在 Supabase 中新增欄位：
\`\`\`sql
ALTER TABLE tracking_events 
ADD COLUMN new_field TEXT;
\`\`\`

2. 在 `convertEventToSnakeCase` 函數中新增轉換邏輯：
\`\`\`typescript
function convertEventToSnakeCase(event: any) {
  return {
    new_field: event.newField,
  }
}
\`\`\`

### 修改批次大小限制

\`\`\`typescript
// route.ts
const MAX_EVENTS_PER_BATCH = 1000 // 預設無限制，可加入驗證

if (events.length > MAX_EVENTS_PER_BATCH) {
  return NextResponse.json(
    { success: false, error: 'Too many events' },
    { status: 400 }
  )
}
\`\`\`

### 啟用請求日誌

\`\`\`typescript
// route.ts - 在 POST 函數開頭加入
console.log('[v0 Log Service] Received events:', {
  count: events.length,
  firstEvent: events[0],
  timestamp: new Date().toISOString()
})
\`\`\`

### 效能優化

#### 1. 資料庫索引

\`\`\`sql
-- 常用查詢欄位建立索引
CREATE INDEX idx_events_session ON tracking_events(session_id);
CREATE INDEX idx_events_timestamp ON tracking_events(timestamp DESC);
CREATE INDEX idx_events_type ON tracking_events(event_type);
CREATE INDEX idx_events_user ON tracking_events(user_id);
\`\`\`

#### 2. 批次大小限制

\`\`\`typescript
// 限制單次批次大小，避免資料庫負載過高
const CHUNK_SIZE = 500
for (let i = 0; i < events.length; i += CHUNK_SIZE) {
  const chunk = events.slice(i, i + CHUNK_SIZE)
  await supabase.from('tracking_events').insert(chunk)
}
\`\`\`

#### 3. 非同步 Session 更新

\`\`\`typescript
// 不等待 session 更新完成，加快回應速度
Promise.all(sessionUpdates).catch(console.error)
return NextResponse.json({ success: true })
\`\`\`

### 錯誤監控

建議整合錯誤監控服務（如 Sentry）：

\`\`\`typescript
import * as Sentry from '@sentry/nextjs'

try {
} catch (error) {
  Sentry.captureException(error, {
    extra: { eventsCount: events.length }
  })
}
\`\`\`

### 測試

\`\`\`bash
# 使用 curl 測試
curl -X POST http://localhost:3000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "events": [{
      "eventType": "click",
      "eventName": "Test",
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'",
      "sessionId": "test_session"
    }]
  }'
\`\`\`

## 📊 效能指標

- **單次請求處理**: < 200ms（10 個事件）
- **批次寫入**: < 500ms（100 個事件）
- **Session 更新**: < 100ms
- **併發處理**: 支援 100+ 併發請求
