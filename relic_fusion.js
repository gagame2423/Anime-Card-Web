/* Relic Fusion selection and dialogs. Inventory transactions live in relics.js. */
(function(host){
 'use strict';
 let bridge={},ui=null,session=null,dialog=null,busy=false;
 const doc=host.document,make=(tag,cls='',text)=>{const n=doc.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const core=()=>host.RelicSystem;
 const current=()=>session?core().fusionPlan(session.baseId,[...session.ids]):null;
 const label=rule=>rule?.rarity.toUpperCase()+(rule?.unique?' · UNIQUE':'');
 function matches(item){return Boolean(session&&core().fusionMatches(core().get(session.baseId),item));}
 function sync(){
  if(!session||busy)return;
  if(!core().fusionRule(core().get(session.baseId))){cancel();return;}
  for(const id of session.ids)if(!matches(core().get(id)))session.ids.delete(id);
 }
 function start(baseId){
  if(session||bridge.canAct?.()===false||!core().fusionRule(core().get(baseId))||!mount())return false;
  session={baseId,ids:new Set([baseId])};bridge.begin?.(baseId);renderControls();return true;
 }
 function toggle(id){
  if(!session||busy||id===session.baseId||!matches(core().get(id)))return false;
  const rule=core().fusionRule(core().get(session.baseId));
  if(session.ids.has(id))session.ids.delete(id);else if(session.ids.size<rule.required)session.ids.add(id);else return false;
  bridge.refresh?.();return true;
 }
 function renderControls(){
  if(!ui)return;const plan=current();ui.controls.hidden=!session;
  ui.count.textContent=session?`Selected: ${session.ids.size} / ${plan.rule?.required||0}`:'';
  ui.detail.textContent=plan?.rule?`${plan.base.name} · ${plan.base.metadata.relic.rarity.toUpperCase()} → ${label(plan.rule)}`:'';
 }
 function restoreParent(){
  if(!dialog)return;const {parent,inert,ariaHidden}=dialog;
  if(parent){parent.inert=inert;if(ariaHidden===null)parent.removeAttribute('aria-hidden');else parent.setAttribute('aria-hidden',ariaHidden);}
 }
 function closeDialog(){
  if(!dialog||busy)return;const opener=dialog.opener;restoreParent();dialog=null;ui.root.classList.add('hidden');
  doc.body.classList.toggle('modal-open',Boolean(doc.querySelector('.modal-backdrop:not(.hidden)')));
  if(opener?.isConnected)opener.focus({preventScroll:true});
 }
 function cancel(){
  if(busy)return;closeDialog();if(!session)return;session=null;bridge.end?.(null);renderControls();
 }
 function showDialog(phase){
  const parent=doc.getElementById('inventoryModal');dialog={phase,parent,inert:parent?.inert||false,ariaHidden:parent?.getAttribute('aria-hidden')??null,opener:doc.activeElement};
  ui.root.classList.remove('hidden');doc.body.classList.add('modal-open');
  ui.decline.focus({preventScroll:true});if(parent){parent.inert=true;parent.setAttribute('aria-hidden','true');}
 }
 function openConfirmation(){
  const plan=current();if(!plan?.ready||busy||!mount())return false;
  ui.root.classList.remove('is-success','is-failure');ui.title.textContent='Confirm Relic Fusion';ui.art.replaceChildren();
  ui.summary.textContent=`Consume ${plan.ids.length}× ${plan.base.name} (${plan.base.metadata.relic.rarity.toUpperCase()}) for 1× ${label(plan.rule)}.`;
  ui.description.textContent=plan.configured?`Success: ${(plan.rule.successRate*100).toFixed(1)}%. On failure, all selected Relics are permanently lost and no item is awarded.`:'Fusion success rates are not configured. No Relics will be consumed.';
  const bound=plan.ids.filter(id=>core().get(id)?.metadata.binding).length;
  if(bound)ui.description.textContent+=` ${bound} selected Relic(s) are equipped; consuming them removes their bindings.`;
  ui.confirm.hidden=false;ui.confirm.disabled=!plan.configured;ui.decline.textContent='Decline';ui.error.textContent='';
  showDialog('confirm');return true;
 }
 function press(baseId){return session?openConfirmation():start(baseId);}
 function showResult(result){
  const item=result.item;ui.title.textContent=result.success?'Fusion Successful':'Fusion Failed';
  ui.summary.textContent=result.message;ui.description.textContent=item?core().describe(item.metadata.relic):'No item awarded.';ui.art.replaceChildren();
  if(item){const frame=make('div','fusion-result-art'),fallback=make('span','','◆'),image=make('img');image.src=item.image;image.alt=item.name;image.addEventListener('error',()=>image.remove(),{once:true});image.addEventListener('load',()=>{fallback.hidden=true;},{once:true});frame.append(fallback,image);ui.art.append(frame,make('h3','',item.name),make('strong','fusion-result-rarity',label({rarity:item.metadata.relic.rarity,unique:item.metadata.relic.unique})));}
  ui.root.classList.toggle('is-success',result.success);ui.root.classList.toggle('is-failure',!result.success);
  dialog.phase='result';ui.confirm.hidden=true;ui.decline.textContent='Close';ui.error.textContent='';ui.decline.focus({preventScroll:true});
 }
 function confirm(){
  if(busy||dialog?.phase!=='confirm'||!session)return;
  busy=true;ui.confirm.disabled=true;
  let result;try{result=core().fuse(session.baseId,[...session.ids]);}finally{busy=false;}
  if(!result.ok){ui.error.textContent=result.message;ui.confirm.disabled=true;bridge.refresh?.();return;}
  session=null;bridge.end?.(result.item?.id||'');renderControls();showResult(result);
 }
 function mount(){
  if(ui)return true;const get=id=>doc.getElementById(id),next={controls:get('relicFusionControls'),count:get('relicFusionCount'),detail:get('relicFusionDetails'),cancel:get('relicFusionCancel'),root:get('relicFusionModal'),title:get('relicFusionTitle'),summary:get('relicFusionSummary'),description:get('relicFusionDescription'),art:get('relicFusionResult'),error:get('relicFusionError'),confirm:get('relicFusionConfirm'),decline:get('relicFusionDecline'),close:get('relicFusionClose')};
  if(Object.values(next).some(n=>!n))return false;ui=next;
  ui.cancel.addEventListener('click',cancel);ui.confirm.addEventListener('click',confirm);ui.decline.addEventListener('click',closeDialog);ui.close.addEventListener('click',closeDialog);
  ui.root.addEventListener('click',e=>{if(e.target===ui.root){e.stopImmediatePropagation();closeDialog();}},true);
  doc.addEventListener('keydown',e=>{
   if(dialog&&e.key==='Tab'){const buttons=[...ui.root.querySelectorAll('button:not(:disabled):not([hidden])')],first=buttons[0],last=buttons.at(-1);if(!buttons.includes(doc.activeElement)||e.shiftKey&&doc.activeElement===first||!e.shiftKey&&doc.activeElement===last){e.preventDefault();(e.shiftKey?last:first)?.focus();}}
   if(e.key!=='Escape'||!dialog&&!session)return;
   e.preventDefault();e.stopImmediatePropagation();if(dialog)closeDialog();else cancel();
  },true);return true;
 }
 host.RelicFusionSystem=Object.freeze({start,toggle,press,cancel,closeDialog,matches,sync,renderControls,
  selected:id=>Boolean(session?.ids.has(id)),get full(){return Boolean(session&&session.ids.size>=current()?.rule?.required);},get baseId(){return session?.baseId||'';},get active(){return Boolean(session);},get ready(){return Boolean(current()?.ready);},get count(){return session?.ids.size||0;},get required(){return current()?.rule?.required||0;},get signature(){return session?session.baseId:'none';},get dialogOpen(){return Boolean(dialog);},get mounted(){return Boolean(ui);},configure(options){bridge=options||{};mount();}});
})(window);
