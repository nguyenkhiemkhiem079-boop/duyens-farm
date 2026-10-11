import React from 'react';
import { ToolType, GameState } from '../core/types';
import { Droplets, Package } from 'lucide-react';
import { soundManager } from '../core/audio';

interface ToolbarProps {
  selectedTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  state: GameState;
  onOpenInventory: () => void;
  isBlueprintActive?: boolean;
  onToggleBlueprint?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onSelectTool,
  state,
  onOpenInventory,
  isBlueprintActive,
  onToggleBlueprint,
}) => {
  const tools: Array<{ id: ToolType; label: string; icon: string | React.ReactNode; shortcut: string }> = [
    { id: 'hand', label: 'Bàn tay', icon: '✋', shortcut: '1' },
    {
      id: 'water_can',
      label: 'Bình tưới',
      icon: <Droplets className="w-5 h-5 text-sky-500 fill-sky-300" />,
      shortcut: '2',
    },
    { id: 'seed_carrot', label: 'Cà rốt', icon: '🥕', shortcut: '3' },
    { id: 'seed_wheat', label: 'Lúa mì', icon: '🌾', shortcut: '4' },
    { id: 'seed_tomato', label: 'Cà chua', icon: '🍅', shortcut: '5' },
  ];

  // Keyboard shortcut listener for tools (1..5 and B)
  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === '1') {
        soundManager.playStep();
        onSelectTool('hand');
      }
      if (e.key === '2') {
        soundManager.playStep();
        onSelectTool('water_can');
      }
      if (e.key === '3') {
        soundManager.playStep();
        onSelectTool('seed_carrot');
      }
      if (e.key === '4') {
        soundManager.playStep();
        onSelectTool('seed_wheat');
      }
      if (e.key === '5') {
        soundManager.playStep();
        onSelectTool('seed_tomato');
      }
      if (e.key.toLowerCase() === 'b' && onToggleBlueprint) {
        soundManager.playStep();
        onToggleBlueprint();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onSelectTool, onToggleBlueprint]);

  // Total items in bag
  const cropCount = Object.values(state.inventory)
    .filter(i => (i.type === 'crop' || i.type === 'product') && i.count > 0)
    .reduce((sum, item) => sum + item.count, 0);

  // If blueprint drawer is active, hide bottom toolbar to keep screen clean
  if (isBlueprintActive) return null;

  return (
    <div className="absolute bottom-4 inset-x-0 flex justify-center items-center pointer-events-none z-20 px-3">
      <div className="bg-amber-100/90 backdrop-blur-md p-1.5 sm:p-2 rounded-3xl border border-amber-300 shadow-xl flex items-center gap-1.5 sm:gap-2.5 pointer-events-auto">
        {tools.map(tool => {
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => {
                soundManager.playStep();
                onSelectTool(tool.id);
              }}
              className={`relative flex flex-col items-center justify-center w-12 h-14 sm:w-16 sm:h-16 rounded-2xl font-bold transition-all duration-200 ${
                isSelected
                  ? 'bg-amber-500 text-white shadow-lg ring-4 ring-amber-300 -translate-y-1 scale-105'
                  : 'bg-white/80 text-amber-900 hover:bg-white/95 hover:scale-102'
              }`}
            >
              <div className="text-xl sm:text-2xl mb-0.5">{tool.icon}</div>
              <span className="text-[10px] sm:text-xs tracking-tight truncate max-w-full px-1">
                {tool.label}
              </span>
              <span
                className={`absolute top-1 right-1.5 text-[9px] font-mono rounded px-1 ${
                  isSelected ? 'bg-amber-700/60 text-white' : 'bg-amber-200/60 text-amber-800'
                }`}
              >
                {tool.shortcut}
              </span>
            </button>
          );
        })}

        <div className="h-10 w-px bg-amber-300/80 mx-1" />

        {/* Blueprint Toggle Button */}
        {onToggleBlueprint && (
          <button
            onClick={() => {
              soundManager.playStep();
              onToggleBlueprint();
            }}
            className="relative flex flex-col items-center justify-center w-12 h-14 sm:w-16 sm:h-16 rounded-2xl font-bold bg-amber-400 text-amber-950 hover:bg-amber-500 transition-all shadow-md active:scale-95"
            title="Bản vẽ thi công (Phím B)"
          >
            <span className="text-xl sm:text-2xl mb-0.5">📐</span>
            <span className="text-[10px] sm:text-xs">Bản vẽ</span>
            <span className="absolute top-1 right-1.5 text-[9px] font-mono rounded px-1 bg-amber-600/40 text-amber-950">
              B
            </span>
          </button>
        )}

        {/* Inventory bag trigger */}
        <button
          onClick={() => {
            soundManager.playStep();
            onOpenInventory();
          }}
          className="relative flex flex-col items-center justify-center w-12 h-14 sm:w-16 sm:h-16 rounded-2xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95"
          title="Túi nông sản"
        >
          <Package className="w-5 h-5 sm:w-6 sm:h-6 mb-0.5" />
          <span className="text-[10px] sm:text-xs">Giỏ đồ</span>
          {cropCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
              {cropCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
