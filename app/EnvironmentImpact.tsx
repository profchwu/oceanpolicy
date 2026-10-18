import {useId} from 'react';
import type {Values} from '@/lib/news-missions';
import type {MapArea} from '@/lib/mission-maps';
/** Scene markers are tied to actual bounded model differences, never nominal deltas. */
export default function EnvironmentImpact({area,before,values,after,source,en,building}:{area:MapArea;before:Values;values:Values;after:Values;source:readonly number[];en:boolean;building:boolean}){
 const id='impact'+useId().replace(/:/g,'');
 const targets=area==='wind'?[[650,470],[1450,480],[1290,745]]:area==='grass'?[[650,240],[1300,510],[860,700]]:[[650,240],[1220,430],[1150,720]];
 const labels=en?['Power','Water',area==='reef'?'Coral':area==='grass'?'Seagrass':'Habitat']:['供電','水質',area==='reef'?'珊瑚健康':area==='grass'?'海草存活':'棲地'];
 const changed=after.map((n,i)=>n-before[i]);
 return <g className="policy-environment-focus" data-impact-phase={building?'changing':'complete'} pointerEvents="none">
 <defs><filter id={id+'shadow'} x="-30%" y="-50%" width="160%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#05262d" floodOpacity=".6"/></filter><linearGradient id={id+'panel'} x2="0" y2="1"><stop stopColor="#355d5b"/><stop offset="1" stopColor="#153a40"/></linearGradient></defs>
 <g transform={`translate(${source[0]} ${source[1]})`} filter={`url(#${id}shadow)`}><ellipse rx="35" ry="14" fill="#edce8b" fillOpacity=".25" stroke="#ffe4ab" strokeWidth="4"/><path d="M0-14V-64L34-53 0-40" fill="#e3ba70" stroke="#fff0cc" strokeWidth="3"/></g>
 {changed.map((change,i)=>{if(change===0)return null;const [x,y]=targets[i],color=change>0?'#9ce8bb':'#ffac89',current=Math.round(values[i]),actual=current-before[i];return <g key={i} data-impact-metric={i} data-impact-before={before[i]} data-impact-current={current} data-impact-after={after[i]}>
 <path className={building?'impact-causal-flow':''} d={`M${source[0]} ${source[1]}Q${x-100} ${y-180} ${x} ${y}`} fill="none" stroke="#092e37" strokeWidth="10" opacity=".6"/>
 <path className={building?'impact-causal-flow':''} d={`M${source[0]} ${source[1]}Q${x-100} ${y-180} ${x} ${y}`} fill="none" stroke={color} strokeWidth="5" strokeDasharray="10 20"/>
 <g transform={`translate(${x} ${y})`}>
 <ellipse cy="7" rx="180" ry="70" fill="#062e39" fillOpacity=".16" stroke="#153d42" strokeWidth="12"/>
 <ellipse rx="180" ry="70" stroke={color} strokeWidth="9" fill={color} fillOpacity=".10"/>
 <ellipse cy="-3" rx="178" ry="67" fill="none" stroke="#fff0d1" strokeWidth="2"/>
 {[0,1].map(n=><ellipse key={n} className={building?'impact-water-ripple':''} style={{animationDelay:`${n*.85}s`}} rx="180" ry="70" stroke={color} strokeWidth="4" fill="none" opacity=".45"/>)}
 <path d="M-179 0h24M179 0h-24M0-70v15M0 70V55" stroke="#fff4da" strokeWidth="5" strokeLinecap="round"/>
 </g>
 <g transform={`translate(${x-150} ${y+79})`}><rect width="300" height="88" rx="14" fill={`url(#${id}panel)`} filter={`url(#${id}shadow)`} stroke={color} strokeWidth="3"/><text x="150" y="33" textAnchor="middle" fill="#fff7de" fontSize="28" fontWeight="700">{labels[i]} {before[i]} → {current}</text><text x="150" y="69" textAnchor="middle" fill={color} fontSize="32" fontWeight="900">{change>0?'▲':'▼'} {actual>0?'+':''}{actual}{building?(en?(change>0?' improving':' worsening'):(change>0?' 改善中':' 惡化中')):''}</text></g>
 </g>;})}
 {changed.every(x=>x===0)&&<g transform={`translate(${Math.max(20,Math.min(1170,source[0]-240))} ${Math.min(810,source[1]+100)})`}><ellipse className={building?'impact-water-ripple':''} cx="240" cy="-80" rx="165" ry="65" fill="none" stroke="#edce8b" strokeWidth="6"/><rect width="480" height="70" rx="12" fill="#34372b" stroke="#efcb7d" strokeWidth="3"/><text x="240" y="46" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#ffe5ac">{en?'No environmental improvement':'環境數值未改善・壓力仍在'}</text></g>}
 </g>;
}
