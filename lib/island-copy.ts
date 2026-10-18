import {bi} from './behavior-copy';
export const TOOL_COPY={
 survey:[bi('探勘海域','Survey the site'),bi('找出合適位置，避免盲目開工。','Find suitable locations before building.')],
 turbine:[bi('興建風機','Build a turbine'),bi('風機出現了！還要接上電纜才能送電。','A turbine is up! It needs a cable to deliver power.')],
 cable:[bi('連接海纜','Connect the cable'),bi('海纜接通。有風機時，城鎮亮燈！','Cable connected. With a turbine, the town lights up!')],
 battery:[bi('建置儲能','Add storage'),bi('儲能協助平衡供電，但不會憑空發電。','Storage helps balance supply; it does not generate energy.')],
 report:[bi('先發減碳報告','Publish a savings claim'),bi('報告花掉預算，卻沒有增加實際供電。','The report uses budget without delivering more power.')],
 filter:[bi('截流泥水','Control muddy runoff'),bi('泥水減少，海草能接收到更多光線。','Less muddy runoff lets more light reach seagrass.')],
 plant:[bi('試種海草','Plant a pilot meadow'),bi('先探勘、改善水質，海草才更容易存活。','Surveying and clear water improve the chance of survival.')],
 sample:[bi('採樣監測碳','Sample carbon pools'),bi('部署採樣浮標；碳匯仍須長期量測並扣除排放。','Sampling buoys deployed; net carbon requires long-term accounting.')],
 expand:[bi('直接大面積種植','Plant a large area'),bi('水質差時，大量種植也可能失敗。','Large-scale planting can fail in poor water conditions.')],
 treat:[bi('處理聚落污水','Treat wastewater'),bi('污水羽流消退，地方壓力降低；海水仍然偏熱。','The wastewater plume clears. Local stress falls, but heat persists.')],
 sensor:[bi('設置監測浮標','Place monitoring buoys'),bi('同時追蹤水質、海溫與珊瑚狀況。','Track water quality, temperature and coral condition together.')],
 patrol:[bi('守護珊瑚棲地','Protect reef habitat'),bi('配合乾淨水質可支持恢復，但不是所有珊瑚都會復原。','Protection and cleaner water support recovery, not a guaranteed full recovery.')],
 shade:[bi('局部遮蔭試驗','Try local shading'),bi('局部試驗不能消除整片海域的熱浪，也沒有處理污水。','A local trial removes neither regional heat nor wastewater.')],
 tourism:[bi('興建觀景碼頭','Build a visitor pier'),bi('旅遊設施耗用預算，也增加了污水處理負擔。','The pier costs budget and adds wastewater pressure.')]
};
export const GOALS={wind:[bi('完成選址','Site surveyed'),bi('城鎮取得風電','Wind power delivered'),bi('備妥儲能','Storage ready')],grass:[bi('泥水受控制','Runoff controlled'),bi('建立海草床','Meadow established'),bi('部署碳監測','Carbon monitoring')],reef:[bi('減少污水','Wastewater controlled'),bi('部署監測','Monitoring deployed'),bi('守護棲地','Habitat protected')]};
export const EVENTS={wind:bi('突發：風勢開始變動！城鎮需要可調節的供電。','Event: wind conditions shift! The town needs flexible power.'),grass:bi('突發：上游豪雨，泥水沖進海灣！','Event: heavy rain sends muddy runoff into the bay!'),reef:bi('突發：海洋熱浪升級，部分珊瑚白化！','Event: a marine heatwave intensifies; some corals bleach!')};
