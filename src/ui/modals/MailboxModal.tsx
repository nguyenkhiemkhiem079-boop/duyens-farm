import { GAME_FICTION_LABEL } from '../../content/gameContent';
import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { INITIAL_LETTERS } from '../../content/letters';
import { Mail, Gift, Check, X } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface MailboxModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({ sim, state, onClose, onRefresh }) => {
  const [selectedLetterId, setSelectedLetterId] = React.useState<string>(INITIAL_LETTERS[0].id);

  const letters = INITIAL_LETTERS;
  const currentLetter = letters.find(l => l.id === selectedLetterId) || letters[0];
  const mailMeta = state.mail?.[currentLetter.id] || { isRead: false, isClaimed: false };

  const handleClaim = (letterId: string) => {
    soundManager.playHarvest();
    sim.claimMailLetter(letterId);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {currentLetter.fiction && <p className="text-xs text-amber-700">{GAME_FICTION_LABEL}</p>}
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          📮
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Hộp Thư Đầu Cổng</h3>
          <p className="text-xs text-amber-700 font-semibold">Những bức thư và lời nhắn gửi tràn ngập tình yêu thương</p>
        </div>
      </div>

      {/* Main Mail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left: Letters List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {letters.map(letter => {
            const meta = state.mail?.[letter.id] || { isRead: false, isClaimed: false };
            const isSelected = letter.id === selectedLetterId;
            return (
              <button
                key={letter.id}
                onClick={() => {
                  soundManager.playStep();
                  setSelectedLetterId(letter.id);
                  if (!meta.isRead) {
                    if (!state.mail) state.mail = {};
                    if (!state.mail[letter.id]) state.mail[letter.id] = { isRead: true, isClaimed: false };
                    state.mail[letter.id].isRead = true;
                    onRefresh();
                  }
                }}
                className={`text-left p-3 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-amber-200/90 border-amber-400 font-bold shadow-xs'
                    : 'bg-white/80 border-amber-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-md">
                    {letter.senderRole}
                  </span>
                  {!meta.isClaimed && letter.reward && (
                    <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      <Gift className="w-2.5 h-2.5" /> Có quà
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-amber-950 line-clamp-1">{letter.subject}</div>
                <div className="text-[10px] text-amber-700 line-clamp-1 mt-0.5">Từ: {letter.sender}</div>
              </button>
            );
          })}
        </div>

        {/* Right: Selected Letter View */}
        <div className="md:col-span-2 bg-amber-100/60 border border-amber-300/80 rounded-2xl p-4 flex flex-col justify-between min-h-[260px]">
          <div>
            <div className="flex justify-between items-start border-b border-amber-200/80 pb-2 mb-3">
              <div>
                <h4 className="font-extrabold text-sm text-amber-950">{currentLetter.subject}</h4>
                <div className="text-[11px] text-amber-700">
                  Người gửi: <span className="font-bold">{currentLetter.sender}</span> ({currentLetter.senderRole})
                </div>
              </div>
              <Mail className="w-5 h-5 text-amber-600 shrink-0" />
            </div>

            <div className="text-xs text-amber-900 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-1">
              {currentLetter.contentVi}
            </div>
          </div>

          {/* Attached Reward Section */}
          {currentLetter.reward && (
            <div className="mt-4 pt-3 border-t border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900">Quà đính kèm:</span>
                {currentLetter.reward.coins && (
                  <span className="text-xs font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded-lg">
                    +{currentLetter.reward.coins} xu 🪙
                  </span>
                )}
                {currentLetter.reward.items?.map((it, idx) => (
                  <span key={idx} className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg">
                    +{it.count} {it.name}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleClaim(currentLetter.id)}
                disabled={mailMeta.isClaimed}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow transition active:scale-95 ${
                  mailMeta.isClaimed
                    ? 'bg-amber-200 text-amber-500 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {mailMeta.isClaimed ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Đã nhận quà
                  </>
                ) : (
                  <>
                    <Gift className="w-3.5 h-3.5" /> Nhận quà ngay
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
