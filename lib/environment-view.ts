import type {MapArea} from './mission-maps';
import type {Values} from './news-missions';
import type {PolicyEffect} from './policy-scene';
export const clamp01=(n:number)=>Math.max(0,Math.min(1,n));
/** Visual proxies for the teaching model, not empirical environmental estimates. */
export function environmentView(area:MapArea,values:Values,effects:PolicyEffect[],event:boolean){
 const repair=effects.find(e=>e.step===2&&e.visual==='grid');
 const repairProgress=clamp01(repair?.progress??0);
 const treatment=effects.filter(e=>e.visual==='filter'&&e.progress>0);
 const stopped=area==='reef'&&effects.some(e=>e.step===2&&e.visual==='dredge'&&e.progress>0);
 return {
  sediment:clamp01(1-values[1]/100),
  health:clamp01(values[2]/100),
  // Cable integrity follows repair, never an arbitrary village-power threshold.
  cableFailed:area==='wind'&&event&&repairProgress<1,
  repairProgress,
  powerFlow:area==='wind'&&values[0]>0&&(!event||repairProgress>0),
  // This event is heat driven; local treatment does not erase its bleaching signal.
  bleaching:(area==='reef'&&event)?0.55:0,
  treatmentStopped:stopped,
  treatmentProgress:treatment.length?Math.max(...treatment.map(e=>e.progress)):0,
 };
}
