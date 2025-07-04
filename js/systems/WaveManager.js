import { Enemy } from '../Enemy.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * Manages wave progression, enemy spawning, and wave completion logic.
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
        
        // Calculate wave parameters using configuration
        const enemyCount = GameConfig.DERIVED.getEnemyCountForWave(this.currentWave);
        this.waveScaling = GameConfig.DERIVED.getScalingForWave(this.currentWave);
        this.enemySpawnInterval = GameConfig.DERIVED.getSpawnIntervalForWave(this.currentWave);
        
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
        
        const enemy = new Enemy(
            x, y,
            GameConfig.ENEMY.BASE_SPEED * this.waveScaling.speed,
            GameConfig.ENEMY.BASE_HEALTH * this.waveScaling.health,
            GameConfig.ENEMY.BASE_DAMAGE * this.waveScaling.damage
        );
        
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
        return this.enemiesToSpawn === 0 && this.game.enemies.length === 0;
    }

    /**
     * Calculate coin rewards for completing the current wave.
     * @returns {number} Total coins awarded
     */
    calculateWaveReward() {
        const baseReward = GameConfig.ECONOMY.WAVE_COMPLETION_BASE_COINS;
        const waveBonus = Math.floor(this.currentWave * GameConfig.ECONOMY.WAVE_COMPLETION_WAVE_BONUS);
        
        // Time bonus for quick completion (first 30 seconds)
        const completionTime = Date.now() - this.waveStartTime;
        const timeBonus = completionTime < 30000 ? 3 : 0;
        
        return baseReward + waveBonus + timeBonus;
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
