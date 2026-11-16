/* Delegated, viewport-clamped Relic inspection. Debounced hover survives DOM refresh; no inventory writes. */
(function(host){
 'use strict';
 const C=host.AutoChessSystem,R=host.RelicSystem,instances=new WeakMap();
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const pct=n=>(n*100).toLocaleString('en-US',{maximumFractionDigits:4})+'%';
 function content(roll,s){
  const d=R.DEFINITIONS.find(d=>d.kind===roll.kind),tier=roll.unique?'Unique Legendary':roll.rarity,team=C.get(s).units.filter(u=>u.board!==null||u.bench!==null),matching=team.filter(u=>d.category?C.card(u).category.includes(d.category):C.card(u).element===roll.element),stats=[['atk','ATK'],['hp','Max HP'],['dodge','Dodge'],['critChance','Critical chance'],['critDamage','Critical damage'],['expBonus','EXP bonus'],['followChance','Follow-up chance'],['specialBonus','Special attack damage'],['odmChainBonus','Secondary follow-up chance'],['firstAttackBonus','First attack ATK']].filter(([key])=>roll[key]>0);
  return '<header><img src="'+esc(d.image)+'" alt=""><div><small>'+esc(tier)+'</small><h3>'+esc(d.name)+'</h3></div><span class="ac-relic-close-hint">ESC / tap outside</span></header><dl>'+stats.map(([key,label])=>'<div><dt>'+label+'</dt><dd>+'+pct(roll[key])+'</dd></div>').join('')+'</dl><p class="ac-relic-full">'+esc(R.describe(roll))+'</p>'+(roll.unique?'<p class="ac-relic-unique">✦ '+esc(d.unique)+'</p>':'')+'<div class="ac-relic-requirement">'+(d.category?'<span class="ac-relic-category">'+esc(d.category)+'</span>':'<span>Hệ</span> '+host.ElementSystem.inlineMarkup(roll.element))+'</div><h4>'+(d.category?'Thẻ thuộc '+esc(d.category)+' trong team':'Matching '+esc(roll.element)+' team cards')+'</h4><div class="ac-relic-matches">'+(matching.length?matching.map(u=>{const c=C.card(u);return '<span data-rarity="'+esc(c.rarity)+'"><img src="'+esc(c.image)+'" alt="'+esc(c.name)+'"><small>'+esc(c.name)+'</small><b>'+esc(c.rarity)+'</b></span>';}).join(''):'<p>No matching units in team</p>')+'</div><footer>Base stats require the shown Category/Element. '+(d.kind==='enten_blade'?'Follow-up chance also requires a compatible follow-up passive. ':'')+'Matching previews use your board + bench, including while scouting. Solo combat fusion changes the future roster only.</footer>';
 }
 function mount(root,getState,getCombat){
  if(instances.has(root))return;const node=host.document.createElement('aside');node.className='ac-rich-relic';node.hidden=true;node.setAttribute('role','tooltip');node.id='acRichRelic';host.document.body.append(node);
  let target=null,targetId=null,key='',pinned=false,touch=null,hideTimer=0,pointer=null;
  function find(id){const s=getState();if(!s)return null;for(const p of s.players){const r=[...p.relics,...p.loot,...(p.pendingStreakRelics||[]),...p.units.map(u=>u.relic)].find(r=>r?.uid===id);if(r)return r.roll;}const draft=s.carousel.find(u=>u.relic?.uid===id);if(draft)return draft.relic.roll;const fight=getCombat?.();const u=[...(fight?.battle.playerTeam||[]),...(fight?.battle.enemyTeam||[])].find(u=>u.grid?.uid===id);return u?.relic||null;}
  function clamp(){const w=host.innerWidth,h=host.innerHeight,b=target?.getBoundingClientRect();if(!b)return;node.style.maxHeight=Math.max(80,h-16)+'px';const box=node.getBoundingClientRect(),x=Math.max(8,Math.min(w-box.width-8,b.right+8+box.width<=w-8?b.right+8:b.left-box.width-8)),y=Math.min(h-box.height-8,Math.max(8,b.top));node.style.left=Math.max(8,x)+'px';node.style.top=Math.max(8,y)+'px';}
  function cancelHide(){host.clearTimeout(hideTimer);hideTimer=0;}
  function hide(){cancelHide();targetId=null;target?.removeAttribute('aria-describedby');target=null;key='';pinned=false;node.hidden=true;}
  function show(t,pin=false){const s=getState(),roll=find(t.dataset.acRelicInfo);if(!s||!roll||!R.validRoll(roll))return;cancelHide();target?.removeAttribute('aria-describedby');target=t;targetId=t.dataset.acRelicInfo;pinned=pin;target.setAttribute('aria-describedby',node.id);const next=JSON.stringify([roll,C.get(s).units]);if(key!==next){key=next;node.innerHTML=content(roll,s);node.dataset.tier=roll.unique?'unique':roll.rarity;}node.hidden=false;clamp();}
  function locate(element){if(!element?.closest)return null;return element.closest('[data-ac-relic]')?.querySelector('[data-ac-relic-info]')||element.closest('[data-ac-relic-info]')||element.closest('.ac-equipped,.ac-token-relic,.ac-draft-relic')?.querySelector('[data-ac-relic-info]')||null;}
  function overPointer(){return pointer?locate(host.document.elementFromPoint(pointer.x,pointer.y)):null;}
  function scheduleHide(){if(pinned||hideTimer)return;hideTimer=host.setTimeout(()=>{hideTimer=0;const current=overPointer();if(current&&current.dataset.acRelicInfo===targetId)show(current,false);else hide();},100);}
  root.addEventListener('pointerdown',e=>{const t=locate(e.target);if(t&&!t.closest('[data-ac-relic]')){e.stopImmediatePropagation();e.preventDefault();show(t,true);}if(t&&e.pointerType==='touch')touch={id:t.dataset.acRelicInfo,x:e.clientX,y:e.clientY,moved:false};},true);
  root.addEventListener('pointermove',e=>{if(e.pointerType!=='touch'){pointer={x:e.clientX,y:e.clientY};if(targetId&&locate(e.target)?.dataset.acRelicInfo!==targetId)scheduleHide();}if(touch&&Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>7)touch.moved=true;},true);
  root.addEventListener('pointerup',()=>{const tap=touch;touch=null;if(tap&&!tap.moved)host.queueMicrotask(()=>{const t=[...root.querySelectorAll('[data-ac-relic-info]')].find(n=>n.dataset.acRelicInfo===tap.id);if(t)show(t,true);});},true);
  root.addEventListener('pointercancel',()=>{touch=null;},true);
  root.addEventListener('pointerover',e=>{if(e.pointerType==='touch')return;pointer={x:e.clientX,y:e.clientY};const t=locate(e.target);if(t)show(t,pinned&&targetId===t.dataset.acRelicInfo);});
  root.addEventListener('pointerout',e=>{if(e.pointerType!=='touch')pointer={x:e.clientX,y:e.clientY};if(pinned)return;const next=locate(e.relatedTarget);if(next&&next.dataset.acRelicInfo===targetId){show(next,false);return;}if(locate(e.target))scheduleHide();});
  root.addEventListener('pointerleave',()=>{pointer=null;if(!pinned)scheduleHide();});
  root.addEventListener('focusin',e=>{const t=locate(e.target);if(t)show(t);});
  root.addEventListener('focusout',()=>{if(!pinned)scheduleHide();});
  root.addEventListener('click',e=>{const t=locate(e.target);if(t){show(t,true);if(!t.closest('[data-ac-relic]')){e.stopImmediatePropagation();e.preventDefault();}}},true);
  root.addEventListener('keydown',e=>{const t=e.target.closest('[data-ac-relic-info]');if(t&&['Enter',' '].includes(e.key)){e.stopImmediatePropagation();e.preventDefault();show(t,true);}} ,true);
  root.addEventListener('pointermove',e=>{if(e.buttons&&Math.abs(e.movementX)+Math.abs(e.movementY)>4)hide();});
  
  host.document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!node.hidden){hide();e.stopImmediatePropagation();}},true);
  host.document.addEventListener('pointerdown',e=>{if(pinned&&!node.contains(e.target)&&!locate(e.target))hide();});
  host.addEventListener('resize',hide);
  instances.set(root,{hide,refresh(){if(!targetId)return;const current=pinned?[...root.querySelectorAll('[data-ac-relic-info]')].find(n=>n.dataset.acRelicInfo===targetId):overPointer();if(current&&current.dataset.acRelicInfo===targetId&&find(targetId))show(current,pinned);else if(pinned)hide();else scheduleHide();}});
 }
 host.AutoChessRelicView=Object.freeze({content,mount,hide:root=>instances.get(root)?.hide(),refresh:root=>instances.get(root)?.refresh()});
})(window);
