/* Achievement tracking, milestone definitions, persistence, claiming and UI. */
(function (host) {
  'use strict';
  const KEY = 'anime_card_rng_achievements_v1';
  const TIERS = Object.freeze({
    collection: Object.freeze([25, 50, 75, 100]),
    battles: Object.freeze([1, 10, 100, 1000, 10000, 100000, 1000000]),
    currency: Object.freeze([1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 10000000000, 100000000000, 1000000000000, 10000000000000, 100000000000000]),
    rolls: Object.freeze([1000, 10000, 100000, 1000000, 10000000, 100000000]),
    tower: Object.freeze([10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 1000000]),
    timetrial: Object.freeze([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400]),
    raid: Object.freeze([1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000]),
    boss: Object.freeze([1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000])
  });
  const CATEGORIES = Object.freeze({ collection: 'Collection', battles: 'Battle wins', currency: 'VNĐ milestones', rolls: 'Total rolls', tower: 'Tower progress', timetrial: 'Time Trial rooms', raid: 'Total Raid wins', boss: 'Total Boss Event clears', spooky:'Spooky Event',penalty:'Penalty Achievements' });
  const count = value => Number.isFinite(Number(value)) ? Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.floor(Number(value)))) : 0;
  const record = value => value && typeof value === 'object' && !Array.isArray(value);
  const safeKey = id => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id);
  function fresh() { return { version: 1, stats: { collection: 0, battles: 0, currencyEarned: 0, peakCurrency: 0, rolls: 0, tower: 0, timetrial: 0, raid: 0, boss: 0, spookyRuns:0, spookyEvolution:0, spookyCollection:0,penaltyPerfectSessions:0,penaltyAccuracy:0,penaltyTopCorners:0 }, towerProgress: {}, claimed: {}, unlockedRequirements: {} }; }
  function load() {
    let raw; try { raw = JSON.parse(host.localStorage?.getItem(KEY) || 'null'); } catch (_) { raw = null; }
    const result = fresh();
    if (!record(raw)) return result;
    for (const key of Object.keys(result.stats)) result.stats[key] = count(raw.stats?.[key]);
    for (const [id, floor] of Object.entries(record(raw.towerProgress) ? raw.towerProgress : {})) if (safeKey(id)) result.towerProgress[id] = count(floor);
    for (const key of ['claimed', 'unlockedRequirements']) {
      for (const [id, flag] of Object.entries(record(raw[key]) ? raw[key] : {})) if (safeKey(id) && flag === true) result[key][id] = true;
    }
    return result;
  }
  let data = load(), bridge = {}, definitions = [], bonusDefinitions = {}, reconciling = false;
  function persist() { try { host.localStorage?.setItem(KEY, JSON.stringify(data)); host.CloudSaveSystem?.markDirty(); return true; } catch (error) { console.warn('Achievement save unavailable', error); return false; } }
  function compact(value) {
    for (const [unit, suffix] of [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']]) if (value >= unit) return `${(value / unit).toFixed(2).replace(/\.?0+$/, '')}${suffix}`;
    return String(value);
  }
  function buildDefinitions(cards, towerTypes) {
    const result = [];
    const collectionTiers = [...TIERS.collection];
    for (let n = 125; n <= (cards || []).length; n += 25) collectionTiers.push(n);
    for (const [category, tiers] of Object.entries({ ...TIERS, collection: collectionTiers })) {
      tiers.forEach(target => {
        const id = `${category}_${target}`;
        if (category === 'timetrial') {
          const reward = target <= 100 ? { luckBonus: .1 } : target <= 150 ? { expBonus: .1 } : target <= 200 ? { coinBonus: .1 } : target <= 300 ? { luckBonus: .1 } : { expBonus: .05 };
          result.push(Object.freeze({ id, category, target, title: `Clear Time Trial Room ${target}`, reward: Object.freeze(reward), automatic: false }));
          return;
        }
        if (category === 'boss') {
          result.push(Object.freeze({ id, category, target, title: `Clear ${compact(target)} Boss Events across all types`, reward: Object.freeze({ dropBonus: .1 }), automatic: false }));
          return;
        }
        if (category === 'raid') {
          result.push(Object.freeze({ id, category, target, title: `Win ${compact(target)} ${target === 1 ? 'Raid' : 'Raids'} across all types`, reward: Object.freeze({ dropBonus: .05 }), automatic: false }));
          return;
        }
        const title = category === 'collection' ? `Own ${compact(target)} unique cards` : category === 'battles' ? `Win ${compact(target)} ${target===1?'battle':'battles'}` : category === 'currency' ? `Earn or own ${compact(target)} VNĐ` : category === 'rolls' ? `Complete ${compact(target)} rolls` : `Clear Floor ${compact(target)} in any Tower`;
        const currency = category === 'currency' ? Math.max(100, Math.floor(target * .05)) : category === 'battles' ? target * 500 : category === 'rolls' ? target : target * 100;
        result.push(Object.freeze({ id, category, target, title, reward: Object.freeze({ currency }), automatic: false }));
      });
    }
    for (const card of (cards || []).filter(card => card?.unlockRequirement)) {
      const requirement = /^tower_floor_(\d+)_([a-z][a-z0-9-]*)$/.exec(card.unlockRequirement);
      const towerType = card.towerType || requirement?.[2];
      const target = card.towerFloor || Number(requirement?.[1]);
      if (!towerType || !Number.isSafeInteger(target) || target < 1) continue;
      const type = (towerTypes || []).find(t => t.id === towerType);
      result.push(Object.freeze({ id: card.unlockRequirement, requirement: card.unlockRequirement, category: 'tower', towerType, target, title: `${type?.name || towerType} • Floor ${target} Champion`, reward: Object.freeze({ cardId: card.id, cardName: card.name }), automatic: true }));
    }
    result.push(
      Object.freeze({id:'spooky_runs_666',category:'spooky',stat:'spookyRuns',target:666,title:'Clear all 50 Spooky Hunt waves 666 times',reward:Object.freeze({luckBonus:.6}),automatic:false}),
      Object.freeze({id:'spooky_jason_evolved',category:'spooky',stat:'spookyEvolution',target:1,title:'Evolve The Trapper into Jason 13th',reward:Object.freeze({dropBonus:.06}),automatic:false}),
      Object.freeze({id:'spooky_collection',category:'spooky',stat:'spookyCollection',target:10,title:'Own all 10 Spooky collection cards',reward:Object.freeze({expBonus:.6}),automatic:false})
    );
    result.push(
      Object.freeze({id:'penalty_predators_eye',requirement:'penalty_predators_eye',category:'penalty',stat:'penaltyPerfectSessions',target:5000,title:"Predator's Eye · Score 5/5 in 5,000 sessions",reward:Object.freeze({cardId:'michael-kaiser',cardName:'Michael Kaiser'}),automatic:true}),
      Object.freeze({id:'penalty_egoist_metavision',requirement:'penalty_egoist_metavision',category:'penalty',stat:'penaltyAccuracy',target:host.PenaltyStatsSystem.CONFIG.maxLevel,title:"Egoist's Metavision · Max Accuracy",reward:Object.freeze({cardId:'isagi-yoichi',cardName:'Isagi Yoichi'}),automatic:true}),
      Object.freeze({id:'penalty_ace_eater',requirement:'penalty_ace_eater',category:'penalty',stat:'penaltyTopCorners',target:5000,title:"Ace Eater's Territory · Score 5,000 top-corner goals",reward:Object.freeze({cardId:'don-lorenzo',cardName:'Don Lorenzo'}),automatic:true})
    );
    return result;
  }
  function progress(def) {
    if (def.towerType) return count(data.towerProgress[def.towerType]);
    if (def.category === 'currency') return Math.max(data.stats.currencyEarned, data.stats.peakCurrency);
    return count(data.stats[def.stat||def.category]);
  }
  function claim(id) {
    if (host.SandboxSystem?.active) return false;
    const def = definitions.find(item => item.id === id);
    if (!def || data.claimed[id] || progress(def) < def.target || typeof bridge.applyReward !== 'function') return false;
    try {
      // The coordinator's durable reward receipt makes retries idempotent if a
      // reload occurs between the card/currency save and this achievement save.
      if (bridge.applyReward(def) !== true) return false;
      data.claimed[id] = true;
      if (def.requirement) data.unlockedRequirements[def.requirement] = true;
      persist();
      return true;
    } catch (error) { console.warn('Achievement reward could not be claimed', error); return false; }
  }
  function sync(snapshot = bridge.getSnapshot?.() || {}) {
    if (reconciling || host.SandboxSystem?.active) return false;
    reconciling = true;
    const before = JSON.stringify(data);
    try {
      data.stats.collection = Math.max(data.stats.collection, count(snapshot.uniqueCards));
      data.stats.rolls = Math.max(data.stats.rolls, count(snapshot.totalRolls));
      data.stats.battles = Math.max(data.stats.battles, count(snapshot.knownBattleWins));
      data.stats.timetrial = Math.max(data.stats.timetrial, count(snapshot.timeTrialRoom));
      // The Raid module owns durable per-type win counts. Reconciliation uses
      // their sum, so reloads/pending reward recovery never add a win twice.
      data.stats.raid = Math.max(data.stats.raid, count(snapshot.knownRaidWins));
      data.stats.boss = Math.max(data.stats.boss, count(snapshot.knownBossWins));
      data.stats.spookyRuns=Math.max(data.stats.spookyRuns,count(snapshot.spookyRuns));
      data.stats.spookyEvolution=Math.max(data.stats.spookyEvolution,Math.min(1,count(snapshot.spookyEvolution)));
      data.stats.spookyCollection=Math.max(data.stats.spookyCollection,Math.min(10,count(snapshot.spookyCollection)));
      for(const key of ['penaltyPerfectSessions','penaltyAccuracy','penaltyTopCorners'])data.stats[key]=Math.max(data.stats[key],count(snapshot[key]));
      data.stats.peakCurrency = Math.max(data.stats.peakCurrency, count(snapshot.currency));
      // Old saves have no lifetime-earnings history. The known balance is the
      // migration baseline; subsequent awards are recorded explicitly.
      data.stats.currencyEarned = Math.max(data.stats.currencyEarned, count(snapshot.currency));
      for (const [type, floor] of Object.entries(record(snapshot.towerProgress) ? snapshot.towerProgress : {})) {
        if (!safeKey(type)) continue;
        data.towerProgress[type] = Math.max(count(data.towerProgress[type]), count(floor));
        data.stats.tower = Math.max(data.stats.tower, count(floor));
      }
      for (const def of definitions.filter(item => item.automatic)) {
        if (data.claimed[def.id]) data.unlockedRequirements[def.requirement] = true;
        else if (progress(def) >= def.target) claim(def.id);
      }
      const changed = JSON.stringify(data) !== before;
      if (changed) persist();
      return changed;
    } finally { reconciling = false; }
  }
  function recordBattleWin() { if (host.SandboxSystem?.active) return; data.stats.battles = count(data.stats.battles + 1); persist(); }
  function recordCurrencyEarned(amount) { if (host.SandboxSystem?.active) return; data.stats.currencyEarned = count(data.stats.currencyEarned + count(amount)); persist(); }
  function configure(options = {}) { bridge = options; definitions = buildDefinitions(options.cards || host.ALL_CARDS || [], options.towerTypes || []); bonusDefinitions = {}; for (const def of definitions) for (const field of ['luckBonus','expBonus','coinBonus','dropBonus']) if (def.reward[field]) (bonusDefinitions[field] ||= []).push(def); sync(); persist(); }
  function list(category = 'all') {
    return definitions.filter(def => category === 'all' || def.category === category).map(def => { const value=progress(def); return { ...def, value, complete:value>=def.target, claimed:data.claimed[def.id]===true }; });
  }
  const number = new Intl.NumberFormat('en-US');
  const crests = Object.freeze({ collection:'▦', battles:'⚔︎', currency:'◈', rolls:'✦', tower:'♜', timetrial:'◷', raid:'⚑', boss:'♛', spooky:'☾', penalty:'◎' });
  const tier = item => item.claimed ? 1 : item.complete ? 0 : 2;
  const goal = item => item.claimed ? item.target : Math.min(item.value, item.target);
  const sortProgress = (a,b) => tier(a)-tier(b) || (tier(a)===2 ? goal(b)/b.target-goal(a)/a.target : 0);
  const format = value => number.format(value);
  function requirementText(item) {
    const target = format(item.target);
    if (item.towerType) return 'Clear this Tower floor to unlock its Champion for future rolls.';
    return ({
      collection:'Count distinct cards in your collection; extra copies do not count.',
      battles:`Record ${target} ${item.target===1?'victory':'victories'} in battle.`,
      currency:`Reach ${target} VNĐ through earnings or your highest balance.`,
      rolls:`Roll for cards ${target} times.`,
      tower:`Reach Floor ${target} in any Tower.`,
      timetrial:`Clear Room ${target} in Time Trial.`,
      raid:`Record ${target} total wins across all Raid types.`,
      boss:`Record ${target} total clears across all Boss Events.`,
      spooky:'Progress is tracked during Spooky Hunt and in your collection.',
      penalty:'Progress is tracked across Penalty Shootout sessions.'
    })[item.category];
  }
  function rewardText(reward) {
    if(reward.luckBonus)return `+${reward.luckBonus} permanent Luck`;
    if(reward.expBonus)return `+${reward.expBonus} permanent EXP Multiplier`;
    if(reward.coinBonus)return `+${reward.coinBonus} permanent VNĐ Multiplier`;
    if(reward.dropBonus)return `+${reward.dropBonus} permanent Drop Multiplier · Item quantities only`;
    if(reward.cardId)return `${reward.cardName} · Normal card and permanent roll unlock`;
    return `${format(reward.currency)} VNĐ`;
  }
  const renderStates = new WeakMap();
  function createCard(grid, item, view) {
    const doc=grid.ownerDocument,make=(tag,cls,text)=>{
      const node=doc.createElement(tag);if(cls)node.className=cls;if(text)node.textContent=text;return node;
    };
    const card=make('article','achievement-card');card.dataset.achievementId=item.id;
    const head=make('header','achievement-card-head');
    const crest=make('span','achievement-crest',crests[item.category]||'✦');crest.setAttribute('aria-hidden','true');
    const identity=make('div','achievement-identity'),title=make('h4','achievement-title',item.title);
    identity.append(make('span','achievement-category',CATEGORIES[item.category]),title);
    const state=make('span','achievement-state');head.append(crest,identity,state);
    const detail=make('p','achievement-requirement',requirementText(item));
    const progress=make('div','achievement-metric'),numbers=make('small','achievement-metric__value');
    const bar=make('div','achievement-progress'),fill=make('span');
    bar.setAttribute('role','progressbar');bar.setAttribute('aria-label',item.title);
    bar.setAttribute('aria-valuemin','0');bar.setAttribute('aria-valuemax',String(item.target));
    bar.append(fill);progress.append(make('small','achievement-metric__label','Progress'),numbers,bar);
    const footer=make('footer','achievement-card-footer'),reward=make('span','achievement-reward');
    reward.append(make('span','achievement-reward__label','Reward'),make('span','achievement-reward__value',rewardText(item.reward)));
    const action=make('button','achievement-claim','Claim');action.type='button';action.setAttribute('aria-label',`Claim reward for ${item.title}`);
    action.addEventListener('click',()=>{
      sync();
      if(!claim(item.id))return;
      sync();view.onClaim(item);render(grid,view.category,view.onClaim);
    });
    footer.append(reward,action);
    card.append(head,detail,progress,footer);
    return {card,state,numbers,bar,fill,action};
  }
  function updateCard(row,item) {
    const value=goal(item),rank=tier(item),stamp=`${rank}:${value}`;
    if(row.stamp===stamp)return;
    row.stamp=stamp;
    row.card.classList.toggle('is-ready',rank===0);
    row.card.classList.toggle('is-claimed',rank===1);
    row.state.textContent=rank===1?'✓ Completed':rank===0?(item.automatic?'Auto Award Pending':'Ready to Claim'):(value?'In Progress':'Locked');
    row.numbers.textContent=`${format(value)} / ${format(item.target)}`;
    row.bar.setAttribute('aria-valuenow',String(value));
    row.fill.style.width=`${value/item.target*100}%`;
    row.action.hidden=row.action.disabled=rank!==0||item.automatic;
  }
  function render(grid, category = 'all', onClaim = () => {}) {
    if (!grid) return;
    const doc=grid.ownerDocument,items=list(category).sort(sortProgress);
    let view=renderStates.get(grid);
    if(!view){view={rows:new Map(),groups:new Map(),order:'',category:null};renderStates.set(grid,view);}
    const focused=grid.contains(doc.activeElement)?doc.activeElement:null;
    const changedCategory=view.category!==category;
    view.category=category;view.onClaim=onClaim;
    const order=items.map(item=>tier(item)+':'+item.id).join('|');
    const reorder=changedCategory||view.order!==order,nodes=[];
    let current=-1;
    for(const item of items){
      let row=view.rows.get(item.id);
      if(!row){row=createCard(grid,item,view);view.rows.set(item.id,row);}
      updateCard(row,item);
      if(!reorder)continue;
      const rank=tier(item);
      if(rank!==current){
        current=rank;
        if(!view.groups.has(rank)){
          const heading=doc.createElement('h3');heading.className='achievement-group';
          heading.textContent=['Ready to Claim','Completed','In Progress & Locked'][rank];view.groups.set(rank,heading);
        }
        nodes.push(view.groups.get(rank));
      }
      nodes.push(row.card);
    }
    if(!reorder)return;
    view.order=order;
    if(!nodes.length){
      const empty=doc.createElement('p');empty.className='achievement-empty';empty.textContent='No milestones in this category.';
      nodes.push(empty);
    }
    grid.replaceChildren(...nodes);
    if(changedCategory)grid.scrollTop=0;
    if(focused&&focused!==grid){
      if(grid.contains(focused)&&!focused.hidden&&!focused.disabled)focused.focus({preventScroll:true});
      else (grid.querySelector('.achievement-claim:not([hidden])')||grid).focus({preventScroll:true});
    }
  }
  function reset() { data = fresh(); persist(); }
  function bonus(field, receipts = {}) {
    let sum = 0; for (const def of bonusDefinitions[field] || []) if (data.claimed[def.id] || receipts[def.id] === true) sum += def.reward[field];
    return Number(sum.toFixed(2));
  }
  const getLuckBonus = receipts => bonus('luckBonus', receipts);
  const getExpBonus = receipts => bonus('expBonus', receipts);
  const getCoinBonus = receipts => bonus('coinBonus', receipts);
  const getDropMultiplier = receipts => Number((1 + bonus('dropBonus', receipts)).toFixed(2));
  host.AchievementSystem = Object.freeze({ KEY, TIERS, CATEGORIES, areSpookyComplete:()=>definitions.filter(def=>def.category==='spooky').length===3&&definitions.filter(def=>def.category==='spooky').every(def=>progress(def)>=def.target), configure, sync, list, claim, render, compact, getLuckBonus, getExpBonus, getCoinBonus, getDropMultiplier, recordBattleWin, recordCurrencyEarned, reset, flush: persist, isUnlocked: requirement => data.unlockedRequirements[requirement] === true, getStats: () => ({ ...data.stats }), requirementLabel: requirement => definitions.find(def => def.requirement === requirement)?.title || String(requirement).replaceAll('_', ' ') });
})(window);
