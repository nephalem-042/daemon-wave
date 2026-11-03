import { CONFIG } from '../config.js';

const CELL = 40;

/** Static dark backdrop with a faint grid. */
export class Background {
  draw(ctx) {
    ctx.fillStyle = CONFIG.colors.background;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    ctx.strokeStyle = CONFIG.colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = CELL; x < CONFIG.width; x += CELL) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, CONFIG.height);
    }
    for (let y = CELL; y < CONFIG.height; y += CELL) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(CONFIG.width, y + 0.5);
    }
    ctx.stroke();
  }
}
