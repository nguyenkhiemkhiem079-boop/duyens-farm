import { PlacedBuildingInstance } from './buildings';
import { DeliveryOrder } from './orders';

export type CropType = 'carrot' | 'wheat' | 'tomato';
export type GrowthStage = 0 | 1 | 2 | 3; // 0: Seedling, 1: Sprout, 2: Growing, 3: Mature (Ready to harvest)

export interface CropData {
  id: string;
  type: CropType;
  gridX: number;
  gridZ: number;
  stage: GrowthStage;
  progress: number; // 0 to 1 for current stage
  watered: boolean; // watered today
  plantedDay: number;
  plantedTime: number;
}

export type ToolType = 'hand' | 'water_can' | 'seed_carrot' | 'seed_wheat' | 'seed_tomato';

export interface InventoryItem {
  id: string;
  type: 'crop' | 'seed' | 'collectible' | 'gift' | 'product' | 'material';
  name: string;
  cropType?: CropType;
  count: number;
  value: number; // sell value in coins
  description: string;
}

export interface StolenItemState {
  hasStolen: boolean;
  item: InventoryItem | null;
  stolenAtTime: number;
  stolenDay: number;
}

export interface MayGiftState {
  hasGiftOnGround: boolean;
  gridX: number;
  gridZ: number;
  collectedToday: boolean;
}

export interface CatState {
  id: 'mochi' | 'mon' | 'may';
  name: string;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  loveMeter: number; // 0 - 100
  pettedToday: boolean;
  state: 'idle' | 'walking' | 'sleeping' | 'playing' | 'fleeing';
}

export interface KhimState {
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  relationshipMeter: number; // 0 - 100
  chattedToday: boolean;
  giftedToday: boolean;
  currentSchedule: 'home_morning' | 'garden_work' | 'home_evening';
}

export interface TimeState {
  day: number;
  timeOfDay: number; // 0 to 360 (representing 6:00 to 24:00, 360 seconds = 6 minutes real time)
  isPaused: boolean;
  speed: number;
}

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type WeatherType = 'sunny' | 'rainy' | 'foggy' | 'stormy' | 'snowy';

export interface CalendarState {
  year: number;
  season: SeasonType;
  dayOfSeason: number; // 1 to 28
  totalDays: number;
}

export interface WeatherState {
  current: WeatherType;
  isRaining: boolean;
}

export interface VillagerState {
  id: string;
  relationship: number; // 0 to 100
  talkedToday: boolean;
  giftedToday: boolean;
}

export interface DreamHomeState {
  stage: number; // 0: baseline, 1: foundation, 2: walls, 3: roof, 4: kitchen, 5: parents room (complete)
  contributions: Record<string, number>; // bundleId -> contributed count
  completed: boolean;
}

export interface SalonState {
  unlocked: boolean;
  currentCustomerIdx: number;
  hairSkillExp: number;
  customersServed: number;
}

export interface MonMysteryState {
  clueCrumbsFound: boolean;
  cluePawprintsFound: boolean;
  mochiQuestioned: boolean;
  monCaught: boolean;
  completed: boolean;
}

export interface AccessibilitySettings {
  soundEnabled: boolean;
  sfxVolume: number; // 0 to 1
  musicVolume: number; // 0 to 1
  reducedMotion: boolean;
}

export interface GameState {
  version: number;
  playerName: string;
  coins: number;
  energy: number;
  maxEnergy: number;
  time: TimeState;
  calendar: CalendarState;
  weather: WeatherState;
  inventory: Record<string, InventoryItem>;
  plots: Record<string, CropData>; // key: `${x},${z}`
  khim: KhimState;
  cats: {
    mochi: CatState;
    mon: CatState;
    may: CatState;
  };
  monTheft: StolenItemState;
  mayGift: MayGiftState;
  playerPos: { x: number; z: number };
  firstVisitDone: boolean;
  placedBuildings: Record<string, PlacedBuildingInstance>;
  deliveryOrders: DeliveryOrder[];
  villagers: Record<string, VillagerState>;
  dreamHome: DreamHomeState;
  salon: SalonState;
  monMystery: MonMysteryState;
  journal: Record<string, boolean>; // pageId -> unlocked
  mail: Record<string, { isRead: boolean; isClaimed: boolean }>;
  completedQuests: Record<string, boolean>;
  stormDamage: { damagedFence: boolean; debrisCleared: boolean };
  currentZone: 'farm' | 'forest' | 'lake' | 'flower_hill' | 'cave';
  settings: AccessibilitySettings;
}

export interface InteractionTarget {
  type:
    | 'plot'
    | 'khim'
    | 'mochi'
    | 'mon'
    | 'may'
    | 'house'
    | 'market'
    | 'barn'
    | 'may_gift'
    | 'ground'
    | 'mailbox'
    | 'villager'
    | 'salon_chair'
    | 'custom_building'
    | 'clue_crumbs'
    | 'clue_pawprints'
    | 'exploration_sign';
  x: number;
  z: number;
  gridX?: number;
  gridZ?: number;
  distanceThreshold: number;
  action: () => void;
  description: string;
  extraId?: string;
}

export interface GameNotification {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'love';
  durationMs?: number;
}
