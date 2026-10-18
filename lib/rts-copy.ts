import {bi,type Copy} from './behavior-copy';
export const NAMES=[bi('風電與供電','Wind & power'),bi('海草與水質','Seagrass & water'),bi('珊瑚與聚落','Reef & village')];
export const ROUND=[bi('第一關 · 初任治理','Level 1 · First command'),bi('第二關 · 豪雨與供電','Level 2 · Rain & power'),bi('第三關 · 暖海挑戰','Level 3 · Warming seas')];
export const STEPS=[bi('政策部署','Policy'),bi('成效監測','Monitor'),bi('事件應變','Respond')];
export const LABELS:Copy[][]=[
 [bi('評估選址，再建置併網','Assess, build & connect'),bi('就近直接興建風機','Build at the nearest site'),bi('先按容量申報減碳','Claim capacity as savings')],
 [bi('工程數量與成本','Count assets & costs'),bi('實際供電與替代排放','Track power & emissions'),bi('海溫與透明度','Track temperature & clarity')],
 [bi('增加風機','Add more turbines'),bi('修復送電瓶頸','Repair grid delivery'),bi('維持預估減碳','Keep forecast claims')],
 [bi('直接大面積種植','Plant a large area'),bi('調查棲地，適地試作','Survey & pilot restoration'),bi('清除棲地後種植','Clear habitat, then plant')],
 [bi('面積、株數與人數','Count plants & attendance'),bi('設備、經費與工期','Track spending & workdays'),bi('植體、底泥碳與排放','Track carbon & emissions')],
 [bi('截流泥水，暫緩擴種','Control runoff; pause expansion'),bi('維持水質，加倍種植','Double planting in turbid water'),bi('停止監測，報株數','Stop sampling; report counts')],
 [bi('增設觀景設施','Build a visitor platform'),bi('只劃設保護邊界','Draw a boundary only'),bi('處理聚落污水','Treat village wastewater')],
 [bi('水質、珊瑚存活與海溫','Track water, survival & heat'),bi('水色、遊客與收入','Track color, tourists & revenue'),bi('面積、標牌與巡邏','Count signs, area & patrols')],
 [bi('仍然白化，撤除治理','Stop controls after bleaching'),bi('維持治理並追蹤熱壓力','Sustain controls; track heat'),bi('宣布熱浪已解決','Declare the heatwave over')]
];
export const REASONS:Copy[][]=[
 [bi('先評估選址與協商，再施工及併網。真正替代化石能源後，才有減碳效益。','Assess and consult before construction and grid connection. Emissions benefits require displaced fossil energy.'),bi('施工已開始，但選址與併網不足可能傷害棲地，完工也不等於有電。','Construction starts, but poor siting can harm habitats. Completion alone does not deliver power.'),bi('報告不會產生電力。核准容量不能直接當作已實現的減碳。','A report generates no power. Approved capacity is not realized emissions savings.')],
 [bi('數量與成本可管理工程，但不足以證明減碳。','Counts and costs manage construction, not verified emissions savings.'),bi('同時看送電量、替代哪種能源與排放，才能判斷減碳。','Delivered power, displaced energy and emissions reveal climate effects.'),bi('海況資料有用，但不能代替供電與排放證據。','Ocean data matter, but cannot replace power and emissions evidence.')],
 [bi('新風機逐步增加；送電瓶頸未解決，仍不能把電送進聚落。','More turbines appear, but the delivery bottleneck remains.'),bi('修復期間逐步接通海纜。供電恢復後，減碳與生活才改善。','The cable reconnects during repairs. Benefits follow restored delivery.'),bi('預估數字不會修好海纜，居民仍面對供電問題。','Forecast claims do not repair the cable; residents still face power problems.')],
 [bi('海草先種下，但水濁遮光，可能逐漸枯萎；大量種植不保證成功。','Plants appear first, but turbid water limits light. Large planting is no guarantee of survival.'),bi('調查適合的棲地後小規模復育，降低失敗風險；碳匯仍需量測。','A suitable-site pilot reduces failure risk. Carbon storage still needs measurement.'),bi('清除原有生物會損害棲地；新的海草不一定能抵銷損失。','Clearing existing life damages habitat; new planting may not offset the loss.')],
 [bi('種得多不代表活得好，也不等於淨碳匯。','More plants do not prove survival or net carbon storage.'),bi('支出與工期是執行資料，不能證明儲存多少碳。','Spending and schedules do not establish stored carbon.'),bi('追蹤植體、底泥碳並扣除專案排放，才接近淨效益。','Track plant and sediment carbon and deduct project emissions.')],
 [bi('先減少泥水、改善光照。水質與海草逐漸恢復，不能瞬間回復。','Reduce muddy runoff and improve light first. Recovery takes time.'),bi('沒有改善光照，更多幼苗仍可能枯萎，浪費預算。','Without better light, more seedlings can die and waste budget.'),bi('停止監測會看不見持續惡化，株數不能代表復育成功。','Stopping monitoring hides deterioration. Counts do not prove restoration success.')],
 [bi('觀景設施可能增加活動與收入，也增加污水及棲地壓力。','Visitor facilities can support income but add wastewater and habitat pressure.'),bi('邊界出現了，但污染源與海洋高溫不會因劃線消失。','A boundary appears; pollution and ocean heat do not disappear with it.'),bi('污水處理完工後，污染逐步下降；珊瑚恢復仍受高溫限制。','After treatment operates, pollution declines gradually. Heat still limits reef recovery.')],
 [bi('同時追蹤地方水質、珊瑚存活及高溫，分辨不同壓力。','Track water, coral survival and heat to distinguish local and global pressures.'),bi('水色與收入不能可靠判斷珊瑚健康及熱壓力。','Color and income do not reliably establish reef health or heat stress.'),bi('管理活動數量不是生態成果，仍須監測珊瑚與海溫。','Management counts are not ecological outcomes. Monitor corals and temperature.')],
 [bi('高溫造成白化，不代表污染控制無效。撤除治理會增加地方壓力。','Heat-related bleaching does not make pollution control useless. Removing it adds stress.'),bi('維持污染控制並追蹤熱壓力，可支持恢復；仍需要全球減碳。','Sustain local controls and track heat to support recovery. Global emissions cuts remain necessary.'),bi('宣布成功不會降低海溫；沒有監測就無法確認恢復。','A declaration does not cool the sea. Recovery needs monitoring.')]
];
export const EVENTS=[bi('送電設備故障：風機有轉，聚落卻收不到電。','Grid failure: turbines turn, but the village cannot receive power.'),bi('上游豪雨：泥水遮光，海草開始承受壓力。','Heavy rain: muddy runoff blocks light and stresses seagrass.'),bi('海洋熱浪：即使水質改善，珊瑚仍可能白化。','Marine heatwave: corals can bleach even when water improves.')];
