import type {stateAt} from '@/lib/crisis';
export default function CrisisWorks({s}:{s:ReturnType<typeof stateAt>}){
 return <svg className="crisis-work-overlay" viewBox="0 0 1672 941" aria-hidden="true">
  <path d="M652 450Q625 490 590 516T495 560L401 618" fill="none" stroke="#b3955f" strokeWidth={5+s.storm*15} opacity={s.storm*(1-s.barrier*.85)*.65}/>
  {Array.from({length:8},(_,i)=><g key={i} opacity={Math.max(0,Math.min(1,s.barrier*8-i))} transform={`translate(${526+i*12} ${517+i*4})`}><ellipse cy="4" rx="10" ry="5" fill="#354739" opacity=".4"/><path d="M-9-7L3-10 11-5 10 3-3 6-10 2Z" fill="#bcaf7b" stroke="#756d4b" strokeWidth="1.4"/><path d="M-9-7L3-10 11-5-3-2Z" fill="#e4d39c"/></g>)}
  <path d="M770 487L830 520 915 538 975 507" fill="none" stroke="#ffde8c" strokeWidth="5" strokeDasharray="8 5" pathLength="100" strokeDashoffset={100-s.grid*100} opacity={s.grid*.85}/>
  {s.battery>0&&<g transform="translate(997 538)" opacity={s.battery}><ellipse cy="5" rx="28" ry="9" fill="#1c4145" opacity=".4"/><path d="M-22-16L7-22 26-11 24 6-7 11-23 1Z" fill="#668d7c" stroke="#38564f" strokeWidth="2"/><path d="M-22-16L7-22 26-11-6-5Z" fill="#bcc8a3"/><path d="M7-9L0 0 9-1 4 7 18-4 10-3 15-12Z" fill="#ffeab2"/></g>}
  {s.filter>0&&<g opacity={s.filter} fill="#c4c8a4" stroke="#617c6c" strokeWidth="2"><ellipse cx="552" cy="541" rx="23" ry="12"/><ellipse cx="587" cy="550" rx="23" ry="12"/><path d="M532 541v14q22 18 41 0v-13M566 550v14q21 18 42 0v-13"/></g>}
 </svg>;
}
