import {getSettings,configured} from './sheets';
import type {Session} from './behavior-model';
export async function sendBehaviorToSheets(record:Session){
 const s=getSettings();
 if(!configured()||s.secret.length<32||!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(s.url))throw Error('NOT_CONFIGURED');
 const response=await fetch(s.url,{method:'POST',headers:{'Content-Type':'application/json'},redirect:'follow',signal:AbortSignal.timeout(12000),body:JSON.stringify({secret:s.secret,record})});
 if(!response.ok)throw Error('UNAVAILABLE');
 const receipt=await response.json() as {ok?:boolean;recordKey?:string;version?:string;duplicate?:boolean};
 const key=`${record.sessionId}:${record.revision}`;
 if(!receipt.ok||receipt.recordKey!==key||receipt.version!==record.version)throw Error('UNCONFIRMED');
 return {recordKey:key,duplicate:!!receipt.duplicate};
}
