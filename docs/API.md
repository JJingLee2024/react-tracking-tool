# API 文件

React Tracking Tool 專案的完整 API 參考文件。

## 目錄

- [追蹤 API](#追蹤-api)
- [資料庫 Schema](#資料庫-schema)
- [SDK API](#sdk-api)
- [錯誤處理](#錯誤處理)
- [效能考量](#效能考量)
- [版本歷史](#版本歷史)

---

## 追蹤 API

### POST /api/track

批次接收並儲存使用者行為追蹤事件。

#### 請求

**端點**: `POST /api/track`

**Headers**:
\`\`\`
Content-Type: application/json
\`\`\`

**Body**:
\`\`\`typescript
{
  "events": Array<{
    eventType: "view" | "click" | "expose" | "disappear"
    eventName: string                    // 例如: "Click_Home_SubmitButton"
    pageName: string                     // 例如: "Home", "AdminDashboards"
    componentName?: string               // 例如: "SubmitButton", "HeroSection"
    timestamp: string                    // ISO 8601 格式
    sessionId: string                    // Session 唯一識別碼
    userId?: string                      // 使用者 ID
    companyId?: string                   // 公司 ID
    deviceType: string                   // 例如: "desktop", "mobile", "tablet"
    deviceModel: string                  // 例如: "iPhone 14", "Unknown"
    os: string                           // 例如: "iOS", "Android", "macOS", "Windows"
    osVersion: string                    // 例如: "16.0", "13", "10.15.7"
    browser: string                      // 例如: "Chrome", "Safari", "Firefox"
    browserVersion: string               // 例如: "120.0.0"
    networkType?: string                 // 例如: "wifi", "4g", "5g"
    networkEffectiveType?: string        // 例如: "4g", "3g", "2g", "slow-2g"
    pageUrl: string                      // 完整頁面 URL
    pageTitle: string                    // 頁面標題
    viewportWidth: number                // 視窗寬度 (px)
    viewportHeight: number               // 視窗高度 (px)
    refer?: string                       // 上一個頁面的 pageName
    exposeTime?: number                  // 曝光時長 (ms)，僅 disappear 事件
    properties?: Record<string, any>     // 自定義屬性
  }>
}
\`\`\`

#### 回應

**成功 (200 OK)**:
\`\`\`json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "uuid",
      "event_type": "click",
      "event_name": "Click_Home_SubmitButton",
      "created_at": "2024-01-01T00:00:00.000Z"
      // ... 其他欄位
    }
  ]
}
\`\`\`

**錯誤 (400 Bad Request)**:
\`\`\`json
{
  "error": "Invalid request: events array is required"
}
\`\`\`

**錯誤 (500 Internal Server Error)**:
\`\`\`json
{
  "error": "Supabase error message"
}
\`\`\`

#### 範例

\`\`\`javascript
// 使用 fetch API
const response = await fetch('/api/track', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    events: [
      {
        eventType: 'click',
        eventName: 'Click_Home_SubmitButton',
        pageName: 'Home',
        componentName: 'SubmitButton',
        timestamp: new Date().toISOString(),
        sessionId: 'session_abc123',
        userId: 'user_123',
        deviceType: 'desktop',
        deviceModel: 'Unknown',
        os: 'macOS',
        osVersion: '10.15.7',
        browser: 'Chrome',
        browserVersion: '120.0.0',
        pageUrl: 'https://example.com/',
        pageTitle: 'Home Page',
        viewportWidth: 1920,
        viewportHeight: 1080,
        properties: { buttonColor: 'blue' }
      }
    ]
  })
})

const result = await response.json()
\`\`\`

#### 注意事項

1. **批次處理**: API 設計為批次接收事件，建議每次發送 5-50 個事件
2. **Session 管理**: API 會自動更新或創建 session 記錄
3. **Session 統計**: 會自動計算每個 session 的事件統計 (views, clicks, exposes, disappears)
4. **去重**: 相同 session 的事件會被聚合統計
5. **時間戳**: 必須使用 ISO 8601 格式的時間戳
6. **Refer 欄位**: 用於追蹤頁面間的導航流程，記錄上一個頁面的 pageName

---

## 資料庫 Schema

### tracking_events

儲存所有使用者行為事件。

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | uuid | 主鍵 |
| event_type | text | 事件類型: view, click, expose, disappear |
| event_name | text | 事件名稱 (自動生成) |
| page_name | text | 頁面名稱 |
| component_name | text | 組件名稱 (可選) |
| timestamp | timestamp | 事件發生時間 |
| session_id | text | Session ID |
| user_id | text | 使用者 ID (可選) |
| company_id | text | 公司 ID (可選) |
| device_type | text | 設備類型 |
| device_model | text | 設備型號 |
| os | text | 作業系統 |
| os_version | text | 作業系統版本 |
| browser | text | 瀏覽器 |
| browser_version | text | 瀏覽器版本 |
| network_type | text | 網路類型 |
| network_effective_type | text | 有效網路類型 |
| page_url | text | 頁面 URL |
| page_title | text | 頁面標題 |
| viewport_width | integer | 視窗寬度 |
| viewport_height | integer | 視窗高度 |
| refer | text | 上一個頁面名稱 |
| expose_time | integer | 曝光時長 (ms) |
| properties | jsonb | 自定義屬性 |
| created_at | timestamp | 記錄創建時間 |

**索引**:
- 主鍵: id
- 外鍵: session_id → tracking_sessions(id)

**RLS 政策**:
- 允許公開插入
- 允許公開讀取

### tracking_sessions

儲存使用者 session 資訊和統計。

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | text | 主鍵 (Session ID) |
| user_id | text | 使用者 ID |
| company_id | text | 公司 ID |
| started_at | timestamp | Session 開始時間 |
| last_activity_at | timestamp | 最後活動時間 |
| ended_at | timestamp | Session 結束時間 |
| total_events | integer | 總事件數 |
| total_views | integer | 頁面瀏覽數 |
| total_clicks | integer | 點擊數 |
| total_exposes | integer | 曝光數 |
| total_disappears | integer | 消失數 |
| device_type | text | 設備類型 |
| device_model | text | 設備型號 |
| os | text | 作業系統 |
| browser | text | 瀏覽器 |
| entry_page | text | 入口頁面 |
| exit_page | text | 離開頁面 |
| city | text | 城市 |
| country | text | 國家 |
| created_at | timestamp | 記錄創建時間 |

**RLS 政策**:
- 允許公開插入/更新
- 允許公開讀取

### analytics_dashboards

儲存分析儀表板配置。

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | uuid | 主鍵 |
| title | text | 儀表板標題 |
| creator_id | text | 創建者 ID |
| creator_email | text | 創建者 Email |
| session_id | text | 關聯的 Session ID (可為 null) |
| panels | jsonb | 面板配置 JSON |
| visibility | text | 可見性: private, public |
| is_shared | boolean | 是否已分享 |
| shared_token | text | 分享 Token |
| collaborators | jsonb | 協作者列表 |
| created_at | timestamp | 創建時間 |
| updated_at | timestamp | 更新時間 |

### dashboard_editors

儲存儀表板編輯者權限。

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | uuid | 主鍵 |
| dashboard_id | uuid | 儀表板 ID |
| user_email | text | 使用者 Email |
| added_by | text | 添加者 ID |
| added_at | timestamp | 添加時間 |

### dashboard_viewers

儲存儀表板檢視者權限。

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | uuid | 主鍵 |
| dashboard_id | uuid | 儀表板 ID |
| user_email | text | 使用者 Email |
| added_by | text | 添加者 ID |
| added_at | timestamp | 添加時間 |

### dashboard_favorites

儲存使用者收藏的儀表板。

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| id | uuid | 主鍵 |
| dashboard_id | uuid | 儀表板 ID |
| user_id | text | 使用者 ID |
| created_at | timestamp | 收藏時間 |

---

## SDK API

### 核心追蹤 API

#### Page()

追蹤頁面相關事件。

\`\`\`typescript
import { Page } from '@/sdk/track'

// 基本用法
Page().view()

// 指定頁面名稱
Page().name("HomePage").view()

// 帶自定義屬性
Page().name("ProductPage").view({ 
  productId: "123",
  category: "electronics" 
})
\`\`\`

#### Button()

追蹤按鈕點擊事件。

\`\`\`typescript
import { Button } from '@/sdk/track'

// 基本用法
Button().click()

// 指定按鈕名稱
Button().name("SubmitButton").click()

// 帶自定義屬性
Button().name("BuyButton").click({ 
  price: 29.99,
  currency: "USD" 
})
\`\`\`

#### Element()

追蹤元素曝光和消失事件。

\`\`\`typescript
import { Element } from '@/sdk/track'

// 元素曝光
Element().name("Banner").expose()

// 元素消失（帶曝光時長）
Element().name("Banner").disappear(5000)  // 5 秒後消失

// 帶自定義屬性
Element().name("VideoPlayer").expose({ 
  videoId: "abc123",
  autoplay: true 
})
\`\`\`

### React Hooks

#### useAutoClick

自動追蹤元素的點擊事件。

\`\`\`typescript
import { useAutoClick } from '@/sdk/hooks'

function MyButton() {
  const ref = useAutoClick("SubmitButton", { 
    formType: "login" 
  })
  
  return (
    <button ref={ref}>
      Submit
    </button>
  )
}
\`\`\`

**參數**:
- `name: string` - 組件名稱
- `properties?: Record<string, any>` - 自定義屬性（可選）

**返回**: `RefObject` - 需綁定到 DOM 元素

#### useAutoExpose

自動追蹤元素的曝光和消失事件。

\`\`\`typescript
import { useAutoExpose } from '@/sdk/hooks'

function MyCard() {
  const ref = useAutoExpose("ProductCard", { 
    productId: "123" 
  })
  
  return (
    <div ref={ref}>
      Product Content
    </div>
  )
}
\`\`\`

**特性**:
- 使用 Intersection Observer API
- 當元素進入視窗時觸發 expose 事件
- 當元素離開視窗時觸發 disappear 事件
- 自動計算曝光時長

**參數**:
- `name: string` - 組件名稱
- `properties?: Record<string, any>` - 自定義屬性（可選）

**返回**: `RefObject` - 需綁定到 DOM 元素

### React 組件

#### TrackedButton

自動追蹤點擊的按鈕組件。

\`\`\`typescript
import { TrackedButton } from '@/sdk/components'

function MyForm() {
  return (
    <TrackedButton 
      trackingName="SubmitButton"
      trackingProps={{ formType: "login" }}
      className="btn-primary"
      onClick={() => console.log('clicked')}
    >
      Submit
    </TrackedButton>
  )
}
\`\`\`

**Props**:
- `trackingName: string` - 追蹤名稱
- `trackingProps?: Record<string, any>` - 自定義追蹤屬性
- 所有原生 button 屬性

#### TrackedElement

自動追蹤曝光/消失的容器組件。

\`\`\`typescript
import { TrackedElement } from '@/sdk/components'

function MyCard() {
  return (
    <TrackedElement 
      trackingName="ProductCard"
      trackingProps={{ productId: "123" }}
      className="card"
    >
      <h3>Product Title</h3>
      <p>Product description</p>
    </TrackedElement>
  )
}
\`\`\`

**Props**:
- `trackingName: string` - 追蹤名稱
- `trackingProps?: Record<string, any>` - 自定義追蹤屬性
- 所有原生 div 屬性

### 全局配置

#### AnalyticsProvider

提供全局追蹤配置的 Context Provider。

\`\`\`typescript
import { AnalyticsProvider } from '@/sdk/provider'

function App({ children }) {
  return (
    <AnalyticsProvider 
      userId="user_123"
      companyId="company_456"
      apiEndpoint="/api/track"  // 可選，預設為 /api/track
    >
      {children}
    </AnalyticsProvider>
  )
}
\`\`\`

**Props**:
- `userId?: string` - 使用者 ID
- `companyId?: string` - 公司 ID
- `apiEndpoint?: string` - API 端點（預設: `/api/track`）
- `children: ReactNode` - 子組件

#### configure()

直接配置追蹤器（不使用 Provider）。

\`\`\`typescript
import { configure } from '@/sdk/provider'

configure({
  userId: "user_123",
  companyId: "company_456",
  apiEndpoint: "/api/custom-track"
})
\`\`\`

**參數**:
- `userId?: string` - 使用者 ID
- `companyId?: string` - 公司 ID
- `apiEndpoint?: string` - API 端點

---

## 錯誤處理

### API 錯誤碼

| 狀態碼 | 說明 | 解決方案 |
|--------|------|----------|
| 400 | 請求格式錯誤 | 檢查 events 陣列格式是否正確 |
| 500 | 伺服器錯誤 | 檢查資料庫連接或聯繫管理員 |

### 常見錯誤

#### 1. "events array is required"

**原因**: 請求 body 缺少 `events` 欄位或不是陣列

**解決方案**:
\`\`\`javascript
// ❌ 錯誤
fetch('/api/track', {
  method: 'POST',
  body: JSON.stringify({ event: {...} })  // 應該是 events 陣列
})

// ✅ 正確
fetch('/api/track', {
  method: 'POST',
  body: JSON.stringify({ 
    events: [{...}]  // events 是陣列
  })
})
\`\`\`

#### 2. Supabase 插入錯誤

**原因**: 資料格式不符合資料庫 schema

**解決方案**:
- 檢查必填欄位是否都有提供
- 檢查資料類型是否正確（如 timestamp 必須是 ISO 8601 格式）
- 檢查 JSON 欄位（properties）格式是否正確

#### 3. Session 更新失敗

**原因**: Session ID 格式錯誤或資料庫連接問題

**解決方案**:
- 確保 sessionId 是有效的字串
- 檢查資料庫連接狀態

### SDK 錯誤處理

SDK 內部會捕獲所有錯誤並輸出到 console，不會中斷應用程式執行。

\`\`\`javascript
// SDK 會自動處理錯誤
Page().view()  // 如果失敗，只會在 console 顯示錯誤訊息
\`\`\`

如需自定義錯誤處理，可以監聽 window 的錯誤事件：

\`\`\`javascript
window.addEventListener('error', (event) => {
  if (event.message.includes('[v0 SDK]')) {
    // 處理 SDK 錯誤
  }
})
\`\`\`

---

## 效能考量

### 批次發送

SDK 使用批次發送機制來減少網路請求：

- **預設間隔**: 15 秒
- **隊列上限**: 100 個事件
- **立即發送**: 頁面關閉時（beforeunload 事件）

### 最佳實踐

1. **避免過度追蹤**: 不要追蹤每個微小的互動
2. **合理使用屬性**: properties 欄位不要過大（建議 < 1KB）
3. **Session 管理**: 讓 SDK 自動管理 session，不要手動修改
4. **曝光追蹤**: 使用 Intersection Observer 比手動計算更高效

### 效能指標

- **初始化**: < 10ms
- **單次追蹤**: < 1ms
- **批次發送**: < 100ms
- **記憶體佔用**: < 1MB（100 個事件在隊列中）

---

## 版本歷史

### v1.0.0 (Current)

- 初始版本
- 支援四種事件類型：view, click, expose, disappear
- 批次發送機制
- React Hooks 和組件
- 自動設備資訊收集
- Session 管理
- Refer 追蹤（頁面導航流程）
