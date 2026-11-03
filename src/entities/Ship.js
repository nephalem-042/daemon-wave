import { Entity } from './Entity.js';

/** Base class for anything that is a ship: has a color and a default look. */
export class Ship extends Entity {
  constructor(x, y, width, height, color) {
    super(x, y, width, height);
    this.color = color;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
