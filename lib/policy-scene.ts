import type {Choice} from './crisis';
import type {MapArea} from './mission-maps';
export type PolicyEffect={visual:Choice;step:number;progress:number};
export function policyScene(area:MapArea,choice:Choice|undefined,step:number){
 const s=(point:[number,number],zh:string[],en:string[])=>({point,zh,en});
 if(choice==='evidence'||choice==='count'||!choice)return s([0,0],[],[]);
 if(area==='wind'){
  if(choice==='grid')return step===0?s([1390,490],['海上選址與基礎','風機吊裝・鋪設海纜','併網送電至住家'],['Offshore foundations','Turbines & cable installation','Grid connection powers homes']):s([1120,570],['定位海纜故障','修復海纜與配電','恢復既有風機送電'],['Locate cable fault','Repair cable & distribution','Restore power delivery']);
  if(choice==='dredge')return s(step===2?[1420,790]:[1420,660],['近岸海床施工','增建風機・泥沙擴散',step===2?'風機增加・故障未解':'部分送電・棲地受擾'],['Nearshore seabed works','More turbines & sediment',step===2?'More turbines; cable still failed':'Partial power; habitat disturbed']);
 }
 if(area==='grass'){
  if(choice==='barrier')return s([1390,440],['源頭截流與沉砂','水質改善・小樣區試種','觀察海草存活'],['Divert runoff & settle sediment','Clearer water & pilot plots','Observe seagrass survival']);
  if(choice==='filter')return s([1390,440],['維護截流與過濾','泥沙減少・光照恢復','海草恢復跡象'],['Maintain runoff treatment','Less sediment; light returns','Seagrass recovery signs']);
  if(choice==='plant'||choice==='expand')return s([860,650],['海床劃設種植格','增加種植株數',choice==='expand'?'缺光持續・新苗萎縮':'株數增加・水質未改善'],['Mark planting plots','Plant more shoots',choice==='expand'?'Low light persists; shoots decline':'More shoots; water unchanged']);
  if(choice==='dredge')return s([900,660],['挖泥船進入海灣','挖泥後擴種・泥沙揚起','混濁增加・海草受損'],['Dredger enters bay','Dredge & plant; sediment rises','Turbidity rises; seagrass harmed']);
 }
 if(area==='reef'){
  if(choice==='filter')return s([1050,310],['啟用污水處理','排口污染逐漸下降',step===2?'地方壓力降低・熱浪仍在':'地方壓力降低・仍須防熱浪'],['Activate wastewater treatment','Reduce polluted discharge',step===2?'Less local stress; heat remains':'Less local stress; heat risk remains']);
  if(choice==='dredge')return step===0?s([1160,400],['沿岸遊憩設施施工','碼頭擴大・排污增加','珊瑚承受額外壓力'],['Build visitor facilities','Larger pier; more discharge','Added stress on coral']):s([1050,310],['停止污水處理','排口污水重新增加','污染加重・珊瑚受損'],['Stop wastewater treatment','Polluted discharge increases','More pollution; coral harmed']);
 }
 return s(area==='wind'?[1120,570]:area==='grass'?[860,650]:[1190,655],area==='reef'&&step===0?['劃設保護邊界','污水排口仍持續','部分干擾減少・污染未解']:['未新增實體措施','原有壓力仍持續','問題尚未解除'],area==='reef'&&step===0?['Mark protected boundary','Wastewater still flows','Some disturbance limited; pollution remains']:['No physical intervention','Existing pressure continues','Underlying problem remains']);
}
