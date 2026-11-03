import { CONFIG } from './config.js';
import { Input } from './Input.js';
import { Player } from './entities/Player.js';
import { Fleet } from './entities/Fleet.js';
import { Hud } from './ui/Hud.js';
import { Background } from './ui/Background.js';

const STATE = { START: 'start', PLAYING: 'playing', GAME_OVER: 'gameover' };
const HIGH_SCORE_KEY = 'daemonwave.highScore';
const MAX_FRAME_TIME = 0.05; // seconds; avoids huge jumps after a tab switch

export class Game {
  constructor(canvas) {
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;

    this.ctx = canvas.getContext('2d');
    this.input = new Input();
    this.hud = new Hud();
    this.background = new Background();

    this.state = STATE.START;
    this.highScore = this.#loadHighScore();
    this.lastTime = 0;

    this.#resetRun();
  }

  start() {
    requestAnimationFrame((t) => {
      this.lastTime = t;
      this.#loop(t);
    });
  }

  #loop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, MAX_FRAME_TIME);
    this.lastTime = time;

    this.#update(dt);
    this.#draw();
    this.input.endFrame();

    requestAnimationFrame((t) => this.#loop(t));
  }

  #resetRun() {
    this.score = 0;
    this.lives = CONFIG.player.lives;
    this.level = 1;
    this.player = new Player();
    this.fleet = new Fleet(this.level);
    this.playerBullets = [];
    this.enemyBullets = [];
  }

  #update(dt) {
    if (this.state !== STATE.PLAYING) {
      if (this.input.wasPressed('Space') || this.input.wasPressed('Enter')) {
        this.#resetRun();
        this.state = STATE.PLAYING;
      }
      return;
    }

    this.player.direction = this.input.axis;
    this.player.update(dt);

    if (this.input.isDown('Space')) {
      const bullet = this.player.tryShoot();
      if (bullet) this.playerBullets.push(bullet);
    }

    this.enemyBullets.push(...this.fleet.update(dt));
    for (const b of this.playerBullets) b.update(dt);
    for (const b of this.enemyBullets) b.update(dt);

    this.#handleCollisions();
    this.#cleanup();
    this.#checkProgress();
  }

  #handleCollisions() {
    for (const bullet of this.playerBullets) {
      for (const enemy of this.fleet.aliveEnemies) {
        if (bullet.alive && bullet.intersects(enemy)) {
          bullet.alive = false;
          enemy.alive = false;
          this.score += enemy.points;
        }
      }
    }

    if (this.player.isInvulnerable) return;
    for (const bullet of this.enemyBullets) {
      if (bullet.alive && bullet.intersects(this.player)) {
        bullet.alive = false;
        this.lives -= 1;
        this.player.hit();
        break;
      }
    }
  }

  #cleanup() {
    this.playerBullets = this.playerBullets.filter((b) => b.alive);
    this.enemyBullets = this.enemyBullets.filter((b) => b.alive);
  }

  #checkProgress() {
    if (this.lives <= 0 || this.fleet.bottom >= this.player.y) {
      this.#endRun();
      return;
    }

    if (this.fleet.isCleared) {
      this.level += 1;
      this.fleet = new Fleet(this.level);
      this.playerBullets = [];
      this.enemyBullets = [];
    }
  }

  #endRun() {
    this.state = STATE.GAME_OVER;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.#saveHighScore();
    }
  }

  #draw() {
    const { ctx } = this;
    this.background.draw(ctx);

    this.fleet.draw(ctx);
    this.player.draw(ctx);
    for (const b of this.playerBullets) b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);

    this.hud.drawStats(ctx, {
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
    });

    if (this.state === STATE.START) {
      this.hud.drawMessage(ctx, 'DAEMON WAVE', 'Press Space to jack in');
    } else if (this.state === STATE.GAME_OVER) {
      this.hud.drawMessage(ctx, 'CONNECTION LOST', `Score ${this.score}. Press Space to reconnect`);
    }
  }

  #loadHighScore() {
    try {
      return Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
    } catch {
      return 0;
    }
  }

  #saveHighScore() {
    try {
      localStorage.setItem(HIGH_SCORE_KEY, String(this.highScore));
    } catch {
      // Storage can be unavailable (private mode); the score just won't persist.
    }
  }
}
