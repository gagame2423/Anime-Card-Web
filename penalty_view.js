/* Responsive canvas adapter. Atlas loading, input and one owned animation frame. */
(function(host){
 'use strict';
 let bridge={},root,canvas,ctx,engine,raf=0,lastTime=null,animationTime=0,active=false,upgradesOpen=false,wasPaused=false,pointer=null,audio=null,lastImpact='';
 const viewport={width:0,height:0,dpr:1};let resizeObserver=null;
 const images={},labels=new Map(),el=id=>host.document.getElementById(id),config=()=>host.PenaltySprites;
 const set=(id,value)=>{if(labels.get(id)===value)return;labels.set(id,value);if(el(id))el(id).textContent=value;};
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
 function sound(goal){
  if(!host.PenaltyStatsSystem.snapshot().sound||(host.DropAudioSystem?.enabled===false||host.DropAudioSystem?.volume===0))return;
  try{const Audio=host.AudioContext||host.webkitAudioContext;if(!Audio)return;audio ||= new Audio();void audio.resume().catch(()=>{});const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
   gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,Math.min(.12,(host.DropAudioSystem?.volume??.5)*.12)),now+.02);gain.gain.exponentialRampToValueAtTime(.0001,now+.24);
   oscillator.frequency.setValueAtTime(goal?660:180,now);oscillator.frequency.exponentialRampToValueAtTime(goal?990:90,now+.20);oscillator.connect(gain);gain.connect(audio.destination);oscillator.start();oscillator.stop(now+.25);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }catch(_){/* Sound is optional; gameplay continues if audio is unavailable. */}
 }
 async function prepareKeeper(image){
  const sheet=host.document.createElement('canvas');sheet.width=image.naturalWidth;sheet.height=image.naturalHeight;const paint=sheet.getContext('2d',{willReadFrequently:true});paint.drawImage(image,0,0);
  try{
   const pixels=paint.getImageData(0,0,sheet.width,sheet.height),data=pixels.data,w=sheet.width,h=sheet.height,queue=new Int32Array(w*h);let read=0,write=0;
   const add=i=>{const at=i*4;if(data[at+3]&&data[at]>248&&data[at+1]>248&&data[at+2]>248){data[at+3]=0;queue[write++]=i;}};
   for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
   // Process the connected white backdrop once, in small non-blocking batches.
   while(read<write){const end=read+24000;while(read<write&&read<end){const i=queue[read++],x=i%w;if(x)add(i-1);if(x<w-1)add(i+1);if(i>=w)add(i-w);if(i<w*(h-1))add(i+w);}await new Promise(resolve=>host.setTimeout(resolve,0));}
   paint.putImageData(pixels,0,0);return sheet;
  }catch(_){return image;}
 }
 let spritesRequested=false;
 function loadImages(){if(spritesRequested)return;spritesRequested=true;for(const [name,row]of Object.entries(config())){if(!row.src)continue;const image=new Image();image.onload=async()=>{images[name]=name==='keeper'?await prepareKeeper(image):name==='goal'?prepareField(image):image;};image.onerror=()=>{images[name]=null;};image.src=row.src;}}
 function sprite(name,frame,x,y,w,h){
  const image=images[name],atlas=config()[name],iw=image?.naturalWidth||image?.width;if(!image||!iw)return false;
  if(atlas.rects){const r=atlas.rects[frame];if(!r)return false;const scale=h/atlas.referenceHeight,dw=r.width*scale,dh=r.height*scale;ctx.save();ctx.translate(x,y);if(r.flip)ctx.scale(-1,1);ctx.drawImage(image,r.x,r.y,r.width,r.height,-dw/2,-dh,dw,dh);ctx.restore();return true;}
  const cols=atlas.columns||1,rows=atlas.rows||1;if(frame<0||frame>=cols*rows)return false;const ih=image.naturalHeight||image.height,fw=iw/cols,fh=ih/rows,crop=atlas.crop||{x:0,y:0,width:fw,height:fh};
  ctx.save();if(name==='ball'){ctx.beginPath();ctx.arc(x,y-h/2,w/2,0,Math.PI*2);ctx.clip();}ctx.drawImage(image,(frame%cols)*fw+crop.x,Math.floor(frame/cols)*fh+crop.y,crop.width,crop.height,x-w/2,y-h,w,h);ctx.restore();return true;
 }
 function prepareField(image){
  const layer=host.document.createElement('canvas');layer.width=1024;layer.height=638;const paint=layer.getContext('2d');paint.drawImage(image,0,0,1024,638);
  // Build the static layer once, then publish the complete canvas atomically.
  for(const patch of [{sx:125,sy:370,x:405,y:370,width:240,height:215,sheight:205},{sx:690,sy:575,x:0,y:575,width:225,height:63,swidth:128},{sx:690,sy:565,x:804,y:565,width:220,height:73,swidth:128}])paint.drawImage(image,patch.sx,patch.sy,patch.swidth||patch.width,patch.sheight||patch.height,patch.x,patch.y,patch.width,patch.height);
  return layer;
 }
 function resizeCanvas(width,height){
  const dpr=Math.min(2,host.devicePixelRatio||1);if(!(width>0&&height>0))return;
  viewport.width=width;viewport.height=height;viewport.dpr=dpr;
  const pixelWidth=Math.round(width*dpr),pixelHeight=Math.round(height*dpr);
  if(canvas.width!==pixelWidth)canvas.width=pixelWidth;if(canvas.height!==pixelHeight)canvas.height=pixelHeight;
 }
 function field(w,h){
  if(images.goal){ctx.drawImage(images.goal,0,0,w,h);return;}
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#101f35');sky.addColorStop(.45,'#172f42');sky.addColorStop(1,'#052b23');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#23594b';ctx.beginPath();ctx.moveTo(0,h*.52);ctx.lineTo(w,h*.52);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();
  for(let i=0;i<8;i++){ctx.fillStyle=i%2?'#26634e':'#1f5744';const near=h*(.52+.48*(i+1)/8),far=h*(.52+.48*i/8);ctx.fillRect(0,far,w,near-far);}
  ctx.strokeStyle='#83c9b780';ctx.lineWidth=2;for(const line of [[.18,.57,.03,1],[.82,.57,.97,1],[.18,.75,.82,.75]]){ctx.beginPath();ctx.moveTo(line[0]*w,line[1]*h);ctx.lineTo(line[2]*w,line[3]*h);ctx.stroke();}
  const r=config().goal.rect,x=r.x*w,y=r.y*h,gw=r.width*w,gh=r.height*h;
  ctx.fillStyle='#09202b';ctx.fillRect(x,y,gw,gh);ctx.strokeStyle='#7996a04d';ctx.lineWidth=1;
  for(let i=1;i<15;i++){ctx.beginPath();ctx.moveTo(x+gw*i/15,y);ctx.lineTo(x+gw*i/15,y+gh);ctx.stroke();}
  for(let i=1;i<9;i++){ctx.beginPath();ctx.moveTo(x,y+gh*i/9);ctx.lineTo(x+gw,y+gh*i/9);ctx.stroke();}
  ctx.strokeStyle='#d8fcf2';ctx.lineWidth=Math.max(4,w*.007);ctx.strokeRect(x,y,gw,gh);ctx.fillStyle='#d9f9eb';ctx.beginPath();ctx.ellipse(w*.5,h*.88,w*.035,h*.008,0,0,Math.PI*2);ctx.fill();
 }
 function keeper(x,y,size,pose,time){
  const atlas=config().keeper,list=atlas.poses[pose]||atlas.poses.idle,frame=list[Math.floor(time*atlas.fps)%list.length];if(sprite('keeper',frame,x,y,size*.8,size))return;
  ctx.save();ctx.translate(x,y);ctx.rotate(pose==='left'?-.5:pose==='right'?.5:0);
  ctx.fillStyle='#8ff0d8';ctx.fillRect(-size*.14,-size*.58,size*.28,size*.38);ctx.strokeStyle='#a4fff0';ctx.lineWidth=size*.10;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-size*.1,-size*.46);ctx.lineTo(-size*.28,-size*(pose==='high'?.85:.35));ctx.moveTo(size*.1,-size*.46);ctx.lineTo(size*.28,-size*(pose==='high'?.85:.35));ctx.stroke();
  ctx.strokeStyle='#172737';ctx.beginPath();ctx.moveTo(-size*.08,-size*.22);ctx.lineTo(-size*.14,0);ctx.moveTo(size*.08,-size*.22);ctx.lineTo(size*.14,0);ctx.stroke();ctx.fillStyle='#f1c3a0';ctx.beginPath();ctx.arc(0,-size*.72,size*.11,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function ball(x,y,size,time){
  const atlas=config().ball,frame=atlas.frames[Math.floor(time*atlas.fps)%atlas.frames.length];if(sprite('ball',frame,x,y+size/2,size,size))return;
  ctx.save();ctx.translate(x,y);ctx.rotate(time*5);ctx.fillStyle='#f4f8fc';ctx.shadowBlur=10;ctx.shadowColor='#021414';ctx.beginPath();ctx.arc(0,0,size/2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#26354b';for(let j=0;j<5;j++){ctx.save();ctx.rotate(j*Math.PI*2/5);ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const x=Math.cos(a)*size*.09,y=Math.sin(a)*size*.09-size*.27;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.restore();}ctx.beginPath();for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const x=Math.cos(a)*size*.15,y=Math.sin(a)*size*.15;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.restore();
 }
 function draw(state,time){
  const w=viewport.width,h=viewport.height,dpr=viewport.dpr;if(!w||!h)return;ctx.setTransform(dpr,0,0,dpr,0,0);field(w,h);
  const r=config().goal.rect,t=state.shot?clamp(state.elapsed/state.shot.duration):0,shot=state.shot,flight=['flight','impact','result','save-error'].includes(state.phase)&&shot;
  let kx=w*.5,ky=(r.y+r.height)*h,pose='idle';
  if(flight){const z=host.PenaltyGame.ZONES[shot.keeperZone],dive=state.phase==='flight'?clamp((t-.15)/.7):1;kx+=(r.x+r.width*z.x-.5)*w*dive;ky-=r.height*h*(1-z.y)*dive*.55;pose=state.phase!=='flight'&&shot.goal?'failed':shot.keeperZone%3===0?(shot.keeperZone>=6?'leftLow':'left'):shot.keeperZone%3===2?(shot.keeperZone>=3?'rightLow':'right'):Math.floor(shot.keeperZone/3)===0?'high':'idle';}
  if(flight&&shot.saved){
   const z=host.PenaltyGame.ZONES[shot.actualZone],catchPose=shot.actualZone<3?(shot.actualZone%3===0?'left':shot.actualZone%3===2?'right':'high'):shot.actualZone>=6?(shot.actualZone%3===0?'leftLow':shot.actualZone%3===2?'rightLow':'catch'):shot.actualZone%3===0?'left':shot.actualZone%3===2?'right':'catch';
   const hands=config().keeperHands[catchPose],rect=config().keeper.rects[hands.frame],scale=h*.30/config().keeper.referenceHeight;
   const catchX=(r.x+r.width*(z.x+shot.driftX))*w,catchY=(r.y+r.height*(z.y+shot.driftY))*h,reach=state.phase==='flight'?clamp(t/.88):1;
   kx+=(catchX-(hands.x-rect.width/2)*scale-kx)*reach;ky+=(catchY+(rect.height-hands.y)*scale-ky)*reach;pose=catchPose;
  }else if(flight&&shot.goal&&host.PenaltyGame.keeperCovers(shot.keeperZone,shot.actualZone)){
   // A shot which beats the keeper must visibly pass the missed dive, not his hands.
   const evade=state.phase==='flight'?clamp((t-.55)/.30):1;kx+=(host.PenaltyGame.ZONES[shot.actualZone].x<.5?1:-1)*w*.13*evade;if(t>.72)pose='failed';
  }
  keeper(kx,ky,h*.30,pose,time);
  let bx=w*.5,by=h*.86,size=Math.min(w*.16,145);
  if(flight){const z=host.PenaltyGame.ZONES[shot.zone],progress=state.phase==='flight'?t:1,endX=(r.x+r.width*(z.x+shot.driftX))*w,endY=(r.y+r.height*(z.y+shot.driftY))*h;
   bx+=(endX-bx)*progress+Math.sin(progress*Math.PI)*shot.curve*w;by+=(endY-by)*progress-Math.sin(progress*Math.PI)*h*.16;size*=1-.7*progress;
  }
  ball(bx,by,size,time);
  if(state.paused){ctx.fillStyle='#07121acc';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ddfff4';ctx.font='800 '+Math.max(24,w*.06)+'px system-ui';ctx.textAlign='center';ctx.fillText('PAUSED',w/2,h/2);}
 }
 function render(state){
  set('penaltyScore',`SCORE: ${state.goals}/5`);set('penaltyAttempt',state.attempts===5?'SESSION COMPLETE':`ATTEMPT ${state.attempts+1} / 5`);set('penaltyTokens',state.stats.tokens.toLocaleString('en-US'));set('penaltySound',state.stats.sound?'Sound ON':'Sound OFF');el('penaltySound').setAttribute('aria-pressed',String(state.stats.sound));set('penaltyPause',state.paused?'Resume':'Pause');
  const canChoose=state.phase==='ready'&&!state.paused;for(const button of root.querySelectorAll('[data-penalty-zone]')){button.disabled=!canChoose;button.classList.toggle('is-selected',Number(button.dataset.penaltyZone)===state.zone);button.setAttribute('aria-pressed',String(Number(button.dataset.penaltyZone)===state.zone));}
  el('penaltyShoot').disabled=!['ready','charging'].includes(state.phase)||state.paused;set('penaltyShoot',state.phase==='charging'?'RELEASE TO SHOOT':'HOLD TO SHOOT');
  el('penaltyTargets').classList.toggle('is-inactive',!['ready','charging'].includes(state.phase));el('penaltyRestart').hidden=state.phase!=='result';el('penaltyRetry').hidden=state.phase!=='save-error';set('penaltyError',state.error);
  const result=state.lastResult,key=result?state.stats.session.id+'_'+result.attempt:'';
  if(key&&key!==lastImpact){lastImpact=key;set('penaltyRating',result.shot.rating);el('penaltyRating').classList.remove('is-visible');void el('penaltyRating').offsetWidth;el('penaltyRating').classList.add('is-visible');sound(result.shot.goal);}
  if(state.phase==='ready')el('penaltyRating').classList.remove('is-visible');
  set('penaltyResult',state.phase==='result'?`${state.goals}/5 goals • ${state.goals===5?`PERFECT SESSION! +${host.PenaltyStatsSystem.CONFIG.perfectBonus} bonus Tokens`:'Session complete'} • Rewards are saved after each shot.`:result?`+${result.tokens} Football Tokens${result.bonus?' (includes perfect bonus)':''}`:'Choose a target, hold SHOOT, then release in the green zone.');
  const green=el('penaltyGreen'),yellow=el('penaltyYellow'),w=state.windows;
  green.style.left=w.greenStart*100+'%';green.style.width=w.greenWidth*100+'%';yellow.style.left=w.yellowStart*100+'%';yellow.style.width=w.yellowWidth*100+'%';
  const locked=state.shot&&!['ready','charging','closed'].includes(state.phase);
  el('penaltyMeter').dataset.result=locked?state.timingQuality:'';
  set('penaltyTimingFeedback',locked?{green:'TIMING HIT · GREEN',yellow:'OFF CENTER · YELLOW',red:'TIMING MISS · RED'}[state.timingQuality]:state.paused?'TIMING PAUSED':'Release in GREEN');
  set('penaltyTimingWindow',`Accuracy Lv. ${state.stats.upgrades.accuracy} · Green ${(w.greenWidth*100).toFixed(1)}%`);
  renderNeedle(state);
  if(upgradesOpen)renderUpgrades();
 }
 function renderUpgrades(){const s=host.PenaltyStatsSystem.snapshot();set('penaltyUpgradeTokens',s.tokens.toLocaleString('en-US')+' Football Tokens');for(const key of Object.keys(host.PenaltyStatsSystem.STATS)){const level=s.upgrades[key],cost=host.PenaltyStatsSystem.cost(key);set('penaltyLevel_'+key,`Level ${level} / ${host.PenaltyStatsSystem.CONFIG.maxLevel}`);set('penaltyBuy_'+key,cost===null?'MAX LEVEL':cost.toLocaleString('en-US')+' Tokens');el('penaltyBuy_'+key).disabled=cost===null||s.tokens<cost;}}
 function renderNeedle(state){el('penaltyMarker').style.left=state.power*100+'%';el('penaltyMarker').dataset.quality=state.timingQuality;const percent=Math.round(state.power*100);set('penaltyPower',percent+'%');el('penaltyMeter').setAttribute('aria-valuenow',String(percent));}
 function advance(time){
  const now=Math.max(lastTime??time,time),dt=(now-(lastTime??now))/1000;lastTime=now;
  engine.update(dt);const state=engine.snapshot();if(!state.paused)animationTime+=dt;return state;
 }
 function syncInput(){if(active)advance(host.performance.now());}
 function chargeShot(){syncInput();return engine.charge();}
 function releaseShot(){syncInput();return engine.release();}
 function loop(time){if(!active)return;const state=advance(time);draw(state,animationTime);renderNeedle(state);raf=host.requestAnimationFrame(loop);}
 function cancelPointer(){syncInput();if(pointer!==null){try{el('penaltyShoot').releasePointerCapture(pointer);}catch(_){}pointer=null;}engine?.cancelCharge();}
 function openUpgrades(){if(!active)return;wasPaused=engine.snapshot().paused;cancelPointer();engine.pause(true);upgradesOpen=true;el('penaltyUpgrades').classList.remove('hidden');renderUpgrades();el('penaltyUpgradeClose').focus();}
 function closeUpgrades(){syncInput();upgradesOpen=false;el('penaltyUpgrades').classList.add('hidden');engine.pause(wasPaused);el('penaltyUpgradeOpen').focus();}
 function mount(){
  if(root)return;root=el('penaltyModal');canvas=el('penaltyCanvas');ctx=canvas.getContext('2d');
  if(typeof host.ResizeObserver==='function'){resizeObserver=new host.ResizeObserver(entries=>{for(const entry of entries)resizeCanvas(entry.contentRect.width,entry.contentRect.height);});resizeObserver.observe(canvas);}
  host.addEventListener('resize',()=>{if(active){const rect=canvas.getBoundingClientRect();resizeCanvas(rect.width,rect.height);}});
  engine=host.PenaltyGame.create({onChange:render});
  const rect=config().goal.rect;Object.assign(el('penaltyTargets').style,{left:rect.x*100+'%',top:rect.y*100+'%',width:rect.width*100+'%',height:rect.height*100+'%'});
  for(const zone of host.PenaltyGame.ZONES){const button=host.document.createElement('button');button.type='button';button.dataset.penaltyZone=zone.id;button.textContent=zone.name;button.setAttribute('aria-label','Aim '+zone.name);button.addEventListener('click',()=>engine.select(zone.id));el('penaltyTargets').append(button);}
  const shoot=el('penaltyShoot');shoot.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse'||pointer!==null)return;e.preventDefault();if(chargeShot()){pointer=e.pointerId;shoot.setPointerCapture(pointer);}});
  shoot.addEventListener('pointerup',e=>{if(pointer!==e.pointerId)return;pointer=null;releaseShot();});shoot.addEventListener('pointercancel',cancelPointer);shoot.addEventListener('lostpointercapture',()=>{if(pointer!==null)cancelPointer();});
  el('penaltyExit').addEventListener('click',close);el('penaltyPause').addEventListener('click',()=>{cancelPointer();engine.pause();});el('penaltySound').addEventListener('click',()=>{host.PenaltyStatsSystem.setSound(!host.PenaltyStatsSystem.snapshot().sound);render(engine.snapshot());});el('penaltyUpgradeOpen').addEventListener('click',openUpgrades);el('penaltyUpgradeClose').addEventListener('click',closeUpgrades);el('penaltyRestart').addEventListener('click',()=>{lastImpact='';engine.next();});el('penaltyRetry').addEventListener('click',()=>engine.retry());
  for(const key of Object.keys(host.PenaltyStatsSystem.STATS))el('penaltyBuy_'+key).addEventListener('click',()=>{if(!host.PenaltyStatsSystem.upgrade(key))set('penaltyUpgradeStatus','Unable to buy. Check Tokens and storage.');else set('penaltyUpgradeStatus','Upgrade saved. Applies to your next shot.');render(engine.snapshot());});
  host.document.addEventListener('visibilitychange',()=>{if(active&&host.document.hidden){cancelPointer();engine.pause(true);}});
  host.document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();upgradesOpen?closeUpgrades():(cancelPointer(),engine.pause());return;}if(upgradesOpen&&e.key!=='Tab')return;if(e.code==='Space'&&(!['INPUT','TEXTAREA','SELECT','BUTTON'].includes(e.target.tagName)||e.target.id==='penaltyShoot'||e.target.hasAttribute('data-penalty-zone'))){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat){if(e.target.hasAttribute('data-penalty-zone'))engine.select(Number(e.target.dataset.penaltyZone));chargeShot();}}if(/^[1-9]$/.test(e.key))engine.select(Number(e.key)-1);
   if(e.key==='Tab'){const panel=upgradesOpen?el('penaltyUpgrades'):root,items=[...panel.querySelectorAll('button:not(:disabled),[tabindex="0"]')].filter(n=>n.offsetParent!==null),first=items[0],last=items.at(-1);if(e.shiftKey&&host.document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&host.document.activeElement===last){e.preventDefault();first?.focus();}}
  },true);
  host.document.addEventListener('keyup',e=>{if(active&&e.code==='Space'){e.preventDefault();releaseShot();}},true);
 }
 function open(){mount();loadImages();if(active)return true;if(bridge.canOpen?.()===false)return false;if(!engine.open()){host.ShopBulkSystem?.notify(engine.snapshot().error);return false;}active=true;root.classList.remove('hidden');host.document.body.classList.add('modal-open');const size=canvas.getBoundingClientRect();resizeCanvas(size.width,size.height);lastTime=host.performance.now();animationTime=0;lastImpact='';raf=host.requestAnimationFrame(loop);el('penaltyShoot').focus();return true;}
 function close(){if(!active)return;active=false;host.cancelAnimationFrame(raf);raf=0;cancelPointer();engine.close();upgradesOpen=false;el('penaltyUpgrades').classList.add('hidden');root.classList.add('hidden');if(!host.document.querySelector('.modal-backdrop:not(.hidden)'))host.document.body.classList.remove('modal-open');if(audio){void audio.close().catch(()=>{});audio=null;}bridge.onExit?.();}
 host.addEventListener('pagehide',close);
 host.PenaltyView=Object.freeze({configure:options=>{bridge=options||{};mount();},open,close,refresh:()=>{if(engine&&active)render(engine.snapshot());},snapshot:()=>engine?.snapshot(),spriteStatus:()=>Object.fromEntries(['goal','keeper','ball'].map(k=>[k,Boolean(images[k])])),get active(){return active;}});
})(window);
