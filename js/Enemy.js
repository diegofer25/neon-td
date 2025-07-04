/**
 * Represents an enemy unit in the tower defense game.
 * Enemies move toward the player, can take damage, and have visual effects.
 * Supports different enemy types with varying stats and behaviors.
 */
export class Enemy {
    /**
     * Creates a new Enemy instance.
     * @param {number} x - Initial X coordinate
     * @param {number} y - Initial Y coordinate  
     * @param {number} speed - Movement speed in pixels per second
     * @param {number} health - Maximum health points
     * @param {number} damage - Damage dealt to player on contact
     */
    constructor(x, y, speed, health, damage) {
        // Position properties
        this.x = x;
        this.y = y;
        
        // Combat properties
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.radius = 15; // Collision radius in pixels
        
        // Visual properties
        this.color = '#0ff'; // Main body color (cyan)
        this.glowColor = '#0ff'; // Glow effect color
        this.flashTimer = 0; // Timer for hit flash effect in milliseconds
        
        // Status effects
        this.slowFactor = 1; // Movement speed multiplier (1 = normal, <1 = slowed)
        
        // Death animation properties
        this.dying = false; // Whether enemy is in death animation
        this.deathTimer = 0; // Timer for death animation in milliseconds
    }
    
    /**
     * Updates the enemy's position, status effects, and handles player collision.
     * @param {number} delta - Time elapsed since last update in milliseconds
     * @param {Object} player - Player object with x, y, and radius properties
     */
    update(delta, player) {
        // Skip movement updates if dying
        if (this.dying) {
            this.deathTimer += delta;
            return;
        }
        
        // Update flash timer for hit effect
        if (this.flashTimer > 0) {
            this.flashTimer -= delta;
        }
        
        // Find direction vector towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move towards player using normalized direction vector
        if (distance > 0) {
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;
            
            // Convert speed from pixels per second to pixels per frame
            const actualSpeed = this.speed * this.slowFactor * (delta / 1000);
            this.x += normalizedDx * actualSpeed;
            this.y += normalizedDy * actualSpeed;
        }
        
        // Reset slow factor each frame (reapplied by slow towers if in range)
        this.slowFactor = 1;
        
        // Check collision with player (circular collision detection)
        if (distance <= this.radius + player.radius) {
            // Mark for removal - collision damage handled by Game class
            this.health = 0;
        }
    }
    
    /**
     * Applies damage to the enemy and triggers visual feedback.
     * @param {number} amount - Amount of damage to deal
     */
    takeDamage(amount) {
        this.health -= amount;
        
        // Trigger white flash effect when hit
        this.flashTimer = 100; // Flash duration in milliseconds
        
        // Start death animation if health depleted
        if (this.health <= 0) {
            this.dying = true;
            this.deathTimer = 0;
        }
    }
    
    /**
     * Renders the enemy with glow effects, health bar, and status indicators.
     * @param {CanvasRenderingContext2D} ctx - 2D rendering context
     */
    draw(ctx) {
        // Calculate visual intensity based on current health
        const healthPercent = this.health / this.maxHealth;
        const intensity = 0.5 + (healthPercent * 0.5);
        
        // Flash effect when hit
        let drawColor = this.color;
        if (this.flashTimer > 0) {
            drawColor = '#fff';
        }
        
        // Set glow effect
        ctx.save();
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10 * intensity;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw enemy body
        if (this.dying) {
            // Death animation - scale down and fade
            const deathProgress = Math.min(this.deathTimer / 200, 1);
            const scale = 1 - deathProgress;
            const alpha = 1 - deathProgress;
            
            ctx.globalAlpha = alpha;
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
            ctx.translate(-this.x, -this.y);
        }
        
        // Draw main body (hexagon for variety)
        ctx.fillStyle = drawColor;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        const sides = 6;
        for (let i = 0; i < sides; i++) {
            const angle = (Math.PI * 2 / sides) * i;
            const x = this.x + Math.cos(angle) * this.radius;
            const y = this.y + Math.sin(angle) * this.radius;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw health indicator
        if (healthPercent < 1 && !this.dying) {
            const barWidth = this.radius * 2;
            const barHeight = 4;
            const barY = this.y - this.radius - 10;
            
            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
            
            // Health bar
            ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : '#f80';
            ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        }
        
        // Draw slow effect if slowed
        if (this.slowFactor < 1 && !this.dying) {
            ctx.strokeStyle = '#8f00ff';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
    
    /**
     * Creates a standard enemy with balanced stats.
     * @param {number} x - Spawn X coordinate
     * @param {number} y - Spawn Y coordinate
     * @param {number} waveScale - Difficulty scaling factor (default: 1)
     * @returns {Enemy} New basic enemy instance
     */
    static createBasicEnemy(x, y, waveScale = 1) {
        const baseHealth = 50;
        const baseSpeed = 50; // pixels per second
        const baseDamage = 10;
        
        return new Enemy(
            x, y,
            baseSpeed * waveScale,
            baseHealth * waveScale,
            baseDamage * waveScale
        );
    }
    
    /**
     * Creates a fast, low-health enemy that moves quickly.
     * @param {number} x - Spawn X coordinate
     * @param {number} y - Spawn Y coordinate
     * @param {number} waveScale - Difficulty scaling factor (default: 1)
     * @returns {Enemy} New fast enemy instance with magenta coloring
     */
    static createFastEnemy(x, y, waveScale = 1) {
        const baseHealth = 25; // Lower health
        const baseSpeed = 100; // Higher speed
        const baseDamage = 15;
        
        const enemy = new Enemy(
            x, y,
            baseSpeed * waveScale,
            baseHealth * waveScale,
            baseDamage * waveScale
        );
        
        // Visual differentiation
        enemy.color = '#f0f'; // Magenta
        enemy.glowColor = '#f0f';
        enemy.radius = 12; // Smaller collision radius
        
        return enemy;
    }
    
    /**
     * Creates a slow, high-health tank enemy.
     * @param {number} x - Spawn X coordinate
     * @param {number} y - Spawn Y coordinate
     * @param {number} waveScale - Difficulty scaling factor (default: 1)
     * @returns {Enemy} New tank enemy instance with yellow coloring
     */
    static createTankEnemy(x, y, waveScale = 1) {
        const baseHealth = 150; // Much higher health
        const baseSpeed = 25; // Lower speed
        const baseDamage = 25; // Higher damage
        
        const enemy = new Enemy(
            x, y,
            baseSpeed * waveScale,
            baseHealth * waveScale,
            baseDamage * waveScale
        );
        
        // Visual differentiation
        enemy.color = '#ff0'; // Yellow
        enemy.glowColor = '#ff0';
        enemy.radius = 25; // Larger collision radius
        
        return enemy;
    }
}
