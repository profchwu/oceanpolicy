import type {Bi,Values} from './news-missions';
/** Explain climate mechanisms without converting teaching indices to emissions. */
export function climateFeedback(area:string,delta:Values):Bi{
 if(area==='reef')return ['地方減污影響珊瑚健康；不會直接降低海溫。熱浪仍需全球減碳應對。','Local pollution controls affect coral health, not ocean temperature. Heat risk still needs global emissions cuts.'];
 if(area==='grass')return delta[1]>0&&delta[2]>0?['水質與海草改善，有利維持藍碳功能；淨碳匯仍須量測，不能用株數換算。','Better water and seagrass support blue-carbon functions. Net carbon storage still needs measurement, not shoot counts.']:['海草的碳匯取決於存活與長期碳量；本次決策不能直接宣告減碳成果。','Seagrass carbon benefits depend on survival and long-term storage. This decision does not establish carbon savings.'];
 return delta[0]>0?['送電增加，有機會替代化石發電；實際減碳仍須替代能源與排放資料。','More delivered wind power can displace fossil generation. Actual savings require displaced-fuel and emissions data.']:['本次沒有增加送電；風機數量或宣傳不能證明減碳。','This action adds no delivered power. Turbine counts or publicity do not demonstrate emission cuts.'];
}
