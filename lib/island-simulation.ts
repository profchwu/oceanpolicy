export type IslandKind='wind'|'grass'|'reef';
export const TOOLS={wind:['survey','turbine','cable','battery','report'],grass:['survey','filter','plant','sample','expand'],reef:['treat','sensor','patrol','shade','tourism']} as const;
export const COST:Record<string,number>={survey:1,turbine:3,cable:2,battery:2,report:1,filter:2,plant:2,sample:1,expand:3,treat:3,sensor:1,patrol:2,shade:2,tourism:2};
export type IslandState={kind:IslandKind;budget:number;moves:string[];survey:boolean;turbines:number;cable:boolean;battery:boolean;pollution:number;grass:number;coral:number;monitor:boolean;patrol:boolean;event:boolean;power:boolean;goals:boolean[];won:boolean;over:boolean};
export function islandState(kind:IslandKind,moves:string[]=[]):IslandState{
 const s:IslandState={kind,budget:8,moves:[],survey:false,turbines:0,cable:false,battery:false,pollution:3,grass:1,coral:2,monitor:false,patrol:false,event:false,power:false,goals:[],won:false,over:false};
 for(const action of moves){
  if(!canPlay(s,action))throw Error('INVALID_SIMULATION_MOVE');
  s.budget-=COST[action];s.moves.push(action);
  if(action==='survey')s.survey=true;
  if(action==='turbine')s.turbines++;
  if(action==='cable')s.cable=true;
  if(action==='battery')s.battery=true;
  if(action==='filter'||action==='treat')s.pollution=0;
  if(action==='plant')s.grass+=s.survey&&s.pollution<2?3:1;
  if(action==='expand')s.grass+=s.pollution<2?2:0;
  if(action==='sample'||action==='sensor')s.monitor=true;
  if(action==='patrol')s.patrol=true;
  if(action==='tourism')s.pollution=Math.min(4,s.pollution+1);
  if(s.moves.length===2){s.event=true;if(kind==='grass'){s.pollution=Math.min(4,s.pollution+1);s.grass=Math.max(0,s.grass-1);}if(kind==='reef')s.coral=1;}
  s.power=s.turbines>0&&s.cable;
  if(kind==='reef'&&s.pollution===0&&s.patrol)s.coral=2;
  s.goals=kind==='wind'?[s.survey,s.power,s.battery]:kind==='grass'?[s.pollution<2,s.grass>=3,s.monitor]:[s.pollution===0,s.monitor,s.patrol];
  s.won=s.goals.every(Boolean);
  s.over=s.won||!TOOLS[kind].some(a=>canPlay(s,a));
 }
 if(!moves.length)s.goals=[false,false,false];
 return s;
}
export function canPlay(s:IslandState,action:string){return !s.over&&(TOOLS[s.kind] as readonly string[]).includes(action)&&COST[action]<=s.budget&&!s.moves.includes(action);}
export type TrainingMove={lesson:number;action:string;at:string;elapsedMs:number};
