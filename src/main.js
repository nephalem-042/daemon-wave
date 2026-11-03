import { CONFIG } from './config.js';
import { Game } from './Game.js';
import { TouchControls } from './ui/TouchControls.js';

const MAX_PIXEL_RATIO = 2; // sharper on phones without a huge fill-rate cost

// ?touch=1 forces touch mode and ?touch=0 forces desktop mode (handy for testing).
const touchParam = new URLSearchParams(location.search).get('touch');
const touchForced = touchParam === '1' || touchParam === '0';

/** Best guess before any input: touch is the main input and no mouse or trackpad is around. */
function guessTouch() {
  if (touchParam === '1') return true;
  if (touchParam === '0') return false;
  return (
    window.matchMedia('(hover: none) and (pointer: coarse)').matches &&
    !window.matchMedia('(any-pointer: fine)').matches
  );
}

let touch = guessTouch();
document.documentElement.classList.toggle('touch', touch);

const canvas = document.getElementById('game');
const stage = canvas.parentElement;
const game = new Game(canvas, { touch });

/** Switch layouts when the real input device is different from the guess. */
function setTouchMode(on) {
  if (touchForced || on === touch) return;
  touch = on;
  document.documentElement.classList.toggle('touch', on);
  game.setTouch(on);
}

window.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') setTouchMode(true);
  else if (e.pointerType === 'mouse') setTouchMode(false);
});
window.addEventListener('keydown', () => setTouchMode(false));

/** Scale the canvas to the biggest 3:4 box that fits the stage, rendered crisply. */
function fitCanvas() {
  const scale = Math.min(stage.clientWidth / CONFIG.width, stage.clientHeight / CONFIG.height);
  if (!(scale > 0)) return;

  const cssWidth = Math.floor(CONFIG.width * scale);
  const cssHeight = Math.floor(CONFIG.height * scale);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
  game.setRenderScale((cssWidth * pixelRatio) / CONFIG.width);
}

new ResizeObserver(fitCanvas).observe(stage);
window.addEventListener('resize', fitCanvas);
fitCanvas();

// The pad reads touches itself so a finger can slide between left and right.
const pad = document.querySelector('.pad');
if (pad) game.input.bindDirectionPad(pad, 'ArrowLeft', 'ArrowRight');
// FIRE and SOUND are plain hold-to-press buttons.
new TouchControls(game.input, document.querySelector('.action'));

game.start();
