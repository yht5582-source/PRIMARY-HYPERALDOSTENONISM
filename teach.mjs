import {assess} from './engine.mjs';
import {SOURCES,CASES,QUIZ,MAP,avsRead} from './teach-content.mjs?v=1.3';
const $=id=>document.getElementById(id);
const TABS=['screen','workup','treatment','learn','quiz','map'],LETTERS=['A','B','C','D'];
const links=keys=>keys.map(k=>`<a href="${SOURCES[k].url}" target="_blank" rel="noopener">${SOURCES[k].label} ↗</a>`).join('、');
const list=a=>`<ul>${a.map(x=>`<li>${x}</li>`).join('')}</ul>`;
const allCaseSteps=CASES.flatMap(c=>c.steps.map((s,i)=>({id:c.id+'-'+i,c,s})));

function stepsTable(c){
 const rows=c.steps.map((s,i)=>{const a=assess(s.input);return `<tr><th scope="row">${s.label}</th><td>${a.pac.toFixed(1)}</td><td>${s.input.below?'≥':''}${a.ratio.toFixed(1)}<small> ／ &gt;${a.cutoff}</small></td><td>${a.title}</td><td><button type="button" class="linkbtn" data-load="${c.id}-${i}">帶入工具</button></td></tr>`;}).join('');
 return `<div class="scrolltable"><table class="t-table"><caption>篩檢數字（由工具即時計算）</caption><thead><tr><th scope="col">情境</th><th scope="col">PAC ng/dL</th><th scope="col">ARR ／ 界值</th><th scope="col">工具判讀</th><th scope="col"><span class="vh">帶入工具</span></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function avsTable(avs,cap){
 const r=avsRead(avs),n=x=>x.toFixed(x<10?2:1),name=avs.marker==='metanephrine'?'metanephrine':'cortisol';
 const sel={ok:'取樣成功',center:'依中心界值',fail:'未達取樣標準'}[r.selectivity],lat={lateral:r.side+'側單側',gray:'灰區',bilateral:'不支持單側'}[r.lateral];
 return `<div class="scrolltable"><table class="t-table"><caption>${cap}</caption><thead><tr><th scope="col">位置</th><th scope="col">Aldosterone</th><th scope="col">${name}</th><th scope="col">SI</th><th scope="col">A／${name==='cortisol'?'C':'M'}</th></tr></thead><tbody><tr><th scope="row">右腎上腺靜脈</th><td>${avs.right.aldo}</td><td>${avs.right.ref}</td><td>${n(r.siR)}</td><td>${n(r.rR)}</td></tr><tr><th scope="row">左腎上腺靜脈</th><td>${avs.left.aldo}</td><td>${avs.left.ref}</td><td>${n(r.siL)}</td><td>${n(r.rL)}</td></tr><tr><th scope="row">下腔靜脈</th><td>${avs.ivc.aldo}</td><td>${avs.ivc.ref}</td><td>—</td><td>${n(r.rI)}</td></tr></tbody></table></div><p class="t-sum">LI <b>${n(r.li)}</b>（${lat}）· CSI <b>${n(r.csi)}</b> · ${sel}</p>`;
}
const plainTable=t=>`<div class="scrolltable"><table class="t-table"><caption>病程</caption><thead><tr>${t.head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map((v,i)=>i?`<td>${v}</td>`:`<th scope="row">${v}</th>`).join('')}</tr>`).join('')}</tbody></table></div>`;

$('teach-cases').innerHTML=CASES.map(c=>`<article class="card t-case" id="case-${c.id}"><span class="pill">CASE ${c.no} · ${c.tag}</span><h3>${c.title}</h3><p>${c.stem}</p><ul class="t-facts">${c.facts.map(f=>`<li>${f}</li>`).join('')}</ul><p class="t-ask"><b>想一想：</b>${c.question}</p>${stepsTable(c)}${c.avs?avsTable(c.avs,c.avs2?'AVS：以 cortisol 校正':'AVS 結果（未刺激）'):''}${c.avs2?avsTable(c.avs2,'同一次 AVS：以 metanephrine 校正'):''}${c.table?plainTable(c.table):''}<details class="t-ans"><summary>看判讀與處置</summary><h4>判讀</h4>${list(c.read)}<h4>處置思路</h4>${list(c.plan)}<p class="t-pit"><b>常見陷阱：</b>${c.pitfall}</p><p class="hint">依據：${links(c.src)}</p></details></article>`).join('');

function loadStep(id){
 const {input}=allCaseSteps.find(x=>x.id===id).s,form=$('screen-form');
 form.reset();
 ['unit','assay','reninType','prepared','surgery','pac','renin','k','egfr'].forEach(k=>{if(input[k]!==undefined)$(k).value=input[k];});
 ['below','resistant','highRisk','hf','uncontrolled','pregnancy'].forEach(k=>{$(k).checked=!!input[k];});
 document.querySelectorAll('[name="med"]').forEach(m=>{m.checked=(input.meds||[]).includes(m.value);});
 show('screen');form.requestSubmit();document.querySelector('.nav').scrollIntoView({block:'start'});
}
$('teach-cases').addEventListener('click',e=>{const b=e.target.closest('[data-load]');if(b)loadStep(b.dataset.load);});

// 考題：不存檔，重新整理即歸零；選項順序固定，方便對照講義。
const picked=new Map();let filter='all';
function renderQuiz(){
 const shown=QUIZ.map((q,i)=>({q,i})).filter(x=>filter==='all'||x.q.level===filter);
 $('quiz-list').innerHTML=shown.map(({q,i},n)=>{const p=picked.get(i),done=p!==undefined;return `<article class="card t-q"><p class="t-stem"><span class="t-level ${q.level}">${q.level==='basic'?'基礎':'高階'}</span><b>${n+1}.</b> ${q.q}</p><div class="t-opts">${q.options.map((o,j)=>`<button type="button" class="t-opt${done&&j===q.answer?' right':''}${done&&j===p&&p!==q.answer?' wrong':''}" data-q="${i}" data-o="${j}"${done?' disabled':''}><span>${LETTERS[j]}</span><span>${o}</span></button>`).join('')}</div>${done?`<div class="note ${p===q.answer?'':'warning'}" role="status" tabindex="-1"><b>${p===q.answer?'答對':'答案是 '+LETTERS[q.answer]}。</b>${q.why}<br><span class="hint">依據：${links(q.src)}</span></div>`:''}</article>`;}).join('');
 const right=[...picked].filter(([i,p])=>QUIZ[i].answer===p).length;
 $('quiz-score').textContent=`已答 ${picked.size} / ${QUIZ.length} · 答對 ${right}`;
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===filter));
}
$('quiz-list').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;const i=+b.dataset.q;picked.set(i,+b.dataset.o);renderQuiz();$('quiz-list').querySelector(`[data-q="${i}"]`).closest('.t-q').querySelector('.note').focus({preventScroll:true});});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;renderQuiz();}));
$('quiz-reset').addEventListener('click',()=>{picked.clear();renderQuiz();window.scrollTo({top:$('quiz').offsetTop-10});});
renderQuiz();

// 心智圖：連線由 SVG 依節點實際位置繪製；窄螢幕改單欄，不畫線。
const branch=(b,side)=>`<details class="m-branch ${side}" open><summary>${b.title}</summary><ul>${b.items.map(x=>`<li>${x}</li>`).join('')}</ul></details>`;
$('map-tree').innerHTML=`<svg id="map-lines" aria-hidden="true"></svg><div class="m-col"><div class="m-head">診斷路徑</div>${MAP.left.map(b=>branch(b,'l')).join('')}</div><div class="m-center"><strong>${MAP.center}</strong><small>PRIMARY ALDOSTERONISM</small></div><div class="m-col"><div class="m-head">定側與治療</div>${MAP.right.map(b=>branch(b,'r')).join('')}</div>`;
function drawMap(){
 const box=$('map-tree'),svg=$('map-lines');
 if(box.offsetParent===null)return;
 const wide=getComputedStyle(box).gridTemplateColumns.split(' ').length>1;svg.innerHTML='';
 if(!wide)return;
 const B=box.getBoundingClientRect(),C=box.querySelector('.m-center').getBoundingClientRect();
 svg.setAttribute('width',B.width);svg.setAttribute('height',B.height);svg.setAttribute('viewBox',`0 0 ${B.width} ${B.height}`);
 const cy=C.top+C.height/2-B.top;
 svg.innerHTML=[...box.querySelectorAll('.m-branch')].map(d=>{const r=d.querySelector('summary').getBoundingClientRect(),y=r.top+r.height/2-B.top,left=d.classList.contains('l'),x1=left?r.right-B.left:r.left-B.left,x2=left?C.left-B.left:C.right-B.left,mid=(x1+x2)/2;return `<path d="M${x1} ${y}C${mid} ${y} ${mid} ${cy} ${x2} ${cy}"/>`;}).join('');
}
$('map-tree').addEventListener('toggle',drawMap,true);
window.addEventListener('resize',drawMap);
$('map-toggle').addEventListener('click',e=>{const all=[...document.querySelectorAll('.m-branch')],open=all.some(d=>d.open);all.forEach(d=>{d.open=!open;});e.currentTarget.textContent=open?'全部展開':'全部收合';drawMap();});

function show(id){document.querySelector(`.nav [data-tab="${id}"]`)?.click();}
document.querySelectorAll('.nav [data-tab]').forEach(b=>b.addEventListener('click',()=>{history.replaceState(null,'','#'+b.dataset.tab);requestAnimationFrame(drawMap);}));
function fromHash(){const id=location.hash.slice(1);if(TABS.includes(id))show(id);}
window.addEventListener('hashchange',fromHash);fromHash();
