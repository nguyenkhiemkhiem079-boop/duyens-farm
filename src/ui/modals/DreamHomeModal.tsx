import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { DREAM_HOME_BUNDLES } from '../../content/dreamHome';
import { Home, Check, Sparkles, AlertCircle } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface DreamHomeModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const DreamHomeModal: React.FC<DreamHomeModalProps> = ({ sim, state, onClose, onRefresh }) => {
  const dreamHome = state.dreamHome || { stage: 0, contributions: {}, completed: false };

  const handleContribute = (bundleId: string, count: number) => {
    soundManager.playBuild();
    sim.contributeDreamHome(bundleId, count);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
            🏡
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-950">Ngôi Nhà Mơ Ước</h3>
            <p className="text-xs text-amber-700 font-semibold">Tổ ấm trọn vẹn do Khim tính toán và Duyên cùng vun vén</p>
          </div>
        </div>

        {/* Stage Badge */}
        <div className="px-3 py-1.5 bg-amber-200 border border-amber-400 rounded-2xl text-xs font-black text-amber-950 shadow-xs">
          Giai đoạn: {dreamHome.stage} / 5
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-amber-200 rounded-full h-3.5 overflow-hidden border border-amber-300">
        <div
          className="bg-gradient-to-r from-amber-400 to-rose-400 h-full rounded-full transition-all duration-500"
          style={{ width: `${(dreamHome.stage / 5) * 100}%` }}
        />
      </div>

      {/* Completion Banner */}
      {dreamHome.completed && (
        <div className="p-4 bg-emerald-100 border-2 border-emerald-400 rounded-3xl text-emerald-950 shadow-md">
          <div className="flex items-center gap-2 text-sm font-black text-emerald-900 mb-1">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Ngôi Nhà Mơ Ước Đã Hoàn Thành Trọn Vẹn! 🎉</span>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Từng viên gạch, mái ngói và gian phòng đều thấm đẫm tình yêu thương và sự đồng lòng của hai vợ chồng. Căn nhà đã sẵn sàng đón ba mẹ hai bên ghé thăm sum vầy!
          </p>
        </div>
      )}

      {/* Bundles List */}
      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
        {DREAM_HOME_BUNDLES.map(bundle => {
          const isDone = dreamHome.stage >= bundle.stageTarget;
          const isCurrent = dreamHome.stage === bundle.stageTarget - 1;
          const userItemCount = state.inventory[bundle.requiredItem.id]?.count || 0;
          const hasEnoughCoins = state.coins >= bundle.requiredCoins;
          const hasEnoughItems = userItemCount >= bundle.requiredItem.count;

          return (
            <div
              key={bundle.id}
              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-50 border-emerald-300 opacity-85'
                  : isCurrent
                  ? 'bg-white border-amber-400 shadow-md ring-2 ring-amber-200'
                  : 'bg-white/70 border-amber-200 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-950">{bundle.nameVi}</span>
                  {isDone && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Hoàn thành
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-snug">{bundle.descriptionVi}</p>

                {/* Requirements */}
                <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-amber-900">
                  <span className={hasEnoughItems || isDone ? 'text-emerald-700 font-bold' : 'text-rose-600'}>
                    {bundle.requiredItem.emoji} {bundle.requiredItem.name}: {userItemCount}/{bundle.requiredItem.count}
                  </span>
                  <span className={hasEnoughCoins || isDone ? 'text-emerald-700 font-bold' : 'text-rose-600'}>
                    🪙 {bundle.requiredCoins} xu
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {!isDone && (
                <button
                  onClick={() => handleContribute(bundle.id, bundle.requiredItem.count)}
                  disabled={!isCurrent || !hasEnoughCoins || !hasEnoughItems}
                  className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition active:scale-95 shadow ${
                    isCurrent && hasEnoughCoins && hasEnoughItems
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-400 cursor-not-allowed'
                  }`}
                >
                  {isCurrent ? 'Góp vật tư' : 'Chưa mở'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
