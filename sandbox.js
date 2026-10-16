/* In-memory combat lab. No save, ownership, reward or progression APIs. */
(function (host) {
  'use strict';
  const MAX_SLOTS = 10, STAT_LIMIT = Number.MAX_VALUE / 1024;
  const clone = value => JSON.parse(JSON.stringify(value));
  let bridge = {}, active = false, battle = null, engine = null, timer = null, paused = false;
  let setup = { player:[], enemy:[] }, serial = 0;
  const doc = () => host.document, el = id => doc().getElementById(id);
  const cards = () => host.ALL_CARDS;
  const findCard = id => cards().find(c => c.id === id);
  function number(value, fallback, min, max) { const n = value === '' ? NaN : Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback; }
  function create(tag, text, className = '') { const n = doc().createElement(tag); if (text !== undefined) n.textContent = text; n.className = className; return n; }
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function slot(cardId = 'normal-demon') { return { uid:++serial, cardId, mutationIds:[], level:1, hp:null, atk:null }; }
  function defaults(config) {
    const card = findCard(config.cardId), factors = host.MutationSystem.factors(config.mutationIds);
    const scale = host.CardLevelSystem.statMultiplier(config.level);
    return { hp:Math.max(1,Math.min(STAT_LIMIT,Math.round(card.stats.hp * scale * factors.hp))), atk:Math.max(0,Math.min(STAT_LIMIT,Math.round(card.stats.atk * scale * factors.atk))) };
  }
  function log(text) {
    const node = el('sandboxLog'); if (!node) return;
    node.append(create('p', text)); while (node.children.length > 150) node.firstElementChild.remove(); node.scrollTop = node.scrollHeight;
  }
  function stopTimer() { if (timer !== null) host.clearTimeout(timer); timer = null; }
  const inCombat = () => Boolean(battle && !battle.finished);
  function seconds() { return number(el('sandboxTurnSeconds').value,2,.1,60); }
  function schedule() { stopTimer(); if (active && inCombat() && !paused) timer = host.setTimeout(tick, seconds()*1000); }
  function add(side) {
    if (inCombat() || setup[side].length >= MAX_SLOTS) return false;
    setup[side].push(slot()); renderSetup(side); return true;
  }
  function labelField(label, input) { const node = create('label'); node.append(create('span',label),input); return node; }
  function selectCard(config, side) {
    const select = create('select'); select.setAttribute('aria-label', `${side} card`);
    for (const c of [...cards()].sort((a,b)=>a.name.localeCompare(b.name))) { const option = create('option',c.name); option.value = c.id; option.selected = c.id === config.cardId; select.append(option); }
    select.addEventListener('change',()=>{ config.cardId=select.value; config.hp=null;config.atk=null;renderSetup(side); }); return select;
  }
  function mutationSelect(config, index, side) {
    const select = create('select'); select.setAttribute('aria-label',`${side} mutation ${index+1}`);
    const none = create('option','None / Normal'); none.value=''; select.append(none);
    for(const m of host.MUTATIONS){const option=create('option',m.name);option.value=m.id;option.selected=m.id===(config.mutationIds[index]||'');select.append(option);}
    select.addEventListener('change',()=>{
      const values=[...(config.mutationIds || [])];values[index]=select.value;
      config.mutationIds=[...new Set(values.filter(Boolean))];config.hp=null;config.atk=null;renderSetup(side);
    });return select;
  }
  function numericInput(value, label, min, max, callback) {
    const input = create('input'); input.type='number'; input.min=String(min);input.max=String(max);input.step='1';input.value=String(value);input.setAttribute('aria-label',label);
    input.addEventListener('change',()=>callback(number(input.value,value,min,max)));
    input.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();input.blur();}});return input;
  }
  function renderSetup(side) {
    const grid=el(side==='player'?'sandboxPlayerSetup':'sandboxEnemySetup');if(!grid)return;grid.replaceChildren();
    setup[side].forEach((config,index)=>{
      const box=create('article',undefined,'sandbox-slot');box.dataset.slotUid=String(config.uid);
      const head=create('div',undefined,'sandbox-slot-head');head.append(create('strong',`Slot ${index+1}`));
      const remove=create('button','Remove','ghost-button');remove.type='button';remove.addEventListener('click',()=>{setup[side].splice(index,1);renderSetup(side);});head.append(remove);box.append(head);
      box.append(labelField('Card (full Index)',selectCard(config,side)));
      const mutations=create('div',undefined,'sandbox-fields');mutations.append(labelField('Mutation 1',mutationSelect(config,0,side)),labelField('Mutation 2',mutationSelect(config,1,side)));box.append(mutations);
      const base=defaults(config),fields=create('div',undefined,'sandbox-fields sandbox-stat-fields');
      fields.append(labelField('Level',numericInput(config.level,`${side} slot ${index+1} Level`,1,host.CardLevelSystem.MAX_LEVEL,n=>{config.level=host.CardLevelSystem.normalizeLevel(n);config.hp=null;config.atk=null;renderSetup(side);})),labelField('Max HP',numericInput(config.hp ?? base.hp,`${side} slot ${index+1} HP`,1,STAT_LIMIT,n=>{config.hp=Math.floor(n);renderSetup(side);})),labelField('ATK',numericInput(config.atk ?? base.atk,`${side} slot ${index+1} ATK`,0,STAT_LIMIT,n=>{config.atk=Math.floor(n);renderSetup(side);})));
      box.append(fields);grid.append(box);
    });updateControls();
  }
  function updateControls() {
    const playing=inCombat();
    el('sandboxStartButton').disabled=playing || !setup.player.length || !setup.enemy.length;
    el('sandboxPauseButton').disabled=!playing;el('sandboxPauseButton').textContent=paused?'Resume':'Pause';
    el('sandboxStepButton').disabled=!playing || !paused;el('sandboxStopButton').disabled=!playing;
    for(const side of ['player','enemy']){
      const root=el(side==='player'?'sandboxPlayerSetup':'sandboxEnemySetup');root.querySelectorAll('input,select,button').forEach(node=>node.disabled=playing);
      doc().querySelectorAll(`[data-sandbox-side="${side}"]`).forEach(button=>button.disabled=playing || (button.dataset.sandboxAction==='add' && setup[side].length>=MAX_SLOTS));
    }
    for(const id of ['sandboxSeed','sandboxWeather','sandboxAquaMode'])el(id).disabled=playing;
  }
  function unit(config, side) {
    const native=clone(findCard(config.cardId)),base=defaults(config);
    const hp=config.hp ?? base.hp,atk=config.atk ?? base.atk;
    const mutations=config.mutationIds.map(id=>clone(host.MUTATION_BY_ID[id]));
    return {card:native,display:{name:`${mutations.map(m=>`[${m.name}] `).join('')}${native.name}`,image:native.image,hp,atk},level:config.level,mutations,hp,maxHp:hp,atk,defeated:false,side,sandboxAllowZeroAttack:true};
  }
  function renderCombat() {
    if(!battle || !engine)return;
    for(const side of ['player','enemy']){
      const root=el(side==='player'?'sandboxPlayerCombat':'sandboxEnemyCombat');root.replaceChildren();
      battle[side+'Team'].forEach((u,i)=>{
        const row=create('article',undefined,`sandbox-combat-unit ${u.defeated || u.hp<=0?'is-defeated':''} ${battle[side]===u?'is-active':''}`);
        const head=create('div',undefined,'sandbox-unit-head'),name=create('strong',`${i+1}. ${u.display?.name || u.card.name}`);head.append(name);host.ElementSystem.renderBadge(head,u.card);row.append(head);
        row.append(create('span',`Lv.${u.level||1} • HP ${Math.max(0,u.hp).toLocaleString('en-US')} / ${u.maxHp.toLocaleString('en-US')} • ATK ${u.atk.toLocaleString('en-US')}`));
        const bar=create('progress');bar.max=u.maxHp;bar.value=Math.max(0,u.hp);bar.setAttribute('aria-label',`${u.card.name} HP`);row.append(bar);
        const status=engine.getPassiveStatusBadges(u,battle).map(s=>s.label).join(' • '),shield=engine.ensureRuntime(u).shield;
        row.append(create('small',`${shield>0?`Shield ${shield.toLocaleString('en-US')} • `:''}${status}`));
        const passive=engine.getPassiveDescription(u),details=create('details'),summary=create('summary',passive.name);details.append(summary,create('p',passive.description));row.append(details);root.append(row);
      });
    }
    el('sandboxSummary').textContent=`${battle.finished?battle.outcome:paused?'PAUSED':'RUNNING'} • Turn ${battle.turnCount} • Damage: player ${Math.floor(battle.damageTotals.player).toLocaleString('en-US')} / enemy ${Math.floor(battle.damageTotals.enemy).toLocaleString('en-US')} • No rewards or progression`;
    updateControls();
  }
  function start() {
    if(!active || inCombat() || !setup.player.length || !setup.enemy.length)return false;
    stopTimer();el('sandboxLog').replaceChildren();paused=false;
    const weatherIds=new Set([...el('sandboxWeather').selectedOptions].map(o=>o.value));
    const random=rng(number(el('sandboxSeed').value,0,0,4294967295));
    engine=host.PassiveSystem.createIsolated({
      random, getCardById:id=>{const card=findCard(id);return card?clone(card):null;}, appendBattleLog:log,
      isWeatherActive:name=>{const key=String(name).toLowerCase();return host.WEATHERS.some(w=>(w.id===key||w.name.toLowerCase()===key)&&weatherIds.has(w.id));}
      // Deliberately no reward, quest, ownership, weather-write or save callbacks.
    });
    battle={mode:'sandbox',sandbox:true,playerTeam:setup.player.map(c=>unit(c,'player')),enemyTeam:setup.enemy.map(c=>unit(c,'enemy')),turn:'player',playerIndex:0,enemyIndex:0,finished:false,championChoices:{aqua:el('sandboxAquaMode').value},startedAt:Date.now()};
    engine.beginBattle(battle);const winner=engine.checkBattleWinner(battle);if(winner){battle.finished=true;battle.outcome=winner==='player'?'PLAYER WINS':'OPPONENT WINS';}
    log('Sandbox match started. All state is temporary; no rewards, quest progress or achievements.');renderCombat();schedule();return true;
  }
  function tick() {
    stopTimer();if(!active || !inCombat())return;
    try { const result=engine.resolveTurn(battle);if(result.ended){battle.finished=true;battle.outcome=result.winner==='player'?'PLAYER WINS':'OPPONENT WINS';log(battle.outcome+' • No rewards awarded.');} }
    catch(error){battle.finished=true;battle.outcome='STOPPED';log(`Combat stopped: ${error.message}`);}
    renderCombat();schedule();
  }
  function exit() {
    if(!active)return;stopTimer();active=false;paused=false;battle=null;engine=null;
    el('sandboxModal').classList.add('hidden');el('sandboxPlayerCombat').replaceChildren();el('sandboxEnemyCombat').replaceChildren();el('sandboxLog').replaceChildren();
    bridge.onExit?.();el('sandboxOpenButton')?.focus();
  }
  function open() {
    if(active || bridge.canEnter?.()===false)return false;
    active=true;bridge.onEnter?.();el('sandboxModal').classList.remove('hidden');
    if(!setup.player.length && !setup.enemy.length){setup.player=['starter-common','normal-demon','sasuke-kid','deku-mc'].map(slot);setup.enemy=['normal-demon','starter-common','sasuke-kid','starter-rare'].map(slot);}
    if(!el('sandboxSeed').value)el('sandboxSeed').value=String(Date.now()>>>0);
    renderSetup('player');renderSetup('enemy');el('sandboxSummary').textContent='Configure both teams, then Start Sandbox. Locked and unowned cards are available.';el('sandboxExitButton').focus();return true;
  }
  function configure(options={}) {
    bridge=options;
    const weather=el('sandboxWeather');for(const w of host.WEATHERS){const option=create('option',w.name);option.value=w.id;weather.append(option);}
    el('sandboxOpenButton').addEventListener('click',open);el('sandboxExitButton').addEventListener('click',exit);
    el('sandboxStartButton').addEventListener('click',start);
    el('sandboxPauseButton').addEventListener('click',()=>{if(!inCombat())return;paused=!paused;renderCombat();schedule();});
    el('sandboxStepButton').addEventListener('click',()=>{if(paused)tick();});
    el('sandboxStopButton').addEventListener('click',()=>{stopTimer();if(battle){battle.finished=true;battle.outcome='STOPPED';}paused=false;renderCombat();});
    el('sandboxTurnSeconds').addEventListener('change',()=>{el('sandboxTurnSeconds').value=String(seconds());schedule();});
    for(const button of doc().querySelectorAll('[data-sandbox-action]'))button.addEventListener('click',()=>{
      if(inCombat())return;const side=button.dataset.sandboxSide,action=button.dataset.sandboxAction;
      if(action==='add')return add(side);
      if(action==='clear')setup[side]=[];
      if(action==='reset')for(const c of setup[side]){c.level=1;c.mutationIds=[];c.hp=null;c.atk=null;}
      if(action==='level')for(const c of setup[side]){c.level=1000;c.hp=null;c.atk=null;}
      renderSetup(side);
    });
    doc().addEventListener('keydown',event=>{if(active&&event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();exit();}},true);
    el('sandboxModal').addEventListener('click',event=>{if(event.target===el('sandboxModal'))exit();});
  }
  host.SandboxSystem=Object.freeze({configure,open,exit,start,get active(){return active;}});
})(window);
