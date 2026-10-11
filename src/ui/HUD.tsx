import React from 'react';
import { GameState } from '../core/types';
import { DAY_DURATION_SECONDS } from '../core/constants';
import { soundManager } from '../core/audio';
import { SEASONS_DATA } from '../content/seasons';
import {
  Volume2,
  VolumeX,
  HelpCircle,
  Save,
  Pause,
  Play,
  Coins,
  Zap,
  Sun,
  Moon,
  Calendar,
  Compass,
  Scissors,
  Mail,
  BookOpen,
  Home,
  Package,
  Search,
  Settings,
  Sparkles,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

interface HUDProps {
  state: GameState;
  onOpenTutorial: () => void;
  onOpenSaveModal: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
  onOpenBlueprint: () => void;
  isBlueprintActive: boolean;
  onOpenOrders: () => void;
  onOpenDreamHome: () => void;
  onOpenChapters: () => void;
  onOpenCatMystery: () => void;
  onOpenExploration: () => void;
  onOpenSalon: () => void;
  onOpenMailbox: () => void;
  onOpenJournal: () => void;
  onOpenSeasons: () => void;
  onOpenSettings: () => void;
  onRepairStorm: () => void;
  onCatchMon: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  state,
  onOpenTutorial,
  onOpenSaveModal,
  onTogglePause,
  isPaused,
  onOpenBlueprint,
  isBlueprintActive,
  onOpenOrders,
  onOpenDreamHome,
  onOpenChapters,
  onOpenCatMystery,
  onOpenExploration,
  onOpenSalon,
  onOpenMailbox,
  onOpenJournal,
  onOpenSeasons,
  onOpenSettings,
  onRepairStorm,
  onCatchMon,
}) => {
  const [muted, setMuted] = React.useState(!soundManager.enabled);

  const toggleSound = () => {
    soundManager.enabled = !soundManager.enabled;
    setMuted(!soundManager.enabled);
  };

  // Convert timeOfDay (0..360) to 24-hour clock starting at 6:00 to 24:00 (18 hours)
  const totalMinutes = Math.floor((state.time.timeOfDay / DAY_DURATION_SECONDS) * 18 * 60);
  const hour = Math.floor(6 + totalMinutes / 60);
  const minute = Math.floor(totalMinutes % 60);
  const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  const isNight = hour >= 19 || hour < 6;

  const energyPercent = Math.max(0, Math.min(100, (state.energy / state.maxEnergy) * 100));
  const seasonInfo = SEASONS_DATA[state.calendar?.season || 'spring'];

  const pendingOrdersCount = (state.deliveryOrders || []).filter(o => !o.isFulfilled).length;
  const unreadMailCount = Object.values(state.mail || {}).filter(m => !m.isRead).length;

  return (
    <header className="absolute top-3 inset-x-3 flex flex-col sm:flex-row justify-between items-start gap-2 pointer-events-none select-none z-20">
      {/* Left Column: Status Indicators */}
      <div className="flex flex-col gap-1.5 pointer-events-auto">
        {/* Clock, Day & Season Pill (Click to open Calendar/Seasons) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playStep();
              onOpenSeasons();
            }}
            title="Nhấp để xem Lịch Mùa & Lễ Hội"
            className="bg-amber-100/95 backdrop-blur-md border border-amber-300 shadow-md rounded-2xl px-3.5 py-1.5 flex items-center gap-2.5 hover:bg-amber-200/90 transition active:scale-98"
          >
            <div className="flex items-center gap-1.5 font-black text-amber-950 text-xs sm:text-sm">
              {isNight ? (
                <Moon className="w-4 h-4 text-indigo-500 fill-indigo-200" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 fill-amber-300 animate-spin-slow" />
              )}
              <span>Ngày {state.time.day}</span>
              <span className="text-amber-400">•</span>
              <span className="tabular-nums font-mono text-amber-800">{timeStr}</span>
            </div>

            <div className="h-3.5 w-px bg-amber-300/80" />

            <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
              <span>{seasonInfo.iconEmoji}</span>
              <span className="hidden sm:inline">{seasonInfo.nameVi}</span>
            </div>

            <div className="h-3.5 w-px bg-amber-300/80" />

            {/* Coins */}
            <div className="flex items-center gap-1 font-extrabold text-amber-800 text-xs sm:text-sm">
              <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>{state.coins}</span>
              <span className="text-[10px] text-amber-700 font-semibold">xu</span>
            </div>
          </button>
        </div>

        {/* Energy Bar */}
        <div className="bg-white/90 backdrop-blur-md border border-emerald-200 shadow-md rounded-2xl px-3 py-1.5 w-48 sm:w-56 flex flex-col gap-0.5">
          <div className="flex justify-between items-center text-[11px] font-bold text-emerald-900">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
              <span>Năng lượng</span>
            </div>
            <span className="tabular-nums text-[10px]">
              {Math.round(state.energy)} / {state.maxEnergy}
            </span>
          </div>
          <div className="w-full bg-emerald-100 rounded-full h-2 overflow-hidden border border-emerald-200">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                energyPercent > 30
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                  : 'bg-gradient-to-r from-amber-400 to-rose-400'
              }`}
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>

        {/* Storm Damage Alert Pill */}
        {state.stormDamage?.damagedFence && (
          <button
            onClick={onRepairStorm}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition animate-pulse"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Hàng rào hỏng do giông bão - Sửa chữa</span>
          </button>
        )}

        {/* Mon Stolen Alert Pill */}
        {state.monTheft?.hasStolen && (
          <button
            onClick={onCatchMon}
            className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Mon đang giấu: {state.monTheft.item?.name} - Bắt lại</span>
          </button>
        )}
      </div>

      {/* Right Column: Navigation Quick Buttons Bar */}
      <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto justify-end">
        {/* Khim Blueprint Mode */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenBlueprint();
          }}
          title="Chế độ Bản Vẽ Thi Công (Khim BIM)"
          className={`px-2.5 py-1.5 rounded-xl font-bold text-xs shadow-md border flex items-center gap-1 transition active:scale-95 ${
            isBlueprintActive
              ? 'bg-amber-400 text-amber-950 border-amber-500 ring-2 ring-amber-300'
              : 'bg-white/90 hover:bg-amber-100 text-amber-900 border-amber-200'
          }`}
        >
          <span>📐</span>
          <span className="hidden md:inline">Bản Vẽ</span>
        </button>

        {/* Delivery Orders */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenOrders();
          }}
          title="Bảng Đơn Hàng Giao Nông Sản"
          className="relative px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>📜</span>
          <span className="hidden md:inline">Đơn Hàng</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center -ml-0.5">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Dream Home */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenDreamHome();
          }}
          title="Ngôi Nhà Mơ Ước (Khim & Duyên)"
          className="px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>🏡</span>
          <span className="hidden md:inline">Tổ Ấm ({state.dreamHome?.stage || 0}/5)</span>
        </button>

        {/* Chapters & Story */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenChapters();
          }}
          title="Chương Hồi Kỷ Niệm & Nhiệm Vụ"
          className="px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>📖</span>
          <span className="hidden md:inline">Chương</span>
        </button>

        {/* Cat Mystery */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenCatMystery();
          }}
          title="Vụ Án: Mèo Mon Ăn Vụng Chiếc Bánh Mì"
          className="px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>🔍</span>
          <span className="hidden lg:inline">Vụ Án Mon</span>
        </button>

        {/* Exploration */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenExploration();
          }}
          title="Khám Phá Ngoại Ô (Rừng, Hồ, Đồi Hoa, Hang Đá)"
          className="px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>🌲</span>
          <span className="hidden lg:inline">Khám Phá</span>
        </button>

        {/* Salon */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenSalon();
          }}
          title="Tiệm Tóc Của Duyên"
          className="px-2.5 py-1.5 bg-white/90 hover:bg-rose-100 text-rose-950 rounded-xl font-bold text-xs shadow-md border border-rose-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>✂️</span>
          <span className="hidden md:inline">Tiệm Tóc</span>
        </button>

        {/* Mailbox */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenMailbox();
          }}
          title="Hộp Thư Đầu Cổng"
          className="relative px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>📮</span>
          <span className="hidden md:inline">Thư</span>
          {unreadMailCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center -ml-0.5">
              {unreadMailCount}
            </span>
          )}
        </button>

        {/* Memory Journal */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenJournal();
          }}
          title="Cuốn Sổ Tay Kỷ Niệm"
          className="px-2.5 py-1.5 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl font-bold text-xs shadow-md border border-amber-200 flex items-center gap-1 transition active:scale-95"
        >
          <span>📔</span>
          <span className="hidden md:inline">Nhật Ký</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-amber-300/80 mx-0.5" />

        {/* Settings & Accessibility */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenSettings();
          }}
          title="Cài Đặt & Trợ Năng"
          className="p-2 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl shadow-md border border-amber-200 transition active:scale-95"
        >
          <Settings className="w-4 h-4 text-amber-800" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="p-2 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl shadow-md border border-amber-200 transition active:scale-95"
        >
          {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
        </button>

        {/* Pause toggle */}
        <button
          onClick={onTogglePause}
          title={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          className="p-2 bg-white/90 hover:bg-amber-100 text-amber-900 rounded-xl shadow-md border border-amber-200 transition active:scale-95"
        >
          {isPaused ? <Play className="w-4 h-4 text-amber-600 fill-amber-400" /> : <Pause className="w-4 h-4 text-amber-800" />}
        </button>

        {/* Save Modal */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenSaveModal();
          }}
          title="Sao Lưu Dữ Liệu"
          className="p-2 bg-white/90 hover:bg-amber-100 text-sky-700 rounded-xl shadow-md border border-amber-200 transition active:scale-95"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Tutorial */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenTutorial();
          }}
          title="Hướng Dẫn Chơi"
          className="p-2 bg-white/90 hover:bg-amber-100 text-amber-700 rounded-xl shadow-md border border-amber-200 transition active:scale-95"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
