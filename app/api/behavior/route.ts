import {validateSession,scoreBehavior} from '@/lib/behavior-score';
import {configured} from '@/lib/sheets';
import {sendBehaviorToSheets} from '@/lib/behavior-sheets';
const headers={'Cache-Control':'no-store'};
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'INVALID_ORIGIN'},{status:403,headers});
 if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'INVALID_FORMAT'},{status:415,headers});
 if(Number(request.headers.get('content-length')||0)>48000)return Response.json({error:'TOO_LARGE'},{status:413,headers});
 let r;
 try{const body=await request.text();if(body.length>48000)return Response.json({error:'TOO_LARGE'},{status:413,headers});r=validateSession(JSON.parse(body));}
 catch{return Response.json({error:'INVALID_RECORD'},{status:400,headers});}
 const result=r.status==='active'?undefined:scoreBehavior(r);
 if(!configured())return r.isTest?Response.json({saved:false,demo:true,revision:r.revision,result},{headers}):Response.json({error:'NOT_CONFIGURED',result},{status:503,headers});
 try{const receipt=await sendBehaviorToSheets(r);return Response.json({saved:true,revision:r.revision,receipt,result},{headers});}
 catch{return Response.json({error:'SAVE_UNCONFIRMED',result},{status:502,headers});}
}
