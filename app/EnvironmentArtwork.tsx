import {useId} from 'react';
import {MAPS,type MapArea} from '@/lib/mission-maps';
import type {Values} from '@/lib/news-missions';
import {environmentArt} from '@/lib/environment-art';
/** Blend only the relevant locations, leaving terrain/roads fixed for moving actors. */
export default function EnvironmentArtwork({area,values}:{area:MapArea;values:Values}){
 const id=useId().replace(/:/g,''),art=environmentArt(area,values),habitat=area==='reef'?[1030,675,550,220]:area==='grass'?[830,615,620,240]:[1340,800,310,120];
 const img=(path:string,opacity=1)=><image href={path} width="1672" height="941" preserveAspectRatio="none" opacity={opacity}/>;
 return <g className="environment-artwork" data-water-art={values[1]} data-habitat-art={values[2]} data-power-art={values[0]}>
 <defs><clipPath id={'art-water'+id}><path d={MAPS[area].water}/></clipPath><radialGradient id={'art-feather'+id}><stop offset=".8" stopColor="white"/><stop offset="1" stopColor="black"/></radialGradient><mask id={'art-habitat'+id}><ellipse cx={habitat[0]} cy={habitat[1]} rx={habitat[2]} ry={habitat[3]} fill={'url(#art-feather'+id+')'}/></mask><clipPath id={'art-power'+id}><path d="M370 335L765 315 1010 365 1020 470 850 530 450 510Z"/></clipPath></defs>
 {area==='reef'&&img(art.low)}
 <g clipPath={'url(#art-water'+id+')'}>{img(art.low)}{img(art.high,art.water)}</g>
 <g clipPath={'url(#art-water'+id+')'} mask={'url(#art-habitat'+id+')'}>{img(art.low)}{img(art.high,art.habitat)}</g>
 {area==='wind'&&<g clipPath={'url(#art-power'+id+')'}>{img(art.low)}{img(art.high,art.power)}</g>}
 </g>;
}
