const BLOCKED_KEYS = new Set(['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown']);

/**
 * Keyboard and on-screen controls feed the same state, so the game only
 * ever asks "is Space down?" and never cares where the press came from.
 */
export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();

    window.addEventListener('keydown', (e) => {
      if (BLOCKED_KEYS.has(e.code)) e.preventDefault();
      this.press(e.code);
    });

    window.addEventListener('keyup', (e) => this.release(e.code));
    window.addEventListener('blur', () => this.down.clear());
  }

  press(code) {
    if (!this.down.has(code)) this.pressed.add(code);
    this.down.add(code);
  }

  release(code) {
    this.down.delete(code);
  }

  /** Press or release a key from code (used by on-screen controls). */
  setKey(code, isDown) {
    if (isDown) this.press(code);
    else this.release(code);
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

  /**
   * A left/right pad. The finger's horizontal position decides the side, so
   * sliding from one half to the other switches direction without lifting.
   */
  bindDirectionPad(pad, leftCode, rightCode) {
    const sides = new Map(); // pointerId -> leftCode | rightCode
    const leftButton = pad.querySelector(`[data-key="${leftCode}"]`);
    const rightButton = pad.querySelector(`[data-key="${rightCode}"]`);

    const sideOf = (e) => {
      const rect = pad.getBoundingClientRect();
      return e.clientX < rect.left + rect.width / 2 ? leftCode : rightCode;
    };

    const apply = () => {
      const held = [...sides.values()];
      const left = held.includes(leftCode);
      const right = held.includes(rightCode);
      this.#hold(leftCode, left);
      this.#hold(rightCode, right);
      leftButton?.classList.toggle('active', left);
      rightButton?.classList.toggle('active', right);
    };

    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      pad.setPointerCapture?.(e.pointerId);
      sides.set(e.pointerId, sideOf(e));
      apply();
    });

    pad.addEventListener('pointermove', (e) => {
      if (!sides.has(e.pointerId)) return;
      sides.set(e.pointerId, sideOf(e));
      apply();
    });

    const end = (e) => {
      if (sides.delete(e.pointerId)) apply();
    };
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);
    pad.addEventListener('lostpointercapture', end);
    pad.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  #hold(code, held) {
    this.setKey(code, held);
  }
}
