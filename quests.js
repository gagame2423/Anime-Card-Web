/* Accepted quests consume live gameplay events, never collection snapshots. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_quests_v1';
  const QUESTS = Object.freeze([
    {id:'todo',steps:[
      {kind:'battle',target:1000,teammate:'yuji-itadori',text:'Complete 1,000 battles in any mode with Yuji Itadori in the starting team.'},
      {kind:'battle',target:1000,mode:'raid',raidType:'shibuya',won:true,minDifficulty:11,teammate:'yuji-itadori',text:'Win 1,000 Shibuya Raids at difficulty > 10 with Yuji Itadori.'},
      {kind:'battle',target:1000,mode:'1v1',won:true,weather:'raining',teammate:'yuji-itadori',text:'Win 1,000 regular 1v1 battles with Yuji Itadori during Raining weather.'}
    ]},
    {id:'sukuna-shibuya',steps:[
      {kind:'battle',target:10000,mode:'raid',raidType:'shibuya',won:true,minDifficulty:101,text:'Win 10,000 Shibuya Raids at difficulty > 100.'},
      {kind:'battle',target:1000,mode:'raid',raidType:'shibuya',won:true,minDifficulty:101,weather:'malevolent',text:'Win 1,000 Shibuya Raids at difficulty > 100 during Malevolent weather.'},
      {kind:'roll',target:66666,weather:'malevolent',text:'Roll 66,666 times during Malevolent weather.'},
      {kind:'roll',target:1,card:'weather-malevolent-king',mutation:'cursed',text:'Roll Malevolent King with Cursed, including double mutations.'}
    ]},
    {id:'toji',steps:[
      {kind:'battle',target:888,mode:'boss-event',event:'gomen',won:true,minDifficulty:9,text:'Win 888 Gomen Boss Events at difficulty > 8.'},
      {kind:'roll',target:88888,weather:'malevolent',text:'Roll 88,888 times during Malevolent weather.'},
      {kind:'currency',target:888000000,source:'combat',text:'Earn 888,000,000 VNĐ from battles during this step; salvage does not count.'}
    ]},
    {id:'kiritsu',steps:[
      {kind:'battle',target:10000,mode:'raid',raidType:'holy_grail',won:true,minDifficulty:11,text:'Win 10,000 Holy Grail Raids at difficulty > 10.'},
      {kind:'defeat',target:10000,category:'Fate',text:'Defeat 10,000 Fate-category enemies.'},
      {kind:'currency',target:100000000,text:'Earn 100,000,000 VNĐ during this step; money is not consumed.'},
      {kind:'battle',target:1000,mode:'1v1',won:true,teamCategory:'Fate',text:'Win 1,000 regular 1v1 battles with a Fate card in the starting team.'}
    ]},
    { id: 'julius', steps: [
      {kind:'battle',target:1000,mode:'time-trial',room:100,won:true,text:'Clear Normal Time Trial Room 100 1,000 times.'},
      {kind:'battle',target:100,mode:'time-trial',room:100,won:true,fullElement:'Holy',text:'Clear Normal Time Trial Room 100 with 4 Holy cards 100 times.'},
      {kind:'roll',target:10000,weather:'wind',text:'Roll 10,000 times during Wind weather.'},
      {kind:'battle',target:1000,mode:'boss-event',event:'lucius',won:true,text:'Defeat Lucius Event 1,000 times.'}
    ] },
    { id: 'sung-jin-woo', steps: [
      { kind: 'battle', target: 1000, mode: '1v1', weather: 'shadow', text: 'Complete 1,000 1v1 battles in Shadow weather.' },
      { kind: 'roll', target: 10000, weather: 'shadow', text: 'Roll 10,000 times in Shadow weather.' },
      { kind: 'battle', target: 1000, teammate: 'weather-shadow-monarch', text: 'Complete 1,000 battles in any mode with Igris in the starting team.' },
      { kind: 'roll', target: 1, card: 'weather-shadow-monarch', mutation: 'monarch', text: 'Roll Igris with Monarch, including double mutations.' }
    ] },
    { id: 'frieren', steps: [
      { kind: 'defeat', target: 10000, card: 'normal-demon', text: 'Defeat 10,000 Normal Demon enemies in any mode.' },
      { kind: 'battle', target: 1000, mode: '1v1', weather: 'heavenly', text: 'Complete 1,000 1v1 battles in Heavenly weather.' },
      { kind: 'roll', target: 1000, mutation: 'angelic', text: 'Roll 1,000 cards with Angelic (Heavenly), including double mutations.' }
    ] },
    { id: 'alexander-anderson', steps: [
      { kind: 'battle', target: 1000, mode: 'boss-event', event: 'alucard', minDifficulty: 7, text: 'Complete 1,000 Alucard Event battles at difficulty 7 or higher.' },
      { kind: 'defeat', target: 10000, card: 'normal-demon', weather: 'eclipse', text: 'Defeat 10,000 Normal Demon enemies in Eclipse (Eclipsed) weather.' },
      { kind: 'roll', target: 10000, weather: 'heavenly', text: 'Roll 10,000 times in Heavenly weather.' }
    ] }
  ].map(q => Object.freeze({ ...q, steps: Object.freeze(q.steps.map(Object.freeze)) })));
  const object = v => Boolean(v && typeof v === 'object' && !Array.isArray(v));
  const integer = (v, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(v) && v >= min && v <= max;
  const fresh = () => ({ version: 1, sequence: 0, quests: {} });
  function validSave(v) {
    if (!object(v) || v.version !== 1 || !integer(v.sequence) || !object(v.quests)) return false;
    return Object.entries(v.quests).every(([id, q]) => {
      const def = QUESTS.find(d => d.id === id);
      if (!def || !object(q) || !integer(q.acceptedAt) || !integer(q.step, 0, def.steps.length) || !integer(q.progress) || typeof q.rewarded !== 'boolean') return false;
      if (q.step === def.steps.length ? q.progress !== 0 : q.progress >= def.steps[q.step].target) return false;
      if (!object(q.last) || ('currency' in q.last && (typeof q.last.currency!=='string'||q.last.currency.length>120))) return false;
      if (q.rewarded && q.step !== def.steps.length) return false;
      return ['roll', 'battle', 'defeat'].every(k => typeof q.last[k] === 'string' && q.last[k].length <= 120);
    });
  }
  function load() { try { const v = JSON.parse(host.localStorage.getItem(KEY) || 'null'); return validSave(v) ? v : fresh(); } catch (_) { return fresh(); } }
  let data = load(), bridge = {}, awarding = false;
  function persist() { try { host.localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (_) { return false; } }
  function reconcile() {
    if (awarding || host.SandboxSystem?.active) return;
    awarding = true;
    try {
      for (const def of QUESTS) {
        const q = data.quests[def.id];
        if (q && q.step === def.steps.length && !q.rewarded && bridge.grantCard?.(def.id) === true) {
          q.rewarded = true;
          if (!persist()) q.rewarded = false;
        }
      }
    } finally { awarding = false; }
  }
  function configure(options = {}) { bridge = options; reconcile(); }
  function accept(id) {
    if (!QUESTS.some(q => q.id === id) || data.quests[id] || bridge.canAccept?.() === false) return false;
    data.quests[id] = { acceptedAt: Date.now(), step: 0, progress: 0, rewarded: false, last: { roll: '', battle: '', defeat: '', currency:'' } };
    if (!persist()) { delete data.quests[id]; return false; }
    return true;
  }
  function matches(step, e) {
    return (step.won === undefined || step.won === e.won) && (!step.room || step.room === e.room) && (!step.fullElement || (e.teamElements?.length === 4 && e.teamElements.every(element => element === step.fullElement))) && (!step.mode || step.mode === e.mode) && (!step.weather || e.weatherIds?.includes(step.weather)) &&
      (!step.teammate || e.teamIds?.includes(step.teammate)) && (!step.card || step.card === e.cardId) &&
      (!step.mutation || e.mutationIds?.includes(step.mutation)) && (!step.event || step.event === e.eventType) &&
      (!step.minDifficulty || e.difficulty >= step.minDifficulty) && (!step.raidType||step.raidType===e.raidType) && (!step.category||e.cardCategories?.includes(step.category)) && (!step.teamCategory||e.teamCategories?.includes(step.teamCategory)) && (!step.source||step.source===e.source);
  }
  function record(kind, e) {
    if (host.SandboxSystem?.active || e?.sandbox || e?.mode === 'sandbox') return false;
    if (!['roll', 'battle', 'defeat','currency'].includes(kind) || !e || typeof e.id !== 'string' || !integer(e.startedAt)) return false;
    host.QuestsSystem?.record(kind,e);
    const before = JSON.stringify(data);
    let changed = false;
    for (const def of QUESTS) {
      const q = data.quests[def.id];
      if (!q || q.step >= def.steps.length || e.startedAt < q.acceptedAt || q.last[kind] === e.id) continue;
      // Commit the event receipt and this step together. A completing event
      // never contributes to the next step, even when predicates overlap.
      q.last[kind] = e.id; changed = true;
      const step = def.steps[q.step];
      if (step.kind !== kind || !matches(step, e)) continue;
      q.progress=Math.min(step.target,q.progress+(kind==='currency'?Math.max(0,Math.floor(Number(e.amount)||0)):1));
      if (q.progress >= step.target) { q.step++; q.progress = 0; }
    }
    if (changed && !persist()) { data = JSON.parse(before); return false; }
    reconcile(); if(changed)host.QuestsSystem?.notify(); return changed;
  }
  function battleContext(battle, weatherIds) {
    if (host.SandboxSystem?.active || battle?.sandbox || battle?.mode === 'sandbox') return null;
    if (data.sequence >= Number.MAX_SAFE_INTEGER) throw Error('Quest event limit reached.');
    data.sequence++;
    if (!persist()) { data.sequence--; throw Error('Không thể lưu lượt theo dõi quest.'); }
    return { id: String(data.sequence), startedAt: battle.startedAt, mode: battle.mode, weatherIds: [...weatherIds], teamIds: battle.playerTeam.map(u => u.card.id), teamElements: battle.playerTeam.filter(u => !u.isClone && !u.isSummoned && !u.isTemporaryAlly).map(u => u.card.element), raidType:battle.raid?.type, teamCategories:[...new Set(battle.playerTeam.filter(u=>!u.isClone&&!u.isSummoned&&!u.isTemporaryAlly).flatMap(u=>u.card.category||[]))], eventType: battle.bossEvent?.type, difficulty: battle.bossEvent?.difficulty ?? battle.raid?.difficulty, defeatSequence: 0 };
  }
  function currencyEarned(amount,source="other"){
    if(host.SandboxSystem?.active||!Number.isFinite(amount)||!(amount>0)||data.sequence>=Number.MAX_SAFE_INTEGER||!QUESTS.some(def=>{const q=data.quests[def.id];return q&&def.steps[q.step]?.kind==='currency';}))return false;
    data.sequence++;if(!persist()){data.sequence--;return false;}
    return record('currency',{id:'currency_'+data.sequence,startedAt:Date.now(),amount,source});
  }
  const snapshot = id => data.quests[id] ? JSON.parse(JSON.stringify(data.quests[id])) : null;
  function render(grid) {
    if (!grid) return;
    reconcile(); grid.replaceChildren(); const doc = grid.ownerDocument;
    for (const def of QUESTS) {
      const native = host.ALL_CARDS.find(c => c.id === def.id), q = snapshot(def.id);
      const box = doc.createElement('article'); box.className = 'quest-card module-item'; box.dataset.questId = def.id;
      const art = doc.createElement('img'); art.src = native.image; art.alt = `${native.name} • Quest Card`; art.loading = 'lazy';
      const name = doc.createElement('h3'); name.textContent = native.name;
      const mystery = doc.createElement('p'); mystery.textContent = 'Quest Card • Complete every step to reveal HP, ATK and Passive.';
      box.append(art, name, mystery);
      if (!q) {
        const button = doc.createElement('button'); button.type = 'button'; button.textContent = 'Accept Quest';
        button.disabled = bridge.canAccept?.() === false;
        button.addEventListener('click', () => { if (accept(def.id)) render(grid); else host.alert('Không thể nhận quest lúc này.'); }); box.append(button);
      } else {
        const steps = doc.createElement('ol'); steps.className = 'quest-steps';
        def.steps.forEach((step, i) => {
          const row = doc.createElement('li'); row.className = i < q.step ? 'is-complete' : i === q.step ? 'is-current' : 'is-locked';
          row.textContent = `${i < q.step ? '✓' : i === q.step ? `${q.progress.toLocaleString('en-US')} / ${step.target.toLocaleString('en-US')}` : 'Locked'} • ${step.text}`;
          if (i === q.step) { const progress = doc.createElement('progress'); progress.max = step.target; progress.value = q.progress; progress.setAttribute('aria-label', step.text); row.append(progress); }
          steps.append(row);
        }); box.append(steps);
        const status = doc.createElement('p'); status.setAttribute('role', 'status');
        status.textContent = q.rewarded ? 'COMPLETE • Normal card awarded • Standard rolls unlocked.' : q.step === def.steps.length ? 'COMPLETE • Reward is waiting to be saved. Reopen to retry.' : 'Only the current step counts. Battle wins and losses count; surrender and interrupted battles do not.'; box.append(status);
      }
      grid.append(box);
    }
  }
  function reset() { data = fresh(); persist(); }
  host.QuestSystem = Object.freeze({ KEY, QUESTS, validSave, configure, accept, record, currencyEarned, battleContext, snapshot, render, reset, flush: () => { reconcile(); return persist(); } });
})(window);

/* Rotating quest board, rewards and unified Quest UI. Card quest steps and rotating board share this module. */
(function(host){
  'use strict';
  const KEY='anime_card_rng_quest_board_v1', DAY=86400, PERIODS={daily:DAY,weekly:7*DAY};
  const pools={daily:[
    {id:'kills',kind:'defeat',target:200,title:'Defeat 200 enemies',reward:{stat:'luck',bonus:1,hours:4}},
    {id:'trial',kind:'battle',target:5,mode:'time-trial',roomFactor:.7,title:'Clear your Time Trial target 5 times',reward:{weather:['common','uncommon'],hours:4}},
    {id:'raid',kind:'battle',target:25,mode:'raid',minDifficulty:11,title:'Win 25 Raids at difficulty > 10',reward:{money:.5}},
    {id:'boss',kind:'battle',target:5,mode:'boss-event',minDifficulty:6,title:'Win 5 Boss Events at difficulty > 5',reward:{stat:'drop',bonus:.10,hours:4}},
    {id:'rolls',kind:'roll',rollFactor:.1,title:'Complete your daily roll target',reward:{stat:'luck',bonus:1,hours:4}},
    {id:'duels',kind:'battle',target:50,mode:'1v1',title:'Win 50 regular 1v1 battles',reward:{money:.5}},
    {id:'weather',kind:'weather',target:3,tiers:['rare'],unique:true,title:'Encounter 3 different rare weathers',reward:{weather:['uncommon','rare'],hours:3}}
  ],weekly:[
    {id:'kills',kind:'defeat',target:10000,title:'Defeat 10,000 enemies',reward:{stat:'luck',bonus:1,hours:48}},
    {id:'trial',kind:'battle',target:5,mode:'time-trial',roomFactor:1.15,title:'Clear your Time Trial target 5 times',reward:{weather:['uncommon','rare'],hours:48}},
    {id:'raid',kind:'battle',target:500,mode:'raid',minDifficulty:251,title:'Win 500 Raids at difficulty > 250',reward:{money:5}},
    {id:'boss',kind:'battle',target:500,mode:'boss-event',minDifficulty:51,title:'Win 500 Boss Events at difficulty > 50',reward:{stat:'drop',bonus:.25,hours:48}},
    {id:'rolls',kind:'roll',rollFactor:1,title:'Complete your weekly roll target',reward:{stat:'luck',bonus:1,hours:48}},
    {id:'duels',kind:'battle',target:500,mode:'1v1',title:'Win 500 regular 1v1 battles',reward:{money:5}},
    {id:'weather',kind:'weather',target:36,tiers:['uncommon','rare'],title:'Encounter 36 uncommon / rare weathers',reward:{weather:['rare'],hours:36}}
  ]};
  for(const pool of Object.values(pools))for(const def of pool)Object.freeze(def);
  const object=v=>Boolean(v&&typeof v==='object'&&!Array.isArray(v));
  const integer=v=>Number.isSafeInteger(v)&&v>=0;
  const fresh=()=>({version:1,cycles:{},effects:[],pins:[]});
  function validSave(v){
    if(!object(v)||v.version!==1||!object(v.cycles)||!Array.isArray(v.effects)||!Array.isArray(v.pins)||v.pins.some(id=>typeof id!=='string'||id.length>100))return false;
    for(const [type,c]of Object.entries(v.cycles)){
      if(!PERIODS[type]||!object(c)||!integer(c.index)||!Array.isArray(c.quests)||c.quests.length!==3||new Set(c.quests.map(q=>q.id)).size!==3)return false;
      for(const q of c.quests)if(!object(q)||!pools[type].some(d=>d.id===q.id)||!integer(q.target)||q.target<1||!integer(q.progress)||q.progress>q.target||!integer(q.room)||typeof q.claimed!=='boolean'||!object(q.last)||!Array.isArray(q.seen)||q.seen.some(id=>typeof id!=='string')||Object.values(q.last).some(id=>typeof id!=='string'||id.length>150))return false;
    }
    return v.effects.every(e=>object(e)&&typeof e.id==='string'&&['luck','drop'].includes(e.stat)&&Number.isFinite(e.bonus)&&e.bonus>0&&integer(e.until));
  }
  function load(){try{const v=JSON.parse(host.localStorage.getItem(KEY)||'null');return validSave(v)?v:fresh();}catch(_){return fresh();}}
  let data=load(),bridge={},dirty=false,saveTimer=null,revision=0,ui=null,tab='daily',selected=null,renderedRevision=-1;
  const nowClock=()=>Math.max(0,Number(bridge.clock?.())||0);
  const blocked=()=>Boolean(host.SandboxSystem?.active||bridge.canAct?.()===false);
  function flush(){if(bridge.isImporting?.())return false;if(saveTimer!==null)host.clearTimeout(saveTimer);saveTimer=null;try{host.localStorage.setItem(KEY,JSON.stringify(data));dirty=false;return true;}catch(_){return false;}}
  function changed(){dirty=true;revision++;if(saveTimer===null)saveTimer=host.setTimeout(()=>{saveTimer=null;if(dirty)flush();},250);}
  function rollCycle(type,index){
    const pool=[...pools[type]];
    for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
    const snapshot=bridge.snapshot?.()||{};
    return {index,quests:pool.slice(0,3).map(d=>({id:d.id,target:d.rollFactor?Math.min(Number.MAX_SAFE_INTEGER,Math.max(1,Math.round((snapshot.rolls||0)*d.rollFactor))):d.target,room:d.roomFactor?Math.min(Number.MAX_SAFE_INTEGER,Math.max(1,Math.round((snapshot.bestRoom||0)*d.roomFactor))):0,progress:0,claimed:false,last:{},seen:[]}))};
  }
  function tick(clock=nowClock(),paint=true){
    if(host.SandboxSystem?.active)return;
    for(const[type,period]of Object.entries(PERIODS)){
      const index=Math.floor(clock/period);
      if(!data.cycles[type]||data.cycles[type].index!==index){data.cycles[type]=rollCycle(type,index);changed();}
    }
    const active=data.effects.filter(e=>e.until>Date.now());
    if(active.length!==data.effects.length){data.effects=active;changed();bridge.onChange?.();}
    if(paint&&ui&&!ui.root.classList.contains('hidden'))render();
  }
  function configure(options={}){bridge=options;tick();flush();}
  function record(kind,e){
    if(host.SandboxSystem?.active||e?.sandbox||e?.mode==='sandbox'||!e||typeof e.id!=='string')return false;
    tick(nowClock(),false);let updated=false;
    for(const[type,cycle]of Object.entries(data.cycles))for(const q of cycle.quests){
      const def=pools[type].find(d=>d.id===q.id);
      if(q.claimed||q.progress>=q.target||def.kind!==kind||q.last[kind]===e.id)continue;
      if(kind==='weather'&&Number(e.gameSecond)<cycle.index*PERIODS[type])continue;
      q.last[kind]=e.id;
      const matches=(!def.mode||def.mode===e.mode)&&(!def.minDifficulty||e.difficulty>=def.minDifficulty)&&(!q.room||e.room===q.room)&&(kind!=='battle'||e.won===true)&&(!def.tiers||def.tiers.includes(e.tier));
      if(matches){
        if(def.unique){if(q.seen.includes(e.weatherId))continue;q.seen.push(e.weatherId);}
        q.progress=Math.min(q.target,q.progress+1);updated=true;
      }
      changed();
    }
    return updated;
  }
  function bonus(stat,at=Date.now()){return data.effects.reduce((sum,e)=>sum+(e.stat===stat&&e.until>at?e.bonus:0),0);}
  function rewardText(r){return r.money?`+${r.money*100}% current VNĐ`:r.weather?`Random ${r.weather.join(' / ')} weather • ${r.hours}h`:`+${r.stat==='luck'?r.bonus+' Luck':Math.round(r.bonus*100)+'% Drops'} • ${r.hours}h`;}
  function claim(type,id){
    if(blocked())return false;tick();
    const cycle=data.cycles[type],q=cycle?.quests.find(q=>q.id===id),def=pools[type]?.find(d=>d.id===id);
    if(!q||!def||q.claimed||q.progress<q.target||!flush())return false;
    const receipt=`quest_${type}_${cycle.index}_${id}`,before=JSON.stringify(data),r=def.reward;
    // External currency/weather uses a durable coordinator receipt. Buff + claim share one save.
    if((r.money||r.weather)&&bridge.reward?.(receipt,r)!==true)return false;
    q.claimed=true;
    if(r.stat)data.effects.push({id:receipt,stat:r.stat,bonus:r.bonus,until:Date.now()+r.hours*3600000});
    changed();if(!flush()){data=JSON.parse(before);revision++;return false;}
    bridge.onChange?.();render();return true;
  }
  const fmt=n=>Number(n).toLocaleString('en-US');
  function entries(){
    if(PERIODS[tab])return (data.cycles[tab]?.quests||[]).map(q=>{const d=pools[tab].find(d=>d.id===q.id);return {id:`${tab}:${q.id}`,title:d.title,description:q.room?`Clear Normal Time Trial Room ${fmt(q.room)} ${q.target} times. Target frozen at reset.`:d.title,progress:q.progress,target:q.target,reward:rewardText(d.reward),claimed:q.claimed,quest:q};});
    if(tab==='story')return host.QuestSystem.QUESTS.map(d=>{
      const q=host.QuestSystem.snapshot(d.id),card=host.ALL_CARDS.find(c=>c.id===d.id),step=q&&d.steps[q.step];
      return {id:`card:${d.id}`,title:card.name,description:step?.text||(!q?'Accept to start this sequential Card Quest. No retroactive progress.':'All steps completed. Normal card and future rolls unlocked.'),progress:q?Math.min(d.steps.length,q.step)+(step?q.progress/step.target:0):0,target:d.steps.length,reward:'Normal card • Standard pool unlock',claimed:q?.rewarded,card,definition:d,snapshot:q};
    });
    return [];
  }
  function countdown(seconds){const n=Math.max(0,Math.ceil(seconds));return `${Math.floor(n/3600)}h ${Math.floor(n%3600/60)}m ${n%60}s`;}
  function set(node,text){if(node&&node.textContent!==String(text))node.textContent=String(text);}
  function mount(root){
    if(!root)return;
    ui={root,tabs:root.querySelector('[data-quest-tabs]'),list:root.querySelector('[data-quest-list]'),detail:root.querySelector('[data-quest-detail]'),timer:root.querySelector('[data-quest-reset]'),rows:new Map()};
    if(!ui.tabs||!ui.list||!ui.detail){ui=null;return;}
    ui.tabs.addEventListener('click',e=>{const b=e.target.closest('[data-quest-tab]');if(!b)return;if(!['daily','weekly','story'].includes(b.dataset.questTab))return;tab=b.dataset.questTab;selected=null;renderedRevision=-1;render();});
    ui.list.addEventListener('click',e=>{const pin=e.target.closest('[data-quest-pin]'),row=e.target.closest('[data-quest-id]');if(!row)return;if(pin){const id=row.dataset.questId;data.pins=data.pins.includes(id)?data.pins.filter(p=>p!==id):[...data.pins,id];changed();}else selected=row.dataset.questId;renderedRevision=-1;render();});
    ui.detail.addEventListener('click',e=>{const button=e.target.closest('[data-quest-action]');if(!button)return;const [kind,id]=selected.split(':');
      if(kind==='card'){host.QuestSystem.accept(id);revision++;}else if(!claim(kind,id))host.alert('Unable to claim quest reward. Check save storage and battle state.');
      renderedRevision=-1;render();
    });
  }
  function render(){
    if(!ui||ui.root.classList.contains('hidden'))return;
    const period=PERIODS[tab];set(ui.timer,period?`Resets in ${countdown((data.cycles[tab].index+1)*period-nowClock())}`:'Card Quests • Sequential • Accept before tracking');
    for(const node of ui.list.querySelectorAll('[data-row-timer]'))set(node,period?countdown((data.cycles[tab].index+1)*period-nowClock()):'No reset');
    const buffs=ui.root.querySelector('[data-quest-buffs]');set(buffs,data.effects.filter(e=>e.until>Date.now()).map(e=>`${e.stat==='luck'?`+${e.bonus} Luck`:`+${Math.round(e.bonus*100)}% Drops`} • ${countdown((e.until-Date.now())/1000)}`).join(' | '));
    if(renderedRevision===revision)return;renderedRevision=revision;
    const items=entries().sort((a,b)=>Number(data.pins.includes(b.id))-Number(data.pins.includes(a.id)));
    if(!items.some(i=>i.id===selected))selected=items[0]?.id||null;
    for(const b of ui.tabs.querySelectorAll('[data-quest-tab]')){const active=b.dataset.questTab===tab;b.classList.toggle('is-active',active);b.setAttribute('aria-selected',String(active));}
    ui.list.replaceChildren();
    for(const item of items){
      const row=document.createElement('article');row.className='quest-board-row'+(item.id===selected?' is-selected':'');row.dataset.questId=item.id;
      const select=document.createElement('button');select.type='button';select.className='quest-row-select';select.dataset.questId=item.id;
      const label=document.createElement('small');label.textContent=tab==='story'?'Card Quest':`${tab.toUpperCase()} QUEST`;
      const title=document.createElement('strong');title.textContent=item.title;
      const progress=document.createElement('progress');progress.max=item.target;progress.value=item.progress;
      const amount=document.createElement('span');amount.textContent=item.claimed?'✓ Claimed':`${fmt(Math.floor(item.progress))} / ${fmt(item.target)}`;
      const timer=document.createElement('small');timer.dataset.rowTimer='';timer.textContent=period?countdown((data.cycles[tab].index+1)*period-nowClock()):'No reset';select.append(label,timer,title,progress,amount);
      const pin=document.createElement('button');pin.type='button';pin.dataset.questPin='';pin.textContent=data.pins.includes(item.id)?'◆':'◇';pin.className='quest-pin';pin.setAttribute('aria-label','Pin '+item.title);pin.setAttribute('aria-pressed',String(data.pins.includes(item.id)));
      row.append(select,pin);ui.list.append(row);
    }
    ui.detail.replaceChildren();const item=items.find(i=>i.id===selected);if(!item)return;
    const heading=document.createElement('h3');heading.textContent=item.title;
    const description=document.createElement('p');description.textContent=item.description;
    const progress=document.createElement('progress');progress.max=item.target;progress.value=item.progress;
    const percent=document.createElement('p');percent.textContent=`${fmt(Math.floor(item.progress))} / ${fmt(item.target)} (${Math.floor(item.progress/item.target*100)}%)`;
    ui.detail.append(heading,description,progress,percent);
    if(item.card){const art=document.createElement('img');art.className='quest-mystery-art';art.src=item.card.image;art.alt=item.card.name;art.loading='lazy';ui.detail.append(art);
      const steps=document.createElement('ol');steps.className='quest-steps';item.definition.steps.forEach((step,i)=>{const li=document.createElement('li');li.textContent=`${i<(item.snapshot?.step||0)?'✓':i===(item.snapshot?.step??-1)?`${item.snapshot.progress}/${step.target}`:'Locked'} • ${step.text}`;steps.append(li);});ui.detail.append(steps);
    }
    const reward=document.createElement('div');reward.className='quest-reward';reward.textContent='🎁 '+item.reward;ui.detail.append(reward);
    const button=document.createElement('button');button.type='button';button.dataset.questAction='';
    const canAccept=item.card&&!item.snapshot;
    button.textContent=item.claimed?'Claimed':canAccept?'Accept Quest':item.card?'Quest in progress':'Claim Reward';
    button.disabled=blocked()||item.claimed||(!canAccept&&(item.card||item.progress<item.target));ui.detail.append(button);
  }
  function open(){tick();renderedRevision=-1;render();}
  function reset(){data=fresh();revision++;tick();flush();}
  host.document?.addEventListener('visibilitychange',()=>{if(host.document.visibilityState==='hidden'&&dirty)flush();});
  host.addEventListener('pagehide',()=>{if(dirty)flush();});
  host.QuestsSystem=Object.freeze({KEY,PERIODS,pools,validSave,configure,tick,record,bonus,claim,mount,open,render,reset,flush,notify:()=>{revision++;},snapshot:()=>JSON.parse(JSON.stringify(data))});
})(window);
