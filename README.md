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

## Structure

- `src/Game.js`: game loop, states, collisions
- `src/Input.js`: keyboard handling
- `src/config.js`: all tunable values (colors, speeds, glyphs)
- `src/entities/`: `Entity` → `Ship` → `Player` / `Enemy`, plus `Bullet` and `Fleet`
- `src/ui/`: `Hud` (stats and overlay messages) and `Background`
