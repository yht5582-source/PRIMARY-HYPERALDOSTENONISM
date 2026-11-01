// 教學內容：病例、考題、心智圖。全部為虛構病例；數字由 teach.test.mjs 對照 engine.mjs 與 avsRead()。
export const SOURCES={
 es:{label:'Endocrine Society 2025 指引',url:'https://doi.org/10.1210/clinem/dgaf284'},
 kes:{label:'韓國內分泌學會 2023 共識',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC10765003/'},
 paso:{label:'PASO 共識（Williams 2017）',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5572673/'},
 hundemer:{label:'Hundemer 2018 世代研究',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC5953512/'},
 rossi:{label:'AVS 回顧（Endocr Rev 2025）',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC12259235/'},
 mraavs:{label:'MRA 治療中 AVS（Hypertension 2024）',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC11095898/'}
};

// AVS 指數：SI、LI、CSI。ref 為 cortisol 或 metanephrine，同一列單位需一致。
export function avsRead({marker='cortisol',cosyntropin=false,right,left,ivc}){
 const siR=right.ref/ivc.ref,siL=left.ref/ivc.ref;
 const rR=right.aldo/right.ref,rL=left.aldo/left.ref,rI=ivc.aldo/ivc.ref;
 const side=rR>=rL?'右':'左',high=Math.max(rR,rL),low=Math.min(rR,rL);
 const li=high/low,csi=low/rI;
 const cut=marker==='metanephrine'?12:cosyntropin?5:null;
 const one=s=>cut?(s>cut?'ok':'fail'):(s>3?'ok':s>1.4?'center':'fail');
 const sel=[one(siR),one(siL)];
 const selectivity=sel.includes('fail')?'fail':sel.includes('center')?'center':'ok';
 const lateral=li>=4?'lateral':li>=3?'gray':'bilateral';
 return {siR,siL,rR,rL,rI,li,csi,side,selectivity,lateral,suppressed:csi<1};
}

const base={unit:'ng',assay:'ia',reninType:'pra',prepared:'yes',surgery:'yes',meds:[]};

export const CASES=[
{id:'c4',no:'04',tag:'偽陰性 · 調藥複驗',title:'ARR 不高，又是正常血鉀，可以排除嗎？',
 stem:'46 歲女性，三種藥（losartan 100 mg、HCTZ 25 mg、amlodipine 10 mg）下診間血壓仍 158/96 mmHg，K 3.9、eGFR 96。首次篩檢 PAC 13 ng/dL、PRA 2.4 ng/mL/hr。她表示若能根治，願意評估手術。',
 facts:['抗藥性高血壓','K 正常','服 ARB＋thiazide','願意評估手術'],
 question:'renin 沒有受抑制，這一次的陰性能信嗎？若要複驗，哪些藥要停、停多久？',
 steps:[
  {label:'首次：服藥中',input:{...base,pac:13,renin:2.4,k:3.9,egfr:96,resistant:true,meds:['raas','diuretic']},expect:{positive:false,strong:false,title:'仍需複評'}},
  {label:'複驗：停藥後，以 verapamil SR＋doxazosin 暫代',input:{...base,pac:17,renin:0.4,k:3.7,egfr:96,resistant:true},expect:{positive:true,strong:false,next:'抑制試驗'}}],
 read:['ARB 與 thiazide 都會推高 renin，造成偽陰性；抗藥性高血壓屬於中高前測機率，不能憑這一次排除。','停藥後 renin 落到 0.4，ARR 42.5，三項條件都符合。','未達免抑制試驗條件（PRA 未 &lt;0.2、PAC 未 &gt;20 ng/dL），又想手術，因此屬於「中間機率＋想手術」。'],
 plan:['表 6：thiazide 停 4 週；ARB、DHP-CCB 停 2 週。停藥期間須監測血壓，由醫師決定是否可行。','安排坐姿生理食鹽水試驗。假設 4 小時 PAC 11.2 ng/dL（免疫法，未 &lt;7.8），未能降低 PA 可能性，接著 CT＋AVS。','低血鉀先校正到參考範圍，避免 aldosterone 被壓低。'],
 pitfall:'只看 ARR 數字就結案。陰性結果要先問：K 校正了嗎？有沒有推高 renin 的藥？前測機率高不高？',src:['es']},
{id:'c5',no:'05',tag:'定側 · CT 與 AVS 不一致',title:'CT 說左邊，AVS 說右邊，要切哪一側？',
 stem:'54 歲男性，抗藥性高血壓，服 KCl 下 K 3.2。PAC 31 ng/dL、PRA 0.15 ng/mL/hr。CT 顯示左側 1.8 cm 低密度結節，右側正常。K 補正後於未使用 cosyntropin 下接受 AVS。',
 facts:['符合免抑制試驗條件','左側 1.8 cm 結節','K 補正後 AVS','未用 cosyntropin'],
 question:'先算 SI、LI、CSI，再決定手術側。',
 steps:[{label:'篩檢',input:{...base,pac:31,renin:0.15,k:3.2,egfr:78,resistant:true},expect:{positive:true,strong:true}}],
 avs:{right:{aldo:980,ref:62},left:{aldo:48,ref:56},ivc:{aldo:32,ref:16},expect:{side:'右',selectivity:'ok',lateral:'lateral',suppressed:true}},
 read:['雙側 SI 均 &gt;3，取樣成功。','Aldosterone／cortisol 比值右高左低，LI 遠超過 4，且左側 CSI &lt;1：分泌來自右側，左側受抑制。','左側結節很可能是無功能腺瘤。指引提醒，&gt;35 歲族群常見無功能單側巨腺瘤，CT 無法與 APA 區分。'],
 plan:['討論腹腔鏡右側全腎上腺切除，不是切 CT 上看得到的那一側。','有腺瘤者術前做 1 mg 過夜 DST（Rec 8）。','術前以 MRA 控制血壓與血鉀；術後 3 個月先評估，6–12 個月判定最終結果。'],
 pitfall:'看到單側結節就切。系統性回顧中，以 AVS 為準時 CT／MRI 誤判 PA 成因達 37.8%。',src:['es','paso']},
{id:'c6',no:'06',tag:'Cortisol 共分泌',title:'結節同時分泌 cortisol，AVS 還能照算嗎？',
 stem:'59 歲女性，抗藥性高血壓合併 K 3.4，PAC 26 ng/dL、PRA 0.15 ng/mL/hr。CT 右側 2.6 cm 腺瘤。1 mg 過夜 DST 隔晨 cortisol 5.6 μg/dL。未使用 cosyntropin 的 AVS 同時測了 metanephrine。',
 facts:['右側 2.6 cm 腺瘤','DST cortisol 5.6 μg/dL','AVS 加測 metanephrine','想手術'],
 question:'以 cortisol 校正的 LI 只有 2 左右，這代表雙側病變嗎？',
 steps:[{label:'篩檢',input:{...base,pac:26,renin:0.15,k:3.4,egfr:82,resistant:true},expect:{positive:true,strong:true}}],
 avs:{right:{aldo:420,ref:90},left:{aldo:40,ref:18},ivc:{aldo:20,ref:14},expect:{side:'右',selectivity:'fail',lateral:'bilateral'}},
 avs2:{marker:'metanephrine',right:{aldo:420,ref:900},left:{aldo:40,ref:850},ivc:{aldo:20,ref:40},expect:{side:'右',selectivity:'ok',lateral:'lateral'}},
 read:['DST &gt;1.8 μg/dL 提示自主分泌（ACS）；PA 合併 ACS 約 5–15%。','右側腫瘤的 cortisol 墊高了分母，對側 cortisol 又受抑制，cortisol 校正的 SI 與 LI 都會失真。此處 LI 約 2，不能解讀為雙側。','改以 metanephrine 校正：指引建議 SI &gt;12、LI &gt;4；本例兩者都符合，指向右側。'],
 plan:['補 24 小時尿液游離 cortisol、午夜唾液 cortisol；留意假陽性（口服雌激素、CYP3A4 誘導劑）。','指引列為可不做 AVS 的例外：單側巨腺瘤（&gt;1 cm）合併 PA 與具臨床意義的 cortisol 自主分泌。是否省略由專科判斷。','術後測清晨 cortisol，預備可能的腎上腺功能不足。指引引述小型研究：PA 合併高皮質醇 12 人中 50% 需補充，中位 0.8 個月。'],
 pitfall:'術前沒做 DST，術後才出現疲倦、低血壓、低血糖而延誤處理；或把失真的 cortisol 校正 LI 當成雙側，錯失手術機會。',src:['es']},
{id:'c7',no:'07',tag:'年輕典型 · 術後追蹤',title:'29 歲、低血鉀、CT 有腺瘤：可以省略哪些檢查？',
 stem:'29 歲男性，血壓 176/108 mmHg，自發性低血鉀 K 2.9。PAC 42 ng/dL，PRA 低於定量下限 0.1 ng/mL/hr。eGFR 118。CT 左側 1.4 cm 皮質腺瘤特徵。希望手術。',
 facts:['&lt;35 歲','自發性低血鉀','PAC 42 ng/dL','左側 1.4 cm 腺瘤'],
 question:'抑制試驗與 AVS 能省嗎？術後第一天要停什麼？九個月後如何判定結果？',
 steps:[{label:'篩檢（renin 低於下限）',input:{...base,pac:42,renin:0.1,k:2.9,egfr:118,below:true,highRisk:true},expect:{positive:true,strong:true}}],
 table:{head:['時間','血壓','藥物','K','處置／判定'],rows:[
  ['術前','176/108','spironolactone＋KCl＋其他降壓藥','2.9→4.1','MRA 控制血壓與血鉀；DST 正常'],
  ['術後第 1 天','128/80','停 spironolactone、停 KCl','4.3','點滴用不含 KCl 的 normal saline；監測 BP、K、creatinine'],
  ['3 個月內','124/78','無','4.4','首次評估，必要時調藥、處理高或低血鉀'],
  ['9 個月','122/76','無','4.3','ARR 正常 → PASO 完全臨床＋完全生化成功；之後每年追蹤']]},
 read:['低血鉀＋PRA &lt;0.2＋PAC &gt;20 ng/dL：不需抑制試驗，且可能有偽陰性。','&lt;35 歲、明顯 PA（自發低血鉀、PAC &gt;30 ng/dL、renin 受抑制）、&gt;1 cm 單側皮質腺瘤特徵：指引允許考慮不做 AVS。','只有「年輕」不夠，條件要一起成立。'],
 plan:['PASO 共識：第一次評估在術後 3 個月內，最終結果在 6–12 個月，之後每年。','國際世代 705 人：完全臨床成功 37%、部分 47%；完全生化成功 94%（699 人）。年輕與女性較易達完全臨床成功。','術後暫時低血壓、高血鉀與 eGFR 下降都可能出現；高血鉀可為暫時或持續。'],
 pitfall:'術後繼續吃 KCl 或 spironolactone 而造成高血鉀。另一個陷阱是術後 eGFR 下降就認定手術傷腎：過高的腎絲球過濾被矯正也會下降，須配合趨勢判讀。',src:['es','kes','paso']},
{id:'c8',no:'08',tag:'MRA 滴定 · 換算單位',title:'不想手術：MRA 開多少、調到什麼時候？',
 stem:'63 歲男性，報告單位是 pmol/L，檢驗法 LC-MS/MS：aldosterone 480 pmol/L、DRC 3.2 mU/L，K 3.6（服 KCl）、eGFR 68。血壓 168/98 mmHg。討論後不願手術。',
 facts:['LC-MS/MS','pmol/L 與 DRC','不願手術','服 KCl'],
 question:'不想手術還需要抑制試驗與 AVS 嗎？下表每一次回診的決定是根據什麼？',
 steps:[{label:'篩檢',input:{...base,unit:'pmol',assay:'ms',reninType:'drc',pac:480,renin:3.2,k:3.6,egfr:68,surgery:'no'},expect:{positive:true,strong:false,next:'通常不需'}}],
 table:{head:['時間','藥物','血壓','K','DRC','eGFR','決定'],rows:[
  ['第 0 天','spironolactone 25 mg','168/98','3.6','3.2','68','開始 MRA'],
  ['第 3 天','同上','—','4.2','—','—','第 2–4 天起減停 KCl'],
  ['12 週','25 mg','150/90','4.4','3.5','64','血壓未達、renin 仍抑制 → 加到 50 mg；檢視鈉攝取'],
  ['24 週','50 mg','142/86','4.7','6','60','同上 → 加到 75 mg'],
  ['36 週','75 mg','130/78','4.9','14','57','血壓達標、renin 上升；乳房脹痛 → 改 eplerenone（常需 BID），2–3 個月後複查']]},
 read:['480 ÷ 3.2＝ARR 150（&gt;52）；PAC 相當於 17.3 ng/dL（≥7.5）；DRC ≤8.2。LC-MS/MS 的界值比免疫法低約 25%。','不願或不適合手術者，可依篩檢結果直接用 MRA，不需抑制試驗或 AVS。','Rec 7：血壓未控制且 renin 仍受抑制 → 增加 MRA 以提升 renin。指引不設定 renin 數值目標，只看較基線上升。'],
 plan:['起始 spironolactone 12.5–25 mg/d；每次調藥間隔 8–12 週，每次 25–50 mg，2–3 個月後複查電解質、腎功能、renin。','eGFR 緩降通常反映治療有效（高過濾改善）；持續惡化才轉介腎臟科並考慮停 ACEI／ARB。','穩定後監測血壓，每年查 K 與腎功能；不必例行複驗 renin。'],
 pitfall:'血壓已控制仍只為了拉高 renin 而加藥：單用 MRA 血壓已控制時，指引認為證據不足。觀察性資料（Hundemer 2018）顯示 renin 仍受抑制者心血管事件 HR 2.83，但這不是隨機試驗。',src:['es','hundemer']},
{id:'c9',no:'09',tag:'備孕 · 懷孕',title:'服 spironolactone 中，下個月想懷孕',
 stem:'31 歲女性，三年前篩檢符合 PA、未定側，服 spironolactone 50 mg 控制良好。目前 PAC 24 ng/dL、PRA 0.3 ng/mL/hr，K 3.8，eGFR 102。希望半年內懷孕，CT 未見結節。',
 facts:['備孕','服 MRA','尚未定側','K 正常'],
 question:'工具為什麼不給常規路徑？懷孕前後要改什麼？',
 steps:[{label:'目前',input:{...base,surgery:'unknown',pac:24,renin:0.3,k:3.8,egfr:102,pregnancy:true,meds:['mra']},expect:{positive:true,blocked:true,title:'特殊'}}],
 read:['懷孕時 RAAS 生理變化使判讀不同（指引）；懷孕中的診斷主要靠生化，確認與定側檢查屬禁忌（韓國共識）。','指引列 spironolactone 於懷孕為禁忌；韓國共識也將想懷孕者列入。','韓國共識明言：懷孕 PA 沒有正式建議，以下屬專家意見，證據有限。'],
 plan:['趁懷孕前定側：若為單側，韓國共識建議在計畫懷孕前切除。','懷孕前換藥，轉介母胎醫學與內分泌專科。共識列 α-methyldopa、hydralazine、labetalol、nifedipine（原文：僅用於 20 週後），低血鉀以補鉀處理。','傳統治療無效時，才在利大於弊下謹慎考慮 eplerenone 或 amiloride；少數個案若藥物失敗、強烈懷疑單側腺瘤，原文為「第二孕期後」可考慮手術。'],
 pitfall:'直接帶 spironolactone 進入懷孕，或在懷孕中安排抑制試驗與 AVS；或反過來驟停所有藥卻沒有替代方案與監測。',src:['es','kes']}
];

export const QUIZ=[
{level:'basic',q:'依 2025 Endocrine Society 指引，誰應接受 PA 篩檢？',options:['只有低血鉀的高血壓患者','抗藥性高血壓或腎上腺結節者','所有高血壓患者（條件式建議）','40 歲以下發病的高血壓患者'],answer:2,why:'Rec 1 建議所有高血壓者篩檢（2｜⊕⊕OO），實施視資源而定，適用 &gt;16 歲。',src:['es']},
{level:'basic',q:'一位高血壓患者 K 4.2 mmol/L。關於血鉀，何者正確？',options:['不能排除 PA；低血鉀只見於少數 PA（約 9–37%）','K 正常即可排除 PA，不需測 ARR','K 正常時 ARR 一定不準，應先補鉀','K 正常代表病灶必為雙側'],answer:0,why:'低血鉀只出現在少數 PA。測 K 不是為了篩檢，而是協助判讀 aldosterone。',src:['es']},
{level:'basic',q:'免疫法 PAC 22 ng/dL、DRC 5 mU/L。依指引的 DRC 算法，ARR 約多少？',options:['4.4','17','44','122'],answer:3,why:'DRC 用 pmol/L：22 × 27.7 ÷ 5 ≈ 122，大於 70。PRA 與 DRC 的 ARR 不能互換。',src:['es']},
{level:'basic',q:'β-blocker 對 ARR 最主要的影響是？',options:['升高 renin，造成偽陰性','壓低 renin，造成偽陽性','升高 aldosterone，造成偽陰性','對 ARR 沒有影響'],answer:1,why:'β-blocker 與中樞 α₂ 藥物壓低 renin。免疫法 PAC 10–15 ng/dL 時要考慮偽陽性；高於此範圍則仍可能是 PA。',src:['es']},
{level:'basic',q:'下列哪一種藥最可能讓 ARR 偽陰性？',options:['Verapamil SR','Doxazosin','Hydralazine','Spironolactone'],answer:3,why:'MRA 推高 renin 與 aldosterone。前三者是指引列出的暫代藥物（hydralazine 宜合併 verapamil 避免反射性心搏過速）。',src:['es']},
{level:'basic',q:'為了複驗而停藥，建議的時間是？',options:['MRA 與利尿劑 4 週；ACEI、ARB、β-blocker 2 週','所有藥物都停 2 週','所有藥物都停 8 週','MRA 2 週；β-blocker 4 週'],answer:0,why:'表 6：MRA、ENaC 抑制劑、其他利尿劑 4 週；β-blocker、中樞 α₂、ACEI、ARB、DHP-CCB、SGLT2i 2 週。安全可行時才停。',src:['es']},
{level:'basic',q:'下列何者是正確的 ARR 採血條件？',options:['傍晚臥床，空腹','抽血前一週嚴格限鈉','早晨坐姿，抽血前幾天不刻意限鈉','抽血前先握拳，以利採血'],answer:2,why:'指引：早晨坐姿、不限鈉；避免握拳，放開止血帶等至少 5 秒，以免血鉀假性升高。',src:['es']},
{level:'basic',q:'PA 患者計畫懷孕，下列藥物何者應避免？',options:['Labetalol','Spironolactone','Nifedipine','α-methyldopa'],answer:1,why:'指引列 spironolactone 於懷孕為禁忌；其餘為韓國共識列出的懷孕可用降壓藥（nifedipine 原文僅用於 20 週後）。',src:['es','kes']},
{level:'basic',q:'指引建議 spironolactone 優先於其他 MRA，主要理由是？',options:['降壓效果明顯優於 eplerenone','男性女乳症風險最低','腎功能不全時最安全','價格低且容易取得'],answer:3,why:'Rec 9 的理由是成本與可近性。等效劑量下各 MRA 效果預期相近；spironolactone 的抗雄性素副作用其實較多。',src:['es']},
{level:'basic',q:'開始 MRA 後，原本的補鉀該怎麼處理？',options:['繼續原劑量 3 個月再查','立刻加倍，避免低血鉀','多數人第 2–4 天起減量或停用','MRA 與補鉀應終身併用'],answer:2,why:'血鉀通常 3–5 天內恢復，除最嚴重的低血鉀外，可於第 2–4 天減停補鉀。',src:['es']},
{level:'advanced',q:'哪一位依指引「不建議」做抑制試驗？（均為免疫法，且願意手術）',options:['抗藥性高血壓，DRC 1.5 mU/L，PAC 24 ng/dL','K 正常、非抗藥性，PRA 0.1 ng/mL/hr，PAC 24 ng/dL','低血鉀，PRA 0.5 ng/mL/hr，PAC 24 ng/dL','抗藥性高血壓，PRA 0.1 ng/mL/hr，PAC 18 ng/dL'],answer:0,why:'需同時符合：抗藥性高血壓或低血鉀；DRC &lt;2 或 PRA &lt;0.2；PAC &gt;20（免疫法）或 &gt;15 ng/dL（LC-MS/MS）。此時做試驗反有偽陰性風險。',src:['es']},
{level:'advanced',q:'PA 合併右側 2.5 cm 腺瘤，DST 後 cortisol 6 μg/dL，cortisol 校正 LI 2.2，metanephrine 校正 SI 20、LI 8。最合理的判讀是？',options:['LI &lt;3，確定為雙側，只用 MRA','Cortisol 共分泌使校正失真，metanephrine 結果支持右側','DST 異常表示 AVS 全部作廢','Metanephrine 不能用於 AVS'],answer:1,why:'指引建議 metanephrine 取代 cortisol 時 SI &gt;12、LI &gt;4。術後要測清晨 cortisol，預備腎上腺功能不足。',src:['es']},
{level:'advanced',q:'K 已校正，坐姿生理食鹽水試驗 4 小時 PAC 6.5 ng/dL，檢驗法是 LC-MS/MS。如何判讀？',options:['&lt;7.8，已排除 PA','應改用臥姿界值重新判讀','未 &lt;5.8，不足以降低 PA 可能性','應改看 PAC 下降百分比'],answer:2,why:'7.8 是免疫法界值，LC-MS/MS 為 5.8 ng/dL。結果仍需配合臨床機率，臥姿流程不可套用坐姿界值。',src:['es']},
{level:'advanced',q:'Cosyntropin 刺激下 AVS：右 cortisol 320、左 180、IVC 40；右 aldosterone 1600、左 36。最恰當的判讀是？',options:['LI 25，右側切除','兩側 SI 都合格','應以 CSI 判斷，SI 不重要','左側 SI 4.5，未達 &gt;5，先確認取樣成功'],answer:3,why:'右 SI 8、左 SI 4.5。LI 雖達 25，但指引表 9 在刺激下要求 SI &gt;5，取樣未確認時不應直接決定手術。',src:['es']},
{level:'advanced',q:'未刺激 AVS，雙側 SI 約 3.1，LI 3.4，CSI 1.6。依指引如何解讀？',options:['灰區，單側或雙側都可能，且無對側抑制的佐證','明確單側，可直接手術','明確雙側，不必再討論','取樣失敗'],answer:0,why:'指引：LI &lt;3 提示雙側，3–4 可能單側或雙側，≥4 為單側；CSI &lt;1 才符合對側受抑制。各中心界值不同，由 AVS 團隊整合判斷。',src:['es','rossi']},
{level:'advanced',q:'服 ARB＋spironolactone 中，K 4.1，PRA 0.2 ng/mL/hr，準備 AVS。下一步較合理的是？',options:['一律先停所有藥 6 週','renin 仍受抑制，這些藥不妨礙 AVS，可在血壓與血鉀穩定下進行','先把 renin 提升到 &gt;1 再做','改以 CT 決定，省略 AVS'],answer:1,why:'指引：只要 renin 低，利尿劑、ACEI、ARB、MRA 不干擾 AVS；renin 未受抑制才考慮調藥。觀察性資料也顯示控制良好的 MRA 不妨礙辨識單側 PA。',src:['es','mraavs']},
{level:'advanced',q:'單側腎上腺切除後第一天，下列處置何者最恰當？',options:['繼續 MRA 與 KCl 一週以防復發','立即補 fludrocortisone 給所有人','停 MRA 與補鉀，輸液不加 KCl（除非 K 很低），監測 BP、K、creatinine','只需 6 個月後回診'],answer:2,why:'韓國共識：術後第一天停 MRA 與補鉀，用不含 KCl 的 normal saline（除非 K &lt;3 mmol/L）；可能有暫時性低血壓、高血鉀、eGFR 下降。',src:['kes']},
{level:'advanced',q:'切除後 9 個月，血壓與術前相同但藥量減少，K 正常，ARR 正常。依 PASO 分類是？',options:['完全臨床、完全生化成功','部分臨床、完全生化成功','部分臨床、部分生化成功','臨床失敗、生化成功'],answer:1,why:'血壓相同但藥量減少屬部分臨床成功；血鉀正常且 ARR 正常屬完全生化成功。最終結果在 6–12 個月判定。',src:['paso']},
{level:'advanced',q:'單用 spironolactone 血壓已達標、K 4.6，但 DRC 仍 3 mU/L。指引的立場是？',options:['必須加藥到 DRC &gt;10','應立即改手術','應改用 amiloride','僅為提升 renin 而加量，證據不足'],answer:3,why:'Rec 7 針對血壓未控制且 renin 受抑制者。圖 3：單用 MRA 血壓已控制時，證據不足以只因 renin 低而加量。',src:['es']},
{level:'advanced',q:'17 歲 PA，母親與舅舅年輕即有高血壓及腦出血。較合理的路徑是？',options:['基因檢測；確診家族型通常不需抑制試驗與 AVS，FH-I 可用低劑量 dexamethasone','直接 AVS 後切除較大側','成人界值不適用，所以暫不處理','先做 fludrocortisone 試驗再談遺傳'],answer:0,why:'&lt;20 歲發病應做基因篩檢；家族型多為雙側，通常不手術。FH-I 用 dexamethasone 0.125–0.25 mg，或併用 MRA（韓國共識）。指引指出兒童 ARR 界值較低，未列數字。',src:['es','kes']}
];

export const MAP={center:'原發性醛固酮增多症',
 left:[
 {title:'為什麼要抓',items:['基層高血壓 5–14%，轉診中心可達 30%','抗藥性 11.3–29.1%；高血壓＋低血鉀 28.1%','低血鉀僅見於 9–37%：K 正常不能排除','相較原發高血壓：中風 OR 2.58、AF 3.52、HF 2.05、CAD 1.77','白蛋白尿 OR 2.09、蛋白尿 2.68']},
 {title:'篩檢 ARR',items:['所有高血壓（&gt;16 歲，條件式）','早晨坐姿、不限鈉、校正低血鉀','免疫法：PAC ≥10 ng/dL；PRA ≤1 或 DRC ≤8.2；ARR &gt;20／&gt;70','LC-MS/MS：PAC ≥7.5 ng/dL；ARR &gt;15／&gt;52','陰性但高懷疑或有干擾：另日重測','重篩：血壓惡化、新低血鉀、不明原因 AF']},
 {title:'藥物干擾',items:['Renin↓ 偽陽性：β-blocker、中樞 α₂、NSAID','Renin↑ 偽陰性：MRA、利尿劑、ACEI／ARB、SGLT2i','含雌激素製劑：DRC↓、PRA↑；drospirenone 有 MR 阻斷作用','MRA、ENaC 抑制劑、利尿劑停 4 週；其餘停 2 週','暫代：verapamil SR、α₁-blocker、hydralazine、moxonidine','β-blocker 下 PAC 10–15（LC-MS/MS 7.5–10）才考慮偽陽性']},
 {title:'抑制試驗',items:['適用：中間機率＋想手術','免做：抗藥性或低血鉀＋PRA &lt;0.2 或 DRC &lt;2＋PAC &gt;20（LC-MS/MS &gt;15）','免做：不想手術、家族型已知、機率極低','坐姿食鹽水 4 小時：&lt;7.8（LC-MS/MS &lt;5.8）ng/dL 降低可能性','Captopril 2 小時：renin 仍抑制且 PAC &lt;10（&lt;7.5）','口服鹽：UNa &gt;200 mEq，尿 aldosterone &lt;10 μg']}],
 right:[
 {title:'定側 CT＋AVS',items:['CT 看結構，誤判成因 37.8%','SI：未刺激 &gt;1.4–3；刺激 &gt;5','LI：≥4 單側；3–4 灰區；&lt;3 雙側','CSI &lt;1 支持對側受抑制','AVS 需 K 正常、renin 受抑制','可免 AVS：&lt;35 歲明顯 PA＋&gt;1 cm 腺瘤；ACS 巨腺瘤；FH；PBMAH']},
 {title:'手術與術後',items:['單側＋適合且願意：腹腔鏡全腎上腺切除','術前 MRA 控制血壓與血鉀；腺瘤者做 DST','術後第 1 天停 MRA、停補鉀','監測暫時性低血壓、高血鉀、eGFR 下降','3 個月內初評，6–12 個月定結果，之後每年','PASO：完全臨床 37%、完全生化 94%']},
 {title:'MRA 治療',items:['雙側、未定側、不想或不宜手術','Spironolactone 12.5–25 mg/d 起始；eplerenone 25 mg QD–BID','補鉀第 2–4 天起減停；鈉攝取偏高常致反應差','每 8–12 週調藥，2–3 個月複查 K、腎功能、renin','未達標且 renin 低 → 加量；已達標不必只為 renin 加量','ENaC 抑制劑為 MRA 不耐受時的替代']},
 {title:'特殊族群',items:['ACS：DST &gt;1.8 μg/dL；metanephrine SI &gt;12、LI &gt;4；術後測清晨 cortisol','懷孕：避免 spironolactone；不做確認與定側檢查','備孕：單側者宜先手術（共識）','&lt;20 歲：基因檢測；FH-I 低劑量 dexamethasone','CKD：易偽陽性；MRA 可用但密切監測 K','長者與 CKD：低 renin、ARR 偏高較常見']}]
};
