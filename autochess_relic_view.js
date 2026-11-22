/* Delegated, viewport-clamped Relic inspection. Debounced hover survives DOM refresh; no inventory writes. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.RelicSystem,instances=new WeakMap();
 const eventElement=node=>node?.nodeType===1&&typeof node.closest==='function'?node:node?.parentElement?.nodeType===1&&typeof node.parentElement.closest==='function'?node.parentElement:null;
 function teamCards(s,fight){
  const combat=new Map([...(fight?.battle.playerTeam||[]),...(fight?.battle.enemyTeam||[])].map(unit=>[unit.grid?.uid,unit]));
  return (s?C.get(s).units:[]).filter(u=>!u.reserve&&(u.board!=null||u.bench!=null)).map(u=>{
   const card=C.card(u),unit=u.board!=null?combat.get(u.uid):null;
   return card&&{card,unit,image:host.CardSkinSystem.art(card,u.skinId),stars:u.fusionDepth?Math.min(3,u.fusionDepth+1):null};
  }).filter(Boolean);
 }
 function content(roll,s,fight,team=teamCards(s,fight)){
  return host.RelicInspection.markup(roll,{team:true,cards:team,empty:'No matching units in team'});
 }

 function mount(root,getState,getCombat){
  if(instances.has(root))return;const node=host.document.createElement('aside');node.className='ac-rich-relic';node.hidden=true;node.setAttribute('role','tooltip');node.id='acRichRelic';host.document.body.append(node);
  let target=null,targetId=null,key='',pinned=false,press=null,hideTimer=0,pointer=null,dragging=false,suppressUntil=0;
  function find(id){const s=getState();if(!s)return null;for(const p of s.players){const r=[...p.relics,...p.loot,...(p.pendingStreakRelics||[]),...p.units.map(u=>u.relic)].find(r=>r?.uid===id);if(r)return r.roll;}const draft=s.carousel.find(u=>u.relic?.uid===id);if(draft)return draft.relic.roll;const fight=getCombat?.();const u=[...(fight?.battle.playerTeam||[]),...(fight?.battle.enemyTeam||[])].find(u=>u.grid?.uid===id);return u?.relic||null;}
  function clamp(){const w=host.innerWidth,h=host.innerHeight,b=target?.getBoundingClientRect();if(!b)return;node.style.maxHeight=Math.max(80,h-16)+'px';const box=node.getBoundingClientRect(),x=Math.max(8,Math.min(w-box.width-8,b.right+8+box.width<=w-8?b.right+8:b.left-box.width-8)),y=Math.min(h-box.height-8,Math.max(8,b.top));node.style.left=Math.max(8,x)+'px';node.style.top=Math.max(8,y)+'px';}
  function cancelHide(){host.clearTimeout(hideTimer);hideTimer=0;}
  function hide(){cancelHide();targetId=null;target?.removeAttribute('aria-describedby');target=null;key='';pinned=false;node.classList.remove('is-pinned');node.hidden=true;}
  function show(t,pin=false){t=eventElement(t);if(!t||dragging||host.performance.now()<suppressUntil||t.closest('.ac-drag-ghost'))return;const s=getState(),roll=find(t.dataset.acRelicInfo);if(!s||!roll||!R.validRoll(roll))return;cancelHide();target?.removeAttribute('aria-describedby');target=t;targetId=t.dataset.acRelicInfo;pinned=pin;node.classList.toggle('is-pinned',pin);target.setAttribute('aria-describedby',node.id);const team=teamCards(s,getCombat?.()),next=JSON.stringify([roll,team.map(x=>[x.card.id,x.image,x.stars,x.unit?R.capabilities(x.unit):null,x.unit?.card?.element])]);if(key!==next){key=next;node.innerHTML=content(roll,s,null,team);node.dataset.tier=roll.unique?'unique':roll.rarity;}node.querySelector('.ac-relic-close-hint').textContent=pin?'Esc or tap outside':'Click or tap to pin';node.hidden=false;clamp();}
  function locate(element){element=eventElement(element);if(!element||element.closest('.ac-drag-ghost'))return null;return element.closest('[data-ac-relic]')?.querySelector('[data-ac-relic-info]')||element.closest('[data-ac-relic-info]')||element.closest('.ac-equipped,.ac-token-relic,.ac-draft-relic')?.querySelector('[data-ac-relic-info]')||null;}
  function overPointer(){return pointer&&Number.isFinite(pointer.x)&&Number.isFinite(pointer.y)?locate(host.document.elementFromPoint(pointer.x,pointer.y)):null;}
  function scheduleHide(){if(pinned||hideTimer)return;hideTimer=host.setTimeout(()=>{hideTimer=0;const current=overPointer();if(current&&current.dataset.acRelicInfo===targetId)show(current,false);else hide();},100);}
  root.addEventListener('pointerdown',e=>{const t=locate(e.target);if(t&&!t.closest('[data-ac-relic]')){e.stopImmediatePropagation();e.preventDefault();show(t,true);}if(t&&e.button===0)press={pointerId:e.pointerId,id:t.dataset.acRelicInfo,x:e.clientX,y:e.clientY,moved:false};},true);
  root.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){pointer={x:e.clientX,y:e.clientY};if(targetId&&locate(e.target)?.dataset.acRelicInfo!==targetId)scheduleHide();}if(press?.pointerId===e.pointerId&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>7)press.moved=true;},true);
  root.addEventListener('pointerup',e=>{if(press?.pointerId!==e.pointerId)return;const tap=press;press=null;if(dragging)return;if(tap&&!tap.moved)host.queueMicrotask(()=>{const t=[...root.querySelectorAll('[data-ac-relic-info]')].find(n=>n.dataset.acRelicInfo===tap.id);if(t)show(t,true);});},true);
  root.addEventListener('pointercancel',e=>{if(press?.pointerId===e.pointerId)press=null;},true);
  root.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY};const t=locate(e.target);if(t)show(t,pinned&&targetId===t.dataset.acRelicInfo);});
  root.addEventListener('pointerout',e=>{if(e.pointerType!=='touch')pointer={x:e.clientX,y:e.clientY};if(pinned)return;const next=locate(e.relatedTarget);if(next&&next.dataset.acRelicInfo===targetId){show(next,false);return;}if(locate(e.target))scheduleHide();});
  root.addEventListener('pointerleave',()=>{pointer=null;if(!pinned)scheduleHide();});
  root.addEventListener('focusin',e=>{const t=locate(e.target);if(t)show(t);});
  root.addEventListener('focusout',()=>{if(!pinned)scheduleHide();});
  root.addEventListener('click',e=>{const t=locate(e.target);if(t){show(t,true);if(!t.closest('[data-ac-relic]')){e.stopImmediatePropagation();e.preventDefault();}}},true);
  root.addEventListener('keydown',e=>{const t=eventElement(e.target)?.closest('[data-ac-relic-info]');if(t&&['Enter',' '].includes(e.key)){e.stopImmediatePropagation();e.preventDefault();show(t,true);}} ,true);
  root.addEventListener('pointermove',e=>{if(e.buttons&&Math.abs(e.movementX)+Math.abs(e.movementY)>4)hide();});
  
  host.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!node.hidden){hide();e.stopImmediatePropagation();}},true);
  host.document.addEventListener('pointerdown',e=>{if(pinned&&!node.contains(eventElement(e.target))&&!locate(e.target))hide();});
  host.addEventListener('resize',hide);
  function placeTooltip(){const doc=host.document,fullscreen=doc.fullscreenElement||doc.webkitFullscreenElement;const parent=fullscreen?.contains(root)?fullscreen:doc.body;if(node.parentNode!==parent){hide();parent.append(node);}}
  host.document.addEventListener('fullscreenchange',placeTooltip);
  host.document.addEventListener('webkitfullscreenchange',placeTooltip);
  instances.set(root,{hide,setDragging(value){if(dragging===value)return;if(dragging&&!value)suppressUntil=host.performance.now()+300;dragging=value;press=null;hide();},refresh(){if(!targetId)return;const current=pinned?[...root.querySelectorAll('[data-ac-relic-info]')].find(n=>n.dataset.acRelicInfo===targetId):overPointer();if(current&&current.dataset.acRelicInfo===targetId&&find(targetId))show(current,pinned);else if(pinned)hide();else scheduleHide();}});
 }
 host.AutoChessRelicView=Object.freeze({content,mount,hide:root=>instances.get(root)?.hide(),setDragging:(root,value)=>instances.get(root)?.setDragging(!!value),refresh:root=>instances.get(root)?.refresh()});
})(window);
