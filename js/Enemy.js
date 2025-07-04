export class Enemy {
    constructor(x, y, speed, health, damage) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.radius = 15;
        
        // Visual properties
        this.color = '#0ff';
        this.glowColor = '#0ff';
        this.flashTimer = 0;
        
        // Status effects
        this.slowFactor = 1;
        
        // Death animation
        this.dying = false;
        this.deathTimer = 0;
    }
    
    update(delta, player) {
        if (this.dying) {
            this.deathTimer += delta;
            return;
        }
        
        // Update flash timer
        if (this.flashTimer > 0) {
            this.flashTimer -= delta;
        }
        
        // Find direction vector towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move towards player
        if (distance > 0) {
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;
            
            // Convert speed from pixels per second to pixels per frame
            const actualSpeed = this.speed * this.slowFactor * (delta / 1000);
            this.x += normalizedDx * actualSpeed;
            this.y += normalizedDy * actualSpeed;
        }
        
        // Reset slow factor (will be reapplied by slow field if in range)
        this.slowFactor = 1;
        
        // Check collision with player
        if (distance <= this.radius + player.radius) {
            // This collision will be handled by the Game class
            // Mark for removal by setting health to 0
            this.health = 0;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        
        // Flash effect when hit
        this.flashTimer = 100; // Flash for 100ms
        
        if (this.health <= 0) {
            this.dying = true;
            this.deathTimer = 0;
        }
    }
    
    draw(ctx) {
        // Health-based color intensity
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
    
    // Get the enemy type for variety (can be extended later)
    static createBasicEnemy(x, y, waveScale = 1) {
        const baseHealth = 50;
        const baseSpeed = 50;
        const baseDamage = 10;
        
        return new Enemy(
            x, y,
            baseSpeed * waveScale,
            baseHealth * waveScale,
            baseDamage * waveScale
        );
    }
    
    static createFastEnemy(x, y, waveScale = 1) {
        const baseHealth = 25;
        const baseSpeed = 100;
        const baseDamage = 15;
        
        const enemy = new Enemy(
            x, y,
            baseSpeed * waveScale,
            baseHealth * waveScale,
            baseDamage * waveScale
        );
        
        enemy.color = '#f0f';
        enemy.glowColor = '#f0f';
        enemy.radius = 12; // Smaller but faster
        
        return enemy;
    }
    
    static createTankEnemy(x, y, waveScale = 1) {
        const baseHealth = 150;
        const baseSpeed = 25;
        const baseDamage = 25;
        
        const enemy = new Enemy(
            x, y,
            baseSpeed * waveScale,
            baseHealth * waveScale,
            baseDamage * waveScale
        );
        
        enemy.color = '#ff0';
        enemy.glowColor = '#ff0';
        enemy.radius = 25; // Larger and tankier
        
        return enemy;
    }
}
