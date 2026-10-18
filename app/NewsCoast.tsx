'use client';
import EnvironmentImpact from './EnvironmentImpact';
import EnvironmentArtwork from './EnvironmentArtwork';
import {useId} from 'react';
import {MAPS,type MapArea} from '@/lib/mission-maps';
import MissionPopulation from './MissionPopulation';
import PolicyArtwork from './PolicyArtwork';
import {environmentView} from '@/lib/environment-view';
import {policyScene,type PolicyEffect} from '@/lib/policy-scene';
import type {Values} from '@/lib/news-missions';
import type {Choice} from '@/lib/crisis';
export default function NewsCoast({area,values,choice,progress,works,motion,en,event,delta,phase,effects,step,before,after}:{before?:Values;after?:Values;area:MapArea;values:Values;choice?:Choice;progress:number;works:{barrier:number;filter:number;plant:number;grid:number;dredge:number};motion:boolean;en:boolean;event:boolean;delta?:Values;phase?:string;effects:PolicyEffect[];step:number}){
 const id=useId().replace(/:/g,''),reef=area==='reef',wind=area==='wind',map=MAPS[area],health=values[2]/100,mud=1-values[1]/100;
 const neutral=!!delta&&delta.every(n=>n===0),harmful=!!delta?.some(n=>n<0),water=values[1]/100,power=values[0]/100;
 const env=environmentView(area,values,effects,event);
 const interventionProgress=Math.max(0,...effects.filter(e=>e.step!==1).map(e=>e.progress)),intervened=interventionProgress>0;
 const scene=policyScene(area,choice,step),[x,y]=scene.point;
 const tint=harmful?'#ff865c':neutral?'#efca78':'#9df4ce';
 return <div className={'rts-scene news-coast '+(motion?'animated':'quiet-world')} data-scene={area} data-water={values[1]} data-health={values[2]}>
 <svg viewBox="0 0 1672 941" role="img" aria-label={`${map.title[en?1:0]} · ${en?'Walking residents, workers, traffic, boats and policy effects':'步行居民、作業人員、車輛、船隻與政策效果'}`}>
 <defs><radialGradient id={'reef-feather'+id}><stop offset=".6" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient><mask id={'reef-health'+id}><ellipse cx="1030" cy="640" rx="470" ry="220" fill={'url(#reef-feather'+id+')'}/></mask><filter id={'reef-pale'+id}><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.3" intercept=".12"/><feFuncG type="linear" slope="1.3" intercept=".12"/><feFuncB type="linear" slope="1.3" intercept=".12"/></feComponentTransfer></filter><radialGradient id={'coast-mud'+id}><stop stopColor="#84572b" stopOpacity="1"/><stop offset="1" stopColor="#927e4f" stopOpacity="0"/></radialGradient><linearGradient id={'coast-health'+id}><stop stopColor={reef?'#fff2dc':'#a89b61'} stopOpacity=".2"/><stop offset="1" stopColor={reef?'#fff8ed':'#9d945f'} stopOpacity=".75"/></linearGradient><clipPath id={'coast-water'+id}><path d={map.water}/></clipPath></defs>
 <image href={'/mission-'+area+'-v2.png'} width="1672" height="941"/>
 <EnvironmentArtwork area={area} values={values}/>

 <g clipPath={'url(#coast-water'+id+')'}>

 {Array.from({length:32},(_,i)=><path key={i} className="sea-glint" d={`M${40+i%5*330} ${200+Math.floor(i/5)*110}q30-12 60 0t60 0`} fill="none" stroke="#dbf7e5" strokeWidth="4" opacity=".45" style={{animationDelay:-i*.5+'s'}}/>)}
 {Array.from({length:12},(_,i)=><g key={i} className="fish-school" style={{animationDelay:-i*.6+'s'}} opacity={.45}><path d={`M${200+i*105} ${reef?560+i%3*65:755+i%3*28}q12-8 25 0-13 8-25 0l-7-5v10Z`} fill="#dfcf95"/></g>)}
 </g>
 {wind&&<g className="power-neighborhood">
 <path d="M1380 560Q1260 640 1120 560L997 470 893 388" stroke="#112d3b" strokeWidth="20" fill="none"/>
 <path className={env.powerFlow?"obvious-power-flow":undefined} d="M1380 560Q1260 640 1120 560L997 470 893 388" stroke={env.cableFailed?'#bba18a':'#ffe393'} strokeWidth="12" strokeDasharray="24 16" opacity={.35+power*.65} fill="none"/>
 {env.cableFailed&&<g data-cable-fault="true" opacity={1-env.repairProgress*.7} transform="translate(1130 570)"><circle r="36" fill="#b54032" stroke="#ffe0a3" strokeWidth="5"/><path d="m-15-15 30 30m0-30-30 30" stroke="white" strokeWidth="8"/></g>}
 </g>}
 <PolicyArtwork area={area} effects={effects}/>
 <MissionPopulation key={area} area={area} motion={motion}/>
 {wind&&<><path className={env.powerFlow?"mission-electric":undefined} d="M1380 560Q1260 640 1120 560L997 470 893 388" fill="none" stroke="#f5da86" strokeWidth="6" strokeDasharray="10 14" opacity={env.powerFlow?values[0]/100:0}/>{[[450,413],[548,385],[660,428],[835,466]].map(([lx,ly],i)=><circle key={i} className="village-light" cx={lx} cy={ly} r="13" fill="#fff0a0" opacity={values[0]/100*.6}/>)}
 {Array.from({length:6},(_,i)=><g key={i} transform={`translate(${840+i*29} ${427+i*10})`} opacity={Math.max(0,Math.min(1,works.grid*6-i))}><path d="M0 0v-43M-10-34h20" stroke="#806b48" strokeWidth="5"/><path d="M0-35q14 10 29 10" stroke="#efdb9a" strokeWidth="2.5" fill="none"/></g>)}</>}
 {reef&&event&&<g className="heat-haze" stroke="#eaa171" strokeWidth="5" fill="none" opacity=".65">{[0,1,2].map(i=><path key={i} d={`M${1000+i*130} 740q-20-25 0-50t0-50`}/>)}</g>}
 {phase==='building'&&choice&&!['evidence','count'].includes(choice)&&<g data-policy-target={`${area}-${step}-${choice}`}><ellipse className="impact-halo" style={{transformOrigin:`${x}px ${y}px`}} cx={x} cy={y} rx={wind&&choice==='grid'?180:220} ry="100" fill={tint} fillOpacity=".06" stroke={tint} strokeWidth="6" strokeDasharray="18 12"/></g>}
 {phase==='building'&&intervened&&before&&after&&step!==1&&<EnvironmentImpact area={area} before={before} after={after} values={values} source={scene.point} en={en} building={phase==='building'}/>}
 </svg><div className="coast-caption">{map.title[en?1:0]}</div><div className="map-credit">{en?'AI SCENERY · SIMULATED EFFECTS':'AI 場景・模擬環境效果'}</div>
 </div>;
}
