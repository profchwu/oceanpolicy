import {useState} from 'react';
import {missionsFor} from '@/lib/news-missions';
import type {NewsRun} from '@/lib/news-flow';
import './policy-score-list.css';
export default function PolicyScoringTable({en,run}:{en:boolean;run:NewsRun|null}){
 const [level,setLevel]=useState(0),[selected,setSelected]=useState<number|null>(null),b=(z:string,e:string)=>en?e:z,t=(v:[string,string])=>v[en?1:0],missions=missionsFor(run),m=missions[level],rows=[...m.options[0],...m.options[2]];
 return <section className="policy-score-sheet" aria-label={b('本關六項政策得分','All six policy scores for this level')}>
 <nav aria-label={b('選擇計分關卡','Choose scoring level')}>{missions.map((x,i)=><button key={x.id} aria-pressed={i===level} onClick={()=>{setLevel(i);setSelected(null);}}>{i+1}. {x.id==='reef'?b('珊瑚','Coral'):x.id==='grass'?b('海草','Seagrass'):b('風電','Wind')}</button>)}</nav>
 <p className="score-key">{b('A＝政策判斷　B＝適應性應變｜點政策看理由','A = Policy judgment · B = Adaptive response · Select a policy for its rationale')}</p>
 <table><thead><tr><th>{b('項目','Type')}</th><th>{b('政策（本關所有選項）','Policy (all options in this level)')}</th><th>{b('分數','Score')}</th></tr></thead><tbody>{rows.map((op,i)=><tr key={i} data-selected={selected===i}><td>{i<3?'A':'B'}</td><th scope="row"><button onClick={()=>setSelected(i)} aria-pressed={selected===i}>{t(op.label)}</button></th><td><strong data-correct={op.correct}>{Number(op.correct)}</strong></td></tr>)}</tbody></table>
 <div className="score-sheet-formula"><strong>{b('本關分數＝(A＋B)÷2×100','Level score = (A+B)÷2×100')}</strong><span>{b('0＋0 → 0分　｜　1＋0 或 0＋1 → 50分　｜　1＋1 → 100分','0+0 → 0 · 1+0 or 0+1 → 50 · 1+1 → 100')}</span></div>
 <p className="score-sheet-reason" aria-live="polite">{selected===null?b('每組只選一次。未作答不算零分；事件與環境指數不計分。此表揭露答案，研究需統一查看時機。','One choice per group. Missing answers are not zero; events and environmental indices are unscored. This reveals the key: standardize research access.'):t(rows[selected].reason)}</p>
 </section>;
}
