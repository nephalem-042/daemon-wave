import { CONFIG } from './config.js';
import { Game } from './Game.js';
import { TouchControls } from './ui/TouchControls.js';

const MAX_PIXEL_RATIO = 2; // sharper on phones without a huge fill-rate cost

// Touch mode on phones and tablets, or on any device with ?touch=1 (handy for testing).
const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const forcedTouch = new URLSearchParams(location.search).get('touch') === '1';
const touch = isTouchDevice || forcedTouch;
document.documentElement.classList.toggle('touch', touch);

const canvas = document.getElementById('game');
const stage = canvas.parentElement;
const game = new Game(canvas, { touch });

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
