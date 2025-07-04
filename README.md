# # Neon Tower-Defense Shooter

A browser-based 2D tower-defense shooter with an infinite wave survival format and stunning neon synthwave aesthetics.

## 🎮 Game Features

- **Infinite Wave Survival**: Face increasingly difficult waves of enemies
- **Power-Up System**: Choose from 16+ upgrades between waves (damage, fire rate, piercing shots, shields, etc.)
- **Neon Aesthetics**: Synthwave-inspired visuals with glowing effects
- **Responsive Controls**: Mouse/touch aiming with smooth gameplay
- **Screen Effects**: Screen shake, particle explosions, floating damage text
- **Mobile Support**: Touch controls and responsive design

## 🚀 Quick Start

1. **Install dependencies** (requires Node.js):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open your browser** to `http://localhost:8080`

## 🎯 How to Play

- **Aim**: Move your mouse to aim your character
- **Shoot**: Click and hold or press Spacebar to fire
- **Survive**: Destroy enemies before they reach the center
- **Upgrade**: Choose power-ups between waves to get stronger
- **Pause**: Press 'P' to pause the game

## 🛠️ Development

### Project Structure

```
/project-root
│  index.html         ← Main HTML page
│  style.css          ← Neon styling and layout
│  package.json       ← Dependencies and scripts
└─ /js
   ├─ main.js         ← Entry point and game loop
   ├─ Game.js         ← Core game logic and wave management
   ├─ Player.js       ← Player character and abilities
   ├─ Enemy.js        ← Enemy behavior and AI
   ├─ Projectile.js   ← Bullet physics and effects
   ├─ PowerUp.js      ← Upgrade system
   └─ Particle.js     ← Visual effects and particles
```

### Key Technologies

- **HTML5 Canvas**: 2D rendering and game graphics
- **ES6 Modules**: Clean, modular JavaScript code
- **CSS3**: Neon glow effects and responsive design
- **Web Audio API**: Sound effects and music (optional)

### Adding New Features

#### New Power-Ups
Add to `PowerUp.js`:
```javascript
new PowerUp(
    "Your Power Name",
    "Description of effect", 
    "🎯", // Icon
    (player) => {
        // Modify player properties
        player.damageMod *= 2;
    },
    2 // Weight (1=rare, 3=common)
)
```

#### New Enemy Types
Extend `Enemy.js`:
```javascript
static createNewEnemyType(x, y, waveScale = 1) {
    const enemy = new Enemy(x, y, speed, health, damage);
    enemy.color = '#f0f';
    enemy.specialAbility = true;
    return enemy;
}
```

## 🎨 Customization

### Visual Theme
- Colors defined in `style.css` using CSS custom properties
- Glow effects use `text-shadow` and `box-shadow`
- Canvas rendering uses `shadowBlur` for neon effects

### Game Balance
- Enemy scaling: Modify `healthScale`, `speedScale` in `Game.js`
- Power-up weights: Adjust in `PowerUp.js`
- Player stats: Base values in `Player.js`

## 📱 Mobile Support

The game automatically detects touch devices and provides:
- Touch-to-aim controls
- Responsive canvas scaling
- Optimized UI for small screens

## 🔊 Audio (Optional)

Add audio files to `/assets/`:
- `synthwave.mp3` - Background music
- `shoot.wav` - Gunshot sound
- `explode.wav` - Explosion sound
- `hurt.wav` - Player damage sound
- `powerup.wav` - Upgrade selection sound

The game gracefully handles missing audio files.

## 🐛 Troubleshooting

**Game won't start**: 
- Ensure you're running from a web server (not file://)
- Check browser console for JavaScript errors

**Performance issues**:
- Reduce particle counts in `Game.js`
- Disable glow effects on low-end devices

**Mobile controls not working**:
- Ensure proper touch event handling
- Check viewport meta tag in HTML

## 📄 License

MIT License - feel free to modify and extend!

---

## 🎮 Original Design Document

*The complete technical design and implementation guide follows below...*

---

# 2D Neon Tower-Defense Shooter – Design & Implementation Guide

## Game Overview

This project is a browser-based **2D tower-defense shooter** with an **infinite wave survival** format. The player controls a stationary avatar at the center of the screen, rotating 360° with mouse or touch and firing projectiles to destroy incoming enemies. Each wave spawns enemies around the screen edges that **pathfind toward the center** (the player). Key gameplay features include:

* **Infinite Waves & Scaling** – Each wave spawns more enemies with exponentially increasing health, speed, and damage (e.g. 15% stronger per wave). Enemies are simple shapes or sprites that approach the player directly, forcing continuous target prioritization.
* **Power-Up Choice After Waves** – When a wave is cleared, the game pauses and presents **exactly 3 random power-up cards**. The player picks one to permanently stack its effect (e.g. increased damage, fire rate, piercing shots, radial explosions, slowing fields, life steal, shield recharge, etc.). This “pick one of three” upgrade pattern is common in rogue-lite games to add variety in each run.
* **Losing Condition** – If any enemy reaches the center, it damages the player. The player has 100 HP; reaching 0 triggers a Game Over.
* **Juice & Feedback** – To maximize game feel, the design includes neon-glow visuals, punchy retro sound effects, synthwave background music, floating combat text on hits, screen shake on explosions, and particle spark effects when enemies die.

**Gameplay Loop:** The player survives successive waves by shooting enemies before they reach the center, gaining power-ups between waves that improve their odds against ever-stronger foes. The challenge escalates infinitely, encouraging the player to reach a personal high score (waves survived). *GIF Demo: The player’s neon avatar blasts incoming geometric enemies; explosions flash and the screen shakes as a wave is cleared, then three glowing upgrade cards appear for the player’s choice.* 🎮

## Tech Stack & Folder Structure

We use a **vanilla web tech stack** – HTML5, CSS3, and modern JavaScript (ES6+). No external game engines or frameworks are required; we will rely on the Canvas 2D API and DOM for UI. Development is simplified with a lightweight static server (e.g. using Node’s `live-server` or VS Code Live Server extension) to auto-reload and serve files on `localhost` during coding.

**Key technologies:**

* **HTML5** – Contains the `<canvas>` element for the game and UI elements (health bar, menus) in a minimal page.
* **CSS3** – Styles for the neon aesthetic (background, fonts, glowing effects) and responsive scaling.
* **JavaScript (ES6 Modules)** – All game logic in modular JS files (classes for entities, game loop, input handling, etc.). Using ES6 modules allows clean separation of concerns (e.g. `Player.js`, `Enemy.js`, `Game.js`).

**Folder Structure:**

```
/project-root
│  index.html         ← Main HTML page with canvas and UI divs
│  style.css          ← CSS for visual theme (neon colors, layout)
└─ /js
   ├─ main.js         ← Entry point, initializes Game and handles main loop
   ├─ Game.js         ← Game class (wave management, global update & render)
   ├─ Player.js       ← Player avatar class
   ├─ Enemy.js        ← Enemy class (handles movement toward player)
   ├─ Projectile.js   ← Projectile class (handles movement and collision)
   ├─ PowerUp.js      ← Power-up definitions and logic
   └─ Particle.js     ← Particle class for explosion effects
```

All assets (images, audio) reside in an **assets** folder (ensuring total size < 5 MB for fast loading). The build is extremely simple: just open `index.html` via a local server. No bundler is needed since modern browsers support ES6 modules; the HTML includes `<script type="module" src="js/main.js">` to load the game.

## Rendering Architecture

The game’s rendering uses an HTML5 `<canvas>` for the main action, possibly layered with additional canvases or overlay elements for UI. We maintain a steady **game loop** using `window.requestAnimationFrame` (rAF) to update and redraw the game at the display’s refresh rate. The core loop steps are:

1. **Calculate Delta Time:** When rAF calls our `mainLoop(timestamp)` callback, we compute the time elapsed since the last frame (delta). This is used to make movement and animations frame-rate independent.
2. **Update Entities:** Advance all game objects by one frame. Move enemies toward the player, update projectile positions, handle collisions (e.g. projectile hits or enemy reaching player), and spawn particles for destroyed enemies.
3. **Render Frame:** Clear the canvas, then draw the background, player, all active enemies, projectiles, particles, and UI overlays for the current frame.
4. **Loop Continuation:** Use `requestAnimationFrame(mainLoop)` at the end of each frame to queue the next update. This ensures the game runs at an optimal, browser-coordinated frame rate.

**Delta-Time & Timing:** The timestamp provided by rAF lets us calculate `delta = (currentTime - lastTime)` in milliseconds. We normalize movement by a reference 60 FPS frame (16.67 ms) so the player and enemies move consistently across fast or slow devices. For example, if an enemy’s base speed is 100 pixels/second, in a frame with delta 8ms (120 FPS) it moves \~0.8px, whereas with delta 16ms (60 FPS) it moves \~1.6px – achieving equal distance over time. All velocities and animations are multiplied by `(delta/16.67)` to scale with frame time. (If needed, one could implement a fixed-timestep or cap `delta` to avoid large jumps on slow frames, but in this simple shooter, basic proportional scaling suffices.)

**Canvas Setup:** We typically use a single canvas (`<canvas id="gameCanvas" width="800" height="600">`) that is styled via CSS to expand to the available browser window while maintaining aspect ratio (e.g. using `canvas { width: 100%; height: auto; }`). We obtain the 2D drawing context with `const ctx = canvas.getContext('2d')`. For a crisp look on high-DPI displays, the canvas resolution can be set to `window.devicePixelRatio * CSSSize`. The canvas’s coordinate system (0,0 at top-left) will be used for all game rendering.

**Double-Buffering & Compositing:** The rAF loop inherently uses an off-screen buffer until drawing is complete, then swaps to the screen, so flicker is avoided. We clear the canvas each frame (`ctx.clearRect(0,0,width,height)`) because the game is not drawing a persistent scene (all motion is re-rendered each frame). To achieve special effects like full-screen flashes or screen shake, we manipulate the canvas context (e.g. applying a translation or rotation to `ctx` before drawing the scene, then restoring it).

## Entity System

All moving parts of the game are modeled as JavaScript classes (using ES6 `class` syntax) for clarity and extensibility. We use simple inheritance or composition where appropriate to share functionality (for example, a `Enemy` could extend a base `Sprite` class, or just be a separate class that contains common methods like `update()` and `draw()`). Key entity classes:

* **Player Class:** Represents the player avatar at the center. It stores properties like position (always the center of canvas), radius (for collision size), current HP, current power-up buffs (damage multiplier, fire rate, etc.), and methods like `shoot()` to fire a projectile. The player’s `update()` handles rotating to face the mouse/touch position and possibly cooldown timing for shots. On each frame, the player’s orientation is set such that it faces the cursor, and if the fire button is pressed, it spawns projectiles.

  ```js
  // Player.js
  class Player {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 20;
      this.angle = 0;
      this.hp = 100;
      this.fireCooldown = 0;
      // Buffs
      this.damageMod = 1;
      this.fireRateMod = 1;
      // ...other power-up state flags (e.g., hasPiercing, hasSlowField)
    }
    update(delta) {
      // Rotate to face cursor
      this.angle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);
      // Handle firing
      if ((input.mouseDown || input.keySpace) && this.fireCooldown <= 0) {
        this.fireProjectile();
        this.fireCooldown = this.getFireInterval(); 
      }
      if (this.fireCooldown > 0) this.fireCooldown -= delta;
    }
    fireProjectile() {
      const proj = new Projectile(this.x, this.y, this.angle, this.damageMod);
      game.projectiles.push(proj);
      // play gunshot SFX, muzzle flash particle, etc.
    }
    getFireInterval() {
      const baseRate = 300; // base 0.3s between shots
      return baseRate / this.fireRateMod;
    }
    takeDamage(amount) {
      this.hp -= amount;
      spawnFloatingText(`-${amount}`, this.x, this.y, 'red');
      if (this.hp <= 0) game.triggerGameOver();
    }
  }
  ```

* **Enemy Class:** Represents an enemy unit that spawns at the arena perimeter and moves straight towards the player. It contains properties like position `(x, y)`, speed, damage, health, and maybe a type or sprite identifier. The `update(delta)` method computes a velocity vector pointing from the enemy to the player and moves the enemy a bit closer each frame. If the enemy touches the player (distance < (player.radius + enemy.radius)), it deals damage to the player and is destroyed. We might have multiple enemy variants (different speed/health) – easily managed by subclassing or by parameters in the constructor (e.g. pass in a “type” that sets base stats).

  ```js
  // Enemy.js
  class Enemy {
    constructor(x, y, speed, health, damage) {
      this.x = x;
      this.y = y;
      this.speed = speed;
      this.health = health;
      this.damage = damage;
      this.radius = 15;
    }
    update(delta) {
      // Find direction vector towards player
      const dx = game.player.x - this.x;
      const dy = game.player.y - this.y;
      const dist = Math.hypot(dx, dy);
      // Normalize to unit vector, then move enemy
      if (dist > 0) {
        this.x += (dx / dist) * this.speed * (delta / 16.67);
        this.y += (dy / dist) * this.speed * (delta / 16.67);
      }
      // Check collision with player
      if (dist <= this.radius + game.player.radius) {
        game.player.takeDamage(this.damage);
        this.health = 0; // mark for removal (enemy dies upon hitting player)
      }
    }
    draw(ctx) {
      ctx.fillStyle = '#0FF';  // cyan glow or sprite
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
      ctx.fill();
    }
  }
  ```

  Enemies are managed by the main `Game` class (in an array `game.enemies`). New enemies are spawned by the wave system (see next section) and pushed into this array. Each frame, we iterate through `game.enemies` to update and draw them. When an enemy’s `health <= 0`, we remove it from the array (spawning particle effects if it died from a hit).

* **Projectile Class:** Represents bullets fired by the player. Stores position, velocity (derived from player angle), radius, and damage. Its `update(delta)` moves it forward in its direction at a fixed speed. We also check for off-screen and for collisions with enemies: for each enemy, if `distance(projectile, enemy) < (proj.radius + enemy.radius)` then we reduce enemy.health by proj.damage (applying any damage buffs) and mark the projectile for removal (unless a “piercing” upgrade is active). Projectiles that go off screen (outside canvas bounds) are removed to free memory.

  ```js
  // Projectile.js
  class Projectile {
    constructor(x, y, angle, damageMod) {
      this.x = x;
      this.y = y;
      this.radius = 5;
      this.speed = 400; // px/sec base
      this.damage = 10 * damageMod;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
      this.piercing = game.player.hasPiercing;  // example flag set by power-up
    }
    update(delta) {
      this.x += this.vx * (delta / 16.67);
      this.y += this.vy * (delta / 16.67);
      // Remove if out of bounds
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this._destroy = true;
      }
      // Collision check is handled in Game.update() for efficiency (iterate once over all projectiles vs enemies).
    }
    draw(ctx) {
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
      ctx.fill();
    }
  }
  ```

* **PowerUp Class:** We implement power-ups in a **data-driven** way. Instead of a complex class hierarchy, we can have a `PowerUp` object structure to define each upgrade type (name, description, icon, and an `apply(player)` function or stat modifiers). When the player picks a power-up card, we call its effect to modify the player or game state. For example, a *Damage Boost* power-up might be defined as `{ name: "Damage Boost", apply(player) { player.damageMod *= 1.5; } }`. Similarly, *Fire Rate* could reduce the player’s shoot cooldown, *Piercing Shot* could set `player.hasPiercing=true`, etc. The game holds a list of all possible power-ups and a weighted random selection logic to pick 3 at wave-end.

  ```js
  // Example power-up definitions
  const powerUps = [
    {
      name: "Damage Boost",
      description: "Increase bullet damage by +50%",
      icon: "icon_damage.png",
      apply(player) { player.damageMod *= 1.5; }
    },
    {
      name: "Fire Rate",
      description: "Shoot 20% faster",
      icon: "icon_firerate.png",
      apply(player) { player.fireRateMod *= 1.2; }
    },
    {
      name: "Piercing Shots",
      description: "Bullets pierce through 1 enemy",
      icon: "icon_piercing.png",
      apply(player) { player.hasPiercing = true; }
    },
    // ...other power-ups...
  ];
  ```

  We might wrap this in a `PowerUp` class to handle the UI card rendering, but the core idea is that the effect of a chosen card is just a function modifying player or game parameters. Effects **stack** if multiple are chosen across waves (e.g. taking Damage Boost twice compounds multiplicatively for +125% total damage). The power-up selection UI is covered in a later section, but essentially involves pausing the game loop and showing three cards for the player to click.

* **Particle Class:** Represents small decorative particles for explosions, sparks, or other ephemeral effects (non-interactive). Each particle might have properties like position, velocity, lifespan, color. For example, when an enemy dies, we spawn \~10 particles at that location with random outward velocities and a short lifespan (e.g. fade out over 0.5 seconds). The `Particle.update(delta)` moves the particle and reduces its life timer, and `draw(ctx)` renders it (often as a small glowing dot or line). Particles add juicy feedback but can be removed completely without affecting gameplay. They are managed in an array similar to projectiles.

All entity classes have a uniform interface: they support `update(delta)` and `draw(ctx)`. The main loop can then update/draw them polymorphically. For collision detection, since we have relatively few objects on screen, a simple nested loop (projectiles vs enemies) is fine; no spatial partitioning needed. If performance drops with many objects, one could consider spatial hashing or quadtrees, but for a small game we prioritize simplicity.

**Note:** Using classes makes it easy to expand with new enemy types or player abilities later. For example, to add a **“Shooter Enemy”** that fires its own bullets, we could subclass Enemy and add a firing mechanism. Similarly, one could add a **Shield power-up** by extending the Player class to have a shield property, etc. This OO approach keeps code organized and extensible.

## Wave & Difficulty Logic

The game consists of an endless sequence of waves, each wave introducing more or tougher enemies. The **difficulty progression** is controlled by a few parameters:

* **Enemy count per wave:** For instance, wave 1 might spawn 5 enemies, wave 2 spawns 8, wave 3 spawns 12, and so on. This can follow a linear or slight exponential growth.
* **Enemy stat scaling:** Each wave multiplies enemy base stats (health, speed, damage) by a factor. We use an exponential factor like `1.15^wave` (15% increase per wave) to ensure later waves become significantly harder. This is a common approach in survival modes (for example, another game might use 1.25× per wave).
* **Enemy types by wave:** Early waves might only spawn basic slow enemies. As waves progress, we could introduce faster or higher HP variants. To keep it simple under current scope, all enemies behave similarly, with stats scaled by wave number. In future, a mix of enemy types (ranged, boss, splitters, etc.) can be spawned based on wave number.

**Wave Spawning Mechanism:** At the start of each wave, the game calculates how many enemies to spawn and their stats:

* **Count formula:** e.g. `count = 4 + wave * 2` could be a baseline. We might ramp it up faster after wave 10.
* **Stat formula:** Each enemy has base stats (health, speed, damage). For wave scaling, use:
  `health = baseHealth * (1.15 ** (wave-1))`
  `speed = baseSpeed * (1.1 ** (wave-1))` (maybe smaller increment for speed)
  `damage = baseDamage * (1.15 ** (wave-1))`
  Small exponent increments compound – by wave 10, for instance, health \~4× base if 15% per wave. The exact 1.15 factor can be tweaked to ensure game balance (the goal is to pressure the player to need power-ups to keep up).
* **Spawn positions:** Enemies should appear just off-screen around the edges. A simple method: choose a random angle (0–360°) around the center and spawn an enemy at radius just beyond the canvas bounds. For example: pick a random edge of the canvas (top, bottom, left, right) and a random point along that edge for each enemy.
* **Pathfinding:** In this game, pathfinding is trivial – enemies always move in a straight line toward the center. No obstacles are present, so we don’t need A\* or grid navigation. It’s effectively homing behavior towards the player’s coordinates.

**Wave progression example (for illustration):**

| Wave # | # Enemies | Enemy Health | Enemy Speed | Enemy Damage |
| -----: | --------: | -----------: | ----------: | -----------: |
|      1 |         5 |   100 (base) |     50 px/s |    10 (base) |
|      2 |         8 |          115 |     55 px/s |         11.5 |
|      3 |        11 |          132 |     61 px/s |         13.2 |
|      4 |        15 |          152 |     67 px/s |         15.2 |
|      5 |        20 |          175 |     74 px/s |         17.5 |
|     10 |      \~40 |        \~404 |  \~120 px/s |         \~40 |
|     20 |      \~80 |       \~1637 |  \~290 px/s |        \~163 |

*(This table assumes base health=100, base damage=10, base speed=50 for wave1, and \~+15% per wave health/damage, +10% speed for demonstration.)*

We see that by wave 20 the enemies have become very fast and tanky – without stacking power-ups, the player would be overwhelmed. This provides the **intended difficulty curve**: players must leverage upgrades and skill to survive deeper waves.

**Between Waves:** Once the player kills the last enemy of a wave, the game enters a brief intermission:

* **Cleanup:** Ensure any remaining projectiles or particles are cleared or removed (or you can simply not spawn new ones until wave resumes).
* **Advance Wave Counter:** Increment the `wave` number and update the HUD display (e.g. “Wave 5 Complete!” then “Prepare for Wave 6”).
* **Power-Up Phase:** Trigger the Power-Up selection UI (detailed next), pausing the main game loop while the player chooses.
* **Next Wave Start:** After selection (or a short delay if no power-ups in some mode), unpause and spawn the next wave’s enemies. Optionally, give the player a 1-2 second warning or countdown (e.g. “Wave 6 starting in 3…2…1…”).

The wave system is managed by the `Game` class, which likely has a function `startWave(waveNumber)` that sets up the enemies. Pseudocode:

```js
class Game {
  constructor() {
    this.wave = 0;
    this.enemies = [];
    // ... other state ...
  }
  startNextWave() {
    this.wave++;
    const count = Math.floor(4 + this.wave * 2);  // simple count formula
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const spawnRadius = Math.max(canvas.width, canvas.height) / 2 + 50;
      const sx = game.player.x + Math.cos(angle) * spawnRadius;
      const sy = game.player.y + Math.sin(angle) * spawnRadius;
      // scale enemy stats
      const baseHealth = 100, baseSpeed = 50, baseDamage = 10;
      const scale = Math.pow(1.15, this.wave - 1);
      const enemy = new Enemy(sx, sy,
                    baseSpeed * Math.pow(1.1, this.wave - 1),
                    baseHealth * scale,
                    baseDamage * scale);
      this.enemies.push(enemy);
    }
    // possibly introduce new enemy types on certain waves...
  }
  update(delta) {
    // ... update player, projectiles ...
    this.enemies.forEach(e => e.update(delta));
    // collision checks and removal
    // if all enemies killed, trigger end-of-wave
    if (this.enemies.length === 0) {
      this.handleWaveClear();
    }
  }
  handleWaveClear() {
    this.paused = true;
    openPowerUpSelection();
  }
}
```

The values can be tuned. For example, if using a smaller scaling factor (1.10 per wave), the progression is slower. The design target is waves should start easy but by wave \~10 it gets intense, and by wave \~20+ only a well-upgraded player can survive.

To avoid extremely large numbers, one could also cap certain parameters or introduce *elite* enemies instead of endlessly scaling all. But given infinite waves, exponential scaling inevitably leads to an unwinnable state eventually – which is fine for a high-score chasing game.

## Power-Up System

After each wave, the player is presented with a **choice of one out of three power-ups**, delivered as cards on a modal overlay. This system provides rogue-lite style permanent upgrades to help the player handle increasing difficulty. Design considerations for the power-up system:

* **Power-Up Pool:** Define a list of possible upgrades. Each power-up has a **category** (Offense, Defense, Utility) and a stackable effect. Some examples:

  * *Damage Boost* (+50% bullet damage)
  * *Attack Speed* (+20% fire rate)
  * *Piercing Shot* (bullets pierce one additional enemy before disappearing)
  * *Radial Blast* (upon taking damage, emit a knockback blast)
  * *Slow Field* (enemies within a radius around player move 30% slower)
  * *Life Steal* (some percentage of damage dealt heals the player)
  * *Shield Recharge* (regenerate a shield or extra HP over time)
  * *Max HP Increase* (+20 max HP and fully heal that amount)
  * etc.
* **Random Selection with Weights:** To keep the game interesting, not all power-ups are equally likely. We can assign weights – for example, basic damage or fire rate upgrades might be common, whereas exotic effects like Life Steal might be rare. When a wave ends, we randomly draw three *distinct* power-ups from the pool. (If the pool is large, ensure variety; if small, allow repeats but perhaps not in the same selection.)
* **UI Component:** The power-ups are shown as cards (could be `<div>` elements styled as neon cards) with a title, icon, and short description. The game is paused underneath, and an overlay (semi-transparent dark background) highlights the choice. The player clicks one card to select that upgrade. On selection, we call the `apply()` function for that power-up to modify the player’s stats/abilities, then close the overlay and resume the game.
* **Implementation:** E.g., have an array `availablePowerUps` (like shown in the previous section) and a function `getRandomPowerUps(n)` that returns `n` random picks. Each pick is an object with the needed info. We then dynamically create elements or a small canvas draw for the cards. When a card is clicked:

  1. Apply the power-up: e.g. `powerUp.apply(game.player)` – this will directly adjust player properties.
  2. Maybe display a quick toast like “Picked: Piercing Shots!”.
  3. Unpause the game and call `game.startNextWave()` to continue.

**Example: Wave Clear -> Power-Up Selection Flow:**

1. Wave 5 cleared. The game sets `game.paused = true`.
2. Three power-up choices are generated, say: *Fire Rate*, *Damage Boost*, *Slow Field*. These are displayed as glowing cards in the center of the screen. Each card could glow or bob slightly to attract attention.
3. The player clicks *Fire Rate*. The game then:

   * Applies the effect: `player.fireRateMod *= 1.2` (so future shots are 20% faster).
   * Possibly plays a UI sound (a satisfying click or chime).
   * Removes the other two cards and unpauses the game.
4. Wave 6 spawns after a brief 1-second countdown.

From now on, the player has that upgrade. If in a later wave they pick another Fire Rate, it stacks (cumulatively 44% faster if applied twice, since 1.2 \* 1.2 = 1.44). Some effects might have caps or unique behavior (e.g. **Shield Recharge** might add a new mechanic rather than stacking). For simplicity, assume all can stack or at least repeat to minimal effect.

Balancing note: Because the game can theoretically go infinite, we rely on the ever-increasing enemy scaling to eventually overpower the player. However, with lucky power-up combos a skilled player could survive dozens of waves. The mix of power-ups should provide interesting synergies (e.g. Life Steal is great if you also have high damage, Piercing is great if fire rate is high, etc.). There is a design choice whether the power-ups offered are purely random or influenced by what the player already has (to encourage synergy or to cover weaknesses), but a pure random-with-weight approach keeps it straightforward.

**Card UI Implementation:** We can implement the card selection screen using DOM elements over the canvas:

* Create a `<div id="powerUpModal">` that is hidden during gameplay. When a wave ends, populate it with three child `<div class="card">` elements.
* Each card div can include an `<img src="...">` for the icon and a `<p>` for name/description.
* Style the modal with CSS: position it absolute center, use a translucent background. Cards can be flexed horizontally with space-around.
* Add a hover effect: maybe a neon border glow on card hover to indicate interactivity.
* Clicking a card triggers a JavaScript event that calls a function like `choosePowerUp(index)`.

Example CSS (simplified):

```css
#powerUpModal {
  display: none;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  color: #fff;
  text-align: center;
  padding-top: 100px;
}
#powerUpModal.show { display: block; }
.card {
  display: inline-block;
  width: 150px; height: 200px;
  margin: 20px;
  padding: 10px;
  background: #111;
  border: 2px solid #555;
  box-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
  transition: transform 0.2s;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 15px #f0f, 0 0 30px #f0f;
}
.card img { width: 64px; height: 64px; margin-top: 10px; }
.card .title { font-weight: bold; margin: 10px 0; }
.card .desc { font-size: 0.9em; }
```

When the modal is active, we’d also hide the canvas or pause its updates. Alternatively, one could draw the card selection on the canvas itself, but using HTML simplifies text and layout.

**Selecting and Applying:**

```js
function openPowerUpSelection() {
  const options = getRandomPowerUps(3);
  const modal = document.getElementById('powerUpModal');
  // populate card elements with options...
  // attach event listeners: on card click -> choosePowerUp(option)
  modal.classList.add('show');
}

function choosePowerUp(pick) {
  // pick is the chosen powerUp object
  pick.apply(game.player);
  // hide modal
  document.getElementById('powerUpModal').classList.remove('show');
  game.paused = false;
  game.startNextWave();
}
```

This structure cleanly separates the power-up logic (the `apply` methods in data) from the UI selection code.

**Persisting Upgrades:** All upgrades last for the remainder of the run. We can indicate active buffs in the HUD (for example, small icons or stacking counters for each buff). This is optional polish – at minimum, the effects are felt in gameplay.

In summary, the power-up system is **data-driven**: easy to add new upgrades by pushing into the array, with minimal code changes. It adds a layer of strategy as players can adapt their build (e.g. focusing on pure offense vs some defense). It’s implemented via a simple modal that pauses the game loop.

## UI & HUD

A clean, informative user interface ensures the player can track their status and the wave progress without distraction. We will use a mix of **Canvas drawing and HTML/CSS overlays** for the HUD:

* **Life Bar (HP):** A classic health bar showing the player’s remaining HP (out of 100). We can place this at the top-left corner. Implementation options:

  * Use an HTML `<div class="healthbar"><div class="healthfill"></div></div>` where the inner fill’s width is dynamically set to percentage of HP. CSS can style it with a neon red/green gradient.
  * Alternatively, draw a rectangle on a separate HUD canvas or the main canvas each frame. However, using HTML for static UI is easier (no need to redraw constantly; just update on HP changes).
* **Wave Counter:** Simply display the current wave number (e.g. “Wave: 5”) at top-right. This can be an HTML element or drawn text. Because it updates only when wave changes, an HTML `<span id="wave">Wave 5</span>` is convenient.
* **Score (optional):** If we consider score = wave or kills, we can display that as well, but wave number itself is effectively the score here.
* **Power-Up Modal:** As described in the Power-Up System section, a hidden overlay that appears between waves with the card choices.
* **Pause Screen:** If the player manually pauses (e.g. pressing `P` or clicking a pause button), we can dim the screen and show “Paused – Press P to resume” in the center. This can reuse a similar overlay mechanism.
* **Game Over Screen:** When HP reaches 0, show a “Game Over” message and possibly the final wave achieved. This can be a centered `<div id="gameOver">` overlay with a restart button. For example:

  ```html
  <div id="gameOver" style="display:none;">
    <h1>GAME OVER</h1>
    <p>Waves Survived: <span id="finalWave"></span></p>
    <button onclick="restartGame()">Play Again</button>
  </div>
  ```

  We would populate `finalWave` and show this when the game ends.
* **Touch Controls (Mobile HUD):** On mobile, since the player can’t use a mouse, we may provide on-screen controls:

  * A virtual joystick or simply use one finger to aim (wherever the player touches relative to center sets the firing angle).
  * A fire button if needed (though auto-fire could be enabled when touching to make it simpler).
  * Possibly an on-screen pause button (small icon in a corner).
    These can be added as transparent overlay divs that capture touch events.

Using traditional HTML for HUD elements is advantageous: *“Browserquest displays their HUD using HTML elements, which has the benefit that you don't have to worry about redrawing etc.”*. We will follow the same logic:

* The health bar and text displays are HTML so they can be updated by simply changing element widths or innerText, without redrawing each frame on canvas.
* This also separates concerns: the Canvas is for the game world, the DOM is for UI.

**Neon Aesthetic in UI:** The HUD elements will follow the synthwave style:

* Fonts in bright neon colors (pink, cyan, etc.) with glow effects (using CSS `text-shadow` for neon glow).
* The health bar might have a glowing border or shadow (CSS box-shadow spread).
* Buttons (like pause/restart) can have hover glows.

For example, CSS for neon text:

```css
#wave, #gameOver h1 {
  font-family: 'Audiowide', sans-serif;  /* a futuristic font */
  color: #0ff;
  text-shadow: 0 0 5px #0ff, 0 0 10px #0ff;
}
.healthbar {
  width: 200px; height: 20px; background: #222; border: 2px solid #0f0;
  box-shadow: 0 0 10px #0f0;
}
.healthfill {
  height: 100%; background: linear-gradient(90deg, #0f0, #ff0); /* green to yellow */
}
```

We ensure the HUD is **responsive**: using relative units or CSS that adapts to different screen sizes. For instance, on a phone, we might use a smaller font or reposition UI elements (maybe health bar at top center instead of left, etc.). Using CSS media queries can help adjust layout for mobile vs desktop.

**In-Game Indicators:** In addition to the static HUD, we provide dynamic feedback:

* **Floating Combat Text:** When the player hits an enemy or is hit, small text pops up at the impact point (e.g. “-20” in red for damage taken, or “+10” in green if healing). We can implement this by spawning a lightweight text element or use the particle system to draw text. A simple way: use absolutely positioned `<div class="floating-text">` elements added to the DOM with position calculated from game coordinates. CSS can animate them (translate upward and fade out). Or update them via JS each frame in an array of active texts.
* **Enemy Spawn Warning:** Perhaps a quick flash or arrow at screen edges where enemies spawn (just a brief indicator to avoid unfair surprises). This could be a small arrow sprite drawn on canvas when enemies spawn, fading quickly.
* **Hit Flash:** If the player is hit, briefly flash the screen border or the player sprite (e.g. draw the player in white for one frame, or overlay a translucent red screen flash for a few milliseconds).

These little touches, while not directly HUD, overlap with UI feedback and can be handled via the same principles (some via canvas, some via CSS animations).

## Art Direction Guide

&#x20;*Figure:* **Outrun-inspired neon palette and style guide.** The game’s art direction draws heavily from **1980s synth-wave (outrun)** aesthetics – think *dark backgrounds, neon grids, bright pink/cyan/purple glows*. The visual components include:

* **Color Palette:** Vibrant neon colors on black or dark purple background. Common colors are *hot pink, neon cyan, electric purple, laser-fuchsia, and bright yellow*. Our game primarily uses neon pink (#ff2dec), cyan (#00ffff), and violet/purple (#8f00ff) for accents, with white highlights. The background is nearly black (#05010a) with hints of dark blue/purple. The palette conveys a retro-futuristic vibe consistent across sprites and UI.
* **Background:** A subtle animated or static background that doesn’t distract from gameplay. We can use a **neon grid** horizon – for example, a purple grid floor that vanishes into a sunset gradient, iconic in synthwave art. Implementation: we could pre-draw a grid of lines on a `<canvas>` layer or use an SVG/CSS background image. Another option is a starfield or abstract fog. In any case, the background will likely be static during gameplay, just to set mood.
* **Sprites & Shapes:** Enemies and player can be represented by simple geometric shapes (circles, triangles, etc.) with neon outlines or glow. Since our total asset size is limited (<5 MB), using procedurally generated shapes or very small sprite images is ideal. For example:

  * Player avatar: maybe a glowing **ship** or orb. A simple approach is drawing a triangle pointing outward from center (like a twin-stick shooter ship). We can give it a neon outline and a slight glow.
  * Enemies: could be glowing geometric shapes (like neon-outlined squares or spikes) or more complex pixel-art sprites if available. Consistency is key – if the player is an outline, enemies should be similar style.
  * Projectiles: simple bright dots or short lines (laser bolts) in a contrasting neon color (e.g. bright yellow or white).
* **Glow & Neon Effects:** A crucial part of the aesthetic is the **neon glow**. We achieve this via a combination of CSS filters and canvas effects:

  * **Canvas Shadow Blur:** When drawing shapes on the canvas, we can use the context’s shadow properties. For example, setting `ctx.shadowColor = "#0ff"` and `ctx.shadowBlur = 10` before drawing a cyan shape will give it a glowing halo. By drawing the shape with no shadow offset (`shadowOffsetX=0, shadowOffsetY=0`), the blur spreads uniformly. This is great for a bloom-like effect on sprites.
  * **Layered Glow:** Another trick is to draw the same shape multiple times with additive blending to intensify the glow. Using `ctx.globalCompositeOperation = 'lighter'` can allow colors to add up to a bright core. For instance, draw a semi-transparent pink circle 3 times to make it look like it’s glowing.
  * **CSS Filter on Canvas Element:** We can apply a CSS rule like `canvas { filter: drop-shadow(0 0 10px #f0f); }` to make the whole canvas glow, but that might not discriminate between objects and could blur everything. It might be more useful for UI elements or if using layered canvases (e.g. one canvas just for neon effects under the main).
  * **Text Neon:** For HUD text and any HTML elements, use `text-shadow` as mentioned. Multiple layers of text-shadow (with different neon colors) can create a rim effect. Example: `text-shadow: 0 0 5px #0ff, 0 0 10px #0ff, 0 0 20px #0ff;` yields a strong cyan glow.
* **Font Choices:** To nail the 80s vibe, use retro-style fonts. A good free choice is **“Press Start 2P”** (a pixel arcade font) for a more gamey feel, or **“Audiowide”** / **“Orbitron”** for a sleek sci-fi neon look. Titles like “GAME OVER” could be in a cursive neon script for drama, but for legibility, we likely stick to sans-serif. Google Fonts has *Press Start 2P*, *Monoton*, *Neon Tubes* etc., but loading too many fonts can bloat; one specialty font plus a regular sans-serif fallback is fine.
* **UI Visuals:** HUD elements (health bar, cards) should also have neon styling:

  * Card icons might be simple line art in neon colors. We can use font-icons or small SVGs to represent e.g. a bullet for damage, a heart for life, etc., and apply glow via CSS or inline SVG filters.
  * The power-up cards themselves can have a neon border or backdrop (CSS gradient with animated glow).
  * Buttons (like the Restart button on game over) should have a hover glow effect matching the palette.
* **Animation & Effects:** Small animations can enhance the style:

  * **Neon flicker:** Sometimes neon lights flicker. We could simulate this by occasionally slightly fluctuating the intensity of glows. For example, using CSS keyframes to vary `text-shadow` brightness of a title, or randomly adjusting canvas shadowBlur by a tiny amount on some frames. This adds authenticity but should be subtle (and maybe only for decorative elements, not during intense action where clarity is needed).
  * **Scanlines/VHS Filter (optional):** An overlay of faint scanlines or a vignette can push the retro aesthetic. A semi-transparent PNG or CSS repeating-linear-gradient can create scanlines. Careful it doesn’t interfere with gameplay clarity.
  * **Particle effects style:** Particles from explosions can be neon sparks. We can make them small points of light that fade out to transparent rather than just disappearing. Their colors should match the explosion cause (e.g. enemy exploded in purple shards). Using additive blending on particles makes them extra glowy when overlapping.

In summary, our art direction calls for a **unified neon glow** look. The technical implementation leverages simple shapes and programmatic glow (to avoid large image files). By using canvas shadows and CSS styling, we attain the neon look without shaders or WebGL. All color choices and font styles aim to transport the player to an ’80s arcade cyber-grid. This consistency is key to making the game feel polished and immersive in its chosen theme.

## Audio Integration

Sound is half the experience in an arcade-style shooter. We incorporate **punchy sound effects** and a *retro synthwave soundtrack* to elevate the gameplay:

* **Sound Effects (SFX):** Short audio clips for key actions:

  * Shooting (laser pew-pew or bullet fire sound).
  * Enemy death explosion.
  * Player hurt (a damage alert sound).
  * Power-up selection (a reward chime or synth tone).
  * UI clicks (button press sound).
    Each should be distinct and satisfying. We can find **royalty-free** or CC0 sounds on sites like freesound.org or OpenGameArt. Keep audio files as small as possible (prefer OGG or MP3).

* **Background Music (BGM):** A looping synthwave track in the background gives the game atmosphere. Ideally a track with an energetic tempo that ramps intensity as waves progress (but a single loop is fine). Ensure the music isn’t too loud or distracting relative to SFX.

* **Audio Format & Size:** To keep total assets <5 MB, use compressed audio. One music loop might be \~1-2 MB, and each SFX a few KB. We’ll probably include one background track and \~5-6 SFX.

* **Integration via HTML5 Audio:** The simplest approach is using the HTMLAudioElement. We can preload audio files and play them on events:

  ```js
  const sfxShoot = new Audio('assets/shoot.wav');
  const sfxExplode = new Audio('assets/explode.wav');
  const bgm = new Audio('assets/synthwave.mp3');
  bgm.loop = true;
  bgm.volume = 0.5;
  ```

  On game start, after a user interaction (to satisfy browsers’ autoplay policy), call `bgm.play()`. SFX can be played by calling `sfxShoot.cloneNode().play()` if overlapping sounds are needed (or manage an audio pool).

* **Preloading:** It’s important to preload or at least **load on start** so there’s no delay on first play. We can use JavaScript to load each Audio and set `audio.preload = 'auto'`. Alternatively, use the Web Audio API for more control (but that might be overkill here).

* **Volume Controls:** Provide a UI to adjust volume or mute:

  * A simple solution: a **mute toggle** button. For example, a speaker icon in the corner. Clicking it toggles mute on/off for all sounds (we can set `bgm.volume = 0` and similarly mute SFX or just pause music).
  * More advanced: separate volume sliders for music and SFX. Two range input controls that adjust volumes globally.

  We’ll implement at least a mute toggle. As learned from prior experience, players appreciate control over sound: *“auto-playing music with no way to turn it off is the worst”*, so we ensure a mute exists. We can also remember the user’s preference in `localStorage` so that if they mute once, the game starts muted next time.

  For example:

  ```js
  let audioEnabled = true;
  if (localStorage.getItem('mute') === 'true') {
    audioEnabled = false;
    bgm.volume = 0;
  }
  document.getElementById('muteBtn').onclick = () => {
    audioEnabled = !audioEnabled;
    bgm.volume = audioEnabled ? 0.5 : 0;
    localStorage.setItem('mute', !audioEnabled);
    // also mute/unmute SFX or just set a global flag to not play them
  };
  ```

* **Audio Feedback Tuning:** We’ll adjust volumes so that multiple shots and explosions don’t blow out the sound. Usually, keep SFX volume a bit lower relative to music. Additionally, we might play a special sound on significant events (e.g. a louder explosion for a boss enemy, or a power-up pickup jingle).

* **Audio Performance:** Using HTMLAudio is straightforward but not as low-latency as WebAudio API. For rapid-fire sounds (like a machine gun), HTMLAudio can lag if the same sound is triggered in quick succession. Mitigation: you can create multiple audio objects for the same file (audio pool) or use WebAudio’s `AudioBufferSourceNode`. Given moderate fire rate and small scale, HTMLAudio should suffice.

* **Retro Sound Style:** It’d be great if the SFX match the theme – perhaps synthesized or 8-bit style. For instance, use a slight *bitcrush or distortion* to make them sound like old arcade games. This can be done in asset creation or using WebAudio filters if we wanted. But not a requirement.

**Summary of Audio Implementation:**

* Load all audio on startup (or on first user gesture).
* Play background music in a loop.
* Trigger SFX on game events by calling `.play()` on preloaded audio elements.
* Provide a visible mute button and volume control for user comfort.
* Use `localStorage` to remember mute state so if the player mutes, it stays muted next session.
* Ensure that the game only starts music after an interaction (to comply with browser policies). For example, show a “Click to Start” screen initially – on click, start the game and play music.

By integrating sound thoughtfully, the game will feel much more alive. A *laser shot* sound each time you fire and an *explosive “boom”* when an enemy dies will give important feedback and satisfaction for the player’s actions. Coupled with a driving synth soundtrack, it nails the arcade atmosphere we want.

## Polish & Juice Checklist

To transform a basic functional game into a delightful experience, we add **“juice”** – those extra animations, effects, and feedback that make the game feel responsive and fun. Here’s a checklist of polish items implemented or planned:

* **Screen Shake:** On big events like an enemy reaching the player or a large explosion, we apply a brief camera shake. Technically, since the player is fixed, we can simulate camera shake by translating the entire canvas randomly by a few pixels for a few frames. Using a noise or sine wave pattern (decaying over \~0.5s) prevents it from feeling too random. We save and restore the canvas state around the shake so it doesn’t accumulate offset. The effect: the screen gives a quick jolt that players *feel* as impact.
* **Floating Combat Text:** As mentioned, when damage is dealt, small numbers pop up:

  * Enemy takes damage: show the damage number in a small font at the enemy’s position, moving upwards and fading out over \~1 second. Color can be yellow or white.
  * Player takes damage: show “-X” near the player in red.
  * Player heals or gains shield: show “+X” in green or blue.
    Implementation: create an object with `x,y, text, ttl` and either draw it on canvas or create a DOM element absolutely positioned. We update its `y` slightly each frame and reduce opacity. After ttl (time to live) expires, remove it. This provides immediate feedback of hit strength.
* **Particle Explosions:** When an enemy dies, instead of just disappearing, spawn particles:

  * e.g. 8 small glowing particles that shoot out in random directions from the enemy’s center.
  * Could use the enemy’s color (a pink enemy explodes into pink sparks).
  * Particles are instances of the Particle class (with velocity, life, maybe slight gravity or shrink over time). They create the visual of debris.
    This significantly enhances the feel of destroying enemies – it’s more gratifying to see them burst apart. (For performance, cap number of particles or pool them to avoid unbounded arrays.)
* **Enemy Death Flash:** In addition to particles, we can flash the enemy sprite just before removal. For example, one frame of a bright white outline or a quick scale-up. This, combined with sound, gives a nice *“pop”* to the death.
* **Projectile Impact Effect:** If a projectile hits an enemy, maybe a small spark or brief glow at the impact point. Could be a tiny particle or just a drawn star shape for a frame.
* **Neon Glow Shader:** Ensure all sprites have the promised neon glow effect. We use the canvas shadow trick globally or per draw call to keep everything luminous. This consistent glow makes the game look high-quality. We might increase glow intensity for important objects (player and big enemies) and lower for minor things (particles).
* **Smooth Player Rotation:** The player’s rotation to the cursor can be instantaneous or could have a slight easing to it for smoothness. But in a shooter, instant is fine for responsiveness.
* **Input Responsiveness:** Add multiple input options: e.g. allow **Spacebar** to fire in addition to left-click, so keyboard-centric players can use two hands (one on mouse to aim, one to spam space). Also ensure that holding fire down will continuously shoot (so the player doesn’t tire from clicking). Possibly implement that as a continuous fire at a set rate (the `fireCooldown` logic already covers this).
* **Accessibility & Options:** Some players might be sensitive to flashes or need adjusted difficulty:

  * Include an option to disable screen shake or reduce flash intensity for those sensitive to motion. This could be a simple toggle in a settings menu.
  * Difficulty modes could be an extension: e.g. an “Easy” mode with slower scaling or a “Hard” mode with faster scaling. For now, infinite mode is one-size, but a simple multiplier on enemy spawn rate or scaling factor can adjust difficulty.
* **Mobile Touch Controls Optimization:** If on a touch device:

  * The player could auto-fire to simplify controls (since aiming itself is already a continuous action by finger position). Or perhaps tap-and-hold anywhere on screen to fire in that direction.
  * Alternatively, provide a virtual joystick (left side to aim, right side to shoot) but for a single-stick shooter like this, one-finger control plus auto-fire might be best.
  * *Responsive canvas:* ensure the canvas resizes to fit small screens and that text/UI remains legible (perhaps use relative sizing).
* **Frame Rate & Performance:** Aim for 60 FPS. Use the browser dev tools performance monitor to check frame times. If any heavy operation (e.g. too many shadowBlur calls) slows it down, consider optimizations:

  * Lower particle counts or lifetimes if needed.
  * Turn off full-screen glow effect on mobile (or use a cheaper alternative).
  * Use off-screen canvas to draw complex effects once and reuse if possible.
* **Transition Animations:** Some polish around state changes:

  * Between waves, maybe have a “Wave X Complete” text that briefly appears/fades.
  * When starting a new wave, flash “Wave X” or have enemies spawn with a slight delay instead of all at once (e.g. spawn them over one second for dramatic effect).
  * Power-up cards could deal out with a little animation (sliding in or a quick flip reveal).
  * The Game Over screen could fade in, or the background could grayscale when game is over.
* **Music Transitions:** If we had multiple tracks, we could switch to a more intense track after wave 10, etc. Simpler: maybe just increase volume or add an extra beat layer as waves go up, but that requires dynamic music. For now, one looping track is fine but ensure it loops seamlessly.
* **Debug Info (dev phase):** During development, overlay some debug text like FPS or entity count to monitor performance. This won’t be in final, but helps polish by ensuring we maintain performance budget.
* **Edge Case Handling:** Ensure no jitter or errors: e.g., when only one enemy left, that the wave properly ends. Or if player dies exactly as wave ends, handle the order of game over vs power-up offering (likely if player dies, immediate Game Over and skip power-up).

This checklist will be revisited as we test the game. The idea is to add as many small satisfying effects as possible, as long as they don’t confuse gameplay. The visual language (glows, colors) and feedback (screenshake, sound) all combine to improve **game feel**. A polished game keeps the player engaged longer and provides the *“juice”* that makes every action rewarding.

## Extensibility Hooks

While the core game is solid, we design the codebase with future extensions in mind. Here are ways one can extend or modify the game for more content or modes:

* **New Enemy Types:** Currently enemies are homogeneous. We can introduce new enemy classes easily, thanks to the modular entity system:

  * **Fast but Fragile enemy:** Low health, high speed (zooming towards player quickly). Implementation: could reuse Enemy class but spawn with a variant config (e.g. 50% health, 200% speed).
  * **Tank enemy:** Very slow, huge health, maybe appears as a larger sprite. Possibly does more damage too. Could be a subclass that overrides draw to be bigger and update to have slower movement.
  * **Ranged enemy:** An enemy that stops at a certain radius and shoots at the player. This requires giving it an attack pattern in update (maybe every 2 seconds, spawn a bullet toward player). We’d create a separate class (e.g. `EnemyShooter extends Enemy`) with an additional method to handle firing. Its bullets could be a new entity type (enemy projectiles), which means we’d need to handle player getting hit by those. This adds a new dimension to gameplay (dodging bullets).
  * **Boss waves:** Every, say, 10 waves, introduce a boss – a large enemy with very high health and perhaps unique behavior (like spawning smaller enemies or moving erratically). The architecture can support this by checking `if (wave % 10 === 0) spawnBoss();`. The boss could be just an Enemy with massively scaled stats or a special Boss class with multiple phases. On a boss wave, maybe don’t spawn normal enemies or spawn fewer. When the boss is defeated, drop more power-ups or bonus points.

* **Co-op Mode:** Supporting two players (on same machine or network):

  * **Local co-op** (same keyboard): One player uses WASD to rotate a turret and a different key to shoot, or perhaps one player moves a cursor with arrow keys. Given our player is static, co-op might be implemented as *two turrets* at the center, each controlled separately, or one controls aim and the other controls something else. A better approach might be to allow two players each at their own position defending the center – but then the game dynamic changes significantly (becomes more like two stationary defenders).
  * **Online co-op:** More complex, would involve networking and sync. Possibly out of scope, but if architected, the update loop and game state could be synchronized across clients.
  * The code could be extended by adding a second Player instance, input handling for it, and adjusting enemy AI to target the nearest player or the center.
  * Scoring in co-op might be shared or separate.
  * The HUD would need to show both health bars.

  Though co-op is a big feature, the game logic being mostly functional per entity means adding another player means just managing another entity of class Player and splitting input.

* **Different Weapons:** We could add multiple weapon types and power-ups to switch between them:

  * e.g. a Spread Shot (fires 3 projectiles in a spread), a Laser Beam (continuous beam with its own mechanics), Bombs (projectile that explodes with AoE damage).
  * Implementation: This could be done through power-ups that fundamentally change the `fireProjectile` behavior or by giving the player an inventory. Simpler: treat a special power-up like *“Triple Shot”* that from then on makes `fireProjectile` shoot 3 bullets at angles \[angle-5°, angle, angle+5°]. Or a *“Plasma Beam”* power-up that replaces bullets with a different Projectile subclass (with piercing and damage over time).
  * Because our code is not using a separate weapon class, these would be conditionals in Player. If this grew, we might refactor to have a Weapon class that Player has, making it easier to swap weapons.

* **Additional Power-Ups:** Designing more variety:

  * e.g. *Area Bomb*: every few seconds an explosion around player.
  * *Turrets*: place stationary turrets (though that becomes more like standard tower defense).
  * *Time Warp*: slow down time when HP is low or for a few seconds after wave.
  * These new powers just slot into the powerUps list with an apply function and possibly some supporting logic (like if we add a turret, we’d need a Turret entity that auto-fires).
  * The structure we set (data-driven) supports adding powers without altering core loop, as long as apply() can tweak a property or push a new effect into the game’s state.

* **Difficulty Settings:** Exposing some parameters like enemy scaling factor, number of starting lives, etc., can allow easy creation of “Easy/Normal/Hard” modes. For example, an Easy mode might use 1.10^wave scaling and start the player with 150 HP, while Hard uses 1.20^wave and only 3 power-up choices every 2 waves, etc. Code-wise, just adjust constants based on a selected mode (maybe via a start menu).

* **Graphics Improvements:** If later wanting to use actual art assets:

  * Swap shape drawing with `ctx.drawImage()` for sprites. We could maintain same structure but preload images for player, enemy, etc. Then in each entity’s draw, use the image instead of arc(). The neon effect might then be achieved by drawing a glow sprite beneath or using filters.
  * Could integrate a shader-based glow via WebGL if needed for performance, but likely unnecessary.

* **State Management for Extensibility:** If we anticipate major changes, we might consider using an Entity-Component-System (ECS) architecture for flexibility. But given the scale, classes with inheritance suffice. We have to be mindful of coupling (for example, currently Game class knows about Player and arrays of others; if we keep that loosely coupled, it’s fine).

* **Saving Progress or Meta-Game:** Because it’s wave-based endless, persistent progress might not apply except for high scores. We could easily store high score in localStorage. Or if adding meta progression (like Rogue Legacy style permanent upgrades after death), we’d design a menu to spend points and then start a new run with buffs. That requires saving state beyond a single run – doable via localStorage or a backend if needed.

In conclusion, the project is structured to be *modular and upgradable*. Adding content mostly involves creating new classes or data entries and integrating them via existing loops. The separation of concerns (player/enemy classes, power-up data, rendering loop, UI code) helps ensure new features can be slotted in without rewriting large swaths of code.

These hooks mean the team (or another GPT, as indicated) could use this document to extend the game in many exciting directions with minimal refactoring.

## Complete Code Walk-Through

In this section, we’ll walk through the final code structure, highlighting how each part is implemented with excerpted, commented code snippets. This ties together the concepts from above into an actual implementation blueprint.

### HTML and CSS Skeleton

First, look at the basic HTML (`index.html`) which sets up the canvas and HUD elements:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Neon TD Shooter</title>
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <canvas id="gameCanvas" width="800" height="600"></canvas>
  <div id="hud">
    <div id="healthContainer">
      <div id="healthBar"></div>
    </div>
    <div id="waveDisplay">Wave 1</div>
    <button id="muteBtn">🔈</button>
  </div>
  <div id="powerUpModal" style="display:none;"></div>
  <div id="gameOverScreen" style="display:none;">
    <h1>GAME OVER</h1>
    <p>You survived <span id="wavesSurvived"></span> waves</p>
    <button id="restartBtn">Restart</button>
  </div>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

Key elements:

* `<canvas id="gameCanvas">` is the game rendering surface.
* `<div id="hud">` contains the health bar, wave text, and a mute button. This is an overlay positioned with CSS (e.g. fixed top).
* `powerUpModal` is initially hidden; will be populated with power-up options as needed.
* `gameOverScreen` likewise hidden until game end.
* We include a Google font (Press Start 2P) to use for UI text (giving that pixel-art arcade vibe).
* The main JS module is included at the end.

**CSS (style.css)** defines the neon look and layout:

```css
body {
  margin: 0;
  background: black;
  overflow: hidden;
}
#gameCanvas {
  display: block;
  margin: 0 auto;
  background: radial-gradient(circle at 50% 100%, #210A2C, #000 80%); /* a subtle gradient */
  /* The canvas will be scaled in the container; ensure it stays centered */
}
#hud {
  position: absolute;
  top: 10px; left: 10px; right: 10px;
  font-family: 'Press Start 2P', monospace;
  color: #0ff;
  text-shadow: 0 0 5px #0ff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none; /* allow clicks to pass to canvas except on interactive elems */
}
#healthContainer {
  width: 200px; height: 20px;
  border: 2px solid #0f0;
  padding: 2px;
  background: #222;
}
#healthBar {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #0f0, #ff0);
}
#waveDisplay {
  font-size: 14px;
}
#muteBtn {
  pointer-events: auto; /* make clickable */
  background: none;
  border: none;
  color: #0ff;
  font-size: 20px;
  cursor: pointer;
  filter: drop-shadow(0 0 5px #0ff);
}
#muteBtn.muted:after { content: "🔇"; } /* toggle icon */
#powerUpModal {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.powerCard {
  background: #111;
  border: 2px solid #444;
  margin: 10px;
  width: 150px; height: 180px;
  text-align: center;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 0 10px magenta;
  transition: transform 0.3s;
}
.powerCard:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px cyan;
}
.powerCard h3 { font-size: 14px; margin: 8px 0; }
.powerCard p { font-size: 12px; margin: 4px; }
#gameOverScreen {
  position: absolute;
  top: 0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.9);
  color: #fuchsia;
  text-align: center;
  padding-top: 200px;
  font-family: 'Press Start 2P';
}
#gameOverScreen h1 { font-size: 32px; margin-bottom: 20px; }
#restartBtn {
  font-family: 'Press Start 2P';
  font-size: 16px;
  padding: 10px 20px;
  background: #222; color: #fff;
  border: 2px solid #fff;
  cursor: pointer;
}
#restartBtn:hover { background: #fff; color: #000; }
```

This CSS:

* Positions HUD and gives neon text glow.
* Styles health bar with a green-to-yellow gradient and a border.
* Mute button shows a speaker icon; toggling class “muted” could switch it (we might do that via JS rather than CSS content).
* Power-up cards (`.powerCard`) styled with a subtle glow and a hover enlarge effect.
* GameOver screen has pink text and a retro font, with a restart button.

### Main Game Loop and Initialization (main.js)

Now to the main JavaScript logic. The `main.js` will tie everything:

1. Set up canvas and context.
2. Create game objects (player, arrays for enemies, etc.).
3. Load audio and start background music on user interaction.
4. Setup event listeners (mouse move, click, touch, keydown for space, etc.).
5. Start the requestAnimationFrame loop for updates.
6. Handle the game state transitions (power-up modal, game over, restart).

Pseudo-code with comments:

```js
import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Projectile } from './Projectile.js';
import { powerUps } from './PowerUp.js';  // array of power-up definitions

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let game = {
  player: new Player(canvas.width/2, canvas.height/2),
  enemies: [],
  projectiles: [],
  particles: [],
  wave: 0,
  paused: true,
  gameOver: false
};

let lastTimestamp = 0;
function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const delta = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  if (!game.paused) {
    update(delta);
    render();
  }
  if (!game.gameOver) {
    requestAnimationFrame(gameLoop);
  }
}
```

We pause initially because we likely want a "Click to Start" so that we can start audio. Once clicked, we’ll set `game.paused=false` and call `requestAnimationFrame(gameLoop)`.

Update and render functions:

```js
function update(delta) {
  const player = game.player;
  player.update(delta);
  
  // Update projectiles
  for (let p of game.projectiles) {
    p.update(delta);
  }
  // Remove off-screen or used projectiles
  game.projectiles = game.projectiles.filter(p => !p._destroy);
  
  // Update enemies
  for (let e of game.enemies) {
    e.update(delta);
  }
  // Check collisions: projectiles hitting enemies
  for (let p of game.projectiles) {
    for (let e of game.enemies) {
      if (!e._dead) {
        const dx = e.x - p.x;
        const dy = e.y - p.y;
        if (Math.hypot(dx, dy) < e.radius + p.radius) {
          // hit
          e.health -= p.damage;
          spawnFloatingText(Math.floor(p.damage), e.x, e.y, '#ffb');
          if (!p.piercing) p._destroy = true;
          if (e.health <= 0) {
            e._dead = true;
            game.player.score++; // if tracking score
            spawnParticles(e.x, e.y, e.radius, e.color);
            // maybe play explosion SFX
          } else {
            // maybe play hit SFX
          }
        }
      }
    }
  }
  // Remove dead enemies
  game.enemies = game.enemies.filter(e => !e._dead);
  
  // Update particles
  for (let part of game.particles) {
    part.update(delta);
  }
  game.particles = game.particles.filter(part => part.life > 0);
  
  // Check end of wave
  if (game.enemies.length === 0 && !game.gameOver) {
    game.paused = true;
    openPowerUpModal();
  }
}
```

In the collision loops:

* We mark projectiles with a `_destroy` flag instead of splicing immediately to avoid messing up loops.
* Mark enemies with `_dead` when their health drops, then filter out.
* `spawnFloatingText` and `spawnParticles` are helper functions (not shown here) that create the respective objects and push into arrays. For floating text, maybe they create a DOM element instead; for simplicity, assume they push a Particle with a text property or something. (One could refine that by having a separate text mechanism).
* After update, if no enemies remain, trigger the power-up modal for next wave.

Render function:

```js
function render() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw background grid or stars if any (we could have drawn a static background in CSS or separate canvas)
  // For now, assume just solid background via CSS.
  
  // Draw player
  game.player.draw(ctx);
  
  // Draw projectiles
  for (let p of game.projectiles) {
    p.draw(ctx);
  }
  // Draw enemies
  for (let e of game.enemies) {
    e.draw(ctx);
  }
  // Draw particles
  for (let part of game.particles) {
    part.draw(ctx);
  }
}
```

We rely on each class’s `draw` method to do the right thing:

* Player.draw might draw a triangle rotated to player.angle.
* Enemy.draw draws a neon shape (likely using ctx.shadowBlur for glow).
* We ensure before drawing the neon objects to set the appropriate context shadow properties:
  e.g. in Player.draw:

  ```js
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.rotate(this.angle);
  ctx.shadowColor = '#0ff';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#0ff';
  ctx.beginPath();
  ctx.moveTo(20, 0);
  ctx.lineTo(-10, 10);
  ctx.lineTo(-10, -10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ```

  That would draw a little triangle representing a ship, with a cyan glow.

**HUD updates:** We must sync the HTML HUD with game state in the loop:

* Update health bar width and color perhaps:

  ```js
  const hpPercent = game.player.hp / game.player.maxHp;
  document.getElementById('healthBar').style.width = (hpPercent*100) + '%';
  ```

  If we want the bar to change color as it lowers (green to red), we could do a CSS or manually adjust background. Simpler: use CSS gradient that is always green->yellow and maybe manually set to red if very low.
* Update waveDisplay:

  ```js
  document.getElementById('waveDisplay').innerText = `Wave ${game.wave}`;
  ```

  This should be updated whenever wave changes (so maybe in startWave function).
* The score or any other HUD element likewise updated as needed.

**Power-up Modal logic:**

```js
function openPowerUpModal() {
  game.wave++;  // increment wave count for next wave
  // If game over happened just as wave ended, don't show modal
  if (game.gameOver) return;
  
  const modal = document.getElementById('powerUpModal');
  modal.innerHTML = '<h2>Choose a Power-Up</h2>';
  // pick 3 random powerUps
  const choices = [];
  while (choices.length < 3) {
    const pu = powerUps[Math.floor(Math.random()*powerUps.length)];
    if (!choices.includes(pu)) choices.push(pu);
  }
  choices.forEach((pu, index) => {
    const card = document.createElement('div');
    card.className = 'powerCard';
    card.innerHTML = `<h3>${pu.name}</h3><p>${pu.description}</p>`;
    card.onclick = () => {
      pu.apply(game.player);
      closePowerUpModal();
    };
    modal.appendChild(card);
  });
  modal.style.display = 'flex';
}
function closePowerUpModal() {
  document.getElementById('powerUpModal').style.display = 'none';
  // resume game and spawn next wave
  spawnWave(game.wave);
  game.paused = false;
}
```

Note: We increment `game.wave` at modal open – meaning it now represents the incoming wave number. Alternatively, we could increment when spawning. But the idea is wave 1 starts (spawnWave(1)), when cleared, increment to 2 on modal, then spawnWave(2).

**spawnWave function:**

```js
function spawnWave(number) {
  // Use formulas as described earlier to add enemies
  const count = Math.round(4 + number * 1.5);
  for (let i = 0; i < count; i++) {
    // random spawn around edges
    let x, y;
    if (Math.random() < 0.5) {
      // spawn top or bottom
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? -20 : canvas.height + 20;
    } else {
      // spawn left or right
      x = Math.random() < 0.5 ? -20 : canvas.width + 20;
      y = Math.random() * canvas.height;
    }
    const baseHealth = 20, baseSpeed = 50, baseDamage = 10;
    const scale = Math.pow(1.15, number-1);
    const enemy = new Enemy(x, y,
                  baseSpeed * Math.pow(1.1, number-1),
                  baseHealth * scale,
                  baseDamage * scale);
    game.enemies.push(enemy);
  }
  document.getElementById('waveDisplay').innerText = `Wave ${number}`; 
}
```

This is a simplified spawn: spawns at random edges. (Better would be exactly around perimeter circle as earlier, but either works.)

**Game Over handling:**
When player HP <= 0 in Player.takeDamage, we call `gameOver()`:

```js
function gameOver() {
  game.gameOver = true;
  game.paused = true;
  // Stop music
  bgm.pause();
  // Show Game Over screen
  document.getElementById('wavesSurvived').innerText = game.wave;
  document.getElementById('gameOverScreen').style.display = 'block';
}
```

We likely also cancel the rAF loop. In our gameLoop above, we did:

```js
if (!game.gameOver) {
  requestAnimationFrame(gameLoop);
}
```

So once gameOver is true, it stops requesting new frames. We might want to do one final render to show everything clearly, but since we show an overlay, it’s fine.

**Restart logic:**

```js
document.getElementById('restartBtn').onclick = () => {
  // Reset game state
  game.player = new Player(canvas.width/2, canvas.height/2);
  game.enemies = [];
  game.projectiles = [];
  game.particles = [];
  game.wave = 0;
  game.gameOver = false;
  // Hide game over screen
  document.getElementById('gameOverScreen').style.display = 'none';
  // Resume music
  bgm.currentTime = 0;
  if (audioEnabled) bgm.play();
  // Start first wave
  spawnWave(1);
  game.paused = false;
  requestAnimationFrame(gameLoop);
};
```

This will effectively start a fresh game. We might also clear any lingering UI (like hide powerUpModal if it was open, etc., just to be safe).

**Input Handling:**
We add event listeners for:

* Mouse movement (update a global `input.mouseX, mouseY` used in Player.update to set angle).
* Mouse down/up to set `input.mouseDown`.
* Keydown for space to set `input.keySpace` (and keyup to unset).
* Maybe touch events: on touchmove, set input coords; on touchstart, treat as mouseDown, etc.
* Pause button (if we had one): e.g. `document.addEventListener('keydown', e=>{ if(e.key==='p'){ togglePause(); }})`.

Example:

```js
const input = { mouseX: canvas.width/2, mouseY: canvas.height/2, mouseDown: false, keySpace: false };

canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  input.mouseX = e.clientX - rect.left;
  input.mouseY = e.clientY - rect.top;
});
canvas.addEventListener('mousedown', e => { input.mouseDown = true; });
canvas.addEventListener('mouseup', e => { input.mouseDown = false; });
document.addEventListener('keydown', e => {
  if (e.code === 'Space') { input.keySpace = true; e.preventDefault(); }
});
document.addEventListener('keyup', e => {
  if (e.code === 'Space') { input.keySpace = false; }
});
```

We pass this `input` into player update or use it globally in Player.update (like referencing `input.mouseX`). Perhaps better to store input on game or player.

For mobile:

```js
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  input.mouseDown = true;
  const rect = canvas.getBoundingClientRect();
  input.mouseX = e.touches[0].clientX - rect.left;
  input.mouseY = e.touches[0].clientY - rect.top;
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  input.mouseX = e.touches[0].clientX - rect.left;
  input.mouseY = e.touches[0].clientY - rect.top;
});
canvas.addEventListener('touchend', e => {
  input.mouseDown = false;
});
```

This allows dragging finger to aim and lifting to stop shooting.

**Audio setup:**
We load audio files:

```js
const shootSound = new Audio('assets/shoot.wav');
const explodeSound = new Audio('assets/explode.wav');
const bgm = new Audio('assets/synthwave.mp3');
bgm.loop = true;
bgm.volume = 0.5;
let audioEnabled = true;

document.getElementById('muteBtn').onclick = () => {
  audioEnabled = !audioEnabled;
  document.getElementById('muteBtn').innerText = audioEnabled ? '🔈' : '🔇';
  bgm.volume = audioEnabled ? 0.5 : 0;
};
```

We won’t play `bgm` until the user interacts (like clicking Start or the canvas). We can call `bgm.play()` inside our first user input handler:

```js
canvas.addEventListener('mousedown', startGame);
document.addEventListener('keydown', startGame);
function startGame() {
  // Remove these handlers so this runs only once
  canvas.removeEventListener('mousedown', startGame);
  document.removeEventListener('keydown', startGame);
  // Start music
  if (audioEnabled) bgm.play();
  // Start first wave
  spawnWave(1);
  game.paused = false;
  requestAnimationFrame(gameLoop);
}
```

This way, the game doesn’t start (and music doesn’t autoplay) until the player clicks or presses a key. We might show a overlay “Click to Start” text initially in HTML which we then hide on start.

Now, with this code walkthrough, a team can implement the game step-by-step:

* Write the classes (Player, Enemy, etc.) as per earlier definitions.
* Implement the main loop and state logic as above.
* Test each part incrementally: movement, shooting, wave spawning, etc.
* Finally, integrate the polish elements (particles, screen shake, etc.) ensuring they don’t break the core flow.

Comment the code liberally, explaining each section for clarity:

```js
// In Player.update, for example:
update(delta) {
  // Calculate angle towards cursor
  this.angle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);
  // Shooting logic...
}
```

This walkthrough covers all major components and shows how they interact. The guide can be used to build the full game code, and each snippet corresponds to a piece of the overall system described in previous sections.

## Testing & Optimization

Testing the game thoroughly is important to ensure smooth performance and a bug-free experience, especially as we scale to later waves or different devices.

**Performance (FPS) Testing:**

* Use the browser’s dev tools performance monitor or a simple in-game counter to ensure the game runs at \~60 FPS on target devices. If you see FPS dropping as waves grow, profile which part of the update loop is slow.
* Potential bottlenecks:

  * **Rendering**: Many glowing objects (shadowBlur) can slow down. If needed, optimize by reducing shadowBlur on far background objects or limiting particle count.
  * **Collision loops**: Our double loop is O(N\*M) for proj vs enemies. If hundreds of each exist, that could be heavy. If needed, spatial partitioning (like dividing the canvas into quadrants) could be added to check collisions in smaller regions. However, given a reasonable cap on enemies (\~hundreds) this might be okay.
* On mobile devices, test and possibly lower certain effects:

  * For example, on low-end phones, consider using simpler sprite without blur (or CSS `filter: blur()` which might be GPU-accelerated).
  * Limit simultaneous particles if it janks (maybe spawn 5 instead of 10 per death if performance dips).

**Memory and Leak Testing:**

* Monitor that objects are being garbage-collected:

  * Are we removing event listeners properly on game over or restart? We should ensure no duplicated rAF loops or stray intervals. Our restart code resets the game state but reuses the same rAF function. That should be fine as long as we stopped the old one by not requesting new frames after gameOver.
  * Entities: projectiles and particles arrays are filtered, old objects become unreachable and should GC. That’s fine. Just ensure the filter logic actually removes all dead references.
* Check for accumulating DOM elements:

  * If using DOM for floating text, ensure to remove those `<div>` after animation. Could use an animationend event or a timeout to `removeChild`. Without cleanup, those would leak memory and slow down DOM.
  * PowerUpModal cards: we regenerate innerHTML each time, so old elements are replaced (which is fine).
* Use performance profiling to see if any function grows in memory usage over time – often sources of leaks are forgotten arrays that only grow. We should see steady memory usage over long play if all old entities are cleaned.

**Gameplay Testing:**

* Balance: play test the wave progression and power-ups:

  * Does the player feel overwhelmed too soon? If yes, maybe reduce the enemy scaling or give stronger power-up effects.
  * Alternatively, if you can survive indefinitely after stacking certain upgrades, maybe increase difficulty or limit stacking of that upgrade.
  * Aim to find a sweet spot where a new player might reach, say, wave 5-6 on first try, and an experienced or lucky-power-up player can go to maybe wave 15-20, beyond which it becomes extremely hard (expected in endless mode).
* Test all power-ups to ensure they work:

  * Does Piercing shot actually allow bullet to hit multiple enemies? (We set projectile.piercing and only destroy projectile if not piercing – ensure logic is correct).
  * Does Life Steal actually increase HP and not exceed max HP (maybe cap to max HP).
  * If an effect is supposed to slow enemies, verify that’s coded (e.g. maybe we give enemies a `speedMod` that a Slow Field power toggles).
* Edge cases:

  * What if an enemy dies exactly as it hits the player? Possibly both damage and death occur. Our code would deduct player HP and mark enemy dead. That’s fine – as long as player HP doesn’t go below 0 multiple times or something odd.
  * If multiple enemies hit player in same frame and kill them, ensure gameOver triggers once.
  * If player dies while power-up modal is open (theoretically shouldn’t happen since modal opens after wave clear when no enemies are alive).
  * If the player picks a power-up that affects firing while still holding the fire button, does it apply immediately? (It should).
* Multiplatform:

  * Test in Chrome, Firefox, Safari, Edge – since we stick to standard API, it should behave similarly. Audio might have slight differences (e.g. some mobile browsers require user gesture for each sound, or limit number of simultaneous sounds).
  * Test on mobile browsers for touch controls. See if the aiming feels natural. Perhaps add an optional *auto-fire on mobile* if tapping is awkward (maybe whenever a touch is down, fire continuously).

**Optimizations:**

* Use `requestAnimationFrame` properly (we are). Avoid using `setInterval` for game loop, as rAF is more efficient and auto-throttles when tab isn’t active.

* We included delta time to avoid frame-dependent logic; that’s good for consistency. But also consider capping delta (if the game lags for a second, delta could be huge and cause big jumps). Some devs cap `if(delta > 50) delta = 50` to avoid physics tunneling issues. Given our game, a huge delta would just possibly skip through an enemy. It may not be a big problem, but capping could be a safety.

* **DevicePixelRatio scaling**: If on high DPI, the canvas might look blurry if not scaled. We can improve rendering by doing:

  ```js
  const dpr = window.devicePixelRatio || 1;
  canvas.width = 800 * dpr;
  canvas.height = 600 * dpr;
  ctx.scale(dpr, dpr);
  ```

  and then style the canvas CSS width as 800px, so it’s sharp. However, since we are making it full-screen responsive, we might instead do:

  ```js
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.scale(dpr, dpr);
  ```

  at startup and on resize. This ensures crisp graphics on retina displays at cost of more pixels to draw (performance trade-off). If performance is fine, it’s worth it for visual quality.

* **Lighter glow alternative:** If the shadowBlur is a perf issue, consider one of:

  * Using pre-made glow sprites (e.g. draw a sprite that already has glow baked in).
  * Only apply shadowBlur to big objects, not every small projectile.
  * Use a second canvas layer for glow: e.g. draw all bright objects on a separate canvas, blur that canvas once, and overlay. This is a bit advanced and maybe overkill here.

* **Garbage reduction:** Reuse objects where possible to avoid constant allocations. For example, recycle projectile objects from a pool instead of `new Projectile` each time if firing rate is very high. In our game, that might not be necessary unless we see GC causing hitches.

  * Similarly, reuse particle objects or use a fixed array for them if worried.

* **Offscreen rendering:** If we have static background (like starfield that doesn’t change), draw it once to an offscreen canvas or image and just draw that each frame instead of recomputing stars.

The game is relatively simple, so heavy optimizations likely aren’t needed beyond what we have. The focus should be on making sure it *feels* smooth. Continuous testing while developing will catch if something introduces lag or stutter.

Also test loading: does the game start quickly? With <5 MB assets and probably even less in code, it should. If any audio files are large, consider providing a low-bitrate version for faster load.

Finally, **user feedback**: when others test, see if they find controls intuitive (especially on mobile). Adjust accordingly:

* If aiming is hard, maybe implement a slight auto-aim assist (like bullets bend a bit toward nearest enemy).
* If game is too easy/hard, tweak spawn counts or power-up strength.

We treat the game as an evolving piece – with testing, iterate on these parameters to fine-tune the fun factor.

## Deployment & Hosting

Once the game is built and tested, we can deploy it to be played online. Two simple and free options are **GitHub Pages** and **Netlify**:

**GitHub Pages Deployment:**

1. **Repository Setup:** Ensure all game files (HTML, CSS, JS, assets) are in a Git repository. For Pages, we can use the repository’s root or a `docs/` folder or the special `gh-pages` branch. Easiest is to create a branch named `gh-pages` and push the code there. GitHub Pages will automatically host it at `https://<username>.github.io/<repo-name>/`.
2. **Branch method:** As End3r’s blog notes, *“The short story is: change the name of your branch in the repository to `gh-pages`, voila!”*. You can do this via GitHub’s branch settings. After pushing, within a minute or so the site is live.
3. **Using main branch:** Alternatively, in the repository settings on GitHub, enable Pages and set source to the main branch `/root` or `/docs`. If using `/docs`, put your `index.html` and others in a docs folder.
4. **Access URL:** Once deployed, navigate to the GitHub Pages URL (given in repo settings or as above). You should see the game load. Use the browser console to ensure no 404 errors (if any asset paths are wrong).
5. GitHub Pages is ideal for static sites and supports our needs well. It’s free and doesn’t require any additional setup beyond enabling it.

**Netlify Deployment:**

1. **Drag-and-Drop:** Netlify offers an extremely simple method – go to app.netlify.com, sign up, and use the **Sites** UI to drag your project’s folder (the one containing index.html) onto the dashboard. It will upload and deploy instantly.
2. Netlify will assign a random name to your site (like *neon-td-shooter.netlify.app* which you can change).
3. **Git Integration:** You can also connect your GitHub repo to Netlify. It will auto-deploy whenever you push new commits. For this, create a new site from Git in Netlify, select your repo, and it usually auto-detects it’s a static site (no build command needed for plain HTML/JS). Just set publish directory to the folder containing index.html (likely root).
4. Both methods yield a live URL accessible on any device.
5. Benefits of Netlify: quick updates and easier custom domain setup if you have one (though GitHub Pages also supports custom domains via CNAME).
6. Netlify also provides automatic HTTPS and some analytics for free.

**Additional Deployment Notes:**

* **Verify Paths:** If using relative paths for assets, they should work on Pages/Netlify. Just avoid any local filesystem references. Usually all is well if everything is relative (which is the case if we use same structure).
* **Case Sensitivity:** Web servers are case-sensitive with file names. Ensure your references to files match their case (e.g. `Player.js` vs `player.js`). Locally on Windows it might not matter, but on Pages it will.
* **Testing the deployed site:** After upload, test in multiple browsers (especially if any behavior differs when served over web vs local – e.g. Audio might behave slightly differently due to autoplay policies, but since we handle user gesture it should be fine).
* **Continuous Deployment:** If using GitHub integration, any push to `gh-pages` or main (depending on setup) will update the live site. So the team can collaborate and deploy new versions easily.

**Alternate Hosting:** GitHub Pages and Netlify are recommended for simplicity, but you could also use itch.io (popular for HTML5 games), or GitLab Pages, or a regular web hosting if available. The key is it’s a static front-end, so no special server code needed.

Finally, once deployed, share the link with team/friends for final round of testing on various devices. Netlify and Pages both support mobile access (just need an internet connection and a modern browser). Since we tested on Safari iOS and Chrome Android, it should work similarly when hosted.

By following this deployment guide, you’ll have the game live on the web for anyone to play, demonstrating the 2D neon shooter in all its glory.

---

**What to Try Next:**
Now that the core game is up and running, here are some stretch goals and ideas to explore:

* **Leaderboards:** Integrate an online leaderboard to showcase top wave counts. This could use a simple backend or a service like Google Firebase to store scores.
* **Social Sharing:** Add a Twitter share button on game over so players can tweet “I survived 12 waves in Neon TD Shooter!” – a fun way to promote the game.
* **Boss Encounters:** Every 10th wave, spawn a unique boss enemy with special mechanics (e.g. shoots lasers or splits into multiple enemies). This breaks up the monotony of normal waves.
* **Visual Upgrades:** Implement a full-screen shader for CRT effect – scanlines, curvature, and a slight VHS noise to push the retro aesthetic further.
* **More Power-Ups:** Introduce rare “Ultra” power-ups that fundamentally change gameplay (like a shield that orbits the player blocking one hit, or the ability to teleport to dodge).
* **Tower Defense Elements:** Since it’s a “tower-defense shooter”, you could allow the player to place stationary defense turrets between waves. This merges traditional TD mechanics (placing towers that automatically shoot) with the shooting gameplay. Balance would be interesting here – maybe turrets are temporary or upgradable via power-ups.
* **Cooperative Multiplayer:** As discussed, try a 2-player mode. Perhaps both players share the center and have independent aim. You’d need to handle two sets of inputs – maybe one on WASD + shift to fire, and one on arrow keys + space to fire, or better, support gamepads for dual-stick shooter action.
* **Different Arenas:** Instead of one background, add environment variety. For example, a level set in “Neo Tokyo” cityscape background versus “Tron Grid” vs “Space”. Purely cosmetic, but could be tied to difficulty progression.
* **Soundtrack Expansion:** Add multiple music tracks and change the music as waves increase (faster tempo on high waves, etc.). Could also randomly pick between a few tracks each run to keep it fresh.
* **PWA (Progressive Web App):** Make the game installable on mobile/home screen by adding a manifest and service worker. This way players can launch it like a native app and even play offline once assets are cached.
* **Analytics:** Integrate basic analytics (like Google Analytics or simpler) to see how long players play, what wave they reach most often, etc., to gather insight for tuning difficulty.
* **Easter Eggs:** Fun little touches like a Konami code input that gives an extra life or a secret power-up, or a hidden “1980s Mode” that toggles a filter or changes enemy sprites to something humorous.

Each of these features can build on the solid foundation we’ve created. The game’s code is organized to allow enhancements without starting from scratch. Have fun expanding the game, and keep that neon glow shining bright!

Good luck, and happy coding!&#x20;
