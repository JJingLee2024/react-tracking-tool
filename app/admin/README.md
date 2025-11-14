# Admin - 管理後台

分析資料視覺化和管理介面。

## 📦 功能概覽

### 主要功能
- **主儀表板**: 統計概覽、事件趨勢圖表、最近事件
- **即時日誌**: 每 2 秒自動刷新的事件流
- **事件列表**: 完整事件記錄，支援篩選和搜尋
- **Session 管理**: 用戶 session 列表和詳細資訊
- **進階分析**: 自訂分析儀表板，支援多種圖表類型

## 📚 使用文件

### 訪問管理後台

\`\`\`
主儀表板: /admin
即時日誌: /admin/live-log
事件列表: /admin/events
Session 列表: /admin/sessions
進階分析: /admin/analytics
\`\`\`

### 主儀表板 (/admin)

**功能**:
- 統計卡片：總事件數、活躍 Session、今日事件、今日 Session
- 事件趨勢圖：過去 24 小時的事件數量趨勢
- 最近事件表格：最新 10 筆事件
- 最近 Session 表格：最新 10 個 session

**使用方式**:
- 自動每 30 秒刷新一次
- 點擊統計卡片可快速導航到相關頁面

### 即時日誌 (/admin/live-log)

**功能**:
- 即時顯示最新 50 筆事件
- 每 2 秒自動刷新
- 可暫停/繼續自動刷新
- 事件類型統計（view, click, expose, disappear）
- 事件詳細資訊展開

**使用方式**:
1. 頁面自動開始監控
2. 點擊「暫停」按鈕停止自動刷新
3. 點擊事件卡片展開詳細資訊
4. 適合實時監控和除錯

### 事件列表 (/admin/events)

**功能**:
- 顯示所有追蹤事件（最新 100 筆）
- 篩選器：事件名稱、Session ID、用戶 ID
- 搜尋功能
- 事件詳細資訊
- 分頁（URL 參數）

**使用方式**:
1. 使用頂部篩選器縮小範圍
2. 輸入關鍵字搜尋
3. 點擊事件查看完整 JSON 資料
4. 使用瀏覽器前進/後退導航

### Session 列表 (/admin/sessions)

**功能**:
- 顯示所有 session（最新 50 個）
- Session 基本資訊：ID、用戶、公司
- 活動時間範圍
- 事件數量統計
- 設備和瀏覽器資訊

**使用方式**:
1. 查看 session 列表
2. 識別活躍用戶
3. 追蹤用戶行為模式

### 進階分析 (/admin/analytics)

**功能**:
- 自訂分析面板系統
- 數字儀表板：單一指標數字顯示
- 長條圖：按屬性分組的事件數量
- 趨勢圖：多條折線圖展示時間序列
- 漏斗圖：用戶路徑轉換率分析
- 持久化儲存：配置自動保存
- 帳戶系統：註冊/登入綁定儀表板

**使用方式**:
1. 點擊「Add Panel」新增面板
2. 選擇圖表類型
3. 在右側編輯器中配置參數
4. 點擊「Apply Changes」保存
5. 拖曳面板調整順序
6. 點擊標題重命名面板

詳細文件請參考 [進階分析文件](analytics/README.md)

## 🏗️ 架構設計

### 檔案結構

\`\`\`
app/admin/
├── page.tsx                    # 主儀表板
├── live-log/
│   └── page.tsx                # 即時日誌
├── events/
│   ├── page.tsx                # 事件列表
│   └── loading.tsx             # 載入狀態
├── sessions/
│   └── page.tsx                # Session 列表
├── analytics/                  # 進階分析
│   ├── page.tsx                # 自訂儀表板主頁面
│   └── README.md               # 進階分析文件
└── components/
    ├── stats-cards.tsx         # 統計卡片組件
    ├── event-chart.tsx         # 事件趨勢圖表
    ├── events-table.tsx        # 事件表格
    ├── sessions-table.tsx      # Session 表格
    ├── events-filter.tsx       # 事件篩選器
    ├── add-panel-dialog.tsx    # 新增面板對話框
    ├── panel-editor.tsx        # 面板編輯器
    ├── analytics-filter.tsx    # 分析篩選器
    ├── editors/                # 圖表編輯器
    │   ├── metrics-editor.tsx
    │   ├── bar-chart-editor.tsx
    │   ├── trend-chart-editor.tsx
    │   └── funnel-chart-editor.tsx
    └── panels/                 # 圖表面板
        ├── metrics-panel.tsx
        ├── bar-chart-panel.tsx
        ├── trend-chart-panel.tsx
        └── funnel-chart-panel.tsx
\`\`\`

### 組件架構

#### 1. 統計卡片 (stats-cards.tsx)

**輸入**:
\`\`\`typescript
{
  totalEvents: number
  activeSessions: number
  todayEvents: number
  todaySessions: number
}
\`\`\`

**特性**:
- 使用 shadcn/ui Card 組件
- 響應式網格佈局
- 圖標視覺化

#### 2. 事件趨勢圖表 (event-chart.tsx)

**輸入**:
\`\`\`typescript
{
  data: Array<{
    hour: string
    events: number
  }>
}
\`\`\`

**特性**:
- 使用 Recharts 線圖
- 24 小時時間軸
- 響應式設計

#### 3. 事件表格 (events-table.tsx)

**輸入**:
\`\`\`typescript
{
  events: Array<TrackingEvent>
}
\`\`\`

**特性**:
- 緊湊型表格設計
- 事件類型顏色標記
- 時間格式化
- 可展開詳細資訊

#### 4. Session 表格 (sessions-table.tsx)

**輸入**:
\`\`\`typescript
{
  sessions: Array<TrackingSession>
}
\`\`\`

**特性**:
- Session 資訊展示
- 時間範圍計算
- 設備類型圖標

#### 5. 事件篩選器 (events-filter.tsx)

**輸入**:
\`\`\`typescript
{
  onFilterChange: (filters: FilterState) => void
}
\`\`\`

**特性**:
- 即時篩選
- 多條件組合
- URL 狀態同步

#### 6. 新增面板對話框 (add-panel-dialog.tsx)

**輸入**:
\`\`\`typescript
{
  onAddPanel: (panelType: string) => void
}
\`\`\`

**特性**:
- 使用 shadcn/ui Dialog 組件
- 面板類型選擇
- 新增面板按鈕

#### 7. 面板編輯器 (panel-editor.tsx)

**輸入**:
\`\`\`typescript
{
  panelType: string
  panelConfig: any
  onSave: (newConfig: any) => void
}
\`\`\`

**特性**:
- 根據面板類型顯示對應的編輯器
- 配置參數編輯
- 保存按鈕

#### 8. 分析篩選器 (analytics-filter.tsx)

**輸入**:
\`\`\`typescript
{
  onFilterChange: (filters: AnalyticsFilterState) => void
}
\`\`\`

**特性**:
- 即時篩選
- 多條件組合
- URL 狀態同步

#### 9. 數字儀表板 (metrics-panel.tsx)

**輸入**:
\`\`\`typescript
{
  metric: number
  metricName: string
}
\`\`\`

**特性**:
- 數字顯示
- 標題編輯
- 設計簡潔

#### 10. 長條圖面板 (bar-chart-panel.tsx)

**輸入**:
\`\`\`typescript
{
  data: Array<{
    category: string
    value: number
  }>
}
\`\`\`

**特性**:
- 使用 Recharts 長條圖
- 分類數據展示
- 標題編輯

#### 11. 趨勢圖面板 (trend-chart-panel.tsx)

**輸入**:
\`\`\`typescript
{
  data: Array<{
    timestamp: string
    value: number
  }>
}
\`\`\`

**特性**:
- 使用 Recharts 折線圖
- 時間序列數據展示
- 標題編輯

#### 12. 漏斗圖面板 (funnel-chart-panel.tsx)

**輸入**:
\`\`\`typescript
{
  steps: Array<{
    name: string
    value: number
  }>
}
\`\`\`

**特性**:
- 使用 Recharts 漏斗圖
- 用戶路徑轉換率展示
- 標題編輯

### 資料流

\`\`\`
Supabase DB → Server Component → Client Component → UI
                ↓
         SWR (客戶端輪詢)
                ↓
            自動刷新
\`\`\`

### 即時更新機制

#### 主儀表板
- 使用 SWR 的 `refreshInterval: 30000` 每 30 秒刷新

#### 即時日誌
- 使用 `setInterval` 每 2 秒查詢最新事件
- 可暫停/恢復自動刷新
- 使用 `useEffect` cleanup 防止記憶體洩漏

## 🔗 依賴的外部功能

### Supabase Database

**查詢的資料表**:
- `tracking_events`: 所有追蹤事件
- `tracking_sessions`: Session 資訊

**需要的欄位**:
- 所有欄位（使用 `select('*')`）

**RLS 政策**:
\`\`\`sql
-- 允許公開讀取（已設定）
CREATE POLICY "Allow public read access to tracking_events"
ON tracking_events FOR SELECT TO anon USING (true);

CREATE POLICY "Allow public read access to tracking_sessions"
ON tracking_sessions FOR SELECT TO anon USING (true);
\`\`\`

**環境變數**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### UI 組件庫

- **shadcn/ui**: Card, Button, Badge, Table 等
- **Recharts**: 圖表視覺化
- **Lucide Icons**: 圖標系統
- **date-fns**: 時間格式化

### Next.js 功能

- App Router (Server Components)
- `useSearchParams` for URL 狀態
- `revalidatePath` for 資料重新驗證

## 🛠️ 維護文件

### 新增統計指標

1. 在主儀表板查詢中新增計算：
\`\`\`typescript
// app/admin/page.tsx
const { count: newMetric } = await supabase
  .from('tracking_events')
  .select('*', { count: 'exact', head: true })
  .eq('custom_field', 'value')
\`\`\`

2. 在 StatsCards 組件中新增卡片：
\`\`\`tsx
<Card>
  <CardHeader>
    <CardTitle>New Metric</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">{newMetric}</div>
  </CardContent>
</Card>
\`\`\`

### 修改刷新間隔

\`\`\`typescript
// 主儀表板 - 30 秒刷新
// app/admin/page.tsx
export const revalidate = 30

// 即時日誌 - 2 秒刷新
// app/admin/live-log/page.tsx
const REFRESH_INTERVAL = 2000
\`\`\`

### 新增篩選條件

\`\`\`typescript
// components/events-filter.tsx
const [filters, setFilters] = useState({
  eventName: '',
  sessionId: '',
  userId: '',
  newFilter: '', // 新增
})

// 在查詢中使用
let query = supabase.from('tracking_events').select('*')
if (filters.newFilter) {
  query = query.eq('new_field', filters.newFilter)
}
\`\`\`

### 自訂圖表

\`\`\`tsx
// components/event-chart.tsx
import { BarChart, Bar } from 'recharts'

// 改用長條圖
<BarChart data={data}>
  <Bar dataKey="events" fill="#8884d8" />
</BarChart>
\`\`\`

### 效能優化

#### 1. 限制查詢數量

\`\`\`typescript
// 只查詢最新 N 筆
const { data } = await supabase
  .from('tracking_events')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(100) // 限制 100 筆
\`\`\`

#### 2. 選擇性欄位查詢

\`\`\`typescript
// 只查詢需要的欄位
const { data } = await supabase
  .from('tracking_events')
  .select('id, event_type, event_name, timestamp')
\`\`\`

#### 3. 客戶端分頁

\`\`\`typescript
// 使用虛擬滾動或分頁組件
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext
} from '@/components/ui/pagination'
\`\`\`

### 除錯

\`\`\`typescript
// 查看查詢結果
console.log('[v0 Admin] Events loaded:', {
  count: events.length,
  first: events[0],
  last: events[events.length - 1]
})

// 監控刷新
console.log('[v0 Admin] Auto-refresh triggered at', new Date())
\`\`\`

### 添加新頁面

1. 建立新檔案：
\`\`\`bash
app/admin/new-page/page.tsx
\`\`\`

2. 在導航中新增連結：
\`\`\`tsx
// app/admin/page.tsx 或 layout.tsx
<Link href="/admin/new-page">New Page</Link>
\`\`\`

## 🎨 設計指南

### 色彩系統

- **主色**: Slate (中性灰)
- **強調色**: Blue (點擊), Green (曝光), Purple (頁面瀏覽), Orange (消失)
- **背景**: Dark mode 優先

### 字體

- **標題**: font-bold, text-2xl
- **內文**: font-normal, text-base
- **數據**: font-mono, text-sm

### 間距

- **卡片間距**: gap-6
- **內容間距**: space-y-4
- **按鈕間距**: gap-2

## 📊 效能指標

- **首次載入**: < 2s
- **資料刷新**: < 500ms
- **即時日誌延遲**: < 100ms
- **圖表渲染**: < 200ms
