/* Quy tắc tuần UTC dùng chung cho trình duyệt và máy chủ. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.InfinityRules=api;})(typeof window==='undefined'?globalThis:window,function(){
 'use strict';
 const DAY=86400000,WEEK=7*DAY;
 const CATEGORIES=Object.freeze(['Hero','Villian','AntiHero','AntiVillian','Protagonist','Berserk','VideoGame','JoJo','Jujutsu','Fate','Pirate','DragonWarrior','PlanetDestroyer','Ninja','Unhuman','Human','Captain','Brutal','PureEvil','DemonSlayer','Sins','Alternative','Army','Swordman','Supporter','Magician','Reaper','Hunter']);
 const ELEMENTS=Object.freeze(['Fire','Water','Nature','Electric','Dark','Holy']);
 function getISOWeek(at=Date.now()){
  const d=new Date(at);if(!Number.isFinite(d.getTime()))throw Error('Invalid UTC date.');
  const day=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),weekday=day.getUTCDay()||7;
  const startMs=day.getTime()-(weekday-1)*DAY;day.setUTCDate(day.getUTCDate()+4-weekday);
  const year=day.getUTCFullYear(),week=Math.ceil(((day-Date.UTC(year,0,1))/DAY+1)/7);
  return{year,week,id:year+'_W'+String(week).padStart(2,'0'),startMs,endMs:startMs+WEEK};
 }
 function hash(text){let n=2166136261;for(const ch of String(text)){n^=ch.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
 function random(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
 function rotation(at=Date.now()){const week=getISOWeek(at),seed=hash('infinity-v1:'+week.id),rng=random(seed);return{...week,seed,category:CATEGORIES[Math.floor(rng()*CATEGORIES.length)],element:ELEMENTS[Math.floor(rng()*ELEMENTS.length)]};}
 function orbRange(wave){const n=Math.max(1,Math.floor(wave));return{min:Math.floor(1+(n-1)*(7/99)),max:Math.floor(2+(n-1)*(8/99))};}
 return Object.freeze({DAY,WEEK,CATEGORIES,ELEMENTS,getISOWeek,hash,random,rotation,orbRange});
});
