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
    checkAllCollisions() {
        this._checkProjectileEnemyCollisions();
        this._checkPlayerEnemyCollisions();
        this.checkBossProjectilePlayerCollisions();
        this.checkBossSpecialAttacks();
    }

    /**
     * Handle projectile vs enemy collisions with piercing and explosive logic.
     * @private
     */
    _checkProjectileEnemyCollisions() {
        this.game.projectiles.forEach((projectile, pIndex) => {
            this.game.enemies.forEach((enemy) => {
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
     * Check collisions between boss projectiles and player
     */
    checkBossProjectilePlayerCollisions() {
        this.game.bossProjectiles.forEach((projectile, projectileIndex) => {
            // Remove if expired
            if (projectile.life <= 0) {
                this.game.bossProjectiles.splice(projectileIndex, 1);
                return;
            }
            
            // Check collision with player
            const dx = projectile.x - this.game.player.x;
            const dy = projectile.y - this.game.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < projectile.radius + this.game.player.radius) {
                // Reduce boss projectile damage for early boss waves
                const actualDamage = this.game.waveManager.currentWave === 5 ? 
                    Math.min(projectile.damage, 12) : // Further reduced for first boss
                    this.game.waveManager.currentWave <= 15 ? 
                    Math.min(projectile.damage, 20) : // Progressive cap
                    projectile.damage;
                
                // Enhanced visual feedback for boss hits
                this.game.player.takeDamage(actualDamage);
                this.game.addScreenShake(12, 300); // Stronger screen shake
                this.game.createExplosion(projectile.x, projectile.y, 8); // More particles
                
                // Additional visual effect for boss projectile hits
                this.game.createExplosionRing(this.game.player.x, this.game.player.y, 30);
                
                // Remove projectile
                this.game.bossProjectiles.splice(projectileIndex, 1);
                
                if (window.playSFX) window.playSFX('boss_hit_player');
                if (window.screenFlash) window.screenFlash();
                
                console.log(`Boss projectile hit for ${actualDamage} damage (reduced from ${projectile.damage})`);
            }
        });
    }

    /**
     * Check boss special attack effects with enhanced feedback
     */
    checkBossSpecialAttacks() {
        this.game.enemies.forEach(enemy => {
            if (!enemy.isBoss) return;
            
            // Handle boss-specific collision effects
            switch (enemy.type) {
                case 'PULSE_TITAN':
                    this.checkPulseTitanAttack(enemy);
                    break;
                case 'STORM_BRINGER':
                    this.checkStormBringerLightning(enemy);
                    break;
                case 'VOID_HUNTER':
                    this.checkVoidHunterCharge(enemy);
                    break;
            }
        });
    }

    checkPulseTitanAttack(boss) {
        if (boss.isPulsing) {
            const dx = this.game.player.x - boss.x;
            const dy = this.game.player.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= boss.pulseRadius && boss.pulseRadius > 50) {
                // Progressive damage reduction for early waves
                let pulseDamage = boss.damage * 0.5;
                if (this.game.waveManager.currentWave === 5) {
                    pulseDamage = Math.min(pulseDamage, 15);
                } else if (this.game.waveManager.currentWave <= 15) {
                    pulseDamage = Math.min(pulseDamage, 25);
                }
                
                // Enhanced visual feedback
                this.game.player.takeDamage(pulseDamage);
                this.game.addScreenShake(15, 500);
                this.game.createExplosionRing(boss.x, boss.y, boss.pulseRadius);
                boss.isPulsing = false; // Prevent multiple hits
                
                if (window.playSFX) window.playSFX('boss_pulse_hit');
                
                console.log(`Pulse Titan pulse hit for ${pulseDamage} damage`);
            }
        }
    }

    checkStormBringerLightning(boss) {
        boss.lightningTargets.forEach(target => {
            const dx = this.game.player.x - target.x;
            const dy = this.game.player.y - target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= 20) {
                this.game.player.takeDamage(target.damage);
                this.game.addScreenShake(6, 200);
                target.life = 0; // Remove target
            }
        });
    }

    checkVoidHunterCharge(boss) {
        if (boss.isCharging) {
            const dx = this.game.player.x - boss.x;
            const dy = this.game.player.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= boss.radius + this.game.player.radius + 10) {
                // Reduce charge damage for early waves
                const chargeDamage = this.game.waveManager.currentWave === 5 ? 
                    Math.min(boss.damage, 25) : boss.damage * 1.5;
                
                this.game.player.takeDamage(chargeDamage);
                this.game.addScreenShake(15, 500);
                boss.isCharging = false;
                boss.chargeTarget = null;
                
                console.log(`Void Hunter charge hit for ${chargeDamage} damage`);
            }
        }
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
