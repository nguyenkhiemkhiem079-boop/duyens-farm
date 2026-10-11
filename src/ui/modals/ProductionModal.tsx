import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { PlacedBuildingInstance, BUILDING_DEFINITIONS } from '../../core/buildings';
import { Flame, Check, Package, Trash2, ArrowRight } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface ProductionModalProps {
  building: PlacedBuildingInstance;
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const ProductionModal: React.FC<ProductionModalProps> = ({
  building,
  sim,
  state,
  onClose,
  onRefresh,
}) => {
  const currentBuilding = state.placedBuildings?.[building.instanceId] || building;
  const def = BUILDING_DEFINITIONS[currentBuilding.type];

  if (!def) return null;

  const handleStart = (recipeId: string) => {
    soundManager.playStep();
    sim.startProduction(currentBuilding.instanceId, recipeId);
    onRefresh();
  };

  const handleCollect = () => {
    soundManager.playHarvest();
    sim.collectProduction(currentBuilding.instanceId);
    onRefresh();
  };

  const handleDemolish = () => {
    soundManager.playBuild();
    sim.demolishStructure(currentBuilding.instanceId);
    onRefresh();
    onClose();
  };

  const isConstructing = !currentBuilding.isConstructed;
  const hasFinished = (currentBuilding.finishedProductCount || 0) > 0;
  const isWorking = !!currentBuilding.activeRecipeId;

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
            {def.iconEmoji}
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-950">{def.nameVi}</h3>
            <p className="text-xs text-amber-700 font-semibold">{def.descriptionVi}</p>
          </div>
        </div>

        {/* Demolish button */}
        <button
          onClick={handleDemolish}
          title="Dỡ bỏ công trình & thu hồi xu"
          className="p-2 rounded-xl text-rose-700 bg-rose-100 hover:bg-rose-200 active:scale-95 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Under Construction State */}
      {isConstructing && (
        <div className="p-4 bg-amber-100/70 border border-amber-300 rounded-2xl">
          <div className="flex justify-between items-center text-xs font-bold text-amber-900 mb-1.5">
            <span>Đang thi công giàn giáo...</span>
            <span className="font-mono">{Math.round((currentBuilding.constructionProgress || 0) * 100)}%</span>
          </div>
          <div className="w-full bg-amber-200 rounded-full h-3 overflow-hidden border border-amber-300">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentBuilding.constructionProgress || 0) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-amber-700 mt-2 italic">
            Anh Khim đang đo đạc kết cấu gỗ chịu lực. Công trình sẽ hoàn thành sau vài giây nữa!
          </p>
        </div>
      )}

      {/* Ready / Production State */}
      {!isConstructing && def.recipes && def.recipes.length > 0 && (
        <div className="space-y-3">
          {/* Collect Product Ready */}
          {hasFinished && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Đã chế biến xong:</span>
                </div>
                <div className="text-sm font-black text-emerald-800">
                  {currentBuilding.finishedProductCount} món thành phẩm đang chờ nhận!
                </div>
              </div>
              <button
                onClick={handleCollect}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition"
              >
                Thu hoạch ngay 🧺
              </button>
            </div>
          )}

          {/* Machine Working Status */}
          {isWorking && (
            <div className="p-3 bg-sky-100 border border-sky-300 rounded-2xl">
              <div className="flex justify-between items-center text-xs font-bold text-sky-950 mb-1.5">
                <span className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Đang vận hành chế biến...</span>
                </span>
                <span className="font-mono">{Math.round((currentBuilding.productionProgress || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-sky-200 rounded-full h-2.5 overflow-hidden border border-sky-300">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${(currentBuilding.productionProgress || 0) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Recipes List */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-amber-900">Công thức chế biến khả dụng:</div>
            {def.recipes.map(recipe => {
              const hasIngredients = recipe.input.every(inp => {
                const invItem = state.inventory[inp.itemId];
                return invItem && invItem.count >= inp.count;
              });

              return (
                <div
                  key={recipe.id}
                  className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs"
                >
                  <div>
                    <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                      <span>{recipe.output.emoji}</span>
                      <span>{recipe.nameVi}</span>
                    </div>
                    <div className="text-[10px] text-amber-700 mt-0.5">
                      Cần: {recipe.input.map(i => `${i.count} ${i.name}`).join(' + ')}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                      Cho ra: {recipe.output.count} {recipe.output.name} (Giá bán {recipe.output.value} xu)
                    </div>
                  </div>

                  <button
                    onClick={() => handleStart(recipe.id)}
                    disabled={!hasIngredients || isWorking || hasFinished}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                      hasIngredients && !isWorking && !hasFinished
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow'
                        : 'bg-amber-100 text-amber-400 cursor-not-allowed'
                    }`}
                  >
                    Bắt đầu ({recipe.durationSeconds}s)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pure Decoration Building */}
      {!isConstructing && (!def.recipes || def.recipes.length === 0) && (
        <div className="p-4 bg-amber-100/60 rounded-2xl text-center text-xs text-amber-800 italic">
          Công trình cảnh quan đã hoàn thành trọn vẹn, tô điểm cho hòn đảo thêm phần thơ mộng!
        </div>
      )}
    </div>
  );
};
