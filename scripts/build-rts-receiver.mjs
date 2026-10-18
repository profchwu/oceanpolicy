import fs from 'node:fs';
import ts from 'typescript';
const code=['island-simulation','rts-model','rts-score'].map(name=>ts.transpileModule(fs.readFileSync(`lib/${name}.ts`,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext}}).outputText.replace(/^import .*;\s*$/gm,'').replace(/^export /gm,''));
fs.writeFileSync('google-apps-script/Code-v5.gs','// Generated v5 RTS receiver. Historical receivers are preserved.\n'+code.join('\n')+'\n'+fs.readFileSync('google-apps-script/receiver-v3.js','utf8'));
console.log('Generated v5 receiver.');
