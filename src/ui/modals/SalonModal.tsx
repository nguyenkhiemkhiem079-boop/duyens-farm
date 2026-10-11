import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { SALON_CUSTOMERS, SALON_PALETTE_COLORS } from '../../content/salonContent';
import { Scissors, Sparkles, Check, Heart, Award } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface SalonModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const SalonModal: React.FC<SalonModalProps> = ({ sim, state, onClose, onRefresh }) => {
  const [selectedCustIdx, setSelectedCustIdx] = React.useState<number>(state.salon?.currentCustomerIdx || 0);
  const [washed, setWashed] = React.useState(false);
  const [lengthPercent, setLengthPercent] = React.useState(100);
  const [selectedColor, setSelectedColor] = React.useState<string>(SALON_PALETTE_COLORS[0].hex);
  const [selectedStyle, setSelectedStyle] = React.useState<'straight' | 'wavy' | 'curly'>('straight');
  const [lastFeedback, setLastFeedback] = React.useState<string | null>(null);

  const customer = SALON_CUSTOMERS[selectedCustIdx % SALON_CUSTOMERS.length];

  const handleWash = () => {
    soundManager.playBubble();
    setWashed(true);
  };

  const handleSnip = (val: number) => {
    soundManager.playSnip();
    setLengthPercent(val);
  };

  const handleFinish = () => {
    // Calculate satisfaction
    let satisfaction = 70;
    if (washed) satisfaction += 10;
    if (selectedStyle === customer.requestedStyle) satisfaction += 10;
    if (Math.abs(lengthPercent - customer.targetLengthPercent) <= 15) satisfaction += 10;

    satisfaction = Math.min(100, satisfaction);
    soundManager.playCheer();
    sim.finishSalonCustomer(selectedCustIdx, satisfaction);

    setLastFeedback(`${customer.dialogueSatisfied} (Độ hài lòng: ${satisfaction}%)`);
    setWashed(false);
    setLengthPercent(100);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-rose-200 border-2 border-rose-400 flex items-center justify-center text-3xl shadow">
            ✂️
          </div>
          <div>
            <h3 className="text-xl font-black text-rose-950">Tiệm Tóc Của Duyên</h3>
            <p className="text-xs text-rose-700 font-semibold">Chăm sóc mái tóc xinh và mang lại nụ cười rạng rỡ</p>
          </div>
        </div>

        {/* Skill Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 border border-amber-300 rounded-2xl text-xs font-bold text-amber-900 shadow-xs">
            <Award className="w-4 h-4 text-amber-600" />
            <span>Kinh nghiệm: {state.salon?.hairSkillExp || 0} EXP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 border border-rose-300 rounded-2xl text-xs font-bold text-rose-900 shadow-xs">
            <Heart className="w-4 h-4 text-rose-600 fill-rose-400" />
            <span>Đã phục vụ: {state.salon?.customersServed || 0} khách</span>
          </div>
        </div>
      </div>

      {/* Customer Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SALON_CUSTOMERS.map((cust, idx) => (
          <button
            key={cust.id}
            onClick={() => {
              soundManager.playStep();
              setSelectedCustIdx(idx);
              setLastFeedback(null);
              setWashed(false);
              setLengthPercent(100);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold text-xs shrink-0 transition ${
              selectedCustIdx === idx
                ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-300'
                : 'bg-white/80 hover:bg-white text-rose-950 border border-rose-200'
            }`}
          >
            <span className="text-base">{cust.avatar}</span>
            <span>{cust.customerName}</span>
          </button>
        ))}
      </div>

      {/* Main Hair Styling Studio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-100/50 border border-amber-200 rounded-3xl p-4">
        {/* Left: Customer Brief & Visual Preview */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="p-3 bg-white/90 border border-rose-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-2xl">{customer.avatar}</span>
              <div>
                <div className="text-xs font-black text-rose-950">{customer.customerName}</div>
                <div className="text-[10px] text-rose-600 font-semibold">Yêu cầu tạo mẫu hôm nay:</div>
              </div>
            </div>
            <p className="text-xs text-amber-900 italic leading-relaxed bg-rose-50/70 p-2 rounded-xl border border-rose-100">
              "{customer.dialogueIntro}"
            </p>

            <div className="grid grid-cols-2 gap-2 mt-2.5 text-[11px] font-semibold text-amber-800">
              <div className="flex items-center gap-1">
                <span>Màu mong muốn:</span>
                <span className="font-bold text-rose-900">{customer.requestedColor.nameVi}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Kiểu tóc:</span>
                <span className="font-bold text-rose-900">
                  {customer.requestedStyle === 'wavy'
                    ? 'Lượn sóng'
                    : customer.requestedStyle === 'curly'
                    ? 'Uốn xoăn'
                    : 'Thẳng mượt'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback banner */}
          {lastFeedback && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs font-bold text-emerald-950 animate-fade-in">
              <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Phản hồi sau khi làm tóc:</span>
              </div>
              <p className="font-normal italic text-emerald-900">{lastFeedback}</p>
            </div>
          )}
        </div>

        {/* Right: Interactive Salon Tools */}
        <div className="space-y-3 bg-white/95 border border-amber-200 rounded-2xl p-4 text-xs">
          {/* Step 1: Wash & Relax */}
          <div>
            <div className="flex justify-between items-center mb-1 font-bold text-amber-900">
              <span>1. Gội đầu thư giãn:</span>
              <span className={washed ? 'text-emerald-600 font-black' : 'text-amber-500'}>
                {washed ? 'Đã gội sạch mát ✨' : 'Chưa gội'}
              </span>
            </div>
            <button
              onClick={handleWash}
              disabled={washed}
              className={`w-full py-1.5 px-3 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
                washed
                  ? 'bg-emerald-100 text-emerald-700 cursor-default'
                  : 'bg-sky-500 hover:bg-sky-600 text-white shadow active:scale-98'
              }`}
            >
              <span>🧼 Gội xả mát lạnh & Mát xa da đầu</span>
            </button>
          </div>

          {/* Step 2: Cut Length */}
          <div>
            <div className="flex justify-between items-center mb-1 font-bold text-amber-900">
              <span>2. Cắt tỉa độ dài:</span>
              <span className="font-mono text-amber-700">{lengthPercent}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={lengthPercent}
              onChange={e => handleSnip(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-amber-600">
              <span>Tỉa ngắn (50%)</span>
              <span>Độ dài gốc (100%)</span>
            </div>
          </div>

          {/* Step 3: Color Palette */}
          <div>
            <div className="font-bold text-amber-900 mb-1.5">3. Nhuộm màu tóc:</div>
            <div className="flex items-center gap-2">
              {SALON_PALETTE_COLORS.map(col => (
                <button
                  key={col.hex}
                  onClick={() => {
                    soundManager.playStep();
                    setSelectedColor(col.hex);
                  }}
                  title={col.nameVi}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selectedColor === col.hex ? 'scale-125 border-rose-600 shadow-md ring-2 ring-rose-300' : 'border-amber-300'
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              ))}
            </div>
          </div>

          {/* Step 4: Styling */}
          <div>
            <div className="font-bold text-amber-900 mb-1.5">4. Tạo kiểu uốn sấy:</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['straight', 'wavy', 'curly'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => {
                    soundManager.playStep();
                    setSelectedStyle(st);
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition ${
                    selectedStyle === st
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                  }`}
                >
                  {st === 'straight' ? 'Thẳng mượt' : st === 'wavy' ? 'Lượn sóng' : 'Uốn xoăn'}
                </button>
              ))}
            </div>
          </div>

          {/* Finish Button */}
          <button
            onClick={handleFinish}
            className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-black text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 mt-2"
          >
            <Scissors className="w-4 h-4" />
            <span>Hoàn thành & Bàn giao (+{customer.baseRewardCoins + customer.tipCoins} xu)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
