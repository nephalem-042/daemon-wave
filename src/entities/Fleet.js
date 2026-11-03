import { Enemy } from './Enemy.js';
import { Bullet } from './Bullet.js';
import { CONFIG } from '../config.js';

/** Owns the enemy grid: moves it as a block and decides who shoots. */
export class Fleet {
  constructor(level = 1) {
    this.level = level;
    this.direction = 1;
    this.enemies = [];
    this.shootTimer = this.#nextShootDelay();
    this.#build();
  }

  get aliveEnemies() {
    return this.enemies.filter((e) => e.alive);
  }

  get isCleared() {
    return this.aliveEnemies.length === 0;
  }

  /** Lowest edge of any living enemy (used for the invasion check). */
  get bottom() {
    return Math.max(0, ...this.aliveEnemies.map((e) => e.y + e.height));
  }

  /** Moves the fleet and returns any bullets fired this frame. */
  update(dt) {
    const alive = this.aliveEnemies;
    if (alive.length === 0) return [];

    const dx = this.direction * this.#currentSpeed(alive.length) * dt;
    for (const e of alive) e.x += dx;

    const margin = CONFIG.fleet.sideMargin;
    const hitEdge = alive.some(
      (e) => e.x < margin || e.x + e.width > CONFIG.width - margin,
    );
    if (hitEdge) {
      for (const e of alive) {
        e.x -= dx;
        e.y += CONFIG.fleet.descend;
      }
      this.direction *= -1;
    }

    return this.#updateShooting(dt, alive);
  }

  draw(ctx) {
    for (const e of this.enemies) if (e.alive) e.draw(ctx);
  }

  #build() {
    const { cols, rows, spacingX, spacingY, startY } = CONFIG.fleet;
    const gridWidth = (cols - 1) * spacingX + CONFIG.enemy.width;
    const startX = (CONFIG.width - gridWidth) / 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        this.enemies.push(new Enemy(startX + col * spacingX, startY + row * spacingY, row, col));
      }
    }
  }

  #currentSpeed(aliveCount) {
    const { cols, rows, baseSpeed, speedGainPerKill, speedGainPerLevel } = CONFIG.fleet;
    const killed = cols * rows - aliveCount;
    return baseSpeed + killed * speedGainPerKill + (this.level - 1) * speedGainPerLevel;
  }

  #nextShootDelay() {
    const { shootIntervalMin, shootIntervalMax } = CONFIG.fleet;
    return shootIntervalMin + Math.random() * (shootIntervalMax - shootIntervalMin);
  }

  #updateShooting(dt, alive) {
    this.shootTimer -= dt;
    if (this.shootTimer > 0) return [];
    this.shootTimer = this.#nextShootDelay();

    // Only the lowest enemy of each column can shoot.
    const shooters = new Map();
    for (const e of alive) {
      const current = shooters.get(e.col);
      if (!current || e.y > current.y) shooters.set(e.col, e);
    }
    const candidates = [...shooters.values()];
    const shooter = candidates[Math.floor(Math.random() * candidates.length)];

    const { width, enemySpeed } = CONFIG.bullet;
    return [
      new Bullet(
        shooter.x + (shooter.width - width) / 2,
        shooter.y + shooter.height,
        enemySpeed,
        CONFIG.colors.enemyBullet,
      ),
    ];
  }
}
