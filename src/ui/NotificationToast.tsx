import React from 'react';
import { GameNotification } from '../core/types';
import { CheckCircle2, AlertTriangle, Info, Heart } from 'lucide-react';

interface NotificationToastProps {
  notifications: GameNotification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  return (
    <aside aria-label="Thông báo trò chơi" className="fixed top-16 right-3 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.slice(-4).map(notif => {
        let bgStyle = 'bg-amber-100/95 border-amber-300 text-amber-950';
        let Icon = Info;

        if (notif.type === 'success') {
          bgStyle = 'bg-emerald-100/95 border-emerald-300 text-emerald-950';
          Icon = CheckCircle2;
        } else if (notif.type === 'warning') {
          bgStyle = 'bg-rose-100/95 border-rose-300 text-rose-950';
          Icon = AlertTriangle;
        } else if (notif.type === 'love') {
          bgStyle = 'bg-pink-100/95 border-pink-300 text-pink-950';
          Icon = Heart;
        }

        return (
          <div
            key={notif.id}
            onClick={() => onDismiss(notif.id)}
            className={`pointer-events-auto p-3 rounded-2xl border shadow-lg backdrop-blur-md flex items-start gap-2.5 text-xs sm:text-sm font-semibold transition-all duration-300 animate-slide-left cursor-pointer hover:opacity-80 ${bgStyle}`}
          >
            <Icon className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-snug">{notif.text}</div>
          </div>
        );
      })}
    </aside>
  );
};
