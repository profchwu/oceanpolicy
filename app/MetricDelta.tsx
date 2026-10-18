export default function MetricDelta({value,en}:{value:number;en:boolean}){
 const n=Math.round(value);
 return <strong className={'metric-change '+(n>0?'increase':n<0?'decrease':'stable')}>{n>0?'↑ +':n<0?'↓ −':''}{Math.abs(n)} <span>{n>0?(en?'up':'上升'):n<0?(en?'down':'下降'):(en?'unchanged':'不變')}</span></strong>;
}
