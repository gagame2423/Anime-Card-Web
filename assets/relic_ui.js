/* Shared Arena relic slot. One tooltip, cached nodes, no per-frame listeners. */
(function(host){
 'use strict';
 const doc=host.document,views=new WeakMap();let panel,title,body,close,active=null,pinned=false,hideTimer=null;
 function hide(){if(hideTimer!==null)host.clearTimeout(hideTimer);hideTimer=null;if(active)active.button.setAttribute('aria-expanded','false');active=null;pinned=false;if(panel)panel.hidden=true;}
 function mount(){if(panel)return;panel=doc.createElement('aside');panel.id='battleRelicTooltip';panel.className='battle-relic-tooltip';panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Equipped Relic details');panel.hidden=true;
  title=doc.createElement('strong');body=doc.createElement('p');close=doc.createElement('button');close.type='button';close.className='battle-relic-close';close.textContent='×';close.setAttribute('aria-label','Close relic details');close.addEventListener('click',hide);panel.append(title,close,body);doc.body.append(panel);
  panel.addEventListener('pointerenter',()=>{if(hideTimer!==null)host.clearTimeout(hideTimer);});panel.addEventListener('pointerleave',()=>{if(!pinned)hide();});
  doc.addEventListener('pointerdown',e=>{if(active&&!panel.contains(e.target)&&!active.button.contains(e.target))hide();},true);
  doc.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();const button=active.button;hide();button.focus();}},true);
  host.addEventListener('resize',position);doc.addEventListener('scroll',()=>{if(active)position();},true);
 }
 function position(){
  if(!active||panel.hidden)return;const a=active.button.getBoundingClientRect();if(!a.width||!a.height){hide();return;}
  const w=host.innerWidth,h=host.innerHeight,below=Math.max(0,h-a.bottom-16),above=Math.max(0,a.top-16),down=below>=Math.min(panel.scrollHeight,260)||below>=above;
  const max=Math.max(60,down?below:above);panel.style.maxHeight=max+'px';const b=panel.getBoundingClientRect();
  const left=Math.max(8,Math.min(w-b.width-8,a.right-b.width))+'px',top=Math.max(8,down?a.bottom+8:a.top-b.height-8)+'px';
  if(panel.style.left!==left)panel.style.left=left;if(panel.style.top!==top)panel.style.top=top;
 }
 function update(view){const details=view.engine?.getRelicDetails?.(view.battle,view.unit);if(!details){if(active===view)hide();return null;}view.details=details;const heading=details.name+' · '+details.rarity.toUpperCase()+(details.unique?' · UNIQUE':'');if(active===view){if(title.textContent!==heading)title.textContent=heading;if(body.textContent!==details.description)body.textContent=details.description;position();}return details;}
 function show(view,lock=false){if(hideTimer!==null)host.clearTimeout(hideTimer);hideTimer=null;mount();if(active&&active!==view)active.button.setAttribute('aria-expanded','false');active=view;pinned=lock;panel.hidden=false;view.button.setAttribute('aria-expanded','true');update(view);position();}
 function render(container,unit,engine,battle,small=false){if(!container)return;let view=views.get(container);if(!view){const button=doc.createElement('button'),img=doc.createElement('img'),fallback=doc.createElement('span');button.type='button';button.className='battle-relic-icon'+(small?' battle-relic-icon--small':'');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','battleRelicTooltip');button.setAttribute('aria-expanded','false');fallback.textContent='◆';fallback.hidden=true;img.alt='';img.addEventListener('error',()=>{img.hidden=true;fallback.hidden=false;});button.append(img,fallback);container.append(button);view={button,img,fallback,unit:null,engine:null,battle:null};views.set(container,view);
   let touch=null,lastTouch=0;
   button.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touch={id:e.pointerId,x:e.clientX,y:e.clientY};},{passive:true});
   button.addEventListener('pointercancel',()=>{touch=null;},{passive:true});
   button.addEventListener('pointerup',e=>{const tap=touch;touch=null;if(e.pointerType!=='touch'||!tap||e.pointerId!==tap.id||Math.hypot(e.clientX-tap.x,e.clientY-tap.y)>10)return;e.preventDefault();lastTouch=Date.now();if(active===view&&pinned)hide();else show(view,true);});
   button.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch'&&!(active===view&&pinned))show(view);});button.addEventListener('pointerleave',()=>{if(!pinned)hideTimer=host.setTimeout(hide,140);});button.addEventListener('focus',()=>{if(!(active===view&&pinned))show(view);});button.addEventListener('blur',()=>{if(!pinned)hide();});button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(e.isTrusted&&Date.now()-lastTouch<600)return;if(active===view&&pinned)hide();else show(view,true);});
  }
  view.unit=unit;view.engine=engine;view.battle=battle;const r=unit?.relic,def=r&&host.RelicSystem.DEFINITIONS.find(d=>d.kind===r.kind);view.button.hidden=!def;
  if(!def){if(active===view)hide();return;}
  if(view.img.getAttribute('src')!==def.image){view.img.hidden=false;view.fallback.hidden=true;view.img.src=def.image;}
  view.button.setAttribute('aria-label','Inspect '+def.name+' Relic on '+(unit.display?.name||unit.card?.name||'card'));
  if(active===view)update(view);
 }
 host.RelicBattleUI=Object.freeze({render,hide});
})(window);
