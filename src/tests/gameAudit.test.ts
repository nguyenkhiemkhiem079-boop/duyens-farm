import { FarmGrid } from '../world/grid';
import { GameSimulation } from '../systems/GameSimulation';
import { SaveSystem, createInitialGameState, validateSaveData, migrateSaveData } from '../systems/saveSystem';
import { BUILDING_DEFINITIONS } from '../core/buildings';

// Simple assert helper
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

console.log('--- RUNNING DUYEN FARM REGRESSION AUDIT SUITE ---');

// TEST 1: Footprint Dimensions for all buildings
console.log('Testing Test 1: Data-driven footprint calculation...');
{
  const salonCells = FarmGrid.getFootprintCells(0, 0, 'salon_building', 0);
  assert(salonCells.length === 4, `salon_building should occupy 4 cells (2x2), got ${salonCells.length}`);

  const cafeCells = FarmGrid.getFootprintCells(0, 0, 'book_cafe', 0);
  assert(cafeCells.length === 4, `book_cafe should occupy 4 cells (2x2), got ${cafeCells.length}`);

  const windmillCells = FarmGrid.getFootprintCells(0, 0, 'windmill', 0);
  assert(windmillCells.length === 4, `windmill should occupy 4 cells (2x2), got ${windmillCells.length}`);

  const juiceCells = FarmGrid.getFootprintCells(0, 0, 'juice_press', 0);
  assert(juiceCells.length === 2, `juice_press should occupy 2 cells (2x1), got ${juiceCells.length}`);

  const juiceRotated = FarmGrid.getFootprintCells(0, 0, 'juice_press', 90);
  assert(juiceRotated.length === 2, `juice_press rotated should occupy 2 cells (1x2), got ${juiceRotated.length}`);
  console.log('✓ Test 1 Passed: Footprint dimensions correct for all buildings.');
}

// TEST 2: Critical Doorway Blocking
console.log('Testing Test 2: Critical doorways are protected...');
{
  const grid = new FarmGrid();
  // House door is at (2, 7)
  const placeAtHouseDoor = grid.canPlaceBuilding(2, 7, 'lantern', 0);
  assert(!placeAtHouseDoor.valid, 'Placement on house door must be rejected');

  // Market door is at (8, 4)
  const placeAtMarket = grid.canPlaceBuilding(8, 4, 'lantern', 0);
  assert(!placeAtMarket.valid, 'Placement in front of market must be rejected');
  console.log('✓ Test 2 Passed: Critical access waypoints protected.');
}

// TEST 3: Demolish and Refund Mechanics
console.log('Testing Test 3: Demolish structure and coin refund...');
{
  const state = createInitialGameState();
  state.coins = 200;
  const sim = new GameSimulation(state);

  // Build a windmill at (6, 4) on open grassy meadow
  const built = sim.buildStructure('windmill', 6, 4, 0);
  assert(built, 'Windmill should build successfully at (6, 4)');
  assert(state.coins === 200 - 80, `Coins should be 120 after spending 80, got ${state.coins}`);

  const instanceId = Object.keys(state.placedBuildings)[0];
  assert(!!instanceId, 'Placed building instance ID must exist');

  // Demolish windmill
  const demolished = sim.demolishStructure(instanceId);
  assert(demolished, 'Demolish should succeed');
  assert(!state.placedBuildings[instanceId], 'Building should be removed from placedBuildings');
  const expectedRefund = Math.round(80 * 0.75);
  assert(state.coins === 120 + expectedRefund, `Coins should include refund of ${expectedRefund}`);
  console.log('✓ Test 3 Passed: Demolish structure and refund functioning correctly.');
}

// TEST 4: Recipe Output and Collection
console.log('Testing Test 4: Recipe output tracking and collection...');
{
  const state = createInitialGameState();
  const sim = new GameSimulation(state);

  // Add wheat to inventory
  state.inventory['crop_wheat'] = {
    id: 'crop_wheat',
    type: 'crop',
    name: 'Lúa mì',
    count: 10,
    value: 20,
    description: 'Lúa mì',
  };

  // Add completed windmill
  const bId = 'test_windmill';
  state.placedBuildings[bId] = {
    instanceId: bId,
    type: 'windmill',
    originX: 5,
    originZ: 5,
    rotationDeg: 0,
    isConstructed: true,
    constructionProgress: 1.0,
    plantedAtDay: 1,
  };

  // Start flour milling (requires 2 wheat)
  const started = sim.startProduction(bId, 'flour_milling');
  assert(started, 'Production should start');
  assert(state.inventory['crop_wheat'].count === 8, 'Wheat should be deducted by 2');

  // Simulate production completion via tick loop
  const recipe = BUILDING_DEFINITIONS['windmill'].recipes![0];
  const steps = Math.ceil((recipe.durationSeconds + 2) / 0.1);
  for (let i = 0; i < steps; i++) {
    sim.update(0.1);
  }

  assert(state.placedBuildings[bId].finishedProductCount === 1, 'Finished product count should be 1');
  assert(state.placedBuildings[bId].finishedRecipeId === 'flour_milling', 'finishedRecipeId should be flour_milling');

  // Collect production
  const collected = sim.collectProduction(bId);
  assert(collected, 'Collection should succeed');
  assert(state.inventory['product_flour']?.count === 1, 'Flour should be in inventory with count 1');
  assert(state.inventory['product_flour']?.type === 'product', 'Flour type should be product');
  assert(state.placedBuildings[bId].finishedProductCount === 0, 'finishedProductCount should reset to 0');
  console.log('✓ Test 4 Passed: Production recipe output properly tracked and collected.');
}

// TEST 5: Selling Both Crops and Crafted Products
console.log('Testing Test 5: Selling crops and crafted products at market...');
{
  const state = createInitialGameState();
  state.coins = 50;
  const sim = new GameSimulation(state);

  // Add 2 carrots (value 15 each = 30)
  state.inventory['crop_carrot'] = {
    id: 'crop_carrot',
    type: 'crop',
    name: 'Cà rốt',
    count: 2,
    value: 15,
    description: 'Cà rốt',
  };

  // Add 1 carrot bread (value 90)
  state.inventory['product_carrot_bread'] = {
    id: 'product_carrot_bread',
    type: 'product',
    name: 'Bánh mì cà rốt',
    count: 1,
    value: 90,
    description: 'Bánh mì',
  };

  const sellResult = sim.sellCrops();
  assert(sellResult.itemsSold === 3, `Should sell 3 items total, got ${sellResult.itemsSold}`);
  assert(sellResult.totalEarned === 30 + 90, `Should earn 120 coins total, got ${sellResult.totalEarned}`);
  assert(state.coins === 50 + 120, `Coins should be 170, got ${state.coins}`);
  assert(!state.inventory['crop_carrot'], 'Carrots should be cleared from inventory');
  assert(!state.inventory['product_carrot_bread'], 'Carrot bread should be cleared from inventory');
  console.log('✓ Test 5 Passed: Market stand sells both crops and crafted products.');
}

// TEST 6: Mon Theft Overnight Recovery
console.log('Testing Test 6: Mon theft item preservation and safe overnight return...');
{
  const state = createInitialGameState();
  const sim = new GameSimulation(state);

  // Stolen carrot
  state.monTheft = {
    hasStolen: true,
    item: {
      id: 'crop_carrot',
      type: 'crop',
      name: 'Cà rốt',
      count: 1,
      value: 15,
      description: 'Cà rốt',
    },
    stolenAtTime: 50,
    stolenDay: 1,
  };

  // Player goes to sleep without catching Mon
  sim.sleep(false);

  assert(!state.monTheft.hasStolen, 'hasStolen should be false after sleeping');
  assert(state.monTheft.item === null, 'stolen item should be cleared');
  assert(state.inventory['crop_carrot']?.count === 1, 'Carrot should be returned to inventory safely');
  console.log('✓ Test 6 Passed: Mon theft returns item safely overnight with no item loss.');
}

// TEST 7: Corrupt Save Data Rejection & Migration
console.log('Testing Test 7: Save validation and migration...');
{
  // Test invalid data
  const invalidData = { coins: 'not_a_number', energy: null };
  const isValid = validateSaveData(invalidData);
  assert(!isValid, 'Corrupt save data must be rejected by validateSaveData');

  // Test legacy migration (v1 format lacking calendar/weather/dreamHome)
  const legacyV1: any = {
    version: 1,
    playerName: 'Duyên',
    coins: 100,
    energy: 100,
    maxEnergy: 100,
    time: { day: 3, timeOfDay: 50, isPaused: false, speed: 1 },
    inventory: {},
    plots: {},
    khim: { relationshipMeter: 20 },
    cats: {
      mochi: { id: 'mochi' },
      mon: { id: 'mon' },
      may: { id: 'may' },
    },
  };

  const migrated = migrateSaveData(legacyV1);
  assert(migrated.version === 4, 'Version should be updated to 4');
  assert(!!migrated.calendar, 'Calendar state must be provisioned');
  assert(!!migrated.weather, 'Weather state must be provisioned');
  assert(!!migrated.dreamHome, 'Dream Home state must be provisioned');
  assert(!!migrated.deliveryOrders && migrated.deliveryOrders.length > 0, 'Orders must be provisioned');
  assert(!!migrated.settings, 'Settings must be provisioned');
  console.log('✓ Test 7 Passed: Save validation rejects corruption and migrates legacy data cleanly.');
}

// TEST 8: Delivery Order Fulfillment
console.log('Testing Test 8: Delivery order fulfillment...');
{
  const state = createInitialGameState();
  const sim = new GameSimulation(state);

  const order = state.deliveryOrders[0];
  const firstReq = order.items[0];

  // Provide requested item
  state.inventory[firstReq.itemId] = {
    id: firstReq.itemId,
    type: 'crop',
    name: firstReq.name,
    count: 20,
    value: 15,
    description: 'Test item',
  };

  // If order has a second item, provide that too
  if (order.items[1]) {
    const secondReq = order.items[1];
    state.inventory[secondReq.itemId] = {
      id: secondReq.itemId,
      type: 'crop',
      name: secondReq.name,
      count: 20,
      value: 15,
      description: 'Test item 2',
    };
  }

  const initialCoins = state.coins;
  const fulfilled = sim.fulfillOrder(order.id);
  assert(fulfilled, 'Order fulfillment should succeed');
  assert(state.coins === initialCoins + order.rewardCoins, 'Coins should match order reward');
  assert(order.isFulfilled, 'Order should be marked fulfilled');

  // Attempt duplicate fulfillment immediately
  const duplicate = sim.fulfillOrder(order.id);
  assert(!duplicate, 'Duplicate fulfillment on already fulfilled order must be rejected');
  console.log('✓ Test 8 Passed: Delivery orders fulfill properly and reject double-claims.');
}

console.log('\n=========================================');
console.log('ALL 8 REGRESSION TESTS PASSED SUCCESSFULLY!');
console.log('=========================================\n');
