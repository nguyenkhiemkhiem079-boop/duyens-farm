import { GAME_FICTION_LABEL } from '../content/gameContent';
import React from 'react';
import { GameState, InventoryItem } from '../core/types';
import { GameSimulation } from '../systems/GameSimulation';
import { Heart, Coins, Moon, X, Gift, Sparkles, MessageCircle, HelpCircle, Wrench } from 'lucide-react';
import { CAT_DIALOGUES, GAME_LORE_PLACEHOLDERS } from '../content/gameContent';
import { PlacedBuildingInstance } from '../core/buildings';

// Sub-modals
import { MailboxModal } from './modals/MailboxModal';
import { SalonModal } from './modals/SalonModal';
import { VillagerModal } from './modals/VillagerModal';
import { ProductionModal } from './modals/ProductionModal';
import { OrdersModal } from './modals/OrdersModal';
import { ChaptersModal } from './modals/ChaptersModal';
import { DreamHomeModal } from './modals/DreamHomeModal';
import { CatMysteryModal } from './modals/CatMysteryModal';
import { ExplorationModal } from './modals/ExplorationModal';
import { SeasonsModal } from './modals/SeasonsModal';
import { JournalModal } from './modals/JournalModal';
import { SettingsModal } from './modals/SettingsModal';
import { soundManager } from '../core/audio';

export type DialogModalType =
  | 'khim'
  | 'mochi'
  | 'mon'
  | 'house'
  | 'market'
  | 'inventory'
  | 'mailbox'
  | 'salon'
  | 'villager'
  | 'production_machine'
  | 'orders'
  | 'journal'
  | 'chapters'
  | 'dream_home'
  | 'cat_mystery'
  | 'exploration'
  | 'seasons'
  | 'settings'
  | null;

interface DialogModalProps {
  type: DialogModalType;
  extra?: unknown;
  isOpen: boolean;
  onClose: () => void;
  sim: GameSimulation;
  state: GameState;
  onRefresh: () => void;
  onOpenSaveModal?: () => void;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  type,
  extra,
  isOpen,
  onClose,
  sim,
  state,
  onRefresh,
  onOpenSaveModal,
}) => {
  const [khimMessage, setKhimMessage] = React.useState<string | null>(null);
  const [catMessage, setCatMessage] = React.useState<string | null>(null);

  if (!isOpen || !type) return null;

  // Khim dialog
  const handleKhimChat = () => {
    soundManager.playStep();
    const text = sim.chatWithKhim();
    setKhimMessage(text);
    onRefresh();
  };

  const handleKhimGift = (item: InventoryItem) => {
    soundManager.playHeart();
    const reply = sim.giftKhim(item.id);
    setKhimMessage(reply);
    onRefresh();
  };

  // Mochi pet
  const handlePetMochi = () => {
    soundManager.playMeow();
    const reply = sim.petMochi();
    setCatMessage(reply);
    onRefresh();
  };

  // Mon catch
  const handleCatchMon = () => {
    soundManager.playStep();
    const res = sim.catchMon();
    setCatMessage(res.message);
    onRefresh();
  };

  // House sleep
  const handleSleep = () => {
    soundManager.playSleep();
    sim.sleep(false);
    onRefresh();
    onClose();
  };

  // House storm repair
  const handleRepairStorm = () => {
    soundManager.playBuild();
    sim.repairStorm();
    onRefresh();
  };

  // Market sell
  const handleSellAll = () => {
    soundManager.playCoin();
    sim.sellCrops();
    onRefresh();
  };

  const sellableItems = Object.values(state.inventory).filter(
    i => (i.type === 'crop' || i.type === 'product') && i.count > 0
  );

  const isWideModal = [
    'mailbox',
    'salon',
    'chapters',
    'dream_home',
    'orders',
    'exploration',
    'seasons',
    'journal',
    'settings',
  ].includes(type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div
        className={`bg-amber-50 border-2 border-amber-300 shadow-2xl rounded-3xl w-full p-5 sm:p-6 text-amber-950 relative my-auto ${
          isWideModal ? 'max-w-2xl' : 'max-w-md'
        } max-h-[92vh] overflow-y-auto`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-amber-200 text-amber-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {['khim', 'mochi', 'may', 'villager', 'salon', 'dream_home', 'cat_mystery', 'exploration', 'seasons', 'orders'].includes(type || '') && (
          <p className="text-xs text-amber-700 mb-3">{GAME_FICTION_LABEL}</p>
        )}

        {/* 1. KHIM MODAL */}
        {type === 'khim' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-sky-200 border-2 border-sky-400 flex items-center justify-center text-3xl shadow">
                👓
              </div>
              <div>
                <h3 className="text-xl font-black text-sky-950">Anh Khim</h3>
                <p className="text-xs text-sky-700 font-semibold">Kỹ sư BIM & Người luôn yêu thương Duyên</p>
                <div className="flex items-center gap-1.5 mt-1 text-xs font-bold text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500" />
                  <span>Điểm gắn kết: {state.khim.relationshipMeter}/100</span>
                </div>
              </div>
            </div>

            {/* Chat message display */}
            <div className="p-3 bg-white border border-sky-200 rounded-2xl text-xs text-sky-950 min-h-[64px] flex items-center shadow-xs">
              {khimMessage ? (
                <p className="italic font-medium leading-relaxed">"{khimMessage}"</p>
              ) : (
                <p className="italic text-sky-700">"Chào Duyên yêu dấu! Anh đang đo đạc kết cấu giàn leo nè. Duyên cần anh giúp gì không?"</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleKhimChat}
                className="w-full py-2.5 px-4 bg-sky-500 hover:bg-sky-600 active:scale-98 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Trò chuyện cùng Khim {state.khim.chattedToday ? '(Đã trò chuyện)' : '(+5 điểm gắn kết)'}</span>
              </button>

              {/* Gift crops to Khim */}
              <div className="bg-amber-100/70 border border-amber-200 rounded-2xl p-3">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-2">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3.5 h-3.5 text-rose-500" />
                    <span>Tặng nông sản cho Khim (+15 gắn kết):</span>
                  </span>
                  <span className="text-[10px] text-amber-700">
                    {state.khim.giftedToday ? 'Đã tặng hôm nay' : 'Chưa tặng'}
                  </span>
                </div>

                {sellableItems.length === 0 ? (
                  <p className="text-[11px] text-amber-700 italic text-center py-2">
                    Túi đồ của Duyên chưa có nông sản để tặng anh Khim.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                    {sellableItems.map(crop => (
                      <button
                        key={crop.id}
                        onClick={() => handleKhimGift(crop)}
                        disabled={state.khim.giftedToday}
                        className={`flex items-center justify-between p-2 bg-white rounded-xl border text-left text-xs transition ${
                          state.khim.giftedToday
                            ? 'opacity-50 cursor-not-allowed border-amber-100'
                            : 'border-amber-200 hover:bg-amber-50 active:scale-95'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-amber-950 block text-[11px]">{crop.name}</span>
                          <span className="text-[10px] text-amber-600">Còn {crop.count}</span>
                        </div>
                        <span className="text-xs">🎁</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. MOCHI MODAL */}
        {type === 'mochi' && (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
              🐮
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-950">Mèo Mochi</h3>
              <p className="text-xs text-amber-700 mt-0.5 font-semibold">Chú mèo đốm bò sữa hay lẽo đẽo theo chân Duyên</p>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-rose-500">
                <Heart className="w-4 h-4 fill-rose-500" />
                <span>Mức độ yêu thích: {state.cats.mochi.loveMeter}/100</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-amber-200 rounded-2xl text-xs text-amber-900 italic shadow-xs">
              {catMessage ? (
                <p className="font-medium text-amber-950">"{catMessage}"</p>
              ) : (
                <p>"{CAT_DIALOGUES.mochi.petRequest}"</p>
              )}
            </div>

            <button
              onClick={handlePetMochi}
              className="w-full py-2.5 px-4 bg-rose-500 hover:bg-rose-600 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
            >
              <Heart className="w-4 h-4" />
              <span>Xoa đầu & Vuốt ve Mochi 💕</span>
            </button>
          </div>
        )}

        {/* 3. MON MODAL */}
        {type === 'mon' && (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
              🐱
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-950">Mèo Mon</h3>
              <p className="text-xs text-amber-700 mt-0.5 font-semibold">Bé mèo tinh nghịch hay tò mò giấu nông sản</p>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
                <span>Điểm thân thiết: {state.cats.mon.loveMeter}/100</span>
              </div>
            </div>

            <div className="p-3 bg-white border border-amber-200 rounded-2xl text-xs text-amber-900 shadow-xs">
              {state.monTheft.hasStolen && state.monTheft.item ? (
                <div className="space-y-1">
                  <p className="font-bold text-rose-600">Mon vừa nghịch ngợm lấy mất: {state.monTheft.item.name}!</p>
                  <p className="italic text-amber-700">Nhấp vào nút bên dưới để bắt lại Mon và lấy lại đồ nhé.</p>
                </div>
              ) : catMessage ? (
                <p className="italic font-medium text-amber-950">"{catMessage}"</p>
              ) : (
                <p className="italic">"Mon đang ngoan ngoãn nằm phơi bụng sưởi nắng bên bờ cỏ xanh."</p>
              )}
            </div>

            {state.monTheft.hasStolen ? (
              <button
                onClick={handleCatchMon}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt kịp Mon và lấy lại đồ! 🐟</span>
              </button>
            ) : (
              <button
                onClick={handleCatchMon}
                className="w-full py-2.5 px-4 bg-orange-400 hover:bg-orange-500 active:scale-98 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
              >
                <span>Chơi đùa cùng Mon 🐾</span>
              </button>
            )}
          </div>
        )}

        {/* 4. HOUSE MODAL (SLEEP & REPAIR) */}
        {type === 'house' && (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
              🏡
            </div>
            <div>
              <h3 className="text-xl font-black text-amber-950">Ngôi Nhà Ấm Cúng</h3>
              <p className="text-xs text-amber-700 mt-1 font-semibold">
                Nơi trú ngụ bình yên sau một ngày làm vườn chăm chỉ của Duyên & Khim.
              </p>
            </div>

            {/* Storm Damage Alert inside House */}
            {state.stormDamage?.damagedFence && (
              <div className="p-3 bg-amber-100 border border-amber-300 rounded-2xl text-left flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-amber-700" />
                    <span>Hàng rào bị lung lay sau cơn giông:</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Cùng Khim đóng lại chốt gỗ (tốn 3 Năng lượng)</div>
                </div>
                <button
                  onClick={handleRepairStorm}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs shadow active:scale-95 transition"
                >
                  Sửa rào (+25 xu)
                </button>
              </div>
            )}

            <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900 leading-relaxed text-left">
              <p className="font-bold text-amber-950 mb-1">Khi đi ngủ:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-amber-800">
                <li>Năng lượng của Duyên sẽ được hồi phục 100%.</li>
                <li>Bước sang ngày mới (Ngày {state.time.day + 1}).</li>
                <li>Cây trồng giữ nguyên tiến độ sinh trưởng và sẵn sàng cho lượt tưới mới.</li>
                {state.monTheft.hasStolen && (
                  <li className="text-emerald-700 font-bold">
                    Mon sẽ ngoan ngoãn đặt lại món đồ bị giấu ở bậc cửa nhà!
                  </li>
                )}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-bold"
              >
                Để lát nữa
              </button>
              <button
                onClick={handleSleep}
                className="flex-1 py-2.5 px-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow"
              >
                <Moon className="w-4 h-4" />
                <span>Đi ngủ ngay 💤</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. MARKET MODAL (SELL CROPS & PRODUCTS) */}
        {type === 'market' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow">
                🏪
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-950">Quầy Nông Sản</h3>
                <p className="text-xs text-amber-700 font-semibold">Thu mua rau củ & thành phẩm chế biến lấy tiền xu</p>
              </div>
            </div>

            <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 text-sm max-h-56 overflow-y-auto">
              {sellableItems.length === 0 ? (
                <div className="text-center py-6 text-amber-700 text-xs italic">
                  Không có nông sản hoặc thành phẩm nào trong giỏ đồ. Hãy thu hoạch rau củ hoặc vận hành xưởng chế biến trước nhé!
                </div>
              ) : (
                <div className="space-y-2">
                  {sellableItems.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-amber-950 block">{item.name}</span>
                        <span className="text-[10px] text-amber-600">Đơn giá: {item.value} xu/món</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-800">x{item.count}</span>
                        <div className="text-[11px] font-black text-emerald-600">
                          = {item.count * item.value} xu
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-amber-200 text-sm font-bold text-amber-950">
              <span>Tổng thu về ước tính:</span>
              <span className="text-base text-emerald-600 font-black">
                {sellableItems.reduce((acc, i) => acc + i.count * i.value, 0)} xu 🪙
              </span>
            </div>

            <button
              onClick={handleSellAll}
              disabled={sellableItems.length === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow ${
                sellableItems.length > 0
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white active:scale-98'
                  : 'bg-amber-200 text-amber-500 cursor-not-allowed'
              }`}
            >
              <Coins className="w-4 h-4 fill-amber-300" />
              <span>Bán tất cả nông sản & thành phẩm</span>
            </button>
          </div>
        )}

        {/* 6. INVENTORY MODAL */}
        {type === 'inventory' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
                🎒
              </div>
              <div>
                <h3 className="text-xl font-black text-amber-950">Giỏ Đồ Của Duyên</h3>
                <p className="text-xs text-amber-700 font-semibold">Tất cả hạt giống, nông sản, thành phẩm và kỷ vật</p>
              </div>
            </div>

            <div className="bg-white/90 border border-amber-200 rounded-2xl p-4 text-xs max-h-60 overflow-y-auto space-y-2">
              {Object.values(state.inventory).map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 rounded-xl bg-amber-50 border border-amber-100"
                >
                  <div>
                    <span className="font-bold text-amber-950 text-xs block">{item.name}</span>
                    <span className="text-[10px] text-amber-600">{item.description}</span>
                  </div>
                  <span className="font-black text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-lg">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            {/* Content Placeholders Notice */}
            <div className="bg-amber-100/70 border border-amber-300/80 rounded-xl p-2.5 text-[11px] text-amber-800">
              <p className="font-bold text-amber-900">Ghi chú lưu trữ kỷ niệm:</p>
              <p className="italic text-[10px] text-amber-700 mt-0.5">
                {GAME_LORE_PLACEHOLDERS.sharedMemory} • {GAME_LORE_PLACEHOLDERS.salonName}
              </p>
            </div>
          </div>
        )}

        {/* 7. MAILBOX MODAL */}
        {type === 'mailbox' && (
          <MailboxModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 8. SALON MODAL */}
        {type === 'salon' && (
          <SalonModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 9. VILLAGER MODAL */}
        {type === 'villager' && (
          <VillagerModal
            villagerId={extra as string}
            sim={sim}
            state={state}
            onClose={onClose}
            onRefresh={onRefresh}
          />
        )}

        {/* 10. PRODUCTION MACHINE MODAL */}
        {type === 'production_machine' && (
          <ProductionModal
            building={extra as PlacedBuildingInstance}
            sim={sim}
            state={state}
            onClose={onClose}
            onRefresh={onRefresh}
          />
        )}

        {/* 11. ORDERS MODAL */}
        {type === 'orders' && (
          <OrdersModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 12. CHAPTERS MODAL */}
        {type === 'chapters' && (
          <ChaptersModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 13. DREAM HOME MODAL */}
        {type === 'dream_home' && (
          <DreamHomeModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 14. CAT MYSTERY MODAL */}
        {type === 'cat_mystery' && (
          <CatMysteryModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 15. EXPLORATION MODAL */}
        {type === 'exploration' && (
          <ExplorationModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 16. SEASONS MODAL */}
        {type === 'seasons' && (
          <SeasonsModal sim={sim} state={state} onClose={onClose} onRefresh={onRefresh} />
        )}

        {/* 17. JOURNAL MODAL */}
        {type === 'journal' && <JournalModal state={state} onClose={onClose} />}

        {/* 18. SETTINGS MODAL */}
        {type === 'settings' && (
          <SettingsModal
            state={state}
            onClose={onClose}
            onRefresh={onRefresh}
            onOpenSaveModal={onOpenSaveModal || (() => {})}
          />
        )}
      </div>
    </div>
  );
};
