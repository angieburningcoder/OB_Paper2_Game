# HERO 製造機

OB 課程 paper 報告（Bernoff & Schadler, *Empowered*）的 20 分鐘課堂互動遊戲。遊戲設計：筱于

各組讀三個 AI 情境，把 3 點分給「主管撐腰／IT 鋪路／員工擴散」，或選擇全面禁用。三題都做完後，依各組的選擇揭曉「決策風格角色」，同學可以下載自己組的圖卡。

## 架構

- `index.html`：單一頁面。網址加 `?host=主持人密碼` 是投影用的大螢幕，一般網址是同學手機
- `api/`：Vercel Serverless Functions（`state` 讀狀態、`join` 選組、`submit` 送出決策、`host` 主持人換頁／重設）
- 資料庫：Neon Postgres，資料表會在第一次呼叫 API 時自動建立
- 手機每 2 秒向伺服器更新一次；揭曉前，其他組的選擇只會回傳「有沒有送出」

## 部署（Vercel）

1. Vercel → Add New Project → 匯入這個 repo（Framework 選 Other，不用 build 指令）
2. Settings → Environment Variables 加兩個：
   - `DATABASE_URL`：Neon 的連線字串
   - `HOST_KEY`：主持人密碼（自訂）
3. Deploy

## 上課當天

1. 投影電腦開 `https://你的網址/?host=主持人密碼`
2. 開始前按一次「重設遊戲」清掉測試資料
3. 同學掃大螢幕上的 QR code 選組，主持人按「下一步」推進流程
4. 情境題每題倒數 4 分鐘，計時只是提醒，換題由主持人決定

`.env` 只放在本機，不會進版本控制，參考 `.env.example`。
