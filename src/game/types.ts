export type Weather = 'CLEAR' | 'RAIN' | 'FOG' | 'WIND';
export type ChunkType = 'market' | 'residential' | 'flyover' | 'construction' | 'highway' | 'rain_street' | 'traffic_jam';
export type ObstacleType = 'dog' | 'rickshaw' | 'bus' | 'pedestrian' | 'cart' | 'barricade' | 'pothole' | 'chai' | 'coin' | 'snack';
export type VehicleType = 'autorickshaw' | 'scooter' | 'taxi' | 'car';
export type MapType = 'south_mumbai' | 'bandra' | 'highway' | 'monsoon';

export interface Vehicle {
  type: VehicleType;
  name: string;
  emoji: string;
  speed: number;
  handling: number;
  durability: number;
}

export interface GameMap {
  type: MapType;
  name: string;
  emoji: string;
  description: string;
}

export interface Obstacle {
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  lane: number;
  speed: number;
  color: string;
  emoji: string;
}

export interface RoadChunk {
  type: ChunkType;
  y: number;
  height: number;
  color: string;
  decorations: Decoration[];
}

export interface Decoration {
  x: number;
  y: number;
  emoji: string;
  side: 'left' | 'right';
}

export interface GameState {
  distance: number;
  speed: number;
  baseSpeed: number;
  health: number;
  coins: number;
  lane: number; // 0, 1, 2
  targetLane: number;
  playerX: number;
  playerY: number;
  obstacles: Obstacle[];
  chunks: RoadChunk[];
  weather: Weather;
  weatherTransition: number;
  difficulty: number;
  isPlaying: boolean;
  isGameOver: boolean;
  boostTimer: number;
  hornTimer: number;
  hornActive: boolean;
  shakeTimer: number;
  notifications: Notification[];
  rainDrops: RainDrop[];
  fogOpacity: number;
  skyHue: number;
  abilities: {
    horn: boolean;
    slowmo: boolean;
    radar: boolean;
  };
  vehicle: Vehicle;
  map: GameMap;
}

export interface Notification {
  text: string;
  time: number;
  id: number;
}

export interface RainDrop {
  x: number;
  y: number;
  speed: number;
  length: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export const VEHICLES: Vehicle[] = [
  { type: 'autorickshaw', name: 'Autorickshaw', emoji: '🛺', speed: 1, handling: 0.8, durability: 1 },
  { type: 'scooter', name: 'Delivery Scooter', emoji: '🛵', speed: 1.3, handling: 1.2, durability: 0.6 },
  { type: 'taxi', name: 'Taxi', emoji: '🚕', speed: 1.1, handling: 0.9, durability: 1.2 },
  { type: 'car', name: 'Compact Car', emoji: '🚗', speed: 1.2, handling: 1, durability: 1.1 },
];

export const MAPS: GameMap[] = [
  { type: 'south_mumbai', name: 'South Mumbai', emoji: '🌆', description: 'Dense traffic, narrow roads' },
  { type: 'bandra', name: 'Bandra', emoji: '🏖', description: 'Coastal vibes, moderate traffic' },
  { type: 'highway', name: 'Highway', emoji: '🛣', description: 'Fast lanes, heavy vehicles' },
  { type: 'monsoon', name: 'Monsoon Mode', emoji: '🌧', description: 'Constant rain, slippery roads' },
];
