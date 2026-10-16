/* Boss Event availability, difficulty, coins, exclusive drops and durable rewards. */
(function(host) {
  'use strict';
  const KEY='anime_card_rng_boss_event_v1',MODE='boss-event',CARD_ID='boss-event-alucard';
  const TYPES=Object.freeze({alucard:Object.freeze({name:'Alucard Event',weatherId:'eclipse',bossHp:666666,bossAtk:66666,cardId:CARD_ID})});
  const SHOP=Object.freeze(['rich_potion','exp_potion','lucky_potion','speed_potion','speed_battle_potion'].map(id=>Object.freeze({id,cost:id==='speed_battle_potion'?25:10})));
  const LEVEL_GROWTH=.075;
  const object=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
  const integer=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const difficulty=n=>Math.max(1,Math.min(1000,Math.floor(Number(n)||1)));
  const randomUnit=random=>Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0));
  const fresh=()=>({version:1,sequence:0,events:{alucard:{coins:0,difficulty:1,wins:0}},activeAttempt:null,pendingReward:null});
  const coinRange=d=>host.RaidSystem.coinRange(d);
  const cardChance=d=>.006+.054*(difficulty(d)-1)/999;
  function validAttempt(a) {return object(a)&&typeof a.id==='string'&&/^\d+_\d+$/.test(a.id)&&a.type==='alucard'&&integer(a.difficulty,1,1000)&&integer(a.startedAt);}
  function validSave(v) {
    if(!object(v)||v.version!==1||!integer(v.sequence)||!object(v.events)||Object.keys(v.events).length!==1||!object(v.events.alucard))return false;
    const e=v.events.alucard;
    if(!integer(e.coins)||!integer(e.wins)||!integer(e.difficulty,1,1000))return false;
    if(v.activeAttempt!==null&&!validAttempt(v.activeAttempt))return false;
    const p=v.pendingReward;if(p===null)return true;
    if(!validAttempt(p)||!v.activeAttempt||p.id!==v.activeAttempt.id||p.type!==v.activeAttempt.type||p.startedAt!==v.activeAttempt.startedAt||p.difficulty!==v.activeAttempt.difficulty)return false;
    const range=coinRange(p.difficulty);
    if(!integer(p.baseCoins,range.min,range.max)||!Number.isFinite(p.dropMultiplier)||p.dropMultiplier<1||p.dropMultiplier>2.35)return false;
    const exact=Number((p.baseCoins*p.dropMultiplier).toFixed(8));
    if(!integer(p.coins,Math.floor(exact),Math.ceil(exact)))return false;
    return p.card===null||(object(p.card)&&p.card.cardId===CARD_ID&&Array.isArray(p.card.mutationIds)&&p.card.mutationIds.length<=2&&new Set(p.card.mutationIds).size===p.card.mutationIds.length&&p.card.mutationIds.every(id=>typeof id==='string'&&Object.hasOwn(host.MUTATION_BY_ID,id)));
  }
  function load(){try{const saved=JSON.parse(host.localStorage.getItem(KEY)||'null');return validSave(saved)?saved:fresh();}catch(_){return fresh();}}
  let data=load(),bridge={};
  if(!data.pendingReward)data.activeAttempt=null;
  function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(_){return false;}}
  persist();
  function available(type='alucard'){return Boolean(TYPES[type]&&bridge.weatherActive?.(TYPES[type].weatherId));}
  function canEnter(type='alucard'){return available(type)&&!data.pendingReward&&!data.activeAttempt&&data.sequence<Number.MAX_SAFE_INTEGER;}
  function setDifficulty(type,value){const e=data.events[type];if(!e||data.activeAttempt||data.pendingReward)return false;const before=e.difficulty;e.difficulty=difficulty(value);if(persist())return true;e.difficulty=before;return false;}
  function snapshot(type='alucard'){return {...data.events[type],available:available(type)};}
  function enemies(type='alucard',d=data.events[type]?.difficulty){
    const definition=TYPES[type];if(!definition)return [];
    const native=host.ALL_CARDS.find(c=>c.id===definition.cardId);if(!native)throw Error('Thiếu thẻ Boss Event.');
    const level=difficulty(d),scale=1+(level-1)*LEVEL_GROWTH,stats={hp:Math.round(definition.bossHp*scale),atk:Math.round(definition.bossAtk*scale)};
    const card={...native,stats:{...stats}};
    return [{card,display:{name:'Alucard • Event Boss',image:native.image,...stats},mutations:[],hp:stats.hp,maxHp:stats.hp,atk:stats.atk,defeated:false,level,isBossEventEnemy:true}];
  }
  function start(battle,type='alucard'){
    if(battle?.mode!==MODE||battle.playerTeam?.length!==5||battle.enemyTeam?.length!==1||!canEnter(type))throw Error('Cần 5 thẻ và thời tiết Eclipse (Eclipsed) đang hoạt động.');
    const before=JSON.parse(JSON.stringify(data));data.sequence++;
    const attempt={id:`${Date.now()}_${data.sequence}`,type,difficulty:data.events[type].difficulty,startedAt:Date.now()};
    data.activeAttempt=attempt;if(!persist()){data=before;throw Error('Không thể lưu lượt Boss Event.');}
    battle.bossEvent={...attempt,completed:false};return battle.bossEvent;
  }
  function rollCard(d,random=Math.random){
    if(randomUnit(random)>=cardChance(d))return null;
    // Unlike Raid secrets, Boss Event drops may grant another card/variant.
    return {cardId:CARD_ID,mutationIds:(bridge.rollMutations?.()||[]).map(m=>typeof m==='string'?m:m.id)};
  }
  function commitPending(){
    const p=data.pendingReward;if(!p)return null;
    if(p.card&&bridge.grantCard?.(p.card,p.id)!==true)throw Error('Thẻ Boss Event đang chờ lưu; game sẽ thử khôi phục khi tải lại.');
    const before=JSON.parse(JSON.stringify(data)),e=data.events[p.type],coins=Math.min(p.coins,Number.MAX_SAFE_INTEGER-e.coins);
    e.coins+=coins;e.wins=Math.min(Number.MAX_SAFE_INTEGER,e.wins+1);data.pendingReward=null;data.activeAttempt=null;
    if(!persist()){data=before;throw Error('Boss Event Coins đang chờ lưu; game sẽ thử khôi phục khi tải lại.');}
    return {won:true,type:p.type,difficulty:p.difficulty,coins,card:p.card,dropMultiplier:p.dropMultiplier};
  }
  function configure(options={}){bridge=options;if(data.pendingReward){try{commitPending();}catch(e){console.warn(e.message);}}}
  function finish(battle,won,random=Math.random){
    const run=battle?.bossEvent;if(!run||run.completed)return null;
    if(won&&(!battle.enemyTeam?.some(u=>u.isBossEventEnemy&&u.card.id===CARD_ID)||battle.enemyTeam.some(u=>!u.defeated&&u.hp>0)))return null;
    if(data.pendingReward){if(data.pendingReward.id!==run.id)throw Error('Có phần thưởng Boss Event khác đang chờ lưu.');const result=commitPending();run.completed=true;return result;}
    if(!data.activeAttempt||data.activeAttempt.id!==run.id)return null;
    if(!won){const before=data.activeAttempt;data.activeAttempt=null;if(!persist()){data.activeAttempt=before;throw Error('Không thể lưu kết quả Boss Event.');}run.completed=true;return {won:false,type:run.type,difficulty:run.difficulty,coins:0,card:null,dropMultiplier:1};}
    const range=coinRange(run.difficulty),baseCoins=range.min+Math.floor(randomUnit(random)*(range.max-range.min+1));
    data.pendingReward={...data.activeAttempt,baseCoins,dropMultiplier:host.InventorySystem.getDropMultiplier(),coins:host.InventorySystem.scaleDrop(baseCoins,random),card:rollCard(run.difficulty,random)};
    if(!persist()){data.pendingReward=null;throw Error('Không thể lưu phần thưởng Boss Event.');}
    const result=commitPending();run.completed=true;return result;
  }
  function abort(battle){if(battle?.bossEvent&&!battle.bossEvent.completed&&!data.pendingReward){try{finish(battle,false);}catch(e){console.warn(e.message);}}}
  function purchase(type,id){
    const e=data.events[type],offer=SHOP.find(o=>o.id===id);
    if(!e||!offer||data.pendingReward||e.coins<offer.cost||host.InventorySystem.quantity(id)>=Number.MAX_SAFE_INTEGER)return false;
    e.coins-=offer.cost;if(!persist()){e.coins+=offer.cost;return false;}
    if(!host.InventorySystem.grant(id,1)){e.coins+=offer.cost;persist();return false;}return true;
  }
  function renderShop(grid,type='alucard',onChange=()=>{}){
    if(!grid||!TYPES[type])return;grid.replaceChildren();const doc=grid.ownerDocument;
    for(const offer of SHOP){
      const item=host.InventorySystem.getItem(offer.id),box=doc.createElement('article');box.className='module-item';
      const name=doc.createElement('strong');name.textContent=`${item.icon} ${item.name}`;
      const text=doc.createElement('p');text.textContent=item.description;
      const button=doc.createElement('button');button.type='button';button.textContent=`${offer.cost} Boss Event Coins`;button.disabled=data.events[type].coins<offer.cost||Boolean(data.pendingReward);
      button.addEventListener('click',()=>{if(purchase(type,offer.id))onChange();else host.alert('Không thể mua vật phẩm Boss Event.');});box.append(name,text,button);grid.append(box);
    }
  }
  function reset(){data=fresh();persist();}
  host.BossEventSystem=Object.freeze({KEY,MODE,CARD_ID,TYPES,SHOP,LEVEL_GROWTH,validSave,coinRange,cardChance,available,canEnter,setDifficulty,snapshot,enemies,start,rollCard,finish,abort,configure,purchase,renderShop,totalWins:()=>Object.values(data.events).reduce((sum,e)=>Math.min(Number.MAX_SAFE_INTEGER,sum+e.wins),0),reset,flush:persist});
})(window);
