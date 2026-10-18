import type {MapArea} from './mission-maps';
import type {PolicyEffect} from './policy-scene';
export type PolicyArt={key:string;image:string;box:[number,number,number,number];mode:'build'|'plant'|'flow'|'hold';channel:string};
const regions:Record<string,[PolicyArt['box'],PolicyArt['mode'],string]>={
 'reef-0-filter':[[845,125,300,170],'build','treatment'],
 'reef-0-dredge':[[1080,195,245,165],'build','pier'],
 'reef-0-hold':[[1040,440,610,430],'hold','boundary'],
 'reef-2-filter':[[845,125,300,170],'flow','treatment'],
 'reef-2-dredge':[[845,125,320,190],'flow','treatment'],
 'reef-2-hold':[[1470,445,65,95],'hold','waiting'],
 'grass-0-barrier':[[1220,175,450,260],'build','runoff'],
 'grass-0-plant':[[680,530,320,220],'plant','plots'],
 'grass-0-dredge':[[710,395,310,255],'build','dredger'],
 'grass-2-filter':[[1270,150,402,290],'flow','runoff'],
 'grass-2-expand':[[430,350,820,450],'plant','plots'],
 'grass-2-hold':[[1320,410,300,180],'hold','waiting'],
 'wind-0-grid':[[1080,300,570,350],'flow','cable'],
 'wind-0-dredge':[[1435,445,237,370],'build','turbines-initial'],
 'wind-0-hold':[[935,405,130,80],'hold','publicity'],
 'wind-2-grid':[[1050,630,310,170],'flow','repair'],
 'wind-2-dredge':[[1190,540,482,310],'build','turbines-response'],
 'wind-2-hold':[[910,375,160,115],'hold','publicity'],
};
export function policyArt(area:MapArea,e:PolicyEffect):PolicyArt|null{
 const key=`${area}-${e.step}-${e.visual}`,r=regions[key];
 return r?{key,image:`/optimized/policy-art/${key}.webp`,box:r[0],mode:r[1],channel:r[2]}:null;
}
/** Keep earlier structures; only later actions on the same facility replace it. */
export function policyLayers(area:MapArea,effects:PolicyEffect[]){
 return effects.filter(e=>e.step!==1&&e.progress>0).flatMap(e=>{
 const art=policyArt(area,e);return art?[{...art,progress:Math.max(0,Math.min(1,e.progress))}]:[];
 });
}
