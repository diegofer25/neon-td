export class Projectile {
    constructor(x, y, angle, damage, speedMod = 1) {
        this.x = x;
        this.y = y;
        this.radius = 3;
        this.damage = damage;
        this.angle = angle;
        
        // Movement
        this.baseSpeed = 400;
        this.speed = this.baseSpeed * speedMod;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        
        // Special properties
        this.piercing = false;
        this.piercingCount = 0;
        this.explosive = false;
        this.explosionRadius = 50;
        this.explosionDamage = 20;
        
        // Visual properties
        this.color = '#fff';
        this.glowColor = '#fff';
        this.trail = [];
        this.trailLength = 8;
        
        // Lifetime
        this.maxLifetime = 3000; // 3 seconds
        this.lifetime = 0;
        
        // Mark for removal
        this._destroy = false;
    }
    
    update(delta) {
        // Update position (convert from pixels per second to pixels per frame)
        this.x += this.vx * (delta / 1000);
        this.y += this.vy * (delta / 1000);
        
        // Update lifetime
        this.lifetime += delta;
        if (this.lifetime > this.maxLifetime) {
            this._destroy = true;
        }
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) {
            this.trail.shift();
        }
    }
    
    isOffScreen(canvas) {
        const margin = 50;
        return (
            this.x < -margin ||
            this.x > canvas.width + margin ||
            this.y < -margin ||
            this.y > canvas.height + margin
        );
    }
    
    explode(game) {
        if (!this.explosive) return;
        
        // Create explosion particles
        game.createExplosion(this.x, this.y, 12);
        
        // Damage nearby enemies
        game.enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.explosionRadius) {
                const damage = this.explosionDamage * (1 - distance / this.explosionRadius);
                enemy.takeDamage(Math.floor(damage));
                
                // Show explosion damage text
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
        
        // Screen shake for explosions
        game.addScreenShake(5, 200);
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw trail
        if (this.trail.length > 1) {
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3;
            
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const point = this.trail[i];
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
        
        // Set glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1;
        
        // Draw projectile body
        if (this.piercing) {
            // Piercing bullets are diamond-shaped
            ctx.fillStyle = '#0ff';
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            
            ctx.beginPath();
            ctx.moveTo(this.radius * 2, 0);
            ctx.lineTo(0, -this.radius);
            ctx.lineTo(-this.radius, 0);
            ctx.lineTo(0, this.radius);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        } else if (this.explosive) {
            // Explosive bullets are larger and orange
            ctx.fillStyle = '#f80';
            this.glowColor = '#f80';
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw inner core
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Standard bullets are simple circles
            ctx.fillStyle = this.color;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // Static factory methods for different projectile types
    static createStandard(x, y, angle, damage, speedMod = 1) {
        return new Projectile(x, y, angle, damage, speedMod);
    }
    
    static createPiercing(x, y, angle, damage, speedMod = 1) {
        const projectile = new Projectile(x, y, angle, damage, speedMod);
        projectile.piercing = true;
        projectile.piercingCount = 2;
        projectile.color = '#0ff';
        projectile.glowColor = '#0ff';
        return projectile;
    }
    
    static createExplosive(x, y, angle, damage, speedMod = 1) {
        const projectile = new Projectile(x, y, angle, damage, speedMod);
        projectile.explosive = true;
        projectile.explosionRadius = 50;
        projectile.explosionDamage = damage * 0.5;
        projectile.color = '#f80';
        projectile.glowColor = '#f80';
        return projectile;
    }
}
