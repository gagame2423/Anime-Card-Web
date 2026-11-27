/* Delegated UI sounds plus result transitions. Observe only actual dialog roots,
   not the combat DOM subtree (which updates every animation frame). */
(function(host){
 'use strict';
 const doc=host.document,A=host.GameAudio;
 const element=e=>e?.target instanceof Element?e.target:e?.target?.parentElement;
 const ignored='#ballArenaModal,#sailingSeaModal';
 const ownEntry='#hubSailingButton,#hubBallButton,#ballArenaOpenButton,#hubAutoChessButton,#autochessOpenButton,[aria-controls="sailingSeaModal"],[aria-controls="ballArenaModal"],[aria-controls="autochessModal"]';
 doc.addEventListener('click',e=>{
  const node=element(e)?.closest('button,a[href],[role="button"],[role="tab"],summary');
  if(!node||node.disabled||node.getAttribute('aria-disabled')==='true'||node.closest(ignored)||node.matches(ownEntry))return;
  if(node.id==='sfxToggleButton'||node.matches('#rollButton'))return;
  const action=node.dataset.acAction;
  if(action&&['buy','sell','refresh','reroll','xp','buyXP','fuse','deploy','draft','travel'].includes(action))return;
  const key=node.matches('[role="tab"],[data-tab],[data-mode],.hub-command__item')?'tab_switch':'ui_click';
  A.play(key);
 },true);
 doc.addEventListener('change',e=>{
  const node=element(e);
  if(!node?.closest(ignored)&&node?.matches('#previewMutationSelect,#arenaMutationModal select'))A.play('mutation_change');
 },true);
 const seen=new WeakMap();
 const dialogs=Array.from(doc.querySelectorAll('.modal-backdrop,dialog,[aria-modal="true"]')).filter(n=>!n.closest(ignored)&&n.id!=='autochessModal');
 const result=doc.getElementById('battleVictory');
 function visible(n){return !n.hidden&&!n.classList.contains('hidden')&&n.getAttribute('aria-hidden')!=='true'&&(n.tagName!=='DIALOG'||n.open);}
 function resultState(){return result&&visible(result)&&result.classList.contains('battle-result--victory')?'victory':result&&visible(result)&&result.classList.contains('battle-result--defeat')?'defeat':null;}
 let previousResult=resultState();
 const observer=new MutationObserver(records=>{
  const nodes=new Set(records.map(r=>r.target));
  for(const n of nodes){
   if(n===result){const state=resultState();if(state&&state!==previousResult&&!host.BallArena?.active&&!host.SailingSea?.active&&!host.AutoChessView?.active)A.play(state,'main');previousResult=state;continue;}
   const open=visible(n),before=seen.get(n);seen.set(n,open);
   if(open!==before&&!n.closest(ignored))A.play(open?'modal_open':'modal_close');
  }
 });
 for(const n of dialogs){seen.set(n,visible(n));observer.observe(n,{attributes:true,attributeFilter:['hidden','class','open','aria-hidden']});}
 if(result)observer.observe(result,{attributes:true,attributeFilter:['hidden','class','aria-hidden']});
 // Deduplicated cue routing from the live Standard/Portal/Infinity presentation.
 function liveCombat(){return !host.BallArena?.active&&!host.SailingSea?.active&&!host.AutoChessView?.active&&!host.SandboxSystem?.active&&visible(doc.getElementById('battleModal')||doc.body);}
 host.MainGameAudio=Object.freeze({
  log(message,tone){if(!liveCombat())return;const cue=A.combatCue(message,tone);if(cue)A.play(cue,'main');},
  float(text,tone){if(!liveCombat())return;const cue=A.combatCue(text,tone);if(cue)A.play(cue,'main');},
  play:key=>A.play(key,'main')
 });
})(window);
