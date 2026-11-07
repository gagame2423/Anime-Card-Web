/* Hourly Rift rotation, inventory transactions and the shared Arena adapters. */
(function(host){
 'use strict';
 const KEY='anime_card_rng_rift_v1',MODE='rift',HOUR=3600000,OPEN_MS=1800000;
 const TYPES=Object.freeze({rumbling:Object.freeze({id:'rumbling',name:'Rumbling Rift',element:'Nature'})});
 const SHOP=Object.freeze([{id:'lucky_potion',cost:1},{id:'rich_potion',cost:1},{id:'speed_potion',cost:1},{id:'speed_battle_potion',cost:3},{id:'guarantee_shard',cost:1000}]);
 const inv=()=>host.InventorySystem,integer=(n,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
 const unit=random=>Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0));
 const fresh=()=>({version:1,sequence:0,autoGuarantee:false,activeAttempt:null,pendingReward:null});
 function rotation(at=Date.now()){
  const hour=Math.floor(at/HOUR),elapsed=at-hour*HOUR,ids=Object.keys(TYPES);
  let seed=(hour^0x71f452ab)>>>0;seed=Math.imul(seed^(seed>>>16),0x45d9f3b)>>>0;
  return {key:String(hour),type:ids[seed%ids.length],open:elapsed<OPEN_MS,endsAt:hour*HOUR+(elapsed<OPEN_MS?OPEN_MS:HOUR)};
 }
 function validAttempt(a){return Boolean(a&&typeof a.id==='string'&&/^\d+_\d+$/.test(a.id)&&Object.hasOwn(TYPES,a.type)&&typeof a.guaranteed==='boolean'&&integer(a.startedAt));}
 function validSave(v){
  if(!v||v.version!==1||!integer(v.sequence)||typeof v.autoGuarantee!=='boolean'||v.activeAttempt!==null&&!validAttempt(v.activeAttempt))return false;
  const p=v.pendingReward;if(p===null)return true;
  if(!validAttempt(p)||!v.activeAttempt||p.id!==v.activeAttempt.id||p.type!==v.activeAttempt.type||p.guaranteed!==v.activeAttempt.guaranteed||p.startedAt!==v.activeAttempt.startedAt||!integer(p.shards,1,5))return false;
  if(p.card!==null&&(!p.card||p.card.cardId!=='eren-rumbling'||!Array.isArray(p.card.mutationIds)||p.card.mutationIds.length>2||new Set(p.card.mutationIds).size!==p.card.mutationIds.length||p.card.mutationIds.some(id=>!Object.hasOwn(host.MUTATION_BY_ID,id))))return false;
  if(p.relic!==null&&(!p.relic||p.relic.type!=='relic'||p.relic.metadata?.relic?.kind!=='odm'||!host.RelicSystem.validItem(p.relic)))return false;
  return !p.guaranteed||Boolean(p.card)!==Boolean(p.relic);
 }
 let data;try{const value=JSON.parse(host.localStorage.getItem(KEY)||'null');data=validSave(value)?value:fresh();}catch(_){data=fresh();}
 if(!data.pendingReward)data.activeAttempt=null;
 let bridge={};
 function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));host.CloudSaveSystem?.markDirty();return true;}catch(_){return false;}}
 function register(){
  inv().registerItem({id:'rift_shard',name:'Rift Shard',type:'material',tier:'rare',icon:'◇',description:'Universal Rift currency. Win any Rift: 1–5 shards. Spend in the Rift Shop.'});
  inv().registerItem({id:'guarantee_shard',name:'Guarantee Shard',type:'material',tier:'legendary',icon:'◆',image:'assets/items/gshard.png',description:'Rift Shop: 1,000 Rift Shards. Consume on entry to guarantee one Rift special drop on victory.'});
 }
 register();
 const canEnter=at=>rotation(at).open&&!data.pendingReward&&!data.activeAttempt&&!host.SandboxSystem?.active;
 function setAutoGuarantee(enabled){const before=data.autoGuarantee;data.autoGuarantee=Boolean(enabled)&&inv().quantity('guarantee_shard')>0;if(persist())return true;data.autoGuarantee=before;return false;}
 function chooseGuarantee(skipPrompt=false){
  if(inv().quantity('guarantee_shard')<1){if(data.autoGuarantee)setAutoGuarantee(false);return false;}
  return skipPrompt?data.autoGuarantee:host.confirm('Do you wanna guarantee drop on win?');
 }
 function enemies(random=Math.random){
  const bosses=['war-hammer-titan','jaw-titan','beast-titan','armored-titan'],boss=bosses[Math.floor(unit(random)*bosses.length)];
  return [[100000,10000],[150000,15000],[200000,20000],[250000,25000],[1000000,50000]].map(([hp,atk],index)=>{
   const native=host.ALL_CARDS.find(c=>c.id===(index===4?boss:'dumb-titan'));if(!native)throw Error('Missing Rift card definition.');
   const card={...native,element:'Nature',stats:{hp,atk}};
   return {card,display:{name:native.name,image:native.image,hp,atk},hp,maxHp:hp,atk,level:1,mutations:[],defeated:false,isRiftEnemy:true};
  });
 }
 function start(battle,guaranteed=false){
  if(battle?.mode!==MODE||battle.playerTeam?.length!==5||battle.enemyTeam?.length!==5||!canEnter()||data.sequence===Number.MAX_SAFE_INTEGER)throw Error('Rift is closed or the lineup is incomplete.');
  if(guaranteed&&inv().quantity('guarantee_shard')<1)throw Error('No Guarantee Shard available.');
  const before={...data},now=Date.now();data.sequence++;
  data.activeAttempt={id:now+'_'+data.sequence,type:rotation(now).type,startedAt:now,guaranteed:Boolean(guaranteed)};
  if(!persist()){data=before;throw Error('Unable to save Rift entry.');}
  if(guaranteed&&!inv().transactOnce('rift_entry',data.activeAttempt.id,[],[{id:'guarantee_shard',quantity:1}])){data=before;persist();throw Error('Unable to consume Guarantee Shard.');}
  battle.rift={...data.activeAttempt,completed:false};if(inv().quantity('guarantee_shard')===0&&data.autoGuarantee)setAutoGuarantee(false);
  return battle.rift;
 }
 function rollReward(attempt,random=Math.random){
  const reward={...attempt,shards:1+Math.floor(unit(random)*5),card:null,relic:null};
  const selected=attempt.guaranteed?(unit(random)<1/11?'card':'relic'):null;
  if(selected==='card'||!selected&&unit(random)<.005)reward.card={cardId:'eren-rumbling',mutationIds:(bridge.rollMutations?.()||[]).map(m=>typeof m==='string'?m:m.id)};
  if(selected==='relic'||!selected&&unit(random)<.05){reward.relic=host.RelicSystem.createItem('relic_'+host.OnlineUtils.token(),host.RelicSystem.roll('odm',random));reward.relic.metadata.source='Rumbling Rift victory';}
  return reward;
 }
 function commitPending(){
  const p=data.pendingReward;if(!p)return null;
  if(p.card&&bridge.grantCard?.(p.card,p.id)!==true)throw Error('Rift card save pending. Reload to recover.');
  if(!inv().transactItems(items=>{
   if(items.rift_shard.quantity>Number.MAX_SAFE_INTEGER-p.shards)return false;
   items.rift_shard.quantity+=p.shards;if(p.relic){if(items[p.relic.id])return false;items[p.relic.id]=p.relic;}return true;
  },{stream:'rift_reward',id:p.id}))throw Error('Rift rewards pending. Reload to recover.');
  const before={...data};data.pendingReward=null;data.activeAttempt=null;if(!persist()){data=before;throw Error('Rift result save pending. Reload to recover.');}
  return {won:true,...p};
 }
 function finish(battle,won,random=Math.random){
  const run=battle?.rift;if(!run||run.completed||!data.activeAttempt||run.id!==data.activeAttempt.id)return null;
  if(won&&(!battle.enemyTeam?.some(u=>u.isRiftEnemy)||battle.enemyTeam.some(u=>u.hp>0&&!u.defeated)))return null;
  if(data.pendingReward){const reward=commitPending();run.completed=true;return reward;}
  if(!won){const before=data.activeAttempt;data.activeAttempt=null;if(!persist()){data.activeAttempt=before;throw Error('Unable to save Rift result.');}run.completed=true;return {won:false,shards:0,card:null,relic:null};}
  if(!data.pendingReward){data.pendingReward=rollReward(data.activeAttempt,random);if(!persist()){data.pendingReward=null;throw Error('Unable to save Rift rewards.');}}
  const reward=commitPending();run.completed=true;return reward;
 }
 function abort(battle){if(battle?.rift&&!battle.rift.completed&&!data.pendingReward){try{finish(battle,false);}catch(e){host.console.warn(e.message);}}}
 function purchase(id,count=1){
  if(bridge.canAct?.()===false||data.pendingReward)return false;
  const offer=SHOP.find(row=>row.id===id);if(!offer)return false;
  const plan=host.ShopBulkSystem.plan(inv().quantity('rift_shard'),offer.cost,id,count);
  if(!plan.quantity){host.ShopBulkSystem.notify(plan.message);return false;}
  const ok=inv().transactItems(items=>{if(items.rift_shard.quantity<plan.total)return false;items.rift_shard.quantity-=plan.total;items[id].quantity+=plan.quantity;return true;});
  if(ok){host.ShopBulkSystem.success(id,plan.quantity);bridge.onChange?.();}else host.ShopBulkSystem.notify('Unable to save purchase. No items consumed.');return ok;
 }
 function sources(id){
  const rows=[];
  if(id==='rift_shard')rows.push('Win any Rift: 1–5 Rift Shards. Rift opens for the first 30 minutes of every UTC hour.');
  for(const offer of SHOP)if(offer.id===id)rows.push('Universal Rift Shop: '+offer.cost.toLocaleString('en-US')+' Rift Shards.');
  if(inv().getItem(id)?.metadata?.relic?.kind==='odm')rows.push('Rumbling Rift victory: 5% natural drop chance. A Guarantee Shard guarantees one weighted special drop on victory.');
  return rows;
 }
 function renderShop(){
  const grid=host.document?.getElementById('riftShopGrid');if(!grid)return;
  host.document.getElementById('riftShopBalance').textContent=inv().quantity('rift_shard').toLocaleString('en-US')+' Rift Shards';grid.replaceChildren();
  for(const offer of SHOP){const item=inv().getItem(offer.id),box=host.document.createElement('article');box.className='module-item';const name=host.document.createElement('strong'),text=host.document.createElement('p'),button=host.document.createElement('button');name.textContent=item.name;text.textContent=item.description;button.type='button';button.textContent=offer.cost.toLocaleString('en-US')+' Rift Shards';button.addEventListener('click',()=>{if(purchase(item.id,host.ShopBulkSystem.requested(grid)))renderShop();});if(item.image){const image=host.document.createElement('img');image.src=item.image;image.alt=item.name;image.width=48;image.height=48;image.loading='lazy';box.append(image);}box.append(name,text,button);grid.append(box);}
 }
 function renderControls(active=false){
  const doc=host.document,box=doc?.getElementById('riftControls');if(!box)return;box.classList.toggle('hidden',!active);
  const r=rotation(),remaining=Math.max(0,Math.ceil((r.endsAt-Date.now())/1000)),label=`${TYPES[r.type].name} • ${r.open?'OPEN':'CLOSED'} • ${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  doc.getElementById('riftRotationHint').textContent=label;if(!active)return;
  doc.getElementById('riftAvailability').textContent=label;
  doc.getElementById('riftBalance').textContent=inv().quantity('rift_shard').toLocaleString('en-US')+' Rift Shards';
  const toggle=doc.getElementById('riftAutoGuarantee'),owned=inv().quantity('guarantee_shard');if(!owned&&data.autoGuarantee)setAutoGuarantee(false);toggle.checked=data.autoGuarantee;toggle.disabled=!owned;doc.getElementById('riftGuaranteeCount').textContent=owned+' Guarantee Shards';
 }
 function configure(options={}){bridge=options;const doc=host.document;doc?.getElementById('riftAutoGuarantee')?.addEventListener('change',e=>{setAutoGuarantee(e.target.checked);renderControls(true);});host.ShopBulkSystem.mountHeader(doc?.getElementById('riftShopModal'));if(data.pendingReward){try{commitPending();bridge.onChange?.();}catch(e){host.console.warn(e.message);}}}
 host.RiftSystem=Object.freeze({KEY,MODE,TYPES,SHOP,register,sources,rotation,validSave,canEnter,chooseGuarantee,setAutoGuarantee,enemies,start,rollReward,finish,abort,purchase,renderShop,renderControls,configure,get autoGuarantee(){return data.autoGuarantee;},flush:persist,reset(){data=fresh();persist();}});
})(window);
