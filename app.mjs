import {assess,salineRisk} from './engine.mjs';
const $=id=>document.getElementById(id);
let submitted=null;
function tab(id){document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===id);if(b.dataset.tab===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.tab)));
function read(){const x={};['pac','unit','assay','reninType','renin','k','egfr','prepared','surgery'].forEach(id=>x[id]=$(id).value);['below','resistant','highRisk','hf','uncontrolled','pregnancy'].forEach(id=>x[id]=$(id).checked);x.meds=[...document.querySelectorAll('[name="med"]:checked')].map(a=>a.value);return x;}
function run(){const x=read(),a=assess(x);if(a.errors.length){$('result').innerHTML='<h2>請先核對輸入</h2><p>'+a.errors.join('<br>')+'</p>';$('advice').replaceChildren();submitted=null;refresh();return;}submitted=x;
 $('result').innerHTML=`<div class="step">SCREENING ASSESSMENT · 篩檢判讀</div><h2>${a.title}</h2><div class="numbers"><div><small>ARR ${x.below?'下界估算':''}</small><strong>${x.below?'≥':''}${a.ratio.toFixed(2)}</strong><small>${a.drc?'PAC pmol/L ÷ DRC mU/L':'PAC ng/dL ÷ PRA ng/mL/hr'}</small></div><div><small>標準化 Aldosterone</small><strong>${a.pac.toFixed(2)}</strong><small>ng/dL</small></div></div><ul class="status"><li><span>Renin ≤${a.drc?'8.2 mU/L':'1 ng/mL/hr'}</span><b>${a.reninUndetermined?'無法判定':a.lowR?'符合':'未達'}</b></li><li><span>PAC ≥${a.pacCut} ng/dL</span><b>${a.highA?'符合':'未達'}</b></li><li><span>ARR >${a.cutoff}</span><b>${a.highRatio?'符合':x.below?'無法判定':'未達'}</b></li></ul><p class="hint">採用指引參考閾值；應優先核對檢驗室方法。篩檢陽性不是確診。</p>`;
 $('advice').innerHTML=`<div class="card"><div class="step">NEXT STEP</div><h2>建議下一步</h2><div class="next"><p>${a.next}</p></div>${a.warnings.map(w=>`<div class="note warning">${w}</div>`).join('')}<div class="actions"><button id="go-workup" class="btn primary">查看確認與定側</button><button id="print" class="btn">列印判讀</button></div></div>`;
 $('go-workup').onclick=()=>{tab('workup');document.querySelector('.nav').scrollIntoView({block:'start'});};$('print').onclick=()=>window.print();refresh();
}
$('screen-form').addEventListener('submit',e=>{e.preventDefault();run();});
function clearResult(){submitted=null;$('result').innerHTML='<div class="step">YOUR ASSESSMENT</div><h2>等待檢驗資料</h2><p class="empty">輸入或更新檢驗資料後，請按「計算並產生判讀」。</p>';$('advice').replaceChildren();refresh();}
$('screen-form').addEventListener('reset',()=>{clearResult();$('subtype').value='unknown';$('bpcontrol').value='unknown';$('renincontrol').value='unknown';refresh();});
$('screen-form').addEventListener('input',()=>{if(submitted)clearResult();});
$('screen-form').addEventListener('change',()=>{if(submitted)clearResult();});
const tests={
 saline:'<h3>坐姿生理食鹽水抑制試驗</h3><p>由醫療團隊依標準流程執行：0.9% saline 2 L／4 小時，測試前後 PAC 與 K。先校正低血鉀。</p><p>4 小時 PAC &lt;7.8 ng/dL（免疫分析法）或 &lt;5.8 ng/dL（LC-MS/MS）使 PA 可能性降低；不能僅以單一界值排除高度懷疑者。臥姿流程不可直接套用坐姿閾值。</p><div class="note warning">未控制血壓、心衰竭／肺水腫風險、晚期 CKD 不宜常規執行。eGFR &lt;30 是本工具採用的保守警示值，不是指引統一絕對界值。</div>',
 captopril:'<h3>Captopril challenge</h3><p>常見流程：坐姿休息後給 captopril 50 mg，於基線與 2 小時測 PAC／renin；依執行中心流程調整。</p><p>2 小時 renin 仍受抑制時，PAC &lt;10 ng/dL（免疫分析法）或 &lt;7.5 ng/dL（LC-MS/MS）使 PA 較不可能。不是單看 PAC 下降百分比。</p><div class="note warning">不需大量補液，但仍須注意低血壓、AKI、高血鉀、腎動脈狹窄及懷孕禁忌。既有 ACEI／ARB 會影響試驗解讀。</div>',
 oral:'<h3>口服鹽負荷試驗</h3><p>依中心流程短期增加鈉攝取，於末段收集 24 小時尿 aldosterone、尿鈉與 creatinine，確認鈉負荷與收集完整性。</p><p>尿 aldosterone 結果受檢驗法、腎功能及收集品質影響，本工具不以單一尿液數值自動確診。</p><div class="note warning">嚴重未控制高血壓、腎功能不全、心衰竭、心律不整或嚴重低血鉀者不宜；不可自行在家加鹽測試。</div>',
 fludro:'<h3>Fludrocortisone suppression test</h3><p>多日給藥搭配鈉負荷與補鉀，需密切監測血壓、血鉀及相關荷爾蒙，適合有經驗的專科中心。</p><p>因流程繁複與安全監測需求，本頁不提供自行執行劑量；依中心驗證程序判讀。</p>'};
function refresh(){
 $('test-detail').innerHTML=tests[$('test').value];
 const salt=['saline','oral'].includes($('test').value);
 $('test-risk').innerHTML=!submitted?'<div class="note">尚無已送出的篩檢資料，請先確認血鉀、腎功能、血壓與容量狀態。</div>':submitted.pregnancy?'<div class="note danger">已勾選懷孕／備孕：請走專科個別評估，勿依此常規試驗路徑執行。</div>':salt&&salineRisk(submitted)?'<div class="note danger">依目前資料有鹽負荷風險：低血鉀需先矯正；心衰竭、晚期 CKD 或未控制高血壓需專科另選檢查。不要直接安排鹽負荷。</div>':'<div class="note">即使未觸發上述警示，仍須由執行團隊完整評估禁忌與流程。</div>';
 const type=$('subtype').value;
 $('therapy-detail').innerHTML=type==='unilateral'?'<div class="next"><h3>評估腹腔鏡單側腎上腺切除</h3><p>術前控制血壓與低血鉀，確認 cortisol 共同分泌。術後重新調整 MRA、補鉀與降壓藥，密切監測 K／creatinine，留意暫時性低醛固酮及高血鉀。生化治癒不等於一定能停掉所有降壓藥。</p><p>早期追蹤血壓與血鉀，6–12 個月評估臨床與生化結果，之後至少每年追蹤。</p></div>':type==='bilateral'?'<div class="next"><h3>MRA 為主要長期治療</h3><p>以血壓控制、血鉀正常及適當 MR 阻斷為目標。Spironolactone 通常先選；有不耐受時考慮 eplerenone。</p></div>':'<div class="note">不能僅憑影像開刀。先完成適當診斷並討論手術意願；不考慮手術者可由醫師評估經驗性 MRA。</div>';
 $('therapy-risk').innerHTML=submitted&&(submitted.pregnancy||+submitted.k>=5||+submitted.egfr<30)?'<div class="note danger">目前有懷孕／備孕、高血鉀或嚴重腎功能不全情境：不要直接套用一般 MRA 起始劑量，需專科評估適用性、禁忌與監測。</div>':'';
 const bp=$('bpcontrol').value,r=$('renincontrol').value;
 $('titrate').innerHTML='<div class="next">'+(bp==='unknown'||r==='unknown'?'選擇治療後血壓與 renin 狀況，查看調整原則。':bp==='yes'?'血壓已控制：若 renin 仍低，目前證據不足以支持僅為升高 renin 而持續增加 MRA。依 K、腎功能、副作用及整體風險追蹤。':r==='low'?'血壓未控制且 renin 仍低：確認服藥、鈉攝取、K 與腎功能後，可在安全範圍內逐步增加 MRA；無統一 renin 數值目標，評估較基線的上升。':'血壓未控制但 renin 已上升：考慮增加或調整其他降壓藥，並檢視其他造成高血壓的因素。')+'</div>';
}
['test','subtype','bpcontrol','renincontrol'].forEach(id=>$(id).addEventListener('change',refresh));
const cases={beta:{pac:12,renin:0.2,k:4.1,egfr:92,prepared:'yes',surgery:'yes',meds:['beta']},classic:{pac:35,renin:0.1,k:3,egfr:88,prepared:'unknown',surgery:'yes',resistant:true,meds:[]},ckd:{pac:22,renin:0.4,k:4.8,egfr:24,prepared:'yes',surgery:'no',hf:true,meds:['raas']}};
document.querySelectorAll('[data-case]').forEach(b=>b.addEventListener('click',()=>{$('screen-form').reset();const c=cases[b.dataset.case];Object.entries(c).forEach(([key,v])=>{if(key==='meds')document.querySelectorAll('[name="med"]').forEach(m=>m.checked=v.includes(m.value));else if(typeof v==='boolean')$(key).checked=v;else $(key).value=v;});tab('screen');run();document.querySelector('.nav').scrollIntoView({block:'start'});}));
document.querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>{$('quiz-feedback').className='note '+(b.dataset.answer==='right'?'':'warning');$('quiz-feedback').textContent=b.dataset.answer==='right'?'答對。CT 看結構，AVS 評估實際分泌側；僅少數典型年輕個案可由專科考慮省略。':'再想想：結節可能不分泌 aldosterone，也可能是雙側病變。通常以 AVS 確認分泌側；正常血鉀不能排除 PA。';}));
refresh();
