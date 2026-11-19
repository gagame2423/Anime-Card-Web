/* Delegated, viewport-clamped Relic inspection. Debounced hover survives DOM refresh; no inventory writes. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.RelicSystem,instances=new WeakMap();
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const eventElement=node=>node?.nodeType===1&&typeof node.closest==='function'?node:node?.parentElement?.nodeType===1&&typeof node.parentElement.closest==='function'?node.parentElement:null;
 const pct=n=>(n*100).toLocaleString('en-US',{maximumFractionDigits:4})+'%';
 function content(roll,s){
  if(!R.validRoll(roll)){const d=R.DEFINITIONS.find(d=>d.kind===roll?.kind);if(!d)return '<p>Unknown Relic.</p>';const tier=['common','rare','legendary'].indexOf(roll?.rarity),range=d.ranges[tier<0?2:tier];return '<header><img src="'+esc(d.image)+'" alt=""><div><small>TEMPLATE PREVIEW · NOT YET ROLLED</small><h3>'+esc(d.name)+'</h3></div></header><p>Base '+esc(d.stat)+' roll: '+range.join('–')+'%.</p><p class="ac-relic-unique">Unique potential: '+esc(d.unique)+'</p><footer>Actual values are rolled independently when this Relic is obtained.</footer>';}
  roll=R.normalizeRoll(roll);
  const d=R.DEFINITIONS.find(d=>d.kind===roll.kind),req=R.requirement(roll),tier=roll.unique?'Unique Legendary':roll.rarity;
  const team=C.get(s).units.filter(u=>!u.reserve&&(u.board!=null||u.bench!=null));
  const matches=test=>team.filter(u=>test(C.card(u)));
  const portraits=rows=>'<div class="ac-relic-matches">'+(rows.length?rows.map(u=>{const c=C.card(u);return '<span data-rarity="'+esc(c.rarity)+'"><img src="'+esc(host.CardSkinSystem.art(c,u.skinId))+'" alt="'+esc(c.name)+'"><small>'+esc(c.name)+'</small><b>'+esc(c.rarity)+(u.fusionDepth?' · '+Math.min(3,u.fusionDepth+1)+'★':'')+'</b></span>';}).join(''):'<p>No matching units in team</p>')+'</div>';
  const stats=[['atk','ATK'],['hp','Max HP'],['followChance','Follow-up chance']].filter(([key])=>roll[key]>0);
  const restricted=!!(req.category||req.element),allUnits='Compatible Team Cards (All Units)';
  const requirement=req.category?'<span class="ac-relic-category">'+esc(req.category)+'</span>':req.element?'<span>Element</span> '+host.ElementSystem.inlineMarkup(req.element):'';
  const base=restricted?'<div class="ac-relic-requirement">'+requirement+'</div><h4>Base Stats · Matching '+esc(req.category||req.element)+' Team Cards</h4>'+portraits(matches(c=>R.matching(c,roll))):'<h4>'+allUnits+'</h4>'+portraits(team);
  // Unique eligibility is independent of the base stat requirement.
  const condition={
   enten_blade:['Special-attack passives',c=>R.uniqueEligible(c,roll)],
   fate_scythe:['Revival / fatal-hit survival passives',c=>R.uniqueEligible(c,roll)],
   rabadon_hat:['Clone / summon passives',c=>R.uniqueEligible(c,roll)],
   bomb:[roll.element+' cards',c=>c.element===roll.element],
   potara_earring:['Goku SSJ3 and Vegeta SSJ2',c=>['goku-ssj3','vegeta-ssj2'].includes(c.id)],
   odm:['Chained follow-up passives',c=>R.capabilities(c).follow],
   god_leaf:['Dodge bonus subject to the 80% cap',c=>!['gojo-young','gojo-revice'].includes(c.id)]
  }[roll.kind];
  const unique=roll.unique?'<p class="ac-relic-unique">✦ '+esc(R.uniqueText(roll))+'</p>'+
   (condition?'<h4>Unique Eligibility · '+esc(condition[0])+'</h4>'+portraits(matches(condition[1])):restricted?'<h4>'+allUnits+'</h4>'+portraits(team):''):'';
  return '<header><img src="'+esc(d.image)+'" alt=""><div><small>'+esc(tier)+'</small><h3>'+esc(d.name)+'</h3></div><span class="ac-relic-close-hint">Click or tap to pin</span></header><dl>'+stats.map(([key,label])=>'<div><dt>'+label+'</dt><dd>+'+pct(roll[key])+'</dd></div>').join('')+'</dl>'+base+unique+'<footer>'+(d.kind==='enten_blade'?'Follow-up chance also requires a compatible follow-up passive. ':'')+'Previews use your board and bench, including while scouting.</footer>';
 }

 function mount(root,getState,getCombat){
  if(instances.has(root))return;const node=host.document.createElement('aside');node.className='ac-rich-relic';node.hidden=true;node.setAttribute('role','tooltip');node.id='acRichRelic';host.document.body.append(node);
  let target=null,targetId=null,key='',pinned=false,press=null,hideTimer=0,pointer=null,dragging=false,suppressUntil=0;
  function find(id){const s=getState();if(!s)return null;for(const p of s.players){const r=[...p.relics,...p.loot,...(p.pendingStreakRelics||[]),...p.units.map(u=>u.relic)].find(r=>r?.uid===id);if(r)return r.roll;}const draft=s.carousel.find(u=>u.relic?.uid===id);if(draft)return draft.relic.roll;const fight=getCombat?.();const u=[...(fight?.battle.playerTeam||[]),...(fight?.battle.enemyTeam||[])].find(u=>u.grid?.uid===id);return u?.relic||null;}
  function clamp(){const w=host.innerWidth,h=host.innerHeight,b=target?.getBoundingClientRect();if(!b)return;node.style.maxHeight=Math.max(80,h-16)+'px';const box=node.getBoundingClientRect(),x=Math.max(8,Math.min(w-box.width-8,b.right+8+box.width<=w-8?b.right+8:b.left-box.width-8)),y=Math.min(h-box.height-8,Math.max(8,b.top));node.style.left=Math.max(8,x)+'px';node.style.top=Math.max(8,y)+'px';}
  function cancelHide(){host.clearTimeout(hideTimer);hideTimer=0;}
  function hide(){cancelHide();targetId=null;target?.removeAttribute('aria-describedby');target=null;key='';pinned=false;node.classList.remove('is-pinned');node.hidden=true;}
  function show(t,pin=false){t=eventElement(t);if(!t||dragging||host.performance.now()<suppressUntil||t.closest('.ac-drag-ghost'))return;const s=getState(),roll=find(t.dataset.acRelicInfo);if(!s||!roll||!R.validRoll(roll))return;cancelHide();target?.removeAttribute('aria-describedby');target=t;targetId=t.dataset.acRelicInfo;pinned=pin;node.classList.toggle('is-pinned',pin);target.setAttribute('aria-describedby',node.id);const next=JSON.stringify([roll,C.get(s).units.filter(u=>!u.reserve).map(u=>[u.uid,u.cardId,u.skinId,u.fusionDepth])]);if(key!==next){key=next;node.innerHTML=content(roll,s);node.dataset.tier=roll.unique?'unique':roll.rarity;}node.querySelector('.ac-relic-close-hint').textContent=pin?'Esc or tap outside':'Click or tap to pin';node.hidden=false;clamp();}
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
