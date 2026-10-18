'use client';
import {useId} from 'react';
import type {IslandState,IslandKind} from '@/lib/island-simulation';
import type {Language,Variable} from '@/lib/behavior-model';
export default function IslandScene({kind='wind',world,language='zh-Hant',choice,variable,phase='pre'}:{kind?:IslandKind;world?:IslandState;language?:Language;choice?:string;variable?:Variable;phase?:string}){
 const id=useId().replace(/:/g,'');const en=language==='en';const training=!!world;
 const deployed=!!choice;const selected=choice==='a'?0:choice==='b'?1:2;
 const turbines=world?world.turbines:kind!=='wind'?0:variable==='policy'?(deployed&&choice==='b'?3:0):(deployed&&selected===0&&variable==='adapt'?4:3);
 const power=world?world.power:variable==='monitor';
 const cable=world?world.cable:kind==='wind'&&deployed&&variable==='adapt'&&choice==='b';
 const pollution=world?world.pollution:kind==='grass'?3:kind==='reef'&&deployed&&choice==='c'&&variable==='policy'?0:2;
 const grass=world?world.grass:deployed&&kind==='grass'?choice==='a'?5:choice==='b'?2:0:1;
 const monitor=world?world.monitor:variable==='monitor'&&deployed;
 const coral=world?world.coral:1;
 const survey=world?world.survey:deployed&&variable==='policy'&&((kind==='wind'&&choice==='a')||(kind==='grass'&&choice==='b'));
 const label=(zh:string,eng:string)=>en?eng:zh;
 return <div className={`living-island ${kind} ${deployed?'deployed':''}`} data-scene={kind} data-moves={world?.moves.join(',')||choice||'initial'}>
 <div className="island-topline"><span><i/>{label('海島實況','ISLAND VIEW')}</span><span>{training?label('政策模擬','POLICY SIMULATION'):label('任務部署','MISSION DEPLOYMENT')}</span></div>
 <svg viewBox="0 0 900 540" role="img" aria-label={label(`${kind==='wind'?'風場與城鎮':kind==='grass'?'海草與河口':'珊瑚與海岸'}場景，已部署 ${world?.moves.length||Number(deployed)} 個行動`,`${kind==='wind'?'Wind farm and town':kind==='grass'?'Seagrass and estuary':'Reef and coast'} scene, ${world?.moves.length||Number(deployed)} actions deployed`)}>
 <defs>
 <linearGradient id={`sky${id}`} x2="0" y2="1"><stop stopColor={kind==='wind'?'#0b1d49':kind==='grass'?'#17394b':'#58364a'}/><stop offset="1" stopColor={kind==='wind'?'#e8a773':kind==='grass'?'#9ec9b6':'#efbb83'}/></linearGradient>
 <linearGradient id={`sea${id}`} x2="0" y2="1"><stop stopColor={pollution>2?'#587f73':'#288c9a'}/><stop offset="1" stopColor={kind==='reef'?'#061c42':'#082f49'}/></linearGradient>
 <pattern id={`grid${id}`} width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0V50" fill="none" stroke="#9bf5ed" strokeOpacity=".05"/></pattern>
 </defs>
 <rect width="900" height="540" fill={`url(#sky${id})`}/><circle cx={kind==='wind'?740:140} cy="99" r="40" fill="#ffe6ac" opacity=".7"/>
 <path d={phase==='post2'?'M0 230L120 95L240 222L340 112L500 234H900V340H0Z':'M0 229L105 160L167 213L300 118L410 221L600 170L730 230H900V340H0Z'} fill="#1d4357"/><path d="M0 246L115 203L236 254L366 204L590 257L760 208L900 247V350H0Z" fill="#30606a"/>
 <path d="M0 271Q250 249 450 276T900 270V540H0Z" fill={`url(#sea${id})`}/><rect y="280" width="900" height="260" fill={`url(#grid${id})`}/>
 {[290,320,350].map((y,i)=><path className="water-line" key={y} d={`M${20+i*90} ${y}h140m100 0h120m110 0h150`} stroke="#9aeadd" strokeWidth="2" opacity=".22"/>)}
 <path d="M0 294Q50 225 155 249L235 281Q290 304 213 331L51 345L0 327Z" fill="#cbb98c"/><path d="M0 284Q82 229 176 262L230 289L167 309L0 318Z" fill="#3c796d"/>
 {[30,75,118,161].map((x,i)=><g key={x} transform={`translate(${x} ${265-i%2*16})`}><rect width="30" height="36" rx="2" fill="#57768a"/><path d="M-4 0L15-17L34 0" fill="#adc7ca"/>{[6,19].map(v=><rect key={v} x={v} y="9" width="6" height="10" fill={power||cable?'#ffe18b':'#203c4b'}/>)}</g>)}
 {world?.battery&&<g className="build-in" transform="translate(200 269)"><rect width="35" height="46" rx="4" fill="#73dbca" stroke="#dbfff8"/><path d="M19 6L9 25H22L13 40" fill="none" stroke="#164c59" strokeWidth="4"/></g>}
 {kind==='wind'&&<>
 <path d="M185 324Q369 431 555 343T771 355" fill="none" stroke={cable||power?'#7cffe3':'#456479'} strokeWidth={cable||power?7:3} strokeDasharray={cable||power?'12 9':'4 10'} className={cable||power?'current-flow':''}/>
 {Array.from({length:turbines},(_,i)=><g key={i} className="build-in" transform={`translate(${415+i*114} ${312+i%2*38})`}><ellipse cy="22" rx="36" ry="10" fill="#072d42" opacity=".45"/><path d="M-6 20L-3-111H3L6 20Z" fill="#c6e5e8"/><g className={power||cable?'rotor active-rotor':'rotor'} style={{transformOrigin:'0px -111px'}}><path d="M0-111L-5-183Q6-182 7-158L3-113L61-78Q52-71 38-85L0-107L-53-70Q-57-81-36-92Z" fill="#eefbfa"/><circle cy="-111" r="7" fill="#5cabb5"/></g></g>)}
 {!turbines&&<g opacity=".5" stroke="#91d9da" fill="none" strokeDasharray="7 8"><ellipse cx="500" cy="341" rx="80" ry="30"/><ellipse cx="698" cy="340" rx="80" ry="30"/></g>}
 {world?.event&&<g transform="translate(678 60)" fill="#355773"><ellipse rx="62" ry="24"/><circle cx="-25" cy="-17" r="26"/><circle cx="19" cy="-24" r="31"/><path d="M-13 34l-15 28h25l-9 27" stroke="#ffc884" strokeWidth="6" fill="none"/></g>}
 </>}
 {kind!=='wind'&&<>
 <path d="M0 412Q150 389 298 446T595 427T900 419V540H0Z" fill={kind==='grass'?'#295651':'#1e3550'}/>
 {pollution>0&&<g className="pollution-plume" opacity={pollution*.16}><path d="M160 303Q356 310 445 406T890 441L875 516Q405 494 344 440T124 341Z" fill="#c0ab72"/>{[0,1,2,3].map(i=><circle key={i} cx={240+i*120} cy={350+i*25} r={25+i*9} fill="#e0c187"/>)}</g>}
 {kind==='grass'&&Array.from({length:grass*5},(_,i)=><g key={i} transform={`translate(${120+(i*91)%680} ${433+(i%3)*24})`}><path className="grass-blade" d="M0 33Q-28 0-13-40Q-1-15 0 16Q4-33 25-52Q29-12 3 33" fill={pollution>2?'#768861':'#54d4a8'} stroke="#9aebbd" strokeWidth="2"/></g>)}
 {kind==='reef'&&[200,355,510,685,794].map((x,i)=><g key={x} transform={`translate(${x} ${450+(i%2)*28})`}><path className="coral-branch" d="M0 40V-53M0 11L-29-12V-35M0 20L34-10V-41M0-23L17-39V-56M-29-13L-43-27M34-9L48-24" stroke={i<coral?['#f39798','#d596d7'][i%2]:'#d7d8c7'} strokeWidth="12" strokeLinecap="round" fill="none"/></g>)}
 {(pollution<2?Array.from({length:8},(_,i)=>i):[0,1]).map(i=><g className="reef-fish" key={i} transform={`translate(${170+i*81} ${365+i%3*24})`}><ellipse rx="13" ry="6" fill={i%2?'#ffd283':'#91e9e0'}/><path d="M-10 0L-20-8V8Z" fill="#8bded4"/><circle cx="7" cy="-1" r="1.5" fill="#0a3244"/></g>)}
 {pollution===0&&<g className="build-in" transform="translate(112 306)"><rect width="78" height="24" rx="7" fill="#b1ece0"/><circle cx="20" cy="12" r="8" fill="#3495a0"/><circle cx="55" cy="12" r="8" fill="#3495a0"/><path d="M78 12h28v25" stroke="#7af0d2" strokeWidth="8" fill="none"/></g>}
 {kind==='reef'&&<g fill="#ffba80" opacity=".9"><path d="M752 180q-17 14 0 28t0 28m24-56q-17 14 0 28t0 28m24-56q-17 14 0 28t0 28" stroke="#ffbb89" strokeWidth="5" fill="none"/><text x="706" y="285" fontSize="16">{label('熱壓力持續','HEAT PERSISTS')}</text></g>}
 {world?.patrol&&<path d="M104 397Q420 325 841 388V497H90Z" fill="none" stroke="#8fe5d7" strokeWidth="3" strokeDasharray="10 9"/>}
 </>}
 {survey&&<g className="survey-grid" fill="#89f0df" fillOpacity=".12" stroke="#a0f7e4" strokeWidth="2" strokeDasharray="7 5"><path d="M300 300L661 280L798 384L356 423Z"/>{[370,490,610].map(x=><circle key={x} cx={x} cy="351" r="22"/>)}</g>}
 {monitor&&[290,555,780].map(x=><g key={x} className="build-in" transform={`translate(${x} 340)`}><ellipse rx="18" ry="7" fill="#ffce84"/><path d="M0 0v-46m-16 7q16-24 32 0m-23-7q7-11 14 0" stroke="#97f1e6" strokeWidth="3" fill="none"/><circle cy="-48" r="4" fill="#fff2ac"/></g>)}
 {world?.moves.includes('report')&&<g className="build-in" transform="translate(254 257)"><rect width="62" height="76" rx="5" fill="#e2e8d8"/><path d="M10 17h41m-41 14h41m-41 14h29" stroke="#427f86" strokeWidth="5"/><text x="31" y="65" textAnchor="middle" fill="#274e65" fontSize="13">CO₂ ?</text></g>}
 {world?.moves.includes('shade')&&<g className="build-in"><path d="M469 340L613 330L655 369L494 379Z" fill="#6ea8b5" fillOpacity=".65" stroke="#b2e2dd" strokeWidth="3"/><path d="M479 347v72m152-67v74" stroke="#abcbd1" strokeWidth="4"/></g>}
 {world?.moves.includes('tourism')&&<g className="build-in"><path d="M210 292L361 340L350 365L199 315Z" fill="#c99e78"/><path d="M238 320v35m55-18v35m54-18v35" stroke="#b49377" strokeWidth="6"/><circle cx="282" cy="325" r="7" fill="#f4d98b"/></g>}
 {deployed&&!training&&<g className="command-vessel" transform={`translate(${340+selected*170} 380)`}><path d="M-32 0H33L17 17H-21Z" fill="#e0f3e9"/><rect x="-13" y="-14" width="28" height="14" fill="#ffca82"/><path d="M-42 21h75" stroke="#a8ece4" strokeWidth="2"/><text textAnchor="middle" y="48" fill="#e8fff7" fontSize="15">{label('已派遣','DEPLOYED')} {selected+1}</text></g>}
 <rect x="20" y="487" width="260" height="32" rx="16" fill="#082637" fillOpacity=".88"/><text x="36" y="508" fill="#b0dbd8" fontSize="13">{label('虛構海島 · 時間壓縮示意','FICTIONAL ISLAND · TIME COMPRESSED')}</text>
 </svg>
 </div>;
}
