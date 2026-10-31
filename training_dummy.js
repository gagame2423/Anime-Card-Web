/* EXP-only target and batched damage HUD. Other modes never enter these hooks. */
(function(host){
 'use strict';
 const HP=999999999,ATK=1,EXP_PER_DAMAGE=.1,MAX=Number.MAX_SAFE_INTEGER;
 let active=null,root=null,counter=null,dpsNode=null,bestNode=null,frame=null,shown=0,target=0,from=0,started=0;
 const number=value=>Math.max(0,Math.floor(Number(value)||0)).toLocaleString('en-US');
 function isTarget(battle,unit){return battle?.mode==='exp-time-trial'&&unit?.isExpTrainingDummy===true;}
 function create(){
  const card={id:'exp-training-dummy',name:'EXP Training Dummy',chance:1,stats:{hp:HP,atk:ATK},image:'',passive:{name:'Training Dummy',description:'Infinite training target. Fixed 1 ATK. Total damage converts to EXP at the end of the 5-minute trial.'}};
  const unit={card,display:{name:card.name,hp:HP,atk:ATK},hp:HP,maxHp:HP,mutations:[],level:1,defeated:false,isExpTrainingDummy:true};
  Object.defineProperty(unit,'atk',{enumerable:true,get:()=>ATK,set:()=>{}});return unit;
 }
 function restore(unit){unit.hp=HP;unit.maxHp=HP;unit.defeated=false;}
 function record(battle,source,amount){
  if(!battle?.trial||battle.finished||Date.now()>=battle.trial.deadline||!battle.playerTeam.includes(source))return 0;
  const damage=Math.min(MAX-(battle.trial.totalDamage||0),Math.max(0,Math.floor(Number(amount)||0)));
  if(!(damage>0))return 0;battle.trial.totalDamage=(battle.trial.totalDamage||0)+damage;
  battle.damageTotals||={player:0,enemy:0};battle.damageTotals.player=Math.min(MAX,(battle.damageTotals.player||0)+damage);
  if(active===battle)host.RollPerformanceSystem.schedule(update);return damage;
 }
 function hit(battle,source,unit,amount){const damage=record(battle,source,amount);restore(unit);return damage;}
 function observe(battle,source,unit,previousHp){
  // An instant-kill HP assignment cannot kill an infinite target or award fake damage.
  const damage=Math.max(0,previousHp-Math.max(0,unit.hp));if(damage<HP)record(battle,source,damage);restore(unit);
 }
 function expForDamage(damage){return Math.floor(Math.min(MAX,Math.max(0,Number(damage)||0))*EXP_PER_DAMAGE);}
 function cancel(){if(frame!==null)host.cancelAnimationFrame(frame);frame=null;host.RollPerformanceSystem.cancel(update);}
 function animate(now){
  frame=null;if(!active||!counter)return;const t=Math.min(1,(now-started)/180);shown=from+(target-from)*(1-Math.pow(1-t,3));counter.textContent=number(shown);
  if(t<1)frame=host.requestAnimationFrame(animate);
 }
 function update(){
  if(!active||!counter)return;const value=active.trial.totalDamage||0;
  if(value!==target){from=shown;target=value;started=host.performance.now();counter.dataset.total=String(target);cancel();if(host.matchMedia?.('(prefers-reduced-motion: reduce)').matches){shown=target;counter.textContent=number(target);}else frame=host.requestAnimationFrame(animate);}
  const seconds=Math.max(1,Math.min(300,(Date.now()-active.trial.startedAt)/1000));dpsNode.textContent='DPS '+number(value/seconds);bestNode.textContent='Best DPS '+number(host.TimeTrialSystem.bestDps);
 }
 function render(battle){
  root ||= host.document.getElementById('trainingDamageHud');if(!root)return;
  const visible=battle?.mode==='exp-time-trial'&&Boolean(battle.trial)&&!battle.finished;
  root.hidden=!visible;
  if(!visible){cancel();active=null;return;}
  if(active!==battle){cancel();active=battle;counter=host.document.getElementById('trainingDamageTotal');dpsNode=host.document.getElementById('trainingDamageDps');bestNode=host.document.getElementById('trainingDamageBest');shown=target=0;counter.textContent='0';counter.dataset.total='0';}
  update();
 }
 host.TrainingDummySystem=Object.freeze({HP,ATK,EXP_PER_DAMAGE,create,isTarget,restore,record,hit,observe,expForDamage,render,hide:()=>render(null)});
})(window);
