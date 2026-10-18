import type {TrainingMove} from './island-simulation';
export const BEHAVIOR_VERSION = 'ocean-rts-v5.3.0';
export const LIMIT_MS = 600_000;
export const EVENT_DELAY_MS=35_000;
export const PHASES = ['pre','post1','post2'] as const;
export const VARIABLES = ['policy','monitor','adapt'] as const;
export type Phase = typeof PHASES[number];
export type Variable = typeof VARIABLES[number];
export type Language = 'zh-Hant'|'en';
export type Stage = Phase|'learn'|'results';
export type Action = {id:string;choice:string;order:string[];language:Language;languagesSeen:Language[];shownAt:string;at:string;elapsedMs:number};
export type LearningAction = {id:string;choice:string;language:Language;at:string;elapsedMs:number};
export type Session = {version:string;sessionId:string;userId:string;startedAt:string;deadlineAt:string;endedAt:string|null;status:'active'|'completed'|'timed_out';stage:Stage;revision:number;answers:Action[];learning:LearningAction[];training:TrainingMove[];isTest:boolean;reducedMotion:boolean;consentVersion:'notice-v3'};
export type Scores = Record<Phase,Record<Variable,number|null>>;
export type Result = {scores:Scores;gains:Record<'post1'|'post2',Record<Variable,number|null>>;completedPhases:number;answered:number};
export function remainingMs(s:Session,now:number){return Math.max(0,Math.min(LIMIT_MS,Date.parse(s.deadlineAt)-now));}
export function expired(s:Session,now:number){return s.status==='active'&&remainingMs(s,now)===0;}
export function newSession(userId:string,sessionId:string,now:number,isTest:boolean,reducedMotion:boolean):Session{
 return {version:BEHAVIOR_VERSION,sessionId,userId,startedAt:new Date(now).toISOString(),deadlineAt:new Date(now+LIMIT_MS).toISOString(),endedAt:null,status:'active',stage:'pre',revision:1,answers:[],learning:[],training:[],isTest,reducedMotion,consentVersion:'notice-v3'};
}
export function phaseCount(s:Session,p:Phase){return s.answers.filter(a=>a.id.startsWith(p+'-')).length;}
export function phaseStarted(s:Session,p:Phase){return Date.parse(p==='pre'?s.startedAt:p==='post1'?(s.learning[2]?.at||s.startedAt):(s.answers[17]?.at||s.startedAt));}
export function taskAvailable(s:Session,index:number,now:number){
 if(!Number.isInteger(index)||index<0||index>8||!PHASES.includes(s.stage as Phase)||s.answers.some(a=>a.id===`${s.stage}-${index}`))return false;
 const v=index%3;
 return (v===0||s.answers.some(a=>a.id===`${s.stage}-${index-1}`))&&(v!==2||now>=phaseStarted(s,s.stage as Phase)+EVENT_DELAY_MS);
}
export function completedSteps(s:Session){return [s.answers.length>=9,s.learning.length===3,s.answers.length>=18,s.answers.length===27];}
export function currentId(s:Session){return s.stage==='results'||s.stage==='learn'?null:`${s.stage}-${phaseCount(s,s.stage)}`;}
export function timeoutSession(s:Session,now:number):Session{
 return expired(s,now)?{...s,stage:'results',status:'timed_out',endedAt:s.deadlineAt,revision:s.revision+1}:s;
}
export function commitAction(s:Session,a:Action):Session{
 if(s.status!=='active'||!['pre','post1','post2'].includes(s.stage)||!a.id.startsWith(s.stage+'-')||!taskAvailable(s,Number(a.id.split('-')[1]),Date.parse(a.at)))return s;
 const end=Date.parse(a.at);if(expired(s,end))return timeoutSession(s,end);
 const answers=[...s.answers,a];const count=phaseCount(s,s.stage as Phase)+1;
 if(count===9){
  const stage=s.stage==='pre'?'learn':s.stage==='post1'?'post2':'results';
  return {...s,answers,stage,revision:s.revision+1,status:stage==='results'?'completed':'active',endedAt:stage==='results'?a.at:null};
 }
 return {...s,answers,revision:s.revision+1};
}
export function commitLearning(s:Session,a:LearningAction):Session{
 if(s.status!=='active'||s.stage!=='learn'||a.id!==`learn-${s.learning.length}`)return s;
 if(expired(s,Date.parse(a.at)))return timeoutSession(s,Date.parse(a.at));
 return {...s,learning:[...s.learning,a],revision:s.revision+1};
}
export function finishLearning(s:Session,now:number):Session{
 if(expired(s,now))return timeoutSession(s,now);
 return s.stage==='learn'&&s.learning.length===3?{...s,stage:'post1',revision:s.revision+1}:s;
}
export function commitTraining(s:Session,move:TrainingMove):Session{
 if(s.status!=='active'||s.stage!=='learn'||move.lesson!==s.learning.length)return s;
 if(expired(s,Date.parse(move.at)))return timeoutSession(s,Date.parse(move.at));
 return {...s,training:[...s.training,move],revision:s.revision+1};
}
export function gain(after:number|null,before:number|null){return after===null||before===null?null:after-before;}
export function shuffle<T>(values:T[],seed:string){let n=2166136261;for(const c of seed)n=Math.imul(n^c.charCodeAt(0),16777619);const out=[...values];for(let i=out.length-1;i>0;i--){n^=n<<13;n^=n>>>17;n^=n<<5;const j=(n>>>0)%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}

