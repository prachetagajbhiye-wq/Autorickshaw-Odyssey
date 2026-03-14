import { useState } from 'react';

interface Props {
  distance: number;
  coins: number;
  onRestart: () => void;
  onSaveScore: (name: string, score: number) => void;
}

export const GameOverScreen = ({ distance, coins, onRestart, onSaveScore }: Props) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSaveScore(name.trim(), distance);
      setSaved(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="flex flex-col items-center px-6 max-w-sm w-full">
        <div className="text-5xl mb-3">💥</div>
        <h2 className="game-title text-2xl text-destructive mb-2">RIDE OVER</h2>
        
        <div className="flex gap-4 mb-6">
          <div className="glass-panel px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="tabular-nums text-xl text-foreground">{distance}m</p>
          </div>
          <div className="glass-panel px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground">Coins</p>
            <p className="tabular-nums text-xl text-primary">{coins}</p>
          </div>
        </div>

        {!saved ? (
          <div className="w-full mb-4">
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={15}
              className="w-full px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm outline-none focus:ring-1 focus:ring-primary mb-2"
            />
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full py-2 rounded-lg bg-accent text-accent-foreground font-semibold text-sm disabled:opacity-40"
            >
              Save Score
            </button>
          </div>
        ) : (
          <p className="text-sm text-game-health mb-4">✅ Score saved!</p>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg tracking-tight transition-transform active:scale-95"
          style={{ boxShadow: '0 0 30px hsla(45, 100%, 50%, 0.3)' }}
        >
          RIDE AGAIN 🛺
        </button>
      </div>
    </div>
  );
};
