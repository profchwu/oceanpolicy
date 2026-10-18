'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';

/** Fixed-height reading pages. CSS columns preserve text flow without a scroll surface. */
export default function PageReader({children,en,className='',resetKey=''}:{children:ReactNode;en:boolean;className?:string;resetKey?:string|number}){
 const viewport=useRef<HTMLDivElement>(null),content=useRef<HTMLDivElement>(null);
 const [page,setPage]=useState(0),[layout,setLayout]=useState({width:0,pages:1});
 useEffect(()=>{setPage(0);},[resetKey,en]);
 useEffect(()=>{
  const box=viewport.current,body=content.current;if(!box||!body)return;
  const measure=()=>{const width=box.clientWidth;const pages=Math.max(1,Math.round((body.scrollWidth+24)/(width+24)));setLayout(old=>old.width===width&&old.pages===pages?old:{width,pages});setPage(p=>Math.min(p,pages-1));};
  const resize=new ResizeObserver(measure);resize.observe(box);resize.observe(body);
  const mutation=new MutationObserver(measure);mutation.observe(body,{childList:true,subtree:true,characterData:true});
  measure();document.fonts.ready.then(measure);
  return()=>{resize.disconnect();mutation.disconnect();};
 },[]);
 return <div className={`page-reader ${className}`}>
  <div className="page-viewport" ref={viewport}>
   <div className="page-columns" ref={content} style={{transform:`translateX(${-page*(layout.width+24)}px)`}} onFocusCapture={event=>{const target=event.target as HTMLElement;const box=viewport.current;if(!box)return;const offset=target.getBoundingClientRect().left-box.getBoundingClientRect().left;const next=page+Math.floor((offset+1)/(layout.width+24));if(next!==page)setPage(Math.max(0,Math.min(layout.pages-1,next)));}}>{children}</div>
  </div>
  <nav className="page-controls" aria-label={en?'Reading pages':'內容分頁'}>
   <button type="button" disabled={page===0} onClick={()=>setPage(p=>p-1)}>{en?'← Previous':'← 上一頁'}</button>
   <span aria-live="polite">{en?'Page ':''}{page+1} / {layout.pages}{en?'':' 頁'}</span>
   <button type="button" disabled={page===layout.pages-1} onClick={()=>setPage(p=>p+1)}>{en?'Next →':'下一頁 →'}</button>
  </nav>
 </div>;
}
