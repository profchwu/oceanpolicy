import {PHASES,phaseStarted,EVENT_DELAY_MS,type Session,type Phase,type Action} from './rts-model';
export const SECTORS=['wind','grass','reef'] as const;
export type Sector=typeof SECTORS[number];
export const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
export const BUILD_SECONDS=24;
export function actionProgress(a:Action|undefined,now:number,duration=BUILD_SECONDS){return a?clamp((now-Date.parse(a.at))/(duration*1000)):0;}
export function actionCost(index:number,choice:string){const costs=[[22,30,8],[5,5,5],[24,14,0],[28,18,26],[5,5,5],[12,23,0],[23,8,20],[5,5,5],[0,12,0]];return costs[index][choice.charCodeAt(0)-97]||0;}
export type World={boundary:number;visitor:number;carbon:number;ecology:number;welfare:number;water:number;meadow:number;coral:number;power:number;turbines:number;windBuild:number;grassBuild:number;reefBuild:number;connected:boolean;treated:number;survey:boolean;monitor:Record<Sector,boolean>;event:boolean;eventPhase:Phase;phaseTime:number;budget:number;smoke:number;construction:number;last:Action|undefined;time:number};
// Deterministic, time-based teaching model. These are illustrative indices, not calibrated climate predictions.
export function worldAt(s:Session|undefined,wallTime:number):World{
 const now=s?Math.min(wallTime,Date.parse(s.deadlineAt),s.status==='completed'?Date.parse(s.endedAt!)+30000:Infinity):wallTime;
 const w:World={boundary:0,visitor:0,carbon:28,ecology:64,welfare:56,water:32,meadow:.28,coral:.68,power:0,turbines:0,windBuild:0,grassBuild:0,reefBuild:0,connected:false,treated:0,survey:false,monitor:{wind:false,grass:false,reef:false},event:false,eventPhase:'pre',phaseTime:0,budget:150,smoke:1,construction:0,last:s?.answers.at(-1),time:now};
 if(!s)return w;
 let water=32,meadow=.28,coral=.68,carbon=28,welfare=56,power=0,turbines=0,treated=0,construction=0;
 const startedPhase=s.stage==='post2'||s.answers.some(a=>a.id.startsWith('post2-'))?'post2':s.stage==='post1'||s.answers.some(a=>a.id.startsWith('post1-'))?'post1':'pre';
 w.eventPhase=startedPhase;w.phaseTime=Math.max(0,(now-phaseStarted(s,startedPhase))/1000);w.event=w.phaseTime>=EVENT_DELAY_MS/1000;
 for(const phase of PHASES){
  if(PHASES.indexOf(phase)>PHASES.indexOf(startedPhase))continue;
  const a=(i:number)=>s.answers.find(x=>x.id===`${phase}-${i}`),p=(i:number,d=24)=>actionProgress(a(i),now,d);
  const phaseAge=Math.max(0,(now-phaseStarted(s,phase))/1000),event=clamp((phaseAge-35)/18),current=phase===startedPhase;
  const wind=a(0),grass=a(3),reef=a(6),windFix=a(2),grassFix=a(5),reefFix=a(8); if(reef?.choice==="b")w.boundary=Math.max(w.boundary,p(6));if(reef?.choice==="a")w.visitor=Math.max(w.visitor,p(6));
  // Planned wind construction includes site assessment; direct construction creates avoidable habitat pressure.
  if(wind){if(wind.choice!=='c'){turbines+=p(0);w.windBuild=p(0);w.survey||=wind.choice==='a';construction+=(1-p(0))*.5;welfare+=4*p(0);if(wind.choice==='b'){water-=9*p(0);coral-=.08*p(0);}}else welfare-=3*p(0);}
  let phasePower=wind?.choice==='a'?clamp((p(0)-.85)/.15):0;
  phasePower*=1-event;
  if(windFix){if(windFix.choice==='b'){phasePower=p(2,16);w.connected=p(2,16)>=1;}if(windFix.choice==='a'){turbines+=p(2);water-=7*p(2);}if(windFix.choice==='c')welfare-=5*p(2);}
  power+=phasePower;carbon+=14*phasePower;welfare+=9*phasePower-5*event*(1-phasePower);
  if(grass){w.grassBuild=p(3);construction+=(1-p(3))*.2;if(grass.choice==='b'){meadow+=.19*p(3);water+=4*p(3);}else if(grass.choice==='a'){meadow+=.16*clamp(p(3)*3)-.25*clamp((p(3)-.4)/.6);water-=3*p(3);}else{meadow-=.25*p(3);coral-=.07*p(3);water-=10*p(3);}}
  water-=8*event;meadow-=.10*event;
  if(grassFix){if(grassFix.choice==='a'){water+=19*p(5,18);meadow+=.22*p(5,30);carbon+=6*p(5,30);}if(grassFix.choice==='b'){meadow-=.15*p(5);water-=5*p(5);}if(grassFix.choice==='c')meadow-=.05*p(5);}
  if(reef){w.reefBuild=p(6);construction+=(1-p(6))*.3;if(reef.choice==='c'){treated+=p(6);water+=24*p(6,32);coral+=.07*p(6,40);welfare+=5*p(6);}if(reef.choice==='a'){water-=12*p(6);welfare+=5*p(6);coral-=.12*p(6);}if(reef.choice==='b')coral+=.02*p(6);}
  coral-=.18*event;
  if(reefFix){if(reefFix.choice==='b'){treated+=p(8,16)*.6;water+=10*p(8,28);coral+=.08*p(8,40);welfare+=3*p(8);}if(reefFix.choice==='a'){water-=16*p(8);coral-=.10*p(8);}if(reefFix.choice==='c')coral-=.03*p(8);}
  water-=Math.min(10,phaseAge/10)*(1-clamp(treated));
  SECTORS.forEach((sector,i)=>{if(a(i*3+1))w.monitor[sector]=true;});
  if(current)w.budget=150-s.answers.filter(x=>x.id.startsWith(phase+'-')).reduce((sum,x)=>sum+actionCost(Number(x.id.split('-')[1]),x.choice),0);
 }
 const latestRepair=s.answers.find(a=>a.id===`${startedPhase}-2`),outage=clamp((w.phaseTime-35)/8);
 if(w.event)power=clamp(power)*(1-outage)+(latestRepair?.choice==='b'?actionProgress(latestRepair,now,16):0)*outage;
 w.water=clamp(water,0,100);w.meadow=clamp(meadow,0,.95);w.coral=clamp(coral,.05,.9);w.power=clamp(power);w.turbines=Math.min(5,turbines);w.treated=clamp(treated);w.construction=clamp(construction);w.carbon=clamp(28+w.power*42+Math.max(0,meadow-.28)*15,0,100);w.ecology=clamp(w.water*.43+w.meadow*30+w.coral*27,0,100);w.welfare=clamp(welfare+(w.ecology-50)*.16,0,100);w.smoke=1-w.power*.78;
 return w;
}
export function currentProject(s:Session,sector:Sector,now:number){
 const index=SECTORS.indexOf(sector)*3;const actions=s.answers.filter(a=>Number(a.id.split('-')[1])===index||Number(a.id.split('-')[1])===index+2);const a=actions.at(-1);
 if(!a)return null;const variable=Number(a.id.split('-')[1])%3;const duration=variable===2?(sector==='wind'?16:sector==='grass'?18:16):24;const progress=actionProgress(a,now,duration);
 const noBuild=variable===0?(sector==='wind'&&a.choice==='c'||sector==='reef'&&a.choice==='b'):a.choice==='c'||sector==='reef'&&a.choice==='a';
 return {a,progress:noBuild?1:progress,remaining:noBuild?0:Math.ceil((1-progress)*duration),step:noBuild?3:Math.min(3,Math.floor(progress*4)),noBuild};
}

