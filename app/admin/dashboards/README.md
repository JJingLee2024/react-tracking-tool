# Dashboard Management

儀表板管理系統讓用戶可以創建和管理多個進階分析儀表板。

## 功能概述

### 儀表板管理頁面 (`/admin/dashboards`)

儀表板管理頁面分為四個主要分頁：

1. **Your Dashboards（你創建的儀表板）**
   - 顯示你創建的所有儀表板
   - 可以快速創建新儀表板
   - 點擊儀表板卡片進入編輯
   - 顯示創建者 email

2. **Co-work with You（協作儀表板）**
   - 顯示其他人分享給你的儀表板（編輯者或檢視者）
   - 需要登入才能查看
   - 編輯者可以編輯面板，檢視者只能查看
   - 顯示創建者 email

3. **Favorites（你收藏的儀表板）**
   - 顯示你收藏的儀表板
   - 需要登入才能查看
   - 快速存取常用儀表板

4. **Explore（探索公開儀表板）**
   - 顯示所有公開的儀表板
   - 無需登入即可查看
   - 查看其他人分享的公開儀表板

### 儀表板頁面 (`/admin/analytics?analytics_id=<dashboard_id>`)

每個儀表板有自己的專屬頁面，功能包括：

#### 權限系統

**創建者權限：**
- 完整編輯權限（新增、編輯、刪除面板）
- 管理權限設定
- 管理共同編輯者和檢視者
- 設定儀表板可見性（Private / Public）

**共同編輯者權限：**
- 完整編輯權限（新增、編輯、刪除面板）
- 可以查看儀表板
- **不能**管理權限
- 只有在儀表板為 Public 時可以分享連結

**檢視者權限：**
- 只能查看儀表板
- **不能**編輯面板
- **不能**管理權限
- 只有在儀表板為 Public 時可以分享連結

**無權限訪問：**
- 顯示「Access Denied」訊息
- 提供創建者 email（如果可用）
- 提供返回儀表板列表的連結

#### 可見性設定

**Private（私人）：**
- 只有創建者、共同編輯者和檢視者可以訪問
- 需要明確授予權限
- 不能分享公開連結

**Public（公開）：**
- 任何有連結的人都可以查看
- 不需要登入或授權
- 可以分享連結給任何人
- 仍然只有創建者和共同編輯者可以編輯

#### 收藏功能

- 點擊右上角的愛心圖標可以收藏/取消收藏儀表板
- 收藏的儀表板會出現在「Favorites」分頁中
- 需要登入才能使用收藏功能

#### 編輯功能

**儀表板標題：**
- 點擊標題可以直接編輯
- 只有創建者和共同編輯者可以編輯

**面板管理：**
- 新增面板：點擊「Add Panel」按鈕
- 編輯面板：點擊面板卡片開啟側邊欄編輯器（寬度 50% 視窗，置頂顯示）
- 編輯時自動將面板中心對齊到視窗 25% 位置
- 刪除面板：在面板卡片上點擊「Delete」按鈕
- 調整順序：拖曳面板卡片上方的拖曳圖標

## 權限管理對話框

創建者可以通過「Permissions」按鈕打開權限管理對話框：

### 可見性設定
- **Private**：只有授權用戶可以訪問
- **Public**：任何人都可以用連結查看

### 共同編輯者管理
- 輸入 email 地址添加共同編輯者
- 共同編輯者可以編輯所有面板
- 可以隨時移除共同編輯者

### 檢視者管理（僅 Private 模式）
- 輸入 email 地址添加檢視者
- 檢視者只能查看，不能編輯
- 可以隨時移除檢視者

## 分享對話框

當儀表板設為 Public 時，可以使用分享功能：

- 點擊「Share」按鈕開啟分享對話框
- 顯示儀表板的完整 URL
- 一鍵複製連結
- 任何人都可以用此連結查看儀表板

## 資料庫架構

### 相關表格

**analytics_dashboards**
- 儲存儀表板配置和面板資料
- `visibility` 欄位：private / public
- `creator_id` 欄位：創建者的用戶 ID

**dashboard_editors**
- 儲存共同編輯者列表
- 每個記錄代表一個用戶對一個儀表板的編輯權限
- 通過 email 識別用戶

**dashboard_viewers**
- 儲存檢視者列表
- 每個記錄代表一個用戶對一個儀表板的查看權限
- 通過 email 識別用戶

**dashboard_favorites**
- 儲存用戶收藏的儀表板
- 每個記錄代表一個用戶對一個儀表板的收藏

## 使用流程

### 創建新儀表板
1. 進入 `/admin/dashboards`
2. 點擊「Create Dashboard」按鈕
3. 自動跳轉到新儀表板頁面
4. 開始添加面板

### 分享儀表板給團隊
1. 打開儀表板
2. 點擊「Permissions」按鈕
3. 添加共同編輯者的 email（可編輯）
4. 或添加檢視者的 email（僅查看）
5. 保持 Private 模式，只有授權用戶可訪問

### 公開分享儀表板
1. 打開儀表板
2. 點擊「Permissions」按鈕
3. 將可見性設為「Public」
4. 點擊「Share」按鈕
5. 複製連結並分享給任何人

### 訪問他人分享的儀表板
1. 進入 `/admin/dashboards`
2. 切換到「Co-work with You」分頁
3. 查看被分享的儀表板列表
4. 點擊進入編輯

### 探索公開儀表板
1. 進入 `/admin/dashboards`
2. 切換到「Explore」分頁
3. 查看所有公開的儀表板列表
4. 點擊進入查看

## 技術實作細節

### 權限檢查邏輯
\`\`\`typescript
// 1. 檢查是否為創建者
const isOwner = user && dashboard.creator_id === user.id

// 2. 檢查是否為公開儀表板
if (dashboard.visibility === "public") {
  canView = true
}

// 3. 檢查是否為共同編輯者
const editors = await supabase
  .from("dashboard_editors")
  .select("*")
  .eq("dashboard_id", dashboardId)
  .eq("user_email", user.email)

if (editors.length > 0) {
  canEdit = true
  canView = true
}

// 4. 檢查是否為檢視者
const viewers = await supabase
  .from("dashboard_viewers")
  .select("*")
  .eq("dashboard_id", dashboardId)
  .eq("user_email", user.email)

if (viewers.length > 0) {
  canView = true
}
\`\`\`

### 自動保存
- 使用 debounce（1秒）自動保存儀表板變更
- 在標題旁顯示「Saving...」指示器
- 所有變更即時同步到資料庫

### 拖曳排序
- 使用 HTML5 Drag & Drop API
- 視覺反饋：拖曳時面板半透明，目標位置藍色邊框
- 只有有編輯權限的用戶可以拖曳

## 未來擴展

第二階段計劃功能：
- 即時協作編輯
- 評論和註解系統
- 版本歷史和復原
- 儀表板模板
- 匯出和匯入功能
