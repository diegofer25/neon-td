import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Particle } from './Particle.js';
import { PowerUp } from './PowerUp.js';
import { Shop } from './Shop.js';
import { GameConfig } from './config/GameConfig.js';
import { ObjectPool } from './utils/ObjectPool.js';
import { MathUtils } from './utils/MathUtils.js';
import { PerformanceManager } from './managers/PerformanceManager.js';

/**
 * Main game class responsible for managing the entire game state and lifecycle.
 * 
 * This class orchestrates all game entities, handles the game loop, manages waves,
 * collision detection, and rendering. It serves as the central controller for
 * the tower defense game.
 * 
 * @example
 * ```javascript
 * const canvas = document.getElementById('gameCanvas');
 * const ctx = canvas.getContext('2d');
 * const game = new Game(canvas, ctx);
 * game.start();
 * ```
 */
export class Game {
    // Game state constants
    static STATES = {
        MENU: 'menu',
        PLAYING: 'playing', 
        PAUSED: 'paused',
        POWERUP: 'powerup',
        GAMEOVER: 'gameover'
    };

    static TIMING = {
        WAVE_COMPLETION_DELAY: 1000,
        NEXT_WAVE_DELAY: 1000
    };

    /**
     * Creates a new game instance and initializes all subsystems.
     * 
     * Sets up the game canvas, entities, managers, and initial state.
     * All initialization is done through private methods to maintain
     * separation of concerns.
     * 
     * @param {HTMLCanvasElement} canvas - The HTML5 canvas element for rendering
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
     * @throws {Error} When canvas or context is null/undefined
     */
    constructor(canvas, ctx) {
        if (!canvas || !ctx) {
            throw new Error('Canvas and context are required');
        }
        
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = Game.STATES.MENU;
        
        this._initializeEntities();
        this._initializeManagers();
        this._initializeGameState();
        this._initializeShop();
        
        this.init();
    }
    
    /**
     * Initialize all game entity arrays.
     * 
     * Sets up empty arrays for players, enemies, projectiles, and particles.
     * Called during constructor to ensure clean initial state.
     * 
     * @private
     */
    _initializeEntities() {
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
    }
    
    /**
     * Initialize performance managers and object pools.
     * 
     * Sets up the performance monitoring system and creates object pools
     * for efficient memory management of frequently created/destroyed objects.
     * 
     * @private
     */
    _initializeManagers() {
        this.performanceManager = new PerformanceManager();
        this._initializeObjectPools();
        this._initializeScreenShake();
    }
    
    /**
     * Initialize object pools for high-frequency objects.
     * 
     * Creates object pools to reduce garbage collection pressure by reusing
     * particle objects instead of constantly creating/destroying them.
     * 
     * @private
     */
    _initializeObjectPools() {
        this.particlePool = new ObjectPool(
            () => new Particle(0, 0, 0, 0, 0),
            this._resetParticle.bind(this),
            50, 200
        );
    }
    
    /**
     * Reset particle properties for object pool reuse.
     * 
     * This method is called by the object pool when recycling particles.
     * It ensures particles are properly reset to their initial state.
     * 
     * @private
     * @param {Particle} particle - The particle instance to reset
     * @param {number} x - New X position
     * @param {number} y - New Y position  
     * @param {number} vx - New X velocity
     * @param {number} vy - New Y velocity
     * @param {number} life - New lifetime in milliseconds
     * @param {string} [color='#fff'] - New particle color (CSS color string)
     */
    _resetParticle(particle, x, y, vx, vy, life, color) {
        particle.x = x;
        particle.y = y;
        particle.vx = vx;
        particle.vy = vy;
        particle.life = life;
        particle.maxLife = life;
        particle.color = color || '#fff';
        particle.glowColor = color || '#fff';
        particle._destroy = false;
        particle._fromPool = true; // Mark as coming from pool
    }
    
    /**
     * Initialize the screen shake visual effect system.
     * 
     * Sets up the screen shake properties used for impact feedback.
     * Screen shake provides visual feedback for player damage and explosions.
     * 
     * @private
     */
    _initializeScreenShake() {
        this.screenShake = {
            intensity: 0,
            duration: 0,
            offsetX: 0,
            offsetY: 0
        };
    }
    
    /**
     * Initialize core game state variables.
     * 
     * Resets all game progression variables including wave number, score,
     * enemy counters, and timing variables. Called at game start and restart.
     * 
     * @private
     */
    _initializeGameState() {
        this.wave = 0;
        this.score = 0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.waveStartTime = 0;
        this.waveComplete = false;
        this.powerUpOptions = [];
        this.waveCompletionTimer = 0;
        this._initializeEnemySpawning();
    }
    
    /**
     * Initialize the enemy spawning system.
     * 
     * Sets up variables for controlling incremental enemy spawning throughout
     * each wave, including spawn timing and wave scaling multipliers.
     * 
     * @private
     */
    _initializeEnemySpawning() {
        this.enemiesToSpawn = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = GameConfig.WAVE.BASE_SPAWN_INTERVAL;
        this.waveScaling = { health: 1, speed: 1, damage: 1 };
    }
    
    /**
     * Initialize the shop system for power-ups.
     * 
     * Creates the shop instance that handles power-up purchasing
     * between waves.
     * 
     * @private
     */
    _initializeShop() {
        this.shop = new Shop();
    }
    
    /**
     * Initialize the game world and create the player.
     * 
     * Creates the player entity at the center of the canvas.
     * This method is called after construction and on restart.
     */
    init() {
        // Create player at center of canvas
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.player = new Player(centerX, centerY);
    }
    
    /**
     * Start a new game session.
     * 
     * Resets all game state to initial values and begins the first wave.
     * This method transitions the game from menu state to playing state.
     */
    start() {
        this.gameState = 'playing';
        this.wave = 1;
        this.score = 0;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // Reset player
        this.player.reset();
        
        // Start first wave
        this.startWave();
    }
    
    /**
     * Restart the current game session.
     * 
     * Performs a full reset and starts a new game. This is typically
     * called after a game over or when the player chooses to restart.
     */
    restart() {
        this.init();
        this.start();
    }
    
    /**
     * Pause the game and preserve current state.
     * 
     * Transitions to paused state, stopping all game updates while
     * maintaining current progress.
     */
    pause() {
        this.gameState = 'paused';
    }
    
    /**
     * Resume the game from paused state.
     * 
     * Returns the game to playing state, continuing from where it was paused.
     */
    resume() {
        this.gameState = 'playing';
    }
    
    /**
     * Update canvas-dependent positions when canvas size changes.
     * 
     * Adjusts player position to maintain center positioning and repositions
     * enemies to maintain relative positions. Cleans up off-screen entities
     * that are no longer relevant due to the size change.
     */
    updateCanvasSize() {
        // Update player position to maintain center position
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        if (this.player) {
            this.player.x = centerX;
            this.player.y = centerY;
        }
        
        // Update enemy positions to maintain relative positions from center
        this.enemies.forEach(enemy => {
            const dx = enemy.x - centerX;
            const dy = enemy.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // If enemy is off-screen due to resize, move it to visible area
            const maxDistance = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
            if (distance > maxDistance) {
                const angle = Math.atan2(dy, dx);
                enemy.x = centerX + Math.cos(angle) * maxDistance;
                enemy.y = centerY + Math.sin(angle) * maxDistance;
            }
        });
        
        // Remove projectiles and particles that are now off-screen
        this.projectiles = this.projectiles.filter(proj => {
            return proj.x >= 0 && proj.x <= this.canvas.width && 
                   proj.y >= 0 && proj.y <= this.canvas.height;
        });
    }
    
    /**
     * Initialize a new wave of enemies.
     * 
     * Calculates wave parameters based on current wave number including
     * enemy count, scaling factors, and spawn timing. Sets up incremental
     * spawning to avoid performance spikes.
     */
    startWave() {
        this.waveComplete = false;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.waveCompletionTimer = 0;
        this.waveStartTime = Date.now();
        
        // Use configuration for wave scaling
        const enemyCount = GameConfig.DERIVED.getEnemyCountForWave(this.wave);
        this.waveScaling = GameConfig.DERIVED.getScalingForWave(this.wave);
        this.enemySpawnInterval = GameConfig.DERIVED.getSpawnIntervalForWave(this.wave);
        
        // Set up incremental spawning
        this.enemiesToSpawn = enemyCount;
        this.enemySpawnTimer = 0;
        
        // Spawn first enemy immediately
        if (this.enemiesToSpawn > 0) {
            this.spawnEnemy();
            this.enemiesToSpawn--;
            this.enemiesSpawned++;
        }
    }
    
    /**
     * Spawn a single enemy at the screen perimeter.
     * 
     * Creates a new enemy at a random position around the screen edge,
     * outside the visible area. Enemy properties are scaled based on
     * current wave progression.
     */
    spawnEnemy() {
        // Spawn enemy at random position around screen perimeter
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const spawnRadius = Math.max(this.canvas.width, this.canvas.height) / 2 + GameConfig.ENEMY.SPAWN_MARGIN;
        
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * spawnRadius;
        const y = centerY + Math.sin(angle) * spawnRadius;
        
        const enemy = new Enemy(
            x, y,
            GameConfig.ENEMY.BASE_SPEED * this.waveScaling.speed,
            GameConfig.ENEMY.BASE_HEALTH * this.waveScaling.health,
            GameConfig.ENEMY.BASE_DAMAGE * this.waveScaling.damage
        );
        
        this.enemies.push(enemy);
    }
    
    /**
     * Main game update loop - processes all game logic for one frame.
     * 
     * This method handles all game state updates including:
     * - Performance monitoring
     * - Screen shake effects  
     * - Incremental enemy spawning
     * - Entity updates (player, enemies, projectiles, particles)
     * - Collision detection
     * - Wave progression
     * - Game over conditions
     * 
     * @param {number} delta - Time elapsed since last frame in milliseconds
     * @param {Object} input - Current input state from InputHandler
     * @param {boolean} input.mouseDown - Whether mouse is pressed
     * @param {number} input.mouseX - Current mouse X position
     * @param {number} input.mouseY - Current mouse Y position
     */
    update(delta, input) {
        if (this.gameState !== 'playing') return;
        
        // Update performance metrics for adaptive quality
        this.performanceManager.update(delta);
        
        // Update screen shake visual effects
        this.updateScreenShake(delta);
        
        // Handle incremental enemy spawning to prevent frame rate spikes
        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                this.enemiesSpawned++;
                this.enemySpawnTimer = 0;
                
                // Add slight randomness to spawn timing (±200ms) to feel more organic
                this.enemySpawnTimer = -200 + Math.random() * 400;
            }
        }
        
        // Update player with current input state
        this.player.update(delta, input, this);
        
        // Update all enemies and handle death/rewards
        this.enemies.forEach((enemy, index) => {
            enemy.update(delta, this.player);
            
            // Process enemy death and rewards
            if (enemy.health <= 0) {
                // Create visual explosion effect
                this.createExplosion(enemy.x, enemy.y, 10);
                
                // Apply life steal if player has this upgrade
                if (this.player.hasLifeSteal) {
                    this.player.onEnemyKill(enemy);
                }
                
                // Calculate and award coin reward (reduced by half for better balance)
                const coinReward = Math.ceil((1 + (this.wave * 0.2)) / 2); // Reduced by half
                this.player.addCoins(coinReward);
                
                // Remove enemy from active list
                this.enemies.splice(index, 1);
                this.enemiesKilled++;
                this.score += 10;
                
                // Play audio feedback
                if (window.playSFX) window.playSFX('explode');
            }
        });
        
        // Update projectiles
        this.projectiles.forEach((projectile, index) => {
            projectile.update(delta);
            
            // Remove off-screen projectiles
            if (projectile.isOffScreen(this.canvas)) {
                this.projectiles.splice(index, 1);
            }
        });
        
        // Update particles with performance consideration
        this.updateParticles(delta);
        
        // Check collisions
        this.checkCollisions();
        
        // Check wave completion (all enemies spawned and defeated)
        this._handleWaveCompletion(delta);
        
        // Check game over
        if (this.player.hp <= 0) {
            this.gameState = 'gameover';
        }
    }
    
    /**
     * Update particle systems with performance optimizations.
     * 
     * Manages particle lifecycle and enforces performance limits by
     * reducing particle counts when frame rate drops. Uses object
     * pooling to minimize garbage collection.
     * 
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    updateParticles(delta) {
        // Use performance-aware particle updates
        const particleLimit = this.performanceManager.reduceParticleCount ? 
            GameConfig.VFX.PARTICLE_LIMITS.MAX_PARTICLES / 2 : 
            GameConfig.VFX.PARTICLE_LIMITS.MAX_PARTICLES;
            
        // Remove excess particles if over limit
        while (this.particles.length > particleLimit) {
            const particle = this.particles.shift();
            // Only release to pool if it came from the pool (has _fromPool flag)
            if (particle._fromPool) {
                this.particlePool.release(particle);
            }
        }
        
        // Update remaining particles
        this.particles.forEach((particle, index) => {
            particle.update(delta);
            
            if (particle.isDead()) {
                this.particles.splice(index, 1);
                // Only release to pool if it came from the pool (has _fromPool flag)
                if (particle._fromPool) {
                    this.particlePool.release(particle);
                }
            }
        });
    }
    
    /**
     * Detect and resolve collisions between all game entities.
     * 
     * Handles three types of collisions:
     * 1. Projectiles vs Enemies - Damage enemies, handle piercing/explosive shots
     * 2. Enemies vs Player - Damage player, apply screen shake and visual effects
     * 
     * Uses optimized circle collision detection from MathUtils.
     */
    checkCollisions() {
        // Use MathUtils for collision detection
        // Projectiles vs Enemies
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (MathUtils.circleCollision(projectile, enemy)) {
                    // Damage enemy
                    enemy.takeDamage(projectile.damage);
                    
                    // Create hit effect
                    this.createHitEffect(enemy.x, enemy.y);
                    
                    // Show damage text
                    if (window.createFloatingText) {
                        const rect = this.canvas.getBoundingClientRect();
                        window.createFloatingText(
                            `-${projectile.damage}`,
                            enemy.x * (rect.width / this.canvas.width) + rect.left,
                            enemy.y * (rect.height / this.canvas.height) + rect.top,
                            'damage'
                        );
                    }
                    
                    // Handle explosive projectiles
                    if (projectile.explosive) {
                        projectile.explode(this);
                    }
                    
                    // Debug piercing shots
                    if (projectile.piercing) {
                        console.log(`Piercing shot hit! Remaining pierces: ${projectile.piercingCount - 1}`);
                    }
                    
                    // Remove projectile unless it has piercing
                    if (!projectile.piercing) {
                        this.projectiles.splice(pIndex, 1);
                    } else {
                        projectile.piercingCount--;
                        if (projectile.piercingCount <= 0) {
                            console.log('Piercing shot exhausted, removing projectile');
                            this.projectiles.splice(pIndex, 1);
                        }
                    }
                }
            });
        });
        
        // Enemies vs Player
        this.enemies.forEach((enemy, index) => {
            if (MathUtils.circleCollision(enemy, this.player)) {
                // Damage player
                this.player.takeDamage(enemy.damage);
                
                // Use configuration for screen shake
                this.addScreenShake(
                    GameConfig.VFX.SCREEN_SHAKE.PLAYER_HIT_INTENSITY,
                    GameConfig.VFX.SCREEN_SHAKE.PLAYER_HIT_DURATION
                );
                
                // Flash effect
                if (window.screenFlash) window.screenFlash();
                
                // Show damage text
                if (window.createFloatingText) {
                    const rect = this.canvas.getBoundingClientRect();
                    window.createFloatingText(
                        `-${enemy.damage}`,
                        this.player.x * (rect.width / this.canvas.width) + rect.left,
                        this.player.y * (rect.height / this.canvas.height) + rect.top,
                        'player-damage'
                    );
                }
                
                // Remove enemy
                this.enemies.splice(index, 1);
                
                // Play hurt sound
                if (window.playSFX) window.playSFX('hurt');
            }
        });
    }
    
    /**
     * Handle wave completion logic and transition to shop.
     * 
     * Called when all enemies in the current wave have been defeated.
     * Calculates rewards, transitions to power-up selection state,
     * and displays the shop interface.
     */
    completeWave() {
        this.waveComplete = true;
        this.gameState = 'powerup';
        
        // Calculate coin reward using configuration
        const totalCoins = this._calculateWaveReward();
        
        // Give coins to player
        this.player.addCoins(totalCoins);
        
        // Show shop
        this.showShop();
    }
    
    /**
     * Display the shop interface for power-up purchases.
     * 
     * Shows available power-ups based on player's current state and
     * coin balance. Provides callbacks for purchase and continuation.
     */
    showShop() {
        this.shop.showShop(
            this.player, 
            this.player.coins, 
            (powerUp, price) => this.purchasePowerUp(powerUp, price),
            () => this.continueToNextWave()
        );
    }
    
    /**
     * Process a power-up purchase from the shop.
     * 
     * Validates the purchase, deducts coins, applies the power-up effect,
     * and provides audio feedback. The shop handles UI refresh automatically.
     * 
     * @param {PowerUp} powerUp - The power-up being purchased
     * @param {number} price - The cost in coins
     */
    purchasePowerUp(powerUp, price) {
        if (this.player.spendCoins(price)) {
            // Apply power-up to player
            powerUp.apply(this.player);
            
            // Play power-up sound
            if (window.playSFX) window.playSFX('powerup');
            
            // The shop refresh is handled in the Shop class
        }
    }
    
    /**
     * Continue to the next wave after shopping phase.
     * 
     * Closes the shop interface, increments wave counter, and starts
     * the next wave after a brief delay for transition.
     */
    continueToNextWave() {
        // Hide shop
        this.shop.closeShop();
        
        // Continue to next wave
        this.wave++;
        this.gameState = 'playing';
        
        // Small delay before starting next wave
        setTimeout(() => {
            this.startWave();
        }, Game.TIMING.NEXT_WAVE_DELAY);
    }
    
    /**
     * Add screen shake effect for visual impact feedback.
     * 
     * Screen shake provides immediate visual feedback for significant
     * events like player damage or large explosions.
     * 
     * @param {number} intensity - Shake intensity in pixels
     * @param {number} duration - Shake duration in milliseconds
     */
    addScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    /**
     * Update screen shake offset values each frame.
     * 
     * Calculates random offsets based on current intensity and
     * decreases intensity over time until shake expires.
     * 
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    updateScreenShake(delta) {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration -= delta;
            
            const intensity = this.screenShake.intensity * (this.screenShake.duration / 300);
            this.screenShake.offsetX = (Math.random() - 0.5) * intensity;
            this.screenShake.offsetY = (Math.random() - 0.5) * intensity;
        } else {
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
        }
    }
    
    /**
     * Create explosion particle effect at specified location.
     * 
     * Generates a burst of particles radiating outward from the explosion
     * point. Particle count is reduced automatically when performance is poor.
     * 
     * @param {number} x - Explosion center X coordinate
     * @param {number} y - Explosion center Y coordinate  
     * @param {number} [particleCount=8] - Number of particles to create
     */
    createExplosion(x, y, particleCount = 8) {
        // Use object pool for particles
        const actualCount = this.performanceManager.reduceParticleCount ? 
            Math.floor(particleCount / 2) : particleCount;
            
        for (let i = 0; i < actualCount; i++) {
            const angle = (Math.PI * 2 / actualCount) * i + Math.random() * 0.5;
            const speed = MathUtils.random(50, 150);
            const life = MathUtils.random(500, 1000);
            
            const particle = this.particlePool.get(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                '#0ff'
            );
            
            this.particles.push(particle);
        }
    }
    
    /**
     * Create small hit effect particles when enemies take damage.
     * 
     * Provides visual feedback for successful hits with small,
     * short-lived particles that indicate impact location.
     * 
     * @param {number} x - Hit location X coordinate
     * @param {number} y - Hit location Y coordinate
     */
    createHitEffect(x, y) {
        // Use object pool for hit particles instead of creating new ones
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 30;
            const life = 200 + Math.random() * 200;
            
            const particle = this.particlePool.get(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                '#ff0'
            );
            
            this.particles.push(particle);
        }
    }
    
    /**
     * Render all game elements to the canvas.
     * 
     * Handles the complete rendering pipeline including:
     * - Canvas clearing
     * - Screen shake transformation
     * - Background grid
     * - All game entities (particles, enemies, projectiles, player)
     * - UI elements like spawn warnings
     */
    render() {
        const ctx = this.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply screen shake
        ctx.save();
        ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        
        // Draw background grid (optional neon grid effect)
        this.drawBackground();
        
        // Draw entities
        this.particles.forEach(particle => particle.draw(ctx));
        this.enemies.forEach(enemy => enemy.draw(ctx));
        this.projectiles.forEach(projectile => projectile.draw(ctx));
        this.player.draw(ctx);
        
        // Draw spawn warning if enemies are incoming
        if (this.enemiesToSpawn > 0) {
            this.drawSpawnWarning(ctx);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw the background neon grid effect.
     * 
     * Renders a glowing grid pattern that provides visual depth
     * and enhances the neon aesthetic. Skipped when performance
     * optimization is needed.
     */
    drawBackground() {
        // Skip background grid if performance is poor
        if (this.performanceManager.needsOptimization()) return;
        
        const ctx = this.ctx;
        const gridSize = GameConfig.VFX.GRID_SIZE;
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${GameConfig.VFX.GRID_ALPHA})`;
        ctx.lineWidth = 1;
        
        // Draw vertical lines
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }
        
        // Draw horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    }
    
    /**
     * Draw visual warning when enemies are about to spawn.
     * 
     * Displays a pulsing border around the screen and shows the
     * number of incoming enemies to give players advance warning.
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    drawSpawnWarning(ctx) {
        // Draw pulsing border to indicate incoming enemies
        const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() / 200);
        const warningColor = `rgba(255, 165, 0, ${pulseIntensity * 0.3})`;
        
        ctx.strokeStyle = warningColor;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        
        const margin = 20;
        ctx.strokeRect(margin, margin, 
                      this.canvas.width - margin * 2, 
                      this.canvas.height - margin * 2);
        
        ctx.setLineDash([]); // Reset line dash
        
        // Draw enemy count text
        ctx.fillStyle = '#ff0';
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff0';
        ctx.shadowBlur = 10;
        
        const text = `Incoming: ${this.enemiesToSpawn}`;
        ctx.fillText(text, this.canvas.width / 2, 40);
        
        // Reset text properties
        ctx.textAlign = 'left';
        ctx.shadowBlur = 0;
    }

    /**
     * Handle wave completion timing and transitions.
     * 
     * Manages the delay between wave completion and shop display,
     * checking if all enemies have been spawned and defeated.
     * 
     * @private
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    _handleWaveCompletion(delta) {
        // Check if wave is complete (all enemies spawned and defeated)
        if (this.enemiesToSpawn === 0 && this.enemies.length === 0 && !this.waveComplete) {
            this.waveCompletionTimer += delta;
            
            // Add delay before showing shop to allow final effects to finish
            if (this.waveCompletionTimer >= Game.TIMING.WAVE_COMPLETION_DELAY) {
                this.completeWave();
            }
        }
    }

    /**
     * Calculate coin rewards for completing a wave.
     * 
     * Determines the total coin reward based on wave number,
     * completion time, and other performance factors.
     * 
     * @private
     * @returns {number} Total coins awarded for wave completion
     */
    _calculateWaveReward() {
        const baseReward = GameConfig.WAVE.BASE_COIN_REWARD || 5;
        const waveBonus = Math.floor(this.wave * 1.5);
        
        // Time bonus for quick completion (first 30 seconds)
        const completionTime = Date.now() - this.waveStartTime;
        const timeBonus = completionTime < 30000 ? 3 : 0;
        
        return baseReward + waveBonus + timeBonus;
    }
}
