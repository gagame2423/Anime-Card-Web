// ============================================================
// ANIME CARD RNG - CORE RUNTIME
// Architectural rules:
// 1) A single global 1-second loop owns clock/weather/cooldown UI.
// 2) Roll requests are rejected while isCooldownActive is true.
// 3) Auto Roll has no independent interval; it piggy-backs on the
//    global loop and the exact cooldown-expiry callback.
// 4) Collection previews are isolated from the main roll slot.
// 5) LocalStorage persists game state and recovers elapsed real time.
// ============================================================

const STORAGE_KEY = "anime_card_rng_save_v1";
const LEGACY_STORAGE_KEYS = Object.freeze([
  "animeCardRngSave_v1"
]);
const SAVE_SCHEMA_VERSION = 2;
const GLOBAL_TICK_MS = 1000;
const BASE_COOLDOWN_MS = 1500;
const SPEED_BASE_COST = 100;
const SPEED_MAX_LEVEL = 20;
const SPEED_FACTOR = 0.15;
const LUCK_BASE_COST = 250;
const LUCK_MAX_LEVEL = 500;
const LUCK_FACTOR = 0.25;

const MUTATION_ID_ALIASES = Object.freeze({
  blizzard: "frost",
  sacrifice: "eclipsed"
});

const defaultState = {
  schemaVersion: SAVE_SCHEMA_VERSION,
  totalRolls: 0,
  currency: 0,
  unlocked: {},
  mutations: {},
  equipment: [],
  upgrades: { rollSpeed: 0, luck: 0 },
  lastResultId: null,
  weather: {
    gameSeconds: 0,
    active: [],
    lastSchedulerSecond: 0,
    lastRealTimestamp: Date.now()
  }
};

let state = loadState();

// ============================================================
// RUNTIME TIMERS - NEVER DEPEND ON ROLL CLICKS
// ============================================================
let globalTickTimer = null;
let cooldownExpiryTimer = null;
let toastTimer = null;

let isCooldownActive = false;
let cooldownUntil = 0;
let cooldownDurationMs = 0;
let isAutoRolling = false;
let previewSelection = null;
let weatherHudSignature = "";
let lastClockSecondRendered = -1;

const els = {
  totalRolls: document.getElementById("totalRolls"),
  luckValue: document.getElementById("luckValue"),
  cooldownValue: document.getElementById("cooldownValue"),
  currencyValue: document.getElementById("currencyValue"),
  collectionSummary: document.getElementById("collectionSummary"),
  collectionButton: document.getElementById("collectionButton"),
  upgradesButton: document.getElementById("upgradesButton"),
  resetButton: document.getElementById("resetButton"),

  gameClock: document.getElementById("gameClock"),
  gameClockStatus: document.getElementById("gameClockStatus"),
  activeWeatherList: document.getElementById("activeWeatherList"),
  weatherHudEmpty: document.getElementById("weatherHudEmpty"),

  availableCardsPanel: document.getElementById("available-cards-panel"),
  availableCardsList: document.getElementById("availableCardsList"),
  availableCardsCount: document.getElementById("availableCardsCount"),
  availableCardsMode: document.getElementById("availableCardsMode"),

  rollButton: document.getElementById("rollButton"),
  cooldownLabel: document.getElementById("cooldownLabel"),
  cooldownProgress: document.getElementById("cooldownProgress"),
  cooldownHint: document.getElementById("cooldownHint"),
  autoRollToggle: document.getElementById("autoRollToggle"),

  resultCard: document.getElementById("resultCard"),
  resultMutationBadges: document.getElementById("resultMutationBadges"),
  resultName: document.getElementById("resultName"),
  resultRarity: document.getElementById("resultRarity"),
  resultChance: document.getElementById("resultChance"),
  resultImage: document.getElementById("resultImage"),
  imageFallback: document.querySelector("#resultCard .image-fallback"),
  resultBackdrop: document.querySelector("#resultCard .art-backdrop"),
  resultHp: document.getElementById("resultHp"),
  resultAtk: document.getElementById("resultAtk"),
  resultPassiveName: document.getElementById("resultPassiveName"),
  resultPassiveDescription: document.getElementById("resultPassiveDescription"),
  emptyState: document.getElementById("emptyState"),
  missState: document.getElementById("missState"),
  missScore: document.getElementById("missScore"),
  rewardToast: document.getElementById("rewardToast"),

  collectionModal: document.getElementById("collectionModal"),
  collectionModalCount: document.getElementById("collectionModalCount"),
  searchInput: document.getElementById("searchInput"),
  mutationFilter: document.getElementById("mutationFilter"),
  sortSelect: document.getElementById("sortSelect"),
  collectionGrid: document.getElementById("collectionGrid"),

  previewModal: document.getElementById("cardPreviewModal"),
  previewCard: document.getElementById("previewCard"),
  previewName: document.getElementById("previewName"),
  previewRarity: document.getElementById("previewRarity"),
  previewVariantCount: document.getElementById("previewVariantCount"),
  previewImage: document.getElementById("previewImage"),
  previewFallback: document.querySelector("#previewCard .image-fallback"),
  previewBackdrop: document.querySelector("#previewCard .art-backdrop"),
  previewHp: document.getElementById("previewHp"),
  previewAtk: document.getElementById("previewAtk"),
  previewPassiveName: document.getElementById("previewPassiveName"),
  previewPassiveDescription: document.getElementById("previewPassiveDescription"),
  previewMutationBadges: document.getElementById("previewMutationBadges"),
  previewVariantLabel: document.getElementById("previewVariantLabel"),
  previewVariantMenuButton: document.getElementById("variantMenuButton"),
  previewVariantMenu: document.getElementById("variantMenu"),
  previewCollectedCount: document.getElementById("previewCollectedCount"),
  previewRequirement: document.getElementById("previewRequirement"),

  upgradesModal: document.getElementById("upgradesModal"),
  shopCurrency: document.getElementById("shopCurrency"),
  speedLevel: document.getElementById("speedLevel"),
  speedCurrent: document.getElementById("speedCurrent"),
  buySpeedButton: document.getElementById("buySpeedButton"),
  luckLevel: document.getElementById("luckLevel"),
  luckCurrent: document.getElementById("luckCurrent"),
  buyLuckButton: document.getElementById("buyLuckButton"),

  battleButton: document.getElementById("battleButton"),
  battleModal: document.getElementById("battleModal"),
  battleSetup: document.getElementById("battleSetup"),
  battleFighterGrid: document.getElementById("battleFighterGrid"),
  battleVariantGrid: document.getElementById("battleVariantGrid"),
  battleTeamSlots: document.getElementById("battleTeamSlots"),
  battleTeamCount: document.getElementById("battleTeamCount"),
  battleFighterPreview: document.getElementById("battleFighterPreview"),
  battleStartButton: document.getElementById("battleStartButton"),
  battleArena: document.getElementById("battleArena"),
  battlePlayerCard: document.getElementById("battlePlayerCard"),
  battlePlayerImage: document.getElementById("battlePlayerImage"),
  battlePlayerFallback: document.getElementById("battlePlayerFallback"),
  battlePlayerBackdrop: document.getElementById("battlePlayerBackdrop"),
  battlePlayerMutationBadges: document.getElementById("battlePlayerMutationBadges"),
  battlePlayerName: document.getElementById("battlePlayerName"),
  battlePlayerHp: document.getElementById("battlePlayerHp"),
  battlePlayerHpBar: document.getElementById("battlePlayerHpBar"),
  battlePlayerAtk: document.getElementById("battlePlayerAtk"),
  battleEnemyCard: document.getElementById("battleEnemyCard"),
  battleEnemyImage: document.getElementById("battleEnemyImage"),
  battleEnemyFallback: document.getElementById("battleEnemyFallback"),
  battleEnemyBackdrop: document.getElementById("battleEnemyBackdrop"),
  battleEnemyMutationBadges: document.getElementById("battleEnemyMutationBadges"),
  battleEnemyName: document.getElementById("battleEnemyName"),
  battleEnemyHp: document.getElementById("battleEnemyHp"),
  battleEnemyHpBar: document.getElementById("battleEnemyHpBar"),
  battleEnemyAtk: document.getElementById("battleEnemyAtk"),
  battlePlayerLineup: document.getElementById("battlePlayerLineup"),
  battleEnemyLineup: document.getElementById("battleEnemyLineup"),
  battlePlayerTeamPower: document.getElementById("battlePlayerTeamPower"),
  battleEnemyTeamPower: document.getElementById("battleEnemyTeamPower"),
  battleStatus: document.getElementById("battleStatus"),
  battleLog: document.getElementById("battleLog"),
  battleVictory: document.getElementById("battleVictory"),
  battleResultTitle: document.getElementById("battleResultTitle"),
  battleResultText: document.getElementById("battleResultText"),
  battleResultPower: document.getElementById("battleResultPower"),
  battleAutoAgainButton: document.getElementById("battleAutoAgainButton"),
  battleChangeFighterButton: document.getElementById("battleChangeFighterButton")
};

// ============================================================
// STATE + PERSISTENCE
// ============================================================

function cloneDefaultState() {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    totalRolls: 0,
    currency: 0,
    unlocked: {},
    mutations: {},
    inventory: {},
    equipment: [],
    upgrades: { rollSpeed: 0, luck: 0 },
    lastResultId: null,
    weather: {
      gameSeconds: 0,
      active: [],
      lastSchedulerSecond: 0,
      lastRealTimestamp: Date.now()
    }
  };
}

function normalizeMutationId(id) {
  const safe = String(id || "").trim().toLowerCase();
  return MUTATION_ID_ALIASES[safe] || safe;
}

function canonicalVariantKey(cardId, mutationIds) {
  const ids = mutationIds
    .map(normalizeMutationId)
    .filter(Boolean)
    .filter((id, index, list) => list.indexOf(id) === index)
    .sort((a, b) => {
      const rankA = MUTATION_BY_ID[a]?.tier?.rank ?? 0;
      const rankB = MUTATION_BY_ID[b]?.tier?.rank ?? 0;
      return rankA - rankB || a.localeCompare(b);
    });
  return `${cardId}|${ids.join("+") || "base"}`;
}

function migrateMutationRecords(rawMutations, unlocked) {
  const output = {};
  if (rawMutations && typeof rawMutations === "object" && !Array.isArray(rawMutations)) {
    for (const [rawKey, rawCount] of Object.entries(rawMutations)) {
      const count = Math.max(0, Math.floor(Number(rawCount) || 0));
      if (!count) continue;
      const separator = rawKey.indexOf("|");
      if (separator < 0) continue;
      const cardId = rawKey.slice(0, separator);
      const rawIds = rawKey.slice(separator + 1);
      const ids = rawIds === "base" ? [] : rawIds.split("+").map(normalizeMutationId);
      const key = canonicalVariantKey(cardId, ids);
      output[key] = (output[key] || 0) + count;
    }
  }

  // Older saves only had unlocked card counts. Preserve those as the base variant.
  for (const [cardId, rawCount] of Object.entries(unlocked || {})) {
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!count) continue;
    const key = canonicalVariantKey(cardId, []);
    if (!output[key]) output[key] = count;
  }

  return output;
}

function normalizeWeatherEntries(parsedWeather, gameSeconds) {
  if (!Array.isArray(parsedWeather?.active)) return [];
  return parsedWeather.active
    .filter(entry => entry && WEATHER_BY_ID[entry.weatherId] && Number.isFinite(Number(entry.expiresAt)))
    .map(entry => ({
      weatherId: entry.weatherId,
      startedAt: Number(entry.startedAt) || Math.max(0, Number(entry.expiresAt) - WEATHER_CONFIG.WEATHER_DURATION_SECONDS),
      expiresAt: Number(entry.expiresAt)
    }))
    .filter(entry => entry.expiresAt > gameSeconds);
}

function normalizeState(parsed = {}) {
  const defaults = cloneDefaultState();

  // Schema-safe merge: preserve known progress and any forward-compatible
  // fields introduced by future builds instead of reconstructing a fresh save.
  const normalized = {
    ...defaults,
    ...parsed,
    upgrades: {
      ...defaults.upgrades,
      ...(parsed.upgrades && typeof parsed.upgrades === "object" ? parsed.upgrades : {})
    },
    weather: {
      ...defaults.weather,
      ...(parsed.weather && typeof parsed.weather === "object" ? parsed.weather : {})
    }
  };

  normalized.schemaVersion = SAVE_SCHEMA_VERSION;

  normalized.totalRolls = Number.isFinite(Number(parsed.totalRolls))
    ? Math.max(0, Math.floor(Number(parsed.totalRolls)))
    : defaults.totalRolls;
  normalized.currency = Number.isFinite(Number(parsed.currency))
    ? Math.max(0, Math.floor(Number(parsed.currency)))
    : defaults.currency;

  const rawUnlocked = (
    parsed.unlocked &&
    typeof parsed.unlocked === "object" &&
    !Array.isArray(parsed.unlocked)
  ) ? parsed.unlocked : {};

  // Sanitize ownership without destructively rebuilding the collection.
  // Older saves may contain booleans, strings, or malformed counts; all are
  // normalized to positive integer copy counts where possible.
  normalized.unlocked = {};
  for (const [cardId, rawCount] of Object.entries(rawUnlocked)) {
    const count = rawCount === true ? 1 : Math.max(0, Math.floor(Number(rawCount) || 0));
    if (count > 0) normalized.unlocked[cardId] = count;
  }

  // Some forward/legacy builds stored ownership under inventory. Preserve
  // those counts and merge by maximum so existing progress is never doubled.
  const rawInventory = (
    parsed.inventory &&
    typeof parsed.inventory === "object" &&
    !Array.isArray(parsed.inventory)
  ) ? parsed.inventory : {};
  for (const [cardId, rawEntry] of Object.entries(rawInventory)) {
    const inventoryCount = typeof rawEntry === "object" && rawEntry !== null
      ? Math.max(0, Math.floor(Number(rawEntry.count) || 0))
      : Math.max(0, Math.floor(Number(rawEntry) || 0));
    if (inventoryCount > 0) {
      normalized.unlocked[cardId] = Math.max(normalized.unlocked[cardId] || 0, inventoryCount);
    }
  }

  normalized.mutations = migrateMutationRecords(parsed.mutations, normalized.unlocked);

  // Mutation records are ownership records too. If a long-running save ever
  // lost its parent unlocked count, reconstruct that count from the variants
  // instead of letting the Collection mark the card as locked/disappeared.
  const mutationTotalsByCard = {};
  for (const [variantKey, rawCount] of Object.entries(normalized.mutations)) {
    const parsedVariant = parseVariantKey(variantKey);
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!parsedVariant || count <= 0) continue;
    mutationTotalsByCard[parsedVariant.cardId] = (mutationTotalsByCard[parsedVariant.cardId] || 0) + count;
  }
  for (const [cardId, variantCount] of Object.entries(mutationTotalsByCard)) {
    normalized.unlocked[cardId] = Math.max(normalized.unlocked[cardId] || 0, variantCount);
  }

  normalized.inventory = rawInventory;
  normalized.equipment = Array.isArray(parsed.equipment) ? [...parsed.equipment] : [];

  normalized.upgrades.rollSpeed = Math.min(
    SPEED_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.rollSpeed) || 0))
  );
  normalized.upgrades.luck = Math.min(
    LUCK_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.luck) || 0))
  );

  normalized.lastResultId = typeof parsed.lastResultId === "string"
    ? parsed.lastResultId
    : null;

  const weather = parsed.weather && typeof parsed.weather === "object" ? parsed.weather : {};
  const hasSeconds = Number.isFinite(Number(weather.gameSeconds));
  const legacyMinutes = Number(weather.gameMinutes);
  normalized.weather.gameSeconds = hasSeconds
    ? Math.max(0, Number(weather.gameSeconds))
    : Number.isFinite(legacyMinutes)
      ? Math.max(0, legacyMinutes * 60)
      : 0;

  const hasLegacyMinutes = !hasSeconds && Number.isFinite(legacyMinutes);
  if (hasLegacyMinutes && Array.isArray(weather.active)) {
    normalized.weather.active = weather.active
      .filter(entry => entry && WEATHER_BY_ID[entry.weatherId] && Number.isFinite(Number(entry.expiresAt)))
      .map(entry => ({
        weatherId: entry.weatherId,
        startedAt: Number(entry.startedAt) * 60,
        expiresAt: Number(entry.expiresAt) * 60
      }))
      .filter(entry => entry.expiresAt > normalized.weather.gameSeconds);
  } else {
    normalized.weather.active = normalizeWeatherEntries(weather, normalized.weather.gameSeconds);
  }

  const savedSchedulerSecond = Number(weather.lastSchedulerSecond);
  const legacySchedulerMinute = Number(weather.lastSchedulerMinute);
  normalized.weather.lastSchedulerSecond = Number.isFinite(savedSchedulerSecond)
    ? Math.floor(savedSchedulerSecond / WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS) * WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS
    : Number.isFinite(legacySchedulerMinute)
      ? Math.floor((legacySchedulerMinute * 60) / WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS) * WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS
      : Math.floor(normalized.weather.gameSeconds / WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS) * WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS;

  const savedRealTimestamp = Number(weather.lastRealTimestamp);
  normalized.weather.lastRealTimestamp = Number.isFinite(savedRealTimestamp)
    ? savedRealTimestamp
    : Date.now();

  return normalized;
}

function parseStoredSave(raw) {
  if (typeof raw !== "string" || !raw.trim()) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    // A save is considered structurally valid when it contains at least one
    // persistent player-state field. This prevents a malformed/empty payload
    // from wiping a valid legacy save during migration.
    const hasKnownField = [
      "totalRolls",
      "currency",
      "unlocked",
      "mutations",
      "inventory",
      "upgrades",
      "weather"
    ].some(key => Object.prototype.hasOwnProperty.call(parsed, key));

    return hasKnownField ? parsed : null;
  } catch (error) {
    console.warn("Save data could not be parsed.", error);
    return null;
  }
}

function loadState() {
  try {
    // Primary key is authoritative once it exists and parses successfully.
    const primary = parseStoredSave(localStorage.getItem(STORAGE_KEY));
    if (primary) return normalizeState(primary);

    // One-way migration from the previous deployed key prevents progress wipes
    // when this new static storage namespace is introduced.
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacy = parseStoredSave(localStorage.getItem(legacyKey));
      if (!legacy) continue;

      const migrated = normalizeState(legacy);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      } catch (migrationError) {
        console.warn("Save migration could not be written:", migrationError);
      }
      return migrated;
    }

    return cloneDefaultState();
  } catch (error) {
    console.warn("Save data could not be read. Starting fresh.", error);
    return cloneDefaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Save failed:", error);
  }
}

// ============================================================
// ECONOMY
// ============================================================

function getLuckMultiplier() {
  return 1 + state.upgrades.luck * LUCK_FACTOR;
}

function getCooldownMs() {
  return BASE_COOLDOWN_MS / (1 + state.upgrades.rollSpeed * SPEED_FACTOR);
}

function getUpgradeCost(baseCost, level) {
  return Math.floor(baseCost * Math.pow(1.65, level));
}

function calculateCardReward(chance) {
  return Math.floor(10 * Math.pow(chance, 0.45));
}

function formatCurrency(value) {
  const amount = Math.max(0, Math.floor(value));
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B VNĐ`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M VNĐ`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K VNĐ`;
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

function formatCooldown(ms) {
  return `${(Math.max(0, ms) / 1000).toFixed(2)}s`;
}

// ============================================================
// REAL-TIME CLOCK + WEATHER - OWNED BY GLOBAL TICK ONLY
// ============================================================

function getWeatherByReference(reference) {
  if (!reference) return null;
  const normalized = String(reference).trim().toLowerCase();
  return WEATHERS.find(weather => (
    weather.id.toLowerCase() === normalized ||
    weather.name.toLowerCase() === normalized
  )) || null;
}

function getActiveWeatherEntries() {
  return state.weather.active
    .filter(entry => WEATHER_BY_ID[entry.weatherId])
    .sort((a, b) => a.expiresAt - b.expiresAt);
}

function getActiveWeatherDefinitions() {
  pruneExpiredWeathers();
  return getActiveWeatherEntries().map(entry => WEATHER_BY_ID[entry.weatherId]).filter(Boolean);
}

function isWeatherActive(reference) {
  const weather = getWeatherByReference(reference);
  return Boolean(weather && state.weather.active.some(entry => entry.weatherId === weather.id));
}

function getWeatherRemainingSeconds(entry) {
  return Math.max(0, entry.expiresAt - state.weather.gameSeconds);
}

function formatGameClock(gameSeconds) {
  const totalSeconds = Math.max(0, Math.floor(gameSeconds));
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatWeatherCountdown(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  if (safe >= 60) {
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return secs ? `${mins}m ${secs}s` : `${mins}m`;
  }
  return `${safe}s`;
}

function pruneExpiredWeathers() {
  const before = state.weather.active.length;
  state.weather.active = state.weather.active.filter(entry => entry.expiresAt > state.weather.gameSeconds);
  return before !== state.weather.active.length;
}

function chooseWeatherByTier() {
  const roll = Math.random();
  let cursor = 0;
  for (const tier of Object.values(WEATHER_TIERS)) {
    cursor += tier.chance;
    if (roll < cursor) {
      const ids = tier.weatherIds.filter(id => WEATHER_BY_ID[id]);
      return WEATHER_BY_ID[ids[Math.floor(Math.random() * ids.length)]] || null;
    }
  }
  return null;
}

function triggerWeatherRoll(eventSecond) {
  state.weather.lastSchedulerSecond = eventSecond;
  if (Math.random() >= WEATHER_CONFIG.WEATHER_TRIGGER_CHANCE) return false;

  const weather = chooseWeatherByTier();
  if (!weather) return false;

  const expiresAt = eventSecond + WEATHER_CONFIG.WEATHER_DURATION_SECONDS;
  const existing = state.weather.active.find(entry => entry.weatherId === weather.id);

  if (existing) {
    existing.startedAt = eventSecond;
    existing.expiresAt = Math.max(existing.expiresAt, expiresAt);
  } else {
    state.weather.active.push({
      weatherId: weather.id,
      startedAt: eventSecond,
      expiresAt
    });
  }

  showWeatherToast(weather);
  return true;
}

function processWeatherScheduler() {
  const interval = WEATHER_CONFIG.WEATHER_CHECK_INTERVAL_SECONDS;
  const crossedBoundary = Math.floor(state.weather.gameSeconds / interval) * interval;
  const lastProcessed = state.weather.lastSchedulerSecond;
  if (crossedBoundary <= lastProcessed) return false;

  let changed = false;
  for (let second = lastProcessed + interval; second <= crossedBoundary; second += interval) {
    changed = triggerWeatherRoll(second) || changed;
  }
  return changed;
}

function advanceGameClock(deltaSeconds) {
  if (!(deltaSeconds > 0)) return { weatherChanged: false, expired: false };

  // Exactly 1 real-world second -> 1 game second.
  state.weather.gameSeconds += deltaSeconds;
  const weatherChanged = processWeatherScheduler();
  const expired = pruneExpiredWeathers();
  return { weatherChanged, expired };
}

function syncGameClockToNow() {
  const now = Date.now();
  const previous = Number(state.weather.lastRealTimestamp);
  const deltaSeconds = Number.isFinite(previous)
    ? Math.max(0, (now - previous) / 1000)
    : 0;

  if (deltaSeconds > 0) advanceGameClock(deltaSeconds);
  state.weather.lastRealTimestamp = now;
}

function renderClockAndWeather(force = false) {
  const renderedSecond = Math.floor(state.weather.gameSeconds);
  // These render calls are intentionally invoked from every global tick.
  // The second-level guard only avoids unnecessary text churn.
  if (force || renderedSecond !== lastClockSecondRendered) {
    lastClockSecondRendered = renderedSecond;
    if (els.gameClock) els.gameClock.textContent = formatGameClock(state.weather.gameSeconds);
    if (els.gameClockStatus) els.gameClockStatus.textContent = "1:1 REAL TIME";
  }
  renderWeatherHud(force);
}

function renderWeatherHud(force = false) {
  if (!els.activeWeatherList) return;

  const entries = getActiveWeatherEntries();
  const signature = [
    Math.floor(state.weather.gameSeconds),
    ...entries.map(entry => `${entry.weatherId}:${Math.ceil(entry.expiresAt - state.weather.gameSeconds)}`)
  ].join("|");

  if (!force && signature === weatherHudSignature) return;
  weatherHudSignature = signature;

  els.activeWeatherList.innerHTML = "";
  if (els.weatherHudEmpty) els.weatherHudEmpty.textContent = entries.length ? `${entries.length} ACTIVE` : "Normal";
  if (!entries.length) return;

  for (const entry of entries) {
    const weather = WEATHER_BY_ID[entry.weatherId];
    if (!weather) continue;

    const chip = document.createElement("div");
    chip.className = "weather-chip";
    chip.style.setProperty("--weather-color", weather.color);
    const tier = WEATHER_TIERS[weather.tier];

    chip.innerHTML = `
      <span class="weather-chip__icon">${weather.icon}</span>
      <span class="weather-chip__body">
        <strong>${escapeHtml(weather.name)}</strong>
        <small>${escapeHtml(tier?.name || "Special")} • ${escapeHtml(weather.mutation.name)}</small>
      </span>
      <strong class="weather-chip__timer">${formatWeatherCountdown(getWeatherRemainingSeconds(entry))}</strong>
    `;

    els.activeWeatherList.appendChild(chip);
  }
}

function showWeatherToast(weather) {
  if (!els.rewardToast) return;
  clearTimeout(toastTimer);
  els.rewardToast.textContent = `${weather.icon} ${weather.name} • ${weather.mutation.name}`;
  els.rewardToast.classList.remove("show");
  void els.rewardToast.offsetWidth;
  els.rewardToast.classList.add("show");
  toastTimer = window.setTimeout(() => els.rewardToast.classList.remove("show"), 1500);
}

// ============================================================
// COOLDOWN - AUTHORITATIVE BOOLEAN + TIMESTAMP
// ============================================================

function renderCooldownUI(now = Date.now()) {
  const baseMs = getCooldownMs();
  const remainingMs = isCooldownActive ? Math.max(0, cooldownUntil - now) : 0;
  const progress = isCooldownActive && cooldownDurationMs > 0
    ? Math.min(100, Math.max(0, ((cooldownDurationMs - remainingMs) / cooldownDurationMs) * 100))
    : 100;

  if (els.rollButton) {
    els.rollButton.disabled = isCooldownActive;
    els.rollButton.setAttribute("aria-disabled", String(isCooldownActive));
  }
  if (els.cooldownProgress) els.cooldownProgress.style.width = `${progress}%`;
  if (els.cooldownLabel) els.cooldownLabel.textContent = isCooldownActive ? formatCooldown(remainingMs) : "READY";
  if (els.cooldownHint) {
    els.cooldownHint.textContent = isCooldownActive
      ? `Next roll in ${formatCooldown(remainingMs)}`
      : "Cooldown complete";
  }
  if (els.cooldownValue) els.cooldownValue.textContent = formatCooldown(isCooldownActive ? remainingMs : baseMs);
}

let cooldownVisualFrame = null;

function requestVisualFrame(callback) {
  return typeof window.requestAnimationFrame === "function"
    ? window.requestAnimationFrame(callback)
    : window.setTimeout(callback, 16);
}

function cancelVisualFrame(handle) {
  if (handle === null || handle === undefined) return;
  if (typeof window.cancelAnimationFrame === "function") window.cancelAnimationFrame(handle);
  else window.clearTimeout(handle);
}

function stopCooldownVisualLoop() {
  if (cooldownVisualFrame !== null) {
    cancelVisualFrame(cooldownVisualFrame);
    cooldownVisualFrame = null;
  }
}

function runCooldownVisualLoop() {
  stopCooldownVisualLoop();
  const frame = () => {
    if (!isCooldownActive) {
      if (els.cooldownProgress) els.cooldownProgress.style.width = "100%";
      cooldownVisualFrame = null;
      return;
    }
    const now = Date.now();
    const remainingMs = Math.max(0, cooldownUntil - now);
    const progress = cooldownDurationMs > 0
      ? Math.min(100, Math.max(0, ((cooldownDurationMs - remainingMs) / cooldownDurationMs) * 100))
      : 100;
    if (els.cooldownProgress) els.cooldownProgress.style.width = `${progress}%`;
    if (remainingMs > 0) cooldownVisualFrame = requestVisualFrame(frame);
    else cooldownVisualFrame = null;
  };
  cooldownVisualFrame = requestVisualFrame(frame);
}

function clearCooldownExpiryTimer() {
  if (cooldownExpiryTimer !== null) {
    window.clearTimeout(cooldownExpiryTimer);
    cooldownExpiryTimer = null;
  }
}

function completeCooldown(force = false) {
  if (!isCooldownActive) return false;
  const now = Date.now();
  if (!force && now < cooldownUntil) {
    renderCooldownUI(now);
    return false;
  }

  isCooldownActive = false;
  cooldownUntil = 0;
  cooldownDurationMs = 0;
  clearCooldownExpiryTimer();
  stopCooldownVisualLoop();
  renderCooldownUI(now);

  // Immediate Auto-Roll on cooldown expiration. The global tick also checks
  // this condition, so a throttled browser cannot strand Auto Roll.
  if (isAutoRolling) attemptAutoRoll();
  return true;
}

function startCooldown() {
  clearCooldownExpiryTimer();
  cooldownDurationMs = Math.max(1, getCooldownMs());
  cooldownUntil = Date.now() + cooldownDurationMs;
  isCooldownActive = true;
  renderCooldownUI(Date.now());
  runCooldownVisualLoop();

  cooldownExpiryTimer = window.setTimeout(() => completeCooldown(), cooldownDurationMs + 10);
}

// ============================================================
// RNG + MUTATIONS
// ============================================================

function getSortedCardsForRolling() {
  return [...CARDS]
    .filter(card => card.requiredWeather == null || isWeatherActive(card.requiredWeather))
    .sort((a, b) => b.chance - a.chance);
}

function getEffectiveChance(card) {
  return Math.max(0.000001, card.chance / getLuckMultiplier());
}

function drawCardFromPool() {
  for (const card of getSortedCardsForRolling()) {
    const effectiveChance = getEffectiveChance(card);
    const hitProbability = Math.min(1, 1 / effectiveChance);
    if (Math.random() < hitProbability) {
      return { card, effectiveChance, score: hitProbability };
    }
  }
  return { card: null, effectiveChance: null, score: 0 };
}

function rollMutations() {
  const activeWeathers = getActiveWeatherDefinitions();
  if (!activeWeathers.length) return [];

  // 6.5% base chance. This stays in the requested 5-8% range.
  if (Math.random() >= WEATHER_CONFIG.BASE_MUTATION_CHANCE) return [];

  const firstWeather = activeWeathers[Math.floor(Math.random() * activeWeathers.length)];
  const selected = [firstWeather.mutation];

  // Conditional 10% second-roll chance => 0.65% overall dual chance.
  if (
    activeWeathers.length > 1 &&
    Math.random() < WEATHER_CONFIG.DUAL_MUTATION_CHANCE
  ) {
    const choices = activeWeathers.filter(weather => weather.id !== firstWeather.id);
    const secondWeather = choices[Math.floor(Math.random() * choices.length)];
    if (secondWeather) selected.push(secondWeather.mutation);
  }

  return selected.sort((a, b) => a.tier.rank - b.tier.rank);
}

function getVariantKey(cardId, mutations) {
  return canonicalVariantKey(cardId, mutations.map(mutation => mutation.id));
}

function parseVariantKey(key) {
  const separator = key.indexOf("|");
  if (separator < 0) return null;
  const cardId = key.slice(0, separator);
  const raw = key.slice(separator + 1);
  const ids = raw === "base" ? [] : raw.split("+").map(normalizeMutationId);
  return {
    key: canonicalVariantKey(cardId, ids),
    cardId,
    mutations: ids.map(id => MUTATION_BY_ID[id]).filter(Boolean)
  };
}

function getMutationMultiplier(mutations) {
  return mutations.reduce((multiplier, mutation) => multiplier * mutation.multiplier, 1);
}

function getDisplayCard(card, mutations = []) {
  const multiplier = getMutationMultiplier(mutations);
  const prefix = mutations.map(mutation => `[${mutation.name}]`).join(" ");
  return {
    name: prefix ? `${prefix} ${card.name}` : card.name,
    hp: Math.round(card.stats.hp * multiplier),
    atk: Math.round(card.stats.atk * multiplier),
    reward: Math.floor(calculateCardReward(card.chance) * multiplier)
  };
}

function hexToRgb(hex) {
  const value = String(hex || "").trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function getMutationAccent(mutation, index = 0) {
  if (mutation?.color) return mutation.color;

  // Deterministic neon fallback: future mutations without an explicit color
  // still receive a vibrant theme without changing gameplay data.
  const seed = String(mutation?.id || mutation?.name || `mutation-${index}`);
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return `hsl(${hash % 360} 92% 62%)`;
}

function getMutationColorStops(mutations) {
  const stops = [];
  mutations.forEach((mutation, index) => {
    const primary = getMutationAccent(mutation, index);
    const secondary = mutation?.secondaryColor;
    stops.push(primary);
    if (secondary && mutations.length === 1) stops.push(secondary);
  });
  return stops.length ? stops : ["#ffffff"];
}

function getMutationGradient(mutations) {
  if (!mutations.length) return "";
  const colors = getMutationColorStops(mutations);
  if (colors.length === 1) return colors[0];
  const step = 100 / (colors.length - 1);
  return `linear-gradient(135deg, ${colors.map((color, index) => `${color} ${Math.round(index * step)}%`).join(", ")})`;
}

function getMutationGlow(mutations) {
  if (!mutations.length) return "#7d5cff";
  const accents = mutations.map((mutation, index) => getMutationAccent(mutation, index));
  return accents[0] || "#7d5cff";
}

function applyMutationStyleTokens(element, mutations) {
  if (!element) return;
  element.style.setProperty("--mutation-gradient", getMutationGradient(mutations) || "transparent");
  element.style.setProperty("--mutation-glow", getMutationGlow(mutations));
  element.style.setProperty("--mutation-accent", getMutationGlow(mutations));
}

function applyCardMutationVisual(cardElement, mutations) {
  if (!cardElement) return;

  const mutationClasses = MUTATIONS.map(mutation => mutation.className).filter(Boolean);
  cardElement.classList.remove(...mutationClasses, "has-mutation", "mutation-multi");

  if (mutations.length) {
    cardElement.classList.add("has-mutation");
    mutations.forEach(mutation => {
      if (mutation?.className) cardElement.classList.add(mutation.className);
    });
    if (mutations.length >= 2) cardElement.classList.add("mutation-multi");
  }

  applyMutationStyleTokens(cardElement, mutations);
}

function renderMutationBadges(container, mutations) {
  if (!container) return;
  container.innerHTML = "";

  if (!mutations.length) {
    const normal = document.createElement("span");
    normal.className = "mutation-badge mutation-normal";
    normal.textContent = "NORMAL";
    container.appendChild(normal);
    return;
  }

  const badge = document.createElement("span");
  const isMulti = mutations.length > 1;
  badge.className = `mutation-badge ${isMulti ? "mutation-multi" : (mutations[0]?.className || "")}`;
  badge.textContent = mutations.map(mutation => mutation.name).join(" + ").toUpperCase();
  applyMutationStyleTokens(badge, mutations);
  container.appendChild(badge);
}

// ============================================================
// ROLL CONTROLLER - COOLDOWN IS SET BEFORE ANY RESULT PROCESSING
// ============================================================

function rollCard(source = "manual") {
  // HARD GATE: no trigger can bypass the cooldown, including keyboard,
  // programmatic calls, or Auto Roll.
  if (isCooldownActive) return false;
  if (source === "auto" && !isAutoRolling) return false;

  // Lock immediately so a second synchronous event cannot enter.
  startCooldown();

  try {
    // Catch up any sub-second drift without making gameplay depend on clicks.
    syncGameClockToNow();

    const result = drawCardFromPool();
    state.totalRolls += 1;

    if (result.card) {
      const mutations = rollMutations();
      const display = getDisplayCard(result.card, mutations);
      const variantKey = getVariantKey(result.card.id, mutations);

      state.unlocked[result.card.id] = (state.unlocked[result.card.id] || 0) + 1;
      state.mutations[variantKey] = (state.mutations[variantKey] || 0) + 1;
      state.lastResultId = result.card.id;
      state.currency += display.reward;

      showResult(result.card, result.effectiveChance, mutations);
      showRewardToast(display.reward, mutations);
    } else {
      state.lastResultId = null;
      showMiss(result.score);
    }

    saveState();
    updateStats();
    renderCollection();
    renderUpgradeShop();
    return true;
  } finally {
    // The cooldown remains authoritative after the result is processed.
    renderCooldownUI(Date.now());
  }
}

function attemptAutoRoll() {
  if (!isAutoRolling || isCooldownActive) return false;
  return rollCard("auto");
}

// ============================================================
// MAIN RESULT RENDERING
// ============================================================

function showResult(card, effectiveChance, mutations = []) {
  const display = getDisplayCard(card, mutations);
  els.emptyState?.classList.add("hidden");
  els.missState?.classList.add("hidden");
  els.resultCard?.classList.remove("hidden", "pop-in");
  void els.resultCard?.offsetWidth;
  els.resultCard?.classList.add("pop-in");

  if (els.resultName) els.resultName.textContent = display.name;
  if (els.resultRarity) els.resultRarity.textContent = card.rarity;
  if (els.resultChance) els.resultChance.textContent = card.chance.toLocaleString("en-US");
  if (els.resultHp) els.resultHp.textContent = display.hp.toLocaleString("en-US");
  if (els.resultAtk) els.resultAtk.textContent = display.atk.toLocaleString("en-US");
  if (els.resultPassiveName) els.resultPassiveName.textContent = card.passive.name;
  if (els.resultPassiveDescription) els.resultPassiveDescription.textContent = card.passive.description;

  renderMutationBadges(els.resultMutationBadges, mutations);
  applyCardMutationVisual(els.resultCard, mutations);
  if (els.resultCard) els.resultCard.dataset.effectiveChance = String(effectiveChance ?? "");

  setArtwork(els.resultImage, els.imageFallback, els.resultBackdrop, card.image, `${display.name} artwork`);
}

function showMiss(score = 0) {
  els.resultCard?.classList.add("hidden");
  els.emptyState?.classList.add("hidden");
  els.missState?.classList.remove("hidden", "shake");
  void els.missState?.offsetWidth;
  els.missState?.classList.add("shake");
  if (els.missScore) els.missScore.textContent = Number(score || 0).toFixed(4);
}

function showRewardToast(reward, mutations = []) {
  if (!els.rewardToast) return;
  clearTimeout(toastTimer);
  const prefix = mutations.length ? `✦ ${mutations.map(mutation => mutation.name).join(" + ")} • ` : "";
  els.rewardToast.textContent = `${prefix}+${formatCurrency(reward)}`;
  els.rewardToast.classList.remove("show");
  void els.rewardToast.offsetWidth;
  els.rewardToast.classList.add("show");
  toastTimer = window.setTimeout(() => els.rewardToast.classList.remove("show"), 1500);
}

function setArtwork(img, fallback, backdrop, src, alt) {
  const safeSrc = src || "assets/cards/default.png";
  if (backdrop) backdrop.style.setProperty("--art-bg-image", `url("${escapeCssUrl(safeSrc)}")`);
  if (!img) return;
  if (fallback) fallback.style.display = "none";
  img.style.display = "block";
  img.alt = alt || "Card artwork";
  img.src = safeSrc;
  img.onerror = () => {
    img.onerror = null;
    img.style.display = "none";
    if (fallback) fallback.style.display = "grid";
  };
}

function escapeCssUrl(src) {
  return String(src).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

// ============================================================
// COLLECTION + MUTATION ORDER
// ============================================================

function getUniqueCount() {
  return CARDS.filter(card => getOwnedCardCount(card.id) > 0).length;
}

function getVariantEntries(cardId) {
  return Object.entries(state.mutations)
    .map(([key, count]) => {
      const parsed = parseVariantKey(key);
      if (!parsed || parsed.cardId !== cardId || Number(count) <= 0) return null;
      return {
        key: parsed.key,
        count: Math.floor(Number(count)),
        mutations: parsed.mutations,
        isMulti: parsed.mutations.length >= 2
      };
    })
    .filter(Boolean)
    .sort((a, b) => getVariantRank(a) - getVariantRank(b) || a.key.localeCompare(b.key));
}

function getVariantRank(entry) {
  return entry.isMulti
    ? MUTATION_TIERS.multi.rank
    : entry.mutations[0]?.tier?.rank ?? MUTATION_TIERS.normal.rank;
}

function getCardMutationProfile(cardId) {
  const variants = getVariantEntries(cardId);
  const ids = new Set();
  let hasMulti = false;
  let rank = MUTATION_TIERS.normal.rank;

  variants.forEach(entry => {
    entry.mutations.forEach(mutation => ids.add(mutation.id));
    hasMulti ||= entry.isMulti;
    rank = Math.max(rank, getVariantRank(entry));
  });

  if (hasMulti) rank = MUTATION_TIERS.multi.rank;

  return {
    variants,
    mutationIds: [...ids],
    hasMulti,
    rank,
    tier: Object.values(MUTATION_TIERS).find(tier => tier.rank === rank) || MUTATION_TIERS.normal
  };
}

function getCardMutationVisuals(cardId) {
  const profile = getCardMutationProfile(cardId);
  const mutations = profile.mutationIds
    .map(id => MUTATION_BY_ID[id])
    .filter(Boolean)
    .sort((a, b) => a.tier.rank - b.tier.rank);

  return {
    profile,
    gradient: getMutationGradient(mutations),
    glow: getMutationGlow(mutations),
    classes: [...new Set(mutations.map(mutation => mutation.className))].concat(profile.hasMulti ? ["mutation-multi"] : [])
  };
}

function cardMatchesMutationFilter(card, filterValue) {
  if (filterValue === "all") return true;
  const profile = getCardMutationProfile(card.id);
  if (filterValue === "normal") return profile.variants.some(entry => !entry.mutations.length);
  if (filterValue === "multi") return profile.hasMulti;
  if (filterValue === "active") {
    const activeMutationIds = new Set(getActiveWeatherDefinitions().map(weather => weather.mutation.id));
    return profile.mutationIds.some(id => activeMutationIds.has(id));
  }
  return profile.mutationIds.includes(filterValue);
}

function getFilteredCards() {
  const query = els.searchInput?.value.trim().toLowerCase() || "";
  const filter = els.mutationFilter?.value || "all";
  const sort = els.sortSelect?.value || "rarity";

  const list = CARDS.filter(card => {
    const profile = getCardMutationProfile(card.id);
    const mutationText = profile.variants
      .flatMap(entry => entry.mutations.map(mutation => mutation.name))
      .join(" ")
      .toLowerCase();
    const searchMatch = !query || card.name.toLowerCase().includes(query) || card.passive.name.toLowerCase().includes(query) || mutationText.includes(query);
    return searchMatch && cardMatchesMutationFilter(card, filter);
  });

  list.sort((a, b) => {
    const profileA = getCardMutationProfile(a.id);
    const profileB = getCardMutationProfile(b.id);
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "atk") return b.stats.atk - a.stats.atk || profileB.rank - profileA.rank;
    if (sort === "collected") return Number(state.unlocked[b.id] || 0) - Number(state.unlocked[a.id] || 0) || profileB.rank - profileA.rank;

    // Rarity / drop-chance sort: highest 1-in-X denominator first,
    // which places the rarest cards before the common cards.
    return b.chance - a.chance || a.name.localeCompare(b.name);
  });

  return list;
}

function getAvailableRollPool() {
  return [...CARDS]
    .filter(card => card.requiredWeather == null || isWeatherActive(card.requiredWeather))
    .sort((a, b) => b.chance - a.chance);
}

function getWeatherPoolBadgeTokens(activeWeathers) {
  const colors = activeWeathers
    .map(weather => weather?.color || weather?.mutation?.color)
    .filter(Boolean);

  if (!colors.length) {
    return {
      color: "#8fefff",
      gradient: "#8fefff",
      glow: "#26dcff"
    };
  }

  const stops = colors.length === 1
    ? colors
    : colors.map((color, index) => `${color} ${Math.round((index / (colors.length - 1)) * 100)}%`);

  return {
    color: colors[0],
    gradient: colors.length === 1 ? colors[0] : `linear-gradient(135deg, ${stops.join(", ")})`,
    glow: colors.join(", ")
  };
}

function renderAvailableCards() {
  if (!els.availableCardsList) return;

  const pool = getAvailableRollPool();
  const activeWeathers = getActiveWeatherDefinitions();
  const uniqueWeatherNames = activeWeathers.map(weather => weather.name);
  const weatherTokens = getWeatherPoolBadgeTokens(activeWeathers);

  if (els.availableCardsMode) {
    els.availableCardsMode.style.setProperty("--weather-color", weatherTokens.color);
    els.availableCardsMode.style.setProperty("--weather-gradient", weatherTokens.gradient);
    els.availableCardsMode.style.setProperty("--weather-glow", weatherTokens.glow);
  }

  if (els.availableCardsCount) els.availableCardsCount.textContent = String(pool.length);
  if (els.availableCardsMode) {
    els.availableCardsMode.textContent = uniqueWeatherNames.length
      ? uniqueWeatherNames.join(" + ").toUpperCase()
      : "NORMAL";
  }

  els.availableCardsList.innerHTML = "";

  if (!pool.length) {
    const empty = document.createElement("div");
    empty.className = "available-empty";
    empty.textContent = "No cards are currently eligible.";
    els.availableCardsList.appendChild(empty);
    return;
  }

  for (const card of pool) {
    const row = document.createElement("article");
    row.className = "available-card-row";

    const main = document.createElement("div");
    main.className = "available-card-row__main";

    const title = document.createElement("strong");
    title.className = "available-card-row__name";
    title.textContent = card.name;

    const meta = document.createElement("div");
    meta.className = "available-card-row__meta";
    const rarity = document.createElement("span");
    rarity.className = `rarity-dot rarity-${card.rarity.toLowerCase()}`;
    rarity.textContent = card.rarity;
    const chance = document.createElement("span");
    chance.textContent = `1 in ${card.chance.toLocaleString("en-US")}`;
    meta.append(rarity, chance);

    main.append(title, meta);

    const requirement = document.createElement("span");
    requirement.className = `available-requirement ${card.requiredWeather ? "required" : "base"}`;
    requirement.textContent = card.requiredWeather
      ? (getWeatherByReference(card.requiredWeather)?.name || card.requiredWeather)
      : "NORMAL";

    row.append(main, requirement);
    els.availableCardsList.appendChild(row);
  }
}

function getOwnedCardCount(cardId) {
  const directCount = Math.max(0, Math.floor(Number(state.unlocked?.[cardId]) || 0));
  const variantCount = getVariantEntries(cardId).reduce((sum, entry) => sum + entry.count, 0);
  return Math.max(directCount, variantCount);
}

function renderCollection() {
  if (!els.collectionGrid) return;
  els.collectionGrid.innerHTML = "";

  for (const card of getFilteredCards()) {
    const count = getOwnedCardCount(card.id);
    const owned = count > 0;
    const visuals = getCardMutationVisuals(card.id);
    const profile = visuals.profile;

    const item = document.createElement("button");
    item.type = "button";
    item.className = [
      "collection-card",
      `rarity-${card.rarity.toLowerCase()}`,
      owned ? "" : "locked",
      profile.variants.length ? "has-mutation-glow" : "",
      ...visuals.classes
    ].filter(Boolean).join(" ");
    item.style.setProperty("--collection-mutation-gradient", visuals.gradient || "transparent");
    item.style.setProperty("--collection-mutation-glow", visuals.glow || "#7d5cff");
    item.title = owned ? `Owned ${count}× • Open dedicated preview` : `Undiscovered • 1 in ${card.chance.toLocaleString("en-US")}`;

    const art = document.createElement("div");
    art.className = "collection-mini__art";
    art.style.setProperty("--art-bg-image", `url("${escapeCssUrl(card.image)}")`);

    const img = document.createElement("img");
    const fallback = document.createElement("div");
    fallback.className = "collection-mini__fallback";
    fallback.innerHTML = `<span>✦</span><small>ARTWORK</small>`;
    fallback.style.display = "none";

    const lock = document.createElement("div");
    lock.className = "collection-mini__lock";
    lock.textContent = owned ? "" : "🔒";

    const body = document.createElement("div");
    body.className = "collection-mini__body";

    const titleRow = document.createElement("div");
    titleRow.className = "collection-title-row";
    const title = document.createElement("h3");
    title.className = "collection-mini__name";
    title.textContent = owned ? card.name : "Undiscovered Card";
    const tier = document.createElement("span");
    tier.className = "collection-tier-label";
    tier.textContent = profile.tier.name;
    titleRow.append(title, tier);

    const meta = document.createElement("div");
    meta.className = "collection-mini__meta";
    const rarity = document.createElement("span");
    rarity.textContent = card.rarity;
    const rate = document.createElement("span");
    rate.className = "collection-mini__rate";
    rate.textContent = `1 in ${card.chance.toLocaleString("en-US")}`;
    meta.append(rarity, rate);

    if (card.requiredWeather) {
      const requirement = document.createElement("span");
      requirement.className = `weather-requirement ${isWeatherActive(card.requiredWeather) ? "active" : ""}`;
      requirement.textContent = `Requires ${getWeatherByReference(card.requiredWeather)?.name || card.requiredWeather}`;
      meta.appendChild(requirement);
    }

    const badgeList = document.createElement("div");
    badgeList.className = "mutation-badge-list";
    badgeList.setAttribute("aria-label", "Unlocked mutation variants");

    const variants = owned ? profile.variants : [];
    if (variants.length) {
      variants.forEach(entry => {
        const badge = document.createElement("span");
        badge.className = [
          "collection-mutation-badge",
          entry.isMulti ? "mutation-multi" : "",
          ...entry.mutations.map(mutation => mutation.className)
        ].filter(Boolean).join(" ");
        badge.textContent = `${entry.mutations.length ? entry.mutations.map(mutation => mutation.name).join(" + ") : "Normal"} ×${entry.count}`;
        applyMutationStyleTokens(badge, entry.mutations);
        badgeList.appendChild(badge);
      });
    } else {
      const badge = document.createElement("span");
      badge.className = "collection-mutation-badge mutation-normal";
      badge.textContent = owned ? "Normal ×0" : "LOCKED";
      badgeList.appendChild(badge);
    }

    body.append(titleRow, meta, badgeList);
    art.append(img, fallback, lock);
    item.append(art, body);

    if (owned) {
      setArtwork(img, fallback, null, card.image, `${card.name} artwork`);
      item.addEventListener("click", () => openCardPreview(card.id));
    } else {
      img.style.display = "none";
      fallback.style.display = "grid";
      item.disabled = true;
    }

    els.collectionGrid.appendChild(item);
  }

  if (!els.collectionGrid.children.length) {
    const empty = document.createElement("div");
    empty.className = "empty-grid empty-state";
    empty.innerHTML = "<p>No cards match the current mutation filter.</p>";
    els.collectionGrid.appendChild(empty);
  }
}

// ============================================================
// DEDICATED CARD PREVIEW
// ============================================================

function getPreviewVariants(cardId) {
  const variants = getVariantEntries(cardId);
  if (!variants.length && state.unlocked[cardId]) {
    variants.push({
      key: canonicalVariantKey(cardId, []),
      count: Number(state.unlocked[cardId] || 0),
      mutations: [],
      isMulti: false
    });
  }
  return variants;
}

function getBestPreviewVariant(cardId) {
  return [...getPreviewVariants(cardId)].sort((a, b) => getVariantRank(b) - getVariantRank(a) || b.count - a.count)[0] || null;
}

function getCardById(cardId) {
  return CARDS.find(card => card.id === cardId) || null;
}

function openCardPreview(cardId, preferredKey = null) {
  const card = getCardById(cardId);
  if (!card || !state.unlocked[cardId]) return;

  const variants = getPreviewVariants(cardId);
  const selected = variants.find(entry => entry.key === preferredKey) || getBestPreviewVariant(cardId);
  if (!selected) return;

  previewSelection = { cardId, variantKey: selected.key };
  renderPreview();
  openModal("cardPreviewModal");
}

function renderPreview() {
  if (!previewSelection) return;
  const card = getCardById(previewSelection.cardId);
  if (!card) return;

  const variants = getPreviewVariants(card.id);
  const variant = variants.find(entry => entry.key === previewSelection.variantKey) || variants[0];
  if (!variant) return;
  previewSelection.variantKey = variant.key;

  const display = getDisplayCard(card, variant.mutations);
  els.previewName.textContent = display.name;
  els.previewRarity.textContent = card.rarity;
  els.previewVariantCount.textContent = `${variant.count}×`;
  els.previewHp.textContent = display.hp.toLocaleString("en-US");
  els.previewAtk.textContent = display.atk.toLocaleString("en-US");
  els.previewPassiveName.textContent = card.passive.name;
  els.previewPassiveDescription.textContent = card.passive.description;
  els.previewVariantLabel.textContent = variant.mutations.length
    ? variant.mutations.map(mutation => mutation.name).join(" + ")
    : "Normal Variant";
  els.previewCollectedCount.textContent = `${Number(state.unlocked[card.id] || 0).toLocaleString("en-US")}× total`;
  els.previewRequirement.textContent = card.requiredWeather
    ? `Requires ${getWeatherByReference(card.requiredWeather)?.name || card.requiredWeather}`
    : "Available in the standard pool";

  renderMutationBadges(els.previewMutationBadges, variant.mutations);
  applyCardMutationVisual(els.previewCard, variant.mutations);
  setArtwork(els.previewImage, els.previewFallback, els.previewBackdrop, card.image, `${display.name} preview artwork`);
  renderVariantMenu(variants);
}

function renderVariantMenu(variants) {
  if (!els.previewVariantMenu) return;
  els.previewVariantMenu.innerHTML = "";

  variants.forEach(variant => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `variant-menu-item ${variant.key === previewSelection?.variantKey ? "active" : ""}`;
    button.setAttribute("role", "menuitem");
    button.innerHTML = `
      <span>${escapeHtml(variant.mutations.length ? variant.mutations.map(mutation => mutation.name).join(" + ") : "Normal")}</span>
      <small>${variant.count}×</small>
    `;
    button.addEventListener("click", () => {
      previewSelection.variantKey = variant.key;
      renderPreview();
      closeVariantMenu();
    });
    els.previewVariantMenu.appendChild(button);
  });
}

function toggleVariantMenu() {
  if (!els.previewVariantMenu) return;
  const opening = els.previewVariantMenu.classList.contains("hidden");
  els.previewVariantMenu.classList.toggle("hidden", !opening);
  els.previewVariantMenuButton?.setAttribute("aria-expanded", String(opening));
}

function closeVariantMenu() {
  els.previewVariantMenu?.classList.add("hidden");
  els.previewVariantMenuButton?.setAttribute("aria-expanded", "false");
}

// ============================================================
// STATS + UPGRADES
// ============================================================

function updateStats() {
  const unique = getUniqueCount();
  if (els.totalRolls) els.totalRolls.textContent = state.totalRolls.toLocaleString("en-US");
  if (els.currencyValue) els.currencyValue.textContent = formatCurrency(state.currency);
  if (els.collectionSummary) els.collectionSummary.textContent = `Cards: ${unique}/${CARDS.length}`;
  if (els.luckValue) els.luckValue.textContent = `${getLuckMultiplier().toFixed(2)}x`;
  if (els.collectionModalCount) els.collectionModalCount.textContent = `${unique}/${CARDS.length}`;
  renderCooldownUI(Date.now());
}

function renderUpgradeShop() {
  const speedLevel = state.upgrades.rollSpeed;
  const luckLevel = state.upgrades.luck;
  const speedMaxed = speedLevel >= SPEED_MAX_LEVEL;
  const luckMaxed = luckLevel >= LUCK_MAX_LEVEL;
  const speedCost = getUpgradeCost(SPEED_BASE_COST, speedLevel);
  const luckCost = getUpgradeCost(LUCK_BASE_COST, luckLevel);

  if (els.shopCurrency) els.shopCurrency.textContent = formatCurrency(state.currency);
  if (els.speedLevel) els.speedLevel.textContent = `Lv. ${speedLevel}/${SPEED_MAX_LEVEL}`;
  if (els.speedCurrent) els.speedCurrent.textContent = speedMaxed ? "MAX" : formatCooldown(getCooldownMs());
  if (els.luckLevel) els.luckLevel.textContent = `Lv. ${luckLevel}/${LUCK_MAX_LEVEL}`;
  if (els.luckCurrent) els.luckCurrent.textContent = `${getLuckMultiplier().toFixed(2)}x`;

  configureBuyButton(els.buySpeedButton, speedMaxed, speedCost, "roll speed");
  configureBuyButton(els.buyLuckButton, luckMaxed, luckCost, "luck");
}

function configureBuyButton(button, isMaxed, cost, label) {
  if (!button) return;
  if (isMaxed) {
    button.textContent = "MAX LEVEL";
    button.disabled = true;
    return;
  }
  button.textContent = `Upgrade ${label} • ${formatCurrency(cost)}`;
  button.disabled = state.currency < cost;
}

function purchaseUpgrade(type) {
  if (!(type in state.upgrades)) return;

  const isSpeed = type === "rollSpeed";
  const level = state.upgrades[type];
  const maxLevel = isSpeed ? SPEED_MAX_LEVEL : LUCK_MAX_LEVEL;
  const baseCost = isSpeed ? SPEED_BASE_COST : LUCK_BASE_COST;
  if (level >= maxLevel) return;

  const cost = getUpgradeCost(baseCost, level);
  if (state.currency < cost) return;

  state.currency -= cost;
  state.upgrades[type] += 1;
  saveState();
  updateStats();
  renderUpgradeShop();
  renderCooldownUI(Date.now());
}

// ============================================================
// 4v4 BATTLE ARENA - VISUAL + AUTOMATED, ISOLATED FROM RNG/TICKER
// ============================================================

const BATTLE_BASE_REWARD_VND = 500;
const BATTLE_TURN_MS = 3000;
const BATTLE_TEAM_SIZE = 4;
const BATTLE_ENEMY_MUTATION_CHANCE = 0.70;
const BATTLE_DEFEAT_LOSS_CHANCE = 0.25;

let battleState = null;
let battleTurnTimer = null;

function clearBattleTurnTimer() {
  if (battleTurnTimer !== null) {
    window.clearTimeout(battleTurnTimer);
    battleTurnTimer = null;
  }
}

function getUnlockedBattleCards() {
  return CARDS.filter(card => getOwnedCardCount(card.id) > 0);
}

function getBattleVariantEntries(cardId) {
  return getVariantEntries(cardId)
    .filter(entry => entry.count > 0)
    .sort((a, b) => getVariantRank(a) - getVariantRank(b) || a.key.localeCompare(b.key));
}

function getBattleVariantLabel(entry) {
  return entry.mutations.length
    ? entry.mutations.map(mutation => mutation.name).join(' + ')
    : 'Normal';
}

function getBattleVariantDisplay(card, entry) {
  return getDisplayCard(card, entry.mutations);
}

function getBattleSetupTeam() {
  return Array.isArray(battleState?.setup?.team) ? battleState.setup.team : [];
}

function getBattleVariantUsage(excludeIndex = -1) {
  const usage = new Map();
  for (let index = 0; index < getBattleSetupTeam().length; index += 1) {
    if (index === excludeIndex) continue;
    const key = getBattleSetupTeam()[index]?.variantKey;
    if (!key) continue;
    usage.set(key, (usage.get(key) || 0) + 1);
  }
  return usage;
}

function getAvailableBattleVariantCount(variantKey, excludeIndex = -1) {
  const owned = Number(state.mutations?.[variantKey] || 0);
  const usedElsewhere = getBattleVariantUsage(excludeIndex).get(variantKey) || 0;
  return owned - usedElsewhere;
}

function chooseFirstAvailableBattleVariant(cardId, excludeIndex = -1) {
  return getBattleVariantEntries(cardId).find(entry => getAvailableBattleVariantCount(entry.key, excludeIndex) > 0) || null;
}

function isBattleSetupValid(team = getBattleSetupTeam()) {
  if (team.length !== BATTLE_TEAM_SIZE) return false;
  const usage = new Map();
  for (const slot of team) {
    const card = getCardById(slot.cardId);
    const variant = card ? getBattleVariantEntries(card.id).find(entry => entry.key === slot.variantKey) : null;
    if (!card || !variant) return false;
    usage.set(slot.variantKey, (usage.get(slot.variantKey) || 0) + 1);
  }
  for (const [variantKey, used] of usage) {
    if (Number(state.mutations?.[variantKey] || 0) < used) return false;
  }
  return true;
}

function renderBattleTeamSlots() {
  const container = els.battleTeamSlots;
  if (!container) return;
  container.innerHTML = '';

  const team = getBattleSetupTeam();
  const activeIndex = Number(battleState?.setup?.activeIndex || 0);

  for (let index = 0; index < BATTLE_TEAM_SIZE; index += 1) {
    const slot = team[index];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `battle-team-slot ${index === activeIndex ? 'is-active' : ''} ${slot ? 'is-filled' : 'is-empty'}`;
    button.addEventListener('click', () => {
      if (!battleState?.setup) return;
      battleState.setup.activeIndex = index;
      renderBattleSelection();
    });

    const label = document.createElement('span');
    label.className = 'battle-team-slot__index';
    label.textContent = `#${index + 1}`;
    button.appendChild(label);

    if (!slot) {
      const empty = document.createElement('strong');
      empty.textContent = 'EMPTY';
      button.appendChild(empty);
    } else {
      const card = getCardById(slot.cardId);
      const variant = card ? getBattleVariantEntries(card.id).find(entry => entry.key === slot.variantKey) : null;
      const media = document.createElement('div');
      media.className = 'battle-team-slot__art';
      const img = document.createElement('img');
      img.alt = card?.name || 'Team fighter';
      const fallback = document.createElement('div');
      fallback.className = 'battle-fighter-option__fallback';
      fallback.textContent = '✦';
      media.append(img, fallback);
      if (card) setArtwork(img, fallback, null, card.image, `${card.name} artwork`);

      const info = document.createElement('div');
      info.className = 'battle-team-slot__info';
      const name = document.createElement('strong');
      name.textContent = card?.name || 'Unknown';
      const variantLabel = document.createElement('span');
      variantLabel.textContent = variant ? getBattleVariantLabel(variant) : 'Normal';
      info.append(name, variantLabel);
      button.append(media, info);
      if (variant) applyMutationStyleTokens(button, variant.mutations);
    }

    container.appendChild(button);
  }

  if (els.battleTeamCount) els.battleTeamCount.textContent = `${team.length}/${BATTLE_TEAM_SIZE}`;
}

function populateBattleFighterSelect() {
  const grid = els.battleFighterGrid;
  if (!grid) return;

  const unlocked = getUnlockedBattleCards();
  const previousTeam = Array.isArray(battleState?.setup?.team) ? battleState.setup.team.map(slot => ({ ...slot })) : [];
  const previousActive = Number(battleState?.setup?.activeIndex || 0);
  grid.innerHTML = '';

  clearBattleTurnTimer();
  battleState = battleState?.setup
    ? { setup: { team: previousTeam, activeIndex: previousActive } }
    : { setup: { team: [], activeIndex: 0 } };

  if (!unlocked.length) {
    grid.innerHTML = '<div class="battle-empty-selection">Roll at least one card to enter the arena.</div>';
    if (els.battleStartButton) els.battleStartButton.disabled = true;
    if (els.battleVariantGrid) els.battleVariantGrid.innerHTML = '';
    renderBattleSelection();
    return;
  }

  unlocked.forEach(card => {
    const selectedIndexes = getBattleSetupTeam()
      .map((slot, index) => slot?.cardId === card.id ? index : -1)
      .filter(index => index >= 0);
    const activeIndex = Number(battleState.setup.activeIndex || 0);
    const canSelect = selectedIndexes.length > 0 || Boolean(chooseFirstAvailableBattleVariant(card.id, activeIndex));

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `battle-fighter-option ${selectedIndexes.length ? 'is-selected' : ''}`;
    button.disabled = !canSelect;
    button.dataset.cardId = card.id;

    const variants = getBattleVariantEntries(card.id);
    const firstEntry = variants[0];
    const display = firstEntry ? getBattleVariantDisplay(card, firstEntry) : getDisplayCard(card, []);

    const media = document.createElement('div');
    media.className = 'battle-fighter-option__art';
    const img = document.createElement('img');
    img.alt = `${card.name} artwork`;
    const fallback = document.createElement('div');
    fallback.className = 'battle-fighter-option__fallback';
    fallback.textContent = '✦';
    media.append(img, fallback);
    setArtwork(img, fallback, null, card.image, `${card.name} artwork`);

    const body = document.createElement('div');
    body.className = 'battle-fighter-option__body';
    const title = document.createElement('strong');
    title.textContent = card.name;
    const stats = document.createElement('span');
    stats.textContent = `HP ${display.hp.toLocaleString('en-US')} • ATK ${display.atk.toLocaleString('en-US')}`;
    const variantCount = document.createElement('small');
    variantCount.textContent = `${selectedIndexes.length ? `${selectedIndexes.length} slot${selectedIndexes.length > 1 ? 's' : ''} ` : ''}${variants.length} variant${variants.length === 1 ? '' : 's'} unlocked`;
    body.append(title, stats, variantCount);

    button.append(media, body);
    button.addEventListener('click', () => {
      const existingIndex = getBattleSetupTeam().findIndex(slot => slot.cardId === card.id);
      let targetIndex = existingIndex;

      if (targetIndex < 0) {
        if (getBattleSetupTeam().length < BATTLE_TEAM_SIZE) {
          targetIndex = getBattleSetupTeam().length;
          const entry = chooseFirstAvailableBattleVariant(card.id, -1);
          if (!entry) return;
          getBattleSetupTeam().push({ cardId: card.id, variantKey: entry.key });
        } else {
          targetIndex = Math.min(Number(battleState.setup.activeIndex || 0), BATTLE_TEAM_SIZE - 1);
          const entry = chooseFirstAvailableBattleVariant(card.id, targetIndex);
          if (!entry) return;
          getBattleSetupTeam()[targetIndex] = { cardId: card.id, variantKey: entry.key };
        }
      }

      battleState.setup.activeIndex = targetIndex;
      renderBattleSelection();
    });

    grid.appendChild(button);
  });

  renderBattleSelection();
}

function renderBattleSelection() {
  renderBattleTeamSlots();
  renderBattleFighterVariants();
  renderBattleSelectionPreview();
  if (els.battleFighterGrid) {
    els.battleFighterGrid.querySelectorAll('.battle-fighter-option').forEach(button => {
      const cardId = button.dataset.cardId;
      const selected = getBattleSetupTeam().some(slot => slot.cardId === cardId);
      button.classList.toggle('is-selected', selected);
    });
  }
}

function renderBattleFighterVariants() {
  const variantGrid = els.battleVariantGrid;
  if (!variantGrid) return;
  variantGrid.innerHTML = '';

  const activeIndex = Number(battleState?.setup?.activeIndex || 0);
  const slot = getBattleSetupTeam()[activeIndex];
  const card = slot ? getCardById(slot.cardId) : null;

  if (!card) {
    variantGrid.innerHTML = '<div class="battle-empty-selection">Select a team slot first.</div>';
    if (els.battleStartButton) els.battleStartButton.disabled = true;
    return;
  }

  const variants = getBattleVariantEntries(card.id);
  variants.forEach(entry => {
    const available = getAvailableBattleVariantCount(entry.key, activeIndex) > 0;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `battle-variant-option ${entry.key === slot.variantKey ? 'is-selected' : ''}`;
    button.disabled = !available;
    button.textContent = `${getBattleVariantLabel(entry)} ×${entry.count}`;
    applyMutationStyleTokens(button, entry.mutations);
    button.title = `${entry.count} owned`;
    button.addEventListener('click', () => {
      const usage = getBattleVariantUsage(activeIndex);
      const owned = Number(state.mutations?.[entry.key] || 0);
      if (entry.key !== slot.variantKey && owned <= (usage.get(entry.key) || 0)) return;
      slot.variantKey = entry.key;
      renderBattleSelection();
    });
    variantGrid.appendChild(button);
  });

  const valid = isBattleSetupValid();
  if (els.battleStartButton) els.battleStartButton.disabled = !valid;
}

function renderBattleSelectionPreview() {
  const activeIndex = Number(battleState?.setup?.activeIndex || 0);
  const slot = getBattleSetupTeam()[activeIndex];
  const card = slot ? getCardById(slot.cardId) : null;
  const preview = els.battleFighterPreview;
  if (!preview) return;

  preview.innerHTML = '';
  if (!card) {
    const empty = document.createElement('span');
    empty.textContent = 'Select a fighter to assign to the active team slot.';
    preview.appendChild(empty);
    return;
  }

  const entry = getBattleVariantEntries(card.id).find(candidate => candidate.key === slot.variantKey);
  if (!entry) return;
  const display = getBattleVariantDisplay(card, entry);

  const media = document.createElement('div');
  media.className = 'battle-selection-preview__art';
  const img = document.createElement('img');
  const fallback = document.createElement('div');
  fallback.className = 'battle-fighter-option__fallback';
  fallback.textContent = '✦';
  media.append(img, fallback);
  setArtwork(img, fallback, null, card.image, `${display.name} artwork`);

  const info = document.createElement('div');
  info.className = 'battle-selection-preview__info';
  const name = document.createElement('strong');
  name.textContent = `SLOT ${activeIndex + 1}: ${display.name}`;
  const stats = document.createElement('span');
  stats.textContent = `HP ${display.hp.toLocaleString('en-US')} • ATK ${display.atk.toLocaleString('en-US')} • ${entry.count} owned`;
  const badgeWrap = document.createElement('div');
  badgeWrap.className = 'battle-selection-preview__badges';
  renderMutationBadges(badgeWrap, entry.mutations);
  info.append(name, stats, badgeWrap);
  preview.append(media, info);

  if (els.battleStartButton) els.battleStartButton.disabled = !isBattleSetupValid();
}

function resetBattleView() {
  clearBattleTurnTimer();
  battleState = { setup: { team: [], activeIndex: 0 } };
  els.battleSetup?.classList.remove('hidden');
  els.battleArena?.classList.add('hidden');
  els.battleVictory?.classList.add('hidden');
  if (els.battleLog) els.battleLog.innerHTML = '';
  if (els.battleStatus) els.battleStatus.textContent = 'PREPARING';
  if (els.battleStartButton) els.battleStartButton.disabled = true;
  populateBattleFighterSelect();
}

function openBattleModal() {
  resetBattleView();
  openModal('battleModal');
}

function appendBattleLog(message, tone = '') {
  if (!els.battleLog) return;
  const line = document.createElement('div');
  line.className = `battle-log__line ${tone ? `is-${tone}` : ''}`;
  line.textContent = message;
  els.battleLog.appendChild(line);
  els.battleLog.scrollTop = els.battleLog.scrollHeight;
}

function rollEnemyMutations() {
  const activeWeathers = getActiveWeatherDefinitions();
  if (!activeWeathers.length || Math.random() >= BATTLE_ENEMY_MUTATION_CHANCE) return [];

  const candidates = activeWeathers
    .map(weather => weather.mutation)
    .filter(Boolean);
  if (!candidates.length) return [];

  const primary = candidates[Math.floor(Math.random() * candidates.length)];
  return primary ? [primary] : [];
}

function chooseBattleEnemyTeam(playerTeam) {
  const playerIds = new Set(playerTeam.map(unit => unit.card.id));
  let pool = getAvailableRollPool().filter(card => !playerIds.has(card.id));
  if (!pool.length) pool = CARDS.filter(card => !playerIds.has(card.id));
  if (!pool.length) pool = [...CARDS];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const team = [];
  for (let index = 0; index < BATTLE_TEAM_SIZE; index += 1) {
    const card = shuffled[index % shuffled.length];
    const mutations = rollEnemyMutations();
    const display = getDisplayCard(card, mutations);
    team.push({
      card,
      mutations,
      variantKey: getVariantKey(card.id, mutations),
      display,
      hp: display.hp,
      maxHp: display.hp,
      atk: display.atk,
      defeated: false
    });
  }
  return team;
}

function calculateBattleUnitPower(unit) {
  return Math.max(0, Math.round(unit.maxHp + unit.atk * 2));
}

function calculateBattleTeamPower(team) {
  return team.reduce((total, unit) => total + calculateBattleUnitPower(unit), 0);
}

function getBattleRewardProfile(playerPower, enemyPower) {
  const ratio = enemyPower / Math.max(1, playerPower);
  let multiplier = 1;
  let label = 'Balanced Match';

  if (ratio < 0.8) {
    multiplier = 0.35;
    label = 'Weak Match Penalty';
  } else if (ratio <= 1.25) {
    multiplier = 1;
    label = 'Balanced Match';
  } else {
    // 1.50x at 1.25 ratio, scaling linearly to 2.50x at 2.00+.
    multiplier = Math.min(2.5, 1.5 + ((ratio - 1.25) / 0.75));
    label = 'Hard Match Bonus';
  }

  const reward = Math.max(0, Math.floor(BATTLE_BASE_REWARD_VND * multiplier));
  return { ratio, multiplier, reward, label };
}

function renderBattleCombatant(side, unit) {
  const prefix = side === 'player' ? 'battlePlayer' : 'battleEnemy';
  const cardEl = side === 'player' ? els.battlePlayerCard : els.battleEnemyCard;
  const image = side === 'player' ? els.battlePlayerImage : els.battleEnemyImage;
  const fallback = side === 'player' ? els.battlePlayerFallback : els.battleEnemyFallback;
  const backdrop = side === 'player' ? els.battlePlayerBackdrop : els.battleEnemyBackdrop;
  const mutationBadges = side === 'player' ? els.battlePlayerMutationBadges : els.battleEnemyMutationBadges;
  const ratio = Math.max(0, Math.min(1, unit.hp / unit.maxHp));

  const nameEl = els[prefix + 'Name'];
  const hpEl = els[prefix + 'Hp'];
  const hpBar = els[prefix + 'HpBar'];
  const atkEl = els[prefix + 'Atk'];

  if (nameEl) nameEl.textContent = unit.display.name;
  if (hpEl) hpEl.textContent = `${Math.max(0, unit.hp).toLocaleString('en-US')} / ${unit.maxHp.toLocaleString('en-US')}`;
  if (hpBar) hpBar.style.width = `${ratio * 100}%`;
  if (atkEl) atkEl.textContent = unit.atk.toLocaleString('en-US');
  renderMutationBadges(mutationBadges, unit.mutations);
  applyCardMutationVisual(cardEl, unit.mutations);
  setArtwork(image, fallback, backdrop, unit.card.image, `${unit.display.name} artwork`);
}

function renderBattleLineup(side, team, activeIndex) {
  const container = side === 'player' ? els.battlePlayerLineup : els.battleEnemyLineup;
  if (!container) return;
  container.innerHTML = '';

  team.forEach((unit, index) => {
    const slot = document.createElement('div');
    slot.className = `battle-lineup-card ${index === activeIndex ? 'is-active' : ''} ${unit.defeated ? 'is-defeated' : ''}`;
    applyMutationStyleTokens(slot, unit.mutations);

    const media = document.createElement('div');
    media.className = 'battle-lineup-card__art';
    const img = document.createElement('img');
    img.alt = unit.display.name;
    const fallback = document.createElement('div');
    fallback.className = 'battle-fighter-option__fallback';
    fallback.textContent = unit.defeated ? '×' : '✦';
    media.append(img, fallback);
    if (!unit.defeated) setArtwork(img, fallback, null, unit.card.image, `${unit.display.name} artwork`);
    else img.style.display = 'none';

    const info = document.createElement('div');
    info.className = 'battle-lineup-card__info';
    const name = document.createElement('strong');
    name.textContent = unit.display.name;
    const hp = document.createElement('span');
    hp.textContent = unit.defeated ? 'DEFEATED' : `${Math.max(0, unit.hp).toLocaleString('en-US')} HP`;
    info.append(name, hp);
    slot.append(media, info);
    container.appendChild(slot);
  });
}

function renderBattleStats() {
  if (!battleState?.playerTeam || !battleState?.enemyTeam) return;
  const player = battleState.playerTeam[battleState.playerIndex];
  const enemy = battleState.enemyTeam[battleState.enemyIndex];
  if (!player || !enemy) return;

  battleState.player = player;
  battleState.enemy = enemy;
  renderBattleCombatant('player', player);
  renderBattleCombatant('enemy', enemy);
  renderBattleLineup('player', battleState.playerTeam, battleState.playerIndex);
  renderBattleLineup('enemy', battleState.enemyTeam, battleState.enemyIndex);

  if (els.battlePlayerTeamPower) els.battlePlayerTeamPower.textContent = `PLAYER POWER ${battleState.playerPower.toLocaleString('en-US')}`;
  if (els.battleEnemyTeamPower) els.battleEnemyTeamPower.textContent = `ENEMY POWER ${battleState.enemyPower.toLocaleString('en-US')}`;
}

function animateBattleAttack(side) {
  const attacker = side === 'player' ? els.battlePlayerCard : els.battleEnemyCard;
  const defender = side === 'player' ? els.battleEnemyCard : els.battlePlayerCard;
  if (!attacker || !defender) return;

  attacker.classList.remove('battle-lunge-player', 'battle-lunge-enemy');
  defender.classList.remove('battle-hit');
  void attacker.offsetWidth;
  void defender.offsetWidth;
  attacker.classList.add(side === 'player' ? 'battle-lunge-player' : 'battle-lunge-enemy');
  window.setTimeout(() => defender.classList.add('battle-hit'), 170);
  window.setTimeout(() => {
    attacker.classList.remove('battle-lunge-player', 'battle-lunge-enemy');
    defender.classList.remove('battle-hit');
  }, 720);
}

function animateBattlePromotion(side) {
  const card = side === 'player' ? els.battlePlayerCard : els.battleEnemyCard;
  if (!card) return;
  card.classList.remove('battle-promote');
  void card.offsetWidth;
  card.classList.add('battle-promote');
}

function scheduleNextBattleTurn() {
  clearBattleTurnTimer();
  if (!battleState || battleState.finished) return;
  battleState.nextTurnAt = Date.now() + BATTLE_TURN_MS;
  if (els.battleStatus) {
    els.battleStatus.textContent = battleState.turn === 'player'
      ? 'PLAYER STRIKE IN 3s'
      : 'ENEMY STRIKE IN 3s';
  }
  battleTurnTimer = window.setTimeout(() => {
    battleTurnTimer = null;
    executeBattleTurn();
  }, BATTLE_TURN_MS);
}

function deductBattleVariantCopy(unit) {
  if (!unit) return false;
  const cardId = unit.card.id;
  const variantKey = unit.variantKey;
  const currentVariantCount = Number(state.mutations?.[variantKey] || 0);
  if (currentVariantCount <= 0) return false;

  if (currentVariantCount === 1) delete state.mutations[variantKey];
  else state.mutations[variantKey] = currentVariantCount - 1;

  const currentCardCount = Number(state.unlocked?.[cardId] || 0);
  if (currentCardCount <= 1) delete state.unlocked[cardId];
  else state.unlocked[cardId] = currentCardCount - 1;
  return true;
}

function canReplayBattleTeam() {
  if (!battleState?.setup?.team || battleState.setup.team.length !== BATTLE_TEAM_SIZE) return false;
  const usage = new Map();
  for (const slot of battleState.setup.team) {
    usage.set(slot.variantKey, (usage.get(slot.variantKey) || 0) + 1);
    if (Number(state.unlocked?.[slot.cardId] || 0) <= 0) return false;
  }
  for (const [variantKey, used] of usage) {
    if (Number(state.mutations?.[variantKey] || 0) < used) return false;
  }
  return true;
}

function applyBattleDefeatPenalty() {
  const defeated = battleState?.playerTeam?.filter(unit => unit.defeated && Number(state.mutations?.[unit.variantKey] || 0) > 0) || [];
  const lossRoll = Math.random() < BATTLE_DEFEAT_LOSS_CHANCE;

  if (!lossRoll || !defeated.length) {
    return { lost: false, reason: 'saved' };
  }

  const target = defeated[Math.floor(Math.random() * defeated.length)];
  const lost = deductBattleVariantCopy(target);
  return { lost, reason: lost ? 'lost' : 'saved', target };
}

function finishBattle(playerWon) {
  if (!battleState || battleState.finished) return;
  clearBattleTurnTimer();
  battleState.finished = true;

  if (playerWon) {
    const rewardProfile = getBattleRewardProfile(battleState.playerPower, battleState.enemyPower);
    state.currency += rewardProfile.reward;
    saveState();
    updateStats();
    renderUpgradeShop();

    const bonusPercent = Math.round((rewardProfile.multiplier - 1) * 100);
    const rewardNote = bonusPercent >= 0
      ? `+${bonusPercent}% reward`
      : `${bonusPercent}% reward`;

    appendBattleLog(`Victory! +${formatCurrency(rewardProfile.reward)} • ${rewardProfile.label}.`, 'victory');
    if (els.battleResultTitle) els.battleResultTitle.textContent = 'Victory!';
    if (els.battleResultText) els.battleResultText.textContent = `4v4 cleared. ${formatCurrency(rewardProfile.reward)} earned (${rewardNote}).`;
    if (els.battleResultPower) els.battleResultPower.textContent = `Player Power: ${battleState.playerPower.toLocaleString('en-US')} vs Enemy Power: ${battleState.enemyPower.toLocaleString('en-US')} • ${rewardProfile.label} • ×${rewardProfile.multiplier.toFixed(2)} reward`;
  } else {
    const penalty = applyBattleDefeatPenalty();
    saveState();
    updateStats();
    renderCollection();
    renderUpgradeShop();

    appendBattleLog(
      penalty.lost ? `Defeat! 25% Loss Chance triggered — 1 copy lost from ${penalty.target.display.name}.` : 'Defeat! 25% Loss Chance: Card saved.',
      'defeat'
    );
    if (els.battleResultTitle) els.battleResultTitle.textContent = 'Defeat';
    if (els.battleResultText) els.battleResultText.textContent = penalty.lost
      ? `Defeated! 25% Loss Chance triggered: 1 copy lost from ${penalty.target.display.name}.`
      : 'Defeated! 25% Loss Chance: Card saved.';
    if (els.battleResultPower) els.battleResultPower.textContent = `Player Power: ${battleState.playerPower.toLocaleString('en-US')} vs Enemy Power: ${battleState.enemyPower.toLocaleString('en-US')}`;
  }

  if (els.battleAutoAgainButton) {
    els.battleAutoAgainButton.disabled = !canReplayBattleTeam();
    els.battleAutoAgainButton.textContent = canReplayBattleTeam() ? 'Auto Battle Again' : 'Team Unavailable';
  }

  els.battleArena?.classList.add('hidden');
  els.battleVictory?.classList.remove('hidden');
}

function startBattle(useExistingSetup = true) {
  const setupTeam = useExistingSetup ? battleState?.setup?.team : null;
  if (!Array.isArray(setupTeam) || setupTeam.length !== BATTLE_TEAM_SIZE || !isBattleSetupValid(setupTeam)) return;

  const playerTeam = setupTeam.map(slot => {
    const card = getCardById(slot.cardId);
    const entry = getBattleVariantEntries(card.id).find(candidate => candidate.key === slot.variantKey);
    const display = getBattleVariantDisplay(card, entry);
    return {
      card,
      mutations: entry.mutations,
      variantKey: entry.key,
      display,
      hp: display.hp,
      maxHp: display.hp,
      atk: display.atk,
      defeated: false
    };
  });

  const enemyTeam = chooseBattleEnemyTeam(playerTeam);
  const playerPower = calculateBattleTeamPower(playerTeam);
  const enemyPower = calculateBattleTeamPower(enemyTeam);

  battleState = {
    setup: { team: setupTeam.map(slot => ({ ...slot })), activeIndex: 0 },
    turn: 'player',
    finished: false,
    nextTurnAt: null,
    playerIndex: 0,
    enemyIndex: 0,
    playerTeam,
    enemyTeam,
    playerPower,
    enemyPower,
    player: playerTeam[0],
    enemy: enemyTeam[0]
  };

  els.battleSetup?.classList.add('hidden');
  els.battleVictory?.classList.add('hidden');
  els.battleArena?.classList.remove('hidden');
  if (els.battleLog) els.battleLog.innerHTML = '';

  appendBattleLog(`4v4 battle begins: ${playerTeam[0].display.name} leads the line.`);
  appendBattleLog(`Enemy mutations are active-weather boosted (70% roll chance).`);
  appendBattleLog('First strike begins in 3 seconds.', 'player');
  renderBattleStats();
  scheduleNextBattleTurn();
}

function executeBattleTurn() {
  if (!battleState || battleState.finished || !battleState.playerTeam || !battleState.enemyTeam) return;

  const attackerTeam = battleState.turn === 'player' ? battleState.playerTeam : battleState.enemyTeam;
  const defenderTeam = battleState.turn === 'player' ? battleState.enemyTeam : battleState.playerTeam;
  const attackerIndex = battleState.turn === 'player' ? battleState.playerIndex : battleState.enemyIndex;
  const defenderIndex = battleState.turn === 'player' ? battleState.enemyIndex : battleState.playerIndex;
  const attacker = attackerTeam[attackerIndex];
  const defender = defenderTeam[defenderIndex];
  if (!attacker || !defender || attacker.defeated || defender.defeated) return;

  animateBattleAttack(battleState.turn);
  defender.hp = Math.max(0, defender.hp - attacker.atk);
  appendBattleLog(`${attacker.display.name} attacks ${defender.display.name} for ${attacker.atk.toLocaleString('en-US')} ATK.`, battleState.turn);
  renderBattleStats();

  if (defender.hp <= 0) {
    defender.defeated = true;
    appendBattleLog(`${defender.display.name} has been defeated!`, battleState.turn === 'player' ? 'player' : 'enemy');

    if (battleState.turn === 'player') {
      battleState.enemyIndex += 1;
      if (battleState.enemyIndex >= BATTLE_TEAM_SIZE) {
        renderBattleStats();
        finishBattle(true);
        return;
      }
      battleState.enemy = battleState.enemyTeam[battleState.enemyIndex];
      appendBattleLog(`${battleState.enemy.display.name} steps into the arena.`, 'enemy');
      animateBattlePromotion('enemy');
      battleState.turn = 'enemy';
    } else {
      battleState.playerIndex += 1;
      if (battleState.playerIndex >= BATTLE_TEAM_SIZE) {
        renderBattleStats();
        finishBattle(false);
        return;
      }
      battleState.player = battleState.playerTeam[battleState.playerIndex];
      appendBattleLog(`${battleState.player.display.name} steps into the arena.`, 'player');
      animateBattlePromotion('player');
      battleState.turn = 'player';
    }
  } else {
    battleState.turn = battleState.turn === 'player' ? 'enemy' : 'player';
  }

  renderBattleStats();
  scheduleNextBattleTurn();
}

// ============================================================
// GLOBAL LOOP
// ============================================================

function globalTick() {
  const now = Date.now();
  const previous = Number(state.weather.lastRealTimestamp);
  const deltaSeconds = Number.isFinite(previous)
    ? Math.max(0, (now - previous) / 1000)
    : 0;
  state.weather.lastRealTimestamp = now;

  const beforeWeatherSignature = JSON.stringify(state.weather.active.map(entry => [entry.weatherId, entry.expiresAt]));
  const clockChange = advanceGameClock(deltaSeconds);
  const afterWeatherSignature = JSON.stringify(state.weather.active.map(entry => [entry.weatherId, entry.expiresAt]));
  const weatherChanged = clockChange.weatherChanged || clockChange.expired || beforeWeatherSignature !== afterWeatherSignature;

  completeCooldown(false);
  renderClockAndWeather(false);
  renderCooldownUI(now);
  // Available Rolls is driven by Weather eligibility, so it is explicitly
  // refreshed whenever the global ticker runs and immediately after weather changes.
  renderAvailableCards();

  if (weatherChanged) {
    renderCollection();
    saveState();
  } else {
    // Persist elapsed real-time clock so reload recovery is deterministic.
    saveState();
  }

  // Global tick is the second authoritative Auto-Roll safety net.
  if (isAutoRolling && !isCooldownActive) attemptAutoRoll();
}

function startGlobalLoop() {
  if (globalTickTimer !== null) window.clearInterval(globalTickTimer);
  globalTickTimer = window.setInterval(globalTick, GLOBAL_TICK_MS);
}

function recoverElapsedRealTime() {
  const now = Date.now();
  const previous = Number(state.weather.lastRealTimestamp);
  const elapsedSeconds = Number.isFinite(previous)
    ? Math.max(0, (now - previous) / 1000)
    : 0;

  if (elapsedSeconds > 0) advanceGameClock(elapsedSeconds);
  state.weather.lastRealTimestamp = now;
  pruneExpiredWeathers();
  saveState();
}

// ============================================================
// MODALS + RESET
// ============================================================

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  if (id === "collectionModal") renderCollection();
  if (id === "upgradesModal") renderUpgradeShop();
  if (id === "cardPreviewModal") renderPreview();
  if (id === "battleModal") resetBattleView();
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add("hidden");
  if (id === "cardPreviewModal") closeVariantMenu();
  if (id === "battleModal") {
    clearBattleTurnTimer();
    if (battleState?.finished !== true) battleState = null;
  }

  const anyOpen = [...document.querySelectorAll(".modal-backdrop")]
    .some(node => !node.classList.contains("hidden"));
  if (!anyOpen) document.body.classList.remove("modal-open");
}

function resetGame() {
  const confirmed = window.confirm("Reset rolls, VNĐ, upgrades, collection, mutations, weather, and equipment? This cannot be undone.");
  if (!confirmed) return;

  clearCooldownExpiryTimer();
  clearBattleTurnTimer();
  clearTimeout(toastTimer);
  isCooldownActive = false;
  cooldownUntil = 0;
  cooldownDurationMs = 0;
  isAutoRolling = false;
  if (els.autoRollToggle) els.autoRollToggle.checked = false;
  previewSelection = null;

  state = cloneDefaultState();
  weatherHudSignature = "";
  lastClockSecondRendered = -1;

  saveState();
  updateStats();
  renderAvailableCards();
  renderCollection();
  renderUpgradeShop();
  renderClockAndWeather(true);

  els.resultCard?.classList.add("hidden");
  els.missState?.classList.add("hidden");
  els.emptyState?.classList.remove("hidden");
  els.resultMutationBadges && (els.resultMutationBadges.innerHTML = "");
  applyCardMutationVisual(els.resultCard, []);
  renderCooldownUI(Date.now());
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ============================================================
// EVENT WIRING
// ============================================================

els.buySpeedButton?.addEventListener("click", () => purchaseUpgrade("rollSpeed"));
els.buyLuckButton?.addEventListener("click", () => purchaseUpgrade("luck"));
els.collectionButton?.addEventListener("click", () => openModal("collectionModal"));
els.upgradesButton?.addEventListener("click", () => openModal("upgradesModal"));
els.battleButton?.addEventListener("click", openBattleModal);
els.resetButton?.addEventListener("click", resetGame);
els.battleStartButton?.addEventListener("click", () => startBattle(true));
els.battleAutoAgainButton?.addEventListener("click", () => {
  if (!canReplayBattleFighter()) return;
  startBattle(true);
});
els.battleChangeFighterButton?.addEventListener("click", () => {
  clearBattleTurnTimer();
  battleState = { setup: { team: [], activeIndex: 0 } };
  resetBattleView();
});
els.rollButton?.addEventListener("click", () => rollCard("manual"));
els.searchInput?.addEventListener("input", renderCollection);
els.mutationFilter?.addEventListener("change", renderCollection);
els.sortSelect?.addEventListener("change", renderCollection);

els.autoRollToggle?.addEventListener("change", () => {
  isAutoRolling = Boolean(els.autoRollToggle.checked);
  if (isAutoRolling) attemptAutoRoll();
});

els.previewVariantMenuButton?.addEventListener("click", event => {
  event.stopPropagation();
  toggleVariantMenu();
});

document.addEventListener("click", event => {
  if (!els.previewVariantMenu || !els.previewVariantMenuButton) return;
  if (!els.previewVariantMenu.contains(event.target) && !els.previewVariantMenuButton.contains(event.target)) {
    closeVariantMenu();
  }
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", () => closeModal(button.dataset.closeModal));
});

document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
  backdrop.addEventListener("click", event => {
    if (event.target === backdrop) closeModal(backdrop.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  closeVariantMenu();
  document.querySelectorAll(".modal-backdrop").forEach(modal => {
    if (!modal.classList.contains("hidden")) closeModal(modal.id);
  });
});

// Recover real time on background/foreground and before the page unloads.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    recoverElapsedRealTime();
    renderClockAndWeather(true);
    renderCooldownUI(Date.now());
  } else {
    syncGameClockToNow();
    saveState();
  }
});

window.addEventListener("pagehide", () => {
  syncGameClockToNow();
  saveState();
});

// ============================================================
// INITIALIZE
// ============================================================

recoverElapsedRealTime();
pruneExpiredWeathers();
renderClockAndWeather(true);
updateStats();
renderAvailableCards();
renderCollection();
renderUpgradeShop();
renderCooldownUI(Date.now());
startGlobalLoop();
