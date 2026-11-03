import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

/** A firewall block. Drawn as segments; each hit removes one. */
export class Barrier extends Entity {
  constructor(x, y) {
    const { width, height, hits } = CONFIG.powerups.firewall;
    super(x, y, width, height);
    this.maxHits = hits;
    this.hits = hits;
  }

  hit() {
    this.hits -= 1;
    if (this.hits <= 0) this.alive = false;
  }

  draw(ctx) {
    const color = CONFIG.powerups.types.firewall.color;
    const segmentWidth = this.width / this.maxHits;

    ctx.save();
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    for (let i = 0; i < this.hits; i++) {
      ctx.fillRect(this.x + i * segmentWidth + 1, this.y, segmentWidth - 2, this.height);
    }
    ctx.restore();
  }
}
