'use client';
import {useEffect,useRef} from 'react';
import {COMPLETION_CODE} from '@/lib/research-mode';
import './completion-dialog.css';
export default function CompletionDialog({onClose}:{onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return()=>dialog?.close();},[]);
 return <dialog ref={ref} className="completion-dialog" aria-labelledby="completion-title" onCancel={onClose}>
  <p>三關任務全部完成</p><h1 id="completion-title">您的通關密碼</h1>
  <strong className="completion-code" aria-label="通關密碼 2 0 2 6">{COMPLETION_CODE}</strong>
  <p>請記下此密碼，並填寫後續研究問卷。</p>
  <button className="primary" onClick={onClose} autoFocus>已記下密碼，查看成果</button>
 </dialog>;
}
