import React from 'react';
import { GameState } from '../core/types';
import { SaveSystem } from '../systems/saveSystem';
import { Download, Upload, RefreshCw, X, ShieldCheck, AlertCircle } from 'lucide-react';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: GameState;
  onStateImported: (newState: GameState) => void;
  onResetGame: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  isOpen,
  onClose,
  state,
  onStateImported,
  onResetGame,
}) => {
  const [importText, setImportText] = React.useState('');
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; error?: boolean } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportDownload = () => {
    const jsonStr = SaveSystem.exportSaveJson(state);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duyens-farm-save-day${state.time.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: 'Đã xuất và tải về file lưu trữ thành công!' });
  };

  const handleImportText = () => {
    if (!importText.trim()) {
      setStatusMessage({ text: 'Vui lòng dán chuỗi JSON dữ liệu cần khôi phục.', error: true });
      return;
    }
    const res = SaveSystem.importSaveJson(importText);
    if (res.success && res.state) {
      SaveSystem.saveGame(res.state);
      onStateImported(res.state);
      setStatusMessage({ text: 'Đã khôi phục nông trại thành công!' });
      setTimeout(onClose, 1200);
    } else {
      setStatusMessage({ text: res.error || 'Dữ liệu không hợp lệ. Khu vườn hiện tại được giữ nguyên vẹn.', error: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const content = ev.target?.result as string;
      const res = SaveSystem.importSaveJson(content);
      if (res.success && res.state) {
        SaveSystem.saveGame(res.state);
        onStateImported(res.state);
        setStatusMessage({ text: 'Đã nhập file lưu trữ thành công!' });
        setTimeout(onClose, 1200);
      } else {
        setStatusMessage({ text: res.error || 'File dữ liệu không đúng cấu trúc. Vườn cũ được giữ an toàn.', error: true });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-amber-50 border-2 border-amber-300 shadow-2xl rounded-3xl max-w-lg w-full p-6 text-amber-950 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-amber-200 text-amber-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-amber-950 flex items-center gap-2 mb-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
          <span>Lưu Trữ & Khôi Phục Dữ Liệu</span>
        </h3>

        <p className="text-xs text-amber-800 mb-4 leading-relaxed">
          Tiến trình chơi của bạn được tự động lưu vào trình duyệt (localStorage) trên trang này. Bạn có thể xuất file sao lưu để chuyển sang máy tính khác mà không sợ mất vườn!
        </p>

        {statusMessage && (
          <div
            className={`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMessage.error ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {statusMessage.error ? <AlertCircle className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Export File Button */}
          <button
            onClick={handleExportDownload}
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Tải về file lưu trữ (.json)</span>
          </button>

          {/* Import via File */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
          >
            <Upload className="w-4 h-4" />
            <span>Chọn file .json từ máy tính</span>
          </button>

          {/* Or Paste JSON Text */}
          <div className="mt-2">
            <label className="text-[11px] font-bold text-amber-800 block mb-1">
              Hoặc dán nội dung JSON trực tiếp:
            </label>
            <textarea
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder='Dán nội dung {"version":1, ...} vào đây...'
              rows={3}
              className="w-full p-2.5 text-xs bg-white border border-amber-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleImportText}
              className="mt-1.5 w-full py-2 px-3 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors"
            >
              Khôi phục từ chuỗi dán
            </button>
          </div>

          <div className="border-t border-amber-200 mt-2 pt-3 flex justify-between items-center">
            <span className="text-[11px] text-amber-700">Khởi động lại từ đầu?</span>
            <button
              onClick={() => {
                if (window.confirm('Duyên có chắc chắn muốn làm mới nông trại về trạng thái ban đầu không?')) {
                  onResetGame();
                  onClose();
                }
              }}
              className="py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Chơi lại từ đầu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
