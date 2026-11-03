import { Ship } from './Ship.js';
import { CONFIG } from '../config.js';

/** A hostile program, drawn as a glyph. Which glyph depends on its row. */
export class Enemy extends Ship {
  constructor(x, y, row, col) {
    super(x, y, CONFIG.enemy.width, CONFIG.enemy.height, CONFIG.enemy.rowColors[row]);
    this.row = row;
    this.col = col;
    this.points = CONFIG.enemy.rowPoints[row];
    this.glyph = CONFIG.enemy.rowGlyphs[row];
  }

  draw(ctx) {
    ctx.save();
    ctx.font = `bold 18px ${CONFIG.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillText(this.glyph, this.x + this.width / 2, this.y + this.height / 2);
    ctx.restore();
  }
}
