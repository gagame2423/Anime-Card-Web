/* Selling is inventory cleanup only: the player requested no reward. */
(function(host){
 'use strict';let bridge={};
 function canSell(item){return Boolean(item?.quantity>0&&(host.RelicSystem.get(item.id)||host.PortalsSystem.get(item.id)));}
 function sell(ids){
  if(bridge.canAct?.()===false||host.SandboxSystem?.active||host.PvPSystem?.active)return {ok:false,message:'Finish the current activity first.'};
  const selected=[...new Set(ids||[])];if(!selected.length||selected.length>500)return {ok:false,message:'Select 1–500 items.'};
  const rows=selected.map(id=>host.InventorySystem.getItem(id));if(rows.some(item=>!canSell(item)))return {ok:false,message:'Selection changed. Refresh Storage and try again.'};
  const portals=rows.every(item=>item.type==='portal'),relics=rows.every(item=>item.type==='relic');if(!portals&&!relics)return {ok:false,message:'Sell one category at a time.'};
  const ok=portals?host.PortalsSystem.discard(selected):host.InventorySystem.transactItems(items=>{for(const id of selected){if(items[id]?.type!=='relic')return false;delete items[id];}return true;});
  if(ok)bridge.onChange?.();return {ok,message:ok?`Removed ${selected.length} item(s). No currency or rewards granted.`:'Unable to remove items. Nothing was sold.'};
 }
 host.StorageSales=Object.freeze({canSell,sell,configure:options=>{bridge=options||{};}});
})(window);
