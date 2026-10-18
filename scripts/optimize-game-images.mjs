import sharp from 'sharp';
import {readdir, mkdir, stat} from 'node:fs/promises';
import path from 'node:path';
const roots=['','environment-states','policy-art'];
let before=0,after=0,count=0;
for(const dir of roots){
 for(const name of await readdir(path.join('public',dir))){
  if(!name.endsWith('.png')||(!dir&&!/^(news-|mission-.*-v2)/.test(name)))continue;
  const input=path.join('public',dir,name),output=path.join('public','optimized',dir,name.replace('.png','.webp'));
  await mkdir(path.dirname(output),{recursive:true});
  await sharp(input).resize({width:name.startsWith('news-')?1100:1672,withoutEnlargement:true}).webp({quality:84,effort:6}).toFile(output);
  before+=(await stat(input)).size;after+=(await stat(output)).size;count++;
 }
}
console.log(JSON.stringify({count,before,after,reduction:Math.round((1-after/before)*100)+'%'}));
