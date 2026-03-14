import { GameState } from '@/game/types';

interface GameControlsProps {
  onSteerLeft: () => void;
  onSteerRight: () => void;
  onBoost: () => void;
  onHorn: () => void;
  state: GameState;
}

export const GameControls = ({ onSteerLeft, onSteerRight, onBoost, onHorn, state }: GameControlsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 flex justify-between items-end px-4 pointer-events-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>
      <div className="flex gap-3 pointer-events-auto pb-4">
        <button className="ctrl-btn" onTouchStart={onSteerLeft} onMouseDown={onSteerLeft}>←</button>
        <button className="ctrl-btn" onTouchStart={onSteerRight} onMouseDown={onSteerRight}>→</button>
      </div>
      <div className="flex gap-3 pointer-events-auto pb-4">
        {state.abilities.horn && (
          <button
            className="action-btn"
            onTouchStart={onHorn}
            onMouseDown={onHorn}
            style={{ opacity: state.hornTimer > 0 ? 0.4 : 1 }}
          >📯</button>
        )}
        <button
          className="action-btn"
          onTouchStart={onBoost}
          onMouseDown={onBoost}
          style={{ opacity: state.boostTimer > 0 ? 0.4 : 1 }}
        >⚡</button>
      </div>
    </div>
  );
};
