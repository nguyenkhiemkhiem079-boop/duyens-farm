import { GAME_FICTION_LABEL } from '../../content/gameContent';
import React from 'react';
import { GameState } from '../../core/types';
import { INITIAL_JOURNAL_PAGES, JournalPage } from '../../content/journal';
import { BookMarked, Lock, Check, Heart, Quote } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface JournalModalProps {
  state: GameState;
  onClose: () => void;
}

export const JournalModal: React.FC<JournalModalProps> = ({ state, onClose }) => {
  const [selectedPageId, setSelectedPageId] = React.useState<string>(INITIAL_JOURNAL_PAGES[0].id);

  const pages = INITIAL_JOURNAL_PAGES;
  const currentPage = pages.find(p => p.id === selectedPageId) || pages[0];
  const isUnlocked = !!state.journal?.[currentPage.id] || currentPage.id === 'page_farm_begin';

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {currentPage.fiction && <p className="text-xs text-amber-700">{GAME_FICTION_LABEL}</p>}
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          📔
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Cuốn Sổ Tay Kỷ Niệm Của Duyên</h3>
          <p className="text-xs text-amber-700 font-semibold">Kỷ niệm đã xác nhận và các trang chuyện trong game</p>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Left: Pages List */}
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
          {pages.map(page => {
            const unlocked = !!state.journal?.[page.id] || page.id === 'page_farm_begin';
            const isSelected = page.id === selectedPageId;

            return (
              <button
                key={page.id}
                onClick={() => {
                  soundManager.playStep();
                  setSelectedPageId(page.id);
                }}
                className={`p-2.5 rounded-2xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-amber-400 border-amber-500 text-amber-950 font-bold shadow-xs'
                    : unlocked
                    ? 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
                    : 'bg-stone-100 border-stone-200 text-stone-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{page.iconEmoji}</span>
                  <div>
                    <div className="text-xs font-bold line-clamp-1">{page.titleVi}</div>
                    <div className="text-[10px] text-amber-700">{page.dateTag}</div>
                  </div>
                </div>

                {unlocked ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: Selected Page View */}
        <div className="md:col-span-2 bg-amber-100/60 border border-amber-300 rounded-2xl p-4 flex flex-col justify-between min-h-[260px]">
          {isUnlocked ? (
            <div className="space-y-3">
              <div className="border-b border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentPage.iconEmoji}</span>
                  <h4 className="font-black text-sm text-amber-950">{currentPage.titleVi}</h4>
                </div>
                <div className="text-[11px] text-amber-700 font-semibold">{currentPage.dateTag}</div>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed max-h-36 overflow-y-auto pr-1">
                {currentPage.storyVi}
              </p>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                <Quote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-amber-950 italic">{currentPage.quoteVi}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-200/80 flex items-center justify-center text-2xl shadow-xs">
                🔒
              </div>
              <h4 className="font-bold text-sm text-amber-950">{currentPage.titleVi}</h4>
              <p className="text-xs text-amber-700 italic max-w-xs">{currentPage.unlockedHintVi}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
