import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

/** A power-up falling from a destroyed enemy. Touch it with the player to collect. */
export class Pickup extends Entity {
  constructor(centerX, centerY, type) {
    const size = CONFIG.powerups.pickupSize;
    super(centerX - size / 2, centerY - size / 2, size, size);
    this.type = type;
  }

  update(dt) {
    this.y += CONFIG.powerups.fallSpeed * dt;
    if (this.y > CONFIG.height) this.alive = false;
  }

  draw(ctx) {
    const { label, color } = CONFIG.powerups.types[this.type];

    ctx.save();
    ctx.fillStyle = CONFIG.colors.background;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeRect(this.x + 1, this.y + 1, this.width - 2, this.height - 2);

    ctx.shadowBlur = 0;
    ctx.fillStyle = color;
    ctx.font = `bold 15px ${CONFIG.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, this.x + this.width / 2, this.y + this.height / 2 + 1);
    ctx.restore();
  }
}
