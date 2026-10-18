'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Check,CheckCircle2,Clock3,CloudCheck,CloudOff,Download,ExternalLink,RadioTower,Ship,Waves,Wind,Compass,RotateCcw} from 'lucide-react';
import {BEHAVIOR_VERSION,PHASES,VARIABLES,newSession,remainingMs,timeoutSession,commitAction,commitLearning,commitTraining,finishLearning,currentId,completedSteps,shuffle,type Session,type Result,type Language,type Phase,type Variable} from '@/lib/behavior-model';
import {TASKS,LESSONS,TAKEAWAYS,type Task} from '@/lib/behavior-content';
import {UI,say} from '@/lib/behavior-copy';
import IslandScene from './IslandScene';
import RescueMission from './RescueMission';
import {islandState,canPlay} from '@/lib/island-simulation';
import './island.css';
import './behavior.css';
const STORAGE='ocean-behavior-v4-session';
type Receipt={revision:number;saved:boolean;demo?:boolean;result?:Result};
type Flash={task:Task;choice:string};
export default function BehaviorGame({initialLanguage='zh-Hant'}:{initialLanguage?:Language}){
 const [language,setLanguage]=useState<Language>(initialLanguage);
 const [motionOn,setMotionOn]=useState(false);
 const t=(key:keyof typeof UI)=>say(UI[key],language);
 const [g,setG]=useState<Session|null>(null),state=useRef<Session|null>(null);
 const [draft,setDraft]=useState<Session|null>(null),[id,setId]=useState(''),[consent,setConsent]=useState(false),[entryError,setEntryError]=useState(false);
 const [connected,setConnected]=useState<boolean|null>(null),[statusError,setStatusError]=useState(false);
 const [receipt,setReceipt]=useState<Receipt|null>(null),receiptRef=useRef<Receipt|null>(null);
 const [result,setResult]=useState<Result|null>(null),resultRef=useRef<Result|null>(null);
 const [storageFailed,setStorageFailed]=useState(false),[saveState,setSaveState]=useState<'idle'|'syncing'|'failed'>('idle');
 const [time,setTime]=useState(Date.now()),[flash,setFlash]=useState<Flash|null>(null),flashLock=useRef(false);
 const [lessonIndex,setLessonIndex]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null),shownAt=useRef(new Date().toISOString()),seenLanguages=useRef<Language[]>(['zh-Hant']);
 const busy=useRef(false),lastAttempt=useRef({revision:0,at:0}),mounted=useRef(false),clockFloor=useRef(0);
 const storeLocal=(s:Session)=>{try{localStorage.setItem(STORAGE,JSON.stringify({session:s,receipt:receiptRef.current,result:resultRef.current}));}catch{setStorageFailed(true);}};
 const update=(s:Session)=>{state.current=s;setG(s);storeLocal(s);};
 const now=()=>{clockFloor.current=Math.max(clockFloor.current,Date.now());return clockFloor.current;};
 const checkConnection=()=>{setStatusError(false);fetch('/api/status',{signal:AbortSignal.timeout(10000)}).then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<{configured:boolean}>;}).then(r=>{if(typeof r.configured!=='boolean')throw Error();setConnected(r.configured);}).catch(()=>setStatusError(true));};
 useEffect(()=>{
  mounted.current=true;checkConnection();setMotionOn(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  try{
   if(localStorage.getItem('ocean-language')==='en')setLanguage('en');
   const saved=localStorage.getItem(STORAGE);
   if(saved){const parsed=JSON.parse(saved);const s=parsed.session as Session;if(s?.version===BEHAVIOR_VERSION&&Array.isArray(s.answers)&&Array.isArray(s.learning)&&Array.isArray(s.training)&&s.answers.length<=27&&s.learning.length<=3&&['pre','learn','post1','post2','results'].includes(s.stage)&&Number.isFinite(Date.parse(s.deadlineAt))){setDraft(s);receiptRef.current=parsed.receipt||null;setReceipt(receiptRef.current);resultRef.current=parsed.result||null;setResult(resultRef.current);}}
  }catch{setStorageFailed(true);}
  return()=>{mounted.current=false;};
 },[]);
 useEffect(()=>{document.documentElement.lang=language;document.title=t('title');document.querySelector('meta[name="description"]')?.setAttribute('content',t('intro'));document.cookie=`ocean_language=${language}; Path=/; Max-Age=31536000; SameSite=Lax`;if(!seenLanguages.current.includes(language))seenLanguages.current.push(language);},[language]);
 const toggleLanguage=()=>{const next=language==='en'?'zh-Hant':'en';setLanguage(next);try{localStorage.setItem('ocean-language',next);}catch{}};
 const sync=async(force=false)=>{
  const s=state.current;if(!s||busy.current)return;
  if(!force&&receiptRef.current?.revision===s.revision&&(s.status==='active'||resultRef.current))return;
  const stamp=Date.now();if(!force&&lastAttempt.current.revision===s.revision&&stamp-lastAttempt.current.at<12000)return;
  busy.current=true;lastAttempt.current={revision:s.revision,at:stamp};setSaveState('syncing');
  try{
   const response=await fetch('/api/behavior',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s),signal:AbortSignal.timeout(16000)});
   const data=await response.json() as {result?:Result;saved?:boolean;demo?:boolean;revision?:number};
   if(state.current?.sessionId!==s.sessionId||!mounted.current)return;
   if(data.result&&s.status!=='active'){resultRef.current=data.result;setResult(data.result);}
   if(!response.ok||(!data.saved&&!data.demo)||data.revision!==s.revision)throw Error('SAVE_UNCONFIRMED');
   const next={revision:s.revision,saved:data.saved===true,demo:data.demo===true};receiptRef.current=next;setReceipt(next);setSaveState('idle');
  }catch{if(state.current?.sessionId===s.sessionId&&mounted.current)setSaveState('failed');}
  finally{busy.current=false;if(state.current?.sessionId===s.sessionId)storeLocal(state.current);}
 };
 useEffect(()=>{
  if(!g)return;
  const tick=()=>{const value=now();setTime(value);const s=state.current;if(!s)return;const next=timeoutSession(s,value);if(next!==s){setFlash(null);flashLock.current=false;update(next);}};
  tick();const timer=window.setInterval(tick,250);document.addEventListener('visibilitychange',tick);window.addEventListener('focus',tick);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',tick);window.removeEventListener('focus',tick);};
 },[g?.sessionId]);
 useEffect(()=>{if(!g)return;const timer=window.setTimeout(()=>void sync(),250);return()=>clearTimeout(timer);},[g?.revision]);
 useEffect(()=>{const tick=window.setInterval(()=>void sync(),3000),online=()=>void sync(true);window.addEventListener('online',online);return()=>{clearInterval(tick);window.removeEventListener('online',online);};},[]);
 const taskId=g?currentId(g):null;
 useEffect(()=>{shownAt.current=new Date(now()).toISOString();seenLanguages.current=[language];if(!flash){heading.current?.focus({preventScroll:true});document.querySelector('.command-layout,.news-lab,.behavior-results')?.scrollIntoView({block:'start',behavior:'auto'});}},[taskId,g?.stage,flash,lessonIndex]);
 const start=()=>{
  const value=id.trim();if(!/^[A-Za-z0-9_-]{3,32}$/.test(value)||!consent){setEntryError(true);return;}if(connected===null||draft)return;
  receiptRef.current=null;setReceipt(null);resultRef.current=null;setResult(null);setEntryError(false);setLessonIndex(0);
  const n=now();setTime(n);update(newSession(value,crypto.randomUUID(),n,!connected||/^TEST_/i.test(value),window.matchMedia('(prefers-reduced-motion: reduce)').matches));
 };
 const resume=()=>{if(!draft)return;setLessonIndex(Math.min(draft.learning.length,2));const n=now();setTime(n);update(timeoutSession(draft,n));setDraft(null);};
 const choose=(task:Task,choice:string,order:string[])=>{
  const s=state.current;if(!s||flashLock.current||currentId(s)!==task.id)return;
  const n=now();const timed=timeoutSession(s,n);if(timed!==s){update(timed);return;}
  flashLock.current=true;setFlash({task,choice});
  update(commitAction(s,{id:task.id,choice,order,language,languagesSeen:[...seenLanguages.current],shownAt:shownAt.current,at:new Date(n).toISOString(),elapsedMs:n-Date.parse(s.startedAt)}));

 };
 const chooseLesson=(choice:string)=>{const s=state.current;if(!s||s.learning.length!==lessonIndex)return;const n=now();update(commitLearning(s,{id:`learn-${lessonIndex}`,choice,language,at:new Date(n).toISOString(),elapsedMs:n-Date.parse(s.startedAt)}));};
 const sailOn=()=>{setFlash(null);flashLock.current=false;};
 const moveInIsland=(action:string)=>{const s=state.current;if(!s||s.learning.length!==lessonIndex)return;const world=islandState(LESSONS[lessonIndex].theme,s.training.filter(m=>m.lesson===lessonIndex).map(m=>m.action));if(!canPlay(world,action))return;const n=now();update(commitTraining(s,{lesson:lessonIndex,action,at:new Date(n).toISOString(),elapsedMs:n-Date.parse(s.startedAt)}));};
 const nextLesson=()=>{const s=state.current;if(!s)return;const timed=timeoutSession(s,now());if(timed!==s){update(timed);return;}if(lessonIndex<2)setLessonIndex(lessonIndex+1);else update(finishLearning(s,now()));};
 const download=()=>{const s=state.current||draft;if(!s)return;const url=URL.createObjectURL(new Blob([JSON.stringify({session:s,result:resultRef.current,receipt:receiptRef.current},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`ocean-v4-${s.userId}-${s.sessionId.slice(0,8)}.json`;a.click();URL.revokeObjectURL(url);};
 const reset=()=>{const s=state.current||draft;if(s&&!s.isTest&&(!receiptRef.current?.saved||receiptRef.current.revision!==s.revision)&&!window.confirm(t('confirmClear')))return;try{localStorage.removeItem(STORAGE);}catch{}state.current=null;setG(null);setDraft(null);setId('');setConsent(false);receiptRef.current=null;resultRef.current=null;setResult(null);setReceipt(null);setSaveState('idle');setFlash(null);flashLock.current=false;};
 const currentTask=g&&['pre','post1','post2'].includes(g.stage)?TASKS[g.stage as Phase].find(q=>q.id===taskId):undefined;
 const task=flash?.task||currentTask;
 const options=task?shuffle(task.options,(g?.sessionId||'')+task.id):[];
 const lesson=LESSONS[lessonIndex],chosen=g?lesson.options.find(o=>o.id===g.learning[lessonIndex]?.choice):undefined;
 const world=islandState(lesson.theme,g?.training.filter(m=>m.lesson===lessonIndex).map(m=>m.action)||[]);
 const left=g?Math.ceil(remainingMs(g,time)/1000):600;
 const timerText=`${Math.floor(left/60).toString().padStart(2,'0')}:${(left%60).toString().padStart(2,'0')}`;
 const step=g?.stage==='results'?4:g?.stage==='post2'?3:g?.stage==='post1'?2:g?.stage==='learn'?1:0;
 const progress=g?Math.min(g.answers.length/27*100,100):0;
 const latest=!!g&&receipt?.revision===g.revision;
 const saveLabel=saveState==='syncing'?'syncing':latest?(receipt?.saved?'synced':'localOnly'):saveState==='failed'?'saveFailed':'pending';
 const metric=(v:Variable)=>t(`${v}Metric` as keyof typeof UI);
 const display=(v:number|null|undefined)=>v===null||v===undefined?'—':String(v);
 const delta=(v:number|null|undefined)=>v===null||v===undefined?'—':v>0?`+${v}`:String(v);
 return <main className={`site-shell behavior-app ${motionOn?'motion-on':'motion-off'}`} data-language={language} data-version={BEHAVIOR_VERSION}>
  <header className="masthead"><div className="brand"><span className="brand-mark"><Waves size={22}/></span><div>{t('title')}<small>OCEAN POLICY DISPATCH</small></div></div>{g&&<span className="user-badge">ID <strong>{g.userId}</strong></span>}<button className="language-toggle" onClick={toggleLanguage} aria-label={language==='en'?'Switch to Chinese':'切換成英文'}>{language==='en'?'Chinese':'English'}</button></header>
  <div className="status-strip"><button className="motion-toggle" onClick={()=>setMotionOn(!motionOn)} aria-pressed={motionOn}>{language==='en'?(motionOn?'Motion: on':'Motion: off'):(motionOn?'動態效果：開':'動態效果：關')}</button><span><i className={`status-dot ${connected?'live':''}`}/>{t(connected===null?'checking':connected?'connected':'demo')}</span><span className="tiny-note">{t('duration')}</span></div>
  {storageFailed&&<p className="notice" role="alert">{t('storageFailed')}</p>}
  {!g&&<section className="welcome-grid">
   <div className="welcome-copy"><p className="eyebrow">{t('click')}</p><h1>{t('hero').split('\n').map((s,i)=><span key={s} className={i?'serif-accent':''}>{s}{i===0&&<br/>}</span>)}</h1><p className="intro">{t('intro')}</p><div className="feature-row"><span><Clock3 size={17}/>{t('duration')}</span><span><Compass size={17}/>{t('measures')}</span></div>
    {draft?<div className="resume-box"><strong>ID {draft.userId}</strong><p>{t('resumeNote')}</p><button onClick={resume}>{t('resume')} <ArrowRight size={18}/></button><button onClick={download}><Download size={17}/>{t('download')}</button><button onClick={reset}>{t('finish')}</button></div>:<form className="entry-card" onSubmit={e=>{e.preventDefault();start();}}><label htmlFor="userid">{t('id')}</label><div className="entry-line"><input id="userid" value={id} onChange={e=>setId(e.target.value)} maxLength={32} autoComplete="off" spellCheck={false} placeholder={t('placeholder')} aria-describedby="id-help"/><button className="primary" type="submit" disabled={connected===null}>{t('start')}<ArrowRight size={18}/></button></div><p id="id-help" className="field-help">{t('idHint')}</p><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t(connected?'consentLive':'consentDemo')}</span></label>{entryError&&<p className="error" role="alert">{t('invalidId')}</p>}</form>}
    {statusError&&<div className="connection-error"><p>{t('statusError')}</p><button className="secondary" onClick={checkConnection}>{t('retry')}</button></div>}<p className="entry-foot">{t('resumeNote')}</p>
   </div><div className="welcome-art"><IslandScene language={language} kind="wind" world={islandState("wind",["survey","turbine","cable","battery"])}/><div className="art-caption"><span className="small-caps">POLICY · EVIDENCE · RESPONSE</span><p>{t('subtitle')}</p></div><div className="welcome-stats"><div><strong>03</strong><span>{t('measures')}</span></div><div><strong>10:00</strong><span>{t('time')}</span></div><div><strong>01</strong><span>{t('click')}</span></div></div></div>
  </section>}
  {g&&<><div className="mission-toolbar"><nav className="journey" aria-label={t('mission')}>{(['pre','learn','post1','post2'] as const).map((p,i)=><div key={p} className={step===i?'current':completedSteps(g)[i]?'complete':''}><span>{completedSteps(g)[i]?<Check size={12}/>:i+1}</span>{t(p)}</div>)}</nav>{g.status==='active'&&<div className={`mission-clock ${left<=60?'urgent':''}`} aria-label={`${t('time')} ${timerText}`}><Clock3 size={16}/><span>{timerText}</span></div>}</div><div className="overall-progress" aria-hidden><i style={{width:`${progress}%`}}/></div>{left<=60&&g.status==='active'&&<p role="status" className="time-warning">{t('timeWarning')}</p>}</>}
  {g&&task&&g.status!=='timed_out'&&<section className="command-layout">
   <div className="command-visual"><div className="mission-heading"><span className="eyebrow">{t(task.theme)} · {Math.floor(Number(task.id.split('-')[1])/3)+1}/3</span><h2 ref={heading} tabIndex={-1}>{say(task.title,language)}</h2></div><div className={`assessment-map ${flash?'dispatching':''}`}><IslandScene language={language} kind={task.theme} variable={task.variable} choice={flash?.choice} phase={task.phase}/></div><p className="map-note">{t('neutralMap')}</p><div className="action-route">{VARIABLES.map((v,i)=><span key={v} className={v===task.variable?'active':''}>{i+1}<b>{t(v)}</b></span>)}</div></div>
   <article className="command-card"><div className="command-card-top"><span>{t(task.variable)}</span><span>{Number(task.id.split('-')[1])+1} / 9</span></div>{task.variable!=='policy'&&<p className="fixed-context">{t('fixed')}</p>}<h3>{say(task.prompt,language)}</h3><div className="command-options">{options.map((o,i)=><button className={`command-option ${flash?.choice===o.id?'selected':''}`} key={o.id} disabled={!!flash} onClick={()=>choose(task,o.id,options.map(x=>x.id))}><span className="crew-icon">{flash?.choice===o.id?<Check size={19}/>:String(i+1).padStart(2,'0')}</span><span>{say(o.label,language)}</span><ArrowRight size={17}/></button>)}</div>{flash?<button className="primary sail-next" onClick={sailOn}>{language==='en'?'Command deployed · Continue':'部署完成・繼續航行'}<ArrowRight size={18}/></button>:<p className="command-instruction">{t('dispatch')}</p>}<p className="quiet">{t('noFeedback')}</p></article>
  </section>}
  {g?.stage==='learn'&&!flash&&<section className="news-lab"><div className="lab-heading"><p className="eyebrow">{t('learn')} · {lessonIndex+1}/3</p><h2 ref={heading} tabIndex={-1}>{say(lesson.title,language)}</h2><details className="news-details"><summary>{language==='en'?'Real news behind this mission':'這個任務的真實新聞'}</summary><p>{say(lesson.summary,language)}</p><a href={lesson.url} target="_blank" rel="noreferrer">{say(lesson.source,language)} · {lesson.date} · {t('source')}<ExternalLink size={12}/></a></details></div><RescueMission key={lessonIndex} world={world} language={language} onMove={moveInIsland} onFinish={()=>{chooseLesson(lesson.options[world.won?0:1].id);nextLesson();}}/>{chosen&&<div className="learning-effect"><p>{say(chosen.effect,language)}</p><button className="primary" onClick={nextLesson}>{t(lessonIndex===2?'nextPhase':'next')}<ArrowRight size={17}/></button></div>}<p className="quiet">{t('newsNote')}</p></section>}
  {g?.stage==='results'&&!flash&&<section className="results behavior-results"><div className="results-heading"><span className="completion-mark"><CheckCircle2 size={30}/></span><p className="eyebrow">{t('results')} · ID {g.userId}</p><h2 ref={heading} tabIndex={-1}>{t(g.status==='timed_out'?'timedOut':'completed')}</h2><p>{t('scoreHelp')}</p><p className="quiet">{t('recordCount')} {g.answers.length}/27 · {t('readOnlyResults')}</p></div>{g.status==='timed_out'&&<p className="notice">{t('timeoutPartial')}</p>}<div className="behavior-scores">{VARIABLES.map(v=><article className="behavior-score" key={v}><span className="eyebrow">{v==='policy'?<Ship size={17}/>:v==='monitor'?<RadioTower size={17}/>:<Compass size={17}/>}</span><h3>{metric(v)}</h3><div className="phase-values">{PHASES.map(p=><div key={p}><span>{t(`${p}Score` as keyof typeof UI)}</span><strong>{display(result?.scores[p][v])}<small>/3</small></strong></div>)}</div><div className="behavior-gains"><span>{t('gain1')}<b>{delta(result?.gains.post1[v])}</b></span><span>{t('gain2')}<b>{delta(result?.gains.post2[v])}</b></span></div></article>)}</div><p className="quiet">{t('missing')}</p>{!result&&<p className="notice">{t('resultPending')}</p>}<p className="measurement-note">{t('limitation')}</p><h3 className="review-title">{t('review')}</h3><div className="takeaways">{TAKEAWAYS.map((copy,i)=><article key={i}><span>0{i+1}</span><p>{say(copy,language)}</p></article>)}</div><div className="button-row"><button className="secondary" onClick={download}><Download size={17}/>{t('download')}</button><button className="primary" onClick={reset}>{t('finish')}<Check size={17}/></button></div><p className="quiet">{t('clearNote')}</p></section>}
  {g&&<div className={`sync-status ${saveState==='failed'?'save-warning':''}`} role="status">{latest&&receipt?.saved?<CloudCheck size={16}/>:<CloudOff size={16}/>}<span>{t(saveLabel)}</span>{(saveState==='failed'||g.stage==='results'&&!result)&&<button onClick={()=>void sync(true)}><RotateCcw size={14}/>{t('retrySave')}</button>}{storageFailed&&<button onClick={download}>{t('download')}</button>}</div>}
  <footer className="footer"><span>{t('footer')}</span><span>v4.0 · {g?.sessionId.slice(0,8)||'POLICY / CLIMATE'}</span></footer>
 </main>;
}
