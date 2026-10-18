// Server-only rubrics. Never import this module from a client component.
import {BEHAVIOR_VERSION,LIMIT_MS,PHASES,VARIABLES,gain,EVENT_DELAY_MS,phaseStarted,type Session,type Scores,type Result} from './rts-model';
import {islandState,type IslandKind} from './island-simulation';
const KEYS=['a','b','b','b','c','a','c','a','b'];
export function validateSession(raw:unknown):Session {
 const fail=()=>{throw Error('INVALID_RECORD');};
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return fail();
 const r=raw as Session;
 if(r.version!==BEHAVIOR_VERSION||r.consentVersion!=='notice-v3')return fail();
 if(typeof r.userId!=='string'||!/^[A-Za-z0-9_-]{3,32}$/.test(r.userId)||typeof r.sessionId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.sessionId))return fail();
 if(typeof r.isTest!=='boolean'||typeof r.reducedMotion!=='boolean'||!['active','completed','timed_out'].includes(r.status)||!['pre','learn','post1','post2','results'].includes(r.stage))return fail();
 const date=(v:unknown):v is string=>typeof v==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v)&&Number.isFinite(Date.parse(v));
 if(!date(r.startedAt)||!date(r.deadlineAt)||Date.parse(r.deadlineAt)-Date.parse(r.startedAt)!==LIMIT_MS)return fail();
 if(!Array.isArray(r.answers)||r.answers.length>27||!Array.isArray(r.learning)||r.learning.length>3)return fail();
 const start=Date.parse(r.startedAt),deadline=Date.parse(r.deadlineAt);
 let previous=start;
 for(let i=0;i<r.answers.length;i++){
  const a=r.answers[i];
  if(!a||!new RegExp(`^${PHASES[Math.floor(i/9)]}-[0-8]$`).test(a.id)||r.answers.slice(0,i).some(x=>x.id===a.id)||!['a','b','c'].includes(a.choice)||!Array.isArray(a.order)||a.order.length!==3||[...a.order].sort().join('')!=='abc')return fail();
  if(!['zh-Hant','en'].includes(a.language)||!Array.isArray(a.languagesSeen)||a.languagesSeen.length<1||a.languagesSeen.length>2||new Set(a.languagesSeen).size!==a.languagesSeen.length||!a.languagesSeen.every(l=>l==='en'||l==='zh-Hant')||!a.languagesSeen.includes(a.language))return fail();
  if(!date(a.shownAt)||!date(a.at)||Date.parse(a.at)<previous||Date.parse(a.shownAt)<start||Date.parse(a.shownAt)>Date.parse(a.at)||Date.parse(a.at)>=deadline||a.elapsedMs!==Date.parse(a.at)-start)return fail();
  previous=Date.parse(a.at);
  const index=Number(a.id.split('-')[1]),variable=index%3,phase=PHASES[Math.floor(i/9)];
  if(variable>0&&!r.answers.slice(0,i).some(x=>x.id===`${phase}-${index-1}`))return fail();
  if(variable===2&&Date.parse(a.at)<phaseStarted(r,phase)+EVENT_DELAY_MS)return fail();
  const costs=[[22,30,8],[5,5,5],[24,14,0],[28,18,26],[5,5,5],[12,23,0],[23,8,20],[5,5,5],[0,12,0]];
  if(r.answers.slice(0,i+1).filter(x=>x.id.startsWith(phase+'-')).reduce((sum,x)=>sum+costs[Number(x.id.split('-')[1])][x.choice.charCodeAt(0)-97],0)>150)return fail();
 }
 previous=r.answers[8]?Date.parse(r.answers[8].at):start;
 const learningOptions=[['operate','survey'],['restore','assess'],['protect','observe']];
 for(let i=0;i<r.learning.length;i++){
  const a=r.learning[i];if(r.answers.length<9||!a||a.id!==`learn-${i}`||!learningOptions[i].includes(a.choice)||!['en','zh-Hant'].includes(a.language)||!date(a.at)||Date.parse(a.at)<previous||Date.parse(a.at)>=deadline||a.elapsedMs!==Date.parse(a.at)-start)return fail();
  previous=Date.parse(a.at);
 }
 if(r.answers.length>9&&(r.learning.length!==3||Date.parse(r.answers[9].at)<previous))return fail();
 const advanced=r.answers.length>9||r.stage==='post1'||r.stage==='post2'||r.status==='completed';
 // A timeout immediately after advancing into post1 may have exactly nine answers.
 if(!Array.isArray(r.training)||r.training.length>15)return fail();
 let lastTraining=r.answers[8]?Date.parse(r.answers[8].at):start;
 for(let i=0;i<r.training.length;i++){
  const m=r.training[i];
  if(r.answers.length<9||!m||!Number.isInteger(m.lesson)||m.lesson<0||m.lesson>2||m.lesson>r.learning.length||typeof m.action!=='string'||!date(m.at)||Date.parse(m.at)<lastTraining||Date.parse(m.at)>=deadline||m.elapsedMs!==Date.parse(m.at)-start)return fail();
  if(i&&m.lesson<r.training[i-1].lesson)return fail();
  if(m.lesson>0&&(!r.learning[m.lesson-1]||Date.parse(m.at)<Date.parse(r.learning[m.lesson-1].at)))return fail();
  if(r.learning[m.lesson]&&Date.parse(m.at)>Date.parse(r.learning[m.lesson].at))return fail();
  lastTraining=Date.parse(m.at);
 }
 try{(['wind','grass','reef'] as IslandKind[]).forEach((kind,i)=>islandState(kind,r.training.filter(m=>m.lesson===i).map(m=>m.action)));}catch{return fail();}
 const revisionBase=1+r.answers.length+r.learning.length+r.training.length+(r.status==='timed_out'?1:0);
 const advancedWhenTimedOut=r.status==='timed_out'&&r.answers.length===9&&r.learning.length===3&&r.revision===revisionBase+1;
 if(r.revision!==revisionBase+(advanced||advancedWhenTimedOut?1:0))return fail();
 if(r.status==='active'){
  if(r.endedAt!==null)return fail();
  const n=r.answers.length;
  if(n<9&&(r.stage!=='pre'||r.learning.length!==0)||n===9&&!['learn','post1'].includes(r.stage)||n>9&&n<18&&r.stage!=='post1'||n>=18&&n<27&&r.stage!=='post2'||n===27)return fail();
  if(r.stage==='post1'&&r.learning.length!==3)return fail();
 }else{
  if(r.stage!=='results'||!date(r.endedAt))return fail();
  if(r.status==='timed_out'&&r.endedAt!==r.deadlineAt)return fail();
  if(r.status==='completed'&&(r.answers.length!==27||r.learning.length!==3||r.endedAt!==r.answers[26].at))return fail();
 }
 return {version:r.version,sessionId:r.sessionId,userId:r.userId,startedAt:r.startedAt,deadlineAt:r.deadlineAt,endedAt:r.endedAt,status:r.status,stage:r.stage,revision:r.revision,isTest:r.isTest,reducedMotion:r.reducedMotion,consentVersion:r.consentVersion,training:r.training.map(m=>({lesson:m.lesson,action:m.action,at:m.at,elapsedMs:m.elapsedMs})),answers:r.answers.map(a=>({id:a.id,choice:a.choice,order:a.order,language:a.language,languagesSeen:a.languagesSeen,shownAt:a.shownAt,at:a.at,elapsedMs:a.elapsedMs})),learning:r.learning.map(a=>({id:a.id,choice:a.choice,language:a.language,at:a.at,elapsedMs:a.elapsedMs}))};
}
export function scoreBehavior(r:Session):Result{
 const scores=Object.fromEntries(PHASES.map(p=>[p,Object.fromEntries(VARIABLES.map((v,j)=>{
  const indexes=[j,j+3,j+6],answers=indexes.map(i=>r.answers.find(a=>a.id===`${p}-${i}`));
  return [v,answers.every(Boolean)?answers.reduce((sum,a,k)=>sum+(a?.choice===KEYS[indexes[k]]?1:0),0):null];
 }))])) as Scores;
 return {scores,gains:{post1:{policy:gain(scores.post1.policy,scores.pre.policy),monitor:gain(scores.post1.monitor,scores.pre.monitor),adapt:gain(scores.post1.adapt,scores.pre.adapt)},post2:{policy:gain(scores.post2.policy,scores.pre.policy),monitor:gain(scores.post2.monitor,scores.pre.monitor),adapt:gain(scores.post2.adapt,scores.pre.adapt)}},completedPhases:PHASES.filter(p=>VARIABLES.every(v=>scores[p][v]!==null)).length,answered:r.answers.length};
}
export function compatibleSnapshot(previous:Session,next:Session){
 const fields=['sessionId','userId','version','startedAt','deadlineAt','consentVersion','isTest','reducedMotion'] as const;
 return previous.status==='active'&&next.revision>previous.revision&&fields.every(k=>previous[k]===next[k])&&previous.answers.length<=next.answers.length&&previous.learning.length<=next.learning.length&&previous.training.length<=next.training.length&&previous.training.every((a,i)=>JSON.stringify(a)===JSON.stringify(next.training[i]))&&previous.answers.every((a,i)=>JSON.stringify(a)===JSON.stringify(next.answers[i]))&&previous.learning.every((a,i)=>JSON.stringify(a)===JSON.stringify(next.learning[i]));
}
