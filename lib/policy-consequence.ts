import type {Bi} from './news-missions';
type Consequence={where:Bi;remaining:Bi};
const c=(where:Bi,remaining:Bi):Consequence=>({where,remaining});
// Scenario-specific limits. Numerical effects come exclusively from news-flow.
const contexts:Consequence[][]=[
 [
 c(['海上風場 → 海纜 → 島上住家','Offshore wind farm → cable → island homes'],['送電增加不等於已證實減碳；仍須監測替代燃料、排放與棲地。','More delivered power does not prove carbon savings; monitor displaced fuel, emissions and habitat.']),
 c(['近岸海床與新增風機','Nearshore seabed and new turbines'],['本情境忽略棲地的近岸施工會揚起泥沙、干擾棲地；風機數量不是減碳證據。','In this scenario, poorly sited nearshore works stir sediment and disturb habitat; turbine counts do not prove carbon savings.']),
 c(['核准紀錄；沒有新增送電工程','Approval records; no new delivery infrastructure'],['核准容量沒有變成實際送電，供電問題仍在。','Approved capacity has not become delivered electricity; the power problem remains.']),
 c(['故障海纜與島上配電','Failed subsea cable and island distribution'],['修復傳輸不等於新增發電，也不直接證明減碳。','Repairing transmission is not new generation and does not itself prove carbon savings.']),
 c(['新增海上風機；故障海纜未修','New offshore turbines; failed cable remains unrepaired'],['風機增加仍送不出電；本情境施工另增加水質與棲地壓力。','More turbines cannot bypass the failed cable; these works add water and habitat stress in this scenario.']),
 c(['宣傳活動；海纜仍故障','Publicity; cable still failed'],['沒有修復海纜，因此供電沒有恢復。','The cable is not repaired, so delivery does not recover.'])
 ],
 [
 c(['陸地逕流入口與海草試種區','Land runoff inlet and pilot seagrass plots'],['改善光照有利存活；淨碳匯仍須長期監測，不能只看株數。','Better light supports survival; net carbon storage still needs long-term monitoring, not shoot counts.']),
 c(['海床種植格；逕流入口未處理','Seabed planting plots; runoff inlet untreated'],['新增株數不代表長期存活；混濁與缺光仍未解除。','More planted shoots do not establish long-term survival; turbidity and low light remain.']),
 c(['挖泥區、泥沙擴散與種植區','Dredging area, sediment plume and planting plots'],['本情境挖泥擾動底泥、惡化光照；擴種無法抵銷損害。','Here dredging disturbs sediment and reduces light; more planting does not offset that harm.']),
 c(['逕流截流、沉砂與海草床','Runoff diversion, settling and seagrass bed'],['改善光照可減少地方壓力；復育與淨碳效益仍需監測。','Better light reduces local stress; restoration and net carbon benefits still require monitoring.']),
 c(['新增種植格；污染來源未處理','Additional planting plots; pollution source untreated'],['缺光未解，追加種植仍可能失敗，不能當作新增碳匯。','Low light persists, so extra planting can fail and cannot be counted as added carbon storage.']),
 c(['海草床；未控制逕流','Seagrass bed; runoff not controlled'],['等待沒有消除混濁來源，本局不給予自動恢復。','Waiting does not remove the turbidity source; this model awards no automatic recovery.'])
 ],
 [
 c(['岸上污水處理 → 排口 → 珊瑚礁','Onshore wastewater treatment → outfall → reef'],['減少地方污染不會降低海洋熱浪溫度，也不保證珊瑚復原。','Reducing local pollution does not cool a marine heatwave or guarantee coral recovery.']),
 c(['沿岸遊憩碼頭與排污口','Coastal visitor pier and wastewater outfall'],['本情境設施增加而污水未妥善處理，珊瑚承受額外壓力。','Here added facilities without adequate wastewater treatment put extra stress on coral.']),
 c(['珊瑚保護邊界；污水排口未處理','Reef protection boundary; wastewater outfall untreated'],['邊界可減少部分干擾，但不能代替污水治理或消除熱壓力。','A boundary can limit some disturbance but cannot replace wastewater treatment or remove heat stress.']),
 c(['持續運作的污水處理與珊瑚礁','Continuing wastewater treatment and reef'],['地方壓力降低，但海洋熱浪仍在；白化不等於已死亡。','Local stress falls, but marine heat stress remains; bleaching does not mean the coral is dead.']),
 c(['停止處理的排口 → 珊瑚礁','Untreated outfall → reef'],['污水壓力加上海洋熱壓力；停止處理不會讓熱浪消失。','Wastewater stress adds to marine heat stress; stopping treatment does not remove the heatwave.']),
 c(['珊瑚礁；等待降溫','Reef; waiting for cooler water'],['沒有減少地方污染，本局不假設等待就能恢復珊瑚。','Local pollution is not reduced; this model does not assume waiting restores coral.'])
 ]
];
export function policyConsequence(mission:number,step:number,choice:number):Consequence|null{
 return step===1?null:contexts[mission]?.[(step===2?3:0)+choice]??null;
}
