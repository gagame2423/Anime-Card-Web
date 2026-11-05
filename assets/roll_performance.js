/* Bounded caches and one visual queue. No RNG calls or save writes. */
(function (host) {
  'use strict';
  const cardMap = new Map((host.ALL_CARDS || []).map(card => [String(card.id), card]));
  const unlockCards = [...cardMap.values()].filter(card => (card.unlockRequirement||card.spookyExclusive) && Number(card.chance) > 0 && !card.raidOnly && !card.bossEventOnly);
  let owner = null, unlocked = null, mutations = null, inventory = null;
  const ownedCards = new Set(), ownedVariants = new Set();
  let poolKey = null, poolValue = null, frame = null, revision = 0;
  let invalidatedAt=0;
  const changes=[];
  const jobs = new Set();
  function invalidateOwnership() { owner = null; revision++; invalidatedAt=revision;changes.length=0; }
  function ensureOwnership(state) {
    if (owner === state && unlocked === state.unlocked && mutations === state.mutations && inventory === state.inventory) return;
    ownedCards.clear(); ownedVariants.clear();
    for (const [id, count] of Object.entries(state.unlocked || {})) if (Number(count) > 0 && cardMap.has(id)) ownedCards.add(id);
    for (const [key, count] of Object.entries(state.mutations || {})) {
      if (!(Number(count) > 0)) continue;
      ownedVariants.add(key); const id = key.slice(0, key.indexOf('|')); if (cardMap.has(id)) ownedCards.add(id);
    }
    // Normalized saves have one inventory entry per canonical variant key.
    for (const [key, entry] of Object.entries(state.inventory || {})) if (Number(entry?.count) > 0) {
      ownedVariants.add(key); const id = String(entry.cardId ?? entry.id); if (cardMap.has(id)) ownedCards.add(id);
    }
    owner = state; unlocked = state.unlocked; mutations = state.mutations; inventory = state.inventory;
  }
  function hasCard(state, id) { ensureOwnership(state); return ownedCards.has(id); }
  function hasVariant(state, key) { ensureOwnership(state); return ownedVariants.has(key); }
  function noteChange(id,key){revision++;changes.push({revision,id,key});if(changes.length>64)changes.shift();}
  function acquired(state, id, key) { ensureOwnership(state); ownedCards.add(id); ownedVariants.add(key);noteChange(id,key); }
  function updatedVariant(state,id,key){
    ensureOwnership(state);
    if(Math.max(Number(state.mutations?.[key])||0,Number(state.inventory?.[key]?.count)||0)>0)ownedVariants.add(key);else ownedVariants.delete(key);
    if(Number(state.unlocked?.[id])>0||[...ownedVariants].some(value=>value.startsWith(id+'|')))ownedCards.add(id);else ownedCards.delete(id);
    noteChange(id,key);
  }
  function changesSince(value){return value<invalidatedAt||value<revision-changes.length?null:changes.filter(change=>change.revision>value);}
  function unique(state) { ensureOwnership(state); return ownedCards.size; }
  function unlockKey(predicate) { let key = ''; for (const card of unlockCards) key += predicate(card) ? '1' : '0'; return key; }
  function pool(key, build) { if (poolKey !== key || !poolValue) { poolValue = Object.freeze(build()); poolKey = key; } return poolValue; }
  function text(node, value) { if (node && node.textContent !== value) node.textContent = value; }
  function attribute(node, name, value) { if (node && node.getAttribute(name) !== value) node.setAttribute(name, value); }
  function run() { frame = null; const batch = [...jobs]; jobs.clear(); for (const job of batch) job(); }
  function request() {
    if (frame !== null || !jobs.size || host.document?.visibilityState === 'hidden') return;
    frame = host.requestAnimationFrame ? host.requestAnimationFrame(run) : host.setTimeout(run, 16);
  }
  function schedule(job) { jobs.add(job); request(); }
  function cancel(job) { jobs.delete(job); if (!jobs.size && frame !== null) { if (host.cancelAnimationFrame) host.cancelAnimationFrame(frame); else host.clearTimeout(frame); frame = null; } }
  host.document?.addEventListener('visibilitychange', () => {
    if (host.document.visibilityState === 'hidden' && frame !== null) { if (host.cancelAnimationFrame) host.cancelAnimationFrame(frame); else host.clearTimeout(frame); frame = null; }
    else request();
  });
  host.RollPerformanceSystem = Object.freeze({hasCard,hasVariant,acquired,updatedVariant,changesSince,unique,invalidateOwnership,unlockKey,pool,schedule,cancel,text,attribute,card:id => cardMap.get(id) || null,get revision(){return revision;}});
})(window);
