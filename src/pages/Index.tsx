import { useRef, useState, useEffect, useCallback } from 'react';
import { GameEngine } from '@/game/engine';
import { GameState, Vehicle, GameMap, LeaderboardEntry, VEHICLES, MAPS } from '@/game/types';
import { GameHUD } from '@/components/GameHUD';
import { GameControls } from '@/components/GameControls';
import { GameNotifications } from '@/components/GameNotifications';
import { StartScreen } from '@/components/StartScreen';
import { GameOverScreen } from '@/components/GameOverScreen';

const STORAGE_KEY = 'autorickshaw-leaderboard';

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
};

const saveToLeaderboard = (name: string, score: number): LeaderboardEntry[] => {
  const lb = loadLeaderboard();
  lb.push({ name, score, date: new Date().toISOString() });
  lb.sort((a, b) => b.score - a.score);
  const top10 = lb.slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
  return top10;
};

const Index = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [screen, setScreen] = useState<'start' | 'playing' | 'gameover'>('start');
  const [finalScore, setFinalScore] = useState({ distance: 0, coins: 0 });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(loadLeaderboard());

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    engine.setupControls();

    engine.onStateChange = (state) => setGameState({ ...state });
    engine.onGameOver = (distance, coins) => {
      setFinalScore({ distance, coins });
      setScreen('gameover');
    };

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.cleanup();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleStart = useCallback((vehicle: Vehicle, map: GameMap) => {
    if (!engineRef.current) return;
    setScreen('playing');
    engineRef.current.start(vehicle, map);
  }, []);

  const handleRestart = useCallback(() => {
    setScreen('start');
  }, []);

  const handleSaveScore = useCallback((name: string, score: number) => {
    const updated = saveToLeaderboard(name, score);
    setLeaderboard(updated);
  }, []);

  const handleSteerLeft = useCallback(() => engineRef.current?.steerLeft(), []);
  const handleSteerRight = useCallback(() => engineRef.current?.steerRight(), []);
  const handleBoost = useCallback(() => engineRef.current?.activateBoost(), []);
  const handleHorn = useCallback(() => engineRef.current?.activateHorn(), []);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ touchAction: 'none' }}
      />

      {screen === 'start' && (
        <StartScreen onStart={handleStart} leaderboard={leaderboard} />
      )}

      {screen === 'playing' && gameState && (
        <>
          <GameHUD state={gameState} />
          <GameControls
            state={gameState}
            onSteerLeft={handleSteerLeft}
            onSteerRight={handleSteerRight}
            onBoost={handleBoost}
            onHorn={handleHorn}
          />
          <GameNotifications notifications={gameState.notifications} />
          
          {/* Weather indicator */}
          {gameState.weather !== 'CLEAR' && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 z-20 glass-panel px-3 py-1 text-xs text-muted-foreground">
              {gameState.weather === 'RAIN' ? '🌧 Rain' : gameState.weather === 'FOG' ? '🌫 Fog' : '💨 Wind'}
            </div>
          )}
        </>
      )}

      {screen === 'gameover' && (
        <GameOverScreen
          distance={finalScore.distance}
          coins={finalScore.coins}
          onRestart={handleRestart}
          onSaveScore={handleSaveScore}
        />
      )}
    </div>
  );
};

export default Index;
