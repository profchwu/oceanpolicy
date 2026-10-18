export type Choice='barrier'|'grid'|'plant'|'dredge'|'evidence'|'count'|'filter'|'battery'|'expand'|'hold';
export type Move={choice:Choice;at:number;language:string};
export type Run={version:'crisis-pilot-2';id:string;userId:string;start:number;moves:Move[]};
export const costs:Record<Choice,number>={barrier:40,grid:35,plant:30,dredge:30,evidence:0,count:0,filter:28,battery:20,expand:25,hold:0};
export const duration:Record<Choice,number>={barrier:5,grid:5,plant:5,dredge:5,evidence:0,count:0,filter:5,battery:5,expand:5,hold:0};
export const policies:Choice[]=['barrier','grid','plant','dredge'],monitors:Choice[]=['evidence','count'],repairs:Choice[]=['filter','battery','expand','hold'];
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function stateAt(run:Run|null,now:number){
 const time=run?Math.max(0,Math.min(90,(now-run.start)/1000)):0;
 const progress=(c:Choice)=>{const m=run?.moves.find(m=>m.choice===c);return m?clamp((time-m.at)/Math.max(1,duration[c])):0;};
 const storm=clamp((time-40)/18),barrier=progress('barrier'),grid=progress('grid'),filter=progress('filter'),battery=progress('battery'),plant=progress('plant'),dredge=progress('dredge'),expand=progress('expand');
 const water=Math.max(0,Math.min(100,60-50*storm*(1-.8*barrier)+42*filter-20*dredge-10*expand));
 const power=Math.max(0,Math.min(100,55-45*storm+45*grid+35*battery));
 const meadow=Math.max(0,Math.min(100,65-40*storm*(1-.7*barrier)+20*filter-18*dredge+plant*(water>=50?10:-18)-12*expand));
 const budget=80-(run?.moves.reduce((s,m)=>s+costs[m.choice],0)||0);
 return {time,storm,water,power,meadow,budget,barrier,grid,filter,battery,plant,dredge,progress,won:power>=45&&water>=45&&meadow>=45};
}
export function canMove(run:Run,c:Choice,now:number){
 const s=stateAt(run,now);if(s.time>=90||run.moves.some(m=>m.choice===c)||s.budget<costs[c])return false;
 if(policies.includes(c))return s.time<40&&run.moves.filter(m=>policies.includes(m.choice)).length<2;
 if(monitors.includes(c))return s.time>=10&&!run.moves.some(m=>monitors.includes(m.choice));
 return s.time>=40&&!run.moves.some(m=>repairs.includes(m.choice));
}
export function move(run:Run,c:Choice,now:number,language:string){return canMove(run,c,now)?{...run,moves:[...run.moves,{choice:c,at:stateAt(run,now).time,language}]}:run;}
// Pilot rubrics, not a validated pre/post instrument. Null means unobserved.
export function scores(run:Run){
 const p=run.moves.find(m=>policies.includes(m.choice)),m=run.moves.find(m=>monitors.includes(m.choice)),r=run.moves.find(m=>repairs.includes(m.choice));
 const before=r?stateAt({...run,moves:run.moves.filter(x=>x!==r&&x.at<=r.at)},run.start+90000):null;
 return {policy:p?Number(['barrier','grid'].includes(p.choice)):null,monitor:m?Number(m.choice==='evidence'):null,adapt:r&&before?Number(r.choice==='filter'&&before.water<45||r.choice==='battery'&&before.power<45||r.choice==='hold'&&before.won):null};
}
