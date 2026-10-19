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
const SAVE_SCHEMA_VERSION = 9;
const GLOBAL_TICK_MS = 1000;
const BASE_COOLDOWN_MS = 1500;
const SPEED_BASE_COST = 100;
const SPEED_MAX_LEVEL = 20;
const SPEED_FACTOR = 0.15;
const LUCK_BASE_COST = 250;
const LUCK_MAX_LEVEL = 500;
const LUCK_FACTOR = 0.25;
const EXP_MULTI_BASE_COST = 2500;
const EXP_MULTI_MAX_LEVEL = 100;
const EXP_MULTI_LINEAR = 0.12;
const EXP_MULTI_CURVE = 0.03;
const EXP_MULTI_EXPONENT = 1.15;
const EXP_MULTI_COST_FACTOR = 1.40;
const COIN_MULTI_BASE_COST = 4000;
const COIN_MULTI_MAX_LEVEL = 100;
const COIN_MULTI_LINEAR = 0.15;
const COIN_MULTI_CURVE = 0.02;
const COIN_MULTI_EXPONENT = 1.20;
const COIN_MULTI_COST_FACTOR = 1.45;

const rarityOrder = Object.freeze({Common:0,Rare:1,Epic:2,Legendary:3,Mythic:4,Secret:5});

const CARD_RARITY_EXP_MULTIPLIERS = Object.freeze({
  Common: 1,
  Rare: 1.6,
  Epic: 2.4,
  Legendary: 3.6,
  Mythic: 5.2,
  Secret: 8
});
const CARD_LEVEL_STAT_GROWTH = 0.075; // 7.5% HP/ATK per level (requested 5–10% range)
const CARD_LEVEL_MAX = window.CardLevelSystem.MAX_LEVEL; // Hard gameplay cap shared by all player EXP sources.

const FALLBACK_ART_DATA_URL = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22 width%3D%22600%22 height%3D%22800%22 viewBox%3D%220 0 600 800%22%3E%3Cdefs%3E%3ClinearGradient id%3D%22g%22 x1%3D%220%22 y1%3D%220%22 x2%3D%221%22 y2%3D%221%22%3E%3Cstop stop-color%3D%22%23141a2a%22%2F%3E%3Cstop offset%3D%221%22 stop-color%3D%22%23080b14%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect width%3D%22600%22 height%3D%22800%22 fill%3D%22url(%23g)%22%2F%3E%3Ccircle cx%3D%22300%22 cy%3D%22340%22 r%3D%22100%22 fill%3D%22none%22 stroke%3D%22%2377e2ff%22 stroke-width%3D%2212%22 opacity%3D%220.65%22%2F%3E%3Ctext x%3D%22300%22 y%3D%22490%22 text-anchor%3D%22middle%22 fill%3D%22%23dfe9ff%22 font-family%3D%22Arial%2Csans-serif%22 font-size%3D%2236%22 font-weight%3D%22700%22%3EARTWORK%3C%2Ftext%3E%3C%2Fsvg%3E";

const MUTATION_ID_ALIASES = Object.freeze({
  sweet: "sweat",
  blizzard: "frost",
  sacrifice: "eclipsed"
});

const defaultState = {
  schemaVersion: SAVE_SCHEMA_VERSION,
  totalRolls: 0,
  currency: 0,
  experience: 0,
  battleDropRateBonus: 0,
  dropChance: 0, // percent points; potion drop logic reads ONLY this stat and pity
  cardProgress: {},
  migrations: {},
  achievementRewardReceipts: {},
  unlocked: {},
  mutations: {},
  equipment: [],
  upgrades: { rollSpeed: 0, luck: 0, expMulti: 0, coinMulti: 0 },
  lastResultId: null,
  weather: {
    gameSeconds: 0,
    active: [],
    lastSchedulerSecond: 0,
    lastRealTimestamp: Date.now()
  }
};

let isImportingSave = false;
let state = loadState();
syncOwnershipRecords();
saveState(true);

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
let rollUiDirty = false, rollUiCanPaint = true, pendingRollPresentation = null;
let availableRollUiSignature = '';
const weatherHudTimers = new Map();

const els = {
  totalRolls: document.getElementById("totalRolls"),
  luckValue: document.getElementById("luckValue"),
  cooldownValue: document.getElementById("cooldownValue"),
  achievementReadyCount: document.getElementById("achievementReadyCount"),
  inventoryModal: document.getElementById("inventoryModal"),
  inventoryCategory: document.getElementById("inventoryCategory"),
  inventorySearch: document.getElementById("inventorySearch"),
  achievementModal: document.getElementById("achievementModal"),
  saveManagerModal: document.getElementById("saveManagerModal"),
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
  salvageAllExtraDuplicatesButton: document.getElementById("salvageAllExtraDuplicatesButton"),
  previewLevel: document.getElementById("previewLevel"),
  previewExpText: document.getElementById("previewExpText"),
  previewExpBar: document.getElementById("previewExpBar"),
  previewSalvageButton: document.getElementById("previewSalvageButton"),
  previewSalvageExtrasButton: document.getElementById("previewSalvageExtrasButton"),


  upgradesModal: document.getElementById("upgradesModal"),
  shopCurrency: document.getElementById("shopCurrency"),
  speedLevel: document.getElementById("speedLevel"),
  speedCurrent: document.getElementById("speedCurrent"),
  buySpeedButton: document.getElementById("buySpeedButton"),
  luckLevel: document.getElementById("luckLevel"),
  luckCurrent: document.getElementById("luckCurrent"),
  buyLuckButton: document.getElementById("buyLuckButton"),
  expMultiLevel: document.getElementById("expMultiLevel"),
  expMultiCurrent: document.getElementById("expMultiCurrent"),
  buyExpMultiButton: document.getElementById("buyExpMultiButton"),
  coinMultiLevel: document.getElementById("coinMultiLevel"),
  coinMultiCurrent: document.getElementById("coinMultiCurrent"),
  buyCoinMultiButton: document.getElementById("buyCoinMultiButton"),

  battleButton: document.getElementById("battleButton"),
  inventoryOpenButton: document.getElementById("inventoryOpenButton"),
  towerBattleControls: document.getElementById("towerBattleControls"),
  towerWeatherSelect: document.getElementById("towerWeatherSelect"),
  towerFloorDisplay: document.getElementById("towerFloorDisplay"),
  towerWeatherRules: document.getElementById("towerWeatherRules"),
  towerShopOpenButton: document.getElementById("towerShopOpenButton"),
  potionInventoryList: document.getElementById("potionInventoryList"),
  towerShopItems: document.getElementById("towerShopItems"),
  towerCoinBalance: document.getElementById("towerCoinBalance"),
  dropChanceDisplay: document.getElementById("dropChanceDisplay"),
  battleModal: document.getElementById("battleModal"),
  battleSetup: document.getElementById("battleSetup"),
  battleFighterGrid: document.getElementById("battleFighterGrid"),
  cardSearchInput: document.getElementById("cardSearchInput"),
  cardSortSelect: document.getElementById("cardSortSelect"),
  battleCategoryFilter: document.getElementById("battleCategoryFilter"),
  collectionCategoryFilter: document.getElementById("collectionCategoryFilter"),
  battleElementFilter: document.getElementById("battleElementFilter"),
  collectionElementFilter: document.getElementById("collectionElementFilter"),
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
  battlePlayerFloatingText: document.getElementById("battlePlayerFloatingText"),
  battlePlayerMutationBadges: document.getElementById("battlePlayerMutationBadges"),
  battlePlayerPassiveStatus: document.getElementById("battlePlayerPassiveStatus"),
  battlePlayerName: document.getElementById("battlePlayerName"),
  battlePlayerLevel: document.getElementById("battlePlayerLevel"),
  battlePlayerExpText: document.getElementById("battlePlayerExpText"),
  battlePlayerExpBar: document.getElementById("battlePlayerExpBar"),
  battlePlayerHp: document.getElementById("battlePlayerHp"),
  battlePlayerHpBar: document.getElementById("battlePlayerHpBar"),
  battlePlayerAtk: document.getElementById("battlePlayerAtk"),
  battlePlayerCombatStatus: document.getElementById("battlePlayerCombatStatus"),
  battlePlayerStatusEffects: document.getElementById("battlePlayerStatusEffects"),
  battleEnemyCard: document.getElementById("battleEnemyCard"),
  battleEnemyImage: document.getElementById("battleEnemyImage"),
  battleEnemyFallback: document.getElementById("battleEnemyFallback"),
  battleEnemyBackdrop: document.getElementById("battleEnemyBackdrop"),
  battleEnemyFloatingText: document.getElementById("battleEnemyFloatingText"),
  battleEnemyMutationBadges: document.getElementById("battleEnemyMutationBadges"),
  battleEnemyPassiveStatus: document.getElementById("battleEnemyPassiveStatus"),
  battleEnemyName: document.getElementById("battleEnemyName"),
  battleEnemyLevel: document.getElementById("battleEnemyLevel"),
  battleEnemyExpText: document.getElementById("battleEnemyExpText"),
  battleEnemyExpBar: document.getElementById("battleEnemyExpBar"),
  battleEnemyHp: document.getElementById("battleEnemyHp"),
  battleEnemyHpBar: document.getElementById("battleEnemyHpBar"),
  battleEnemyAtk: document.getElementById("battleEnemyAtk"),
  battleEnemyCombatStatus: document.getElementById("battleEnemyCombatStatus"),
  battleEnemyStatusEffects: document.getElementById("battleEnemyStatusEffects"),
  battlePlayerLineup: document.getElementById("battlePlayerLineup"),
  battleEnemyLineup: document.getElementById("battleEnemyLineup"),
  battlePlayerTeamPower: document.getElementById("battlePlayerTeamPower"),
  battleEnemyTeamPower: document.getElementById("battleEnemyTeamPower"),
  battleStatus: document.getElementById("battleStatus"),
  battleLog: document.getElementById("battleLog"),
  battleVictory: document.getElementById("battleVictory"),
  battleCloseButton: document.getElementById("battleCloseButton"),
  battleResultTitle: document.getElementById("battleResultTitle"),
  battleResultText: document.getElementById("battleResultText"),
  battleResultPower: document.getElementById("battleResultPower"),
  battleResultBaseValue: document.getElementById("battleResultBaseValue"),
  battleResultTimeBonus: document.getElementById("battleResultTimeBonus"),
  battleResultLevelDiff: document.getElementById("battleResultLevelDiff"),
  battleResultCash: document.getElementById("battleResultCash"),
  battleResultExp: document.getElementById("battleResultExp"),
  battleResultDropRate: document.getElementById("battleResultDropRate"),
  battleResultLossStatus: document.getElementById("battleResultLossStatus"),
  battleAutoAgainButton: document.getElementById("battle-again-btn"),
  autoContinueBattleToggle: document.getElementById("autoContinueBattleToggle"),
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
    migrations: {},
    achievementRewardReceipts: {},
    unlocked: {},
    mutations: {},
    inventory: {},
    equipment: [],
    upgrades: { rollSpeed: 0, luck: 0, expMulti: 0, coinMulti: 0 },
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
  const card = typeof cardOrId === 'object' ? cardOrId : getCardById(cardOrId);
  return window.CardLevelSystem.required(card, level);
}

function normalizeCardProgressRecords(rawProgress) {
  const output = {};
  if (!rawProgress || typeof rawProgress !== "object" || Array.isArray(rawProgress)) return output;

  for (const [rawId, rawRecord] of Object.entries(rawProgress)) {
    const cardId = normalizeCardId(rawId);
    if (!cardId || !getCardById(cardId)) continue;
    const source = rawRecord && typeof rawRecord === "object" ? rawRecord : { level: rawRecord };
    const level = Math.min(CARD_LEVEL_MAX, Math.max(1, Math.floor(Number(source.level) || 1)));
    const exp = Math.max(0, Math.floor(Number(source.exp) || 0));
    output[cardId] = { level, exp: level >= CARD_LEVEL_MAX ? 0 : exp };
  }
  return output;
}

function mergeLegacyPlayerCardProgress(parsed, progress) {
  const resolveId = raw => {
    const id = normalizeCardId(raw);
    return getCardById(id) ? id : parseVariantKey(id)?.cardId || '';
  };
  const record = (rawId, rawLevel, rawExp = 0) => {
    const id = resolveId(rawId), level = Math.floor(Number(rawLevel));
    if (!id || !getCardById(id) || !Number.isFinite(level) || level < 1) return;
    // Canonical progress wins; legacy containers only fill missing records.
    if (!progress[id]) progress[id] = { level: window.CardLevelSystem.normalizeLevel(level), exp: Math.max(0, Math.floor(Number(rawExp) || 0)) };
  };
  for (const field of ['cardProgress', 'cardLevels', 'levels']) {
    for (const [id, entry] of Object.entries(parsed[field] || {})) {
      record(id, typeof entry === 'object' && entry ? entry.level : entry, entry?.exp);
    }
  }
  function scan(value, inheritedId = '', depth = 0) {
    if (!value || typeof value !== 'object' || depth > 40) return;
    const id = resolveId(value.cardId ?? value.id ?? value.card?.id ?? value.variantKey ?? inheritedId);
    if ('level' in value) record(id, value.level, value.exp);
    for (const [key, entry] of Object.entries(value)) {
      if (entry && typeof entry === 'object') scan(entry, resolveId(key) || id, depth + 1);
    }
  }
  // Only player-card containers: enemy levels, Raid difficulty, item counts
  // and upgrade levels are deliberately outside the migration's scope.
  for (const field of ['inventory', 'lineup', 'lineups', 'storage', 'collection', 'cards', 'unlockedCards', 'equipment']) scan(parsed[field]);
  for (const record of Object.values(progress)) if (record.level >= CARD_LEVEL_MAX) record.exp = 0;
  return progress;
}

function getCardLevelInfo(cardOrId) {
  const card = typeof cardOrId === "object" ? cardOrId : getCardById(cardOrId);
  const cardId = normalizeCardId(card?.id ?? cardOrId);
  const source = state?.cardProgress?.[cardId];
  const level = Math.min(CARD_LEVEL_MAX, Math.max(1, Math.floor(Number(source?.level) || 1)));
  const exp = level >= CARD_LEVEL_MAX ? 0 : Math.max(0, Math.floor(Number(source?.exp) || 0)) + (window.TimeTrialSystem?.getXpCarry(cardId) || 0);
  const required = getCardLevelExpRequired(card || cardId, level);
  return { cardId, level, exp, required, maxed: level >= CARD_LEVEL_MAX, progress: level >= CARD_LEVEL_MAX ? 1 : Math.min(1, required > 0 ? exp / required : 0) };
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
  if (window.SandboxSystem?.active) return {gained:0,level:getCardLevelInfo(cardId).level,levelUps:0};
  const normalizedId = normalizeCardId(cardId);
  if (state.cardProgress?.[normalizedId]?.level >= CARD_LEVEL_MAX) return {gained:0,level:CARD_LEVEL_MAX,levelUps:0};
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  if (!normalizedId || safeAmount <= 0 || !getCardById(normalizedId)) return { gained: 0, level: getCardLevelInfo(normalizedId).level, levelUps: 0 };

  const progress = ensureCardProgress(normalizedId);
  if (!progress) return { gained: 0, level: 1, levelUps: 0 };

  const result = window.CardLevelSystem.grant(progress, getCardById(normalizedId), safeAmount);
  if (result.level >= CARD_LEVEL_MAX) window.TimeTrialSystem?.clearXpCarry(normalizedId);
  return result;
}

function getDuplicateCardRollExperience(cardOrId) {
  const card=typeof cardOrId==='object'?cardOrId:getCardById(cardOrId),id=card?.id || cardOrId;
  if(state.cardProgress?.[id]?.level>=CARD_LEVEL_MAX)return 0;
  const level=window.CardLevelSystem.normalizeLevel(state.cardProgress?.[id]?.level);
  return Math.max(1,Math.floor(window.CardLevelSystem.duplicateReward(card,level) * (1+getWeatherBonus('exp')) * (window.InventorySystem?.multiplier('exp')||1) * (1+(window.AchievementSystem?.getExpBonus(state.achievementRewardReceipts)||0)) * (window.EquipmentSystem?.expMultiplier()||1)));
}

function calculateCardRollExperience(card, mutations = []) {
  const rarityMultiplier = getCardLevelRarityMultiplier(card);
  const mutationMultiplier = getMutationMultiplier(mutations);
  return Math.max(1, Math.floor(8 * rarityMultiplier * mutationMultiplier * getExpMultiplier()));
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

  // Every unlocked card must have a concrete Normal/base variant unless all
  // copies are already represented by mutation variants. This keeps Battle
  // setup and Collection ownership consistent even for legacy saves that only
  // stored unlocked counts.
  const nonBaseTotals = {};
  for (const [key, count] of Object.entries(mergedMutations)) {
    const parsed = parseVariantKey(key);
    if (!parsed || !parsed.mutations.length) continue;
    const cardId = normalizeCardId(parsed.cardId);
    nonBaseTotals[cardId] = (nonBaseTotals[cardId] || 0) + Math.max(0, Number(count) || 0);
  }

  for (const [cardId, unlockedCount] of Object.entries(normalizedUnlocked)) {
    const baseKey = canonicalVariantKey(cardId, []);
    const remainingBase = Math.max(0, Math.floor(Number(unlockedCount) || 0) - (nonBaseTotals[cardId] || 0));
    if (remainingBase > 0) {
      mergedMutations[baseKey] = Math.max(
        Math.max(0, Number(mergedMutations[baseKey]) || 0),
        remainingBase
      );
    }
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
  window.RollPerformanceSystem?.invalidateOwnership();
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
    .filter(entry => entry && WEATHER_BY_ID[window.WeatherSystem.canonicalId(entry.weatherId)] && Number.isFinite(Number(entry.expiresAt)))
    .map(entry => ({
      weatherId: window.WeatherSystem.canonicalId(entry.weatherId),
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

  normalized.achievementRewardReceipts = Object.fromEntries(
    Object.entries(parsed.achievementRewardReceipts || {}).filter(([id, claimed]) => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id) && claimed === true)
  );
  normalized.cardProgress = mergeLegacyPlayerCardProgress(parsed, normalizeCardProgressRecords(parsed.cardProgress || parsed.cardLevels || parsed.levels));
  normalized.migrations = Object.fromEntries(Object.entries(parsed.migrations || {}).filter(([id, done]) => /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(id) && !['__proto__', 'constructor', 'prototype'].includes(id) && typeof done === 'boolean'));

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
  normalized.dropChance = Math.max(0, Math.min(20, Number(parsed.dropChance) || 0));

  normalized.upgrades.rollSpeed = Math.min(
    SPEED_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.rollSpeed) || 0))
  );
  normalized.upgrades.luck = Math.min(
    LUCK_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.luck) || 0))
  );
  normalized.upgrades.expMulti = Math.min(
    EXP_MULTI_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.expMulti ?? parsed.upgrades?.experienceMultiplier) || 0))
  );
  normalized.upgrades.coinMulti = Math.min(
    COIN_MULTI_MAX_LEVEL,
    Math.max(0, Math.floor(Number(parsed.upgrades?.coinMulti ?? parsed.upgrades?.moneyMultiplier) || 0))
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
      .filter(entry => entry && WEATHER_BY_ID[window.WeatherSystem.canonicalId(entry.weatherId)] && Number.isFinite(Number(entry.expiresAt)))
      .map(entry => ({
        weatherId: window.WeatherSystem.canonicalId(entry.weatherId),
        startedAt: Number(entry.startedAt) * 60,
        expiresAt: Number(entry.expiresAt) * 60
      }))
      .filter(entry => entry.expiresAt > normalized.weather.gameSeconds);
  } else {
    normalized.weather.active = normalizeWeatherEntries(weather, normalized.weather.gameSeconds);
  }

  // Legacy weather aliases describe the same active weather, never two buffs.
  const activeById = new Map();
  for (const entry of normalized.weather.active) if (!activeById.has(entry.weatherId) || activeById.get(entry.weatherId).expiresAt < entry.expiresAt) activeById.set(entry.weatherId,entry);
  normalized.weather.active = [...activeById.values()];

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
      "dropChance",
      "cardProgress",
      "cardLevels",
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

function saveState(canonicalOwnership = false) {
  if (isImportingSave || window.SandboxSystem?.active || window.EquipmentSystem?.blocked) return false;
  try {
    // Rolls already update all three canonical ownership stores together.
    if (!canonicalOwnership) syncOwnershipRecords();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn("Save failed:", error);
    return false;
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
  saveState(true);
  return state;
}

// ============================================================
// ECONOMY
// ============================================================

function getLuckMultiplier() {
  return (1 + state.upgrades.luck * LUCK_FACTOR + (window.AchievementSystem?.getLuckBonus(state.achievementRewardReceipts) || 0) + getWeatherBonus("luck") + (window.EquipmentSystem?.bonuses().luck || 0) + (window.QuestsSystem?.bonus("luck") || 0)) * (window.InventorySystem?.multiplier("luck") || 1);
}

function getCooldownMs() {
  return BASE_COOLDOWN_MS / ((1 + state.upgrades.rollSpeed * SPEED_FACTOR + getWeatherBonus("rollSpeed")) * (window.InventorySystem?.multiplier("speed") || 1) * (1 + (window.EquipmentSystem?.bonuses().rollSpeed || 0)));
}

function getUpgradeCost(baseCost, level) {
  return Math.floor(baseCost * Math.pow(1.65, level));
}

function calculateCardReward(chance) {
  return Math.floor(10 * Math.pow(chance, 0.45));
}

function formatCurrency(value) {
  const amount = Math.max(0, Math.floor(value));
  if (amount >= 1_000_000_000) return `💵 ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (amount >= 1_000_000) return `💵 ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (amount >= 1_000) return `💵 ${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `💵 ${amount.toLocaleString("vi-VN")}`;
}

function formatCooldown(ms) {
  return `${(Math.max(0, ms) / 1000).toFixed(2)}s`;
}

// ============================================================
// REAL-TIME CLOCK + WEATHER - OWNED BY GLOBAL TICK ONLY
// ============================================================

function getWeatherByReference(reference) {
  if (!reference) return null;
  const raw = String(reference).trim().toLowerCase();
  const normalized = window.WeatherSystem.canonicalId(raw);
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
  if (Math.random() >= Math.min(1, WEATHER_CONFIG.WEATHER_TRIGGER_CHANCE + (window.EquipmentSystem?.bonuses().weather || 0))) return false;

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

  window.QuestsSystem?.record('weather',{id:`${weather.id}_${eventSecond}`,weatherId:weather.id,tier:weather.tier,gameSecond:eventSecond});
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
  window.QuestsSystem?.tick(state.weather.gameSeconds,false);
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
    setCachedText(els.gameClock, formatGameClock(state.weather.gameSeconds));
    setCachedText(els.gameClockStatus, '1:1 REAL TIME');
  }
  renderWeatherHud(force);
}

function renderWeatherHud(force = false) {
  if (!els.activeWeatherList) return;

  const entries = getActiveWeatherEntries();
  const signature = [
    ...entries.map(entry => entry.weatherId)
  ].join("|");

  if (!force && signature === weatherHudSignature) {
    for (const entry of entries) setCachedText(weatherHudTimers.get(entry.weatherId), formatWeatherCountdown(getWeatherRemainingSeconds(entry)));
    return;
  }
  weatherHudSignature = signature;
  weatherHudTimers.clear();
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
    chip.title = `${window.WeatherSystem.describe(weather)}\n${weather.mutation.description} • Mutation success: ${(window.MutationSystem.successChance(weather,window.EquipmentSystem?.mutationMultiplier()||1)*100).toFixed(2).replace(/\.?0+$/,'')}%`;

    chip.innerHTML = `
      <span class="weather-chip__icon">${weather.icon}</span>
      <span class="weather-chip__body">
        <span class="weather-chip__headline"><strong>${escapeHtml(weather.name)}</strong><span class="weather-chip__buffs">${escapeHtml(window.WeatherSystem.describe(weather))}</span></span>
        <small>${escapeHtml(tier?.name || "Special")} • ${escapeHtml(weather.mutation.name)}</small>
      </span>
      <strong class="weather-chip__timer">${formatWeatherCountdown(getWeatherRemainingSeconds(entry))}</strong>
    `;

    weatherHudTimers.set(entry.weatherId, chip.querySelector('.weather-chip__timer'));
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

function setCachedText(node, value) {
  if (window.RollPerformanceSystem) window.RollPerformanceSystem.text(node, value);
  else if (node && node.textContent !== value) node.textContent = value;
}
function setCooldownProgress(progress) {
  const node = els.cooldownProgress; if (!node) return;
  const transform = `scaleX(${Math.max(0, Math.min(100, progress)) / 100})`;
  if (node.style.transform !== transform) node.style.transform = transform;
}
function renderCooldownUI(now = Date.now()) {
  const hidden = window.RollViewSystem?.enabled === true;
  const baseMs = getCooldownMs();
  if (els.rollButton) {
    if (els.rollButton.disabled !== isCooldownActive) els.rollButton.disabled = isCooldownActive;
    const aria = String(isCooldownActive);
    if (els.rollButton.getAttribute('aria-disabled') !== aria) els.rollButton.setAttribute('aria-disabled', aria);
  }
  if (els.cooldownProgress && els.cooldownProgress.classList.contains('is-static') !== hidden) els.cooldownProgress.classList.toggle('is-static', hidden);
  if (hidden) {
    // One stationary transform, no animation frames or per-tick width writes.
    setCooldownProgress(100);
    const interval = formatCooldown(isCooldownActive ? cooldownDurationMs : baseMs);
    setCachedText(els.cooldownValue, interval);
    setCachedText(els.cooldownLabel, isCooldownActive || isAutoRolling ? interval : 'READY');
    setCachedText(els.cooldownHint, 'Hidden rolling • fixed interval');
    return;
  }
  const remainingMs = isCooldownActive ? Math.max(0, cooldownUntil - now) : 0;
  const progress = isCooldownActive && cooldownDurationMs > 0 ? Math.min(100, Math.max(0, ((cooldownDurationMs - remainingMs) / cooldownDurationMs) * 100)) : 100;
  setCooldownProgress(progress);
  setCachedText(els.cooldownLabel, isCooldownActive ? formatCooldown(remainingMs) : 'READY');
  setCachedText(els.cooldownHint, isCooldownActive ? `Next roll in ${formatCooldown(remainingMs)}` : 'Cooldown complete');
  setCachedText(els.cooldownValue, formatCooldown(isCooldownActive ? remainingMs : baseMs));
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
  if (window.RollViewSystem?.enabled) return;
  const frame = () => {
    if (window.RollViewSystem?.enabled) { cooldownVisualFrame = null; return; }
    if (!isCooldownActive) {
      setCooldownProgress(100);
      cooldownVisualFrame = null;
      return;
    }
    const now = Date.now();
    const remainingMs = Math.max(0, cooldownUntil - now);
    const progress = cooldownDurationMs > 0
      ? Math.min(100, Math.max(0, ((cooldownDurationMs - remainingMs) / cooldownDurationMs) * 100))
      : 100;
    setCooldownProgress(progress);
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

  // Immediate Auto-Roll on cooldown expiration. The global tick also checks
  // this condition, so a throttled browser cannot strand Auto Roll.
  if (isAutoRolling && attemptAutoRoll()) return true;
  renderCooldownUI(now);
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

function isCardRollUnlocked(card) {
  if (card.raidOnly || card.bossEventOnly || !(Number(card.chance) > 0)) return false;
  return !card.unlockRequirement || window.AchievementSystem?.isUnlocked(card.unlockRequirement) || state.achievementRewardReceipts?.[card.unlockRequirement] === true;
}

function isCardWeatherAvailable(card) {
  if (card.towerType === 'normal' && card.unlockRequirement) return getActiveWeatherDefinitions().length === 0;
  const weather = card.requiredWeathers || (card.requiredWeather ? [card.requiredWeather] : []);
  return !weather.length || weather.some(name => isWeatherActive(name === 'Mangekyo' ? 'Tsukuyomi' : name));
}
function buildEligibleRollPool() {
  return [...ALL_CARDS]
    .filter(card => isCardRollUnlocked(card) && isCardWeatherAvailable(card))
    .sort((a, b) => b.chance - a.chance);
}

function getSortedCardsForRolling() {
  const cache = window.RollPerformanceSystem;
  if (!cache) return buildEligibleRollPool();
  const key = getActiveWeatherDefinitions().map(weather => weather.id).sort().join(',') + '|' + cache.unlockKey(isCardRollUnlocked);
  return cache.pool(key, buildEligibleRollPool);
}

function getEffectiveChance(card, luck = getLuckMultiplier()) {
  return Math.max(0.000001, card.chance / luck);
}

function drawCardFromPool() {
  const luck = getLuckMultiplier();
  for (const card of getSortedCardsForRolling()) {
    const effectiveChance = getEffectiveChance(card, luck);
    const hitProbability = Math.min(1, 1 / effectiveChance);
    if (Math.random() < hitProbability) {
      return { card, effectiveChance, score: hitProbability };
    }
  }
  return { card: null, effectiveChance: null, score: 0 };
}

function rollMutations() {
  return window.MutationSystem.roll(getActiveWeatherDefinitions(), Math.random, window.EquipmentSystem?.mutationMultiplier() || 1);
}
function getWeatherBonus(stat) {
  return window.WeatherSystem.bonus(getActiveWeatherDefinitions(), stat);
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
  const mutationStats = window.MutationSystem.factors(safeMutations);
  const levelInfo = getCardLevelInfo(card);
  const levelMultiplier = getCardLevelStatMultiplier(card);
  const prefix = safeMutations
    .map(mutation => String(mutation?.name || ""))
    .filter(Boolean)
    .map(name => `[${name}]`)
    .join(" ");
  return {
    name: prefix ? `${prefix} ${String(card?.name || "Unknown Card")}` : String(card?.name || "Unknown Card"),
    hp: Math.max(0, Math.round((Number(card?.stats?.hp) || 0) * mutationStats.hp * levelMultiplier)),
    atk: Math.max(0, Math.round((Number(card?.stats?.atk) || 0) * mutationStats.atk * levelMultiplier)),
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
  if (isCooldownActive || window.SandboxSystem?.active || window.EquipmentSystem?.blocked) return false;
  if (source === "auto" && !isAutoRolling) return false;

  // Lock immediately so a second synchronous event cannot enter.
  startCooldown();
  window.RollViewSystem?.beginRoll?.();

  try {
    // Catch up any sub-second drift without making gameplay depend on clicks.
    syncGameClockToNow();

    const result = drawCardFromPool();
    const questRollEvent = { startedAt: Date.now(), weatherIds: getActiveWeatherDefinitions().map(w => w.id), cardId: result.card?.id || null, mutationIds: [] };
    state.totalRolls += 1;

    let visualResult = null;
    if (result.card) {
      const mutations = rollMutations();
      questRollEvent.mutationIds = mutations.map(m => m.id);
      const variantKey = getVariantKey(result.card.id, mutations);
      const cardId = normalizeCardId(result.card.id);
      const ownedBeforeRoll = window.RollPerformanceSystem ? window.RollPerformanceSystem.hasCard(state, cardId) : getOwnedCardCount(cardId) > 0;
      const variantOwnedBeforeRoll = window.RollPerformanceSystem ? window.RollPerformanceSystem.hasVariant(state, variantKey) : getVariantEntries(cardId).some(entry => entry.key === variantKey && entry.count > 0);
      const isNewCardOrMutation = !ownedBeforeRoll || (mutations.length > 0 && !variantOwnedBeforeRoll);
      const revealRolledCard = (window.RollViewSystem?.cardResult?.(result.card, result.effectiveChance, mutations, isNewCardOrMutation) ?? true);
      const levelInfoBeforeRoll = revealRolledCard ? getCardLevelInfo(result.card) : null;
      const duplicateXp = ownedBeforeRoll
        ? getDuplicateCardRollExperience(result.card)
        : 0;
      const rollExp = state.cardProgress?.[cardId]?.level >= CARD_LEVEL_MAX ? 0 : ownedBeforeRoll
        ? duplicateXp
        : calculateCardRollExperience(result.card, mutations);
      const levelResult = grantCardExperience(cardId, rollExp);
      window.PassiveSystem?.onRoll?.({ card: result.card, result, mutations, source, duplicate: ownedBeforeRoll, xpAward: rollExp });

      state.lastResultId = cardId;
      state.unlocked[cardId] = getUnlockedCountById(cardId) + 1;
      state.mutations[variantKey] = (state.mutations[variantKey] || 0) + 1;
      const inventoryEntry = state.inventory[variantKey];
      if (inventoryEntry) {
        inventoryEntry.count = Math.max(0, Math.floor(Number(inventoryEntry.count) || 0)) + 1;
      } else {
        const mutationIds = parseVariantKey(variantKey).mutationIds;
        state.inventory[variantKey] = {
          id: cardId,
          cardId,
          mutation: mutationIds.join("+"),
          mutationIds,
          count: 1
        };
      }

      window.RollPerformanceSystem?.acquired(state, cardId, variantKey);
      if (revealRolledCard) visualResult = {card:result.card,chance:result.effectiveChance,mutations,ownedBeforeRoll,rollExp,levelResult,levelInfoBeforeRoll};
    } else {
      state.lastResultId = null;
      if (window.RollViewSystem?.missResult?.(result.score) ?? true) visualResult = {score:result.score};
    }

    if (saveState(true)) {
      window.QuestSystem.record('roll', {...questRollEvent,id:String(state.totalRolls)});
      if(result.card)window.DropAudioSystem?.play(result.card.id);
    }
    refreshAchievements(false);
    collectionNeedsRefresh = true;
    rollUiDirty = true;
    rollUiCanPaint = Boolean(visualResult);
    pendingRollPresentation = visualResult;
    if (rollUiCanPaint) scheduleRollUi();
    return true;
  } finally {
    // The cooldown remains authoritative after the result is processed.
    renderCooldownUI(Date.now());
  }
}

function scheduleRollUi() {
  if (window.RollPerformanceSystem) window.RollPerformanceSystem.schedule(flushRollUi);
  else flushRollUi();
}
function flushRollUi(force = false) {
  if (isImportingSave || window.SandboxSystem?.active || (!force && !rollUiCanPaint)) return;
  if (!rollUiDirty && !pendingRollPresentation) return;
  const presentation = pendingRollPresentation;
  pendingRollPresentation = null; rollUiDirty = false;
  if (presentation) {
    if (window.RollViewSystem?.presentLast) window.RollViewSystem.presentLast();
    else if (presentation.card) showResult(presentation.card, presentation.chance, presentation.mutations);
    else showMiss(presentation.score);
    if (presentation.card) {
      const {mutations,ownedBeforeRoll,rollExp,levelResult,levelInfoBeforeRoll} = presentation;
      showRewardToast(0, mutations);
      if (els.rewardToast) {
        const mutationText = mutations.map(m => String(m?.name || '')).filter(Boolean).join(' + ');
        const xpLabel = ownedBeforeRoll ? `DUPLICATE • +${rollExp.toLocaleString('en-US')} XP (50% of Lv.${levelInfoBeforeRoll.level} requirement)` : `CARD ACQUIRED • +${levelResult.gained.toLocaleString('en-US')} EXP`;
        els.rewardToast.textContent = `${mutationText ? `✦ ${mutationText} • ` : ''}${xpLabel}`;
      }
    }
  }
  updateStats(); refreshAchievements();
  if (els.upgradesModal && !els.upgradesModal.classList.contains('hidden')) renderUpgradeShop();
  if (!isAutoRolling && els.collectionModal && !els.collectionModal.classList.contains('hidden')) { collectionNeedsRefresh = false; renderCollection(); }
}
function onRollViewModeChange() {
  stopCooldownVisualLoop(); renderCooldownUI(Date.now());
  if (!window.RollViewSystem?.enabled) {
    pendingRollPresentation = null; flushRollUi(true);
    if (isCooldownActive) runCooldownVisualLoop();
  }
}

function attemptAutoRoll() {
  if (!isAutoRolling || isCooldownActive) return false;
  return rollCard("auto");
}

// ============================================================
// MAIN RESULT RENDERING
// ============================================================

function setViewText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function showResult(card, effectiveChance, mutations = []) {
  if (!card || !els.resultCard) return;
  const display = getDisplayCard(card, mutations);
  els.emptyState?.classList.add("hidden");
  els.missState?.classList.add("hidden");
  els.resultCard?.classList.remove("hidden", "pop-in");
  void els.resultCard?.offsetWidth;
  els.resultCard?.classList.add("pop-in");

  if (els.resultName) els.resultName.textContent = display.name;
  window.ElementSystem?.renderBadge?.(els.resultCard?.querySelector(".tcg-card__header"), card);
  if (els.resultRarity) els.resultRarity.textContent = card.rarity;
  if (els.resultChance) els.resultChance.textContent = card.chance.toLocaleString("en-US");
  if (els.resultHp) els.resultHp.textContent = display.hp.toLocaleString("en-US");
  if (els.resultAtk) els.resultAtk.textContent = display.atk.toLocaleString("en-US");
  if (els.resultPassiveName) els.resultPassiveName.textContent = getCardPassiveCopy(card).name || "No passive";
  if (els.resultPassiveDescription) renderPassiveCopy(els.resultPassiveDescription, getCardPassiveCopy(card).name, getCardPassiveCopy(card).description);

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
  els.rewardToast.textContent = `${prefix}${formatCurrency(reward)}`;
  els.rewardToast.classList.remove("show");
  void els.rewardToast.offsetWidth;
  els.rewardToast.classList.add("show");
  toastTimer = window.setTimeout(() => els.rewardToast.classList.remove("show"), 1500);
}

function showCurrencyToast(amount, message = "") {
  if (!els.rewardToast) return;
  clearTimeout(toastTimer);
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0));
  els.rewardToast.textContent = message
    ? `${message} • ${formatCurrency(safeAmount)}`
    : `${formatCurrency(safeAmount)}`;
  els.rewardToast.classList.remove("show");
  void els.rewardToast.offsetWidth;
  els.rewardToast.classList.add("show");
  toastTimer = window.setTimeout(() => els.rewardToast.classList.remove("show"), 1800);
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
  return window.RollPerformanceSystem ? window.RollPerformanceSystem.unique(state) : ALL_CARDS.filter(card => getOwnedCardCount(card.id) > 0).length;
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

  const element = els.collectionElementFilter?.value || "all";
  const filteredCards = ALL_CARDS.filter(card => {
    if (element !== "all" && card.element !== element) return false;
    if (!window.CategorySystem.matches(card,els.collectionCategoryFilter?.value)) return false;
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

      const searchText = `${safeName} ${safePassive} ${mutationText} ${card.category.join(" ")}`.toLowerCase();
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

      if (sort === "category") return window.CategorySystem.compare(a,b) || nameA.localeCompare(nameB);
      if (sort === "element") return window.ElementSystem.compare(a, b) || nameA.localeCompare(nameB);
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

function getAvailableRollPool() { return getSortedCardsForRolling(); }

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
  const signature = pool.map(card => card.id).join(',') + '|' + uniqueWeatherNames.join(',');
  if (signature === availableRollUiSignature) return;
  availableRollUiSignature = signature;
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
    window.ElementSystem.renderBadge(title, card);

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
        ? `Owned x${count} • Open dedicated preview`
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
      window.ElementSystem.renderBadge(titleRow, card);

      const meta = document.createElement("div");
      meta.className = "collection-mini__meta";
      const passiveMini = document.createElement("div");
      passiveMini.className = "collection-passive-mini";
      const mysteryQuest = card.questOnly && !isCardRollUnlocked(card);
      passiveMini.textContent = mysteryQuest ? 'Quest Card • Passive hidden' : getCardPassiveCopy(card).name;
      passiveMini.title = mysteryQuest ? 'Complete this card’s quest to reveal its passive.' : normalizePassiveText(getCardPassiveCopy(card).description);
      if (!mysteryQuest) passiveMini.appendChild(createPassiveExpandButton(getCardPassiveCopy(card).name, getCardPassiveCopy(card).description));
      const rate = document.createElement("span");
      rate.className = "collection-mini__rate";
      rate.textContent = `1 in ${chance.toLocaleString("en-US")}`;
      meta.append(rate);

      if (card?.requiredWeather) {
        const requirement = document.createElement("span");
        requirement.className = `weather-requirement ${isCardWeatherAvailable(card) ? "active" : ""}`;
        requirement.textContent = `Requires ${getWeatherByReference(card.requiredWeather)?.name || card.requiredWeather}`;
        meta.appendChild(requirement);
      }
      if (card?.raidOnly) {
        const requirement = document.createElement('span'); requirement.className = 'weather-requirement active';
        requirement.textContent = 'Marine Ford Raid exclusive • Never in normal RNG'; meta.appendChild(requirement);
      } else if (card?.unlockRequirement) {
        const requirement = document.createElement('span');
        requirement.className = `weather-requirement ${isCardRollUnlocked(card) ? 'active' : ''}`;
        requirement.textContent = `${isCardRollUnlocked(card) ? 'Unlocked' : 'Requires'}: ${card.questOnly ? 'Complete Quest Cards in the utility menu' : window.AchievementSystem?.requirementLabel(card.unlockRequirement) || card.unlockRequirement}`;
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
          badge.textContent = `${safeMutationNames.length ? safeMutationNames.join(" + ") : "Normal"} x${Math.max(0, Number(entry?.count) || 0).toLocaleString("en-US")}`;
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
          ? `${fallbackMutationNames.length ? fallbackMutationNames.join(" + ") : "Normal"} x${Math.max(0, Number(count) || 0).toLocaleString("en-US")}`
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
      expText.textContent = owned ? levelInfo.maxed ? "MAX LEVEL" : `${Number(levelInfo.exp.toFixed(2))}/${levelInfo.required} EXP` : "";
      const expTrack = document.createElement("div");
      expTrack.className = "card-level-mini__track";
      const expFill = document.createElement("div");
      expFill.className = "card-level-mini__fill";
      expFill.style.width = `${Math.round((levelInfo.progress || 0) * 100)}%`;
      expTrack.appendChild(expFill);
      levelWrap.append(levelLabel, expText, expTrack);

      body.append(titleRow, meta, passiveMini, badgeList, levelWrap);
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

  window.RollPerformanceSystem?.invalidateOwnership();
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
  const scaledCash = getScaledCoinReward(cash);
  state.currency = Math.max(0, Number(state.currency) || 0) + scaledCash;
  recordEarnedCurrency(scaledCash);
  refreshAchievements();
  return { removed: actualRemoved, cash: scaledCash, baseCash: cash };
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

function salvageAllExtraDuplicates() {
  let removed = 0;
  let cash = 0;

  for (const card of ALL_CARDS) {
    const variants = getVariantEntries(card.id);
    if (!variants.length) continue;

    for (const entry of variants) {
      const extras = Math.max(0, entry.count - 1);
      if (!extras) continue;
      const result = salvageVariantCopies(card.id, entry.key, extras);
      removed += result.removed;
      cash += result.cash;
    }
  }

  return { removed, cash };
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
  showCurrencyToast(result.cash, "Card salvaged");
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
  showCurrencyToast(result.cash, "Extra duplicates salvaged");
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
  return window.RollPerformanceSystem ? window.RollPerformanceSystem.card(targetId) : ALL_CARDS.find(card => normalizeCardId(card?.id) === targetId) || null;
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
  if (els.previewExpText) els.previewExpText.textContent = levelInfo.maxed ? "MAX LEVEL" : `${Number(levelInfo.exp.toFixed(2))}/${levelInfo.required} EXP`;
  if (els.previewExpBar) els.previewExpBar.style.width = `${Math.round(levelInfo.progress * 100)}%`;
  if (els.previewSalvageButton) els.previewSalvageButton.disabled = variant.count <= 0;
  if (els.previewSalvageExtrasButton) els.previewSalvageExtrasButton.disabled = !getPreviewVariants(card.id).some(entry => entry.count > 1);
  els.previewName.textContent = display.name;
  window.ElementSystem.renderBadge(els.previewCard?.querySelector(".tcg-card__header"), card);
  els.previewRarity.textContent = card.rarity;
  els.previewVariantCount.textContent = `x${variant.count}`;
  els.previewHp.textContent = display.hp.toLocaleString("en-US");
  els.previewAtk.textContent = display.atk.toLocaleString("en-US");
  els.previewPassiveName.textContent = getCardPassiveCopy(card).name || "No passive";
  renderPassiveCopy(els.previewPassiveDescription, getCardPassiveCopy(card).name, getCardPassiveCopy(card).description);
  const previewMutations = normalizeMutationObjects(variant.mutations);
  els.previewVariantLabel.textContent = previewMutations.length
    ? previewMutations.map(mutation => String(mutation?.name || "")).filter(Boolean).join(" + ")
    : "Normal Variant";
  els.previewCollectedCount.textContent = `x${getOwnedCardCount(card.id).toLocaleString("en-US")} total`;
  els.previewRequirement.textContent = card.raidOnly ? 'Marine Ford Raid exclusive • Once per card • Never available in normal RNG' : card.unlockRequirement
    ? `${card.questOnly ? 'Complete Quest Cards in the utility menu' : window.AchievementSystem?.requirementLabel(card.unlockRequirement) || card.unlockRequirement} • Permanently unlocked in the standard pool`
    : card.requiredWeather ? `Requires ${getWeatherByReference(card.requiredWeather)?.name || card.requiredWeather}` : 'Available in the standard pool';

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
      <small>x${variant.count}</small>
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

function getExpMultiplier(source = 'all') {
  const level = Math.max(0, Math.floor(Number(state?.upgrades?.expMulti) || 0));
  return (1 + (level * EXP_MULTI_LINEAR) + (Math.pow(level, EXP_MULTI_EXPONENT) * EXP_MULTI_CURVE) + (window.AchievementSystem?.getExpBonus(state.achievementRewardReceipts) || 0)) * (window.InventorySystem?.multiplier("exp") || 1) * (1 + getWeatherBonus("exp")) * (window.EquipmentSystem?.expMultiplier(source) || 1);
}

function getCoinMultiplier(includeWeather = true, source = 'all') {
  const level = Math.max(0, Math.floor(Number(state?.upgrades?.coinMulti) || 0));
  return (1 + (level * COIN_MULTI_LINEAR) + (Math.pow(level, COIN_MULTI_EXPONENT) * COIN_MULTI_CURVE) + (window.AchievementSystem?.getCoinBonus(state.achievementRewardReceipts) || 0)) * (window.InventorySystem?.multiplier("rich") || 1) * (includeWeather ? 1 + getWeatherBonus("coins") : 1) * (window.EquipmentSystem?.moneyMultiplier(source) || 1);
}

function getProgressionUpgradeCost(type, level) {
  const safeLevel = Math.max(0, Math.floor(Number(level) || 0));
  if (type === "expMulti") return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(EXP_MULTI_BASE_COST * Math.pow(EXP_MULTI_COST_FACTOR, safeLevel)));
  if (type === "coinMulti") return Math.min(Number.MAX_SAFE_INTEGER, Math.floor(COIN_MULTI_BASE_COST * Math.pow(COIN_MULTI_COST_FACTOR, safeLevel)));
  return 0;
}

function getScaledCoinReward(baseValue) {
  const base = Math.max(0, Math.floor(Number(baseValue) || 0));
  return Math.max(0, Math.floor(base * getCoinMultiplier()));
}

function getScaledExpReward(baseValue, source = 'all') {
  const base = Math.max(0, Math.floor(Number(baseValue) || 0));
  return Math.max(0, Math.floor(base * getExpMultiplier(source)));
}

function updateStats() {
  const unique = getUniqueCount();
  setCachedText(els.totalRolls, state.totalRolls.toLocaleString('en-US'));
  setCachedText(els.currencyValue, formatCurrency(state.currency));
  setCachedText(els.collectionSummary, `Cards: ${unique}/${ALL_CARDS.length}`);
  setCachedText(els.luckValue, `${getLuckMultiplier().toFixed(2)}x`);
  setCachedText(els.collectionModalCount, `${unique}/${ALL_CARDS.length}`);
  renderCooldownUI(Date.now());
}

function renderUpgradeShop() {
  const speedLevel = state.upgrades.rollSpeed;
  const luckLevel = state.upgrades.luck;
  const expLevel = state.upgrades.expMulti;
  const coinLevel = state.upgrades.coinMulti;
  const speedMaxed = speedLevel >= SPEED_MAX_LEVEL;
  const luckMaxed = luckLevel >= LUCK_MAX_LEVEL;
  const expMaxed = expLevel >= EXP_MULTI_MAX_LEVEL;
  const coinMaxed = coinLevel >= COIN_MULTI_MAX_LEVEL;
  const speedCost = getUpgradeCost(SPEED_BASE_COST, speedLevel);
  const luckCost = getUpgradeCost(LUCK_BASE_COST, luckLevel);
  const expCost = getProgressionUpgradeCost("expMulti", expLevel);
  const coinCost = getProgressionUpgradeCost("coinMulti", coinLevel);

  if (els.shopCurrency) els.shopCurrency.textContent = `${formatCurrency(state.currency)}`;
  if (els.speedLevel) els.speedLevel.textContent = `Lv. ${speedLevel}/${SPEED_MAX_LEVEL}`;
  if (els.speedCurrent) els.speedCurrent.textContent = speedMaxed ? "MAX" : formatCooldown(getCooldownMs());
  if (els.luckLevel) els.luckLevel.textContent = `Lv. ${luckLevel}/${LUCK_MAX_LEVEL}`;
  if (els.luckCurrent) els.luckCurrent.textContent = `${getLuckMultiplier().toFixed(2)}x`;
  if (els.expMultiLevel) els.expMultiLevel.textContent = `Lv. ${expLevel}/${EXP_MULTI_MAX_LEVEL}`;
  if (els.expMultiCurrent) els.expMultiCurrent.textContent = `${getExpMultiplier().toFixed(2)}x EXP`;
  if (els.coinMultiLevel) els.coinMultiLevel.textContent = `Lv. ${coinLevel}/${COIN_MULTI_MAX_LEVEL}`;
  if (els.coinMultiCurrent) els.coinMultiCurrent.textContent = `${getCoinMultiplier().toFixed(2)}x 💵`;

  configureBuyButton(els.buySpeedButton, speedMaxed, speedCost, "roll speed");
  configureBuyButton(els.buyLuckButton, luckMaxed, luckCost, "luck");
  configureBuyButton(els.buyExpMultiButton, expMaxed, expCost, "EXP multiplier");
  configureBuyButton(els.buyCoinMultiButton, coinMaxed, coinCost, "💵 multiplier");
}

function configureBuyButton(button, isMaxed, cost, label) {
  if (!button) return;
  const card = button.closest('.upgrade-card');
  const unaffordable = !isMaxed && Number(state.currency) < Number(cost);
  if (isMaxed) {
    button.textContent = "MAX LEVEL";
    button.dataset.upgradeType = button === els.buyExpMultiButton ? "EXP_MULTI" : button === els.buyCoinMultiButton ? "COIN_MULTI" : "";
    button.disabled = true;
    button.classList.remove('disabled-upgrade');
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('tabindex', '-1');
    card?.classList.remove('unaffordable');
    card?.classList.add('upgrade-maxed');
    return;
  }
  button.textContent = `Upgrade ${label} • ${formatCurrency(cost)}`;
  button.dataset.upgradeType = button === els.buyExpMultiButton ? "EXP_MULTI" : button === els.buyCoinMultiButton ? "COIN_MULTI" : "";
  button.disabled = unaffordable;
  button.classList.toggle('disabled-upgrade', unaffordable);
  button.setAttribute('aria-disabled', String(unaffordable));
  button.setAttribute('tabindex', unaffordable ? '-1' : '0');
  card?.classList.toggle('unaffordable', unaffordable);
  card?.classList.remove('upgrade-maxed');
}

function upgrade(type) {
  const normalized = String(type || "").toUpperCase();
  if (normalized === "EXP_MULTI") return purchaseUpgrade("expMulti");
  if (normalized === "COIN_MULTI") return purchaseUpgrade("coinMulti");
  if (normalized === "ROLL_SPEED") return purchaseUpgrade("rollSpeed");
  if (normalized === "LUCK") return purchaseUpgrade("luck");
  return false;
}

function purchaseUpgrade(type) {
  const supported = ["rollSpeed", "luck", "expMulti", "coinMulti"];
  if (!supported.includes(type)) return;

  if (type === "expMulti" || type === "coinMulti") {
    const maxLevel = type === "expMulti" ? EXP_MULTI_MAX_LEVEL : COIN_MULTI_MAX_LEVEL;
    const level = Math.max(0, Math.floor(Number(state.upgrades[type]) || 0));
    if (level >= maxLevel) return;

    const cost = getProgressionUpgradeCost(type, level);
    if (state.currency < cost) return;

    state.currency -= cost;
    state.upgrades[type] = level + 1;
    saveState();
    updateStats();
    renderUpgradeShop();
    return;
  }

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

const BATTLE_EXP_BASE = Object.freeze({
  '4v4': Object.freeze({ min: 6, max: 10 }),
  '1v1': Object.freeze({ min: 2, max: 5 })
});
const BATTLE_TURN_MS = 3000;
const AUTO_CONTINUE_DELAY_MS = 1500;
const AUTO_CONTINUE_STORAGE_KEY = "anime_card_rng_auto_continue_battle";
const BATTLE_TEAM_SIZE = 4;
const BATTLE_ENEMY_MUTATION_CHANCE = 0.70;
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
  const mutationStats = window.MutationSystem.factors(safeMutations);
  const safeLevel = clampBattleEnemyLevel(enemyLevel);
  const levelMultiplier = 1 + Math.max(0, safeLevel - 1) * CARD_LEVEL_STAT_GROWTH;
  const prefix = safeMutations
    .map(mutation => String(mutation?.name || ""))
    .filter(Boolean)
    .map(name => `[${name}]`)
    .join(" + ");
  return {
    name: prefix ? `${prefix} ${String(card?.name || "Unknown Card")}` : String(card?.name || "Unknown Card"),
    hp: Math.max(1, Math.round((Number(card?.stats?.hp) || 0) * mutationStats.hp * levelMultiplier)),
    atk: Math.max(1, Math.round((Number(card?.stats?.atk) || 0) * mutationStats.atk * levelMultiplier)),
    reward: Math.max(0, Math.floor(calculateCardReward(Number(card?.chance) || 0) * mutationMultiplier)),
    level: safeLevel,
    exp: 0,
    expRequired: getCardLevelExpRequired(card, safeLevel),
    expProgress: 0
  };
}

function getBattleMode() {
  return ['1v1', 'tower', 'time-trial', 'exp-time-trial', 'raid', 'boss-event'].includes(battleState?.mode) ? battleState.mode : '4v4';
}

function getBattleTeamSize() {
  return isBossEventBattle() ? 5 : isOneVsOneBattle() ? 1 : BATTLE_TEAM_SIZE;
}

function isOneVsOneBattle() {
  return getBattleMode() === '1v1' || window.TimeTrialSystem?.isExp(getBattleMode());
}

function isTowerBattle() { return getBattleMode() === 'tower'; }
function getTowerWeatherMode() { return String(els.towerWeatherSelect?.value || 'normal'); }

function isBossEventBattle() { return getBattleMode() === 'boss-event'; }
function getBossEventType() { return battleState?.bossEvent?.type || document.getElementById('bossEventTypeSelect')?.value || 'alucard'; }
function isRaidBattle() { return getBattleMode() === 'raid'; }
function getRaidType() { return battleState?.raid?.type || document.getElementById('raidTypeSelect')?.value || 'marine_fort'; }
function getUnitBattleLevel(unit) { return unit?.isRaidEnemy || unit?.isBossEventEnemy ? Math.max(1, Math.min(1000, Number(unit.level) || 1)) : clampBattleEnemyLevel(unit?.level); }

function isTimeTrialBattle() { return Boolean(window.TimeTrialSystem?.isMode(getBattleMode())); }
function getBattleTurnMs() { return isTimeTrialBattle() ? window.TimeTrialSystem.turnMs(getBattleMode()) : window.InventorySystem?.combatTurnMs(BATTLE_TURN_MS) || BATTLE_TURN_MS; }
function getBattleModeLabel() {
  const timing = `${getBattleTurnMs() / 1000}s TURNS`;
  if (isBossEventBattle()) return `${window.BossEventSystem.TYPES[getBossEventType()].name.toUpperCase()} • DIFF ${battleState?.bossEvent?.difficulty || window.BossEventSystem.snapshot(getBossEventType()).difficulty} • 5 vs 1 • ${timing}`;
  if (isRaidBattle()) return `${window.RaidSystem.TYPES[getRaidType()].name.toUpperCase()} • DIFF ${battleState?.raid?.difficulty || window.RaidSystem.snapshot(getRaidType()).difficulty} • 4 vs 10 • ${timing}`;
  if (isTimeTrialBattle()) return `${window.TimeTrialSystem.isExp(getBattleMode()) ? 'EXP TIME TRIAL • 1V1' : `TIME TRIAL • ROOM ${battleState?.trial?.room || window.TimeTrialSystem.room} • 4V4`} • ${timing}`;
  return isTowerBattle() ? `TOWER ${battleState?.towerFloor || window.TowerSystem?.nextFloor(getTowerWeatherMode()) || 1} • 4V4 • ${timing}` : `${isOneVsOneBattle() ? '1V1' : '4V4'} • ${timing}`;
}

let battleState = null;
let battleTurnTimer = null;
let autoContinueBattleTimer = null;
let autoContinueBattleEnabled = false;
try { autoContinueBattleEnabled = localStorage.getItem(AUTO_CONTINUE_STORAGE_KEY) === 'true'; }
catch (error) { console.warn('Could not load Auto Continue preference:', error); }

function clearAutoContinueBattleTimer() {
  if (autoContinueBattleTimer !== null) window.clearTimeout(autoContinueBattleTimer);
  autoContinueBattleTimer = null;
}

function renderAutoContinueBattleToggle() {
  if (els.autoContinueBattleToggle) els.autoContinueBattleToggle.checked = autoContinueBattleEnabled;
  const label = document.getElementById('autoContinueBattleState');
  if (label) label.textContent = autoContinueBattleEnabled ? 'ON' : 'OFF';
}

function scheduleAutoContinueBattle() {
  clearAutoContinueBattleTimer();
  const completedBattle = battleState;
  if (!autoContinueBattleEnabled || !completedBattle?.finished || !['victory','defeat'].includes(completedBattle.outcome) || !canReplayBattleTeam()) return;
  autoContinueBattleTimer = window.setTimeout(() => {
    autoContinueBattleTimer = null;
    if (!autoContinueBattleEnabled || isImportingSave || saveTransferBusy || battleState !== completedBattle ||
        !completedBattle.finished || !['victory','defeat'].includes(completedBattle.outcome) ||
        els.battleModal?.classList.contains('hidden') || !canReplayBattleTeam()) return;
    startBattle(true);
  }, AUTO_CONTINUE_DELAY_MS);
}

const battleAnimationTimers = new Set();
// Do not persist this encounter hint: it only prevents immediate same-opponent
// repetition while preserving fresh random selection every new battle.
let lastBattleOpponentCardId = null;
let lastBattleOpponentTeamSignature = '';
let lastBattleOutcome = null;

function clearBattleTurnTimer() {
  if (battleTurnTimer !== null) {
    window.clearTimeout(battleTurnTimer);
    battleTurnTimer = null;
  }
}

function clearBattleAnimationTimers() {
  for (const timerId of battleAnimationTimers) {
    try {
      window.clearTimeout(timerId);
    } catch (error) {
      console.warn('Battle animation timer cleanup failed safely:', error);
    }
  }
  battleAnimationTimers.clear();
}

function scheduleBattleAnimation(callback, delay) {
  const timerId = window.setTimeout(() => {
    battleAnimationTimers.delete(timerId);
    try {
      callback();
    } catch (error) {
      console.warn('Battle animation callback failed safely:', error);
    }
  }, Math.max(0, Number(delay) || 0));
  battleAnimationTimers.add(timerId);
  return timerId;
}

function getUnlockedBattleCards() {
  return ALL_CARDS.filter(card => getOwnedCardCount(card.id) > 0 && (!isTowerBattle() || getVariantEntries(card.id).some(entry => window.TowerSystem?.eligiblePlayerCard(card, entry, getTowerWeatherMode(), WEATHERS))));
}

function getBattleVariantEntries(cardId) {
  return getVariantEntries(cardId)
    .filter(entry => entry.count > 0 && (!isTowerBattle() || window.TowerSystem?.eligiblePlayerCard(getCardById(cardId), entry, getTowerWeatherMode(), WEATHERS)))
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
  const card=getCardById(cardId),stat=els.cardSortSelect?.value==='hp'?'hp':'atk';
  return getBattleVariantEntries(cardId).filter(entry=>getAvailableBattleVariantCount(entry.key,excludeIndex)>0).map(entry=>({entry,value:getBattleVariantDisplay(card,entry)[stat]})).sort((a,b)=>b.value-a.value||a.entry.key.localeCompare(b.entry.key))[0]?.entry || null;
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
  document.getElementById('aquaBattleChoice')?.classList.toggle('hidden', !getBattleSetupTeam().some(slot => slot?.cardId === 'tower-champion-raining'));
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
      window.ElementSystem.renderBadge(name, card);
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

function getBattleCardRarityValue(card) {
  return rarityOrder[String(card?.rarity || 'Common')] ?? -1;
}

function getStrongestBattleVariant(card, stat = 'atk') {
  let best = null;
  for (const entry of getBattleVariantEntries(card.id)) {
    const display = getBattleVariantDisplay(card, entry);
    if (!best || display[stat] > best.display[stat] || (display[stat] === best.display[stat] && entry.key < best.entry.key)) best = { entry, display };
  }
  return best;
}

function getFilteredSortedBattleCards() {
  const query = String(els.cardSearchInput?.value || '').trim().toLowerCase();
  const sortMode = String(els.cardSortSelect?.value || 'atk');
  const element = els.battleElementFilter?.value || 'all';
  const cards = getUnlockedBattleCards().filter(card => (element === 'all' || card.element === element) && window.CategorySystem.matches(card,els.battleCategoryFilter?.value) && (!query || `${card.name} ${card.category.join(' ')}`.toLowerCase().includes(query)));
  // Compute once per card per render, never inside the sort comparator.
  const stat = sortMode === 'hp' ? 'hp' : 'atk';
  const values = new Map(cards.map(card => [card.id, getStrongestBattleVariant(card, stat)?.display[stat] || 0]));
  cards.sort((a,b) => {
    const name = () => a.name.localeCompare(b.name);
    if (sortMode === 'category') return window.CategorySystem.compare(a,b) || name();
    if (sortMode === 'element') return window.ElementSystem.compare(a,b) || name();
    if (sortMode === 'name') return name();
    if (sortMode === 'rarity') return getBattleCardRarityValue(b) - getBattleCardRarityValue(a) || (Number(b.chance)||0)-(Number(a.chance)||0) || name();
    return values.get(b.id) - values.get(a.id) || name();
  });
  return cards;
}

function populateBattleFighterSelect() {
  const grid = els.battleFighterGrid;
  if (!grid) return;

  const unlocked = getFilteredSortedBattleCards();
  const previousTeam = Array.isArray(battleState?.setup?.team) ? battleState.setup.team.map(slot => ({ ...slot })) : [];
  const previousActive = Number(battleState?.setup?.activeIndex || 0);
  const previousMode = getBattleMode();
  grid.innerHTML = '';

  clearBattleTurnTimer();
  battleState = {
    mode: previousMode,
    setup: { team: previousTeam, activeIndex: previousActive }
  };

  if (!unlocked.length) {
    const hasAnyUnlocked = getUnlockedBattleCards().length > 0;
    grid.innerHTML = `<div class="battle-empty-selection">${isTowerBattle() && hasAnyUnlocked ? 'No weather-eligible cards. Choose a native-weather card or matching Mutation / Double Mutation.' : hasAnyUnlocked ? 'No unlocked cards match your search.' : 'Roll at least one card to enter the arena.'}</div>`;
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
    const firstEntry = getStrongestBattleVariant(card, els.cardSortSelect?.value === 'hp' ? 'hp' : 'atk')?.entry || variants[0];
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
    window.ElementSystem.renderBadge(button, card);
    const stats = document.createElement('span');
    stats.textContent = `HP ${display.hp.toLocaleString('en-US')} • ATK ${display.atk.toLocaleString('en-US')}`;
    const variantCount = document.createElement('small');
    variantCount.textContent = `${selectedIndexes.length ? `${selectedIndexes.length} slot${selectedIndexes.length > 1 ? 's' : ''} ` : ''}${variants.length} variant${variants.length === 1 ? '' : 's'} unlocked • ${firstEntry ? getBattleVariantLabel(firstEntry) : 'Normal'}`;
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
    button.textContent = `${getBattleVariantLabel(entry)} x${entry.count}`;
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
  if (els.battleStartButton) els.battleStartButton.disabled = !valid || (isTowerBattle() && window.TowerSystem?.completed(getTowerWeatherMode())) || (isTimeTrialBattle() && !window.TimeTrialSystem.canEnter(getBattleMode())) || (isRaidBattle() && !window.RaidSystem.canEnter(getRaidType())) || (isBossEventBattle() && !window.BossEventSystem.canEnter(getBossEventType()));
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
  window.ElementSystem.renderBadge(name, card);
  const stats = document.createElement('span');
  stats.textContent = `HP ${display.hp.toLocaleString('en-US')} • ATK ${display.atk.toLocaleString('en-US')} • ${entry.count} owned`;
  const passive = document.createElement('span');
  passive.className = 'collection-passive-mini';
  passive.textContent = String(card?.passive?.name || 'Passive');
  passive.title = normalizePassiveText(getCardPassiveCopy(card).description);
  passive.appendChild(createPassiveExpandButton(getCardPassiveCopy(card).name, getCardPassiveCopy(card).description));
  const badgeWrap = document.createElement('div');
  badgeWrap.className = 'battle-selection-preview__badges';
  renderMutationBadges(badgeWrap, entry.mutations);
  info.append(name, stats, passive, badgeWrap);
  preview.append(media, info);

  if (els.battleStartButton) els.battleStartButton.disabled = !isBattleSetupValid() || (isTowerBattle() && window.TowerSystem?.completed(getTowerWeatherMode())) || (isTimeTrialBattle() && !window.TimeTrialSystem.canEnter(getBattleMode())) || (isRaidBattle() && !window.RaidSystem.canEnter(getRaidType())) || (isBossEventBattle() && !window.BossEventSystem.canEnter(getBossEventType()));
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
  const trialButton = document.getElementById('timeTrialOpenButton');
  trialButton?.classList.toggle('is-selected', isTimeTrialBattle());
  trialButton?.setAttribute('aria-pressed', String(isTimeTrialBattle()));
  setViewText('timeTrialModeHint', isTimeTrialBattle()
    ? window.TimeTrialSystem.isExp(activeMode) ? 'EXP • 1v1 • 5 minutes' : 'Normal • 4v4 • 3 minutes'
    : 'Choose Normal or EXP');
  if (els.battleModeLabel) els.battleModeLabel.textContent = getBattleModeLabel();
  renderTowerControls();
  renderTimeTrialControls(); renderRaidControls(); renderBossEventControls();
  if (els.battleStartButton) {
    els.battleStartButton.textContent = isBossEventBattle() ? `Challenge ${window.BossEventSystem.TYPES[getBossEventType()].name} • 5 cards` : isRaidBattle() ? `Enter ${window.RaidSystem.TYPES[getRaidType()].name} • 1 Key` : isTimeTrialBattle() ? window.TimeTrialSystem.isExp(getBattleMode()) ? 'Start EXP Time Trial • 1 Ticket' : `Start Time Trial Room ${window.TimeTrialSystem.room}` : isTowerBattle() ? `Climb Tower Floor ${window.TowerSystem?.nextFloor(getTowerWeatherMode()) || 1}` : isOneVsOneBattle() ? 'Start 1v1 Battle' : 'Start 4v4 Battle';
  }
}

function setBattleMode(mode) {
  window.TimeTrialSystem?.abort(battleState, 'mode-change');
  window.RaidSystem?.abort(battleState);
  window.BossEventSystem?.abort(battleState);
  clearAutoContinueBattleTimer();
  const nextMode = ['1v1', 'tower', 'time-trial', 'exp-time-trial', 'raid', 'boss-event'].includes(mode) ? mode : '4v4';
  clearBattleTurnTimer();
  battleState = { mode: nextMode, setup: { team: [], activeIndex: 0 } };
  renderBattleModePicker();
  populateBattleFighterSelect();
}

function resetBattleView(mode = '4v4') {
  window.TimeTrialSystem?.abort(battleState, 'view-reset');
  window.RaidSystem?.abort(battleState);
  window.BossEventSystem?.abort(battleState);
  clearAutoContinueBattleTimer();
  clearBattleTurnTimer();
  clearBattleAnimationTimers();
  battleState = { mode: ['1v1', 'tower', 'time-trial', 'exp-time-trial', 'raid', 'boss-event'].includes(mode) ? mode : '4v4', setup: { team: [], activeIndex: 0 }, isBattling: false, turn: null };
  document.getElementById('timeTrialSummary')?.classList.add('hidden');
  document.getElementById('timeTrialResultShopButton')?.classList.add('hidden');
  document.getElementById('bossEventSummary')?.classList.add('hidden');
  document.getElementById('bossEventResultShopButton')?.classList.add('hidden');
  document.getElementById('raidSummary')?.classList.add('hidden');
  document.getElementById('raidResultShopButton')?.classList.add('hidden');
  setBattleModalLock(false);
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
  line.textContent = String(message);
  els.battleLog.appendChild(line);

  // Keep long auto-combat sessions bounded while always revealing the newest event.
  const MAX_BATTLE_LOG_LINES = 260;
  while (els.battleLog.children.length > MAX_BATTLE_LOG_LINES) {
    els.battleLog.removeChild(els.battleLog.firstElementChild);
  }
  requestAnimationFrame(() => {
    if (!els.battleLog) return;
    els.battleLog.scrollTop = els.battleLog.scrollHeight;
  });
}

function rollEnemyMutations() {
  const activeWeathers = getActiveWeatherDefinitions();
  if (!activeWeathers.length || Math.random() >= Math.min(1, BATTLE_ENEMY_MUTATION_CHANCE + getWeatherBonus("enemyMutationChance"))) return [];

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
  if (!pool.length) pool = ALL_CARDS.filter(card => isCardRollUnlocked(card) && !playerIds.has(normalizeCardId(card?.id)));
  if (!pool.length) pool = ALL_CARDS.filter(isCardRollUnlocked);

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

function getBattleEnemySalvageBase() {
  const enemyTeam = Array.isArray(battleState?.enemyTeam) ? battleState.enemyTeam.filter(unit => unit && !unit.isClone) : [];
  if (!enemyTeam.length) return 0;
  return Math.max(0, enemyTeam.reduce((total, unit) => {
    return total + getSalvageValue(unit?.card, unit?.mutations || []);
  }, 0));
}

function getBattleCardExperienceRewards(mode, random = Math.random) {
  const range = BATTLE_EXP_BASE[mode];
  if (!range) return { cards: [] }; // Tower grants no EXP at any stage.
  const baseRoll = range.min + (range.max - range.min) * Math.max(0, Math.min(1, Number(random()) || 0));
  // Shared card levels receive one reward per original ID, never per clone/copy.
  const ids = [...new Set((battleState?.setup?.team || []).map(slot => normalizeCardId(slot?.cardId)).filter(Boolean))];
  const cards = ids.filter(id => getCardById(id) && getOwnedCardCount(id) > 0 && getCardLevelInfo(id).level < CARD_LEVEL_MAX).map(cardId => {
    const { required, level } = getCardLevelInfo(cardId);
    // Reward budgets grow sublinearly; requirements follow the new RNG-rate curve.
    const baseExperience = Math.max(1, Math.floor(baseRoll * getCardLevelRarityMultiplier(cardId) * Math.sqrt(level)));
    return { cardId, required, level, baseExperience, experience: getScaledExpReward(baseExperience, 'arena') };
  });
  return { cards };
}

function getBattleRewardProfile(playerPower, enemyPower) {
  const mode = getBattleMode();
  const durationSeconds = Math.max(0, (Date.now() - Number(battleState?.startedAt || Date.now())) / 1000);
  const timeMultiplier = 1 + Math.min(durationSeconds * 0.02, 0.5);
  const playerLevel = Math.max(1, Number(battleState?.initialPlayerLevel || battleState?.playerTeam?.[0]?.level || 1));
  const enemyLevel = Math.max(1, Number(battleState?.initialEnemyLevel || battleState?.enemyTeam?.[0]?.level || 1));
  const levelDiffMultiplier = Math.max(0.5, Math.min(1.5, enemyLevel / playerLevel));
  const timeBonusPercent = Math.round((timeMultiplier - 1) * 100);
  const dropRateBonus = Number(Math.min(5, 0.5 + timeBonusPercent * 0.02).toFixed(2));
  const cardExperience = getBattleCardExperienceRewards(mode);
  const damage = mode === 'tower' ? window.TowerSystem.damageSummary(battleState) : null;
  const baseValue = damage ? window.TowerSystem.battleCurrency(damage.total) : getBattleEnemySalvageBase();
  const rawCoins = damage ? baseValue : baseValue * timeMultiplier * levelDiffMultiplier;
  const reward = Math.max(0, Math.floor(Math.floor(rawCoins) * getCoinMultiplier(false, 'arena')));
  return {
    mode, reward, experience: cardExperience.cards.reduce((sum, card) => sum + card.experience, 0),
    cardExperienceRewards: cardExperience.cards,
    damage, dropRateBonus, baseValue, durationSeconds,
    timeMultiplier: damage ? 1 : timeMultiplier, timeBonusPercent: damage ? 0 : timeBonusPercent,
    playerLevel, enemyLevel, levelDiffMultiplier: damage ? 1 : levelDiffMultiplier,
    rawCoins, multiplier: damage ? 1 : timeMultiplier * levelDiffMultiplier,
    label: damage ? 'TOWER combined damage reward' : `${mode.toUpperCase()} scaled reward`
  };
}

function renderBattleRewardMetricLabels(tower) {
  for (const [id, label] of Object.entries({
    battleResultBaseLabel: tower ? 'Combined Damage' : 'Base Value',
    battleResultTimeLabel: tower ? 'Player Damage' : 'Time Bonus',
    battleResultLevelLabel: tower ? 'Enemy Damage' : 'Level Multiplier'
  })) { const node = document.getElementById(id); if (node) node.textContent = label; }
}

function showBattleFloatingText(unit, text, tone = 'damage', duration = 1150) {
  if (!unit || !battleState) return;
  const side = battleState.playerTeam?.includes(unit) ? 'player' : battleState.enemyTeam?.includes(unit) ? 'enemy' : null;
  if (!side) return;
  const container = side === 'player' ? els.battlePlayerFloatingText : els.battleEnemyFloatingText;
  if (!container) return;
  const item = document.createElement('span');
  item.className = `battle-floating-text__item is-${String(tone).replace(/[^a-z0-9_-]/gi, '')}`;
  item.textContent = String(text || '');
  container.appendChild(item);
  window.setTimeout(() => item.remove(), Math.max(300, Number(duration) || 1150));
}

function renderBattleCombatant(side, unit) {
  const prefix = side === 'player' ? 'battlePlayer' : 'battleEnemy';
  const cardEl = side === 'player' ? els.battlePlayerCard : els.battleEnemyCard;
  window.ElementSystem.renderBadge(cardEl?.querySelector('.battle-side-label'), unit);
  const image = side === 'player' ? els.battlePlayerImage : els.battleEnemyImage;
  const fallback = side === 'player' ? els.battlePlayerFallback : els.battleEnemyFallback;
  const backdrop = side === 'player' ? els.battlePlayerBackdrop : els.battleEnemyBackdrop;
  const mutationBadges = side === 'player' ? els.battlePlayerMutationBadges : els.battleEnemyMutationBadges;
  const passiveStatus = side === 'player' ? els.battlePlayerPassiveStatus : els.battleEnemyPassiveStatus;
  const ratio = Math.max(0, Math.min(1, Number(unit?.maxHp) > 0 ? (Number(unit?.hp) || 0) / Number(unit.maxHp) : 0));

  const nameEl = els[prefix + 'Name'];
  const hpEl = els[prefix + 'Hp'];
  const hpBar = els[prefix + 'HpBar'];
  const atkEl = els[prefix + 'Atk'];
  const levelEl = els[prefix + 'Level'];
  const expTextEl = els[prefix + 'ExpText'];
  const expBarEl = els[prefix + 'ExpBar'];

  const levelInfo = side === 'enemy'
    ? {
        level: getUnitBattleLevel(unit),
        exp: 0,
        required: getCardLevelExpRequired(unit?.card, unit?.level || 1),
        progress: 0
      }
    : getCardLevelInfo(unit?.card);

  if (nameEl) {
    const baseName = String(unit?.display?.name || unit?.card?.name || 'Unknown Card');
    nameEl.textContent = side === 'enemy'
      ? `[Lv. ${levelInfo.level}] ${baseName}`
      : baseName;
  }

  if (hpEl) {
    hpEl.textContent = `${Math.max(0, Number(unit?.hp) || 0).toLocaleString('en-US')} / ${Math.max(1, Number(unit?.maxHp) || 1).toLocaleString('en-US')}`;
  }
  if (hpBar) hpBar.style.width = `${ratio * 100}%`;
  if (atkEl) atkEl.textContent = Math.max(0, Number(unit?.atk) || 0).toLocaleString('en-US');
  if (levelEl) levelEl.textContent = `Lv. ${levelInfo.level}`;
  if (expTextEl) expTextEl.textContent = side === 'enemy'
    ? `NPC • ${levelInfo.required.toLocaleString('en-US')} EXP base`
    : levelInfo.maxed ? "MAX LEVEL" : `${Number(levelInfo.exp.toFixed(2))}/${levelInfo.required} EXP`;
  if (expBarEl) expBarEl.style.width = `${Math.round((levelInfo.progress || 0) * 100)}%`;

  renderMutationBadges(mutationBadges, unit?.mutations);
  applyCardMutationVisual(cardEl, unit?.mutations);

  const passive = window.PassiveSystem?.getPassiveDescription?.(unit) || {
    name: String(unit?.card?.passive?.name || 'Passive'),
    description: String(unit?.card?.passive?.description || '')
  };
  const passiveTooltip = window.PassiveSystem?.getPassiveTooltipData?.(unit) || {
    name: passive.name,
    description: passive.description,
    status: unit?.passiveState?.lastPassiveTrigger ? `Triggered: ${unit.passiveState.lastPassiveTrigger}` : 'Active'
  };
  const statuses = window.PassiveSystem?.getPassiveStatusBadges?.(unit) || [];

  if (passiveStatus) {
    passiveStatus.innerHTML = '';

    // Primary passive tag is always present, even when runtime statuses are active.
    const baseBadge = document.createElement('span');
    baseBadge.className = 'passive-status-badge passive-status-badge--passive passive-skill-tag';
    baseBadge.tabIndex = 0;
    baseBadge.dataset.passiveTooltip = 'true';
    baseBadge.dataset.passiveTooltipName = passiveTooltip.name;
    baseBadge.dataset.passiveTooltipDescription = passiveTooltip.description;
    baseBadge.dataset.passiveTooltipStatus = passiveTooltip.status;
    const baseIcon = document.createElement('span');
    baseIcon.className = 'passive-status-badge__icon';
    baseIcon.textContent = '◇';
    const baseLabel = document.createElement('span');
    baseLabel.className = 'passive-status-badge__label';
    baseLabel.textContent = passiveTooltip.name;
    baseBadge.append(baseIcon, baseLabel);
    passiveStatus.appendChild(baseBadge);
    passiveStatus.appendChild(createPassiveExpandButton(passiveTooltip.name, passiveTooltip.description));

    statuses.forEach(status => {
      const badge = document.createElement('span');
      badge.className = `passive-status-badge passive-status-badge--${String(status?.tone || 'passive').replace(/[^a-z0-9_-]/gi, '')}`;
      const icon = document.createElement('span');
      icon.className = 'passive-status-badge__icon';
      icon.textContent = String(status?.icon || '✦');
      const label = document.createElement('span');
      label.className = 'passive-status-badge__label';
      label.textContent = String(status?.label || passive.name);
      badge.append(icon, label);
      badge.tabIndex = 0;
      badge.dataset.passiveTooltip = 'true';
      badge.dataset.passiveTooltipName = passiveTooltip.name;
      badge.dataset.passiveTooltipDescription = passiveTooltip.description;
      badge.dataset.passiveTooltipStatus = String(status?.status || (status?.category === 'status' ? 'Active' : passiveTooltip.status));
      passiveStatus.appendChild(badge);
    });
  }

  renderBattleCombatModifiers(side, unit);

  if (cardEl) {
    const hasRuntimeActivity = statuses.length > 0;
    cardEl.classList.toggle('has-passive-activity', hasRuntimeActivity);
    cardEl.classList.toggle('passive-active', Boolean(unit?.passiveState?.lastPassiveTrigger));
    const effectLabels = statuses.map(status => String(status?.label || '').toLowerCase());
    cardEl.classList.toggle('battle-status-burn', effectLabels.some(label => label.includes('burn')));
    cardEl.classList.toggle('battle-status-bleed', effectLabels.some(label => label.includes('bleed')));
    cardEl.classList.toggle('battle-status-freeze', effectLabels.some(label => label.includes('freeze')));
    cardEl.classList.toggle('battle-status-stun', effectLabels.some(label => label.includes('stun')));
  }

  setArtwork(
    image,
    fallback,
    backdrop,
    unit?.card?.image || FALLBACK_ART_DATA_URL,
    `${unit?.display?.name || unit?.card?.name || 'Card'} artwork`
  );
}

function renderBattleCombatModifiers(side, unit) {
  const statusEl = side === 'player' ? els.battlePlayerCombatStatus : els.battleEnemyCombatStatus;
  const effectsEl = side === 'player' ? els.battlePlayerStatusEffects : els.battleEnemyStatusEffects;
  if (!statusEl || !effectsEl) return;

  const summary = window.PassiveSystem?.getCombatStatusSummary?.(unit, battleState) || {
    atkMultiplierPct: 0, hpPct: 100, currentHp: Math.max(0, Number(unit?.hp) || 0), maxHp: Math.max(1, Number(unit?.maxHp) || 1), dodgePct: 0, damageReductionPct: 0, shield: 0, shieldPct: 0, effects: []
  };

  statusEl.innerHTML = '';
  const chipData = [
    { icon: '⚔', label: `${summary.atkMultiplierPct >= 0 ? '+' : ''}${Math.round(summary.atkMultiplierPct)}% ATK`, tone: summary.atkMultiplierPct > 0 ? 'buff' : summary.atkMultiplierPct < 0 ? 'debuff' : 'neutral' },
    { icon: '❤', label: `HP ${Math.round(summary.currentHp).toLocaleString('en-US')} / ${Math.round(summary.maxHp).toLocaleString('en-US')}`, tone: summary.hpPct < 100 ? 'debuff' : 'neutral' },
    { icon: '◌', label: `${Math.round(summary.dodgePct)}% Dodge`, tone: summary.dodgePct > 0 ? 'dodge' : 'neutral' },
    { icon: '⛨', label: `${Math.round(summary.damageReductionPct)}% DR`, tone: summary.damageReductionPct > 0 ? 'guard' : 'neutral' }
  ];

  chipData.forEach(item => {
    const chip = document.createElement('span');
    chip.className = `battle-combat-status__chip is-${item.tone}`;
    chip.innerHTML = `<span class="battle-combat-status__icon">${item.icon}</span><span>${item.label}</span>`;
    statusEl.appendChild(chip);
  });

  const shieldRow = document.createElement('div');
  shieldRow.className = `battle-shield ${summary.shield > 0 ? 'has-shield' : ''}`;
  const shieldMeta = document.createElement('div');
  shieldMeta.className = 'battle-shield__meta';
  const shieldLabel = document.createElement('span');
  shieldLabel.textContent = '🛡 Shield';
  const shieldValue = document.createElement('strong');
  shieldValue.textContent = Math.round(summary.shield).toLocaleString('en-US');
  shieldMeta.append(shieldLabel, shieldValue);
  const shieldTrack = document.createElement('div');
  shieldTrack.className = 'battle-shield__track';
  const shieldFill = document.createElement('div');
  shieldFill.className = 'battle-shield__fill';
  shieldFill.style.width = `${Math.round(summary.shieldPct)}%`;
  shieldTrack.appendChild(shieldFill);
  shieldRow.append(shieldMeta, shieldTrack);
  statusEl.appendChild(shieldRow);

  effectsEl.innerHTML = '';
  (summary.effects || []).forEach(effect => {
    const badge = document.createElement('span');
    badge.className = `battle-effect-badge battle-effect-badge--${String(effect.tone || 'neutral').replace(/[^a-z0-9_-]/gi, '')}`;
    badge.textContent = `${effect.icon || '✦'} ${effect.label}`;
    effectsEl.appendChild(badge);
  });
}

function renderBattleLineup(side, team, activeIndex) {
  const container = side === 'player' ? els.battlePlayerLineup : els.battleEnemyLineup;
  if (!container) return;
  container.innerHTML = '';

  const orderedIndices = side === 'player'
    ? team.map((_, index) => index).reverse()
    : team.map((_, index) => index);

  orderedIndices.forEach(index => {
    const unit = team[index];
    const slot = document.createElement('div');
    slot.className = `battle-lineup-card ${index === activeIndex ? 'is-active' : ''} ${unit.defeated ? 'is-defeated' : ''}`;
    slot.dataset.slotIndex = String(index + 1);
    slot.setAttribute('aria-label', `${side === 'player' ? 'Player' : 'Enemy'} Slot ${index + 1}${index === activeIndex ? ' active' : ''}`);
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
    name.textContent = side === 'enemy' ? `[Lv. ${getUnitBattleLevel(unit)}] ${unit.display.name}` : unit.display.name;
    window.ElementSystem.renderBadge(name, unit);
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
  scheduleBattleAnimation(() => defender.classList.add('battle-hit'), 170);
  scheduleBattleAnimation(() => {
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

function scheduleNextBattleTurn(remainingMs) {
  clearBattleTurnTimer();
  if (!battleState || battleState.finished) return;
  const turnMs = getBattleTurnMs();
  const delay = Number.isFinite(remainingMs) ? Math.max(0, Math.min(turnMs, remainingMs)) : turnMs;
  battleState.nextTurnAt = Date.now() + delay;
  if (els.battleStatus) els.battleStatus.textContent = `${battleState.turn === 'player' ? 'PLAYER' : 'ENEMY'} STRIKE IN ${Math.ceil(delay / 1000)}s`;
  if (els.battleModeLabel) els.battleModeLabel.textContent = getBattleModeLabel();
  const autoNote = document.getElementById('battleAutoNote');
  if (autoNote) autoNote.textContent = isTimeTrialBattle() ? `${window.TimeTrialSystem.isExp(getBattleMode()) ? 'EXP' : 'Normal'} Time Trial • Fixed ${turnMs / 1000}-second turns • Speed Battle Potion ignored • Timer keeps running while reading` : `Auto combat • Every ${turnMs / 1000} seconds • Frontline cards stay engaged until defeated • Weather-mutated enemies are possible`;
  battleTurnTimer = window.setTimeout(() => {
    battleTurnTimer = null;
    executeBattleTurn();
  }, delay);
}

function canReplayBattleTeam() {
  if (isBossEventBattle() && !window.BossEventSystem.canEnter(getBossEventType())) return false;
  if (isRaidBattle() && !window.RaidSystem.canEnter(getRaidType())) return false;
  if (isTimeTrialBattle() && !window.TimeTrialSystem.canEnter(getBattleMode())) return false;
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

// Defeat never modifies the player's card collection. Battle loss is terminal-only.
function getBattleDefeatNotice() {
  return 'Defeated! No cards were lost. Your entire collection is preserved.';
}

function finishBattle(playerWon) {
  if (window.SandboxSystem?.active || battleState?.sandbox || battleState?.mode === 'sandbox') return;
  if (!battleState || battleState.finished) return;
  if (isTimeTrialBattle()) { finishTimeTrialBattle(playerWon); return; }
  if (isRaidBattle()) { finishRaidBattle(playerWon); return; }
  if (isBossEventBattle()) { finishBossEventBattle(playerWon); return; }
  // Even callers using endBattle() must wait for Tower's complete enemy queue.
  if (playerWon && battleState.mode === 'tower' && window.PassiveSystem?.checkBattleWinner?.(battleState) !== 'player') return;
  clearAutoContinueBattleTimer();

  clearBattleTurnTimer();
  clearBattleAnimationTimers();
  battleState.finished = true;
  battleState.isBattling = false;
  battleState.outcome = playerWon ? 'victory' : 'defeat';
  renderBattleRewardMetricLabels(battleState.mode === 'tower');

  const safePlayerPower = Number.isFinite(Number(battleState.playerPower)) ? Math.max(0, Number(battleState.playerPower)) : 0;
  const safeEnemyPower = Number.isFinite(Number(battleState.enemyPower)) ? Math.max(0, Number(battleState.enemyPower)) : 0;
  battleState.playerPower = safePlayerPower;
  battleState.enemyPower = safeEnemyPower;

  try {
    if (playerWon) {
      const baseRewardProfile = getBattleRewardProfile(safePlayerPower, safeEnemyPower);
      const rewardProfile = window.PassiveSystem?.modifyVictoryRewards?.(battleState, baseRewardProfile) || baseRewardProfile;
      const rawReward = Number.isFinite(Number(rewardProfile.reward)) ? Math.max(0, Math.floor(rewardProfile.reward * (1 + getWeatherBonus("coins")) * (1 + getWeatherBonus("battleCoins")))) : 0;
      const reward = battleState.mode === 'tower' ? Math.min(rawReward, Math.max(0, Number.MAX_SAFE_INTEGER - (Number(state.currency) || 0))) : rawReward;
      const cardExperienceRewards = battleState.mode === 'tower' ? [] : baseRewardProfile.cardExperienceRewards.map(entry => ({
        ...entry, experience: Math.max(0, Math.floor(entry.experience * (Number(rewardProfile.passiveMultiplier) || 1)))
      }));
      const experience = cardExperienceRewards.reduce((sum, entry) => sum + entry.experience, 0);
      state.currency = Math.max(0, Number(state.currency) || 0) + reward;
      recordEarnedCurrency(reward);
      window.AchievementSystem?.recordBattleWin();
      const dropRateBonus = Number.isFinite(Number(rewardProfile.dropRateBonus)) ? Math.max(0, Number(rewardProfile.dropRateBonus)) : 0;
      state.experience = Math.max(0, Number(state.experience) || 0) + experience;
      state.battleDropRateBonus = Math.max(0, Math.min(100, Number(state.battleDropRateBonus) || 0) + dropRateBonus);
      // Independent player stat: neither Reward Bonus nor money multipliers are read by the potion RNG.
      state.dropChance = Math.max(0, Math.min(20, (Number(state.dropChance) || 0) + Math.max(0, Number(baseRewardProfile.dropRateBonus) || 0))); // unmodified by Reward Bonus passives
      const potionDrop = window.InventorySystem?.rollVictoryDrop(state.dropChance);
      const previousKeys = window.InventorySystem.quantity(window.RaidSystem.KEY_ITEM.id);
      const raidKeyDropped = window.RaidSystem?.rollKey(battleState.mode);
      if (raidKeyDropped) appendBattleLog(`Marine Ford Raid Key +${window.InventorySystem.quantity(window.RaidSystem.KEY_ITEM.id) - previousKeys} • 10% regular-battle drop • Drop x${window.InventorySystem.getDropMultiplier().toFixed(2)}.`, 'victory');
      const towerPrize = battleState.mode === 'tower' ? window.TowerSystem?.recordVictory(battleState.towerWeather, battleState.towerFloor) : null;
      refreshAchievements();
      if (potionDrop?.dropped) appendBattleLog(`🧪 Potion drop: ${potionDrop.name} x${potionDrop.quantity || 1} (${Math.round(potionDrop.chance * 100)}% roll).`, 'victory');
      else if (potionDrop) appendBattleLog(`🧪 No potion (${Math.round(potionDrop.chance * 100)}% chance) • Pity increased for next win.`, 'status');
      if (towerPrize?.awarded) appendBattleLog(`🏰 Floor ${battleState.towerFloor} cleared! +${towerPrize.coins} Tower Coins${towerPrize.elite ? ' • ELITE BONUS' : ''}.`, 'victory');
      renderPotionInventory(); renderTowerShop();

      // Persist the monetary reward before any card/level-up/rendering work.
      // A malformed legacy record must never erase a legitimate victory payout.
      saveState();
      updateStats();

      const levelUps = [];
      for (const entry of cardExperienceRewards) {
        const result = grantCardExperience(entry.cardId, entry.experience);
        appendBattleLog(`EXP: ${getCardById(entry.cardId)?.name || entry.cardId} +${entry.experience.toLocaleString('en-US')} (base ${entry.baseExperience.toLocaleString('en-US')} at Lv.${entry.level}; progressive EXP before bonuses).`, 'victory');
        if (result.levelUps > 0) levelUps.push(`${getCardById(entry.cardId)?.name || entry.cardId} Lv.${result.level}`);
      }
      saveState();
      updateStats();
      window.PassiveSystem?.onVictory?.(battleState);
      renderUpgradeShop();
      collectionNeedsRefresh = false;
      renderCollection();

      const modeLabel = rewardProfile.mode.toUpperCase();
      const levelNote = levelUps.length ? ` • Level Up: ${levelUps.join(', ')}` : '';

      const earningSummary = baseRewardProfile.damage
        ? `Combined damage ${baseRewardProfile.damage.total.toLocaleString('en-US')} (Player ${baseRewardProfile.damage.player.toLocaleString('en-US')} + Enemy ${baseRewardProfile.damage.enemy.toLocaleString('en-US')}) • 10 damage / VNĐ • Earned ${formatCurrency(reward)} • No Tower EXP.`
        : `Base ${formatCurrency(baseRewardProfile.baseValue)} • Time +${baseRewardProfile.timeBonusPercent}% • Level x${baseRewardProfile.levelDiffMultiplier.toFixed(2)} • Earned ${formatCurrency(reward)} • Progressive EXP awarded once per unique lineup card.`;
      appendBattleLog(`Victory! ${earningSummary}${levelNote}`, 'victory');
      if (els.battleResultTitle) els.battleResultTitle.textContent = '🏆 VICTORY!';
      if (els.battleResultText) els.battleResultText.textContent = `${modeLabel} cleared. ${towerPrize?.awarded ? `Tower Floor ${battleState.towerFloor}: +${towerPrize.coins} 🪙. ` : ''}${potionDrop?.dropped ? `Potion: ${potionDrop.name} x${potionDrop.quantity || 1}. ` : ''}${earningSummary}`;
      if (els.battleResultPower) {
        els.battleResultPower.textContent = `Player Power: ${safePlayerPower.toLocaleString('en-US')} vs Enemy Power: ${safeEnemyPower.toLocaleString('en-US')} • ${baseRewardProfile.durationSeconds.toFixed(1)}s battle`;
      }
      if (els.battleResultBaseValue) els.battleResultBaseValue.textContent = baseRewardProfile.damage ? baseRewardProfile.damage.total.toLocaleString('en-US') : formatCurrency(baseRewardProfile.baseValue);
      if (els.battleResultTimeBonus) els.battleResultTimeBonus.textContent = baseRewardProfile.damage ? baseRewardProfile.damage.player.toLocaleString('en-US') : `+${baseRewardProfile.timeBonusPercent}%`;
      if (els.battleResultLevelDiff) els.battleResultLevelDiff.textContent = baseRewardProfile.damage ? baseRewardProfile.damage.enemy.toLocaleString('en-US') : `x${baseRewardProfile.levelDiffMultiplier.toFixed(2)}`;
      if (els.battleResultCash) els.battleResultCash.textContent = `${formatCurrency(reward)}`;
      if (els.battleResultExp) els.battleResultExp.textContent = battleState.mode === 'tower' ? '0 EXP • Tower' : `+${experience.toLocaleString('en-US')} EXP`;
      if (els.battleResultDropRate) els.battleResultDropRate.textContent = `+${dropRateBonus.toFixed(2)}%`;
      if (els.battleResultLossStatus) els.battleResultLossStatus.textContent = 'N/A — Victory';
    } else {
      // Defeat ends the match only. Never delete, decrement, salvage, or otherwise
      // mutate the player's card collection as a battle-loss consequence.
      const notice = getBattleDefeatNotice();
      saveState();
      updateStats();
      collectionNeedsRefresh = false;
      renderCollection();
      renderUpgradeShop();

      appendBattleLog(notice, 'defeat');
      if (els.battleResultTitle) els.battleResultTitle.textContent = '💀 DEFEAT!';
      if (els.battleResultText) els.battleResultText.textContent = notice;
      if (els.battleResultPower) els.battleResultPower.textContent = `Player Power: ${safePlayerPower.toLocaleString('en-US')} vs Enemy Power: ${safeEnemyPower.toLocaleString('en-US')}`;
      const damage = battleState.mode === 'tower' ? window.TowerSystem.damageSummary(battleState) : null;
      if (els.battleResultBaseValue) els.battleResultBaseValue.textContent = damage ? damage.total.toLocaleString('en-US') : '💵 0';
      if (els.battleResultTimeBonus) els.battleResultTimeBonus.textContent = damage ? damage.player.toLocaleString('en-US') : '+0%';
      if (els.battleResultLevelDiff) els.battleResultLevelDiff.textContent = damage ? damage.enemy.toLocaleString('en-US') : 'x0.00';
      if (els.battleResultCash) els.battleResultCash.textContent = '💵 +0';
      if (els.battleResultExp) els.battleResultExp.textContent = '+0 EXP';
      if (els.battleResultDropRate) els.battleResultDropRate.textContent = '+0.00%';
      if (els.battleResultLossStatus) els.battleResultLossStatus.textContent = 'NONE — COLLECTION PRESERVED';
    }
  } catch (error) {
    // Battle resolution must always reach the end-game screen even if a
    // malformed legacy collection record is encountered during cleanup.
    console.error('Battle result rendering failed safely:', error);
    if (els.battleResultTitle) els.battleResultTitle.textContent = playerWon ? '🏆 VICTORY!' : '💀 DEFEAT!';
    if (els.battleResultText) els.battleResultText.textContent = playerWon ? 'Battle complete. Reward processed safely.' : 'Battle complete. Defeat penalty processed safely.';
    if (els.battleResultPower) els.battleResultPower.textContent = `Player Power: ${safePlayerPower.toLocaleString('en-US')} vs Enemy Power: ${safeEnemyPower.toLocaleString('en-US')}`;
  }

  recordQuestBattleCompletion(battleState);
  let replayable = false;
  try { replayable = canReplayBattleTeam(); } catch (error) { console.warn('Replay check failed safely:', error); }
  if (els.battleAutoAgainButton) {
    els.battleAutoAgainButton.disabled = !replayable;
    els.battleAutoAgainButton.textContent = replayable ? '⚔️ Battle Again' : 'Team Unavailable';
  }

  els.battleArena?.classList.add('hidden');
  setBattleModalLock(false);
  const battleResultView = document.getElementById('battle-result-modal') || els.battleVictory;
  if (battleResultView) {
    battleResultView.classList.remove('hidden', 'battle-result--neutral', 'battle-result--victory', 'battle-result--defeat');
    battleResultView.classList.add(playerWon ? 'battle-result--victory' : 'battle-result--defeat');
    battleResultView.setAttribute('aria-hidden', 'false');
  } else {
    console.warn('Battle result view is missing; result data was still processed.');
  }
  if (replayable) scheduleAutoContinueBattle();
}

// Explicit alias for integrations that expect an endBattle() API.
function endBattle(playerWon) {
  if (!battleState || battleState.finished) return;
  finishBattle(Boolean(playerWon));
}

function startBattle(useExistingSetup = true) {
  clearAutoContinueBattleTimer();
  if (isBattleMatchActive() || isImportingSave || window.SandboxSystem?.active || window.EquipmentSystem?.blocked) return;
  if (isBossEventBattle()) syncGameClockToNow();
  const setupTeam = useExistingSetup ? battleState?.setup?.team : null;
  if (isTowerBattle() && window.TowerSystem?.completed(getTowerWeatherMode())) return;
  if (!Array.isArray(setupTeam) || setupTeam.length !== getBattleTeamSize() || !isBattleSetupValid(setupTeam)) return;
  if (isTimeTrialBattle() && !window.TimeTrialSystem.canEnter(getBattleMode())) return;
  if (isBossEventBattle() && !window.BossEventSystem.canEnter(getBossEventType())) { renderBossEventControls(); return; }
  if (isRaidBattle() && !window.RaidSystem.canEnter(getRaidType())) return;
  if (isTowerBattle() && setupTeam.some(slot => !window.TowerSystem?.eligiblePlayerCard(getCardById(slot.cardId), getVariantEntries(slot.cardId).find(entry => entry.key === slot.variantKey), getTowerWeatherMode(), WEATHERS))) return;

  // Each attempt uses new unit objects. Tower preserves its floor blueprint
  // while Arena continues to select a fresh random opponent/team.
  clearBattleTurnTimer();
  clearBattleAnimationTimers();
  battleState = {
    ...(battleState || {}),
    currentOpponent: null,
    finished: false,
    isBattling: true,
    currentTurn: 0
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

  if (isTowerBattle() && window.TowerSystem?.completed(getTowerWeatherMode())) return;
  const towerFloor = isTowerBattle() ? window.TowerSystem.nextFloor(getTowerWeatherMode()) : null;
  const towerWeather = isTowerBattle() ? getTowerWeatherMode() : null;
  const raidType = isRaidBattle() ? getRaidType() : null;
  const bossEventType = isBossEventBattle() ? getBossEventType() : null;
  const enemyTeam = isBossEventBattle() ? window.BossEventSystem.enemies(bossEventType) : isRaidBattle() ? window.RaidSystem.enemies(raidType) : isTimeTrialBattle() ? window.TimeTrialSystem.enemies(getBattleMode(), playerTeam[0]) : isTowerBattle() ? window.TowerSystem.getOpponents(ALL_CARDS, towerFloor, towerWeather, WEATHERS) : chooseBattleEnemyTeam(playerTeam);
  if (enemyTeam.length !== (isBossEventBattle() ? 1 : isRaidBattle() ? 10 : playerTeam.length)) { battleState.isBattling = false; return; }
  const playerPower = calculateBattleTeamPower(playerTeam);
  const enemyPower = calculateBattleTeamPower(enemyTeam);

  const mode = getBattleMode();
  const teamSize = getBattleTeamSize();

  battleState = {
    mode,
    championChoices: { aqua: document.querySelector('input[name="aquaBattleMode"]:checked')?.value || 'hp' },
    towerFloor, towerWeather,
    currentOpponent: enemyTeam[0] || null,
    setup: { team: setupTeam.map(slot => ({ ...slot })), activeIndex: 0 },
    turn: 'player',
    finished: false,
    isBattling: true,
    currentTurn: 0,
    nextTurnAt: null,
    playerIndex: 0,
    enemyIndex: 0,
    playerTeam,
    enemyTeam,
    playerPower,
    enemyPower,
    startedAt: Date.now(),
    initialPlayerLevel: Math.max(1, playerTeam.length ? playerTeam.reduce((sum, unit) => sum + (Number(unit?.level) || 1), 0) / playerTeam.length : 1),
    initialEnemyLevel: Math.max(1, enemyTeam.length ? enemyTeam.reduce((sum, unit) => sum + (Number(unit?.level) || 1), 0) / enemyTeam.length : 1),
    enemyBaseValue: Math.max(0, enemyTeam.reduce((sum, unit) => sum + getSalvageValue(unit?.card, unit?.mutations || []), 0)),
    player: playerTeam[0],
    enemy: enemyTeam[0]
  };

  if (isBossEventBattle()) {
    try { window.BossEventSystem.start(battleState,bossEventType); }
    catch(error) { battleState.isBattling=false; window.alert(error.message); renderBattleSelection(); return; }
  }
  if (isRaidBattle()) {
    try { window.RaidSystem.start(battleState, raidType); }
    catch (error) { battleState.isBattling = false; window.alert(error.message); renderBattleSelection(); return; }
  }
  if (isTimeTrialBattle()) {
    try { window.TimeTrialSystem.start(battleState); }
    catch (error) {
      battleState.isBattling = false; window.alert(error.message); renderBattleSelection(); return;
    }
  }
  try { battleState.questContext = window.QuestSystem.battleContext(battleState, getActiveWeatherDefinitions().map(w => w.id)); }
  catch (error) { appendBattleLog(error.message, 'status'); }
  window.PassiveSystem?.beginBattle?.(battleState);
  if (isTimeTrialBattle()) window.TimeTrialSystem.prepareAfterEntry(battleState);
  document.getElementById('timeTrialSummary')?.classList.add('hidden');
  document.getElementById('timeTrialResultShopButton')?.classList.add('hidden');
  document.getElementById('bossEventSummary')?.classList.add('hidden');
  document.getElementById('bossEventResultShopButton')?.classList.add('hidden');
  document.getElementById('raidSummary')?.classList.add('hidden');
  document.getElementById('raidResultShopButton')?.classList.add('hidden');
  battleState.playerPower = calculateBattleTeamPower(battleState.playerTeam);
  battleState.enemyPower = calculateBattleTeamPower(battleState.enemyTeam);

  els.battleSetup?.classList.add('hidden');
  setBattleModalLock(true);
  els.battleVictory?.classList.add('hidden');
  els.battleVictory?.setAttribute('aria-hidden', 'true');
  els.battleArena?.classList.remove('hidden');
  if (els.battleLog) els.battleLog.innerHTML = '';

  appendBattleLog(`${mode} battle begins: ${playerTeam[0].display.name} leads the line.`);
  appendBattleLog(isBossEventBattle() ? `${getBattleModeLabel()} • ${window.BossEventSystem.TYPES[getBossEventType()].weatherName} entry window • Type-specific coins and exclusive card only.` : isRaidBattle() ? `${getBattleModeLabel()} • 10 preset bosses • Raid Coins only, with exclusive secret-card rolls.` : isTimeTrialBattle() ? `${getBattleModeLabel()} • ${window.TimeTrialSystem.LIMITS[mode] / 1000}s limit • Speed Battle Potion ignored.` : isTowerBattle() ? `🏰 ${towerWeather.toUpperCase()} Tower • Floor ${towerFloor}${window.TowerSystem.isElite(towerFloor) ? ' • ELITE' : ''} • 3 Minions + 1 Boss. Stats scale with floor, never player stats.` : `Enemy levels are adaptive to your current team power. ${enemyTeam.map(unit => `Lv. ${unit.level}`).join(', ')}.`);
  if (!isTimeTrialBattle() && !isRaidBattle() && !isBossEventBattle()) appendBattleLog(isTowerBattle() ? `Tower enemy elements follow the selected type; player native-weather / mutation entry rules remain separate.` : `Enemy mutations are active-weather boosted (70% roll chance).`);
  appendBattleLog(`First strike begins in ${getBattleTurnMs() / 1000} seconds. ${teamSize} player fighter${teamSize === 1 ? '' : 's'} vs ${enemyTeam.length} enemies.`, 'player');
  renderBattleStats();
  if (isBossEventBattle()) renderBossEventControls();
  scheduleNextBattleTurn();
}

function executeBattleTurn() {
  if (!battleState || battleState.finished || !battleState.playerTeam || !battleState.enemyTeam) return;
  if (isTimeTrialBattle() && window.TimeTrialSystem.expired(battleState)) { window.TimeTrialSystem.checkDeadline(); return; }

  try {
    battleState.currentTurn = Math.max(0, Number(battleState.currentTurn) || 0) + 1;
    appendBattleLog(`TURN ${battleState.currentTurn} • ${battleState.turn === 'player' ? 'PLAYER' : 'ENEMY'} ATTACK`, battleState.turn === 'player' ? 'player' : 'enemy');
    const actedSide = battleState.turn;
    let resolution = window.PassiveSystem?.resolveTurn?.(battleState) || { ended: false, winner: null };
    if (isTimeTrialBattle()) resolution = window.TimeTrialSystem.afterTurn(battleState, resolution, actedSide);

    battleState.playerPower = calculateBattleTeamPower(battleState.playerTeam);
    battleState.enemyPower = calculateBattleTeamPower(battleState.enemyTeam);

    renderBattleStats();

    if (resolution.ended) {
      finishBattle(resolution.winner === 'player');
      return;
    }

    scheduleNextBattleTurn();
  } catch (error) {
    console.error('Battle turn failed safely:', error);
    if (isTimeTrialBattle()) { finishTimeTrialBattle(false, 'save-error'); return; }
    appendBattleLog('Battle turn encountered a recoverable error. The turn was skipped.', 'defeat');
    if (battleState?.turn) {
      battleState.turn = battleState.turn === 'player' ? 'enemy' : 'player';
    }
    scheduleNextBattleTurn();
  }
}


// ============================================================
// MODULAR INVENTORY / TOWER UI ADAPTERS
// Only UI binding and coordination live here. All mechanics and storage are
// implemented in inventory.js and tower.js.
// ============================================================
function grantTimeTrialExperience(cardId, amount, owner) {
  const info = getCardLevelInfo(cardId);
  if (!amount || info.level >= CARD_LEVEL_MAX) return { gained: 0, level: info.level, levelUps: 0 };
  const before = JSON.parse(JSON.stringify(state));
  const oldMultiplier = getCardLevelStatMultiplier(cardId);
  const result = grantCardExperience(cardId, amount);
  state.experience += result.gained;
  if (!saveState()) { state = before; return null; }
  const ratio = getCardLevelStatMultiplier(cardId) / oldMultiplier;
  window.PassiveSystem?.applyRuntimeLevelGrowth(owner, ratio);
  return result;
}

// Boss Event adapters: business rules and storage remain in boss_event.js.
function isBossEventWeatherActive(weatherId) {
  const elapsed=Math.max(0,(Date.now()-Number(state.weather.lastRealTimestamp||Date.now()))/1000);
  const gameNow=state.weather.gameSeconds+elapsed;
  return state.weather.active.some(entry=>window.WeatherSystem.canonicalId(entry.weatherId)===weatherId&&entry.expiresAt>gameNow);
}
function grantBossEventCard(drop,attemptId) {
  const card=getCardById(drop.cardId);
  if(!card?.bossEventOnly||!/^[0-9]+_[0-9]+$/.test(String(attemptId)))return false;
  const receipt=`boss_event_${attemptId}`;
  if(state.achievementRewardReceipts?.[receipt])return true;
  const previous=JSON.parse(JSON.stringify(state));
  try {
    const ids=normalizeCardMutations(drop.mutationIds),key=canonicalVariantKey(card.id,ids);
    state.unlocked[card.id]=getUnlockedCountById(card.id)+1;
    state.mutations[key]=Math.max(0,Number(state.mutations[key])||0)+1;
    state.inventory[key]={id:card.id,cardId:card.id,mutationIds:ids,mutation:ids.join('+'),count:Math.max(0,Number(state.inventory[key]?.count)||0)+1};
    ensureCardProgress(card.id);state.achievementRewardReceipts[receipt]=true;
    if(!saveState())throw Error('Không thể lưu thẻ Boss Event.');window.DropAudioSystem?.play(card.id);return true;
  } catch(error) {state=previous;console.warn(error.message);return false;}
}
function renderBossEventControls() {
  const event=window.BossEventSystem,active=isBossEventBattle(),type=getBossEventType();
  els.battleModal?.classList.toggle('boss-event-mode',active);
  document.getElementById('bossEventControls')?.classList.toggle('hidden',!active);
  if(!active)return;
  const progress=event.snapshot(type),range=event.coinRange(progress.difficulty),boss=event.enemies(type)[0];
  const def=event.TYPES[type],native=getCardById(def.cardId);
  const typeSelect=document.getElementById('bossEventTypeSelect');if(typeSelect){typeSelect.value=type;typeSelect.disabled=isBattleMatchActive();}
  const entry=getActiveWeatherEntries().find(w=>w.weatherId===def.weatherId);
  setViewText('bossEventAvailability', progress.available?`OPEN • ${def.weatherName} • ${entry?formatWeatherCountdown(getWeatherRemainingSeconds(entry)):''}`:`CLOSED • Requires ${def.weatherName} weather`);
  const slider=document.getElementById('bossEventDifficulty');if (!slider) return;slider.value=progress.difficulty;slider.disabled=isBattleMatchActive();
  syncDifficultyNumber('bossEvent', progress.difficulty);
  setViewText('bossEventDifficultyValue', `${progress.difficulty} • Boss Lv.${progress.difficulty}`);
  setViewText('bossEventBalance', `${progress.coins.toLocaleString('en-US')} ${def.coinName}`);
  setViewText('bossEventRules', `5 player cards vs 1 ${native.name} • Victory: ${range.min}–${range.max} ${def.coinName} • ${(event.cardChance(progress.difficulty,type)*100).toFixed(2)}% ${native.name} drop • No VNĐ, EXP or ordinary drops • No entry key or stat upgrade tree.`);
  setViewText('bossEventStats', `Boss HP ${boss.maxHp.toLocaleString('en-US')} • ATK ${boss.atk.toLocaleString('en-US')} • Speed Battle Potion applies. Weather is checked again before every Continue.`);
  if(!isBattleMatchActive())els.battleStartButton.disabled=!isBattleSetupValid()||!event.canEnter(type);
  if(battleState?.finished){const can=canReplayBattleTeam();els.battleAutoAgainButton.disabled=!can;els.battleAutoAgainButton.textContent=can?`Continue ${def.name}`:`Requires ${def.weatherName} weather`;if(!can)clearAutoContinueBattleTimer();}
}
function renderBossEventShop() {
  const event=window.BossEventSystem,type=getBossEventType();
  setViewText('bossEventShopTitle', `${event.TYPES[type].name} Shop`);
  setViewText('bossEventShopBalance', `${event.snapshot(type).coins.toLocaleString('en-US')} ${event.TYPES[type].coinName} • No stat upgrades`);
  event.renderShop(document.getElementById('bossEventShopGrid'),type,()=>{renderBossEventShop();renderBossEventControls();renderPotionInventory();});
}
function finishBossEventBattle(won) {
  if(!battleState?.bossEvent||battleState.finished)return;
  let summary;
  try {summary=window.BossEventSystem.finish(battleState,won);}
  catch(error){summary={won:false,coins:0,card:null,type:battleState.bossEvent.type,difficulty:battleState.bossEvent.difficulty,error:error.message};appendBattleLog(error.message,'defeat');}
  if(!summary)return;
  if (!summary.error) { battleState.questResultWon = summary.won; recordQuestBattleCompletion(battleState); }
  clearAutoContinueBattleTimer();clearBattleTurnTimer();clearBattleAnimationTimers();
  battleState.finished=true;battleState.isBattling=false;battleState.outcome=summary.won?'victory':'defeat';
  const card=summary.card?getCardById(summary.card.cardId):null,mutations=summary.card?.mutationIds.map(id=>MUTATION_BY_ID[id]?.name||id).join(' + ');
  const def=window.BossEventSystem.TYPES[summary.type],native=getCardById(def.cardId);
  const body=document.getElementById('bossEventSummary');
  body.textContent=`${def.name} • Difficulty ${summary.difficulty}\n${def.coinName}: +${summary.coins} • Drop x${(summary.dropMultiplier||1).toFixed(2)}\n${card?`Exclusive card: ${mutations?`[${mutations}] `:''}${card.name}\n`:''}No VNĐ • No EXP • No ordinary drops${summary.error?`\n${summary.error}`:''}`;
  body.classList.remove('hidden');document.getElementById('bossEventResultShopButton')?.classList.remove('hidden');
  els.battleResultTitle.textContent=summary.won?'🩸 BOSS DEFEATED':'🩸 EVENT ATTEMPT ENDED';
  els.battleResultText.textContent=summary.error||(summary.won?`${native.name} and all remaining enemies were defeated.`:`Your collection is preserved. ${def.weatherName} is required for the next attempt.`);
  els.battleResultPower.textContent=getBattleModeLabel();
  for(const [id,label]of Object.entries({battleResultBaseLabel:def.coinName,battleResultTimeLabel:'Boss level',battleResultLevelLabel:`${native.name} drop chance`}))setViewText(id, label);
  els.battleResultBaseValue.textContent=String(summary.coins);els.battleResultTimeBonus.textContent=`Lv.${summary.difficulty}`;els.battleResultLevelDiff.textContent=`${(window.BossEventSystem.cardChance(summary.difficulty,summary.type)*100).toFixed(2)}%`;
  els.battleResultCash.textContent='0 VNĐ';els.battleResultExp.textContent='0 EXP';els.battleResultDropRate.textContent='0%';els.battleResultLossStatus.textContent='NONE';
  refreshAchievements();updateStats();renderCollection();renderPotionInventory();renderBossEventControls();
  if(!document.getElementById('bossEventShopModal')?.classList.contains('hidden'))renderBossEventShop();
  els.battleArena.classList.add('hidden');setBattleModalLock(false);els.battleVictory.classList.remove('hidden','battle-result--neutral','battle-result--victory','battle-result--defeat');els.battleVictory.classList.add(summary.won?'battle-result--victory':'battle-result--defeat');els.battleVictory.setAttribute('aria-hidden','false');
  if(canReplayBattleTeam())scheduleAutoContinueBattle();
}
document.getElementById('bossEventShopOpenButton')?.addEventListener('click',()=>openModal('bossEventShopModal'));
document.getElementById('bossEventResultShopButton')?.addEventListener('click',()=>openModal('bossEventShopModal'));
document.getElementById('bossEventTypeSelect')?.addEventListener('change',()=>{
  if(isBattleMatchActive()){document.getElementById('bossEventTypeSelect').value=battleState.bossEvent.type;return;}
  const team=getBattleSetupTeam().map(slot=>({...slot}));
  resetBattleView('boss-event');battleState.setup.team=team;renderBattleSelection();renderBossEventControls();
});
document.getElementById('bossEventDifficulty')?.addEventListener('input',event=>{window.BossEventSystem.setDifficulty(getBossEventType(),event.target.value);renderBossEventControls();});

function hasRaidSecret(cardId) {
  return getOwnedCardCount(cardId) > 0 || state.achievementRewardReceipts?.[`raid_secret_${cardId.replace('raid-secret-', '')}`] === true;
}

function grantRaidSecret(secret) {
  const card = getCardById(secret.cardId);
  if (!card?.raidOnly) return false;
  const receipt = card.unlockRequirement;
  if (state.achievementRewardReceipts?.[receipt]) return true;
  const previous = JSON.parse(JSON.stringify(state));
  try {
    if (getOwnedCardCount(card.id) === 0) {
      const ids = normalizeCardMutations(secret.mutationIds), key = canonicalVariantKey(card.id, ids);
      state.unlocked[card.id] = getUnlockedCountById(card.id) + 1;
      state.mutations[key] = Math.max(0, Number(state.mutations[key]) || 0) + 1;
      state.inventory[key] = { id: card.id, cardId: card.id, mutation: ids.join('+'), mutationIds: ids, count: Math.max(0, Number(state.inventory[key]?.count) || 0) + 1 };
      ensureCardProgress(card.id);
    }
    state.achievementRewardReceipts ||= {}; state.achievementRewardReceipts[receipt] = true;
    if (!saveState()) throw new Error('Không thể lưu thẻ Raid.');
    return true;
  } catch (error) { state = previous; console.warn(error.message); return false; }
}

function renderRaidControls() {
  const raid = window.RaidSystem;
  if (!raid) return;
  const controls = document.getElementById('raidControls'); controls?.classList.toggle('hidden', !isRaidBattle());
  const type = getRaidType(), progress = raid.snapshot(type), range = raid.coinRange(progress.difficulty);
  const typeSelect=document.getElementById('raidTypeSelect');if(typeSelect)typeSelect.disabled=isBattleMatchActive();
  const slider = document.getElementById('raidDifficulty'); if (!controls || !slider) return; slider.value = progress.difficulty; slider.disabled = isBattleMatchActive();
  syncDifficultyNumber('raid', progress.difficulty);
  setViewText('raidDifficultyValue', `${progress.difficulty} • Enemy Lv.${progress.difficulty}`);
  setViewText('raidBalances', `${window.InventorySystem.quantity(raid.TYPES[type].keyId)} Keys • ${progress.coins.toLocaleString('en-US')} Coins • Team HP/ATK +${progress.upgradeLevel}%`);
  setViewText('raidRules', `4 player cards vs 10 preset bosses • 1 Key per entry • Victory: ${range.min}–${range.max} ${raid.TYPES[type].coinName} • ${((type==='holy_grail'?raid.excaliburChance(progress.difficulty):raid.secretChance(progress.difficulty)) * 100).toFixed(2)}% ${type==='holy_grail'?'Excalibur Sword':'secret card'} roll • No VNĐ, EXP or ordinary drops • Speed Battle Potion applies.`);
  const list = document.getElementById('raidEnemyPreview'); if (!list) return; list.replaceChildren();
  for (const enemy of raid.preview(type)) { const li = document.createElement("li"); li.textContent = `${enemy.card.name} • Lv.${enemy.level} • HP ${enemy.hpMin.toLocaleString("en-US")}–${enemy.hpMax.toLocaleString("en-US")} • ATK ${enemy.atkMin.toLocaleString("en-US")}–${enemy.atkMax.toLocaleString("en-US")}`; list.append(li); }
  if (isRaidBattle() && !isBattleMatchActive()) els.battleStartButton.disabled = !isBattleSetupValid() || !raid.canEnter(type);
}

function renderRaidShop() {
  const raid = window.RaidSystem, type = getRaidType(), progress = raid.snapshot(type);
  setViewText('raidShopTitle', `${raid.TYPES[type].name} Shop`);
  setViewText('raidShopBalance', `${progress.coins.toLocaleString('en-US')} ${raid.TYPES[type].coinName} • Team HP/ATK +${progress.upgradeLevel}%`);
  raid.renderShop(document.getElementById('raidShopGrid'), type, () => {
    renderRaidShop(); renderRaidControls(); renderPotionInventory();
    if (battleState && !isBattleMatchActive()) renderBattleSelection();
  });
}

function finishRaidBattle(won) {
  if (!battleState?.raid || battleState.finished) return;
  if (won && window.PassiveSystem.checkBattleWinner(battleState) !== 'player') return;
  let summary;
  try { summary = window.RaidSystem.finish(battleState, won); }
  catch (error) { summary = { won: false, coins: 0, secret: null, type: battleState.raid.type, difficulty: battleState.raid.difficulty, error: error.message }; appendBattleLog(error.message, 'defeat'); }
  if (!summary) return;
  if (!summary.error) { battleState.questResultWon = summary.won; recordQuestBattleCompletion(battleState); }
  clearAutoContinueBattleTimer(); clearBattleTurnTimer(); clearBattleAnimationTimers();
  battleState.finished = true; battleState.isBattling = false; battleState.outcome = summary.won ? 'victory' : 'defeat';
  const secret = summary.secret ? getCardById(summary.secret.cardId) : null;
  const mutationLabel = summary.secret?.mutationIds.length ? ` [${summary.secret.mutationIds.map(id => MUTATION_BY_ID[id]?.name || id).join(' + ')}]` : '';
  const body = document.getElementById('raidSummary');
  body.textContent = `${window.RaidSystem.TYPES[summary.type].name} • Difficulty ${summary.difficulty}\nRaid Coins: +${summary.coins} • Drop x${(summary.dropMultiplier || 1).toFixed(2)}\n${secret ? `Exclusive card: ${secret.name}${mutationLabel}\n` : ''}${summary.item ? `Excalibur Sword +${summary.item.quantity}\n` : ''}No VNĐ • No EXP • No ordinary drops${summary.error ? `\n${summary.error}` : ''}`; body.classList.remove('hidden');
  document.getElementById('raidResultShopButton')?.classList.remove('hidden');
  els.battleResultTitle.textContent = summary.won ? '⚓ RAID COMPLETE' : '⚓ RAID ENDED';
  els.battleResultText.textContent = summary.error || (summary.won ? 'The entire boss lineup and all remaining enemies were defeated.' : 'Your collection is preserved. A new entry costs another Key.');
  els.battleResultPower.textContent = getBattleModeLabel();
  for (const [id, label] of Object.entries({ battleResultBaseLabel: 'Raid Coins', battleResultTimeLabel: 'Enemy Level', battleResultLevelLabel: 'Raid Team HP/ATK' })) setViewText(id, label);
  els.battleResultBaseValue.textContent = String(summary.coins); els.battleResultTimeBonus.textContent = `Lv.${summary.difficulty}`; els.battleResultLevelDiff.textContent = `+${battleState.raid.upgradeLevel}%`;
  els.battleResultCash.textContent = '0 VNĐ'; els.battleResultExp.textContent = '0 EXP'; els.battleResultDropRate.textContent = '0%'; els.battleResultLossStatus.textContent = 'NONE';
  refreshAchievements(); updateStats(); renderCollection(); renderRaidControls(); renderPotionInventory();
  if (!document.getElementById('raidShopModal')?.classList.contains('hidden')) renderRaidShop();
  const replayable = canReplayBattleTeam(); els.battleAutoAgainButton.disabled = !replayable; els.battleAutoAgainButton.textContent = replayable ? 'Raid Again • 1 Key' : `Need ${window.InventorySystem.getItem(window.RaidSystem.TYPES[getRaidType()].keyId)?.name || 'Raid Key'}`;
  els.battleArena.classList.add('hidden'); setBattleModalLock(false); els.battleVictory.classList.remove('hidden', 'battle-result--neutral', 'battle-result--victory', 'battle-result--defeat'); els.battleVictory.classList.add(summary.won ? 'battle-result--victory' : 'battle-result--defeat'); els.battleVictory.setAttribute('aria-hidden', 'false');
  if (replayable) scheduleAutoContinueBattle();
}

function renderTimeTrialControls() {
  const trial = window.TimeTrialSystem;
  if (!trial) return;
  const mode = getBattleMode(), active = trial.isMode(mode), exp = trial.isExp(mode);
  const controls = document.getElementById('timeTrialControls');
  controls?.classList.toggle('hidden', !active);
  setViewText('timeTrialProgress', exp ? `${window.InventorySystem.quantity(trial.TICKET_ID)} EXP Tickets` : `Room ${trial.room} • Best cleared ${trial.bestRoom}`);
  setViewText('timeTrialBalance', `${trial.shards.toLocaleString('en-US')} Shards`);
  setViewText('timeTrialRules', exp
    ? '1-second turns • 1 Ticket per attempt • 300s • 0 ATK EXP Monsters • 0.1%–1.5% current-level EXP per kill • No VNĐ, Shards or items. Auto Continue uses another Ticket. EXP and Drop bonuses apply to their respective rewards.'
    : '2-second turns • 180s per room • 3 minions + 1 boss • Shards per defeated enemy • No EXP or VNĐ. Defeat, timeout or exit resets to Room 1. EXP and Drop bonuses apply to their respective rewards.');
  const timer = document.getElementById('timeTrialTimer');
  timer?.classList.toggle('hidden', !active || !battleState?.trial || battleState.finished);
  if (timer && active && battleState?.trial) {
    const seconds = Math.ceil(trial.remaining(battleState) / 1000);
    timer.textContent = `TIME LEFT ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}${exp ? ` • ${battleState.trial.monsters} defeats` : ''}`;
    timer.classList.toggle('is-urgent', seconds <= 30);
  }
  if (active && !battleState?.isBattling && els.battleStartButton) {
    els.battleStartButton.disabled = !isBattleSetupValid() || !trial.canEnter(mode);
  }
}

function renderTimeTrialShop() {
  const trial = window.TimeTrialSystem;
  setViewText('timeTrialShopBalance', `${trial.shards.toLocaleString('en-US')} Shards • Potions / Ticket: 50 • Speed Battle Potion: 200`);
  trial.renderShop(document.getElementById('timeTrialShopGrid'), () => {
    renderTimeTrialShop(); renderTimeTrialControls(); renderPotionInventory();
    if (battleState && !battleState.isBattling) renderBattleSelection();
    if (battleState?.finished && isTimeTrialBattle()) {
      const replayable = canReplayBattleTeam();
      els.battleAutoAgainButton.disabled = !replayable;
      els.battleAutoAgainButton.textContent = trial.isExp(getBattleMode()) ? replayable ? 'EXP Trial Again • 1 Ticket' : 'Need an EXP Ticket' : `Continue • Room ${trial.room}`;
    }
  });
}

function finishTimeTrialBattle(won, reason = '') {
  if (!battleState?.trial || battleState.finished) return;
  const trial = window.TimeTrialSystem;
  if (won && !trial.isExp(battleState.mode) && window.PassiveSystem.checkBattleWinner(battleState) !== 'player') return;
  let summary;
  try { summary = trial.finish(battleState, won, reason); }
  catch (error) {
    const run = battleState.trial;
    summary = { won: false, exp: trial.isExp(battleState.mode), room: run.room, nextRoom: trial.room,
      shards: run.shardsEarned, monsters: run.monsters, experience: run.experience,
      progressPercent: run.progressPercent, levelUps: run.levelUps, reason: 'save-error' };
    appendBattleLog(error.message, 'defeat');
  }
  if (!summary) return;
  if (summary.reason !== 'save-error') { battleState.questResultWon = summary.won; recordQuestBattleCompletion(battleState); }
  clearAutoContinueBattleTimer(); clearBattleTurnTimer(); clearBattleAnimationTimers();
  battleState.finished = true; battleState.isBattling = false;
  battleState.outcome = summary.won ? 'victory' : 'defeat';
  refreshAchievements(); saveState(); updateStats(); renderCollection(); renderTimeTrialControls();
  const body = document.getElementById('timeTrialSummary');
  body.textContent = summary.exp
    ? `EXP Monsters Defeated: ${summary.monsters}\nTotal EXP Gained: +${summary.progressPercent.toFixed(2)}% Level Progress\n+${summary.experience.toLocaleString('en-US')} whole EXP • ${summary.levelUps} level-ups\nNo Shards • No VNĐ • No items`
    : `Room ${summary.room} ${summary.won ? 'Cleared' : 'Failed'}\nTime Trial Shards: +${summary.shards} • Drop x${window.InventorySystem.getDropMultiplier().toFixed(2)}\n${summary.won ? `Next: Room ${summary.nextRoom}` : 'Progress reset to Room 1'}\nNo EXP • No VNĐ • No item drops`;
  body.classList.remove('hidden');
  document.getElementById('timeTrialResultShopButton')?.classList.remove('hidden');
  els.battleResultTitle.textContent = summary.won ? '🏆 TIME TRIAL COMPLETE' : '⏱ TIME TRIAL ENDED';
  els.battleResultText.textContent = summary.reason === 'time-limit' ? 'Time limit reached.' : summary.won ? 'All room enemies defeated.' : 'Attempt ended. Your collection is preserved.';
  els.battleResultPower.textContent = `${getBattleModeLabel()} • ${Math.min(trial.LIMITS[battleState.mode] / 1000, (Date.now() - battleState.trial.startedAt) / 1000).toFixed(1)}s`;
  for (const [id, text] of Object.entries({ battleResultBaseLabel: summary.exp ? 'EXP Monsters' : 'Shards earned',
    battleResultTimeLabel: 'Time limit', battleResultLevelLabel: 'Turn interval' })) setViewText(id, text);
  els.battleResultBaseValue.textContent = String(summary.exp ? summary.monsters : summary.shards);
  els.battleResultTimeBonus.textContent = `${trial.LIMITS[battleState.mode] / 1000}s`;
  els.battleResultLevelDiff.textContent = `${trial.turnMs(battleState.mode)/1000}s • fixed`; els.battleResultCash.textContent = '0 VNĐ';
  els.battleResultExp.textContent = summary.exp ? `+${summary.experience} EXP` : '0 EXP';
  els.battleResultDropRate.textContent = '+0.00%'; els.battleResultLossStatus.textContent = 'NONE — COLLECTION PRESERVED';
  const replayable = canReplayBattleTeam();
  els.battleAutoAgainButton.disabled = !replayable;
  els.battleAutoAgainButton.textContent = summary.exp ? replayable ? 'EXP Trial Again • 1 Ticket' : 'Need an EXP Ticket' : `Continue • Room ${trial.room}`;
  els.battleArena.classList.add('hidden'); setBattleModalLock(false);
  els.battleVictory.classList.remove('hidden', 'battle-result--neutral', 'battle-result--victory', 'battle-result--defeat');
  els.battleVictory.classList.add(summary.won ? 'battle-result--victory' : 'battle-result--defeat');
  els.battleVictory.setAttribute('aria-hidden', 'false');
  if (replayable) scheduleAutoContinueBattle();
}

function renderPotionInventory() {
  if (!els.inventoryModal || els.inventoryModal.classList.contains('hidden')) return;
  window.StorageSystem?.render(els.inventoryModal);
}

function renderTowerControls() {
  const tower = window.TowerSystem;
  if (!tower) return;
  const isTower = isTowerBattle();
  els.towerBattleControls?.classList.toggle('hidden', !isTower);
  const selector = els.towerWeatherSelect;
  if (selector && !selector.options.length) {
    for (const weather of tower.weatherList(WEATHERS)) {
      const option = document.createElement('option'); option.value = weather.id; option.textContent = weather.name; selector.appendChild(option);
    }
  }
  const mode = getTowerWeatherMode();
  const floor = tower.nextFloor(mode);
  if (els.towerFloorDisplay) els.towerFloorDisplay.textContent = `Floor ${floor} • ∞${tower.isElite(floor) ? ' • ELITE' : ''}`;
  const hints=tower.describeType(mode,WEATHERS);
  setCachedText(els.towerWeatherRules,hints.player);
  setViewText('towerEnemyRules',hints.enemies);
  setViewText('towerRewardHint',hints.reward);
  if (els.battleStartButton && isTower && tower.completed(mode)) els.battleStartButton.disabled = true;
}
function renderTowerShop() {
  const tower = window.TowerSystem, inventory = window.InventorySystem;
  if (!tower || !inventory) return;
  if (els.towerCoinBalance) els.towerCoinBalance.textContent = `🪙 ${tower.coins.toLocaleString('en-US')} Tower Coins • Speed Battle Potion: 100 coins`;
  const grid = els.towerShopItems;
  if (!grid || document.getElementById('towerShopModal')?.classList.contains('hidden')) return;
  grid.replaceChildren();
  for (const offer of tower.SHOP_ITEMS) {
    const potion = inventory.getItem(offer.id); if (!potion) continue;
    const card = document.createElement('article'); card.className = 'module-item';
    const name = document.createElement('strong'); name.textContent = `${potion.icon} ${potion.name}`;
    const detail = document.createElement('p'); detail.textContent = `${potion.description} • Owned: ${potion.quantity}`;
    const button = document.createElement('button'); button.type = 'button'; button.textContent = `Purchase • ${offer.cost} 🪙`; button.disabled = tower.coins < offer.cost;
    button.addEventListener('click', () => { if (tower.purchasePotion(potion.id, inventory)) { renderTowerShop(); renderPotionInventory(); } });
    card.append(name, detail, button); grid.appendChild(card);
  }
}

// ============================================================
// PROTECTED SAVE TRANSPORT (integrity + Base64, not encryption).
// A client-side embedded key cannot provide server-grade anti-cheat.
// ============================================================
const SECRET_SALT = 'ANIME_CARD_RNG_SECURE_SECRET_KEY_2026';
// Accepted only for old-save compatibility; never exported, enforced or updated.
const LEGACY_SAVE_TRANSFER_KEYS = Object.freeze(['save_cooldown_export','save_cooldown_import']);
const SAVE_TRANSFER_LOCK = 'anime_card_rng_save_transfer';
const SAVE_DATA_MAX_BYTES = 10 * 1024 * 1024;
const SAVE_FILE_MAX_BYTES = 32 * 1024 * 1024;
const PROTECTED_SAVE_FORMAT = 'anime-card-rng-protected-save';
const SAVE_TAMPER_MESSAGE = 'Phát hiện dữ liệu đã bị chỉnh sửa trái phép!';
let saveTransferBusy = false;
let saveChecksumKeyPromise = null;

function saveIntegrityError() {
  const error = new Error(SAVE_TAMPER_MESSAGE); error.code = 'SAVE_TAMPERED'; return error;
}
function assertSaveCryptoSupport() {
  if (!window.crypto?.subtle || typeof TextEncoder !== 'function' || typeof TextDecoder !== 'function') {
    throw new Error('Trình duyệt không hỗ trợ Web Crypto. Hãy dùng trình duyệt hiện đại trong ngữ cảnh an toàn (HTTPS, localhost hoặc file được trình duyệt tin cậy).');
  }
}
async function calculateSaveChecksum(dataString) {
  assertSaveCryptoSupport();
  try {
    saveChecksumKeyPromise ||= window.crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET_SALT), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const key = await saveChecksumKeyPromise;
    const signed = await window.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(dataString));
    return Array.from(new Uint8Array(signed), byte => byte.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    saveChecksumKeyPromise = null;
    const error = new Error('Không thể tính checksum bảo vệ save. Chưa thay đổi dữ liệu.'); error.code = 'SAVE_CRYPTO_ERROR'; throw error;
  }
}
function encodeSaveBase64(text) {
  const bytes = new TextEncoder().encode(text); let binary = '';
  for (let i = 0; i < bytes.length; i += 32768) binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return window.btoa(binary);
}
function decodeSaveBase64(encoded) {
  if (typeof encoded !== 'string' || !encoded.length || encoded.length > SAVE_FILE_MAX_BYTES || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded)) throw saveIntegrityError();
  const binary = window.atob(encoded);
  // Reject ignored padding bits, whitespace, BOM and alternate encodings.
  if (window.btoa(binary) !== encoded) throw saveIntegrityError();
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
}
function saveChecksumsMatch(actual, expected) {
  if (typeof expected !== 'string' || !/^[0-9a-f]{64}$/.test(expected)) return false;
  let difference = 0;
  for (let i = 0; i < actual.length; i++) difference |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return difference === 0;
}
async function encryptGameSave(dataString) {
  if (typeof dataString !== 'string' || new TextEncoder().encode(dataString).length > SAVE_DATA_MAX_BYTES) throw new Error('Dữ liệu save vượt giới hạn 10 MiB.');
  const checksum = await calculateSaveChecksum(dataString);
  return encodeSaveBase64(JSON.stringify({ format: PROTECTED_SAVE_FORMAT, version: 1, data: dataString, checksum }));
}
async function decryptGameSave(encoded) {
  assertSaveCryptoSupport();
  try {
    const decoded = decodeSaveBase64(encoded), payload = JSON.parse(decoded);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload) || payload.format !== PROTECTED_SAVE_FORMAT || payload.version !== 1 || typeof payload.data !== 'string' || new TextEncoder().encode(payload.data).length > SAVE_DATA_MAX_BYTES) throw saveIntegrityError();
    // Require the exact outer serialization as well as authenticated data.
    if (decoded !== JSON.stringify({ format: PROTECTED_SAVE_FORMAT, version: 1, data: payload.data, checksum: payload.checksum })) throw saveIntegrityError();
    const actual = await calculateSaveChecksum(payload.data);
    if (!saveChecksumsMatch(actual, payload.checksum)) throw saveIntegrityError();
    return payload.data;
  } catch (error) { if (error.code === 'SAVE_CRYPTO_ERROR') throw error; throw saveIntegrityError(); }
}
function showSaveTransferError(error) {
  const message = error?.message || String(error);
  setSaveTransferStatus(message, true); window.alert(message);
}
function renderSaveTransferAvailability() {
  for (const id of ['saveExportAvailability','saveImportAvailability']) {
    const label=document.getElementById(id);if(label)label.textContent='Không có thời gian chờ giữa các lần chuyển save.';
  }
}
function setSaveTransferBusy(busy) {
  saveTransferBusy = busy;
  for (const id of ['exportSaveButton', 'importSaveButton']) { const button = document.getElementById(id); if (button) button.disabled = busy; }
  document.getElementById('saveManagerModal')?.setAttribute('aria-busy', String(busy));
}
async function withSaveTransfer(action, operation) {
  if (window.SandboxSystem?.active) { setSaveTransferStatus('Thoát Sandbox trước khi chuyển save.',true); return false; }
  if (saveTransferBusy) { showSaveTransferError(new Error('Đang xử lý chuyển save. Vui lòng đợi hoàn tất.')); return false; }
  setSaveTransferBusy(true);
  try {
    assertSaveCryptoSupport();
    if (!navigator.locks?.request) throw new Error('Trình duyệt chưa hỗ trợ Web Locks để khóa chuyển save giữa các tab. Thao tác đã bị chặn an toàn.');
    return await navigator.locks.request(SAVE_TRANSFER_LOCK, { ifAvailable: true }, async lock => {
      if (!lock) throw new Error('Một tab khác đang chuyển save. Vui lòng đợi rồi thử lại.');
      return await operation();
    });
  } catch (error) { showSaveTransferError(error); return false; }
  finally { setSaveTransferBusy(false); renderSaveTransferAvailability(); }
}

// ============================================================
// COMPLETE JSON SAVE TRANSFER
// Validate every store before writing; pagehide must not overwrite an import.
// ============================================================
function getGameSaveKeys() {
  return [STORAGE_KEY, window.InventorySystem.KEY, window.TowerSystem.KEY, window.AchievementSystem.KEY, window.TimeTrialSystem.KEY, window.RaidSystem.KEY, window.BossEventSystem.KEY, window.EvolutionSystem.KEY, window.QuestSystem.KEY, window.QuestsSystem.KEY, window.DropAudioSystem.KEY, window.DropAudioSystem.VOLUME_KEY, window.BackgroundActivitySystem.VOLUME_KEY, window.PotionHudSystem.KEY, window.EquipmentSystem.KEY, (window.RollViewSystem?.KEY || 'anime_card_rng_hide_rolling_card'), window.BackgroundActivitySystem.MUSIC_KEY, ...LEGACY_STORAGE_KEYS, AUTO_CONTINUE_STORAGE_KEY];
}
function setSaveTransferStatus(message, failed = false) {
  const status = document.getElementById('saveTransferStatus');
  if (status) { status.textContent = message; status.classList.toggle('is-error', failed); }
}
function buildGameSaveExport() {
  syncGameClockToNow(); refreshAchievements(); window.InventorySystem?.tick();
  if (![window.InventorySystem.flush(), window.TowerSystem.flush(), window.AchievementSystem.flush(), window.TimeTrialSystem.flush(), window.RaidSystem.flush(), window.BossEventSystem.flush(), window.EvolutionSystem.flush(), window.EquipmentSystem.flush(), window.QuestSystem.flush(), window.QuestsSystem.flush()].every(Boolean)) throw new Error('Your progress could not be saved. Please try again.');
  if (!saveState()) throw new Error('Your progress could not be saved. Please try again.');
  const storage = {};
  for (const key of getGameSaveKeys()) {
    const value = localStorage.getItem(key);
    if (value !== null) storage[key] = JSON.parse(value);
  }
  return { format: 'anime-card-rng-save', version: 1, exportedAt: new Date().toISOString(), storage };
}
async function exportGameSave() {
  return withSaveTransfer('export', async () => {
    const bundle = buildGameSaveExport(), actionAt = Date.now();
    const protectedText = await encryptGameSave(JSON.stringify(bundle));
    const blob = new Blob([protectedText], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob), anchor = document.createElement('a');
    anchor.href = url; anchor.download = `anime-card-save-${new Date(actionAt).toISOString().slice(0, 10)}.acrsave`;
    document.body.append(anchor);
    try { anchor.click(); }
    catch (error) { throw new Error('Không thể xuất save: ' + error.message); }
    finally { anchor.remove(); window.setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, 1000); }
    setSaveTransferStatus('Đã tạo và gửi tệp .acrsave tới trình duyệt. Có thể xuất hoặc nhập tiếp ngay.');
    return true;
  });
}
function validateSaveRecord(key, value) {
  const object = item => Boolean(item && typeof item === 'object' && !Array.isArray(item));
  const ensure = (condition, message) => { if (!condition) throw new Error(`Invalid ${key}: ${message}`); };
  const number = (item, label, integer = true) => ensure((typeof item === 'number' || (typeof item === 'string' && item.trim() !== '')) && Number.isFinite(Number(item)) && Number(item) >= 0 && (!integer || Number.isSafeInteger(Number(item))), `${label} must be a nonnegative ${integer ? 'integer' : 'number'}.`);
  const flags = (map, label) => { ensure(object(map), `${label} must be an object.`); for (const flag of Object.values(map)) ensure(typeof flag === 'boolean', `${label} flags must be true or false.`); };
  const counts = (map, label) => { ensure(object(map), `${label} must be an object.`); for (const n of Object.values(map)) number(n, label); };
  if ([window.BackgroundActivitySystem.VOLUME_KEY, window.DropAudioSystem.VOLUME_KEY].includes(key)) { ensure(typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1, 'Audio volume must be between 0 and 1.'); return value; }
  if (key === AUTO_CONTINUE_STORAGE_KEY || key === (window.RollViewSystem?.KEY || 'anime_card_rng_hide_rolling_card') || key === window.BackgroundActivitySystem.MUSIC_KEY || key === window.DropAudioSystem.KEY || key === window.PotionHudSystem.KEY) { ensure(typeof value === 'boolean', 'Auto Continue must be a boolean.'); return value; }
  ensure(object(value), 'expected a JSON object.');
  if (key === STORAGE_KEY || LEGACY_STORAGE_KEYS.includes(key)) {
    ensure(Boolean(parseStoredSave(JSON.stringify(value))), 'not a recognized game save.');
    for (const field of ['totalRolls', 'currency', 'experience', 'battleDropRateBonus', 'dropChance']) if (field in value) number(value[field], field, field !== 'battleDropRateBonus' && field !== 'dropChance');
    for (const field of ['unlocked', 'unlockedCards']) if (field in value) {
      ensure(object(value[field]) || Array.isArray(value[field]), `${field} must contain card records.`);
      if (object(value[field])) for (const n of Object.values(value[field])) if (n !== true && n !== false) number(n, field);
    }
    if ('mutations' in value) counts(value.mutations, 'mutations');
    if ('inventory' in value) {
      ensure(object(value.inventory) || Array.isArray(value.inventory), 'inventory must contain card variants.');
      for (const entry of Object.values(value.inventory)) { ensure(object(entry), 'invalid card variant.'); if ('count' in entry) number(entry.count, 'variant count'); }
    }
    for (const field of ['cardProgress', 'cardLevels', 'levels']) if (field in value) {
      ensure(object(value[field]), `${field} must be an object.`);
      for (const entry of Object.values(value[field])) {
        if (object(entry)) { if ('level' in entry) number(entry.level, 'level'); if ('exp' in entry) number(entry.exp, 'EXP'); }
        else number(entry, 'level');
      }
    }
    if ('upgrades' in value) counts(value.upgrades, 'upgrades');
    if ('equipment' in value) ensure(Array.isArray(value.equipment), 'equipment must be an array.');
    if ('achievementRewardReceipts' in value) flags(value.achievementRewardReceipts, 'reward receipts');
    if ('migrations' in value) flags(value.migrations, 'save migrations');
    if ('weather' in value) {
      ensure(object(value.weather), 'weather must be an object.');
      for (const field of ['gameSeconds', 'lastRealTimestamp', 'lastSchedulerSecond', 'gameMinutes', 'lastSchedulerMinute']) if (field in value.weather) number(value.weather[field], field, false);
      if ('active' in value.weather) {
        ensure(Array.isArray(value.weather.active), 'active weather must be an array.');
        for (const entry of value.weather.active) { ensure(object(entry) && typeof entry.weatherId === 'string', 'invalid active weather.'); number(entry.expiresAt, 'weather expiry', false); if ('startedAt' in entry) number(entry.startedAt, 'weather start', false); }
      }
    }
  } else if (key === window.InventorySystem.KEY) {
    if ('version' in value) ensure([1, 2, 3].includes(value.version), 'unsupported item save version.');
    ensure(object(value.items) || Array.isArray(value.items), 'items must contain item stacks.');
    for (const entry of Object.values(value.items)) {
      if (object(entry)) {
        ensure('quantity' in entry || 'count' in entry, 'item is missing its quantity.'); number(entry.quantity ?? entry.count, 'item quantity');
        for (const field of ['id', 'name', 'description', 'type', 'icon', 'image', 'tier']) if (field in entry) ensure(typeof entry[field] === 'string', `${field} must be text.`);
      } else number(entry, 'item quantity');
    }
    if ('buffs' in value) counts(value.buffs, 'potion expiry');
    if ('receipts' in value) { ensure(object(value.receipts),'invalid item receipts'); for(const [stream,receipt]of Object.entries(value.receipts))ensure(/^[a-z0-9_]{1,40}$/.test(stream)&&typeof receipt==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(receipt),'invalid item receipt'); }
    if ('paused' in value) counts(value.paused, 'paused potion duration');
    if ('misses' in value) number(value.misses, 'pity');
  } else if (key === window.TowerSystem.KEY) {
    if ('version' in value) ensure(value.version === 1, 'unsupported Tower save version.');
    if ('coins' in value) number(value.coins, 'Tower Coins');
    if ('victories' in value) number(value.victories, 'Tower victories');
    ensure(object(value.cleared), 'cleared floors must be an object.'); counts(value.cleared, 'cleared floors');
    if ('encounters' in value) {
      ensure(object(value.encounters), 'Tower encounters must be an object.');
      for (const [mode, record] of Object.entries(value.encounters)) {
        ensure(window.TowerSystem.validMode(mode) && window.TowerSystem.isEncounterRecord(record, mode), 'invalid locked Tower lineup.');
        ensure(record.floor === (Number(value.cleared[mode]) || 0) + 1, 'locked lineup must match the next uncleared floor.');
      }
    }
  } else if (key === window.TimeTrialSystem.KEY) {
    ensure(window.TimeTrialSystem.validSave(value), 'invalid Time Trial progression, fractional EXP or active attempt.');
  } else if (key === window.QuestsSystem.KEY) {
    ensure(window.QuestsSystem.validSave(value), 'invalid Daily / Weekly quest board or timed reward.');
  } else if (key === window.QuestSystem.KEY) {
    ensure(window.QuestSystem.validSave(value), 'invalid accepted quest progress or reward receipt.');
  } else if (key === window.EquipmentSystem.KEY) {
    ensure(window.EquipmentSystem.validSave(value), 'invalid equipment slot or unfinished crafting transaction.');
  } else if (key === window.EvolutionSystem.KEY) {
    ensure(window.EvolutionSystem.validSave(value), "unfinished or invalid evolution transaction.");
  } else if (key === window.BossEventSystem.KEY) {
    ensure(window.BossEventSystem.validSave(value), "invalid Boss Event progression or pending reward.");
  } else if (key === window.RaidSystem.KEY) {
    ensure(window.RaidSystem.validSave(value), 'invalid Raid wallet, upgrades, difficulty or pending reward.');
  } else if (key === window.AchievementSystem.KEY) {
    if ('version' in value) ensure(value.version === 1, 'unsupported achievement save version.');
    ensure(object(value.stats), 'achievement stats must be an object.'); counts(value.stats, 'achievement stats');
    for (const field of ['claimed', 'unlockedRequirements']) if (field in value) flags(value[field], field);
    if ('towerProgress' in value) counts(value.towerProgress, 'achievement Tower progress');
  }
  return value;
}
function parseGameSaveImport(text) {
  if (typeof text !== 'string' || text.length > 10 * 1024 * 1024) throw new Error('Save files must be valid JSON smaller than 10 MB.');
  let file; try { file = JSON.parse(text); } catch (_) { throw new Error('This file is not valid JSON.'); }
  const object = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
  if (!object(file)) throw new Error('This is not an Anime Card RNG save.');
  // Reject unsafe record names and non-finite numbers before any normalization.
  function validateTree(value, depth = 0) {
    if (depth > 50) throw new Error('Save data is nested too deeply.');
    if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Save contains an invalid number.');
    if (value && typeof value === 'object') for (const [key, entry] of Object.entries(value)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Save contains an invalid record name.');
      validateTree(entry, depth + 1);
    }
  }
  validateTree(file);
  let storage;
  if ('format' in file || 'storage' in file) {
    if (file.format !== 'anime-card-rng-save' || file.version !== 1 || !object(file.storage)) throw new Error('Unsupported save format or version.');
    storage = file.storage;
    const keys = getGameSaveKeys();
    for (const key of Object.keys(storage)) if (!keys.includes(key) && !LEGACY_SAVE_TRANSFER_KEYS.includes(key)) throw new Error(`Unsupported game store: ${key}`);
    for (const key of keys.slice(0, 4)) if (!(key in storage)) throw new Error('The save is incomplete: a game data store is missing.');
  } else { throw new Error('Save bảo vệ phải chứa đầy đủ gói dữ liệu game.'); }
  const result = {};
  for (const [key, entry] of Object.entries(storage)) if(!LEGACY_SAVE_TRANSFER_KEYS.includes(key)) result[key] = JSON.stringify(validateSaveRecord(key, entry));
  // Use the existing migration/ownership sanitizer for the authoritative card save.
  result[STORAGE_KEY] = JSON.stringify(normalizeState(JSON.parse(result[STORAGE_KEY])));
  for (const legacyKey of LEGACY_STORAGE_KEYS) if (result[legacyKey]) result[legacyKey] = JSON.stringify(normalizeState(JSON.parse(result[legacyKey])));
  const itemKey = window.InventorySystem.KEY;
  result[itemKey] = JSON.stringify(window.InventorySystem.sanitizeSave(JSON.parse(result[itemKey])));
  const equipment = storage[window.EquipmentSystem.KEY];
  if(equipment?.equipped){const items=JSON.parse(result[itemKey]).items;const owned=Array.isArray(items)?items.find(item=>item.id===equipment.equipped):items[equipment.equipped];if(Number(typeof owned==='object'?owned?.quantity??owned?.count:owned)<1||!owned)throw Error('Equipped item is not owned in this save.');}
  return result;
}
async function importGameSave(input) {
  return withSaveTransfer('import', async () => {
    let text;
    if (typeof input === 'string') text = input;
    else {
      if (!input || typeof input.arrayBuffer !== 'function' || !/\.acrsave$/i.test(input.name || '')) throw new Error('Chỉ chấp nhận tệp .acrsave. Save JSON cũ không được nhập trực tiếp.');
      if (input.size > SAVE_FILE_MAX_BYTES) throw new Error('Tệp .acrsave vượt giới hạn 32 MiB.');
      try { text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(await input.arrayBuffer()); }
      catch (_) { throw saveIntegrityError(); }
    }
    const dataString = await decryptGameSave(text);
    const imported = parseGameSaveImport(dataString);
    const keys = [...getGameSaveKeys(),...LEGACY_SAVE_TRANSFER_KEYS], previous = new Map(keys.map(key => [key, localStorage.getItem(key)]));
    isImportingSave = true;
    try {
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(imported, key)) localStorage.setItem(key, imported[key]);
        else localStorage.removeItem(key);
      }
    } catch (error) {
      let restored = true;
      for (const [key, value] of previous) try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (_) { restored = false; }
      isImportingSave = false;
      throw new Error(restored ? 'Không thể ghi save. Tiến độ trước đó đã được khôi phục.' : 'Không thể ghi/khôi phục dữ liệu do bộ nhớ trình duyệt không khả dụng.');
    }
    isAutoRolling = false;
    if (els.autoRollToggle) els.autoRollToggle.checked = false;
    if (globalTickTimer !== null) { window.clearInterval(globalTickTimer); globalTickTimer = null; }
    clearCooldownExpiryTimer(); clearAutoContinueBattleTimer(); clearBattleTurnTimer(); clearBattleAnimationTimers();
    window.TimeTrialSystem.detach();
    setSaveTransferStatus('Đã nhập save bảo vệ. Đang tải lại game…');
    // Existing saveState/pagehide/visibility guards protect restored stores.
    window.location.reload();
    return true;
  });
}

// Evolution changes a cloned save first; no live ownership changes before commit.
function canEvolveNow() { return !window.EquipmentSystem?.blocked && !window.SandboxSystem?.active && !isImportingSave && !saveTransferBusy && !isBattleMatchActive() && window.EvolutionSystem.flush(); }
function prepareEquipmentCraft(recipe, selected) {
  if(!canEvolveNow()||state.currency<recipe.cost)throw Error('Finish the current battle or check VNĐ.');
  if(!saveState()||!window.InventorySystem.flush())throw Error('Unable to save before crafting.');
  const mainBefore=localStorage.getItem(STORAGE_KEY),itemsBefore=localStorage.getItem(window.InventorySystem.KEY),original=state;
  let mainAfter;
  try{
    state=JSON.parse(mainBefore);
    recipe.cards.forEach((requirement,index)=>{
      const variant=getVariantEntries(requirement.cardId).find(v=>v.key===selected[index]?.key&&v.count>=requirement.quantity);
      if(!variant||!window.EquipmentSystem.matches(requirement,variant)||decrementOwnershipVariant(requirement.cardId,variant.key,requirement.quantity)!==requirement.quantity)throw Error('Required card variant is no longer available.');
    });
    state.currency-=recipe.cost;syncOwnershipRecords();mainAfter=JSON.stringify(state);
  }finally{state=original;window.RollPerformanceSystem?.invalidateOwnership();}
  const items=JSON.parse(itemsBefore),entry=items.items[recipe.id];
  if(!entry||entry.quantity>=Number.MAX_SAFE_INTEGER)throw Error('Equipment stack unavailable.');
  entry.quantity++;
  return {mainBefore,mainAfter,itemsBefore,itemsAfter:JSON.stringify(items)};
}
function evolutionComplete(recipe) { return state.achievementRewardReceipts?.['evolution_' + recipe.id] === true || getOwnedCardCount(recipe.id) > 0; }
function prepareEvolution(recipe, variantKey) {
  if (!canEvolveNow() || evolutionComplete(recipe)) throw new Error('Thẻ này đã tiến hóa hoặc game đang bận.');
  const variant = getVariantEntries(recipe.baseId).find(v => v.key === variantKey && v.count > 0);
  if (!variant || getCardLevelInfo(recipe.baseId).level < recipe.level || window.InventorySystem.quantity(recipe.itemId)<1) throw new Error('Cần đúng biến thể Lv.100+ và vật phẩm tiến hóa.');
  if (!saveState() || !window.InventorySystem.flush()) throw new Error('Không thể lưu tiến độ hiện tại.');
  const mainBefore = localStorage.getItem(STORAGE_KEY), itemsBefore = localStorage.getItem(window.InventorySystem.KEY), original = state;
  let mainAfter;
  try {
    state = JSON.parse(mainBefore);
    if (decrementOwnershipVariant(recipe.baseId,variant.key,1) !== 1) throw new Error('Không thể tiêu thẻ gốc.');
    const ids = normalizeCardMutations(variant.mutations), key = canonicalVariantKey(recipe.id,ids);
    state.mutations[key] = 1; state.unlocked[recipe.id] = 1;
    state.inventory[key] = {id:recipe.id,cardId:recipe.id,mutationIds:ids,mutation:ids.join('+'),count:1};
    state.cardProgress[recipe.id] = {level:1,exp:0};
    state.achievementRewardReceipts['evolution_' + recipe.id] = true;
    // Equipment may only refer to copies that still exist after the sacrifice.
    syncOwnershipRecords(); mainAfter = JSON.stringify(state);
  } finally { state = original; }
  const items = JSON.parse(itemsBefore); items.items[recipe.itemId].quantity--;
  return {mainBefore,mainAfter,itemsBefore,itemsAfter:JSON.stringify(items)};
}
function onEvolutionCommitted() {
  state = loadState(); syncOwnershipRecords(); refreshAchievements(); updateStats(); renderCollection(); renderAvailableCards(); renderPotionInventory();
}
document.getElementById('evolutionOpenButton')?.addEventListener('click',()=>{ window.EvolutionSystem.render(document.getElementById('evolutionGrid')); openModal('evolutionModal'); });
document.getElementById('evolutionCloseButton')?.addEventListener('click',()=>closeModal('evolutionModal'));

// ============================================================
// ACHIEVEMENT COORDINATION (tracking/storage/rendering in achievements.js)
// ============================================================
function getAchievementSnapshot() {
  return { uniqueCards: getUniqueCount(), totalRolls: state.totalRolls, currency: state.currency,
    knownBossWins: window.BossEventSystem?.totalWins() || 0, knownBattleWins: window.TowerSystem?.victories || 0, knownRaidWins: window.RaidSystem?.totalWins() || 0, towerProgress: window.TowerSystem?.getProgressSnapshot() || {}, timeTrialRoom: window.TimeTrialSystem?.bestRoom || 0 };
}
function recordEarnedCurrency(amount) {
  window.AchievementSystem?.recordCurrencyEarned(amount);
  window.QuestSystem?.currencyEarned(amount);
}
function applyQuestBoardReward(receipt,reward) {
  if(!canEvolveNow())return false;
  if(state.achievementRewardReceipts?.[receipt])return true;
  const previous=JSON.parse(JSON.stringify(state));
  try {
    let earned=0;
    if(reward.money){earned=Math.min(Number.MAX_SAFE_INTEGER-state.currency,window.EquipmentSystem.scaleMoney(state.currency*reward.money));state.currency+=earned;}
    if(reward.weather){
      const choices=WEATHERS.filter(w=>reward.weather.includes(w.tier));
      const weather=choices[Math.floor(Math.random()*choices.length)];if(!weather)return false;
      const now=state.weather.gameSeconds,existing=state.weather.active.find(e=>e.weatherId===weather.id),until=now+reward.hours*3600;
      if(existing)existing.expiresAt=Math.max(existing.expiresAt,until);else state.weather.active.push({weatherId:weather.id,startedAt:now,expiresAt:until});
    }
    state.achievementRewardReceipts ||= {};state.achievementRewardReceipts[receipt]=true;
    if(!saveState())throw Error('Unable to save quest reward.');
    if(earned)recordEarnedCurrency(earned);return true;
  }catch(error){state=previous;console.warn(error.message);return false;}
}

function applyAchievementReward(achievement) {
  state.achievementRewardReceipts ||= {};
  if (state.achievementRewardReceipts[achievement.id] === true) return true;
  const previous = JSON.parse(JSON.stringify(state));
  try {
    const reward = achievement.reward || {};
    if (reward.cardId) {
      const card = getCardById(reward.cardId);
      if (!card) return false;
      const id = normalizeCardId(card.id), key = canonicalVariantKey(id, []);
      state.unlocked[id] = getUnlockedCountById(id) + 1;
      state.mutations[key] = Math.max(0, Number(state.mutations[key]) || 0) + 1;
      state.inventory[key] = { id, cardId: id, mutation: '', mutationIds: [], count: Math.max(0, Number(state.inventory[key]?.count) || 0) + 1 };
    }
    const currency = window.EquipmentSystem.scaleMoney(Math.max(0, Number(reward.currency) || 0));
    state.currency += currency;
    state.achievementRewardReceipts[achievement.id] = true;
    if (!saveState()) throw new Error('The reward could not be saved.');
    if (currency) recordEarnedCurrency(currency);
    if(reward.cardId)window.DropAudioSystem?.play(reward.cardId);
    return true;
  } catch (error) { state = previous; console.warn('Achievement reward save failed', error); return false; }
}
function refreshAchievements(render = true) {
  const achievements = window.AchievementSystem;
  if (!achievements || isImportingSave) return;
  achievements.sync(getAchievementSnapshot());
  if (!render) return;
  const ready = achievements.list().filter(item => item.complete && !item.claimed && !item.automatic).length;
  const badge = els.achievementReadyCount;
  setCachedText(badge, ready ? String(ready) : ''); if (badge && badge.hidden !== (ready === 0)) badge.hidden = ready === 0;
  if (els.achievementModal && !els.achievementModal.classList.contains('hidden')) renderAchievements();
}
function renderAchievements() {
  const achievements = window.AchievementSystem;
  if (!achievements) return;
  const category = document.getElementById('achievementCategory')?.value || 'all';
  const items = achievements.list();
  const summary = document.getElementById('achievementSummary');
  if (summary) summary.textContent = `${items.filter(item => item.claimed).length} claimed • ${items.filter(item => item.complete && !item.claimed && !item.automatic).length} ready • ${items.length} milestones • EXP +${achievements.getExpBonus(state.achievementRewardReceipts).toFixed(1)} • VNĐ +${achievements.getCoinBonus(state.achievementRewardReceipts).toFixed(1)} • Drops x${achievements.getDropMultiplier(state.achievementRewardReceipts).toFixed(2)}`;
  achievements.render(document.getElementById('achievementList'), category, () => {
    saveState(); updateStats(); renderUpgradeShop(); renderAvailableCards(); renderCollection(); refreshAchievements();
  });
}

// ============================================================
// GLOBAL LOOP
// ============================================================

// Quest progress receives only fresh, completed gameplay events.
function recordQuestBattleCompletion(battle) {
  if (battle?.sandbox || battle?.mode === 'sandbox' || window.SandboxSystem?.active) return;
  if (!battle?.questContext || battle.questCompletionRecorded || ['surrender', 'aborted'].includes(battle.outcome)) return;
  battle.questCompletionRecorded = true;
  window.QuestSystem.record('battle', { ...battle.questContext, won: battle.questResultWon ?? (battle.outcome === 'victory'), room: battle.trial?.room, teamElements: battle.questContext.teamElements });
}
function recordQuestEnemyDefeat(battle, victim, source) {
  const keys=window.RaidSystem.rollFateKey(battle,victim,source);
  if(keys)appendBattleLog(`Holy Grail Raid Key +${keys} • Fate enemy drop.`, 'victory');
  if (battle?.sandbox || battle?.mode === 'sandbox' || window.SandboxSystem?.active) return;
  if (!battle?.questContext || !battle.enemyTeam.includes(victim) || !battle.playerTeam.includes(source) || victim.isClone || victim.isSummoned || victim.isTemporaryAlly) return;
  const seen = battle.questDefeatSeen ||= new WeakSet();
  if (seen.has(victim)) return;
  seen.add(victim);
  const context = battle.questContext;
  window.QuestSystem.record('defeat', { ...context, id: `${context.id}_${++context.defeatSequence}`, cardId: victim.card.id, cardCategories:[...(victim.card.category||[])], weatherIds: getActiveWeatherDefinitions().map(w => w.id) });
}
function syncDifficultyNumber(prefix, value) {
  const input = document.getElementById(prefix + 'DifficultyNumber');
  if (!input) return;
  if (document.activeElement !== input) input.value = String(value);
  input.disabled = isBattleMatchActive();
}
function wireDifficultyNumber(prefix, system, getType, render) {
  const input = document.getElementById(prefix + 'DifficultyNumber');
  if (!input || !system) return;
  const commit = () => {
    if (isBattleMatchActive()) return;
    const previous = system.snapshot(getType()).difficulty;
    const parsed = input.value.trim() === '' ? previous : Number(input.value);
    const next = Number.isFinite(parsed) ? Math.max(1, Math.min(1000, Math.floor(parsed))) : previous;
    system.setDifficulty(getType(), next);
    input.value = String(system.snapshot(getType()).difficulty); render();
  };
  input.addEventListener('change', commit);
  input.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); commit(); input.blur(); } });
  document.getElementById(prefix + 'Difficulty')?.addEventListener('input', () => { input.value = String(system.snapshot(getType()).difficulty); });
}
wireDifficultyNumber('raid', window.RaidSystem, getRaidType, renderRaidControls);
wireDifficultyNumber('bossEvent', window.BossEventSystem, getBossEventType, renderBossEventControls);
document.getElementById('questOpenButton')?.addEventListener('click', () => { openModal('questModal'); window.QuestsSystem.open(); });
document.getElementById('craftingOpenButton')?.addEventListener('click',()=>{openModal('craftingModal');window.CraftingSystem.open(document.getElementById('craftingModal'));});
document.getElementById('settingsOpenButton')?.addEventListener('click',()=>{openModal('settingsModal');window.SettingsSystem?.render();window.PotionHudSystem?.render();});
document.getElementById('questCloseButton')?.addEventListener('click', () => closeModal('questModal'));


function globalTick() {
  if(window.EquipmentSystem?.blocked)return;
  if (isImportingSave) return;
  window.PotionHudSystem?.render();
  if (window.SandboxSystem?.active) return;
  refreshAchievements(!(window.RollViewSystem?.enabled && isAutoRolling));
  const now = Date.now();
  const previous = Number(state.weather.lastRealTimestamp);
  const deltaSeconds = Number.isFinite(previous)
    ? Math.max(0, (now - previous) / 1000)
    : 0;
  state.weather.lastRealTimestamp = now;

  advanceGameClock(deltaSeconds);
  window.QuestsSystem?.tick(state.weather.gameSeconds);

  if(window.InventorySystem?.tick(now))updateStats();
  window.TimeTrialSystem?.checkDeadline();
  if (els.battleModal && !els.battleModal.classList.contains('hidden')) { renderTimeTrialControls(); if (isBossEventBattle()) renderBossEventControls(); }
  renderPotionInventory();
  window.CraftingSystem?.refresh();
  completeCooldown(false);
  renderClockAndWeather(false);
  renderCooldownUI(now);
  // Available Rolls is driven by Weather eligibility, so it is explicitly
  // refreshed whenever the global ticker runs and immediately after weather changes.
  renderAvailableCards();

  // Only the clock changes here; ownership is already canonical. Persist each
  // tick without rebuilding every variant in the player's collection.
  saveState(true);

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

function isBattleMatchActive() {
  return Boolean(
    battleState &&
    battleState.finished !== true &&
    battleState.isBattling === true &&
    els.battleArena &&
    !els.battleArena.classList.contains('hidden')
  );
}

function setBattleModalLock(active) {
  const sandboxButton = document.getElementById('sandboxOpenButton');
  if (sandboxButton) sandboxButton.disabled = Boolean(active);
  const isActive = Boolean(active);
  document.body.classList.toggle('battle-lock', isActive);
  els.battleModal?.classList.toggle('battle-modal--active', isActive);
}

function openModal(id) {
  if (window.SandboxSystem?.active && id !== 'sandboxModal') return;
  const modal = document.getElementById(id);
  if (!modal) return;
  document.getElementById('utilityMenu')?.removeAttribute('open');
  flushRollUi(true);
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
  if (id === "collectionModal") {
    collectionNeedsRefresh = false;
    renderCollection();
  }
  if (id === "upgradesModal") renderUpgradeShop();
  if (id === "inventoryModal") renderPotionInventory();
  if (id === "achievementModal") { refreshAchievements(); renderAchievements(); }
  if (id === "towerShopModal") renderTowerShop();
  if (id === "timeTrialShopModal") renderTimeTrialShop();
  if (id === "raidShopModal") renderRaidShop();
  if (id === "bossEventShopModal") renderBossEventShop();
  if (id === "timeTrialModeModal") {
    modal.querySelectorAll('[data-time-trial-type]').forEach(button => {
      const selected = button.dataset.timeTrialType === getBattleMode();
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    setViewText('timeTrialModeTickets', `${window.InventorySystem.quantity(window.TimeTrialSystem.TICKET_ID)} EXP Time Trial Tickets in Storage • Select a type, then choose your lineup in Arena.`);
    modal.querySelector('[data-time-trial-type]')?.focus();
  }
  if (id === "saveManagerModal") renderSaveTransferAvailability();
  if (id === "cardPreviewModal") renderPreview();
  if (id === "battleModal") resetBattleView();
}

function returnToLobby() {
  window.TimeTrialSystem?.abort(battleState, 'exit');
  window.RaidSystem?.abort(battleState);
  window.BossEventSystem?.abort(battleState);
  clearAutoContinueBattleTimer();
  try {
    clearBattleTurnTimer();
    clearBattleAnimationTimers();
    setBattleModalLock(false);
    const modal = els.battleModal || document.getElementById('battleModal');
    modal?.classList.add('hidden');
    modal?.classList.remove('battle-modal--active');
    els.battleArena?.classList.add('hidden');
    els.battleVictory?.classList.add('hidden');
    els.battleVictory?.setAttribute('aria-hidden', 'true');
    els.battleSetup?.classList.remove('hidden');
    if (els.battleLog) els.battleLog.innerHTML = '';
    if (els.battleStatus) els.battleStatus.textContent = 'PREPARING';
    battleState = null;
    document.body.classList.remove('battle-lock', 'modal-open');
  } catch (error) {
    console.error('Return to Lobby cleanup failed safely:', error);
    try {
      document.getElementById('battleModal')?.classList.add('hidden');
      document.body.classList.remove('battle-lock', 'modal-open');
      battleState = null;
    } catch (fallbackError) {
      console.error('Return to Lobby fallback cleanup failed:', fallbackError);
    }
  }
}

function surrenderBattle() {
  window.TimeTrialSystem?.abort(battleState, 'surrender');
  window.RaidSystem?.abort(battleState);
  window.BossEventSystem?.abort(battleState);
  clearAutoContinueBattleTimer();
  if (!battleState) {
    closeModal('battleModal');
    return;
  }

  const wasActive = isBattleMatchActive();
  clearBattleTurnTimer();
  clearBattleAnimationTimers();

  if (wasActive) {
    battleState.finished = true;
    battleState.isBattling = false;
    battleState.outcome = 'surrendered';
    battleState.exitReason = 'player-surrender';
    lastBattleOutcome = { outcome: 'surrendered', at: Date.now() };
    appendBattleLog('Battle exited by player — match surrendered. No battle rewards were granted.', 'defeat');
  }

  els.battleArena?.classList.add('hidden');
  els.battleVictory?.classList.add('hidden');
  els.battleVictory?.setAttribute('aria-hidden', 'true');
  els.battleSetup?.classList.remove('hidden');
  if (els.battleStatus) els.battleStatus.textContent = 'PREPARING';
  setBattleModalLock(false);
  els.battleModal?.classList.add('hidden');
  els.battleModal?.classList.remove('battle-modal--active');
  document.body.classList.remove('battle-lock', 'modal-open');
  battleState = null;
}

function closeModal(id) {
  if (id === 'sandboxModal') { window.SandboxSystem?.exit?.(); return; }
  const modal = document.getElementById(id);
  if (!modal) return;

  // Active combat can only exit through the dedicated battle [X] surrender path.
  if (id === "battleModal" && isBattleMatchActive()) return;

  modal.classList.add("hidden");
  if(["cardPreviewModal","battleModal"].includes(id))window.DropAudioSystem?.stop();
  if (id === "cardPreviewModal") closeVariantMenu();
  if (id === "battleModal") {
    clearAutoContinueBattleTimer();
    clearBattleTurnTimer();
    clearBattleAnimationTimers();
    setBattleModalLock(false);
    try {
      els.battleArena?.classList.add('hidden');
      els.battleVictory?.classList.add('hidden');
      els.battleVictory?.setAttribute('aria-hidden', 'true');
      els.battleSetup?.classList.remove('hidden');
      if (els.battleStatus) els.battleStatus.textContent = 'PREPARING';
    } catch (error) {
      console.warn('Battle modal cleanup failed safely:', error);
    }
    battleState = null;
  }

  const anyOpen = [...document.querySelectorAll(".modal-backdrop")]
    .some(node => !node.classList.contains("hidden"));
  if (!anyOpen) document.body.classList.remove("modal-open");
}

function resetGame() {
  const confirmed = window.confirm("Reset rolls, 💵 upgrades, collection, mutations, weather, equipment, items, achievements, Tower and Time Trial progress? This cannot be undone.");
  if (!confirmed) return;
  pendingRollPresentation = null; rollUiDirty = false; rollUiCanPaint = true;
  window.RollPerformanceSystem?.cancel(flushRollUi);
  clearAutoContinueBattleTimer();
  autoContinueBattleEnabled = false;
  try { localStorage.removeItem(AUTO_CONTINUE_STORAGE_KEY); } catch (_) {}
  renderAutoContinueBattleToggle();
  returnToLobby();
  window.InventorySystem?.reset(); window.EquipmentSystem?.reset(); window.TowerSystem?.reset(); window.TimeTrialSystem?.reset(); window.RaidSystem?.reset(); window.BossEventSystem?.reset(); window.AchievementSystem?.reset(); window.EvolutionSystem?.reset(); window.QuestSystem?.reset(); window.QuestsSystem?.reset(); window.RollViewSystem?.reset?.();

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

function getCardPassiveCopy(card) {
  const value = card?.passives || card?.passive;
  return Array.isArray(value) ? { name: value.map(section => section.name || 'Passive').join(' + '), description: value } : value || { name: 'No passive', description: '' };
}
function normalizePassiveText(value) {
  if (Array.isArray(value)) return value.map(section => typeof section === 'object' ? `${section.name || ''}\n${normalizePassiveText(section.description)}` : normalizePassiveText(section)).join('\n\n');
  return String(value || 'No additional combat passive.').replace(/<br\s*\/?\s*>/gi, '\n').replace(/\\n/g, '\n');
}
function createPassiveExpandButton(name, description) {
  const button = document.createElement('button'); button.type = 'button'; button.className = 'passive-expand-button';
  button.textContent = '+'; button.setAttribute('aria-label', 'Read full passive'); button.dataset.passiveExpand = 'true';
  button.dataset.passiveName = name || 'Passive'; button.dataset.passiveDescription = normalizePassiveText(description);
  button.addEventListener('click', event => { event.stopPropagation(); openPassiveDetails(button); }); return button;
}
function renderPassiveCopy(node, name, description) {
  if (!node) return; node.textContent = normalizePassiveText(description); node.classList.add('passive-copy');
  node.parentElement?.querySelector('.passive-expand-button')?.remove();
  if (description) node.after(createPassiveExpandButton(name, description));
}
function openPassiveDetails(button) {
  setViewText('passiveDetailTitle', button.dataset.passiveName);
  setViewText('passiveDetailText', normalizePassiveText(button.dataset.passiveDescription));
  openModal('passiveDetailModal'); document.querySelector('#passiveDetailModal .modal-close')?.focus();
}
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.getElementById('passiveDetailModal')?.classList.contains('hidden')) {
    event.preventDefault(); event.stopImmediatePropagation(); closeModal('passiveDetailModal');
  }
}, true);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ============================================================
// PASSIVE SYSTEM HOST BRIDGE
// passives.js owns combat mechanics; app.js supplies persistence/UI
// callbacks and the live Weather database.
// ============================================================

if (window.PassiveSystem?.configureHost) {
  window.PassiveSystem.configureHost({
    getCardById,
    onUnitDefeated: recordQuestEnemyDefeat,
    appendBattleLog,
    showBattleFloatingText,
    renderBattleStats,
    renderCollection,
    isWeatherActive,
    addRandomCommonUncommonWeather(durationSeconds = 180) {
      const candidates = Object.values(WEATHER_TIERS)
        .filter(tier => tier?.id === 'common' || tier?.id === 'uncommon')
        .flatMap(tier => Array.isArray(tier?.weatherIds) ? tier.weatherIds : [])
        .map(id => WEATHER_BY_ID?.[id])
        .filter(Boolean);

      if (!candidates.length) return false;

      const weather = candidates[Math.floor(Math.random() * candidates.length)];
      const now = Math.floor(Number(state?.weather?.gameSeconds) || 0);
      const expiresAt = now + Math.max(1, Math.floor(Number(durationSeconds) || 180));
      const existing = state.weather.active.find(entry => entry.weatherId === weather.id);

      if (existing) {
        existing.expiresAt = Math.max(existing.expiresAt, expiresAt);
      } else {
        state.weather.active.push({
          weatherId: weather.id,
          startedAt: now,
          expiresAt
        });
      }

      showWeatherToast(weather);
      saveState();
      renderClockAndWeather(true);
      renderAvailableCards();
      return true;
    }
  });
}

// ============================================================
// EVENT WIRING
// ============================================================

function setupBattlePassiveTooltipDelegation() {
  if (document.getElementById('battlePassiveTooltip')) return;

  const tooltip = document.createElement('div');
  tooltip.id = 'battlePassiveTooltip';
  tooltip.className = 'battle-passive-tooltip';
  tooltip.hidden = true;

  const icon = document.createElement('span');
  icon.className = 'battle-passive-tooltip__icon';
  icon.textContent = '◇';
  const content = document.createElement('div');
  content.className = 'battle-passive-tooltip__content';
  const title = document.createElement('strong');
  const status = document.createElement('span');
  status.className = 'battle-passive-tooltip__status';
  const description = document.createElement('p');
  content.append(title, status, description);
  tooltip.append(icon, content);
  document.body.appendChild(tooltip);

  let activeTarget = null;

  const hide = () => {
    activeTarget = null;
    tooltip.hidden = true;
    tooltip.classList.remove('is-visible');
  };

  const show = target => {
    if (!target?.dataset?.passiveTooltip) return;
    activeTarget = target;
    title.textContent = String(target.dataset.passiveTooltipName || 'Passive');
    status.textContent = String(target.dataset.passiveTooltipStatus || 'Active');
    description.textContent = String(target.dataset.passiveTooltipDescription || '');
    tooltip.hidden = false;

    requestAnimationFrame(() => {
      if (!activeTarget) return;
      const rect = activeTarget.getBoundingClientRect();
      const width = tooltip.offsetWidth;
      const left = Math.min(
        Math.max(8, rect.left),
        Math.max(8, window.innerWidth - width - 8)
      );
      const top = Math.max(8, rect.top - tooltip.offsetHeight - 10);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.classList.add('is-visible');
    });
  };

  document.addEventListener('pointerover', event => {
    const target = event.target?.closest?.('[data-passive-tooltip]');
    if (target) show(target);
  });

  document.addEventListener('pointerout', event => {
    const target = event.target?.closest?.('[data-passive-tooltip]');
    if (!target || target.contains(event.relatedTarget)) return;
    if (target === activeTarget) hide();
  });

  document.addEventListener('focusin', event => {
    const target = event.target?.closest?.('[data-passive-tooltip]');
    if (target) show(target);
  });

  document.addEventListener('focusout', event => {
    const target = event.target?.closest?.('[data-passive-tooltip]');
    if (target && target === activeTarget) hide();
  });

  window.addEventListener('resize', hide, { passive: true });
  window.addEventListener('scroll', hide, { passive: true, capture: true });
}

setupBattlePassiveTooltipDelegation();
window.upgrade = upgrade;

els.buySpeedButton?.addEventListener("click", () => purchaseUpgrade("rollSpeed"));
els.buyLuckButton?.addEventListener("click", () => purchaseUpgrade("luck"));
els.buyExpMultiButton?.addEventListener("click", () => purchaseUpgrade("expMulti"));
els.buyCoinMultiButton?.addEventListener("click", () => purchaseUpgrade("coinMulti"));
els.collectionButton?.addEventListener("click", () => openModal("collectionModal"));
els.upgradesButton?.addEventListener("click", () => openModal("upgradesModal"));
els.battleButton?.addEventListener("click", openBattleModal);
els.battleCloseButton?.addEventListener("click", event => { event.preventDefault(); surrenderBattle(); });
els.resetButton?.addEventListener("click", resetGame);
els.autoContinueBattleToggle?.addEventListener('change', () => {
  autoContinueBattleEnabled = els.autoContinueBattleToggle.checked;
  try { localStorage.setItem(AUTO_CONTINUE_STORAGE_KEY, JSON.stringify(autoContinueBattleEnabled)); }
  catch (error) { console.warn('Auto Continue preference could not be persisted:', error); }
  renderAutoContinueBattleToggle();
  if (autoContinueBattleEnabled) scheduleAutoContinueBattle();
  else clearAutoContinueBattleTimer();
});
window.addEventListener('storage', event => {
  if (event.key !== AUTO_CONTINUE_STORAGE_KEY && event.key !== null) return;
  autoContinueBattleEnabled = event.key === null ? false : event.newValue === 'true';
  renderAutoContinueBattleToggle();
  if (!autoContinueBattleEnabled) clearAutoContinueBattleTimer();
});
const utilityMenu = document.getElementById('utilityMenu');
document.addEventListener('click', event => {
  if (utilityMenu?.open && (!utilityMenu.contains(event.target) || event.target.closest('button'))) utilityMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && utilityMenu?.open) { utilityMenu.open = false; utilityMenu.querySelector('summary')?.focus(); }
});

els.battleStartButton?.addEventListener("click", () => startBattle(true));
els.battleModePicker?.querySelectorAll("[data-battle-mode]").forEach(button => {
  button.addEventListener("click", () => setBattleMode(button.dataset.battleMode));
});
document.getElementById('timeTrialOpenButton')?.addEventListener('click', () => {
  if (!isBattleMatchActive()) openModal('timeTrialModeModal');
});
document.querySelectorAll('[data-time-trial-type]').forEach(button => {
  button.addEventListener('click', () => {
    if (isBattleMatchActive()) return;
    if (getBattleMode() !== button.dataset.timeTrialType) setBattleMode(button.dataset.timeTrialType);
    closeModal('timeTrialModeModal');
    document.getElementById('timeTrialOpenButton')?.focus();
  });
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || (document.getElementById('timeTrialModeModal')?.classList.contains('hidden') ?? true)) return;
  event.preventDefault(); event.stopImmediatePropagation();
  closeModal('timeTrialModeModal');
  document.getElementById('timeTrialOpenButton')?.focus();
}, true);
document.getElementById("elementChartOpenButton")?.addEventListener("click", () => {
  openModal("elementChartModal");
  document.querySelector('#elementChartModal .modal-close')?.focus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !document.getElementById('elementChartModal')?.classList.contains('hidden')) {
    event.preventDefault(); event.stopImmediatePropagation(); closeModal('elementChartModal');
    document.getElementById('elementChartOpenButton')?.focus();
  }
}, true);
els.collectionElementFilter?.addEventListener("change", () => renderCollection());
els.battleElementFilter?.addEventListener("change", () => populateBattleFighterSelect());
els.cardSearchInput?.addEventListener("input", () => populateBattleFighterSelect());
els.cardSortSelect?.addEventListener("change", () => populateBattleFighterSelect());
els.battleAutoAgainButton?.addEventListener("click", () => {
  if (!canReplayBattleTeam()) return;
  startBattle(true);
});
els.battleChangeFighterButton?.addEventListener("click", () => {
  clearBattleTurnTimer();
  clearBattleAnimationTimers();
  battleState = { mode: getBattleMode(), setup: { team: [], activeIndex: 0 }, isBattling: false, turn: null };
  resetBattleView(getBattleMode());
});
els.battleCloseResultButton?.addEventListener("click", event => {
  event.preventDefault();
  returnToLobby();
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
  else { flushRollUi(true); renderCooldownUI(Date.now()); }
});

els.previewSalvageButton?.addEventListener("click", handlePreviewSalvage);
els.previewSalvageExtrasButton?.addEventListener("click", handlePreviewSalvageExtras);
els.salvageAllExtraDuplicatesButton?.addEventListener("click", () => {
  const result = salvageAllExtraDuplicates();
  if (result.removed <= 0) {
    showCurrencyToast(0, "No extra duplicates to salvage");
    return;
  }
  saveState();
  updateStats();
  collectionNeedsRefresh = false;
  renderCollection();
  showCurrencyToast(result.cash, `Salvaged ${result.removed.toLocaleString("en-US")} extra duplicate cards`);
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
    if (event.target !== backdrop) return;
    if (backdrop.id === 'battleModal' && isBattleMatchActive()) return;
    closeModal(backdrop.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  closeVariantMenu();
  if (isBattleMatchActive()) {
    event.preventDefault();
    return;
  }
  document.querySelectorAll(".modal-backdrop").forEach(modal => {
    if (!modal.classList.contains("hidden")) closeModal(modal.id);
  });
});

function resumeGameRuntime() {
  if (isImportingSave || window.SandboxSystem?.active) return;
  recoverElapsedRealTime();
  window.InventorySystem.tick(Date.now());
  window.TimeTrialSystem.checkDeadline();
  completeCooldown(false);
  renderClockAndWeather(true); renderCooldownUI(Date.now()); renderPotionInventory();
  if (isBossEventBattle()) renderBossEventControls();
  startGlobalLoop(); // Clears the old interval before replacing it.
  if (isBattleMatchActive()) {
    const dueAt = Number(battleState.nextTurnAt);
    scheduleNextBattleTurn(Number.isFinite(dueAt) ? Math.max(0, dueAt - Date.now()) : undefined);
  }
}

// Recover real time on background/foreground and before the page unloads.
document.addEventListener("visibilitychange", () => {
  if (isImportingSave || window.SandboxSystem?.active) return;
  if (document.visibilityState === "visible") {
    resumeGameRuntime();
  } else {
    syncGameClockToNow();
    saveState();
  }
});

window.addEventListener("pagehide", () => {
  if (isImportingSave || window.SandboxSystem?.active) return;
  syncGameClockToNow();
  saveState();
});

// Modular feature entry points. These do not attach extra global/battle timers.
els.inventoryOpenButton?.addEventListener('click', () => openModal('inventoryModal'));
document.getElementById('inventorySearch')?.addEventListener('input', renderPotionInventory);
document.getElementById('inventoryCategory')?.addEventListener('change', renderPotionInventory);
els.towerShopOpenButton?.addEventListener('click', () => openModal('towerShopModal'));
els.towerWeatherSelect?.addEventListener('change', () => {
  if (!isTowerBattle() || battleState?.isBattling) return;
  clearAutoContinueBattleTimer();
  battleState.setup = { team: [], activeIndex: 0 };
  renderBattleModePicker(); populateBattleFighterSelect();
});

document.getElementById('timeTrialShopOpenButton')?.addEventListener('click', () => openModal('timeTrialShopModal'));
document.getElementById('timeTrialResultShopButton')?.addEventListener('click', () => openModal('timeTrialShopModal'));
document.getElementById('raidShopOpenButton')?.addEventListener('click', () => openModal('raidShopModal'));
document.getElementById('raidResultShopButton')?.addEventListener('click', () => openModal('raidShopModal'));
document.getElementById('raidTypeSelect')?.addEventListener('change', event => { if(isBattleMatchActive()){event.target.value=battleState.raid.type;return;} clearAutoContinueBattleTimer();if(battleState)delete battleState.raid;renderBattleModePicker();renderBattleSelection(); });
document.getElementById('raidDifficulty')?.addEventListener('input', event => {
  window.RaidSystem.setDifficulty(getRaidType(), event.target.value); renderRaidControls();
});

document.getElementById('achievementOpenButton')?.addEventListener('click', () => openModal('achievementModal'));
document.getElementById('achievementCategory')?.addEventListener('change', renderAchievements);
document.getElementById('saveManagerOpenButton')?.addEventListener('click', () => openModal('saveManagerModal'));
document.getElementById('exportSaveButton')?.addEventListener('click', exportGameSave);
document.getElementById('importSaveButton')?.addEventListener('click', () => {
  if (saveTransferBusy) return;
  try { document.getElementById('importSaveInput')?.click(); }
  catch (error) { showSaveTransferError(error); }
});
document.getElementById('importSaveInput')?.addEventListener('change', async event => {
  const file = event.target.files?.[0]; if (!file) return;
  try { await importGameSave(file); }
  finally { event.target.value = ''; }
});

// ============================================================
// INITIALIZE
// ============================================================

renderAutoContinueBattleToggle();
clearAutoContinueBattleTimer();

// Battle must always start dormant. This also neutralizes any stale modal
// classes/timers left by a previous hot-reload or browser restore.
clearBattleTurnTimer();
clearBattleAnimationTimers();
battleState = null;
setBattleModalLock(false);
els.battleModal?.classList.add('hidden');
els.battleModal?.classList.remove('battle-modal--active');
els.battleArena?.classList.add('hidden');
els.battleVictory?.classList.add('hidden');
els.battleVictory?.setAttribute('aria-hidden', 'true');
els.battleSetup?.classList.remove('hidden');

function initializeGameViews() {
  try {
    window.RollViewSystem?.configure?.({showResult,showMiss,onModeChange:onRollViewModeChange});
  } catch (error) { window.GameStartup?.report('roll-ui', 'Roll display initialization failed.', error); }
  try {
    window.SandboxSystem?.configure?.({
  canEnter: () => Boolean(els.battleModal) && !isBattleMatchActive() && !isImportingSave && !saveTransferBusy,
  onEnter: () => {
    clearAutoContinueBattleTimer();
    els.battleModal?.classList.add('hidden');
    document.body?.classList.add('modal-open');
  },
  onExit: () => {
    els.battleModal?.classList.remove('hidden');
    document.body?.classList.add('modal-open');
    resumeGameRuntime(); flushRollUi(true);
    if (battleState?.finished) scheduleAutoContinueBattle();
    if (isAutoRolling && !isCooldownActive) attemptAutoRoll();
  }
});
  } catch (error) { window.GameStartup?.report('sandbox-ui', 'Sandbox initialization failed.', error); }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeGameViews, {once:true});
else initializeGameViews();
if(window.EquipmentSystem?.blocked)window.GameStartup?.report('equipment-save','Storage unavailable. Reload to recover the pending equipment craft before playing.');
window.EvolutionSystem.configure({ canAct: canEvolveNow, prepare: prepareEvolution, onCommit: onEvolutionCommitted, describe: recipe => ({baseName:getCardById(recipe.baseId)?.name,level:getCardLevelInfo(recipe.baseId).level,completed:evolutionComplete(recipe),variants:getVariantEntries(recipe.baseId).map(v=>({...v,label:v.mutations.map(m=>m.name).join(" + ") || "Normal"}))}) });
window.InventorySystem.configure({ getDropMultiplier: () => (window.AchievementSystem?.getDropMultiplier(state.achievementRewardReceipts) || 1) + (window.QuestsSystem?.bonus('drop') || 0) + (window.EquipmentSystem?.bonuses().drop || 0) });
window.EquipmentSystem.configure({canAct:canEvolveNow,money:()=>state.currency,variants:getVariantEntries,prepare:prepareEquipmentCraft,onCommit:onEvolutionCommitted,onChange:()=>{updateStats();renderUpgradeShop();renderClockAndWeather(true);renderPotionInventory();},onBlocked:()=>{isAutoRolling=false;clearCooldownExpiryTimer();window.GameStartup?.report('equipment-save','Storage unavailable. Reload to recover your pending equipment craft.');}});
window.StorageSystem.configure({canAct:canEvolveNow,canUse:()=>!window.SandboxSystem?.active&&!isImportingSave&&!saveTransferBusy,openSource:()=>openModal('itemSourceModal'),onUse:id=>{updateStats();renderUpgradeShop();window.PotionHudSystem?.render();if(id==='speed_battle_potion'&&battleState?.isBattling&&!battleState.finished&&!isTimeTrialBattle())scheduleNextBattleTurn();}});
window.CraftingSystem.configure({canAct:canEvolveNow,onChange:()=>{renderPotionInventory();updateStats();}});
window.QuestsSystem.mount(document.getElementById('questModal'));
window.QuestsSystem.configure({clock:()=>state.weather.gameSeconds,snapshot:()=>({rolls:state.totalRolls,bestRoom:window.TimeTrialSystem.bestRoom}),canAct:canEvolveNow,isImporting:()=>isImportingSave,reward:applyQuestBoardReward,onChange:()=>{updateStats();renderClockAndWeather(true);refreshAchievements();}});
window.BackgroundActivitySystem.configure({ onResume: resumeGameRuntime, onFreeze: () => { if (!isImportingSave && !window.SandboxSystem?.active) { syncGameClockToNow(); saveState(); } } });
window.RaidSystem?.configure({ grantSecret: grantRaidSecret, hasSecret: hasRaidSecret, rollMutations });
window.BossEventSystem.configure({ weatherActive:isBossEventWeatherActive, rollMutations, grantCard:grantBossEventCard });
window.TimeTrialSystem?.configure({ resolveCompanions: (battle,advanceEnemy) => window.PassiveSystem.resolveTrialCompanions(battle,advanceEnemy), getLevelInfo: getCardLevelInfo, getExperienceMultiplier: () => (window.InventorySystem?.multiplier("exp") || 1) * (1 + (window.AchievementSystem?.getExpBonus(state.achievementRewardReceipts) || 0)) * (1 + getWeatherBonus("exp")) * (window.EquipmentSystem?.expMultiplier("arena") || 1), grantExperience: grantTimeTrialExperience, onTimeout: (battle, won) => { if (!isImportingSave && battleState === battle && !battle.finished) finishTimeTrialBattle(won, 'time-limit'); } });
window.QuestSystem.configure({ canAccept: canEvolveNow, grantCard: id => { const card = getCardById(id); return Boolean(card?.questOnly && applyAchievementReward({ id: card.unlockRequirement, reward: {cardId: id} })); } });
window.AchievementSystem?.configure({ cards: ALL_CARDS, towerTypes: window.TowerSystem?.weatherList(WEATHERS) || [], getSnapshot: getAchievementSnapshot, applyReward: applyAchievementReward });
refreshAchievements();
recoverElapsedRealTime();
pruneExpiredWeathers();
renderClockAndWeather(true);
window.PotionHudSystem?.render();
updateStats();
renderAvailableCards();
renderCollection();
renderUpgradeShop();
renderCooldownUI(Date.now());
startGlobalLoop();

// Registry-driven filters include future categories without duplicated HTML options.
window.CategorySystem.mount(els.collectionCategoryFilter);
window.CategorySystem.mount(els.battleCategoryFilter);
els.collectionCategoryFilter?.addEventListener("change",renderCollection);
els.battleCategoryFilter?.addEventListener("change",populateBattleFighterSelect);
