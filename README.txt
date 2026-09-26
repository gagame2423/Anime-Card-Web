# Anime Card RNG — Collection Root-Cause / Persistence Fix

This patch hardens the existing Anime Card RNG build against Collection card disappearance and save desynchronization while preserving the current RNG, cooldown, Auto-Roll, Weather scheduler, and 4v4 Battle behavior.

## Root fixes
- Normalizes card IDs to strings during load, filtering, rendering, saving, inventory migration, preview lookup, and battle card lookup.
- Accepts both `unlocked` and legacy `unlockedCards` save layouts, then stores one canonical `unlocked` source of truth.
- Migrates legacy inventory arrays/objects into one deduplicated `cardId + mutation` inventory map.
- Reconciles mutation variants against total ownership without double-counting mutated copies as additional base copies.
- Rolls increment both the parent owned count and the exact mutation inventory entry.
- Battle card losses decrement the same exact mutation inventory entry and parent ownership count.
- Collection ownership is considered unlocked when it is proven by normalized `unlocked`, inventory, or mutation-variant records.
- Each Collection card render is isolated by its own `try/catch`, so one malformed legacy card cannot abort the grid.
- Collection filtering safely searches card name, passive, and mutation text with missing-property fallbacks.
- Collection sorting is numeric Drop Chance (`1 in X`), hardest first; it does not rely on legacy rarity strings.
- Auto-Roll ownership updates mark Collection as needing refresh instead of rebuilding the active Collection DOM mid-search.
- The global Weather ticker no longer rebuilds Collection DOM.
- Unlocked cards visibly show artwork, full title, owned quantity, and drop chance.

## Preserved systems
The patch intentionally does not change the existing roll-rate calculation, Auto-Roll gating/cooldown logic, Weather timing/scheduler logic, mutation chances, or 4v4 battle turn/reward mechanics.

## Files
- `index.html`
- `styles.css`
- `app.js`
- `cards.js`
- `weathers.js`
