# Daemon Wave

A small fixed-shooter arcade game in plain JavaScript (ES modules + Canvas). You are a hacker with an ICE-breaker, purging waves of hostile daemons. No build step.

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

ES modules do not work from `file://`, so a local server is required.

## Controls

- Move: Arrow keys or A / D
- Fire: Space
- Mute: M

## Mobile

On phones and tablets the game switches to touch mode: ◀ ▶ buttons to move, a big FIRE button (hold it for the beam) and a SOUND button. Tapping the screen also starts a run. The layout adapts to portrait and landscape.

To try touch mode on a desktop, open the page with `?touch=1` (for example `http://localhost:8000/?touch=1`).

## Power-ups

Destroyed enemies sometimes drop a power-up. Catch it with your ship.

- **F (Fork)**: two copies of your ship fly beside you and fire with you for a while.
- **W (Firewall)**: three barriers appear in front of you and absorb enemy fire until they break.
- **B (Beam)**: hold Space to fire a continuous beam that destroys everything in its column. It has 3 seconds of charge, spent only while firing.

Drop chance, durations, distances and barrier health live in `powerups` inside `src/config.js`.

## Structure

- `src/Game.js`: game loop, states, collisions
- `src/Input.js`: keyboard handling
- `src/PowerUps.js`: state of active power-ups (fork copies, barriers, beam charge)
- `src/Sfx.js`: procedural sound effects (Web Audio, no audio files)
- `src/config.js`: all tunable values (colors, speeds, glyphs)
- `src/entities/`: `Entity` → `Ship` → `Player` / `Enemy`, plus `Bullet` and `Fleet`
- `src/ui/`: `Hud` (stats and overlay messages), `Background` and `TouchControls` (on-screen buttons)
