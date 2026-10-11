import {
  GameState,
  CropType,
  CropData,
  InventoryItem,
  GrowthStage,
  GameNotification,
} from '../core/types';
import {
  CROP_CONFIGS,
  DAY_DURATION_SECONDS,
  MAX_ENERGY,
  ENERGY_COST_PLANT,
  ENERGY_COST_WATER,
  ENERGY_COST_HARVEST,
  GRID_SIZE,
} from '../core/constants';
import { soundManager } from '../core/audio';
import { FarmGrid } from '../world/grid';
import { SaveSystem } from './saveSystem';
import { CAT_DIALOGUES, KHIM_DIALOGUES, KHIM_GIFT_REACTIONS } from '../content/gameContent';
import { BUILDING_DEFINITIONS, PlacedBuildingType, PlacedBuildingInstance } from '../core/buildings';
import { generateDeliveryOrder } from '../core/orders';
import { rollDailyWeather, SEASONS_DATA } from '../content/seasons';
import { DREAM_HOME_BUNDLES } from '../content/dreamHome';
import { VILLAGERS } from '../content/villagers';
import { SALON_CUSTOMERS } from '../content/salonContent';
import { STORY_CHAPTERS } from '../content/chapters';
import { INITIAL_LETTERS } from '../content/letters';
import { EXPLORATION_ZONES } from '../content/exploration';

export class GameSimulation {
  public state: GameState;
  public grid: FarmGrid;
  public notifications: GameNotification[] = [];
  private onStateChangeCallback?: (state: GameState) => void;
  private onNotificationCallback?: (notif: GameNotification) => void;
  private lastAutoSaveTime: number = 0;
  private monTheftTimer: number = 0;

  constructor(initialState?: GameState) {
    this.grid = new FarmGrid();
    this.state = initialState || SaveSystem.loadGame();
    if (!this.state.placedBuildings) {
      this.state.placedBuildings = {};
    }
    if (!this.state.deliveryOrders) {
      this.state.deliveryOrders = [
        generateDeliveryOrder(1, 1),
        generateDeliveryOrder(1, 2),
        generateDeliveryOrder(1, 3),
      ];
    }
    this.grid.recomputeOccupancy(this.state.placedBuildings);
  }

  public setCallbacks(
    onStateChange: (state: GameState) => void,
    onNotification: (notif: GameNotification) => void
  ) {
    this.onStateChangeCallback = onStateChange;
    this.onNotificationCallback = onNotification;
  }

  private notify(text: string, type: GameNotification['type'] = 'info') {
    const notif: GameNotification = {
      id: Math.random().toString(36).slice(2, 9),
      text,
      type,
    };
    this.notifications.push(notif);
    this.onNotificationCallback?.(notif);
  }

  private emitState() {
    this.onStateChangeCallback?.(this.state);
  }

  /**
   * Main simulation tick.
   * Delta time in seconds, clamped for smooth tab switching.
   */
  public update(dt: number) {
    if (this.state.time.isPaused) return;

    // Safety clamp dt to avoid large delta jumps
    const clampedDt = Math.min(dt, 0.1) * this.state.time.speed;

    // 1. Advance Day Time
    this.state.time.timeOfDay += clampedDt;

    // Check Midnight gentle sleep
    if (this.state.time.timeOfDay >= DAY_DURATION_SECONDS) {
      this.sleep(true);
      return;
    }

    // 2. Crop Growth Simulation
    // Crops only grow while watered and active
    for (const key in this.state.plots) {
      const crop = this.state.plots[key];
      if (crop.watered && crop.stage < 3) {
        const config = CROP_CONFIGS[crop.type];
        const timePerStage = config.growDurationSeconds / 3;
        crop.progress += clampedDt / timePerStage;

        if (crop.progress >= 1.0) {
          crop.stage = (crop.stage + 1) as GrowthStage;
          crop.progress = 0;
          if (crop.stage === 3) {
            this.notify(`${config.nameVi} đã chín rộ! Hãy tới thu hoạch nhé! 🌾`, 'success');
          }
        }
      }
    }

    // 3. Construction & Production Buildings Simulation
    if (this.state.placedBuildings) {
      for (const bId in this.state.placedBuildings) {
        const b = this.state.placedBuildings[bId];
        const def = BUILDING_DEFINITIONS[b.type];
        if (!def) continue;

        // Construction site progress
        if (!b.isConstructed) {
          b.constructionProgress = (b.constructionProgress || 0) + clampedDt / Math.max(1, def.buildDurationSeconds);
          if (b.constructionProgress >= 1.0) {
            b.isConstructed = true;
            b.constructionProgress = 1.0;
            soundManager.playHarvest();
            this.notify(`Công trình ${def.nameVi} đã hoàn thành xây dựng! 🎉`, 'success');
            this.grid.recomputeOccupancy(this.state.placedBuildings);
            this.emitState();
          }
        } else if (b.activeRecipeId && def.recipes) {
          // Production machine progress
          const recipe = def.recipes.find(r => r.id === b.activeRecipeId);
          if (recipe) {
            b.productionProgress = (b.productionProgress || 0) + clampedDt / Math.max(1, recipe.durationSeconds);
            if (b.productionProgress >= 1.0) {
              b.finishedProductCount = (b.finishedProductCount || 0) + recipe.output.count;
              b.finishedRecipeId = recipe.id;
              b.activeRecipeId = undefined;
              b.productionProgress = 0;
              soundManager.playHarvest();
              this.notify(`${recipe.output.name} đã chế biến xong tại ${def.nameVi}! ✨`, 'success');
              this.emitState();
            }
          }
        }
      }
    }

    // 4. Cat AI Updates
    this.updateCats(clampedDt);

    // 5. Khim Schedule Update
    this.updateKhim(clampedDt);

    // 5. Periodic auto-save every 15 seconds
    this.lastAutoSaveTime += clampedDt;
    if (this.lastAutoSaveTime >= 15) {
      this.lastAutoSaveTime = 0;
      SaveSystem.saveGame(this.state);
    }
  }

  private updateCats(dt: number) {
    // A. Mochi follows Duyên softly
    const px = this.state.playerPos.x;
    const pz = this.state.playerPos.z;
    const mochi = this.state.cats.mochi;
    const distToPlayer = Math.hypot(mochi.x - px, mochi.z - pz);

    if (distToPlayer > 2.5) {
      // Walk towards Duyên
      const angle = Math.atan2(pz - mochi.z, px - mochi.x);
      const speed = 1.4;
      mochi.x += Math.cos(angle) * speed * dt;
      mochi.z += Math.sin(angle) * speed * dt;
      mochi.state = 'walking';
    } else {
      mochi.state = 'idle';
    }

    // B. Mon Wandering & Occasional Playful Theft
    const mon = this.state.cats.mon;
    this.monTheftTimer += dt;

    // If Mon hasn't stolen anything yet, occasionally check if player has harvest in inventory
    if (!this.state.monTheft.hasStolen && this.monTheftTimer > 45) {
      this.monTheftTimer = 0;
      // Check inventory for harvested crops
      const cropsInBag = Object.values(this.state.inventory).filter(
        item => item.type === 'crop' && item.count > 0
      );

      if (cropsInBag.length > 0 && Math.random() < 0.4) {
        // Mon steals 1 crop!
        const targetCrop = cropsInBag[0];
        targetCrop.count -= 1;
        if (targetCrop.count === 0) {
          delete this.state.inventory[targetCrop.id];
        }

        this.state.monTheft = {
          hasStolen: true,
          item: { ...targetCrop, count: 1 },
          stolenAtTime: this.state.time.timeOfDay,
          stolenDay: this.state.time.day,
        };

        // Mon flees to corner of farm
        mon.x = 4.2;
        mon.z = -4.2;
        mon.state = 'fleeing';

        soundManager.playMeow();
        this.notify(CAT_DIALOGUES.mon.stealAlert, 'warning');
        SaveSystem.saveGame(this.state);
      }
    }

    // Mon gentle idle wander if not fleeing
    if (mon.state !== 'fleeing') {
      if (Math.random() < 0.02) {
        const angle = Math.random() * Math.PI * 2;
        const targetX = Math.max(-5, Math.min(5, mon.x + Math.cos(angle) * 1.5));
        const targetZ = Math.max(-5, Math.min(5, mon.z + Math.sin(angle) * 1.5));
        mon.x = targetX;
        mon.z = targetZ;
      }
    }

    // C. Mây (Quiet Cat) and Daily Gift on Grass
    const may = this.state.cats.may;
    if (!this.state.mayGift.hasGiftOnGround && !this.state.mayGift.collectedToday) {
      // Chance for May to place gift on open lawn
      if (Math.random() < 0.05) {
        this.state.mayGift.hasGiftOnGround = true;
        this.state.mayGift.gridX = 1;
        this.state.mayGift.gridZ = 5;
        this.notify(CAT_DIALOGUES.may.foundGift, 'love');
        soundManager.playMeow();
      }
    }
  }

  private updateKhim(dt: number) {
    const khim = this.state.khim;
    const time = this.state.time.timeOfDay;

    // Schedule:
    // Morning (0..100): Near Home Porch (X: 3.2, Z: 6.8)
    // Daytime (100..260): Walking near garden (X: 0.5, Z: 1.5)
    // Evening (260..360): Near House Garden Bench (X: 1.8, Z: 6.2)
    let targetX = 3.2;
    let targetZ = 6.8;

    if (time >= 100 && time < 260) {
      khim.currentSchedule = 'garden_work';
      targetX = 1.0;
      targetZ = 2.0;
    } else if (time >= 260) {
      khim.currentSchedule = 'home_evening';
      targetX = 2.5;
      targetZ = 6.5;
    } else {
      khim.currentSchedule = 'home_morning';
    }

    // Move smoothly towards schedule destination
    const dx = targetX - khim.x;
    const dz = targetZ - khim.z;
    const dist = Math.hypot(dx, dz);
    if (dist > 0.1) {
      khim.x += (dx / dist) * 0.8 * dt;
      khim.z += (dz / dist) * 0.8 * dt;
    }
  }

  // --- ACTIONS ---

  /**
   * Plants a crop on an empty plot.
   */
  public plantCrop(gridX: number, gridZ: number, cropType: CropType): boolean {
    const key = `${gridX},${gridZ}`;
    if (this.state.plots[key]) {
      this.notify('Ô đất này đã có cây rồi!', 'warning');
      return false;
    }

    if (this.state.energy < ENERGY_COST_PLANT) {
      this.notify('Duyên thấy hơi mệt rồi, hãy về nhà ngủ một giấc để lấy lại sức nhé! 💤', 'warning');
      return false;
    }

    this.state.energy = Math.max(0, this.state.energy - ENERGY_COST_PLANT);

    const newCrop: CropData = {
      id: `${cropType}_${Date.now()}`,
      type: cropType,
      gridX,
      gridZ,
      stage: 0,
      progress: 0,
      watered: false,
      plantedDay: this.state.time.day,
      plantedTime: this.state.time.timeOfDay,
    };

    this.state.plots[key] = newCrop;
    soundManager.playPlant();
    this.notify(`Đã gieo ${CROP_CONFIGS[cropType].seedNameVi}!`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Waters a plot.
   */
  public waterPlot(gridX: number, gridZ: number): boolean {
    const key = `${gridX},${gridZ}`;
    const crop = this.state.plots[key];
    if (!crop) {
      this.notify('Chưa có cây nào ở ô này để tưới nước cả.', 'info');
      return false;
    }

    if (crop.watered) {
      this.notify('Đất vẫn còn ẩm mượt, không cần tưới thêm hôm nay đâu!', 'info');
      return false;
    }

    if (this.state.energy < ENERGY_COST_WATER) {
      this.notify('Duyên đã mệt rồi, nghỉ ngơi chút để hồi phục năng lượng nhé!', 'warning');
      return false;
    }

    this.state.energy = Math.max(0, this.state.energy - ENERGY_COST_WATER);
    crop.watered = true;
    soundManager.playWater();
    this.notify(`Đã tưới nước mát lành cho ${CROP_CONFIGS[crop.type].nameVi}! 💧`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Harvests a mature crop into inventory. Exactly once!
   */
  public harvestCrop(gridX: number, gridZ: number): boolean {
    const key = `${gridX},${gridZ}`;
    const crop = this.state.plots[key];
    if (!crop) return false;

    if (crop.stage < 3) {
      const config = CROP_CONFIGS[crop.type];
      this.notify(`${config.nameVi} đang lớn, hãy kiên nhẫn đợi cây chín nhé!`, 'info');
      return false;
    }

    if (this.state.energy < ENERGY_COST_HARVEST) {
      this.notify('Duyên hơi mệt rồi, hãy nghỉ ngơi một lát nhé!', 'warning');
      return false;
    }

    this.state.energy = Math.max(0, this.state.energy - ENERGY_COST_HARVEST);
    const config = CROP_CONFIGS[crop.type];

    // Add to inventory
    const itemId = `crop_${crop.type}`;
    if (!this.state.inventory[itemId]) {
      this.state.inventory[itemId] = {
        id: itemId,
        type: 'crop',
        cropType: crop.type,
        name: config.nameVi,
        count: 0,
        value: config.sellPrice,
        description: config.description,
      };
    }
    this.state.inventory[itemId].count += 1;

    // Delete from plot
    delete this.state.plots[key];

    soundManager.playHarvest();
    this.notify(`Thu hoạch thành công: +1 ${config.nameVi}! ✨`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Sells crops at market stand.
   */
  public sellCrops(): { totalEarned: number; itemsSold: number } {
    let totalEarned = 0;
    let itemsSold = 0;

    for (const key in this.state.inventory) {
      const item = this.state.inventory[key];
      if ((item.type === 'crop' || item.type === 'product') && item.count > 0) {
        const earned = item.count * item.value;
        totalEarned += earned;
        itemsSold += item.count;
        item.count = 0;
        delete this.state.inventory[key];
      }
    }

    if (totalEarned > 0) {
      this.state.coins += totalEarned;
      soundManager.playCoin();
      this.notify(`Bán được ${itemsSold} món nông sản & thành phẩm, thu về +${totalEarned} xu vàng! 🪙`, 'success');
      this.emitState();
      SaveSystem.saveGame(this.state);
    } else {
      this.notify('Trong túi chưa có nông sản thu hoạch nào để bán cả!', 'info');
    }

    return { totalEarned, itemsSold };
  }

  /**
   * Interacts with Khim (Chat or Gift).
   */
  public chatWithKhim(): string {
    const dialog = KHIM_DIALOGUES[Math.floor(Math.random() * KHIM_DIALOGUES.length)];
    if (!this.state.khim.chattedToday) {
      this.state.khim.chattedToday = true;
      this.state.khim.relationshipMeter = Math.min(100, this.state.khim.relationshipMeter + 10);
      soundManager.playHeart();
      this.notify('Tình cảm với anh Khim +10! 💕', 'love');
    }
    this.emitState();
    SaveSystem.saveGame(this.state);
    return dialog.text;
  }

  public giftKhim(itemId: string): string {
    const item = this.state.inventory[itemId];
    if (!item || item.count <= 0) {
      return 'Duyên chưa chọn món đồ nào trong giỏ để tặng anh.';
    }

    item.count -= 1;
    if (item.count === 0) {
      delete this.state.inventory[itemId];
    }

    this.state.khim.giftedToday = true;
    this.state.khim.relationshipMeter = Math.min(100, this.state.khim.relationshipMeter + 15);

    const reaction =
      (item.cropType && KHIM_GIFT_REACTIONS[item.cropType]) || KHIM_GIFT_REACTIONS.default;

    soundManager.playHeart();
    this.notify(`Đã tặng ${item.name} cho anh Khim! Tình cảm +15! 💕`, 'love');
    this.emitState();
    SaveSystem.saveGame(this.state);
    return reaction;
  }

  /**
   * Pet Mochi.
   */
  public petMochi(): string {
    soundManager.playMeow();
    soundManager.playHeart();
    if (!this.state.cats.mochi.pettedToday) {
      this.state.cats.mochi.pettedToday = true;
      this.state.cats.mochi.loveMeter = Math.min(100, this.state.cats.mochi.loveMeter + 15);
      this.notify('Mochi cảm nhận được tình thương của Duyên! Điểm yêu thích +15! 🐾', 'love');
    }
    this.emitState();
    SaveSystem.saveGame(this.state);
    return CAT_DIALOGUES.mochi.petSuccess;
  }

  /**
   * Catch Mon after playful theft.
   */
  public catchMon(): { recovered: boolean; message: string } {
    soundManager.playMeow();
    if (this.state.monTheft.hasStolen && this.state.monTheft.item) {
      const recoveredItem = this.state.monTheft.item;
      const itemId = recoveredItem.id;

      if (!this.state.inventory[itemId]) {
        this.state.inventory[itemId] = { ...recoveredItem, count: 0 };
      }
      this.state.inventory[itemId].count += 1;

      // Clear theft state safely
      this.state.monTheft = {
        hasStolen: false,
        item: null,
        stolenAtTime: 0,
        stolenDay: 0,
      };

      this.state.cats.mon.state = 'idle';
      this.state.cats.mon.loveMeter = Math.min(100, this.state.cats.mon.loveMeter + 5);

      soundManager.playHeart();
      this.notify(`Đã bắt kịp Mon! Lấy lại thành công: ${recoveredItem.name}! 🐱`, 'success');
      this.emitState();
      SaveSystem.saveGame(this.state);
      return { recovered: true, message: CAT_DIALOGUES.mon.catchSuccess };
    }

    return { recovered: false, message: CAT_DIALOGUES.mon.idle };
  }

  /**
   * Collect Mây's gift box from the grass.
   */
  public collectMayGift(): boolean {
    if (!this.state.mayGift.hasGiftOnGround) return false;

    this.state.mayGift.hasGiftOnGround = false;
    this.state.mayGift.collectedToday = true;

    // Reward: 20 coins + Clover collectible
    this.state.coins += 20;
    const giftItemId = 'collectible_clover';
    if (!this.state.inventory[giftItemId]) {
      this.state.inventory[giftItemId] = {
        id: giftItemId,
        type: 'collectible',
        name: 'Cỏ bốn lá may mắn của bé Mây',
        count: 0,
        value: 10,
        description: 'Món quà bình yên và may mắn bé mèo Mây để lại cho Duyên.',
      };
    }
    this.state.inventory[giftItemId].count += 1;

    soundManager.playHeart();
    soundManager.playCoin();
    this.notify(CAT_DIALOGUES.may.claimedGift, 'love');
    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Sleep transition to begin next day.
   * Restores energy, resets daily watering, preserves crop growth stages, returns stolen item if unrecovered.
   */
  public sleep(isMidnightAuto: boolean = false) {
    soundManager.playSleep();

    // 1. If Mon had stolen an item and player didn't catch Mon before sleeping:
    // Mon gently returns the item overnight safely! No item loss!
    if (this.state.monTheft.hasStolen && this.state.monTheft.item) {
      const recoveredItem = this.state.monTheft.item;
      const itemId = recoveredItem.id;
      if (!this.state.inventory[itemId]) {
        this.state.inventory[itemId] = { ...recoveredItem, count: 0 };
      }
      this.state.inventory[itemId].count += 1;

      this.state.monTheft = {
        hasStolen: false,
        item: null,
        stolenAtTime: 0,
        stolenDay: 0,
      };
      this.notify(CAT_DIALOGUES.mon.returnNight, 'info');
    }

    // 2. Preserve existing crop growth, but reset watered status for the new day
    for (const key in this.state.plots) {
      this.state.plots[key].watered = false;
    }

    // 3. Reset daily flags
    this.state.khim.chattedToday = false;
    this.state.khim.giftedToday = false;
    this.state.cats.mochi.pettedToday = false;
    this.state.cats.mon.pettedToday = false;
    this.state.cats.may.pettedToday = false;
    this.state.mayGift.collectedToday = false;

    // Reset villagers daily flags
    if (this.state.villagers) {
      for (const vId in this.state.villagers) {
        this.state.villagers[vId].talkedToday = false;
        this.state.villagers[vId].giftedToday = false;
      }
    }

    // 4. Advance day & restore energy
    this.state.time.day += 1;
    this.state.time.timeOfDay = 0; // 6:00 AM
    this.state.energy = MAX_ENERGY;

    // Calendar & Season transition
    const totalDays = this.state.time.day;
    const seasonNames: Array<'spring' | 'summer' | 'autumn' | 'winter'> = ['spring', 'summer', 'autumn', 'winter'];
    const seasonIdx = Math.floor((totalDays - 1) / 28) % 4;
    const prevSeason = this.state.calendar?.season || 'spring';
    const nextSeason = seasonNames[seasonIdx];

    this.state.calendar = {
      totalDays,
      dayOfSeason: ((totalDays - 1) % 28) + 1,
      season: nextSeason,
      year: Math.floor((totalDays - 1) / 112) + 1,
    };

    if (prevSeason !== nextSeason) {
      this.notify(`Mùa mới đã sang: Chào mừng ${SEASONS_DATA[nextSeason].nameVi}! 🌸 Cây trồng mùa cũ vẫn tiếp tục sống tốt!`, 'love');
    }

    // Roll deterministic weather for the new day
    const rolledWeather = rollDailyWeather(nextSeason, totalDays);
    const isRaining = rolledWeather === 'rainy' || rolledWeather === 'stormy';
    this.state.weather = {
      current: rolledWeather,
      isRaining,
    };

    // Rain automatically waters outdoor crops!
    if (isRaining) {
      for (const key in this.state.plots) {
        this.state.plots[key].watered = true;
      }
      this.notify('Cơn mưa mát lành đã tưới đẫm nước cho tất cả các luống rau trên đảo! 🌧️', 'info');
    }

    // Storm creates repairable fence damage (not destructive to crops or buildings)
    if (rolledWeather === 'stormy') {
      this.state.stormDamage = {
        damagedFence: true,
        debrisCleared: false,
      };
      this.notify('Cơn giông đêm qua làm xô lệch một đoạn rào và rụng vài cành cây. Hãy cùng anh Khim sửa lại nhé! ⛈️', 'warning');
    }

    // Refresh delivery orders for the new day
    this.state.deliveryOrders = [
      generateDeliveryOrder(this.state.time.day, 1),
      generateDeliveryOrder(this.state.time.day, 2),
      generateDeliveryOrder(this.state.time.day, 3),
    ];

    if (isMidnightAuto) {
      this.notify('Trời đã khuya, Duyên thiếp đi ngủ thật ngon. Chào ngày mới ngập tràn ánh nắng! ☀️', 'info');
    } else {
      this.notify(`Một ngày mới đã bắt đầu (Ngày ${this.state.time.day} — ${SEASONS_DATA[nextSeason].nameVi})! Năng lượng 100%! 🌻`, 'success');
    }

    this.emitState();
    SaveSystem.saveGame(this.state);
  }

  // --- PHASE 2 CONSTRUCTION & PRODUCTION METHODS ---

  /**
   * Places a new building structure in Khim's Blueprint Mode.
   */
  public buildStructure(
    type: PlacedBuildingType,
    originX: number,
    originZ: number,
    rotationDeg: 0 | 90 | 180 | 270
  ): boolean {
    const def = BUILDING_DEFINITIONS[type];
    if (!def) return false;

    // Check placement legality via authoritative occupancy
    const check = this.grid.canPlaceBuilding(originX, originZ, type, rotationDeg);
    if (!check.valid) {
      this.notify(check.reason || 'Vị trí này không hợp lệ!', 'warning');
      return false;
    }

    // Check coin cost
    if (this.state.coins < def.costCoins) {
      this.notify(`Không đủ tiền xu! Cần ${def.costCoins} xu để thi công ${def.nameVi}.`, 'warning');
      return false;
    }

    // Spend coins
    this.state.coins -= def.costCoins;

    const instanceId = `bld_${type}_${Date.now()}`;
    const newBuilding: PlacedBuildingInstance = {
      instanceId,
      type,
      originX,
      originZ,
      rotationDeg,
      isConstructed: false,
      constructionProgress: 0,
      plantedAtDay: this.state.time.day,
    };

    if (!this.state.placedBuildings) {
      this.state.placedBuildings = {};
    }
    this.state.placedBuildings[instanceId] = newBuilding;

    // If custom plot, register immediately as farm plot
    if (type === 'custom_plot') {
      this.grid.setCell(originX, originZ, 2); // FARM_PLOT
    }

    this.grid.recomputeOccupancy(this.state.placedBuildings);
    soundManager.playPlant();
    this.notify(`Đã khởi công ${def.nameVi}! Anh Khim đang kiểm tra bản vẽ thi công. 📐`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Demolishes an existing custom building, refunds coins, and recomputes grid occupancy.
   */
  public demolishStructure(instanceId: string): boolean {
    const building = this.state.placedBuildings[instanceId];
    if (!building) {
      this.notify('Không tìm thấy công trình để dỡ bỏ!', 'warning');
      return false;
    }

    const def = BUILDING_DEFINITIONS[building.type];
    const refundCoins = def ? Math.round(def.costCoins * 0.75) : 0;
    this.state.coins += refundCoins;

    // If custom plot, remove from plots
    if (building.type === 'custom_plot') {
      const plotKey = `${building.originX},${building.originZ}`;
      delete this.state.plots[plotKey];
    }

    delete this.state.placedBuildings[instanceId];
    this.grid.recomputeOccupancy(this.state.placedBuildings);
    soundManager.playBuild();

    const name = def ? def.nameVi : 'công trình';
    this.notify(`Đã dỡ bỏ ${name} thành công. Thu hồi lại ${refundCoins} xu! 🔨`, 'info');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Starts production at a constructed production facility.
   */
  public startProduction(instanceId: string, recipeId: string): boolean {
    const building = this.state.placedBuildings[instanceId];
    if (!building || !building.isConstructed) {
      this.notify('Công trình chưa hoàn thành xây dựng!', 'warning');
      return false;
    }

    if (building.activeRecipeId) {
      this.notify('Công trình đang trong quá trình chế biến mẻ hàng khác!', 'info');
      return false;
    }

    const def = BUILDING_DEFINITIONS[building.type];
    const recipe = def.recipes?.find(r => r.id === recipeId);
    if (!recipe) return false;

    // Check ingredients
    for (const req of recipe.input) {
      const invItem = this.state.inventory[req.itemId];
      if (!invItem || invItem.count < req.count) {
        this.notify(`Thiếu nguyên liệu! Cần ${req.count} ${req.name}.`, 'warning');
        return false;
      }
    }

    // Deduct ingredients
    for (const req of recipe.input) {
      const invItem = this.state.inventory[req.itemId];
      invItem.count -= req.count;
      if (invItem.count <= 0) {
        delete this.state.inventory[req.itemId];
      }
    }

    building.activeRecipeId = recipeId;
    building.productionProgress = 0;

    soundManager.playPlant();
    this.notify(`Đã bắt đầu chế biến: ${recipe.nameVi}! ⏱️`, 'info');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Collects finished processed goods into inventory.
   */
  public collectProduction(instanceId: string): boolean {
    const building = this.state.placedBuildings[instanceId];
    if (!building || !building.finishedProductCount || building.finishedProductCount <= 0) {
      return false;
    }

    const def = BUILDING_DEFINITIONS[building.type];
    // Find recipe by finishedRecipeId or fallback
    const recipe = def.recipes?.find(r => r.id === building.finishedRecipeId) || def.recipes?.[0];
    if (!recipe) return false;

    const out = recipe.output;
    if (!this.state.inventory[out.itemId]) {
      this.state.inventory[out.itemId] = {
        id: out.itemId,
        type: 'product', // accurately marked as crafted product
        name: out.name,
        count: 0,
        value: out.value,
        description: out.description,
      };
    }

    this.state.inventory[out.itemId].count += building.finishedProductCount;
    const collectedCount = building.finishedProductCount;
    building.finishedProductCount = 0;
    building.finishedRecipeId = undefined;

    soundManager.playHarvest();
    this.notify(`Đã nhận +${collectedCount} ${out.name} vào giỏ đồ! 🧺`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Fulfills a delivery order from friendly villagers / Khim.
   */
  public fulfillOrder(orderId: string): boolean {
    const order = this.state.deliveryOrders.find(o => o.id === orderId);
    if (!order || order.isFulfilled) return false;

    // Check all items
    for (const item of order.items) {
      const inv = this.state.inventory[item.itemId];
      if (!inv || inv.count < item.count) {
        this.notify(`Chưa đủ hàng! Cần có ${item.count} ${item.name}.`, 'warning');
        return false;
      }
    }

    // Deduct items
    for (const item of order.items) {
      const inv = this.state.inventory[item.itemId];
      inv.count -= item.count;
      if (inv.count <= 0) {
        delete this.state.inventory[item.itemId];
      }
    }

    // Give rewards
    this.state.coins += order.rewardCoins;
    this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + order.rewardEnergy);
    this.state.khim.relationshipMeter = Math.min(100, this.state.khim.relationshipMeter + order.rewardRelationship);

    order.isFulfilled = true;

    soundManager.playCoin();
    soundManager.playHeart();
    this.notify(`Giao đơn hàng cho "${order.customerName}" thành công! +${order.rewardCoins} xu, +${order.rewardRelationship} điểm gắn kết! 💕`, 'success');

    // Replace order with fresh one
    setTimeout(() => {
      const idx = this.state.deliveryOrders.findIndex(o => o.id === orderId);
      if (idx !== -1) {
        this.state.deliveryOrders[idx] = generateDeliveryOrder(this.state.time.day, idx + 1);
        this.emitState();
        SaveSystem.saveGame(this.state);
      }
    }, 2000);

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  // --- PHASE 3 & 4 ACTIONS & MECHANICS ---

  /**
   * Repairs storm damage.
   */
  public repairStorm(): boolean {
    if (!this.state.stormDamage.damagedFence && this.state.stormDamage.debrisCleared) {
      return false;
    }
    if (this.state.energy < 3) {
      this.notify('Duyên thấy hơi mệt rồi, hãy nghỉ ngơi lấy lại sức nhé!', 'warning');
      return false;
    }
    this.state.energy -= 3;
    this.state.stormDamage.damagedFence = false;
    this.state.stormDamage.debrisCleared = true;
    this.state.coins += 25; // reward
    soundManager.playHarvest();
    this.notify('Hai vợ chồng đã cùng nhau gia cố lại hàng rào và dọn sạch sân vườn! +25 xu 🌈', 'success');
    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Contributes to Dream Home bundle.
   */
  public contributeDreamHome(bundleId: string, count: number): boolean {
    const bundle = DREAM_HOME_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return false;

    const currentContributed = this.state.dreamHome.contributions[bundleId] || 0;
    const remainingNeeded = bundle.requiredItem.count - currentContributed;
    if (remainingNeeded <= 0) {
      this.notify('Hạng mục này đã hoàn thành đủ số lượng đóng góp rồi!', 'info');
      return false;
    }

    const actualQty = Math.min(count, remainingNeeded);
    const invItem = this.state.inventory[bundle.requiredItem.id];
    if (!invItem || invItem.count < actualQty) {
      this.notify(`Chưa đủ nguyên liệu! Cần có ${actualQty} ${bundle.requiredItem.name}.`, 'warning');
      return false;
    }

    // Atomic deduction
    invItem.count -= actualQty;
    if (invItem.count <= 0) {
      delete this.state.inventory[bundle.requiredItem.id];
    }

    const updatedContributed = currentContributed + actualQty;
    this.state.dreamHome.contributions[bundleId] = updatedContributed;

    // Check if bundle finished
    if (updatedContributed >= bundle.requiredItem.count) {
      this.state.dreamHome.stage = Math.max(this.state.dreamHome.stage, bundle.stageTarget);
      if (bundle.stageTarget >= 5) {
        this.state.dreamHome.completed = true;
        this.notify('Chúc mừng! Ngôi Nhà Mơ Ước đã chính thức hoàn thành trọn vẹn! 🏡🎉', 'love');
      } else {
        this.notify(`Hoàn thành ${bundle.nameVi}! ${bundle.storyUnlockVi} ✨`, 'success');
      }
      soundManager.playHarvest();
    } else {
      this.notify(`Đã đóng góp +${actualQty} ${bundle.requiredItem.name} (${updatedContributed}/${bundle.requiredItem.count})! 🔨`, 'info');
      soundManager.playPlant();
    }

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Interacts with Villager (Chat).
   */
  public chatVillager(villagerId: string): string {
    const vDef = VILLAGERS[villagerId];
    if (!vDef) return 'Chào bạn!';

    let vState = this.state.villagers[villagerId];
    if (!vState) {
      vState = { id: villagerId, relationship: 10, talkedToday: false, giftedToday: false };
      this.state.villagers[villagerId] = vState;
    }

    if (!vState.talkedToday) {
      vState.talkedToday = true;
      vState.relationship = Math.min(100, vState.relationship + 5);
      soundManager.playHeart();
      this.notify(`Điểm thân thiết với ${vDef.nameVi} +5! 🌸`, 'love');
    }

    const reply = vDef.chatDialogues[Math.floor(Math.random() * vDef.chatDialogues.length)];
    this.emitState();
    SaveSystem.saveGame(this.state);
    return reply;
  }

  /**
   * Interacts with Villager (Gift).
   */
  public giftVillager(villagerId: string, itemId: string): string {
    const vDef = VILLAGERS[villagerId];
    const item = this.state.inventory[itemId];
    if (!vDef || !item || item.count <= 0) return 'Duyên chưa chọn món quà nào.';

    let vState = this.state.villagers[villagerId];
    if (!vState) {
      vState = { id: villagerId, relationship: 10, talkedToday: false, giftedToday: false };
      this.state.villagers[villagerId] = vState;
    }

    if (vState.giftedToday) {
      return `${vDef.nameVi} đã nhận quà hôm nay rồi, hãy trò chuyện thêm nhé!`;
    }

    // Deduct item
    item.count -= 1;
    if (item.count <= 0) {
      delete this.state.inventory[itemId];
    }

    vState.giftedToday = true;
    const isFavorite = vDef.favoriteItems.includes(itemId);
    const bonus = isFavorite ? 20 : 10;
    vState.relationship = Math.min(100, vState.relationship + bonus);

    soundManager.playHeart();
    this.notify(`Đã tặng quà cho ${vDef.nameVi}! Điểm thân thiết +${bonus}! 💕`, 'love');

    const response = isFavorite ? vDef.giftResponses.favorite : vDef.giftResponses.normal;
    this.emitState();
    SaveSystem.saveGame(this.state);
    return response;
  }

  /**
   * Completes a salon customer service.
   */
  public finishSalonCustomer(customerIdx: number, satisfaction: number): boolean {
    const customer = SALON_CUSTOMERS[customerIdx % SALON_CUSTOMERS.length];
    if (!customer) return false;

    const baseCoins = customer.baseRewardCoins;
    const tip = satisfaction >= 80 ? customer.tipCoins : Math.round(customer.tipCoins / 2);
    const totalEarned = baseCoins + tip;

    this.state.coins += totalEarned;
    this.state.salon.customersServed += 1;
    this.state.salon.hairSkillExp += customer.expReward;
    this.state.salon.currentCustomerIdx = (customerIdx + 1) % SALON_CUSTOMERS.length;

    // If first customer served, unlock salon building permit
    this.state.completedQuests['quest_lan_new_look'] = true;
    this.state.journal['page_salon_open'] = true;

    soundManager.playCoin();
    soundManager.playHarvest();
    this.notify(`Phục vụ khách hàng thành công: +${totalEarned} xu (${tip} xu tiền tip), +${customer.expReward} EXP tay nghề! ✂️✨`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Cat mystery investigation: inspect crumbs or pawprints.
   */
  public inspectClue(clueType: 'crumbs' | 'pawprints'): string {
    soundManager.playPlant();
    if (clueType === 'crumbs') {
      this.state.monMystery.clueCrumbsFound = true;
      this.notify('Phát hiện manh mối: Những mẩu vụn bánh mì cà rốt rơi vãi hướng về luống hoa! 🔍', 'info');
      this.emitState();
      SaveSystem.saveGame(this.state);
      return 'Vụn bánh mì nướng còn thơm phức, có vẻ thủ phạm vừa tha qua đây cách đây không lâu!';
    } else {
      this.state.monMystery.cluePawprintsFound = true;
      this.notify('Phát hiện manh mối: Dấu chân mèo lấm bùn bé xíu dẫn ra phía sau kho thóc! 🐾', 'info');
      this.emitState();
      SaveSystem.saveGame(this.state);
      return 'Dấu chân nhỏ xíu này đích thị là của Mon rồi, chiếc đuôi nghịch ngợm không lẫn vào đâu được!';
    }
  }

  public askMochiClue(): string {
    this.state.monMystery.mochiQuestioned = true;
    soundManager.playMeow();
    this.notify('Mochi dụi đầu vào chân bạn, khẽ kêu meow như muốn thanh minh giúp Mon! 🐱', 'info');
    this.emitState();
    SaveSystem.saveGame(this.state);
    return 'Mochi chớp chớp mắt hiền từ: "Meo meo... (Mon nó đói bụng lỡ tha đi giấu thôi mà, Duyên đừng la Mon nha!)"';
  }

  public resolveMonMystery(): boolean {
    this.state.monMystery.monCaught = true;
    this.state.monMystery.completed = true;
    this.state.journal['page_mon_mystery'] = true;
    this.state.completedQuests['cat_mystery_mon'] = true;
    this.state.cats.mon.loveMeter = Math.min(100, this.state.cats.mon.loveMeter + 10);
    this.state.coins += 50;

    soundManager.playHeart();
    this.notify('Bắt quả tang Mon với chiếc mũi dính vụn bánh! Duyên mỉm cười xoa tai Mon, vụ án khép lại êm đềm! 🐱❤️', 'love');
    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Completes a story chapter.
   */
  public completeStoryChapter(chapterId: string): boolean {
    const ch = STORY_CHAPTERS[chapterId];
    if (!ch) return false;

    this.state.completedQuests[chapterId] = true;
    if (ch.journalPageId) {
      this.state.journal[ch.journalPageId] = true;
    }

    this.state.coins += ch.rewardCoins;
    this.state.khim.relationshipMeter = Math.min(100, this.state.khim.relationshipMeter + ch.rewardRelationship);

    soundManager.playHeart();
    soundManager.playHarvest();
    this.notify(`Hoàn thành ${ch.titleVi}! +${ch.rewardCoins} xu, +${ch.rewardRelationship} điểm gắn kết! 💕`, 'success');

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Claims a mailbox letter reward.
   */
  public claimMailLetter(letterId: string): boolean {
    const mailRecord = this.state.mail[letterId];
    const letter = INITIAL_LETTERS.find(l => l.id === letterId);
    if (!letter || !mailRecord || mailRecord.isClaimed) return false;

    mailRecord.isRead = true;
    mailRecord.isClaimed = true;

    if (letter.reward?.coins) {
      this.state.coins += letter.reward.coins;
    }
    if (letter.reward?.items) {
      for (const item of letter.reward.items) {
        if (!this.state.inventory[item.id]) {
          this.state.inventory[item.id] = {
            id: item.id,
            type: 'crop',
            name: item.name,
            count: 0,
            value: 20,
            description: item.name,
          };
        }
        this.state.inventory[item.id].count += item.count;
      }
    }

    soundManager.playCoin();
    this.notify(`Đã nhận quà từ thư "${letter.subject}"! 📬`, 'success');
    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  /**
   * Performs an exploration activity.
   */
  public doExplorationActivity(zoneId: string, activityId: string): boolean {
    const zone = EXPLORATION_ZONES[zoneId];
    if (!zone) return false;

    const act = zone.activities.find(a => a.id === activityId);
    if (!act) return false;

    if (this.state.energy < act.energyCost) {
      this.notify('Duyên thấy mệt rồi, hãy về nông trại nghỉ ngơi một lát nhé!', 'warning');
      return false;
    }

    this.state.energy -= act.energyCost;

    for (const r of act.rewards) {
      if (!this.state.inventory[r.itemId]) {
        this.state.inventory[r.itemId] = {
          id: r.itemId,
          type: 'collectible',
          name: r.name,
          count: 0,
          value: r.value,
          description: r.name,
        };
      }
      this.state.inventory[r.itemId].count += r.count;
    }

    soundManager.playPlant();
    if (act.rewards.length > 0) {
      this.notify(`Hoàn thành ${act.nameVi}: Nhận được +${act.rewards[0].count} ${act.rewards[0].name}! 🌿`, 'success');
    } else {
      this.notify(`Duyên ngồi ngắm mây trời, tinh thần sảng khoái và hồi phục năng lượng! ☁️`, 'info');
      this.state.energy = Math.min(this.state.maxEnergy, this.state.energy + 20);
    }

    this.emitState();
    SaveSystem.saveGame(this.state);
    return true;
  }

  // --- TEST FIXTURES FOR AUDIT JOURNEYS (NON-INTRUSIVE) ---

  public devAdvanceDay(daysCount: number = 1) {
    for (let i = 0; i < daysCount; i++) {
      this.sleep(false);
    }
  }

  public devAdvanceSeason() {
    this.devAdvanceDay(28);
  }

  public devContributeAllDreamHome() {
    this.state.dreamHome.stage = 5;
    this.state.dreamHome.completed = true;
    for (const b of DREAM_HOME_BUNDLES) {
      this.state.dreamHome.contributions[b.id] = b.requiredItem.count;
    }
    this.notify('DEV FIXTURE: Đã hoàn thành 5 giai đoạn Ngôi Nhà Mơ Ước!', 'success');
    this.emitState();
    SaveSystem.saveGame(this.state);
  }

  public devUnlockAllChapters() {
    this.completeStoryChapter('chapter_1');
    this.completeStoryChapter('chapter_2');
    this.completeStoryChapter('chapter_3');
    this.completeStoryChapter('chapter_4');
    this.resolveMonMystery();
    this.notify('DEV FIXTURE: Đã kích hoạt toàn bộ 4 chương cốt truyện & nhật ký!', 'success');
    this.emitState();
    SaveSystem.saveGame(this.state);
  }
}
