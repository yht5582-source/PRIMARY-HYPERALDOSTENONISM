# PA 臨床導航

原發性醛固酮增多症（Primary Aldosteronism）繁體中文互動教學工具。

## 功能
- ARR 計算：PRA／DRC、免疫分析法／LC-MS/MS、PAC 三種單位。
- 採血條件、降壓藥干擾、低血鉀、CKD、懷孕及鹽負荷風險提示。
- 抑制試驗、CT／AVS 定側、手術與 MRA 治療流程。
- 虛構教學病例、測驗、列印判讀。

依據 Endocrine Society 2025 guideline (doi:10.1210/clinem/dgaf284) 及 2023 Korean Endocrine Society consensus。界值需配合地方檢驗法。僅作專業教學及臨床判讀輔助，非自動確診或處方。無患者識別資料、無後端、無追蹤工具；不儲存輸入資料。

## 使用與部署
GitHub Pages: main branch / root。檔案使用相對路徑，適用儲存庫子路徑。透過 HTTP(S) 伺服器開啟 index.html（ES modules 不支援直接 file:// 開啟）。

## 驗證
`node engine.test.mjs`

版本 1.0，內容整理日期 2026-10-26。
