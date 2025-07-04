import { Projectile } from './Projectile.js';
import { Particle } from './Particle.js';

/**
 * Player character class
 * Handles player state, movement, combat, and power-ups
 */
export class Player {
    // Player constants
    static DEFAULTS = {
        RADIUS: 20,
        MAX_HP: 100,
        BASE_FIRE_RATE: 300,
        BASE_DAMAGE: 10,
        SLOW_FIELD_BASE_RADIUS: 80,
        MAX_SLOW_FIELD_STACKS: 6,
        MUZZLE_FLASH_PARTICLES: 3,
        MUZZLE_FLASH_DISTANCE: 10
    };

    static POWER_UP_STACK_NAMES = [
        "Damage Boost", "Fire Rate", "Speed Boost", "Double Damage", 
        "Rapid Fire", "Max Health", "Shield", "Regeneration", 
        "Shield Regen", "Bigger Explosions"
    ];

    /**
     * Creates a new player
     * @param {number} x - Initial x position
     * @param {number} y - Initial y position
     */
    constructor(x, y) {
        this._initializePosition(x, y);
        this._initializeStats();
        this._initializePowerUps();
        this._initializeStackTracking();
    }
    
    /**
     * Initialize player position and basic properties
     * @private
     */
    _initializePosition(x, y) {
        this.x = x;
        this.y = y;
        this.radius = Player.DEFAULTS.RADIUS;
        this.angle = 0;
    }
    
    /**
     * Initialize player statistics
     * @private  
     */
    _initializeStats() {
        this.maxHp = Player.DEFAULTS.MAX_HP;
        this.hp = this.maxHp;
        this.fireCooldown = 0;
        this.baseFireRate = Player.DEFAULTS.BASE_FIRE_RATE;
        this.coins = 0;
        
        // Combat modifiers
        this.damageMod = 1;
        this.fireRateMod = 1;
        this.projectileSpeedMod = 1;
    }
    
    /**
     * Initialize power-up flags and properties
     * @private
     */
    _initializePowerUps() {
        // Boolean power-ups
        this.hasPiercing = false;
        this.hasTripleShot = false;
        this.hasLifeSteal = false;
        this.hasSlowField = false;
        this.hasShield = false;
        this.explosiveShots = false;
        
        // Numeric power-ups
        this.shieldHp = 0;
        this.maxShieldHp = 0;
        this.hpRegen = 0;
        this.shieldRegen = 0;
        this.explosionRadius = 50;
        this.explosionDamage = 20;
        
        // Slow field properties
        this.slowFieldRadius = Player.DEFAULTS.SLOW_FIELD_BASE_RADIUS;
        this.slowFieldStrength = 0;
        this.maxSlowFieldStacks = Player.DEFAULTS.MAX_SLOW_FIELD_STACKS;
    }
    
    /**
     * Initialize power-up stack tracking
     * @private
     */
    _initializeStackTracking() {
        this.powerUpStacks = {};
        Player.POWER_UP_STACK_NAMES.forEach(name => {
            this.powerUpStacks[name] = 0;
        });
    }
    
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
    
    update(delta, input, game) {
        // Auto-target the nearest enemy
        const nearestEnemy = this.findNearestEnemy(game.enemies);
        if (nearestEnemy) {
            // Rotate to face the nearest enemy
            this.angle = Math.atan2(nearestEnemy.y - this.y, nearestEnemy.x - this.x);
            
            // Auto-fire at enemies
            if (this.fireCooldown <= 0) {
                this.fireProjectile(game);
                this.fireCooldown = this.getFireInterval();
            }
        }
        
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }
        
        // Regeneration
        if (this.hpRegen > 0) {
            this.heal(this.hpRegen * (delta / 1000));
        }
        
        if (this.shieldRegen > 0 && this.hasShield) {
            this.healShield(this.shieldRegen * (delta / 1000));
        }
        
        // Slow field effect
        // Apply slow field to enemies
        if (this.hasSlowField && this.slowFieldStrength > 0) {
            this.applySlowField(game.enemies);
        }
    }
    
    /**
     * Find the optimal target enemy using priority-based selection
     * @param {Array<Enemy>} enemies - Array of enemy objects
     * @returns {Enemy|null} Best target enemy or null if none available
     */
    findNearestEnemy(enemies) {
        if (!Array.isArray(enemies) || enemies.length === 0) {
            return null;
        }
        
        let bestTarget = null;
        let bestPriority = Infinity;
        
        for (const enemy of enemies) {
            if (enemy.dying) continue;
            
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
     * Calculate distance to another entity
     * @private
     * @param {Object} entity - Entity with x, y properties
     * @returns {number} Distance to entity
     */
    _calculateDistanceTo(entity) {
        const dx = entity.x - this.x;
        const dy = entity.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Get the fire interval based on current fire rate modifier
     * @returns {number} Fire interval in milliseconds
     */
    getFireInterval() {
        return this.baseFireRate / this.fireRateMod;
    }
    
    /**
     * Fire projectile(s) based on current power-ups
     * @param {Game} game - Game instance for adding projectiles
     */
    fireProjectile(game) {
        const damage = Player.DEFAULTS.BASE_DAMAGE * this.damageMod;
        
        if (this.hasTripleShot) {
            this._fireTripleShot(game, damage);
        } else {
            this._fireSingleShot(game, damage);
        }
        
        this.createMuzzleFlash(game);
        
        // Play shoot sound
        if (window.playSFX) {
            window.playSFX('shoot');
        }
    }
    
    /**
     * Fire three projectiles in a spread pattern
     * @private
     * @param {Game} game - Game instance
     * @param {number} damage - Projectile damage
     */
    _fireTripleShot(game, damage) {
        const spreadAngle = 0.3; // radians
        
        for (let i = -1; i <= 1; i++) {
            const angle = this.angle + (i * spreadAngle);
            const projectile = this._createProjectile(angle, damage);
            game.projectiles.push(projectile);
        }
    }
    
    /**
     * Fire a single projectile
     * @private
     * @param {Game} game - Game instance
     * @param {number} damage - Projectile damage
     */
    _fireSingleShot(game, damage) {
        const projectile = this._createProjectile(this.angle, damage);
        game.projectiles.push(projectile);
    }
    
    /**
     * Create a projectile with current power-up modifications
     * @private
     * @param {number} angle - Projectile angle
     * @param {number} damage - Base damage
     * @returns {Projectile} Configured projectile
     */
    _createProjectile(angle, damage) {
        const projectile = new Projectile(
            this.x, this.y, angle, damage, this.projectileSpeedMod
        );
        
        this._applyProjectileModifications(projectile);
        return projectile;
    }
    
    /**
     * Apply power-up modifications to projectile
     * @private
     * @param {Projectile} projectile - Projectile to modify
     */
    _applyProjectileModifications(projectile) {
        if (this.hasPiercing) {
            projectile.piercing = true;
            projectile.piercingCount = 2;
        }
        
        if (this.explosiveShots) {
            projectile.explosive = true;
            projectile.explosionRadius = this.explosionRadius;
            projectile.explosionDamage = this.explosionDamage;
        }
    }
    
    /**
     * Create muzzle flash effect
     * @param {Game} game - Game instance for adding particles
     */
    createMuzzleFlash(game) {
        // Create small particles at the gun tip
        const flashDistance = this.radius + Player.DEFAULTS.MUZZLE_FLASH_DISTANCE;
        const flashX = this.x + Math.cos(this.angle) * flashDistance;
        const flashY = this.y + Math.sin(this.angle) * flashDistance;
        
        for (let i = 0; i < Player.DEFAULTS.MUZZLE_FLASH_PARTICLES; i++) {
            const angle = this.angle + (Math.random() - 0.5) * 0.5;
            const speed = 30 + Math.random() * 20;
            const life = 100 + Math.random() * 100;
            
            const particle = new Particle(
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
     * Take damage and apply to shield or health
     * @param {number} amount - Damage amount
     */
    takeDamage(amount) {
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
     * Heal the player by a certain amount
     * @param {number} amount - Heal amount
     */
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        if (window.createFloatingText) {
            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            window.createFloatingText(
                `+${Math.floor(amount)}`,
                this.x * (rect.width / canvas.width) + rect.left,
                this.y * (rect.height / canvas.height) + rect.top,
                'heal'
            );
        }
    }
    
    /**
     * Heal the player's shield by a certain amount
     * @param {number} amount - Heal amount
     */
    healShield(amount) {
        if (!this.hasShield) return;
        this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + amount);
    }
    
    /**
     * Apply slow field effect to enemies within range
     * @param {Array<Enemy>} enemies - Array of enemy objects
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
                enemy.slowFactor = 1;
            }
        });
    }
    
    /**
     * Life steal on enemy kill
     * @param {Enemy} enemy - Killed enemy object
     */
    onEnemyKill(enemy) {
        if (this.hasLifeSteal) {
            const healAmount = enemy.maxHealth * 0.1; // Heal 10% of enemy's max health
            this.heal(healAmount);
        }
    }
    
    /**
     * Get a list of non-stackable power-ups the player currently has
     * @returns {Array<string>} List of non-stackable power-ups
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
     * Check if slow field is at maximum stacks
     * @returns {boolean} True if slow field is maxed, false otherwise
     */
    isSlowFieldMaxed() {
        return this.slowFieldStrength >= this.maxSlowFieldStacks;
    }

    /**
     * Add coins to the player's total
     * @param {number} amount - Amount of coins to add
     */
    addCoins(amount) {
        this.coins += amount;
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
     * Spend coins from the player's total
     * @param {number} amount - Amount of coins to spend
     * @returns {boolean} True if successful, false if not enough coins
     */
    spendCoins(amount) {
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }

    /**
     * Draw the player on the canvas
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
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
