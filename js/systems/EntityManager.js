import { MathUtils } from '../utils/MathUtils.js';

/**
 * Manages all game entities including players, enemies, and projectiles.
 * Handles entity updates, lifecycle management, and cleanup.
 */
export class EntityManager {
    /**
     * Creates a new entity manager instance.
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Update all entities in the game.
     * @param {number} delta - Time elapsed since last frame
     * @param {Object} input - Current input state
     */
    updateAll(delta, input) {
        this._updatePlayer(delta, input);
        this._updateEnemies(delta);
        this._updateProjectiles(delta);
    }

    /**
     * Handle enemy death and rewards.
     * @param {Enemy} enemy - The enemy that died
     * @param {number} index - Index of enemy in array
     */
    onEnemyDeath(enemy, index) {
        // Create visual explosion effect
        this.game.effectsManager.createExplosion(enemy.x, enemy.y, 10);
        
        // Apply life steal if player has this upgrade
        if (this.game.player.hasLifeSteal) {
            this.game.player.onEnemyKill(enemy);
        }
        
        // Calculate and award coin reward
        const coinReward = this._calculateCoinReward();
        this.game.player.addCoins(coinReward);
        
        // Remove enemy and update counters
        this.game.enemies.splice(index, 1);
        this.game.waveManager.onEnemyKilled();
        this.game.score += 10;
        
        // Audio feedback
        if (window.playSFX) window.playSFX('explode');
    }

    /**
     * Clean up off-screen projectiles.
     */
    cleanupProjectiles() {
        this.game.projectiles = this.game.projectiles.filter(projectile => {
            if (projectile.isOffScreen(this.game.canvas)) {
                return false;
            }
            return true;
        });
    }

    /**
     * Update player entity.
     * @private
     * @param {number} delta - Time elapsed since last frame
     * @param {Object} input - Current input state
     */
    _updatePlayer(delta, input) {
        this.game.player.update(delta, input, this.game);
    }

    /**
     * Update all enemy entities.
     * @private
     * @param {number} delta - Time elapsed since last frame
     */
    _updateEnemies(delta) {
        this.game.enemies.forEach((enemy, index) => {
            enemy.update(delta, this.game.player);
            
            if (enemy.health <= 0) {
                this.onEnemyDeath(enemy, index);
            }
        });
    }

    /**
     * Update all projectile entities.
     * @private
     * @param {number} delta - Time elapsed since last frame
     */
    _updateProjectiles(delta) {
        this.game.projectiles.forEach((projectile, index) => {
            projectile.update(delta);
            
            if (projectile.isOffScreen(this.game.canvas)) {
                this.game.projectiles.splice(index, 1);
            }
        });
    }

    /**
     * Calculate coin reward for enemy kills.
     * @private
     * @returns {number} Coin reward amount
     */
    _calculateCoinReward() {
        const baseReward = 1;
        const waveBonus = this.game.wave * 0.2;
        const baseAmount = Math.ceil((baseReward + waveBonus) / 2); // Reduced by half for balance
        
        // Apply coin magnet multiplier
        return Math.ceil(baseAmount * this.game.player.coinMagnetMultiplier);
    }
}
