'use client';
import {useRef,useState} from 'react';
import {validUserId} from '@/lib/news-record';
export default function UserIdForm({en=false,initial='',replacing=false,onAccept}:{en?:boolean;initial?:string;replacing?:boolean;onAccept:(id:string)=>void}){
 const [id,setId]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const pending=useRef(false),b=(z:string,e:string)=>en?e:z;
 return <section className="identity-screen"><form onSubmit={async e=>{
  e.preventDefault();if(pending.current||!validUserId(id))return;
  pending.current=true;setBusy(true);setError('');
  try{const response=await fetch('/api/news-record',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'checkUserId',userId:id}),signal:AbortSignal.timeout(25000)});
   const result=await response.json() as {available?:boolean};
   if(!response.ok||result.available!==true&&result.available!==false)throw Error();
   if(!result.available){setError(b('此 User ID 已被使用，請設定新的 User ID。英文大小寫視為相同。','This User ID is already used. Please choose a new ID. Letter case does not distinguish IDs.'));return;}
   onAccept(id);
  }catch{setError(b('目前無法確認 User ID，請稍後再試。','Unable to check this User ID. Please try again.'));}
  finally{pending.current=false;setBusy(false);}
 }}><h1>{replacing?b('請更換 User ID','Choose a new User ID'):b('先輸入 User ID','Enter your User ID first')}</h1>
 <p>{replacing?b('此 ID 已被其他紀錄使用。您的遊戲成果已保留，請設定新 ID 後完成儲存。','This ID was used by another record. Your game results are retained; choose a new ID to save them.'):b('確認 ID 尚未使用後，閱讀新聞並開始三關任務。','After checking your ID, read the news and start the three missions.')}</p>
 <label htmlFor="entry-user-id">User ID</label><input id="entry-user-id" value={id} disabled={busy} onChange={e=>{setId(e.target.value);setError('');}} minLength={4} maxLength={32} pattern="(?=.*[A-Za-z])[A-Za-z0-9]{4,32}" required autoComplete="off" aria-describedby="id-hint id-status" aria-invalid={!!error}/>
 <small id="id-hint">{b('4–32 位英文字母或數字，至少包含一個英文字母，不可含空白、符號或中文。不可使用已登記的 ID（不分大小寫）。請勿使用姓名或電子郵件。','Use 4–32 English letters or digits, with at least one letter. No spaces, symbols or Chinese characters. Registered IDs cannot be reused (case-insensitive). Do not use your name or email.')}</small>
 <p id="id-status" role="status" aria-live="polite">{busy?b('正在檢查 User ID…','Checking User ID…'):error}</p>
 <button className="primary" type="submit" disabled={busy}>{busy?b('檢查中…','Checking…'):replacing?b('確認新 ID 並儲存成果','Confirm new ID and save'):b('確認，閱讀第一則新聞 →','Continue to the first news story →')}</button>
 </form></section>;
}
