/* The Solemn Lament: ammo, marks and temporary lives are battle-local. */
(function(host){
 'use strict';
 host.createMournerSkills=function(api){
  const ID='the-mourner',state=u=>api.passiveRuntimeFor(u,ID).mourner ||= {living:10,departed:10,lament:0,attacks:0,reload:false,crystalUsed:false,crystalPending:false,crystalArmed:false};
  const owns=u=>api.has(u,ID);
  function debuffs(u){const r=api.runtime(u);let n=['burn','bleed'].filter(k=>r[k]?.some(e=>e.turns>0)).length;for(const k of ['stunTurns','freezeTurns','weakenAttackTurns','snailTurns','noDodgeTurns','incomingVulnerabilityTurns','passiveSuppressionTurns','hindredTurns'])if(r[k]>0)n++;if(r.shibuyaHypnosis?.turns>0||r.deadlightsHypnosis?.turns>0)n++;if(Number.isInteger(r.deadlightsFearTurn)&&r.deadlightsFearTurn===api.currentBattle()?.turnCount)n++;if((r.mourningMarks||[]).some(m=>m.normal+m.crystal>0))n++;return n;}
  const condition=u=>owns(u)&&debuffs(u)>=2;
  function lament(u,delta){const c=state(u);c.lament=Math.max(0,Math.min(15,c.lament+delta));api.setAtk(u,'solemn-lament',c.lament*.03);if(c.lament===15&&!c.crystalUsed){c.crystalUsed=true;c.crystalPending=true;}api.refresh(u);}
  const marks=u=>api.runtime(u).mourningMarks ||= [];
  function mark(u,owner){let row=marks(u).find(m=>m.owner===owner);if(!row){row={owner,normal:0,crystal:0};marks(u).push(row);}return row;}
  function incoming(u){return 1+marks(u).reduce((n,m)=>n+m.normal*.05+m.crystal*.10,0);}
  function outgoing(u){return condition(u)?1.25:1;}
  function interrupted(bs,u){if(!owns(u)||!state(u).reload)return false;const c=state(u);if(c.reloadInterrupted)return false;c.reloadInterrupted=true;c.living=0;c.departed=0;api.dot(u,'burn',2,api.atk(u)*.10,u);api.log('[PASSIVE] Prayer interrupted: ammo lost; Burn for 2 turns.','debuff');return true;}
  function status(bs,u,key){if(!['stunTurns','freezeTurns'].includes(key))return false;if(condition(u))return true;interrupted(bs,u);return false;}
  function hitTaken(bs,u,meta={}){if(owns(u)&&!meta.dot)lament(u,1);}
  function corpse(bs,victim){
   for(const row of marks(victim)){const u=row.owner;if(!owns(u)||!api.alive(u))continue;const count=row.normal+row.crystal; if(count){lament(u,count*2);api.heal(u,u.maxHp*.025*count,'Butterflies of Mourning',bs,u);}}
   api.runtime(victim).mourningMarks=[];
  }
  function revive(bs,u){
   const team=api.team(bs,u),candidates=team.filter(v=>v!==u&&!api.alive(v)&&!v.mournerTemporaryLife&&!api.generated(v)&&!api.unrevivable(v));
   if(!candidates.length)return;const ally=candidates[Math.floor(api.random()*candidates.length)];
   ally.hp=ally.maxHp;ally.defeated=false;ally.mournerTemporaryLife={owner:u,expires:(bs.turnCount||0)+3};
   const old=team.indexOf(ally);team.splice(old,1);team.unshift(ally);if(team===bs.playerTeam)bs.playerIndex=0;else bs.enemyIndex=0;
   (api.runtime(ally).champion ||= {}).deathHandled=false;api.refresh(ally);api.indices(bs);api.revival(bs,ally);api.log('[PASSIVE] Final Requiem revives '+(ally.display?.name||ally.card.name)+' at full HP for 3 battle turns.','passive');
  }
  function endTurn(bs){
   for(const unit of api.all(bs)){const life=unit.mournerTemporaryLife;if(life&&life.expires<=(bs.turnCount||0)){unit.hp=0;unit.defeated=true;unit.mournerTemporaryLife=null;unit.mournerExpired=true;unit.championDismissed=true;(api.runtime(unit).champion ||= {}).deathHandled=true;api.refresh(unit);api.log('[PASSIVE] Requiem temporary life expired.','status');}}
  }
  function turn(bs,u){
   if(owns(u)){const r=api.runtime(u);if(condition(u)){r.stunTurns=0;r.freezeTurns=0;}else if(state(u).reload&&(r.stunTurns>0||r.freezeTurns>0))interrupted(bs,u);}
  }
  function attack(bs,u,target,options={}){
   if(api.id(u)!==ID)return null;const c=state(u),result={hit:false,damage:0,killed:false,target,attacker:u};
   const hit=(enemy,scale,extra={})=>{if(!api.alive(u)||!api.alive(enemy))return null;const shot=api.primary(bs,u,enemy,api.atk(u)*scale,{...options,...extra,specialAttack:true});result.hit ||= shot.hit;result.damage+=shot.damage||0;result.killed ||= shot.killed;return shot;};
   if(c.reload){c.reload=false;c.reloadInterrupted=false;c.living=10;c.departed=10;api.heal(u,u.maxHp*.30,'Prayer / Reload',bs,u);lament(u,3);api.log('[PASSIVE] Prayer: both chambers reloaded.','passive');return {...result,skipped:true,reloaded:true};}
   c.attacks++;
   if(c.crystalPending){c.crystalPending=false;c.crystalArmed=true;for(const enemy of api.enemies(bs,u)){if(!api.allowed(enemy,u))continue;mark(enemy,u).crystal+=3;for(let i=0;i<3;i++)api.dot(enemy,'bleed',3,api.atk(u)*.15,u);api.refresh(enemy);}api.log('[PASSIVE] Crystal Butterflies: 3 per enemy.','passive');return {...result,hit:true,crystal:true};}
   if(c.attacks%10===0){
    
    for(const enemy of [...api.enemies(bs,u)]){
     const row=marks(enemy).find(m=>m.owner===u),normal=row?.normal||0,crystal=row?.crystal||0,current=enemy.hp;
     if(row){row.normal=0;row.crystal=0;}
     hit(enemy,2.20,{mournerUnreducedDamage:current*(normal*.05+crystal*.10)});
    }
    revive(bs,u);lament(u,-10);u.hp=Math.max(1,u.hp-Math.floor(u.maxHp*.15));
    if(c.crystalArmed){c.crystalArmed=false;u.hp=u.maxHp;c.living=Math.min(10,c.living+5);c.departed=Math.min(10,c.departed+5);c.reload=c.living===0||c.departed===0;}
    api.refresh(u);api.log('[PASSIVE] Final Requiem.','passive');return {...result,requiem:true};
   }
   const both=api.random()<.30,living=both||api.random()<.50,departed=both||!living;
   if(living){c.living--;const enemy=api.alive(target)?target:api.enemies(bs,u)[0];if(enemy){const altered=condition(u),shot=hit(enemy,.90,{mournerUnreducedDamage:altered?api.atk(u)*.20*1.25:0});if(shot?.hit&&api.alive(u)){if(!altered)api.heal(u,u.maxHp*(u.hp<u.maxHp*.50?.04:.02),'Living Ammo',bs,u);}}}
   if(departed&&api.alive(u)){c.departed--;const enemy=api.alive(target)?target:api.enemies(bs,u)[0];if(enemy){const shot=hit(enemy,.80);if(shot?.hit&&api.alive(enemy)&&api.allowed(enemy,u)){const row=mark(enemy,u),added=Math.min(10-row.normal,condition(u)?2:1);row.normal+=added;for(let i=0;i<added;i++)api.dot(enemy,'bleed',1,api.atk(u)*.05,u);api.refresh(enemy);}}}
   c.reload=c.living<=0||c.departed<=0;api.refresh(u);return result;
  }
  function badges(u){const rows=[];if(owns(u)){const c=state(u);rows.push({icon:'◈',label:`AMMO ${c.living} / ${c.departed} · LAMENT ${c.lament}/15 · ATTACK ${c.attacks}`,tone:'passive',category:'passive'});if(c.reload)rows.push({icon:'↻',label:'RELOAD PENDING',tone:'status',category:'status'});if(condition(u))rows.push({icon:'◆',label:'LAMENT CONDITION',tone:'buff',category:'buff'});}const n=marks(u).reduce((t,m)=>t+m.normal,0),c=marks(u).reduce((t,m)=>t+m.crystal,0);if(n||c)rows.push({icon:'♧',label:`BUTTERFLY ${n} · CRYSTAL ${c}`,tone:'debuff',category:'status'});if(u.mournerTemporaryLife)rows.push({icon:'⌛',label:'REQUIEM · TEMPORARY LIFE',tone:'buff',category:'buff'});return rows;}
  return {ID,state,debuffs,condition,marks,incoming,outgoing,hitTaken,corpse,status,turn,endTurn,attack,badges};
 };
})(window);
