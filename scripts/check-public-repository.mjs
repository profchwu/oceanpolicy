import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// Scan tracked content only. Print file/category, never matched secret values.
const files=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);
const rules={
  credential:/github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|sk-(?:proj-)?[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  researchDestination:/docs\.google\.com\/spreadsheets\/d\/[A-Za-z0-9_-]{20,}|script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{20,}/,
  hardcodedSheet:/const\s+SHEET_ID\s*=\s*['"][A-Za-z0-9_-]{20,}['"]/,
  localUserPath:/[A-Z]:[\\/]Users[\\/]|\/Users\/[^/]+\//,
};
const findings=[];
for(const file of files){
  if(!fs.existsSync(file))continue;
  if(/(?:^|\/)(?:\.env|\.dev\.vars)(?:$|\.)/.test(file)&&!file.endsWith('.example'))findings.push({file,category:'privateEnvironment'});
  if(/\.(?:csv|tsv|xlsx|sqlite|db|pem|p12|pfx|key)$/i.test(file))findings.push({file,category:'privateDataOrKeyFile'});
  const data=fs.readFileSync(file);if(data.includes(0))continue;
  for(const [category,regex] of Object.entries(rules))if(regex.test(data.toString()))findings.push({file,category});
}
console.log(JSON.stringify({trackedFiles:files.length,findings},null,2));
if(findings.length)process.exitCode=1;
