/* Quy tắc Infinity thuần trình duyệt, dùng tuần ISO theo UTC. */
(function(host){
 'use strict';
 const DAY=86400000,WEEK=7*DAY;
 function getISOWeekAndYear(at=Date.now()){
  const d=new Date(at);if(!Number.isFinite(d.getTime()))throw Error('Invalid UTC date.');
  const day=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())),weekday=day.getUTCDay()||7;
  const startMs=day.getTime()-(weekday-1)*DAY;day.setUTCDate(day.getUTCDate()+4-weekday);
  const year=day.getUTCFullYear(),week=Math.ceil(((day-Date.UTC(year,0,1))/DAY+1)/7);
  return{year,week,id:year+'_W'+String(week).padStart(2,'0'),startMs,endMs:startMs+WEEK};
 }
 function random(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
 function rotation(at=Date.now()){
  const week=getISOWeekAndYear(at),seed=week.year*100+week.week,rng=random(seed);
  return{...week,seed,category:host.CategorySystem.TYPES[Math.floor(rng()*host.CategorySystem.TYPES.length)],element:host.ElementSystem.TYPES[Math.floor(rng()*host.ElementSystem.TYPES.length)]};
 }
 function orbRange(wave){const n=Math.max(1,Math.floor(wave));return{min:Math.floor(1+(n-1)*(7/99)),max:Math.floor(2+(n-1)*(8/99))};}
 host.InfinityRules=Object.freeze({DAY,WEEK,getISOWeekAndYear,getISOWeek:getISOWeekAndYear,random,rotation,orbRange});
})(window);
