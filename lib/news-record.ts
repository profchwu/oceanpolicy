import {hasResearchConsent} from './research-consent';
import {missionsFor} from './news-missions';
import {LIMIT,type NewsRun} from './news-flow';
export const RECORD_VERSION='news-sheet-1';
export type NewsRecord={schema:typeof RECORD_VERSION;playerId:string;run:NewsRun;observedAt:number;language:'zh-Hant'|'en'};
export const validUserId=(x:unknown):x is string=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,31}$/.test(x);
const uuid=(x:unknown)=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x);
export function validateNewsRecord(value:unknown):NewsRecord{
 const p=value as NewsRecord,r=p?.run,fail=()=>{throw Error('INVALID_RECORD');};
 if(p?.schema!==RECORD_VERSION||!uuid(p.playerId)||!uuid(r?.id)||!validUserId(r?.userId)||r.version!=='news-pilot-1'||!['en','zh-Hant'].includes(p.language))return fail();
 if(!Number.isSafeInteger(p.observedAt)||!Number.isSafeInteger(r.startedAt)||r.startedAt===null||r.startedAt<1700000000000||p.observedAt<r.startedAt||p.observedAt>Date.now()+300000)return fail();
 if(!Number.isInteger(r.current)||r.current<0||r.current>3||!Array.isArray(r.rounds)||r.rounds.length!==3)return fail();
 if(r.flow!==undefined&&r.flow!=='direct-effects-1')return fail();
 if(r.missionOrder!==undefined&&!['reef-wind-grass','reef-grass-wind'].includes(r.missionOrder))return fail();
 if(r.userIdEnteredAt!==undefined&&(!Number.isSafeInteger(r.userIdEnteredAt)||r.userIdEnteredAt<1700000000000||r.userIdEnteredAt>r.startedAt||(r.consent&&r.userIdEnteredAt<r.consent.at)))return fail();
 let previous=r.startedAt;
 for(let i=0;i<3;i++){
  const round=r.rounds[i];if(!round||!Array.isArray(round.actions)||round.actions.length>3)return fail();
  if(round.openedAt===null){if(round.actions.length||i<r.current)return fail();continue;}
  if(i>r.current||!Number.isSafeInteger(round.openedAt)||round.openedAt<previous||round.openedAt>p.observedAt)return fail();previous=round.openedAt;
  if(i<r.current&&(round.actions.length!==3||round.actions.some(a=>a.ackAt===undefined)))return fail();
  for(let j=0;j<round.actions.length;j++){
   const a=round.actions[j];if(!a||a.step!==j||!Number.isInteger(a.choice)||!missionsFor(r)[i].options[j][a.choice]||!['en','zh-Hant'].includes(a.language)||!Number.isSafeInteger(a.at)||a.at<previous||a.at>=r.startedAt+LIMIT||a.at>p.observedAt)return fail();
   if(a.automatic!==undefined&&(a.automatic!==true||r.flow!=='direct-effects-1'||j!==1||a.choice!==0||a.ackAt!==a.at))return fail();
   if(r.flow==='direct-effects-1'&&j===1&&a.automatic!==true)return fail();
   if(a.ackAt!==undefined&&(!Number.isSafeInteger(a.ackAt)||a.ackAt<a.at||a.ackAt>p.observedAt))return fail();
   if(j<round.actions.length-1&&a.ackAt===undefined)return fail();previous=a.ackAt??a.at;
  }
 }
 if(r.completedAt!==undefined&&(!Number.isSafeInteger(r.completedAt)||r.current!==3||r.completedAt<previous+5000||r.completedAt>p.observedAt||r.completedAt>=r.startedAt+LIMIT))return fail();
 return {schema:RECORD_VERSION,playerId:p.playerId,language:p.language,observedAt:p.observedAt,run:{...(hasResearchConsent(r)?{consent:r.consent}:{}),version:r.version,...(r.flow?{flow:r.flow}:{}),...(r.missionOrder?{missionOrder:r.missionOrder}:{}),id:r.id,userId:r.userId,...(r.userIdEnteredAt===undefined?{}:{userIdEnteredAt:r.userIdEnteredAt}),...(r.completedAt===undefined?{}:{completedAt:r.completedAt}),startedAt:r.startedAt,current:r.current,rounds:r.rounds.map(x=>({openedAt:x.openedAt,actions:x.actions.map(a=>({...(a.automatic?{automatic:true as const}:{}),step:a.step,choice:a.choice,at:a.at,language:a.language,...(a.ackAt===undefined?{}:{ackAt:a.ackAt})}))}))}};
}
export function recordRevision(p:NewsRecord){return p.run.rounds.reduce((n,r)=>n+(r.openedAt===null?0:1)+r.actions.reduce((v,a)=>v+2+(a.ackAt===undefined?0:1),0),p.run.current)+(p.observedAt>=p.run.startedAt!+LIMIT&&p.run.current<3?1:0);}
export function recordStatus(p:NewsRecord){return p.run.current===3?'complete':p.observedAt>=p.run.startedAt!+LIMIT?'timeout':'incomplete';}
