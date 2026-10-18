'use client';
import {useEffect,useRef} from 'react';
import PageReader from './PageReader';
import MetricDelta from './MetricDelta';

export default function PolicyResult({en,title,reason,labels,before,after,where,remaining,onNext,finalPolicy,climate}:{climate?:string;en:boolean;title:string;reason:string;labels:string[];before:number[];after:number[];where?:string;remaining?:string;onNext:()=>void;finalPolicy:boolean}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 return <dialog ref={ref} className="policy-impact-dialog policy-result-dialog" aria-labelledby="policy-result-title" onCancel={e=>e.preventDefault()}>
  <small>{en?'ANIMATION COMPLETE · ENVIRONMENTAL RESULTS':'動畫完成・環境影響結果'}</small>
  <h2 id="policy-result-title">{title}</h2>
  <PageReader en={en}>
   <p>{en?'Before this policy → after completion':'這次政策實施前 → 完成後'}</p>
   <div className="impact-numbers">{labels.map((label,i)=><div key={i}><span>{label}</span><b>{before[i]} → {after[i]}</b><MetricDelta value={after[i]-before[i]} en={en}/></div>)}</div>
   {climate&&<p className="climate-result"><strong>{en?'Climate implications':'氣候影響與限制'}</strong>{climate}</p>}
   <p><strong>{en?'Why it changed: ':'影響原因：'}</strong>{reason}</p>
   {where&&<p className="impact-location"><strong>{en?'Affected area: ':'影響位置：'}</strong>{where}</p>}
   {remaining&&<p className="impact-limit"><strong>{en?'Limits and remaining issues':'限制與尚未解決的問題'}</strong>{remaining}</p>}
   <p className="impact-estimate">{en?'These are 0–100 teaching indices. Five seconds compress construction and ecological time; this is not a measured climate prediction.':'這些是 0–100 教學指數。五秒動畫壓縮工程與生態時間，不代表真實氣候預測。'}</p>
  </PageReader>
  <button className="primary result-next" onClick={onNext}>{finalPolicy?(en?'View the changed island →':'返回海島，查看環境變化 →'):(en?'Next · New event →':'下一步・新事件 →')}</button>
 </dialog>;
}
