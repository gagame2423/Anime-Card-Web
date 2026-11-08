/* Penalty-only wallet, upgrades and crash-safe five-shot sessions. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_penalty_v1',MAX=Number.MAX_SAFE_INTEGER;
 const CONFIG=Object.freeze({maxLevel:50,baseCost:25,costGrowth:1.12,attemptTokens:2,goalTokens:8,perfectBonus:50});
 const STATS=Object.freeze({shoot:'Shoot',curve:'Curve',accuracy:'Accuracy'});
 const integer=(n,min=0,max=MAX)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const copy=v=>JSON.parse(JSON.stringify(v));
 const fresh=()=>({version:1,tokens:0,upgrades:{shoot:0,curve:0,accuracy:0},totals:{attempts:0,goals:0,topCorners:0,sessions:0,perfectSessions:0},session:null,sound:true});
 function validShot(s){return Boolean(s&&integer(s.zone,0,8)&&integer(s.actualZone,0,8)&&integer(s.keeperZone,0,8)&&Number.isFinite(s.power)&&s.power>=0&&s.power<=1&&['green','yellow','red'].includes(s.quality)&&typeof s.goal==='boolean'&&typeof s.saved==='boolean'&&typeof s.miss==='boolean'&&Number(s.goal)+Number(s.saved)+Number(s.miss)===1&&typeof s.rating==='string'&&s.rating.length<=40&&Number.isFinite(s.duration)&&s.duration>=.25&&s.duration<=3&&Number.isFinite(s.curve)&&Math.abs(s.curve)<=.2&&Number.isFinite(s.driftX)&&Math.abs(s.driftX)<=.4&&Number.isFinite(s.driftY)&&Math.abs(s.driftY)<=.4);}
 function validSession(s){return s===null||Boolean(s&&typeof s.id==='string'&&/^[a-zA-Z0-9_-]{1,80}$/.test(s.id)&&Array.isArray(s.shots)&&s.shots.length<=5&&s.shots.every(validShot)&&(s.pending===null||s.shots.length<5&&validShot(s.pending)));}
 function validSave(v){
  return Boolean(v&&v.version===1&&integer(v.tokens)&&typeof v.sound==='boolean'&&Object.keys(STATS).every(k=>integer(v.upgrades?.[k],0,CONFIG.maxLevel))&&['attempts','goals','topCorners','sessions','perfectSessions'].every(k=>integer(v.totals?.[k]))&&v.totals.goals<=v.totals.attempts&&v.totals.topCorners<=v.totals.goals&&v.totals.perfectSessions<=v.totals.sessions&&validSession(v.session));
 }
 let data;try{const raw=JSON.parse(host.localStorage.getItem(KEY)||'null');data=validSave(raw)?raw:fresh();}catch(_){data=fresh();}
 let bridge={};
 function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));host.CloudSaveSystem?.markDirty();return true;}catch(_){return false;}}
 function change(fn){const before=copy(data);if(fn()===false)return false;if(!persist()){data=before;return false;}try{bridge.onChange?.();}catch(e){host.console.warn('Penalty saved; refresh pending.',e);}return true;}
 const allowed=()=>bridge.canAct?.()!==false&&!host.SandboxSystem?.active&&!host.PvPSystem?.active;
 const cost=(stat,level=data.upgrades[stat])=>Object.hasOwn(STATS,stat)&&integer(level,0,CONFIG.maxLevel-1)?Math.round(CONFIG.baseCost*Math.pow(CONFIG.costGrowth,level)):null;
 function upgrade(stat){if(!allowed()||!Object.hasOwn(STATS,stat))return false;const price=cost(stat);if(price===null||data.tokens<price)return false;return change(()=>{data.tokens-=price;data.upgrades[stat]++;});}
 function openSession(){
  if(!allowed())return null;if(data.session?.shots.length<5)return copy(data.session);
  const next={id:host.OnlineUtils.token(),shots:[],pending:null};return change(()=>{data.session=next;})?copy(next):null;
 }
 function prepareShot(shot){if(!allowed()||!validShot(shot)||!data.session||data.session.pending||data.session.shots.length>=5)return false;return change(()=>{data.session.pending=copy(shot);});}
 function commitShot(){
  const s=data.session;if(!allowed()||!s?.pending)return null;let result;
  const ok=change(()=>{
   const shot=s.pending,index=s.shots.length+1,goals=s.shots.filter(v=>v.goal).length+Number(shot.goal),complete=index===5;
   const bonus=complete&&goals===5?CONFIG.perfectBonus:0,reward=CONFIG.attemptTokens+(shot.goal?CONFIG.goalTokens:0)+bonus;
   if(data.tokens>MAX-reward||data.totals.attempts===MAX||complete&&data.totals.sessions===MAX)return false;
   data.tokens+=reward;data.totals.attempts++;if(shot.goal)data.totals.goals++;
   if(shot.goal&&(shot.zone===0||shot.zone===2)&&shot.actualZone===shot.zone)data.totals.topCorners++;
   if(complete){data.totals.sessions++;if(goals===5)data.totals.perfectSessions++;}
   s.shots.push(shot);s.pending=null;result={shot:copy(shot),tokens:reward,bonus,complete,goals,attempt:index};
  });return ok?result:null;
 }
 function configure(options={}){bridge=options;}
 host.PenaltyStatsSystem=Object.freeze({KEY,CONFIG,STATS,validSave,validShot,cost,upgrade,openSession,prepareShot,commitShot,configure,snapshot:()=>copy(data),setSound:value=>change(()=>{data.sound=Boolean(value);}),flush:persist,reset:()=>{const before=data;data=fresh();if(persist())return true;data=before;return false;}});
})(window);
