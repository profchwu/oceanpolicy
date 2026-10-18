import { env } from 'cloudflare:workers';
import { scoreSubmission, type Submission } from './assessment';
type Settings = {SHEETS_WEB_APP_URL?:string;SHEETS_SHARED_SECRET?:string;RESEARCH_COLLECTION_ENABLED?:string};
export function getSettings(){
 const vars = env as unknown as Settings;
 return {url:vars.SHEETS_WEB_APP_URL||'',secret:vars.SHEETS_SHARED_SECRET||'',enabled:vars.RESEARCH_COLLECTION_ENABLED==='true'};
}
export function configured(){const s=getSettings();return Boolean(s.url&&s.secret&&s.enabled);}
export async function sendToSheets(record:Submission){
 const settings=getSettings();
 if(!configured()) throw Error('SHEETS_NOT_CONFIGURED');
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(settings.url)) throw Error('SHEETS_URL_INVALID');
 const response=await fetch(settings.url,{
  method:'POST',headers:{'Content-Type':'application/json'},redirect:'follow',signal:AbortSignal.timeout(18000),
  body:JSON.stringify({secret:settings.secret,record,score:scoreSubmission(record)}),
 });
 if(!response.ok) throw Error('SHEETS_UNAVAILABLE');
 const receipt=await response.json() as {ok?:boolean;recordKey?:string;error?:string;duplicate?:boolean};
 if(receipt.ok!==true||receipt.recordKey!==`${record.sessionId}:${record.phase}`) throw Error('SHEETS_NOT_CONFIRMED');
 return {recordKey:receipt.recordKey,duplicate:Boolean(receipt.duplicate)};
}
