import {outcomes,type NewsRun} from './news-flow';
/** Pilot comparisons only: topics and feedback exposure are not equivalent tests. */
export function assessment(r:NewsRun|null){
 const indices=r?.flow==='direct-effects-1'||!r?[0,2]:[0,1,2];
 const rows=[0,1,2].map(i=>indices.map(j=>r?outcomes(r,i)[j]:null));
 const variables=indices.map((source,j)=>{
  const pre=rows[0][j]===null?null:rows[0][j]!*100;
  const post=rows[1][j]===null||rows[2][j]===null?null:(rows[1][j]!+rows[2][j]!)/2*100;
  return {id:['policy_judgment','evidence_selection','adaptive_response'][source],pre,post,change:pre===null||post===null?null:post-pre};
 });
 const levelScores=rows.map(row=>row.some(v=>v===null)?null:row.reduce<number>((sum,v)=>sum+v!,0)/indices.length*100);
 const pre=levelScores[0],post=levelScores[1]===null||levelScores[2]===null?null:(levelScores[1]+levelScores[2])/2;
 return {schema:r?.flow==='direct-effects-1'?'pilot-two-variable-1':'pilot-comparison-1',validatedPrePost:false,rows,variables,levelScores,pre,post,change:pre===null||post===null?null:post-pre};
}
