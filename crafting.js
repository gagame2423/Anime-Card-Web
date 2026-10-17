/* Potion upgrades use one inventory transaction: consume 10, create 1. */
(function(host){
 'use strict';let bridge={};
 function render(grid){
  if(!grid)return;grid.replaceChildren();const inv=host.InventorySystem;
  for(const[id,baseId]of Object.entries(inv.SUPER_BASE)){
   const item=inv.getItem(id),base=inv.getItem(baseId),card=document.createElement('article');card.className='module-item crafting-recipe';
   const name=document.createElement('h3');name.textContent=`${item.icon} ${item.name}`;
   const detail=document.createElement('p');detail.textContent=`10 × ${base.name} → 1 × ${item.name}. ${item.description}`;
   const owned=document.createElement('small');owned.textContent=`Materials: ${base.quantity}/10 • Crafted owned: ${item.quantity}`;
   const button=document.createElement('button');button.type='button';button.textContent='Craft ×1';button.disabled=base.quantity<10||host.SandboxSystem?.active||bridge.canAct?.()===false;
   button.addEventListener('click',()=>{if(bridge.canAct?.()===false)return;if(inv.craft(id)){render(grid);bridge.onChange?.();}else host.alert('Unable to craft. Materials and inventory have been preserved.');});
   card.append(name,detail,owned,button);grid.append(card);
  }
 }
 host.CraftingSystem=Object.freeze({render,configure:options=>{bridge=options||{};}});
})(window);
