import { Ship } from './Ship.js';
import { Bullet } from './Bullet.js';
import { drawChevron } from './chevron.js';
import { CONFIG } from '../config.js';

/** A copy of the player's ship that mirrors its position and fires with it. */
export class Clone extends Ship {
  /** @param {-1|1} side which side of the player the copy sits on */
  constructor(side) {
    const { width, height } = CONFIG.player;
    super(0, 0, width, height, CONFIG.powerups.types.fork.color);
    this.side = side;
    this.expiring = false;
  }

  follow(player) {
    const x = player.x + this.side * CONFIG.powerups.fork.offset;
    this.x = Math.max(0, Math.min(CONFIG.width - this.width, x));
    this.y = player.y;
  }

  createBullet() {
    return Bullet.fromShip(this, -CONFIG.bullet.playerSpeed, CONFIG.colors.playerBullet);
  }

  draw(ctx) {
    // Blink when the power-up is about to run out.
    if (this.expiring && Math.floor(performance.now() / 120) % 2 === 0) return;
    drawChevron(ctx, this, this.color, 0.65);
  }
}
