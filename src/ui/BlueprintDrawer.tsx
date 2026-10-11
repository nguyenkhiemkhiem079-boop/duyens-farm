import React from 'react';
import { PlacedBuildingType, BUILDING_DEFINITIONS } from '../core/buildings';
import { GameState } from '../core/types';
import { RotateCw, X, Trash2, Check, AlertCircle } from 'lucide-react';
import { soundManager } from '../core/audio';

interface BlueprintDrawerProps {
  isOpen: boolean;
  selectedBuilding: PlacedBuildingType | null;
  onSelectBuilding: (type: PlacedBuildingType) => void;
  rotation: 0 | 90 | 180 | 270;
  onRotate: () => void;
  onClose: () => void;
  state: GameState;
  onDemolish: (instanceId: string) => void;
}

export const BlueprintDrawer: React.FC<BlueprintDrawerProps> = ({
  isOpen,
  selectedBuilding,
  onSelectBuilding,
  rotation,
  onRotate,
  onClose,
  state,
  onDemolish,
}) => {
  const [activeCategory, setActiveCategory] = React.useState<'production' | 'decoration' | 'farming'>('production');
  const [isDemolishMode, setIsDemolishMode] = React.useState(false);

  if (!isOpen) return null;

  const categories: Array<{ id: 'production' | 'decoration' | 'farming'; label: string; icon: string }> = [
    { id: 'production', label: 'Xưởng Chế Biến', icon: '🏭' },
    { id: 'decoration', label: 'Cảnh Quan & Góc Nghỉ', icon: '🏡' },
    { id: 'farming', label: 'Mở Rộng Nông Trại', icon: '🌱' },
  ];

  const buildings = Object.values(BUILDING_DEFINITIONS).filter(b => b.category === activeCategory);
  const placedList = Object.values(state.placedBuildings || {});

  return (
    <div className="fixed bottom-3 inset-x-3 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[720px] z-40 bg-amber-50/95 backdrop-blur-md border-2 border-amber-300 shadow-2xl rounded-3xl p-4 text-amber-950 animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center text-xl shadow">
            📐
          </div>
          <div>
            <h3 className="text-base font-black text-amber-950 flex items-center gap-2">
              Bản Vẽ Thi Công Của Khim
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                Lưới 12×12
              </span>
            </h3>
            <p className="text-[11px] text-amber-700">
              Chọn công trình, di chuột lên ô đất xanh hợp lệ và nhấp chuột trái để khởi công
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Rotate Button */}
          <button
            onClick={() => {
              soundManager.playStep();
              onRotate();
            }}
            title="Xoay góc công trình (Phím R)"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Xoay {rotation}° (Phím R)</span>
          </button>

          {/* Demolish toggle */}
          <button
            onClick={() => {
              soundManager.playStep();
              setIsDemolishMode(!isDemolishMode);
            }}
            title="Dỡ bỏ công trình cũ"
            className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-xs rounded-xl shadow transition active:scale-95 ${
              isDemolishMode
                ? 'bg-rose-500 text-white'
                : 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDemolishMode ? 'Đang Dỡ Bỏ' : 'Dỡ Bỏ'}</span>
          </button>

          {/* Close Blueprint */}
          <button
            onClick={() => {
              soundManager.playStep();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-amber-200 text-amber-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Demolish List View */}
      {isDemolishMode ? (
        <div className="pt-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Chọn công trình cần dỡ bỏ (Hoàn trả lại 75% chi phí thi công):</span>
          </div>

          {placedList.length === 0 ? (
            <div className="p-6 text-center text-xs text-amber-700 italic bg-amber-100/50 rounded-2xl">
              Chưa có công trình nào được xây dựng thêm trên đảo.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
              {placedList.map(b => {
                const def = BUILDING_DEFINITIONS[b.type];
                const refund = def ? Math.round(def.costCoins * 0.75) : 0;
                return (
                  <div
                    key={b.instanceId}
                    className="flex items-center justify-between p-2.5 bg-white border border-rose-200 rounded-2xl shadow-xs"
                  >
                    <div>
                      <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                        <span>{def?.iconEmoji || '🏡'}</span>
                        <span>{def?.nameVi || b.type}</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Hoàn lại: +{refund} xu</div>
                    </div>
                    <button
                      onClick={() => onDemolish(b.instanceId)}
                      className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow active:scale-95 transition"
                    >
                      Dỡ bỏ
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Construction Building Picker View */
        <div className="pt-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  soundManager.playStep();
                  setActiveCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                  activeCategory === cat.id
                    ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-300'
                    : 'bg-white/80 hover:bg-white text-amber-800'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Building Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto p-1">
            {buildings.map(b => {
              const isSelected = selectedBuilding === b.type;
              const canAfford = state.coins >= b.costCoins;
              return (
                <button
                  key={b.type}
                  onClick={() => {
                    soundManager.playStep();
                    onSelectBuilding(b.type);
                  }}
                  className={`text-left p-2.5 rounded-2xl border-2 transition-all flex flex-col justify-between relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-100/90 shadow-md ring-2 ring-amber-400 scale-[1.02]'
                      : 'border-amber-200 bg-white/90 hover:border-amber-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-2xl">{b.iconEmoji}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/70 text-amber-900 font-bold">
                        {b.width}×{b.depth}
                      </span>
                    </div>
                    <div className="text-xs font-black text-amber-950 line-clamp-1">{b.nameVi}</div>
                    <p className="text-[10px] text-amber-700 line-clamp-2 mt-0.5 leading-snug">
                      {b.descriptionVi}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-amber-100 text-xs">
                    <span className={`font-black ${canAfford ? 'text-amber-800' : 'text-rose-600'}`}>
                      {b.costCoins > 0 ? `${b.costCoins} xu` : 'Miễn phí'}
                    </span>
                    {isSelected && (
                      <span className="flex items-center text-[10px] font-bold text-amber-700 bg-amber-300/80 px-1.5 py-0.5 rounded-lg">
                        <Check className="w-3 h-3 mr-0.5" /> Đang chọn
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
