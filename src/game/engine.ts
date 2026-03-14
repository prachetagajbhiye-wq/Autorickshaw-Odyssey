import { GameState, Obstacle, RoadChunk, Decoration, ObstacleType, Weather, Vehicle, GameMap, VEHICLES, MAPS, RainDrop } from './types';
import { CityDirector } from './director';

const LANE_COUNT = 3;
const CHUNK_HEIGHT = 400;

const OBSTACLE_PROPS: Record<ObstacleType, { emoji: string; color: string; w: number; h: number; isReward?: boolean }> = {
  dog: { emoji: '🐕', color: '#A0522D', w: 30, h: 25 },
  rickshaw: { emoji: '🛺', color: '#FFD700', w: 40, h: 55 },
  bus: { emoji: '🚌', color: '#FF6347', w: 50, h: 80 },
  pedestrian: { emoji: '🚶', color: '#DEB887', w: 25, h: 35 },
  cart: { emoji: '🥕', color: '#8B4513', w: 45, h: 40 },
  barricade: { emoji: '🚧', color: '#FF4500', w: 55, h: 30 },
  pothole: { emoji: '🕳', color: '#333', w: 35, h: 20 },
  chai: { emoji: '☕', color: '#00E5FF', w: 25, h: 25, isReward: true },
  coin: { emoji: '🪙', color: '#FFD700', w: 22, h: 22, isReward: true },
  snack: { emoji: '🍘', color: '#FF9800', w: 25, h: 25, isReward: true },
};

const CHUNK_DECORATIONS: Record<string, string[]> = {
  market: ['🏪', '☕', '🍘', '🪧'],
  residential: ['🏠', '🌳', '🌳', '🏠'],
  flyover: ['🌉', '🏙', '🏙'],
  construction: ['🚧', '🏗', '🚧'],
  highway: ['🛣', '🌳', '💡'],
  rain_street: ['🌧', '🌳', '💡'],
  traffic_jam: ['🚗', '🏪', '💡'],
};

export class GameEngine {
  state: GameState;
  director: CityDirector;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  roadWidth: number = 0;
  laneWidth: number = 0;
  roadX: number = 0;
  lastSpawnTime: number = 0;
  lastChunkY: number = 0;
  notifId: number = 0;
  animFrame: number = 0;
  lastTime: number = 0;
  weatherChangeTimer: number = 0;
  onStateChange?: (state: GameState) => void;
  onGameOver?: (distance: number, coins: number) => void;
  keysDown: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.director = new CityDirector();
    this.state = this.createInitialState(VEHICLES[0], MAPS[0]);
  }

  createInitialState(vehicle: Vehicle, map: GameMap): GameState {
    return {
      distance: 0,
      speed: 4 * vehicle.speed,
      baseSpeed: 4 * vehicle.speed,
      health: 100 * vehicle.durability,
      coins: 0,
      lane: 1,
      targetLane: 1,
      playerX: 0,
      playerY: 0,
      obstacles: [],
      chunks: [],
      weather: map.type === 'monsoon' ? 'RAIN' : 'CLEAR',
      weatherTransition: 0,
      difficulty: 1,
      isPlaying: false,
      isGameOver: false,
      boostTimer: 0,
      hornTimer: 0,
      hornActive: false,
      shakeTimer: 0,
      notifications: [],
      rainDrops: [],
      fogOpacity: 0,
      skyHue: 210,
      abilities: { horn: false, slowmo: false, radar: false },
      vehicle,
      map,
    };
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    const w = rect.width;
    this.roadWidth = Math.min(w * 0.7, 280);
    this.laneWidth = this.roadWidth / LANE_COUNT;
    this.roadX = (w - this.roadWidth) / 2;
    this.state.playerY = rect.height - 140;
    this.updatePlayerX();
  }

  updatePlayerX() {
    const targetX = this.roadX + this.state.targetLane * this.laneWidth + this.laneWidth / 2;
    this.state.playerX += (targetX - this.state.playerX) * 0.15 * (this.state.vehicle.handling);
  }

  start(vehicle: Vehicle, map: GameMap) {
    this.state = this.createInitialState(vehicle, map);
    this.state.isPlaying = true;
    this.resize();
    this.generateInitialChunks();
    this.lastTime = performance.now();
    this.lastSpawnTime = 0;
    this.weatherChangeTimer = 0;
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.animFrame);
    this.state.isPlaying = false;
  }

  generateInitialChunks() {
    const h = this.canvas.getBoundingClientRect().height;
    this.lastChunkY = h;
    for (let i = 0; i < 6; i++) {
      this.spawnChunk();
    }
  }

  spawnChunk() {
    const type = this.director.getChunkType(this.state.distance, this.state.map.type);
    const decorations: Decoration[] = [];
    const emojis = CHUNK_DECORATIONS[type] || ['🌳'];
    
    for (let i = 0; i < 3; i++) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      decorations.push({
        x: side === 'left' ? this.roadX - 30 - Math.random() * 20 : this.roadX + this.roadWidth + 10 + Math.random() * 20,
        y: this.lastChunkY - i * (CHUNK_HEIGHT / 3) - Math.random() * 40,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        side,
      });
    }

    const chunk: RoadChunk = {
      type,
      y: this.lastChunkY - CHUNK_HEIGHT,
      height: CHUNK_HEIGHT,
      color: type === 'flyover' ? '#1a1a2e' : '#0d0d14',
      decorations,
    };
    
    this.state.chunks.push(chunk);
    this.lastChunkY -= CHUNK_HEIGHT;
  }

  spawnObstacle() {
    const currentChunk = this.state.chunks.find(c => {
      const rect = this.canvas.getBoundingClientRect();
      return c.y < rect.height / 2 && c.y + c.height > rect.height / 2;
    });
    
    const chunkType = currentChunk?.type || 'residential';
    const types = this.director.getObstacleTypes(this.state.distance, chunkType);
    const type = types[Math.floor(Math.random() * types.length)];
    const props = OBSTACLE_PROPS[type];
    const lane = Math.floor(Math.random() * LANE_COUNT);
    
    const obs: Obstacle = {
      type,
      x: this.roadX + lane * this.laneWidth + (this.laneWidth - props.w) / 2,
      y: -props.h - 20,
      width: props.w,
      height: props.h,
      lane,
      speed: props.isReward ? 0 : (Math.random() * 2 - 1),
      color: props.color,
      emoji: props.emoji,
    };
    
    this.state.obstacles.push(obs);
  }

  addNotification(text: string) {
    this.state.notifications.push({ text, time: 2000, id: ++this.notifId });
  }

  steerLeft() {
    if (this.state.targetLane > 0) this.state.targetLane--;
  }

  steerRight() {
    if (this.state.targetLane < LANE_COUNT - 1) this.state.targetLane++;
  }

  activateBoost() {
    if (this.state.boostTimer <= 0) {
      this.state.boostTimer = 3000;
      this.state.speed = this.state.baseSpeed * 2;
      this.addNotification('⚡ Boost Activated!');
    }
  }

  activateHorn() {
    if (this.state.abilities.horn && this.state.hornTimer <= 0) {
      this.state.hornTimer = 5000;
      this.state.hornActive = true;
      this.addNotification('📯 Horn! Pedestrians cleared!');
      setTimeout(() => { this.state.hornActive = false; }, 1500);
    }
  }

  handleCollision(obs: Obstacle) {
    const props = OBSTACLE_PROPS[obs.type];
    if (props.isReward) {
      switch (obs.type) {
        case 'chai':
          this.state.speed = this.state.baseSpeed * 1.5;
          this.state.boostTimer = 2000;
          this.addNotification('⚡ Chai Boost Activated!');
          break;
        case 'coin':
          this.state.coins += 10;
          this.addNotification('🪙 +10 Coins!');
          break;
        case 'snack':
          this.state.health = Math.min(100, this.state.health + 15);
          this.addNotification('❤️ Health Restored!');
          break;
      }
      return;
    }

    // Horn scares away pedestrians and dogs
    if (this.state.hornActive && (obs.type === 'pedestrian' || obs.type === 'dog')) return;

    let damage = 15;
    if (obs.type === 'bus') damage = 30;
    if (obs.type === 'pothole') damage = 10;
    if (obs.type === 'barricade') damage = 20;
    
    this.state.health -= damage / this.state.vehicle.durability;
    this.state.shakeTimer = 300;
    this.state.speed = Math.max(2, this.state.speed * 0.7);
  }

  checkCollision(obs: Obstacle): boolean {
    const pw = 35, ph = 55;
    const px = this.state.playerX - pw / 2;
    const py = this.state.playerY - ph / 2;
    
    return px < obs.x + obs.width &&
           px + pw > obs.x &&
           py < obs.y + obs.height &&
           py + ph > obs.y;
  }

  updateWeather(dt: number) {
    this.weatherChangeTimer += dt;
    if (this.weatherChangeTimer > 10000) {
      this.weatherChangeTimer = 0;
      this.state.weather = this.director.getWeather(this.state.distance, this.state.map.type);
    }

    // Rain
    if (this.state.weather === 'RAIN') {
      while (this.state.rainDrops.length < 80) {
        const rect = this.canvas.getBoundingClientRect();
        this.state.rainDrops.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          speed: 8 + Math.random() * 6,
          length: 10 + Math.random() * 15,
        });
      }
    } else {
      this.state.rainDrops = this.state.rainDrops.slice(0, Math.max(0, this.state.rainDrops.length - 2));
    }

    // Fog
    const targetFog = this.state.weather === 'FOG' ? 0.4 : 0;
    this.state.fogOpacity += (targetFog - this.state.fogOpacity) * 0.02;
  }

  updateAbilities() {
    const d = this.state.distance;
    if (d > 1000) this.state.abilities.horn = true;
    if (d > 3000) this.state.abilities.slowmo = true;
    if (d > 5000) this.state.abilities.radar = true;
  }

  update(dt: number) {
    if (!this.state.isPlaying || this.state.isGameOver) return;

    const rect = this.canvas.getBoundingClientRect();

    // Speed recovery
    if (this.state.boostTimer > 0) {
      this.state.boostTimer -= dt;
      if (this.state.boostTimer <= 0) {
        this.state.speed = this.state.baseSpeed * this.director.getSpeedMultiplier(this.state.distance, this.state.map.type);
      }
    } else {
      const targetSpeed = this.state.baseSpeed * this.director.getSpeedMultiplier(this.state.distance, this.state.map.type);
      this.state.speed += (targetSpeed - this.state.speed) * 0.01;
    }

    if (this.state.hornTimer > 0) this.state.hornTimer -= dt;
    if (this.state.shakeTimer > 0) this.state.shakeTimer -= dt;

    // Weather effects on speed
    if (this.state.weather === 'RAIN') this.state.speed *= 0.95;

    // Update player
    this.updatePlayerX();

    // Distance
    this.state.distance += this.state.speed * dt / 100;
    this.state.difficulty = this.director.chaosFactor(this.state.distance);

    // Sky color shift
    this.state.skyHue = 210 - (this.state.distance / 100) % 180;

    // Spawn obstacles
    this.lastSpawnTime += dt;
    const spawnRate = this.director.getSpawnRate(this.state.distance);
    if (this.lastSpawnTime > spawnRate) {
      this.lastSpawnTime = 0;
      this.spawnObstacle();
    }

    // Update obstacles
    const speed = this.state.speed;
    this.state.obstacles = this.state.obstacles.filter(obs => {
      obs.y += speed + obs.speed;
      
      if (this.checkCollision(obs)) {
        this.handleCollision(obs);
        return false;
      }
      
      return obs.y < rect.height + 100;
    });

    // Update chunks
    this.state.chunks.forEach(c => { c.y += speed; c.decorations.forEach(d => { d.y += speed; }); });
    this.state.chunks = this.state.chunks.filter(c => c.y < rect.height + 200);
    
    while (this.state.chunks.length < 6) {
      this.lastChunkY = Math.min(...this.state.chunks.map(c => c.y)) - CHUNK_HEIGHT;
      this.spawnChunk();
    }

    // Rain
    this.state.rainDrops.forEach(r => {
      r.y += r.speed;
      if (r.y > rect.height) { r.y = -10; r.x = Math.random() * rect.width; }
    });

    // Weather
    this.updateWeather(dt);
    this.updateAbilities();

    // Notifications
    this.state.notifications = this.state.notifications
      .map(n => ({ ...n, time: n.time - dt }))
      .filter(n => n.time > 0);

    // Game over
    if (this.state.health <= 0) {
      this.state.isGameOver = true;
      this.state.isPlaying = false;
      this.onGameOver?.(Math.floor(this.state.distance), this.state.coins);
    }

    this.onStateChange?.(this.state);
  }

  draw() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    const ctx = this.ctx;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    const hue = Math.abs(this.state.skyHue % 360);
    skyGrad.addColorStop(0, `hsl(${hue}, 20%, 8%)`);
    skyGrad.addColorStop(1, `hsl(${hue + 20}, 15%, 5%)`);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Shake
    if (this.state.shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * 6;
      const sy = (Math.random() - 0.5) * 6;
      ctx.save();
      ctx.translate(sx, sy);
    }

    // Road
    ctx.fillStyle = '#0d0d14';
    ctx.fillRect(this.roadX - 10, 0, this.roadWidth + 20, h);
    ctx.fillStyle = '#141420';
    ctx.fillRect(this.roadX, 0, this.roadWidth, h);

    // Lane markings (animated)
    ctx.strokeStyle = '#FFD70066';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    const offset = (this.state.distance * 3) % 40;
    for (let i = 1; i < LANE_COUNT; i++) {
      const lx = this.roadX + i * this.laneWidth;
      ctx.beginPath();
      ctx.moveTo(lx, -offset);
      ctx.lineTo(lx, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Road edges
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.roadX, 0); ctx.lineTo(this.roadX, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(this.roadX + this.roadWidth, 0); ctx.lineTo(this.roadX + this.roadWidth, h);
    ctx.stroke();

    // Decorations
    ctx.font = '20px serif';
    this.state.chunks.forEach(chunk => {
      chunk.decorations.forEach(d => {
        if (d.y > -30 && d.y < h + 30) {
          ctx.fillText(d.emoji, d.x, d.y);
        }
      });
    });

    // Obstacles
    ctx.font = '28px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    this.state.obstacles.forEach(obs => {
      const cx = obs.x + obs.width / 2;
      const cy = obs.y + obs.height / 2;
      
      // Glow for rewards
      const props = OBSTACLE_PROPS[obs.type];
      if (props.isReward) {
        ctx.shadowColor = obs.color;
        ctx.shadowBlur = 15;
      }
      
      ctx.font = obs.type === 'bus' ? '36px serif' : '28px serif';
      ctx.fillText(obs.emoji, cx, cy);
      ctx.shadowBlur = 0;
    });

    // Player (rickshaw)
    const px = this.state.playerX;
    const py = this.state.playerY;
    ctx.font = '40px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Boost trail
    if (this.state.boostTimer > 0) {
      ctx.shadowColor = '#00E5FF';
      ctx.shadowBlur = 20;
      ctx.globalAlpha = 0.5;
      ctx.fillText(this.state.vehicle.emoji, px, py + 20);
      ctx.globalAlpha = 0.3;
      ctx.fillText(this.state.vehicle.emoji, px, py + 35);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
    
    ctx.fillText(this.state.vehicle.emoji, px, py);

    // Rain
    if (this.state.rainDrops.length > 0) {
      ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
      ctx.lineWidth = 1;
      this.state.rainDrops.forEach(r => {
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 2, r.y + r.length);
        ctx.stroke();
      });
    }

    // Fog overlay
    if (this.state.fogOpacity > 0.01) {
      ctx.fillStyle = `rgba(180, 180, 200, ${this.state.fogOpacity})`;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.state.shakeTimer > 0) {
      ctx.restore();
    }
  }

  loop = () => {
    const now = performance.now();
    const dt = Math.min(now - this.lastTime, 50);
    this.lastTime = now;
    
    this.update(dt);
    this.draw();
    
    if (this.state.isPlaying) {
      this.animFrame = requestAnimationFrame(this.loop);
    }
  };

  handleKeyDown = (e: KeyboardEvent) => {
    if (!this.state.isPlaying) return;
    switch (e.key) {
      case 'ArrowLeft': case 'a': this.steerLeft(); break;
      case 'ArrowRight': case 'd': this.steerRight(); break;
      case ' ': this.activateBoost(); break;
      case 'h': this.activateHorn(); break;
    }
  };

  setupControls() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  cleanup() {
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener('keydown', this.handleKeyDown);
  }
}
