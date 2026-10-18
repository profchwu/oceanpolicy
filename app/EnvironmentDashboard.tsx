import MetricDelta from './MetricDelta';
import type {Values} from '@/lib/news-missions';
import './environment-dashboard.css';
export default function EnvironmentDashboard({labels,values,before,after,budget,en,building}:{labels:string[];values:Values;before?:Values;after?:Values;budget:number;en:boolean;building:boolean}){
 return <section className="news-dashboard environment-dashboard" aria-label={en?'Environmental indicators':'環境指標'}>
 {values.map((value,i)=>{const change=before?Math.round(value)-before[i]:null,final=after&&before?after[i]-before[i]:0;return <article className="environment-card" key={i} data-direction={final>0?'up':final<0?'down':'same'}>
 <div className="environment-card-heading"><span>{labels[i]}</span><strong>{Math.round(value)}</strong></div>
 {before&&after&&<div className="environment-card-details"><span className="environment-card-range">{before[i]} → {after[i]}{building?<small>{en?' on completion':' 完成時'}</small>:null}</span><MetricDelta value={change!} en={en}/></div>}
 <div className="environment-card-track" role="progressbar" aria-label={labels[i]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)}><i style={{width:value+'%'}}/></div>
 </article>;})}
 <article className="environment-budget"><span>{en?'Budget':'剩餘預算'}</span><strong>{budget}</strong></article>
 </section>;
}
