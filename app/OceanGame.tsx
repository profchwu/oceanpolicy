'use client';
import {useState,useEffect,useRef,useMemo} from 'react';
import {ArrowRight,Check,CheckCircle2,Waves,Wind,BookOpen,RotateCcw,Download,ExternalLink,LoaderCircle,CloudCheck,CloudOff,Info} from 'lucide-react';
import {PHASES,PHASE_LABELS,PHASE_DESCRIPTIONS,QUESTIONS,NEWS,EXPLANATIONS,VERSION,type Phase,type SceneKind} from '@/lib/content';
import type {Submission,Answer,Event} from '@/lib/assessment';
import {scoreChange,formatChange} from '@/lib/progress';
import OceanScene from './OceanScene';
import {translate,DEFAULT_LANGUAGE,type Language} from '@/lib/i18n';
type Screen='welcome'|'quiz'|'learning-intro'|'learning'|'transition'|'saving'|'results';
type Score={correct:number;total:number;percent:number;unknown:number;correctness:boolean[]};
type Receipt={saved:boolean;score:Score;demo?:boolean};
type GameState={screen:Screen;userId:string;sessionId:string;startedAt:string;phase:Phase;question:number;answers:Answer[];records:Partial<Record<Phase,Submission>>;receipts:Partial<Record<Phase,Receipt>>;events:Event[];budget:number;lesson:number;policies:string[];isTest:boolean;reducedMotion:boolean};
const STORAGE='ocean-click-v2-session';
const empty=():GameState=>({screen:'welcome',userId:'',sessionId:'',startedAt:'',phase:'pre',question:0,answers:[],records:{},receipts:{},events:[],budget:5,lesson:0,policies:[],isTest:true,reducedMotion:false});
const now=()=>new Date().toISOString();
function shuffled<T>(items:T[],seed:string){let v=2166136261;for(const c of seed)v=Math.imul(v^c.charCodeAt(0),16777619);const a=[...items];for(let i=a.length-1;i>0;i--){v^=v<<13;v^=v>>>17;v^=v<<5;const j=(v>>>0)%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function event(g:GameState,type:string,detail=''):Event{return {type,detail,at:now(),elapsedMs:Math.max(0,Date.now()-Date.parse(g.startedAt||now()))};}
export default function OceanGame(){
 const [language,setLanguage]=useState<Language>(DEFAULT_LANGUAGE);
 const t=(text:string,values:Record<string,string|number>={})=>translate(language,text,values);
 const seenLanguages=useRef<Language[]>([DEFAULT_LANGUAGE]);
 useEffect(()=>{try{const saved=localStorage.getItem('ocean-language');if(saved==='en')setLanguage('en');}catch{}},[]);
 useEffect(()=>{
  document.documentElement.lang=language;
  document.title=t('海洋決策快報｜點一下，看見政策的影響');
  document.querySelector('meta[name="description"]')?.setAttribute('content',t('從真實海洋新聞出發，用點選體驗政策取捨，記錄前測與兩次後測的認知改變。'));
  if(!seenLanguages.current.includes(language))seenLanguages.current.push(language);
 },[language]);
 const toggleLanguage=()=>{const next=language==='en'?'zh-Hant':'en';setLanguage(next);try{localStorage.setItem('ocean-language',next);}catch{}};
 const [g,setG]=useState<GameState>(empty); const [ready,setReady]=useState(false); const [connected,setConnected]=useState<boolean|null>(null);
 const [id,setId]=useState(''); const [consent,setConsent]=useState(false); const [error,setError]=useState(''); const [selected,setSelected]=useState<string|null>(null); const [busy,setBusy]=useState(false); const [savedDraft,setSavedDraft]=useState<GameState|null>(null);const [storageWarning,setStorageWarning]=useState(false);
 const answering=useRef(false);const submitting=useRef(false);const shown=useRef({at:now(),tick:0});const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
   fetch('/api/status').then(async r=>{if(!r.ok)throw Error();return await r.json() as {configured:boolean};}).then(r=>setConnected(r.configured===true)).catch(()=>{setConnected(null);setError('連線檢查失敗，請重新整理後再開始。');});
   try{const text=localStorage.getItem(STORAGE);if(text){const draft=JSON.parse(text);if(draft.version===VERSION&&draft.state?.sessionId)setSavedDraft(draft.state);}}catch{setStorageWarning(true);}
   setReady(true);
 },[]);
 useEffect(()=>{if(!ready||!g.sessionId)return;try{localStorage.setItem(STORAGE,JSON.stringify({version:VERSION,state:g}));}catch{setStorageWarning(true);}},[g,ready]);
 useEffect(()=>{shown.current={at:now(),tick:performance.now()};seenLanguages.current=[language];answering.current=false;setSelected(null);if(g.screen!=='welcome')heading.current?.focus();},[g.screen,g.phase,g.question,g.lesson]);
 useEffect(()=>{const onVisibility=()=>setG(s=>s.sessionId&&s.screen!=='results'?{...s,events:[...s.events,event(s,'visibility',document.visibilityState)].slice(-300)}:s);document.addEventListener('visibilitychange',onVisibility);return()=>document.removeEventListener('visibilitychange',onVisibility);},[]);
 const q=QUESTIONS[g.phase][g.question];
 const options=useMemo(()=>shuffled(q.options.filter(o=>o.id!=='unknown'),g.sessionId+q.id).concat(q.options.filter(o=>o.id==='unknown')),[q,g.sessionId]);
 const lesson=NEWS[g.lesson];const chosen=lesson.policies.find(p=>p.id===g.policies[g.lesson]);
 const start=()=>{
  const value=id.trim();if(!/^[A-Za-z0-9_-]{3,32}$/.test(value)){setError('請輸入 3–32 個英文字母、數字、底線或短橫線。');return;}
  if(!consent){setError('請先勾選下方的紀錄說明。');return;}if(connected===null)return;
  const s={...empty(),screen:'quiz' as Screen,userId:value,sessionId:crypto.randomUUID(),startedAt:now(),isTest:!connected||/^TEST_/i.test(value),reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches};s.events=[event(s,'start',connected?'sheets':'demo'),event(s,'language',language)];setG(s);setError('');setSavedDraft(null);
 };
 const advanceAfterSave=(s:GameState,receipt:Receipt)=>{
  const screen:Screen=s.phase==='pre'?'learning-intro':s.phase==='post1'?'transition':'results';
  setG({...s,screen,receipts:{...s.receipts,[s.phase]:receipt}});setError('');setBusy(false);submitting.current=false;
 };
 const save=async(s:GameState)=>{
  if(submitting.current)return;submitting.current=true;setBusy(true);setError('');
  // Retry the frozen phase record so a lost receipt cannot duplicate a submission.
  for(let attempt=0;attempt<3;attempt++){
   let retryable=true;
   try{
    const response=await fetch('/api/record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(s.records[s.phase]),signal:AbortSignal.timeout(25000)});
    retryable=response.status>=500||response.status===408||response.status===429;
    const receipt=await response.json() as Receipt & {error?:string};
    if(!response.ok)throw Error(receipt.error||'暫時無法儲存');
    if(!receipt.saved&&!receipt.demo)throw Error('沒有收到儲存確認');
    advanceAfterSave(s,receipt);return;
   }catch(e){
    if(retryable&&attempt<2){setError(`retry_${attempt+1}`);await new Promise(resolve=>window.setTimeout(resolve,1500*(attempt+1)));continue;}
    setError(e instanceof Error&&e.name!=='TimeoutError'?e.message:'儲存連線逾時，請重試。');setBusy(false);submitting.current=false;return;
   }
  }
 };
 const answer=(value:string)=>{
  if(answering.current)return;answering.current=true;setSelected(value);
  const a:Answer={language,languagesSeen:[...seenLanguages.current],itemId:q.id,value,responseMs:Math.round(performance.now()-shown.current.tick),order:options.map(o=>o.id),shownAt:shown.current.at,answeredAt:now()};
  const next={...g,answers:[...g.answers,a],events:[...g.events,event(g,'answer',q.id)]};
  window.setTimeout(()=>{
   if(g.question<5){setG({...next,question:g.question+1});return;}
   const record:Submission={sessionId:next.sessionId,userId:next.userId,phase:next.phase,version:VERSION,startedAt:next.startedAt,completedAt:now(),reducedMotion:next.reducedMotion,answers:next.answers,events:next.events,isTest:next.isTest,consentVersion:'notice-v2'};
   const pending={...next,screen:'saving' as Screen,records:{...next.records,[next.phase]:record}};setG(pending);void save(pending);
  },360);
 };
 const choosePolicy=(policyId:string)=>{
  if(chosen)return;const p=lesson.policies.find(p=>p.id===policyId);if(!p||p.cost>g.budget)return;
  setG({...g,budget:g.budget-p.cost,policies:[...g.policies,p.id],events:[...g.events,event(g,'policy_selected',p.id)]});
  if(window.matchMedia('(max-width: 760px)').matches)requestAnimationFrame(()=>document.querySelector('.scene-panel')?.scrollIntoView({behavior:g.reducedMotion?'auto':'smooth',block:'start'}));
 };
 const nextLesson=()=>{if(!chosen)return;if(g.lesson<2)setG({...g,lesson:g.lesson+1});else setG({...g,phase:'post1',screen:'quiz',question:0,answers:[],events:[...g.events,event(g,'learning_complete')]});};
 const resume=()=>{if(!savedDraft)return;setG(savedDraft);setSavedDraft(null);setError('');if(savedDraft.screen==='saving')void save(savedDraft);};
 const download=()=>{const blob=new Blob([JSON.stringify({version:VERSION,...g},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ocean-${g.userId}-${g.sessionId.slice(0,8)}.json`;a.click();URL.revokeObjectURL(url);};
 const reset=()=>{try{localStorage.removeItem(STORAGE);}catch{}setG(empty());setSavedDraft(null);setId('');setConsent(false);setError('');};
 const stage=g.screen==='learning'||g.screen==='learning-intro'?t("政策體驗"):g.screen==='results'?t("完成"):PHASE_LABELS[g.phase];
 const titleProps={ref:heading,tabIndex:-1};
 return <main className="site-shell" data-language={language} data-visual-style="command">
  <header className="masthead"><div className="brand"><span className="brand-mark"><Waves size={23}/></span><div>{t("海洋決策快報")}<small>{language==='en'?'EXPLORE · CHOOSE · UNDERSTAND':'OCEAN POLICY DISPATCH'}</small></div></div><span className="edition">{t("單人探索 ")}<span>／</span>{t(" 海洋 × 氣候")}</span>{g.sessionId&&<div className="user-badge">ID <strong>{g.userId}</strong></div>}<button className="language-toggle" type="button" onClick={toggleLanguage} aria-label={language==='en'?'Switch to Chinese':t("切換成英文")}>{language==='en'?'Chinese':'English'}</button></header>
  <div className="status-strip"><span><span className={`status-dot ${connected?'live':''}`}/>{connected===null?t("正在確認連線…"):connected?t("Google Sheets 紀錄已啟用"):t("試玩模式・Google Sheets 尚未連線")}</span><span className="tiny-note">{t("真實新聞 × 政策選擇 × 認知變化")}</span></div>
  {storageWarning&&<div className="notice warning">{t("此瀏覽器無法保留暫存。請勿關閉頁面；若儲存失敗，可下載答案備份。")}</div>}
  {g.screen!=='welcome'&&<nav className="journey" aria-label={t("遊戲進度")}>{[t("第一關 前測"),t("政策體驗"),t("第二關 後測一"),t("第三關 後測二")].map((label,i)=>{const current=g.screen==='results'?4:g.phase==='post2'?3:g.phase==='post1'?2:g.screen.startsWith('learning')?1:0;return <div className={current===i?'current':current>i?'complete':''} key={label}><span>{current>i?<Check size={13}/>:i===1?<Waves size={14}/>:i===0?'1':i===2?'2':'3'}</span>{label}</div>;})}</nav>}
  {g.screen==='welcome'&&<section className="welcome-grid"><div className="welcome-copy"><div className="eyebrow"><span/>{t(" 給海洋的一份選擇")}</div><h1>{t("點一下，")}<br/>{t("看見政策的")}<span className="serif-accent">{t("影響。")}</span></h1><p className="intro">{t("風場、海草、珊瑚。")}<br/>{t("每一個選擇，都有值得理解的下一步。")}</p><div className="feature-row"><span><Wind size={17}/>{t(" 真實新聞")}</span><span><Waves size={17}/>{t(" 動態海島")}</span><span><BookOpen size={17}/>{t(" 三關認知紀錄")}</span></div>
   {savedDraft&&<div className="resume-box"><strong>{t("有一份尚在此裝置的紀錄：")}{savedDraft.userId}</strong><button onClick={resume}>{t("繼續上次進度 ")}<ArrowRight size={17}/></button></div>}
   <form className="entry-card" onSubmit={e=>{e.preventDefault();start();}}><label htmlFor="userid">{t("你的 User ID ")}<span>{t("自訂玩家代碼")}</span></label><div className="entry-line"><input id="userid" value={id} onChange={e=>setId(e.target.value)} placeholder={t("例如 OCEAN123")} maxLength={32} autoComplete="off" spellCheck={false} aria-describedby="id-help"/><button className="primary" disabled={!ready||connected===null} type="submit">{connected?t("開始前測"):t("開始試玩")} <ArrowRight size={19}/></button></div><p id="id-help" className="field-help">{t("自行設定 3–32 個英數字、底線或短橫線；請勿填寫真實姓名或電話。")}</p><label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{connected?t("我了解此體驗會把 User ID、作答與操作紀錄存入研究者的 Google 試算表，並自願參與。"):t("我了解目前是試玩模式，答案只暫存於此裝置，尚未寫入 Google Sheets。")}</span></label>{error&&<p role="alert" className="error">{t(error)}</p>}</form>
   <p className="entry-foot">{t("單人遊玩，輸入代碼後就能開始，全程點選操作。")}<br/>{t("三關各 6 題；依目前理解作答，不確定也可以直接選。")}</p></div><div className="welcome-art"><OceanScene language={language} active kind="wind"/><div className="art-caption"><span className="small-caps">A SMALL ISLAND. REAL QUESTIONS.</span><p>{t("你的海島，正在等一個選擇。")}</p><span className="art-stamp">{t("點選")}<br/>{t("探索")}</span></div></div></section>}
  {g.screen==='quiz'&&<section className="quiz-grid"><aside className="quiz-side"><div className="eyebrow">{t(stage)}</div><h2 {...titleProps}>{t(PHASE_DESCRIPTIONS[g.phase])}</h2><p>{g.phase==='pre'?t("不用先做功課。選出你現在認為最合理的說法。"):g.phase==='post1'?t("把剛才看見的政策作用，放回你的判斷裡。"):t("這次換成新的海島情境，看看概念能不能帶著走。")}</p><div className="quiz-progress"><span>{g.question+1}<small> / 6</small></span><div className="progress-track"><i style={{width:`${g.question/6*100}%`}}/></div></div><OceanScene language={language} kind={(['wind','grass','reef'] as SceneKind[])[g.question%3]} reduced={g.reducedMotion}/><p className="quiet">{t("點選即記錄，每關完成後自動儲存。三關完成後再看答案。")}</p></aside><article className="question-card" key={q.id}><div className="question-meta"><span>QUESTION {String(g.question+1).padStart(2,'0')}</span><span>{t(q.domain)}</span></div><h3>{t(q.title)}</h3><div className="answer-options">{options.map((o,i)=><button disabled={selected!==null} onClick={()=>answer(o.id)} className={`answer ${o.id==='unknown'?'unknown':''} ${selected===o.id?'selected':''}`} key={o.id}><span className="answer-letter">{selected===o.id?<Check size={18}/>:o.id==='unknown'?'?':String.fromCharCode(65+i)}</span><span>{t(o.text)}</span><ArrowRight className="option-arrow" size={17}/></button>)}</div><p className="answer-note" aria-live="polite">{selected?t("已記錄，前往下一題…"):t("沒有倒數計時，依你的理解點選即可。")}</p></article></section>}
  {g.screen==='learning-intro'&&<section className="interlude"><div className="interlude-copy"><div className="eyebrow">{t("前測完成 / 政策體驗")}</div><h2 {...titleProps}>{t("現在，換你")}<br/>{t("為海島做選擇。")}</h2><p>{t("你有 ")}<strong>{t("5 枚經費")}</strong>{t("，面對 3 則新聞。")}<br/>{t("點一張政策卡，海島就會顯示可能的變化。")}</p><div className="note-box"><Info size={18}/><span>{t("動畫將時間快轉。政策的真實效果需要建置、執行與監測。")}</span></div><button className="primary large" onClick={()=>setG({...g,screen:'learning'})}>{t("看第一則新聞 ")}<ArrowRight size={20}/></button><p className="save-caption">{g.receipts.pre?.saved?<><CloudCheck size={16}/>{t(" 前測已存入 Google Sheets")}</>:<><CloudOff size={16}/>{t(" 前測僅保留為試玩紀錄")}</>}</p></div><OceanScene language={language} active kind="wind" reduced={g.reducedMotion}/></section>}
  {g.screen==='learning'&&<section className="learning-grid"><article className="news-panel"><div className="news-heading"><div className="news-kicker"><span>{t(lesson.type)} · {g.lesson+1}/3</span><span className="budget">{t("經費 ")}<strong>{g.budget}</strong> / 5</span></div><p className="news-date">{t("真實新聞改編 · ")}{lesson.date}</p><h2 {...titleProps}>{t(lesson.title)}</h2><p className="news-summary">{t(lesson.summary)}</p><a className="source-link" href={lesson.url} target="_blank" rel="noreferrer" onClick={()=>setG(s=>({...s,events:[...s.events,event(s,'source_open',lesson.id)]}))}>{t(lesson.source)}{t(" · 查看新聞 ")}<ExternalLink size={13}/></a></div><div className="policy-panel"><div className="policies">{lesson.policies.map(p=><button className={`policy ${chosen?.id===p.id?'chosen':''}`} disabled={Boolean(chosen)||p.cost>g.budget} onClick={()=>choosePolicy(p.id)} key={p.id}><div><strong>{t(p.title)}</strong><span>{p.cost===0?t("不增加經費"):t('{count} 枚經費',{count:p.cost})}</span></div><p>{t(p.description)}</p><span className="policy-action">{chosen?.id===p.id?<><Check size={15}/>{t(" 已執行")}</>:p.cost>g.budget?t("剩餘經費不足"):t("點選執行")} {!chosen&&p.cost<=g.budget&&<ArrowRight size={15}/>}</span></button>)}</div><p className="quiet">{t("政策組合與經費為教學情境，不是新聞中的實際方案。")}</p></div></article><div className="scene-panel"><OceanScene language={language} key={lesson.id} kind={lesson.scene} active={Boolean(chosen?.active)} playing={Boolean(chosen)} reduced={g.reducedMotion}/><div className={`consequence ${chosen?'revealed':''}`} aria-live="polite">{chosen?<><span className="eyebrow">{t("你選擇後，可能的作用過程")}</span><h3>{t(chosen.effect)}</h3><p>{t(chosen.caption)}</p><button className="primary" onClick={nextLesson}>{g.lesson<2?t("下一則新聞"):t("進入第二關・後測一")} <ArrowRight size={18}/></button></>:<><span className="eyebrow">{t("輪到你來決定")}</span><h3>{t("點一張政策卡，看見改變。")}</h3><p>{t("選擇有不同的效益、成本與限制。")}</p></>}</div></div></section>}
  {g.screen==='transition'&&<section className="interlude"><div className="interlude-copy"><div className="eyebrow">{t("第二關完成")}</div><h2 {...titleProps}>{t("把理解，")}<br/>{t("帶到另一座海島。")}</h2><p>{t("最後 6 題，換成新的情境。")}<br/>{t("不需要再學一套操作，繼續點選就好。")}</p><button className="primary large" onClick={()=>setG({...g,phase:'post2',screen:'quiz',question:0,answers:[]})}>{t("進入第三關・後測二 ")}<ArrowRight size={20}/></button><p className="save-caption">{g.receipts.post1?.saved?<><CloudCheck size={16}/>{t(" 後測一已存入 Google Sheets")}</>:<><CloudOff size={16}/>{t(" 後測一僅保留為試玩紀錄")}</>}</p></div><OceanScene language={language} active kind="grass" reduced={g.reducedMotion}/></section>}
  {g.screen==='saving'&&<section className="saving-panel"><div className="saving-icon">{busy?<LoaderCircle className="spin" size={36}/>:<CloudOff size={36}/>}</div><div className="eyebrow">{t(PHASE_LABELS[g.phase])} · {t('完成')}</div><h2 {...titleProps}>{busy?t("正在保存你的回答…"):t("回答已保留，等待儲存。")}</h2><p>{busy?(g.isTest?t("整理這次試玩的紀錄。"):t("收到 Google Sheets 確認後，會自動繼續。")):t("重試會送出同一份紀錄，不會重複新增同一關。")}</p>{error&&<p role="alert" className="error">{t(error)}</p>}{!busy&&<div className="button-row"><button className="primary" onClick={()=>void save(g)}><RotateCcw size={17}/>{t(" 重試儲存")}</button><button className="secondary" onClick={download}><Download size={17}/>{t(" 下載備份")}</button></div>}</section>}
  {g.screen==='results'&&<section className="results"><div className="results-heading"><span className="completion-mark"><CheckCircle2 size={32}/></span><div className="eyebrow">{t("三關完成 · USER ID ")}{g.userId}</div><h2 {...titleProps}>{t("看見選擇，也看見理解。")}</h2><p>{t("只看政策正確認知：每關 6 題，答對 1 題得 1 分。")}</p></div><div className="score-grid">{PHASES.map((phase,i)=>{const s=g.receipts[phase]?.score;return <article className={`score-card score-${i}`} key={phase}><span>{t(PHASE_LABELS[phase])}</span><div>{s?.correct??'—'}<small>/ 6</small></div><div className="six-dots" aria-hidden>{Array.from({length:6},(_,n)=><i className={n<(s?.correct||0)?'filled':''} key={n}/>)}</div><p>{t('答對 {count} 題',{count:s?.correct??'—'})}</p></article>;})}</div><div className="progress-summary"><div className="progress-formula"><span className="eyebrow">{t("看看答對題數的變化")}</span><h3>{t("進步分數 ＝ 後測 − 前測")}</h3><p>{t("例如前測 3 分、後測 5 分，就是 +2 分，多答對 2 題。")}</p></div><div className="gain-grid">{(['post1','post2'] as const).map(phase=>{const change=scoreChange(g.receipts[phase]?.score.correct,g.receipts.pre?.score.correct);return <article className="gain-card" key={phase}><span>{phase==='post1'?t("後測一"):t("後測二")}{t(" − 前測")}</span><strong>{formatChange(change)}<small>{t(" 分")}</small></strong><p>{change===null?t("尚未完成"):change>0?t('多答對 {count} 題',{count:change}):change<0?t('少答對 {count} 題',{count:Math.abs(change)}):t("答對題數相同")}</p></article>;})}</div></div><p className="measurement-note">{t("三個分數記錄同一項政策認知。後測二採新情境；題本尚未驗證等值，分數差異不能單獨證明遊戲的學習效果。")}</p><div className="save-result">{PHASES.every(p=>g.receipts[p]?.saved)?<><CloudCheck size={20}/>{t(" 三關分數與進步分數已自動存入 Google Sheets。")}</>:<><CloudOff size={20}/>{t(" 這是試玩結果，尚未寫入 Google Sheets。")}</>}</div><h3 className="review-title">{t("把六個重點帶走")}</h3><div className="explanation-grid">{EXPLANATIONS.map((text,i)=><article key={t(text)}><span>{String(i+1).padStart(2,'0')}</span><h4>{t(QUESTIONS.pre[i].domain)}</h4><p>{t(text)}</p><div className="domain-scores">{PHASES.map(p=><span key={p}>{p==='pre'?t("前測"):p==='post1'?t("後測一"):t("後測二")} {g.receipts[p]?.score.correctness[i]?'✓':t("待釐清")}</span>)}</div></article>)}</div><div className="button-row"><button className="secondary" onClick={download}><Download size={17}/>{t(" 下載自己的紀錄")}</button><button className="primary" onClick={reset}>{t("結束並清除本機紀錄 ")}<Check size={17}/></button></div><p className="quiet">{t("清除本機紀錄不會刪除已存入 Google Sheets 的資料。")}</p></section>}
  <footer className="footer"><span>{t("海洋決策快報 ")}<span className="footer-dot">·</span>{t(" 理解政策，從一個選擇開始。")}</span><span>{g.sessionId?t('紀錄 {id}',{id:g.sessionId.slice(0,8)}):t("新聞查核 2026.10.08")} <span className="footer-dot">·</span> v2.0</span></footer>
 </main>;
}


