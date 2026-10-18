import {assessment} from './news-assessment';
import {missionsFor} from './news-missions';
import {actionProgress,valuesAt,outcomes,LIMIT,type NewsRun} from './news-flow';
type Cell=string|number|boolean|null;
type Sheet={name:string;rows:Cell[][]};
const xml=(s:string)=>s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const iso=(n:number|null|undefined)=>n==null?'':new Date(n).toISOString();
const col=(n:number):string=>n<26?String.fromCharCode(65+n):col(Math.floor(n/26)-1)+col(n%26);
const round=(n:number|null)=>n===null?null:Math.round(n*100)/100;
export function recordSheets(run:NewsRun,now:number,cloudSaved:boolean,en=false):Sheet[]{
 const t=(zh:string,eng:string)=>en?eng:zh,a=assessment(run),ms=missionsFor(run);
 const headers:Cell[]=['user_id',t('整體前測','Overall pre'),t('整體後測','Overall post'),t('整體差值','Overall gain')];
 const row:Cell[]=[run.userId??'',round(a.pre),round(a.post),round(a.change)];
 for(const v of a.variables){const name=v.id==='policy_judgment'?t('政策','Policy'):v.id==='adaptive_response'?t('應變','Response'):t('證據','Evidence');headers.push(name+t('前測',' pre'),name+t('後測',' post'),name+t('差值',' gain'));row.push(v.pre,v.post,v.change);}
 const end=Math.min(now,run.startedAt===null?now:run.startedAt+LIMIT);
 const complete=(i:number)=>run.rounds[i].actions.length===3&&run.rounds[i].actions.every(x=>x.ackAt!==undefined&&actionProgress(x,end)>=1);
 headers.push(t('完成關數','Completed levels'),'session_id',t('開始時間UTC','Started UTC'),t('匯出時間UTC','Exported UTC'),t('雲端已確認','Cloud confirmed'),'assessment_schema',t('研究限制','Research limitation'));
 row.push([0,1,2].filter(complete).length,run.id,iso(run.startedAt),iso(now),cloudSaved,a.schema,t('玩法試驗；不同主題未驗證等值，差值不代表因果效果。','Gameplay pilot; topics are not validated equivalent tests; gains do not establish causality.'));
 const levels:Cell[][]=[['user_id',t('關卡','Level'),t('主題','Topic'),t('已完成','Completed'),t('關卡分數','Level score'),t('政策得分','Policy score'),t('應變得分','Response score'),'session_id',t('指標','Metric'),t('開局','Initial'),t('目前','Current'),t('增減','Change')]];
 const actions:Cell[][]=[['user_id',t('關卡','Level'),t('主題','Topic'),t('步驟','Step'),t('選擇或事件','Choice or event'),t('得分','Score'),t('已確認','Acknowledged'),t('動畫進度','Animation progress'),t('選擇時間UTC','Selected UTC'),t('確認時間UTC','Acknowledged UTC'),t('語言','Language'),t('指標','Metric'),t('之前','Before'),t('目前','Current'),t('實際增減','Actual change'),'session_id']];
 ms.forEach((m,i)=>{
 const v=valuesAt(run,i,now),score=outcomes(run,i);
 m.metrics.forEach((label,j)=>levels.push([run.userId??'',i+1,m.title[en?1:0],complete(i),round(a.levelScores[i]),score[0],score[2],run.id,label[en?1:0],m.initial[j],round(v[j]),round(v[j]-m.initial[j])]));
 run.rounds[i].actions.forEach((act,k)=>{
 const prefix=(count:number):NewsRun=>({...run,rounds:run.rounds.map((r,n)=>n===i?{...r,actions:r.actions.slice(0,count)}:r)});
 const before=valuesAt(prefix(k),i,act.ackAt??now),current=valuesAt(prefix(k+1),i,now);
 const event=act.step===1,automatic=event&&(run.flow==='direct-effects-1'||act.automatic);
 m.metrics.forEach((label,j)=>actions.push([run.userId??'',i+1,m.title[en?1:0],event?t('外部事件','External event'):act.step===0?t('政策','Policy'):t('應變','Response'),automatic?m.update[en?1:0]:m.options[act.step][act.choice].label[en?1:0],automatic?null:Number(m.options[act.step][act.choice].correct),act.ackAt!==undefined,act.ackAt===undefined?0:round(actionProgress(act,end)),iso(act.at),iso(act.ackAt),act.language,label[en?1:0],round(before[j]),round(current[j]),round(current[j]-before[j]),run.id]));
 });
 });
 return [{name:t('前後測摘要','Assessment summary'),rows:[headers,row]},{name:t('各關結果','Level results'),rows:levels},{name:t('決策明細','Decision details'),rows:actions}];
}
/** Minimal OOXML writer: typed cells (IDs stay text), UTF-8, ZIP stored entries.
 * No formula cells or macros; user-supplied strings cannot become formulas. */
export function xlsxBytes(sheets:Sheet[]):Uint8Array<ArrayBuffer>{
 const ns='http://schemas.openxmlformats.org/spreadsheetml/2006/main',rel='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
 const files:Record<string,string>={
 '[Content_Types].xml':`<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`,
 '_rels/.rels':`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
 'xl/workbook.xml':`<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets>${sheets.map((s,i)=>`<sheet name="${xml(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`,
 'xl/_rels/workbook.xml.rels':`<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_,i)=>`<Relationship Id="rId${i+1}" Type="${rel}/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="style" Type="${rel}/styles" Target="styles.xml"/></Relationships>`,
 'xl/styles.xml':`<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF174754"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" fillId="0" borderId="0" xfId="0"/><xf fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"><alignment wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`
 };
 sheets.forEach((s,i)=>{const last=col(s.rows[0].length-1)+s.rows.length;files[`xl/worksheets/sheet${i+1}.xml`]=`<worksheet xmlns="${ns}"><dimension ref="A1:${last}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="${s.rows[0].length}" width="22" customWidth="1"/></cols><sheetData>${s.rows.map((row,r)=>`<row r="${r+1}"${r===0?' ht="32" customHeight="1"':''}>${row.map((v,c)=>{const attr=`r="${col(c)}${r+1}" s="${r===0?1:0}"`;return v===null?`<c ${attr}/>`:typeof v==='number'?`<c ${attr}><v>${v}</v></c>`:typeof v==='boolean'?`<c ${attr} t="b"><v>${Number(v)}</v></c>`:`<c ${attr} t="inlineStr"><is><t xml:space="preserve">${xml(v)}</t></is></c>`;}).join('')}</row>`).join('')}</sheetData><autoFilter ref="A1:${last}"/></worksheet>`;});
 const encoder=new TextEncoder(),parts:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0;
 const u16=(a:Uint8Array,p:number,v:number)=>new DataView(a.buffer).setUint16(p,v,true),u32=(a:Uint8Array,p:number,v:number)=>new DataView(a.buffer).setUint32(p,v,true);
 for(const [path,body] of Object.entries(files)){
 const name=encoder.encode(path),data=encoder.encode('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+body);let crc=0xffffffff;for(const b of data){crc^=b;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}crc=(crc^0xffffffff)>>>0;
 const h=new Uint8Array(30+name.length);u32(h,0,0x04034b50);u16(h,4,20);u16(h,6,0x800);u16(h,12,33);u32(h,14,crc);u32(h,18,data.length);u32(h,22,data.length);u16(h,26,name.length);h.set(name,30);parts.push(h,data);
 const c=new Uint8Array(46+name.length);u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);u16(c,8,0x800);u16(c,14,33);u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);u16(c,28,name.length);u32(c,42,offset);c.set(name,46);central.push(c);offset+=h.length+data.length;
 }
 const size=central.reduce((n,p)=>n+p.length,0),end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,8,central.length);u16(end,10,central.length);u32(end,12,size);u32(end,16,offset);
 const out=new Uint8Array(offset+size+22);let at=0;for(const p of [...parts,...central,end]){out.set(p,at);at+=p.length;}return out;
}
export function downloadPlayRecord(run:NewsRun,now:number,saved:boolean,en:boolean){
 const bytes=xlsxBytes(recordSheets(run,now,saved,en)),url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}));
 const a=document.createElement('a');a.href=url;a.download=`island-news-${run.id.replace(/[^a-zA-Z0-9_-]/g,'_')}.xlsx`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
