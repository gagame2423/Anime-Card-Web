/* Pixel arena presentation. Physics/state stay in BallCombat; DOM cards keep stable identity. */
(function(host){
 'use strict';
 const doc=host.document,I=host.BallIndex,esc=I.esc,fmt=I.fmt,PIXELS=640;
 let root=null,main=null,actions={},arena=null,canvas=null,ctx=null,scene=null,tooltip=null,roster={player:null,enemy:null},feeds={player:null,enemy:null},entries=new Map(),lastLog={player:0,enemy:0},images=new Map(),currentTip=null,hideTimer=0,previousFocus=null,canvasSize=0,canvasObserver=null;
 const el=(tag,className,text)=>{const node=doc.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
 const closest=(target,selector)=>target instanceof Element?target.closest(selector):target?.parentElement?.closest(selector);
 const play=cue=>host.BallAudio?.play(cue);
 const write=(node,value)=>{const text=String(value);if(node&&node.textContent!==text)node.textContent=text;};
 const button=(action,text,extra='')=>'<button type="button" data-ball-action="'+action+'" '+extra+'>'+text+'</button>';
 function mount(){
  if(root)return true;root=doc.getElementById('ballArenaModal');if(!root)return false;
  root.innerHTML='<header class="ball-header"><div class="ball-brand"><span class="ball-brand-icon" aria-hidden="true">●</span><div><span class="ball-kicker">PHYSICS ARCADE / UPDATE 34.5</span><h1 id="ballArenaTitle">Ball vs Ball</h1></div></div><div class="ball-header-audio" aria-label="Game sound settings"><button type="button" data-ball-audio-toggle aria-pressed="true" title="Toggle Ball Arena sound effects">SFX ON</button><label class="ball-volume"><span>VOL</span><input type="range" data-ball-audio-volume min="0" max="100" value="75" step="5" aria-label="Ball Arena sound volume"><output data-ball-audio-value>75%</output></label><small class="ball-master-audio" hidden>Game sound muted</small></div><div class="ball-header-actions"><span class="ball-connection-chip">LOCAL AI</span>'+button('close','×','class="ball-close" aria-label="Close Ball vs Ball"')+'</div></header><main class="ball-main"></main><div class="ball-confirm" role="alertdialog" aria-label="Leave match" hidden><section><h2>Leave this match?</h2><p>The match will end without rewards.</p><div>'+button('cancelClose','Keep Playing')+button('confirmClose','Leave Match','class="ball-primary"')+'</div></section></div><div class="ball-status-tooltip" id="ballStatusTooltip" role="tooltip" hidden></div>';
  main=root.querySelector('.ball-main');tooltip=root.querySelector('.ball-status-tooltip');
  root.addEventListener('input',e=>{if(closest(e.target,'[data-ball-audio-volume]')){host.BallAudio?.setVolume(Number(e.target.value)/100);audioSettings();}});
  root.addEventListener('change',e=>{if(closest(e.target,'[data-ball-audio-volume]'))play('ui_click');});
  root.addEventListener('click',e=>{
   const toggle=closest(e.target,'[data-ball-audio-toggle]');
   if(toggle){const settings=host.BallAudio?.settings();if(settings){host.BallAudio.setMuted(!settings.muted);audioSettings();play('ui_click');}return;}
   const status=closest(e.target,'[data-ball-status]');
   if(status){play('ui_click');if(currentTip?.node===status&&currentTip.pinned)hideTip();else showTip(status,true);return;}
   const target=closest(e.target,'[data-ball-action]');
   if(target){const action=target.dataset.ballAction,arg=target.dataset.value;hideTip();
    if(['mode','index','lobby'].includes(action))play('tab_switch');else if(['auto','speed','start','retry'].includes(action))play('ui_click');
    if(action==='mode')actions.mode?.(arg);else if(action==='index'||action==='speed')actions[action]?.(Number(arg)||0);else actions[action]?.();return;}
   if(currentTip&&!tooltip.contains(e.target))hideTip();
  });
  root.addEventListener('pointerover',e=>{const target=closest(e.target,'[data-ball-status]');if(target&&e.pointerType==='mouse'&&!target.contains(e.relatedTarget)&&!currentTip?.pinned)showTip(target,false);});
  root.addEventListener('pointerout',e=>{const target=closest(e.target,'[data-ball-status]');if(target&&target===currentTip?.node&&!target.contains(e.relatedTarget)&&!tooltip.contains(e.relatedTarget))softHide();});
  tooltip.addEventListener('pointerenter',()=>host.clearTimeout(hideTimer));tooltip.addEventListener('pointerleave',softHide);
  root.addEventListener('focusin',e=>{const target=closest(e.target,'[data-ball-status]');if(target&&target.matches(':focus-visible'))showTip(target,false);});
  root.addEventListener('focusout',e=>{if(e.target===currentTip?.node&&!tooltip.contains(e.relatedTarget))softHide();});
  root.addEventListener('scroll',()=>{if(currentTip)positionTip();},true);
  root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(currentTip)hideTip();else if(!root.querySelector('.ball-confirm').hidden)actions.cancelClose?.();else actions.close?.();}});
  root.addEventListener('cancel',e=>{e.preventDefault();if(currentTip)hideTip();else actions.close?.();});
  host.addEventListener('resize',()=>{if(root.open&&currentTip)positionTip();});
  doc.fonts?.load("10px 'Roblox Pixel'")?.catch(()=>{});
  return true;
 }
 function audioSettings(){
  if(!root)return;
  const settings=host.BallAudio?.settings();if(!settings)return;
  const toggle=root.querySelector('[data-ball-audio-toggle]'),volume=root.querySelector('[data-ball-audio-volume]');
  write(toggle,settings.muted?'SFX OFF':'SFX ON');toggle.setAttribute('aria-pressed',String(!settings.muted));toggle.classList.toggle('is-active',!settings.muted);
  const percent=Math.round(settings.volume*100);if(Number(volume.value)!==percent)volume.value=String(percent);
  volume.setAttribute('aria-valuetext',percent+' percent');write(root.querySelector('[data-ball-audio-value]'),percent+'%');
  root.querySelector('.ball-master-audio').hidden=true;
 }
 function open(next){actions=next;previousFocus=doc.activeElement;root.showModal();doc.body.classList.add('ball-open');root.querySelector('.ball-close').focus();}
 function close(){canvasObserver?.disconnect();canvasObserver=null;canvasSize=0;hideTip();root.querySelector('.ball-confirm').hidden=true;root.close();doc.body.classList.remove('ball-open');main.replaceChildren();scene=null;canvas=ctx=null;entries.clear();images.clear();if(previousFocus?.isConnected)previousFocus.focus();}
 function prepare(screen){canvasObserver?.disconnect();canvasObserver=null;canvasSize=0;hideTip();main.dataset.ballScreen=screen;scene=null;canvas=ctx=null;entries.clear();}
 function speedMarkup(potion){return '<div class="ball-controls"><div class="ball-speed" aria-label="Combat speed">'+button('speed','1x','data-value="1"')+button('speed','2x','data-value="2"')+'</div>'+button('auto','Auto-Continue: OFF','class="ball-auto" aria-pressed="false"')+'<span class="ball-potion" '+(potion?'':'hidden')+'>⏱ Speed Battle Potion · 2x</span></div>';}
 function showLobby(data){
  prepare('lobby');
  const ready=data.slots.every(slot=>!!data.findRow(slot));
  main.innerHTML='<section class="ball-lobby"><div class="ball-lobby-hero"><div class="ball-lobby-title"><span class="ball-kicker">◆ ENTER THE REBOUND CIRCUIT</span><h2>THE ARENA<br><em>NEVER STANDS STILL.</em></h2><p>Build a lineup of card orbs. Bounce into opponents, charge Energy off the walls and unleash spatial attacks.</p><div class="ball-hero-rewards"><img src="assets/items/gem.png" alt=""><b>0–5 BONUS GEMS</b><span>Per victory · standard Arena rewards included</span></div></div><div class="ball-hero-art" aria-hidden="true"><div class="ball-hero-orb orb-main">ϟ</div><div class="ball-hero-orb orb-enemy">✦</div><div class="ball-pixel-cross">+</div><span>IMPACT / REBOUND / RELEASE</span></div></div><div class="ball-section-head"><div><span class="ball-kicker">01 / SELECT A MATCH</span><h3>Game Modes</h3></div><span class="ball-gem-count"><img src="assets/items/gem.png" alt=""> '+fmt(data.gems)+' Gems</span></div><div class="ball-mode-grid">'+data.modes.map(m=>'<button type="button" class="ball-mode '+(m.id===data.mode.id?'is-active ':'')+(m.locked?'is-locked':'')+'" data-ball-action="mode" data-value="'+esc(m.id)+'" '+(m.locked?'disabled':'')+' aria-pressed="'+(m.id===data.mode.id)+'"><i>'+esc(m.icon||'●')+'</i><div><small>'+esc(m.locked?'COMING SOON':m.match||'Arena Mode')+'</small><h3>'+esc(m.name)+'</h3><p>'+esc(m.description||'')+'</p></div></button>').join('')+'</div><div class="ball-section-head"><div><span class="ball-kicker">02 / YOUR TEAM</span><h3>Lineup · '+data.slots.filter(Boolean).length+'/'+data.mode.teamSize+'</h3></div>'+button('index','▦ Ball Index','data-value="0"')+'</div><div class="ball-lineup">'+data.slots.map((slot,i)=>{const row=data.findRow(slot);const item=row&&I.relic(slot);return '<button type="button" data-ball-action="index" data-value="'+i+'" class="ball-lineup-slot '+(row?'ball-rarity-frame':'is-empty')+'" '+(row?'style="'+I.frame(row)+'"':'')+'><small>SLOT '+(i+1)+'</small>'+(row?I.img(row.card)+'<b>'+esc(row.card.name)+'</b><span>Lv. '+row.level+' · '+esc(row.mutations.map(m=>m.name).join(' + ')||'Normal')+'</span>'+(item?'<img class="ball-slot-relic" src="'+esc(item.def?.image)+'" alt="'+esc(item.def?.name)+'">':''):'<i>+</i><b>Choose Card</b>')+'</button>';}).join('')+'</div><footer class="ball-lobby-footer">'+speedMarkup(data.potion)+'<p class="ball-notice" role="status">'+esc(data.error||(!ready?'Select an owned card for every slot.':'Wall rebound: +20 Energy · Native turn: 1.35s at 1x'))+'</p>'+button('start','▶ START MATCH','class="ball-primary ball-start" '+(!ready?'disabled':''))+'</footer></section>';
  main.scrollTop=0;speed(data.potion?2:data.speed,data.auto,data.potion);
 }
 function showIndex(options){prepare('index');I.build(main,options);main.scrollTop=0;}
 function teamMarkup(side){const title=side==='player'?'PLAYER':'ENEMY';return '<section class="ball-team ball-team-'+side+'"><header><span class="ball-kicker">'+(side==='player'?'01 / OWN TEAM':'03 / OPPONENT')+'</span><h3>'+title+' TEAM <span data-live-count="'+side+'"></span></h3></header><div class="ball-live-roster" data-roster="'+side+'" aria-label="'+title+' live roster"></div><div class="ball-log-panel"><h4>'+title+' BATTLE LOG</h4><div class="ball-log-feed" data-feed="'+side+'" role="log" aria-label="'+title+' battle log" aria-live="off"></div></div></section>';}
 function showCombat(mode,prepared,fight){
  prepare('combat');scene=fight;lastLog={player:0,enemy:0};images.clear();
  main.innerHTML='<div class="ball-combat-toolbar"><div><span class="ball-kicker">LIVE / '+esc(mode.name.toUpperCase())+'</span><b id="ballRoundClock">0:00 / 2:00</b></div>'+speedMarkup(false)+button('close','Leave Match','class="ball-quiet"')+'</div><div class="ball-combat-grid">'+teamMarkup('player')+'<section class="ball-center"><div class="ball-arena-caption"><span>REBOUND ARENA</span><b>1 : 1</b><span>ϟ WALL ENERGY +20</span></div><div class="ball-square"><canvas id="ballPhysicsCanvas" width="640" height="640" role="img" aria-label="Live square physics arena. Player balls have cyan markers; enemy balls have red markers."></canvas><div class="ball-countdown" role="status" aria-live="polite" hidden><div><small>GET READY</small><strong></strong></div></div><div class="ball-result" role="status" aria-live="polite" hidden></div></div><div class="ball-arena-footer"><span><i class="ball-team-dot own"></i> Player</span><span><i class="ball-team-dot foe"></i> Enemy</span><span>● Pierce / Blast / Strike</span></div></section>'+teamMarkup('enemy')+'</div>';
  main.scrollTop=0;arena=main.querySelector('.ball-square');canvas=main.querySelector('canvas');ctx=canvas.getContext('2d',{alpha:false});canvasSize=Math.max(1,canvas.clientWidth);if(host.ResizeObserver){canvasObserver=new ResizeObserver(rows=>{canvasSize=Math.max(1,rows[0]?.contentRect.width||canvas.clientWidth);});canvasObserver.observe(canvas);}
  for(const side of ['player','enemy']){roster[side]=main.querySelector('[data-roster="'+side+'"]');feeds[side]=main.querySelector('[data-feed="'+side+'"]');}
  updateHud(fight,1);frame(fight);
 }
 function countdown(number){
  const panel=main?.querySelector('.ball-countdown');if(!panel)return;
  panel.hidden=number<=0;if(number>0){write(panel.querySelector('strong'),number);panel.dataset.count=String(number);}
 }
 function speed(value,auto,potion){
  if(!root?.open)return;audioSettings();
  for(const b of main.querySelectorAll('.ball-speed button')){b.classList.toggle('is-active',Number(b.dataset.value)===value);b.setAttribute('aria-pressed',String(Number(b.dataset.value)===value));b.disabled=!!potion;}
  for(const b of main.querySelectorAll('.ball-auto')){b.textContent='Auto-Continue: '+(auto?'ON':'OFF');b.classList.toggle('is-active',auto);b.setAttribute('aria-pressed',String(auto));}
  for(const n of main.querySelectorAll('.ball-potion'))n.hidden=!potion;
 }
 function imageFor(card){const source=host.CardSkinSystem.art(card,card.skinId);if(!images.has(source)&&source){const image=new Image();image.src=source;images.set(source,image);}return images.get(source);}
 function pixelFont(size){return size+"px 'Roblox Pixel', 'Courier New', monospace";}
 let labelBoxes=[];
 function label(value,x,y,size,color,maxWidth=124,avoid=false){
  let text=String(value).replace(/\s+/g,' ').trim();if(!text)return;
  // Roblox Pixel is 0.857em wide per glyph. Fit all labels in arena
  // coordinates, then scale the same square for desktop and mobile.
  ctx.font=pixelFont(size);
  if(ctx.measureText(text).width>maxWidth){size=Math.max(8,size*maxWidth/ctx.measureText(text).width);ctx.font=pixelFont(size);}
  if(ctx.measureText(text).width>maxWidth){while(text.length>1&&ctx.measureText(text+'…').width>maxWidth)text=text.slice(0,-1);text+='…';}
  const half=ctx.measureText(text).width/2,clampX=x=>Math.max(half+4,Math.min(PIXELS-half-4,x)),clampY=y=>Math.max(size+4,Math.min(PIXELS-size-4,y));
  x=clampX(x);y=clampY(y);
  if(avoid){
   const h=size*.63+1,collides=(x,y)=>labelBoxes.some(box=>Math.abs(x-box.x)<half+box.half+3&&Math.abs(y-box.y)<h+box.h+2);
   const locations=[[0,0],[0,-size-4],[0,size+4],[0,-2*size-8],[-half-10,-size],[half+10,-size],[0,2*size+8]];
   const spot=locations.map(([dx,dy])=>[clampX(x+dx),clampY(y+dy)]).find(([a,b])=>!collides(a,b));
   if(!spot)return;[x,y]=spot;labelBoxes.push({x,y,half,h});
  }
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#070b14';ctx.fillText(text,x+1,y+1);ctx.fillStyle=color;ctx.fillText(text,x,y);
 }
 function shortFloat(fx){return fx.amount===null||fx.amount===undefined?fx.text:(fx.tone==='heal'?'+':'−')+I.compact(fx.amount);}
 function floatGroups(fight){
  const latest=new Map();
  // Coalesce only visual popups (the native hit counts and exact battle log
  // remain unchanged). At most one numeric and one other popup per orb.
  for(const fx of fight.events){
   const age=fight.time-fx.at;if(fx.kind!=='float'||age>=.70)continue;
   const numeric=Number.isFinite(fx.amount),key=fx.orbId+'|'+(numeric?'value':'label'),old=latest.get(key);
   if(numeric&&old&&fx.at-old.at<.16&&((fx.tone==='heal')===(old.tone==='heal'))){
    latest.set(key,{...fx,amount:old.amount+fx.amount,tone:fx.tone==='crit'||old.tone==='crit'?'crit':fx.tone});
   }else latest.set(key,fx);
  }
  return [...latest.values()].sort((a,b)=>a.at-b.at).slice(-16);
 }
 function rectangleShape(s,side,alpha){
  const x=s.x*PIXELS,y=s.y*PIXELS,range=s.range*PIXELS,angle=Math.atan2(s.dy,s.dx);
  ctx.save();ctx.globalAlpha=alpha;ctx.translate(x,y);ctx.rotate(angle);ctx.lineWidth=2;
  ctx.strokeStyle=side==='player'?'#7afff0':'#ffb76b';ctx.fillStyle=side==='player'?'rgba(32,230,214,.20)':'rgba(255,128,85,.20)';
  ctx.beginPath();
  if(s.kind==='blast')ctx.arc(0,0,s.radius*PIXELS,0,Math.PI*2);
  else if(s.kind==='pierce')ctx.rect(0,-s.width*PIXELS,range,2*s.width*PIXELS);
  else{ctx.moveTo(0,0);ctx.arc(0,0,range,-s.angle,s.angle);ctx.closePath();}
  ctx.fill();ctx.stroke();ctx.restore();
 }
 let background=null;
 function arenaBackground(){
  if(background)return background;
  background=doc.createElement('canvas');background.width=background.height=PIXELS;const g=background.getContext('2d');
  g.fillStyle='#111c2b';g.fillRect(0,0,PIXELS,PIXELS);g.fillStyle='#0c1622';g.fillRect(12,12,616,616);
  g.strokeStyle='rgba(88,150,172,.14)';g.beginPath();
  for(let i=16;i<PIXELS;i+=32){g.moveTo(i,12);g.lineTo(i,628);g.moveTo(12,i);g.lineTo(628,i);}g.stroke();
  g.strokeStyle='#355266';g.setLineDash([5,9]);g.beginPath();g.moveTo(320,12);g.lineTo(320,628);g.stroke();g.setLineDash([]);
  g.strokeStyle='#214858';g.beginPath();g.arc(320,320,109,0,Math.PI*2);g.stroke();
  g.fillStyle='#1b3d48';g.fillRect(0,0,PIXELS,5);g.fillRect(0,PIXELS-5,PIXELS,5);g.fillRect(0,0,5,PIXELS);g.fillRect(PIXELS-5,0,5,PIXELS);
  return background;
 }
 function frame(fight){
  if(!canvas||!ctx||fight!==scene)return;
  const dpr=Math.min(2,host.devicePixelRatio||1),size=Math.round(Math.max(1,canvasSize||canvas.clientWidth)*dpr);
  if(size!==canvas.width){canvas.width=canvas.height=size;}
  const scale=canvas.width/PIXELS;ctx.setTransform(scale,0,0,scale,0,0);ctx.imageSmoothingEnabled=false;
  ctx.drawImage(arenaBackground(),0,0);labelBoxes=[];
  for(const fx of fight.events){if(fx.kind!=='shape'||fight.done)continue;const alpha=Math.max(0,1-(fight.time-fx.at)/.65);if(alpha)rectangleShape(fx.shape,fx.side,alpha);}
  for(const p of fight.orbs.values()){
   const u=p.u;if(!(u.hp>0)||u.defeated)continue;
   const x=p.x*PIXELS,y=p.y*PIXELS,r=p.r*PIXELS,colors=I.colors(u.card,u.mutations||[]),border=ctx.createLinearGradient(x-r,y-r,x+r,y+r);border.addColorStop(0,colors[0]);border.addColorStop(1,colors[1]);
   ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle='#253846';ctx.fill();ctx.clip();
   const image=imageFor(u.card);
   if(image?.complete&&image.naturalWidth){const scale=Math.max(2*r/image.naturalWidth,2*r/image.naturalHeight);ctx.drawImage(image,x-image.naturalWidth*scale/2,y-image.naturalHeight*scale/2,image.naturalWidth*scale,image.naturalHeight*scale);}
   else{label(u.card.name.slice(0,2).toUpperCase(),x,y,Math.min(17,r*.42),'#f0e6d2',r*1.5);}
   ctx.restore();
   ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.strokeStyle=border;ctx.lineWidth=4;ctx.stroke();
   ctx.strokeStyle=p.side==='player'?'#57f0cd':'#ff6c79';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r+4,.13,Math.PI-.13);ctx.stroke();
   const bw=r*1.73,bh=5,left=x-bw/2,top=Math.min(PIXELS-20,y+r+6),hp=Math.max(0,Math.min(1,u.hp/Math.max(1,u.maxHp))),en=p.energy/100;
   ctx.fillStyle='#050a12';ctx.fillRect(left-1,top-1,bw+2,14);ctx.fillStyle=p.side==='player'?'#45dc80':'#ef6775';ctx.fillRect(left,top,bw*hp,bh);
   ctx.fillStyle='#173444';ctx.fillRect(left,top+6,bw,bh);ctx.fillStyle='#61dff5';ctx.fillRect(left,top+6,bw*en,bh);
   if(u.passiveState?.shield>0){ctx.fillStyle='#7dbaff';ctx.fillRect(left,top-3,bw*Math.min(1,u.passiveState.shield/Math.max(1,u.maxHp)),2);}
   label((hp*100).toFixed(1)+'%',x,Math.max(10,y-r-8),Math.max(9,Math.min(12,r*.29)),'#f8fbff',r*1.8,true);
  }
  if(!fight.done)for(const fx of fight.events){const age=fight.time-fx.at;
   if(fx.kind==='spark'&&age<.48){ctx.save();ctx.globalAlpha=1-age/.48;ctx.fillStyle=fx.side==='player'?'#74f7f0':fx.side==='enemy'?'#ff9579':'#ffe38f';for(let i=0;i<8;i++){const angle=i*Math.PI/4+fx.id*.19,d=age*88+5;ctx.fillRect(fx.x*PIXELS+Math.cos(angle)*d-2,fx.y*PIXELS+Math.sin(angle)*d-2,4,4);}ctx.restore();}

  }
  if(!fight.done)for(const fx of floatGroups(fight)){
   const age=fight.time-fx.at,numeric=Number.isFinite(fx.amount);
   ctx.save();ctx.globalAlpha=Math.min(1,(.70-age)*4);
   label(shortFloat(fx),fx.x*PIXELS,fx.y*PIXELS-(numeric?57:76)-age*29,fx.tone==='crit'?12:10,fx.tone==='heal'?'#75f5a8':fx.tone==='energy'?'#79edff':fx.tone==='crit'?'#ffdb76':fx.tone==='dot'?'#eab7ff':fx.tone==='shield'?'#93cfff':'#f8eef1',numeric?100:122,true);
   ctx.restore();
  }
 }
 function createRosterEntry(p){
  const unit=p.u,node=el('article','ball-unit ball-rarity-frame');node.style.cssText=I.frame({card:unit.card,mutations:unit.mutations||[]});node.dataset.orb=String(p.id);
  node.innerHTML='<div class="ball-unit-head"><div class="ball-unit-art">'+I.img(unit.card)+'</div><div><small>'+esc(unit.card.rarity+' · Lv. '+(unit.display?.level||unit.level||1))+'</small><b title="'+esc(unit.display?.name||unit.card.name)+'">'+esc(unit.display?.name||unit.card.name)+'</b></div><span class="ball-unit-state">LIVE</span></div><div class="ball-meter hp"><div><span>HP</span><b></b><strong class="ball-hp-percent"></strong></div><i><em></em></i></div><div class="ball-meter energy"><div><span>ENERGY</span><b></b></div><i><em></em></i></div><div class="ball-unit-shield">Shield <b>0</b></div><div class="ball-passive-strip"></div><div class="ball-status-pills"></div>';
  return {node,hp:node.querySelector('.hp b'),percent:node.querySelector('.ball-hp-percent'),hpbar:node.querySelector('.hp em'),energy:node.querySelector('.energy b'),energybar:node.querySelector('.energy em'),shield:node.querySelector('.ball-unit-shield b'),state:node.querySelector('.ball-unit-state'),pills:node.querySelector('.ball-status-pills'),passives:node.querySelector('.ball-passive-strip'),statuses:new Map(),unit,identity:unit.card.id+'|'+unit.card.image+'|'+(unit.display?.name||unit.card.name)};
 }
 function updateEntry(p,fight){
  const entry=entries.get(p.id)||createRosterEntry(p);if(!entries.has(p.id)){entries.set(p.id,entry);roster[p.side].append(entry.node);}
  const identity=p.u.card.id+'|'+p.u.card.image+'|'+(p.u.display?.name||p.u.card.name);
  if(entry.identity!==identity){entry.identity=identity;entry.node.style.cssText=I.frame({card:p.u.card,mutations:p.u.mutations||[]});entry.node.querySelector('.ball-unit-art').innerHTML=I.img(p.u.card);entry.node.querySelector('.ball-unit-head b').textContent=p.u.display?.name||p.u.card.name;entry.node.querySelector('.ball-unit-head b').title=p.u.display?.name||p.u.card.name;entry.node.querySelector('.ball-unit-head small').textContent=p.u.card.rarity+' · Lv. '+(p.u.display?.level||p.u.level||1);}
  const live=p.u.hp>0&&!p.u.defeated,summary=fight.status(p),hp=Math.max(0,summary.hpPct);
  entry.node.classList.toggle('is-defeated',!live);entry.state.textContent=live?'LIVE':'OUT';
  const fullHp=fmt(p.u.hp)+' / '+fmt(p.u.maxHp),fullPct=hp.toFixed(1)+'%';entry.hp.title=fullHp;
  write(entry.hp,fullHp.length>20?I.compact(p.u.hp)+' / '+I.compact(p.u.maxHp):fullHp);write(entry.percent,fullPct);entry.hpbar.style.transform='scaleX('+Math.max(0,Math.min(1,hp/100))+')';
  write(entry.energy,Math.round(p.energy)+' / 100');entry.energybar.style.transform='scaleX('+Math.min(1,p.energy/100)+')';
  write(entry.shield,fmt(summary.shield));entry.shield.title=fmt(summary.shield);
  const seen=new Set();
  function renderEffect(effect,container,className='ball-status-pill'){
   seen.add(effect.key);let data=entry.statuses.get(effect.key);
   if(!data){
    const node=el('button',className);node.type='button';node.dataset.ballStatus=p.id+'|'+effect.key;container.append(node);data={node,effect};entry.statuses.set(effect.key,data);
   }
   data.effect=effect;data.seconds=effect.seconds;data.node.dataset.tone=effect.tone;
   const node=data.node;
   if(effect.meter){
    if(!data.meter){
     node.classList.add('ball-emotion-meter');
     node.innerHTML='<span class="ball-emotion-top"><small>EMOTION</small><b class="ball-emotion-lock"></b></span><span class="ball-emotion-values"><b class="ball-emotion-pos"></b><b class="ball-emotion-neg"></b></span><span class="ball-emotion-track"><i></i></span>';
     data.meter={pos:node.querySelector('.ball-emotion-pos'),neg:node.querySelector('.ball-emotion-neg'),lock:node.querySelector('.ball-emotion-lock'),bar:node.querySelector('.ball-emotion-track i')};
    }
    const m=effect.meter,pos=Math.max(0,Math.min(100,m.positive)),neg=Math.max(0,Math.min(100,m.negative));write(data.meter.pos,'+'+Number(pos.toFixed(2))+'%');write(data.meter.neg,'−'+Number(neg.toFixed(2))+'%');write(data.meter.lock,m.locked?(pos>=100?'POSITIVE LOCK':'NEGATIVE LOCK'):'');data.meter.bar.style.transform='scaleX('+(pos/100)+')';node.classList.toggle('is-locked',m.locked);node.title=effect.label;
   }else{
    const duration=effect.turns>0?' · '+effect.turns+'t / '+(effect.seconds/(currentSpeed||1)).toFixed(1)+'s':'';
    write(node,effect.icon+' '+effect.label.replace(/ \(\d+t\)$/,'')+duration);
    node.title=effect.label;
   }
   node.setAttribute('aria-label',effect.label);
  }
  const passive=summary.passive||{},counts=summary.counts||{},counters=summary.counters||[],meter=counters.find(c=>c.meter);
  // The passive inspector stays mounted on the stable roster entry. It
  // contains every counter even when the compact strip can only show two.
  if(meter)renderEffect({...meter,type:'Passive',detail:'Primary attacks shift the balance 10–20% positive; incoming hits shift it 10–20% negative. +100% locks and grants living allies +100% max HP and +25% ATK. −100% hits the whole enemy team for 25× current ATK and permanently defeats Equinox.',facts:[meter.label],duration:meter.meter.locked?'Locked for this match':'Live combat counter'},entry.passives,'ball-status-pill ball-progress');
  const plain=counters.filter(c=>!c.meter),visible=plain.slice(0,meter?1:2);const pinned=plain.find(c=>entry.statuses.get(c.key)?.node===currentTip?.node&&currentTip?.pinned);if(pinned&&!visible.includes(pinned))visible.push(pinned);
  for(const counter of visible)renderEffect({...counter,type:'Passive',detail:counter.detail||counter.label,duration:counter.turns?undefined:'Live combat counter',facts:[passive.name]},entry.passives,'ball-status-pill ball-progress');
  renderEffect({key:'passive-info',name:passive.name||'Passive',type:'Passive',icon:'✦',tone:'passive',label:plain.length>visible.length?'PASSIVE +'+(plain.length-visible.length):'PASSIVE',detail:passive.description||'No separate native passive.',duration:!live?'Out of combat':p.entered?(passive.status||'Active'):'Awaiting first impact',facts:['Attacks: '+fmt(counts.attacks)+' · Hits: '+fmt(counts.hits)+' · Follow-ups: '+fmt(counts.followUps),'Own turns: '+fmt(counts.turns)+' · Kills: '+fmt(counts.kills),...counters.map(c=>c.label)]},entry.passives,'ball-status-pill ball-passive-info');
  // A status is updated in place, including the exact damage and duration.
  for(const effect of live?summary.effects:[])renderEffect(effect,entry.pills);
  for(const [key,data] of entry.statuses)if(!seen.has(key)){
   if(currentTip?.node===data.node){data.expired=true;data.node.textContent=data.effect.name+' · Expired';data.node.classList.add('is-expired');}
   else{data.node.remove();entry.statuses.delete(key);}
  }else{data.expired=false;data.node.classList.remove('is-expired');}
 }
 let currentSpeed=1;
 function updateHud(fight,value){
  if(scene!==fight)return;currentSpeed=value;const elapsed=Math.floor(fight.time),clock=main.querySelector('#ballRoundClock');clock.textContent=Math.floor(elapsed/60)+':'+String(elapsed%60).padStart(2,'0')+' / 2:00';
  const seen=new Set();
  for(const p of fight.orbs.values()){if((p.u.isSummoned||p.u.isClone)&&(p.u.defeated||p.u.hp<=0))continue;seen.add(p.id);updateEntry(p,fight);}
  for(const [id,entry] of entries)if(!seen.has(id)){if(currentTip?.node&&entry.node.contains(currentTip.node))hideTip();entry.node.remove();entries.delete(id);}
  for(const side of ['player','enemy']){
   main.querySelector('[data-live-count="'+side+'"]').textContent=' · '+[...fight.orbs.values()].filter(p=>p.side===side&&p.u.hp>0&&!p.u.defeated).length;
   const target=feeds[side],nearBottom=target.scrollHeight-target.scrollTop-target.clientHeight<32,rows=fight.logs[side],fragment=doc.createDocumentFragment();let changed=false;
   for(const row of rows){if(row.id<=lastLog[side])continue;const line=host.BattleLogView.createLine(doc,row.text,row.tone),time=el('small','ball-log-time',row.time.toFixed(1)+'s ');line.prepend(time);fragment.append(line);lastLog[side]=row.id;changed=true;}
   if(changed){target.append(fragment);while(target.childElementCount>180)target.firstElementChild.remove();if(nearBottom)target.scrollTop=target.scrollHeight;}
  }
  if(currentTip)refreshTip();
 }
 function effectFor(node){const i=node.dataset.ballStatus.indexOf('|'),id=Number(node.dataset.ballStatus.slice(0,i)),key=node.dataset.ballStatus.slice(i+1);return entries.get(id)?.statuses.get(key);}
 function showTip(node,pinned){host.clearTimeout(hideTimer);const data=effectFor(node);if(!data)return;hideTip(false);currentTip={node,pinned};node.setAttribute('aria-describedby',tooltip.id);tooltip.hidden=false;refreshTip();}
 function refreshTip(){
  const data=currentTip&&effectFor(currentTip.node);if(!data){hideTip();return;}
  const effect=data.effect;
  tooltip.dataset.tone=effect.tone;
  const remaining=data.expired?'Expired':effect.turns>0?effect.turns+' turn'+(effect.turns===1?'':'s')+' · '+(data.seconds/currentSpeed).toFixed(1)+'s remaining':effect.duration||'Active';
  const title=effect.icon+' '+effect.name,content=title+'|'+effect.detail+'|'+(effect.facts||[]).join('|');
  if(currentTip.signature!==content){
   currentTip.signature=content;tooltip.replaceChildren(el('b','',title),el('small','ball-tip-remaining'),el('p','',effect.detail));
   for(const fact of effect.facts||[])tooltip.append(el('i','',fact));
   tooltip.append(el('small','ball-tip-clock'));
  }
  tooltip.querySelector('.ball-tip-remaining').textContent=effect.type.toUpperCase()+' · '+remaining;
  const clock=tooltip.querySelector('.ball-tip-clock');clock.hidden=!(effect.turns>0);clock.textContent='One turn = '+(host.SpatialCombat.TURN_SECONDS/currentSpeed).toFixed(3).replace(/0+$/,'')+'s at '+currentSpeed+'x.';
  positionTip();
 }
 function positionTip(){
  if(!currentTip)return;const r=currentTip.node.getBoundingClientRect(),w=tooltip.offsetWidth,h=tooltip.offsetHeight,x=Math.min(host.innerWidth-w-10,Math.max(10,r.left+(r.width-w)/2)),y=r.bottom+h+9<host.innerHeight?r.bottom+7:Math.max(10,r.top-h-7);
  tooltip.style.left=x+'px';tooltip.style.top=y+'px';
 }
 function softHide(){if(!currentTip||currentTip.pinned)return;host.clearTimeout(hideTimer);hideTimer=host.setTimeout(()=>{if(currentTip?.node.matches(':hover')||tooltip.matches(':hover')||currentTip?.node===doc.activeElement)return;hideTip();},160);}
 function hideTip(clean=true){host.clearTimeout(hideTimer);if(!tooltip)return;currentTip?.node.removeAttribute('aria-describedby');currentTip=null;tooltip.hidden=true;if(clean)for(const entry of entries.values())for(const [key,data]of entry.statuses)if(data.expired){data.node.remove();entry.statuses.delete(key);}}
 function confirm(visible){const panel=root.querySelector('.ball-confirm');if(panel.hidden===!visible)return;panel.hidden=!visible;play(visible?'modal_open':'modal_close');}
 function result(out){
  hideTip();const panel=main.querySelector('.ball-result');if(!panel)return;panel.hidden=false;panel.dataset.result=out.winner||'draw';
  const rewards=out.rewards||{},win=out.winner==='player';
  panel.innerHTML='<div class="ball-result-card"><span class="ball-kicker">'+esc(out.reason==='time'?'TIME LIMIT · REMAINING TEAM HP':out.error?'MATCH STOPPED':'MATCH COMPLETE')+'</span><h2>'+esc(win?'VICTORY':out.winner==='enemy'?'DEFEAT':'DRAW')+'</h2><p>'+esc(out.error||(win?'Standard Arena rewards + bonus Gems':'Your collection is safe.'))+'</p>'+(win&&!out.error?'<div class="ball-result-rewards"><span>VNĐ <b>'+fmt(rewards.currency)+'</b></span><span>EXP <b>+'+fmt(rewards.experience)+'</b></span><span><img src="assets/items/gem.png" alt=""> GEMS <b>+'+fmt(rewards.gems)+'</b></span></div>':'')+'<div class="ball-result-actions">'+button('retry','Play Again','class="ball-primary"')+button('lobby','Lobby')+'</div></div>';
 }
 host.BallView=Object.freeze({mount,open,close,showLobby,showIndex,showCombat,updateHud,frame,speed,audioSettings,countdown,confirm,result});
})(window);
