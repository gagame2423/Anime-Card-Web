/* Shared capped card progression with safe-integer EXP arithmetic. */
(function (host) {
  'use strict';
  const MAX_LEVEL = 1000, MAX_INTEGER = Number.MAX_SAFE_INTEGER, GROWTH = .075, BASE_EXP = 100;
  const RARITY = Object.freeze({ Common:1, Rare:1.6, Epic:2.4, Legendary:3.6, Mythic:5.2, Secret:8 });
  const integer = (n, fallback = 0) => Number.isFinite(Number(n)) ? Math.max(0, Math.min(MAX_INTEGER, Math.floor(Number(n)))) : fallback;
  const normalizeLevel = n => Math.min(MAX_LEVEL, Math.max(1, integer(n, 1)));
  const rate = card => BASE_EXP * (RARITY[card?.rarity] || 1);
  const required = (card, level) => Math.max(1, Math.min(MAX_INTEGER, Math.floor(rate(card) * normalizeLevel(level))));
  const statMultiplier = level => 1 + (normalizeLevel(level) - 1) * GROWTH;
  function grant(progress, card, amount) {
    const level = normalizeLevel(progress.level);
    progress.level = level;
    if (level === MAX_LEVEL) { progress.exp = 0; return { gained:0, level, levelUps:0 }; }
    const gained = integer(amount);
    if (!gained || level === MAX_LEVEL) return { gained:0, level, levelUps:0 };
    const total = Math.min(MAX_INTEGER, integer(progress.exp) + gained), base = rate(card);
    const cost = n => n === 1 ? required(card, level) : base * n * (level + (n - 1) / 2);
    // Binary search avoids millions of loop iterations for large EXP awards.
    let low = 0, high = Math.min(MAX_LEVEL - level, Math.floor(total / required(card, level)));
    while (low < high) {
      const mid = low + Math.ceil((high - low) / 2);
      if (cost(mid) <= total) low = mid; else high = mid - 1;
    }
    progress.level = level + low;
    progress.exp = progress.level === MAX_LEVEL ? 0 : Math.max(0, Math.floor(total - (low ? cost(low) : 0)));
    return { gained, level:progress.level, levelUps:low };
  }
  host.CardLevelSystem = Object.freeze({ MAX_LEVEL, GROWTH, BASE_EXP, RARITY, normalizeLevel, required, statMultiplier, grant });
})(window);
