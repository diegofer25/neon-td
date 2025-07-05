import { Enemy } from '../Enemy.js';
import { Boss } from '../Boss.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * Manages wave progression, enemy spawning, boss encounters, and wave completion logic.
 */
export class WaveManager {
    /**
     * Creates a new wave manager instance.
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
        this.reset();
    }

    /**
     * Reset wave manager to initial state.
     */
    reset() {
        this.currentWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.enemiesToSpawn = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = GameConfig.WAVE.BASE_SPAWN_INTERVAL;
        this.waveScaling = { health: 1, speed: 1, damage: 1 };
        this.waveStartTime = 0;
        this.waveComplete = false;
        this.waveCompletionTimer = 0;
    }

    /**
     * Start a new wave with calculated parameters.
     * @param {number} waveNumber - Wave number to start
     */
    startWave(waveNumber) {
        this.currentWave = waveNumber;
        this.waveComplete = false;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.waveCompletionTimer = 0;
        this.waveStartTime = Date.now();
        
        // Check if this is a boss wave (every 5 waves)
        const isBossWave = this.currentWave % 5 === 0;
        
        if (isBossWave) {
            // Boss wave - spawn boss and fewer enemies
            this.spawnBoss();
            const enemyCount = Math.floor(GameConfig.DERIVED.getEnemyCountForWave(this.currentWave) * 0.5);
            this.enemiesToSpawn = enemyCount;
            this.enemySpawnInterval = GameConfig.DERIVED.getSpawnIntervalForWave(this.currentWave) * 1.5;
        } else {
            // Regular wave
            const enemyCount = GameConfig.DERIVED.getEnemyCountForWave(this.currentWave);
            this.enemiesToSpawn = enemyCount;
            this.enemySpawnInterval = GameConfig.DERIVED.getSpawnIntervalForWave(this.currentWave);
        }
        
        // Calculate wave scaling
        this.waveScaling = GameConfig.DERIVED.getScalingForWave(this.currentWave);
        this.enemySpawnTimer = 0;
        
        // Spawn first enemy immediately if any to spawn
        if (this.enemiesToSpawn > 0) {
            this.spawnEnemy();
            this.enemiesToSpawn--;
            this.enemiesSpawned++;
        }
    }

    /**
     * Spawn a boss for the current wave
     */
    spawnBoss() {
        // Spawn boss at a visible position closer to center
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        
        const boss = Boss.createBossForWave(
            this.currentWave, 
            this.game.canvas.width, 
            this.game.canvas.height
        );
        
        // Ensure boss starts at center and is immediately visible
        boss.x = centerX;
        boss.y = centerY;
        boss.targetX = centerX;
        boss.targetY = centerY;
        
        // Force boss to stay within visible bounds
        const margin = boss.radius + 20;
        boss.x = Math.max(margin, Math.min(this.game.canvas.width - margin, boss.x));
        boss.y = Math.max(margin, Math.min(this.game.canvas.height - margin, boss.y));
        
        this.game.enemies.push(boss);
        
        // Visual and audio feedback
        this.game.addScreenShake(15, 1000);
        if (window.playSFX) window.playSFX('boss_spawn');
        
        // Show boss warning message
        this.showBossWarning();
        
        // Debug log to verify boss spawn
        console.log(`Boss spawned at (${boss.x}, ${boss.y}) with health ${boss.health} and damage ${boss.damage}`);
        console.log(`Canvas size: ${this.game.canvas.width}x${this.game.canvas.height}`);
        console.log(`Boss radius: ${boss.radius}, Boss type: ${boss.type}`);
    }

    /**
     * Show boss warning message
     */
    showBossWarning() {
        // This could trigger a UI message system
        console.log(`BOSS WAVE ${this.currentWave}! ${this.getBossName()} has appeared!`);
    }

    /**
     * Get boss name for current wave
     */
    getBossName() {
        const bossWave = Math.floor((this.currentWave - 1) / 5) + 1;
        const bossTypes = Object.keys(GameConfig.BOSS.TYPES);
        const bossType = bossTypes[(bossWave - 1) % bossTypes.length];
        return GameConfig.BOSS.TYPES[bossType].name;
    }

    /**
     * Update wave state and handle enemy spawning.
     * @param {number} delta - Time elapsed since last frame
     */
    update(delta) {
        this._handleEnemySpawning(delta);
        this._checkWaveCompletion(delta);
    }

    /**
     * Spawn a single enemy at the screen perimeter.
     */
    spawnEnemy() {
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        const spawnRadius = Math.max(this.game.canvas.width, this.game.canvas.height) / 2 + GameConfig.ENEMY.SPAWN_MARGIN;
        
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * spawnRadius;
        const y = centerY + Math.sin(angle) * spawnRadius;
        
        // Determine enemy type based on wave progression and percentages
        const random = Math.random();
        let enemy;
        
        if (this.currentWave < 5) {
            // Waves 1-4: Only basic enemies
            enemy = Enemy.createBasicEnemy(x, y, 1);
        } else if (this.currentWave < 10) {
            // Waves 5-9: Basic (80%) and Fast (20%) enemies
            if (random < 0.6) {
                enemy = Enemy.createBasicEnemy(x, y, 1);
            } else {
                enemy = Enemy.createFastEnemy(x, y, 1);
            }
        } else {
            // Wave 10+: Basic (70%), Fast (20%), Tank (10%) enemies
            if (random < 0.7) {
                enemy = Enemy.createBasicEnemy(x, y, 1);
            } else if (random < 0.9) {
                enemy = Enemy.createFastEnemy(x, y, 1);
            } else {
                enemy = Enemy.createTankEnemy(x, y, 1);
            }
        }
        
        // Apply wave scaling to the created enemy
        enemy.health *= this.waveScaling.health;
        enemy.maxHealth *= this.waveScaling.health;
        enemy.speed *= this.waveScaling.speed;
        enemy.damage *= this.waveScaling.damage;
        
        this.game.enemies.push(enemy);
    }

    /**
     * Register an enemy kill for wave progress tracking.
     */
    onEnemyKilled() {
        this.enemiesKilled++;
    }

    /**
     * Check if current wave is complete.
     * @returns {boolean} True if wave is complete
     */
    isWaveComplete() {
        return this.enemiesToSpawn === 0 && 
               this.game.enemies.length === 0 && 
               this.game.bossProjectiles.length === 0;
    }

    /**
     * Calculate coin rewards for completing the current wave.
     * @returns {number} Total coins awarded
     */
    calculateWaveReward() {
        const baseReward = GameConfig.ECONOMY.WAVE_COMPLETION_BASE_COINS;
        const waveBonus = Math.floor(this.currentWave * GameConfig.ECONOMY.WAVE_COMPLETION_WAVE_BONUS);
        
        // Boss wave bonus
        const isBossWave = this.currentWave % 5 === 0;
        const bossBonus = isBossWave ? GameConfig.BOSS.COMPLETION_BONUS : 0;
        
        // Time bonus for quick completion (first 30 seconds)
        const completionTime = Date.now() - this.waveStartTime;
        const timeBonus = completionTime < 30000 ? 3 : 0;
        
        return baseReward + waveBonus + bossBonus + timeBonus;
    }

    /**
     * Handle incremental enemy spawning.
     * @private
     * @param {number} delta - Time elapsed since last frame
     */
    _handleEnemySpawning(delta) {
        if (this.enemiesToSpawn > 0) {
            this.enemySpawnTimer += delta;
            if (this.enemySpawnTimer >= this.enemySpawnInterval) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                this.enemiesSpawned++;
                this.enemySpawnTimer = -200 + Math.random() * 400; // Add randomness
            }
        }
    }

    /**
     * Check wave completion and handle timing.
     * @private
     * @param {number} delta - Time elapsed since last frame
     */
    _checkWaveCompletion(delta) {
        if (this.isWaveComplete() && !this.waveComplete) {
            this.waveCompletionTimer += delta;
            
            if (this.waveCompletionTimer >= 1000) { // 1 second delay
                this.waveComplete = true;
                this.game.completeWave();
            }
        }
    }
}
