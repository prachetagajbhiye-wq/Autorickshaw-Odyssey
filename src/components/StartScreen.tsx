import { useState } from 'react';
import { Vehicle, GameMap, VEHICLES, MAPS, LeaderboardEntry } from '@/game/types';

interface Props {
  onStart: (vehicle: Vehicle, map: GameMap) => void;
  leaderboard: LeaderboardEntry[];
}

export const StartScreen = ({ onStart, leaderboard }: Props) => {
  const [vehicle, setVehicle] = useState(VEHICLES[0]);
  const [map, setMap] = useState(MAPS[0]);
  const [tab, setTab] = useState<'play' | 'leaderboard'>('play');

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, hsl(45, 100%, 50%) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 max-w-sm w-full">
        <div className="text-6xl mb-4">🛺</div>
        <h1 className="game-title text-3xl text-foreground text-center">
          AUTORICKSHAW<br />
          <span className="text-primary">ODYSSEY</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2 mb-6">Survive the Mumbai Chaos</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('play')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'play' ? 'bg-primary text-primary-foreground' : 'glass-panel text-muted-foreground'}`}
          >Play</button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${tab === 'leaderboard' ? 'bg-primary text-primary-foreground' : 'glass-panel text-muted-foreground'}`}
          >🏆 Leaderboard</button>
        </div>

        {tab === 'play' ? (
          <>
            {/* Vehicle select */}
            <div className="w-full mb-4">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Vehicle</p>
              <div className="grid grid-cols-2 gap-2">
                {VEHICLES.map(v => (
                  <button
                    key={v.type}
                    onClick={() => setVehicle(v)}
                    className={`glass-panel p-3 text-left transition-all ${vehicle.type === v.type ? 'ring-1 ring-primary' : ''}`}
                  >
                    <span className="text-2xl">{v.emoji}</span>
                    <p className="text-xs text-foreground font-semibold mt-1">{v.name}</p>
                    <div className="flex gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span>⚡{v.speed.toFixed(1)}</span>
                      <span>🔧{v.handling.toFixed(1)}</span>
                      <span>🛡{v.durability.toFixed(1)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Map select */}
            <div className="w-full mb-6">
              <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Map</p>
              <div className="grid grid-cols-2 gap-2">
                {MAPS.map(m => (
                  <button
                    key={m.type}
                    onClick={() => setMap(m)}
                    className={`glass-panel p-3 text-left transition-all ${map.type === m.type ? 'ring-1 ring-primary' : ''}`}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <p className="text-xs text-foreground font-semibold">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.description}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onStart(vehicle, map)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-lg tracking-tight transition-transform active:scale-95"
              style={{ boxShadow: '0 0 30px hsla(45, 100%, 50%, 0.3)' }}
            >
              START RIDE 🚀
            </button>
          </>
        ) : (
          <div className="w-full">
            <h2 className="text-lg font-bold text-foreground mb-3">🏆 Top Drivers</h2>
            {leaderboard.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores yet. Be the first!</p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, i) => (
                  <div key={i} className="glass-panel px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                      <span className="text-sm font-semibold text-foreground">{entry.name}</span>
                    </div>
                    <span className="tabular-nums text-sm text-primary">{entry.score}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
