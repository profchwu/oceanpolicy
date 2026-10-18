import fs from 'node:fs';
import ts from 'typescript';
// Share exactly the same validated contract and scoring logic with Apps Script.
const compiled=['island-simulation','behavior-model','behavior-score'].map(name=>ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*;\s*$/gm,'').replace(/^export /gm,''));
const content='// Generated standalone v4 receiver. Paste only this file into Google Apps Script.\n'+compiled.join('\n')+'\n'+fs.readFileSync('google-apps-script/receiver-v3.js','utf8');
fs.writeFileSync('google-apps-script/Code-v4.gs',content);
console.log('Generated Google Apps Script v4 receiver.');
