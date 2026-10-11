import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { Search, Check, Heart, Coins, Sparkles } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface CatMysteryModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const CatMysteryModal: React.FC<CatMysteryModalProps> = ({
  sim,
  state,
  onClose,
  onRefresh,
}) => {
  const mystery = state.monMystery || {
    clueCrumbsFound: false,
    cluePawprintsFound: false,
    mochiQuestioned: false,
    monCaught: false,
    completed: false,
  };

  const handleClueCrumbs = () => {
    soundManager.playStep();
    sim.inspectClue('crumbs');
    onRefresh();
  };

  const handleCluePawprints = () => {
    soundManager.playStep();
    sim.inspectClue('pawprints');
    onRefresh();
  };

  const handleAskMochi = () => {
    soundManager.playMeow();
    sim.askMochiClue();
    onRefresh();
  };

  const handleCatchMon = () => {
    soundManager.playCheer();
    sim.resolveMonMystery();
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          🔍
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Vụ Án: Chiếc Bánh Mì Bị Giấu Của Mon</h3>
          <p className="text-xs text-amber-700 font-semibold">Theo dấu những mẩu vụn và dấu chân để tìm thủ phạm 4 chân đáng yêu</p>
        </div>
      </div>

      {/* Case Overview */}
      <div className="p-3 bg-amber-100/60 border border-amber-300 rounded-2xl text-xs text-amber-900 leading-relaxed italic">
        "Một chiếc bánh mì cà rốt thơm phức vừa nướng xong bỗng dưng biến mất! Hãy tìm các manh mối trên đảo để tìm ra bạn mèo tinh nghịch."
      </div>

      {/* Clues Checklist */}
      <div className="space-y-2.5">
        {/* Clue 1: Bread Crumbs */}
        <div className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🥖</span>
              <span>1. Vệt vụn bánh mì rơi vãi gần hiên nhà</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {mystery.clueCrumbsFound ? 'Đã tìm thấy những mẩu vụn bánh vàng ươm dẫn ra bãi cỏ!' : 'Chưa kiểm tra manh mối'}
            </div>
          </div>
          <button
            onClick={handleClueCrumbs}
            disabled={mystery.clueCrumbsFound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mystery.clueCrumbsFound
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow active:scale-95'
            }`}
          >
            {mystery.clueCrumbsFound ? <Check className="w-3.5 h-3.5" /> : 'Kiểm tra'}
          </button>
        </div>

        {/* Clue 2: Pawprints */}
        <div className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🐾</span>
              <span>2. Dấu chân mèo lấm bùn</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {mystery.cluePawprintsFound ? 'Dấu chân nhỏ xíu in rõ trên lối đi đất!' : 'Chưa kiểm tra manh mối'}
            </div>
          </div>
          <button
            onClick={handleCluePawprints}
            disabled={mystery.cluePawprintsFound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mystery.cluePawprintsFound
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow active:scale-95'
            }`}
          >
            {mystery.cluePawprintsFound ? <Check className="w-3.5 h-3.5" /> : 'Lần theo dấu'}
          </button>
        </div>

        {/* Clue 3: Question Mochi */}
        <div className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🐮</span>
              <span>3. Hỏi thăm bạn mèo Mochi</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {mystery.mochiQuestioned ? 'Mochi kêu meo meo hướng mắt về phía góc kho thóc!' : 'Chưa hỏi thăm Mochi'}
            </div>
          </div>
          <button
            onClick={handleAskMochi}
            disabled={mystery.mochiQuestioned}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mystery.mochiQuestioned
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow active:scale-95'
            }`}
          >
            {mystery.mochiQuestioned ? <Check className="w-3.5 h-3.5" /> : 'Hỏi Mochi'}
          </button>
        </div>

        {/* Final Step: Catch & Forgive Mon */}
        <div className="p-3 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🐱</span>
              <span>4. Bắt gặp Mon và trao lời tha thứ ngọt ngào</span>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">
              {mystery.completed ? 'Đã bắt quả tang Mon đang cuộn tròn ôm mẩu bánh mì!' : 'Cần thu thập đủ 3 manh mối'}
            </div>
          </div>
          <button
            onClick={handleCatchMon}
            disabled={mystery.completed || !mystery.clueCrumbsFound || !mystery.cluePawprintsFound || !mystery.mochiQuestioned}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              mystery.completed
                ? 'bg-emerald-100 text-emerald-800'
                : mystery.clueCrumbsFound && mystery.cluePawprintsFound && mystery.mochiQuestioned
                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow active:scale-95'
                : 'bg-amber-100 text-amber-400 cursor-not-allowed'
            }`}
          >
            {mystery.completed ? <Check className="w-3.5 h-3.5" /> : 'Bắt Mon & Tha thứ'}
          </button>
        </div>
      </div>
    </div>
  );
};
