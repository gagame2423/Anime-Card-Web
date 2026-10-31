/* Automatic per-mode decks. Ownership and entry rules stay with each selector. */
(function(host){
 'use strict';
 const validKey=key=>typeof key==='string'&&!['__proto__','constructor','prototype'].includes(key)&&/^[a-zA-Z0-9:_-]{1,100}$/.test(key);
 function slots(team,size=6){
  return Array.from({length:Math.min(6,Math.max(1,size))},(_,i)=>{
   const slot=team?.[i];
   return slot&&typeof slot.cardId==='string'&&slot.cardId.length<=100&&typeof slot.variantKey==='string'&&slot.variantKey.length<=250
    ?{cardId:slot.cardId,variantKey:slot.variantKey}:null;
  });
 }
 function normalize(value){
  const result={};if(!value||typeof value!=='object'||Array.isArray(value))return result;
  for(const [key,team]of Object.entries(value).slice(0,200))if(validKey(key)&&Array.isArray(team)&&team.length>=1&&team.length<=6)result[key]=slots(team,team.length);
  return result;
 }
 function save(decks,key,team,size){
  if(!validKey(key))return false;
  const next=slots(team,size);if(JSON.stringify(decks[key])===JSON.stringify(next))return false;
  decks[key]=next;return true;
 }
 function restore(decks,key,size,resolve){
  const used=new Map();return slots(decks?.[key],size).map(slot=>{
   if(!slot)return null;const accepted=resolve(slot,used);if(!accepted)return null;
   used.set(accepted.variantKey,(used.get(accepted.variantKey)||0)+1);return {...accepted};
  });
 }
 host.ArenaLoadouts=Object.freeze({normalize,save,restore,slots});
})(window);
