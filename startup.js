/* Local-first startup: gameplay loads independently of optional online services. */
(function(host){
 'use strict';
 const doc=host.document,issues=new Map(),callbacks=new Set();let loaded=false,failed=false,loadJob=null;
 function domReady(callback){if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',callback,{once:true});else callback();}
 function render(){
  if(!doc.body)return;let box=doc.getElementById('gameStartupNotice');if(!issues.size){box?.remove();return;}
  if(!box){box=doc.createElement('div');box.id='gameStartupNotice';box.setAttribute('role','alert');Object.assign(box.style,{position:'fixed',top:'8px',left:'12px',right:'12px',zIndex:'10000',padding:'12px',background:'#321c28',color:'#fff',border:'1px solid #eaa1b1',borderRadius:'8px',font:'12px/1.5 sans-serif'});doc.body.append(box);}
  box.textContent=[...issues.values()].join(' ')+' Reload after uploading the complete update; filenames are case-sensitive.';
 }
 function report(key,message,error){issues.set(key,message);if(error)host.console?.error?.('[Game startup] '+message,error);render();}
 function clear(key){issues.delete(key);render();}
 function validate(){
  for(const name of ['InfinityCloudSystem','InfinityRules','InfinitySystem','InfinityViewSystem','InfinityCombat','ShopBulkSystem','CloudSaveSystem','OnlineUtils','PvPSystem','PvPView','PvPCombat','LeaderboardSystem','ExpFoodSystem','createCombatStats','QuestsSystem','CraftingSystem','EquipmentSystem','StorageSystem','DropAudioSystem','PotionHudSystem','SettingsSystem','UIPerformanceSystem','createReaganSkills','createRequiemSkills','createFateSkills','createSpookySkills','createGomenSkills','createShibuyaSkills','createCompanionRules','BattleWeatherHud','SpookySystem','CategorySystem','createYunoSkills','createGrimoireSkills','RollPerformanceSystem'])if(!host[name])report('startup:'+name,'Could not load '+name+'; upload the complete update.');
  for(const[name,control]of [['RollViewSystem','hideRollingCardToggle'],['SandboxSystem','sandboxOpenButton']])if(!host[name]?.ready){const node=doc.getElementById(control);if(node)node.disabled=true;report('startup:'+name,name+' could not initialize.');}
  if(issues.size)throw Error([...issues.values()].join(' '));
 }
 async function loadGame(){
  if(loaded)return;if(loadJob)return loadJob;
  loadJob=(async()=>{for(const declaration of doc.querySelectorAll('script[data-game-script]'))await host.OnlineUtils.loadGameScript(declaration);validate();loaded=true;for(const callback of callbacks)callback();callbacks.clear();})();
  try{await loadJob;}catch(error){failed=true;report('startup:runtime',error.message);throw error;}finally{loadJob=null;}
 }
 function ready(callback){if(loaded)queueMicrotask(callback);else callbacks.add(callback);}
 doc.addEventListener('error',event=>{const node=event.target;if(node?.dataset?.onlineResource==='true')return;if(node?.tagName!=='SCRIPT'&&!(node?.tagName==='LINK'&&node.rel==='stylesheet'))return;report('resource:'+(node.src||node.href),'Could not load '+(node.src||node.href).split('/').pop()+'.');},true);
 host.addEventListener('error',event=>{if(event.filename&&[...doc.querySelectorAll('script[data-online-resource="true"]')].some(node=>node.src===event.filename))return;if(event.target===host&&event.filename&&event.message)report('script:'+event.filename,'A game script could not initialize: '+event.filename.split('/').pop()+'.',event.error);});
 host.GameStartup=Object.freeze({report,clear,ready,loadGame,get failed(){return failed;},get loaded(){return loaded;},get locked(){return false;}});
 domReady(()=>{void loadGame().then(()=>host.CloudSaveSystem.start()).catch(()=>{});});
})(window);
