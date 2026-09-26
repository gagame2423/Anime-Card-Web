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
const SAVE_SCHEMA_VERSION = 5;
const GLOBAL_TICK_MS = 1000;
const BASE_COOLDOWN_MS = 1500;
const SPEED_BASE_COST = 100;
const SPEED_MAX_LEVEL = 20;
const SPEED_FACTOR = 0.15;
const LUCK_BASE_COST = 250;
const LUCK_MAX_LEVEL = 500;
const LUCK_FACTOR = 0.25;

const CARD_RARITY_EXP_MULTIPLIERS = Object.freeze({
  Common: 1,
  Rare: 1.6,
  Epic: 2.4,
  Legendary: 3.6,
  Mythic: 5.2,
  Secret: 8
});
const CARD_LEVEL_BASE_EXP = 100;
const CARD_LEVEL_STAT_GROWTH = 0.0075;
const CARD_LEVEL_MAX = 999;
const AUTO_SALVAGE_RARITY_VALUES = Object.freeze(["off", "Common", "Rare", "Epic", "Legendary", "Mythic", "Secret"]);

const FALLBACK_ART_DATA_URL = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22600%22 height%3D%22800%22 viewBox%3D%220 0 600 800%22%3E%3Cdefs%3E%3ClinearGradient id%3D%22g%22 x1%3D%220%22 y1%3D%220%22 x2%3D%221%22 y2%3D%221%22%3E%3Cstop stop-color%3D%22%23141a2a%22%2F%3E%3Cstop offset%3D%221%22 stop-color%3D%22%23080b14%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect width%3D%22600%22 height%3D%22800%22 fill%3D%22url(%23g)%22%2F%3E%3Ccircle cx%3D%22300%22 cy%3D%22340%22 r%3D%22100%22 fill%3D%22none%22 stroke%3D%22%2377e2ff%22 stroke-width%3D%2212%22 opacity%3D%220.65%22%2F%3E%3Ctext x%3D%22300%22 y%3D%22490%22 text-anchor%3D%22middle%22 fill%3D%22%23dfe9ff%22 font-family%3D%22Arial%2Csans-serif%22 font-size%3D%2236%22 font-weight%3D%22700%22%3EARTWORK%3C%2Ftext%3E%3C%2Fsvg%3E";

const MUTATION_ID_ALIASES = Object.freeze({
  blizzard: "frost",
  sacrifice: "eclipsed"
});

const defaultState = {
  schemaVersion: SAVE_SCHEMA_VERSION,
  totalRolls: 0,
  currency: 0,
  experience: 0,
  battleDropRateBonus: 0,
  cardProgress: {},
  autoSalvage: { enabled: false, mutations: { normal: false }, rarityThreshold: "off" },
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
syncOwnershipRecords();
saveState();

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
let collectionNeedsRefresh = true;
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
  previewLevel: document.getElementById("previewLevel"),
  previewExpText: document.getElementById("previewExpText"),
  previewExpBar: document.getElementById("previewExpBar"),
  previewSalvageButton: document.getElementById("previewSalvageButton"),
  previewSalvageExtrasButton: document.getElementById("previewSalvageExtrasButton"),
  previewAutoDeleteButton: document.getElementById("previewAutoDeleteButton"),

  autoSalvageModal: document.getElementById("autoSalvageModal"),
  autoSalvageEnabled: document.getElementById("autoSalvageEnabled"),
  autoSalvageRarity: document.getElementById("autoSalvageRarity"),
  autoSalvageMutationOptions: document.getElementById("autoSalvageMutationOptions"),

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
  battleModePicker: document.getElementById("battleModePicker"),
  battleModeLabel: document.getElementById("battleModeLabel"),
  battleStartButton: document.getElementById("battleStartButton"),
  battleArena: document.getElementById("battleArena"),
  battlePlayerCard: document.getElementById("battlePlayerCard"),
  battlePlayerImage: document.getElementById("battlePlayerImage"),
  battlePlayerFallback: document.getElementById("battlePlayerFallback"),
  battlePlayerBackdrop: document.getElementById("battlePlayerBackdrop"),
  battlePlayerMutationBadges: document.getElementById("battlePlayerMutationBadges"),
  battlePlayerName: document.getElementById("battlePlayerName"),
  battlePlayerLevel: document.getElementById("battlePlayerLevel"),
  battlePlayerExpText: document.getElementById("battlePlayerExpText"),
  battlePlayerExpBar: document.getElementById("battlePlayerExpBar"),
  battlePlayerHp: document.getElementById("battlePlayerHp"),
  battlePlayerHpBar: document.getElementById("battlePlayerHpBar"),
  battlePlayerAtk: document.getElementById("battlePlayerAtk"),
  battleEnemyCard: document.getElementById("battleEnemyCard"),
  battleEnemyImage: document.getElementById("battleEnemyImage"),
  battleEnemyFallback: document.getElementById("battleEnemyFallback"),
  battleEnemyBackdrop: document.getElementById("battleEnemyBackdrop"),
  battleEnemyMutationBadges: document.getElementById("battleEnemyMutationBadges"),
  battleEnemyName: document.getElementById("battleEnemyName"),
  battleEnemyLevel: document.getElementById("battleEnemyLevel"),
  battleEnemyExpText: document.getElementById("battleEnemyExpText"),
  battleEnemyExpBar: document.getElementById("battleEnemyExpBar"),
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
  battleResultCash: document.getElementById("battleResultCash"),
  battleResultExp: document.getElementById("battleResultExp"),
  battleResultDropRate: document.getElementById("battleResultDropRate"),
  battleAutoAgainButton: document.getElementById("battle-again-btn"),
  battleCloseResultButton: document.getElementById("close-battle-result-btn"),
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
    experience: 0,
    battleDropRateBonus: 0,
    cardProgress: {},
    autoSalvage: { enabled: false, mutations: { normal: false }, rarityThreshold: "off" },
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

function normalizeCardId(id) {
  return String(id ?? "").trim();
}

function getCardLevelRarityMultiplier(cardOrId) {
  const card = typeof cardOrId === "object" ? cardOrId : getCardById(cardOrId);
  return Number(CARD_RARITY_EXP_MULTIPLIERS[String(card?.rarity || "Common")]) || 1;
}

function getCardLevelExpRequired(cardOrId, level = 1) {
  const safeLevel = Math.max(1, Math.floor(Number(level) || 1));
  return Math.max(1, Math.floor(CARD_LEVEL_BASE_EXP * getCardLevelRarityMultiplier(cardOrId) * safeLevel));
}

function normalizeCardProgressRecords(rawProgress) {
  const output = {};
  if (!rawProgress || typeof rawProgress !== "object" || Array.isArray(rawProgress)) return output;

  for (const [rawId, rawRecord] of Object.entries(rawProgress)) {
    const cardId = normalizeCardId(rawId);
    if (!cardId || !getCardById(cardId)) continue;
    const source = rawRecord && typeof rawRecord === "object" ? rawRecord : {};
    const level = Math.min(CARD_LEVEL_MAX, Math.max(1, Math.floor(Number(source.level) || 1)));
    const exp = Math.max(0, Math.floor(Number(source.exp) || 0));
    output[cardId] = { level, exp };
  }
  return output;
}

function normalizeAutoSalvageSettings(rawSettings) {
  const raw = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const mutationSource = raw.mutations && typeof raw.mutations === "object" ? raw.mutations : {};
  const mutations = { normal: Boolean(mutationSource.normal) };

  if (Array.isArray(MUTATIONS)) {
    for (const mutation of MUTATIONS) {
      const id = normalizeMutationId(mutation?.id);
      if (!id) continue;
      mutations[id] = Boolean(mutationSource[id]);
    }
  }

  const rarityRaw = String(raw.rarityThreshold || raw.rarity || "off");
  const rarityThreshold = AUTO_SALVAGE_RARITY_VALUES.find(value => value.toLowerCase() === rarityRaw.toLowerCase()) || "off";
  return { enabled: Boolean(raw.enabled), mutations, rarityThreshold };
}

function getCardLevelInfo(cardOrId) {
  const card = typeof cardOrId === "object" ? cardOrId : getCardById(cardOrId);
  const cardId = normalizeCardId(card?.id ?? cardOrId);
  const source = state?.cardProgress?.[cardId];
  const level = Math.min(CARD_LEVEL_MAX, Math.max(1, Math.floor(Number(source?.level) || 1)));
  const exp = Math.max(0, Math.floor(Number(source?.exp) || 0));
  const required = getCardLevelExpRequired(card || cardId, level);
  return { cardId, level, exp, required, progress: Math.min(1, required > 0 ? exp / required : 0) };
}

function getCardLevelStatMultiplier(cardOrId) {
  const info = getCardLevelInfo(cardOrId);
  return 1 + Math.max(0, info.level - 1) * CARD_LEVEL_STAT_GROWTH;
}

function ensureCardProgress(cardId) {
  const normalizedId = normalizeCardId(cardId);
  if (!normalizedId || !getCardById(normalizedId)) return null;
  if (!state.cardProgress || typeof state.cardProgress !== "object") state.cardProgress = {};
  if (!state.cardProgress[normalizedId]) state.cardProgress[normalizedId] = { level: 1, exp: 0 };
  return state.cardProgress[normalizedId];
}

function grantCardExperience(cardId, amount) {
  const normalizedId = normalizeCardId(cardId);
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!normalizedId || safeAmount <= 0 || !getCardById(normalizedId)) return { gained: 0, level: getCardLevelInfo(normalizedId).level, levelUps: 0 };

  const progress = ensureCardProgress(normalizedId);
  if (!progress) return { gained: 0, level: 1, levelUps: 0 };

  let remaining = safeAmount;
  let levelUps = 0;
  while (remaining > 0 && progress.level < CARD_LEVEL_MAX) {
    const required = getCardLevelExpRequired(normalizedId, progress.level);
    const needed = Math.max(1, required - progress.exp);
    if (remaining < needed) {
      progress.exp += remaining;
      remaining = 0;
      break;
    }
    remaining -= needed;
    progress.exp = 0;
    progress.level += 1;
    levelUps += 1;
  }

  if (progress.level >= CARD_LEVEL_MAX) {
    progress.level = CARD_LEVEL_MAX;
    progress.exp = 0;
  }
  return { gained: safeAmount, level: progress.level, levelUps };
}

function calculateCardRollExperience(card, mutations = []) {
  const rarityMultiplier = getCardLevelRarityMultiplier(card);
  const mutationMultiplier = getMutationMultiplier(mutations);
  return Math.max(1, Math.floor(8 * rarityMultiplier * mutationMultiplier));
}

function getAutoSalvageMutationMatch(card, mutations = []) {
  const selected = state?.autoSalvage?.mutations || {};
  const safeMutations = normalizeMutationObjects(mutations);
  if (!safeMutations.length) return Boolean(selected.normal);
  return safeMutations.some(mutation => selected[normalizeMutationId(mutation?.id)] === true);
}

function shouldAutoSalvageCard(card, mutations = []) {
  const config = state?.autoSalvage;
  if (!config?.enabled) return false;

  const mutationMatch = getAutoSalvageMutationMatch(card, mutations);
  const threshold = String(config.rarityThreshold || "off");
  const thresholdIndex = AUTO_SALVAGE_RARITY_VALUES.indexOf(threshold);
  const rarityIndex = AUTO_SALVAGE_RARITY_VALUES.indexOf(String(card?.rarity || ""));
  const rarityMatch = threshold !== "off" && thresholdIndex >= 1 && rarityIndex >= 1 && rarityIndex <= thresholdIndex;
  return mutationMatch || rarityMatch;
}

function getSalvageValue(card, mutations = []) {
  const display = getDisplayCard(card, mutations);
  return Math.max(0, Math.floor(Number(display?.reward) || 0));
}

function hasOwn(object, key) {
  return Boolean(object && Object.prototype.hasOwnProperty.call(object, key));
}

function getUnlockedCountById(cardId) {
  const normalizedId = normalizeCardId(cardId);
  if (!normalizedId) return 0;
  const direct = hasOwn(state?.unlocked, normalizedId) ? state.unlocked[normalizedId] : 0;
  return Math.max(0, Math.floor(Number(direct) || 0));
}

function normalizeCardMutations(rawCardOrMutation) {
  // Canonical mutation normalizer used by card definitions, legacy inventory,
  // mutation filters, previews, and UI badges. It always returns string IDs.
  let rawValue = rawCardOrMutation;

  if (
    rawCardOrMutation &&
    typeof rawCardOrMutation === "object" &&
    !Array.isArray(rawCardOrMutation)
  ) {
    if (Object.prototype.hasOwnProperty.call(rawCardOrMutation, "mutation")) {
      rawValue = rawCardOrMutation.mutation;
    } else if (Object.prototype.hasOwnProperty.call(rawCardOrMutation, "mutationIds")) {
      rawValue = rawCardOrMutation.mutationIds;
    } else if (Object.prototype.hasOwnProperty.call(rawCardOrMutation, "mutations")) {
      rawValue = rawCardOrMutation.mutations;
    } else {
      rawValue = [];
    }
  }

  const values = Array.isArray(rawValue)
    ? rawValue
    : rawValue == null
      ? []
      : [rawValue];

  const normalized = [];

  for (const value of values) {
    let token = value;

    if (token && typeof token === "object") {
      token = token.id ?? token.name ?? token.mutation ?? "";
    }

    const parts = String(token ?? "")
      .split(/[,+]/g)
      .map(part => part.trim())
      .filter(Boolean);

    for (const part of parts) {
      const normalizedId = normalizeMutationId(part);
      if (normalizedId && !normalized.includes(normalizedId)) {
        normalized.push(normalizedId);
      }
    }
  }

  return normalized;
}

function normalizeMutationIdList(rawMutationIds) {
  return normalizeCardMutations(rawMutationIds);
}

function inventoryVariantKey(cardId, mutationIds = []) {
  return canonicalVariantKey(normalizeCardId(cardId), Array.isArray(mutationIds) ? mutationIds : []);
}

function normalizeInventoryRecords(rawInventory) {
  const output = {};
  const add = (rawCardId, rawMutationIds, rawCount, rawVariantKey = "") => {
    let cardId = normalizeCardId(rawCardId);
    let mutationIds = normalizeMutationIdList(rawMutationIds);

    const parsed = typeof rawVariantKey === "string" ? parseVariantKey(rawVariantKey) : null;
    if ((!cardId || !mutationIds.length) && parsed) {
      cardId = normalizeCardId(parsed.cardId);
      if (!mutationIds.length) mutationIds = normalizeMutationIdList(parsed.mutations);
    }
    if (!cardId) return;

    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!count) return;

    const key = inventoryVariantKey(cardId, mutationIds);
    const previous = output[key]?.count || 0;
    output[key] = {
      id: cardId,
      cardId,
      mutation: mutationIds.join("+"),
      mutationIds: [...new Set(mutationIds)],
      count: previous + count
    };
  };

  if (Array.isArray(rawInventory)) {
    for (const entry of rawInventory) {
      if (!entry || typeof entry !== "object") continue;
      const variantKey = entry.variantKey || entry.key || "";
      const mutationIds = normalizeCardMutations({
        mutationIds: entry.mutationIds ?? undefined,
        mutations: entry.mutations ?? undefined,
        mutation: entry.mutation ?? undefined
      });
      add(entry.cardId ?? entry.id, mutationIds, entry.count, variantKey);
    }
    return output;
  }

  if (!rawInventory || typeof rawInventory !== "object") return output;

  for (const [rawKey, rawEntry] of Object.entries(rawInventory)) {
    if (rawEntry && typeof rawEntry === "object" && !Array.isArray(rawEntry)) {
      const mutationIds = normalizeCardMutations({
        mutationIds: rawEntry.mutationIds ?? undefined,
        mutations: rawEntry.mutations ?? undefined,
        mutation: rawEntry.mutation ?? undefined
      });
      add(
        rawEntry.cardId ?? rawEntry.id ?? rawKey,
        mutationIds,
        rawEntry.count,
        rawEntry.variantKey || rawEntry.key || rawKey
      );
    } else {
      add(rawKey, [], rawEntry, rawKey);
    }
  }

  return output;
}

function getInventoryEntries() {
  const inventory = state?.inventory;
  if (!inventory || typeof inventory !== "object") return [];
  if (Array.isArray(inventory)) return inventory;
  return Object.values(inventory);
}

function getInventoryCountById(cardId) {
  const target = normalizeCardId(cardId);
  if (!target) return 0;
  return getInventoryEntries().reduce((sum, entry) => {
    if (!entry || typeof entry !== "object") return sum;
    const entryId = normalizeCardId(entry.cardId ?? entry.id);
    return sum + (entryId === target ? Math.max(0, Math.floor(Number(entry.count) || 0)) : 0);
  }, 0);
}

function isCardOwned(cardId) {
  const target = normalizeCardId(cardId);
  if (!target) return false;
  return hasOwn(state?.unlocked, target) && getUnlockedCountById(target) > 0
    || getInventoryCountById(target) > 0
    || getVariantEntries(target).some(entry => entry.count > 0);
}

function syncOwnershipRecords() {
  const normalizedUnlocked = {};
  for (const [rawId, rawCount] of Object.entries(state?.unlocked || {})) {
    const cardId = normalizeCardId(rawId);
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!cardId || count <= 0) continue;
    normalizedUnlocked[cardId] = Math.max(normalizedUnlocked[cardId] || 0, count);
  }

  const normalizedInventory = normalizeInventoryRecords(state?.inventory);
  const mutationCounts = {};

  for (const [rawKey, rawCount] of Object.entries(state?.mutations || {})) {
    const parsed = parseVariantKey(String(rawKey));
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!parsed || count <= 0) continue;
    const key = inventoryVariantKey(parsed.cardId, parsed.mutations.map(mutation => mutation.id));
    mutationCounts[key] = Math.max(mutationCounts[key] || 0, count);
  }

  for (const [key, entry] of Object.entries(normalizedInventory)) {
    mutationCounts[key] = Math.max(mutationCounts[key] || 0, entry.count);
  }

  const mergedMutations = {};
  for (const [key, count] of Object.entries(mutationCounts)) {
    if (count > 0) mergedMutations[key] = count;
    const parsed = parseVariantKey(key);
    if (parsed) normalizedUnlocked[normalizeCardId(parsed.cardId)] = Math.max(
      normalizedUnlocked[normalizeCardId(parsed.cardId)] || 0,
      count
    );
  }

  // Rebuild one canonical inventory entry per card + mutation combination.
  const canonicalInventory = {};
  for (const [key, count] of Object.entries(mergedMutations)) {
    const parsed = parseVariantKey(key);
    if (!parsed || count <= 0) continue;
    const cardId = normalizeCardId(parsed.cardId);
    canonicalInventory[key] = {
      id: cardId,
      cardId,
      mutation: parsed.mutations.map(mutation => normalizeMutationId(mutation.id)).join("+"),
      mutationIds: parsed.mutations.map(mutation => normalizeMutationId(mutation.id)),
      count
    };
  }

  // Keep any legacy inventory-only card copies even if their variant key could
  // not be interpreted, without allowing duplicate array/object records.
  for (const entry of Object.values(normalizedInventory)) {
    const cardId = normalizeCardId(entry?.cardId ?? entry?.id);
    if (!cardId || !(Number(entry?.count) > 0)) continue;
    const ids = Array.isArray(entry.mutationIds) ? entry.mutationIds : [];
    const key = inventoryVariantKey(cardId, ids);
    if (!canonicalInventory[key]) {
      canonicalInventory[key] = {
        id: cardId,
        cardId,
        mutation: ids.join("+"),
        mutationIds: [...new Set(ids)],
        count: Math.max(0, Math.floor(Number(entry.count) || 0))
      };
    }
  }

  state.unlocked = normalizedUnlocked;
  state.mutations = mergedMutations;
  state.inventory = canonicalInventory;
}

function normalizeMutationId(id) {
  const safe = String(id ?? "").trim().toLowerCase();
  if (!safe || safe === "base" || safe === "normal") return "";

  const alias = MUTATION_ID_ALIASES[safe];
  if (alias) return alias;

  const direct = MUTATION_BY_ID?.[safe];
  if (direct?.id) return String(direct.id).trim().toLowerCase();

  const matched = Array.isArray(MUTATIONS)
    ? MUTATIONS.find(mutation => {
        const mutationId = String(mutation?.id ?? "").trim().toLowerCase();
        const mutationName = String(mutation?.name ?? "").trim().toLowerCase();
        const className = String(mutation?.className ?? "").trim().toLowerCase();
        return safe === mutationId || safe === mutationName || safe === className;
      })
    : null;

  return matched?.id
    ? String(matched.id).trim().toLowerCase()
    : safe;
}

function canonicalVariantKey(cardId, mutationIds) {
  const normalizedCardId = normalizeCardId(cardId);
  const ids = normalizeCardMutations(mutationIds)
    .map(normalizeMutationId)
    .filter(Boolean)
    .filter((id, index, list) => list.indexOf(id) === index)
    .sort((a, b) => {
      const rankA = MUTATION_BY_ID?.[a]?.tier?.rank ?? 0;
      const rankB = MUTATION_BY_ID?.[b]?.tier?.rank ?? 0;
      return rankA - rankB || a.localeCompare(b);
    });
  return `${normalizedCardId}|${ids.join("+") || "base"}`;
}

function migrateMutationRecords(rawMutations, unlocked) {
  const output = {};
  if (rawMutations && typeof rawMutations === "object" && !Array.isArray(rawMutations)) {
    for (const [rawKey, rawCount] of Object.entries(rawMutations)) {
      const count = Math.max(0, Math.floor(Number(rawCount) || 0));
      if (!count) continue;
      const parsed = parseVariantKey(String(rawKey));
      if (!parsed) continue;
      const key = canonicalVariantKey(normalizeCardId(parsed.cardId), parsed.mutations.map(mutation => mutation.id));
      output[key] = (output[key] || 0) + count;
    }
  }

  // Older saves only had total unlocked counts. When variant records exist,
  // the base count is the remaining total after non-base variants; never add
  // the full unlocked total again or every mutation roll gets duplicated.
  const nonBaseTotals = {};
  for (const [key, count] of Object.entries(output)) {
    const parsed = parseVariantKey(key);
    if (!parsed || !parsed.mutations.length) continue;
    const cardId = normalizeCardId(parsed.cardId);
    nonBaseTotals[cardId] = (nonBaseTotals[cardId] || 0) + count;
  }

  for (const [rawCardId, rawCount] of Object.entries(unlocked || {})) {
    const cardId = normalizeCardId(rawCardId);
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!cardId || !count) continue;
    const baseKey = canonicalVariantKey(cardId, []);
    const remainingBase = Math.max(0, count - (nonBaseTotals[cardId] || 0));
    if (remainingBase > 0) output[baseKey] = Math.max(output[baseKey] || 0, remainingBase);
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

  normalized.experience = Number.isFinite(Number(parsed.experience))
    ? Math.max(0, Math.floor(Number(parsed.experience)))
    : 0;

  normalized.battleDropRateBonus = Number.isFinite(Number(parsed.battleDropRateBonus))
    ? Math.max(0, Math.min(100, Number(parsed.battleDropRateBonus)))
    : 0;

  normalized.cardProgress = normalizeCardProgressRecords(parsed.cardProgress || parsed.cardLevels || parsed.levels);
  normalized.autoSalvage = normalizeAutoSalvageSettings(parsed.autoSalvage || parsed.autoDelete || parsed.autoSalvageSettings);

  const rawUnlockedSource = (
    parsed.unlocked &&
    typeof parsed.unlocked === "object"
  ) ? parsed.unlocked : parsed.unlockedCards;

  normalized.unlocked = {};

  // Support both canonical object saves and older array-style unlockedCards.
  if (Array.isArray(rawUnlockedSource)) {
    for (const rawId of rawUnlockedSource) {
      const cardId = normalizeCardId(rawId);
      if (!cardId) continue;
      normalized.unlocked[cardId] = (normalized.unlocked[cardId] || 0) + 1;
    }
  } else if (rawUnlockedSource && typeof rawUnlockedSource === "object") {
    for (const [rawId, rawCount] of Object.entries(rawUnlockedSource)) {
      const cardId = normalizeCardId(rawId);
      const count = rawCount === true ? 1 : Math.max(0, Math.floor(Number(rawCount) || 0));
      if (cardId && count > 0) {
        normalized.unlocked[cardId] = Math.max(normalized.unlocked[cardId] || 0, count);
      }
    }
  }

  delete normalized.unlockedCards;

  // Normalize all legacy inventory layouts (array or object) into one stable
  // cardId + mutation keyed object. This is deliberately type-safe so number
  // IDs and string IDs converge to the same persistent key.
  normalized.inventory = normalizeInventoryRecords(parsed.inventory);

  // Inventory is a first-class ownership source. Any positive-count entry
  // must immediately repair the parent unlocked record using a normalized ID.
  // This is the critical guard against old numeric/string ID desyncs.
  for (const entry of Object.values(normalized.inventory)) {
    const cardId = normalizeCardId(entry?.cardId ?? entry?.id);
    const count = Math.max(0, Math.floor(Number(entry?.count) || 0));
    if (!cardId || count <= 0) continue;
    normalized.unlocked[cardId] = Math.max(normalized.unlocked[cardId] || 0, count);
  }

  // Inventory entries are ownership records too. Merge exact variants by
  // maximum, not addition, so legacy saves are repaired without duplicating
  // the same physical copies.
  const inventoryMutationRecords = {};
  for (const entry of Object.values(normalized.inventory)) {
    const cardId = normalizeCardId(entry?.cardId ?? entry?.id);
    if (!cardId) continue;
    const mutationIds = Array.isArray(entry?.mutationIds) ? entry.mutationIds : [];
    const key = inventoryVariantKey(cardId, mutationIds);
    const count = Math.max(0, Math.floor(Number(entry?.count) || 0));
    if (count > 0) inventoryMutationRecords[key] = Math.max(inventoryMutationRecords[key] || 0, count);
  }

  const mergedRawMutations = {};
  for (const [key, count] of Object.entries(parsed.mutations || {})) {
    const parsedVariant = parseVariantKey(String(key));
    const safeCount = Math.max(0, Math.floor(Number(count) || 0));
    if (!parsedVariant || safeCount <= 0) continue;
    const canonicalKey = inventoryVariantKey(parsedVariant.cardId, parsedVariant.mutations.map(mutation => mutation.id));
    mergedRawMutations[canonicalKey] = Math.max(mergedRawMutations[canonicalKey] || 0, safeCount);
  }
  for (const [key, count] of Object.entries(inventoryMutationRecords)) {
    mergedRawMutations[key] = Math.max(mergedRawMutations[key] || 0, count);
  }

  normalized.mutations = migrateMutationRecords(mergedRawMutations, normalized.unlocked);

  // Mutation variants can outlive a parent unlocked count in old saves.
  // Reconstruct the parent count from the canonical variants before saving.
  const mutationTotalsByCard = {};
  for (const [variantKey, rawCount] of Object.entries(normalized.mutations)) {
    const parsedVariant = parseVariantKey(String(variantKey));
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (!parsedVariant || count <= 0) continue;
    const cardId = normalizeCardId(parsedVariant.cardId);
    mutationTotalsByCard[cardId] = (mutationTotalsByCard[cardId] || 0) + count;
  }
  for (const [cardId, variantCount] of Object.entries(mutationTotalsByCard)) {
    normalized.unlocked[cardId] = Math.max(normalized.unlocked[cardId] || 0, variantCount);
  }

  // Inventory totals are another ownership proof. Never let an inventory-only
  // copy render as locked after a save/load cycle.
  for (const entry of Object.values(normalized.inventory)) {
    const cardId = normalizeCardId(entry?.cardId ?? entry?.id);
    const count = Math.max(0, Math.floor(Number(entry?.count) || 0));
    if (cardId && count > 0) {
      normalized.unlocked[cardId] = Math.max(normalized.unlocked[cardId] || 0, count);
    }
  }

  normalized.equipment = Array.isArray(parsed.equipment) ? [...parsed.equipment] : [];

  normalized.upgrades.rollSpeed = Math.min(
    SPEED_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.rollSpeed) || 0))
  );
  normalized.upgrades.luck = Math.min(
    LUCK_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.luck) || 0))
  );

  normalized.lastResultId = parsed.lastResultId != null
    ? normalizeCardId(parsed.lastResultId) || null
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
      "experience",
      "battleDropRateBonus",
      "cardProgress",
      "cardLevels",
      "autoSalvage",
      "autoDelete",
      "unlocked",
      "unlockedCards",
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
    if (primary) {
      const loaded = normalizeState(primary);
      return loaded;
    }

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
    syncOwnershipRecords();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Save failed:", error);
  }
}

// Stable public persistence aliases. Both paths use the same canonical ID
// sanitizer so future UI code cannot bypass the repaired save/load flow.
function saveGame() {
  saveState();
}

function loadGame() {
  state = loadState();
  syncOwnershipRecords();
  saveState();
  return state;
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
  return [...ALL_CARDS]
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

  return selected
    .filter(mutation => mutation && MUTATION_BY_ID?.[normalizeMutationId(mutation?.id)])
    .sort((a, b) => {
      const rankA = MUTATION_BY_ID?.[normalizeMutationId(a?.id)]?.tier?.rank ?? 0;
      const rankB = MUTATION_BY_ID?.[normalizeMutationId(b?.id)]?.tier?.rank ?? 0;
      return rankA - rankB;
    });
}

function getVariantKey(cardId, mutations) {
  return canonicalVariantKey(normalizeCardId(cardId), normalizeCardMutations(mutations));
}

function parseVariantKey(key) {
  const safeKey = String(key ?? "");
  const separator = safeKey.indexOf("|");
  if (separator < 0) return null;

  const cardId = normalizeCardId(safeKey.slice(0, separator));
  const raw = safeKey.slice(separator + 1);
  const ids = normalizeCardMutations(raw === "base" ? [] : raw);

  return {
    key: canonicalVariantKey(cardId, ids),
    cardId,
    mutationIds: ids,
    mutations: ids.map(id => MUTATION_BY_ID?.[id]).filter(Boolean)
  };
}

function normalizeMutationObjects(rawMutations) {
  const ids = normalizeCardMutations(rawMutations);
  return ids.map(id => MUTATION_BY_ID?.[id]).filter(Boolean);
}

function getMutationMultiplier(mutations) {
  return normalizeMutationObjects(mutations)
    .reduce((multiplier, mutation) => multiplier * (Number(mutation?.multiplier) || 1), 1);
}

function getDisplayCard(card, mutations = []) {
  const safeMutations = normalizeMutationObjects(mutations);
  const mutationMultiplier = getMutationMultiplier(safeMutations);
  const levelInfo = getCardLevelInfo(card);
  const levelMultiplier = getCardLevelStatMultiplier(card);
  const prefix = safeMutations
    .map(mutation => String(mutation?.name || ""))
    .filter(Boolean)
    .map(name => `[${name}]`)
    .join(" ");
  return {
    name: prefix ? `${prefix} ${String(card?.name || "Unknown Card")}` : String(card?.name || "Unknown Card"),
    hp: Math.max(0, Math.round((Number(card?.stats?.hp) || 0) * mutationMultiplier * levelMultiplier)),
    atk: Math.max(0, Math.round((Number(card?.stats?.atk) || 0) * mutationMultiplier * levelMultiplier)),
    reward: Math.max(0, Math.floor(calculateCardReward(Number(card?.chance) || 0) * mutationMultiplier)),
    level: levelInfo.level,
    exp: levelInfo.exp,
    expRequired: levelInfo.required,
    expProgress: levelInfo.progress
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
  const safeMutations = normalizeMutationObjects(mutations);
  const stops = [];
  safeMutations.forEach((mutation, index) => {
    const primary = getMutationAccent(mutation, index);
    const secondary = mutation?.secondaryColor;
    stops.push(primary);
    if (secondary && safeMutations.length === 1) stops.push(secondary);
  });
  return stops.length ? stops : ["#ffffff"];
}

function getMutationGradient(mutations) {
  const safeMutations = normalizeMutationObjects(mutations);
  if (!safeMutations.length) return "";
  const colors = getMutationColorStops(safeMutations);
  if (colors.length === 1) return colors[0];
  const step = 100 / (colors.length - 1);
  return `linear-gradient(135deg, ${colors.map((color, index) => `${color} ${Math.round(index * step)}%`).join(", ")})`;
}

function getMutationGlow(mutations) {
  const safeMutations = normalizeMutationObjects(mutations);
  if (!safeMutations.length) return "#7d5cff";
  const accents = safeMutations.map((mutation, index) => getMutationAccent(mutation, index));
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
  const safeMutations = normalizeMutationObjects(mutations);

  const mutationClasses = MUTATIONS.map(mutation => mutation?.className).filter(Boolean);
  cardElement.classList.remove(...mutationClasses, "has-mutation", "mutation-multi");

  if (safeMutations.length) {
    cardElement.classList.add("has-mutation");
    safeMutations.forEach(mutation => {
      if (mutation?.className) cardElement.classList.add(String(mutation.className));
    });
    if (safeMutations.length >= 2) cardElement.classList.add("mutation-multi");
  }

  applyMutationStyleTokens(cardElement, safeMutations);
}

function renderMutationBadges(container, mutations) {
  if (!container) return;
  const safeMutations = normalizeMutationObjects(mutations);
  container.innerHTML = "";

  if (!safeMutations.length) {
    const normal = document.createElement("span");
    normal.className = "mutation-badge mutation-normal";
    normal.textContent = "NORMAL";
    container.appendChild(normal);
    return;
  }

  const badge = document.createElement("span");
  const isMulti = safeMutations.length > 1;
  badge.className = `mutation-badge ${isMulti ? "mutation-multi" : (safeMutations[0]?.className || "")}`;
  badge.textContent = safeMutations.map(mutation => String(mutation?.name || "UNKNOWN")).join(" + ").toUpperCase();
  applyMutationStyleTokens(badge, safeMutations);
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
      const cardId = normalizeCardId(result.card.id);
      const rollExp = calculateCardRollExperience(result.card, mutations);
      const levelResult = grantCardExperience(cardId, rollExp);
      const autoSalvaged = shouldAutoSalvageCard(result.card, mutations);

      state.lastResultId = cardId;

      if (autoSalvaged) {
        const salvageValue = getSalvageValue(result.card, mutations);
        state.currency = Math.max(0, Number(state.currency) || 0) + salvageValue;
        showResult(result.card, result.effectiveChance, mutations);
        showRewardToast(salvageValue, mutations);
        if (els.rewardToast) {
          els.rewardToast.textContent = `🗑 AUTO-SALVAGED • +${formatCurrency(salvageValue)} • +${levelResult.gained} EXP`;
        }
      } else {
        state.unlocked[cardId] = getUnlockedCountById(cardId) + 1;
        state.mutations[variantKey] = (state.mutations[variantKey] || 0) + 1;
        const inventoryEntry = state.inventory[variantKey];
        if (inventoryEntry) {
          inventoryEntry.count = Math.max(0, Math.floor(Number(inventoryEntry.count) || 0)) + 1;
        } else {
          const mutationIds = mutations.map(mutation => normalizeMutationId(mutation.id));
          state.inventory[variantKey] = {
            id: cardId,
            cardId,
            mutation: mutationIds.join("+"),
            mutationIds,
            count: 1
          };
        }
        showResult(result.card, result.effectiveChance, mutations);
        showRewardToast(0, mutations);
        if (els.rewardToast) {
          const mutationText = normalizeMutationObjects(mutations).map(mutation => String(mutation?.name || "")).filter(Boolean).join(" + ");
          els.rewardToast.textContent = `${mutationText ? `✦ ${mutationText} • ` : ""}CARD ACQUIRED • +${levelResult.gained} EXP`;
        }
      }
    } else {
      state.lastResultId = null;
      showMiss(result.score);
    }

    saveState();
    updateStats();
    if (source === "auto") {
      // Auto-Roll can fire while the player is typing/searching Collection.
      // Defer the DOM rebuild so the active grid/search state is untouched.
      collectionNeedsRefresh = true;
    } else {
      collectionNeedsRefresh = false;
      renderCollection();
    }
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
  const safeMutations = normalizeMutationObjects(mutations);
  const prefix = safeMutations.length
    ? `✦ ${safeMutations.map(mutation => String(mutation?.name || "")).filter(Boolean).join(" + ")} • `
    : "";
  els.rewardToast.textContent = `${prefix}+${formatCurrency(reward)}`;
  els.rewardToast.classList.remove("show");
  void els.rewardToast.offsetWidth;
  els.rewardToast.classList.add("show");
  toastTimer = window.setTimeout(() => els.rewardToast.classList.remove("show"), 1500);
}

function setArtwork(img, fallback, backdrop, src, alt) {
  const safeSrc = src || FALLBACK_ART_DATA_URL;
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
  return ALL_CARDS.filter(card => getOwnedCardCount(card.id) > 0).length;
}

function getVariantEntries(cardId) {
  const targetId = normalizeCardId(cardId);
  if (!targetId) return [];

  // Merge both canonical variant stores by maximum count. They represent the
  // same physical ownership records, so summing them would double the cards.
  const merged = new Map();

  for (const [rawKey, rawCount] of Object.entries(state?.mutations || {})) {
    const count = Math.max(0, Math.floor(Number(rawCount) || 0));
    if (count <= 0) continue;
    const parsed = parseVariantKey(String(rawKey));
    if (!parsed || normalizeCardId(parsed.cardId) !== targetId) continue;
    const key = canonicalVariantKey(targetId, parsed.mutations.map(mutation => mutation?.id));
    merged.set(key, {
      count: Math.max(merged.get(key)?.count || 0, count),
      mutations: parsed.mutations
    });
  }

  for (const entry of getInventoryEntries()) {
    const entryId = normalizeCardId(entry?.cardId ?? entry?.id);
    const count = Math.max(0, Math.floor(Number(entry?.count) || 0));
    if (!entryId || entryId !== targetId || count <= 0) continue;

    const mutationIds = normalizeCardMutations(
      entry?.mutationIds ?? entry?.mutations ?? entry?.mutation
    );
    const key = canonicalVariantKey(targetId, mutationIds);
    const mutations = mutationIds.map(id => MUTATION_BY_ID[id]).filter(Boolean);
    const existing = merged.get(key);
    merged.set(key, {
      count: Math.max(existing?.count || 0, count),
      mutations: existing?.mutations?.length ? existing.mutations : mutations
    });
  }

  return [...merged.entries()]
    .map(([key, entry]) => ({
      key,
      count: Math.max(0, Math.floor(Number(entry.count) || 0)),
      mutations: Array.isArray(entry.mutations) ? entry.mutations.filter(Boolean) : [],
      isMulti: Array.isArray(entry.mutations) && entry.mutations.length >= 2
    }))
    .filter(entry => entry.count > 0)
    .sort((a, b) => getVariantRank(a) - getVariantRank(b) || a.key.localeCompare(b.key));
}

function getVariantRank(entry) {
  const safeMutations = Array.isArray(entry?.mutations) ? entry.mutations.filter(Boolean) : [];
  return entry?.isMulti || safeMutations.length >= 2
    ? MUTATION_TIERS.multi.rank
    : safeMutations[0]?.tier?.rank ?? MUTATION_TIERS.normal.rank;
}

function getCardMutationProfile(cardId) {
  const normalizedId = normalizeCardId(cardId);
  const card = getCardById(normalizedId);
  const variants = getVariantEntries(normalizedId);
  const ids = new Set();
  let hasMulti = false;
  let rank = MUTATION_TIERS.normal.rank;

  // Base card metadata is optional legacy/future data. Normalize it without
  // allowing malformed mutation values to break Collection rendering.
  const baseMutationIds = normalizeCardMutations(card?.mutation);
  for (const mutationId of baseMutationIds) {
    const mutation = MUTATION_BY_ID?.[mutationId];
    if (mutation?.id) {
      ids.add(mutation.id);
      rank = Math.max(rank, mutation?.tier?.rank ?? MUTATION_TIERS.normal.rank);
    }
  }
  if (baseMutationIds.length >= 2) {
    hasMulti = true;
    rank = MUTATION_TIERS.multi.rank;
  }

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
  const normalizedId = normalizeCardId(cardId);
  const profile = getCardMutationProfile(normalizedId);
  const mutations = profile.mutationIds
    .map(id => MUTATION_BY_ID?.[normalizeMutationId(id)])
    .filter(mutation => Boolean(mutation?.id))
    .sort((a, b) => {
      const rankA = Number(a?.tier?.rank) || 0;
      const rankB = Number(b?.tier?.rank) || 0;
      return rankA - rankB;
    });

  return {
    profile,
    gradient: getMutationGradient(mutations),
    glow: getMutationGlow(mutations),
    classes: [...new Set(mutations.map(mutation => String(mutation?.className || "")).filter(Boolean))]
      .concat(profile.hasMulti ? ["mutation-multi"] : [])
  };
}

function cardMatchesMutationFilter(card, filterValue) {
  const normalizedFilter = String(filterValue || "all").trim().toLowerCase();
  if (normalizedFilter === "all") return true;

  try {
    const cardId = normalizeCardId(card?.id);
    if (!cardId || !isCardOwned(cardId)) return false;

    // IMPORTANT: ALL_CARDS contains base definitions; mutation ownership lives in
    // the canonical inventory/mutation variant records. Always filter from the
    // owned variants rather than base card metadata.
    const variants = getVariantEntries(cardId);

    if (normalizedFilter === "normal") {
      return variants.some(entry => entry?.count > 0 && !entry.mutations?.length);
    }

    if (normalizedFilter === "multi") {
      return variants.some(entry => entry?.count > 0 && entry.isMulti);
    }

    if (normalizedFilter === "active") {
      const activeMutationIds = new Set(
        getActiveWeatherDefinitions()
          .map(weather => normalizeMutationId(weather?.mutation?.id))
          .filter(Boolean)
      );
      return variants.some(entry =>
        entry?.count > 0 &&
        entry.mutations?.some(mutation => activeMutationIds.has(normalizeMutationId(mutation?.id)))
      );
    }

    const targetMutationId = normalizeMutationId(normalizedFilter);
    if (!targetMutationId) return false;

    return variants.some(entry =>
      entry?.count > 0 &&
      entry.mutations?.some(mutation => normalizeMutationId(mutation?.id) === targetMutationId)
    );
  } catch (error) {
    console.warn("Collection mutation filter skipped malformed ownership data:", card?.id, error);
    return false;
  }
}

function getFilteredCards() {
  const query = String(els.searchInput?.value || "").trim().toLowerCase();
  const filter = String(els.mutationFilter?.value || "all").toLowerCase();
  const sort = String(els.sortSelect?.value || "dropChance").toLowerCase();

  const filteredCards = ALL_CARDS.filter(card => {
    try {
      const normalizedId = normalizeCardId(card?.id);
      const safeName = String(card?.name || "Unknown Card");
      const safePassive = String(card?.passive?.name || "");
      const profile = getCardMutationProfile(normalizedId);
      const ownedMutationText = profile.variants
        .flatMap(entry => (entry?.mutations || []).map(mutation => String(mutation?.name || "")));
      const baseMutationText = normalizeCardMutations(card)
        .map(id => String(MUTATION_BY_ID?.[id]?.name || id));
      const mutationText = [...ownedMutationText, ...baseMutationText].join(" ").toLowerCase();

      const searchText = `${safeName} ${safePassive} ${mutationText}`.toLowerCase();
      const searchMatch = !query || searchText.includes(query);

      return searchMatch && cardMatchesMutationFilter({ ...card, id: normalizedId }, filter);
    } catch (error) {
      // Filtering one malformed card must never abort the full collection.
      console.warn("Collection filter skipped malformed card metadata:", card?.id, error);
      const fallbackText = `${String(card?.name || "")} ${String(card?.passive?.name || "")}`.toLowerCase();
      if (!query && filter === "all") return true;
      return filter === "all" && fallbackText.includes(query);
    }
  });

  // NEVER sort the base ALL_CARDS array. Always sort a fresh shallow copy.
  const sortedCards = [...filteredCards].sort((a, b) => {
    try {
      const chanceA = Number.isFinite(Number(a?.chance)) ? Number(a.chance) : 0;
      const chanceB = Number.isFinite(Number(b?.chance)) ? Number(b.chance) : 0;
      const nameA = String(a?.name || "Unknown Card");
      const nameB = String(b?.name || "Unknown Card");

      if (sort === "name") return nameA.localeCompare(nameB);
      if (sort === "atk") return (Number(b?.stats?.atk) || 0) - (Number(a?.stats?.atk) || 0);
      if (sort === "collected") return getOwnedCardCount(b?.id) - getOwnedCardCount(a?.id) || nameA.localeCompare(nameB);

      // Default + dropChance: numeric hardest-first ordering.
      return chanceB - chanceA || nameA.localeCompare(nameB);
    } catch (error) {
      console.warn("Collection sort skipped malformed card metadata:", a?.id, b?.id, error);
      return 0;
    }
  });

  return sortedCards;
}

function getAvailableRollPool() {
  return [...ALL_CARDS]
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
  const targetId = normalizeCardId(cardId);
  if (!targetId) return 0;
  const directCount = getUnlockedCountById(targetId);
  const inventoryCount = getInventoryCountById(targetId);
  const variantCount = getVariantEntries(targetId).reduce((sum, entry) => sum + entry.count, 0);
  return Math.max(directCount, inventoryCount, variantCount);
}

function renderCollection() {
  if (!els.collectionGrid) return;
  els.collectionGrid.innerHTML = "";

  let cards = [];
  try {
    cards = getFilteredCards();
  } catch (error) {
    console.warn("Collection filter failed safely:", error);
  }

  for (const card of cards) {
    try {
      const cardId = normalizeCardId(card?.id);
      if (!cardId) continue;

      const owned = isCardOwned(cardId);
      const count = getOwnedCardCount(cardId);
      const safeName = String(card?.name || "Unknown Card");
      const chance = Number.isFinite(Number(card?.chance)) ? Number(card.chance) : 0;
      const image = String(card?.image || FALLBACK_ART_DATA_URL);
      const visuals = getCardMutationVisuals(cardId);
      const profile = visuals.profile;

      const item = document.createElement("button");
      item.type = "button";
      item.className = [
        "collection-card",
        owned ? "" : "locked",
        profile.variants.length ? "has-mutation-glow" : "",
        ...visuals.classes
      ].filter(Boolean).join(" ");
      item.style.setProperty("--collection-mutation-gradient", visuals.gradient || "transparent");
      item.style.setProperty("--collection-mutation-glow", visuals.glow || "#7d5cff");
      item.title = owned
        ? `Owned ${count}× • Open dedicated preview`
        : `Undiscovered • 1 in ${chance.toLocaleString("en-US")}`;

      const art = document.createElement("div");
      art.className = "collection-mini__art";
      art.style.setProperty("--art-bg-image", `url("${escapeCssUrl(image)}")`);

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
      title.textContent = owned ? safeName : "Undiscovered Card";

      const tier = document.createElement("span");
      tier.className = "collection-tier-label";
      tier.textContent = profile.tier?.name || "Normal";

      const countBadge = document.createElement("span");
      countBadge.className = "collection-mini__count";
      countBadge.textContent = owned ? `x${count.toLocaleString("en-US")}` : "";
      countBadge.setAttribute("aria-label", owned ? `${count} copies owned` : "");

      titleRow.append(title, countBadge, tier);

      const meta = document.createElement("div");
      meta.className = "collection-mini__meta";
      const rate = document.createElement("span");
      rate.className = "collection-mini__rate";
      rate.textContent = `1 in ${chance.toLocaleString("en-US")}`;
      meta.append(rate);

      if (card?.requiredWeather) {
        const requirement = document.createElement("span");
        requirement.className = `weather-requirement ${isWeatherActive(card.requiredWeather) ? "active" : ""}`;
        requirement.textContent = `Requires ${getWeatherByReference(card.requiredWeather)?.name || card.requiredWeather}`;
        meta.appendChild(requirement);
      }

      const badgeList = document.createElement("div");
      badgeList.className = "mutation-badge-list";
      badgeList.setAttribute("aria-label", "Unlocked mutation variants");

      const normalizedCardMutations = normalizeCardMutations(card?.mutation);
      const variants = owned ? profile.variants : [];
      if (variants.length) {
        variants.forEach(entry => {
          const badge = document.createElement("span");
          const safeMutations = Array.isArray(entry?.mutations) ? entry.mutations.filter(Boolean) : [];
          const safeMutationClasses = safeMutations.map(mutation => String(mutation?.className || "")).filter(Boolean);
          badge.className = [
            "collection-mutation-badge",
            entry?.isMulti ? "mutation-multi" : "",
            ...safeMutationClasses
          ].filter(Boolean).join(" ");
          const safeMutationNames = safeMutations.map(mutation => String(mutation?.name || "")).filter(Boolean);
          badge.textContent = `${safeMutationNames.length ? safeMutationNames.join(" + ") : "Normal"} ×${Math.max(0, Number(entry?.count) || 0).toLocaleString("en-US")}`;
          applyMutationStyleTokens(badge, safeMutations);
          badgeList.appendChild(badge);
        });
      } else {
        const badge = document.createElement("span");
        const fallbackMutationNames = normalizedCardMutations
          .map(id => String(MUTATION_BY_ID?.[id]?.name || id))
          .filter(Boolean);

        badge.className = [
          "collection-mutation-badge",
          fallbackMutationNames.length >= 2 ? "mutation-multi" : "",
          fallbackMutationNames.length === 1
            ? String(MUTATION_BY_ID?.[normalizedCardMutations[0]]?.className || "")
            : ""
        ].filter(Boolean).join(" ");

        badge.textContent = owned
          ? `${fallbackMutationNames.length ? fallbackMutationNames.join(" + ") : "Normal"} ×${Math.max(0, Number(count) || 0).toLocaleString("en-US")}`
          : "LOCKED";

        applyMutationStyleTokens(
          badge,
          normalizedCardMutations.map(id => MUTATION_BY_ID?.[id]).filter(Boolean)
        );
        badgeList.appendChild(badge);
      }

      const levelInfo = owned ? getCardLevelInfo(cardId) : { level: 0, exp: 0, required: 1, progress: 0 };
      const levelWrap = document.createElement("div");
      levelWrap.className = "card-level-mini";
      const levelLabel = document.createElement("span");
      levelLabel.className = "card-level-mini__label";
      levelLabel.textContent = owned ? `Lv. ${levelInfo.level}` : "Lv. —";
      const expText = document.createElement("span");
      expText.className = "card-level-mini__exp";
      expText.textContent = owned ? `${levelInfo.exp}/${levelInfo.required} EXP` : "";
      const expTrack = document.createElement("div");
      expTrack.className = "card-level-mini__track";
      const expFill = document.createElement("div");
      expFill.className = "card-level-mini__fill";
      expFill.style.width = `${Math.round((levelInfo.progress || 0) * 100)}%`;
      expTrack.appendChild(expFill);
      levelWrap.append(levelLabel, expText, expTrack);

      body.append(titleRow, meta, badgeList, levelWrap);
      art.append(img, fallback, lock);
      item.append(art, body);

      if (owned) {
        setArtwork(img, fallback, null, image, `${safeName} artwork`);
        item.addEventListener("click", () => openCardPreview(cardId));
      } else {
        img.style.display = "none";
        fallback.style.display = "grid";
        item.disabled = true;
      }

      // Ownership is decided before the title/art lock is assigned, so an
      // inventory-only or legacy-keyed copy can never be downgraded to locked.
      els.collectionGrid.appendChild(item);
    } catch (error) {
      // One corrupt/legacy card record must never abort Collection rendering.
      console.warn("Collection card render skipped safely:", card?.id, error);
    }
  }

  if (!els.collectionGrid.children.length) {
    const empty = document.createElement("div");
    empty.className = "empty-grid empty-state";
    empty.innerHTML = "<p>No cards match the current filters.</p>";
    els.collectionGrid.appendChild(empty);
  }
}

// ============================================================
// DEDICATED CARD PREVIEW
// ============================================================

function decrementOwnershipVariant(cardId, variantKey, copies = 1) {
  const normalizedId = normalizeCardId(cardId);
  const safeCopies = Math.max(0, Math.floor(Number(copies) || 0));
  if (!normalizedId || !variantKey || safeCopies <= 0) return 0;

  const canonicalKey = (() => {
    const parsed = parseVariantKey(variantKey);
    return parsed ? canonicalVariantKey(normalizedId, parsed.mutations.map(mutation => mutation?.id)) : variantKey;
  })();
  const current = Math.max(0, Math.floor(Number(state.mutations?.[canonicalKey]) || 0));
  const inventoryCount = Math.max(0, Math.floor(Number(state.inventory?.[canonicalKey]?.count) || 0));
  const available = Math.max(current, inventoryCount);
  const removed = Math.min(safeCopies, available);
  if (removed <= 0) return 0;

  if (current <= removed) delete state.mutations[canonicalKey];
  else state.mutations[canonicalKey] = current - removed;

  const inventoryEntry = state.inventory?.[canonicalKey];
  if (inventoryEntry) {
    if (inventoryCount <= removed) delete state.inventory[canonicalKey];
    else inventoryEntry.count = inventoryCount - removed;
  }

  const currentCardCount = getUnlockedCountById(normalizedId);
  const nextCardCount = Math.max(0, currentCardCount - removed);
  if (nextCardCount > 0) state.unlocked[normalizedId] = nextCardCount;
  else delete state.unlocked[normalizedId];

  return removed;
}

function salvageVariantCopies(cardId, variantKey, copies = 1) {
  const card = getCardById(cardId);
  if (!card) return { removed: 0, cash: 0 };
  const parsed = parseVariantKey(variantKey);
  if (!parsed) return { removed: 0, cash: 0 };
  const variants = getVariantEntries(card.id);
  const entry = variants.find(candidate => candidate.key === parsed.key);
  if (!entry) return { removed: 0, cash: 0 };

  const requested = Math.max(1, Math.floor(Number(copies) || 1));
  const removed = Math.min(requested, entry.count);
  const cashPerCopy = getSalvageValue(card, entry.mutations);
  const actualRemoved = decrementOwnershipVariant(card.id, entry.key, removed);
  const cash = Math.max(0, cashPerCopy * actualRemoved);
  state.currency = Math.max(0, Number(state.currency) || 0) + cash;
  return { removed: actualRemoved, cash };
}

function salvageExtraDuplicates(cardId) {
  const card = getCardById(cardId);
  if (!card) return { removed: 0, cash: 0 };
  let removed = 0;
  let cash = 0;

  // Keep one copy of every distinct variant so unique mutations remain playable.
  for (const entry of getVariantEntries(card.id)) {
    const extras = Math.max(0, entry.count - 1);
    if (!extras) continue;
    const result = salvageVariantCopies(card.id, entry.key, extras);
    removed += result.removed;
    cash += result.cash;
  }
  return { removed, cash };
}

function renderAutoSalvageSettings() {
  if (els.autoSalvageEnabled) els.autoSalvageEnabled.checked = Boolean(state.autoSalvage?.enabled);
  if (els.autoSalvageRarity) els.autoSalvageRarity.value = String(state.autoSalvage?.rarityThreshold || "off");
  if (!els.autoSalvageMutationOptions) return;

  els.autoSalvageMutationOptions.innerHTML = "";
  const options = [{ id: "normal", name: "Normal / No Mutation" }];
  if (Array.isArray(MUTATIONS)) {
    MUTATIONS.forEach(mutation => {
      const id = normalizeMutationId(mutation?.id);
      if (id && !options.some(option => option.id === id)) options.push({ id, name: String(mutation?.name || id) });
    });
  }

  options.forEach(option => {
    const label = document.createElement("label");
    label.className = "auto-salvage-option";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = Boolean(state.autoSalvage?.mutations?.[option.id]);
    input.dataset.autoSalvageMutation = option.id;
    input.addEventListener("change", () => {
      state.autoSalvage.mutations[option.id] = input.checked;
      saveState();
    });
    const text = document.createElement("span");
    text.textContent = option.name;
    label.append(input, text);
    els.autoSalvageMutationOptions.appendChild(label);
  });
}

function openAutoSalvageSettings() {
  renderAutoSalvageSettings();
  openModal("autoSalvageModal");
}

function getPreviewVariant() {
  if (!previewSelection) return null;
  return getPreviewVariants(previewSelection.cardId).find(entry => entry.key === previewSelection.variantKey) || null;
}

function handlePreviewSalvage() {
  const variant = getPreviewVariant();
  if (!variant || !previewSelection) return;
  const result = salvageVariantCopies(previewSelection.cardId, variant.key, 1);
  if (!result.removed) return;
  saveState();
  updateStats();
  renderCollection();
  showRewardToast(result.cash);
  const remaining = getPreviewVariants(previewSelection.cardId);
  if (!remaining.length) {
    closeModal("cardPreviewModal");
    return;
  }
  if (!remaining.some(entry => entry.key === previewSelection.variantKey)) previewSelection.variantKey = remaining[0].key;
  renderPreview();
}

function handlePreviewSalvageExtras() {
  if (!previewSelection) return;
  const result = salvageExtraDuplicates(previewSelection.cardId);
  if (!result.removed) return;
  saveState();
  updateStats();
  renderCollection();
  showRewardToast(result.cash);
  const remaining = getPreviewVariants(previewSelection.cardId);
  if (!remaining.length) {
    closeModal("cardPreviewModal");
    return;
  }
  if (!remaining.some(entry => entry.key === previewSelection.variantKey)) previewSelection.variantKey = remaining[0].key;
  renderPreview();
}

function getPreviewVariants(cardId) {
  const variants = getVariantEntries(cardId);
  if (!variants.length && getOwnedCardCount(cardId) > 0) {
    variants.push({
      key: canonicalVariantKey(normalizeCardId(cardId), []),
      count: getOwnedCardCount(cardId),
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
  const targetId = normalizeCardId(cardId);
  if (!targetId) return null;
  return ALL_CARDS.find(card => normalizeCardId(card?.id) === targetId) || null;
}

function openCardPreview(cardId, preferredKey = null) {
  const card = getCardById(cardId);
  if (!card || !isCardOwned(cardId)) return;

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
  const levelInfo = getCardLevelInfo(card);
  if (els.previewLevel) els.previewLevel.textContent = `Lv. ${levelInfo.level}`;
  if (els.previewExpText) els.previewExpText.textContent = `${levelInfo.exp}/${levelInfo.required} EXP`;
  if (els.previewExpBar) els.previewExpBar.style.width = `${Math.round(levelInfo.progress * 100)}%`;
  if (els.previewSalvageButton) els.previewSalvageButton.disabled = variant.count <= 0;
  if (els.previewSalvageExtrasButton) els.previewSalvageExtrasButton.disabled = !getPreviewVariants(card.id).some(entry => entry.count > 1);
  els.previewName.textContent = display.name;
  els.previewRarity.textContent = card.rarity;
  els.previewVariantCount.textContent = `${variant.count}×`;
  els.previewHp.textContent = display.hp.toLocaleString("en-US");
  els.previewAtk.textContent = display.atk.toLocaleString("en-US");
  els.previewPassiveName.textContent = card.passive.name;
  els.previewPassiveDescription.textContent = card.passive.description;
  const previewMutations = normalizeMutationObjects(variant.mutations);
  els.previewVariantLabel.textContent = previewMutations.length
    ? previewMutations.map(mutation => String(mutation?.name || "")).filter(Boolean).join(" + ")
    : "Normal Variant";
  els.previewCollectedCount.textContent = `${getOwnedCardCount(card.id).toLocaleString("en-US")}× total`;
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
  if (els.collectionSummary) els.collectionSummary.textContent = `Cards: ${unique}/${ALL_CARDS.length}`;
  if (els.luckValue) els.luckValue.textContent = `${getLuckMultiplier().toFixed(2)}x`;
  if (els.collectionModalCount) els.collectionModalCount.textContent = `${unique}/${ALL_CARDS.length}`;
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

const BATTLE_BASE_XP_4V4 = 480;
const BATTLE_BASE_XP_1V1 = 140;
const BATTLE_BASE_CASH_4V4 = 1000;
const BATTLE_BASE_CASH_1V1 = 300;
const BATTLE_TURN_MS = 3000;
const BATTLE_TEAM_SIZE = 4;
const BATTLE_ENEMY_MUTATION_CHANCE = 0.70;
const BATTLE_DEFEAT_LOSS_CHANCE = 0.25;
const BATTLE_1V1_MIN_SCALE = 0.78;
const BATTLE_1V1_MAX_SCALE = 1.32;
const BATTLE_1V1_TARGET_RATIO_MIN = 0.92;
const BATTLE_1V1_TARGET_RATIO_MAX = 1.22;
const BATTLE_4V4_TARGET_RATIO_MIN = 0.85;
const BATTLE_4V4_TARGET_RATIO_MAX = 1.30;

function clampBattleEnemyLevel(level) {
  return Math.max(1, Math.min(CARD_LEVEL_MAX, Math.round(Number(level) || 1)));
}

function getAdaptiveEnemyLevel(playerLevel, targetRatio) {
  const safePlayerLevel = Math.max(1, Number(playerLevel) || 1);
  const safeRatio = Math.max(0.70, Math.min(1.35, Number(targetRatio) || 1));
  const jitter = 0.92 + Math.random() * 0.16;
  return clampBattleEnemyLevel(safePlayerLevel * safeRatio * jitter);
}

function getEnemyDisplayCard(card, mutations = [], enemyLevel = 1) {
  const safeMutations = normalizeMutationObjects(mutations);
  const mutationMultiplier = getMutationMultiplier(safeMutations);
  const safeLevel = clampBattleEnemyLevel(enemyLevel);
  const levelMultiplier = 1 + Math.max(0, safeLevel - 1) * CARD_LEVEL_STAT_GROWTH;
  const prefix = safeMutations
    .map(mutation => String(mutation?.name || ""))
    .filter(Boolean)
    .map(name => `[${name}]`)
    .join(" + ");
  return {
    name: prefix ? `${prefix} ${String(card?.name || "Unknown Card")}` : String(card?.name || "Unknown Card"),
    hp: Math.max(1, Math.round((Number(card?.stats?.hp) || 0) * mutationMultiplier * levelMultiplier)),
    atk: Math.max(1, Math.round((Number(card?.stats?.atk) || 0) * mutationMultiplier * levelMultiplier)),
    reward: Math.max(0, Math.floor(calculateCardReward(Number(card?.chance) || 0) * mutationMultiplier)),
    level: safeLevel,
    exp: 0,
    expRequired: getCardLevelExpRequired(card, safeLevel),
    expProgress: 0
  };
}

function getBattleMode() {
  return battleState?.mode === '1v1' ? '1v1' : '4v4';
}

function getBattleTeamSize() {
  return getBattleMode() === '1v1' ? 1 : BATTLE_TEAM_SIZE;
}

function isOneVsOneBattle() {
  return getBattleMode() === '1v1';
}

function getBattleModeLabel() {
  return isOneVsOneBattle() ? '1V1 • 3s TURNS' : '4V4 • 3s TURNS';
}

let battleState = null;
let battleTurnTimer = null;
// Do not persist this encounter hint: it only prevents immediate same-opponent
// repetition while preserving fresh random selection every new battle.
let lastBattleOpponentCardId = null;
let lastBattleOpponentTeamSignature = '';

function clearBattleTurnTimer() {
  if (battleTurnTimer !== null) {
    window.clearTimeout(battleTurnTimer);
    battleTurnTimer = null;
  }
}

function getUnlockedBattleCards() {
  return ALL_CARDS.filter(card => getOwnedCardCount(card.id) > 0);
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
  if (team.length !== getBattleTeamSize()) return false;
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

  for (let index = 0; index < getBattleTeamSize(); index += 1) {
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

  if (els.battleTeamCount) els.battleTeamCount.textContent = `${team.length}/${getBattleTeamSize()}`;
}

function populateBattleFighterSelect() {
  const grid = els.battleFighterGrid;
  if (!grid) return;

  const unlocked = getUnlockedBattleCards();
  const previousTeam = Array.isArray(battleState?.setup?.team) ? battleState.setup.team.map(slot => ({ ...slot })) : [];
  const previousActive = Number(battleState?.setup?.activeIndex || 0);
  const previousMode = battleState?.mode === '1v1' ? '1v1' : '4v4';
  grid.innerHTML = '';

  clearBattleTurnTimer();
  battleState = {
    mode: previousMode,
    setup: { team: previousTeam, activeIndex: previousActive }
  };

  if (!unlocked.length) {
    grid.innerHTML = '<div class="battle-empty-selection">Roll at least one card to enter the arena.</div>';
    if (els.battleStartButton) els.battleStartButton.disabled = true;
    if (els.battleVariantGrid) els.battleVariantGrid.innerHTML = '';
    renderBattleSelection();
    return;
  }

  unlocked.forEach(card => {
    const selectedIndexes = getBattleSetupTeam()
      .map((slot, index) => normalizeCardId(slot?.cardId) === normalizeCardId(card.id) ? index : -1)
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
      const existingIndex = getBattleSetupTeam().findIndex(slot => normalizeCardId(slot?.cardId) === normalizeCardId(card.id));
      let targetIndex = existingIndex;

      if (targetIndex < 0) {
        if (getBattleSetupTeam().length < getBattleTeamSize()) {
          targetIndex = getBattleSetupTeam().length;
          const entry = chooseFirstAvailableBattleVariant(card.id, -1);
          if (!entry) return;
          getBattleSetupTeam().push({ cardId: card.id, variantKey: entry.key });
        } else {
          targetIndex = Math.min(Number(battleState.setup.activeIndex || 0), getBattleTeamSize() - 1);
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
      const selected = getBattleSetupTeam().some(slot => normalizeCardId(slot?.cardId) === normalizeCardId(cardId));
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

function renderBattleModePicker() {
  const activeMode = getBattleMode();
  if (els.battleModePicker) {
    els.battleModePicker.querySelectorAll('[data-battle-mode]').forEach(button => {
      const selected = button.dataset.battleMode === activeMode;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  }
  if (els.battleModeLabel) els.battleModeLabel.textContent = getBattleModeLabel();
  if (els.battleStartButton) {
    els.battleStartButton.textContent = isOneVsOneBattle() ? 'Start 1v1 Battle' : 'Start 4v4 Battle';
  }
}

function setBattleMode(mode) {
  const nextMode = mode === '1v1' ? '1v1' : '4v4';
  clearBattleTurnTimer();
  battleState = { mode: nextMode, setup: { team: [], activeIndex: 0 } };
  renderBattleModePicker();
  populateBattleFighterSelect();
}

function resetBattleView(mode = '4v4') {
  clearBattleTurnTimer();
  battleState = { mode: mode === '1v1' ? '1v1' : '4v4', setup: { team: [], activeIndex: 0 } };
  els.battleSetup?.classList.remove('hidden');
  els.battleArena?.classList.add('hidden');
  els.battleVictory?.classList.add('hidden');
  els.battleVictory?.setAttribute('aria-hidden', 'true');
  if (els.battleLog) els.battleLog.innerHTML = '';
  if (els.battleStatus) els.battleStatus.textContent = 'PREPARING';
  renderBattleModePicker();
  if (els.battleStartButton) els.battleStartButton.disabled = true;
  populateBattleFighterSelect();
}

function openBattleModal() {
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

function chooseAdaptive1v1Enemy(playerUnit, candidatePool) {
  const safePool = Array.isArray(candidatePool) ? candidatePool.filter(Boolean) : [];
  if (!safePool.length) return null;

  const playerPower = Math.max(1, calculateBattleUnitPower(playerUnit));
  const targetRatio = BATTLE_1V1_TARGET_RATIO_MIN + Math.random() * (BATTLE_1V1_TARGET_RATIO_MAX - BATTLE_1V1_TARGET_RATIO_MIN);
  const playerLevel = getCardLevelInfo(playerUnit?.card).level;
  const enemyLevel = getAdaptiveEnemyLevel(playerLevel, targetRatio);

  const rankedCandidates = safePool
    .map(card => ({
      card,
      display: getEnemyDisplayCard(card, [], enemyLevel)
    }))
    .map(entry => ({
      ...entry,
      power: Math.max(
        1,
        Math.round(Number(entry.display?.hp) || 0) +
        2 * Math.max(0, Math.round(Number(entry.display?.atk) || 0))
      )
    }))
    .sort((a, b) => {
      const distanceA = Math.abs(Math.log((a.power + 1) / (playerPower + 1)));
      const distanceB = Math.abs(Math.log((b.power + 1) / (playerPower + 1)));
      return distanceA - distanceB;
    });

  // The old implementation always chose rankedCandidates[0], which made the
  // battle feel like it had a single fixed opponent. Keep matchmaking near
  // the player's power, but randomly choose from a local power neighborhood.
  const nearestBandSize = Math.max(1, Math.min(5, Math.ceil(rankedCandidates.length * 0.35)));
  let neighborhood = rankedCandidates.slice(0, nearestBandSize);

  // Avoid the immediately previous opponent whenever another legal candidate
  // exists. This is intentionally transient runtime state, not save data.
  if (neighborhood.length > 1 && lastBattleOpponentCardId) {
    const filtered = neighborhood.filter(
      entry => normalizeCardId(entry.card?.id) !== normalizeCardId(lastBattleOpponentCardId)
    );
    if (filtered.length) neighborhood = filtered;
  }

  const chosen = neighborhood[Math.floor(Math.random() * neighborhood.length)] || rankedCandidates[0];
  const mutations = rollEnemyMutations();
  const rawDisplay = getEnemyDisplayCard(chosen.card, mutations, enemyLevel);
  const rawPower = Math.max(
    1,
    Math.round(Number(rawDisplay?.hp) || 0) +
    2 * Math.max(0, Math.round(Number(rawDisplay?.atk) || 0))
  );
  const targetPower = Math.max(1, Math.round(playerPower * targetRatio));
  const adaptiveScale = Math.max(0.05, Math.min(4.00, targetPower / rawPower));

  const hp = Math.max(1, Math.round((Number(rawDisplay?.hp) || 1) * adaptiveScale));
  const atk = Math.max(1, Math.round((Number(rawDisplay?.atk) || 1) * adaptiveScale));
  const display = { ...rawDisplay, hp, atk };

  lastBattleOpponentCardId = normalizeCardId(chosen.card?.id) || null;

  return {
    card: chosen.card,
    mutations,
    variantKey: getVariantKey(chosen.card.id, mutations),
    display,
    level: enemyLevel,
    exp: 0,
    hp,
    maxHp: hp,
    atk,
    defeated: false,
    adaptiveScale,
    adaptiveSourcePower: rawPower,
    targetRatio
  };
}
function shuffleBattlePool(pool) {
  const shuffled = [...pool];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function buildRandomBattleTeam(pool, playerTeam, targetRatio) {
  const averagePlayerLevel = playerTeam.reduce(
    (sum, unit) => sum + getCardLevelInfo(unit?.card).level,
    0
  ) / Math.max(1, playerTeam.length);
  const shuffled = shuffleBattlePool(pool);
  const team = [];

  for (let index = 0; index < getBattleTeamSize(); index += 1) {
    const card = shuffled[index % shuffled.length];
    const enemyLevel = getAdaptiveEnemyLevel(averagePlayerLevel, targetRatio);
    const mutations = rollEnemyMutations();
    const display = getEnemyDisplayCard(card, mutations, enemyLevel);
    team.push({
      card,
      mutations,
      variantKey: getVariantKey(card.id, mutations),
      display,
      level: enemyLevel,
      exp: 0,
      hp: display.hp,
      maxHp: display.hp,
      atk: display.atk,
      defeated: false
    });
  }

  const basePower = Math.max(1, calculateBattleTeamPower(team));
  const playerPower = Math.max(1, calculateBattleTeamPower(playerTeam));
  const teamScale = Math.max(0.05, Math.min(4.00, (playerPower * targetRatio) / basePower));
  team.forEach(unit => {
    unit.hp = Math.max(1, Math.round(unit.hp * teamScale));
    unit.maxHp = unit.hp;
    unit.atk = Math.max(1, Math.round(unit.atk * teamScale));
    unit.display = { ...unit.display, hp: unit.hp, atk: unit.atk };
  });

  return team;
}

function getBattleTeamSignature(team) {
  return (team || [])
    .map(unit => `${normalizeCardId(unit?.card?.id)}:${String(unit?.variantKey || '')}`)
    .join('|');
}

function chooseBattleEnemyTeam(playerTeam) {
  const mode = getBattleMode();
  const playerIds = new Set(playerTeam.map(unit => normalizeCardId(unit?.card?.id)).filter(Boolean));
  let pool = getAvailableRollPool().filter(card => !playerIds.has(normalizeCardId(card?.id)));
  if (!pool.length) pool = ALL_CARDS.filter(card => !playerIds.has(normalizeCardId(card?.id)));
  if (!pool.length) pool = [...ALL_CARDS];

  if (mode === '1v1') {
    return [chooseAdaptive1v1Enemy(playerTeam[0], pool)];
  }

  const targetRatio = BATTLE_4V4_TARGET_RATIO_MIN + Math.random() * (BATTLE_4V4_TARGET_RATIO_MAX - BATTLE_4V4_TARGET_RATIO_MIN);
  let team = buildRandomBattleTeam(pool, playerTeam, targetRatio);

  // Fresh 4v4 encounters should not immediately recycle the same lineup when
  // another combination is available. Keep this transient and session-only.
  if (getBattleTeamSize() > 1 && lastBattleOpponentTeamSignature) {
    let attempts = 0;
    while (
      attempts < 4 &&
      pool.length >= getBattleTeamSize() &&
      getBattleTeamSignature(team) === lastBattleOpponentTeamSignature
    ) {
      team = buildRandomBattleTeam(pool, playerTeam, targetRatio);
      attempts += 1;
    }
  }

  lastBattleOpponentTeamSignature = getBattleTeamSignature(team);
  return team;
}
function calculateBattleUnitPower(unit) {
  return Math.max(0, Math.round(unit.maxHp + unit.atk * 2));
}

function calculateBattleTeamPower(team) {
  return team.reduce((total, unit) => total + calculateBattleUnitPower(unit), 0);
}

function getBattleRewardProfile(playerPower, enemyPower) {
  const mode = getBattleMode();
  const safePlayerPower = Math.max(1, Number(playerPower) || 0);
  const safeEnemyPower = Math.max(0, Number(enemyPower) || 0);
  const rawRatio = safeEnemyPower / safePlayerPower;

  if (mode === '1v1') {
    const ratio = Math.max(0.90, Math.min(1.15, rawRatio));
    const multiplier = Math.max(0.90, Math.min(1.25, 1 + (ratio - 1) * 1.25));
    const reward = Math.max(0, Math.floor(BATTLE_BASE_CASH_1V1 * multiplier));
    const experience = Math.max(0, Math.floor(BATTLE_BASE_XP_1V1 * multiplier));
    const dropRateBonus = Number((0.35 + Math.max(0, multiplier - 0.90) * 1.25).toFixed(2));
    return { mode, ratio, multiplier, reward, experience, dropRateBonus, label: 'Adaptive 1v1' };
  }

  let multiplier = 1.20;
  let label = 'Balanced 4v4';
  if (rawRatio < 0.80) {
    multiplier = 0.75;
    label = 'Weak Match';
  } else if (rawRatio <= 1.25) {
    multiplier = 1.20;
    label = 'Balanced 4v4';
  } else {
    multiplier = Math.min(3.00, 1.65 + ((rawRatio - 1.25) / 0.75) * 1.35);
    label = 'Hard 4v4 Bonus';
  }

  const reward = Math.max(0, Math.floor(BATTLE_BASE_CASH_4V4 * multiplier));
  const experience = Math.max(0, Math.floor(BATTLE_BASE_XP_4V4 * multiplier));
  const dropRateBonus = Number(Math.min(5, 2 + Math.max(0, multiplier - 0.75) * 2.2).toFixed(2));
  return { mode, ratio: rawRatio, multiplier, reward, experience, dropRateBonus, label };
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
  const levelEl = els[prefix + 'Level'];
  const expTextEl = els[prefix + 'ExpText'];
  const expBarEl = els[prefix + 'ExpBar'];
  const playerLevelInfo = getCardLevelInfo(unit.card);
  const displayLevel = side === 'enemy' ? clampBattleEnemyLevel(unit.level) : playerLevelInfo.level;
  const displayExp = side === 'enemy' ? 0 : playerLevelInfo.exp;
  const displayRequired = side === 'enemy' ? getCardLevelExpRequired(unit.card, displayLevel) : playerLevelInfo.required;
  const displayProgress = side === 'enemy' ? 0 : playerLevelInfo.progress;

  if (nameEl) nameEl.textContent = side === 'enemy' ? `[Lv. ${displayLevel}] ${unit.display.name}` : unit.display.name;
  if (hpEl) hpEl.textContent = `${Math.max(0, unit.hp).toLocaleString('en-US')} / ${unit.maxHp.toLocaleString('en-US')}`;
  if (hpBar) hpBar.style.width = `${ratio * 100}%`;
  if (atkEl) atkEl.textContent = unit.atk.toLocaleString('en-US');
  if (levelEl) levelEl.textContent = `Lv. ${displayLevel}`;
  if (expTextEl) expTextEl.textContent = side === 'enemy' ? `NPC • ${displayRequired.toLocaleString('en-US')} EXP base` : `${displayExp}/${displayRequired} EXP`;
  if (expBarEl) expBarEl.style.width = `${Math.round(displayProgress * 100)}%`;
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
    name.textContent = side === 'enemy' ? `[Lv. ${clampBattleEnemyLevel(unit.level)}] ${unit.display.name}` : unit.display.name;
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
  if (els.battleModeLabel) els.battleModeLabel.textContent = getBattleModeLabel();
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
  const currentVariantCount = Math.max(0, Math.floor(Number(state.mutations?.[variantKey] || 0)));
  const inventoryEntry = state.inventory?.[variantKey];
  const inventoryCount = Math.max(0, Math.floor(Number(inventoryEntry?.count) || 0));
  if (currentVariantCount <= 0 && inventoryCount <= 0) return false;

  if (currentVariantCount <= 1) delete state.mutations[variantKey];
  else state.mutations[variantKey] = currentVariantCount - 1;

  if (inventoryEntry) {
    if (inventoryCount <= 1) delete state.inventory[variantKey];
    else inventoryEntry.count = inventoryCount - 1;
  }

  const normalizedCardId = normalizeCardId(cardId);
  const currentCardCount = getUnlockedCountById(normalizedCardId);
  if (currentCardCount <= 1) delete state.unlocked[normalizedCardId];
  else state.unlocked[normalizedCardId] = currentCardCount - 1;
  return true;
}

function canReplayBattleTeam() {
  if (!battleState?.setup?.team || battleState.setup.team.length !== getBattleTeamSize()) return false;
  const usage = new Map();
  for (const slot of battleState.setup.team) {
    usage.set(slot.variantKey, (usage.get(slot.variantKey) || 0) + 1);
    if (getUnlockedCountById(slot?.cardId) <= 0) return false;
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

  const safePlayerPower = Number.isFinite(Number(battleState.playerPower)) ? Math.max(0, Number(battleState.playerPower)) : 0;
  const safeEnemyPower = Number.isFinite(Number(battleState.enemyPower)) ? Math.max(0, Number(battleState.enemyPower)) : 0;
  battleState.playerPower = safePlayerPower;
  battleState.enemyPower = safeEnemyPower;

  try {
    if (playerWon) {
      const rewardProfile = getBattleRewardProfile(safePlayerPower, safeEnemyPower);
      const reward = Number.isFinite(Number(rewardProfile.reward)) ? Math.max(0, Math.floor(rewardProfile.reward)) : 0;
      const experience = Number.isFinite(Number(rewardProfile.experience)) ? Math.max(0, Math.floor(rewardProfile.experience)) : 0;
      state.currency = Math.max(0, Number(state.currency) || 0) + reward;
      const dropRateBonus = Number.isFinite(Number(rewardProfile.dropRateBonus)) ? Math.max(0, Number(rewardProfile.dropRateBonus)) : 0;
      state.experience = Math.max(0, Number(state.experience) || 0) + experience;
      state.battleDropRateBonus = Math.max(0, Math.min(100, Number(state.battleDropRateBonus) || 0) + dropRateBonus);

      // Persist the monetary reward before any card/level-up/rendering work.
      // A malformed legacy record must never erase a legitimate victory payout.
      saveState();
      updateStats();

      const participatingIds = [...new Set((battleState.playerTeam || []).map(unit => normalizeCardId(unit?.card?.id)).filter(Boolean))];
      const expPerCard = participatingIds.length ? Math.max(1, Math.floor(experience / participatingIds.length)) : 0;
      const levelUps = [];
      for (const cardId of participatingIds) {
        const result = grantCardExperience(cardId, expPerCard);
        if (result.levelUps > 0) levelUps.push(`${getCardById(cardId)?.name || cardId} Lv.${result.level}`);
      }
      saveState();
      updateStats();
      renderUpgradeShop();
      collectionNeedsRefresh = false;
      renderCollection();

      const bonusPercent = Math.round((rewardProfile.multiplier - 1) * 100);
      const modeLabel = rewardProfile.mode.toUpperCase();
      const levelNote = levelUps.length ? ` • Level Up: ${levelUps.join(', ')}` : '';

      appendBattleLog(`Victory! +${formatCurrency(reward)} battle cash • +${experience} EXP • +${dropRateBonus.toFixed(2)}% Drop Rate Bonus • ${rewardProfile.label}.${levelNote}`, 'victory');
      if (els.battleResultTitle) els.battleResultTitle.textContent = '🏆 VICTORY!';
      if (els.battleResultText) els.battleResultText.textContent = `${modeLabel} cleared. Battle reward: ${formatCurrency(reward)} + ${experience} EXP + ${dropRateBonus.toFixed(2)}% Drop Rate.`;
      if (els.battleResultPower) {
        els.battleResultPower.textContent = `Player Power: ${safePlayerPower.toLocaleString('en-US')} vs Enemy Power: ${safeEnemyPower.toLocaleString('en-US')} • ${rewardProfile.label} • ×${Number(rewardProfile.multiplier || 1).toFixed(2)}`;
      }
      if (els.battleResultCash) els.battleResultCash.textContent = `+${formatCurrency(reward)}`;
      if (els.battleResultExp) els.battleResultExp.textContent = `+${experience.toLocaleString('en-US')} EXP`;
      if (els.battleResultDropRate) els.battleResultDropRate.textContent = `+${dropRateBonus.toFixed(2)}%`;
      if (els.battleResultLossStatus) els.battleResultLossStatus.textContent = 'N/A — Victory';
    } else {
      const penalty = applyBattleDefeatPenalty();
      const targetName = penalty?.target?.display?.name || penalty?.target?.card?.name || 'your defeated fighter';
      saveState();
      updateStats();
      collectionNeedsRefresh = false;
      renderCollection();
      renderUpgradeShop();

      const notice = penalty?.lost
        ? `Defeated! 25% Loss Chance: Lost 1x ${targetName}.`
        : 'Defeated! 25% Loss Chance: Card Saved!';
      appendBattleLog(notice, 'defeat');
      if (els.battleResultTitle) els.battleResultTitle.textContent = '💀 DEFEAT!';
      if (els.battleResultText) els.battleResultText.textContent = notice;
      if (els.battleResultPower) els.battleResultPower.textContent = `Player Power: ${safePlayerPower.toLocaleString('en-US')} vs Enemy Power: ${safeEnemyPower.toLocaleString('en-US')}`;
      if (els.battleResultCash) els.battleResultCash.textContent = '+0 VNĐ';
      if (els.battleResultExp) els.battleResultExp.textContent = '+0 EXP';
      if (els.battleResultDropRate) els.battleResultDropRate.textContent = '+0.00%';
      if (els.battleResultLossStatus) els.battleResultLossStatus.textContent = penalty?.lost ? 'LOST 1 CARD' : 'SAVED';
    }
  } catch (error) {
    // Battle resolution must always reach the end-game screen even if a
    // malformed legacy collection record is encountered during cleanup.
    console.error('Battle result rendering failed safely:', error);
    if (els.battleResultTitle) els.battleResultTitle.textContent = playerWon ? '🏆 VICTORY!' : '💀 DEFEAT!';
    if (els.battleResultText) els.battleResultText.textContent = playerWon ? 'Battle complete. Reward processed safely.' : 'Battle complete. Defeat penalty processed safely.';
    if (els.battleResultPower) els.battleResultPower.textContent = `Player Power: ${safePlayerPower.toLocaleString('en-US')} vs Enemy Power: ${safeEnemyPower.toLocaleString('en-US')}`;
  }

  let replayable = false;
  try { replayable = canReplayBattleTeam(); } catch (error) { console.warn('Replay check failed safely:', error); }
  if (els.battleAutoAgainButton) {
    els.battleAutoAgainButton.disabled = !replayable;
    els.battleAutoAgainButton.textContent = replayable ? '⚔️ Battle Again' : 'Team Unavailable';
  }

  els.battleArena?.classList.add('hidden');
  const battleResultView = document.getElementById('battle-result-modal') || els.battleVictory;
  if (battleResultView) {
    battleResultView.classList.remove('hidden', 'battle-result--neutral', 'battle-result--victory', 'battle-result--defeat');
    battleResultView.classList.add(playerWon ? 'battle-result--victory' : 'battle-result--defeat');
    battleResultView.setAttribute('aria-hidden', 'false');
  } else {
    console.warn('Battle result view is missing; result data was still processed.');
  }
}

// Explicit alias for integrations that expect an endBattle() API.
function endBattle(playerWon) {
  if (!battleState || battleState.finished) return;
  clearBattleTurnTimer();
  finishBattle(Boolean(playerWon));
}

function startBattle(useExistingSetup = true) {
  const setupTeam = useExistingSetup ? battleState?.setup?.team : null;
  if (!Array.isArray(setupTeam) || setupTeam.length !== getBattleTeamSize() || !isBattleSetupValid(setupTeam)) return;

  // A new encounter must never reuse a prior opponent object. Clear the
  // transient battle encounter before generating a fresh opponent/team.
  battleState = {
    ...(battleState || {}),
    currentOpponent: null,
    finished: false
  };

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

  const mode = getBattleMode();
  const teamSize = getBattleTeamSize();

  battleState = {
    mode,
    currentOpponent: enemyTeam[0] || null,
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
  els.battleVictory?.setAttribute('aria-hidden', 'true');
  els.battleArena?.classList.remove('hidden');
  if (els.battleLog) els.battleLog.innerHTML = '';

  appendBattleLog(`${mode} battle begins: ${playerTeam[0].display.name} leads the line.`);
  appendBattleLog(`Enemy levels are adaptive to your current team power. ${enemyTeam.map(unit => `Lv. ${unit.level}`).join(', ')}.`);
  appendBattleLog(`Enemy mutations are active-weather boosted (70% roll chance).`);
  appendBattleLog(`First strike begins in 3 seconds. ${teamSize} fighter${teamSize === 1 ? '' : 's'} per side.`, 'player');
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
      if (battleState.enemyIndex >= getBattleTeamSize()) {
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
      if (battleState.playerIndex >= getBattleTeamSize()) {
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
    // Weather changes affect the roll pool, not collection ownership. Do not
    // rebuild the Collection DOM from the background ticker: that would replace
    // the player's active search/filter DOM state while they are browsing.
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
  if (id === "collectionModal") {
    collectionNeedsRefresh = false;
    renderCollection();
  }
  if (id === "upgradesModal") renderUpgradeShop();
  if (id === "cardPreviewModal") renderPreview();
  if (id === "battleModal") resetBattleView();
  if (id === "autoSalvageModal") renderAutoSalvageSettings();
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
els.battleModePicker?.querySelectorAll("[data-battle-mode]").forEach(button => {
  button.addEventListener("click", () => setBattleMode(button.dataset.battleMode));
});
els.battleAutoAgainButton?.addEventListener("click", () => {
  if (!canReplayBattleTeam()) return;
  startBattle(true);
});
els.battleChangeFighterButton?.addEventListener("click", () => {
  clearBattleTurnTimer();
  battleState = { mode: getBattleMode(), setup: { team: [], activeIndex: 0 } };
  resetBattleView(getBattleMode());
});
els.rollButton?.addEventListener("click", () => rollCard("manual"));
els.searchInput?.addEventListener("input", () => {
  collectionNeedsRefresh = false;
  renderCollection();
});
els.mutationFilter?.addEventListener("change", () => {
  collectionNeedsRefresh = false;
  renderCollection();
});
els.sortSelect?.addEventListener("change", () => {
  collectionNeedsRefresh = false;
  renderCollection();
});

els.autoRollToggle?.addEventListener("change", () => {
  isAutoRolling = Boolean(els.autoRollToggle.checked);
  if (isAutoRolling) attemptAutoRoll();
});

els.previewSalvageButton?.addEventListener("click", handlePreviewSalvage);
els.previewSalvageExtrasButton?.addEventListener("click", handlePreviewSalvageExtras);
els.previewAutoDeleteButton?.addEventListener("click", openAutoSalvageSettings);
els.autoSalvageEnabled?.addEventListener("change", () => {
  state.autoSalvage.enabled = Boolean(els.autoSalvageEnabled.checked);
  saveState();
});
els.autoSalvageRarity?.addEventListener("change", () => {
  state.autoSalvage.rarityThreshold = AUTO_SALVAGE_RARITY_VALUES.includes(els.autoSalvageRarity.value) ? els.autoSalvageRarity.value : "off";
  saveState();
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
