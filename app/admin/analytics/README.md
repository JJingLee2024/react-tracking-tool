# Analytics - 進階分析儀表板

自訂分析面板系統，提供數字儀表板、圖表視覺化和漏斗分析功能。

## 📦 功能概覽

### 核心功能
- **數字儀表板 (Metrics Panel)**: 單一指標數字顯示，支援事件計數、屬性平均值、屬性加總
- **長條圖 (Bar Chart)**: 按屬性分組的事件數量視覺化
- **趨勢圖 (Trend Chart)**: 多條折線圖展示時間序列趨勢
- **漏斗圖 (Funnel Chart)**: 用戶路徑轉換率分析
- **數據篩選**: 支援 Email 和 Session ID 篩選
- **拖拽排序**: 拖曳調整面板順序
- **持久化儲存**: 面板配置自動保存到資料庫
- **帳戶系統**: 支援用戶註冊登入，綁定儀表板到用戶帳號

## 📚 使用指南

### 訪問進階分析

\`\`\`
進階分析: /admin/analytics
從首頁: 點擊「Advanced Analytics」按鈕
從管理後台: 點擊「Advanced Analytics」按鈕
\`\`\`

### 基本操作流程

#### 1. 新增面板

1. 點擊「Add Panel」按鈕
2. 在彈出對話框中選擇圖表類型：
   - **Metrics Dashboard**: 數字指標面板
   - **Bar Chart**: 長條圖
   - **Trend Chart**: 趨勢折線圖
   - **Funnel Chart**: 漏斗圖
3. 面板立即出現在主畫面，並自動開啟右側編輯器

#### 2. 配置面板

在右側編輯器（占螢幕 75%）中設定：

**數字儀表板 (Metrics Panel)**:
- **Metric Type**: 指標類型
  - `count`: 事件數量
  - `average`: 屬性平均值
  - `sum`: 屬性加總
- **Event Name**: 要追蹤的事件名稱
- **Property Name**: 當選擇 average 或 sum 時，指定屬性名稱（如 `duration`）
- **Time Range**: 時間範圍（7d, 30d, 90d, all）
- **Data Filters**: 
  - Email: 依用戶 email 篩選
  - Session ID: 依 session 篩選

**長條圖 (Bar Chart)**:
- **Event Names**: 要比較的事件名稱（多個）
- **Group By**: 分組依據（event_type, device_type, os, browser）
- **Time Range**: 時間範圍
- **Data Filters**: Email 和 Session ID 篩選

**趨勢圖 (Trend Chart)**:
- **Event Names**: 要追蹤的事件名稱（多個，每個繪製一條線）
- **Metric Type**: 
  - `count`: 事件數量
  - `average`: 屬性平均值
  - `sum`: 屬性加總
- **Property Name**: 當選擇 average 或 sum 時必填
- **Time Granularity**: 時間粒度（hour, day, week, month）
- **Time Range**: 時間範圍
- **Data Filters**: Email 和 Session ID 篩選

**漏斗圖 (Funnel Chart)**:
- **Steps**: 漏斗步驟（依序輸入事件名稱）
- **Time Window**: 時間窗口（用戶必須在此時間內完成所有步驟，單位：小時）
- **Time Range**: 分析的時間範圍
- **Data Filters**: Email 和 Session ID 篩選

3. 點擊右上角「Apply Changes」按鈕保存配置

#### 3. 編輯面板

1. 點擊面板上的標題可直接編輯名稱
2. 點擊面板卡片任意處開啟編輯器
3. 修改配置後點擊「Apply Changes」

#### 4. 調整面板順序

1. 將滑鼠懸停在面板上方的拖曳圖標上
2. 按住滑鼠左鍵並拖曳
3. 拖曳時會顯示藍色邊框提示
4. 放開滑鼠完成調整，自動保存

#### 5. 刪除面板

1. 開啟面板編輯器
2. 點擊「Delete Panel」按鈕
3. 面板立即從儀表板移除

### 帳戶管理

#### 註冊/登入

1. 點擊右上角頭像按鈕
2. 查看當前 Session ID
3. 選擇「Sign Up」或「Login」
4. 輸入 Email 和密碼
5. 註冊/登入成功後，當前 Session 的儀表板會自動綁定到帳號

#### Supabase 設定

如果註冊後無法登入，需要在 Supabase Dashboard 中關閉郵件確認：

1. 進入 Supabase Dashboard
2. 前往 Authentication → Providers
3. 點擊 Email 提供者
4. 關閉「Confirm Email」選項
5. 保存設定
6. 刪除舊用戶後重新註冊

#### 登出

點擊帳戶選單中的「Logout」按鈕

## 🏗️ 架構設計

### 檔案結構

\`\`\`
app/admin/analytics/
├── page.tsx                          # 主頁面，儀表板容器

app/admin/components/
├── add-panel-dialog.tsx              # 新增面板對話框
├── panel-editor.tsx                  # 面板編輯器側邊欄
├── analytics-filter.tsx              # 數據篩選器組件
│
├── editors/                          # 各類型編輯器
│   ├── metrics-editor.tsx            # 數字儀表板編輯器
│   ├── bar-chart-editor.tsx          # 長條圖編輯器
│   ├── trend-chart-editor.tsx        # 趨勢圖編輯器
│   └── funnel-chart-editor.tsx       # 漏斗圖編輯器
│
└── panels/                           # 各類型面板顯示
    ├── metrics-panel.tsx             # 數字儀表板面板
    ├── bar-chart-panel.tsx           # 長條圖面板
    ├── trend-chart-panel.tsx         # 趨勢圖面板
    └── funnel-chart-panel.tsx        # 漏斗圖面板

components/
└── account-menu.tsx                  # 帳戶管理選單

lib/supabase/
└── client.ts                         # Supabase 客戶端（單例）
\`\`\`

### 資料庫 Schema

#### analytics_dashboards 表

\`\`\`sql
CREATE TABLE analytics_dashboards (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,           -- 用戶 Session ID
  user_id TEXT,                       -- 用戶 ID (email)
  panels JSONB NOT NULL DEFAULT '[]', -- 面板配置陣列
  is_shared BOOLEAN DEFAULT FALSE,    -- 是否分享
  shared_token TEXT,                  -- 分享連結 token
  collaborators TEXT[],               -- 協作者列表
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dashboards_session ON analytics_dashboards(session_id);
CREATE INDEX idx_dashboards_user ON analytics_dashboards(user_id);
\`\`\`

#### 面板配置格式

\`\`\`typescript
{
  id: string,
  type: 'metrics' | 'bar-chart' | 'trend-chart' | 'funnel-chart',
  title: string,
  config: {
    // 通用配置
    timeRange: '7d' | '30d' | '90d' | 'all',
    filter: {
      email?: string,
      sessionId?: string
    },
    
    // Metrics Panel 專用
    metric?: 'count' | 'average' | 'sum',
    eventName?: string,
    propertyName?: string,
    
    // Bar Chart 專用
    eventNames?: string[],
    groupBy?: 'event_type' | 'device_type' | 'os' | 'browser',
    
    // Trend Chart 專用
    metrics?: Array<{
      eventName: string,
      type: 'count' | 'average' | 'sum',
      propertyName?: string
    }>,
    timeGranularity?: 'hour' | 'day' | 'week' | 'month',
    
    // Funnel Chart 專用
    steps?: string[],
    timeWindow?: number  // 小時
  }
}
\`\`\`

### 組件架構

#### 1. 主頁面 (page.tsx)

**責任**:
- 載入和保存儀表板配置
- 管理面板狀態（新增、刪除、更新、排序）
- 處理拖拽排序邏輯
- Session ID 管理

**狀態管理**:
\`\`\`typescript
const [panels, setPanels] = useState<Panel[]>([])
const [showAddDialog, setShowAddDialog] = useState(false)
const [editingPanel, setEditingPanel] = useState<Panel | null>(null)
const [draggedPanel, setDraggedPanel] = useState<string | null>(null)
const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving'>('saved')
\`\`\`

#### 2. 新增面板對話框 (add-panel-dialog.tsx)

**功能**:
- 顯示四種面板類型選項
- 創建空面板並觸發編輯

#### 3. 面板編輯器 (panel-editor.tsx)

**功能**:
- 右側側邊欄容器（75vw）
- 根據面板類型渲染對應編輯器
- Apply Changes 按鈕統一提交
- Close 按鈕關閉編輯器

#### 4. 各類型編輯器

**共同特性**:
- 接收 `config` prop
- 本地狀態管理配置變更
- 通過 `onUpdate` 回調傳遞變更
- 內建數據篩選器區塊

#### 5. 各類型面板

**共同特性**:
- 接收 `config` prop
- 從 Supabase 獲取數據
- 應用篩選條件
- 視覺化渲染

### 數據流

\`\`\`
用戶操作 → 編輯器 → 本地狀態 → Apply Changes → 
主頁面更新 → 保存到 Supabase → 重新渲染面板
\`\`\`

### 漏斗圖算法

**路徑追蹤邏輯**:
1. 獲取所有符合第一步驟的事件
2. 按 session_id 分組
3. 對每個 session，檢查是否依序完成所有步驟：
   - 步驟 N+1 的時間必須 > 步驟 N 的時間
   - 步驟 N+1 與步驟 N 的時間差 ≤ 時間窗口
4. 計算每個步驟的完成數量
5. 計算步驟間轉換率和總體轉換率

\`\`\`typescript
// 漏斗數據結構
{
  step: string,           // 步驟名稱（事件名稱）
  count: number,          // 完成該步驟的用戶數
  percentage: number,     // 相對於上一步的轉換率
  dropOff: number        // 流失數量
}
\`\`\`

## 🔗 依賴的外部功能

### Supabase Database

**查詢的資料表**:
- `tracking_events`: 所有追蹤事件
- `analytics_dashboards`: 儀表板配置
- `auth.users`: 用戶認證（透過 Supabase Auth）

**需要的環境變數**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` (開發環境用)

### UI 組件庫

- **shadcn/ui**: Dialog, Button, Card, Input, Select
- **Recharts**: 圖表視覺化（Bar Chart, Line Chart）
- **date-fns**: 時間格式化和計算
- **React DnD**: 拖拽排序（原生 HTML5 Drag and Drop API）

### Supabase Auth

**使用的 API**:
- `supabase.auth.signUp()`: 用戶註冊
- `supabase.auth.signInWithPassword()`: 用戶登入
- `supabase.auth.signOut()`: 用戶登出
- `supabase.auth.onAuthStateChange()`: 監聽認證狀態

## 🛠️ 維護文件

### 新增圖表類型

1. **創建編輯器組件**:
\`\`\`tsx
// app/admin/components/editors/new-chart-editor.tsx
export function NewChartEditor({ config, onUpdate }: EditorProps) {
  const [localConfig, setLocalConfig] = useState(config)
  
  return (
    <div className="space-y-4">
      {/* 配置表單 */}
    </div>
  )
}
\`\`\`

2. **創建面板組件**:
\`\`\`tsx
// app/admin/components/panels/new-chart-panel.tsx
export function NewChartPanel({ config }: PanelProps) {
  const [data, setData] = useState([])
  
  useEffect(() => {
    // 獲取數據
  }, [config])
  
  return (
    <div>
      {/* 渲染圖表 */}
    </div>
  )
}
\`\`\`

3. **整合到系統**:
\`\`\`tsx
// panel-editor.tsx
{panel.type === 'new-chart' && (
  <NewChartEditor config={panel.config} onUpdate={handleUpdate} />
)}

// analytics/page.tsx
{panel.type === 'new-chart' && (
  <NewChartPanel config={panel.config} />
)}

// add-panel-dialog.tsx
<DialogTrigger onClick={() => handleAdd('new-chart')}>
  New Chart
</DialogTrigger>
\`\`\`

### 新增篩選條件

\`\`\`typescript
// analytics-filter.tsx
interface FilterState {
  email?: string
  sessionId?: string
  newFilter?: string  // 新增
}

// 在各面板中應用
let query = supabase.from('tracking_events').select('*')
if (filter.newFilter) {
  query = query.eq('new_field', filter.newFilter)
}
\`\`\`

### 修改時間範圍選項

\`\`\`typescript
// 在編輯器中修改
<Select value={timeRange} onValueChange={setTimeRange}>
  <SelectItem value="1d">Last 1 Day</SelectItem>
  <SelectItem value="7d">Last 7 Days</SelectItem>
  <SelectItem value="custom">Custom</SelectItem>
</Select>
\`\`\`

### 自訂漏斗圖邏輯

\`\`\`typescript
// funnel-chart-panel.tsx
// 修改 trackUserPath 函數來自訂路徑追蹤邏輯

// 例如：寬鬆順序檢查（不要求嚴格順序）
function trackUserPathLoose(events, steps) {
  // 只要用戶完成所有步驟即可，不管順序
}
\`\`\`

### 效能優化

#### 1. 限制數據查詢範圍

\`\`\`typescript
// 只查詢必要的時間範圍
const startDate = getStartDate(config.timeRange)
let query = supabase
  .from('tracking_events')
  .select('*')
  .gte('timestamp', startDate.toISOString())
\`\`\`

#### 2. 使用 SWR 快取

\`\`\`typescript
import useSWR from 'swr'

const { data } = useSWR(
  ['events', config],
  () => fetchEvents(config),
  { refreshInterval: 30000 }
)
\`\`\`

#### 3. 虛擬化長列表

對於大量數據點的圖表，考慮使用虛擬化或降採樣

### 除錯

\`\`\`typescript
// 在面板組件中添加 debug logs
console.log('[v0] Panel config:', config)
console.log('[v0] Fetched events:', events.length)
console.log('[v0] Chart data:', chartData)

// 檢查篩選條件
console.log('[v0] Active filter:', config.filter)
console.log('[v0] Filtered events:', filteredEvents.length)
\`\`\`

### 備份和還原

\`\`\`typescript
// 匯出配置
const exportConfig = () => {
  const json = JSON.stringify(panels, null, 2)
  downloadFile(json, 'dashboard-config.json')
}

// 匯入配置
const importConfig = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const panels = JSON.parse(e.target.result)
    setPanels(panels)
    saveDashboard(panels)
  }
  reader.readAsText(file)
}
\`\`\`

## 🎯 未來功能（第二階段）

### 分享和協作

- **分享連結**: 生成唯一 token，允許其他人查看儀表板
- **協作編輯**: 多個用戶同時編輯同一儀表板
- **權限管理**: 設定協作者的讀寫權限

實作建議：
\`\`\`sql
-- 生成分享連結
UPDATE analytics_dashboards
SET is_shared = true,
    shared_token = gen_random_uuid()
WHERE id = ?;

-- 添加協作者
UPDATE analytics_dashboards
SET collaborators = array_append(collaborators, 'user@example.com')
WHERE id = ?;
\`\`\`

### 進階功能

- **儀表板模板**: 預設模板快速建立
- **排程報告**: 定期生成並發送報告
- **警示通知**: 指標達到閾值時通知
- **匯出功能**: 匯出圖表為 PNG/PDF

## 📊 效能指標

- **首次載入**: < 2s
- **面板渲染**: < 500ms
- **數據查詢**: < 1s（1000 筆事件）
- **拖拽響應**: < 16ms（60fps）
- **自動保存延遲**: < 300ms
