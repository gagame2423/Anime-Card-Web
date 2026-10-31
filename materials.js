/* Material Time Trial: independent per-kill rolls, one atomic inventory write. */
(function(host){
 'use strict';
 const MODE='material-time-trial';
 const IMAGES=Object.freeze({
  silver_ore:'silverore.png',
  god_flowers:'godflowers.png',
  electric_ore:'electricore.png',
  mineral_ore:'mineralore.png',
  chain:'chain.png',
  calcite:'calcite.png',
  unknown_dna:'unknowndna.png',
  lapiz_ore:'lapizore.png',
  corundum:'corundum.png',
  aqua_tear:'aquatear.png',
  holy_dust:'holydust.png',
  dragon_tooth:'dragontooth.png',
  monster_egg:'monsteregg.png',
  icey:'icey.png',
  leaf:'leaf.png',
  veggie:'veggie.png',
  dark_dust:'darkdust.png',
  ancient_bone:'ancientbone.png',
  gold_ore:'goldore.png',
  dark_fragment:'darkfragment.png'
 });
 const ROWS=[['silver_ore','Silver Ore',.20],['god_flowers','God Flowers',.20],['electric_ore','Electric Ore',.20,'Electric'],['mineral_ore','Mineral Ore',.10],['chain','Chain',.25],['calcite','Calcite',.20],['unknown_dna','Unknown DNA',.20],['lapiz_ore','Lapiz Ore',.20],['corundum','Corundum',.15,'Fire'],['aqua_tear','Aqua Tear',.20,'Water'],['holy_dust','Holy Dust',.15,'Holy'],['dragon_tooth','Dragon Tooth',.15],['monster_egg','Monster Egg',.20],['icey','Icey',.22],['leaf','Leaf',.20,'Nature'],['veggie','Veggie',.20,'Nature'],['dark_dust','Dark Dust',.15,'Dark'],['ancient_bone','Ancient Bone',.10],['gold_ore','Gold Ore',.20],['dark_fragment','Dark Fragment',.05]];
 const ITEMS=Object.freeze(ROWS.map(([id,name,chance,element])=>Object.freeze({id,name,chance,element:element||null,type:'material',icon:'◈',image:'assets/items/'+IMAGES[id],tier:'common',description:`Material Time Trial: ${chance*100}% per defeated ${element||'any-element'} enemy. Independent roll; used in Relic crafting.`})));
 const byId=new Map(ITEMS.map(row=>[row.id,row])),seen=new WeakSet(),pending=new WeakMap();
 function register(){for(const item of ITEMS)host.InventorySystem.registerItem(item);}
 register();
 function roll(element,random=Math.random){return ITEMS.filter(row=>(!row.element||row.element===element)&&random()<row.chance).map(row=>({id:row.id,quantity:host.InventorySystem.scaleDrop(1,random)}));}
 function recordKill(battle,victim){
  if(battle?.mode!==MODE||battle.sandbox||host.SandboxSystem?.active||host.PvPSystem?.active||!battle.trial||!battle.enemyTeam?.includes(victim)||victim.hp>0&&!victim.defeated||seen.has(victim))return [];
  let drops=pending.get(victim);if(!drops){drops=roll(victim.card?.element);pending.set(victim,drops);}
  if(drops.length&&!host.InventorySystem.transactItems(items=>{for(const drop of drops)items[drop.id].quantity=Math.min(Number.MAX_SAFE_INTEGER,items[drop.id].quantity+drop.quantity);return true;}))throw Error('Unable to save Material drops.');
  seen.add(victim);pending.delete(victim);battle.trial.materials ||= {};
  for(const drop of drops)battle.trial.materials[drop.id]=(battle.trial.materials[drop.id]||0)+drop.quantity;
  return drops;
 }
 function settle(battle){if(battle?.mode===MODE)for(const unit of battle.enemyTeam||[])if(unit.defeated||unit.hp<=0)recordKill(battle,unit);}
 host.MaterialSystem=Object.freeze({MODE,ITEMS,register,roll,recordKill,settle,get:id=>byId.get(id)});
})(window);
