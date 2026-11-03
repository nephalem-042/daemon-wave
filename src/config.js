export const CONFIG = {
  width: 480,
  height: 640,

  colors: {
    background: '#07050f',
    grid: 'rgba(0, 229, 255, 0.07)',
    text: '#e6f9ff',
    title: '#00e5ff',
    muted: '#8a7fa8',
    player: '#00e5ff',
    playerBullet: '#e6f9ff',
    enemyBullet: '#ff2e97',
    overlay: 'rgba(7, 5, 15, 0.8)',
  },

  font: 'ui-monospace, "DejaVu Sans Mono", monospace',

  player: {
    width: 36,
    height: 20,
    speed: 280,
    cooldown: 0.45,
    lives: 3,
    invulnerableTime: 1.5,
    bottomMargin: 30,
  },

  bullet: {
    width: 4,
    height: 12,
    playerSpeed: 520,
    enemySpeed: 240,
  },

  enemy: {
    width: 32,
    height: 18,
    // One entry per fleet row, top to bottom.
    rowGlyphs: ['<%>', '{#}', '[x]', '/0\\'],
    rowColors: ['#ff2e97', '#f5e642', '#b57bff', '#39ff88'],
    rowPoints: [40, 30, 20, 10],
  },

  powerups: {
    // Chance (0 to 1) that a destroyed enemy drops a power-up.
    dropChance: 0.03,
    fallSpeed: 110,
    pickupSize: 24,

    // Pickup look. Drop type is chosen at random from these keys.
    types: {
      fork: { label: 'F', color: '#00e5ff' },
      firewall: { label: 'W', color: '#39ff88' },
      beam: { label: 'B', color: '#f5e642' },
    },

    // Two copies of your ship that mirror you and fire when you fire.
    fork: {
      duration: 10, // seconds
      offset: 70, // px between you and each copy
      warnBelow: 2, // seconds left when the copies start blinking
    },

    // Barriers in front of you that absorb enemy fire.
    firewall: {
      count: 3,
      hits: 3, // hits each barrier can take
      width: 70,
      height: 12,
      distanceAbovePlayer: 70,
    },

    // Hold Space to fire a continuous beam. Charge only drains while firing.
    beam: {
      duration: 3, // seconds of beam time
      width: 10,
    },
  },

  fleet: {
    cols: 8,
    rows: 4,
    spacingX: 44,
    spacingY: 36,
    startY: 70,
    sideMargin: 12,
    baseSpeed: 30,
    speedGainPerKill: 3.5,
    speedGainPerLevel: 8,
    descend: 18,
    shootIntervalMin: 0.6,
    shootIntervalMax: 1.6,
  },
};
