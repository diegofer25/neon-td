import { Projectile } from './Projectile.js';
import { GameConfig } from './config/GameConfig.js';

/**
 * Player character class for the neon tower defense game
 * 
 * Handles all player-related functionality including:
 * - Character state management (health, shields, position)
 * - Combat system (auto-targeting, firing, damage calculations)
 * - Power-up system (stackable and non-stackable abilities)
 * - Visual effects (muzzle flash, glow effects, slow field)
 * - Economy system (coin collection and spending)
 * 
 * @class Player
 * @version 1.0.0
 * @since 1.0.0
 */
export class Player {
    /**
     * Default configuration values for player properties
     * @static
     * @readonly
     * @type {Object}
     */
    static DEFAULTS = {
        /** @type {number} Base player radius in pixels */
        RADIUS: 20,
        /** @type {number} Maximum health points */
        MAX_HP: 100,
        /** @type {number} Base fire rate in milliseconds between shots */
        BASE_FIRE_RATE: 300,
        /** @type {number} Base damage per projectile */
        BASE_DAMAGE: 10,
        /** @type {number} Base radius for slow field effect */
        SLOW_FIELD_BASE_RADIUS: 80,
        /** @type {number} Maximum slow field stack count */
        MAX_SLOW_FIELD_STACKS: 6,
        /** @type {number} Number of particles in muzzle flash effect */
        MUZZLE_FLASH_PARTICLES: 3,
        /** @type {number} Distance from player center to muzzle flash */
        MUZZLE_FLASH_DISTANCE: 10
    };

    /**
     * Available power-up types that can be stacked
     * @static
     * @readonly
     * @type {string[]}
     */
    static POWER_UP_STACK_NAMES = [
        "Damage Boost", "Fire Rate", "Speed Boost", "Double Damage", 
        "Rapid Fire", "Max Health", "Shield", "Regeneration", 
        "Shield Regen", "Bigger Explosions"
    ];

    /**
     * Creates a new player instance with default stats and power-ups
     * 
     * @param {number} x - Initial x coordinate position
     * @param {number} y - Initial y coordinate position
     * @example
     * const player = new Player(400, 300); // Center of 800x600 canvas
     */
    constructor(x, y) {
        this._initializePosition(x, y);
        this._initializeStats();
        this._initializePowerUps();
        this._initializeStackTracking();
    }
    
    /**
     * Initialize player position and basic geometric properties
     * 
     * @private
     * @param {number} x - Initial x coordinate
     * @param {number} y - Initial y coordinate
     */
    _initializePosition(x, y) {
        /** @type {number} Current x position */
        this.x = x;
        /** @type {number} Current y position */
        this.y = y;
        /** @type {number} Player collision radius */
        this.radius = Player.DEFAULTS.RADIUS;
        /** @type {number} Current facing angle in radians */
        this.angle = 0;
    }
    
    /**
     * Initialize player combat and health statistics
     * 
     * @private
     */
    _initializeStats() {
        /** @type {number} Maximum health points */
        this.maxHp = Player.DEFAULTS.MAX_HP;
        /** @type {number} Current health points */
        this.hp = this.maxHp;
        /** @type {number} Time remaining until next shot (milliseconds) */
        this.fireCooldown = 0;
        /** @type {number} Base time between shots (milliseconds) */
        this.baseFireRate = Player.DEFAULTS.BASE_FIRE_RATE;
        /** @type {number} Player's currency amount */
        this.coins = 0;
        
        // Combat modifiers (multipliers)
        /** @type {number} Damage multiplier (1.0 = normal damage) */
        this.damageMod = 1;
        /** @type {number} Fire rate multiplier (2.0 = twice as fast) */
        this.fireRateMod = 1;
        /** @type {number} Projectile speed multiplier */
        this.projectileSpeedMod = 1;
    }
    
    /**
     * Initialize all power-up flags and related properties
     * 
     * @private
     */
    _initializePowerUps() {
        // Boolean power-up flags
        /** @type {boolean} Whether projectiles pierce through enemies */
        this.hasPiercing = false;
        /** @type {boolean} Whether player fires three projectiles per shot */
        this.hasTripleShot = false;
        /** @type {boolean} Whether player heals when killing enemies */
        this.hasLifeSteal = false;
        /** @type {boolean} Whether slow field is active */
        this.hasSlowField = false;
        /** @type {boolean} Whether shield protection is active */
        this.hasShield = false;
        /** @type {boolean} Whether projectiles explode on impact */
        this.explosiveShots = false;
        
        // Numeric power-up properties
        /** @type {number} Current shield health points */
        this.shieldHp = 0;
        /** @type {number} Maximum shield health points */
        this.maxShieldHp = 0;
        /** @type {number} Health regeneration per second */
        this.hpRegen = 0;
        /** @type {number} Shield regeneration per second */
        this.shieldRegen = 0;
        /** @type {number} Explosion radius for explosive shots */
        this.explosionRadius = 50;
        /** @type {number} Explosion damage for explosive shots */
        this.explosionDamage = 20;
        
        // Slow field configuration
        /** @type {number} Radius of slow field effect */
        this.slowFieldRadius = Player.DEFAULTS.SLOW_FIELD_BASE_RADIUS;
        /** @type {number} Current slow field strength (stack count) */
        this.slowFieldStrength = 0;
        /** @type {number} Maximum allowed slow field stacks */
        this.maxSlowFieldStacks = Player.DEFAULTS.MAX_SLOW_FIELD_STACKS;
    }
    
    /**
     * Initialize tracking object for stackable power-ups
     * 
     * @private
     */
    _initializeStackTracking() {
        /** @type {Object.<string, number>} Power-up stack counts by name */
        this.powerUpStacks = {};
        Player.POWER_UP_STACK_NAMES.forEach(name => {
            this.powerUpStacks[name] = 0;
        });
    }
    
    /**
     * Reset player to initial state (called on game restart)
     * Clears all power-ups, resets health, and restores default values
     * 
     * @public
     */
    reset() {
        this.hp = this.maxHp;
        this.fireCooldown = 0;
        this.angle = 0;
        
        // Reset all power-up modifiers
        this.damageMod = 1;
        this.fireRateMod = 1;
        this.projectileSpeedMod = 1;
        
        this.hasPiercing = false;
        this.hasTripleShot = false;
        this.hasLifeSteal = false;
        this.hasSlowField = false;
        this.hasShield = false;
        this.shieldHp = 0;
        this.maxShieldHp = 0;
        this.hpRegen = 0;
        this.shieldRegen = 0;
        this.explosiveShots = false;
        
        // Reset slow field properties
        this.slowFieldRadius = Player.DEFAULTS.SLOW_FIELD_BASE_RADIUS;
        this.slowFieldStrength = 0;
        this.maxSlowFieldStacks = Player.DEFAULTS.MAX_SLOW_FIELD_STACKS;
        
        // Reset coins
        this.coins = 0;
        
        // Reset power-up stacks
        this.powerUpStacks = {};
        Player.POWER_UP_STACK_NAMES.forEach(name => {
            this.powerUpStacks[name] = 0;
        });
    }
    
    /**
     * Update player state each frame
     * Handles auto-targeting, firing, regeneration, and power-up effects
     * 
     * @param {number} delta - Time elapsed since last frame (milliseconds)
     * @param {Object} input - Input state object (currently unused)
     * @param {Object} game - Game instance containing enemies, projectiles, particles
     * @param {Array} game.enemies - Array of enemy objects to target
     * @param {Array} game.projectiles - Array to add new projectiles to
     * @param {Array} game.particles - Array to add visual effect particles to
     */
    update(delta, input, game) {
        // Auto-targeting system: find and engage nearest threat
        const nearestEnemy = this.findNearestEnemy(game.enemies);
        if (nearestEnemy) {
            // Rotate to face the nearest enemy
            this.angle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);
            
            // Auto-fire at enemies when off cooldown
            if (this.fireCooldown <= 0) {
                this.fireProjectile(game);
                this.fireCooldown = this.getFireInterval();
            }
        }
        
        // Update fire cooldown timer
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }
        
        // Apply regeneration effects over time
        if (this.hpRegen > 0) {
            this.heal(this.hpRegen * (delta / 1000));
        }
        
        if (this.shieldRegen > 0 && this.hasShield) {
            this.healShield(this.shieldRegen * (delta / 1000));
        }
        
        // Apply area-of-effect slow field to nearby enemies
        if (this.hasSlowField && this.slowFieldStrength > 0) {
            this.applySlowField(game.enemies);
        }
    }
    
    /**
     * Find the optimal target enemy using priority-based selection algorithm
     * Prioritizes enemies based on distance and health remaining
     * 
     * @param {Array<Object>} enemies - Array of enemy objects to evaluate
     * @param {number} enemies[].x - Enemy x position
     * @param {number} enemies[].y - Enemy y position  
     * @param {number} enemies[].health - Enemy current health
     * @param {number} enemies[].maxHealth - Enemy maximum health
     * @param {boolean} enemies[].dying - Whether enemy is in death animation
     * @returns {Object|null} Best target enemy or null if none available
     * 
     * @example
     * const target = player.findNearestEnemy(game.enemies);
     * if (target) {
     *   console.log(`Targeting enemy at (${target.x}, ${target.y})`);
     * }
     */
    findNearestEnemy(enemies) {
        if (!Array.isArray(enemies) || enemies.length === 0) {
            return null;
        }
        
        let bestTarget = null;
        let bestPriority = Infinity;
        
        for (const enemy of enemies) {
            if (enemy.dying) continue; // Skip enemies already dying
            
            const distance = this._calculateDistanceTo(enemy);
            // Lower health enemies get higher priority (lower score)
            const healthFactor = (enemy.maxHealth - enemy.health) * 0.1;
            const priority = distance - healthFactor;
            
            if (priority < bestPriority) {
                bestPriority = priority;
                bestTarget = enemy;
            }
        }
        
        return bestTarget;
    }
    
    /**
     * Calculate Euclidean distance to another entity
     * 
     * @private
     * @param {Object} entity - Entity with position properties
     * @param {number} entity.x - Entity x coordinate
     * @param {number} entity.y - Entity y coordinate
     * @returns {number} Distance to entity in pixels
     */
    _calculateDistanceTo(entity) {
        const dx = entity.x - this.x;
        const dy = entity.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate effective fire interval based on current fire rate modifier
     * 
     * @returns {number} Time between shots in milliseconds
     * @example
     * // With fireRateMod = 2.0, fires twice as fast
     * const interval = player.getFireInterval(); // Returns baseFireRate / 2
     */
    getFireInterval() {
        return this.baseFireRate / this.fireRateMod;
    }
    
    /**
     * Fire projectile(s) based on current power-up configuration
     * Handles single shots, triple shots, and all projectile modifications
     * 
     * @param {Object} game - Game instance for adding projectiles and effects
     * @param {Array} game.projectiles - Array to add new projectiles to
     * @param {Array} game.particles - Array to add muzzle flash particles to
     */
    fireProjectile(game) {
        const damage = Player.DEFAULTS.BASE_DAMAGE * this.damageMod;
        
        if (this.hasTripleShot) {
            this._fireTripleShot(game, damage);
        } else {
            this._fireSingleShot(game, damage);
        }
        
        this.createMuzzleFlash(game);
        
        // Play shoot sound effect if available
        if (window.playSFX) {
            window.playSFX('shoot');
        }
    }
    
    /**
     * Fire three projectiles in a spread pattern
     * 
     * @private
     * @param {Object} game - Game instance
     * @param {number} damage - Base damage per projectile
     */
    _fireTripleShot(game, damage) {
        const spreadAngle = 0.3; // radians (~17 degrees)
        
        for (let i = -1; i <= 1; i++) {
            const angle = this.angle + (i * spreadAngle);
            const projectile = this._createProjectile(angle, damage);
            game.projectiles.push(projectile);
        }
    }
    
    /**
     * Fire a single projectile straight ahead
     * 
     * @private
     * @param {Object} game - Game instance
     * @param {number} damage - Projectile damage
     */
    _fireSingleShot(game, damage) {
        const projectile = this._createProjectile(this.angle, damage);
        game.projectiles.push(projectile);
    }
    
    /**
     * Create a projectile with current power-up modifications applied
     * 
     * @private
     * @param {number} angle - Projectile trajectory angle in radians
     * @param {number} damage - Base damage value
     * @returns {Projectile} Fully configured projectile instance
     */
    _createProjectile(angle, damage) {
        const projectile = new Projectile(
            this.x, this.y, angle, damage, this.projectileSpeedMod
        );
        
        this._applyProjectileModifications(projectile);
        return projectile;
    }
    
    /**
     * Apply power-up modifications to a projectile instance
     * 
     * @private
     * @param {Projectile} projectile - Projectile to modify
     */
    _applyProjectileModifications(projectile) {
        if (this.hasPiercing) {
            projectile.piercing = true;
            projectile.piercingCount = GameConfig.PLAYER.PIERCING_COUNT;
            projectile.originalDamage = projectile.damage; // Store original damage for reduction calculation
            projectile.enemiesHit = 0; // Track how many enemies this projectile has hit
        }
        
        if (this.explosiveShots) {
            projectile.explosive = true;
            projectile.explosionRadius = this.explosionRadius;
            projectile.explosionDamage = this.explosionDamage;
        }
    }
    
    /**
     * Create visual muzzle flash effect when firing
     * Spawns particles at the gun barrel tip
     * 
     * @param {Object} game - Game instance for adding particles
     * @param {Array} game.particles - Array to add new particles to
     */
    createMuzzleFlash(game) {
        // Calculate position at gun barrel tip
        const flashDistance = this.radius + Player.DEFAULTS.MUZZLE_FLASH_DISTANCE;
        const flashX = this.x + Math.cos(this.angle) * flashDistance;
        const flashY = this.y + Math.sin(this.angle) * flashDistance;
        
        // Create small white particles with random spread using game's particle pool
        for (let i = 0; i < Player.DEFAULTS.MUZZLE_FLASH_PARTICLES; i++) {
            const angle = this.angle + (Math.random() - 0.5) * 0.5; // ±0.25 radian spread
            const speed = 30 + Math.random() * 20; // 30-50 pixel/second speed
            const life = 100 + Math.random() * 100; // 100-200ms lifetime
            
            // Use game's particle pool instead of creating new Particle
            const particle = game.particlePool.get(
                flashX, flashY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                '#fff'
            );
            
            game.particles.push(particle);
        }
    }
    
    /**
     * Apply damage to player, prioritizing shield absorption
     * Shield absorbs damage first, then health takes remaining damage
     * 
     * @param {number} amount - Total damage amount to apply
     * @throws {Error} If amount is negative
     * 
     * @example
     * player.takeDamage(25); // Applies 25 damage to shield first, then health
     */
    takeDamage(amount) {
        if (amount < 0) {
            throw new Error('Damage amount cannot be negative');
        }
        
        // Shield absorbs damage first
        if (this.hasShield && this.shieldHp > 0) {
            const shieldDamage = Math.min(amount, this.shieldHp);
            this.shieldHp -= shieldDamage;
            amount -= shieldDamage;
            
            if (amount <= 0) return; // All damage absorbed by shield
        }
        
        this.hp -= amount;
        this.hp = Math.max(0, this.hp);
    }
    
    /**
     * Heal the player by specified amount, capped at maximum health
     * Creates visual floating text effect if available
     * 
     * @param {number} amount - Amount of health to restore
     * @throws {Error} If amount is negative
     * 
     * @example
     * player.heal(15); // Restores 15 HP, shows "+15 health" floating text
     */
    heal(amount) {
        if (amount < 0) {
            throw new Error('Heal amount cannot be negative');
        }
        
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        // Create floating text effect if UI system is available
        if (window.createFloatingText) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            window.createFloatingText(
                `+${Math.floor(amount)} health`,
                this.x * (rect.width / canvas.width) + rect.left,
                this.y * (rect.height / canvas.height) + rect.top,
                'heal'
            );
        }
    }
    
    /**
     * Heal the player's shield by specified amount, capped at maximum
     * Only works if shield power-up is active
     * 
     * @param {number} amount - Amount of shield to restore
     * @returns {boolean} True if healing occurred, false if no shield
     */
    healShield(amount) {
        if (!this.hasShield) return false;
        this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + amount);
        return true;
    }
    
    /**
     * Apply slow field effect to all enemies within range
     * Slows enemy movement based on stack count (15% per stack, max 90%)
     * 
     * @param {Array<Object>} enemies - Array of enemy objects to affect
     * @param {number} enemies[].x - Enemy x position
     * @param {number} enemies[].y - Enemy y position
     * @param {number} enemies[].slowFactor - Enemy's current slow multiplier
     */
    applySlowField(enemies) {
        if (this.slowFieldStrength <= 0) return; // No slow field effect
        
        // Calculate effective slow factor (0.5 = 50% slow, 0.3 = 70% slow)
        // Each stack = 15% more slow, capped at 90% slow (6 stacks max)
        const slowFactor = Math.max(0.1, 1 - (this.slowFieldStrength * 0.15)); 
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.slowFieldRadius) {
                enemy.slowFactor = slowFactor;
            } else {
                enemy.slowFactor = 1; // Normal speed outside field
            }
        });
    }
    
    /**
     * Handle life steal effect when an enemy is killed
     * Heals player for 10% of enemy's maximum health if life steal is active
     * 
     * @param {Object} enemy - The killed enemy object
     * @param {number} enemy.maxHealth - Enemy's maximum health value
     */
    onEnemyKill(enemy) {
        if (this.hasLifeSteal) {
            const healAmount = enemy.maxHealth * 0.1; // Heal 10% of enemy's max health
            this.heal(healAmount);
        }
    }
    
    /**
     * Get list of non-stackable power-ups currently owned by player
     * Used by shop system to prevent duplicate purchases
     * 
     * @returns {string[]} Array of power-up names that cannot be purchased again
     * 
     * @example
     * const owned = player.getNonStackablePowerUps();
     * // Returns: ["Piercing Shots", "Triple Shot"] if player has those
     */
    getNonStackablePowerUps() {
        const owned = [];
        
        if (this.hasPiercing) owned.push("Piercing Shots");
        if (this.hasTripleShot) owned.push("Triple Shot");
        if (this.hasLifeSteal) owned.push("Life Steal");
        if (this.explosiveShots) owned.push("Explosive Shots");
        
        // Add slow field if it's at maximum stacks
        if (this.isSlowFieldMaxed()) owned.push("Slow Field");
        
        return owned;
    }
    
    /**
     * Check if slow field power-up is at maximum stack count
     * 
     * @returns {boolean} True if slow field cannot be upgraded further
     */
    isSlowFieldMaxed() {
        return this.slowFieldStrength >= this.maxSlowFieldStacks;
    }

    /**
     * Add coins to the player's total with visual feedback
     * Creates floating text showing coin gain
     * 
     * @param {number} amount - Number of coins to add (must be positive)
     * @throws {Error} If amount is negative or not a number
     * 
     * @example
     * player.addCoins(10); // Adds 10 coins, shows "+10 coins" text
     */
    addCoins(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Coin amount must be a positive number');
        }
        
        this.coins += amount;
        
        // Create floating text effect if UI system is available
        if (window.createFloatingText) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            window.createFloatingText(
                `+${amount} coins`,
                this.x * (rect.width / canvas.width) + rect.left,
                (this.y - 40) * (rect.height / canvas.height) + rect.top,
                'coins'
            );
        }
    }

    /**
     * Attempt to spend coins from player's total
     * 
     * @param {number} amount - Number of coins to spend
     * @returns {boolean} True if transaction successful, false if insufficient funds
     * @throws {Error} If amount is negative or not a number
     * 
     * @example
     * if (player.spendCoins(50)) {
     *   console.log("Purchase successful!");
     * } else {
     *   console.log("Not enough coins!");
     * }
     */
    spendCoins(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Spend amount must be a positive number');
        }
        
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }

    /**
     * Render the player and all associated visual effects
     * Draws player body, gun barrel, shield, and slow field effects
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
     * 
     * @example
     * const ctx = canvas.getContext('2d');
     * player.draw(ctx); // Renders player at current position
     */
    draw(ctx) {
        // Save context for transformations
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Set glow effect
        ctx.shadowColor = '#ff2dec';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw player body (triangle shape)
        ctx.fillStyle = '#ff2dec';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(-this.radius * 0.7, -this.radius * 0.5);
        ctx.lineTo(-this.radius * 0.7, this.radius * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw gun barrel
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.radius, 0);
        ctx.lineTo(this.radius + 15, 0);
        ctx.stroke();
        
        ctx.restore();
        
        // Draw shield if active
        if (this.hasShield && this.shieldHp > 0) {
            ctx.save();
            ctx.strokeStyle = '#0ff';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#0ff';
            ctx.shadowBlur = 10;
            
            const shieldRadius = this.radius + 10;
            const shieldAlpha = this.shieldHp / this.maxShieldHp;
            ctx.globalAlpha = shieldAlpha * 0.7;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Draw slow field if active
        if (this.hasSlowField && this.slowFieldStrength > 0) {
            ctx.save();
            ctx.strokeStyle = '#8f00ff';
            ctx.lineWidth = Math.max(2, this.slowFieldStrength); // Thicker line with more stacks
            ctx.shadowColor = '#8f00ff';
            ctx.shadowBlur = 5 + this.slowFieldStrength; // More glow with more stacks
            ctx.globalAlpha = 0.2 + (this.slowFieldStrength * 0.05); // More visible with more stacks
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.slowFieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
}
