/* Shared 12-hour rotation: fixed UTC+7 midnight/noon, deterministic shuffled bags. */
(function(host){
 'use strict';
 const WINDOW_MS=12*60*60*1000,OFFSET_MS=7*60*60*1000;
 function shuffle(ids,cycle){let seed=(Math.imul(cycle|0,2654435761)^0x7261676e)>>>0;const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};const rows=[...ids];for(let i=rows.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[rows[i],rows[j]]=[rows[j],rows[i]];}return rows;}
 function pick(ids,index){
  if(ids.length===1)return ids[0];if(ids.length===2)return ids[((index%2)+2)%2];
  const cycle=Math.floor(index/ids.length),slot=((index%ids.length)+ids.length)%ids.length,bag=shuffle(ids,cycle),previous=shuffle(ids,cycle-1);
  // Swapping the first two leaves the last item unchanged for pools of 3+.
  if(bag[0]===previous[previous.length-1])[bag[0],bag[1]]=[bag[1],bag[0]];
  return bag[slot];
 }
 function current(types,now=Date.now()){
  const ids=Object.keys(types||{});if(!ids.length)throw Error('Boss Event pool is empty.');
  const at=Number.isFinite(now)?now:Date.now(),index=Math.floor((at+OFFSET_MS)/WINDOW_MS),startsAt=index*WINDOW_MS-OFFSET_MS;
  return Object.freeze({type:pick(ids,index),previousType:pick(ids,index-1),key:String(index),startsAt,endsAt:startsAt+WINDOW_MS,remainingMs:Math.max(0,startsAt+WINDOW_MS-at)});
 }
 host.BossEventRotation=Object.freeze({WINDOW_MS,OFFSET_MS,current});
})(window);
