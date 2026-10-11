import { GAME_FICTION_LABEL } from '../../content/gameContent';
import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { STORY_CHAPTERS, StoryChapterData } from '../../content/chapters';
import { BookOpen, Check, Heart, Coins, ArrowRight, Sparkles } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface ChaptersModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const ChaptersModal: React.FC<ChaptersModalProps> = ({ sim, state, onClose, onRefresh }) => {
  const [selectedChapId, setSelectedChapId] = React.useState<string>('chapter_1');
  const [dialogueIdx, setDialogueIdx] = React.useState<number>(0);
  const [chosenOutcomes, setChosenOutcomes] = React.useState<Record<number, string>>({});

  const chapters = Object.values(STORY_CHAPTERS);
  const currentChapter: StoryChapterData = STORY_CHAPTERS[selectedChapId] || chapters[0];
  const isCompleted = !!state.completedQuests?.[currentChapter.id];

  const handleSelectChapter = (chapId: string) => {
    soundManager.playStep();
    setSelectedChapId(chapId);
    setDialogueIdx(0);
    setChosenOutcomes({});
  };

  const handleChooseOption = (outcomeVi?: string) => {
    soundManager.playHeart();
    if (outcomeVi) {
      setChosenOutcomes(prev => ({ ...prev, [dialogueIdx]: outcomeVi }));
    }
  };

  const handleNextDialogue = () => {
    soundManager.playStep();
    if (dialogueIdx < currentChapter.dialogueSequence.length - 1) {
      setDialogueIdx(dialogueIdx + 1);
    }
  };

  const handleFinishChapter = () => {
    soundManager.playCheer();
    sim.completeStoryChapter(currentChapter.id);
    onRefresh();
  };

  const currentNode = currentChapter.dialogueSequence[dialogueIdx];

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {currentChapter.fiction && <p className="text-xs text-amber-700">{GAME_FICTION_LABEL}</p>}
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          📖
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Chương Hồi Kỷ Niệm</h3>
          <p className="text-xs text-amber-700 font-semibold">Kỷ niệm đã xác nhận và những câu chuyện trong nông trại</p>
        </div>
      </div>

      {/* Chapters Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {chapters.map(chap => {
          const done = !!state.completedQuests?.[chap.id];
          const isSelected = chap.id === selectedChapId;
          return (
            <button
              key={chap.id}
              onClick={() => handleSelectChapter(chap.id)}
              className={`p-2.5 rounded-2xl border-2 text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-md ring-2 ring-amber-300 scale-102 font-bold'
                  : done
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 hover:bg-emerald-100'
                  : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono text-[10px] font-bold">Chương {chap.chapterNumber}</span>
                {done && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-xs font-black line-clamp-1">{chap.titleVi.split(': ')[1] || chap.titleVi}</div>
            </button>
          );
        })}
      </div>

      {/* Dialogue Reader Box */}
      <div className="p-4 bg-amber-100/60 border border-amber-300 rounded-3xl min-h-[220px] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-amber-200 pb-2 mb-3">
            <div>
              <h4 className="font-black text-sm text-amber-950">{currentChapter.titleVi}</h4>
              <p className="text-[11px] text-amber-700 font-medium">{currentChapter.subtitleVi}</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600">
              {dialogueIdx + 1} / {currentChapter.dialogueSequence.length}
            </span>
          </div>

          {/* Current Dialogue Card */}
          {currentNode && (
            <div className="p-3 bg-white border border-amber-200 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentNode.avatar}</span>
                <span className="font-extrabold text-xs text-amber-950">{currentNode.speaker}</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed italic">"{currentNode.textVi}"</p>

              {/* Choices if any */}
              {currentNode.choices && (
                <div className="pt-2 space-y-1.5 border-t border-amber-100">
                  <div className="text-[10px] font-bold text-amber-700">Lựa chọn lời hồi đáp dịu dàng:</div>
                  {currentNode.choices.map((choice, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleChooseOption(choice.outcomeVi)}
                      className="w-full text-left p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs text-amber-950 font-medium transition active:scale-98"
                    >
                      💬 {choice.textVi}
                    </button>
                  ))}
                </div>
              )}

              {/* Outcome feedback if chosen */}
              {chosenOutcomes[dialogueIdx] && (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{chosenOutcomes[dialogueIdx]}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-200/80 mt-3">
          <div className="flex items-center gap-3 text-xs font-bold text-amber-800">
            <span className="flex items-center gap-1 text-emerald-700">
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>+{currentChapter.rewardCoins} xu</span>
            </span>
            <span className="flex items-center gap-1 text-rose-600">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>+{currentChapter.rewardRelationship} điểm</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {dialogueIdx < currentChapter.dialogueSequence.length - 1 ? (
              <button
                onClick={handleNextDialogue}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishChapter}
                className={`px-4 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5 transition active:scale-95 ${
                  isCompleted
                    ? 'bg-emerald-200 text-emerald-800 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {isCompleted ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Đã lưu vào Nhật ký
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Khắc sâu vào Nhật ký
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
