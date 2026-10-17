/* Drop-rate driven progression. Bounded tables keep large EXP grants cheap. */
(function (host) {
  'use strict';
  const MAX_LEVEL = 1000, MAX_INTEGER = Number.MAX_SAFE_INTEGER, GROWTH = .075, BASE_EXP = 150;
  const RARITY = Object.freeze({ Common:1, Rare:1.6, Epic:2.4, Legendary:3.6, Mythic:5.2, Secret:8 });
  const UNROLLABLE_RATES = Object.freeze({Common:10,Rare:100,Epic:1000,Legendary:10000,Mythic:500000,Secret:1000000});
  const parameters = new WeakMap(), totals = new WeakMap();
  const integer = (n, fallback = 0) => Number.isFinite(Number(n)) ? Math.max(0, Math.min(MAX_INTEGER, Math.floor(Number(n)))) : fallback;
  const normalizeLevel = n => Math.min(MAX_LEVEL, Math.max(1, integer(n, 1)));
  function effectiveRate(card) {
    const natural = Number(card?.chance), configured = Number(card?.levelingRate);
    return Math.max(1, Math.min(MAX_INTEGER, natural > 0 ? natural : configured > 0 ? configured : UNROLLABLE_RATES[card?.rarity] || 1000));
  }
  function curve(card) {
    const cached = card && parameters.get(card);
    if (cached) return cached;
    const denominator = effectiveRate(card), depth = Math.log10(denominator);
    const result = Object.freeze({ denominator, coefficient:BASE_EXP * Math.pow(1 + depth, 1.5), exponent:1.30 + .06 * depth });
    if (card && typeof card === 'object') parameters.set(card, result);
    return result;
  }
  const required = (card, level) => {
    const value = curve(card);
    return Math.max(1, Math.min(MAX_INTEGER, Math.floor(value.coefficient * Math.pow(normalizeLevel(level), value.exponent))));
  };
  const statMultiplier = level => 1 + (normalizeLevel(level) - 1) * GROWTH;
  // Duplicate rewards retain their pre-update absolute budget. They must not
  // grow as a percentage of the new requirement and cancel the harder curve.
  const duplicateReward = (card, level) => normalizeLevel(level) >= MAX_LEVEL ? 0 : Math.floor(50 * (RARITY[card?.rarity] || 1) * normalizeLevel(level));
  function prefix(card) {
    if (card && totals.has(card)) return totals.get(card);
    const values = new Float64Array(MAX_LEVEL);
    for (let level = 1; level < MAX_LEVEL; level++) values[level] = values[level - 1] + required(card, level);
    if (card && typeof card === 'object') totals.set(card, values);
    return values;
  }
  function grant(progress, card, amount) {
    const level = normalizeLevel(progress.level);
    progress.level = level;
    if (level === MAX_LEVEL) { progress.exp = 0; return {gained:0,level,levelUps:0}; }
    const gained = integer(amount);
    if (!gained) return {gained:0,level,levelUps:0};
    const total = Math.min(MAX_INTEGER, integer(progress.exp) + gained);
    if(total<required(card,level)){progress.exp=total;return {gained,level,levelUps:0};}
    const costs = prefix(card);
    const cost = n => costs[level + n - 1] - costs[level - 1];
    let low = 0, high = MAX_LEVEL - level;
    while (low < high) {
      const mid = low + Math.ceil((high - low) / 2);
      if (cost(mid) <= total) low = mid; else high = mid - 1;
    }
    progress.level = level + low;
    progress.exp = progress.level === MAX_LEVEL ? 0 : Math.max(0, Math.floor(total - cost(low)));
    return {gained,level:progress.level,levelUps:low};
  }
  host.CardLevelSystem = Object.freeze({MAX_LEVEL,GROWTH,BASE_EXP,RARITY,UNROLLABLE_RATES,effectiveRate,curve,normalizeLevel,required,statMultiplier,duplicateReward,grant});
})(window);
