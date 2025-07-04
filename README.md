# Neon Tower-Defense Shooter

A browser-based 2D tower-defense shooter with an infinite wave survival format and stunning neon synthwave aesthetics. Built with vanilla JavaScript and modern web technologies.

## 🎮 Game Features

- **Infinite Wave Survival**: Face increasingly difficult waves of enemies with exponential scaling
- **Advanced Power-Up System**: Choose from 16+ upgrades in a shop-style interface with tabs (Offense/Defense/Utility)
- **Stack-Based Progression**: Most power-ups can be stacked multiple times with balanced pricing
- **Neon Synthwave Aesthetics**: Retro-futuristic visuals with glowing effects and neon color palette
- **Responsive Design**: Fully responsive gameplay that adapts to any screen size while maintaining 4:3 aspect ratio
- **Mobile-First Controls**: Touch controls with optimized UI for mobile devices
- **Performance Optimization**: Built-in performance monitoring with automatic quality adjustments
- **Visual Effects**: Screen shake, particle explosions, floating damage text, muzzle flash effects
- **Economic System**: Coin-based economy with wave completion bonuses and inflation balancing

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd neon-td-vanilla
   ```

2. **Install dependencies** (requires Node.js):
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Open your browser** to `http://localhost:8080`

## 🎯 How to Play

- **Auto-Targeting**: Your turret automatically targets and fires at the nearest enemy
- **Survive Waves**: Destroy enemies before they reach the center and damage you
- **Earn Coins**: Gain coins for each enemy killed and bonus coins for wave completion
- **Shop Between Waves**: Use coins to purchase power-ups in the organized shop interface
- **Stack Power-Ups**: Many upgrades can be purchased multiple times for compounding effects
- **Reach High Waves**: Survive as long as possible with exponentially increasing difficulty

### Controls
- **Mouse/Touch**: Navigate menus and interact with shop
- **P Key**: Pause/unpause game during waves
- **Audio Toggle**: Click speaker icon to mute/unmute

## 🛠️ Architecture & Code Structure

### Project Organization

```
/neon-td-vanilla
├── index.html              ← Main game page with responsive layout
├── package.json            ← Development dependencies and scripts
├── /style                  ← Modular CSS architecture
│   ├── index.css           ← Main stylesheet with imports
│   ├── /base               ← Foundation styles
│   │   ├── variables.css   ← CSS custom properties and design tokens
│   │   └── reset.css       ← Browser normalization
│   ├── /layout             ← Layout components
│   │   └── game-container.css
│   ├── /components         ← UI component styles
│   │   ├── cards.css       ← Power-up card styling
│   │   ├── health.css      ← Health bar component
│   │   ├── hud.css         ← HUD elements
│   │   ├── overlays.css    ← Modal and overlay styles
│   │   ├── shop.css        ← Shop interface styling
│   │   └── stats.css       ← Statistics display
│   ├── /effects            ← Visual effects
│   │   ├── animations.css  ← Keyframe animations
│   │   ├── floating-text.css ← Damage text effects
│   │   └── visual-effects.css
│   └── /responsive         ← Responsive design
│       └── mobile.css      ← Mobile-specific adaptations
└── /js                     ← Game logic modules
    ├── main.js             ← Application entry point and game loop
    ├── Game.js             ← Core game state and wave management
    ├── Player.js           ← Player entity with auto-targeting
    ├── Enemy.js            ← Enemy behavior and pathfinding
    ├── Projectile.js       ← Bullet physics and collision
    ├── PowerUp.js          ← Power-up system with weighted selection
    ├── Shop.js             ← Shop interface and pricing logic
    ├── Particle.js         ← Visual effects system
    ├── /config             ← Game configuration
    │   └── GameConfig.js   ← Centralized balance and settings
    ├── /managers           ← System managers
    │   └── PerformanceManager.js ← Performance monitoring
    └── /utils              ← Utility functions
        ├── MathUtils.js    ← Mathematical helpers
        └── ObjectPool.js   ← Memory management
```

### Key Technologies & Patterns

- **ES6 Modules**: Clean, modular JavaScript architecture
- **CSS Custom Properties**: Centralized design system with CSS variables
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **Object-Oriented Design**: Entity system with inheritance and composition
- **Performance Optimization**: Object pooling, performance monitoring, adaptive quality
- **Configuration-Driven**: Centralized game balance in `GameConfig.js`

## 🎨 Visual Design System

### Neon Synthwave Aesthetic
- **Color Palette**: Cyan (#0ff), Hot Pink (#ff2dec), Purple (#8f00ff), Yellow (#ff0)
- **Typography**: 'Press Start 2P' for UI, 'Audiowide' for headers
- **Effects**: CSS-based glow effects using `text-shadow` and `box-shadow`
- **Responsive Layout**: Maintains visual consistency across all screen sizes

### Component System
- **Modular CSS**: Each UI component has dedicated stylesheet
- **Design Tokens**: Centralized colors, spacing, and effects in `variables.css`
- **Mobile Optimization**: Automatic scaling and layout adjustments

## ⚙️ Game Systems

### Wave Progression
- **Linear Enemy Count**: Base count + (wave × multiplier)
- **Exponential Stat Scaling**: Health/Speed/Damage increase by 15%/10%/15% per wave
- **Dynamic Spawn Timing**: Faster enemy spawning in later waves
- **Difficulty Balancing**: Configured scaling caps prevent infinite growth

### Power-Up System
- **16+ Available Upgrades**: Organized in Offense/Defense/Utility categories
- **Weighted Random Selection**: Balanced rarity system (Common/Uncommon/Rare)
- **Stack-Based Pricing**: Exponential cost increase for repeated purchases
- **Economic Balance**: Wave-based coin rewards with inflation adjustment

### Performance System
- **Real-Time FPS Monitoring**: Automatic quality adjustments
- **Adaptive Particle Limits**: Reduces effects when performance drops
- **Object Pooling**: Efficient memory management for high-frequency objects
- **Mobile Optimization**: Reduced effects and optimized rendering on mobile

## 🔧 Configuration & Customization

### Game Balance (`GameConfig.js`)
- **Wave Scaling**: Adjust difficulty progression curves
- **Power-Up Pricing**: Modify shop economics and balance
- **Performance Limits**: Set particle counts and optimization thresholds
- **Visual Effects**: Configure screen shake intensity and particle settings

### Adding New Features

#### New Power-Ups
```javascript
// In PowerUp.js
new PowerUp(
    "Power Name",
    "Description of effect",
    "🎯", // Icon
    (player) => {
        // Apply effect to player
        player.damageMod *= 1.5;
        player.powerUpStacks["Power Name"]++;
    },
    2, // Weight (1=rare, 3=common)
    true // Stackable
)
```

#### New Enemy Types
```javascript
// Extend Enemy.js for new behavior
class FastEnemy extends Enemy {
    constructor(x, y, waveScaling) {
        super(x, y, 
            baseSpeed * 2 * waveScaling.speed,
            baseHealth * 0.5 * waveScaling.health, 
            baseDamage * waveScaling.damage
        );
        this.color = '#ff0080'; // Pink fast enemy
    }
}
```

#### Custom Visual Effects
```javascript
// Add to Game.js particle system
createCustomEffect(x, y) {
    for (let i = 0; i < 8; i++) {
        const particle = this.particlePool.get(
            x, y, velocityX, velocityY, lifetime, color
        );
        this.particles.push(particle);
    }
}
```

## 📱 Mobile Support & Responsive Design

### Automatic Adaptations
- **Canvas Scaling**: Maintains 4:3 aspect ratio across all devices
- **UI Scaling**: Responsive HUD elements with appropriate sizing
- **Touch Controls**: Optimized for mobile interaction
- **Performance**: Reduced effects on lower-end devices

### Mobile-Specific Features
- **Touch-Friendly UI**: Larger buttons and touch targets
- **Simplified Controls**: Auto-targeting reduces complexity
- **Adaptive Quality**: Automatic performance adjustments
- **Portrait Support**: Responsive layout for various orientations

## 🔊 Audio System (Optional)

### Supported Audio Files
Place in `/assets/` directory:
- `synthwave.mp3` - Background music
- `shoot.wav` - Gunshot sound effect
- `explode.wav` - Explosion sound
- `hurt.wav` - Player damage sound
- `powerup.wav` - Power-up selection sound

### Features
- **Graceful Degradation**: Game works without audio files
- **User Controls**: Mute/unmute toggle with persistent preferences
- **Browser Compatibility**: Handles autoplay policies correctly

## 🚀 Deployment

### GitHub Pages
1. Push code to `gh-pages` branch or enable Pages in repository settings
2. Game will be live at `https://<username>.github.io/<repo-name>/`

### Netlify
1. Connect repository to Netlify or drag project folder to dashboard
2. Automatic deployment with custom domain support

### Testing Deployment
- Verify all asset paths work correctly
- Test on multiple browsers and devices
- Confirm audio functionality (if using)

## 🐛 Troubleshooting

### Common Issues

**Game won't start**:
- Ensure running from web server (not file://)
- Check browser console for JavaScript errors
- Verify all file paths are correct and case-sensitive

**Performance issues**:
- Monitor with Performance Manager built-in system
- Reduce particle counts in `GameConfig.js`
- Check `PerformanceManager` settings for optimization

**Mobile controls not responsive**:
- Verify touch event handling in `main.js`
- Check viewport meta tag in HTML
- Test on actual devices, not just browser dev tools

**Audio not playing**:
- Ensure user interaction before audio starts (handled automatically)
- Check file paths and audio format compatibility
- Test mute/unmute functionality

## 🎯 Performance Guidelines

### Recommended Specs
- **Desktop**: Modern browser, 60 FPS target
- **Mobile**: iOS Safari 12+, Chrome Mobile 80+
- **Memory**: <100MB RAM usage during gameplay

### Optimization Features
- **Automatic Quality Scaling**: Reduces effects when FPS drops
- **Object Pooling**: Prevents garbage collection hitches
- **Efficient Rendering**: Optimized canvas operations
- **Mobile Adaptations**: Reduced particle counts and effects

## 📄 License

MIT License - Feel free to modify and extend!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test thoroughly on multiple devices
4. Submit a pull request with detailed description

---

*Built with passion for retro gaming aesthetics and modern web performance.*
