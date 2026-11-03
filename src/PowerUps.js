import { CONFIG } from './config.js';
import { Clone } from './entities/Clone.js';
import { Barrier } from './entities/Barrier.js';

/** Holds the state of every active power-up. Game decides when things happen. */
export class PowerUps {
  constructor() {
    this.reset();
  }

  reset() {
    this.forkTimeLeft = 0;
    this.beamEnergy = 0; // seconds of beam time left
    this.clones = [];
    this.barriers = [];
  }

  get hasBeam() {
    return this.beamEnergy > 0;
  }

  /** Beam charge from 0 to 1. */
  get beamCharge() {
    return this.beamEnergy / CONFIG.powerups.beam.duration;
  }

  collect(type, player) {
    switch (type) {
      case 'fork':
        this.#activateFork(player);
        break;
      case 'firewall':
        this.#raiseBarriers(player);
        break;
      case 'beam':
        this.beamEnergy = CONFIG.powerups.beam.duration;
        break;
    }
  }

  drainBeam(dt) {
    this.beamEnergy = Math.max(0, this.beamEnergy - dt);
  }

  update(dt, player) {
    if (this.forkTimeLeft > 0) {
      this.forkTimeLeft = Math.max(0, this.forkTimeLeft - dt);
      if (this.forkTimeLeft === 0) this.clones = [];
    }

    const expiring = this.forkTimeLeft < CONFIG.powerups.fork.warnBelow;
    for (const clone of this.clones) {
      clone.follow(player);
      clone.expiring = expiring;
    }

    this.barriers = this.barriers.filter((b) => b.alive);
  }

  /** Everything that fires: the player plus any copies. */
  shooters(player) {
    return [player, ...this.clones];
  }

  #activateFork(player) {
    this.forkTimeLeft = CONFIG.powerups.fork.duration;
    if (this.clones.length === 0) {
      this.clones = [new Clone(-1), new Clone(1)];
    }
    for (const clone of this.clones) clone.follow(player);
  }

  #raiseBarriers(player) {
    const { count, width, distanceAbovePlayer } = CONFIG.powerups.firewall;
    const y = player.y - distanceAbovePlayer;
    this.barriers = Array.from({ length: count }, (_, i) => {
      const centerX = (CONFIG.width * (2 * i + 1)) / (2 * count);
      return new Barrier(centerX - width / 2, y);
    });
  }
}
