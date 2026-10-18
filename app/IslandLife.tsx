/** Small shaded actors follow the painted village paths; ambient life does not affect research scores. */
export function IslandResidents(){
 return <g aria-hidden="true" className="island-residents">
  {Array.from({length:24},(_,i)=>[(['resident-one','resident-two','resident-three','resident-four','resident-hill','resident-beach'])[i%6],(['#d9b979','#759dab','#c87956','#e4d7b1','#7394b4','#a0b482'])[i%6],-i*3.7]).map(([route,color,delay])=><g key={String(route)+delay} className={'resident-route '+route} style={{animationDelay:delay+'s'}}>
   <ellipse cy="2" cx="3" rx="9" ry="3.5" fill="#243d30" opacity=".3"/>
   <g className="resident-step" style={{animationDelay:delay+'s'}}>
    <path className="walking-leg" d="M-3-9l-2 10M3-9l3 9" stroke="#394a4b" strokeWidth="3.5" strokeLinecap="round"/>
    <path d="M-5-21Q0-24 5-20L6-9H-5Z" fill={String(color)} stroke="#504d37" strokeWidth=".7"/>
    <path d="M-5-19l-3 9M5-19l3 8" stroke="#d6ad7c" strokeWidth="2.6" strokeLinecap="round"/>
    <circle cy="-26" r="4.8" fill="#d6ad7c"/><path d="M-5-27q0-7 9-3l1 4-4-3-6 2" fill="#5a4938"/>
    <path d="M-3-20v9" stroke="#fff6d8" strokeOpacity=".35" strokeWidth="2"/>
   </g>
  </g>)}
  {Array.from({length:8},(_,i)=>[i<4?'village-truck':i<6?'village-cart':'village-service',(['#6b9690','#c6a976','#b99369','#a5b8c0'])[i%4],-i*7.6]).map(([route,color,delay])=><g key={String(route)+delay} className={'vehicle-route '+route} style={{animationDelay:delay+'s'}}><g className="vehicle-body" style={{scale:route==='village-cart'?'.72':route==='village-service'?'.82':'.9'}}>
   <ellipse cy="3" rx="25" ry="8" fill="#203f34" opacity=".32"/>
   <ellipse cx="-13" cy="0" rx="4" ry="5.5" fill="#33434a"/><ellipse cx="15" cy="-1" rx="4" ry="5.5" fill="#33434a"/>
   <path d="M-24-14L9-20 25-10 23 0-8 5-24-4Z" fill={String(color)} stroke="#526455" strokeWidth="1"/>
   <path d="M-24-14L8-20 23-12-9-6Z" fill="#c3c4a6"/><path d="M-8-7L-4-20 9-23 22-15 23-4 8 0Z" fill={String(color)}/>
   <path d="M-4-20L9-23 20-16 7-13Z" fill="#e2dcc0"/><path d="M8-12L20-15 20-7 9-4Z" fill="#294e59"/><path d="M-5-17L4-12 4-5-7-9Z" fill="#497480"/>
   <path d="M-22-11l12 6v7l-12-6Z" fill="#566e5e" opacity=".65"/><path d="M19-2l4-1" stroke="#ffe6a0" strokeWidth="3"/>
  </g></g>)}
 </g>;
}

/** Harbor activity is decorative, never a signal of policy success. */
export function HarborLife(){
 return <g aria-hidden="true" className="harbor-life">
  {[[660,476],[680,491],[875,466]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}>
   <ellipse cy="7" rx="28" ry="9" fill="#253e32" opacity=".25"/><path d="M-23-20v27M23-20v27" stroke="#755d3b" strokeWidth="3"/>
   <path d="M-28-21L-17-34 21-31 30-16Z" fill={i===1?'#be865e':'#a5b295'} stroke="#5e6a4b"/>
   <path className="market-awning" d="M-28-21L30-16 29-10-27-15Z" fill="#e0cea0"/>
   <path d="M-23-4L13-8 24 0-13 5Z" fill="#ba9463"/>{[0,1,2,3].map(j=><circle key={j} cx={-14+j*8} cy={-5+j%2*2} r="4" fill={i===1?'#d5a859':'#718b4e'}/>)}
  </g>)}
  {[[996,502],[1025,518],[775,411],[807,424],[667,482],[893,470]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`} className="harbor-worker">
   <ellipse rx="9" ry="3" fill="#294231" opacity=".3"/><path d="M-3-9l-2 9M3-9l3 9" stroke="#414b43" strokeWidth="3"/>
   <path d="M-5-20h10v12H-5Z" fill={i<2?'#d8ad68':'#92b0a0'}/><circle cy="-25" r="5" fill="#d6b080"/>
   <path d="M-7-28h14" stroke="#e8d8a5" strokeWidth="4"/>
   <path className="worker-arm" style={{animationDelay:-i*.5+'s'}} d="M5-18l10 7M-5-18l-5 9" stroke="#d6ad7c" strokeWidth="3" fill="none"/>
   {i<2&&<path d="M12-6l14 5v12L12 6Z" fill="#a77c4d" stroke="#705c40"/>}
  </g>)}
  {[[1165,570],[1310,770],[165,730],[1250,300]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}>
   <g className={'harbor-boat harbor-route-'+i}>
    <path className="boat-wake" d="M-68 8q-28 10-58 2M-67 17q-30 12-56 5" stroke="#d8efe4" strokeWidth="3" fill="none" opacity=".5"/>
    <ellipse cy="11" rx="60" ry="18" fill="#164f62" opacity=".2"/>
    <g className="harbor-hull"><path d="M-55-5Q0-22 57-6L34 19Q-10 30-42 14Z" fill={i%2?'#658b8c':'#aa7552'} stroke="#395c5c" strokeWidth="2"/>
    <path d="M-47-6Q0-17 48-5L25 7-31 9Z" fill="#d9c999"/>
    <path d="M-11-24L17-28 31-16 30 3 0 10-12-1Z" fill="#bcc9b4" stroke="#5e7c72"/>
    <path d="M2-17l22-4v12L2-5Z" fill="#2d6678"/><path d="M-12-25L16-30 32-18 1-11Z" fill="#e2d6b2"/>
    <path d="M-24 0v-34" stroke="#776b4d" strokeWidth="3"/><path className="market-awning" d="M-23-34h18l-5 8h-13Z" fill="#d6b56f"/>
    </g>
   </g>
  </g>)}
  {[[180,315],[330,260],[550,150],[1000,320],[1230,660],[1510,370],[620,810],[1420,830]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><g className="coastal-bird" style={{animationDelay:-i*1.7+'s'}}><path className="bird-wings" d="M-15 0Q-8-10 0 0Q8-10 15 0" fill="none" stroke="#f4ebce" strokeWidth="3"/></g></g>)}
 </g>;
}

export function OceanSurface({id}:{id:string}){
 return <g aria-hidden="true">
  <defs>
   <mask id={'open-sea'+id}><rect width="1672" height="941" fill="white"/><path d="M96 413L151 325 202 201 362 176 438 105 566 115 640 208 775 132 892 163 966 281 1063 331 1088 469 1140 526 1138 599 1019 621 925 617 853 668 731 730 605 752 483 718 469 643 329 610 173 580 90 505Z" fill="black"/></mask>
   <pattern id={'ocean-ripple'+id} width="180" height="90" patternUnits="userSpaceOnUse"><path d="M-30 27q25-12 50 0t50 0t50 0t50 0t50 0M15 70q20-9 40 0t40 0t40 0" stroke="#b2e9df" strokeWidth="2" fill="none"/><path d="M0 35q25-12 50 0t50 0t50 0t50 0" stroke="#086782" strokeWidth="4" fill="none"/></pattern>
  </defs>
  <g mask={'url(#open-sea'+id+')'}><rect className="ocean-current" x="-200" y="-100" width="2072" height="1141" fill={'url(#ocean-ripple'+id+')'} opacity=".22"/>
   {Array.from({length:24},(_,i)=><path key={i} className="sea-glint" d={'M'+(70+(i%6)*295)+' '+(70+Math.floor(i/6)*245)+'q18-7 35 0t30 0'} stroke="#e5fff0" strokeWidth="3" strokeLinecap="round" fill="none" style={{animationDelay:(-i*.47)+'s'}} opacity=".32"/>)}
  </g>
  {[0,1,2].map(i=><g className="shore-surf" key={i} style={{animationDelay:(-i*1.7)+'s'}} fill="none" stroke="#edfff1" strokeLinecap="round"><path d="M395 545Q444 562 479 576T550 610Q567 625 568 638" strokeWidth="5"/><path d="M843 615Q850 589 875 580" strokeWidth="4"/><path d="M157 397q-28 21 1 35M989 391q42 3 35 25" strokeWidth="3"/></g>)}
 </g>;
}
