# Anime Card RNG — Game UI Standard

Design a tactical card battler inside an obsidian vault. Use Game UI Database
as a reference for interface hierarchy and Riot Hextech / Arcane as a reference
for layered game framing. Create original artwork and ornamentation for this
game. Avoid generic SaaS patterns: white dashboards, uniform rounded tiles,
oversized marketing headings, floating navigation with no game purpose, and
gradients that replace a meaningful state.

## Tokens

| Role | Token / value | Use |
| --- | --- | --- |
| Void | `--game-void: #070a10` | World background, deep gaps, empty frames |
| Raised obsidian | `--game-surface: #111827` | Panels, primary card planes |
| Metallic trim | `--game-gold: #c8aa6e` | Edges, selected controls, chapter markers |
| Gold ink | `--game-ivory: #f0e6d2` | Titles, important amounts, text on dark surfaces |
| Arcane energy | `--game-energy: #0ac8b9` | Ready, current action, HP and friendly wards |
| Danger | `--game-danger: #f0758a` | Enemy, damage, urgent status |
| Tactile response | `--game-tap: 120ms` | 90–140ms hover/press; `scale(.96)` on press |
| Numerals | `font-variant-numeric: tabular-nums` | Currency, odds, HP, ATK, cooldowns and timers |

Quiet borders define structure; only the next action, a live state, or a high-tier
reveal should glow. Build an inset 1px specular edge on top of a metallic rim and
a dark recessed fill. Use serif display headings with practical system sans for
dense HUD text. Keep exact values and status text readable without color alone.

Use a **full-perimeter** rarity frame: pale gray Common, teal Uncommon where
present, blue Rare, violet Epic, amber Legendary, rose Mythic, luminous ivory
with a warm gold edge for Secret. Mutations add an interior overlay and explicit
badge; a mutation must not erase the underlying rarity.

## Screen patterns

- **Home:** identify the game, wallet and clock in one glance. Organize shortcuts by
  play and collection actions. Scan labels first; smaller subtitles are optional
  on narrow layouts. Keep direct access to the Summon, Arena and collection flows.
- **Summon:** frame the altar as one focal composition. Weather, Luck, Drop Boost,
  cooldown and input form a stable scaffold; art and rare reveals stay in their
  reserved area. Existing cooldown rules apply to every entry point including
  single rolls. Use decorative CSS/SVG geometry with no dependency on card art.
- **Arena:** keep both fighters, turn state, health, Shield and active effects
  easy to compare. Use explicit side labels and retain collection, weather and
  Relic access. Keep the action dock usable even on a short landscape display.
- **Index, Storage, Craft:** inset frames and purposeful section headers; let the
  existing content area scroll independently. Reserve cyan for an active filter
  or selection. Keep counts and costs adjacent to the relevant action.
- **Auto Chess and Hextech:** inherit color and timing tokens where useful. Their
  boards, overlays, drag geometry, rarity layers, tooltips, and reveal animations
  remain module-owned. Never cascade a legacy panel rule into these modules.

## Layout, input and motion

Use `100dvh`, safe-area insets and `minmax(0, 1fr)` for shrinking tracks. Keep
primary thumb controls near the bottom, with at least 44px targets where space
permits. Group compact shortcuts into a grid before dropping labels. Prefer one
intentional inner scroll area to page overflow. All actions must work without
hover; use `:focus-visible` and labels, and respect disabled and hidden states.
Treat 360px portrait, 844×390 landscape, and wide desktop as distinct cases.

Animate transform and opacity for reveal and strike feedback. Use one short
specular sweep for high-rarity reveals; reserve continuous effects for actual
timed states. Respect `prefers-reduced-motion` and avoid requiring an animation
to complete before any action can fire. Avoid changing layout each frame.

## Implementation contract

`game-ui.css` scopes legacy art direction to the Home shell and named modal roots.
Keep IDs, DOM data hooks, open/close commands, focus handling, weather and
cooldown timers authoritative in the existing modules. Add a presentation
attribute when CSS needs an existing fact, such as card rarity. Do not make CSS
derive game state. Do not style all modals with one unscoped rule.

Verify desktop and mobile together: single-roll cooldown and reveal,
Arena setup and combat, weather counters, all mode shortcuts, Index/Storage/Craft
scrolling, keyboard focus, missing image fallbacks, reduced motion, Auto Chess
planning fold, Relic tooltips, Hextech Chest and Skin Wardrobe.
