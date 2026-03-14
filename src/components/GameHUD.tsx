import { GameState } from '@/game/types';

interface GameHUDProps {
  state: GameState;
}

export const GameHUD = ({ state }: GameHUDProps) => {
  const healthPercent = Math.max(0, Math.round(state.health));
  const healthColor = healthPercent > 60 ? 'bg-game-health' : healthPercent > 30 ? 'bg-primary' : 'bg-destructive';

  return (
    <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-2 pointer-events-none" style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}>
      <div className="glass-panel px-3 py-1.5 flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">DIST</span>
        <span className="tabular-nums text-sm text-foreground">{Math.floor(state.distance)}m</span>
      </div>
      
      <div className="glass-panel px-3 py-1.5 flex items-center gap-1.5">
        <span className="text-xs text-muted-foreground">🪙</span>
        <span className="tabular-nums text-sm text-foreground">{state.coins}</span>
      </div>
      
      <div className="glass-panel px-3 py-1.5 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">❤️</span>
        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full ${healthColor} transition-all duration-300`} style={{ width: `${healthPercent}%` }} />
        </div>
      </div>
    </div>
  );
};
