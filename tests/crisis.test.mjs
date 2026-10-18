import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync('lib/crisis.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {stateAt,move,scores}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const fresh=()=>({version:'crisis-pilot-2',id:'test',userId:'TEST',start:1000,moves:[]});
const at=(r,c,t)=>move(r,c,1000+t*1000,'en');
test('every construction and rescue has visible intermediate progress and finishes in five seconds',()=>{
 for(const c of ['barrier','grid','plant','dredge','filter','battery','expand']){
  const start=['filter','battery','expand'].includes(c)?41:1,r=at(fresh(),c,start);
  assert.equal(stateAt(r,1000+start*1000).progress(c),0);
  assert.equal(stateAt(r,1000+(start+2.5)*1000).progress(c),.5);
  assert.equal(stateAt(r,1000+(start+5)*1000).progress(c),1);
 }
});
test('inaction loses; either prevention strategy can win through an appropriate rescue',()=>{
 assert.equal(stateAt(fresh(),91000).won,false);
 for(const [first,rescue] of [['barrier','battery'],['grid','filter']]){let r=at(fresh(),first,1);r=at(r,rescue,41);assert.equal(stateAt(r,91000).won,true);assert.equal(scores(r).adapt,1);}
});
test('construction takes time; poor planting and dredging can damage habitat',()=>{
 const r=at(fresh(),'barrier',1);assert.equal(stateAt(r,2000).barrier,0);assert.equal(stateAt(r,4500).barrier,.5);assert.equal(stateAt(r,7000).barrier,1);
 const bad=at(at(fresh(),'plant',1),'dredge',3);assert.ok(stateAt(bad,91000).meadow<stateAt(fresh(),91000).meadow);
});
test('budget, phase gates, duplicates, one monitoring and one rescue enforced',()=>{
 let r=fresh();assert.equal(at(r,'battery',10),r);assert.equal(at(r,'evidence',2),r);
 r=at(r,'barrier',1);assert.equal(at(r,'barrier',2),r);r=at(r,'grid',3);assert.equal(at(r,'plant',4),r);
 assert.equal(at(r,'filter',41),r);r=at(r,'evidence',12);assert.equal(at(r,'count',15),r);r=at(r,'hold',41);assert.equal(at(r,'expand',42),r);
});
test('deadline freezes simulation and rejects late clicks; reload preserves deterministic world',()=>{
 const r=at(fresh(),'grid',2);assert.equal(at(r,'filter',90),r);assert.equal(stateAt(r,91000).water,stateAt(r,9999999).water);
 assert.equal(stateAt(JSON.parse(JSON.stringify(r)),64000).power,stateAt(r,64000).power);
 assert.deepEqual(scores(fresh()),{policy:null,monitor:null,adapt:null});
});
