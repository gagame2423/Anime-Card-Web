/* Portal inventory, recoverable rewards and Storage-only setup controller. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_portals_v1',MAIN='anime_card_rng_save_v1',R=host.PortalRules,U=host.OnlineUtils;
 const clone=value=>JSON.parse(JSON.stringify(value)),fresh=()=>({version:1,playerId:U.token(),portals:{},daily:{day:'',hosted:0},active:null,receipts:{trial:'',result:''},pending:null});
 const safeId=id=>typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
 function validSave(value){return Boolean(value&&value.version===1&&safeId(value.playerId)&&value.portals&&typeof value.portals==='object'&&!Array.isArray(value.portals)&&Object.entries(value.portals).every(([id,p])=>safeId(id)&&p?.id===id&&R.validPortal(p))&&value.daily&&typeof value.daily.day==='string'&&Number.isInteger(value.daily.hosted)&&value.daily.hosted>=0&&value.daily.hosted<=10&&value.pending===null&&value.receipts&&['trial','result'].every(key=>value.receipts[key]===''||safeId(value.receipts[key]))&&(value.active===null||value.active&&safeId(value.active.id)&&typeof value.active.host==='boolean'&&typeof value.active.portalId==='string'&&Number.isSafeInteger(value.active.startedAt)&&R.validPortal(value.active.portal)));}
 let data,blocked=false,bridge={},ui=null,selectedPortal=null,selection=[],activeSlot=0,page=0,searchTimer=null,statusMessage='',setup=false;
 function read(){let saved;try{saved=JSON.parse(host.localStorage.getItem(KEY)||'null');if(saved?.pending){const journal=saved.pending;if(typeof journal.portalBefore!=='string'||typeof journal.itemsBefore!=='string'||typeof journal.mainBefore!=='string'||!validSave(JSON.parse(journal.portalBefore)))throw Error('Invalid Portal recovery.');host.localStorage.setItem(host.InventorySystem.KEY,journal.itemsBefore);host.localStorage.setItem(MAIN,journal.mainBefore);host.localStorage.setItem(KEY,journal.portalBefore);host.InventorySystem.reload();saved=JSON.parse(journal.portalBefore);}
  if(saved&&!validSave(saved))throw Error('Invalid Portal save.');return saved||fresh();}catch(error){blocked=true;host.GameStartup?.report('portal-storage','Portal save recovery is required; progress has been preserved.',error);return null;}}
 data=read();
 function persist(){if(blocked||!data)return false;try{host.localStorage.setItem(KEY,JSON.stringify(data));host.CloudSaveSystem?.markDirty();return true;}catch(error){host.console.warn('Portal save unavailable',error);return false;}}
 function transact(next,items,main){
  if(blocked||!data)return false;
  const portalBefore=JSON.stringify(data),itemsBefore=host.localStorage.getItem(host.InventorySystem.KEY),mainBefore=host.localStorage.getItem(MAIN)||'null';
  try{host.localStorage.setItem(KEY,JSON.stringify({...data,pending:{portalBefore,itemsBefore,mainBefore}}));host.localStorage.setItem(host.InventorySystem.KEY,JSON.stringify(items));if(main)host.localStorage.setItem(MAIN,main);host.localStorage.setItem(KEY,JSON.stringify(next));data=next;host.InventorySystem.reload();host.CloudSaveSystem?.markDirty();return true;}
  catch(error){try{host.localStorage.setItem(host.InventorySystem.KEY,itemsBefore);host.localStorage.setItem(MAIN,mainBefore);host.localStorage.setItem(KEY,portalBefore);host.InventorySystem.reload();}catch(recovery){blocked=true;host.GameStartup?.report('portal-storage','Reload to recover an unfinished Portal transaction.');}return false;}
 }
 function inventory(){if(!host.InventorySystem.flush())throw Error('Unable to save Storage.');return JSON.parse(host.localStorage.getItem(host.InventorySystem.KEY));}
 function syncItem(items,p){items.items[p.id]=R.item(p);}
 function removeItem(items,id){delete items.items[id];}
 function newPortal(next,items,tier=1,random=Math.random){const p=R.create('portal_namek_'+U.token(10),tier,random);next.portals[p.id]=p;syncItem(items,p);return p;}
 function lose(next,items,id){const p=next.portals[id];if(!p)return;if(--p.attempts===0){delete next.portals[id];removeItem(items,id);}else syncItem(items,p);}
 function recoverInterrupted(){if(!data?.active)return;try{const next=clone(data),items=inventory();if(next.active.host)lose(next,items,next.active.portalId);next.active=null;if(!transact(next,items))blocked=true;}catch(error){blocked=true;}}
 recoverInterrupted();if(data&&!blocked)persist();
 function dropTimeTrial(battle,won,random=Math.random){
  if(!won||battle?.mode!=='time-trial'||battle.sandbox||!battle.trial?.id||blocked)return false;
  const receipt=battle.trial.id;if(data.receipts.trial===receipt)return false;
  const next=clone(data);next.receipts.trial=receipt;
  try{const items=inventory(),p=random()<.40?newPortal(next,items,1,random):null;if(!transact(next,items))throw Error('Portal drop could not be saved.');if(p)bridge.notify?.('Namek Portal Tier 1 received! Open Storage → Portals.');return Boolean(p);}catch(error){host.console.warn(error.message);return false;}
 }
 function daily(){const day=new Date().toISOString().slice(0,10);return data.daily.day===day?{...data.daily}:{day,hosted:0};}
 function begin(id,portal,party=false,isHost=true){
  const saved=JSON.parse(host.localStorage.getItem(KEY)||'null');if(!validSave(saved))throw Error('Portal save is busy or unavailable.');data=saved;
  if(blocked||!safeId(id)||data.active||!R.validPortal(portal)||isHost&&!data.portals[portal.id])throw Error('Portal is unavailable.');
  if(isHost&&U.stable(portal)!==U.stable(data.portals[portal.id]))throw Error('Portal details changed. Reopen this item from Storage.');
  if(party&&![4,5,'secret'].includes(portal.tier))throw Error('Party requires Tier 4, Tier 5 or Secret.');
  const next=clone(data),today=daily();if(party&&isHost){if(today.hosted>=10)throw Error('Daily limit: 10 hosted Portals (resets 00:00 UTC).');today.hosted++;next.daily=today;}
  next.active={id,portalId:isHost?portal.id:'',host:isHost,startedAt:Date.now(),portal:clone(portal)};if(!transact(next,inventory()))throw Error('Unable to save the Portal attempt.');
 }
 function finish(result,random=Math.random){
  if(blocked||!result||!safeId(result.id)||!data.active||data.active.id!==result.id)return null;
  if(data.receipts.result===result.id)return null;
  const attempt=data.active,next=clone(data),portal=attempt.host?next.portals[attempt.portalId]:(attempt.portal||result.portal);
  if(!R.validPortal(portal))throw Error('Portal attempt no longer exists.');
  const summary={won:Boolean(result.won),beans:0,card:null,secretPortal:false,upgraded:false,remaining:portal.attempts,mvp:Boolean(result.mvp),guest:!attempt.host};
  const items=inventory();let main=null;
  if(result.won){
   const range=R.beanRange(portal.tier),base=R.integer(range.min,range.max,random),factor=(attempt.host?1:.5)*(result.mvp?3:1),exact=base*factor;
   summary.beans=Math.floor(exact)+(random()<exact%1?1:0);
   items.items.senzu_bean.quantity=Math.min(Number.MAX_SAFE_INTEGER,items.items.senzu_bean.quantity+summary.beans);
   if(portal.tier==='secret'&&random()<(result.party ? .10 : 1)){
    const mutationIds=bridge.rollMutations?.()||[];main=bridge.prepareCard?.('broly',mutationIds);if(!main)throw Error('Unable to prepare Broly reward.');summary.card='Broly';summary.mutationIds=mutationIds.map(m=>typeof m==='string'?m:m.id);summary.cardLabel=summary.mutationIds.map(id=>host.MUTATION_BY_ID[id]?.name||id).concat('Broly').join(' · ');
   }
   if(portal.tier===5&&random()<.01){const exactPortals=factor,copies=Math.floor(exactPortals)+(random()<exactPortals%1?1:0);for(let i=0;i<copies;i++)newPortal(next,items,'secret',random);summary.secretPortal=copies;}
   if(attempt.host&&portal.tier==='secret'){delete next.portals[attempt.portalId];removeItem(items,attempt.portalId);summary.consumed=true;summary.remaining=0;}
   else if(attempt.host){
    if(portal.tier!=='secret'&&portal.tier<5&&random()<.5){portal.tier++;summary.upgraded=true;}
    syncItem(items,portal);
   }
  }else if(attempt.host){lose(next,items,attempt.portalId);summary.remaining=next.portals[attempt.portalId]?.attempts||0;}
  next.active=null;next.receipts.result=result.id;
  if(!transact(next,items,main))throw Error('Unable to save Portal result. The attempt remains pending.');
  bridge.onReward?.(summary);return summary;
 }
 function discard(ids){
  if(blocked||setup||data.active||host.PortalParty?.active||host.PortalCombatView?.active||!Array.isArray(ids)||!ids.length||ids.length>500||new Set(ids).size!==ids.length||ids.some(id=>!data.portals[id]))return false;
  const next=clone(data),items=inventory();for(const id of ids){delete next.portals[id];removeItem(items,id);}return transact(next,items);
 }
 function abort(){if(!data?.active)return;finish({id:data.active.id,portal:data.active.portal||data.portals[data.active.portalId],won:false});}
 const el=id=>host.document.getElementById(id),text=(id,value)=>U.text(el(id),value);
 function message(value){statusMessage=String(value||'');text('portalStatus',statusMessage);}
 function quota(){return host.PortalParty?.active?host.PortalParty.quota:4;}
 function owned(){return bridge.cards?.()||[];}
 function variants(id){return bridge.variants?.(id)||[];}
 function wire(slot){const card=owned().find(c=>c.id===slot.cardId),variant=variants(slot.cardId).find(v=>v.key===slot.variantKey);if(!card||!variant)throw Error('Selected card variant is no longer owned.');return{cardId:card.id,level:bridge.describe(card,variant).level,mutationIds:variant.mutations.map(m=>m.id),copy:slot.copy||0,relic:host.RelicSystem.snapshotFor(card.id,variant.key,slot.copy||0)};}
 function cardsReady(){try{return bridge.selection?.().length===quota()&&bridge.selection().every(Boolean);}catch(_){return false;}}
 function getWires(){const slots=bridge.selection?.()||[];if(slots.length!==quota()||!slots.every(Boolean))throw Error('Fill all team slots first.');return slots.map(wire);}
 function resetSelection(){bridge.selector?.(quota(),true);renderPicker();}
 function renderPicker(){if(!setup||host.PortalCombatView?.active)return;bridge.selector?.(quota(),false,Boolean(host.PortalParty?.locked));ui.ready.disabled=!host.PortalParty?.canReady;text('portalReady',host.PortalParty?.locked?'✓ Ready / Waiting':'Lock In / Ready');}
 function inspector(portal){
  selectedPortal=clone(portal);text('portalTitle','Namek Portal · '+R.tierName(portal.tier));text('portalModifiers',`Enemy Element: ${portal.element} · ${portal.category} player cards: +${portal.bonus}% HP/ATK · Enemy scaling x${R.MULTIPLIERS[portal.tier]}`);
  text('portalAttempts',`${portal.attempts} / 5 attempts · 2s turns · Speed Battle Potion ignored`);
  const range=R.beanRange(portal.tier);text('portalRewards',`${range.min}–${range.max} Senzu Beans per clear${portal.tier==='secret'?' · Broly: Solo 100% / Party 10%':''} · Tier 1–4: 50% upgrade · Tier 5: 1% Secret Portal`);
  ui.party.disabled=![4,5,'secret'].includes(portal.tier)||daily().hosted>=10;ui.party.title='Tier 4, Tier 5 or Secret; maximum 10 hosted starts/day (UTC).';ui.solo.disabled=false;
 }
 function open(id){if(!mount()||blocked||!bridge.canEnter?.()||!data.portals[id])return false;setup=true;selectedPortal=clone(data.portals[id]);bridge.onEnter?.();bridge.open?.('portalModal');inspector(selectedPortal);ui.room.hidden=true;ui.builder.hidden=true;ui.choices.hidden=false;message('Inspect modifiers, then choose Solo or Party.');return true;}
 function join(){if(!mount()||blocked||!bridge.canEnter?.())return false;setup=true;selectedPortal=null;bridge.onEnter?.();bridge.open?.('portalModal');text('portalTitle','Join Portal Party');text('portalModifiers','Host must provide a Tier 4, Tier 5 or Secret Portal.');text('portalAttempts','Guests do not consume their own Portal attempts.');text('portalRewards','Guests earn 50% rewards; 4-player MVP earns x3 item rewards.');ui.choices.hidden=true;ui.builder.hidden=true;ui.room.hidden=false;host.PortalParty.reset();message('Enter a Portal Room ID to join friends.');return true;}
 function partyChanged(info){if(info.portal)inspector(info.portal);ui.choices.hidden=true;ui.room.hidden=false;ui.builder.hidden=!info.connected;ui.ready.hidden=false;ui.hostStart.hidden=!info.isHost;ui.hostStart.disabled=!info.canStart;ui.create.disabled=info.busy||info.hasPeer;ui.join.disabled=info.busy||info.hasPeer;ui.size.disabled=info.hasPeer;ui.code.disabled=info.hasPeer;text('portalRoomCode',info.room||'No room');text('portalMembers',info.members.map((p,i)=>`${p.name}: ${R.slots(info.size,i)} cards ${p.ready?'✓ Ready':''}`).join(' · '));renderPicker();if(info.message)message(info.message);}
 function solo(){ui.choices.hidden=true;ui.room.hidden=true;ui.builder.hidden=false;ui.ready.hidden=true;resetSelection();message('Choose four unique owned cards, then Start Portal.');}
 function continueMatch(auto=false){
  if(host.PortalParty?.active)return host.PortalParty.continueMatch(auto);
  const current=data.portals[selectedPortal?.id];if(!current||(auto&&current.tier!==selectedPortal.tier))return false;
  host.PortalCombatView.release();selectedPortal=clone(current);startSolo();return true;
 }
 function startSolo(){try{if(!data.portals[selectedPortal.id])throw Error('Portal item unavailable.');const id='portal_run_'+U.token(10),players=getWires().map(w=>R.unit(w,data.playerId));begin(id,selectedPortal);host.PortalCombatView.start({id,portal:selectedPortal,players,seed:R.integer(1,0xffffffff),party:false,weather:bridge.weather?.()||[]});}catch(error){message(error.message);}}
 function exit(){if(!setup&&!host.PortalCombatView?.active)return;host.PortalParty?.exit();host.PortalCombatView?.release();if(data?.active){try{abort();}catch(error){message(error.message);return false;}}setup=false;selection=[];selectedPortal=null;el('portalModal')?.classList.add('hidden');bridge.onExit?.();return true;}
 function showSummary(summary){const lines=[summary.won?'PORTAL CLEARED':'PORTAL ATTEMPT LOST',`Senzu Beans +${summary.beans}${summary.guest?' · Guest 50%':''}${summary.mvp?' · MVP x3':''}`,summary.card?(summary.cardLabel||'Broly')+' received!':'',summary.upgraded?'Portal upgraded to the next Tier.':'',summary.secretPortal?`${summary.secretPortal} Secret Namek Portal received!`:'',summary.consumed?'Secret Portal consumed after victory.':summary.won?'The Portal item is retained.':summary.remaining?`${summary.remaining} / 5 attempts remain.`:'Portal destroyed after 5 losses.'].filter(Boolean);text('portalCombatResult',lines.join('\n'));}
 function mount(){if(ui)return true;const ids={root:'portalModal',choices:'portalChoices',solo:'portalSolo',party:'portalParty',room:'portalRoom',size:'portalPartySize',code:'portalJoinCode',create:'portalCreateRoom',join:'portalJoinRoom',builder:'portalBuilder',ready:'portalReady',hostStart:'portalHostStart'};const next=Object.fromEntries(Object.entries(ids).map(([k,id])=>[k,el(id)]));if(Object.values(next).some(n=>!n))return false;ui=next;
  ui.solo.addEventListener('click',solo);ui.party.addEventListener('click',()=>{ui.choices.hidden=true;ui.room.hidden=false;ui.builder.hidden=true;host.PortalParty.reset();message('Choose 2–4 players and create a Party room.');});
  ui.create.addEventListener('click',()=>host.PortalParty.create(selectedPortal,Number(ui.size.value)));ui.join.addEventListener('click',()=>host.PortalParty.join(ui.code.value));ui.ready.addEventListener('click',()=>{try{host.PortalParty.ready(getWires());}catch(error){message(error.message);}});ui.hostStart.addEventListener('click',()=>host.PortalParty.start());
  el('portalClose')?.addEventListener('click',exit);el('portalJoinStorage')?.addEventListener('click',join);return true;}
 host.PortalsSystem=Object.freeze({KEY,validSave,dropTimeTrial,begin,finish,abort,discard,open,join,exit,startSolo,continueMatch,partyChanged,showSummary,getWires,message,
  configure:options=>{bridge=options||{};mount();},get(id){return data?.portals[id]?clone(data.portals[id]):null;},get playerId(){return data?.playerId;},get selected(){return selectedPortal?clone(selectedPortal):null;},get weather(){return bridge.weather?.()||[];},get active(){return setup;},get blocked(){return blocked;},get hostedToday(){return data?daily().hosted:0;},get attempt(){return data?.active?clone(data.active):null;},
  name:()=>bridge.displayName?.()||'Player',flush:()=>!blocked&&persist(),reset:()=>{data=fresh();blocked=false;persist();}});
})(window);
