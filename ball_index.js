/* Owned-card catalogue: one tile per character, one exact owned variant/copy per slot. */
(function(host){
 'use strict';
 const S=host.SpatialCombat;
 const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 const fmt=n=>Math.round(Number(n)||0).toLocaleString('en-US');
 const compact=n=>{const value=Number(n)||0,abs=Math.abs(value);if(abs<1000)return fmt(value);for(const [scale,suffix] of [[1e15,'Q'],[1e12,'T'],[1e9,'B'],[1e6,'M'],[1e3,'K']])if(abs>=scale)return +(value/scale).toFixed(abs/scale>=100?0:1)+suffix;return fmt(value);};
 const rarityColors={Common:'#a7b6c9',Rare:'#51a9ff',Epic:'#bd8cff',Legendary:'#f8ca62',Mythic:'#ef759b',Secret:'#72f2db'};
 const play=cue=>host.BallAudio?.play(cue);
 function colors(card,mutations=[]){const base=rarityColors[card?.rarity]||rarityColors.Common,list=mutations.filter(Boolean).map(m=>host.MutationSystem.accent?.(m)||m.color||base);return [list[0]||base,list[1]||list[0]||base];}
 function frame(row){const colorsOf=colors(row.card,row.mutations||[]);return '--ball-rarity:'+esc(rarityColors[row.card.rarity]||rarityColors.Common)+';--ball-frame-a:'+esc(colorsOf[0])+';--ball-frame-b:'+esc(colorsOf[1]);}
 function img(card,extra=''){return '<img '+extra+' src="'+esc(host.CardSkinSystem.art(card))+'" alt="" draggable="false">';}
 function relic(slot){const roll=slot&&host.RelicSystem.snapshotFor(slot.cardId,slot.variantKey,slot.copy);return roll?{roll,def:host.RelicSystem.DEFINITIONS.find(d=>d.kind===roll.kind)}:null;}
 const variantName=row=>row.mutations.map(m=>m.name).join(' + ')||'Normal';
 // The bridge enumerates owned variant records, not unique cards. Repeated reads
 // of the same canonical variant must not inflate the number of selectable copies.
 function uniqueRows(rows){
  const variants=new Map();
  for(const row of rows||[]){
   if(!row?.card?.id||typeof row.variantKey!=='string'||!Number.isSafeInteger(row.count)||row.count<=0)continue;
   const existing=variants.get(row.variantKey);
   if(!existing||existing.card.id===row.card.id&&row.count>existing.count)variants.set(row.variantKey,{...row,mutations:Array.isArray(row.mutations)?row.mutations.filter(Boolean):[]});
  }
  return [...variants.values()];
 }
 function groupRows(rows){
  const groups=new Map();
  for(const row of uniqueRows(rows)){
   let group=groups.get(row.card.id);
   if(!group){group={card:row.card,level:row.level,total:0,variants:[]};groups.set(row.card.id,group);}
   group.variants.push(row);group.total=Math.min(Number.MAX_SAFE_INTEGER,group.total+row.count);
  }
  for(const group of groups.values())group.variants.sort((a,b)=>a.mutations.length-b.mutations.length||variantName(a).localeCompare(variantName(b))||a.variantKey.localeCompare(b.variantKey));
  return [...groups.values()].sort((a,b)=>a.card.name.localeCompare(b.card.name)||String(a.card.id).localeCompare(String(b.card.id)));
 }
 function build(node,options){
  const groups=groupRows(options.rows),byCard=new Map(groups.map(g=>[g.card.id,g])),byKey=new Map(groups.flatMap(g=>g.variants.map(row=>[row.variantKey,row])));
  let chosen=byKey.get(options.slot?.variantKey)?.card.id||groups[0]?.card.id||'',variant=byKey.has(options.slot?.variantKey)?options.slot.variantKey:'',copy=options.slot?.copy??0,page=0,query='',rank='',mutation='',notice='';
  node.innerHTML='<div class="ball-index-head"><div><span class="ball-kicker">COLLECTION TERMINAL</span><h2>Ball Index</h2><p>Choose a card, then its mutation and copy.</p></div><button type="button" data-ball-action="lobby">← Lobby</button></div><div class="ball-index-slots" aria-label="Lineup slots"></div><div class="ball-index-grid"><section class="ball-index-pool"><div class="ball-index-filters"><label>Search<input type="search" placeholder="Name or passive" aria-label="Search owned cards"></label><label>Rarity<select aria-label="Rarity filter"><option value="">All rarities</option>'+Object.keys(rarityColors).map(r=>'<option>'+r+'</option>').join('')+'</select></label><label>Mutation filter<select aria-label="Mutation filter"><option value="">All mutations</option><option value="normal">Normal</option><option value="any">Any mutation</option>'+[...new Map([...byKey.values()].flatMap(row=>row.mutations.map(m=>[m.id,m.name]))).entries()].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,name])=>'<option value="'+esc(id)+'">'+esc(name)+'</option>').join('')+'</select></label></div><div class="ball-index-count"></div><div class="ball-card-pool"></div><div class="ball-index-pages"><button type="button" data-page="-1">‹ Prev</button><span></span><button type="button" data-page="1">Next ›</button></div></section><section class="ball-index-detail" aria-label="Card inspection"></section></div>';
  const pool=node.querySelector('.ball-card-pool'),detail=node.querySelector('.ball-index-detail'),pages=node.querySelector('.ball-index-pages'),slotbar=node.querySelector('.ball-index-slots'),[search,rarity,mut]=node.querySelectorAll('.ball-index-filters input,.ball-index-filters select');
  const used=(row,i)=>options.lineup().some((slot,j)=>j!==options.activeSlot()&&slot?.variantKey===row.variantKey&&slot.copy===i);
  const legal=(row,i)=>!!row&&Number.isSafeInteger(i)&&i>=0&&i<row.count&&!used(row,i);
  function freeCount(row){
   const taken=new Set(options.lineup().filter((slot,i)=>i!==options.activeSlot()&&slot?.variantKey===row.variantKey&&Number.isSafeInteger(slot.copy)&&slot.copy>=0&&slot.copy<row.count).map(slot=>slot.copy));
   return Math.max(0,row.count-taken.size);
  }
  function availableCopy(row,preferred=0){
   if(legal(row,preferred))return preferred;
   for(let i=0;i<Math.min(row.count,options.lineup().length+1);i++)if(legal(row,i))return i;
   return -1;
  }
  const matchesMutation=row=>!mutation||(mutation==='normal'?!row.mutations.length:mutation==='any'?row.mutations.length>0:row.mutations.some(m=>m.id===mutation));
  function matched(group){
   if(rank&&group.card.rarity!==rank)return [];
   const fields=[group.card.name,group.card.passive?.name,group.card.element,...(group.card.category||[])].join(' ').toLowerCase();
   return group.variants.filter(row=>matchesMutation(row)&&(!query||fields.includes(query)||variantName(row).toLowerCase().includes(query)));
  }
  function filtered(){return groups.filter(g=>matched(g).length>0);}
  function selectGroup(group,preferred='',preferredCopy=0,preferFilter=true){
   if(!group){chosen=variant='';copy=-1;return;}
   chosen=group.card.id;
   const candidates=preferFilter&&matched(group).length?matched(group):group.variants;
   const row=group.variants.find(r=>r.variantKey===preferred)||candidates.find(r=>freeCount(r)>0)||candidates[0];
   variant=row.variantKey;copy=availableCopy(row,preferredCopy);notice='';
  }
  selectGroup(byCard.get(chosen),variant,copy,false);
  function drawSlots(){
   slotbar.innerHTML=options.lineup().map((slot,i)=>{const row=byKey.get(slot?.variantKey);return '<button type="button" class="ball-index-slot'+(i===options.activeSlot()?' is-active':'')+'" data-slot="'+i+'" title="'+esc(row?row.card.name+' · '+variantName(row)+' · Copy '+(slot.copy+1):'Empty slot')+'" aria-pressed="'+(i===options.activeSlot())+'"><small>SLOT '+(i+1)+'</small><b>'+esc(row?.card.name||'Empty')+'</b></button>';}).join('');
  }
  function drawPool(){
   const list=filtered(),size=48,max=Math.max(0,Math.ceil(list.length/size)-1);page=Math.max(0,Math.min(max,page));
   node.querySelector('.ball-index-count').textContent=fmt(list.length)+' cards · '+fmt(list.reduce((n,g)=>n+matched(g).length,0))+' variants';
   pool.innerHTML=list.slice(page*size,(page+1)*size).map(g=>'<button type="button" class="ball-index-card ball-rarity-frame'+(g.card.id===chosen?' is-active':'')+'" style="'+frame({card:g.card,mutations:[]})+'" data-card="'+esc(g.card.id)+'" aria-pressed="'+(g.card.id===chosen)+'" title="'+esc(g.card.name+' · '+fmt(g.total)+' owned · '+g.variants.length+' variants')+'"><span class="ball-index-art">'+img(g.card,'loading="lazy"')+'<small>'+esc(g.card.rarity)+'</small></span><b class="ball-card-name">'+esc(g.card.name)+'</b><span class="ball-card-meta"><small>Lv.'+fmt(g.level)+'</small><small title="'+fmt(g.total)+' owned">×'+compact(g.total)+'</small></span><small class="ball-card-variants">'+g.variants.length+' variant'+(g.variants.length===1?'':'s')+'</small></button>').join('')||'<p class="ball-empty">No matching owned cards.</p>';
   pages.querySelector('span').textContent=(page+1)+' / '+(max+1);pages.querySelector('[data-page="-1"]').disabled=page===0;pages.querySelector('[data-page="1"]').disabled=page===max;
  }
  function drawDetail(focus){
   const group=byCard.get(chosen),row=byKey.get(variant);
   if(!group||!row){detail.innerHTML='<p class="ball-empty">Choose an owned card to view its Ball Arena mechanics.</p>';return;}
   const valid=legal(row,copy),slot=valid?{cardId:row.card.id,variantKey:row.variantKey,copy}:null,skill=S.profile(row.card),item=relic(slot),stats=slot?host.RelicSystem.preview(row.card,row.display,row.variantKey,copy):row.display;
   const limit=Math.min(row.count,Math.max(16,options.lineup().length+1)),choices=Array.from({length:limit},(_,i)=>i);
   if(copy>=limit&&copy<row.count)choices.push(copy);
   const ownedOptions=group.variants.map(r=>'<option value="'+esc(r.variantKey)+'"'+(r.variantKey===variant?' selected':'')+'>'+esc(variantName(r)+' · ×'+fmt(r.count)+(freeCount(r)?'':' (assigned)'))+'</option>').join('');
   const copyOptions=choices.map(i=>'<option value="'+i+'"'+(i===copy?' selected':'')+(used(row,i)?' disabled':'')+'>Copy '+fmt(i+1)+(relic({cardId:row.card.id,variantKey:row.variantKey,copy:i})?' · Relic':'')+(used(row,i)?' · Assigned':'')+'</option>').join('');
   const names=colors(row.card,row.mutations);
   const stat=(name,n)=>'<span title="'+esc(name+' '+fmt(n))+'">'+name+' <b>'+esc(fmt(n))+'</b></span>';
   detail.innerHTML='<div class="ball-detail-hero"><div class="ball-detail-portrait ball-rarity-frame" style="'+frame(row)+'">'+img(row.card)+'</div><div class="ball-detail-heading"><span class="ball-kicker">'+esc(row.card.rarity+' · '+row.card.element)+'</span><h3 style="--ball-frame-a:'+esc(names[0])+';--ball-frame-b:'+esc(names[1])+'" class="ball-mutation-name">'+esc(row.card.name)+'</h3><span class="ball-detail-level">Lv. '+fmt(row.level)+' · '+fmt(group.total)+' owned</span><div class="ball-tags">'+(row.card.category||[]).map(t=>'<span title="'+esc(t)+'">'+esc(t)+'</span>').join('')+'</div><div class="ball-detail-stats">'+stat('HP',stats.hp)+stat('ATK',stats.atk)+'</div></div></div>'+
    '<section class="ball-equip-panel"><div class="ball-equip-heading"><span class="ball-kicker">SLOT '+(options.activeSlot()+1)+' / LOADOUT</span><span class="ball-available">'+fmt(freeCount(row))+' / '+fmt(row.count)+' available</span></div><label class="ball-mutation-picker"><span>Owned mutation</span><span class="ball-mutation-select"><i style="--ball-frame-a:'+esc(names[0])+';--ball-frame-b:'+esc(names[1])+'" aria-hidden="true"></i><select data-ball-variant aria-label="Owned mutation" title="'+esc(variantName(row))+'">'+ownedOptions+'</select></span></label><div class="ball-copy-row"><label>Owned copy<select data-ball-copy aria-label="Owned card copy">'+(!valid?'<option value="-1" selected disabled>'+esc(freeCount(row)?'Choose a free copy':'All copies assigned')+'</option>':'')+copyOptions+'</select></label>'+(row.count>limit?'<label>Copy number<input type="number" data-copy-number min="1" max="'+row.count+'" value="'+(copy>=0?copy+1:'')+'" aria-label="Enter owned copy number"></label>':'')+'</div><div class="ball-relic-preview">'+(item?'<img src="'+esc(item.def?.image||'')+'" alt=""><div><b>'+esc(item.def?.name||'Relic')+'</b><p>'+esc(host.RelicSystem.describe(item.roll))+'</p></div>':'<span>Relic: '+(valid?'None equipped.':'Select a free copy.')+'</span>')+'</div><div class="ball-index-actions"><button type="button" class="ball-primary" data-assign '+(!valid?'disabled':'')+'>Assign to Slot '+(options.activeSlot()+1)+'</button><button type="button" data-remove>Clear Slot</button></div><p class="ball-equip-notice" role="status" '+(notice?'':'hidden')+'>'+esc(notice)+'</p></section>'+
    '<div class="ball-index-box"><span class="ball-kicker">NATIVE PASSIVE</span><h4>'+esc(row.card.passive?.name||'No Passive')+'</h4><p>'+esc(row.card.passive?.description||'')+'</p></div><div class="ball-index-box ball-energy-box"><span class="ball-kicker">ϟ ENERGY TRIGGER (100)</span><h4>'+esc(skill.name)+'</h4><p>'+esc(skill.description)+'</p></div><div class="ball-index-box"><span class="ball-kicker">BALL ARENA MECHANICS</span>'+S.mechanics(row.card).map(t=>'<p>'+esc(t)+'</p>').join('')+'</div><div class="ball-index-box"><span class="ball-kicker">ACQUISITION</span><p>'+esc(host.UpdateLogs?.acquisition(row.card)||'Available in the Card Index.')+'</p></div>';
   if(focus)detail.querySelector(focus)?.focus({preventScroll:true});
  }
  function redraw(){drawSlots();drawPool();drawDetail();}
  function applyFilter(){
   page=0;const list=filtered(),group=list.find(g=>g.card.id===chosen);
   if(!group)selectGroup(list[0]);
   else if(!matched(group).some(r=>r.variantKey===variant))selectGroup(group);
   drawPool();drawDetail();
  }
  search.addEventListener('input',()=>{query=search.value.trim().toLowerCase();applyFilter();});
  rarity.addEventListener('change',()=>{rank=rarity.value;play('tab_switch');applyFilter();});
  mut.addEventListener('change',()=>{mutation=mut.value;play('mutation_change');applyFilter();});
  pool.addEventListener('click',event=>{
   const button=event.target.closest?.('[data-card]'),group=byCard.get(button?.dataset.card);if(!group)return;
   const selected=group.card.id===chosen,slot=options.lineup()[options.activeSlot()];
   if(!selected)selectGroup(group,slot?.cardId===group.card.id?slot.variantKey:'',slot?.cardId===group.card.id?slot.copy:0);
   play('card_select');for(const tile of pool.querySelectorAll('[data-card]')){const active=tile===button;tile.classList.toggle('is-active',active);tile.setAttribute('aria-pressed',String(active));}
   drawDetail();detail.scrollTop=0;
   if(host.matchMedia?.('(max-width: 820px)').matches&&event.detail!==0)detail.scrollIntoView({block:'nearest',behavior:'instant'});
  });
  pages.addEventListener('click',event=>{const button=event.target.closest?.('[data-page]');if(button&&!button.disabled){page+=Number(button.dataset.page);play('tab_switch');drawPool();pool.scrollTop=0;}});
  slotbar.addEventListener('click',event=>{
   const button=event.target.closest?.('[data-slot]');if(!button)return;options.setSlot(Number(button.dataset.slot));const slot=options.lineup()[options.activeSlot()];
   const row=byKey.get(slot?.variantKey);notice='';
   if(row){selectGroup(byCard.get(row.card.id),row.variantKey,slot.copy,false);}
   else if(byCard.has(chosen))selectGroup(byCard.get(chosen),variant,copy,false);
   else selectGroup(filtered()[0]||groups[0]);
   play('tab_switch');redraw();slotbar.querySelector('[data-slot="'+options.activeSlot()+'"]')?.focus({preventScroll:true});
  });
  detail.addEventListener('change',event=>{
   const input=event.target;
   if(input.matches('[data-ball-variant]')){
    const row=byKey.get(input.value);if(!row||row.card.id!==chosen)return;variant=row.variantKey;notice='';
    const slot=options.lineup()[options.activeSlot()];copy=availableCopy(row,slot?.variantKey===variant?slot.copy:0);
    play('mutation_change');drawDetail('[data-ball-variant]');
   }else if(input.matches('[data-ball-copy],[data-copy-number]')){
    const row=byKey.get(variant),number=input.matches('[data-copy-number]');let next=Number(input.value)-(number?1:0);
    if(input.value.trim()==='')next=-1;
    copy=Number.isSafeInteger(next)&&next>=0&&next<row.count?next:-1;notice=legal(row,copy)?'':'Choose a free owned copy.';
    play('ui_click');drawDetail(number?'[data-copy-number]':'[data-ball-copy]');
   }
  });
  detail.addEventListener('click',event=>{
   const row=byKey.get(variant);
   if(event.target.closest?.('[data-assign]')&&legal(row,copy)){
    if(options.assign({cardId:row.card.id,variantKey:variant,copy})){notice='Assigned to Slot '+(options.activeSlot()+1)+'.';play('card_equip');}
    else notice='Copy unavailable. Choose another.';
    drawSlots();drawDetail('[data-assign]');
   }else if(event.target.closest?.('[data-remove]')){
    options.assign(null);if(!legal(row,copy)&&row)copy=availableCopy(row);notice='Slot cleared.';play('ui_click');drawSlots();drawDetail('[data-remove]');
   }
  });
  redraw();
 }
 host.BallIndex=Object.freeze({build,uniqueRows,groupRows,esc,fmt,compact,colors,frame,img,relic,rarityColors});
})(window);
