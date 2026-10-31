/* Cached three-panel Storage UI and item source inspection. No reward writes. */
(function(host){
  'use strict';
  const LOADOUT_KEYS=Object.freeze(['preset1','preset2','preset3']);
  function normalizeTeamLoadouts(value){
    return Object.fromEntries(LOADOUT_KEYS.map((key,index)=>{const row=value?.[key];return[key,{name:typeof row?.name==='string'?row.name.slice(0,40):'Preset '+(index+1),slots:Array.from({length:4},(_,i)=>typeof row?.slots?.[i]==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(row.slots[i])?row.slots[i]:null),variantKeys:Array.from({length:4},(_,i)=>typeof row?.variantKeys?.[i]==='string'?row.variantKeys[i].slice(0,250):null)}];}));
  }
  function validTeamLoadouts(value){return Boolean(value&&typeof value==='object'&&!Array.isArray(value)&&Object.keys(value).every(key=>LOADOUT_KEYS.includes(key))&&Object.values(value).every(row=>row&&typeof row.name==='string'&&row.name.length<=40&&Array.isArray(row.slots)&&row.slots.length===4&&Array.from(row.slots).every(id=>id===null||typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id))&&(!row.variantKeys||Array.isArray(row.variantKeys)&&row.variantKeys.length===4&&Array.from(row.variantKeys).every(key=>key===null||typeof key==='string'&&key.length<=250))));}
  function saveTeamLoadout(value,key,team){if(!LOADOUT_KEYS.includes(key))throw Error('Unknown team preset.');const next=normalizeTeamLoadouts(value);next[key].slots=Array.from({length:4},(_,i)=>team[i]?.cardId||null);next[key].variantKeys=Array.from({length:4},(_,i)=>team[i]?.variantKey||null);return next;}
  function resolveTeamLoadout(value,key,resolve){const row=normalizeTeamLoadouts(value)[key];if(!row)return null;const used=new Map(),missing=[];const slots=row.slots.map((id,index)=>{if(!id)return null;const slot=resolve(id,row.variantKeys[index],used);if(!slot){missing.push(index+1);return null;}used.set(slot.variantKey,(used.get(slot.variantKey)||0)+1);return slot;});return{slots,missing};}
  let bridge={},ui=null,tab='items' ,selected='',signature='',capsuleResult='';
  let portalPage=0;
  const slots=new Map();
  const text=(node,value)=>{if(node&&node.textContent!==String(value))node.textContent=String(value);};
  const make=(tag,className='',value)=>{const n=host.document.createElement(tag);n.className=className;if(value!==undefined)n.textContent=value;return n;};
  const format=value=>Number(value||0).toLocaleString('en-US');
  function category(item){return item.type==='exp_food'?'exp_food':item.type==='equipment'||item.type==='gear'?'equipment':['ticket','portal','key'].includes(item.type)?'portals':'items';}
  function visual(item){
    const root=make('div','storage-item-art'),fallback=make('span','',item.name.split(/\s+/).map(s=>s[0]).slice(0,3).join(''));
    const potion=host.InventorySystem.POTIONS[item.id];
    if(potion){fallback.className='potion-bottle'+(host.InventorySystem.SUPER_BASE[item.id]?' is-super':'');fallback.dataset.potionStat=potion.stat;fallback.textContent='';}
    root.append(fallback);
    if(item.image){const img=make('img');img.src=item.image;img.alt=item.name;img.loading='lazy';img.addEventListener('load',()=>{fallback.hidden=true;},{once:true});img.addEventListener('error',()=>img.remove(),{once:true});root.append(img);}
    return root;
  }
  function sources(id){
    const inventory=host.InventorySystem,result=[],equipment=host.EquipmentSystem.recipe(id),item=inventory.getItem(id);
    if(equipment){result.push('Crafting: '+equipment.cards.map(r=>{const card=host.ALL_CARDS.find(c=>c.id===r.cardId);const names=r.mutationIds.map(id=>host.MUTATION_BY_ID[id]?.name||id);return '1x '+(card?.name||r.cardId)+' ['+(names.length?names.join(' + ')+(r.match==='contains'?'; Double Mutation allowed':' ; exact pair'):'Normal only, no Mutations')+']';}).join(' + ')+' + '+format(equipment.cost)+' VNĐ.');}
    if(inventory.SUPER_BASE[id])result.push('Crafting: 10x '+inventory.getItem(inventory.SUPER_BASE[id]).name+' → 1x '+item.name+'; 0 VNĐ.');
    if(inventory.BATTLE_DROP_IDS.includes(id))result.push('Regular / Tower battle victories: potion pool, 10% base + pity and Drop Chance stat, capped at 30%; one of 4 standard potions.');
    for(const offer of host.TowerSystem.SHOP_ITEMS)if(offer.id===id)result.push('Tower Shop: '+format(offer.cost)+' Tower Coins.');
    for(const offer of host.TimeTrialSystem.SHOP_ITEMS)if(offer.id===id)result.push('Time Trial Shop: '+format(offer.cost)+' Time Trial Shards.');
    for(const [type,def]of Object.entries(host.RaidSystem.TYPES))for(const offer of host.RaidSystem.offers(type))if(offer.id===id)result.push(def.name+' Shop: '+format(offer.cost)+' '+def.coinName+'.');
    if(id===host.RaidSystem.GRAIL_KEY.id)result.push('50% chance per Fate-category enemy defeated in regular 1v1 / 4v4 battles. Generated units and Sandbox excluded.');
    if(id===host.RaidSystem.SHIBUYA_KEY.id)result.push('Complete a Normal 1v1 or Normal 4v4 battle while Malevolent weather is active: 1 Key, win or loss. Online PvP, Sandbox and surrendered battles give no Key.');
    if(id==='equipment_cursed_finger')result.push('Shibuya Raid victory: 0.1% at difficulty 1, rising linearly to 1% at difficulty 1000.');
    if(id==='gojo_eye')result.push('Gomen Boss Event victory (Heavenly weather): 0.8% at difficulty 1, rising linearly to 8% at difficulty 1000; evolves Lv.100+ Gojo Young.');
    if(id==='excalibur_sword')result.push('Holy Grail Raid victory: 0.8% at difficulty 1, rising linearly to 8% at difficulty 1000.');
    for(const [type,def]of Object.entries(host.BossEventSystem.TYPES))for(const offer of host.BossEventSystem.offers(type))if(offer.id===id)result.push(def.name+' Shop: '+format(offer.cost)+' '+def.coinName+'.');
    if(id===host.RaidSystem.KEY_ITEM.id)result.push('10% chance after a regular 1v1 or 4v4 victory. Not a Tower, Time Trial, Raid or Boss Event drop.');
    for(const source of host.SpookySystem?.sources(id)||[])result.push(source);
    if(id===host.SpookySystem?.CAPSULE.id){
      result.push('Open 1 Capsule in Storage → Items to receive 1 card. Duplicates grant 10% of current level EXP requirement; no VNĐ or standard roll count.');
      const pool=host.SpookySystem.capsulePool();
      for(const row of pool){const card=host.ALL_CARDS.find(card=>card.id===row.cardId);result.push(`${card?.name||row.cardId}: weight ${row.weight} → ${(row.chance*100).toFixed(4)}%.`);}
      if(!pool.some(row=>row.cardId==='tower-champion-heavenly'))result.push('The Judgement locked: complete Heavenly Tower Floor 100. Eligible weights are normalized.');
    }
    if(host.PortalsSystem?.get(id))result.push('Normal Time Trial room clear: 40% Tier 1. Portal victory: 50% upgrade through Tier 5. Tier 5 clear: 1% Secret Portal. Five defeats destroy this item. Party: Tier 4, Tier 5 or Secret only.');
    if(id==='senzu_bean')result.push('Namek Portal victory: 1–3 at Tier 1, 10–20 at Tier 5 / Secret. Feed for 2,500 base EXP or evolve Lv.100+ Gohan (8,500) / Frieza (7,690).');
    if(id==='star_orb')result.push('Infinity Mode: clear waves for 1–2 Orbs at Wave 1 up to 8–10 at Wave 100. Personal weekly reward: highest wave × 100 Star Orbs, claimed automatically on local startup; Google sync is optional.');
    if(id==='bread')result.push('Win any real battle mode: 1–3 Bread per victory. Sandbox excluded. Feed from an owned card’s details → Feed.');
    if(item?.type==='exp_food')result.push('EXP gained = total base Food EXP × Player EXP Multiplier; capped at Lvl 1000. Feed from card details.');
    if(!result.length)result.push(item?.metadata?.source||'No acquisition source is currently registered for this item.');
    return result;
  }
  function inspectSource(id){
    const item=host.InventorySystem.getItem(id);if(!item)return;
    const title=host.document.getElementById('itemSourceTitle'),list=host.document.getElementById('itemSourceList');if(!title||!list)return;
    text(title,item.name+' · Sources');list.replaceChildren(...sources(id).map(source=>make('li','',source)));bridge.openSource?.();
  }
  function filtered(){const query=(ui.search.value||'').trim().toLowerCase();return host.InventorySystem.list().filter(item=>category(item)===tab&&(item.type!=='portal'||item.quantity>0)&&`${item.name} ${item.description}`.toLowerCase().includes(query));}
  function details(){
    const item=host.InventorySystem.getItem(selected);ui.art.replaceChildren();
    if(!item){text(ui.title,'Select an item');text(ui.type,'');text(ui.description,'Choose an item to inspect its details and sources.');text(ui.owned,'');ui.action.hidden=true;ui.info.disabled=true;ui.result.hidden=true;return;}
    ui.art.append(visual(item));text(ui.title,item.name);text(ui.type,category(item)==='equipment'?'Equipment · exclusive slot':item.type);text(ui.description,item.description);ui.info.disabled=false;
    refreshDetails();
  }
  function refreshDetails(){
    const item=host.InventorySystem.getItem(selected);if(!item)return;
    text(ui.owned,'Owned: '+format(item.quantity));
    const equipped=host.EquipmentSystem.equipped===selected,isEquipment=host.EquipmentSystem.isEquipment(selected);
    const capsule=item.id===host.SpookySystem?.CAPSULE.id,portal=item.type==='portal'&&Boolean(host.PortalsSystem?.get(item.id));
    ui.result.hidden=!capsule||!capsuleResult;text(ui.result,capsule?capsuleResult:'');
    ui.action.hidden=!item.usable&&!isEquipment&&!capsule&&!portal;
    text(ui.action,isEquipment?(equipped?'Unequip':'Equip · replaces current'):capsule?'Open Spooky Capsule':portal?'Inspect / Open Portal':'Use Potion');
    ui.action.disabled=((isEquipment||capsule||portal)?bridge.canAct?.()===false:bridge.canUse?.()===false)||(isEquipment&&!equipped&&item.quantity<1)||(!isEquipment&&item.quantity<1);
    const seconds=Math.ceil(item.remaining/1000);
    text(ui.timer,item.pausedRemaining?'PAUSED · '+Math.ceil(item.pausedRemaining/1000)+'s remaining':seconds>0?'ACTIVE · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):equipped?'EQUIPPED · bonuses active':'');
  }
  function showCapsuleResult(result){
    const drop=result?.cards?.[0],card=drop?host.ALL_CARDS.find(card=>card.id===drop.cardId):null;if(!card)return;
    const mutations=(drop.mutationIds||[]).map(id=>host.MUTATION_BY_ID[id]?.name||id).join(' + ');
    capsuleResult=`Capsule reward: ${mutations?'['+mutations+'] ':''}${card.name} · +1 owned · duplicates: +10% level EXP (until Lv.1000) · no VNĐ / roll count.`;
    if(ui)host.RollPerformanceSystem.schedule(refreshVisibleDetails);
  }
  function refreshVisibleDetails(){if(ui&&!ui.root.classList.contains('hidden'))refreshDetails();}
  function paintStorage(){if(ui)render(ui.root);}
  function render(root){
    if(!mount(root)||ui.root.classList.contains('hidden'))return;
    const join=host.document.getElementById('portalJoinStorage');if(join)join.hidden=tab!=='portals';
    const matches=filtered(),pageCount=Math.max(1,Math.ceil(matches.length/32));portalPage=Math.min(portalPage,pageCount-1);
    const pager=host.document.getElementById('storagePortalPagination');if(pager)pager.hidden=tab!=='portals';text(host.document.getElementById('storagePortalPage'),`${portalPage+1} / ${pageCount}`);const prev=host.document.getElementById('storagePortalPrev'),nextPage=host.document.getElementById('storagePortalNext');if(prev)prev.disabled=portalPage===0;if(nextPage)nextPage.disabled=portalPage===pageCount-1;
    const items=tab==='portals'?matches.slice(portalPage*32,portalPage*32+32):matches,equipped=host.EquipmentSystem.current(),next=JSON.stringify([tab,ui.search.value,equipped?.id,items.map(i=>[i.id,i.description,i.image])]);
    text(ui.equipped,equipped?'Equipped: '+equipped.name+' · 1 / 1 slot':'Equipment slot: empty · 0 / 1');
    if(!items.some(item=>item.id===selected))selected=items[0]?.id||'';
    if(next!==signature){signature=next;ui.grid.replaceChildren();slots.clear();const fragment=ui.grid.ownerDocument.createDocumentFragment();
      for(const item of items){
        const tile=make('article','storage-slot'+(selected===item.id?' is-selected':'')+(item.quantity<1?' is-unowned':''));tile.dataset.storageId=item.id;
        const button=make('button','storage-select');button.type='button';button.dataset.storageSelect=item.id;button.setAttribute('aria-pressed',String(selected===item.id));
        button.append(visual(item),make('span','storage-quantity',host.InventorySystem.formatQuantity(item.quantity)),make('strong','',item.name));
        if(equipped?.id===item.id)button.append(make('small','storage-equipped-tag','EQUIPPED'));
        const info=make('button','storage-eye','◉');info.type='button';info.dataset.storageSource=item.id;info.setAttribute('aria-label','View sources for '+item.name);info.title='View item sources';
        tile.append(button,info);fragment.append(tile);slots.set(item.id,{tile,button,quantity:button.querySelector('.storage-quantity')});
      }
      ui.grid.append(fragment);
      if(!items.length)ui.grid.append(make('p','storage-empty','No items in this category match your search.'));
      details();
    }else refreshDetails();
    for(const item of items){const slot=slots.get(item.id);if(!slot)continue;text(slot.quantity,host.InventorySystem.formatQuantity(item.quantity));slot.tile.classList.toggle('is-unowned',item.quantity<1);slot.tile.classList.toggle('is-selected',selected===item.id);slot.button.setAttribute('aria-pressed',String(selected===item.id));}
    const inventory=host.InventorySystem;text(ui.status,'Item drops x'+inventory.getDropMultiplier().toFixed(3)+' · Equipment buffs apply once from the equipped slot.');
  }
  function mount(root){
    if(!root)return false;if(ui?.root===root)return true;
    const select=name=>root.querySelector('[data-storage-'+name+']');
    const next={root,search:root.querySelector('#inventorySearch'),grid:root.querySelector('#potionInventoryList'),title:select('title'),type:select('type'),art:select('art'),description:select('description'),owned:select('owned'),timer:select('timer'),result:select('result'),action:select('action'),info:select('info'),equipped:select('equipped'),status:root.querySelector('#dropChanceDisplay')};
    if(Object.values(next).some(n=>!n))return false;ui=next;
    root.addEventListener('click',event=>{
      const categoryButton=event.target.closest('[data-storage-tab]');if(categoryButton){tab=categoryButton.dataset.storageTab;portalPage=0;signature='';for(const button of root.querySelectorAll('[data-storage-tab]')){const active=button===categoryButton;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));}render(root);return;}
      const info=event.target.closest('[data-storage-source]');if(info){inspectSource(info.dataset.storageSource);return;}
      const button=event.target.closest('[data-storage-select]');if(button){selected=button.dataset.storageSelect;for(const slot of ui.grid.querySelectorAll('[data-storage-id]')){slot.classList.toggle('is-selected',slot.dataset.storageId===selected);slot.querySelector('.storage-select')?.setAttribute('aria-pressed',String(slot.dataset.storageId===selected));}details();}
    });
    ui.search.addEventListener('input',()=>{portalPage=0;});
    for(const [id,delta]of [['storagePortalPrev',-1],['storagePortalNext',1]])host.document.getElementById(id)?.addEventListener('click',()=>{portalPage=Math.max(0,portalPage+delta);signature='';render(root);});
    ui.info.addEventListener('click',()=>inspectSource(selected));
    ui.action.addEventListener('click',()=>{if(host.PortalsSystem?.get(selected)){if(bridge.canAct?.()!==false)host.PortalsSystem.open(selected);return;}const equipment=host.EquipmentSystem.isEquipment(selected),capsule=selected===host.SpookySystem?.CAPSULE.id;if((equipment||capsule)?bridge.canAct?.()===false:bridge.canUse?.()===false)return;if(capsule){host.SpookySystem.openCapsule();host.RollPerformanceSystem.schedule(paintStorage);return;}if(equipment){if(host.EquipmentSystem.equip(host.EquipmentSystem.equipped===selected?null:selected)){render(root);}}else if(host.InventorySystem.use(selected)){bridge.onUse?.(selected);render(root);}});
    return true;
  }
  host.StorageSystem=Object.freeze({LOADOUT_KEYS,normalizeTeamLoadouts,validTeamLoadouts,saveTeamLoadout,resolveTeamLoadout,render,mount,sources,inspectSource,showCapsuleResult,configure:options=>{bridge=options||{};}});
})(window);
