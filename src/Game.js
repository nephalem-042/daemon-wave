import { CONFIG } from './config.js';
import { Input } from './Input.js';
import { Sfx } from './Sfx.js';
import { PowerUps } from './PowerUps.js';
import { Player } from './entities/Player.js';
import { Fleet } from './entities/Fleet.js';
import { Beam } from './entities/Beam.js';
import { Pickup } from './entities/Pickup.js';
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
    this.sfx = new Sfx();
    this.background = new Background();

    this.state = STATE.START;
    this.highScore = this.#loadHighScore();
    this.lastTime = 0;

    // Browsers only start audio after a user gesture.
    window.addEventListener('keydown', () => this.sfx.unlock());
    window.addEventListener('pointerdown', () => this.sfx.unlock());

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
    this.powerUps = new PowerUps();
    this.playerBullets = [];
    this.enemyBullets = [];
    this.pickups = [];
    this.beams = [];
  }

  // ---------- update ----------

  #update(dt) {
    if (this.input.wasPressed('KeyM')) this.sfx.toggleMute();

    if (this.state !== STATE.PLAYING) {
      if (this.input.wasPressed('Space') || this.input.wasPressed('Enter')) {
        this.#resetRun();
        this.state = STATE.PLAYING;
        this.sfx.start();
      }
      return;
    }

    this.player.direction = this.input.axis;
    this.player.update(dt);
    this.powerUps.update(dt, this.player);

    this.#handleFiring(dt);

    this.enemyBullets.push(...this.fleet.update(dt));
    for (const b of this.playerBullets) b.update(dt);
    for (const b of this.enemyBullets) b.update(dt);
    for (const p of this.pickups) p.update(dt);

    this.#handleCollisions();
    this.#cleanup();
    this.#checkProgress();
  }

  #handleFiring(dt) {
    this.beams = [];
    const firing = this.input.isDown('Space');
    const beamOn = firing && this.powerUps.hasBeam;
    this.sfx.setBeam(beamOn);

    if (beamOn) {
      this.powerUps.drainBeam(dt);
      this.beams = this.powerUps.shooters(this.player).map((s) => new Beam(s));
    } else if (firing) {
      this.#fireBullets();
    }
  }

  #fireBullets() {
    const bullet = this.player.tryShoot();
    if (!bullet) return;

    this.playerBullets.push(bullet);
    for (const clone of this.powerUps.clones) {
      this.playerBullets.push(clone.createBullet());
    }
    this.sfx.shoot();
  }

  // ---------- collisions ----------

  #handleCollisions() {
    this.#playerBulletsVsEnemies();
    this.#beamsVsTargets();
    this.#enemyBulletsVsBarriers();
    this.#enemyBulletsVsPlayer();
    this.#playerVsPickups();
  }

  #playerBulletsVsEnemies() {
    for (const bullet of this.playerBullets) {
      for (const enemy of this.fleet.aliveEnemies) {
        if (bullet.alive && bullet.intersects(enemy)) {
          bullet.alive = false;
          this.#destroyEnemy(enemy);
        }
      }
    }
  }

  /** Beams destroy every enemy in their path and also wipe out enemy fire. */
  #beamsVsTargets() {
    for (const beam of this.beams) {
      for (const enemy of this.fleet.aliveEnemies) {
        if (beam.intersects(enemy)) this.#destroyEnemy(enemy);
      }
      for (const bullet of this.enemyBullets) {
        if (bullet.alive && beam.intersects(bullet)) bullet.alive = false;
      }
    }
  }

  #enemyBulletsVsBarriers() {
    for (const bullet of this.enemyBullets) {
      if (!bullet.alive) continue;
      for (const barrier of this.powerUps.barriers) {
        if (barrier.alive && bullet.intersects(barrier)) {
          bullet.alive = false;
          barrier.hit();
          this.sfx.barrierHit();
          break;
        }
      }
    }
  }

  #enemyBulletsVsPlayer() {
    if (this.player.isInvulnerable) return;
    for (const bullet of this.enemyBullets) {
      if (bullet.alive && bullet.intersects(this.player)) {
        bullet.alive = false;
        this.lives -= 1;
        this.player.hit();
        this.sfx.playerHit();
        break;
      }
    }
  }

  #playerVsPickups() {
    for (const pickup of this.pickups) {
      if (pickup.alive && pickup.intersects(this.player)) {
        pickup.alive = false;
        this.powerUps.collect(pickup.type, this.player);
        this.sfx.powerUp();
      }
    }
  }

  #destroyEnemy(enemy) {
    enemy.alive = false;
    this.score += enemy.points;
    this.sfx.enemyDestroyed();
    this.#maybeDropPickup(enemy);
  }

  #maybeDropPickup(enemy) {
    const { dropChance, types } = CONFIG.powerups;
    if (Math.random() >= dropChance) return;

    const names = Object.keys(types);
    const type = names[Math.floor(Math.random() * names.length)];
    this.pickups.push(
      new Pickup(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, type),
    );
  }

  // ---------- run progress ----------

  #cleanup() {
    this.playerBullets = this.playerBullets.filter((b) => b.alive);
    this.enemyBullets = this.enemyBullets.filter((b) => b.alive);
    this.pickups = this.pickups.filter((p) => p.alive);
  }

  #checkProgress() {
    if (this.lives <= 0 || this.fleet.bottom >= this.player.y) {
      this.#endRun();
      return;
    }

    if (this.fleet.isCleared) {
      this.level += 1;
      this.sfx.waveClear();
      this.fleet = new Fleet(this.level);
      this.playerBullets = [];
      this.enemyBullets = [];
      this.pickups = [];
    }
  }

  #endRun() {
    this.state = STATE.GAME_OVER;
    this.sfx.setBeam(false);
    this.sfx.gameOver();
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.#saveHighScore();
    }
  }

  // ---------- draw ----------

  #draw() {
    const { ctx } = this;
    this.background.draw(ctx);

    for (const barrier of this.powerUps.barriers) if (barrier.alive) barrier.draw(ctx);
    this.fleet.draw(ctx);
    for (const pickup of this.pickups) pickup.draw(ctx);
    for (const beam of this.beams) beam.draw(ctx);
    for (const clone of this.powerUps.clones) clone.draw(ctx);
    this.player.draw(ctx);
    for (const b of this.playerBullets) b.draw(ctx);
    for (const b of this.enemyBullets) b.draw(ctx);

    this.hud.drawStats(ctx, {
      score: this.score,
      highScore: this.highScore,
      lives: this.lives,
      level: this.level,
      muted: this.sfx.muted,
    });
    this.hud.drawStatus(ctx, this.#statusLines());

    if (this.state === STATE.START) {
      this.hud.drawMessage(ctx, 'DAEMON WAVE', 'Press Space to jack in');
    } else if (this.state === STATE.GAME_OVER) {
      this.hud.drawMessage(ctx, 'CONNECTION LOST', `Score ${this.score}. Press Space to reconnect`);
    }
  }

  #statusLines() {
    const { types } = CONFIG.powerups;
    const lines = [];
    if (this.powerUps.forkTimeLeft > 0) {
      lines.push({
        text: `FORK ${Math.ceil(this.powerUps.forkTimeLeft)}s`,
        color: types.fork.color,
      });
    }
    if (this.powerUps.hasBeam) {
      lines.push({
        text: `BEAM ${Math.round(this.powerUps.beamCharge * 100)}%`,
        color: types.beam.color,
      });
    }
    return lines;
  }

  // ---------- persistence ----------

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
