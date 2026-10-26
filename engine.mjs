// Endocrine Society 2025, recommendations 3–4; use local assay cutoffs when available.
export function assess(x) {
  const errors=[];
  for(const [key,label] of [['pac','Aldosterone'],['renin','Renin'],['k','血鉀'],['egfr','eGFR']]) {
    if(x[key]==='' || x[key]==null || !Number.isFinite(Number(x[key])) || Number(x[key])<=0) errors.push(label+' 必須為大於 0 的有效數值。');
  }
  if(errors.length)return {errors};
  if(+x.k<1 || +x.k>10) return {errors:['血鉀超出可接受輸入範圍（1–10 mmol/L），請核對單位與數值。']};
  const pac=+x.pac/(x.unit==='pg'?10:x.unit==='pmol'?27.7:1), r=+x.renin;
  const ms=x.assay==='ms', drc=x.reninType==='drc';
  const ratio=drc?pac*27.7/r:pac/r;
  const cutoff=drc?(ms?52:70):(ms?15:20), pacCut=ms?7.5:10;
  const lowR=r<=(drc?8.2:1), highA=pac>=pacCut, highRatio=ratio>cutoff;
  const positive=lowR&&highA&&highRatio;
  const meds=x.meds||[], beta=meds.includes('beta')||meds.includes('central');
  const raising=meds.some(m=>['raas','mra','diuretic','sglt2'].includes(m));
  const lowK=+x.k<3.5, ckd=+x.egfr<60;
  const warnings=[];
  if(lowK)warnings.push('低血鉀可能壓低 aldosterone，先補正血鉀再複驗；陰性不能排除 PA。');
  if(+x.k<2.5||+x.k>=6)warnings.push('血鉀有立即風險：優先安排即時臨床與心電圖評估，暫緩常規 PA 試驗。');
  if(beta)warnings.push('β-blocker／中樞 α₂ 藥物可壓低 renin、造成 ARR 偽陽性。安全可行時由醫師調整，停用約 2 週後複驗；勿自行驟停。'+(pac>(ms?10:15)?' PAC 已高於常見 β-blocker 偽陽性區間，仍須高度懷疑 PA。':''));
  if(raising)warnings.push('ACEI／ARB、MRA、利尿劑或 SGLT2i 可能使 renin 上升而產生偽陰性。陰性且高度懷疑時考慮調藥複驗。');
  if(meds.includes('other'))warnings.push('NSAID、含雌激素避孕藥及荷爾蒙製劑等可能干擾；應依 PRA／DRC 與個別藥物判讀。');
  if(ckd)warnings.push('CKD 可能增加篩檢偽陽性；結合腎功能、藥物與臨床表現判讀，MRA 需加密血鉀監測。');
  if(x.prepared!=='yes')warnings.push('採血條件未確認：早晨坐姿、抽血前數天避免刻意限鹽，並先矯正低血鉀。');
  if(x.below)warnings.push('Renin 低於定量下限：目前 ARR 僅為下界估算，不是精確值；勿將 0 當分母，請與實驗室確認。');
  if(x.pregnancy)warnings.push('懷孕／備孕需專科個別評估；本工具不提供此情境的常規抑制試驗或 MRA 處方路徑。');
  const strong=(x.resistant||lowK)&&r<(drc?2:0.2)&&pac>(ms?15:20)&&!x.below;
  const blocked=x.pregnancy||+x.k<2.5||+x.k>=6;
  let title, next;
  if(blocked){title='先處理特殊／高風險情境';next='先完成專科或即時臨床評估，再安排 PA 診斷流程。';}
  else if(positive){title='符合參考篩檢陽性條件';
    if(x.prepared!=='yes'||(beta&&pac<=(ms?10:15))||ckd)next='先複核採血條件與干擾因素。篩檢陽性不等於確診；排除干擾後再進入下列路徑。';
    else next='此結果支持 PA，仍需結合臨床及檢驗法確認。';
    if(x.surgery==='no')next+=' 不願／不適合手術者，可由醫師依篩檢結果考慮 MRA，通常不需先做抑制試驗或 AVS。';
    else if(x.surgery==='yes')next+=strong?' 數值符合典型可免抑制試驗條件；排除干擾後，由專科評估腎上腺 CT＋AVS 定側。':' 願意且適合手術：通常先評估 aldosterone 抑制試驗；若支持 PA，再以 CT＋AVS 定側。';
    else next+=' 先討論手術意願及適合性，再決定抑制試驗／AVS 或藥物治療。';
  }else{title=(lowR||x.highRisk||lowK||raising||x.prepared!=='yes')?'未達完整陽性條件，仍需複評':'本次未達參考篩檢陽性條件';next=(lowR||x.highRisk||lowK||raising||x.prepared!=='yes')?'矯正低血鉀、檢視用藥與採血條件，另日重測；高懷疑度不可因單次陰性排除。':'若臨床懷疑度低，可持續高血壓照護；日後出現抗藥性高血壓、低血鉀或其他疑點時重篩。';}
  return {errors:[],pac,ratio,cutoff,pacCut,lowR,highA,highRatio,positive,strong,title,next,warnings,lowK,blocked,drc};
}
export function salineRisk(x){return +x.egfr<30||x.hf||x.uncontrolled||+x.k<3.5;}
