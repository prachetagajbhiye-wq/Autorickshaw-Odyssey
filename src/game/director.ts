import { Weather, ChunkType, ObstacleType, MapType } from './types';

export class CityDirector {
  difficulty: number = 1;
  
  chaosFactor(dist: number): number {
    return Math.min(dist / 5000, 1);
  }

  getSpawnRate(dist: number): number {
    return Math.max(600, 2000 - (this.chaosFactor(dist) * 1400));
  }

  getWeather(dist: number, map: MapType): Weather {
    if (map === 'monsoon') return 'RAIN';
    if (dist > 5000 && Math.random() > 0.5) return 'FOG';
    if (dist > 3000 && Math.random() > 0.6) return 'RAIN';
    if (dist > 4000 && Math.random() > 0.7) return 'WIND';
    return 'CLEAR';
  }

  getChunkType(dist: number, map: MapType): ChunkType {
    const chaos = this.chaosFactor(dist);
    const types: ChunkType[] = ['residential', 'market'];
    
    if (dist > 500) types.push('highway');
    if (dist > 1500) types.push('construction', 'traffic_jam');
    if (dist > 3000) types.push('flyover', 'rain_street');
    
    if (map === 'highway') return Math.random() > 0.3 ? 'highway' : types[Math.floor(Math.random() * types.length)];
    if (map === 'monsoon') return Math.random() > 0.5 ? 'rain_street' : types[Math.floor(Math.random() * types.length)];
    
    return types[Math.floor(Math.random() * types.length)];
  }

  getObstacleTypes(dist: number, chunkType: ChunkType): ObstacleType[] {
    const obstacles: ObstacleType[] = [];
    
    // Always available
    obstacles.push('pothole');
    if (Math.random() > 0.6) obstacles.push('coin');
    if (Math.random() > 0.8) obstacles.push('chai');
    if (Math.random() > 0.85) obstacles.push('snack');
    
    if (dist < 500) {
      obstacles.push('rickshaw');
      return obstacles;
    }
    
    // Context-based spawning
    switch (chunkType) {
      case 'market':
        obstacles.push('pedestrian', 'cart');
        if (dist > 2000) obstacles.push('dog');
        break;
      case 'residential':
        obstacles.push('dog');
        if (dist > 1000) obstacles.push('pedestrian');
        break;
      case 'highway':
        obstacles.push('bus', 'rickshaw');
        break;
      case 'construction':
        obstacles.push('barricade');
        break;
      case 'traffic_jam':
        obstacles.push('rickshaw', 'bus', 'rickshaw');
        break;
      default:
        obstacles.push('rickshaw');
    }
    
    return obstacles;
  }

  getSpeedMultiplier(dist: number, map: MapType): number {
    const base = 1 + this.chaosFactor(dist) * 0.5;
    if (map === 'highway') return base * 1.3;
    return base;
  }
}
