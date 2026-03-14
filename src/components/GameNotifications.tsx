import { Notification } from '@/game/types';

interface Props {
  notifications: Notification[];
}

export const GameNotifications = ({ notifications }: Props) => {
  return (
    <div className="fixed top-16 left-0 right-0 z-30 flex flex-col items-center gap-1 pointer-events-none">
      {notifications.map(n => (
        <div key={n.id} className="notification-toast glass-panel px-4 py-2 text-sm font-semibold text-primary">
          {n.text}
        </div>
      ))}
    </div>
  );
};
