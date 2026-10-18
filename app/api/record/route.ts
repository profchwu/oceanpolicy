import {validateSubmission,scoreSubmission} from '@/lib/assessment';
import {configured,sendToSheets} from '@/lib/sheets';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin || origin!==new URL(request.url).origin) return Response.json({error:'請從遊戲頁面送出資料。'},{status:403});
 if(!request.headers.get('content-type')?.startsWith('application/json')) return Response.json({error:'資料格式錯誤。'},{status:415});
 if(Number(request.headers.get('content-length')||0)>70000) return Response.json({error:'資料過大。'},{status:413});
 let record;
 try{
  const text=await request.text();if(text.length>70000)return Response.json({error:'資料過大。'},{status:413});
  record=validateSubmission(JSON.parse(text));
 }catch(e){return Response.json({error:e instanceof Error?e.message:'資料格式錯誤。'},{status:400});}
 if(!configured()){
  if(!record.isTest) return Response.json({error:'Google Sheets 尚未完成連線；這筆資料沒有儲存。'},{status:503});
  return Response.json({saved:false,demo:true,score:scoreSubmission(record)},{headers:{'Cache-Control':'no-store'}});
 }
 try{
  const receipt=await sendToSheets(record);
  return Response.json({saved:true,receipt,score:scoreSubmission(record)},{headers:{'Cache-Control':'no-store'}});
 }catch{
  return Response.json({error:'尚未收到 Google Sheets 的儲存確認。答案已保留在此裝置，請按「重試儲存」。'},{status:502});
 }
}
