/* eslint-disable no-case-declarations */
import { GameConfig } from "./config/GameConfig.js";

/**
 * Base Boss class with common functionality for all boss types.
 * Bosses are powerful enemies that appear every 5 waves with unique abilities.
 */
export class Boss {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.isBoss = true;
        
        // Get boss configuration
        const config = GameConfig.BOSS.TYPES[type];
        if (!config) throw new Error(`Unknown boss type: ${type}`);
        
        // Base stats
        this.health = config.health;
        this.maxHealth = config.health;
        this.speed = config.speed;
        this.damage = config.damage;
        this.radius = config.radius;
        
        // Visual properties
        this.color = config.color;
        this.glowColor = config.glowColor;
        this.flashTimer = 0;
        
        // Boss-specific properties
        this.attackCooldown = 0;
        this.attackInterval = config.attackInterval;
        this.phase = 1;
        this.dying = false;
        this.deathTimer = 0;
        
        // Movement pattern
        this.movePattern = config.movePattern;
        this.moveTimer = 0;
        this.targetX = x;
        this.targetY = y;
        
        // Initialize type-specific properties
        this.initializeSpecific();
    }
    
    /**
     * Initialize boss-specific properties based on type
     */
    initializeSpecific() {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.orbitRadius = 120; // Smaller orbit radius to stay more visible
                this.orbitSpeed = 0.01; // Slower movement
                this.orbitAngle = 0;
                this.orbitals = [];
                break;
                
            case 'PULSE_TITAN':
                this.pulseChargeTime = 0;
                this.isPulsing = false;
                this.pulseRadius = 0;
                break;
                
            case 'VOID_HUNTER':
                this.teleportCooldown = 0;
                this.isCharging = false;
                this.chargeTarget = null;
                this.dashSpeed = 200; // Reduced dash speed
                break;
                
            case 'STORM_BRINGER':
                this.lightningTargets = [];
                this.stormIntensity = 1;
                break;
                
            case 'CRYSTAL_OVERLORD':
                this.crystalShards = [];
                this.isSpinning = false;
                this.spinSpeed = 0;
                break;
        }
    }
    
    /**
     * Update boss behavior, abilities, and movement
     */
    update(delta, player, game) {
        if (this.dying) {
            this.deathTimer += delta;
            return;
        }
        
        // Update timers
        this.flashTimer = Math.max(0, this.flashTimer - delta);
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
        this.moveTimer += delta;
        
        // Update movement
        this.updateMovement(delta, player, game);
        
        // Update boss-specific behavior
        this.updateSpecific(delta, player, game);
        
        // Trigger attacks
        if (this.attackCooldown <= 0) {
            this.attack(player, game);
            this.attackCooldown = this.attackInterval;
        }
        
        // Phase transitions
        this.checkPhaseTransition();
    }
    
    /**
     * Update movement based on movement pattern
     */
    updateMovement(delta, player, game) {
        const centerX = game.canvas.width / 2;
        const centerY = game.canvas.height / 2;
        
        switch (this.movePattern) {
            case 'ORBITAL':
                // Stay closer to center with smaller orbit
                this.orbitAngle += this.orbitSpeed * delta;
                this.targetX = centerX + Math.cos(this.orbitAngle) * Math.min(this.orbitRadius, 100);
                this.targetY = centerY + Math.sin(this.orbitAngle) * Math.min(this.orbitRadius, 80);
                break;
                
            case 'HUNTER': {
                // Move toward player but maintain distance
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 150) { // Increased minimum distance
                    this.targetX = player.x;
                    this.targetY = player.y;
                } else {
                    // Circle around player at safer distance
                    const angle = Math.atan2(dy, dx) + Math.PI / 2;
                    this.targetX = player.x + Math.cos(angle) * 150;
                    this.targetY = player.y + Math.sin(angle) * 150;
                }
                break;
            }
                
            case 'STATIONARY':
                // Stay in center
                this.targetX = centerX;
                this.targetY = centerY;
                break;
                
            case 'AGGRESSIVE':
                // Move toward player but not too close
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 100) {
                    this.targetX = player.x;
                    this.targetY = player.y;
                } else {
                    // Maintain distance
                    this.targetX = this.x;
                    this.targetY = this.y;
                }
                break;
        }
        
        // Move toward target
        const toTargetX = this.targetX - this.x;
        const toTargetY = this.targetY - this.y;
        const toTargetDist = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
        
        if (toTargetDist > 5) {
            const moveSpeed = this.speed * (delta / 1000);
            this.x += (toTargetX / toTargetDist) * moveSpeed;
            this.y += (toTargetY / toTargetDist) * moveSpeed;
        }
        
        // Keep boss within canvas bounds with margin
        this.x = Math.max(this.radius + 20, Math.min(game.canvas.width - this.radius - 20, this.x));
        this.y = Math.max(this.radius + 20, Math.min(game.canvas.height - this.radius - 20, this.y));
    }
    
    /**
     * Update boss-specific behavior
     */
    updateSpecific(delta, player, game) {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.updateOrbitals(delta, game);
                break;
                
            case 'PULSE_TITAN':
                this.updatePulse(delta, game);
                break;
                
            case 'VOID_HUNTER':
                this.updateVoidHunter(delta, player, game);
                break;
                
            case 'STORM_BRINGER':
                this.updateStorm(delta, player, game);
                break;
                
            case 'CRYSTAL_OVERLORD':
                this.updateCrystal(delta, game);
                break;
        }
    }
    
    /**
     * Execute boss attack
     */
    attack(player, game) {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.attackOrbital(player, game);
                break;
                
            case 'PULSE_TITAN':
                this.attackPulse(player, game);
                break;
                
            case 'VOID_HUNTER':
                this.attackVoidHunter(player, game);
                break;
                
            case 'STORM_BRINGER':
                this.attackStorm(player, game);
                break;
                
            case 'CRYSTAL_OVERLORD':
                this.attackCrystal(player, game);
                break;
        }
    }
    
    // Boss-specific update methods
    updateOrbitals(delta) {
        // Update orbital positions
        this.orbitals.forEach((orbital) => {
            orbital.angle += orbital.speed * delta;
            orbital.x = this.x + Math.cos(orbital.angle) * orbital.radius;
            orbital.y = this.y + Math.sin(orbital.angle) * orbital.radius;
        });
    }
    
    updatePulse(delta) {
        if (this.isPulsing) {
            this.pulseRadius += 200 * delta / 1000;
            if (this.pulseRadius > 200) {
                this.isPulsing = false;
                this.pulseRadius = 0;
            }
        }
    }
    
    updateVoidHunter(delta) {
        this.teleportCooldown = Math.max(0, this.teleportCooldown - delta);
        
        if (this.isCharging && this.chargeTarget) {
            // Dash toward target
            const dx = this.chargeTarget.x - this.x;
            const dy = this.chargeTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 10) {
                const moveSpeed = this.dashSpeed * (delta / 1000);
                this.x += (dx / distance) * moveSpeed;
                this.y += (dy / distance) * moveSpeed;
            } else {
                this.isCharging = false;
                this.chargeTarget = null;
            }
        }
    }
    
    updateStorm(delta) {
        // Update lightning targets
        this.lightningTargets = this.lightningTargets.filter(target => target.life > 0);
        this.lightningTargets.forEach(target => {
            target.life -= delta;
        });
    }
    
    updateCrystal(delta) {
        if (this.isSpinning) {
            this.spinSpeed += delta * 0.001;
            this.crystalShards.forEach((shard) => {
                shard.angle += this.spinSpeed;
                shard.x = this.x + Math.cos(shard.angle) * shard.radius;
                shard.y = this.y + Math.sin(shard.angle) * shard.radius;
            });
        }
    }
    
    // Boss-specific attack methods
    attackOrbital(player, game) {
        // Spawn orbital projectiles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const projectile = this.createBossProjectile(
                this.x, this.y, angle, 150, 15, '#0ff'
            );
            game.bossProjectiles.push(projectile);
        }
        
        // Create new orbital if fewer than 3
        if (this.orbitals.length < 3) {
            this.orbitals.push({
                x: this.x,
                y: this.y,
                angle: Math.random() * Math.PI * 2,
                radius: 60 + this.orbitals.length * 20,
                speed: 0.03,
                health: 30
            });
        }
    }
    
    attackPulse(player, game) {
        this.isPulsing = true;
        this.pulseRadius = 0;
        
        // Screen shake
        game.addScreenShake(8, 500);
        
        // Damage pulse - will be handled in collision system
        setTimeout(() => {
            if (this.isPulsing) {
                // Create visual effect
                game.createExplosionRing(this.x, this.y, 200);
            }
        }, 1000);
    }
    
    attackVoidHunter(player, game) {
        if (this.teleportCooldown <= 0) {
            // Teleport behind player
            const angle = Math.random() * Math.PI * 2;
            const distance = 100;
            this.x = player.x + Math.cos(angle) * distance;
            this.y = player.y + Math.sin(angle) * distance;
            
            // Clamp to canvas bounds
            this.x = Math.max(50, Math.min(game.canvas.width - 50, this.x));
            this.y = Math.max(50, Math.min(game.canvas.height - 50, this.y));
            
            this.teleportCooldown = 3000;
            
            // Charge attack
            this.isCharging = true;
            this.chargeTarget = { x: player.x, y: player.y };
        } else {
            // Regular projectile attack
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            const projectile = this.createBossProjectile(
                this.x, this.y, angle, 200, 20, '#a0f'
            );
            game.bossProjectiles.push(projectile);
        }
    }
    
    attackStorm(player) {
        // Chain lightning
        const lightningCount = 3 + this.phase;
        for (let i = 0; i < lightningCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            const target = {
                x: player.x + Math.cos(angle) * distance,
                y: player.y + Math.sin(angle) * distance,
                life: 2000,
                damage: 25
            };
            this.lightningTargets.push(target);
        }
    }
    
    attackCrystal(player, game) {
        if (!this.isSpinning) {
            // Create crystal shards
            this.crystalShards = [];
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i;
                this.crystalShards.push({
                    x: this.x,
                    y: this.y,
                    angle: angle,
                    radius: 40,
                    damage: 30
                });
            }
            this.isSpinning = true;
            this.spinSpeed = 0.02;
        } else {
            // Launch shards
            this.crystalShards.forEach(shard => {
                const angle = Math.atan2(player.y - shard.y, player.x - shard.x);
                const projectile = this.createBossProjectile(
                    shard.x, shard.y, angle, 180, 25, '#ff0'
                );
                game.bossProjectiles.push(projectile);
            });
            this.crystalShards = [];
            this.isSpinning = false;
        }
    }
    
    /**
     * Create a boss projectile
     */
    createBossProjectile(x, y, angle, speed, damage, color) {
        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: damage,
            radius: 8,
            color: color,
            life: 5000,
            isBossProjectile: true
        };
    }
    
    /**
     * Check for phase transitions based on health
     */
    checkPhaseTransition() {
        const healthPercent = this.health / this.maxHealth;
        const newPhase = healthPercent > 0.66 ? 1 : healthPercent > 0.33 ? 2 : 3;
        
        if (newPhase !== this.phase) {
            this.phase = newPhase;
            this.onPhaseChange();
        }
    }
    
    /**
     * Handle phase change effects
     */
    onPhaseChange() {
        // Increase attack speed
        this.attackInterval *= 0.8;
        
        // Type-specific phase changes
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.orbitSpeed *= 1.5;
                break;
            case 'STORM_BRINGER':
                this.stormIntensity = this.phase;
                break;
        }
    }
    
    /**
     * Take damage and handle death
     */
    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 100;
        
        if (this.health <= 0) {
            this.dying = true;
            this.deathTimer = 0;
        }
    }
    
    /**
     * Draw the boss with all visual effects
     */
    draw(ctx) {
        const healthPercent = this.health / this.maxHealth;
        const intensity = 0.5 + (healthPercent * 0.5);
        
        // Flash effect when hit
        let drawColor = this.color;
        if (this.flashTimer > 0) {
            drawColor = '#fff';
        }
        
        ctx.save();
        
        // Death animation
        if (this.dying) {
            const deathProgress = Math.min(this.deathTimer / 1000, 1);
            const scale = 1 - deathProgress;
            const alpha = 1 - deathProgress;
            
            ctx.globalAlpha = alpha;
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
            ctx.translate(-this.x, -this.y);
        }
        
        // Glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 20 * intensity;
        
        // Draw boss-specific visuals
        this.drawSpecific(ctx, drawColor);
        
        // Draw health bar
        if (!this.dying) {
            this.drawHealthBar(ctx);
        }
        
        // Draw boss-specific effects
        this.drawEffects(ctx);
        
        ctx.restore();
    }
    
    /**
     * Draw boss-specific visual elements
     */
    drawSpecific(ctx, color) {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.drawOrbitalCommander(ctx, color);
                break;
            case 'PULSE_TITAN':
                this.drawPulseTitan(ctx, color);
                break;
            case 'VOID_HUNTER':
                this.drawVoidHunter(ctx, color);
                break;
            case 'STORM_BRINGER':
                this.drawStormBringer(ctx, color);
                break;
            case 'CRYSTAL_OVERLORD':
                this.drawCrystalOverlord(ctx, color);
                break;
        }
    }
    
    drawOrbitalCommander(ctx, color) {
        // Main body - octagon
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const x = this.x + Math.cos(angle) * this.radius;
            const y = this.y + Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw orbitals
        this.orbitals.forEach(orbital => {
            ctx.fillStyle = '#0ff';
            ctx.beginPath();
            ctx.arc(orbital.x, orbital.y, 10, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawPulseTitan(ctx, color) {
        // Main body - large circle
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Pulse effect
        if (this.isPulsing) {
            ctx.strokeStyle = '#f80';
            ctx.lineWidth = 6;
            ctx.globalAlpha = 1 - (this.pulseRadius / 200);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawVoidHunter(ctx, color) {
        // Main body - diamond shape
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.radius);
        ctx.lineTo(this.x + this.radius, this.y);
        ctx.lineTo(this.x, this.y + this.radius);
        ctx.lineTo(this.x - this.radius, this.y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Charging effect
        if (this.isCharging) {
            ctx.strokeStyle = '#f0f';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawStormBringer(ctx, color) {
        // Main body - star shape
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 / 10) * i;
            const radius = i % 2 === 0 ? this.radius : this.radius * 0.5;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
    
    drawCrystalOverlord(ctx, color) {
        // Main body - hexagon
        ctx.fillStyle = color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const x = this.x + Math.cos(angle) * this.radius;
            const y = this.y + Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw crystal shards
        this.crystalShards.forEach(shard => {
            ctx.fillStyle = '#ff0';
            ctx.beginPath();
            ctx.arc(shard.x, shard.y, 6, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawHealthBar(ctx) {
        const barWidth = this.radius * 3;
        const barHeight = 8;
        const barY = this.y - this.radius - 20;
        const healthPercent = this.health / this.maxHealth;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Health bar
        ctx.fillStyle = healthPercent > 0.5 ? '#0f0' : healthPercent > 0.25 ? '#f80' : '#f00';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
    }
    
    drawEffects(ctx) {
        // Draw lightning targets for Storm Bringer
        if (this.type === 'STORM_BRINGER') {
            this.lightningTargets.forEach(target => {
                const alpha = target.life / 2000;
                ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(target.x, target.y);
                ctx.stroke();
                
                // Lightning bolt effect
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.beginPath();
                ctx.arc(target.x, target.y, 15, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }
    
    /**
     * Factory method to create bosses based on wave number
     */
    static createBossForWave(wave, canvasWidth, canvasHeight) {
        const bossWave = Math.floor((wave - 1) / 5) + 1;
        const bossTypes = Object.keys(GameConfig.BOSS.TYPES);
        const bossType = bossTypes[(bossWave - 1) % bossTypes.length];
        
        // Spawn at center
        const x = canvasWidth / 2;
        const y = canvasHeight / 2;
        
        const boss = new Boss(x, y, bossType);
        
        // Apply wave scaling but cap damage for early boss waves
        const scaling = GameConfig.DERIVED.getScalingForWave(wave);
        boss.health *= scaling.health * 1.5; // Reduced health scaling multiplier
        boss.maxHealth = boss.health;
        
        // Cap damage for first boss wave to prevent instant kills
        if (wave === 5) {
            boss.damage = Math.min(boss.damage * scaling.damage, 20); // Cap at 20 damage for wave 5
        } else {
            boss.damage *= scaling.damage;
        }
        
        console.log(`Created ${bossType} boss for wave ${wave}: HP=${boss.health}, Damage=${boss.damage}`);
        
        return boss;
    }
}
