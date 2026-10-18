import assert from 'node:assert/strict';
import * as M from '../.sites-runtime/behavior-tests/behavior-model.mjs';
const origin=process.env.OCEAN_TEST_ORIGIN||'http://127.0.0.1:5909';
const start=Date.parse('2026-10-12T00:00:00.000Z');
let s=M.newSession('TEST_HTTP_V4','dbe16e3e-59c8-4a5e-88f9-528b04c776db',start,true,false);
const post=(record,headers={Origin:origin,'Content-Type':'application/json'})=>fetch(origin+'/api/behavior',{method:'POST',headers,body:JSON.stringify(record)});
let response=await post(s,{'Content-Type':'application/json'});assert.equal(response.status,403);
response=await post({...s,userId:'=IMPORTXML(A1)'});assert.equal(response.status,400);
response=await post(s);assert.equal(response.status,200);let body=await response.json();assert.equal(body.demo,true);assert.equal(body.saved,false);assert.equal(body.result,undefined);
while(s.status==='active'){
 const n=start+s.revision*2000,at=new Date(n).toISOString();
 if(s.stage==='learn')s=s.learning.length===3?M.finishLearning(s,n):M.commitLearning(s,{id:`learn-${s.learning.length}`,choice:['operate','restore','protect'][s.learning.length],language:'en',at,elapsedMs:n-start});
 else{const id=M.currentId(s);s=M.commitAction(s,{id,choice:['a','b','b','b','c','a','c','a','b'][Number(id.split('-')[1])],order:['a','b','c'],language:'en',languagesSeen:['en'],shownAt:new Date(n-1000).toISOString(),at,elapsedMs:n-start});}
}
response=await post(s);assert.equal(response.status,200);body=await response.json();assert.deepEqual(body.result.scores.post2,{policy:3,monitor:3,adapt:3});assert.equal(body.result.answered,27);assert.equal(body.saved,false);
response=await post({...s,isTest:false});assert.equal(response.status,503);body=await response.json();assert.equal(body.error,'NOT_CONFIGURED');assert.equal(body.result.answered,27);
const en=await fetch(origin+'/',{headers:{Cookie:'ocean_language=en'}});const html=await en.text();assert.match(html,/<html[^>]*lang="en"/);assert.match(html,/Rescue the island/);assert.doesNotMatch(html,/<title>海/);
console.log('HTTP checks passed: origin/validation, demo scoring, active answer concealment, unconfigured real collection, English server rendering.');
