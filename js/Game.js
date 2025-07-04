import { Player } from './Player.js';
import { Enemy } from './Enemy.js';
import { Particle } from './Particle.js';
import { PowerUp } from './PowerUp.js';
import { Shop } from './Shop.js';

export class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.gameState = 'menu'; // menu, playing, paused, powerup, gameover
        
        // Game entities
        this.player = null;
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        
        // Game state
        this.wave = 0;
        this.score = 0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        
        // Wave management
        this.waveStartTime = 0;
        this.waveComplete = false;
        this.powerUpOptions = [];
        this.waveCompletionTimer = 0;
        this.waveCompletionDelay = 1000; // 1 second delay
        
        // Enemy spawning
        this.enemiesToSpawn = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 800; // milliseconds between enemy spawns
        this.waveHealthScale = 1;
        this.waveSpeedScale = 1;
        this.waveDamageScale = 1;
        
        // Screen shake
        this.screenShake = {
            intensity: 0,
            duration: 0,
            offsetX: 0,
            offsetY: 0
        };
        
        // Shop system
        this.shop = new Shop();
        
        this.init();
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
        this.waveCompletionTimer = 0; // Reset wave completion timer
        this.waveStartTime = Date.now();
        
        // Calculate enemy count and stats for this wave
        const enemyCount = Math.floor(4 + this.wave * 2);
        this.waveHealthScale = Math.pow(1.15, this.wave - 1);
        this.waveSpeedScale = Math.pow(1.1, this.wave - 1);
        this.waveDamageScale = Math.pow(1.15, this.wave - 1);
        
        // Set up incremental spawning
        this.enemiesToSpawn = enemyCount;
        this.enemySpawnTimer = 0;
        
        // Adjust spawn interval based on wave (spawn faster in later waves)
        this.enemySpawnInterval = Math.max(300, 800 - (this.wave * 20));
        
        // Spawn first enemy immediately
        if (this.enemiesToSpawn > 0) {
            this.spawnEnemy(this.waveHealthScale, this.waveSpeedScale, this.waveDamageScale);
            this.enemiesToSpawn--;
            this.enemiesSpawned++;
        }
    }
    
    spawnEnemy(healthScale = 1, speedScale = 1, damageScale = 1) {
        // Spawn enemy at random position around screen perimeter
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const spawnRadius = Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
        
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * spawnRadius;
        const y = centerY + Math.sin(angle) * spawnRadius;
        
        // Base enemy stats
        const baseHealth = 50;
        const baseSpeed = 50;
        const baseDamage = 10;
        
        const enemy = new Enemy(
            x, y,
            baseSpeed * speedScale,
            baseHealth * healthScale,
            baseDamage * damageScale
        );
        
        this.enemies.push(enemy);
    }
    
    update(delta, input) {
        if (this.gameState !== 'playing') return;
        
        // Update screen shake
        this.updateScreenShake(delta);
        
        // Handle incremental enemy spawning
        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy(this.waveHealthScale, this.waveSpeedScale, this.waveDamageScale);
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
        
        // Update particles
        this.particles.forEach((particle, index) => {
            particle.update(delta);
            
            if (particle.isDead()) {
                this.particles.splice(index, 1);
            }
        });
        
        // Check collisions
        this.checkCollisions();
        
        // Check wave completion (all enemies spawned and defeated)
        if (this.enemies.length === 0 && this.enemiesToSpawn === 0 && !this.waveComplete) {
            this.waveCompletionTimer += delta;
            if (this.waveCompletionTimer >= this.waveCompletionDelay) {
                this.completeWave();
            }
        }
        
        // Check game over
        if (this.player.hp <= 0) {
            this.gameState = 'gameover';
        }
    }
    
    checkCollisions() {
        // Projectiles vs Enemies
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
                if (this.isColliding(projectile, enemy)) {
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
            if (this.isColliding(enemy, this.player)) {
                // Damage player
                this.player.takeDamage(enemy.damage);
                
                // Screen shake on player hit
                this.addScreenShake(10, 300);
                
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
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (obj1.radius + obj2.radius);
    }
    
    completeWave() {
        this.waveComplete = true;
        this.gameState = 'powerup';
        
        // Calculate coin reward based on wave number and performance
        const baseCoins = 10;
        const waveBonus = this.wave * 2;
        const performanceBonus = Math.floor(this.enemiesKilled / 5); // Bonus for killing enemies efficiently
        const totalCoins = baseCoins + waveBonus + performanceBonus;
        
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
            
            // Update shop display with new coin amount
            this.showShop();
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
        }, 1000);
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
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
            const speed = 50 + Math.random() * 100;
            const life = 500 + Math.random() * 500;
            
            const particle = new Particle(
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
        const ctx = this.ctx;
        const gridSize = 50;
        
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
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
