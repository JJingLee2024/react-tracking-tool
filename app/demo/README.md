# Demo - 測試與展示頁面

SDK 功能測試和展示頁面。

## 📦 功能概覽

### 主要功能
- **手動追蹤測試**: 四種事件類型（view, click, expose, disappear）
- **自動追蹤測試**: 自動點擊和曝光追蹤
- **即時事件記錄**: 顯示已觸發的事件
- **快速導航**: 連結到即時日誌查看結果

## 📚 使用文件

### 訪問測試頁面

\`\`\`
/demo
\`\`\`

### 測試區域

#### 1. 手動追蹤測試

**頁面瀏覽測試**:
- 點擊「Track Page View」觸發頁面瀏覽事件
- 事件名稱: `View_Demo`

**手動點擊測試**:
- 點擊「Manual Click Tracking」觸發點擊事件
- 事件名稱: `Click_Demo_ManualClickButton`
- 帶自訂屬性: `{ test: "manual" }`

**手動曝光測試**:
- 點擊「Manual Expose」觸發曝光事件
- 事件名稱: `Expose_Demo_ManualExposeButton`

**手動消失測試**:
- 先點擊曝光，5 秒後點擊消失
- 事件名稱: `Disappear_Demo_ManualExposeButton`
- 帶曝光時長參數

#### 2. 自動追蹤測試

**自動點擊追蹤**:
- 使用 `TrackedButton` 組件
- 點擊時自動觸發追蹤
- 事件名稱: `Click_Demo_AutoClickButton`

**自動曝光/消失追蹤**:
- 使用 `TrackedElement` 組件
- 基於 Intersection Observer
- 滾動到可見範圍時觸發曝光
- 滾動離開可見範圍時觸發消失

#### 3. 即時事件記錄

**功能**:
- 顯示當前頁面觸發的所有事件
- 顯示事件類型、名稱、時間
- 顯示自訂屬性（如有）

**使用方式**:
1. 執行任何測試
2. 查看下方事件記錄
3. 點擊「View in Live Log」跳轉到管理後台

## 🏗️ 架構設計

### 檔案結構

\`\`\`
app/demo/
└── page.tsx              # 測試頁面
\`\`\`

### 組件架構

#### 主要組件

\`\`\`tsx
<DemoPage>
  <Header>
    <Title />
    <Description />
  </Header>
  
  <TestSections>
    <ManualTrackingSection>
      <PageViewTest />
      <ClickTest />
      <ExposeTest />
      <DisappearTest />
    </ManualTrackingSection>
    
    <AutoTrackingSection>
      <AutoClickTest />
      <AutoExposeTest />
    </AutoTrackingSection>
  </TestSections>
  
  <EventLog>
    <EventList />
  </EventLog>
</DemoPage>
\`\`\`

### 狀態管理

\`\`\`typescript
const [events, setEvents] = useState<TrackedEvent[]>([])
const [exposeTime, setExposeTime] = useState<number | null>(null)

// 記錄事件
const logEvent = (type: string, name: string, props?: any) => {
  setEvents(prev => [...prev, {
    type,
    name,
    timestamp: new Date(),
    properties: props
  }])
}
\`\`\`

### 自動追蹤實現

\`\`\`tsx
// 自動點擊
<TrackedButton trackingName="AutoClickButton">
  Auto Click Tracking
</TrackedButton>

// 自動曝光/消失
<TrackedElement trackingName="AutoExposeCard">
  <div>Content</div>
</TrackedElement>
\`\`\`

## 🔗 依賴的外部功能

### Track SDK

從 SDK 引入的功能：

\`\`\`typescript
import { Page, Button, Element } from '@/sdk/track'
import { TrackedButton, TrackedElement } from '@/sdk/components'
\`\`\`

**使用的 API**:
- `Page().view()`: 頁面瀏覽追蹤
- `Button().name().click()`: 按鈕點擊追蹤
- `Element().name().expose()`: 元素曝光追蹤
- `Element().name().disappear()`: 元素消失追蹤
- `TrackedButton`: 自動點擊追蹤組件
- `TrackedElement`: 自動曝光/消失追蹤組件

### UI 組件

- shadcn/ui: Button, Card, Badge
- Lucide Icons: 各種圖標
- date-fns: 時間格式化

## 🛠️ 維護文件

### 新增測試案例

\`\`\`tsx
// app/demo/page.tsx

// 1. 定義測試函數
const handleNewTest = () => {
  // 執行追蹤
  Button().name("NewTestButton").click({ test: "new" })
  
  // 記錄到 UI
  logEvent("click", "Click_Demo_NewTestButton", { test: "new" })
}

// 2. 在 UI 中新增按鈕
<Button onClick={handleNewTest}>
  New Test
</Button>
\`\`\`

### 新增自動追蹤測試

\`\`\`tsx
// 使用 Hook
import { useAutoClick } from '@/sdk/hooks'

function CustomTest() {
  const ref = useAutoClick("CustomTestButton")
  
  return (
    <button ref={ref}>Custom Auto Tracking</button>
  )
}
\`\`\`

### 自訂事件記錄格式

\`\`\`tsx
// 修改 EventLog 組件
<div className="space-y-2">
  {events.map((event, i) => (
    <div key={i} className="border rounded p-3">
      <div className="flex items-center gap-2">
        <Badge>{event.type}</Badge>
        <span className="font-mono text-sm">{event.name}</span>
      </div>
      <div className="text-xs text-muted-foreground mt-1">
        {format(event.timestamp, 'HH:mm:ss')}
      </div>
      {event.properties && (
        <pre className="mt-2 text-xs">
          {JSON.stringify(event.properties, null, 2)}
        </pre>
      )}
    </div>
  ))}
</div>
\`\`\`

### 除錯提示

\`\`\`typescript
// 開啟 SDK debug 模式
console.log('[v0 Demo] Test triggered:', {
  type: 'click',
  name: 'TestButton',
  timestamp: new Date()
})

// 檢查事件是否發送
// 開啟瀏覽器開發者工具 → Network → 篩選 "track"
// 查看 POST /api/track 請求
\`\`\`

### 測試流程

#### 基本測試流程

1. 開啟 `/demo` 頁面
2. 執行各種測試按鈕
3. 查看頁面下方的事件記錄
4. 點擊「View in Live Log」查看即時日誌
5. 確認事件正確記錄在資料庫中

#### 自動追蹤測試流程

1. 滾動到「Auto Tracking Tests」區域
2. 觀察曝光事件觸發（在事件記錄中）
3. 點擊自動追蹤按鈕
4. 滾動離開區域，觀察消失事件
5. 在即時日誌中確認所有事件

#### 曝光時長測試流程

1. 點擊「Manual Expose」
2. 記錄開始時間
3. 等待 5-10 秒
4. 點擊「Manual Disappear (after expose)」
5. 查看事件記錄中的 exposeTime 參數
6. 確認時長計算正確

### 常見問題

**Q: 事件沒有出現在即時日誌中？**

A: 檢查：
1. 瀏覽器 Console 是否有錯誤
2. Network tab 中是否有 `/api/track` 請求
3. 請求是否成功（200 狀態碼）
4. 等待 2-15 秒（批次發送延遲）

**Q: 自動曝光追蹤不觸發？**

A: 檢查：
1. 元素是否在可視範圍內
2. 瀏覽器是否支援 Intersection Observer
3. 元素高度是否足夠（至少 50% 可見）

**Q: 時間戳記不正確？**

A: 檢查：
1. 系統時間是否正確
2. 時區設定（應使用 UTC）
3. 瀏覽器時間是否與伺服器同步

## 📊 測試覆蓋率

- ✅ 頁面瀏覽追蹤
- ✅ 按鈕點擊追蹤
- ✅ 元素曝光追蹤
- ✅ 元素消失追蹤
- ✅ 自動點擊追蹤
- ✅ 自動曝光/消失追蹤
- ✅ 自訂屬性傳遞
- ✅ 曝光時長計算
- ✅ 批次發送機制
- ✅ 即時日誌驗證
