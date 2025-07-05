# 🎮 Neon Tower Defense Shooter

A browser-based 2D tower defense game with infinite wave survival, auto-targeting mechanics, and vibrant neon aesthetics. Built with vanilla JavaScript and HTML5 Canvas for smooth 60fps gameplay.

## ✨ Features

### 🎯 Core Gameplay
- **Intelligent Auto-targeting System**: Advanced player rotation and targeting AI with customizable turn speed
- **Balanced Difficulty Curve**: Slower initial firing with strategic enemy scaling that increases challenge over time
- **Infinite Wave Survival**: Progressively challenging enemy waves with 25% health increase per wave
- **Power-up Shop**: 15+ upgrades across offense, defense, and utility categories
- **Stackable Upgrades**: Build your perfect loadout with combinable power-ups
- **Smart Enemy AI**: Enemies with varied movement patterns and behaviors

### 🎨 Visual Effects
- **Neon Aesthetic**: Synthwave-inspired visual design
- **Dynamic Particles**: Explosions, muzzle flashes, and hit effects
- **Screen Shake**: Responsive feedback for impacts and explosions
- **Glowing Elements**: All game objects feature neon glow effects
- **Animated UI**: Smooth transitions and floating damage text

### ⚡ Performance
- **Object Pooling**: Optimized memory management for particles and projectiles
- **Performance Monitoring**: Real-time FPS tracking and automatic optimization
- **Responsive Design**: Adapts to different screen sizes while maintaining 4:3 aspect ratio
- **High DPI Support**: Crisp rendering on retina displays

### 🛠️ Technical Features
- **Modular Architecture**: Clean separation of concerns with dedicated systems
- **Collision System**: Efficient circular collision detection
- **Wave Management**: Dynamic enemy spawning and difficulty scaling
- **Effect System**: Centralized visual effects management
- **Configuration System**: Centralized game balance and settings

## 🚀 Quick Start

### Play Online
Visit the [live demo](https://your-username.github.io/neon-td-vanilla) to play immediately in your browser.

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/neon-td-vanilla.git
cd neon-td-vanilla

# Install development server (optional)
npm install

# Start development server
npm run dev
# OR
npm start

# Open browser to http://localhost:8080
```

### Manual Setup
Simply open `index.html` in any modern web browser. For best experience, serve from a local HTTP server:

```bash
# Using Python 3
python -m http.server 8080

# Using Node.js
npx live-server --port=8080
```

## 🎮 How to Play

### Basic Controls
- **Automatic Aiming**: Player automatically targets nearest enemy
- **P Key**: Pause/unpause game
- **Mouse**: Navigate menus and shop interface

### Gameplay Loop
1. **Survive Waves**: Your character auto-fires at approaching enemies
2. **Collect Coins**: Earn currency for each enemy defeated
3. **Shop Phase**: Between waves, purchase power-ups to strengthen your character
4. **Progress**: Each wave increases enemy count, health, speed, and damage
5. **Survive**: See how many waves you can endure!

### Power-Up Categories

#### ⚔️ Offense
- **Damage Boost**: +25% bullet damage (stackable, exponential pricing)
- **Fire Rate**: +12.5% attack speed (stackable, exponential pricing)
- **Turn Speed**: +10% rotation speed for faster target acquisition (stackable, exponential pricing)
- **Triple Shot**: Fire 3 bullets in a spread
- **Piercing Shots**: Bullets pierce through enemies
- **Explosive Shots**: Bullets explode on impact
- **Speed Boost**: +15% projectile speed (stackable, exponential pricing)
- **Double Damage**: +50% bullet damage (stackable, exponential pricing)
- **Rapid Fire**: +25% attack speed (stackable, exponential pricing)
- **Bigger Explosions**: +25% explosion radius and damage (stackable, exponential pricing)

#### 🛡️ Defense
- **Max Health**: +20% health and full heal (stackable)
- **Shield**: Absorbs damage before health (stackable)
- **Regeneration**: +5 health per second (stackable)
- **Shield Regen**: +10 shield per second (stackable)
- **Full Heal**: Instantly restore all health

#### ⚡ Utility
- **Life Steal**: Heal 10% of enemy max health on kill
- **Slow Field**: Enemies move slower near you (stackable)
- **Coin Magnet**: +50% coin rewards from enemy kills (stackable)
- **Lucky Shots**: 10% chance for bullets to deal double damage (stackable chance up to 50%)
- **Immolation Aura**: All nearby enemies take 1% of their max health as burn damage per second (stackable)

## 🏗️ Architecture

### Core Systems

```
Game.js (Main Controller)
├── CollisionSystem.js (Collision detection & responses)
├── WaveManager.js (Enemy spawning & wave progression)
├── EffectsManager.js (Visual effects & screen shake)
├── EntityManager.js (Entity lifecycle management)
└── PerformanceManager.js (FPS monitoring & optimization)
```

### Game Entities

```
Player.js (Player character & abilities)
Enemy.js (Enemy AI & behaviors)
Projectile.js (Bullets & projectile physics)
Particle.js (Visual effect particles)
PowerUp.js (Upgrade system & definitions)
Shop.js (Power-up purchasing interface)
```

### Utilities & Configuration

```
utils/
├── ObjectPool.js (Memory optimization)
├── MathUtils.js (Mathematical operations)
└── config/
    └── GameConfig.js (Centralized game balance)
```

### Key Design Patterns

- **Object Pooling**: Reduces garbage collection for frequently created/destroyed objects
- **System Architecture**: Separation of concerns with dedicated managers
- **Configuration-Driven**: Centralized balance and settings management
- **Event-Driven**: Loose coupling between systems through callbacks

## 🎛️ Configuration

Game balance and settings are centralized in `GameConfig.js`. Key configurable areas:

### Wave Scaling
```javascript
WAVE: {
    BASE_ENEMY_COUNT: 4,          // Enemies in wave 1
    ENEMY_COUNT_SCALING: 2,       // Additional enemies per wave
    SCALING_FACTORS: {
        HEALTH: 1.15,             // 15% health increase per wave
        SPEED: 1.1,               // 10% speed increase per wave
        DAMAGE: 1.15              // 15% damage increase per wave
    }
}
```

### Power-Up Pricing
```javascript
POWERUP_PRICES: {
    "Damage Boost": 15,
    "Triple Shot": 40,
    "Explosive Shots": 60,
    // ... see GameConfig.js for full list
}
```

### Performance Tuning
```javascript
VFX: {
    PARTICLE_LIMITS: {
        MAX_PARTICLES: 200,       // Maximum active particles
        MAX_PROJECTILES: 100      // Maximum active projectiles
    }
}
```

## 🔧 Development

### Project Structure
```
neon-td-vanilla/
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── style/
│   └── index.css          # Game styling and UI
├── js/
│   ├── main.js            # Application entry point
│   ├── Game.js            # Main game controller
│   ├── Player.js          # Player character
│   ├── Enemy.js           # Enemy entities
│   ├── Projectile.js      # Bullet mechanics
│   ├── Particle.js        # Visual effects
│   ├── PowerUp.js         # Upgrade system
│   ├── Shop.js            # Power-up shop
│   ├── config/
│   │   └── GameConfig.js  # Game balance settings
│   ├── utils/
│   │   ├── ObjectPool.js  # Memory optimization
│   │   └── MathUtils.js   # Utility functions
│   ├── systems/
│   │   ├── CollisionSystem.js    # Collision handling
│   │   ├── WaveManager.js        # Wave progression
│   │   ├── EffectsManager.js     # Visual effects
│   │   └── EntityManager.js     # Entity management
│   └── managers/
│       └── PerformanceManager.js # Performance monitoring
└── README.md
```

### Adding New Power-Ups

1. **Define the power-up** in `PowerUp.js`:
```javascript
new PowerUp(
    "My Power-Up",
    "Description of effect",
    "🎯",
    (player) => { /* Apply effect */ },
    true // Stackable
)
```

2. **Add pricing** in `GameConfig.js`:
```javascript
POWERUP_PRICES: {
    "My Power-Up": 25
}
```

3. **Add to shop category** in `Shop.js` or `PowerUp.js`:
```javascript
CATEGORIES: {
    OFFENSE: [..., "My Power-Up"]
}
```

### Performance Debugging

Add `?stats=true` to the URL to enable performance monitoring:
```
http://localhost:8080/?stats=true
```

This displays real-time FPS, frame time, and optimization status.

### Balancing Guidelines

- **Wave Scaling**: Enemy stats should scale exponentially but be capped to prevent infinite growth
- **Power-Up Pricing**: Use stacking multipliers to encourage build diversity
- **Performance**: Keep particle counts under 200 for smooth gameplay on lower-end devices
- **Difficulty**: Each wave should feel challenging but achievable with proper upgrades

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use JSDoc comments for all functions
- Follow the existing modular architecture
- Add configuration options to `GameConfig.js` instead of hardcoding values
- Write performance-conscious code (prefer object pooling for frequently created objects)

## 🐛 Known Issues

- Audio may not autoplay in some browsers due to autoplay policies
- Performance may degrade on very old mobile devices (pre-2018)
- High DPI scaling may cause slight blurriness on some displays

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Fonts**: [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) and [Audiowide](https://fonts.google.com/specimen/Audiowide) from Google Fonts
- **Inspiration**: Classic arcade shooters and modern tower defense games
- **Graphics**: Pure CSS and HTML5 Canvas, no external image assets

## 📈 Roadmap

- [ ] **Audio System**: Add sound effects and background music
- [x] **Enemy Varieties**: Multiple enemy types with unique behaviors  
- [ ] **Boss Battles**: Special boss enemies every 5 waves with enhanced visibility and combat feedback
- [ ] **Achievements**: Unlock system for milestone rewards
- [ ] **Leaderboards**: High score tracking and sharing
- [ ] **Mobile Controls**: Touch-friendly interface improvements
- [ ] **Visual Polish**: Enhanced particle effects and animations
- [ ] **Save System**: Progress persistence between sessions

---

**Built with ❤️ by [Diego Lamarão](https://github.com/your-username) & GitHub Copilot**

*Star ⭐ this repository if you enjoyed the game!*
*Star ⭐ this repository if you enjoyed the game!*
