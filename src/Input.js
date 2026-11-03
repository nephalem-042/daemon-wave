const BLOCKED_KEYS = new Set(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();

    window.addEventListener('keydown', (e) => {
      if (BLOCKED_KEYS.has(e.code)) e.preventDefault();
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);
    });

    window.addEventListener('keyup', (e) => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
  }

  isDown(code) {
    return this.down.has(code);
  }

  /** True only on the frame the key went down. */
  wasPressed(code) {
    return this.pressed.has(code);
  }

  /** Horizontal axis: -1 (left), 0, or 1 (right). */
  get axis() {
    const left = this.isDown('ArrowLeft') || this.isDown('KeyA');
    const right = this.isDown('ArrowRight') || this.isDown('KeyD');
    return Number(right) - Number(left);
  }

  /** Call once at the end of every frame. */
  endFrame() {
    this.pressed.clear();
  }
}
