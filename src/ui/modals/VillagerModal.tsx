import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { VILLAGERS } from '../../content/villagers';
import { Heart, MessageCircle, Gift } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface VillagerModalProps {
  villagerId: string;
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const VillagerModal: React.FC<VillagerModalProps> = ({
  villagerId,
  sim,
  state,
  onClose,
  onRefresh,
}) => {
  const [currentMessage, setCurrentMessage] = React.useState<string | null>(null);

  const def = VILLAGERS[villagerId] || VILLAGERS['ong_bay'];
  const vState = state.villagers?.[villagerId] || { relationship: 10, talkedToday: false, giftedToday: false };

  const handleChat = () => {
    soundManager.playStep();
    const reply = sim.chatVillager(villagerId);
    setCurrentMessage(reply);
    onRefresh();
  };

  const handleGift = (itemId: string) => {
    soundManager.playHeart();
    const reply = sim.giftVillager(villagerId, itemId);
    setCurrentMessage(reply);
    onRefresh();
  };

  const giftableItems = Object.values(state.inventory).filter(
    it => (it.type === 'crop' || it.type === 'product' || it.type === 'collectible') && it.count > 0
  );

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          {def.avatarEmoji}
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">{def.nameVi}</h3>
          <p className="text-xs text-amber-700 font-semibold">{def.roleVi}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-rose-500">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>Điểm gắn kết: {vState.relationship}/100</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-amber-800 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
        {def.descriptionVi}
      </p>

      {/* Dialogue Bubble */}
      <div className="p-3 bg-white border border-amber-200 rounded-2xl text-xs text-amber-950 min-h-[70px] flex items-center shadow-xs">
        {currentMessage ? (
          <p className="italic font-medium leading-relaxed">"{currentMessage}"</p>
        ) : (
          <p className="italic text-amber-700">"{def.introDialogue}"</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleChat}
          className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow transition"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Trò chuyện hôm nay {vState.talkedToday ? '(Đã trò chuyện)' : '(+5 điểm gắn kết)'}</span>
        </button>

        {/* Gift Section */}
        <div className="bg-amber-100/70 border border-amber-200 rounded-2xl p-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-2">
            <span className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5 text-rose-500" />
              <span>Tặng quà cho {def.nameVi}:</span>
            </span>
            <span className="text-[10px] text-amber-700">Món thích: {def.favoriteItems.join(', ')}</span>
          </div>

          {giftableItems.length === 0 ? (
            <p className="text-[11px] text-amber-700 italic text-center py-2">
              Giỏ đồ chưa có nông sản hoặc thành phẩm nào để tặng.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {giftableItems.map(item => {
                const isFavorite = def.favoriteItems.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleGift(item.id)}
                    className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-200 hover:bg-amber-50 active:scale-95 text-left text-xs transition"
                  >
                    <div>
                      <span className="font-bold text-amber-950 block text-[11px]">{item.name}</span>
                      <span className="text-[10px] text-amber-600">Còn {item.count}</span>
                    </div>
                    {isFavorite && (
                      <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                        Thích ❤️
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
