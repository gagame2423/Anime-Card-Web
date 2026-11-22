/* Index presentation stays separate from rolls and combat. */
(function(host){
 'use strict';
 let bridge={},current=null,currentVariant='',ui=null;
 const ABILITIES=[['Bleed',/\bbleed(?:ing)?\b/i],['Heal',/\bheal(?:s|ing|ed)?\b/i],['Stun',/\bstun(?:s|ned)?\b/i],['Freeze',/\bfreez(?:e|es|ing)\b|\bfrozen\b/i],['Follow Up',/follow[ -]?up/i],['Shield',/\bshield(?:s|ed)?\b/i],['Hindered',/\bhind(?:ered|red)\b/i],['Summon',/\bsummon(?:s|ed|ing)?\b|\bclone(?:s|d)?\b/i]];
 const tags=card=>ABILITIES.filter(([,pattern])=>pattern.test(card?.passive?.description||'')).map(([name])=>name);
 const el=id=>host.document.getElementById(id);
 function mount(){if(ui)return true;ui={select:el('previewMutationSelect'),evolve:el('previewEvolveButton'),lock:el('previewLockButton'),equip:el('previewEquipButton'),slot:el('previewRelicSlot'),categories:el('previewCategories'),tags:el('previewAbilityTags'),picker:el('cardRelicPicker'),list:el('cardRelicList'),status:el('cardRelicStatus')};if(Object.values(ui).some(v=>!v)){ui=null;return false;}
  ui.select.addEventListener('change',()=>bridge.selectVariant?.(ui.select.value));
  ui.lock.addEventListener('click',()=>{if(current&&bridge.canAct?.()!==false)bridge.toggleLock?.(current.id);});
  ui.evolve.addEventListener('click',()=>{if(current)host.EvolutionSystem?.open(current.id,currentVariant);});
  ui.equip.addEventListener('click',openPicker);ui.slot.addEventListener('click',openPicker);
  el('cardRelicPickerClose')?.addEventListener('click',()=>ui.picker.classList.add('hidden'));
  el('cardRelicUnequip')?.addEventListener('click',()=>{const item=host.RelicSystem.equipped(current?.id);if(item&&host.RelicSystem.bind(item.id,null))openPicker();});
  ui.list.addEventListener('click',event=>{const button=event.target.closest('[data-relic-id]');if(!button||!current)return;if(host.RelicSystem.bind(button.dataset.relicId,{cardId:current.id})){ui.picker.classList.add('hidden');bridge.notify?.('Relic equipped across all mutations.');}else ui.status.textContent='Finish the current activity before changing Relics.';});return true;
 }
 function chip(name,kind){const node=host.document.createElement('span');node.className='details-chip '+kind;node.textContent=name;return node;}
 function render(card,variants,selected,locked){if(!mount())return;current=card;currentVariant=selected.key;ui.evolve.hidden=!host.EvolutionSystem?.recipesFor(card.id).length;ui.evolve.disabled=bridge.canAct?.()===false;ui.select.replaceChildren();for(const v of variants){const option=host.document.createElement('option');option.value=v.key;option.textContent=(v.mutations.map(m=>m.name).join(' + ')||'Normal')+' · x'+v.count;ui.select.append(option);}ui.select.value=selected.key;
  ui.lock.textContent=locked?'🔒 Locked':'🔓 Unlocked';ui.lock.setAttribute('aria-pressed',String(locked));ui.lock.disabled=bridge.canAct?.()===false;
  ui.categories.replaceChildren(...(card.category||[]).map(c=>chip(c,'category')));ui.tags.replaceChildren(...tags(card).map(c=>chip(c,'ability-'+c.toLowerCase().replace(' ','-'))));
  const item=host.RelicSystem.equipped(card.id);ui.slot.replaceChildren();if(item){const image=host.document.createElement('img');image.src=item.image;image.alt=item.name;image.addEventListener('error',()=>{ui.slot.textContent='◆';},{once:true});ui.slot.append(image);ui.slot.title=host.RelicSystem.describe(item.metadata.relic,item.metadata.binding);}else{ui.slot.textContent='◆';ui.slot.title='No Relic equipped · choose a Relic';}ui.slot.setAttribute('aria-label',ui.slot.title);ui.equip.disabled=bridge.canAct?.()===false;
 }
 function openPicker(){
  if(!current||!mount())return;
  ui.status.textContent='';ui.list.replaceChildren();
  const R=host.RelicSystem,V=host.RelicInspection,card=current,equipped=R.equipped(card.id),locked=bridge.canAct?.()===false;
  const cards=[{card,owned:true}],items=R.list().map(item=>({item,match:R.compatibility(card,item)}));
  const score=row=>Number(row.item.id===equipped?.id)*4+Number(row.match.unique?.active||false)*2+Number(row.match.base.active);
  items.sort((a,b)=>score(b)-score(a));
  for(const {item,match} of items){
   const row=host.document.createElement('div');row.className='relic-picker-row';
   const choice=host.document.createElement('button');choice.type='button';choice.dataset.relicId=item.id;
   choice.className='card-relic-option'+(item.id===equipped?.id?' is-equipped':'')+
    (match.base.active||match.unique?.active?' is-compatible':'')+(match.unique?.active?' is-unique-match':'');
   const art=host.document.createElement('img');art.src=item.image;art.alt='';art.loading='lazy';
   const labels=host.document.createElement('span'),title=host.document.createElement('strong'),tier=host.document.createElement('small');
   title.textContent=item.name+(item.id===equipped?.id?' · EQUIPPED':'');
   tier.textContent=item.metadata.relic.unique?'Unique Legendary':item.metadata.relic.rarity;
   labels.append(title,tier);labels.insertAdjacentHTML('beforeend',V.badges(match));
   choice.append(art,labels);choice.disabled=locked;row.append(choice);
   const inspect=host.document.createElement('details'),summary=host.document.createElement('summary'),panel=host.document.createElement('div');
   inspect.className='relic-picker-inspect';summary.textContent='Inspect '+item.name;inspect.append(summary,panel);
   inspect.addEventListener('toggle',()=>{if(inspect.open&&!panel.firstChild)panel.innerHTML=V.markup(item,{card,cards,binding:true});});
   row.append(inspect);ui.list.append(row);
  }
  if(!items.length){const empty=host.document.createElement('p');empty.textContent='No Relics owned. Craft a Relic to equip it.';ui.list.append(empty);}
  el('cardRelicUnequip').disabled=!equipped||locked;
  ui.picker.classList.remove('hidden');
 }
 host.CardDetailsSystem=Object.freeze({tags,render,configure(options){bridge=options||{};mount();}});
})(window);
