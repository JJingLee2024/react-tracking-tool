# React Analytics Tracking SDK

完整的 React 分析追蹤系統，提供類似 PostHog、Mixpanel 的事件追蹤功能，採用優雅的鏈式 API 設計。

## 📋 專案規格

### 核心特性

- **鏈式 API 設計**: `Page().name("Home").view()`, `Button().name("Submit").click()`
- **四種事件類型**: View（頁面瀏覽）, Click（點擊）, Expose（曝光）, Disappear（消失）
- **自動命名規範**: `[Type]_[PageName]_[ComponentName]` 格式
- **批次發送機制**: 每 15 秒或 session 結束時批次發送，優化效能
- **自動資料收集**: 設備、網路、頁面資訊自動收集
- **React 整合**: 提供 Hooks 和組件實現自動追蹤
- **即時監控**: Live Log 每 2 秒刷新，實時查看事件
- **完整管理後台**: 儀表板、事件列表、Session 管理
- **進階分析功能**: 自訂儀表板、圖表配置、拖拽排序

### 技術規格

**前端 SDK**:
- TypeScript
- React 18+ / Next.js 15+
- 批次隊列管理
- Intersection Observer API（曝光追蹤）
- LocalStorage（Session 持久化）

**後端服務**:
- Next.js API Routes
- Supabase PostgreSQL
- 批次寫入優化
- camelCase ↔ snake_case 轉換

**管理介面**:
- Server Components + Client Components
- SWR 資料刷新
- Recharts 視覺化
- shadcn/ui 組件庫

## 📁 專案結構

\`\`\`
├── sdk/                          # Track SDK - 追蹤 SDK
│   ├── track.ts                  # 核心追蹤引擎，鏈式 API，事件隊列
│   ├── hooks.tsx                 # React Hooks（自動點擊、曝光追蹤）
│   ├── components.tsx            # React 組件（TrackedButton, TrackedElement）
│   ├── provider.tsx              # 全局配置 Provider
│   └── README.md                 # SDK 完整文件
│
├── services/log/                 # Log Service - 日誌服務
│   ├── README.md                 # API 服務文件
│   └── (實際 API 位於 app/api/track/route.ts)
│
├── app/admin/                    # Admin - 管理後台
│   ├── page.tsx                  # 主儀表板（統計、圖表）
│   ├── live-log/page.tsx         # 即時日誌（每 2 秒刷新）
│   ├── events/page.tsx           # 事件列表（篩選、搜尋）
│   ├── sessions/page.tsx         # Session 管理
│   ├── analytics/                # 新增進階分析功能
│   │   ├── page.tsx              # 自訂儀表板
│   │   └── README.md             # 進階分析文件
│   ├── components/               # 儀表板組件
│   │   ├── editors/              # 各類型圖表編輯器
│   │   └── panels/               # 各類型圖表面板
│   └── README.md                 # 管理後台文件
│
├── app/demo/                     # Demo - 測試頁面
│   ├── page.tsx                  # SDK 功能展示和測試
│   └── README.md                 # 測試文件
│
├── app/api/track/                # API Routes
│   └── route.ts                  # 事件接收 API
│
├── components/                   # 共用組件
│   └── account-menu.tsx          # 帳戶管理選單
│
├── lib/supabase/                 # Supabase 客戶端
│   └── client.ts                 # 單例客戶端
│
├── scripts/                      # 資料庫 SQL 腳本
│   ├── 001_create_tracking_tables.sql
│   ├── 002_create_analytics_views.sql
│   ├── 005_redesign_tracking_schema.sql
│   └── 006_create_analytics_dashboards.sql  # 新增
│
└── README.md                     # 本檔案
\`\`\`

## 🚀 快速開始

### 1. 資料庫設定

執行 SQL 腳本建立資料表：

\`\`\`bash
# 在 Supabase SQL Editor 中執行
scripts/005_redesign_tracking_schema.sql
scripts/006_create_analytics_dashboards.sql
\`\`\`

### 2. 環境變數

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

### 3. 安裝與使用

在 `app/layout.tsx` 中加入 Provider：

\`\`\`tsx
import { AnalyticsProvider } from '@/sdk/provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider userId="user_123" companyId="company_456">
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  )
}
\`\`\`

### 4. 開始追蹤

\`\`\`typescript
import { Page, Button, Element } from '@/sdk/track'

// 頁面瀏覽
Page().view()

// 按鈕點擊
Button().name("SubmitButton").click({ formId: "contact" })

// 元素曝光
Element().name("ProductCard").expose()
\`\`\`

## 📚 完整文件

- **[SDK 文件](sdk/README.md)**: API 使用、架構設計、維護指南
- **[Log Service 文件](services/log/README.md)**: API 規格、資料流程、效能優化
- **[管理後台文件](app/admin/README.md)**: 功能說明、組件架構、自訂指南
- **[進階分析文件](app/admin/analytics/README.md)**: 自訂儀表板、圖表配置、拖拽排序
- **[測試頁面文件](app/demo/README.md)**: 測試流程、除錯技巧、常見問題

## 🎯 使用範例

### 基本追蹤

\`\`\`typescript
import { Page, Button, Element } from '@/sdk/track'

// 頁面瀏覽
Page().name("HomePage").view()

// 點擊事件
Button().name("PurchaseButton").click({ 
  productId: "123",
  price: 29.99 
})

// 曝光/消失
Element().name("Banner").expose()
setTimeout(() => {
  Element().name("Banner").disappear(5000) // 5 秒後消失
}, 5000)
\`\`\`

### 自動追蹤

\`\`\`tsx
import { TrackedButton, TrackedElement } from '@/sdk/components'

export function MyPage() {
  return (
    <>
      {/* 自動追蹤點擊 */}
      <TrackedButton trackingName="SubmitButton">
        Submit Form
      </TrackedButton>

      {/* 自動追蹤曝光/消失 */}
      <TrackedElement trackingName="HeroSection">
        <div>Hero Content</div>
      </TrackedElement>
    </>
  )
}
\`\`\`

### 使用 Hooks

\`\`\`tsx
import { useAutoClick, useAutoExpose } from '@/sdk/hooks'

export function CustomComponent() {
  const clickRef = useAutoClick("CustomButton")
  const exposeRef = useAutoExpose("CustomCard")

  return (
    <>
      <button ref={clickRef}>Click Me</button>
      <div ref={exposeRef}>Track Exposure</div>
    </>
  )
}
\`\`\`

## 📊 管理後台

### 主儀表板 (`/admin`)

- 總覽統計：總事件數、活躍 Session、今日數據
- 事件趨勢圖：過去 24 小時的事件趨勢
- 最近事件：最新 10 筆事件
- 最近 Session：最新 10 個 session

### 進階分析 (`/admin/analytics`)

- 自訂分析面板
- 四種圖表類型：數字儀表板、長條圖、趨勢圖、漏斗圖
- 數據篩選：Email 和 Session ID
- 拖拽排序面板
- 面板配置持久化
- 帳戶系統：註冊/登入綁定儀表板

### 即時日誌 (`/admin/live-log`)

- 每 2 秒自動刷新
- 顯示最新 50 筆事件
- 事件類型統計
- 詳細資訊展開
- 可暫停/繼續監控

### 事件列表 (`/admin/events`)

- 完整事件記錄（最新 100 筆）
- 多條件篩選（事件名稱、Session ID、用戶 ID）
- 搜尋功能
- 事件詳細資訊

### Session 管理 (`/admin/sessions`)

- Session 列表（最新 50 個）
- 用戶和公司資訊
- 活動時間範圍
- 事件數量統計
- 設備和瀏覽器資訊

## 🧪 測試頁面 (`/demo`)

- 手動追蹤測試：四種事件類型
- 自動追蹤測試：自動點擊和曝光
- 即時事件記錄
- 快速跳轉到 Live Log

## 🎯 事件命名規範

系統自動生成的事件名稱格式：

\`\`\`
[Type]_[PageName]_[ComponentName]

範例：
- View_Home
- Click_ProductPage_BuyButton
- Expose_HomePage_HeroSection
- Disappear_ProductPage_ReviewCard
\`\`\`

PageName 轉換規則：
- `/` → `Home`
- `/products` → `Products`
- `/user/profile` → `UserProfile`

## 🔧 技術架構

### 資料收集

每個事件自動收集：

- **基本資訊**: 事件類型、名稱、頁面、組件
- **時間資訊**: 時間戳、曝光時長
- **Session**: Session ID、用戶 ID、公司 ID
- **設備資訊**: 類型、型號、作業系統、瀏覽器
- **網路資訊**: 網路類型、有效網路類型
- **頁面資訊**: URL、標題、視窗大小、來源頁面

### 批次發送

- 事件加入隊列
- 每 15 秒自動批次發送
- 頁面關閉時立即發送
- 失敗重試機制

### 資料庫結構

**tracking_events** 表：
- 儲存所有追蹤事件
- snake_case 欄位命名
- JSONB 自訂屬性
- 時間戳索引

**tracking_sessions** 表：
- 儲存 session 資訊
- 自動更新統計
- 首次/最後活動時間

## 🔒 安全性

- RLS（Row Level Security）政策
- 公開寫入，公開讀取（可自訂）
- 環境變數保護敏感資訊
- API 請求驗證

## 📈 效能指標

- **SDK 初始化**: < 10ms
- **單次追蹤**: < 1ms
- **批次發送**: < 100ms
- **API 處理**: < 200ms（10 個事件）
- **管理後台首次載入**: < 2s
- **即時日誌延遲**: < 100ms

## 🛠️ 維護

### SDK 維護
詳見 [sdk/README.md](sdk/README.md)

### API 維護
詳見 [services/log/README.md](services/log/README.md)

### 管理後台維護
詳見 [app/admin/README.md](app/admin/README.md)

## 📝 授權

MIT License

---

**開發團隊**: v0 by Vercel  
**版本**: 1.0.0  
**最後更新**: 2024
