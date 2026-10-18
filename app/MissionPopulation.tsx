import {memo,useId} from 'react';
import {MAPS,type MapArea} from '@/lib/mission-maps';
function Travel({path,duration,delay,motion}:{path:string;duration:number;delay:number;motion:boolean}){
 return motion?<animateMotion path={path} dur={`${duration}s`} begin={`${-delay}s`} repeatCount="indefinite" calcMode="linear" keyPoints="0;1;0" keyTimes="0;.5;1"/>:null;
}
const start=(path:string)=>{const p=path.match(/^M([\d.]+) ([\d.]+)/)!;return `translate(${p[1]} ${p[2]})`;};
// Warm upper-left sunlight and muted materials match the miniature island plate.
const colors=['#d5b780','#8dbbca','#eee1bb','#d49c7a','#a5c49a','#c4c8c0'];
function Person({i,worker=false,id}:{i:number;worker?:boolean;id:string}){return <g className="map-person-body">
 <ellipse cx="6" cy="3" rx="10" ry="3.2" transform="rotate(22 6 3)" fill={'url(#'+id+'shadow)'} />
 <g className="map-person-legs" strokeLinecap="round">
  <path d="M-2.5-8L-4 .5M2.5-8L4 0" stroke="#333f3c" strokeWidth="3.8"/>
  <path d="M-3-7L-4-1M2-7L3-2" stroke="#738074" strokeWidth="1.3"/>
  <ellipse cx="-4.5" cy="1" rx="3" ry="1.7" fill="#31342e"/><ellipse cx="4" cy=".3" rx="2.8" ry="1.6" fill="#31342e"/>
 </g>
 <path d="M-5-20Q0-24 5-20L5.8-9Q0-6-5-9Z" fill={worker?'#e2ba68':colors[i%6]}/>
 <path d="M-5-20Q-1-23 2-20L1-9-5-9Z" fill="#f4e7c4" opacity=".35"/>
 <path d="M3-21L5-20 5.8-9 1-8 1-20Z" fill="#3d4438" opacity=".17"/>
 <path d="M-3-18l2 8M-3-10l6 1" stroke="#eee1bc" strokeWidth=".6" opacity=".45"/>
 <g className={worker?'map-working-arm':'map-person-arms'} strokeLinecap="round">
  <path d="M-5-18l-2 5M5-18l3 5" stroke={worker?'#e2ba68':colors[i%6]} strokeWidth="4"/>
  <path d="M-7-13l1 4M8-13l-1 4" stroke={'url(#'+id+'skin)'} strokeWidth="2.8"/>
 </g>
 <ellipse cy="-23" rx="4" ry="4.6" fill={'url(#'+id+'skin)'}/>
 <ellipse cx="-.6" cy="-25.8" rx="4.5" ry="3" fill={worker?'#c8b889':i%3?'#655849':'#92806a'}/>
 <path d="M-4-26Q-1-29 3-26" fill="none" stroke={worker?'#f1e3b6':'#a08b6a'} strokeWidth="1"/>
 {worker&&<><ellipse cy="-24.5" rx="5.3" ry="1.6" fill="#bca674"/><path d="M-4-15h8" stroke="#e5ce8d" strokeWidth="1.4"/><path d="M7-6l7-2 4 3v8l-8 2-3-3Z" fill={'url(#'+id+'wood)'}/><path d="M7-6l4 3 7-2M11-3v8" fill="none" stroke="#d0b48a" strokeWidth=".7"/></>}
 </g>;}
function Car({i,id}:{i:number;id:string}){return <g className="map-car-body">
 <ellipse cx="5" cy="6" rx="26" ry="8" fill={'url(#'+id+'shadow)'}/>
 <g fill="#252f2e" stroke="#68716a" strokeWidth=".7"><ellipse cx="-13" cy="3" rx="4" ry="5"/><ellipse cx="16" cy="-1" rx="4" ry="5"/></g>
 <path d="M-25-12L6-21 25-10 24 1-7 10-25-1Z" fill={colors[i%6]} stroke="#454f45" strokeWidth=".6"/>
 <path d="M-25-12L6-21 25-10-7 0Z" fill={'url(#'+id+'roof)'}/>
 <path d="M-25-12L-7 0V10L-25-1Z" fill="#34433d" opacity=".22"/>
 <path d="M-7 0L25-10 24 1-7 10Z" fill={'url(#'+id+'shade)'}/>
 <path d="M-12-12L-7-24 6-28 18-20 21-9-3-2Z" fill={colors[i%6]} stroke="#4e574b" strokeWidth=".7"/>
 <path d="M-7-24L6-28 17-21 3-17Z" fill={'url(#'+id+'roof)'}/>
 <path d="M4-16L16-20 19-11 5-7Z" fill={'url(#'+id+'glass)'}/>
 <path d="M-6-22L1-17 1-8-10-14Z" fill="#415b60"/>
 <path d="M5-15l10-3M-5-21l5 4" stroke="#c0d5ce" strokeWidth="1" opacity=".8"/>
 <path d="M3-5v9M14-9v9" stroke="#44584f" strokeWidth=".7" opacity=".7"/>
 <path d="M6-4l3-1M17-7l3-1" stroke="#dbd8bf" strokeWidth="1"/>
 <path d="M-23-1l4 2M20 1l4-1" stroke="#ddd4ae" strokeWidth="2.2"/>
 <path d="M-24 2l17 7 30-9" fill="none" stroke="#727b6a" strokeWidth="1.5"/>
 <g fill="#9b9d89"><ellipse cx="-13" cy="4" rx="1.8" ry="2.7"/><ellipse cx="16" cy="0" rx="1.8" ry="2.7"/></g>
 </g>;}
function Boat({i,id}:{i:number;id:string}){return <g className="harbor-hull">
 <ellipse cy="10" rx="43" ry="11" fill="#173e47" opacity=".28"/>
 <path d="M-40-4Q-13-18 44-7Q39 6 24 16L-25 15Q-36 9-40-4Z" fill={i%2?'#65594a':'#4f696a'} stroke="#355254" strokeWidth="1"/>
 <path d="M-39-4Q0-17 44-7L25 6-28 6Z" fill={'url(#'+id+'deck)'}/>
 <path d="M-34-3L-24 3 23 4 35-5" fill="none" stroke="#e3d6ae" strokeWidth="1.3"/>
 <path d="M-25 9L23 11 38 0" stroke="#c5c6aa" strokeWidth="2" fill="none"/>
 <path d="M-8-22L11-27 23-18 23 0 3 7-8-2Z" fill="#a9b6a4"/>
 <path d="M-8-22L3-14V7L-8-2Z" fill="#647875"/>
 <path d="M-11-23L11-29 26-19 3-12Z" fill={'url(#'+id+'roof)'}/>
 <path d="M6-12l13-4v9L6-3Z" fill={'url(#'+id+'glass)'}/>
 <path d="M11-13v8" stroke="#d8dcc2" strokeWidth="1"/>
 <path d="M-5-18l5 4v8l-5-4Z" fill="#354d54"/>
 <path d="M-22 1v-31M-27-27h17" stroke="#7d7256" strokeWidth="1.6"/>
 <path d="M-22-28L-34 0M-22-28L-7 2" stroke="#d7d3b3" strokeWidth=".6"/>
 <ellipse cx="-21" cy="0" rx="6" ry="3" fill="#96794f"/><ellipse cx="-21" cy="0" rx="3.5" ry="1.5" fill="#64573f"/>
 <g fill="#263c3f"><ellipse cx="-26" cy="10" rx="2.6" ry="3.2"/><ellipse cx="9" cy="12" rx="2.6" ry="3.2"/></g>
 </g>;}
function MissionPopulation({area,motion}:{area:MapArea;motion:boolean}){const map=MAPS[area],id='population'+useId().replace(/:/g,'');return <g aria-hidden="true" className="mission-population">
 <defs>
 <radialGradient id={id+'shadow'}><stop stopColor="#203127" stopOpacity=".24"/><stop offset="1" stopColor="#203127" stopOpacity="0"/></radialGradient>
 <radialGradient id={id+'skin'} cx="30%" cy="20%"><stop stopColor="#e2c49b"/><stop offset=".6" stopColor="#dfb690"/><stop offset="1" stopColor="#bd9676"/></radialGradient>
 <linearGradient id={id+'roof'} x2=".8" y2="1"><stop stopColor="#fff5db"/><stop offset=".45" stopColor="#e0e3cf"/><stop offset="1" stopColor="#b5c5b5"/></linearGradient>
 <linearGradient id={id+'shade'} x2="0" y2="1"><stop stopColor="#263c37" stopOpacity="0"/><stop offset="1" stopColor="#263c37" stopOpacity=".24"/></linearGradient>
 <linearGradient id={id+'glass'} x2=".3" y2="1"><stop stopColor="#9bb9b5"/><stop offset=".35" stopColor="#577b80"/><stop offset=".4" stopColor="#34555e"/><stop offset="1" stopColor="#263e45"/></linearGradient>
 <linearGradient id={id+'wood'}><stop stopColor="#c1a074"/><stop offset="1" stopColor="#766044"/></linearGradient>
 <linearGradient id={id+'deck'} x2=".2" y2="1"><stop stopColor="#d0c6a5"/><stop offset="1" stopColor="#948c6b"/></linearGradient>
 </defs>
 {Array.from({length:60},(_,i)=>{const path=map.walk[i%6];return <g key={i} className="map-walker" transform={motion?undefined:start(path)}><Travel path={path} duration={22+i%7*1.7} delay={(i*.6180339%1)*(22+i%7*1.7)} motion={motion}/><g transform={`translate(${(Math.floor(i/6)%2)*7} ${Math.floor(i/6)%3*4}) scale(${i%7===0?.95:1.15})`}><Person i={i+Math.floor(i/6)} id={id}/></g></g>;})}
 {map.workers.flatMap(([x,y])=>[[x,y],[x+17,y+5]]).map(([x,y],i)=><g key={i} className="map-worker" transform={`translate(${x} ${y})`}><g><Travel path="M0 0L10 4" duration={7+i%3} delay={i*1.7} motion={motion}/><g transform="scale(1.1)"><Person i={i} worker id={id}/></g></g></g>)}
 {Array.from({length:15},(_,i)=>{const path=map.roads[i%3];return <g key={i} className="map-vehicle" transform={motion?undefined:start(path)}><Travel path={path} duration={22+i%3*4} delay={(Math.floor(i/3)+.2)*(22+i%3*4)/5} motion={motion}/><g transform={`translate(0 -7) scale(${i%3===0?.9:.75})`}><Car i={i} id={id}/></g></g>;})}
 {map.boats.flatMap(path=>[path,path]).map((path,i)=><g key={i} className="map-boat" transform={motion?undefined:start(path)}><Travel path={path} duration={32+Math.floor(i/2)*5} delay={(i%2*.5+.12)*(32+Math.floor(i/2)*5)} motion={motion}/><path className="boat-wake" d="M-46 10q-32 8-60 0M-47 18q-34 9-58 3" stroke="#d9efe9" strokeWidth="3" fill="none" opacity=".5"/><g transform="scale(.85)"><Boat i={i} id={id}/></g></g>)}
 {Array.from({length:10},(_,i)=><g key={i} transform={`translate(${100+i*150} ${75+i%3*56})`}><path className="coastal-bird" d="M-13 0q7-9 13 0 7-9 13 0" stroke="#f2eed7" strokeWidth="3" fill="none" style={{animationDelay:-i*1.7+'s'}}/></g>)}
 </g>;}

// Keep ambient animation nodes stable while the game clock updates policy metrics.
export default memo(MissionPopulation);
