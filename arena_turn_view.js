/* Standard Arena presentation: no timers, mutations, or combat decisions. */
(function(host){
 'use strict';
 const doc=host.document;
 const recovery=new WeakMap();
 const $=id=>doc.getElementById(id);
 const write=(node,value)=>{if(node&&node.textContent!==value)node.textContent=value;};
 function hide(){const root=$('battleTurnFeedback');if(root){root.hidden=true;delete root.dataset.state;delete root.dataset.side;}}
 function eligible(bs,runtime){
  return Boolean(bs?.isBattling&&!bs.finished&&runtime?.isStandardTurn?.(bs)&&!host.PortalCombatView?.active&&!host.InfinityViewSystem?.active);
 }
 function render(bs,runtime){
  const root=$('battleTurnFeedback');if(!root)return;
  if(!eligible(bs,runtime)){hide();return;}
  const next=bs.turn==='enemy'?'enemy':'player',nextName=next==='enemy'?'Enemy':'Player';
  const delay=Number.isFinite(bs.nextTurnAt)?Math.max(0,Math.ceil((bs.nextTurnAt-Date.now())/1000)):0;
  write($('battleStatus'),nextName.toUpperCase()+' STRIKE IN '+delay+'s');
  const fallback=recovery.get(bs),record=fallback&&fallback.currentTurn===bs.currentTurn?fallback:runtime.getTurnFeedback(bs);
  const side=record?.side||next,sideName=side==='enemy'?'Enemy':'Player';
  let kind=record?.kind||'ready',title=nextName+' turn',detail='First strike begins automatically.',badge='AUTO';
  if(record){
   const reason=record.reasons?.join(' / ')||'Incapacitated';
   if(kind==='skipped'){title='Unable to attack';detail=reason+' • '+record.actor;badge='SKIPPED';}
   else if(kind==='charging'){title='Preparing a skill';detail=reason+' • '+record.actor;badge='CHARGING';}
   else if(kind==='waiting'){title='Waiting';detail=reason+' • '+record.actor;badge='WAITING';}
   else if(kind==='missed'){title='Attack missed';detail=reason+' • '+record.actor;badge='RESOLVED';}
   else{title=sideName+' strike resolved';detail=record.actor+' • Auto combat continues';badge='RESOLVED';}
  }
  root.hidden=false;root.dataset.state=kind;root.dataset.side=side;
  write($('battleTurnSide'),sideName.toUpperCase());
  write($('battleTurnTitle'),title);
  const detailNode=$('battleTurnDetail');write(detailNode,detail);if(detailNode&&detailNode.title!==detail)detailNode.title=detail;
  write($('battleTurnAuto'),badge);
 }
 function reportRecovery(bs){
  if(!bs)return;
  const side=bs.turn==='enemy'?'enemy':'player',actor=side==='enemy'?bs.enemy:bs.player;
  recovery.set(bs,{currentTurn:bs.currentTurn,side,kind:'skipped',actor:actor?.display?.name||actor?.card?.name||'Fighter',reasons:['Turn interrupted; combat continues']});
 }
 host.ArenaTurnView=Object.freeze({render,refresh:render,hide,reportRecovery});
})(window);
