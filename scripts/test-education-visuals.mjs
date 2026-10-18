import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const dir=path.resolve('.sites-runtime/education-audit');fs.mkdirSync(dir,{recursive:true});
const libs=['news-missions','news-flow','policy-scene','mission-maps','environment-view','policy-consequence','environment-art','policy-art'];
const components=['NewsCoast','PolicyArtwork','EnvironmentArtwork','EnvironmentImpact','PolicyWorks','MissionPopulation','PolicyEvolution','MetricDelta','OutcomeLedger','PolicyImpact','PageReader'];
for(const [folder,names,ext] of [['lib',libs,'ts'],['app',components,'tsx']])for(const name of names){let src=fs.readFileSync(`${folder}/${name}.${ext}`,'utf8');let js=ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText;js=js.replace(/(['"])(?:@\/lib\/|\.\/)([^'"]+)\1/g,(_,quote,file)=>quote+'./'+file+'.mjs'+quote);fs.writeFileSync(path.join(dir,name+'.mjs'),js);}
const get=async name=>import(pathToFileURL(path.join(dir,name+'.mjs')));
const f=await get('news-flow'),{MISSIONS}=await get('news-missions'),{environmentView}=await get('environment-view'),{policyScene}=await get('policy-scene');
const Coast=(await get('NewsCoast')).default,Works=(await get('PolicyWorks')).default;
const svg=(area,effects,values,event)=>renderToStaticMarkup(React.createElement(Works,{area,effects,values,event}));
const occurrences=(s,x)=>s.split(x).length-1;
const rows=[];
for(let level=0;level<3;level++)for(let first=0;first<3;first++)for(let evidence=0;evidence<2;evidence++)for(let response=0;response<3;response++){
 let run=f.makeRun('audit');run.current=level;let now=1000;run=f.enter(run,now);const m=MISSIONS[level];
 for(const [step,choice] of [[0,first],[1,evidence],[2,response]]){
  const before=f.valuesAt(run,level,now);run=f.choose(run,choice,now,'en');
  assert.deepEqual(f.valuesAt(run,level,now+2500),before,'No action or disturbance before acknowledgement');
  const preview=f.actionOutcome(run,level,step,now);
  assert.deepEqual(preview.before,before.map(Math.round));
  assert.equal(preview.event,step===1);
  assert.deepEqual(preview.delta,preview.after.map((v,i)=>v-preview.before[i]));
  run=f.acknowledge(run,now);now+=step===1?1:5000;
  assert.deepEqual(f.valuesAt(run,level,now).map(Math.round),preview.after,'Preview must exactly match completed display');
  assert.deepEqual(f.actionOutcome(run,level,step,now),preview,'Result receipt must match preview');
 }
 const values=f.valuesAt(run,level,now);
 for(let j=0;j<3;j++)assert.equal(MISSIONS[level].initial[j]+[0,1,2].reduce((sum,step)=>sum+f.actionOutcome(run,level,step,now).delta[j],0),Math.round(values[j]),'Report policy/event rows reconcile to final value');assert.ok(values.every(v=>Number.isFinite(v)&&v>=0&&v<=100));
 const effects=run.rounds[level].actions.map(a=>({step:a.step,visual:m.options[a.step][a.choice].visual,progress:f.actionProgress(a,now)}));
 const env=environmentView(m.id,values,effects,true),markup=svg(m.id,effects,values,true);
 assert.ok(!markup.includes('NaN')&&!markup.includes('undefined'),'Valid SVG attributes');
 if(level===0){assert.equal(env.cableFailed,response!==0,'Only cable repair resolves fault, regardless of final power');if(response===1)assert.equal(values[0],Math.max(0,m.initial[0]+m.options[0][first].delta[0]+m.shock[0]),'Extra turbines cannot restore delivery');}
 if(level===1)assert.ok(!markup.includes('wastewater-treatment'),'Runoff response is not an offshore treatment plant');
 if(level===2){assert.equal(env.bleaching,.55,'Heat stress persists for every local-policy route');assert.ok(occurrences(markup,'data-policy-object="wastewater-treatment"')+occurrences(markup,'data-policy-object="treatment-stopped"')<=1,'No duplicate treatment plant');if(response===1){assert.ok(markup.includes('treatment-stopped'));assert.ok(!markup.includes('treatment-water'),'Stopped process cannot animate as operating');}}
 const scene=renderToStaticMarkup(React.createElement(Coast,{area:m.id,values,choice:m.options[2][response].visual,progress:1,works:{barrier:0,filter:0,plant:0,grid:0,dredge:0},motion:false,en:true,event:true,delta:m.options[2][response].delta,phase:'report',effects,step:2}));
 assert.ok(!scene.includes('animateMotion'),'Motion OFF freezes SVG travel');assert.ok(!scene.includes('clean-water-bubble'),'No oxygen proxy from water index');assert.ok(!scene.includes('policy-construction'),'No generic crane');
 assert.ok(!scene.includes('impact-halo')&&!scene.includes('policy-environment-focus'),'Completed scene clears temporary effect markers');
 rows.push({level:level+1,choices:[first,evidence,response],values,cableFailed:env.cableFailed,bleaching:env.bleaching});
}
// Continuous water tint: no discontinuity at the former arbitrary threshold of 50.
assert.ok(Math.abs(environmentView('grass',[65,49.99,50],[],false).sediment-environmentView('grass',[65,50.01,50],[],false).sediment)<.001);
// Cable repair resolves even when the illustrative power outcome remains below 50.
assert.equal(environmentView('wind',[45,70,70],[{step:2,visual:'grid',progress:1}],true).cableFailed,false);
const two=svg('wind',[{step:0,visual:'dredge',progress:1},{step:2,visual:'dredge',progress:1}],[0,40,40],true);assert.ok(two.includes('translate(1260 660)')&&two.includes('translate(1260 800)'),'Separate turbine batches must not overlap');
for(const m of MISSIONS)for(const step of [0,2])for(const option of m.options[step]){const descriptor=policyScene(m.id,option.visual,step);assert.equal(descriptor.zh.length,3);assert.equal(descriptor.en.length,3);for(const progress of [0,.25,.75,1]){const markup=svg(m.id,[{step,visual:option.visual,progress}],m.initial,step===2);assert.ok(!markup.includes('NaN'));if(progress===0)assert.ok(!markup.includes('data-policy-object='),'No new work before confirmation');}}
fs.writeFileSync(path.join(dir,'matrix.json'),JSON.stringify({paths:rows.length,policyChoices:18,visualPhases:72,rows},null,2));
console.log(`PASS: ${rows.length} complete policy/evidence/response routes; 18 policy choices × 4 visual phases; event acknowledgement; cable integrity; heat persistence; no duplicate plants; continuous water proxy; motion OFF.`);
// Local visual contact sheet. It is ignored build output, never deployed.
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const sheets=MISSIONS.map((m,level)=>`<section id="${m.id}" ${level?'hidden':''}><h2>${esc(m.title[0])}</h2><div class="grid">${[0,2].flatMap(step=>m.options[step].map(op=>{const event=step===2,base=m.initial.map((v,j)=>Math.max(0,v+(event?m.shock[j]:0))),values=base.map((v,j)=>Math.max(0,Math.min(100,v+op.delta[j])));const markup=renderToStaticMarkup(React.createElement(Coast,{area:m.id,values,choice:op.visual,progress:1,works:{barrier:0,filter:0,plant:0,grid:0,dredge:0},motion:true,en:false,event,delta:op.delta,phase:'report',effects:[{visual:op.visual,step,progress:1}],step})).replaceAll('href="/mission-','href="http://127.0.0.1:5909/mission-');return `<article><h3>${step===0?'政策':'應變'} · ${esc(op.label[0])}</h3>${markup}<p>${esc(op.reason[0])}</p></article>`})).join('')}</div></section>`).join('');
fs.writeFileSync(path.join(dir,'gallery.html'),`<!doctype html><meta charset="utf-8"><title>Local policy visual audit</title><style>body{background:#173c45;color:#efe8cc;font:14px Arial;margin:16px}nav{display:flex;gap:15px}button{padding:10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}article{border:1px solid #6a938f;padding:10px}h3{font-size:14px;margin:4px 0 10px}p{font-size:11px;line-height:1.5}svg{width:100%;height:210px}section[hidden],.coast-caption,.map-credit{display:none}.policy-rotor{animation:spin 4s linear infinite;transform-origin:0 0}@keyframes spin{to{transform:rotate(360deg)}}</style><nav>${MISSIONS.map(m=>`<button onclick="document.querySelectorAll('section').forEach(e=>e.hidden=e.id!=='${m.id}')">${m.id}</button>`).join('')}</nav>${sheets}`);

const {policyConsequence}=await get('policy-consequence');
for(let level=0;level<3;level++)for(const step of [0,2])for(let choice=0;choice<3;choice++){const c=policyConsequence(level,step,choice);assert.ok(c.where.every(Boolean)&&c.remaining.every(Boolean));assert.ok(!/[\u3400-\u9fff]/.test(c.where[1]+c.remaining[1]));}
console.log('PASS: 162 action previews equal completed outcomes; 54 result ledgers reconcile; 18 bilingual location/limitation descriptions.');

const Delta=(await get('MetricDelta')).default,Ledger=(await get('OutcomeLedger')).default,Impact=(await get('PolicyImpact')).default;
for(const en of [false,true])for(const [value,kind] of [[15,'increase'],[-20,'decrease'],[0,'stable']]){
 const html=renderToStaticMarkup(React.createElement(Delta,{value,en}));assert.ok(html.includes('metric-change '+kind));assert.ok(html.startsWith('<strong'));assert.ok(html.includes(String(Math.abs(value))));
}
let observedRun=f.enter(f.makeRun('numbers'),1000);observedRun=f.choose(observedRun,1,1000,'en');observedRun=f.acknowledge(observedRun,1000);observedRun=f.choose(observedRun,0,6001,'en');
const observed=f.actionOutcome(observedRun,0,0,6001),eventPreview=f.actionOutcome(observedRun,0,1,6001);
const impactHtml=renderToStaticMarkup(React.createElement(Impact,{impact:{title:['監測','Evidence'],reason:['判讀','Interpret'],delta:[0,0,0],build:false,observed,eventPreview},en:true,progress:1,onConfirm:()=>{},labels:['Power','Water','Habitat'],missionMode:true}));
assert.ok(impactHtml.includes('25 → 40')&&impactHtml.includes('70 → 50')&&impactHtml.includes('40 → 0'));
assert.ok(impactHtml.includes('Simulated result')&&impactHtml.includes('separate external event'));
assert.ok(!/[\u3400-\u9fff]/.test(impactHtml));
const ledgerHtml=renderToStaticMarkup(React.createElement(Ledger,{run:observedRun,index:0,now:6001,en:true}));
assert.ok(ledgerHtml.includes('25 → 40')&&ledgerHtml.includes('70 → 50'));
assert.ok(ledgerHtml.includes('Not completed'));
console.log('PASS: bold signed green/red/neutral classes, observed policy values distinct from event preview, detailed ledger values and incomplete-event label.');
const Focus=(await get('EnvironmentImpact')).default;
for(const m of MISSIONS)for(const step of [0,2])for(const option of m.options[step]){
 const before=m.initial,after=before.map((v,i)=>Math.max(0,Math.min(100,v+option.delta[i]))),values=before.map((v,i)=>(v+after[i])/2);
 const html=renderToStaticMarkup(React.createElement(Focus,{area:m.id,before,after,values,source:policyScene(m.id,option.visual,step).point,en:true,building:true}));
 for(let i=0;i<3;i++){assert.equal(html.includes(`data-impact-metric="${i}"`),after[i]!==before[i]);if(after[i]!==before[i])assert.ok(html.includes(`data-impact-current="${Math.round(values[i])}"`));}
 assert.equal(html.includes('No environmental improvement'),after.every((v,i)=>v===before[i]));
}
console.log('PASS: all 18 policy markers show bounded actual changes; zero effects remain explicitly unchanged.');

// Current direct-effects flow: nothing is constructed or heat-animated at entry.
for(const m of MISSIONS){
 const html=renderToStaticMarkup(React.createElement(Coast,{area:m.id,values:m.initial,progress:0,works:{barrier:0,filter:0,plant:0,grid:0,dredge:0},motion:true,en:true,event:false,effects:[],step:0,phase:'policy'}));
 assert.ok(!html.includes('data-policy-object='),'No policy construction at entry');
 assert.ok(!html.includes('data-heat-bleaching=')&&!html.includes('heat-haze'),'No future heat event at entry');
 assert.ok(!html.includes('coral-condition'),'No giant schematic coral overlay');
 assert.ok(!html.includes('growing-meadow'),'No restoration growth at entry');
}
const ordered=[MISSIONS[2],MISSIONS[1],MISSIONS[0]];
for(let level=0;level<3;level++)for(let first=0;first<3;first++)for(let response=0;response<3;response++){
 let r={...f.makeRun('direct-audit'),flow:'direct-effects-1',missionOrder:'reef-grass-wind',current:level};
 r=f.enter(r,1000);assert.equal(f.stage(r,1000),'policy');
 r=f.acknowledge(f.choose(r,first,1001,'en'),1001);
 assert.equal(f.stage(r,3501),'building');assert.equal(f.stage(r,6001),'monitor');
 const event=f.revealEvent(r,6002,'en');assert.equal(f.stage(event,6002),'adapt');
 assert.equal(f.outcomes(event,level)[1],null,'Automatic event is never a scored decision');
 r=f.acknowledge(f.choose(event,response,6003,'en'),6003);
 assert.equal(f.stage(r,8503),'building');assert.equal(f.stage(r,11003),'report');
 assert.deepEqual(f.outcomes(r,level),[Number(ordered[level].options[0][first].correct),null,Number(ordered[level].options[2][response].correct)]);
 assert.equal(r.current,level,'Completing animation must not advance the level');
 assert.equal(f.nextRound(r,11003).current,level+1);
}
console.log('PASS: 3 clean baseline scenes; 27 current-flow routes, five-second animations, event order, policy scores, and manual level advancement.');

const {environmentArt,artWeight}=await get('environment-art');
const openingReef=environmentArt('reef',MISSIONS[2].initial);
assert.ok(openingReef.low.endsWith('reef-low-v2.png'));
assert.ok(openingReef.water<.1,'Poor initial water must remain visibly polluted');
assert.ok(openingReef.habitat<.5,'Initial reef retains visible bleaching');
assert.ok(environmentArt('reef',[65,30,33]).habitat<.12,'Low-health final reef cannot look recovered');
assert.ok(environmentArt('reef',[65,75,56]).habitat<.32,'Partial recovery must retain substantial bleaching');
assert.equal(artWeight(-5),0);assert.equal(artWeight(110),1);
for(const area of ['reef','grass','wind']){
 const low=environmentArt(area,[20,20,20]),high=environmentArt(area,[80,80,80]);
 for(const k of ['water','habitat','power'])assert.ok(high[k]>low[k]);
 const waterOnly=environmentArt(area,[20,80,20]);assert.equal(waterOnly.habitat,low.habitat);assert.equal(waterOnly.power,low.power);
 for(const asset of [low.low,high.high]){const bytes=fs.readFileSync('public'+asset);assert.ok(bytes.length>10000);assert.equal(bytes.readUInt32BE(20),941,'Keep reference framing height');}
}
console.log('PASS: 6 generated assets exist; bounded continuous state blending; each metric has an independent art weight.');
const {policyArt,policyLayers}=await get('policy-art');
const Artwork=(await get('PolicyArtwork')).default,keys=new Set();
for(const m of MISSIONS)for(const step of [0,2])for(const option of m.options[step]){
 const e={step,visual:option.visual,progress:1},art=policyArt(m.id,e);
 assert.ok(art);keys.add(art.image);assert.ok(fs.statSync('public'+art.image).size>10000);
 const initial=renderToStaticMarkup(React.createElement(Artwork,{area:m.id,effects:[{...e,progress:0}]}));
 assert.ok(!initial.includes('<image'),'No policy artwork before selection');
 for(const progress of [.25,.5,1]){const html=renderToStaticMarkup(React.createElement(Artwork,{area:m.id,effects:[{...e,progress}]}));assert.ok(html.includes(art.image));assert.ok(html.includes(`data-art-progress="${progress}"`));assert.ok(!html.includes('NaN'));}
}
assert.equal(keys.size,18,'Every policy and response has a unique generated image');
const combined=policyLayers('reef',[{step:0,visual:'dredge',progress:1},{step:2,visual:'filter',progress:1}]);
assert.deepEqual(combined.map(x=>x.channel),['pier','treatment'],'A later treatment must preserve the earlier pier');
console.log('PASS: 18 unique policy images; 54 animation checkpoints; zero premature images; cumulative local structures.');
