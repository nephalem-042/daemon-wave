import { Entity } from './Entity.js';
import { CONFIG } from '../config.js';

/** A vertical beam from a ship to the top of the screen. Lives for one frame. */
export class Beam extends Entity {
  constructor(source) {
    const width = CONFIG.powerups.beam.width;
    super(source.x + (source.width - width) / 2, 0, width, source.y);
  }

  draw(ctx) {
    const color = CONFIG.powerups.types.beam.color;
    const flicker = 0.8 + Math.random() * 0.4;
    const width = this.width * flicker;
    const centerX = this.x + this.width / 2;

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = color;
    ctx.fillRect(centerX - width / 2, this.y, width, this.height);

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 1.5, this.y, 3, this.height);
    ctx.restore();
  }
}
