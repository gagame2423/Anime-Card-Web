/* Cached three-panel Storage UI and item source inspection. No reward writes. */
(function(host){
  'use strict';
  let bridge={},ui=null,tab='items',selected='',signature='';
  const text=(node,value)=>{if(node&&node.textContent!==String(value))node.textContent=String(value);};
  const make=(tag,className='',value)=>{const n=host.document.createElement(tag);n.className=className;if(value!==undefined)n.textContent=value;return n;};
  const format=value=>Number(value||0).toLocaleString('en-US');
  function category(item){return item.type==='equipment'||item.type==='gear'?'equipment':['ticket','portal','key'].includes(item.type)?'portals':'items';}
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
    if(id==='excalibur_sword')result.push('Holy Grail Raid victory: 0.8% at difficulty 1, rising linearly to 8% at difficulty 1000.');
    for(const [type,def]of Object.entries(host.BossEventSystem.TYPES))for(const offer of host.BossEventSystem.offers(type))if(offer.id===id)result.push(def.name+' Shop: '+format(offer.cost)+' '+def.coinName+'.');
    if(id===host.RaidSystem.KEY_ITEM.id)result.push('10% chance after a regular 1v1 or 4v4 victory. Not a Tower, Time Trial, Raid or Boss Event drop.');
    if(!result.length)result.push(item?.metadata?.source||'No acquisition source is currently registered for this item.');
    return result;
  }
  function inspectSource(id){
    const item=host.InventorySystem.getItem(id);if(!item)return;
    const title=host.document.getElementById('itemSourceTitle'),list=host.document.getElementById('itemSourceList');if(!title||!list)return;
    text(title,item.name+' · Sources');list.replaceChildren(...sources(id).map(source=>make('li','',source)));bridge.openSource?.();
  }
  function filtered(){const query=(ui.search.value||'').trim().toLowerCase();return host.InventorySystem.list().filter(item=>category(item)===tab&&`${item.name} ${item.description}`.toLowerCase().includes(query));}
  function details(){
    const item=host.InventorySystem.getItem(selected);ui.art.replaceChildren();
    if(!item){text(ui.title,'Select an item');text(ui.type,'');text(ui.description,'Choose an item to inspect its details and sources.');text(ui.owned,'');ui.action.hidden=true;ui.info.disabled=true;return;}
    ui.art.append(visual(item));text(ui.title,item.name);text(ui.type,category(item)==='equipment'?'Equipment · exclusive slot':item.type);text(ui.description,item.description);ui.info.disabled=false;
    refreshDetails();
  }
  function refreshDetails(){
    const item=host.InventorySystem.getItem(selected);if(!item)return;
    text(ui.owned,'Owned: '+format(item.quantity));
    const equipped=host.EquipmentSystem.equipped===selected,isEquipment=Boolean(host.EquipmentSystem.recipe(selected));
    ui.action.hidden=!item.usable&&!isEquipment;
    text(ui.action,isEquipment?(equipped?'Unequip':'Equip · replaces current'):'Use Potion');
    ui.action.disabled=(isEquipment?bridge.canAct?.()===false:bridge.canUse?.()===false)||(isEquipment&&!equipped&&item.quantity<1)||(!isEquipment&&item.quantity<1);
    const seconds=Math.ceil(item.remaining/1000);
    text(ui.timer,item.pausedRemaining?'PAUSED · '+Math.ceil(item.pausedRemaining/1000)+'s remaining':seconds>0?'ACTIVE · '+Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0'):equipped?'EQUIPPED · bonuses active':'');
  }
  function render(root){
    if(!mount(root)||ui.root.classList.contains('hidden'))return;
    const items=filtered(),equipped=host.EquipmentSystem.current(),next=JSON.stringify([tab,ui.search.value,equipped?.id,items.map(i=>[i.id,i.quantity,i.description,i.image])]);
    text(ui.equipped,equipped?'Equipped: '+equipped.name+' · 1 / 1 slot':'Equipment slot: empty · 0 / 1');
    if(!items.some(item=>item.id===selected))selected=items[0]?.id||'';
    if(next!==signature){signature=next;ui.grid.replaceChildren();
      for(const item of items){
        const tile=make('article','storage-slot'+(selected===item.id?' is-selected':'')+(item.quantity<1?' is-unowned':''));tile.dataset.storageId=item.id;
        const button=make('button','storage-select');button.type='button';button.dataset.storageSelect=item.id;button.setAttribute('aria-pressed',String(selected===item.id));
        button.append(visual(item),make('span','storage-quantity',host.InventorySystem.formatQuantity(item.quantity)),make('strong','',item.name));
        if(equipped?.id===item.id)button.append(make('small','storage-equipped-tag','EQUIPPED'));
        const info=make('button','storage-eye','◉');info.type='button';info.dataset.storageSource=item.id;info.setAttribute('aria-label','View sources for '+item.name);info.title='View item sources';
        tile.append(button,info);ui.grid.append(tile);
      }
      if(!items.length)ui.grid.append(make('p','storage-empty','No items in this category match your search.'));
      details();
    }else refreshDetails();
    const inventory=host.InventorySystem;text(ui.status,'Item drops x'+inventory.getDropMultiplier().toFixed(3)+' · Equipment buffs apply once from the equipped slot.');
  }
  function mount(root){
    if(!root)return false;if(ui?.root===root)return true;
    const select=name=>root.querySelector('[data-storage-'+name+']');
    const next={root,search:root.querySelector('#inventorySearch'),grid:root.querySelector('#potionInventoryList'),title:select('title'),type:select('type'),art:select('art'),description:select('description'),owned:select('owned'),timer:select('timer'),action:select('action'),info:select('info'),equipped:select('equipped'),status:root.querySelector('#dropChanceDisplay')};
    if(Object.values(next).some(n=>!n))return false;ui=next;
    root.addEventListener('click',event=>{
      const categoryButton=event.target.closest('[data-storage-tab]');if(categoryButton){tab=categoryButton.dataset.storageTab;signature='';for(const button of root.querySelectorAll('[data-storage-tab]')){const active=button===categoryButton;button.classList.toggle('is-active',active);button.setAttribute('aria-selected',String(active));}render(root);return;}
      const info=event.target.closest('[data-storage-source]');if(info){inspectSource(info.dataset.storageSource);return;}
      const button=event.target.closest('[data-storage-select]');if(button){selected=button.dataset.storageSelect;for(const slot of ui.grid.querySelectorAll('[data-storage-id]')){slot.classList.toggle('is-selected',slot.dataset.storageId===selected);slot.querySelector('.storage-select')?.setAttribute('aria-pressed',String(slot.dataset.storageId===selected));}details();}
    });
    ui.info.addEventListener('click',()=>inspectSource(selected));
    ui.action.addEventListener('click',()=>{const equipment=host.EquipmentSystem.recipe(selected);if(equipment?bridge.canAct?.()===false:bridge.canUse?.()===false)return;if(equipment){if(host.EquipmentSystem.equip(host.EquipmentSystem.equipped===selected?null:selected)){render(root);}}else if(host.InventorySystem.use(selected)){bridge.onUse?.(selected);render(root);}});
    return true;
  }
  host.StorageSystem=Object.freeze({render,mount,sources,inspectSource,configure:options=>{bridge=options||{};}});
})(window);
