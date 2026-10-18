import type {MapArea} from './mission-maps';
import type {Values} from './news-missions';
/** Teaching-index interpolation, not a measured ecological prediction. */
export const artWeight=(n:number)=>Math.max(0,Math.min(1,n/100));
export function environmentArt(area:MapArea,values:Values){
 // Illustrative intensity, not measured percent coral cover. Low reef indices
 // retain visible bleaching and pollution; water and health stay independent.
 const weight=(n:number)=>area==='reef'?artWeight(n)**2:artWeight(n);
 return {low:`/environment-states/${area}-low${area==='reef'?'-v2':''}.png`,high:`/environment-states/${area}-high.png`,water:weight(values[1]),habitat:weight(values[2]),power:artWeight(values[0])};
}
