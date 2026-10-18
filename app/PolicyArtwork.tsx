'use client';
import {useId} from 'react';
import type {MapArea} from '@/lib/mission-maps';
import type {PolicyEffect} from '@/lib/policy-scene';
import {policyLayers} from '@/lib/policy-art';
/** Raster policy interventions are local. Numerical environmental art remains below. */
export default function PolicyArtwork({area,effects}:{area:MapArea;effects:PolicyEffect[]}){
 const id=useId().replace(/:/g,''),layers=policyLayers(area,effects);
 return <g className="policy-artwork">{layers.map((a,i)=>{
 const [x,y,w,h]=a.box,p=a.progress,mask=`policy-art-${id}-${i}`;
 // Later treatment replaces earlier treatment continuously; unrelated works persist.
 const next=layers.slice(i+1).find(b=>b.channel===a.channel),opacity=next?1-next.progress:1;
 return <g key={a.key} data-policy-art={a.key} data-art-progress={p} opacity={opacity}>
 <defs><filter id={mask+'-soft'} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter><mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="1672" height="941"><g filter={`url(#${mask}-soft)`}>
 {a.key==='reef-0-dredge'?<path d="M1080 245L1120 205L1175 220L1210 235L1255 245L1290 275L1280 310L1140 290Z" fill="white" opacity={p}/>:
 a.key==='reef-0-hold'?<path d="M1090 525Q1130 445 1340 455Q1590 450 1620 585Q1660 780 1070 845" fill="none" stroke="white" strokeWidth="25" pathLength="1" strokeDasharray="1" strokeDashoffset={1-p}/>:
 a.mode==='plant'?Array.from({length:9},(_,j)=>{const q=Math.max(0,Math.min(1,p*3-j%3));return <rect key={j} x={x+j%3*w/3} y={y+Math.floor(j/3)*h/3} width={w/3} height={h/3} fill="white" opacity={q}/>;}):
 <rect x={x} y={a.mode==='build'?y+h*(1-p):y} width={w} height={a.mode==='build'?h*p:h} rx="16" fill="white" opacity={a.mode==='build'?1:p}/>}
 </g></mask></defs>
 <image href={a.image} width="1672" height="941" preserveAspectRatio="none" mask={`url(#${mask})`}/>
 {p<1&&a.mode==='build'&&<path d={`M${x} ${y+h*(1-p)}h${w}`} stroke="#ffe3a0" strokeWidth="3" opacity=".65"/>}
 {p<1&&a.mode==='flow'&&<path d={`M${x+w*.25} ${y+h*.5}q${w*.3} ${h*.3} ${w*.55} 0`} fill="none" stroke={a.key.endsWith('dredge')?'#ad7846':'#b8f4ed'} strokeWidth="5" strokeDasharray="8 22" strokeDashoffset={-p*180}/>}
 </g>;
 })}</g>;
}
