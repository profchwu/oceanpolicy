'use client';
import {useEffect,useRef,useState} from 'react';
import {RECORD_VERSION,recordRevision,validUserId,type NewsRecord} from '@/lib/news-record';
import {LIMIT,type NewsRun} from '@/lib/news-flow';
import {hasResearchConsent} from '@/lib/research-consent';
const QUEUE='ocean-news-completed-upload-20261024',PLAYER='ocean-news-player-1';
export function useNewsSync(run:NewsRun|null,now:number,en:boolean){
 const [status,setStatus]=useState<'checking'|'unconfigured'|'ready'|'pending'|'saved'|'error'>('checking');
 const queue=useRef<Record<string,NewsRecord>>({}),busy=useRef(false),enabled=useRef(false),player=useRef(''),last=useRef('');
 const allowed=hasResearchConsent(run)&&run?.current===3&&Number.isSafeInteger(run.completedAt),allowedRef=useRef(allowed);allowedRef.current=allowed;
 const persist=()=>{try{localStorage.setItem(QUEUE,JSON.stringify(queue.current));}catch{setStatus('error');}};
 const flush=async()=>{
  if(busy.current||!enabled.current||!allowedRef.current)return;busy.current=true;let succeeded=false;
  try{for(const p of Object.values(queue.current)){
   if(!allowedRef.current)return;if(!hasResearchConsent(p.run)||p.run.current!==3||!Number.isSafeInteger(p.run.completedAt))continue;
   setStatus('pending');const response=await fetch('/api/news-record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p),keepalive:true});const receipt=await response.json() as {saved?:boolean;runId?:string;revision?:number};
   if(!response.ok||receipt.saved!==true||receipt.runId!==p.run.id||receipt.revision!==recordRevision(p))throw Error();
   if(queue.current[p.run.id]===p)delete queue.current[p.run.id];persist();
  }succeeded=true;setStatus(Object.keys(queue.current).length?'pending':'saved');}catch{setStatus('error');}finally{busy.current=false;if(succeeded&&Object.keys(queue.current).length)setTimeout(()=>void flush(),100);}
 };
 useEffect(()=>{
  if(!allowed){enabled.current=false;return;}let active=true;
  try{player.current=localStorage.getItem(PLAYER)||crypto.randomUUID();localStorage.setItem(PLAYER,player.current);const saved=JSON.parse(localStorage.getItem(QUEUE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){const legacy=Object.fromEntries(Object.entries(saved).filter(([,p])=>(!validUserId((p as NewsRecord)?.run?.userId)||(!hasResearchConsent((p as NewsRecord)?.run)||(p as NewsRecord)?.run?.current!==3))));if(Object.keys(legacy).length)localStorage.setItem(QUEUE+'-legacy',JSON.stringify(legacy));queue.current=Object.fromEntries(Object.entries(saved).filter(([,p])=>validUserId((p as NewsRecord)?.run?.userId)&&hasResearchConsent((p as NewsRecord)?.run)&&(p as NewsRecord)?.run?.current===3)) as Record<string,NewsRecord>;}}catch{player.current=crypto.randomUUID();setStatus('error');}
  fetch('/api/news-record').then(r=>r.json() as Promise<{configured?:boolean}>).then(r=>{if(!active||!allowedRef.current)return;enabled.current=r.configured===true;setStatus(enabled.current?'ready':'unconfigured');if(enabled.current&&Object.keys(queue.current).length)void flush();}).catch(()=>setStatus('error'));
  const timer=setInterval(()=>{if(Object.keys(queue.current).length)void flush();},15000);const online=()=>void flush();window.addEventListener('online',online);return()=>{active=false;enabled.current=false;clearInterval(timer);window.removeEventListener('online',online);};
 },[allowed]);
 const expired=!!run&&run.startedAt!==null&&run.current<3&&now>=run.startedAt+LIMIT;
 useEffect(()=>{
  if(!allowed||!run||!validUserId(run.userId)||run.startedAt===null||!player.current)return;
  const p:NewsRecord={schema:RECORD_VERSION,playerId:player.current,run,observedAt:Math.max(now,Date.now()),language:en?'en':'zh-Hant'};
  const key=run.id+':'+recordRevision(p);if(last.current===key)return;last.current=key;queue.current[run.id]=p;persist();if(enabled.current){setStatus('pending');void flush();}
 },[run,expired,allowed]);
 return {status,retry:()=>void flush()};
}
