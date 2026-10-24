import {hasResearchConsent} from '@/lib/research-consent';
import {env} from 'cloudflare:workers';
import {validateNewsRecord,recordRevision,recordStatus} from '@/lib/news-record';
import {outcomes} from '@/lib/news-flow';
import {missionsFor} from '@/lib/news-missions';
const settings=()=>env as unknown as {NEWS_SHEETS_URL?:string;NEWS_SHEETS_SECRET?:string};
async function signature(text:string,secret:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
export async function GET(){const s=settings(),configured=Boolean(s.NEWS_SHEETS_URL&&s.NEWS_SHEETS_SECRET);const headers:Record<string,string>={'Cache-Control':'no-store'};if(configured){const expires=String(Date.now()+86400000),token=expires+'.'+await signature(expires,s.NEWS_SHEETS_SECRET!);headers['Set-Cookie']=`news_write=${token}; Path=/api/news-record; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;}return Response.json({configured},{headers});}
export async function POST(req:Request){
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'ORIGIN'},{status:403});
 if(!req.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'FORMAT'},{status:415});
 const s=settings();if(!s.NEWS_SHEETS_URL||!s.NEWS_SHEETS_SECRET)return Response.json({error:'NOT_CONFIGURED'},{status:503});
 const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith('news_write='))?.slice(11),parts=token?.split('.');
 if(!parts||parts.length!==2||!/^\d{13}$/.test(parts[0])||Number(parts[0])<Date.now()||Number(parts[0])>Date.now()+86400000||parts[1]!==await signature(parts[0],s.NEWS_SHEETS_SECRET))return Response.json({error:'SESSION_EXPIRED'},{status:401});
 let p;try{const body=await req.text();if(body.length>16000)throw Error();p=validateNewsRecord(JSON.parse(body));}catch{return Response.json({error:'INVALID_RECORD'},{status:400});}
 if(!hasResearchConsent(p.run))return Response.json({error:'CONSENT_REQUIRED'},{status:400});
 if(p.run.current!==3||!Number.isSafeInteger(p.run.completedAt)||!Number.isSafeInteger(p.run.userIdEnteredAt))return Response.json({error:'COMPLETION_REQUIRED'},{status:400});
 const revision=recordRevision(p),status=recordStatus(p),r=p.run;
 try{
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(s.NEWS_SHEETS_URL))throw Error();
  const response=await fetch(s.NEWS_SHEETS_URL,{method:'POST',redirect:'follow',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(20000),body:JSON.stringify({secret:s.NEWS_SHEETS_SECRET,record:p,revision,status,scores:r.rounds.flatMap((_,i)=>outcomes(r,i)),events:r.rounds.flatMap((round,i)=>round.actions.map(a=>({event_id:`${r.id}:${i}:${a.step}`,run_id:r.id,level:i+1,mission_id:missionsFor(r)[i].id,variable:a.automatic?'external_event':['policy','evidence','adaptation'][a.step],choice_id:a.automatic?`${missionsFor(r)[i].id}:external_event`:`${missionsFor(r)[i].id}:${a.step}:${a.choice}`,score:a.automatic?'':Number(missionsFor(r)[i].options[a.step][a.choice].correct),selected_at:new Date(a.at).toISOString(),confirmed_at:a.ackAt===undefined?'':new Date(a.ackAt).toISOString(),language:a.language})))})});
  const receipt=await response.json() as {ok?:boolean;runId?:string;revision?:number};
  if(!response.ok||!receipt.ok||receipt.runId!==r.id||receipt.revision!==revision)throw Error();
  return Response.json({saved:true,runId:r.id,revision},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'SAVE_NOT_CONFIRMED'},{status:502});}
}
