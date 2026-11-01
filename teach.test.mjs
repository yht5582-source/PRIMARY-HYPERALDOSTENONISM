import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assess} from './engine.mjs';
import {SOURCES,CASES,QUIZ,MAP,avsRead} from './teach-content.mjs';
let n=0;const ok=(v,m)=>{assert.ok(v,m);n++;},eq=(a,b,m)=>{assert.equal(a,b,m);n++;};

// 病例：每一步都要與工具的判讀相符
eq(CASES.length,6);
eq(CASES.map(c=>c.no).join(),'04,05,06,07,08,09');
for(const c of CASES){
 ok(c.read.length&&c.plan.length&&c.pitfall&&c.question,c.id);
 for(const k of c.src)ok(SOURCES[k],c.id+' source '+k);
 for(const s of c.steps){const a=assess(s.input),e=s.expect;
  eq(a.errors.length,0,c.id);
  if('positive' in e)eq(a.positive,e.positive,c.id+' positive');
  if('strong' in e)eq(a.strong,e.strong,c.id+' strong');
  if('blocked' in e)eq(a.blocked,e.blocked,c.id+' blocked');
  if(e.title)ok(a.title.includes(e.title),c.id+' title: '+a.title);
  if(e.next)ok(a.next.includes(e.next),c.id+' next: '+a.next);
 }
 for(const v of [c.avs,c.avs2].filter(Boolean)){const r=avsRead(v);for(const [k,x] of Object.entries(v.expect))eq(r[k],x,c.id+' avs '+k);}
}
const by=id=>CASES.find(c=>c.id===id);
// 內文引用的數字
ok(Math.abs(assess(by('c4').steps[1].input).ratio-42.5)<1e-9);
eq(assess(by('c8').steps[0].input).ratio,150);
ok(Math.abs(assess(by('c8').steps[0].input).pac-17.33)<0.01);
ok(avsRead(by('c5').avs).li>4&&avsRead(by('c5').avs).csi<1);
ok(avsRead(by('c5').avs).siR>3&&avsRead(by('c5').avs).siL>3);
{const a=avsRead(by('c6').avs),b=avsRead(by('c6').avs2);ok(a.li>1.9&&a.li<2.2,'cortisol LI ~2');ok(a.siL<1.4);ok(b.siR>12&&b.siL>12&&b.li>4);}
{const m=assess(by('c7').steps[0].input);ok(m.pac>30&&+by('c7').steps[0].input.k<3.5&&m.lowK);}

// 考題結構
eq(QUIZ.length,20);
eq(QUIZ.filter(q=>q.level==='basic').length,10);
eq(QUIZ.filter(q=>q.level==='advanced').length,10);
for(const q of QUIZ){eq(q.options.length,4,q.q);ok(q.answer>=0&&q.answer<4);ok(q.why);for(const k of q.src)ok(SOURCES[k],k);ok(new Set(q.options).size===4,q.q);}
for(const i of [0,1,2,3])eq(QUIZ.filter(q=>q.answer===i).length,5,'answer spread '+i);
// 含數字的考題與工具交叉驗證
const ng={unit:'ng',assay:'ia',reninType:'pra',prepared:'yes',surgery:'yes',meds:[],k:4,egfr:90};
ok(Math.abs(assess({...ng,reninType:'drc',pac:22,renin:5}).ratio-121.88)<0.01);
const q=QUIZ[10];eq(q.answer,0);
eq(assess({...ng,reninType:'drc',pac:24,renin:1.5,resistant:true}).strong,true);
eq(assess({...ng,pac:24,renin:0.1}).strong,false);
eq(assess({...ng,pac:24,renin:0.5,k:3.2}).strong,false);
eq(assess({...ng,pac:18,renin:0.1,resistant:true}).strong,false);
{const r=avsRead({cosyntropin:true,right:{aldo:1600,ref:320},left:{aldo:36,ref:180},ivc:{aldo:40,ref:40}});eq(r.siR,8);eq(r.siL,4.5);eq(r.selectivity,'fail');ok(Math.abs(r.li-25)<1e-9);}
{const r=avsRead({right:{aldo:340,ref:50},left:{aldo:100,ref:50},ivc:{aldo:20,ref:16}});eq(r.lateral,'gray');ok(Math.abs(r.li-3.4)<1e-9);ok(Math.abs(r.csi-1.6)<1e-9);ok(Math.abs(r.siR-3.125)<1e-9);}
eq(avsRead({right:{aldo:100,ref:20},left:{aldo:90,ref:20},ivc:{aldo:5,ref:10}}).selectivity,'center');
eq(avsRead({right:{aldo:100,ref:15},left:{aldo:90,ref:40},ivc:{aldo:5,ref:10}}).selectivity,'center');
eq(avsRead({right:{aldo:100,ref:12},left:{aldo:90,ref:13},ivc:{aldo:5,ref:10}}).selectivity,'fail');

// 心智圖
eq(MAP.left.length,4);eq(MAP.right.length,4);
for(const b of [...MAP.left,...MAP.right])ok(b.items.length>=4,b.title);

// 內文的 < 必須已跳脫，否則 innerHTML 會吃掉文字
const texts=JSON.stringify([CASES,QUIZ,MAP]);
ok(!/<(?![/a-z])/i.test(texts),'unescaped <');

// 版本與頁面掛載點
const html=readFileSync(new URL('./index.html',import.meta.url),'utf8');
const teach=readFileSync(new URL('./teach.mjs',import.meta.url),'utf8');
for(const id of ['teach-cases','quiz-list','map-tree','quiz-score','quiz-reset','map-toggle'])ok(html.includes(`id="${id}"`),id);
const ver=html.match(/teach\.mjs\?v=([\d.]+)/)[1];
ok(html.includes(`teach.css?v=${ver}`));ok(teach.includes(`teach-content.mjs?v=${ver}`));ok(html.includes(`v${ver} `));
console.log(`PASS: ${n} assertions — cases vs engine, AVS indices, quiz structure and answers, map, versions.`);
