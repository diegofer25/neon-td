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
 * Main game class
 * Manages game state, entities, and game loop
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
     * Creates a new game instance
     * @param {HTMLCanvasElement} canvas - Game canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas context
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
     * Initialize game entities
     * @private
     */
    _initializeEntities() {
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
    }
    
    /**
     * Initialize managers and pools
     * @private
     */
    _initializeManagers() {
        this.performanceManager = new PerformanceManager();
        this._initializeObjectPools();
        this._initializeScreenShake();
    }
    
    /**
     * Initialize object pools for performance
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
     * Reset particle for object pool reuse
     * @private
     * @param {Particle} particle - Particle to reset
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} vx - X velocity
     * @param {number} vy - Y velocity
     * @param {number} life - Particle lifetime
     * @param {string} color - Particle color
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
    }
    
    /**
     * Initialize screen shake system
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
     * Initialize game state variables
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
     * Initialize enemy spawning system
     * @private
     */
    _initializeEnemySpawning() {
        this.enemiesToSpawn = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = GameConfig.WAVE.BASE_SPAWN_INTERVAL;
        this.waveScaling = { health: 1, speed: 1, damage: 1 };
    }
    
    /**
     * Initialize shop system
     * @private
     */
    _initializeShop() {
        this.shop = new Shop();
    }
    
    init() {
        // Create player at center of canvas
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.player = new Player(centerX, centerY);
    }
    
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
    
    restart() {
        this.init();
        this.start();
    }
    
    pause() {
        this.gameState = 'paused';
    }
    
    resume() {
        this.gameState = 'playing';
    }
    
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
    
    update(delta, input) {
        if (this.gameState !== 'playing') return;
        
        // Update performance metrics
        this.performanceManager.update(delta);
        
        // Update screen shake
        this.updateScreenShake(delta);
        
        // Handle incremental enemy spawning
        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                this.enemiesSpawned++;
                this.enemySpawnTimer = 0;
                
                // Add slight randomness to spawn timing (±200ms)
                this.enemySpawnTimer = -200 + Math.random() * 400;
            }
        }
        
        // Update player
        this.player.update(delta, input, this);
        
        // Update enemies
        this.enemies.forEach((enemy, index) => {
            enemy.update(delta, this.player);
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.createExplosion(enemy.x, enemy.y, 10);
                
                // Life steal effect
                if (this.player.hasLifeSteal) {
                    this.player.onEnemyKill(enemy);
                }
                
                // Give coins for killing enemy
                const coinReward = Math.ceil(1 + (this.wave * 0.2)); // More coins in later waves
                this.player.addCoins(coinReward);
                
                this.enemies.splice(index, 1);
                this.enemiesKilled++;
                this.score += 10;
                
                // Play explosion sound
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
    
    updateParticles(delta) {
        // Use performance-aware particle updates
        const particleLimit = this.performanceManager.reduceParticleCount ? 
            GameConfig.VFX.PARTICLE_LIMITS.MAX_PARTICLES / 2 : 
            GameConfig.VFX.PARTICLE_LIMITS.MAX_PARTICLES;
            
        // Remove excess particles if over limit
        while (this.particles.length > particleLimit) {
            const particle = this.particles.shift();
            this.particlePool.release(particle);
        }
        
        // Update remaining particles
        this.particles.forEach((particle, index) => {
            particle.update(delta);
            
            if (particle.isDead()) {
                this.particles.splice(index, 1);
                this.particlePool.release(particle);
            }
        });
    }
    
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
    
    showShop() {
        this.shop.showShop(
            this.player, 
            this.player.coins, 
            (powerUp, price) => this.purchasePowerUp(powerUp, price),
            () => this.continueToNextWave()
        );
    }
    
    purchasePowerUp(powerUp, price) {
        if (this.player.spendCoins(price)) {
            // Apply power-up to player
            powerUp.apply(this.player);
            
            // Play power-up sound
            if (window.playSFX) window.playSFX('powerup');
            
            // The shop refresh is handled in the Shop class
        }
    }
    
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
    
    addScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
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
    
    createHitEffect(x, y) {
        // Create small hit particles
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 30;
            const life = 200 + Math.random() * 200;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                '#ff0'
            );
            
            this.particles.push(particle);
        }
    }
    
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
}
