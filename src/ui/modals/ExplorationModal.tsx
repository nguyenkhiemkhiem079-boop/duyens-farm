import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { EXPLORATION_ZONES, ExplorationZoneInfo } from '../../content/exploration';
import { Compass, Zap, Sparkles } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface ExplorationModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const ExplorationModal: React.FC<ExplorationModalProps> = ({
  sim,
  state,
  onClose,
  onRefresh,
}) => {
  const [selectedZoneId, setSelectedZoneId] = React.useState<string>('forest');

  const zones = Object.values(EXPLORATION_ZONES);
  const currentZone: ExplorationZoneInfo = EXPLORATION_ZONES[selectedZoneId] || zones[0];

  const handleActivity = (activityId: string, energyCost: number) => {
    if (state.energy < energyCost) {
      soundManager.playStep();
      sim.doExplorationActivity(selectedZoneId, activityId); // will notify energy warning
      return;
    }
    soundManager.playHarvest();
    sim.doExplorationActivity(selectedZoneId, activityId);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          🧭
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Khám Phá Ngoại Ô Hòn Đảo</h3>
          <p className="text-xs text-amber-700 font-semibold">Tản bộ thư giãn, buông cần câu cá và hái thảo mộc thơm</p>
        </div>
      </div>

      {/* Zones Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {zones.map(z => (
          <button
            key={z.id}
            onClick={() => {
              soundManager.playStep();
              setSelectedZoneId(z.id);
            }}
            className={`p-2.5 rounded-2xl border-2 text-left transition flex items-center gap-2 ${
              selectedZoneId === z.id
                ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300 font-bold'
                : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
            }`}
          >
            <span className="text-2xl">{z.iconEmoji}</span>
            <span className="text-xs font-black line-clamp-1">{z.nameVi}</span>
          </button>
        ))}
      </div>

      {/* Zone Overview & Activities */}
      <div className="p-4 bg-amber-100/60 border border-amber-300 rounded-3xl space-y-3">
        <div>
          <h4 className="font-black text-sm text-amber-950 flex items-center gap-1.5">
            <span>{currentZone.iconEmoji}</span>
            <span>{currentZone.nameVi}</span>
          </h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{currentZone.descriptionVi}</p>
        </div>

        {/* Activities List */}
        <div className="space-y-2 pt-2 border-t border-amber-200">
          <div className="text-xs font-bold text-amber-900">Hoạt động trải nghiệm:</div>
          {currentZone.activities.map(act => {
            const hasEnergy = state.energy >= act.energyCost;
            return (
              <div
                key={act.id}
                className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs"
              >
                <div>
                  <div className="text-xs font-black text-amber-950">{act.nameVi}</div>
                  <div className="text-[10px] text-amber-700 mt-0.5">{act.descriptionVi}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                    Thành quả:{' '}
                    {act.rewards.length > 0
                      ? act.rewards.map(r => `${r.count} ${r.name}`).join(', ')
                      : 'Thư giãn tâm hồn, hồi phục an yên'}
                  </div>
                </div>

                <button
                  onClick={() => handleActivity(act.id, act.energyCost)}
                  disabled={!hasEnergy}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 flex items-center gap-1 shadow ${
                    hasEnergy
                      ? 'bg-amber-500 hover:bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-400 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-200 fill-amber-200" />
                  <span>{act.energyCost > 0 ? `-${act.energyCost} NL` : 'Miễn phí'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
