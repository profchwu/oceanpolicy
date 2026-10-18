import { PHASES, QUESTIONS, VERSION, type Phase } from './content';
// Server-only answer key: do not import this module from client components.
const KEYS: Record<Phase,string[]> = {pre:['2','3','1','3','2','1'],post1:['2','3','1','3','2','1'],post2:['3','1','2','1','3','2']};
export type Answer = {itemId:string;value:string;responseMs:number;order:string[];shownAt:string;answeredAt:string;language?:'zh-Hant'|'en';languagesSeen?:('zh-Hant'|'en')[]};
export type Event = {type:string;at:string;elapsedMs:number;detail:string};
export type Submission = {sessionId:string;userId:string;phase:Phase;version:string;startedAt:string;completedAt:string;reducedMotion:boolean;answers:Answer[];events:Event[];isTest:boolean;consentVersion:string};
export function validateSubmission(raw: unknown): Submission {
 if(!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('資料格式錯誤');
 const r = raw as Submission;
 if(!/^[a-zA-Z0-9_-]{3,32}$/.test(r.userId||'')) throw Error('User ID 請使用 3–32 個英文字母、數字、底線或短橫線');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.sessionId||'')) throw Error('遊玩代碼無效');
 if(!PHASES.includes(r.phase) || r.version !== VERSION) throw Error('遊戲版本或關卡無效');
 if(typeof r.isTest !== 'boolean' || typeof r.reducedMotion !== 'boolean' || r.consentVersion !== 'notice-v2') throw Error('參與資訊不完整');
 const date = (v:unknown) => typeof v === 'string' && /^\d{4}-\d\d-\d\dT/.test(v) && Number.isFinite(Date.parse(v));
 if(!date(r.startedAt)||!date(r.completedAt)||Date.parse(r.completedAt)<Date.parse(r.startedAt)) throw Error('時間資訊無效');
 if(!Array.isArray(r.answers)||r.answers.length!==6) throw Error('請完成本關的 6 題');
 for(const [i,q] of QUESTIONS[r.phase].entries()){
  const a = r.answers[i];
  if(!a || a.itemId!==q.id || !q.options.some(o=>o.id===a.value)) throw Error('答案或題目順序無效');
  if(!Number.isFinite(a.responseMs)||a.responseMs<0||a.responseMs>86400000) throw Error('作答時間無效');
  if(!date(a.shownAt)||!date(a.answeredAt)) throw Error('作答日期無效');
  if(a.language!==undefined&&!['zh-Hant','en'].includes(a.language))throw Error('作答語言無效');
  if(a.languagesSeen!==undefined&&(!Array.isArray(a.languagesSeen)||a.languagesSeen.length<1||a.languagesSeen.length>2||new Set(a.languagesSeen).size!==a.languagesSeen.length||!a.languagesSeen.every(l=>l==='zh-Hant'||l==='en')||!a.language||!a.languagesSeen.includes(a.language)))throw Error('作答語言無效');
  if(!Array.isArray(a.order)||a.order.length!==4||new Set(a.order).size!==4||!a.order.every(v=>q.options.some(o=>o.id===v))) throw Error('選項順序無效');
 }
 if(!Array.isArray(r.events)||r.events.length>300) throw Error('事件紀錄過多');
 if(r.events.some(e=>!e||typeof e.type!=='string'||e.type.length>40||typeof e.detail!=='string'||e.detail.length>200||!date(e.at)||!Number.isFinite(e.elapsedMs)||e.elapsedMs<0)) throw Error('事件紀錄格式無效');
 return {sessionId:r.sessionId,userId:r.userId,phase:r.phase,version:r.version,startedAt:r.startedAt,completedAt:r.completedAt,reducedMotion:r.reducedMotion,answers:r.answers.map(a=>({itemId:a.itemId,value:a.value,responseMs:a.responseMs,order:a.order,shownAt:a.shownAt,answeredAt:a.answeredAt,language:a.language,languagesSeen:a.languagesSeen})),events:r.events.map(e=>({type:e.type,at:e.at,elapsedMs:e.elapsedMs,detail:e.detail})),isTest:r.isTest,consentVersion:r.consentVersion};
}
export function scoreSubmission(r:Submission){
 const correctness = r.answers.map((a,i)=>a.value===KEYS[r.phase][i]);
 const correct = correctness.filter(Boolean).length;
 return {correct,total:6,percent:Math.round(correct/6*1000)/10,unknown:r.answers.filter(a=>a.value==='unknown').length,correctness};
}
