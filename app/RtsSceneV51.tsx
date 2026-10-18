'use client';
import {useId} from 'react';
import type {World,Sector} from '@/lib/rts-world';
import {clamp} from '@/lib/rts-world';
import type {Language} from '@/lib/rts-model';
export default function RtsScene({world:w,focus,language,motion}:{world:World;focus:Sector|null;onSelect:(s:Sector)=>void;language:Language;motion:boolean}){
 const id=useId().replace(/:/g,''),en=language==='en';
 const turbines=[[1200,0,180,188],[1380,60,160,178],[1510,160,158,195]];
 const masks=[['grass',400,692,265,150],['reef',1070,713,255,120],['treatment',1071,465,90,78],['boats',1430,519,150,160],['work',1380,226,78,53]] as const;
 const plate=<image href="/island-developed-v51.png" width="1672" height="941"/>;
 return <div className={'rts-scene stable-island '+(motion?'animated':'quiet-world')} data-focus="all" data-water={w.water.toFixed(1)} data-power={w.power.toFixed(2)}>
 <svg viewBox="0 0 1672 941" role="img" aria-label={en?'Fixed island view. Buildings, water and habitats gradually change.':'固定全島視角，設施、水質與棲地逐漸改變。'}>
 <defs>
 <radialGradient id={'mud'+id}><stop stopColor="#8e784c" stopOpacity=".65"/><stop offset="1" stopColor="#a2a076" stopOpacity="0"/></radialGradient>
 <radialGradient id={'glow'+id}><stop stopColor="#ffe49c" stopOpacity=".7"/><stop offset="1" stopColor="#ffe49c" stopOpacity="0"/></radialGradient>
 <radialGradient id={'soft'+id}><stop offset=".68" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient>
 {masks.map(([name,x,y,rx,ry])=><mask id={name+id} key={name}><ellipse cx={x} cy={y} rx={rx} ry={ry} fill={'url(#soft'+id+')'}/></mask>)}
 {turbines.map(([x,y,width,height],i)=>{const p=clamp(w.turbines-i);return <clipPath id={'build'+id+i} key={i}><rect x={x} y={y+height*(1-p)} width={width} height={height*p}/></clipPath>;})}
 </defs>
 <g className="world-camera" transform="translate(0 0)">
 <image href="/island-clean-v5.png" width="1672" height="941"/>
 <g mask={'url(#boats'+id+')'}>{plate}</g>
 {turbines.map((_,i)=><g key={i} clipPath={'url(#build'+id+i+')'}>{plate}</g>)}
 {w.turbines>0&&<g mask={'url(#work'+id+')'} opacity={w.construction>.01?.9:.35}>{plate}</g>}
 <g mask={'url(#grass'+id+')'} opacity={clamp(w.meadow*1.3)} style={{filter:'saturate('+(.3+w.meadow)+')'}}>{plate}</g>
 <g mask={'url(#reef'+id+')'} opacity={.8} style={{filter:'saturate('+clamp(w.coral*1.6)+') brightness('+(1+(1-w.coral)*.3)+')'}}>{plate}</g>
 <g mask={'url(#treatment'+id+')'} opacity={clamp(w.treated)}>{plate}</g>
 <g opacity={clamp((85-w.water)/85)}><ellipse cx="1120" cy="685" rx="235" ry="110" fill={'url(#mud'+id+')'}/><ellipse cx="410" cy="700" rx="240" ry="110" fill={'url(#mud'+id+')'}/></g>
 {w.boundary>0&&<ellipse cx="1070" cy="715" rx="170" ry="70" fill="none" stroke="#e0d2ab" strokeWidth="2" strokeDasharray="6 14" opacity={w.boundary*.55}/>}
 {[[810,478],[882,496],[954,459]].map(([x,y],i)=><ellipse key={i} cx={x} cy={y} rx="24" ry="20" fill={'url(#glow'+id+')'} opacity={w.power}/>)}
 {w.power>.1&&<path className="electric-flow" d="M1065 555Q1210 560 1310 175" stroke="#f1dc97" strokeWidth="2.5" strokeDasharray="3 18" fill="none" opacity={w.power*.45}/>}
 {[0,1,2].map(i=><ellipse key={i} className="water-glint" cx={1230+i*110} cy={720-i*115} rx="17" ry="3" fill="none" stroke="#d9f6e6" strokeWidth="1.5" opacity=".2" style={{animationDelay:(i*-1.5)+'s'}}/>)}
 </g></svg>
 <div className="scene-label scene-wind" data-active={focus==='wind'}><span>{en?'Wind':'風場'}</span></div>
 <div className="scene-label scene-grass" data-active={focus==='grass'}><span>{en?'Meadow':'海草'}</span></div>
 <div className="scene-label scene-reef" data-active={focus==='reef'}><span>{en?'Reef':'珊瑚'}</span></div>
 <div className="map-credit">{en?'SIMULATED WORLD · TIME COMPRESSED':'教學海島・時間壓縮模擬'}</div>
 </div>;
}


