import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { SEASONS_DATA } from '../../content/seasons';
import { Calendar, Sun, CloudRain, CloudFog, CloudLightning, Snowflake, Sparkles, Award } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface SeasonsModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const SeasonsModal: React.FC<SeasonsModalProps> = ({ sim, state, onClose, onRefresh }) => {
  const [festivalCelebrated, setFestivalCelebrated] = React.useState(false);

  const cal = state.calendar || { year: 1, season: 'spring', dayOfSeason: 1, totalDays: 1 };
  const seasonInfo = SEASONS_DATA[cal.season];
  const isFestivalToday = cal.dayOfSeason === seasonInfo.festivalDay;

  const handleCelebrateFestival = () => {
    soundManager.playCheer();
    state.coins += 50;
    state.khim.relationshipMeter = Math.min(100, state.khim.relationshipMeter + 20);
    setFestivalCelebrated(true);
    onRefresh();
  };

  const weatherIcons: Record<string, { label: string; icon: React.ReactNode }> = {
    sunny: { label: 'Nắng ấm trong veo', icon: <Sun className="w-5 h-5 text-amber-500 fill-amber-300" /> },
    rainy: { label: 'Mưa mát lành (Tự động tưới rau)', icon: <CloudRain className="w-5 h-5 text-sky-500" /> },
    foggy: { label: 'Sương mù bảng lảng', icon: <CloudFog className="w-5 h-5 text-slate-400" /> },
    stormy: { label: 'Giông bão sấm chớp', icon: <CloudLightning className="w-5 h-5 text-indigo-500" /> },
    snowy: { label: 'Tuyết rơi lất phất', icon: <Snowflake className="w-5 h-5 text-cyan-400" /> },
  };

  const weather = weatherIcons[state.weather?.current || 'sunny'];

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          {seasonInfo.iconEmoji}
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">
            Lịch Mùa & Thời Tiết: {seasonInfo.nameVi}
          </h3>
          <p className="text-xs text-amber-700 font-semibold">
            Năm {cal.year} • Ngày {cal.dayOfSeason} / 28 trong mùa • Tổng ngày trên đảo: {cal.totalDays}
          </p>
        </div>
      </div>

      {/* Season Overview Card */}
      <div className="p-3.5 bg-amber-100/60 border border-amber-300 rounded-2xl text-xs text-amber-900 leading-relaxed">
        <p className="font-semibold">{seasonInfo.descriptionVi}</p>
        <div className="mt-2 text-[11px] text-amber-700 italic">
          💡 Lưu ý nông trại: Cây trồng cũ không bao giờ bị héo chết khi chuyển mùa. Duyên có thể an tâm chăm sóc mọi lúc!
        </div>
      </div>

      {/* Weather Info */}
      <div className="p-3.5 bg-white border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          {weather.icon}
          <div>
            <div className="text-xs font-black text-amber-950">Thời tiết hôm nay:</div>
            <div className="text-xs text-sky-800 font-bold">{weather.label}</div>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
          {state.weather?.isRaining ? '🌧️ Đất ẩm tự nhiên' : '☀️ Cần tưới nước'}
        </span>
      </div>

      {/* Seasonal Festival Card */}
      <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎪</span>
            <h4 className="font-black text-sm text-rose-950">{seasonInfo.festivalNameVi}</h4>
          </div>
          <span className="text-xs font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
            Ngày {seasonInfo.festivalDay} hàng năm
          </span>
        </div>

        <p className="text-xs text-rose-900 leading-relaxed">{seasonInfo.festivalDescriptionVi}</p>

        {isFestivalToday ? (
          <div className="pt-2">
            {festivalCelebrated ? (
              <div className="p-2.5 bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl text-center">
                🎉 Đã cùng dân làng và gia đình chung vui lễ hội hôm nay! (+50 xu, +20 điểm gắn kết)
              </div>
            ) : (
              <button
                onClick={handleCelebrateFestival}
                className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Tham gia Ngày Hội Ngay Hôm Nay! (+50 xu & quà kỷ niệm)</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-rose-700 italic pt-1">
            Còn {seasonInfo.festivalDay > cal.dayOfSeason ? seasonInfo.festivalDay - cal.dayOfSeason : 28 - cal.dayOfSeason + seasonInfo.festivalDay} ngày nữa sẽ đến lễ hội!
          </div>
        )}
      </div>
    </div>
  );
};
