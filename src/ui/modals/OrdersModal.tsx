import React from 'react';
import { GameState } from '../../core/types';
import { GameSimulation } from '../../systems/GameSimulation';
import { Package, Coins, Heart, Zap, Check } from 'lucide-react';
import { soundManager } from '../../core/audio';

interface OrdersModalProps {
  sim: GameSimulation;
  state: GameState;
  onClose: () => void;
  onRefresh: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ sim, state, onClose, onRefresh }) => {
  const orders = state.deliveryOrders || [];

  const handleFulfill = (orderId: string) => {
    soundManager.playCoin();
    sim.fulfillOrder(orderId);
    onRefresh();
  };

  return (
    <div className="flex flex-col gap-4 text-amber-950">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-amber-200 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
          📜
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-950">Bảng Đơn Hàng Giao Nông Sản</h3>
          <p className="text-xs text-amber-700 font-semibold">Giao hàng tươi ngon cho bà con dân làng & nhận thưởng hậu hĩnh</p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {orders.map(order => {
          const canFulfill = order.items.every(req => {
            const inStock = state.inventory[req.itemId]?.count || 0;
            return inStock >= req.count;
          });

          return (
            <div
              key={order.id}
              className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                order.isFulfilled
                  ? 'bg-emerald-50 border-emerald-300 opacity-80'
                  : 'bg-white border-amber-200 shadow-xs hover:border-amber-300'
              }`}
            >
              <div>
                {/* Customer Info */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{order.customerAvatar}</span>
                  <div>
                    <div className="text-xs font-black text-amber-950">{order.customerName}</div>
                    <div className="text-[10px] text-amber-600 font-semibold">{order.customerTitle}</div>
                  </div>
                </div>

                <p className="text-[11px] text-amber-800 italic bg-amber-50 p-2 rounded-xl border border-amber-100 mb-3">
                  "{order.dialogueVi}"
                </p>

                {/* Requested Items */}
                <div className="space-y-1.5 mb-3">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Cần giao:</div>
                  {order.items.map((it, idx) => {
                    const inStock = state.inventory[it.itemId]?.count || 0;
                    const hasEnough = inStock >= it.count;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-amber-100/50"
                      >
                        <span className="font-semibold text-amber-900 flex items-center gap-1">
                          <span>{it.emoji}</span>
                          <span>{it.name}</span>
                        </span>
                        <span
                          className={`font-mono font-bold text-[11px] ${
                            hasEnough ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {inStock}/{it.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rewards & Action */}
              <div className="pt-2 border-t border-amber-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-2">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <Coins className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    <span>+{order.rewardCoins} xu</span>
                  </span>
                  <span className="flex items-center gap-1 text-rose-600">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" />
                    <span>+{order.rewardRelationship}</span>
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>+{order.rewardEnergy} NL</span>
                  </span>
                </div>

                <button
                  onClick={() => handleFulfill(order.id)}
                  disabled={!canFulfill || order.isFulfilled}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow ${
                    order.isFulfilled
                      ? 'bg-emerald-200 text-emerald-800 cursor-default'
                      : canFulfill
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-amber-100 text-amber-400 cursor-not-allowed'
                  }`}
                >
                  {order.isFulfilled ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Đã hoàn thành
                    </>
                  ) : (
                    <>
                      <Package className="w-3.5 h-3.5" /> Giao hàng ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
