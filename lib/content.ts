export const VERSION = 'ocean-click-v2.0.0';
export const PHASES = ['pre', 'post1', 'post2'] as const;
export type Phase = typeof PHASES[number];
export type Option = { id: string; text: string };
export type Question = { id: string; domain: string; title: string; options: Option[] };
const item = (phase: Phase, n: number, domain: string, title: string, options: string[]): Question => ({id:`${phase}-k${n}`,domain,title,options:[...options.map((text,i)=>({id:String(i+1),text})),{id:'unknown',text:'我還不確定'}]});
export const QUESTIONS: Record<Phase, Question[]> = {
  pre: [
    item('pre',1,'能源與減碳','離岸風電主要透過什麼方式幫助減緩暖化？',['風機旋轉，直接讓海水降溫','發電若取代化石燃料，可減少排放','風機周圍的海水會吸收所有碳排']),
    item('pre',2,'藍碳機制','海草復育的儲碳作用，主要發生在哪裡？',['只在海面上方的空氣','只在海草附近的魚群','海草植體與底泥等碳儲存庫']),
    item('pre',3,'保育與氣候限制','設立海洋保護區，就能阻止海洋熱浪嗎？',['不能；地方保育有幫助，但仍會受熱浪影響','可以；保護區邊界能隔開熱水','可以；只要禁止捕魚就不會白化']),
    item('pre',4,'政策取捨','規劃離岸風場時，哪一種做法較完整？',['只比較風機數量','只要能減碳，就不用考慮其他影響','一併考慮發電、棲地、漁業與社區']),
    item('pre',5,'證據與監測','如何判斷海草復育是否增加淨碳匯？',['只看種下多少株','持續監測碳儲存變化，也計入專案排放','只看完工照片是否漂亮']),
    item('pre',6,'白化與死亡','珊瑚變白，最合理的理解是？',['珊瑚受到壓力，可能恢復，也可能死亡','已經全部死亡，不需再監測','完全正常，不需注意環境壓力']),
  ],
  post1: [
    item('post1',1,'能源與減碳','風場完工後，要有什麼條件才有助於減少排放？',['只要獲得許可，就已完成減碳','能實際發電並取代部分化石能源','風機外觀與海洋顏色一致']),
    item('post1',2,'藍碳機制','健康海草床為什麼與氣候政策有關？',['海草讓整個海洋立即變冷','海草能吸走所有人為排放','海草及底泥能儲存部分碳']),
    item('post1',3,'保育與氣候限制','加強海洋保護區管理後，還需要全球減碳嗎？',['仍需要，地方管理無法消除全球暖化壓力','不需要，保護區可以完全隔絕熱浪','不需要，只要魚群恢復就不會暖化']),
    item('post1',4,'政策取捨','評估風場成效，除了發電，還應注意什麼？',['其他影響都與政策無關','只需看風機是否顯眼','生態、漁業及社區受到的影響']),
    item('post1',5,'證據與監測','復育工程結束後，何者最能支持碳匯成效判斷？',['當天參與人數','後續監測資料及包含專案排放的計算','活動新聞的分享次數']),
    item('post1',6,'白化與死亡','珊瑚白化後，哪一種情況可能發生？',['壓力降低後有機會恢復，持續受壓也可能死亡','所有白化珊瑚一定隔天死亡','所有白化珊瑚一定自行恢復']),
  ],
  post2: [
    item('post2',1,'能源與減碳','甲島核准風場，但尚未施工。現在可下哪個結論？',['海溫已因此明顯下降','所有預期減碳量都已實現','減碳成效仍要看建置、運轉及能源替代']),
    item('post2',2,'藍碳機制','乙灣要保護藍碳，除了海草，還應重視哪一部分？',['海底土壤與底泥中的碳','觀景台的油漆顏色','船隻上的裝飾植物']),
    item('post2',3,'保育與氣候限制','丙島保護區仍遭熱浪白化，該如何理解？',['這證明所有保育政策都沒有作用','地方壓力可降低，但氣候壓力仍可能造成損害','這表示白化與海水溫度無關']),
    item('post2',4,'政策取捨','丁島風場減碳潛力高，卻影響主要漁場。較完整的下一步是？',['比較選址與規模，與受影響者討論取捨','只要能減碳，就忽略漁業影響','只計算風機數量，不再調查']),
    item('post2',5,'證據與監測','戊灣宣布種植面積增加，就能證明淨碳匯增加嗎？',['可以，面積等於淨碳匯','可以，任何地方種植都一樣','還不能，需要場址、存活、監測與排放等證據']),
    item('post2',6,'白化與死亡','己島白化珊瑚開始恢復顏色，最合理的解讀是？',['原本的白化觀察必定有誤','白化不等於已死亡，恢復仍需持續觀察','從此永遠不會再受到熱壓力']),
  ],
};
export const PHASE_LABELS: Record<Phase,string> = {pre:'第一關・前測',post1:'第二關・後測一',post2:'第三關・後測二'};
export const PHASE_DESCRIPTIONS: Record<Phase,string> = {pre:'先留下你現在的想法',post1:'再看看你對政策的理解',post2:'換個海島，試試能否應用'};
export const EXPLANATIONS = [
 '風場要經過建置與運轉；實際取代部分化石燃料發電，才有助於減少排放。不是讓海水立即變冷。',
 '海草等沿海生態系的碳可儲存在植體與底泥中。場址與棲地條件會影響復育成效。',
 '地方保育可降低部分壓力、支持生態韌性；它不能阻止海洋熱浪，也不能取代全球減碳。',
 '政策需要比較減碳、生態、生計與經費的取捨；具有一項效益，並不代表其他影響可以忽略。',
 '種植面積不是淨碳匯的證明。需要持續監測、合理計算，也要計入專案造成的排放。',
 '白化表示珊瑚承受壓力，不等於已死亡；條件改善可能恢復，長期壓力則可能致死。',
];
export type SceneKind = 'wind' | 'grass' | 'reef';
export type Policy = {id:string;title:string;description:string;cost:number;effect:string;caption:string;scene:SceneKind;active:boolean};
export const NEWS = [
 {id:'wind-20260327',type:'能源轉型',date:'2026.03.27',title:'風場，蓋在哪裡才好？',summary:'台灣啟動離岸風電 3-3 期選商。你的海島也需要能源，但沿海同時是居民工作的地方。',source:'經濟部',url:'https://service.moea.gov.tw/EE514/tw/geipc/155-7446.html',scene:'wind' as SceneKind,
 policies:[
 {id:'wind-build',title:'建置風場＋社區支持',description:'投入較多經費，評估選址、協商生計並推動建設。',cost:3,effect:'規劃 → 建置 → 運轉 → 替代部分化石能源',caption:'有助減碳的條件是實際能源替代；生態與漁業影響仍需評估。',scene:'wind',active:true},
 {id:'wind-study',title:'先調查，再協商',description:'先了解棲地與漁場，保留後續建設選擇。',cost:1,effect:'調查 → 比較場址 → 社區討論',caption:'先降低選址資訊不足；這個階段尚未產生風電替代效益。',scene:'wind',active:false},
 ] as Policy[]},
 {id:'blue-20250724',type:'藍碳與復育',date:'2025.07.24',title:'種下海草，就算完成減碳嗎？',summary:'台灣審議通過海草與紅樹林減量方法。復育要考慮適合的場址、生態影響與長期監測。',source:'環境部',url:'https://enews.moenv.gov.tw/moenv-news/zh-tw/News/2278',scene:'grass' as SceneKind,
 policies:[
 {id:'grass-restore',title:'合適場址復育＋監測',description:'改善棲地，追蹤存活與碳儲存，也計入工程排放。',cost:2,effect:'場址評估 → 復育 → 海草與底泥儲碳',caption:'植物與底泥都能儲碳；實際成效要靠監測，不能只計算種植面積。',scene:'grass',active:true},
 {id:'grass-hold',title:'暫緩擴大種植',description:'先保留經費；場址證據不足時，不急著擴張。',cost:0,effect:'維持現況 → 等待調查與資源',caption:'這次沒有新增復育投入，也不新增示意碳匯。藍碳仍需合適場址與證據。',scene:'grass',active:false},
 ] as Policy[]},
 {id:'reef-20260602',type:'保育與氣候',date:'2026.06.02',title:'熱浪來了，保護區還有用嗎？',summary:'NOAA 回顧第四次全球珊瑚白化事件。白化不等於死亡，而地方管理也不能阻擋全球暖化。',source:'NOAA',url:'https://www.nesdis.noaa.gov/news/worlds-fourth-mass-coral-bleaching-event-likely-ended-2025',scene:'reef' as SceneKind,
 policies:[
 {id:'reef-manage',title:'降低地方壓力＋監測',description:'加強管理、減少可控干擾，持續觀察珊瑚。',cost:2,effect:'減少地方壓力 → 支持恢復條件 → 持續監測',caption:'部分珊瑚可能恢復，但熱壓力仍存在；保育需要搭配更廣泛的減碳。',scene:'reef',active:true},
 {id:'reef-existing',title:'維持現有管理',description:'保留經費，這次不增加地方保育投入。',cost:0,effect:'熱壓力持續 → 觀察白化與存活',caption:'白化後可能恢復，也可能死亡；不能只憑顏色推定全部死亡。',scene:'reef',active:false},
 ] as Policy[]},
];
