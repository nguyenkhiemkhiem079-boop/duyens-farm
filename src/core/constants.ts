import { CropType } from './types';

export const GRID_SIZE = 12; // 12x12 farm island
export const CELL_SIZE = 1.6; // World units per grid tile
export const FARM_ORIGIN_OFFSET = (GRID_SIZE * CELL_SIZE) / 2;

// Day & Time
export const DAY_DURATION_SECONDS = 360; // 6 minutes per full day
export const MAX_ENERGY = 100;
export const ENERGY_COST_PLANT = 3;
export const ENERGY_COST_WATER = 4;
export const ENERGY_COST_HARVEST = 2;

// Crop configurations
export interface CropConfig {
  id: CropType;
  nameVi: string;
  seedNameVi: string;
  growDurationSeconds: number; // total active time watered to reach maturity (~30 - 45s for easy Phase 1 testing)
  sellPrice: number;
  seedPrice: number; // Seeds are free as requested
  iconEmoji: string;
  description: string;
  stagesCount: number;
}

export const CROP_CONFIGS: Record<CropType, CropConfig> = {
  carrot: {
    id: 'carrot',
    nameVi: 'Cà rốt giòn ngọt',
    seedNameVi: 'Hạt giống cà rốt',
    growDurationSeconds: 30, // 30s for smooth verification
    sellPrice: 15,
    seedPrice: 0,
    iconEmoji: '🥕',
    description: 'Cà rốt cam mọng nước được Duyên chăm chút tỉ mẩn.',
    stagesCount: 4,
  },
  wheat: {
    id: 'wheat',
    nameVi: 'Lúa mì vàng ươm',
    seedNameVi: 'Hạt giống lúa mì',
    growDurationSeconds: 38,
    sellPrice: 20,
    seedPrice: 0,
    iconEmoji: '🌾',
    description: 'Bông lúa mì rực nắng, ngát hương đồng cỏ mùa thu.',
    stagesCount: 4,
  },
  tomato: {
    id: 'tomato',
    nameVi: 'Cà chua chín mọng',
    seedNameVi: 'Hạt giống cà chua',
    growDurationSeconds: 45,
    sellPrice: 28,
    seedPrice: 0,
    iconEmoji: '🍅',
    description: 'Những quả cà chua đỏ au, vị chua ngọt thanh mát.',
    stagesCount: 4,
  },
};

// [TODO: xác nhận màu lông thật của Mon]
export const MON_FUR_COLOR = 0xb8bcc4; // Soft-gray placeholder, not a confirmed appearance.

// Pastel Diorama Palette
export const PALETTE = {
  // Ground & Nature
  grassLight: 0xa8d5ba, // Sage green
  grassDark: 0x93c59a,
  soilDry: 0xc89f78, // Warm earthy peach-brown
  soilWet: 0x8a5b3a, // Rich watered soil
  sandEdge: 0xf5e6c8, // Cream sand island edge
  waterBlue: 0xa0d8ef, // Sky-blue soft water

  // Buildings & Decor
  woodLight: 0xf6d7b0, // Butter-yellow cream wood
  woodDark: 0xc69c6d,
  roofPeach: 0xfca082, // Peach roof
  roofButter: 0xffe29a, // Butter-yellow roof
  roofBarn: 0xf08080, // Soft coral red barn roof
  stoneWhite: 0xf7f5f0, // Cream white masonry
  stoneGray: 0xd3d7d8,

  // Characters
  duyenDress: 0xffb7b2, // Soft pastel coral pink
  duyenHair: 0x3d271d, // Soft deep brown
  duyenSkin: 0xffe3d3,
  duyenHat: 0xfff0b5, // Straw hat

  khimShirt: 0x8ecae6, // Sky blue shirt
  khimVest: 0x219ebc, // Teal vest/engineer vibe
  khimHair: 0x2b2d42,
  khimGlasses: 0x111827,

  // Cats
  catWhite: 0xffffff,
  catBrownSpot: 0x8b5a2b, // Cow-like brown patches for Mochi
  catSoftCream: 0xfdf6e2, // May pure soft cream/white

  // Lighting
  sunColor: 0xfffaed,
  ambientSky: 0xcfe2f3,
  ambientGround: 0xb4d3b2,
  nightAmbient: 0x33415c,
};

// Buildings positions on 12x12 grid (origin 0,0 at bottom-left, coords 0 to 11)
export const BUILDING_FOOTPRINTS = {
  house: { minX: 1, maxX: 3, minZ: 8, maxZ: 10, doorX: 2, doorZ: 7, nameVi: 'Ngôi nhà ấm cúng' },
  barn: { minX: 8, maxX: 10, minZ: 8, maxZ: 10, doorX: 9, doorZ: 7, nameVi: 'Kho thóc nhỏ' },
  market: { minX: 8, maxX: 10, minZ: 1, maxZ: 3, doorX: 8, doorZ: 4, nameVi: 'Quầy nông sản' },
};

// Plots defined in a dedicated 4x3 garden area (e.g. X: 2..5, Z: 2..4) + another 4x3 area (X: 2..5, Z: 5..6)
export const DEFAULT_FARM_PLOTS: Array<{ x: number; z: number }> = [
  { x: 2, z: 2 }, { x: 3, z: 2 }, { x: 4, z: 2 }, { x: 5, z: 2 },
  { x: 2, z: 3 }, { x: 3, z: 3 }, { x: 4, z: 3 }, { x: 5, z: 3 },
  { x: 2, z: 4 }, { x: 3, z: 4 }, { x: 4, z: 4 }, { x: 5, z: 4 },
  { x: 2, z: 5 }, { x: 3, z: 5 }, { x: 4, z: 5 }, { x: 5, z: 5 },
];
