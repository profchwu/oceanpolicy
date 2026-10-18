import type {ResearchConsent} from './research-consent';
import {MISSIONS,missionsFor,type Values} from './news-missions';
export type NewsAction={step:number;choice:number;at:number;ackAt?:number;language:'zh-Hant'|'en';automatic?:true};
export type NewsRound={openedAt:number|null;actions:NewsAction[]};
export type NewsRun={consent?:ResearchConsent;version:'news-pilot-1';flow?:'direct-effects-1';missionOrder?:'reef-wind-grass'|'reef-grass-wind';id:string;userId?:string;startedAt:number|null;current:number;rounds:NewsRound[]};
export const LIMIT=600000;
export const makeRun=(id:string):NewsRun=>({version:'news-pilot-1',id,startedAt:null,current:0,rounds:MISSIONS.map(()=>({openedAt:null,actions:[]}))});
export const timedOut=(r:NewsRun,now:number)=>r.current<3&&r.startedAt!==null&&now>=r.startedAt+LIMIT;
export const actionProgress=(a:NewsAction,now:number)=>a.step===1?1:a.ackAt===undefined?0:Math.max(0,Math.min(1,(now-a.ackAt)/5000));
export function stage(r:NewsRun,now:number):'news'|'policy'|'monitor'|'adapt'|'building'|'impact'|'report'|'results'{
 if(r.current>=3||timedOut(r,now))return 'results';
 const round=r.rounds[r.current];if(round.openedAt===null)return 'news';
 const last=round.actions.at(-1);if(last&&last.ackAt===undefined)return 'impact';
 if(last&&actionProgress(last,now)<1)return 'building';
 return (['policy','monitor','adapt','report'] as const)[round.actions.length];
}
export function enter(r:NewsRun,now:number):NewsRun{if(stage(r,now)!=='news')return r;return {...r,startedAt:r.startedAt??now,rounds:r.rounds.map((v,i)=>i===r.current?{...v,openedAt:now}:v)};}
export function choose(r:NewsRun,choice:number,now:number,language:'zh-Hant'|'en'):NewsRun{
 if(!['policy','monitor','adapt'].includes(stage(r,now))||(r.flow==='direct-effects-1'&&stage(r,now)==='monitor'))return r;
 const round=r.rounds[r.current],step=round.actions.length,mission=missionsFor(r)[r.current];
 if(!Number.isInteger(choice)||!mission.options[step]?.[choice])return r;
 return {...r,rounds:r.rounds.map((v,i)=>i===r.current?{...v,actions:[...v.actions,{step,choice,at:now,language}]}:v)};
}
export function acknowledge(r:NewsRun,now:number):NewsRun{const round=r.rounds[r.current];if(!round?.actions.length||round.actions.at(-1)?.ackAt!==undefined)return r;return {...r,rounds:r.rounds.map((v,i)=>i===r.current?{...v,actions:v.actions.map((a,j)=>j===v.actions.length-1?{...a,ackAt:now}:a)}:v)};}
export function nextRound(r:NewsRun,now:number):NewsRun{return stage(r,now)==='report'?{...r,current:r.current+1}:r;}
export function valuesAt(r:NewsRun|null,index:number,now:number):Values{
 const m=missionsFor(r)[index],round=r?.rounds[index];const values=[...m.initial] as Values;
 const end=r?.startedAt===null||!r?now:Math.min(now,r.startedAt+LIMIT);
 for(const a of round?.actions||[]){const op=m.options[a.step][a.choice],p=actionProgress(a,end);for(let j=0;j<3;j++)values[j]+=op.delta[j]*p;}
 if(round?.actions.some(a=>a.step===1&&a.ackAt!==undefined))for(let j=0;j<3;j++)values[j]+=m.shock[j];
 return values.map(v=>Math.max(0,Math.min(100,v))) as Values;
}
export function outcomes(r:NewsRun,index:number){const a=r.rounds[index].actions;return [0,1,2].map(step=>{const x=a.find(x=>x.step===step);return x&&!(step===1&&(r.flow==='direct-effects-1'||x.automatic))?Number(missionsFor(r)[index].options[step][x.choice].correct):null;});}
export function achieved(values:Values,index:number,run?:NewsRun|null){return (run===undefined?MISSIONS:missionsFor(run))[index].id==='wind'?values[0]>=55&&values[2]>=50:values[1]>=50&&values[2]>=50;}

// All feedback uses the same bounded model and the same rounded display values.
// An evidence choice is not an intervention: its subsequent event is kept separate.
export function actionOutcome(r:NewsRun,index:number,actionIndex:number,now:number){
 const actions=r.rounds[index].actions,a=actions[actionIndex];
 if(!a)return null;
 const withActions=(list:NewsAction[]):NewsRun=>({...r,rounds:r.rounds.map((v,i)=>i===index?{...v,actions:list}:v)});
 const at=a.ackAt??now;
 const before=valuesAt(withActions(actions.slice(0,actionIndex)),index,at);
 const simulated=withActions([...actions.slice(0,actionIndex),{...a,ackAt:at}]);
 const after=valuesAt(simulated,index,a.step===1?at:at+5000);
 const round=(v:Values)=>v.map(Math.round) as Values;
 const from=round(before),to=round(after);
 return {before:from,after:to,delta:to.map((v,i)=>v-from[i]) as Values,event:a.step===1};
}

/** System event, never a scored player answer. Keep legacy step IDs for recorded data. */
export function revealEvent(r:NewsRun,now:number,language:'zh-Hant'|'en'):NewsRun{
 if(r.flow!=='direct-effects-1'||stage(r,now)!=='monitor')return r;
 return {...r,rounds:r.rounds.map((v,i)=>i===r.current?{...v,actions:[...v.actions,{step:1,choice:0,at:now,ackAt:now,language,automatic:true}]}:v)};
}
