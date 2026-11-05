/* Category registry and UI helpers. Card assignments belong in cards.js. */
(function(host){
  'use strict';
  // Add a name here, then add it to card.category arrays in cards.js.
  const TYPES=Object.freeze(['Hero','Villian','AntiHero','AntiVillian','Protagonist','Berserk','VideoGame','JoJo','Jujutsu','Fate','Pirate','DragonWarrior','PlanetDestroyer','Ninja','Unhuman','Human','Captain','Brutal','PureEvil','DemonSlayer','Sins','Alternative','Army','Swordman','Supporter','Magician','Reaper','Hunter']);
  const valid=new Set(TYPES), order=new Map(TYPES.map((type,index)=>[type,index]));
  const of=value=>{const card=value?.card||value;return Array.isArray(card?.category)?card.category:[];};
  const has=(value,category)=>of(value).includes(category);
  const matches=(value,category)=>!category||category==='all'||has(value,category);
  const compare=(a,b)=>Math.min(TYPES.length,...of(a).map(type=>order.get(type)??TYPES.length))-Math.min(TYPES.length,...of(b).map(type=>order.get(type)??TYPES.length));
  function mount(select){
    if(!select)return; const value=select.value,doc=select.ownerDocument;select.replaceChildren();
    for(const type of ['all',...TYPES]){const option=doc.createElement('option');option.value=type;option.textContent=type==='all'?'All Categories':type;select.append(option);}
    select.value=valid.has(value)?value:'all';
  }
  host.CategorySystem=Object.freeze({TYPES,of,has,matches,compare,mount,isValid:type=>valid.has(type)});
})(window);
