import {missionsFor} from '@/lib/news-missions';
import {actionOutcome,actionProgress,valuesAt,type NewsRun} from '@/lib/news-flow';
import MetricDelta from './MetricDelta';
export default function OutcomeLedger({run,index,now,en}:{run:NewsRun;index:number;now:number;en:boolean}){
 const m=missionsFor(run)[index],t=(v:[string,string])=>v[en?1:0];
 return <table className="outcome-ledger"><caption>{en?'Decision-by-decision results · teaching indices':'逐項決策成果・教學指數'}</caption><thead><tr><th>{en?'Action / event':'決策／事件'}</th>{m.metrics.map((v,i)=><th key={i}>{t(v)}</th>)}</tr></thead><tbody>{run.rounds[index].actions.map((a,i)=>{
 const result=actionOutcome(run,index,i,now)!;
 // Incomplete runs report observed values, never the future projection.
 const done=a.ackAt!==undefined&&actionProgress(a,now)>=1;
 const after=done?result.after:valuesAt(run,index,now).map(Math.round);
 return <tr key={i}><th>{a.step===1?(en?'External event':'外部新事件'):t(m.options[a.step][a.choice].label)}{!done&&<small>{en?'Not completed':'尚未完成'}</small>}</th>{after.map((v,j)=><td key={j}><span>{result.before[j]} → {v}</span><MetricDelta value={v-result.before[j]} en={en}/></td>)}</tr>;
 })}</tbody></table>;
}
