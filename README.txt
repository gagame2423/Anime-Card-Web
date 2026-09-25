# Anime Card RNG — Timer / Cooldown / Auto-Roll Refactor

## Runtime architecture
- One authoritative `setInterval(globalTick, 1000)` loop owns the real-time game clock, weather expiry/scheduling, cooldown UI, and Auto Roll checks.
- Game Time is exactly 1:1 with wall-clock elapsed time.
- A strict `isCooldownActive` boolean plus `cooldownUntil` timestamp rejects every roll trigger while cooling down.
- One exact `cooldownExpiryTimer` is used only to remove cooldown precisely; there is no independent Auto Roll interval.
- Auto Roll triggers immediately when cooldown expires and is also safety-checked by the global tick.
- Page visibility / pagehide handlers recover and persist real elapsed time.

## Mutation balance
- Base mutation chance: 6.5% per successful card roll.
- Conditional second mutation chance: 10% after the first mutation succeeds.
- Overall dual-mutation chance: 0.65% when at least two active weathers are available.

## Weather tiers
- Common: Raining/Wet, Snowing/Frost, Sunny/Solar
- Uncommon: Sugar/Sweat, Reaper/Hollow, Eclipse/Eclipsed
- Rare: Malevolent/Cursed, Tsukuyomi/Mangekyo, Heavenly/Angelic, Shadow/Monarch
- Normal is the default state when no special weather is active.

## Persistence / migration
- Existing `animeCardRngSave_v1` data is retained.
- Old Blizzard mutation keys migrate to Frost.
- Old Sacrifice mutation keys migrate to Eclipsed.
- Base collection counts are restored as normal variants when older saves do not contain mutation records.

## UI guarantees
- Root app/body are locked to the viewport (`100vh` / `100dvh`, `overflow:hidden`).
- Weather HUD, stats, roll area, controls, and progress bar are reserved flex regions to prevent page shifting.
- Collection cards use bounded mutation badge rails with internal scrolling.
- Collection clicks open a dedicated preview overlay and never overwrite the main roll result.
- Two active mutations render a two-signature linear-gradient border/glow.
- Mobile controls use 44px+ touch targets.

Open `index.html` locally in a modern Chromium/Edge/Firefox browser.
