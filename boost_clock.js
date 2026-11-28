/* Device-local virtual clock for consumable and quest reward boosts only. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_boost_clock_v1';
 const fresh=()=>({version:1,offset:0,pausedAt:null});
 const valid=v=>v?.version===1&&Number.isSafeInteger(v.offset)&&v.offset>=0&&(v.pausedAt===null||Number.isSafeInteger(v.pausedAt)&&v.pausedAt>=v.offset);
 function read(){try{const v=JSON.parse(host.localStorage.getItem(KEY)||'null');return valid(v)?v:fresh();}catch(_){return fresh();}}
 let data=read();
 const now=(wall=Date.now())=>Math.max(0,(data.pausedAt??wall)-data.offset);
 const remaining=(deadline,wall=Date.now())=>Math.max(0,(Number(deadline)||0)-now(wall));
 const wallDeadline=(deadline,wall=Date.now())=>deadline>0?Math.max(0,Math.round(deadline+wall-now(wall))):0;
 const virtualDeadline=(deadline,wall=Date.now())=>deadline>0?Math.max(0,Math.round(deadline-wall+now(wall))):0;
 function notify(previous,at){host.dispatchEvent(new host.CustomEvent('boost-pause-changed',{detail:{paused:data.pausedAt!==null,previous,at}}));}
 function setPaused(value){const next=Boolean(value),previous=data.pausedAt!==null;if(previous===next)return true;const wall=Date.now(),record=next?{...data,pausedAt:Math.max(data.offset,wall)}:{version:1,offset:data.offset+Math.max(0,wall-data.pausedAt),pausedAt:null};
  if(!valid(record))return false;try{host.localStorage.setItem(KEY,JSON.stringify(record));}catch(_){return false;}data=record;notify(previous,wall);return true;
 }
 // The offset and toggle are never uploaded. Export dates in wall-clock time
 // so the same saved boosts remain portable to devices with different offsets.
 function translate(key,value,toWall,wall=Date.now()){
  const map=toWall?wallDeadline:virtualDeadline;
  if(key===host.InventorySystem?.KEY&&value?.buffs){return {...value,buffs:Object.fromEntries(Object.entries(value.buffs).map(([id,n])=>[id,map(n,wall)]))};}
  if(key===host.QuestsSystem?.KEY&&Array.isArray(value?.effects)){return {...value,effects:value.effects.map(effect=>({...effect,until:map(effect.until,wall)}))};}
  return value;
 }
 host.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;const previous=data.pausedAt!==null;data=read();if(previous!==(data.pausedAt!==null))notify(previous,Date.now());});
 host.BoostClockSystem=Object.freeze({KEY,now,remaining,wallDeadline,virtualDeadline,translate,setPaused,get paused(){return data.pausedAt!==null;}});
})(window);
