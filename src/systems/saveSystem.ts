import { GameState, InventoryItem } from '../core/types';
import { MAX_ENERGY } from '../core/constants';
import { generateDeliveryOrder } from '../core/orders';
import { rollDailyWeather } from '../content/seasons';

const SAVE_KEY = 'duyens_farm_save_v4';
const LEGACY_KEYS = ['duyens_farm_save_v3', 'duyens_farm_save_v2', 'duyens_farm_save_v1'];
const CURRENT_VERSION = 4;

export function createInitialGameState(): GameState {
  const initialInventory: Record<string, InventoryItem> = {
    seed_carrot: {
      id: 'seed_carrot',
      type: 'seed',
      name: 'Hạt giống Cà rốt',
      cropType: 'carrot',
      count: 99,
      value: 0,
      description: 'Hạt giống cà rốt ngon ngọt (Miễn phí gieo trồng)',
    },
    seed_wheat: {
      id: 'seed_wheat',
      type: 'seed',
      name: 'Hạt giống Lúa mì',
      cropType: 'wheat',
      count: 99,
      value: 0,
      description: 'Hạt giống lúa mì vàng ươm (Miễn phí gieo trồng)',
    },
    seed_tomato: {
      id: 'seed_tomato',
      type: 'seed',
      name: 'Hạt giống Cà chua',
      cropType: 'tomato',
      count: 99,
      value: 0,
      description: 'Hạt giống cà chua đỏ mọng (Miễn phí gieo trồng)',
    },
  };

  return {
    version: CURRENT_VERSION,
    playerName: 'Duyên',
    coins: 100,
    energy: MAX_ENERGY,
    maxEnergy: MAX_ENERGY,
    time: {
      day: 1,
      timeOfDay: 0, // 6:00 AM
      isPaused: false,
      speed: 1,
    },
    calendar: {
      year: 1,
      season: 'spring',
      dayOfSeason: 1,
      totalDays: 1,
    },
    weather: {
      current: 'sunny',
      isRaining: false,
    },
    inventory: initialInventory,
    plots: {},
    khim: {
      x: 3.2,
      z: 7.5,
      targetX: 3.2,
      targetZ: 7.5,
      relationshipMeter: 20,
      chattedToday: false,
      giftedToday: false,
      currentSchedule: 'home_morning',
    },
    cats: {
      mochi: {
        id: 'mochi',
        name: 'Mochi',
        x: -0.5,
        z: 0.5,
        targetX: -0.5,
        targetZ: 0.5,
        loveMeter: 30,
        pettedToday: false,
        state: 'idle',
      },
      mon: {
        id: 'mon',
        name: 'Mon',
        x: 4.5,
        z: -3.5,
        targetX: 4.5,
        targetZ: -3.5,
        loveMeter: 15,
        pettedToday: false,
        state: 'idle',
      },
      may: {
        id: 'may',
        name: 'Mây',
        x: -4.5,
        z: 4.5,
        targetX: -4.5,
        targetZ: 4.5,
        loveMeter: 25,
        pettedToday: false,
        state: 'idle',
      },
    },
    monTheft: {
      hasStolen: false,
      item: null,
      stolenAtTime: 0,
      stolenDay: 0,
    },
    mayGift: {
      hasGiftOnGround: false,
      gridX: 1,
      gridZ: 1,
      collectedToday: false,
    },
    playerPos: {
      x: 0,
      z: 0,
    },
    firstVisitDone: false,
    placedBuildings: {},
    deliveryOrders: [
      generateDeliveryOrder(1, 1),
      generateDeliveryOrder(1, 2),
      generateDeliveryOrder(1, 3),
    ],
    villagers: {
      ong_bay: { id: 'ong_bay', relationship: 10, talkedToday: false, giftedToday: false },
      co_hoa: { id: 'co_hoa', relationship: 15, talkedToday: false, giftedToday: false },
      ban_lan: { id: 'ban_lan', relationship: 20, talkedToday: false, giftedToday: false },
      minh_sach: { id: 'minh_sach', relationship: 10, talkedToday: false, giftedToday: false },
    },
    dreamHome: {
      stage: 0,
      contributions: {},
      completed: false,
    },
    salon: {
      unlocked: true, // starts with outdoor chair
      currentCustomerIdx: 0,
      hairSkillExp: 0,
      customersServed: 0,
    },
    monMystery: {
      clueCrumbsFound: false,
      cluePawprintsFound: false,
      mochiQuestioned: false,
      monCaught: false,
      completed: false,
    },
    journal: {
      page_farm_begin: true,
      page_chapter_1: false,
      page_chapter_2: false,
      page_mon_mystery: false,
      page_salon_open: false,
      page_chapter_3: false,
      page_chapter_4: false,
      page_final_letter_locked: false,
    },
    mail: {
      letter_welcome: { isRead: false, isClaimed: false },
      letter_khim_note: { isRead: false, isClaimed: false },
      letter_lan_hair: { isRead: false, isClaimed: false },
      letter_family_placeholder: { isRead: false, isClaimed: false },
    },
    completedQuests: {},
    stormDamage: {
      damagedFence: false,
      debrisCleared: true,
    },
    currentZone: 'farm',
    settings: {
      soundEnabled: true,
      sfxVolume: 0.8,
      musicVolume: 0.7,
      reducedMotion: false,
    },
  };
}

export function validateSaveData(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;
  const d = data as Partial<GameState>;

  if (typeof d.coins !== 'number' || isNaN(d.coins)) return false;
  if (typeof d.energy !== 'number' || isNaN(d.energy)) return false;
  if (!d.inventory || typeof d.inventory !== 'object') return false;
  if (!d.plots || typeof d.plots !== 'object') return false;
  if (!d.khim || typeof d.khim.relationshipMeter !== 'number') return false;
  if (!d.cats || !d.cats.mochi || !d.cats.mon || !d.cats.may) return false;

  return true;
}

export function migrateSaveData(data: GameState): GameState {
  const initial = createInitialGameState();

  // Ensure calendar
  if (!data.calendar) {
    const totalDays = data.time?.day || 1;
    const seasonIdx = Math.floor((totalDays - 1) / 28) % 4;
    const seasons: Array<'spring' | 'summer' | 'autumn' | 'winter'> = ['spring', 'summer', 'autumn', 'winter'];
    data.calendar = {
      year: Math.floor((totalDays - 1) / 112) + 1,
      season: seasons[seasonIdx],
      dayOfSeason: ((totalDays - 1) % 28) + 1,
      totalDays,
    };
  }

  // Ensure weather
  if (!data.weather) {
    const rolled = rollDailyWeather(data.calendar.season, data.calendar.totalDays);
    data.weather = {
      current: rolled,
      isRaining: rolled === 'rainy' || rolled === 'stormy',
    };
  }

  // Ensure buildings & orders
  if (!data.placedBuildings) data.placedBuildings = {};
  if (!data.deliveryOrders || data.deliveryOrders.length === 0) {
    data.deliveryOrders = initial.deliveryOrders;
  }

  // Ensure villagers
  if (!data.villagers) data.villagers = initial.villagers;

  // Ensure Dream Home
  if (!data.dreamHome) data.dreamHome = initial.dreamHome;

  // Ensure Salon
  if (!data.salon) data.salon = initial.salon;

  // Ensure Mon mystery
  if (!data.monMystery) data.monMystery = initial.monMystery;

  // Ensure Journal & Mail
  if (!data.journal) data.journal = initial.journal;
  if (!data.mail) data.mail = initial.mail;
  if (!data.completedQuests) data.completedQuests = {};
  if (!data.stormDamage) data.stormDamage = initial.stormDamage;
  if (!data.currentZone) data.currentZone = 'farm';
  if (!data.settings) data.settings = initial.settings;

  data.version = CURRENT_VERSION;
  return data;
}

export class SaveSystem {
  public static loadGame(): GameState {
    try {
      if (typeof localStorage === 'undefined') {
        return createInitialGameState();
      }
      let raw = localStorage.getItem(SAVE_KEY);
      if (!raw) {
        for (const k of LEGACY_KEYS) {
          raw = localStorage.getItem(k);
          if (raw) break;
        }
      }
      if (!raw) {
        return createInitialGameState();
      }
      const parsed = JSON.parse(raw);
      if (validateSaveData(parsed)) {
        return migrateSaveData(parsed);
      } else {
        console.warn('Save data validation failed. Reverting to initial game state.');
        return createInitialGameState();
      }
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return createInitialGameState();
    }
  }

  public static saveGame(state: GameState): boolean {
    try {
      if (typeof localStorage === 'undefined') return false;
      const serialized = JSON.stringify(state);
      localStorage.setItem(SAVE_KEY, serialized);
      return true;
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
      return false;
    }
  }

  public static exportSaveJson(state: GameState): string {
    return JSON.stringify(state, null, 2);
  }

  public static importSaveJson(jsonStr: string): { success: boolean; state?: GameState; error?: string } {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!validateSaveData(parsed)) {
        return {
          success: false,
          error: 'Dữ liệu sao lưu không hợp lệ hoặc bị lỗi cấu trúc. Khu vườn cũ vẫn được giữ nguyên vẹn an toàn!',
        };
      }
      const migrated = migrateSaveData(parsed);
      return { success: true, state: migrated };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        error: `Lỗi đọc file JSON: ${msg}`,
      };
    }
  }

  public static clearSave(): void {
    try {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(SAVE_KEY);
      for (const k of LEGACY_KEYS) {
        localStorage.removeItem(k);
      }
    } catch (e) {
      console.warn(e);
    }
  }
}
