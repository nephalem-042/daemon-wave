import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

export class Bullet extends Entity {
  /** @param {number} vy vertical velocity in px/s (negative goes up) */
  constructor(x, y, vy, color) {
    super(x, y, CONFIG.bullet.width, CONFIG.bullet.height);
    this.vy = vy;
    this.color = color;
  }

  /** A bullet leaving the top-center of a ship. */
  static fromShip(ship, vy, color) {
    const { width, height } = CONFIG.bullet;
    return new Bullet(ship.x + (ship.width - width) / 2, ship.y - height, vy, color);
  }

  update(dt) {
    this.y += this.vy * dt;
    if (this.y + this.height < 0 || this.y > CONFIG.height) this.alive = false;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
