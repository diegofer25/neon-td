/**
 * @fileoverview Projectile system for the neon tower defense game.
 * Handles different types of projectiles including standard, piercing, and explosive bullets.
 */

import { createFloatingText, game } from './main.js';

/**
 * Represents a projectile fired by towers in the game.
 * Supports multiple projectile types with different behaviors and visual effects.
 * 
 * @class Projectile
 * @example
 * // Create a standard projectile
 * const bullet = new Projectile(100, 100, Math.PI/4, 25);
 * 
 * // Create using factory methods
 * const piercingBullet = Projectile.createPiercing(100, 100, 0, 30);
 */
export class Projectile {
    /**
     * Creates a new projectile instance.
     * 
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position  
     * @param {number} angle - Launch angle in radians
     * @param {number} damage - Base damage value
     * @param {number} [speedMod=1] - Speed modifier (1.0 = normal speed)
     */
    constructor(x, y, angle, damage, speedMod = 1) {
        // Position properties
        this.x = x;
        this.y = y;
        this.radius = 5; // Increased from 3 to 5 for better visibility and hit detection
        this.damage = damage;
        this.angle = angle;
        
        // Movement calculations
        this.baseSpeed = 400; // Base speed in pixels per second
        this.speed = this.baseSpeed * speedMod;
        this.vx = Math.cos(angle) * this.speed; // Velocity X component
        this.vy = Math.sin(angle) * this.speed; // Velocity Y component

        this.isExtra = false;

        // Special behavior properties
        this.piercing = false;          // Can pass through multiple enemies
        this.piercingCount = 0;         // Number of enemies this projectile can pierce
        this.originalDamage = damage;   // Store original damage for piercing calculations
        this.hitEnemyIds = [];           // An array to store the IDs of enemies that have been hit
        this.enemiesHit = 0;           // Track number of enemies hit for damage reduction
        this.explosive = false;         // Explodes on impact
        this.explosionRadius = 50;      // Explosion effect radius
        this.explosionDamage = 20;      // Damage dealt by explosion
        
        // Visual rendering properties
        this.color = '#fff';            // Primary color
        this.glowColor = '#fff';        // Glow effect color
        this.trail = [];                // Array storing trail positions
        this.trailLength = 8;           // Maximum trail points to keep
        
        // Lifecycle management
        this.maxLifetime = 3000;        // Maximum lifetime in milliseconds (3 seconds)
        this.lifetime = 0;              // Current age in milliseconds
        
        // Destruction flag for cleanup
        this._destroy = false;
        
        // Critical hit properties
        /** @type {boolean} Whether this projectile is a critical hit */
        this.isCritical = false;
        /** @type {boolean} Visual flag for critical hit effects */
        this.isCriticalVisual = false;
        /** @type {string} Glow color for visual effects */
        this.glowColor = '#fff';
        this.isEnemyProjectile = false;
        
        // Shield Boss Counter properties
        /** @type {boolean} Whether this is an overcharge burst projectile */
        this.isOverchargeBurst = false;
        /** @type {boolean} Whether this projectile ignores shields */
        this.ignoresShields = false;
        /** @type {number} Visual size override for special projectiles */
        this.size = this.radius;
        
        // Shield Breaker properties
        /** @type {boolean} Whether this projectile has shield breaker ability */
        this.hasShieldBreaker = false;
        /** @type {number} Shield damage multiplier */
        this.shieldBreakerDamage = 1.0;
        /** @type {number} Shield regeneration delay in milliseconds */
        this.shieldRegenDelay = 0;
        
        // Adaptive Targeting properties
        /** @type {boolean} Whether this projectile has homing ability */
        this.hasHoming = false;
        /** @type {number} Homing strength (0-1, where 1 is perfect tracking) */
        this.homingStrength = 0;
    }
    
    /**
     * Calculates the current damage this projectile should deal based on piercing mechanics.
     * For piercing projectiles, damage decreases by 25% for each enemy hit.
     * First hit: 100% damage, Second hit: 75% damage, Third hit: 50% damage, etc.
     *
     * @returns {number} The current damage this projectile should deal
     */
    getCurrentDamage() {
        if (!this.piercing) {
            return this.originalDamage;
        }

        // Calculate damage reduction: 25% less damage for each enemy hit
        const damageReduction = this.enemiesHit * 0.25;
        const currentDamageMultiplier = Math.max(0, 1 - damageReduction);

        return this.originalDamage * currentDamageMultiplier;
    }
    
    /**
     * Updates the projectile's position, lifetime, and visual effects.
     * Called once per frame by the game loop.
     * 
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    update(delta) {
        // Skip position updates if game is not playing
        if (game && game.gameState !== 'playing') return;
        
        // Apply basic homing if enabled
        if (this.hasHoming && this.homingStrength > 0 && game && game.enemies) {
            this.applyHoming(game.enemies, delta);
        }
        
        // Update position using velocity and frame time
        // Convert from pixels per second to pixels per frame
        this.x += this.vx * (delta / 1000);
        this.y += this.vy * (delta / 1000);
        
        // Track projectile age for automatic cleanup
        this.lifetime += delta;
        if (this.lifetime > this.maxLifetime) {
            this._destroy = true;
        }
        
        // Maintain visual trail by adding current position
        this.trail.push({ x: this.x, y: this.y });
        
        // Limit trail length for performance
        if (this.trail.length > this.trailLength) {
            this.trail.shift(); // Remove oldest trail point
        }
    }
    
    /**
     * Apply basic homing behavior to track nearby enemies
     * 
     * @param {Array.<import('./Enemy.js').Enemy>} enemies - Array of enemy objects
     * @param {number} delta - Time elapsed since last frame
     */
    applyHoming(enemies, delta) {
        // Find nearest enemy within reasonable range
        /** @type {import('./Enemy.js').Enemy|null} */
        let nearestEnemy = null;
        let nearestDistance = 150; // Only home within 150 pixels
        
        enemies.forEach(enemy => {
            if (enemy.dying) return; // Skip dying enemies
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        if (nearestEnemy) {
            // Calculate desired direction to target
            const dx = nearestEnemy.x - this.x;
            const dy = nearestEnemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Normalize desired direction
                const desiredVx = (dx / distance) * this.speed;
                const desiredVy = (dy / distance) * this.speed;
                
                // Apply homing strength to blend current velocity with desired velocity
                const strength = this.homingStrength * (delta / 1000);
                this.vx = this.vx * (1 - strength) + desiredVx * strength;
                this.vy = this.vy * (1 - strength) + desiredVy * strength;
                
                // Maintain original speed
                const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                if (currentSpeed > 0) {
                    this.vx = (this.vx / currentSpeed) * this.speed;
                    this.vy = (this.vy / currentSpeed) * this.speed;
                }
            }
        }
    }
    
    /**
     * Checks if the projectile has moved outside the visible game area.
     * Used for cleanup of projectiles that miss all targets.
     * 
     * @param {HTMLCanvasElement} canvas - The game canvas element
     * @returns {boolean} True if projectile is outside screen bounds
     */
    isOffScreen(canvas) {
        const margin = 50; // Extra margin to account for projectile size
        return (
            this.x < -margin ||
            this.x > canvas.width + margin ||
            this.y < -margin ||
            this.y > canvas.height + margin
        );
    }
    
    /**
     * Triggers explosion effect if this is an explosive projectile.
     * Damages all enemies within explosion radius and creates visual effects.
     * 
     * @param {import('./Game.js').Game} game - The main game instance for accessing enemies and effects
     */
    explode(game) {
        if (!this.explosive) return;
        
        // Generate visual explosion particles
        game.createExplosion(this.x, this.y, 12);
        
        // Create visual explosion ring to show blast radius
        game.createExplosionRing(this.x, this.y, this.explosionRadius);
        
        // Apply area damage to all enemies within explosion radius
        game.enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.explosionRadius) {
                // Calculate damage falloff based on distance from explosion center
                const damage = this.explosionDamage * (1 - distance / this.explosionRadius);
                enemy.takeDamage(damage);
                
                // Display damage number floating text
                const rect = game.canvas.getBoundingClientRect();
                createFloatingText(
                    `-${damage.toFixed(1)}`,
                    enemy.x * (rect.width / game.canvas.width) + rect.left,
                    enemy.y * (rect.height / game.canvas.height) + rect.top,
                    'damage'
                );
            }
        });
        
        // Add screen shake effect for impact feedback
        game.addScreenShake(5, 200);
    }
    
    /**
     * Render the projectile with appropriate visual effects
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    draw(ctx) {
        ctx.save();
        
        // Enhanced glow for critical hits
        if (this.isCriticalVisual) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 20; // Stronger glow for critical hits
        } else {
            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 10;
        }
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Different colors and sizes for special projectiles
        let fillColor = '#fff';
        let strokeColor = '#fff';
        let lineWidth = 2;
        let drawSize = 4;
        
        if (this.isOverchargeBurst) {
            // Overcharge burst - bright yellow/gold
            fillColor = this.glowColor || '#ffff00';
            strokeColor = '#ffaa00';
            lineWidth = 4;
            drawSize = this.size || 8;
        } else if (this.isCriticalVisual) {
            // Critical hit - golden
            fillColor = this.glowColor;
            strokeColor = '#ffaa00';
            lineWidth = 3;
            drawSize = 6;
        } else if (this.hasShieldBreaker) {
            // Shield breaker - cyan/blue
            fillColor = '#00ffff';
            strokeColor = '#0088ff';
            lineWidth = 3;
            drawSize = 5;
        }
        
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        
        // Draw projectile body
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Factory method for creating standard projectiles.
     * 
     * @static
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} angle - Launch angle in radians
     * @param {number} damage - Base damage value
     * @param {number} [speedMod=1] - Speed modifier
     * @returns {Projectile} A new standard projectile instance
     * @example
     * const bullet = Projectile.createStandard(100, 100, 0, 25, 1.2);
     */
    static createStandard(x, y, angle, damage, speedMod = 1) {
        return new Projectile(x, y, angle, damage, speedMod);
    }
    
    /**
     * Factory method for creating piercing projectiles.
     * These projectiles can pass through multiple enemies.
     * 
     * @static
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} angle - Launch angle in radians
     * @param {number} damage - Base damage value
     * @param {number} [speedMod=1] - Speed modifier
     * @returns {Projectile} A new piercing projectile instance
     * @example
     * const piercingBullet = Projectile.createPiercing(100, 100, Math.PI/2, 30);
     */
    static createPiercing(x, y, angle, damage, speedMod = 1) {
        const projectile = new Projectile(x, y, angle, damage, speedMod);
        projectile.piercing = true;
        projectile.piercingCount = 2;      // Can pierce through 2 enemies
        projectile.color = '#0ff';         // Cyan color for piercing bullets
        projectile.glowColor = '#0ff';
        return projectile;
    }
    
    /**
     * Factory method for creating explosive projectiles.
     * These projectiles explode on impact, dealing area damage.
     * 
     * @static
     * @param {number} x - Initial X position
     * @param {number} y - Initial Y position
     * @param {number} angle - Launch angle in radians
     * @param {number} damage - Base damage value (explosion does 50% of this)
     * @param {number} [speedMod=1] - Speed modifier
     * @returns {Projectile} A new explosive projectile instance
     * @example
     * const explosive = Projectile.createExplosive(100, 100, Math.PI/4, 40);
     */
    static createExplosive(x, y, angle, damage, speedMod = 1) {
        const projectile = new Projectile(x, y, angle, damage, speedMod);
        projectile.explosive = true;
        projectile.explosionRadius = 50;           // 50 pixel explosion radius
        projectile.explosionDamage = damage * 0.5; // 50% of direct damage for area effect
        projectile.color = '#f80';                 // Orange color for explosive bullets
        projectile.glowColor = '#f80';
        return projectile;
    }
}