'use client';
import {useId} from 'react';
import type {SceneKind} from '@/lib/content';
import {translate,type Language} from '@/lib/i18n';
export default function OceanScene({kind='wind',active=false,playing=false,reduced=false,language='zh-Hant'}:{kind?:SceneKind;active?:boolean;playing?:boolean;reduced?:boolean;language?:Language}){
 const t=(text:string)=>translate(language,text);const id=useId().replace(/:/g,'');
 const focus=kind==='wind'?{x:980,y:167,r:147}:kind==='grass'?{x:318,y:455,r:135}:{x:656,y:505,r:105};
 return <div className={`ocean-scene command-scene ${kind} ${active?'active':''} ${playing?'playing':''} ${reduced?'still':''}`}>
  <div className="scene-head"><span><i/>{t('海洋指揮中心')}</span><span className="scene-coordinate">SECTOR {kind==='wind'?'01':kind==='grass'?'02':'03'}</span></div>
  <div className="command-map">
   <svg viewBox="0 0 1200 675" role="img" aria-label={t(kind==='wind'?'離岸風場、漁船與沿海社區示意':kind==='grass'?'海草與底泥儲碳示意':'珊瑚白化與地方保育示意')}>
    <defs>
     <linearGradient id={`shade-${id}`} x2="0" y2="1"><stop stopColor="#071c2b" stopOpacity="0"/><stop offset="1" stopColor="#071c2b" stopOpacity=".36"/></linearGradient>
     <radialGradient id={`halo-${id}`}><stop stopColor="#77e3cf" stopOpacity=".16"/><stop offset="1" stopColor="#77e3cf" stopOpacity="0"/></radialGradient>
    </defs>
    <image href="/command-island.png" width="1200" height="675" preserveAspectRatio="xMidYMid slice"/>
    <rect width="1200" height="675" fill={`url(#shade-${id})`}/>
    <g aria-hidden="true">
     <circle className="region-halo" cx={focus.x} cy={focus.y} r={focus.r+45} fill={`url(#halo-${id})`}/>
     <circle className="region-outline" cx={focus.x} cy={focus.y} r={focus.r} fill="none" stroke={active?'#77e3cf':'#efb976'} strokeWidth="2" strokeDasharray="9 8" vectorEffect="non-scaling-stroke"/>
     {playing&&<circle className="policy-pulse" cx={focus.x} cy={focus.y} r={focus.r} fill="none" stroke={active?'#77e3cf':'#efb976'} strokeWidth="2" vectorEffect="non-scaling-stroke"/>}
     {kind==='wind'&&<>
      <path className={active?'energy-route operating':'energy-route'} d="M991 238Q947 312 878 324T718 364" fill="none" stroke={active?'#77e3cf':'#eebc80'} strokeWidth="3" strokeDasharray={active?'9 13':'5 12'} vectorEffect="non-scaling-stroke"/>
      {[[1026,76],[951,142],[1091,175]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><circle className={active?'turbine-light on':'turbine-light'} r="9" fill={active?'#77e3cf':'#efb976'} fillOpacity=".85"/><circle r="17" fill="none" stroke={active?'#77e3cf':'#efb976'} strokeOpacity=".6"/></g>)}
      {playing&&!active&&<path className="survey-line" d="M833 94L1121 256M837 240L1112 113" stroke="#efb976" strokeWidth="2" strokeDasharray="4 10"/>}
     </>}
     {kind==='grass'&&<>
      <path className="seagrass-bed" d="M196 446Q260 400 350 419T438 475Q350 537 250 508T196 446Z" fill={active?'#57c7a0':'#4b8f7c'} fillOpacity={active?'.3':'.1'} stroke="#77e3cf" strokeWidth="2"/>
      {[[-78,0],[-46,14],[-15,-3],[16,16],[48,0],[78,12]].map(([x,y],i)=><g key={i} transform={`translate(${318+x} ${451+y})`}><g className="command-grass" style={{animationDelay:`${i*.1}s`}} opacity={active?1:.42}><path d="M0 30Q-21 0-15-31Q-8-17 0 7Q3-25 18-41Q22-5 2 30" fill={active?'#77e3cf':'#528976'} stroke="#bcf2d2" strokeWidth="1.5"/></g></g>)}
      {active&&[-60,0,60].map((x,i)=><g className="carbon-transfer" key={x} style={{animationDelay:`${i*.6}s`}}><circle cx={318+x} cy="497" r="16" fill="#102b3b" stroke="#77e3cf"/><text x={318+x} y="503" textAnchor="middle" fill="#b7f6dc" fontSize="18">C</text></g>)}
     </>}
     {kind==='reef'&&<>
      <path d="M740 387L849 430" stroke="#88b8c2" strokeDasharray="5 7" strokeWidth="2"/>
      <rect x="849" y="397" width="309" height="197" rx="6" fill="#09222e" fillOpacity=".94" stroke="#476e7a"/>
      <path d="M884 555Q1005 586 1124 556" stroke="#305b67" strokeWidth="10" fill="none"/>
      {[903,992,1082].map((x,i)=><g key={x} transform={`translate(${x} ${516+i%2*10})`}><path className="command-coral" d="M0 40V-32M0 10L-23-6V-29M0 18L25-5V-23M0-15L15-29V-40" fill="none" stroke={active&&i<2?['#e8b67c','#c7859c'][i]:'#e1e9e4'} strokeWidth="9" strokeLinecap="round"/></g>)}
      <g className="heat-stress" transform="translate(-20 -65)" fill="none" stroke="#efb976" strokeWidth="3" opacity=".85"><path d="M1110 419q-8 10 0 20t0 20m14-40q-8 10 0 20t0 20m14-40q-8 10 0 20t0 20"/></g>
     </>}
     <path d="M18 47V18H47M1153 18H1182V47M18 628V657H47M1153 657H1182V628" fill="none" stroke="#77e3cf" strokeWidth="2" opacity=".65"/>
    </g>
   </svg>
   <span className="map-context">{t('虛構海島・政策情境示意')}</span>
   <span className="map-pin community-pin"><i/>{t('沿岸社區')}</span>
   <span className={`map-pin focus-pin pin-${kind}`}><i/>{t(kind==='wind'?'風場規劃區':kind==='grass'?'海草與底泥':'珊瑚棲地')}</span>
   {kind==='reef'&&<span className="heat-label">{t('熱壓力仍存在')}</span>}
  </div>
  <div className="scene-foot"><span><i/>{t('情境示意・非即時監測')}</span>{playing&&<span className="time-pill">{t(kind==='reef'?'數週至數年變化，數秒示意':'數年變化，數秒示意')}</span>}</div>
 </div>;
}
