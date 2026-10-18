'use client';
import {useEffect,useRef,useState} from 'react';
import {newSession,timeoutSession,BEHAVIOR_VERSION,type Session,type Result} from '@/lib/rts-model';
const STORAGE='ocean-rts-v53-session';
type Receipt={revision:number;saved:boolean;demo:boolean};
export function useRtsRecord(){
 const [session,setSession]=useState<Session|null>(null),ref=useRef<Session|null>(null),[draft,setDraft]=useState<Session|null>(null),[connected,setConnected]=useState<boolean|null>(null),[connectionError,setConnectionError]=useState(false);
 const [time,setTime]=useState(0),floor=useRef(0),[receipt,setReceipt]=useState<Receipt|null>(null),receiptRef=useRef<Receipt|null>(null),[result,setResult]=useState<Result|null>(null),resultRef=useRef<Result|null>(null),[saveError,setSaveError]=useState(false),[storageError,setStorageError]=useState(false),busy=useRef(false),alive=useRef(false),last=useRef({revision:0,at:0});
 const now=()=>{floor.current=Math.max(Date.now(),floor.current);return floor.current;};
 const persist=(s:Session)=>{try{localStorage.setItem(STORAGE,JSON.stringify({session:s,receipt:receiptRef.current,result:resultRef.current}));}catch{setStorageError(true);}};
 const update=(s:Session)=>{ref.current=s;setSession(s);persist(s);};
 const check=()=>{setConnectionError(false);fetch('/api/status',{signal:AbortSignal.timeout(10000)}).then(async r=>{if(!r.ok)throw Error();const x=await r.json() as {configured?:boolean};if(typeof x.configured!=='boolean')throw Error();setConnected(x.configured);}).catch(()=>setConnectionError(true));};
 const sync=async(force=false)=>{
  const s=ref.current;if(!s||busy.current)return;if(!force&&receiptRef.current?.revision===s.revision&&(s.status==='active'||resultRef.current))return;
  if(!force&&last.current.revision===s.revision&&Date.now()-last.current.at<10000)return;last.current={revision:s.revision,at:Date.now()};busy.current=true;
  try{const r=await fetch('/api/rts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s),signal:AbortSignal.timeout(16000)}),data=await r.json() as {result?:Result;revision?:number;saved?:boolean;demo?:boolean};if(!alive.current||ref.current?.sessionId!==s.sessionId)return;if(data.result&&s.status!=='active'){resultRef.current=data.result;setResult(data.result);}if(!r.ok||data.revision!==s.revision||!data.saved&&!data.demo)throw Error();receiptRef.current={revision:s.revision,saved:data.saved===true,demo:data.demo===true};setReceipt(receiptRef.current);setSaveError(false);}catch{if(alive.current&&ref.current?.sessionId===s.sessionId)setSaveError(true);}finally{busy.current=false;if(ref.current?.sessionId===s.sessionId)persist(ref.current);}
 };
 useEffect(()=>{alive.current=true;check();setTime(now());try{const raw=localStorage.getItem(STORAGE);if(raw){const p=JSON.parse(raw),s=p.session;if(s?.version===BEHAVIOR_VERSION&&Array.isArray(s.answers)&&Array.isArray(s.learning)&&Number.isFinite(Date.parse(s.deadlineAt))){setDraft(s);receiptRef.current=p.receipt||null;setReceipt(receiptRef.current);resultRef.current=p.result||null;setResult(resultRef.current);}}}catch{setStorageError(true);}const t=setInterval(()=>{const n=now();setTime(n);if(ref.current){const next=timeoutSession(ref.current,n);if(next!==ref.current)update(next);}},200);const online=()=>void sync(true);window.addEventListener('online',online);return()=>{alive.current=false;clearInterval(t);window.removeEventListener('online',online);};},[]);
 useEffect(()=>{if(!session)return;const t=setTimeout(()=>void sync(),350);return()=>clearTimeout(t);},[session?.revision]);
 useEffect(()=>{const t=setInterval(()=>void sync(),4000);return()=>clearInterval(t);},[]);
 const start=(id:string,reducedMotion=false)=>{const n=now();setTime(n);receiptRef.current=null;resultRef.current=null;setReceipt(null);setResult(null);setSaveError(false);update(newSession(id,crypto.randomUUID(),n,!connected||id.startsWith('TEST_'),reducedMotion));};
 const resume=()=>{if(draft){update(timeoutSession(draft,now()));setDraft(null);}};
 const download=()=>{const s=ref.current||draft;if(!s)return;const url=URL.createObjectURL(new Blob([JSON.stringify({session:s,result:resultRef.current,receipt:receiptRef.current},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`ocean-v5-${s.userId}-${s.sessionId.slice(0,8)}.json`;a.click();URL.revokeObjectURL(url);};
 const clear=()=>{try{localStorage.removeItem(STORAGE);}catch{}ref.current=null;setSession(null);setDraft(null);receiptRef.current=null;setReceipt(null);resultRef.current=null;setResult(null);setSaveError(false);};
 return {session,ref,draft,connected,connectionError,check,time,now,update,start,resume,download,clear,sync,receipt,result,saveError,storageError};
}


