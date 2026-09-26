# Anime Card RNG — 4v4 Battle / Persistence / Weather Pool Update

This package contains the targeted source updates for the existing Anime Card RNG project.

Included changes:
- Collection ownership sanitization on load, including mutation/inventory-derived ownership recovery.
- Dynamic Roll Pool weather badge colors using the active Weather accent.
- 4v4 team selection with per-slot Mutation variants.
- Enemy teams of four with a 70% active-weather Mutation roll chance.
- Automated 3-second front-card combat with lunge/impact animation and lineup promotion.
- 25% defeat-loss chance for one defeated player card + exact Mutation variant.
- Power-based victory rewards: 0.35x weak, 1.0x balanced, 1.5x–2.5x hard capped.

Core RNG, real-time ticker, cooldown, Auto-Roll, Weather scheduler, and LocalStorage key remain unchanged.

`cards.js` and assets are intentionally not replaced by this patch. Keep the exact cards.js and assets from the supplied project archive.
