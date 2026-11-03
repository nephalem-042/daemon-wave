/**
 * Wires on-screen buttons to the Input class. Each element with a data-key
 * attribute acts as that keyboard key while it is held down.
 */
export class TouchControls {
  constructor(input, root = document) {
    for (const button of root.querySelectorAll('[data-key]')) {
      this.#bind(button, input);
    }
  }

  #bind(button, input) {
    const code = button.dataset.key;

    const press = (e) => {
      e.preventDefault();
      button.setPointerCapture?.(e.pointerId);
      input.setKey(code, true);
      button.classList.add('active');
    };

    const release = () => {
      input.setKey(code, false);
      button.classList.remove('active');
    };

    button.addEventListener('pointerdown', press);
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    // Long-press would otherwise open the browser's context menu.
    button.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}
