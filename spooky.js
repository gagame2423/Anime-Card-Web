/* Seasonal Spooky Hunt: run state, choices, rewards, shop and capsules. */
(function(host){
  'use strict';
  const KEY='anime_card_rng_spooky_v1',MODE='spooky-hunt',TIME_ZONE='Asia/Bangkok',MAX=Number.MAX_SAFE_INTEGER;
  const PLAYER_TEAM_SIZE=6,ENEMY_TEAM_SIZE=3,TURN_MS=2000;
  const CAPSULE=Object.freeze({id:'spooky_capsule',name:'Spooky Capsule',type:'consumable',tier:'mythic',icon:'🎃',image:'assets/items/spookycapsule.png',description:'Open in Storage → Items for one card, using standard mutation rolls. Duplicates grant 10% level EXP. The Judgement requires Heavenly Tower Floor 100.'});
  const EQUIPMENT='equipment_headless_horseman';
  const POOL=Object.freeze(['the-trapper','madness-doctor','tower-champion-heavenly','boss-event-alucard','boss-event-lucius','asta-demon','the-clown','the-oni','freddy-krueger','myers']);
  const COLLECTION=Object.freeze(['the-trapper','madness-doctor','the-legion','tower-champion-heavenly','the-clown','the-oni','freddy-krueger','jason-13th','myers']);
  const CAPSULE_POOL=Object.freeze([['the-trapper',30],['madness-doctor',30],['the-legion',15],['tower-champion-heavenly',10],['the-clown',10],['the-oni',10],['freddy-krueger',1]].map(Object.freeze));
  const SHOP=Object.freeze([
    ...['exp_potion','rich_potion','lucky_potion','speed_potion'].map(id=>Object.freeze({id,cost:10})),
    ...['super_exp_potion','super_rich_potion','super_luck_potion','super_speed_potion'].map(id=>Object.freeze({id,cost:100})),
    Object.freeze({id:CAPSULE.id,cost:25}),Object.freeze({id:'machete',cost:613000})
  ]);
  const CHOICES=Object.freeze([
    Object.freeze({id:'player_stats',title:'Moonlit Strength',fields:Object.freeze({playerStats:[30,60]})}),
    Object.freeze({id:'enemy_stats',title:'Greedy Harvest',fields:Object.freeze({coins:[10,30],enemyStats:[30,60]})}),
    Object.freeze({id:'enemy_dodge',title:'Slippery Shadows',fields:Object.freeze({coins:[30,60],dodge:[3,6]})}),
    Object.freeze({id:'enemy_reduction',title:'Iron Coffins',fields:Object.freeze({coins:[15,60],reduction:[6,9]})}),
    Object.freeze({id:'enemy_bleed',title:'Blood Money',fields:Object.freeze({coins:[10,60],bleed:[3,9]})}),
    Object.freeze({id:'enemy_power',title:'Nightmare Bargain',fields:Object.freeze({coins:[15,60],enemyStats:[33,99]})})
  ]);
  const BASE=Object.freeze([[300000,60000],[600000,60000],[666000,66000]].map(Object.freeze));
  const FINAL=Object.freeze([[33300000,333000],[66600000,666000],[99900000,999000]].map(Object.freeze));
  const object=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
  const integer=(v,min=0,max=MAX)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
  const receipt=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v);
  const unit=random=>Math.max(0,Math.min(1-Number.EPSILON,Number(random())||0));
  const roll=(min,max,random=Math.random)=>min+Math.floor(unit(random)*(max-min+1));
  const waveOf=n=>Math.max(1,Math.min(50,Math.floor(Number(n)||1)));
  const calendarFormatter=new Intl.DateTimeFormat('en-US',{timeZone:TIME_ZONE,year:'numeric',month:'numeric'});
  let calendarDay=null,calendarValue=null;
  const calendar=at=>{const d=new Date(at);if(!Number.isFinite(d.getTime()))return {year:0,month:0};const day=Math.floor((d.getTime()+7*60*60*1000)/86400000);if(calendarDay===day)return calendarValue;const parts=calendarFormatter.formatToParts(d);calendarDay=day;return calendarValue=Object.freeze({year:Number(parts.find(p=>p.type==='year').value),month:Number(parts.find(p=>p.type==='month').value)});};
  const isOpen=(at=Date.now())=>calendar(at).month===10;
  const freshRun=(season=0)=>({wave:1,season,choices:[],pendingChoice:null});
  const fresh=()=>({version:1,coins:0,runs:0,sequence:0,run:freshRun(),activeAttempt:null,pending:null});
  function validChoice(c){
    const def=CHOICES.find(d=>d.id===c?.id);if(!def||!integer(c.wave,5,50)||c.wave%5)return false;
    return Object.entries(def.fields).every(([key,[min,max]])=>integer(c[key],min,max))&&Object.keys(c).every(key=>['id','wave',...Object.keys(def.fields)].includes(key));
  }
  function validRun(run){
    if(!object(run)||!integer(run.wave,1,50)||!integer(run.season,0,9999)||!Array.isArray(run.choices)||run.choices.length>10)return false;
    if(!run.choices.every((c,index)=>validChoice(c)&&c.wave===(index+1)*5&&c.wave<=run.wave))return false;
    const expected=Math.floor((run.wave-1)/5);if(run.choices.length<expected||run.choices.length>Math.floor(run.wave/5))return false;
    const p=run.pendingChoice;if(p===null)return true;
    return object(p)&&p.wave===run.wave&&run.wave%5===0&&run.choices.length===expected&&Array.isArray(p.options)&&p.options.length===3&&new Set(p.options.map(c=>c.id)).size===3&&p.options.every(c=>validChoice(c)&&c.wave===p.wave);
  }
  function validSave(v){
    if(!object(v)||v.version!==1||!integer(v.coins)||!integer(v.runs)||!integer(v.sequence)||!validRun(v.run))return false;
    const a=v.activeAttempt;
    if(a!==null&&(!object(a)||!receipt(a.id)||!integer(a.wave,1,50)||a.wave!==v.run.wave||!integer(a.startedAt)||!integer(a.killSequence)||!integer(a.killCoins)))return false;
    const p=v.pending;if(p===null)return true;
    if(!object(p)||!receipt(p.id)||!['kill','wave','loss','purchase','capsule'].includes(p.kind)||!Number.isSafeInteger(p.coinsDelta)||Math.abs(p.coinsDelta)>MAX||!Array.isArray(p.items)||!Array.isArray(p.cards)||!Array.isArray(p.costs)||p.items.length>3||p.cards.length>1||p.costs.length>1)return false;
    if(!p.items.every(row=>object(row)&&integer(row.quantity,1,4)&&[EQUIPMENT,'machete',...SHOP.map(s=>s.id)].includes(row.id)))return false;
    if(!p.cards.every(row=>object(row)&&[...CAPSULE_POOL.map(row=>row[0]),'myers'].includes(row.cardId)&&Array.isArray(row.mutationIds)&&row.mutationIds.length<=2&&new Set(row.mutationIds).size===row.mutationIds.length&&row.mutationIds.every(id=>Object.hasOwn(host.MUTATION_BY_ID||{},id))))return false;
    if(!p.costs.every(row=>object(row)&&row.id===CAPSULE.id&&row.quantity===1))return false;
    if(p.nextRun!==null&&!validRun(p.nextRun))return false;
    if(typeof p.completedRun!=='boolean'||!object(p.summary))return false;
    if(['kill','wave','loss'].includes(p.kind)&&(!a||p.attemptId!==a.id))return false;
    if(p.kind==='purchase'&&(!SHOP.some(offer=>offer.id===p.items[0]?.id&&p.coinsDelta===-offer.cost)||p.items.length!==1||p.items[0].quantity!==1||p.cards.length||p.costs.length||p.nextRun!==null||p.completedRun))return false;
    if(p.kind==='capsule'&&(p.costs.length!==1||p.cards.length!==1||p.items.length||p.coinsDelta!==0||p.nextRun!==null||p.completedRun))return false;
    if(['kill','wave','loss'].includes(p.kind)&&p.coinsDelta<0)return false;
    if(p.kind==='capsule'&&!CAPSULE_POOL.some(row=>row[0]===p.cards[0].cardId))return false;
    if(p.kind==='kill'&&(p.items.length||p.cards.length||p.costs.length||p.nextRun!==null||p.completedRun||p.coinsDelta>Math.ceil(100*7*1.66*host.InventorySystem.MAX_KNOWN_DROP_MULTIPLIER)))return false;
    if(p.kind==='loss'&&(p.coinsDelta!==0||p.items.length||p.cards.length||p.costs.length||p.nextRun?.wave!==1||p.nextRun.choices.length||p.completedRun))return false;
    if(p.kind==='wave'&&(p.costs.length||p.items.some(row=>![EQUIPMENT,'machete'].includes(row.id)||row.quantity!==1)||new Set(p.items.map(row=>row.id)).size!==p.items.length||p.cards.some(row=>row.cardId!=='myers')||p.completedRun!==(a.wave===50)||p.nextRun?.wave!==(a.wave===50?1:a.wave+1)||p.coinsDelta>Math.ceil(500*7*1.66*host.InventorySystem.MAX_KNOWN_DROP_MULTIPLIER)))return false;
    return v.coins+p.coinsDelta>=0;
  }
  let bridge={},data;
  try{const raw=JSON.parse(host.localStorage.getItem(KEY)||'null');data=validSave(raw)?raw:fresh();}catch(_){data=fresh();}
  let interrupted=Boolean(data.activeAttempt&&!data.pending),busy=false;
  if(interrupted){data.activeAttempt=null;data.run=freshRun(data.run.season);}
  function persist(){try{host.localStorage.setItem(KEY,JSON.stringify(data));return true;}catch(_){return false;}}
  function register(){host.InventorySystem.registerItem(CAPSULE);}
  register();persist();
  function notify(kind='wave'){bridge.onChange?.(kind);}
  function commitPending(){
    const p=data.pending;if(!p)return null;
    if((p.items.length||p.costs.length)&&!host.InventorySystem.transactOnce('spooky_rewards',p.id,p.items,p.costs))throw Error('Không thể lưu item Spooky. Giao dịch đang chờ khôi phục.');
    if(p.cards.length&&bridge.grantCards?.(p.cards,p.id,p.kind)!==true)throw Error('Không thể lưu thẻ Spooky. Giao dịch đang chờ khôi phục.');
    const before=JSON.parse(JSON.stringify(data));
    data.coins=Math.max(0,Math.min(MAX,data.coins+p.coinsDelta));
    if(p.completedRun)data.runs=Math.min(MAX,data.runs+1);
    if(p.nextRun)data.run=p.nextRun;
    if(p.kind==='kill'&&data.activeAttempt)data.activeAttempt.killCoins=Math.min(MAX,data.activeAttempt.killCoins+p.coinsDelta);
    if(['wave','loss'].includes(p.kind))data.activeAttempt=null;
    data.pending=null;
    if(!persist()){data=before;throw Error('Không thể lưu Spooky Coins. Giao dịch đang chờ khôi phục.');}
    return {...p.summary,cards:p.cards,items:p.items,coins:p.coinsDelta,completedRun:p.completedRun};
  }
  function queue(kind,fields){
    if(data.pending)throw Error('Có giao dịch Spooky đang chờ lưu.');
    const before=JSON.parse(JSON.stringify(data));data.sequence++;
    data.pending={id:`${Date.now()}_${data.sequence}_${kind}`,kind,coinsDelta:0,items:[],cards:[],costs:[],nextRun:null,completedRun:false,summary:{},...fields};
    if(!persist()){data=before;throw Error('Không thể lưu giao dịch Spooky.');}
    return commitPending();
  }
  function configure(options={}){bridge=options;if(data.pending){try{commitPending();if(data.activeAttempt){interrupted=true;data.activeAttempt=null;data.run=freshRun(data.run.season);persist();}}catch(e){console.warn(e.message);}}}
  function syncSeason(at=Date.now()){
    if(data.activeAttempt||data.pending||!isOpen(at))return;
    const year=calendar(at).year;if(data.run.season===year)return;
    const previous=data.run;data.run=freshRun(year);if(!persist()){data.run=previous;throw Error('Không thể bắt đầu mùa Spooky.');}
  }
  function needsChoice(){return data.run.wave%5===0&&data.run.choices.length<data.run.wave/5;}
  function ensureChoice(random=Math.random){
    if(data.pending||data.activeAttempt||!isOpen())return false;syncSeason();if(!needsChoice())return true;
    if(data.run.pendingChoice)return false;
    const pool=[...CHOICES],options=[];
    for(let i=0;i<3;i++){const [def]=pool.splice(roll(0,pool.length-1,random),1);const value={id:def.id,wave:data.run.wave};for(const [key,[min,max]]of Object.entries(def.fields))value[key]=roll(min,max,random);options.push(value);}
    data.run.pendingChoice={wave:data.run.wave,options};if(!persist()){data.run.pendingChoice=null;throw Error('Không thể lưu lựa chọn Spooky.');}return false;
  }
  function choose(index){
    const p=data.run.pendingChoice;if(host.SandboxSystem?.active||data.activeAttempt||data.pending||!isOpen()||!integer(index,0,2)||!p)return false;
    const before=JSON.parse(JSON.stringify(data.run));data.run.choices.push({...p.options[index]});data.run.pendingChoice=null;
    if(!persist()){data.run=before;return false;}notify('choice');return true;
  }
  function modifiers(choices=data.run.choices){
    const result={playerStats:0,enemyStats:0,coins:0,dodge:0,reduction:0,bleed:0};
    for(const choice of choices)for(const key of Object.keys(result))result[key]+=(choice[key]||0)/100;
    return result;
  }
  function enemyStats(wave,slot){const t=(waveOf(wave)-1)/49,s=t*t*(3-2*t);return {hp:Math.round(BASE[slot][0]+(FINAL[slot][0]-BASE[slot][0])*s),atk:Math.round(BASE[slot][1]+(FINAL[slot][1]-BASE[slot][1])*s)};}
  function coinRange(wave,kill=false){const t=(waveOf(wave)-1)/49;return kill?{min:Math.round(1+19*t),max:Math.round(5+95*t)}:{min:Math.round(5+95*t),max:Math.round(20+480*t)};}
  function coinMultiplier(choices=data.run.choices){return (1+modifiers(choices).coins)*(1+(host.EquipmentSystem?.bonuses().spookyCoins||0))*host.InventorySystem.getDropMultiplier();}
  function scaledCoins(base,choices,random){const exact=Math.min(MAX,base*coinMultiplier(choices)),whole=Math.floor(exact);return whole+(exact>whole&&unit(random)<exact-whole?1:0);}
  function enemies(random=Math.random){
    const pool=[...POOL],bonus=1+modifiers().enemyStats;
    return Array.from({length:ENEMY_TEAM_SIZE},(_,slot)=>{const [id]=pool.splice(roll(0,pool.length-1,random),1),native=host.ALL_CARDS.find(c=>c.id===id);if(!native)throw Error('Thiếu thẻ Spooky: '+id);const stats=enemyStats(data.run.wave,slot);stats.hp=Math.round(stats.hp*bonus);stats.atk=Math.round(stats.atk*bonus);const card={...native,element:'Fire',stats:{...stats}};return {card,display:{name:card.name,image:card.image,...stats},hp:stats.hp,maxHp:stats.hp,atk:stats.atk,level:1,defeated:false,mutations:[],isSpookyEnemy:true};});
  }
  function canEnter(){return !host.SandboxSystem?.active&&isOpen()&&!data.pending&&!data.activeAttempt;}
  function start(battle){
    if(!canEnter()||battle?.mode!==MODE||battle.playerTeam?.length!==PLAYER_TEAM_SIZE||battle.enemyTeam?.length!==ENEMY_TEAM_SIZE||!ensureChoice())throw Error('Spooky Hunt cần 6 thẻ người chơi đấu 3 đối thủ, tháng 10 và lựa chọn buff đã hoàn tất.');
    const previous=data.sequence;data.sequence++;data.activeAttempt={id:`${Date.now()}_${data.sequence}_hunt`,wave:data.run.wave,startedAt:Date.now(),killSequence:0,killCoins:0};
    if(!persist()){data.sequence=previous;data.activeAttempt=null;throw Error('Không thể lưu lượt Spooky Hunt.');}
    battle.spooky={...data.activeAttempt,choices:JSON.parse(JSON.stringify(data.run.choices)),modifiers:modifiers(),completed:false,killCoins:0};
    const mult=1+battle.spooky.modifiers.playerStats;
    for(const member of battle.playerTeam){member.maxHp=Math.round(member.maxHp*mult);member.hp=member.maxHp;member.atk=Math.round(member.atk*mult);Object.assign(member.display,{hp:member.maxHp,atk:member.atk});}
    return battle.spooky;
  }
  function recordKill(battle,victim,random=Math.random){
    if(host.SandboxSystem?.active||battle?.mode!==MODE||!battle.spooky||battle.spooky.completed||!battle.enemyTeam.includes(victim)||(!victim.defeated&&victim.hp>0)||data.activeAttempt?.id!==battle.spooky.id)return 0;
    const seen=battle.spookySeen ||= new WeakSet();if(seen.has(victim))return 0;
    if(data.pending)commitPending();const range=coinRange(battle.spooky.wave,true),coins=scaledCoins(roll(range.min,range.max,random),battle.spooky.choices,random);
    const result=queue('kill',{attemptId:battle.spooky.id,coinsDelta:coins,summary:{kind:'kill',wave:battle.spooky.wave}});
    seen.add(victim);battle.spooky.killCoins=Math.min(MAX,battle.spooky.killCoins+result.coins);return result.coins;
  }
  function mutationIds(){return (bridge.rollMutations?.()||[]).map(m=>typeof m==='string'?m:m.id);}
  function finish(battle,won,random=Math.random){
    const run=battle?.spooky;if(!run||run.completed||host.SandboxSystem?.active)return null;
    if(won&&battle.enemyTeam.some(unit=>!unit.defeated&&unit.hp>0))return null;
    if(data.pending){const p=data.pending;if(p.attemptId!==run.id)throw Error('Giao dịch Spooky khác đang chờ lưu.');const kind=p.kind,result=commitPending();if(kind==='wave'||kind==='loss'){run.completed=true;notify();return result;}}
    if(data.activeAttempt?.id!==run.id)return null;
    const completedRun=won&&run.wave===50,range=coinRange(run.wave),coins=won?scaledCoins(roll(range.min,range.max,random),run.choices,random):0;
    const items=[],cards=[];
    // Special-drop rolls belong only to a successful final-wave clear.
    if(completedRun){if(unit(random)<.05)items.push({id:EQUIPMENT,quantity:1});if(unit(random)<.01)cards.push({cardId:'myers',mutationIds:mutationIds()});if(unit(random)<.01)items.push({id:'machete',quantity:1});}
    const nextRun=!won||completedRun?freshRun(data.run.season):{...data.run,wave:run.wave+1};
    const result=queue(won?'wave':'loss',{attemptId:run.id,coinsDelta:coins,items,cards,completedRun,nextRun,summary:{won,wave:run.wave,killCoins:data.activeAttempt.killCoins,nextWave:nextRun.wave}});
    run.completed=true;notify();return result;
  }
  function abort(battle){if(battle?.spooky&&!battle.spooky.completed){try{finish(battle,false);}catch(e){console.warn(e.message);}}}
  function capsulePool(){
    const eligible=CAPSULE_POOL.filter(([id])=>id!=='tower-champion-heavenly'||bridge.hasJudgement?.()===true),total=eligible.reduce((sum,row)=>sum+row[1],0);
    return eligible.map(([cardId,weight])=>({cardId,weight,chance:weight/total}));
  }
  function purchase(id){
    const offer=SHOP.find(offer=>offer.id===id);if(!offer||data.pending||busy||host.SandboxSystem?.active||bridge.canAct?.()!==true||data.coins<offer.cost||host.InventorySystem.quantity(id)>=MAX)return false;
    busy=true;try{queue('purchase',{coinsDelta:-offer.cost,items:[{id,quantity:1}],summary:{kind:'purchase'}});notify('purchase');return true;}catch(e){host.alert?.(e.message);return false;}finally{busy=false;}
  }
  function openCapsule(random=Math.random){
    if(data.pending||busy||host.SandboxSystem?.active||bridge.canAct?.()!==true||host.InventorySystem.quantity(CAPSULE.id)<1)return null;
    busy=true;try{const pool=capsulePool(),r=unit(random);let sum=0,pick=pool.at(-1);for(const row of pool){sum+=row.chance;if(r<sum){pick=row;break;}}
      const result=queue('capsule',{cards:[{cardId:pick.cardId,mutationIds:mutationIds()}],costs:[{id:CAPSULE.id,quantity:1}],summary:{kind:'capsule'}});notify('capsule');bridge.onCapsule?.(result);return result;
    }catch(e){host.alert?.(e.message);return null;}finally{busy=false;}
  }
  function choiceText(choice){const lines=[];if(choice.playerStats)lines.push(`Team HP / ATK +${choice.playerStats}%`);if(choice.coins)lines.push(`Spooky Coins +${choice.coins}%`);if(choice.enemyStats)lines.push(`Enemies HP / ATK +${choice.enemyStats}%`);if(choice.dodge)lines.push(`Enemies dodge +${choice.dodge} percentage points (stacks)`);if(choice.reduction)lines.push(`Enemies damage reduction +${choice.reduction}%`);if(choice.bleed)lines.push(`Enemies: +${choice.bleed}% Bleed chance, 33% ATK / turn for 1–3 turns`);return lines;}
  function renderChoices(grid,onChoose=()=>{}){
    if(!grid)return;ensureChoice();grid.replaceChildren();const pending=data.run.pendingChoice;if(!pending)return;
    const doc=grid.ownerDocument;pending.options.forEach((choice,index)=>{const box=doc.createElement('article');box.className='spooky-choice';const title=doc.createElement('h3');title.textContent=CHOICES.find(def=>def.id===choice.id).title;const list=doc.createElement('ul');for(const line of choiceText(choice)){const li=doc.createElement('li');li.textContent=line;list.append(li);}const button=doc.createElement('button');button.type='button';button.textContent='Choose for this run';button.disabled=Boolean(data.pending);button.addEventListener('click',()=>{if(choose(index))onChoose();});box.append(title,list,button);grid.append(box);});
  }
  function renderInfo(grid,battle){if(!grid)return;grid.replaceChildren();const choices=battle?.spooky?.choices||data.run.choices,doc=grid.ownerDocument;for(const choice of choices){const row=doc.createElement('p');row.textContent=`Wave ${choice.wave} · ${choiceText(choice).join(' • ')}`;grid.append(row);}if(!choices.length){const row=doc.createElement('p');row.textContent='No run modifiers selected yet.';grid.append(row);}}
  const shopViews=new WeakMap();
  function renderShop(grid,onChange=()=>{}){
    if(!grid)return;
    let view=shopViews.get(grid);
    if(!view){
      grid.replaceChildren();view={rows:[],onChange};const doc=grid.ownerDocument,fragment=doc.createDocumentFragment();
      for(const offer of SHOP){const item=host.InventorySystem.getItem(offer.id);if(!item)continue;const box=doc.createElement('article');box.className='module-item';const name=doc.createElement('strong');name.textContent=`${item.icon} ${item.name}`;const text=doc.createElement('p');text.textContent=item.description;const button=doc.createElement('button');button.type='button';button.textContent=`${offer.cost.toLocaleString('en-US')} Spooky Coins`;button.dataset.spookyPurchase=offer.id;
        button.addEventListener('click',()=>{if(purchase(offer.id))view.onChange();});box.append(name,text,button);fragment.append(box);view.rows.push({offer,button});}
      grid.append(fragment);shopViews.set(grid,view);
    }
    view.onChange=onChange;const allowed=bridge.canAct?.()===true&&!data.pending&&!busy;
    for(const {offer,button}of view.rows)button.disabled=!allowed||data.coins<offer.cost||host.InventorySystem.quantity(offer.id)>=MAX;
  }
  function sources(id){const result=[];for(const offer of SHOP)if(offer.id===id)result.push(`Spooky Shop: ${offer.cost.toLocaleString('en-US')} Spooky Coins.`);if(id===EQUIPMENT)result.push('Spooky Hunt: independent 5% chance only after winning Wave 50.');if(id==='machete')result.push('Spooky Hunt: independent 1% chance only after winning Wave 50; evolves Lv.100+ The Trapper.');return result;}
  function snapshot(){return JSON.parse(JSON.stringify({coins:data.coins,runs:data.runs,wave:data.run.wave,choices:data.run.choices,pendingChoice:data.run.pendingChoice,available:isOpen(),blocked:Boolean(data.pending)}));}
  function reset(){data=fresh();register();persist();}
  host.SpookySystem=Object.freeze({KEY,MODE,PLAYER_TEAM_SIZE,ENEMY_TEAM_SIZE,TURN_MS,TIME_ZONE,CAPSULE,EQUIPMENT,POOL,COLLECTION,CAPSULE_POOL,SHOP,CHOICES,BASE,FINAL,isOpen,calendar,validSave,configure,syncSeason,needsChoice,ensureChoice,choose,modifiers,enemyStats,coinRange,coinMultiplier,enemies,canEnter,start,recordKill,finish,abort,purchase,openCapsule,capsulePool,choiceText,renderChoices,renderInfo,renderShop,sources,snapshot,reset,flush:persist,get interrupted(){return interrupted;},get blocked(){return Boolean(data.pending);},unlocked:()=>host.AchievementSystem?.areSpookyComplete()===true});
})(window);
