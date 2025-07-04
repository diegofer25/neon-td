import { MathUtils } from '../utils/MathUtils.js';
import { GameConfig } from '../config/GameConfig.js';

/**
 * Handles all collision detection and resolution in the game.
 * Provides optimized collision algorithms and manages collision responses.
 */
export class CollisionSystem {
    /**
     * Creates a new collision system instance.
     * @param {Game} game - Reference to the main game instance
     */
    constructor(game) {
        this.game = game;
    }

    /**
     * Check all collision types and handle responses.
     * @param {number} delta - Time elapsed since last frame
     */
    checkAllCollisions(delta) {
        this._checkProjectileEnemyCollisions();
        this._checkPlayerEnemyCollisions();
    }

    /**
     * Handle projectile vs enemy collisions with piercing and explosive logic.
     * @private
     */
    _checkProjectileEnemyCollisions() {
        this.game.projectiles.forEach((projectile, pIndex) => {
            this.game.enemies.forEach((enemy, eIndex) => {
                if (MathUtils.circleCollision(projectile, enemy)) {
                    this._handleProjectileHit(projectile, enemy, pIndex);
                }
            });
        });
    }

    /**
     * Handle player vs enemy collisions.
     * @private
     */
    _checkPlayerEnemyCollisions() {
        this.game.enemies.forEach((enemy, index) => {
            if (MathUtils.circleCollision(enemy, this.game.player)) {
                this._handlePlayerHit(enemy, index);
            }
        });
    }

    /**
     * Process projectile hitting an enemy.
     * @private
     * @param {Projectile} projectile - The projectile that hit
     * @param {Enemy} enemy - The enemy that was hit
     * @param {number} projectileIndex - Index of projectile in array
     */
    _handleProjectileHit(projectile, enemy, projectileIndex) {
        const currentDamage = projectile.getCurrentDamage ? projectile.getCurrentDamage() : projectile.damage;
        
        // Damage enemy
        enemy.takeDamage(currentDamage);
        
        // Create visual effects
        this.game.effectsManager.createHitEffect(enemy.x, enemy.y);
        this._showDamageText(enemy, currentDamage);
        
        // Handle explosive projectiles
        if (projectile.explosive) {
            projectile.explode(this.game);
        }
        
        // Handle piercing projectiles
        if (projectile.piercing) {
            this._handlePiercingHit(projectile, projectileIndex);
        } else {
            // Remove non-piercing projectiles immediately
            this.game.projectiles.splice(projectileIndex, 1);
        }
    }

    /**
     * Process piercing projectile behavior.
     * @private
     * @param {Projectile} projectile - The piercing projectile
     * @param {number} projectileIndex - Index of projectile in array
     */
    _handlePiercingHit(projectile, projectileIndex) {
        if (projectile.onEnemyHit) {
            projectile.onEnemyHit();
        }
        
        console.log(`Piercing shot hit! Remaining pierces: ${projectile.piercingCount}`);
        
        if (projectile.piercingCount <= 0) {
            console.log('Piercing shot exhausted, removing projectile');
            this.game.projectiles.splice(projectileIndex, 1);
        }
    }

    /**
     * Process player being hit by an enemy.
     * @private
     * @param {Enemy} enemy - The enemy that hit the player
     * @param {number} enemyIndex - Index of enemy in array
     */
    _handlePlayerHit(enemy, enemyIndex) {
        // Damage player
        this.game.player.takeDamage(enemy.damage);
        
        // Visual and audio feedback
        this.game.effectsManager.addScreenShake(
            GameConfig.VFX.SCREEN_SHAKE.PLAYER_HIT_INTENSITY,
            GameConfig.VFX.SCREEN_SHAKE.PLAYER_HIT_DURATION
        );
        
        if (window.screenFlash) window.screenFlash();
        if (window.playSFX) window.playSFX('hurt');
        
        // Show damage text
        this._showPlayerDamageText(enemy.damage);
        
        // Remove enemy after collision
        this.game.enemies.splice(enemyIndex, 1);
    }

    /**
     * Display floating damage text for enemy hits.
     * @private
     * @param {Enemy} enemy - The enemy that took damage
     * @param {number} damage - Amount of damage dealt
     */
    _showDamageText(enemy, damage) {
        if (window.createFloatingText) {
            const rect = this.game.canvas.getBoundingClientRect();
            window.createFloatingText(
                `-${damage}`,
                enemy.x * (rect.width / this.game.canvas.width) + rect.left,
                enemy.y * (rect.height / this.game.canvas.height) + rect.top,
                'damage'
            );
        }
    }

    /**
     * Display floating damage text for player hits.
     * @private
     * @param {number} damage - Amount of damage taken
     */
    _showPlayerDamageText(damage) {
        if (window.createFloatingText) {
            const rect = this.game.canvas.getBoundingClientRect();
            window.createFloatingText(
                `-${damage}`,
                this.game.player.x * (rect.width / this.game.canvas.width) + rect.left,
                this.game.player.y * (rect.height / this.game.canvas.height) + rect.top,
                'player-damage'
            );
        }
    }
}
