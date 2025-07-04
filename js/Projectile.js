/**
 * @fileoverview Projectile system for the neon tower defense game.
 * Handles different types of projectiles including standard, piercing, and explosive bullets.
 * @author Neon TD Team
 * @version 1.0.0
 */

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
        this.radius = 3;
        this.damage = damage;
        this.angle = angle;
        
        // Movement calculations
        this.baseSpeed = 400; // Base speed in pixels per second
        this.speed = this.baseSpeed * speedMod;
        this.vx = Math.cos(angle) * this.speed; // Velocity X component
        this.vy = Math.sin(angle) * this.speed; // Velocity Y component
        
        // Special behavior properties
        this.piercing = false;          // Can pass through multiple enemies
        this.piercingCount = 0;         // Number of enemies this projectile can pierce
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
    }
    
    /**
     * Updates the projectile's position, lifetime, and visual effects.
     * Called once per frame by the game loop.
     * 
     * @param {number} delta - Time elapsed since last frame in milliseconds
     */
    update(delta) {
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
     * @param {Game} game - The main game instance for accessing enemies and effects
     */
    explode(game) {
        if (!this.explosive) return;
        
        // Generate visual explosion particles
        game.createExplosion(this.x, this.y, 12);
        
        // Apply area damage to all enemies within explosion radius
        game.enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.explosionRadius) {
                // Calculate damage falloff based on distance from explosion center
                const damage = this.explosionDamage * (1 - distance / this.explosionRadius);
                enemy.takeDamage(Math.floor(damage));
                
                // Display damage number floating text
                if (window.createFloatingText) {
                    const rect = game.canvas.getBoundingClientRect();
                    window.createFloatingText(
                        `-${Math.floor(damage)}`,
                        enemy.x * (rect.width / game.canvas.width) + rect.left,
                        enemy.y * (rect.height / game.canvas.height) + rect.top,
                        'damage'
                    );
                }
            }
        });
        
        // Add screen shake effect for impact feedback
        game.addScreenShake(5, 200);
    }
    
    /**
     * Renders the projectile and its visual effects to the canvas.
     * Handles different rendering styles based on projectile type.
     * 
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context
     */
    draw(ctx) {
        ctx.save();
        
        // Render trailing effect behind projectile
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
                // Create fading effect along trail
                const alpha = i / this.trail.length;
                ctx.globalAlpha = alpha * 0.3;
                
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            }
            ctx.stroke();
        }
        
        // Configure glow effect for all projectile types
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1;
        
        // Render projectile based on type
        if (this.piercing) {
            // Piercing projectiles: Diamond shape oriented with direction
            ctx.fillStyle = '#0ff';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle); // Orient diamond with flight direction
            
            ctx.beginPath();
            ctx.moveTo(this.radius * 2, 0);     // Point
            ctx.lineTo(0, -this.radius);        // Top
            ctx.lineTo(-this.radius, 0);        // Back
            ctx.lineTo(0, this.radius);         // Bottom
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        } else if (this.explosive) {
            // Explosive projectiles: Larger orange circles with white core
            ctx.fillStyle = '#f80';
            this.glowColor = '#f80';
            
            // Outer explosive shell
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner white core for contrast
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Standard projectiles: Simple white circles
            ctx.fillStyle = this.color;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
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
