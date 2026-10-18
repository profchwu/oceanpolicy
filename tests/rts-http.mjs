import fs from 'node:fs';import assert from 'node:assert/strict';
const origin='http://127.0.0.1:5909',s=JSON.parse(fs.readFileSync('.sites-runtime/rts-tests/fixture.json','utf8'));
const post=(record,headers={Origin:origin,'Content-Type':'application/json'})=>fetch(origin+'/api/rts',{method:'POST',headers,body:JSON.stringify(record)});
assert.equal((await post(s,{'Content-Type':'application/json'})).status,403);
assert.equal((await post({...s,userId:'=IMPORTXML(A1)'})).status,400);
let r=await post(s);assert.equal(r.status,200);let b=await r.json();assert.equal(b.saved,false);assert.equal(b.demo,true);assert.deepEqual(b.result.scores.post2,{policy:3,monitor:3,adapt:3});
r=await post({...s,isTest:false});assert.equal(r.status,503);b=await r.json();assert.equal(b.error,'NOT_CONFIGURED');
const html=await (await fetch(origin,{headers:{Cookie:'ocean_language=en'}})).text();assert.match(html,/<html[^>]*lang="en"/);assert.match(html,/Put policy/);assert.doesNotMatch(html,/<title>海/);
console.log('RTS HTTP passed: origin, validation, demo scoring, no false cloud receipt, English SSR.');
