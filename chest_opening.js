/* Treasure Chest presentation and opening gate. Preview is presentation-only;
   a real opening must commit its loot and chest debit before any animation. */
(function(host){
 'use strict';
 const TREASURE_CHEST_UNLOCKED = false;
 const doc=host.document, root=doc.getElementById('treasureChestModal');
 const GROUP='treasure-chest', DURATION=Object.freeze({summon:1100,charge:1550,burst:700});
 const STAGES=Object.freeze(['summon','charge','burst','reveal']);
 const COPY=Object.freeze({
  summon:['Summoning the treasure','Ancient seals rise from the depths.'],
  charge:['Charging the vault','Golden energy surges through the coin slit.'],
  burst:['The seal breaks','The hidden riches emerge.'],
  reveal:['Treasure revealed','The voyage was worth the hunt.']
 });
 const PREVIEW_LOOT=Object.freeze([
  Object.freeze({kind:'card',title:'Card Slot',subtitle:'Mystery card · preview'}),
  Object.freeze({kind:'relic',title:'Relic Slot',subtitle:'Mystery relic · preview'}),
  Object.freeze({kind:'item',title:'Material Slot',subtitle:'Mystery item · preview'}),
  Object.freeze({kind:'mystery',title:'Treasure Slot',subtitle:'Hidden riches · preview'})
 ]);
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmt=n=>Number(n||0).toLocaleString('en-US');
 const item=()=>host.InventorySystem.TREASURE_CHEST;
 const owned=()=>host.InventorySystem.quantity(item().id);
 const reduced=()=>host.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
 const LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/></svg>';
 const icons={
  card:'<rect x="6" y="3" width="12" height="18" rx="2"/><path d="m12 7 3 5-3 5-3-5Z"/>',
  relic:'<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 5 5 5-5 5-5-5Z"/>',
  item:'<path d="m12 3 9 5-9 5-9-5Zm-9 5v8l9 5 9-5V8m-9 5v8"/>',
  mystery:'<path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"/><circle cx="12" cy="12" r="4"/>'
 };
 const symbol=kind=>'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round" aria-hidden="true">'+(icons[kind]||icons.item)+'</svg>';
 let bridge={},ui=null,timer=null,sequence=0;
 // FUTURE LOOT TABLE: return [{id:'registered_item_id', quantity:1}, ...].
 // Empty means unavailable. The opening path validates and commits all item
 // grants with the debit in one inventory transaction. Card-slot presentation
 // is already supported; actual card drops can extend the future reward plan.
 function openTreasureChestRewards(){return [];}
 let rollRewards=openTreasureChestRewards;

 function audio(key,file=false){
  if(file)host.GameAudio?.playFile(key,GROUP,{channel:'action',priority:5,gap:150,limit:1,fileFallback:'fuse'});
  else host.GameAudio?.play(key,GROUP);
 }
 function clearTimer(){if(timer!==null)host.clearTimeout(timer);timer=null;}
 function chestArt(css=''){
  return `<div class="tc-art ${css}"><img src="${esc(item().image)}" alt="Treasure Chest" width="500" height="500" draggable="false"><span class="tc-art-fallback" hidden>✦</span></div>`;
 }
 function header(kicker,title,tag){
  return `<header class="tc-header"><div class="tc-heading"><span class="tc-kicker">${kicker}</span><h2 id="treasureChestTitle">${title}</h2></div><span class="tc-header-tag">${tag}</span><button type="button" class="tc-close" data-tc-action="close" aria-label="Close Treasure Chest">×</button></header>`;
 }
 function openRoot(){
  if(!root)return false;
  if(root.open)return !!ui;
  const previous=doc.activeElement,inert=root.inert;
  root.inert=false;
  ui={previous,inert,stage:'inspect',preview:false,rewards:[],token:++sequence};
  try{root.showModal();return true;}catch(_){root.inert=inert;ui=null;return false;}
 }
 function finishClose(){
  if(!ui)return;
  const previous=ui.previous,inert=ui.inert;
  clearTimer();sequence++;ui=null;host.GameAudio?.stop(GROUP);
  root.replaceChildren();root.removeAttribute('data-stage');root.inert=inert;
  if(previous?.isConnected&&!previous.inert)previous.focus({preventScroll:true});
 }
 function close(){
  if(!root?.open)return false;
  root.close();finishClose();return true;
 }
 function inspect(){
  if(!openRoot()||ui.stage!=='inspect')return false;
  const count=owned(),available=TREASURE_CHEST_UNLOCKED;
  root.dataset.stage='inspect';ui.preview=false;
  root.innerHTML=`<article class="tc-shell">${header('SAILING SEA / CAPTAIN’S TREASURE','Treasure Chest',available?'TREASURE':'SEALED')}
   <div class="tc-inspect-layout"><div class="tc-inspect-showcase" aria-label="Treasure Chest artwork"><span class="tc-compass" aria-hidden="true"></span><div class="tc-inspect-aura" aria-hidden="true"></div>${chestArt()}<span class="tc-showcase-label">PRIZE OF THE GRAND LINE</span></div>
    <section class="tc-inspect-details"><span class="tc-tier"><i>◆</i> LEGENDARY TREASURE</span><h3>Riches await within</h3><p>${esc(item().description)}</p>
    <div class="tc-owned"><div><small>OWNED IN STORAGE</small><strong data-tc-owned>${fmt(count)}</strong></div>${chestArt('tc-owned-art')}</div>
    <div class="tc-lock-note">${available?symbol('item'):LOCK}<div><b>${available?'Ready to open':'The treasure vault is sealed'}</b><p>${available?'Open a chest to discover its contents.':'Collect more chests by completing Sailing Sea voyages. Opening will become available in an upcoming update.'}</p></div></div>
    <p class="tc-status" role="status"></p><button type="button" class="tc-primary tc-unlock-button" data-tc-action="open" ${!available||!count?'disabled':''}>${available?'Open Treasure Chest':'Unlocks in Upcoming Update'}</button>
   </section></div><footer class="tc-footer"><span>SAILING SEA · PLACEMENT REWARD</span><button type="button" data-tc-action="close">Back to Storage</button></footer></article>`;
  root.querySelector('.tc-close')?.focus({preventScroll:true});audio('modal_open');return true;
 }
 function runes(){
  const ticks=Array.from({length:24},(_,i)=>`<path d="M150 23v${i%4===0?13:6}" transform="rotate(${i*15} 150 150)"/>`).join('');
  return `<div class="tc-rune-plane" aria-hidden="true"><svg class="tc-rune-circle" viewBox="0 0 300 300" fill="none"><circle cx="150" cy="150" r="139"/><circle cx="150" cy="150" r="126" stroke-dasharray="2 5"/><circle cx="150" cy="150" r="103"/><path d="M150 37 248 94v112l-98 57-98-57V94Z M150 62l76 44v88l-76 44-76-44v-88Z"/><path d="M150 47v206M61 98l178 104m0-104L61 202" stroke-dasharray="4 9"/><g>${ticks}</g><path d="m150 10 5 7-5 7-5-7ZM150 276l5 7-5 7-5-7ZM10 150l7-5 7 5-7 5ZM276 150l7-5 7 5-7 5Z"/></svg></div>`;
 }
 function beamMarkup(){
  return Array.from({length:7},(_,i)=>`<i class="tc-light-beam" style="--beam-x:${8+i*14}%;--beam-tilt:${(i-3)*14}deg;--beam-delay:${i*38}ms"></i>`).join('');
 }
 function sparks(){
  return Array.from({length:32},(_,i)=>{
   const angle=i*2.39996323,dist=.40+(i%7)*.10,dx=Math.cos(angle)*dist,dy=Math.sin(angle)*dist;
   return `<i class="tc-spark ${i%4===0?'is-cyan':''}" style="--sx:${dx.toFixed(3)};--sy:${dy.toFixed(3)};--spark-size:${4+(i%3)*3}px;--spark-delay:${(i%6)*24}ms"></i>`;
  }).join('');
 }
 function rewardMarkup(rows){
  return rows.map((row,i)=>`<article class="tc-loot-card" data-kind="${esc(row.kind)}" style="--slot:${i};--fan:${(i-(rows.length-1)/2)*36}px;--tilt:${(i-(rows.length-1)/2)*8}deg"><span class="tc-loot-index">SLOT ${String(i+1).padStart(2,'0')}</span><div class="tc-loot-icon">${row.image?'<img src="'+esc(row.image)+'" alt="">':symbol(row.kind)}</div><strong>${esc(row.title)}</strong><small>${esc(row.subtitle||'')}</small>${row.quantity?'<b class="tc-loot-amount">×'+fmt(row.quantity)+'</b>':''}</article>`).join('');
 }
 function sequenceMarkup(preview,rows){
  return `<article class="tc-shell tc-opening-shell">${header(preview?'SAILING SEA / ANIMATION PREVIEW':'SAILING SEA / TREASURE VAULT','Treasure Awakening',preview?'PREVIEW':'OPENING')}
   <div class="tc-stage" aria-hidden="true">
    <div class="tc-stage-grid"></div><div class="tc-stage-halo"></div>${runes()}
    <div class="tc-chest-rise"><div class="tc-chest-float"><div class="tc-chest-motion">${chestArt('tc-stage-art')}
      <div class="tc-coin-slit"><i class="tc-slit-glow"></i>${beamMarkup()}</div>
     </div></div></div>
    <div class="tc-burst-light"></div><i class="tc-shockwave"></i><i class="tc-shockwave second"></i><div class="tc-spark-field">${sparks()}</div>
   </div>
   <section class="tc-rewards" hidden aria-label="Revealed reward slots"><div class="tc-reveal-inscription">✦ ${preview?'LOOT PREVIEW · REWARDS NOT FINAL':'LOOT SECURED'} ✦</div><div class="tc-loot-grid" style="--loot-count:${Math.min(4,rows.length)}">${rewardMarkup(rows)}</div></section>
   <div class="tc-stage-caption" role="status" aria-live="polite"><h3 data-tc-stage-title></h3><p data-tc-stage-description></p></div>
   <ol class="tc-steps" aria-label="Opening progress">${STAGES.map((stage,i)=>`<li data-tc-step="${stage}"><i>${i+1}</i><span>${['Summon','Charge','Burst','Reveal'][i]}</span></li>`).join('')}</ol>
   <footer class="tc-footer tc-sequence-footer"><span>${preview?'PREVIEW ONLY · NO CHESTS CONSUMED':'REWARD SAVED TO STORAGE'}</span><div><button type="button" data-tc-action="skip">Reveal Now</button><button type="button" data-tc-action="replay" hidden>Replay Preview</button><button type="button" class="tc-primary" data-tc-action="continue" hidden>Continue</button></div></footer>
  </article>`;
 }
 function transition(stage,token){
  if(!ui||ui.token!==token||!root.open)return;
  clearTimer();ui.stage=stage;root.dataset.stage=stage;
  const title=root.querySelector('[data-tc-stage-title]'),desc=root.querySelector('[data-tc-stage-description]');
  title.textContent=stage==='reveal'&&ui.preview?'Preview complete':COPY[stage][0];
  desc.textContent=stage==='reveal'&&ui.preview?'These are demonstration slots. No loot was granted and no chest was used.':COPY[stage][1];
  const index=STAGES.indexOf(stage);
  for(const node of root.querySelectorAll('[data-tc-step]')){
   const n=STAGES.indexOf(node.dataset.tcStep);node.classList.toggle('is-complete',n<index);node.classList.toggle('is-current',n===index);
   if(n===index)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
  }
  if(stage==='reveal'){
   root.querySelector('.tc-rewards').hidden=false;
   root.querySelector('[data-tc-action="skip"]').hidden=true;
   root.querySelector('[data-tc-action="replay"]').hidden=!ui.preview;
   const button=root.querySelector('[data-tc-action="continue"]');button.hidden=false;button.focus({preventScroll:true});
   audio('card_equip');return;
  }
  if(stage==='summon')audio('hextech_open',true);
  else if(stage==='charge')audio('skill_cast');
  else if(stage==='burst')audio('shield_break');
  const delay=reduced()?90:DURATION[stage];
  timer=host.setTimeout(()=>transition(STAGES[index+1],token),delay);
 }
 function startSequence(preview,rows){
  if(!openRoot())return false;
  clearTimer();host.GameAudio?.stop(GROUP);
  ui.preview=preview;ui.rewards=rows;ui.token=++sequence;ui.stage='summon';
  root.dataset.stage='summon';root.innerHTML=sequenceMarkup(preview,rows);
  transition('summon',ui.token);
  root.querySelector('[data-tc-action="skip"]')?.focus({preventScroll:true});return true;
 }
 function preview(){
  // Never replace a paid reveal. An inspection or another preview is safe.
  if(ui&&ui.stage!=='inspect'&&!ui.preview)return false;
  return startSequence(true,PREVIEW_LOOT);
 }
 function status(message){const n=root?.querySelector('.tc-status');if(n)n.textContent=message;}
 function beginReal(){
  if(!TREASURE_CHEST_UNLOCKED||!ui||ui.stage!=='inspect')return false;
  if(bridge.canOpen?.()===false){status('Finish the current activity before opening a chest.');return false;}
  if(owned()<1){status('You need a Treasure Chest in Storage.');return false;}
  const inventory=host.InventorySystem;
  let rows;
  try{rows=rollRewards();}catch(_){status('Loot table unavailable. No chest was used.');return false;}
  if(!Array.isArray(rows)||!rows.length||rows.length>12){status('Loot table is not ready. No chest was used.');return false;}
  const rewards=[];
  for(const row of rows){
   const entry=inventory.getItem(row?.id);
   if(!entry||!Number.isSafeInteger(row.quantity)||row.quantity<1||entry.type==='relic'||entry.type==='portal'){status('Loot table is invalid. No chest was used.');return false;}
   rewards.push({kind:'item',title:entry.name,subtitle:entry.tier.toUpperCase(),image:entry.image,quantity:row.quantity});
  }
  // Atomic stock + item grants; future cards/relic instances require their
  // own account reward transaction when the actual loot table is specified.
  if(!inventory.transactItems(draft=>{
   const stack=draft[item().id];if(!stack||stack.quantity<1)return false;stack.quantity--;
   for(const row of rows){
    const entry=draft[row.id];if(!entry||entry.quantity>Number.MAX_SAFE_INTEGER-row.quantity)return false;entry.quantity+=row.quantity;
   }
   return true;
  })){status('Unable to save the opening. No chest was used.');return false;}
  startSequence(false,rewards);bridge.onChange?.();return true;
 }
 if(root){
  root.addEventListener('click',event=>{
   const action=event.target?.closest?.('[data-tc-action]')?.dataset.tcAction;
   if(!ui||!action)return;
   if(action==='close'||action==='continue')close();
   else if(action==='open')beginReal();
   else if(action==='replay'&&ui.preview&&ui.stage==='reveal')preview();
   else if(action==='skip'&&ui.stage!=='inspect'&&ui.stage!=='reveal'){host.GameAudio?.stop(GROUP);transition('reveal',ui.token);}
  });
  root.addEventListener('error',event=>{
   if(event.target?.tagName!=='IMG')return;
   event.target.hidden=true;const fallback=event.target.parentElement?.querySelector('.tc-art-fallback');if(fallback)fallback.hidden=false;
  },true);
  root.addEventListener('cancel',event=>{event.preventDefault();close();});
  root.addEventListener('close',()=>{if(!root.open)finishClose();});
  host.addEventListener('keydown',event=>{
   if(!root.open||!ui)return;
   if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
   else if(!['Tab','Enter',' '].includes(event.key))event.stopPropagation();
  },true);
 }
 host.TreasureChestOpening=Object.freeze({open:inspect,close,preview,configure:options=>{bridge=options||{};},configureRewards:fn=>{if(typeof fn==='function')rollRewards=fn;},get unlocked(){return TREASURE_CHEST_UNLOCKED;},get active(){return !!ui&&root?.open;},get stage(){return ui?.stage||null;}});
 host.previewTreasureChestAnimation=preview;
})(window);
