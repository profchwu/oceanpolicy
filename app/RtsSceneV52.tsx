'use client';
import {useId} from 'react';
import {IslandResidents,OceanSurface,HarborLife} from './IslandLife';
import type {World,Sector,currentProject} from '@/lib/rts-world';
import {clamp} from '@/lib/rts-world';
import type {Language} from '@/lib/rts-model';
type Project=ReturnType<typeof currentProject>;
export default function RtsScene({world:w,focus,language,motion,project}:{world:World;focus:Sector|null;onSelect:(s:Sector)=>void;language:Language;motion:boolean;project?:Project}){
 const id=useId().replace(/:/g,''),en=language==='en',pollution=clamp(1-w.water/85);
 const turbines=[[1307,69,1200,0,180,188],[1463,118,1380,60,160,178],[1581,228,1510,160,158,195]];
 const masks=[['reef',1070,713,270,135],['treatment',1071,465,92,78],['boat1',1470,459,55,43],['boat2',1387,598,62,42],['work',1380,226,78,53]] as const;
 const plate=<image href="/island-developed-v51.png" width="1672" height="941"/>;
 const grassPatches=[[275,647,105,66],[440,638,115,70],[370,745,150,62],[535,760,105,58]];
 const progress=project&&!project.noBuild?project.progress:null;
 const stage=progress===null?null:Math.min(2,Math.floor(progress*3));
 let stages=focus==='wind'?(en?['Foundation','Tower & blades','Grid connection']:['基座施工','塔架與葉片','接通電網']):focus==='grass'?(en?['Mark plots','Plant in patches','Track survival']:['劃定樣區','分區種植','追蹤存活']):(en?['Build treatment','Start filtering','Track water']:['建置設施','啟動處理','追蹤水質']);
 const actionIndex=project?Number(project.a.id.split('-')[1]):-1;
 if(project&&actionIndex%3===2)stages=focus==='wind'?(en?['Inspect cable','Repair delivery','Track power']:['檢查海纜','修復送電','追蹤供電']):focus==='grass'?(en?['Control runoff','Restore light','Track survival']:['攔截泥水','恢復光照','追蹤存活']):(en?['Maintain controls','Reduce stress','Track coral']:['維持治理','降低壓力','追蹤珊瑚']);
 if(project&&actionIndex===6&&project.a.choice==='a')stages=en?['Prepare site','Visitor works','Track impacts']:['工地準備','遊憩設施','追蹤衝擊'];
 if(progress===1)stages=stages.map(()=>en?'Work complete · observe effects':'作業完成・觀察環境');
 return <div className={'rts-scene stable-island living-island '+(motion?'animated':'quiet-world')} data-focus="all" data-water={w.water.toFixed(1)} data-meadow={w.meadow.toFixed(2)} data-coral={w.coral.toFixed(2)} data-power={w.power.toFixed(2)}>
 <svg viewBox="0 0 1672 941" role="img" aria-label={en?'Living island: walking residents, village vehicles, flowing ocean, shoreline surf, moving boats, wind turbines, pollution, seagrass and coral.':'持續運作的海島：步行居民、村莊車輛、流動海面、岸邊浪花、船隻、風機、污水、海草與珊瑚。'}>
 <defs>
 <radialGradient id={'mud'+id}><stop stopColor="#624b21" stopOpacity=".93"/><stop offset=".55" stopColor="#858137" stopOpacity=".68"/><stop offset="1" stopColor="#aea254" stopOpacity="0"/></radialGradient>
 <radialGradient id={'glow'+id}><stop stopColor="#fff2a5"/><stop offset="1" stopColor="#ffe49c" stopOpacity="0"/></radialGradient>
 <radialGradient id={'soft'+id}><stop offset=".68" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient>
 <filter id={'bleach'+id}><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.7" intercept=".12"/><feFuncG type="linear" slope="1.7" intercept=".12"/><feFuncB type="linear" slope="1.7" intercept=".12"/></feComponentTransfer></filter>
 {masks.map(([name,x,y,rx,ry])=><mask id={name+id} key={name}><ellipse cx={x} cy={y} rx={rx} ry={ry} fill={'url(#soft'+id+')'}/></mask>)}
 {grassPatches.map(([x,y,rx,ry],i)=><mask id={'grass'+id+i} key={i}><ellipse cx={x} cy={y} rx={rx} ry={ry} fill={'url(#soft'+id+')'}/></mask>)}
 {turbines.map(([cx,cy,x,y,width,height],i)=>{const p=clamp(w.turbines-i);return <g key={i}><clipPath id={'build'+id+i}><rect x={x} y={y+height*(1-p)} width={width} height={height*p}/></clipPath><mask id={'tower'+id+i}><rect x={x} y={y} width={width} height={height} fill="white"/><circle cx={cx} cy={cy} r="63" fill="black"/><rect x={cx-5} y={cy+5} width="10" height="110" fill="white"/></mask><clipPath id={'rotor'+id+i}><path d={'M'+cx+' '+cy+' l-58 -20 5 -6 49 17 34 -46 7 -4 -30 51 16 57 -5 4 -22 -49Z'}/></clipPath></g>;})}
 <clipPath id={"treatment-build"+id}><rect x="975" y={555-170*clamp(w.treated)} width="205" height={170*clamp(w.treated)}/></clipPath><clipPath id={"visitor"+id}><path d="M1000 525L1105 543L1110 582L999 560Z"/></clipPath></defs>
 <g className="world-camera" transform="translate(0 0)">
 <image href="/island-clean-v5.png" width="1672" height="941"/>
 {['boat1','boat2'].map((name,i)=><g key={name} className={'live-boat boat-route-'+i}><g mask={'url(#'+name+id+')'}>{plate}</g><path d={i?'M1400 630q35 12 65 0':'M1490 490q35 12 65 0'} fill="none" stroke="#e8f6e9" strokeWidth="3" opacity=".55"/></g>)}
 {turbines.map(([cx,cy],i)=><g key={i} clipPath={'url(#build'+id+i+')'}><g mask={'url(#tower'+id+i+')'}>{plate}</g><g className="live-rotor" style={{transformOrigin:cx+'px '+cy+'px',animationDuration:w.power>.1?'5s':'13s'}}><g clipPath={'url(#rotor'+id+i+')'}>{plate}</g></g></g>)}
 {w.turbines>0&&<g className="work-bob" mask={'url(#work'+id+')'} opacity={w.construction>.01?1:.55}>{plate}</g>}
 {grassPatches.map((_,i)=>{const health=clamp(w.meadow*4-i*.65);return <g key={i} className="grass-current" style={{transformOrigin:grassPatches[i][0]+'px '+grassPatches[i][1]+'px',animationDelay:(-i)+'s'}}><g mask={'url(#grass'+id+i+')'} opacity={.08+health*.92} style={{filter:'saturate('+(health*1.9)+') brightness('+(.75+health*.35)+')'}}>{plate}</g></g>;})}
 <g mask={'url(#reef'+id+')'} style={{filter:'saturate(1.8) contrast(1.1)'}}>{plate}</g>
 <g mask={'url(#reef'+id+')'} opacity={clamp((.8-w.coral)/.6)} filter={'url(#bleach'+id+')'}>{plate}</g>
 <g clipPath={'url(#treatment-build'+id+')'}><g mask={'url(#treatment'+id+')'}>{plate}</g></g>
 <g className="pollution-cloud" opacity={pollution}><ellipse cx="1080" cy="690" rx={170+pollution*160} ry={80+pollution*60} fill={'url(#mud'+id+')'}/><ellipse cx="395" cy="690" rx={130+pollution*180} ry={65+pollution*65} fill={'url(#mud'+id+')'}/></g>
 {Array.from({length:9},(_,i)=><circle key={i} className="water-bubble" cx={1080+i*12} cy={530+i*15} r={3+i%3*2} fill="none" stroke={w.water>45?'#befff0':'#b8a263'} strokeWidth="2.5" opacity={.3+clamp(w.treated)*.4} style={{animationDelay:(-i*.4)+'s'}}/>)}
 {w.grassBuild>0&&w.grassBuild<1&&<g fill="none" stroke="#ffe4a2" strokeWidth="3" opacity=".8">{grassPatches.map(([x,y],i)=><rect key={i} x={x-48} y={y-18} width="96" height="36" rx="8" strokeDasharray="8 6" opacity={clamp(w.grassBuild*4-i)}/>)}</g>}
 {w.boundary>0&&<ellipse cx="1070" cy="715" rx="190" ry="78" fill="none" stroke="#e8d7a7" strokeWidth="3" strokeDasharray="7 14" opacity={w.boundary*.8}/>}
 {w.event&&<g className="heat-haze" opacity={clamp((.8-w.coral)*1.3)} fill="none" stroke="#f6a675" strokeWidth="5">{[0,1,2].map(i=><path key={i} d={'M'+(1010+i*80)+' 760q-18-25 0-50t0-50'}/>)}</g>}
 {[[810,478],[882,496],[954,459]].map(([x,y],i)=><ellipse key={i} className="village-light" cx={x} cy={y} rx="26" ry="22" fill={'url(#glow'+id+')'} opacity={w.power*.9}/>)}
 {w.visitor>0&&<g transform="translate(50 34)" opacity={w.visitor} clipPath={"url(#visitor"+id+")"}>{plate}</g>}
{["wind","grass","reef"].map((s,i)=>w.monitor[s as Sector]&&<circle className="monitor-ping" key={s} cx={[1310,390,1100][i]} cy={[300,670,700][i]} r="48" stroke="#d3ffce" strokeWidth="3" fill="none" opacity=".5" style={{animationDelay:(-i)+"s",transformOrigin:[1310,390,1100][i]+"px "+[300,670,700][i]+"px"}}/>)}
<g opacity={w.smoke*.55}>{[0,1,2].map(i=><circle key={i} className="island-smoke" cx={973+i*6} cy={406-i*12} r={9+i*5} fill="#596466" style={{animationDelay:(-i)+'s'}}/>)}</g>
 {w.power>.1&&<path className="electric-flow" d="M1065 555Q1210 560 1310 175" stroke="#ffef96" strokeWidth="5" strokeDasharray="7 18" fill="none" opacity={w.power*.8}/>}
 <OceanSurface id={id}/>
 <HarborLife/><IslandResidents/>
 {Array.from({length:12},(_,i)=><g key={i} className="fish-school" opacity={clamp(w.ecology/70-i/18)} style={{animationDelay:(-i*.4)+'s'}}><path d={'M'+(580+i*41)+' '+(800+i%3*20)+'q16-10 28 0-12 10-28 0l-9-6v12Z'} fill="#d9e5ba" stroke="#42797a" strokeWidth="1.3"/></g>)}
 <g fontFamily="system-ui,sans-serif" fontSize="20" fill="#f3f0cf">{[[1300,350,en?'WIND':'風場'],[315,565,en?'MEADOW':'海草'],[1050,825,en?'REEF':'珊瑚']].map(([x,y,t],i)=><g key={i}><rect x={Number(x)-18} y={Number(y)-28} width="125" height="40" rx="18" fill="#103e48" fillOpacity=".8" stroke={focus===['wind','grass','reef'][i]?'#f6d17e':'#91bbb2'} strokeWidth="2"/><text x={Number(x)} y={Number(y)}>{t}</text></g>)}</g>
 </g></svg>
 {progress!==null&&stage!==null&&<div className="scene-work-badge"><span className="work-spinner"/><div><strong>{stages[stage]}</strong><small>{en?'Work progress · not recovery':'作業進度・不等於生態恢復'}</small></div><b>{Math.floor(progress*100)}%</b></div>}
 <div className="map-credit">{en?'ILLUSTRATIVE ENVIRONMENTAL EFFECTS':'環境效果為教學示意'}</div>
 </div>;
}


