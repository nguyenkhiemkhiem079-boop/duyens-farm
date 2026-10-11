import React from 'react';
import { GameSimulation } from './systems/GameSimulation';
import { FarmScene } from './world/FarmScene';
import { GameState, ToolType, GameNotification } from './core/types';
import { PlacedBuildingType } from './core/buildings';
import { HUD } from './ui/HUD';
import { Toolbar } from './ui/Toolbar';
import { DialogModal, DialogModalType } from './ui/DialogModal';
import { TutorialModal } from './ui/TutorialModal';
import { SaveModal } from './ui/SaveModal';
import { BlueprintDrawer } from './ui/BlueprintDrawer';
import { NotificationToast } from './ui/NotificationToast';
import { SaveSystem, createInitialGameState } from './systems/saveSystem';
import { soundManager } from './core/audio';

export default function App() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const sceneRef = React.useRef<FarmScene | null>(null);
  const simRef = React.useRef<GameSimulation | null>(null);

  // React State for UI
  const [gameState, setGameState] = React.useState<GameState>(() => {
    const loaded = SaveSystem.loadGame();
    return loaded;
  });

  const [selectedTool, setSelectedTool] = React.useState<ToolType>('hand');
  const [activeDialog, setActiveDialog] = React.useState<DialogModalType>(null);
  const [dialogExtra, setDialogExtra] = React.useState<unknown>(null);
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [notifications, setNotifications] = React.useState<GameNotification[]>([]);

  // Blueprint Mode State
  const [isBlueprintActive, setIsBlueprintActive] = React.useState(false);
  const [blueprintBuilding, setBlueprintBuilding] = React.useState<PlacedBuildingType | null>('windmill');
  const [blueprintRotation, setBlueprintRotation] = React.useState<0 | 90 | 180 | 270>(0);

  // Initialize Simulation & Three.js Scene
  React.useEffect(() => {
    if (!containerRef.current) return;

    const simulation = new GameSimulation(gameState);
    simRef.current = simulation;

    // Simulation callbacks
    simulation.setCallbacks(
      (updatedState) => {
        setGameState({ ...updatedState });
        sceneRef.current?.syncCrops();
        sceneRef.current?.syncCustomBuildings();
      },
      (notif) => {
        setNotifications((prev) => [...prev, notif]);
        // Auto-dismiss notification after 4.5s
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        }, 4500);
      }
    );

    // Initialize 3D FarmScene
    const scene = new FarmScene(containerRef.current, simulation);
    sceneRef.current = scene;

    // Dialog trigger callback from 3D clicks
    scene.onOpenDialog = (type: string, extra?: unknown) => {
      setActiveDialog(type as DialogModalType);
      setDialogExtra(extra);
      simulation.state.time.isPaused = true;
    };

    // First visit tutorial check
    if (!simulation.state.firstVisitDone) {
      setIsTutorialOpen(true);
      simulation.state.firstVisitDone = true;
      SaveSystem.saveGame(simulation.state);
    }

    return () => {
      scene.dispose();
      sceneRef.current = null;
      simRef.current = null;
    };
  }, []);

  // Sync selected tool to 3D scene
  const handleSelectTool = (tool: ToolType) => {
    setSelectedTool(tool);
    if (sceneRef.current) {
      sceneRef.current.selectedTool = tool;
    }
  };

  // Helper to open a modal and pause time safely
  const openModal = (type: DialogModalType, extra?: unknown) => {
    setActiveDialog(type);
    setDialogExtra(extra);
    if (simRef.current) {
      simRef.current.state.time.isPaused = true;
    }
  };

  // Dialog Close Handler
  const handleCloseDialog = () => {
    setActiveDialog(null);
    setDialogExtra(null);
    if (simRef.current && !isPaused) {
      simRef.current.state.time.isPaused = false;
    }
  };

  // Pause toggle
  const handleTogglePause = () => {
    if (!simRef.current) return;
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    simRef.current.state.time.isPaused = nextPaused;
  };

  // Blueprint Controls
  const handleToggleBlueprint = () => {
    const nextVal = !isBlueprintActive;
    setIsBlueprintActive(nextVal);
    if (sceneRef.current) {
      sceneRef.current.setBlueprintMode(nextVal, nextVal ? blueprintBuilding : null);
    }
  };

  const handleSelectBlueprintBuilding = (type: PlacedBuildingType) => {
    setBlueprintBuilding(type);
    if (sceneRef.current) {
      sceneRef.current.setBlueprintMode(true, type);
    }
  };

  const handleRotateBlueprint = () => {
    const nextRot = ((blueprintRotation + 90) % 360) as 0 | 90 | 180 | 270;
    setBlueprintRotation(nextRot);
    if (sceneRef.current) {
      sceneRef.current.blueprintRotation = nextRot;
      sceneRef.current.setBlueprintMode(true, blueprintBuilding);
    }
  };

  const handleDemolishBuilding = (instanceId: string) => {
    if (simRef.current) {
      simRef.current.demolishStructure(instanceId);
      sceneRef.current?.syncCustomBuildings();
      setGameState({ ...simRef.current.state });
    }
  };

  // State imported from JSON
  const handleStateImported = (newState: GameState) => {
    setGameState(newState);
    if (simRef.current) {
      simRef.current.state = newState;
      simRef.current.grid.recomputeOccupancy(newState.placedBuildings);
    }
    if (sceneRef.current) {
      sceneRef.current.syncCrops();
      sceneRef.current?.syncCustomBuildings();
    }
  };

  // Reset Game
  const handleResetGame = () => {
    SaveSystem.clearSave();
    const fresh = createInitialGameState();
    setGameState(fresh);
    if (simRef.current) {
      simRef.current.state = fresh;
      simRef.current.grid.recomputeOccupancy(fresh.placedBuildings);
    }
    if (sceneRef.current) {
      sceneRef.current.syncCrops();
      sceneRef.current?.syncCustomBuildings();
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-sky-200 select-none">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full cursor-pointer touch-none"
      />

      {/* Top HUD */}
      <HUD
        state={gameState}
        onOpenTutorial={() => {
          setIsTutorialOpen(true);
          if (simRef.current) simRef.current.state.time.isPaused = true;
        }}
        onOpenSaveModal={() => {
          setIsSaveModalOpen(true);
          if (simRef.current) simRef.current.state.time.isPaused = true;
        }}
        onTogglePause={handleTogglePause}
        isPaused={isPaused}
        onOpenBlueprint={handleToggleBlueprint}
        isBlueprintActive={isBlueprintActive}
        onOpenOrders={() => openModal('orders')}
        onOpenDreamHome={() => openModal('dream_home')}
        onOpenChapters={() => openModal('chapters')}
        onOpenCatMystery={() => openModal('cat_mystery')}
        onOpenExploration={() => openModal('exploration')}
        onOpenSalon={() => openModal('salon')}
        onOpenMailbox={() => openModal('mailbox')}
        onOpenJournal={() => openModal('journal')}
        onOpenSeasons={() => openModal('seasons')}
        onOpenSettings={() => openModal('settings')}
        onRepairStorm={() => {
          simRef.current?.repairStorm();
          if (simRef.current) setGameState({ ...simRef.current.state });
        }}
        onCatchMon={() => {
          simRef.current?.catchMon();
          if (simRef.current) setGameState({ ...simRef.current.state });
        }}
      />

      {/* Floating Notifications */}
      <NotificationToast
        notifications={notifications}
        onDismiss={(id) => setNotifications((prev) => prev.filter((n) => n.id !== id))}
      />

      {/* Bottom Toolbar & Bag */}
      <Toolbar
        selectedTool={selectedTool}
        onSelectTool={handleSelectTool}
        state={gameState}
        onOpenInventory={() => openModal('inventory')}
        isBlueprintActive={isBlueprintActive}
        onToggleBlueprint={handleToggleBlueprint}
      />

      {/* Blueprint Construction Drawer */}
      <BlueprintDrawer
        isOpen={isBlueprintActive}
        selectedBuilding={blueprintBuilding}
        onSelectBuilding={handleSelectBlueprintBuilding}
        rotation={blueprintRotation}
        onRotate={handleRotateBlueprint}
        onClose={handleToggleBlueprint}
        state={gameState}
        onDemolish={handleDemolishBuilding}
      />

      {/* Interactive Modals */}
      <DialogModal
        type={activeDialog}
        extra={dialogExtra}
        isOpen={activeDialog !== null}
        onClose={handleCloseDialog}
        sim={simRef.current!}
        state={gameState}
        onRefresh={() => {
          if (simRef.current) {
            setGameState({ ...simRef.current.state });
          }
        }}
        onOpenSaveModal={() => {
          setIsSaveModalOpen(true);
          if (simRef.current) simRef.current.state.time.isPaused = true;
        }}
      />

      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => {
          setIsTutorialOpen(false);
          if (simRef.current && !isPaused && !activeDialog) {
            simRef.current.state.time.isPaused = false;
          }
        }}
      />

      <SaveModal
        isOpen={isSaveModalOpen}
        onClose={() => {
          setIsSaveModalOpen(false);
          if (simRef.current && !isPaused && !activeDialog) {
            simRef.current.state.time.isPaused = false;
          }
        }}
        state={gameState}
        onStateImported={handleStateImported}
        onResetGame={handleResetGame}
      />

      {/* Subtle Pause Indicator */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-30">
          <div className="bg-white/90 border-2 border-amber-300 rounded-3xl px-8 py-5 shadow-2xl flex flex-col items-center gap-2">
            <span className="text-3xl">⏸️</span>
            <h2 className="text-xl font-black text-amber-950">Đang Tạm Dừng</h2>
            <p className="text-xs text-amber-800 font-semibold">Nhấp vào nút tiếp tục ở góc trên để chơi tiếp</p>
          </div>
        </div>
      )}
    </main>
  );
}
