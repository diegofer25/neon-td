import { Projectile } from './Projectile.js';
import { Particle } from './Particle.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.angle = 0;
        
        // Health
        this.maxHp = 100;
        this.hp = this.maxHp;
        
        // Firing
        this.fireCooldown = 0;
        this.baseFireRate = 300; // milliseconds between shots
        
        // Power-up modifiers
        this.damageMod = 1;
        this.fireRateMod = 1;
        this.projectileSpeedMod = 1;
        
        // Special abilities
        this.hasPiercing = false;
        this.hasTripleShot = false;
        this.hasLifeSteal = false;
        this.hasSlowField = false;
        this.hasShield = false;
        this.shieldHp = 0;
        this.maxShieldHp = 0;
        
        // Slow field properties (stackable)
        this.slowFieldRadius = 80; // Base radius
        this.slowFieldStrength = 0; // 0 = no slow, higher values = more slow
        this.maxSlowFieldStacks = 6; // Maximum number of slow field stacks
        
        // Regeneration
        this.hpRegen = 0; // HP per second
        this.shieldRegen = 0; // Shield per second
        
        // Area effects
        this.explosiveShots = false;
        this.explosionRadius = 50;
        this.explosionDamage = 20;
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
        this.slowFieldRadius = 80;
        this.slowFieldStrength = 0;
        this.maxSlowFieldStacks = 6;
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
    
    findNearestEnemy(enemies) {
        if (enemies.length === 0) return null;
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        enemies.forEach(enemy => {
            if (enemy.dying) return; // Skip dying enemies
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Prioritize closer enemies and those with lower health for faster clearing
            const priority = distance - (enemy.maxHealth - enemy.health) * 0.1;
            
            if (priority < nearestDistance) {
                nearestDistance = priority;
                nearestEnemy = enemy;
            }
        });
        
        return nearestEnemy;
    }
    
    fireProjectile(game) {
        const damage = 10 * this.damageMod;
        
        if (this.hasTripleShot) {
            // Fire three projectiles in a spread
            const spreadAngle = 0.3; // radians
            for (let i = -1; i <= 1; i++) {
                const angle = this.angle + (i * spreadAngle);
                const projectile = new Projectile(
                    this.x, this.y, angle, damage, this.projectileSpeedMod
                );
                
                if (this.hasPiercing) {
                    projectile.piercing = true;
                    projectile.piercingCount = 2;
                    console.log('Created piercing projectile in triple shot');
                }
                
                if (this.explosiveShots) {
                    projectile.explosive = true;
                    projectile.explosionRadius = this.explosionRadius;
                    projectile.explosionDamage = this.explosionDamage;
                }
                
                game.projectiles.push(projectile);
            }
        } else {
            // Fire single projectile
            const projectile = new Projectile(
                this.x, this.y, this.angle, damage, this.projectileSpeedMod
            );
            
            if (this.hasPiercing) {
                projectile.piercing = true;
                projectile.piercingCount = 2;
                console.log('Created piercing projectile in single shot');
            }
            
            if (this.explosiveShots) {
                projectile.explosive = true;
                projectile.explosionRadius = this.explosionRadius;
                projectile.explosionDamage = this.explosionDamage;
            }
            
            game.projectiles.push(projectile);
        }
        
        // Create muzzle flash effect
        this.createMuzzleFlash(game);
        
        // Play shoot sound
        if (window.playSFX) window.playSFX('shoot');
    }
    
    createMuzzleFlash(game) {
        // Create small particles at the gun tip
        const flashDistance = this.radius + 10;
        const flashX = this.x + Math.cos(this.angle) * flashDistance;
        const flashY = this.y + Math.sin(this.angle) * flashDistance;
        
        for (let i = 0; i < 3; i++) {
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
    
    getFireInterval() {
        return this.baseFireRate / this.fireRateMod;
    }
    
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
    
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        
        if (window.createFloatingText) {
            const rect = document.getElementById('gameCanvas').getBoundingClientRect();
            window.createFloatingText(
                `+${Math.floor(amount)}`,
                this.x * (rect.width / 800) + rect.left,
                this.y * (rect.height / 600) + rect.top,
                'heal'
            );
        }
    }
    
    healShield(amount) {
        if (!this.hasShield) return;
        this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + amount);
    }
    
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
    
    // Life steal on enemy kill
    onEnemyKill(enemy) {
        if (this.hasLifeSteal) {
            const healAmount = enemy.maxHealth * 0.1; // Heal 10% of enemy's max health
            this.heal(healAmount);
        }
    }
    
    // Get a list of non-stackable power-ups the player currently has
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
    
    // Check if slow field is at maximum stacks
    isSlowFieldMaxed() {
        return this.slowFieldStrength >= this.maxSlowFieldStacks;
    }

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
