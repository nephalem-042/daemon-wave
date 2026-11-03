import { CONFIG } from '../config.js';

const FONT = `16px ${CONFIG.font}`;

export class Hud {
  drawStats(ctx, { score, highScore, lives, level }) {
    ctx.font = FONT;
    ctx.fillStyle = CONFIG.colors.text;
    ctx.textBaseline = 'top';

    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${score}`, 12, 10);
    ctx.fillText(`INTEGRITY ${'■'.repeat(Math.max(0, lives))}`, 12, 32);

    ctx.textAlign = 'right';
    ctx.fillText(`HI ${highScore}`, CONFIG.width - 12, 10);
    ctx.fillText(`WAVE ${level}`, CONFIG.width - 12, 32);
  }

  drawMessage(ctx, title, subtitle) {
    ctx.fillStyle = CONFIG.colors.overlay;
    ctx.fillRect(0, 0, CONFIG.width, CONFIG.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.save();
    ctx.fillStyle = CONFIG.colors.title;
    ctx.shadowColor = CONFIG.colors.title;
    ctx.shadowBlur = 14;
    ctx.font = `bold 38px ${CONFIG.font}`;
    ctx.fillText(title, CONFIG.width / 2, CONFIG.height / 2 - 20);
    ctx.restore();

    ctx.fillStyle = CONFIG.colors.text;
    ctx.font = FONT;
    ctx.fillText(subtitle, CONFIG.width / 2, CONFIG.height / 2 + 24);
  }
}
