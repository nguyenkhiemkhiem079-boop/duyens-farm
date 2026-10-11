import React from 'react';
import { GameState } from '../../core/types';
import { soundManager } from '../../core/audio';
import { SaveSystem } from '../../systems/saveSystem';
import { Volume2, VolumeX, Music, Eye, ShieldCheck, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
  onOpenSaveModal: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  onClose,
  onRefresh,
  onOpenSaveModal,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(soundManager.enabled);
  const [sfxVol, setSfxVol] = React.useState(soundManager.sfxVolume);
  const [musicVol, setMusicVol] = React.useState(soundManager.musicVolume);
  const [isMusicPlaying, setIsMusicPlaying] = React.useState(soundManager.isMusicPlaying);
  const [reducedMotion, setReducedMotion] = React.useState(state.settings?.reducedMotion || false);

  const handleToggleSound = () => {
    soundManager.enabled = !soundManager.enabled;
    setSoundEnabled(soundManager.enabled);
    if (state.settings) state.settings.soundEnabled = soundManager.enabled;
    onRefresh();
  };

  const handleSfxChange = (val: number) => {
    soundManager.setSfxVolume(val);
    setSfxVol(val);
    if (state.settings) state.settings.sfxVolume = val;
    soundManager.playStep();
    onRefresh();
  };

  const handleMusicChange = (val: number) => {
    soundManager.setMusicVolume(val);
    setMusicVol(val);
    if (state.settings) state.settings.musicVolume = val;
    onRefresh();
  };

  const handleToggleMusic = () => {
    soundManager.toggleMusic();
    setIsMusicPlaying(soundManager.isMusicPlaying);
  };

  const handleToggleReducedMotion = () => {
    const nextVal = !reducedMotion;
    setReducedMotion(nextVal);
    if (!state.settings) {
      state.settings = {
        soundEnabled: true,
        sfxVolume: 0.8,
        musicVolume: 0.7,
        reducedMotion: false,
      };
    }
    state.settings.reducedMotion = nextVal;
    SaveSystem.saveGame(state);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          ⚙️
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Cài Đặt & Trợ Năng</h3>
          <p className="text-xs text-amber-700 font-semibold">Tùy chỉnh âm thanh, thị giác và trải nghiệm dễ chịu nhất cho Duyên</p>
        </div>
      </div>

      {/* Audio Settings Card */}
      <div className="p-4 bg-white border border-amber-200 rounded-2xl space-y-3.5 shadow-xs text-xs">
        <div className="font-bold text-amber-900 border-b border-amber-100 pb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>Âm Thanh & Nhạc Nền Web Audio</span>
          </span>
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1 rounded-xl font-bold text-xs transition ${
              soundEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {soundEnabled ? 'Đang Bật' : 'Đang Tắt'}
          </button>
        </div>

        {/* SFX Volume */}
        <div>
          <div className="flex justify-between items-center mb-1 text-amber-900 font-semibold">
            <span>Âm lượng hiệu ứng (Bước chân, gieo hạt, thu hoạch, meo meo):</span>
            <span className="font-mono font-bold">{Math.round(sfxVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={sfxVol}
            onChange={e => handleSfxChange(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Music Volume */}
        <div>
          <div className="flex justify-between items-center mb-1 text-amber-900 font-semibold">
            <span>Âm lượng nhạc nền Ambient Lofi:</span>
            <span className="font-mono font-bold">{Math.round(musicVol * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={musicVol}
            onChange={e => handleMusicChange(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Ambient music toggle button */}
        <div className="pt-1 flex items-center justify-between">
          <span className="text-amber-800 font-semibold flex items-center gap-1.5">
            <Music className="w-4 h-4 text-sky-600" />
            <span>Bật giai điệu thư giãn nhẹ nhàng:</span>
          </span>
          <button
            onClick={handleToggleMusic}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 ${
              isMusicPlaying ? 'bg-sky-500 text-white' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
          >
            {isMusicPlaying ? 'Đang phát nhạc 🎶' : 'Bật nhạc 🎵'}
          </button>
        </div>
      </div>

      {/* Visual Accessibility Card */}
      <div className="p-4 bg-white border border-amber-200 rounded-2xl space-y-2.5 shadow-xs text-xs">
        <div className="font-bold text-amber-900 border-b border-amber-100 pb-1.5 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-sky-600" />
          <span>Hỗ Trợ Thị Giác & Trợ Năng</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <div className="font-bold text-amber-950">Chế độ giảm chuyển động (Reduced Motion):</div>
            <div className="text-[11px] text-amber-700">Tắt hiệu ứng hạt mưa và tuyết rơi nhanh để êm mắt hơn</div>
          </div>
          <button
            onClick={handleToggleReducedMotion}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
              reducedMotion ? 'bg-amber-400 text-amber-950 shadow-xs' : 'bg-stone-100 text-stone-600'
            }`}
          >
            {reducedMotion ? 'Đã Bật' : 'Đang Tắt'}
          </button>
        </div>
      </div>

      {/* Data Management Link */}
      <div className="p-3 bg-amber-100/60 border border-amber-300 rounded-2xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-amber-950">Quản lý sao lưu dữ liệu & Xuất/Nhập file:</span>
        </div>
        <button
          onClick={() => {
            onClose();
            onOpenSaveModal();
          }}
          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow active:scale-95 transition"
        >
          Mở Quản Lý Dữ Liệu
        </button>
      </div>
    </div>
  );
};
