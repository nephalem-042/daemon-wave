import { Ship } from './Ship.js';
import { Bullet } from './Bullet.js';
import { CONFIG } from '../config.js';

/** The hacker's ICE-breaker: a chevron at the bottom of the screen. */
export class Player extends Ship {
  constructor() {
    const { width, height, bottomMargin } = CONFIG.player;
    super(
      (CONFIG.width - width) / 2,
      CONFIG.height - height - bottomMargin,
      width,
      height,
      CONFIG.colors.player,
    );
    this.direction = 0;
    this.cooldown = 0;
    this.invulnerable = 0;
  }

  get isInvulnerable() {
    return this.invulnerable > 0;
  }

  update(dt) {
    this.x += this.direction * CONFIG.player.speed * dt;
    this.x = Math.max(0, Math.min(CONFIG.width - this.width, this.x));
    this.cooldown = Math.max(0, this.cooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);
  }

  /** Returns a new Bullet, or null while the weapon is cooling down. */
  tryShoot() {
    if (this.cooldown > 0) return null;
    this.cooldown = CONFIG.player.cooldown;
    const { width, height, playerSpeed } = CONFIG.bullet;
    return new Bullet(
      this.x + (this.width - width) / 2,
      this.y - height,
      -playerSpeed,
      CONFIG.colors.playerBullet,
    );
  }

  hit() {
    this.invulnerable = CONFIG.player.invulnerableTime;
  }

  draw(ctx) {
    // Blink while invulnerable.
    if (this.isInvulnerable && Math.floor(this.invulnerable * 10) % 2 === 0) return;

    const { x, y, width, height } = this;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width / 2, y + height - 6);
    ctx.lineTo(x, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
