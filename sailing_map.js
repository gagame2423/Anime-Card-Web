/* Sailing Sea: seeded ocean geometry, navigation and cached procedural Canvas 2D art. */
(function (host) {
 'use strict';
 const SIZE=4000, SPEED=112, DOCK_RANGE=64, TAU=Math.PI*2;
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const seedOf=(...parts)=>host.AutoChessSystem.seedOf(...parts),random=s=>host.AutoChessSystem.random(s);
 const int=(s,a,b)=>a+Math.floor(random(s)*(b-a+1)),between=(s,a,b)=>a+random(s)*(b-a);
 const NAMES=['Windward Cay','Coral Haven','Turtle Crown','Saltwind Isle','Palmwatch','Jade Reef','Moonshore','Cinder Sands','Skipper’s Rest','Mariner’s Hold','Lotus Keys','Ghost Palm','Pearl Atoll','Sundown Cay','Mermaid Reach','Copper Coast','Whisper Rock','Anchor Point','Shell Harbor','Parrot Bay','Golden Shoal','Driftwood Isle','Azure Bank','Skullcap','Lantern Cove','Tempest Key','Silver Strand','Siren’s Rest','Emerald Reach','Starfish Cay','Rumrunner’s Rest','Cloudbank','Leeward Isle','White Sands','Sapphire Point','Horizon Key'];
 function generate(seed){
  const rng={rng:seedOf(seed,'islands')},islands=[{id:'isle0',name:NAMES[0],x:2000,y:2050,radius:92,seed:seedOf(seed,'isle0'),owner:null}];
  const cells=Array.from({length:36},(_,i)=>({x:350+(i%6)*660,y:350+Math.floor(i/6)*660}));
  for(const cell of cells){
   if(islands.length>=33)break;
   const x=clamp(cell.x+between(rng,-155,155),170,SIZE-170),y=clamp(cell.y+between(rng,-155,155),170,SIZE-170);
   const radius=int(rng,54,108);
   if(islands.some(i=>distance(i,{x,y})<i.radius+radius+210))continue;
   const index=islands.length;
   islands.push({id:'isle'+index,name:NAMES[index],x:Math.round(x),y:Math.round(y),radius,seed:seedOf(seed,'isle',index),owner:null});
  }
  return islands;
 }
 function zones(seed,day,islands){
  const rng={rng:seedOf(seed,'zones',day)},result=[];
  for(const [kind,count,lo,hi] of [['danger',7,205,278],['storm',3,126,166]]){
   for(let i=0;i<count;i++){
    const desired=int(rng,lo,hi);
    let candidate=null;
    for(let radius=desired;radius>=lo-28&&!candidate;radius-=12){
     for(let attempts=0;attempts<700;attempts++){
      const p={x:between(rng,radius+50,SIZE-radius-50),y:between(rng,radius+50,SIZE-radius-50)};
      if(islands.some(a=>distance(a,p)<a.radius+radius+42)||result.some(a=>distance(a,p)<a.radius+radius+28))continue;
      candidate={id:day+'-'+kind+i,kind,x:Math.round(p.x),y:Math.round(p.y),radius};break;
     }
    }
    // A deterministic scan preserves a full allocation even on crowded seeds.
    if(!candidate){
     const radius=lo-28;
     for(let y=radius+55;y<SIZE-radius-55&&!candidate;y+=54)for(let x=radius+55;x<SIZE-radius-55;x+=54){
      const p={x,y};if(islands.every(a=>distance(a,p)>a.radius+radius+42)&&result.every(a=>distance(a,p)>a.radius+radius+28)){candidate={...p,id:day+'-'+kind+i,kind,radius};break;}
     }
    }
    if(candidate)result.push(candidate);
   }
  }
  return result;
 }
 function atZone(state,ship){return state.zones.find(z=>distance(z,ship)<=z.radius)||null;}
 function nearestIsland(state,ship,inRange=false){
  let best=null,edge=Infinity;
  for(const i of state.islands){const d=distance(ship,i)-i.radius;if(d<edge){edge=d;best=i;}}
  return inRange&&edge>DOCK_RANGE?null:best;
 }
 const islandById=(state,id)=>state.islands.find(i=>i.id===id)||null;
 function dockPosition(ship,island){
  const angle=Math.atan2(ship.y-island.y,ship.x-island.x)||0,r=island.radius+19;
  ship.x=clamp(island.x+Math.cos(angle)*r,18,SIZE-18);ship.y=clamp(island.y+Math.sin(angle)*r,18,SIZE-18);
  ship.heading=angle+Math.PI;ship.speed=0;
 }
 function route(ship,target,islands){
  const dx=target.x-ship.x,dy=target.y-ship.y,d=Math.hypot(dx,dy);
  if(d<6)return null;
  let vx=dx/d,vy=dy/d;
  // A short look-ahead steers waypoint navigation around shorelines rather than
  // repeatedly running into the island on the way to a distant destination.
  for(const i of islands){
   const x=i.x-ship.x,y=i.y-ship.y,along=x*vx+y*vy,cross=x*vy-y*vx;
   if(distance(i,target)<i.radius+15||along<=0||along>i.radius+125||Math.abs(cross)>i.radius+36)continue;
   const toward=Math.atan2(y,x),side=cross>=0?1:-1,gap=Math.max(i.radius+22,Math.hypot(x,y));
   const angle=toward+side*(Math.asin(Math.min(.98,(i.radius+25)/gap))+.16);vx=Math.cos(angle);vy=Math.sin(angle);break;
  }
  return {x:vx,y:vy};
 }
 function move(state,ship,vector,dt){
  if(ship.docked||!(ship.hp>0)||!vector){ship.speed=0;return;}
  const mag=Math.hypot(vector.x,vector.y);if(mag<.03){ship.speed=0;return;}
  const desired=Math.atan2(vector.y,vector.x),old=Number.isFinite(ship.heading)?ship.heading:desired;
  let diff=((desired-old+Math.PI)%TAU+TAU)%TAU-Math.PI;
  ship.heading=old+clamp(diff,-dt*5.8,dt*5.8);
  const max=SPEED*(atZone(state,ship)?.kind==='storm'?.6:1)*clamp(mag,0,1);
  // Number-only positions and velocities are the authoritative saved state.
  const speed=Math.min(max,Math.max(0,ship.speed||0)+dt*330);
  const ox=ship.x,oy=ship.y;
  ship.x=clamp(ship.x+Math.cos(ship.heading)*speed*dt,18,SIZE-18);ship.y=clamp(ship.y+Math.sin(ship.heading)*speed*dt,18,SIZE-18);
  for(const i of state.islands){
   const dx=ship.x-i.x,dy=ship.y-i.y,r=i.radius+16,d=Math.hypot(dx,dy);
   if(d<r){const a=d>1e-5?Math.atan2(dy,dx):ship.heading+Math.PI;ship.x=i.x+Math.cos(a)*r;ship.y=i.y+Math.sin(a)*r;}
  }
  ship.x=clamp(ship.x,18,SIZE-18);ship.y=clamp(ship.y,18,SIZE-18);ship.speed=Math.min(max,Math.hypot(ship.x-ox,ship.y-oy)/Math.max(dt,.001));
 }
 function surface(w,h){const c=host.document.createElement('canvas');c.width=w;c.height=h;return c;}
 function skull(ctx,x,y,s,color){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.3;
  ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(8,-7);ctx.moveTo(-8,-7);ctx.lineTo(8,7);ctx.stroke();
  ctx.beginPath();ctx.arc(0,-2,6,0,TAU);ctx.fill();ctx.fillRect(-4,2,8,5);
  ctx.fillStyle='#241b28';ctx.beginPath();ctx.arc(-2.6,-2,1.6,0,TAU);ctx.arc(2.6,-2,1.6,0,TAU);ctx.fill();ctx.fillRect(-.7,1,1.4,2);ctx.restore();
 }
 function stormIcon(ctx,x,y,s,color){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=color;
  ctx.beginPath();ctx.arc(-4,-1,4.5,Math.PI,TAU);ctx.arc(1,-4,5.8,Math.PI,TAU);ctx.arc(7,-1,3.8,Math.PI,TAU);ctx.lineTo(10,3);ctx.lineTo(-9,3);ctx.fill();
  ctx.fillStyle='#f3d58d';ctx.beginPath();ctx.moveTo(1,2);ctx.lineTo(-3,9);ctx.lineTo(1,8);ctx.lineTo(0,15);ctx.lineTo(7,6);ctx.lineTo(3,7);ctx.closePath();ctx.fill();ctx.restore();
 }
 function crown(ctx,x,y,s,color='#ffdb78'){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(-9,-5);ctx.lineTo(-5,3);ctx.lineTo(-2,-3);ctx.lineTo(0,-9);ctx.lineTo(3,-2);ctx.lineTo(6,3);ctx.lineTo(10,-5);ctx.lineTo(7,8);ctx.lineTo(-7,8);ctx.closePath();ctx.fill();ctx.restore();
 }
 function texture(){
  const c=surface(320,320),ctx=c.getContext('2d'),img=ctx.createImageData(320,320),rng={rng:903173};
  for(let y=0;y<320;y++)for(let x=0;x<320;x++){
   const p=(y*320+x)*4,w=Math.sin(x*.073+y*.086)*2.7+Math.sin(x*.045-y*.049)*2.2+(random(rng)-.5)*15;
   img.data[p]=17+w*.58;img.data[p+1]=77+w;img.data[p+2]=95+w*1.12;img.data[p+3]=255;
  }
  ctx.putImageData(img,0,0);ctx.lineCap='round';
  for(let n=0;n<1650;n++){
   const x=between(rng,0,320),y=between(rng,0,320),l=between(rng,1,6);
   ctx.strokeStyle='rgba(169,219,220,'+between(rng,.027,.18)+')';ctx.lineWidth=between(rng,.45,1.2);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+l,y+l*.45);ctx.stroke();
  }
  return c;
 }
 function islandArt(i){
  const extent=i.radius+42,c=surface(Math.ceil(extent*2),Math.ceil(extent*2)),ctx=c.getContext('2d'),rng={rng:i.seed},r=i.radius,origin=c.width/2;
  ctx.translate(origin,origin);
  const corners=Array.from({length:32},(_,n)=>{const a=n*TAU/32,variation=.88+random(rng)*.12+.07*Math.sin(a*3+i.seed)+.04*Math.sin(a*5);return {a,r:r*variation};});
  function path(scale){ctx.beginPath();corners.forEach((n,j)=>{const x=Math.cos(n.a)*n.r*scale,y=Math.sin(n.a)*n.r*scale;if(j)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();}
  const glow=ctx.createRadialGradient(0,0,r*.68,0,0,r+40);glow.addColorStop(0,'#67d3bc');glow.addColorStop(.63,'#319c9d99');glow.addColorStop(1,'#2b9d9d00');ctx.fillStyle=glow;ctx.fillRect(-extent,-extent,extent*2,extent*2);
  path(1.19);ctx.fillStyle='#73d1bf2c';ctx.fill();path(1.11);ctx.strokeStyle='#b6eee64a';ctx.lineWidth=3;ctx.stroke();
  path(1.02);ctx.fillStyle='#d6d6a0';ctx.fill();
  path(.96);ctx.fillStyle='#d2b37c';ctx.fill();
  ctx.save();path(.95);ctx.clip();
  for(let n=0;n<r*r*.36;n++){
   const x=between(rng,-r,r),y=between(rng,-r,r);
   ctx.fillStyle=random(rng)<.5?'#765b3f17':'#fff4cb32';ctx.fillRect(x,y,between(rng,1,2.6),between(rng,.6,1.6));
  }
  path(.74);ctx.fillStyle='#8c9c62';ctx.fill();path(.68);ctx.fillStyle='#7b8e58';ctx.fill();
  for(let n=0;n<13+Math.round(r/4);n++){
   const a=random(rng)*TAU,d=Math.sqrt(random(rng))*r*.64,x=Math.cos(a)*d,y=Math.sin(a)*d;
   if(random(rng)<.23){ctx.fillStyle='#514b3e';ctx.fillRect(x,y,5,4);ctx.fillStyle='#aa9871';ctx.fillRect(x,y,4,2);continue;}
   const k=between(rng,5,11);ctx.fillStyle='#314a3b48';ctx.beginPath();ctx.ellipse(x+3,y+4,k*.85,k*.55,.8,0,TAU);ctx.fill();ctx.strokeStyle='#76583d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y+4);ctx.lineTo(x+1.5,y-2);ctx.stroke();
   for(let j=0;j<5;j++){const t=j*TAU/5+a;ctx.strokeStyle=j%2?'#355e43':'#47764b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+1,y-2);ctx.quadraticCurveTo(x+Math.cos(t)*k*.45,y-4+Math.sin(t)*k*.45,x+Math.cos(t)*k,y+Math.sin(t)*k);ctx.stroke();}
  }
  ctx.restore();path(1.03);ctx.strokeStyle='#fff1c4a3';ctx.lineWidth=1.5;ctx.stroke();
  return c;
 }
 const roleColors={farmer:'#81dfc6',raider:'#ef998c',beast:'#c2abf4',bounty:'#ebc578',player:'#f5e5ac'};
 function shipArt(ctx,p,player,time){
  const color=player?'#67cdc4':roleColors[p.role]||'#c98d74',len=42+p.level*7,w=18+p.level*4;
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.heading+Math.PI/2);
  ctx.fillStyle='#061d28a6';ctx.beginPath();ctx.ellipse(3,4,w*.63,len*.57,0,0,TAU);ctx.fill();
  function hull(inset=0){
   ctx.beginPath();ctx.moveTo(0,-len/2+inset);ctx.quadraticCurveTo(w/2-inset,-len*.3,w/2-inset,len*.12);ctx.lineTo(w*.38-inset,len*.42-inset);ctx.quadraticCurveTo(0,len*.55-inset,-w*.38+inset,len*.42-inset);ctx.lineTo(-w/2+inset,len*.12);ctx.quadraticCurveTo(-w/2+inset,-len*.3,0,-len/2+inset);ctx.closePath();
  }
  hull();ctx.fillStyle='#312921';ctx.fill();ctx.strokeStyle=player?'#e5d9a0':'#948b66';ctx.lineWidth=1.4;ctx.stroke();
  hull(2.6);ctx.fillStyle='#977b50';ctx.fill();ctx.strokeStyle='#c9a879';ctx.lineWidth=1;ctx.stroke();
  ctx.save();hull(3);ctx.clip();ctx.strokeStyle='#5e4c3a88';ctx.lineWidth=.8;
  for(let y=-len*.43;y<len*.45;y+=4){ctx.beginPath();ctx.moveTo(-w*.5,y);ctx.lineTo(w*.5,y);ctx.stroke();}
  ctx.restore();
  ctx.fillStyle='#58483a';ctx.fillRect(-w*.27,len*.25,w*.54,len*.12);
  for(let y=-len*.2;y<=len*.24;y+=len*.15){ctx.fillStyle='#24272a';ctx.fillRect(-w/2-1.5,y-1.5,3.8,3.4);ctx.fillRect(w/2-2.2,y-1.5,3.8,3.4);}
  const masts=p.level===3?3:p.level===2?2:1;
  for(let j=0;j<masts;j++){
   const y=masts===1?0:-len*.24+j*len*.47/(masts-1),sw=w*(j===0?.78:.73),sh=masts===3?12:17;
   ctx.fillStyle='#20313a65';ctx.fillRect(-sw/2+2,y+3,sw,sh);
   ctx.strokeStyle='#533d29';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,y-8);ctx.lineTo(0,y+sh);ctx.stroke();ctx.beginPath();ctx.moveTo(-sw/2-2,y);ctx.lineTo(sw/2+2,y);ctx.stroke();
   ctx.fillStyle=player?'#e5e5bf':'#cfc6a8';ctx.beginPath();ctx.moveTo(-sw/2,y);ctx.quadraticCurveTo(0,y-4,sw/2,y);ctx.lineTo(sw/2-1,y+sh*.7);ctx.quadraticCurveTo(0,y+sh,-sw/2+1,y+sh*.7);ctx.closePath();ctx.fill();
   ctx.fillStyle=color;ctx.fillRect(-1.7,y+1,3.4,sh*.69);ctx.strokeStyle='#8b8161';ctx.lineWidth=.65;ctx.stroke();
  }
  ctx.strokeStyle='#d4b980';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-len/2);ctx.lineTo(0,-len/2-6);ctx.stroke();
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(0,-len/2-6);ctx.lineTo(6,-len/2-3);ctx.lineTo(0,-len/2);ctx.fill();
  ctx.restore();
  if(p.docked){ctx.strokeStyle='#d8eacb8c';ctx.lineWidth=1;ctx.beginPath();ctx.arc(p.x,p.y,len*.58,0,TAU);ctx.stroke();}
 }
 function makeRenderer(canvas,radar){
  const ctx=canvas.getContext('2d',{alpha:false}),rc=radar.getContext('2d',{alpha:false}),water=texture(),pattern=ctx.createPattern(water,'repeat'),art=new Map(),wakes=new Map();
  let width=0,height=0,dpr=1,camera={x:2000,y:2000,zoom:1},lastSeed=null,lastRadar=-Infinity,lastWake=-Infinity,rw=0,rh=0,radarDpr=1;
  const reduced=host.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  function resize(){
   const w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight),ratio=Math.min(1.75,host.devicePixelRatio||1);
   if(w!==width||h!==height||dpr!==ratio){width=w;height=h;dpr=ratio;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);camera.zoom=clamp(Math.min(w/1050,h/680),.48,1.12);}
   const a=Math.max(1,radar.clientWidth),b=Math.max(1,radar.clientHeight);
   if(rw!==a||rh!==b||radarDpr!==ratio){rw=a;rh=b;radarDpr=ratio;radar.width=Math.round(a*ratio);radar.height=Math.round(b*ratio);lastRadar=-Infinity;}
  }
  const worldAt=(x,y)=>({x:clamp(camera.x+(x-width/2)/camera.zoom,0,SIZE),y:clamp(camera.y+(y-height/2)/camera.zoom,0,SIZE)});
  const miniAt=(x,y)=>({x:clamp(x/Math.max(1,rw)*SIZE,0,SIZE),y:clamp(y/Math.max(1,rh)*SIZE,0,SIZE)});
  const screen=p=>({x:(p.x-camera.x)*camera.zoom+width/2,y:(p.y-camera.y)*camera.zoom+height/2});
  function pulse(ctx,p,r,color,time){
   ctx.save();ctx.strokeStyle=color;ctx.globalAlpha=.65;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.stroke();
   ctx.globalAlpha=.3*(1-(time%2)/2);ctx.beginPath();ctx.arc(p.x,p.y,r+(time%2)*14,0,TAU);ctx.stroke();ctx.restore();
  }
  function drawRadar(state,time){
   rc.setTransform(radarDpr,0,0,radarDpr,0,0);rc.fillStyle='#0a354a';rc.fillRect(0,0,rw,rh);
   const sx=rw/SIZE,sy=rh/SIZE;
   rc.strokeStyle='#76b2bb18';rc.lineWidth=1;for(let x=1;x<5;x++){rc.beginPath();rc.moveTo(rw*x/5,0);rc.lineTo(rw*x/5,rh);rc.moveTo(0,rh*x/5);rc.lineTo(rw,rh*x/5);rc.stroke();}
   for(const z of state.zones){const x=z.x*sx,y=z.y*sy;rc.fillStyle=z.kind==='danger'?'#db646a35':'#a897e943';rc.strokeStyle=z.kind==='danger'?'#ba8078':'#ac9bd8';rc.beginPath();rc.ellipse(x,y,z.radius*sx,z.radius*sy,0,0,TAU);rc.fill();rc.stroke();if(z.kind==='danger')skull(rc,x,y,.35,'#ffd1b0');else stormIcon(rc,x,y-2,.36,'#d9d3f2');}
   for(const i of state.islands){const x=i.x*sx,y=i.y*sy;rc.fillStyle=i.owner==='player'?'#90f5c8':i.owner?'#d09b82':'#d2b977';rc.beginPath();rc.arc(x,y,Math.max(1.35,i.radius*sx),0,TAU);rc.fill();}
   const player=state.captains[0];
   for(const p of state.captains)if(p.hp>0){
    const x=p.x*sx,y=p.y*sy,near=distance(player,p)<1250;rc.fillStyle=p.id==='player'?'#d7fff4':near?'#f6a391':'#829da8';rc.beginPath();rc.arc(x,y,p.id==='player'?3.2:near?2:1.3,0,TAU);rc.fill();
    if(p.id===state.wantedId){pulse(rc,{x,y},5,'#ffe083',time);crown(rc,x,y-5,.38);}
   }
   const c=screen({x:0,y:0});rc.strokeStyle='#8ce9df85';rc.strokeRect(-c.x/camera.zoom*sx,-c.y/camera.zoom*sy,width/camera.zoom*sx,height/camera.zoom*sy);
  }
  function draw(state,time,dt=0,waypoint=null){
   resize();if(!state)return;
   const player=state.captains[0];
   if(lastSeed!==state.seed){art.clear();wakes.clear();lastSeed=state.seed;camera.x=player.x;camera.y=player.y;lastRadar=lastWake=-Infinity;}
   const a=1-Math.exp(-Math.max(.016,dt)*7),zoom=camera.zoom;
   camera.x=clamp(camera.x+(player.x-camera.x)*a,Math.min(SIZE/2,width/2/zoom),Math.max(SIZE/2,SIZE-width/2/zoom));
   camera.y=clamp(camera.y+(player.y-camera.y)*a,Math.min(SIZE/2,height/2/zoom),Math.max(SIZE/2,SIZE-height/2/zoom));
   const left=camera.x-width/(2*zoom),top=camera.y-height/(2*zoom);
   ctx.setTransform(dpr*zoom,0,0,dpr*zoom,-left*dpr*zoom,-top*dpr*zoom);
   ctx.save();const waveX=reduced?0:time*3%320,waveY=reduced?0:time*1.6%320;ctx.translate(waveX,waveY);ctx.fillStyle=pattern;ctx.fillRect(left-waveX,top-waveY,width/zoom,height/zoom);ctx.restore();
   const visible=(o,extra=0)=>o.x+(o.radius||0)+extra>left&&o.x-(o.radius||0)-extra<left+width/zoom&&o.y+(o.radius||0)+extra>top&&o.y-(o.radius||0)-extra<top+height/zoom;
   for(const z of state.zones)if(visible(z,40)){
    const danger=z.kind==='danger',col=danger?'#ed9887':'#aab6ed';
    ctx.fillStyle=danger?'#c24e5121':'#656cc94a';ctx.beginPath();ctx.arc(z.x,z.y,z.radius,0,TAU);ctx.fill();
    ctx.strokeStyle=col+'8e';ctx.setLineDash([9,8]);ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(z.x,z.y,z.radius-9,0,TAU);ctx.strokeStyle=col+'39';ctx.lineWidth=1;ctx.stroke();
    if(danger)skull(ctx,z.x,z.y,2.1,'#f2ceaa');else stormIcon(ctx,z.x,z.y-9,2.6,'#dde6f9');
    ctx.textAlign='center';ctx.font='700 12px system-ui';ctx.fillStyle='#f8ead3';ctx.shadowColor='#10212e';ctx.shadowBlur=4;ctx.fillText(danger?'DANGER ZONE':'STORM ZONE',z.x,z.y+30);ctx.shadowBlur=0;
   }
   for(const i of state.islands)if(visible(i,62)){
    let sprite=art.get(i.id);if(!sprite){sprite=islandArt(i);art.set(i.id,sprite);}
    ctx.drawImage(sprite,i.x-sprite.width/2,i.y-sprite.height/2);
    if(i.owner){const owned=i.owner==='player';ctx.strokeStyle='#1b3030';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(i.x,i.y+10);ctx.lineTo(i.x,i.y-28);ctx.stroke();ctx.fillStyle=owned?'#85f1d6':'#e0a28a';ctx.beginPath();ctx.moveTo(i.x,i.y-28);ctx.lineTo(i.x+20,i.y-24);ctx.lineTo(i.x,i.y-14);ctx.fill();}
    ctx.font='650 10px system-ui';ctx.textAlign='center';ctx.fillStyle='#ecf0d8';ctx.shadowColor='#18252a';ctx.shadowBlur=4;ctx.fillText(i.name,i.x,i.y+i.radius+16);ctx.shadowBlur=0;
   }
   if(time-lastWake>=.13){
    lastWake=time;
    for(const p of state.captains){let list=wakes.get(p.id);if(!list){list=[];wakes.set(p.id,list);}while(list.length&&time-list[0].t>3.1)list.shift();if(p.hp>0&&p.speed>8){list.push({x:p.x-Math.cos(p.heading)*(21+p.level*3),y:p.y-Math.sin(p.heading)*(21+p.level*3),t:time});if(list.length>26)list.shift();}}
   }
   for(const list of wakes.values())for(let i=1;i<list.length;i++){const p=list[i],q=list[i-1];if(!visible(p,10)||Math.hypot(q.x-p.x,q.y-p.y)>60)continue;const opacity=clamp(1-(time-p.t)/3.1,0,1);ctx.strokeStyle='rgba(210,252,249,'+(opacity*.38)+')';ctx.lineWidth=3+(1-opacity)*14;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(q.x,q.y);ctx.lineTo(p.x,p.y);ctx.stroke();}
   if(waypoint){ctx.strokeStyle='#d3fff09f';ctx.lineWidth=1.5;ctx.setLineDash([5,8]);ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(waypoint.x,waypoint.y);ctx.stroke();ctx.setLineDash([]);pulse(ctx,waypoint,12,'#b7fbea',time);ctx.beginPath();ctx.moveTo(waypoint.x-5,waypoint.y);ctx.lineTo(waypoint.x+5,waypoint.y);ctx.moveTo(waypoint.x,waypoint.y-5);ctx.lineTo(waypoint.x,waypoint.y+5);ctx.stroke();}
   const ships=state.captains.filter(p=>p.hp>0&&visible(p,75));
   for(const p of ships){
    if(p.id===state.wantedId)pulse(ctx,p,39,'#ffe092',time);
    if(p.id==='player')pulse(ctx,p,32,'#99e6cf',0);
    shipArt(ctx,p,p.id==='player',time);
   }
   ctx.strokeStyle='#badbcb80';ctx.lineWidth=2;ctx.strokeRect(1,1,SIZE-2,SIZE-2);
   ctx.setTransform(dpr,0,0,dpr,0,0);
   const hour=(state.elapsed%360)/15,night=hour<6||hour>19;
   if(night){ctx.fillStyle='rgba(10,20,49,.18)';ctx.fillRect(0,0,width,height);}
   for(const p of ships){
    const pos=screen(p),isPlayer=p.id==='player',wanted=p.id===state.wantedId;
    ctx.textAlign='center';ctx.font='700 '+(isPlayer?11:10)+'px system-ui';ctx.fillStyle=isPlayer?'#e9fff0':roleColors[p.role]||'#f4c09b';ctx.shadowBlur=4;ctx.shadowColor='#04131d';
    ctx.fillText(p.name+' · Lv '+p.level,pos.x,pos.y-26*zoom-10);ctx.shadowBlur=0;
    if(wanted)crown(ctx,pos.x,pos.y-26*zoom-24,.65);
    const bw=34*zoom+9;ctx.fillStyle='#101e28cc';ctx.fillRect(pos.x-bw/2,pos.y+26*zoom+4,bw,3.5);ctx.fillStyle=p.hp<=30?'#ef8e7f':isPlayer?'#7be7c5':'#e4b184';ctx.fillRect(pos.x-bw/2,pos.y+26*zoom+4,bw*p.hp/100,3.5);
   }
   // The wanted captain stays discoverable even outside the camera.
   const wanted=state.captains.find(p=>p.id===state.wantedId&&p.hp>0);
   if(wanted&&!visible(wanted,30)){
    const pos=screen(wanted),dx=pos.x-width/2,dy=pos.y-height/2,dist=Math.hypot(dx,dy)||1;
    const roomX=Math.max(48,width*.28),roomY=Math.max(38,height*(width<=760?.14:.22)),factor=Math.min(roomX/Math.max(Math.abs(dx),1),roomY/Math.max(Math.abs(dy),1)),x=width/2+dx*factor,y=height/2+dy*factor;
    ctx.fillStyle='#10212be8';ctx.beginPath();ctx.arc(x,y,23,0,TAU);ctx.fill();ctx.strokeStyle='#e7c777';ctx.lineWidth=1.5;ctx.stroke();crown(ctx,x,y-3,.8);ctx.font='700 9px system-ui';ctx.fillStyle='#ffdfa0';ctx.textAlign='center';ctx.fillText(Math.round(distance(wanted,player))+'m',x,y+13);
    ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan2(dy,dx));ctx.fillStyle='#ffd480';ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(23,-4);ctx.lineTo(23,4);ctx.fill();ctx.restore();
   }
   if(time-lastRadar>=.12){lastRadar=time;drawRadar(state,time);}
  }
  return {draw,worldAt,miniAt,reset(){lastSeed=null;lastRadar=lastWake=-Infinity;},resize};
 }
 host.SailingMap=Object.freeze({SIZE,SPEED,DOCK_RANGE,generate,zones,atZone,nearestIsland,islandById,dockPosition,route,move,distance,clamp,seedOf,random,int,between,makeRenderer});
})(window);
