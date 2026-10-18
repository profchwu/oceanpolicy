// Generated v5 RTS receiver. Historical receivers are preserved.
const TOOLS = { wind: ['survey', 'turbine', 'cable', 'battery', 'report'], grass: ['survey', 'filter', 'plant', 'sample', 'expand'], reef: ['treat', 'sensor', 'patrol', 'shade', 'tourism'] };
const COST = { survey: 1, turbine: 3, cable: 2, battery: 2, report: 1, filter: 2, plant: 2, sample: 1, expand: 3, treat: 3, sensor: 1, patrol: 2, shade: 2, tourism: 2 };
function islandState(kind, moves = []) {
    const s = { kind, budget: 8, moves: [], survey: false, turbines: 0, cable: false, battery: false, pollution: 3, grass: 1, coral: 2, monitor: false, patrol: false, event: false, power: false, goals: [], won: false, over: false };
    for (const action of moves) {
        if (!canPlay(s, action))
            throw Error('INVALID_SIMULATION_MOVE');
        s.budget -= COST[action];
        s.moves.push(action);
        if (action === 'survey')
            s.survey = true;
        if (action === 'turbine')
            s.turbines++;
        if (action === 'cable')
            s.cable = true;
        if (action === 'battery')
            s.battery = true;
        if (action === 'filter' || action === 'treat')
            s.pollution = 0;
        if (action === 'plant')
            s.grass += s.survey && s.pollution < 2 ? 3 : 1;
        if (action === 'expand')
            s.grass += s.pollution < 2 ? 2 : 0;
        if (action === 'sample' || action === 'sensor')
            s.monitor = true;
        if (action === 'patrol')
            s.patrol = true;
        if (action === 'tourism')
            s.pollution = Math.min(4, s.pollution + 1);
        if (s.moves.length === 2) {
            s.event = true;
            if (kind === 'grass') {
                s.pollution = Math.min(4, s.pollution + 1);
                s.grass = Math.max(0, s.grass - 1);
            }
            if (kind === 'reef')
                s.coral = 1;
        }
        s.power = s.turbines > 0 && s.cable;
        if (kind === 'reef' && s.pollution === 0 && s.patrol)
            s.coral = 2;
        s.goals = kind === 'wind' ? [s.survey, s.power, s.battery] : kind === 'grass' ? [s.pollution < 2, s.grass >= 3, s.monitor] : [s.pollution === 0, s.monitor, s.patrol];
        s.won = s.goals.every(Boolean);
        s.over = s.won || !TOOLS[kind].some(a => canPlay(s, a));
    }
    if (!moves.length)
        s.goals = [false, false, false];
    return s;
}
function canPlay(s, action) { return !s.over && TOOLS[s.kind].includes(action) && COST[action] <= s.budget && !s.moves.includes(action); }

const BEHAVIOR_VERSION = 'ocean-rts-v5.3.0';
const LIMIT_MS = 600000;
const EVENT_DELAY_MS = 35000;
const PHASES = ['pre', 'post1', 'post2'];
const VARIABLES = ['policy', 'monitor', 'adapt'];
function remainingMs(s, now) { return Math.max(0, Math.min(LIMIT_MS, Date.parse(s.deadlineAt) - now)); }
function expired(s, now) { return s.status === 'active' && remainingMs(s, now) === 0; }
function newSession(userId, sessionId, now, isTest, reducedMotion) {
    return { version: BEHAVIOR_VERSION, sessionId, userId, startedAt: new Date(now).toISOString(), deadlineAt: new Date(now + LIMIT_MS).toISOString(), endedAt: null, status: 'active', stage: 'pre', revision: 1, answers: [], learning: [], training: [], isTest, reducedMotion, consentVersion: 'notice-v3' };
}
function phaseCount(s, p) { return s.answers.filter(a => a.id.startsWith(p + '-')).length; }
function phaseStarted(s, p) { return Date.parse(p === 'pre' ? s.startedAt : p === 'post1' ? (s.learning[2]?.at || s.startedAt) : (s.answers[17]?.at || s.startedAt)); }
function taskAvailable(s, index, now) {
    if (!Number.isInteger(index) || index < 0 || index > 8 || !PHASES.includes(s.stage) || s.answers.some(a => a.id === `${s.stage}-${index}`))
        return false;
    const v = index % 3;
    return (v === 0 || s.answers.some(a => a.id === `${s.stage}-${index - 1}`)) && (v !== 2 || now >= phaseStarted(s, s.stage) + EVENT_DELAY_MS);
}
function completedSteps(s) { return [s.answers.length >= 9, s.learning.length === 3, s.answers.length >= 18, s.answers.length === 27]; }
function currentId(s) { return s.stage === 'results' || s.stage === 'learn' ? null : `${s.stage}-${phaseCount(s, s.stage)}`; }
function timeoutSession(s, now) {
    return expired(s, now) ? { ...s, stage: 'results', status: 'timed_out', endedAt: s.deadlineAt, revision: s.revision + 1 } : s;
}
function commitAction(s, a) {
    if (s.status !== 'active' || !['pre', 'post1', 'post2'].includes(s.stage) || !a.id.startsWith(s.stage + '-') || !taskAvailable(s, Number(a.id.split('-')[1]), Date.parse(a.at)))
        return s;
    const end = Date.parse(a.at);
    if (expired(s, end))
        return timeoutSession(s, end);
    const answers = [...s.answers, a];
    const count = phaseCount(s, s.stage) + 1;
    if (count === 9) {
        const stage = s.stage === 'pre' ? 'learn' : s.stage === 'post1' ? 'post2' : 'results';
        return { ...s, answers, stage, revision: s.revision + 1, status: stage === 'results' ? 'completed' : 'active', endedAt: stage === 'results' ? a.at : null };
    }
    return { ...s, answers, revision: s.revision + 1 };
}
function commitLearning(s, a) {
    if (s.status !== 'active' || s.stage !== 'learn' || a.id !== `learn-${s.learning.length}`)
        return s;
    if (expired(s, Date.parse(a.at)))
        return timeoutSession(s, Date.parse(a.at));
    return { ...s, learning: [...s.learning, a], revision: s.revision + 1 };
}
function finishLearning(s, now) {
    if (expired(s, now))
        return timeoutSession(s, now);
    return s.stage === 'learn' && s.learning.length === 3 ? { ...s, stage: 'post1', revision: s.revision + 1 } : s;
}
function commitTraining(s, move) {
    if (s.status !== 'active' || s.stage !== 'learn' || move.lesson !== s.learning.length)
        return s;
    if (expired(s, Date.parse(move.at)))
        return timeoutSession(s, Date.parse(move.at));
    return { ...s, training: [...s.training, move], revision: s.revision + 1 };
}
function gain(after, before) { return after === null || before === null ? null : after - before; }
function shuffle(values, seed) { let n = 2166136261; for (const c of seed)
    n = Math.imul(n ^ c.charCodeAt(0), 16777619); const out = [...values]; for (let i = out.length - 1; i > 0; i--) {
    n ^= n << 13;
    n ^= n >>> 17;
    n ^= n << 5;
    const j = (n >>> 0) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
} return out; }

// Server-only rubrics. Never import this module from a client component.


const KEYS = ['a', 'b', 'b', 'b', 'c', 'a', 'c', 'a', 'b'];
function validateSession(raw) {
    const fail = () => { throw Error('INVALID_RECORD'); };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return fail();
    const r = raw;
    if (r.version !== BEHAVIOR_VERSION || r.consentVersion !== 'notice-v3')
        return fail();
    if (typeof r.userId !== 'string' || !/^[A-Za-z0-9_-]{3,32}$/.test(r.userId) || typeof r.sessionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(r.sessionId))
        return fail();
    if (typeof r.isTest !== 'boolean' || typeof r.reducedMotion !== 'boolean' || !['active', 'completed', 'timed_out'].includes(r.status) || !['pre', 'learn', 'post1', 'post2', 'results'].includes(r.stage))
        return fail();
    const date = (v) => typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(v) && Number.isFinite(Date.parse(v));
    if (!date(r.startedAt) || !date(r.deadlineAt) || Date.parse(r.deadlineAt) - Date.parse(r.startedAt) !== LIMIT_MS)
        return fail();
    if (!Array.isArray(r.answers) || r.answers.length > 27 || !Array.isArray(r.learning) || r.learning.length > 3)
        return fail();
    const start = Date.parse(r.startedAt), deadline = Date.parse(r.deadlineAt);
    let previous = start;
    for (let i = 0; i < r.answers.length; i++) {
        const a = r.answers[i];
        if (!a || !new RegExp(`^${PHASES[Math.floor(i / 9)]}-[0-8]$`).test(a.id) || r.answers.slice(0, i).some(x => x.id === a.id) || !['a', 'b', 'c'].includes(a.choice) || !Array.isArray(a.order) || a.order.length !== 3 || [...a.order].sort().join('') !== 'abc')
            return fail();
        if (!['zh-Hant', 'en'].includes(a.language) || !Array.isArray(a.languagesSeen) || a.languagesSeen.length < 1 || a.languagesSeen.length > 2 || new Set(a.languagesSeen).size !== a.languagesSeen.length || !a.languagesSeen.every(l => l === 'en' || l === 'zh-Hant') || !a.languagesSeen.includes(a.language))
            return fail();
        if (!date(a.shownAt) || !date(a.at) || Date.parse(a.at) < previous || Date.parse(a.shownAt) < start || Date.parse(a.shownAt) > Date.parse(a.at) || Date.parse(a.at) >= deadline || a.elapsedMs !== Date.parse(a.at) - start)
            return fail();
        previous = Date.parse(a.at);
        const index = Number(a.id.split('-')[1]), variable = index % 3, phase = PHASES[Math.floor(i / 9)];
        if (variable > 0 && !r.answers.slice(0, i).some(x => x.id === `${phase}-${index - 1}`))
            return fail();
        if (variable === 2 && Date.parse(a.at) < phaseStarted(r, phase) + EVENT_DELAY_MS)
            return fail();
        const costs = [[22, 30, 8], [5, 5, 5], [24, 14, 0], [28, 18, 26], [5, 5, 5], [12, 23, 0], [23, 8, 20], [5, 5, 5], [0, 12, 0]];
        if (r.answers.slice(0, i + 1).filter(x => x.id.startsWith(phase + '-')).reduce((sum, x) => sum + costs[Number(x.id.split('-')[1])][x.choice.charCodeAt(0) - 97], 0) > 150)
            return fail();
    }
    previous = r.answers[8] ? Date.parse(r.answers[8].at) : start;
    const learningOptions = [['operate', 'survey'], ['restore', 'assess'], ['protect', 'observe']];
    for (let i = 0; i < r.learning.length; i++) {
        const a = r.learning[i];
        if (r.answers.length < 9 || !a || a.id !== `learn-${i}` || !learningOptions[i].includes(a.choice) || !['en', 'zh-Hant'].includes(a.language) || !date(a.at) || Date.parse(a.at) < previous || Date.parse(a.at) >= deadline || a.elapsedMs !== Date.parse(a.at) - start)
            return fail();
        previous = Date.parse(a.at);
    }
    if (r.answers.length > 9 && (r.learning.length !== 3 || Date.parse(r.answers[9].at) < previous))
        return fail();
    const advanced = r.answers.length > 9 || r.stage === 'post1' || r.stage === 'post2' || r.status === 'completed';
    // A timeout immediately after advancing into post1 may have exactly nine answers.
    if (!Array.isArray(r.training) || r.training.length > 15)
        return fail();
    let lastTraining = r.answers[8] ? Date.parse(r.answers[8].at) : start;
    for (let i = 0; i < r.training.length; i++) {
        const m = r.training[i];
        if (r.answers.length < 9 || !m || !Number.isInteger(m.lesson) || m.lesson < 0 || m.lesson > 2 || m.lesson > r.learning.length || typeof m.action !== 'string' || !date(m.at) || Date.parse(m.at) < lastTraining || Date.parse(m.at) >= deadline || m.elapsedMs !== Date.parse(m.at) - start)
            return fail();
        if (i && m.lesson < r.training[i - 1].lesson)
            return fail();
        if (m.lesson > 0 && (!r.learning[m.lesson - 1] || Date.parse(m.at) < Date.parse(r.learning[m.lesson - 1].at)))
            return fail();
        if (r.learning[m.lesson] && Date.parse(m.at) > Date.parse(r.learning[m.lesson].at))
            return fail();
        lastTraining = Date.parse(m.at);
    }
    try {
        ['wind', 'grass', 'reef'].forEach((kind, i) => islandState(kind, r.training.filter(m => m.lesson === i).map(m => m.action)));
    }
    catch {
        return fail();
    }
    const revisionBase = 1 + r.answers.length + r.learning.length + r.training.length + (r.status === 'timed_out' ? 1 : 0);
    const advancedWhenTimedOut = r.status === 'timed_out' && r.answers.length === 9 && r.learning.length === 3 && r.revision === revisionBase + 1;
    if (r.revision !== revisionBase + (advanced || advancedWhenTimedOut ? 1 : 0))
        return fail();
    if (r.status === 'active') {
        if (r.endedAt !== null)
            return fail();
        const n = r.answers.length;
        if (n < 9 && (r.stage !== 'pre' || r.learning.length !== 0) || n === 9 && !['learn', 'post1'].includes(r.stage) || n > 9 && n < 18 && r.stage !== 'post1' || n >= 18 && n < 27 && r.stage !== 'post2' || n === 27)
            return fail();
        if (r.stage === 'post1' && r.learning.length !== 3)
            return fail();
    }
    else {
        if (r.stage !== 'results' || !date(r.endedAt))
            return fail();
        if (r.status === 'timed_out' && r.endedAt !== r.deadlineAt)
            return fail();
        if (r.status === 'completed' && (r.answers.length !== 27 || r.learning.length !== 3 || r.endedAt !== r.answers[26].at))
            return fail();
    }
    return { version: r.version, sessionId: r.sessionId, userId: r.userId, startedAt: r.startedAt, deadlineAt: r.deadlineAt, endedAt: r.endedAt, status: r.status, stage: r.stage, revision: r.revision, isTest: r.isTest, reducedMotion: r.reducedMotion, consentVersion: r.consentVersion, training: r.training.map(m => ({ lesson: m.lesson, action: m.action, at: m.at, elapsedMs: m.elapsedMs })), answers: r.answers.map(a => ({ id: a.id, choice: a.choice, order: a.order, language: a.language, languagesSeen: a.languagesSeen, shownAt: a.shownAt, at: a.at, elapsedMs: a.elapsedMs })), learning: r.learning.map(a => ({ id: a.id, choice: a.choice, language: a.language, at: a.at, elapsedMs: a.elapsedMs })) };
}
function scoreBehavior(r) {
    const scores = Object.fromEntries(PHASES.map(p => [p, Object.fromEntries(VARIABLES.map((v, j) => {
            const indexes = [j, j + 3, j + 6], answers = indexes.map(i => r.answers.find(a => a.id === `${p}-${i}`));
            return [v, answers.every(Boolean) ? answers.reduce((sum, a, k) => sum + (a?.choice === KEYS[indexes[k]] ? 1 : 0), 0) : null];
        }))]));
    return { scores, gains: { post1: { policy: gain(scores.post1.policy, scores.pre.policy), monitor: gain(scores.post1.monitor, scores.pre.monitor), adapt: gain(scores.post1.adapt, scores.pre.adapt) }, post2: { policy: gain(scores.post2.policy, scores.pre.policy), monitor: gain(scores.post2.monitor, scores.pre.monitor), adapt: gain(scores.post2.adapt, scores.pre.adapt) } }, completedPhases: PHASES.filter(p => VARIABLES.every(v => scores[p][v] !== null)).length, answered: r.answers.length };
}
function compatibleSnapshot(previous, next) {
    const fields = ['sessionId', 'userId', 'version', 'startedAt', 'deadlineAt', 'consentVersion', 'isTest', 'reducedMotion'];
    return previous.status === 'active' && next.revision > previous.revision && fields.every(k => previous[k] === next[k]) && previous.answers.length <= next.answers.length && previous.learning.length <= next.learning.length && previous.training.length <= next.training.length && previous.training.every((a, i) => JSON.stringify(a) === JSON.stringify(next.training[i])) && previous.answers.every((a, i) => JSON.stringify(a) === JSON.stringify(next.answers[i])) && previous.learning.every((a, i) => JSON.stringify(a) === JSON.stringify(next.learning[i]));
}

// Receiver glue. Generate the standalone Code-v3.gs with scripts/build-behavior-receiver.mjs.
var RAW_HEADERS=['record_key','received_at_utc','session_id','user_id','revision','status','instrument_version','record_json'];
var SUMMARY_HEADERS=['session_id','user_id','is_test','instrument_version','status','started_at_utc','ended_at_utc','decision_count','completed_phases','elapsed_ms'];
PHASES.forEach(function(p){VARIABLES.forEach(function(v){SUMMARY_HEADERS.push(p+'_'+v);});});
['post1','post2'].forEach(function(p){VARIABLES.forEach(function(v){SUMMARY_HEADERS.push('gain_'+p+'_'+v);});});
SUMMARY_HEADERS.push('languages','updated_at_utc');
function setup(){
 var props=PropertiesService.getScriptProperties();
 if(!props.getProperty('SHEET_ID')||String(props.getProperty('SHARED_SECRET')||'').length<32)throw Error('Set SHEET_ID and a SHARED_SECRET of at least 32 characters in Script Properties.');
 var book=SpreadsheetApp.openById(props.getProperty('SHEET_ID'));
 [['ocean_behavior_events',RAW_HEADERS],['ocean_behavior_summary',SUMMARY_HEADERS]].forEach(function(spec){
  var sheet=book.getSheetByName(spec[0])||book.insertSheet(spec[0]),headers=spec[1];
  if(sheet.getMaxColumns()<headers.length)sheet.insertColumnsAfter(sheet.getMaxColumns(),headers.length-sheet.getMaxColumns());
  if(sheet.getLastRow()===0){sheet.getRange(1,1,1,headers.length).setValues([headers]).setBackground('#102b3b').setFontColor('#ffffff').setFontWeight('bold');sheet.setFrozenRows(1);}
  else if(JSON.stringify(sheet.getRange(1,1,1,headers.length).getValues()[0])!==JSON.stringify(headers))throw Error('Header mismatch: '+spec[0]+'. Existing data was not overwritten.');
  sheet.getRange(spec[0]==='ocean_behavior_events'?'C:D':'A:B').setNumberFormat('@');
 });
}
function doGet(){return json_({ok:true,service:'ocean-behavior-receiver',version:BEHAVIOR_VERSION});}
function doPost(e){
 try{
  if(!e||!e.postData||e.postData.contents.length>50000)return json_({ok:false,error:'invalid_request'});
  var body=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties(),secret=String(props.getProperty('SHARED_SECRET')||'');
  if(secret.length<32||!equal_(secret,String(body.secret||'')))return json_({ok:false,error:'unauthorized'});
  var r=validateSession(body.record),key=r.sessionId+':'+r.revision,recordJson=JSON.stringify(r);
  var lock=LockService.getScriptLock();if(!lock.tryLock(10000))return json_({ok:false,error:'busy_retry'});
  try{
   var book=SpreadsheetApp.openById(props.getProperty('SHEET_ID')),raw=book.getSheetByName('ocean_behavior_events'),summary=book.getSheetByName('ocean_behavior_summary');
   if(!raw||!summary||raw.getLastRow()<1||summary.getLastRow()<1)return json_({ok:false,error:'setup_required'});
   var rows=raw.getLastRow()>1?raw.getRange(2,1,raw.getLastRow()-1,RAW_HEADERS.length).getValues():[];
   var matching=rows.filter(function(row){return String(row[2])===r.sessionId;});
   var duplicate=matching.find(function(row){return String(row[0])===key;});
   var latest=matching.sort(function(a,b){return Number(b[4])-Number(a[4]);})[0];
   if(duplicate){
    if(String(duplicate[7])!==recordJson)return json_({ok:false,error:'record_conflict'});
    updateSummary_(summary,validateSession(JSON.parse(String(latest[7]))));
    SpreadsheetApp.flush();return json_({ok:true,duplicate:true,recordKey:key,version:BEHAVIOR_VERSION});
   }
   if(latest&&!compatibleSnapshot(validateSession(JSON.parse(String(latest[7]))),r))return json_({ok:false,error:'record_conflict'});
   var row=[key,new Date().toISOString(),r.sessionId,r.userId,r.revision,r.status,r.version,recordJson];
   var target=raw.getLastRow()+1;if(target>raw.getMaxRows())raw.insertRowsAfter(raw.getMaxRows(),100);
   raw.getRange(target,1,1,row.length).setValues([row.map(safeCell_)]);
   updateSummary_(summary,r);SpreadsheetApp.flush();
   return json_({ok:true,duplicate:false,recordKey:key,version:BEHAVIOR_VERSION});
  }finally{lock.releaseLock();}
 }catch(error){return json_({ok:false,error:'invalid_or_unavailable'});}
}
function updateSummary_(sheet,r){
 var scores=scoreBehavior(r),lastAt=r.endedAt||(r.answers.length?r.answers[r.answers.length-1].at:r.startedAt);
 if(!r.endedAt&&r.learning.length&&Date.parse(r.learning[r.learning.length-1].at)>Date.parse(lastAt))lastAt=r.learning[r.learning.length-1].at;
 var row=[r.sessionId,r.userId,r.isTest,r.version,r.status,r.startedAt,r.endedAt||'',r.answers.length,scores.completedPhases,Date.parse(lastAt)-Date.parse(r.startedAt)];
 PHASES.forEach(function(p){VARIABLES.forEach(function(v){row.push(scores.scores[p][v]===null?'':scores.scores[p][v]);});});
 ['post1','post2'].forEach(function(p){VARIABLES.forEach(function(v){row.push(scores.gains[p][v]===null?'':scores.gains[p][v]);});});
 var languages=[];r.answers.forEach(function(a){a.languagesSeen.forEach(function(l){if(languages.indexOf(l)<0)languages.push(l);});});r.learning.forEach(function(a){if(languages.indexOf(a.language)<0)languages.push(a.language);});
 row.push(languages.join(','),new Date().toISOString());
 var last=sheet.getLastRow(),existing=last>1?sheet.getRange(2,1,last-1,1).createTextFinder(r.sessionId).matchEntireCell(true).useRegularExpression(false).findNext():null;
 var target=existing?existing.getRow():last+1;if(target>sheet.getMaxRows())sheet.insertRowsAfter(sheet.getMaxRows(),100);
 sheet.getRange(target,1,1,row.length).setValues([row.map(safeCell_)]);
}
function equal_(a,b){if(a.length!==b.length)return false;var n=0;for(var i=0;i<a.length;i++)n|=a.charCodeAt(i)^b.charCodeAt(i);return n===0;}
function safeCell_(v){return typeof v==='string'&&/^[=+\-@\t\r]/.test(v)?"'"+v:v;}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
