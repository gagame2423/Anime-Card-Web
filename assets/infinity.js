/* Weekly Infinity lobby, continuous-run controller, food receipts and score outbox. */
(function(host){
 'use strict';
 const REPORT_MS=60000,KEY='anime_card_rng_infinity_v1',WEEKLY_KEY='anime_card_rng_infinity_weekly_v1',MAX=Number.MAX_SAFE_INTEGER,R=host.InfinityRules,U=host.OnlineUtils;
 const fresh=()=>({version:1,best:{},reports:{},lastReceipt:'',pending:null,infinityMetadata:null,rewardNotice:null});
 const record=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
 const weekId=id=>/^\d{4}_W(0[1-9]|[1-4]\d|5[0-3])$/.test(id),count=n=>Number.isSafeInteger(n)&&n>=0;
 function validMetadata(v){return Boolean(record(v)&&weekId(v.lastClaimedWeek)&&count(v.lastWeekHighestWave)&&v.lastWeekHighestWave<=Math.floor(MAX/100));}
 function validNotice(v){return Boolean(record(v)&&weekId(v.weekId)&&weekId(v.sourceWeek)&&count(v.highestWave)&&v.highestWave>0&&Number.isSafeInteger(v.orbs)&&v.orbs===v.highestWave*100);}
 function validSave(v){return Boolean(record(v)&&v.version===1&&record(v.best)&&record(v.reports)&&Object.entries(v.best).every(([id,n])=>weekId(id)&&count(n))&&Object.entries(v.reports).every(([id,n])=>weekId(id)&&count(n))&&typeof v.lastReceipt==='string'&&/^[a-zA-Z0-9_-]{0,100}$/.test(v.lastReceipt)&&(v.infinityMetadata==null||validMetadata(v.infinityMetadata))&&(v.rewardNotice==null||validNotice(v.rewardNotice))&&(v.pending===null||v.pending&&weekId(v.pending.weekId)&&count(v.pending.wave)&&v.pending.wave>0&&count(v.pending.orbs)&&v.pending.orbs>0&&/^[a-zA-Z0-9_-]{1,100}$/.test(v.pending.receipt)));}
 // Chỉ chuẩn bị bản sao; sổ giao dịch cục bộ ghi thưởng và cờ cùng lúc.
 function prepareSave(bundle,at=Date.now()){
  const value=bundle.storage[KEY]||fresh();if(!validSave(value))throw Error('Invalid Infinity progression.');
  const before=JSON.stringify(value),current=R.rotation(at).id;
  let metadata=value.infinityMetadata||bundle.infinityMetadata;
  if(metadata!=null&&!validMetadata(metadata))throw Error('Invalid Infinity reward metadata.');
  const completed=Object.keys(value.best).filter(id=>id<current&&value.best[id]>0).sort();
  if(!metadata){const source=completed.at(-1)||current;metadata={lastClaimedWeek:source,lastWeekHighestWave:value.best[source]||0};}
  metadata={...metadata};let reward=null;
  if(metadata.lastClaimedWeek<current){
   const source=metadata.lastClaimedWeek,highest=metadata.lastWeekHighestWave;
   if(highest>0){
    const amount=highest*100;if(!Number.isSafeInteger(amount))throw Error('Weekly reward exceeds the item limit.');
    const key=host.InventorySystem.KEY,inventory=bundle.storage[key];if(!record(inventory)||!inventory.items)throw Error('Item storage is missing.');
    if(Array.isArray(inventory.items))inventory.items=Object.fromEntries(inventory.items.map(item=>[item.id,item]));
    const old=inventory.items.star_orb,quantity=typeof old==='number'?old:Number(old?.quantity??old?.count??0);
    if(!count(quantity)||quantity>MAX-amount)throw Error('Star Orb storage is full. Weekly reward remains unclaimed.');
    const food=host.ExpFoodSystem.FOODS.find(food=>food.id==='star_orb');
    inventory.items.star_orb={...food,...(record(old)?old:{}),id:'star_orb',quantity:quantity+amount};
    reward={weekId:current,sourceWeek:source,highestWave:highest,orbs:amount};value.rewardNotice=reward;
   }
   metadata={lastClaimedWeek:current,lastWeekHighestWave:value.best[current]||0};
  }
  value.infinityMetadata=metadata;bundle.storage[KEY]=value;
  const changed=before!==JSON.stringify(value)||JSON.stringify(bundle.infinityMetadata)!==JSON.stringify(metadata);
  bundle.infinityMetadata={...metadata};return{changed,bundle,reward};
 }
 function validWeeklySave(v){return record(v)&&v.version===1&&v.pending===null;}
 function recoverWeekly(){
  try{const journal=JSON.parse(host.localStorage.getItem(WEEKLY_KEY)||'null');if(journal?.pending){
    const pending=journal.pending;if(journal.version!==1||typeof pending.items!=='string'||typeof pending.infinity!=='string'||!validSave(JSON.parse(pending.infinity))||!record(JSON.parse(pending.items).items))throw Error('Invalid weekly reward journal.');
    host.localStorage.setItem(host.InventorySystem.KEY,pending.items);host.localStorage.setItem(KEY,pending.infinity);host.InventorySystem.reload();
   }host.localStorage.setItem(WEEKLY_KEY,JSON.stringify({version:1,pending:null}));return true;
  }catch(_){return false;}
 }
 const weeklyRecovered=recoverWeekly();
 let data;try{const saved=JSON.parse(host.localStorage.getItem(KEY)||'null');data=validSave(saved)?saved:fresh();}catch(_){data=fresh();}
 let bridge={},active=false,combat=null,timer=null,uiTimer=null,runId='',runWeek=null,runMessage='',selections=[],sessionOrbs=0,busy=false,reporting=null,lastReport=0,reportAgain=false,blocked=!weeklyRecovered,clockText='',bound=false;
 const nodeCache=new Map();
 const el=id=>{if(nodeCache.has(id))return nodeCache.get(id);const node=host.document.getElementById(id);if(node)nodeCache.set(id,node);return node;},make=(tag,cls='',text)=>U.make(tag,cls,text),text=(id,value)=>U.text(el(id),value);
 function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));host.CloudSaveSystem?.markDirty();return true;}catch(_){return false;}}
 function commitReward(){const p=data.pending;if(!p)return true;if(!host.InventorySystem.grantOnce('infinity_wave',p.receipt,'star_orb',p.orbs))return false;data.best[p.weekId]=Math.max(data.best[p.weekId]||0,p.wave);data.reports[p.weekId]=Math.max(data.reports[p.weekId]||0,p.wave);if(data.infinityMetadata?.lastClaimedWeek===p.weekId)data.infinityMetadata.lastWeekHighestWave=Math.max(data.infinityMetadata.lastWeekHighestWave,p.wave);data.lastReceipt=p.receipt;data.pending=null;return persist();}
 if(!commitReward())blocked=true;
 function settleLocalWeek(){
  if(blocked)return false;
  try{
   const bundle={storage:{[KEY]:JSON.parse(JSON.stringify(data)),[host.InventorySystem.KEY]:JSON.parse(host.localStorage.getItem(host.InventorySystem.KEY)||'null')}};
   const plan=prepareSave(bundle);if(!plan.changed)return true;
   const pending={items:JSON.stringify(plan.bundle.storage[host.InventorySystem.KEY]),infinity:JSON.stringify(plan.bundle.storage[KEY])};
   host.localStorage.setItem(WEEKLY_KEY,JSON.stringify({version:1,pending}));
   host.localStorage.setItem(host.InventorySystem.KEY,pending.items);host.localStorage.setItem(KEY,pending.infinity);
   host.localStorage.setItem(WEEKLY_KEY,JSON.stringify({version:1,pending:null}));
   data=plan.bundle.storage[KEY];host.InventorySystem.reload();host.CloudSaveSystem?.markDirty();bridge.onReward?.();return true;
  }catch(error){
   try{const pending=JSON.parse(host.localStorage.getItem(WEEKLY_KEY)||'null');if(pending?.pending)blocked=true;}catch(_){blocked=true;}
   host.console?.warn('Local weekly reward remains pending:',error.message);return false;
  }
 }
 function week(){return R.rotation();}
 // The picker owns only presentation state; combat/save adapters stay unchanged.
 const PAGE_SIZE=24,VARIANT_PAGE_SIZE=12;
 const rowById=new Map();
 let rows=[],eligibleCount=0,activeSlot=0,page=0,loading=false,collectionWeek='',collectionToken=0,collectionFrame=null,renderFrame=null,searchTimer=null;
 let query='',elementFilter='',categoryFilter='',sortMode='atk-desc',slotRenderKey='',gridRenderKey='',pickedSlot=-1,focusSlotAfterRender=false;
 let variantTarget=null,variantPage=0,variantReturnFocus=null;
 const number=value=>Math.max(0,Math.round(Number(value)||0)).toLocaleString('en-US');
 const button=(label,cls='')=>Object.assign(make('button',cls,label),{type:'button'});
 const labelFor=variant=>(variant?.mutations||[]).map(m=>m.name).filter(Boolean).join(' + ')||'Normal';
 const editable=()=>active&&!busy&&!loading&&!combat;
 const usedIds=()=>new Set(selections.filter(Boolean).map(slot=>String(slot.cardId)));
 const selectedIndex=id=>selections.findIndex(slot=>String(slot?.cardId)===String(id));
 function cards(){return (bridge.cards?.()||[]).filter(card=>host.CategorySystem.has(card,week().category));}
 function variants(id){return bridge.variants?.(id)||[];}
 function validTeam(){
  if(selections.length!==4||loading)return false;
  const used=new Set(),eligible=new Set(cards().map(card=>String(card.id)));
  for(const slot of selections){
   const id=String(slot?.cardId||'');if(!id||used.has(id)||!eligible.has(id))return false;
   if(!variants(id).some(v=>v.key===slot.variantKey&&v.count>(slot.copy||0)))return false;used.add(id);
  }
  return used.size===4;
 }
 function toast(message){host.ShopBulkSystem.notify(message);}
 function scheduleSetup(){if(renderFrame!==null)return;renderFrame=host.requestAnimationFrame(()=>{renderFrame=null;renderSetup();if(active&&!loading&&!combat)bridge.saveTeam?.(week().category,selections);});}
 function cancelSetupWork(){
  collectionToken++;if(collectionFrame!==null)host.cancelAnimationFrame(collectionFrame);collectionFrame=null;
  if(renderFrame!==null)host.cancelAnimationFrame(renderFrame);renderFrame=null;
  host.clearTimeout(searchTimer);searchTimer=null;
 }
 function refreshCollection(keepTeam=false){
  cancelSetupWork();closeVariants(false);loading=true;collectionWeek=week().id;rows=[];rowById.clear();page=0;
  for(const menu of el('infinityLobby')?.querySelectorAll('.infinity-filter-menu')||[])menu.open=false;
  if(!keepTeam)selections=bridge.loadTeam?.(week().category)||Array(4).fill(null);
  activeSlot=Math.max(0,selections.findIndex(slot=>!slot));slotRenderKey='';gridRenderKey='';
  const source=[...new Map(cards().map(card=>[String(card.id),card])).values()];eligibleCount=source.length;
  const ticket=collectionToken;let cursor=0;
  renderFilterMenus();renderSetup();
  const collect=()=>{
   collectionFrame=null;if(!active||combat||ticket!==collectionToken)return;
   if(collectionWeek!==week().id){refreshCollection(false);return;}
   const until=host.performance.now()+5;let worked=0;
   try{
    while(cursor<source.length&&worked<8&&host.performance.now()<until){
     const card=source[cursor++],owned=variants(card.id).filter(v=>v.count>0),views=[];
     for(const variant of owned){const stats=bridge.describe(card,variant);views.push({variant,stats});}
     if(views.length){
      const row={card,id:String(card.id),search:String(card.name+' '+(card.category||[]).join(' ')).toLocaleLowerCase(),views,byVariant:new Map(views.map(view=>[view.variant.key,view]))};
      row.bestAtk=views.reduce((a,b)=>b.stats.atk>a.stats.atk?b:a);row.bestHp=views.reduce((a,b)=>b.stats.hp>a.stats.hp?b:a);
      rows.push(row);rowById.set(row.id,row);
     }
     worked++;
    }
   }catch(error){loading=false;text('infinityStatus','Could not prepare card previews: '+error.message);scheduleSetup();return;}
   if(cursor<source.length){collectionFrame=host.requestAnimationFrame(collect);return;}
   loading=false;eligibleCount=rows.length;
   const used=new Set();selections=Array.from({length:4},(_,i)=>{const slot=selections[i],id=String(slot?.cardId||''),row=rowById.get(id);if(!row||used.has(id)||!row.byVariant.has(slot.variantKey))return null;used.add(id);return{cardId:id,variantKey:slot.variantKey,copy:slot.copy||0};});
   activeSlot=Math.max(0,selections.findIndex(slot=>!slot));renderFilterMenus();slotRenderKey='';scheduleSetup();
  };
  collectionFrame=host.requestAnimationFrame(collect);
 }
 function viewFor(row){
  const selected=selections.find(slot=>slot?.cardId===row.id),chosen=selected&&row.byVariant.get(selected.variantKey);
  return chosen||(sortMode.startsWith('hp')?row.bestHp:row.bestAtk);
 }
 function artwork(card,large=false){
  const box=make('span','infinity-card-art'),fallback=make('span','infinity-art-fallback',String(card.name||'Card').split(/\s+/).map(word=>word[0]).slice(0,3).join(''));
  fallback.setAttribute('aria-hidden','true');box.append(fallback);
  if(card.image){const img=make('img');img.alt=card.name+' artwork';img.loading=large?'eager':'lazy';img.decoding='async';img.addEventListener('error',()=>img.hidden=true,{once:true});img.src=card.image;box.append(img);}
  return box;
 }
 function elementBadge(card){
  const badge=make('span','infinity-element',card.element);badge.dataset.element=card.element;
  const path=host.ElementSystem.ICONS[card.element];if(path){const img=make('img');img.src=path;img.alt='';img.width=18;img.height=18;img.addEventListener('error',()=>img.hidden=true,{once:true});badge.prepend(img);}return badge;
 }
 function statPair(stats){
  const root=make('span','infinity-card-stats');
  for(const [name,value]of [['HP',stats.hp],['ATK',stats.atk]]){const entry=make('span');entry.append(make('small','',name),make('b','',number(value)));entry.title=name+' '+number(value);root.append(entry);}return root;
 }
 function decorate(node,row,view){
  node.classList.add('rarity-'+String(row.card.rarity||'Common').toLowerCase());node.dataset.element=row.card.element;
  node.dataset.mutated=String(Boolean(view.variant.mutations?.length));bridge.decorate?.(node,view.variant.mutations);
 }
 function cardContents(row,view,large=false){
  const fragment=host.document.createDocumentFragment(),art=artwork(row.card,large);art.append(elementBadge(row.card));
  const name=make('strong','infinity-card-name',row.card.name),meta=make('span','infinity-card-meta'),mutation=make('span','infinity-variant-badge',labelFor(view.variant));mutation.title=labelFor(view.variant);
  meta.append(make('span','infinity-card-level','Lvl '+number(view.stats.level)),mutation);
  fragment.append(art,name,meta,statPair(view.stats));return fragment;
 }
 function renderSlots(){
  const root=el('infinityTeam');if(!root)return;
  const key=JSON.stringify([selections,activeSlot,busy,loading,rows.length]);if(key===slotRenderKey)return;slotRenderKey=key;
  const fragment=host.document.createDocumentFragment();
  for(let i=0;i<4;i++){
   const slot=selections[i],row=slot&&rowById.get(slot.cardId),rawView=row?.byVariant.get(slot.variantKey),view=rawView?{...rawView,stats:bridge.describe(row.card,rawView.variant,slot.copy||0)}:null,filled=Boolean(view);
   const frame=make('article','infinity-deck-slot'+(activeSlot===i?' is-active':'')+(filled?' is-filled':' is-empty')+(pickedSlot===i?' is-picked':''));frame.setAttribute('role','group');frame.setAttribute('aria-label','Infinity slot '+(i+1));
   const header=make('div','infinity-slot-top');header.append(make('span','','SLOT '+String(i+1).padStart(2,'0')),make('span','infinity-slot-state',activeSlot===i?'ACTIVE':filled?'READY':'EMPTY'));
   const pick=button('','infinity-slot-pick');pick.dataset.infinitySlot=String(i);pick.disabled=busy||loading;pick.setAttribute('aria-pressed',String(activeSlot===i));pick.setAttribute('aria-label','Slot '+(i+1)+(filled?': '+row.card.name+'. Click to swap.':': Empty. Choose card.'));
   frame.append(header);
   if(filled){
    decorate(frame,row,view);pick.append(cardContents(row,view,true));frame.append(pick);
    const actions=make('div','infinity-slot-actions'),change=button('Mutation ···','infinity-quiet-button'),clear=button('Clear Slot','infinity-clear-slot');
    change.dataset.infinityVariants=row.id;change.dataset.infinityEditSlot=String(i);change.disabled=clear.disabled=busy||loading;clear.dataset.infinityClear=String(i);const copy=make('input');copy.type='number';copy.min='1';copy.max=String(view.variant.count);copy.value=String((slot.copy||0)+1);copy.className='infinity-copy-input';copy.setAttribute('aria-label','Owned copy number');copy.disabled=busy||loading;copy.addEventListener('change',()=>{slot.copy=Math.max(0,Math.min(view.variant.count-1,Math.floor(Number(copy.value)||1)-1));slotRenderKey='';scheduleSetup();});actions.append(change,clear,copy);frame.append(actions);
   }else{
    const empty=make('span','infinity-empty-slot');empty.append(make('b','','+'),make('strong','','EMPTY'),make('small','','Choose a card below'));pick.append(empty);frame.append(pick);
   }
   fragment.append(frame);
  }
  root.replaceChildren(fragment);pickedSlot=-1;
  if(focusSlotAfterRender){focusSlotAfterRender=false;root.querySelector('[data-infinity-slot="'+activeSlot+'"]')?.focus({preventScroll:true});}
 }
 const SORTS=[['atk-desc','Attack: High → Low'],['atk-asc','Attack: Low → High'],['hp-desc','HP: High → Low'],['hp-asc','HP: Low → High'],['level-desc','Level: High → Low'],['name','Name: A → Z']];
 function menu(id,values,current,attribute){
  const root=el(id);if(!root)return;const fragment=host.document.createDocumentFragment();
  for(const [value,label]of values){const item=button(label,'infinity-menu-option');item.dataset[attribute]=value;item.setAttribute('aria-pressed',String(current===value));fragment.append(item);}root.replaceChildren(fragment);
 }
 function renderFilterMenus(){
  const allowed=new Set(rows.flatMap(row=>row.card.category||[]));
  menu('infinityElementOptions',[['','All Elements'],...host.ElementSystem.TYPES.map(type=>[type,type])],elementFilter,'infinityElement');
  menu('infinityCategoryOptions',[['','All '+week().category+' Cards'],...host.CategorySystem.TYPES.filter(type=>type!==week().category&&allowed.has(type)).map(type=>[type,type])],categoryFilter,'infinityCategory');
  menu('infinitySortOptions',SORTS,sortMode,'infinitySort');
  text('infinityElementLabel',elementFilter||'All Elements');text('infinityCategoryLabel',categoryFilter||'All '+week().category+' Cards');text('infinitySortLabel',SORTS.find(([key])=>key===sortMode)[1]);
 }
 function renderPicker(){
  const grid=el('infinityCardGrid');if(!grid)return;
  const key=JSON.stringify([collectionToken,loading,query,elementFilter,categoryFilter,sortMode,page,selections]);if(key===gridRenderKey)return;gridRenderKey=key;
  const filtered=rows.filter(row=>(!query||row.search.includes(query))&&(!elementFilter||row.card.element===elementFilter)&&(!categoryFilter||host.CategorySystem.has(row.card,categoryFilter)));
  const entries=filtered.map(row=>({row,view:viewFor(row)}));entries.sort((a,b)=>{
   const order=sortMode.startsWith('atk')?(a.view.stats.atk-b.view.stats.atk)*(sortMode.endsWith('desc')?-1:1):sortMode.startsWith('hp')?(a.view.stats.hp-b.view.stats.hp)*(sortMode.endsWith('desc')?-1:1):sortMode==='level-desc'?b.view.stats.level-a.view.stats.level:0;
   return order||a.row.card.name.localeCompare(b.row.card.name)||a.row.id.localeCompare(b.row.id);
  });
  const pages=Math.max(1,Math.ceil(entries.length/PAGE_SIZE));page=Math.min(page,pages-1);
  const fragment=host.document.createDocumentFragment(),used=usedIds();
  if(loading){fragment.append(make('div','infinity-grid-message','Preparing your collection…'));grid.setAttribute('aria-busy','true');}
  else{grid.setAttribute('aria-busy','false');for(const {row,view}of entries.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE)){
   const inUse=used.has(row.id),tile=make('article','infinity-picker-card'+(inUse?' is-in-use':''));decorate(tile,row,view);tile.dataset.infinityCard=row.id;
   const pick=button('','infinity-card-pick');pick.dataset.infinityPick=row.id;pick.setAttribute('aria-label',row.card.name+', '+labelFor(view.variant)+', HP '+number(view.stats.hp)+', ATK '+number(view.stats.atk)+(inUse?', already in lineup':', select card'));pick.setAttribute('aria-pressed',String(inUse));pick.append(cardContents(row,view));
   if(inUse)pick.append(make('span','infinity-in-use','IN USE · SLOT '+String(selectedIndex(row.id)+1).padStart(2,'0')));
   const foot=make('div','infinity-picker-card-foot'),variantsButton=button('···','infinity-card-more');variantsButton.dataset.infinityVariants=row.id;variantsButton.setAttribute('aria-label','Choose owned mutation for '+row.card.name);variantsButton.title='Choose owned mutation';foot.append(make('small','',row.views.length+' variant'+(row.views.length===1?'':'s')),variantsButton);tile.append(pick,foot);fragment.append(tile);
  }
  if(!entries.length)fragment.append(make('div','infinity-grid-message',eligibleCount?'No weekly cards match these filters. Try another search or clear the filters.':'No unlocked '+week().category+' cards yet. Roll eligible cards to build your team.'));
  }
  grid.replaceChildren(fragment);
  text('infinityWeeklyCategory','Active Weekly Category: '+week().category);text('infinityEligibleCount',loading?'Preparing '+eligibleCount+' eligible cards…':'Showing '+entries.length+' of '+eligibleCount+' eligible cards');
  text('infinityPageLabel','Page '+(page+1)+' / '+pages);el('infinityPagePrevious').disabled=loading||page===0;el('infinityPageNext').disabled=loading||page>=pages-1;
 }
 function renderSetup(){
  if(!active||combat)return;renderSlots();renderPicker();
  const count=selections.filter(Boolean).length,ready=validTeam();text('infinityTeamCount',count+' / 4 selected');
  text('infinityTeamHint',loading?'Preparing combat stats…':eligibleCount<4?'You need 4 different '+week().category+' cards. '+eligibleCount+' unlocked.':ready?'Lineup ready. Four unique cards, one weekly Category.':'Picking SLOT '+String(activeSlot+1).padStart(2,'0')+' · Choose four different cards.');
  if(el('infinityStart')){el('infinityStart').hidden=false;el('infinityStart').disabled=busy||blocked||!ready;}
  el('infinityClearTeam').disabled=busy||loading||!count;
 }
 function nextEmpty(after){for(let n=1;n<=4;n++){const index=(after+n)%4;if(!selections[index])return index;}return after;}
 function chooseCard(id,key){
  if(!editable())return false;id=String(id);
  if(usedIds().has(id)){toast('This card is already in your lineup!');return false;}
  const row=rowById.get(id),view=key?row?.byVariant.get(key):row&&viewFor(row);if(!view||!host.CategorySystem.has(row.card,week().category))return false;
  if(!variants(id).some(v=>v.key===view.variant.key&&v.count>0)){toast('This card variant is no longer owned.');refreshCollection(true);return false;}
  selections[activeSlot]={cardId:id,variantKey:view.variant.key,copy:0};pickedSlot=activeSlot;activeSlot=nextEmpty(activeSlot);focusSlotAfterRender=true;scheduleSetup();return true;
 }
 function setVariantBackground(inert){for(const id of ['infinityMainHeader','infinityContent','infinityFooter']){const node=el(id);if(node)node.inert=inert;}}
 function openVariants(id,editSlot=null){
  if(!editable())return;const row=rowById.get(String(id));if(!row)return;
  const existing=selectedIndex(row.id);variantTarget={id:row.id,slot:existing>=0?existing:editSlot};variantPage=0;variantReturnFocus=host.document.activeElement;
  setVariantBackground(true);el('infinityVariantPicker').hidden=false;renderVariants();el('infinityVariantClose').focus({preventScroll:true});
 }
 function closeVariants(restoreFocus=true){
  if(!variantTarget)return;variantTarget=null;const overlay=el('infinityVariantPicker');if(overlay)overlay.hidden=true;setVariantBackground(false);el('infinityVariantGrid')?.replaceChildren();
  if(restoreFocus){const target=variantReturnFocus?.isConnected?variantReturnFocus:el('infinityTeam')?.querySelector('[data-infinity-slot="'+activeSlot+'"]');target?.focus({preventScroll:true});}variantReturnFocus=null;
 }
 function renderVariants(){
  const row=rowById.get(variantTarget?.id);if(!row){closeVariants();return;}
  text('infinityVariantTitle',row.card.name+' · Mutations');text('infinityVariantHint',variantTarget.slot>=0&&variantTarget.slot!==null?'Change mutation for SLOT '+String(variantTarget.slot+1).padStart(2,'0'):'Choose a variant for SLOT '+String(activeSlot+1).padStart(2,'0'));
  const pages=Math.max(1,Math.ceil(row.views.length/VARIANT_PAGE_SIZE));variantPage=Math.min(variantPage,pages-1);const fragment=host.document.createDocumentFragment();
  for(const view of row.views.slice(variantPage*VARIANT_PAGE_SIZE,(variantPage+1)*VARIANT_PAGE_SIZE)){
   const choice=button('','infinity-variant-option');choice.dataset.infinityVariantKey=view.variant.key;decorate(choice,row,view);choice.append(make('strong','',labelFor(view.variant)),make('small','','Owned x'+number(view.variant.count)),statPair(view.stats));
   const selected=variantTarget.slot!==null&&selections[variantTarget.slot]?.variantKey===view.variant.key;choice.classList.toggle('is-selected',selected);choice.setAttribute('aria-pressed',String(selected));fragment.append(choice);
  }
  el('infinityVariantGrid').replaceChildren(fragment);text('infinityVariantPage','Page '+(variantPage+1)+' / '+pages);el('infinityVariantPrevious').disabled=variantPage===0;el('infinityVariantNext').disabled=variantPage>=pages-1;
 }
 function chooseVariant(key){
  if(!editable()||!variantTarget)return;const target={...variantTarget},row=rowById.get(target.id),view=row?.byVariant.get(key);if(!view)return;
  if(target.slot!==null&&target.slot>=0){
   if(selections[target.slot]?.cardId!==row.id)return;
   if(!variants(row.id).some(v=>v.key===key&&v.count>0)){toast('This card variant is no longer owned.');return;}
   selections[target.slot]={cardId:row.id,variantKey:key,copy:0};activeSlot=nextEmpty(target.slot);pickedSlot=target.slot;focusSlotAfterRender=true;closeVariants(false);scheduleSetup();
  }else{closeVariants(false);chooseCard(row.id,key);}
 }
 function setupClick(event){
  if(!event.target.closest('.infinity-filter-menu'))for(const menu of el('infinityLobby')?.querySelectorAll('.infinity-filter-menu[open]')||[])menu.open=false;
  const node=event.target.closest('button');if(!node||!el('infinityModal')?.contains(node))return;
  if(node.dataset.infinityVariantKey!==undefined){chooseVariant(node.dataset.infinityVariantKey);return;}
  if(node.dataset.infinityVariants!==undefined){openVariants(node.dataset.infinityVariants,node.dataset.infinityEditSlot===undefined?null:Number(node.dataset.infinityEditSlot));return;}
  if(!editable())return;
  if(node.dataset.infinityPick!==undefined){chooseCard(node.dataset.infinityPick);return;}
  if(node.dataset.infinitySlot!==undefined){activeSlot=Number(node.dataset.infinitySlot);scheduleSetup();return;}
  if(node.dataset.infinityClear!==undefined){const index=Number(node.dataset.infinityClear);selections[index]=null;activeSlot=index;focusSlotAfterRender=true;scheduleSetup();return;}
  let filtered=false;
  if(node.dataset.infinityElement!==undefined){elementFilter=node.dataset.infinityElement;filtered=true;}
  if(node.dataset.infinityCategory!==undefined){categoryFilter=node.dataset.infinityCategory;filtered=true;}
  if(node.dataset.infinitySort!==undefined){sortMode=node.dataset.infinitySort;filtered=true;}
  if(filtered){node.closest('details').open=false;page=0;renderFilterMenus();scheduleSetup();}
 }
 function renderClock(){host.InfinityViewSystem.clock();const w=week(),remaining=Math.max(0,w.endMs-host.InfinityCloudSystem.now()),days=Math.floor(remaining/R.DAY),hours=Math.floor(remaining/3600000)%24,minutes=Math.floor(remaining/60000)%60;const label=`${w.id} · Category: ${w.category} · Enemy Element: ${w.element} · Reset: ${days}d ${hours}h ${minutes}m (Monday 00:00 UTC)`;if(label!==clockText){text('infinityRotation',label);clockText=label;}if(active&&runWeek&&runWeek.id!==w.id&&!combat?.battle.finished)end('Weekly rotation ended. Start a new run with this week’s Category.');if(active&&!combat&&collectionWeek&&collectionWeek!==w.id){query='';elementFilter='';categoryFilter='';el('infinitySearch').value='';refreshCollection(false);}}
 function battleInfo(){return {week:runWeek,orbs:sessionOrbs,best:data.best[runWeek?.id]||0,message:runMessage};}
 function renderBattle(){if(combat)host.InfinityViewSystem.render(battleInfo());}
 function stopTimer(){host.clearTimeout(timer);timer=null;}
 function end(message){runMessage=message||'Run ended. Star Orbs and weekly best are saved.';stopTimer();if(combat&&!combat.battle.finished){combat.battle.finished=true;combat.battle.isBattling=false;bridge.onEnd?.(combat.battle);}text('infinityStatus',message||'Run ended. Star Orbs and weekly best are saved.');renderBattle();void report(true);}
 function schedule(){stopTimer();if(active&&combat&&!combat.battle.finished){const delay=host.InventorySystem.combatTurnMs(3000);combat.battle.nextTurnAt=Date.now()+delay;timer=host.setTimeout(tick,delay);host.InfinityViewSystem.clock();}}
 function tick(){
  if(!active||host.GameStartup?.failed){suspend();return;}renderClock();if(combat?.battle.finished)return;
  try{const result=combat.step();if(result.ended){bridge.onEnd?.(combat.battle);end('Team defeated. Highest wave and Star Orbs retained.');}renderBattle();schedule();}catch(error){end(error.message+' Run stopped safely.');}
 }
 function rewardWave(wave,battle){
  if(runWeek.id!==week().id)throw Error('Weekly rotation ended.');const receipt=runId+'_'+wave;
  if(data.lastReceipt===receipt)return;
  const range=R.orbRange(wave),orbs=range.min+Math.floor(Math.random()*(range.max-range.min+1));
  if(orbs>MAX-host.InventorySystem.quantity('star_orb'))throw Error('Star Orb storage is full.');
  data.pending={weekId:runWeek.id,wave,orbs,receipt};if(!persist()){data.pending=null;throw Error('Unable to save the wave reward.');}
  if(!commitReward()){blocked=true;throw Error('Storage unavailable. Reload to recover the pending Star Orbs.');}
  sessionOrbs+=orbs;bridge.onReward?.(wave,battle);void report();
 }
 async function report(force=false){
  if(reporting){if(force)reportAgain=true;return reporting;}
  if(host.GameStartup?.failed||!force&&Date.now()-lastReport<REPORT_MS&&week().endMs-host.InfinityCloudSystem.now()>30000)return;
  const current=week(),score=data.reports[current.id];if(!score)return;
  if(!host.InfinityCloudSystem.available){lastReport=Date.now();text('infinityStatus','Local weekly best saved · '+score+' waves. Cloud publishing is optional.');return;}
  lastReport=Date.now();const uid=host.CloudSaveSystem.activeUser?.uid;
  reporting=(async()=>{try{const response=await host.InfinityCloudSystem.submit({weekId:current.id,highestWave:score,category:current.category});if(host.CloudSaveSystem.activeUser?.uid!==uid||response.localOnly)return;if(Number.isSafeInteger(response.highestWave))data.best[current.id]=Math.max(data.best[current.id]||0,response.highestWave);if(data.infinityMetadata?.lastClaimedWeek===current.id)data.infinityMetadata.lastWeekHighestWave=Math.max(data.infinityMetadata.lastWeekHighestWave,data.best[current.id]||0);if((data.reports[current.id]||0)<=score)delete data.reports[current.id];persist();text('infinityStatus','Weekly best synced · Star Orbs are stored in EXP Food.');}catch(error){text('infinityStatus','Weekly score pending sync · '+error.message);}finally{reporting=null;if(reportAgain){reportAgain=false;queueMicrotask(()=>void report(true));}}})();return reporting;
 }
 async function start(){
  if(!editable()||blocked||!validTeam()||host.GameStartup?.failed)return false;
  settleLocalWeek();if(blocked)return false;
  busy=true;cancelSetupWork();closeVariants(false);renderSetup();try{runWeek=week();const players=bridge.units(selections);if(players.length!==4||new Set(players.map(u=>String(u.card.id))).size!==4||players.some(u=>!host.CategorySystem.has(u,runWeek.category)))throw Error('Choose four different cards matching '+runWeek.category+'.');runId=U.token();sessionOrbs=0;runMessage='';
   combat=host.InfinityCombat.create(players,runWeek,{onWave:rewardWave,onUnitDefeated:bridge.onUnitDefeated,isWeatherActive:bridge.isWeatherActive,addWeather:bridge.addWeather,onLog:host.InfinityViewSystem.log,onFloatingText:host.InfinityViewSystem.float,onRender:()=>host.InfinityViewSystem.render(),onTurn:host.InfinityViewSystem.turn,onAttack:host.InfinityViewSystem.attack,prepare:(bs,engine)=>{bs.startedAt=Date.now();bridge.prepare?.(bs);host.InfinityViewSystem.mount(bs,engine,battleInfo());}});
   renderBattle();schedule();return true;
  }catch(error){if(!combat)host.InfinityViewSystem.release();text('infinityStatus',error.message);return false;}finally{busy=false;if(!combat)scheduleSetup();}
 }
 function open(){if(active||bridge.canEnter?.()!==true)return false;settleLocalWeek();if(blocked)return false;active=true;host.document.body.classList.add('infinity-open');combat=null;runWeek=null;sessionOrbs=0;bridge.onEnter?.();bridge.open?.('infinityModal');el('infinityLobby').hidden=false;if(el('infinityLeaderboard'))el('infinityLeaderboard').disabled=false;query='';elementFilter='';categoryFilter='';sortMode='atk-desc';el('infinitySearch').value='';refreshCollection(false);renderClock();text('infinityStatus',`4v4 continuous waves · No VNĐ / direct EXP · Best this week: ${data.best[week().id]||0}. ${host.InfinityCloudSystem.status.message}`);host.clearInterval(uiTimer);uiTimer=host.setInterval(()=>{renderClock();if(Date.now()-lastReport>REPORT_MS)void report();},1000);void report();return true;}
 function exit(){if(!active)return;if(combat&&!combat.battle.finished)end('Run exited. Cleared-wave rewards retained.');stopTimer();cancelSetupWork();closeVariants(false);host.clearInterval(uiTimer);uiTimer=null;active=false;host.document.body.classList.remove('infinity-open');host.InfinityViewSystem.release();combat=null;el('infinityModal')?.classList.add('hidden');bridge.onExit?.();}
 function suspend(){stopTimer();cancelSetupWork();closeVariants(false);host.clearInterval(uiTimer);uiTimer=null;if(combat){combat.battle.finished=true;combat.battle.isBattling=false;}active=false;host.document.body.classList.remove('infinity-open');host.InfinityViewSystem.release();combat=null;el('infinityModal')?.classList.add('hidden');}
 function mount(){
  if(bound)return;bound=true;
  el('infinityOpenButton')?.addEventListener('click',open);el('infinityExit')?.addEventListener('click',exit);
  el('infinityStart')?.addEventListener('click',()=>void start());
  el('infinityRestart')?.addEventListener('click',()=>{if(!combat?.battle.finished)return;host.InfinityViewSystem.release();combat=null;runWeek=null;el('infinityModal').classList.remove('hidden');el('infinityLobby').hidden=false;el('infinityLeaderboard').disabled=false;refreshCollection(collectionWeek===week().id);});
  el('infinityRetrySync')?.addEventListener('click',()=>{lastReport=0;void report(true);});
  el('infinityLeaderboard')?.addEventListener('click',()=>{if(combat&&!combat.battle.finished)return;const select=el('leaderboardMetric');if(select)select.value='infinity';bridge.open?.('leaderboardModal');void host.LeaderboardSystem.render(true);});
  el('infinityModal')?.addEventListener('click',setupClick);
  el('infinityClearTeam')?.addEventListener('click',()=>{if(!editable())return;selections=Array(4).fill(null);activeSlot=0;focusSlotAfterRender=true;scheduleSetup();});
  el('infinitySearch')?.addEventListener('input',event=>{const value=event.target.value;host.clearTimeout(searchTimer);searchTimer=host.setTimeout(()=>{searchTimer=null;query=value.trim().toLocaleLowerCase();page=0;scheduleSetup();},120);});
  el('infinityPagePrevious')?.addEventListener('click',()=>{if(editable()&&page>0){page--;scheduleSetup();el('infinityCardGrid').scrollTop=0;}});
  el('infinityPageNext')?.addEventListener('click',()=>{if(editable()){page++;scheduleSetup();el('infinityCardGrid').scrollTop=0;}});
  el('infinityVariantPrevious')?.addEventListener('click',()=>{if(variantTarget&&variantPage>0){variantPage--;renderVariants();}});
  el('infinityVariantNext')?.addEventListener('click',()=>{if(variantTarget){variantPage++;renderVariants();}});
  el('infinityVariantClose')?.addEventListener('click',()=>closeVariants());
  el('infinityVariantPicker')?.addEventListener('click',event=>{if(event.target===el('infinityVariantPicker'))closeVariants();});
  el('infinityModal')?.addEventListener('keydown',event=>{
   if(!variantTarget){const menu=el('infinityLobby')?.querySelector('.infinity-filter-menu[open]');if(event.key==='Escape'&&menu){event.preventDefault();event.stopImmediatePropagation();menu.open=false;menu.querySelector('summary').focus();}return;}
   if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();closeVariants();}
   if(event.key==='Tab'){
    const choices=[...el('infinityVariantPicker').querySelectorAll('button:not(:disabled)')];if(!choices.length)return;
    const first=choices[0],last=choices[choices.length-1];if(event.shiftKey&&host.document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&host.document.activeElement===last){event.preventDefault();first.focus();}
   }
  },true);
  for(const menu of el('infinityLobby')?.querySelectorAll('.infinity-filter-menu')||[])menu.addEventListener('toggle',()=>{if(menu.open)for(const other of el('infinityLobby').querySelectorAll('.infinity-filter-menu'))if(other!==menu)other.open=false;});
  host.addEventListener('pagehide',suspend);
 }
 function presentReward(){const notice=data.rewardNotice;if(!notice||active||host.GameStartup?.failed||!el('infinityRewardModal'))return;text('infinityRewardMessage',`Weekly Reset! You received ${notice.orbs.toLocaleString('en-US')} Star Orbs for reaching Wave ${notice.highestWave.toLocaleString('en-US')} last week!`);text('infinityRewardWeek',notice.sourceWeek+' → '+notice.weekId+' · Saved to EXP Food');bridge.open?.('infinityRewardModal');}
 function dismissReward(){if(!data.rewardNotice)return;data.rewardNotice=null;if(!persist())blocked=true;else void host.CloudSaveSystem.flush(true);}
 host.addEventListener('cloud-session-ready',()=>{lastReport=0;void report(true);});
 host.InfinitySystem=Object.freeze({KEY,WEEKLY_KEY,validSave,validWeeklySave,validMetadata,prepareSave,settleLocalWeek,presentReward,dismissReward,week,getISOWeek:R.getISOWeek,getISOWeekAndYear:R.getISOWeekAndYear,open,exit,start,suspend,report,get metadata(){return data.infinityMetadata?{...data.infinityMetadata}:null;},get active(){return active;},get blocked(){return blocked;},get battle(){return combat?.battle||null;},get lineup(){return selections.map(slot=>slot?{...slot}:null);},getBest:id=>data.best[id]||0,flush:()=>!blocked&&persist(),reset(){suspend();data=fresh();persist();},configure(options){bridge=options||{};mount();if(!persist())blocked=true;else settleLocalWeek();}});
})(window);
