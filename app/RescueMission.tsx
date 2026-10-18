'use client';
import {Check,ArrowRight,Coins,Wind,Search,Cable,ChartNoAxesCombined,Leaf,Waves,RadioTower,Shield,Building2} from 'lucide-react';
import {TOOLS,COST,canPlay,type IslandState} from '@/lib/island-simulation';
import {TOOL_COPY,GOALS,EVENTS} from '@/lib/island-copy';
import {say} from '@/lib/behavior-copy';
import type {Language} from '@/lib/behavior-model';
import IslandScene from './IslandScene';
const icons:Record<string,typeof Wind>={survey:Search,turbine:Wind,cable:Cable,battery:Building2,report:ChartNoAxesCombined,filter:Waves,plant:Leaf,sample:RadioTower,expand:Leaf,treat:Waves,sensor:RadioTower,patrol:Shield,shade:Shield,tourism:Building2};
export default function RescueMission({world,language,onMove,onFinish}:{world:IslandState;language:Language;onMove:(a:string)=>void;onFinish:()=>void}){
 const en=language==='en',last=world.moves.at(-1) as keyof typeof TOOL_COPY|undefined;
 const copy=(zh:string,english:string)=>en?english:zh;
 return <div className="rescue-mission"><div className="rescue-hud"><div><span className="eyebrow">{copy('你的任務','YOUR MISSION')}</span><h3>{world.kind==='wind'?copy('讓小島亮起來','Bring power to the island'):world.kind==='grass'?copy('救回消失的海草床','Bring back the meadow'):copy('替珊瑚減壓','Give the reef a chance')}</h3></div><div className="budget"><Coins size={23}/><strong>{world.budget}</strong><span>{copy('預算','BUDGET')}</span></div></div>
 <div className="rescue-goals">{GOALS[world.kind].map((goal,i)=><div key={i} className={world.goals[i]?'achieved':''}><span>{world.goals[i]?<Check size={15}/>:i+1}</span>{say(goal,language)}</div>)}</div>
 <div className="rescue-stage"><IslandScene kind={world.kind} world={world} language={language}/>{world.event&&<div className="island-event" role="status">{say(EVENTS[world.kind],language)}</div>}{world.won&&<div className="rescue-victory" role="status"><span>✦ ✦ ✦</span><strong>{copy('海島救援成功！','ISLAND RESCUED!')}</strong><p>{copy('三個任務目標達成','All three mission goals achieved')}</p></div>}</div>
 <div className="rescue-feedback" aria-live="polite">{last?say(TOOL_COPY[last][1],language):copy('點下方工具就會施工。用 8 點預算完成上方三個目標！','Click a tool to act. Complete the three goals with a budget of 8!')}</div>
 <div className="rescue-tools">{TOOLS[world.kind].map(action=>{const Icon=icons[action],used=world.moves.includes(action);return <button key={action} onClick={()=>onMove(action)} disabled={!canPlay(world,action)} className={used?'used':''}><Icon size={25}/><strong>{say(TOOL_COPY[action][0],language)}</strong><span>{used?<><Check size={13}/>{copy('已部署','Deployed')}</>:<><Coins size={13}/>{COST[action]}</>}</span></button>;})}</div>
 {world.over&&<div className="rescue-debrief"><p>{world.won?copy('達成的是模擬任務，不是已驗證的減碳或生態成效。','These are simulation goals, not verified climate or ecological benefits.'):copy('這次資源沒能完成所有目標。記住剛才的取捨，下一座海島還有機會！','This budget did not achieve every goal. Take what you learned to the next island!')}</p><button className="primary" onClick={onFinish}>{copy('完成任務，繼續航行','Complete mission and sail on')}<ArrowRight size={18}/></button></div>}
 <p className="map-note">{copy('遊戲預算與變化為簡化示意；真實政策成效需長期監測，熱浪不會因單一地方政策消失。','Budget and changes are simplified illustrations. Real effects require long-term monitoring; local action does not remove a heatwave.')}</p>
 </div>;
}
