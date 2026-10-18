'use client';
import {policyScene} from '@/lib/policy-scene';
import type {MapArea} from '@/lib/mission-maps';
import type {Values,NewsOption,Bi} from '@/lib/news-missions';
export default function PolicyEvolution({option,before,values,progress,en,building,metrics,area,step}:{option:NewsOption;before:Values;values:Values;progress:number;en:boolean;building:boolean;metrics:Bi[];area:MapArea;step:number}){
 const t=(v:Bi)=>v[en?1:0],negative=option.delta.some(n=>n<0),neutral=option.delta.every(n=>n===0),p=Math.round(progress*100);
 const scene=policyScene(area,option.visual,step),phases=en?scene.en:scene.zh;
 return <div className={'policy-evolution '+(negative?'effect-negative':neutral?'effect-neutral':'effect-positive')} aria-label={en?'Policy implementation and environmental change':'政策進度與環境變化'}>
 <div className="evolution-heading"><span>{building?(en?'LIVE POLICY EFFECT':'政策執行進度'):en?'POLICY RESULT':'政策執行結果'}</span><strong>{building?`${p}%`:'✓ 100%'}</strong></div>
 <div className="evolution-track" role="progressbar" aria-label={en?'Policy progress':'政策執行進度'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}><i style={{width:p+'%'}}/></div>
 <div className="evolution-phases">{phases.map((x,i)=><span className={progress>=[0,.35,.8][i]?'reached':''} key={i}>{progress>=[0,.35,.8][i]?'●':'○'} {x}</span>)}</div>
 <div className="evolution-values">{values.map((v,i)=><div key={i} className={Math.round(v)<Math.round(before[i])?'negative':Math.round(v)>Math.round(before[i])?'positive':'unchanged'}><span>{t(metrics[i])}</span><b>{Math.round(before[i])} <small>→</small> {Math.round(v)}</b><em>{Math.round(v)===Math.round(before[i])?(en?'Unchanged':'維持不變'):`${v-before[i]>=0?'+':''}${Math.round(v)-Math.round(before[i])}`}</em></div>)}</div>
 <small className="evolution-note">{neutral?(en?'No physical action: the existing problem remains.':'沒有實體改善措施：原本的問題仍然存在。'):en?'Animated teaching indices · not real-time ecological recovery':'教學指數動畫・不代表生態能在五秒內恢復'}</small>
 </div>;
}
