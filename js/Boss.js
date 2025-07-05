/* eslint-disable no-case-declarations */
import { GameConfig } from "./config/GameConfig.js";
import { playSFX } from "./main.js";

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
        
        // Enhanced visibility and positioning
        this.combatRadius = 150; // Maximum distance from center for combat positioning
        this.minDistanceFromEdge = 80; // Minimum distance from screen edges
        this.isVisible = true;
        this.visibilityTimer = 0;
        
        // Enhanced visual feedback
        this.hitEffectTimer = 0;
        this.scaleEffect = 1.0;
        this.rotationEffect = 0;
        
        // Force initial positioning to center-ish area
        this.constrainToVisibleArea(x, y);
        
        // Initialize type-specific properties
        this.initializeSpecific();
    }
    
    /**
     * Constrain boss position to always remain visible
     */
    constrainToVisibleArea(canvasWidth, canvasHeight) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const maxRadius = Math.min(canvasWidth, canvasHeight) / 4; // Stay in center quarter
        
        // If too far from center, move toward center
        const dx = this.x - centerX;
        const dy = this.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > maxRadius) {
            const angle = Math.atan2(dy, dx);
            this.x = centerX + Math.cos(angle) * maxRadius;
            this.y = centerY + Math.sin(angle) * maxRadius;
        }
        
        // Ensure minimum distance from edges
        this.x = Math.max(this.minDistanceFromEdge, Math.min(canvasWidth - this.minDistanceFromEdge, this.x));
        this.y = Math.max(this.minDistanceFromEdge, Math.min(canvasHeight - this.minDistanceFromEdge, this.y));
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
            // Extended death animation for bosses (2 seconds for better visibility)
            if (this.deathTimer >= 2000) {
                this.health = -1; // Force negative health to trigger removal
            }
            return;
        }
        
        // Update timers
        this.flashTimer = Math.max(0, this.flashTimer - delta);
        this.hitEffectTimer = Math.max(0, this.hitEffectTimer - delta);
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
        this.moveTimer += delta;
        this.visibilityTimer += delta;
        
        // Update movement with enhanced constraints
        this.updateMovement(delta, player, game);
        
        // Ensure boss stays visible - use logical canvas dimensions
        const logicalWidth = parseInt(game.canvas.style.width) || game.canvas.width;
        const logicalHeight = parseInt(game.canvas.style.height) || game.canvas.height;
        this.constrainToVisibleArea(logicalWidth, logicalHeight);
        
        // Update boss-specific behavior
        this.updateSpecific(delta);
        
        // Trigger attacks
        if (this.attackCooldown <= 0) {
            this.attack(player, game);
            this.attackCooldown = this.attackInterval;
        }
        
        // Phase transitions
        this.checkPhaseTransition();
        
        // Update visual effects
        this.updateVisualEffects(delta);
    }
    
    /**
     * Update visual effects for better feedback
     */
    updateVisualEffects(delta) {
        // Scale effect when hit
        if (this.hitEffectTimer > 0) {
            this.scaleEffect = 1.0 + 0.2 * (this.hitEffectTimer / 200);
        } else {
            this.scaleEffect = 1.0;
        }
        
        // Gentle rotation for visual interest
        this.rotationEffect += delta * 0.001;
    }
    
    /**
     * Update movement based on movement pattern with enhanced visibility constraints
     */
    updateMovement(delta, player, game) {
        // Get logical canvas dimensions (not scaled by device pixel ratio)
        const logicalWidth = parseInt(game.canvas.style.width) || game.canvas.width;
        const logicalHeight = parseInt(game.canvas.style.height) || game.canvas.height;
        
        const centerX = logicalWidth / 2;
        const centerY = logicalHeight / 2;
        const maxCombatRadius = Math.min(logicalWidth, logicalHeight) / 3;
        
        switch (this.movePattern) {
            case 'ORBITAL':
                // Tighter orbit around center
                this.orbitAngle += this.orbitSpeed * delta;
                this.targetX = centerX + Math.cos(this.orbitAngle) * Math.min(60, maxCombatRadius * 0.4);
                this.targetY = centerY + Math.sin(this.orbitAngle) * Math.min(45, maxCombatRadius * 0.3);
                break;
                
            case 'HUNTER': {
                // More aggressive movement toward player but stay visible
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 90) {
                    // Move toward player but bias toward center
                    const toCenterX = centerX - this.x;
                    const toCenterY = centerY - this.y;
                    
                    this.targetX = player.x + toCenterX * 0.3;
                    this.targetY = player.y + toCenterY * 0.3;
                } else {
                    // Circle around player
                    const angle = Math.atan2(dy, dx) + Math.PI / 3;
                    this.targetX = player.x + Math.cos(angle) * 90;
                    this.targetY = player.y + Math.sin(angle) * 90;
                }
                break;
            }
                
            case 'STATIONARY':
                // Stay near center with slight movement
                this.targetX = centerX + Math.sin(this.moveTimer * 0.001) * 30;
                this.targetY = centerY + Math.cos(this.moveTimer * 0.0008) * 20;
                break;
                
            case 'AGGRESSIVE':
                // Move toward player but maintain distance and stay visible
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 100) {
                    this.targetX = player.x * 0.7 + centerX * 0.3;
                    this.targetY = player.y * 0.7 + centerY * 0.3;
                } else {
                    // Maintain distance but stay in combat area
                    this.targetX = centerX + (this.x - centerX) * 0.8;
                    this.targetY = centerY + (this.y - centerY) * 0.8;
                }
                break;
        }
        
        // Constrain target to visible combat area
        const maxTargetRadius = maxCombatRadius * 0.8;
        const targetDx = this.targetX - centerX;
        const targetDy = this.targetY - centerY;
        const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
        
        if (targetDistance > maxTargetRadius) {
            const angle = Math.atan2(targetDy, targetDx);
            this.targetX = centerX + Math.cos(angle) * maxTargetRadius;
            this.targetY = centerY + Math.sin(angle) * maxTargetRadius;
        }
        
        // Move toward target with smoother movement
        const toTargetX = this.targetX - this.x;
        const toTargetY = this.targetY - this.y;
        const toTargetDist = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);
        
        if (toTargetDist > 3) {
            const moveSpeed = this.speed * (delta / 1000) * 0.8; // Slightly slower for better tracking
            this.x += (toTargetX / toTargetDist) * moveSpeed;
            this.y += (toTargetY / toTargetDist) * moveSpeed;
        }
    }
    
    /**
     * Update boss-specific behavior
     * 
     * @param {number} delta - Time since last update in milliseconds
     */
    updateSpecific(delta) {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.updateOrbitals(delta);
                break;
                
            case 'PULSE_TITAN':
                this.updatePulse(delta);
                break;
                
            case 'VOID_HUNTER':
                this.updateVoidHunter(delta);
                break;
                
            case 'STORM_BRINGER':
                this.updateStorm(delta);
                break;
                
            case 'CRYSTAL_OVERLORD':
                this.updateCrystal(delta);
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
                this.attackStorm(player);
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
            
            // Clamp to canvas bounds - use logical dimensions
            const logicalWidth = parseInt(game.canvas.style.width) || game.canvas.width;
            const logicalHeight = parseInt(game.canvas.style.height) || game.canvas.height;
            this.x = Math.max(50, Math.min(logicalWidth - 50, this.x));
            this.y = Math.max(50, Math.min(logicalHeight - 50, this.y));
            
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
     * Take damage and handle death with enhanced visual feedback
     */
    takeDamage(amount) {
        this.health -= amount;
        this.flashTimer = 150; // Longer flash for better visibility
        this.hitEffectTimer = 200; // Hit effect timer
        
        if (this.health <= 0) {
            this.dying = true;
            this.deathTimer = 0;
            
            // Enhanced death visual feedback
            playSFX('boss_death')
        }
    }
    
    /**
     * Draw the boss with enhanced visual effects and better visibility
     */
    draw(ctx) {
        const healthPercent = this.health / this.maxHealth;
        let intensity = 0.7 + (healthPercent * 0.3); // Higher base intensity
        
        // Flash effect when hit
        let drawColor = this.color;
        if (this.flashTimer > 0) {
            drawColor = '#fff';
        }
        
        ctx.save();
        
        // Enhanced visual presence
        ctx.translate(this.x, this.y);
        
        // Scale effect when hit
        if (this.scaleEffect !== 1.0) {
            ctx.scale(this.scaleEffect, this.scaleEffect);
        }
        
        // Gentle rotation for visual interest
        ctx.rotate(this.rotationEffect);
        
        // Death animation with more dramatic effect
        if (this.dying) {
            const deathProgress = Math.min(this.deathTimer / 2000, 1); // 2 second death animation
            const scale = 1 - deathProgress * 0.3; // Don't scale down too much
            const alpha = Math.max(0.3, 1 - deathProgress * 0.7); // Stay visible longer
            
            ctx.globalAlpha = alpha;
            ctx.scale(scale, scale);
            
            // Add dramatic spinning effect during death
            ctx.rotate(deathProgress * Math.PI * 6); // Spin 6 times during death
            
            // Pulsing glow effect
            const pulseIntensity = 1 + Math.sin(deathProgress * Math.PI * 10) * 0.5;
            intensity *= pulseIntensity;
        }
        
        // Much stronger glow effect for maximum visibility
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 40 * intensity; // Increased glow significantly
        
        // Additional outer glow layer
        ctx.save();
        ctx.shadowBlur = 60 * intensity;
        ctx.globalAlpha = 0.3;
        
        // Draw boss-specific visuals
        ctx.translate(-this.x, -this.y);
        this.drawSpecific(ctx, drawColor);
        
        ctx.restore();
        
        // Main boss body
        ctx.translate(-this.x, -this.y);
        this.drawSpecific(ctx, drawColor);
        
        ctx.restore();
        
        // Draw persistent elements without transforms
        if (!this.dying) {
            this.drawHealthBarEnhanced(ctx);
            this.drawBossIndicator(ctx);
        }
        
        // Draw boss-specific effects
        this.drawEffects(ctx);
    }

    /**
     * Draw enhanced health bar with better visibility
     */
    drawHealthBarEnhanced(ctx) {
        const barWidth = this.radius * 4; // Wider health bar
        const barHeight = 12; // Taller health bar
        const barY = this.y - this.radius - 30;
        const healthPercent = this.health / this.maxHealth;
        
        ctx.save();
        
        // Background with border
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - barWidth/2 - 2, barY - 2, barWidth + 4, barHeight + 4);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Health bar with gradient effect
        const gradient = ctx.createLinearGradient(this.x - barWidth/2, barY, this.x + barWidth/2, barY);
        if (healthPercent > 0.5) {
            gradient.addColorStop(0, '#0f0');
            gradient.addColorStop(1, '#8f0');
        } else if (healthPercent > 0.25) {
            gradient.addColorStop(0, '#f80');
            gradient.addColorStop(1, '#fa0');
        } else {
            gradient.addColorStop(0, '#f00');
            gradient.addColorStop(1, '#f88');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - barWidth/2, barY, barWidth * healthPercent, barHeight);
        
        // Border with glow
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 5;
        ctx.strokeRect(this.x - barWidth/2, barY, barWidth, barHeight);
        
        // Health text
        ctx.fillStyle = '#fff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 3;
        ctx.fillText(`${Math.ceil(this.health)}/${this.maxHealth}`, this.x, barY + barHeight + 15);
        
        ctx.restore();
    }
    
    /**
     * Draw boss indicator for better visibility
     */
    drawBossIndicator(ctx) {
        const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() / 300);
        
        ctx.save();
        
        // Outer warning ring
        ctx.strokeStyle = `rgba(255, 0, 0, ${pulseIntensity * 0.8})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 20 + pulseIntensity * 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner targeting ring
        ctx.strokeStyle = `rgba(255, 255, 255, ${pulseIntensity})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 35, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.setLineDash([]); // Reset line dash
        ctx.restore();
    }
    
    /**
     * Draw boss-specific visuals based on type
     */
    drawSpecific(ctx, drawColor) {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.drawOrbitalCommander(ctx, drawColor);
                break;
                
            case 'PULSE_TITAN':
                this.drawPulseTitan(ctx, drawColor);
                break;
                
            case 'VOID_HUNTER':
                this.drawVoidHunter(ctx, drawColor);
                break;
                
            case 'STORM_BRINGER':
                this.drawStormBringer(ctx, drawColor);
                break;
                
            case 'CRYSTAL_OVERLORD':
                this.drawCrystalOverlord(ctx, drawColor);
                break;
                
            default:
                // Default boss appearance
                ctx.fillStyle = drawColor;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }
    
    /**
     * Draw boss-specific effects
     */
    drawEffects(ctx) {
        switch (this.type) {
            case 'ORBITAL_COMMANDER':
                this.drawOrbitalEffects(ctx);
                break;
                
            case 'PULSE_TITAN':
                this.drawPulseEffects(ctx);
                break;
                
            case 'VOID_HUNTER':
                this.drawVoidHunterEffects(ctx);
                break;
                
            case 'STORM_BRINGER':
                this.drawStormEffects(ctx);
                break;
                
            case 'CRYSTAL_OVERLORD':
                this.drawCrystalEffects(ctx);
                break;
        }
    }
    
    // Boss-specific drawing methods
    drawOrbitalCommander(ctx, drawColor) {
        // Main body
        ctx.fillStyle = drawColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Core detail
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawPulseTitan(ctx, drawColor) {
        // Main body
        ctx.fillStyle = drawColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Pulse charging effect
        if (this.isPulsing) {
            ctx.strokeStyle = '#ff00ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawVoidHunter(ctx, drawColor) {
        // Main body with angular shape
        ctx.fillStyle = drawColor;
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
        
        // Charging effect
        if (this.isCharging) {
            ctx.strokeStyle = '#aa00ff';
            ctx.lineWidth = 4;
            ctx.stroke();
        }
    }
    
    drawStormBringer(ctx, drawColor) {
        // Main body
        ctx.fillStyle = drawColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Storm aura
        const time = Date.now() / 100;
        for (let i = 0; i < 3; i++) {
            const radius = this.radius + 10 + i * 8 + Math.sin(time + i) * 5;
            ctx.strokeStyle = `rgba(255, 255, 0, ${0.3 - i * 0.1})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawCrystalOverlord(ctx, drawColor) {
        // Main crystalline body
        ctx.fillStyle = drawColor;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const radius = i % 2 === 0 ? this.radius : this.radius * 0.7;
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    // Boss-specific effect drawing methods
    drawOrbitalEffects(ctx) {
        // Draw orbitals
        this.orbitals.forEach(orbital => {
            ctx.fillStyle = '#00ffff';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(orbital.x, orbital.y, 8, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawPulseEffects(ctx) {
        // Draw pulse wave
        if (this.isPulsing && this.pulseRadius > 0) {
            ctx.strokeStyle = `rgba(255, 0, 255, ${1 - this.pulseRadius / 200})`;
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    drawVoidHunterEffects(ctx) {
        // Draw charge trail
        if (this.isCharging && this.chargeTarget) {
            ctx.strokeStyle = 'rgba(170, 0, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.chargeTarget.x, this.chargeTarget.y);
            ctx.stroke();
        }
    }
    
    drawStormEffects(ctx) {
        // Draw lightning targets
        this.lightningTargets.forEach(target => {
            const alpha = target.life / 2000;
            ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(target.x, target.y);
            ctx.stroke();
            
            // Lightning target indicator
            ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(target.x, target.y, 10, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    drawCrystalEffects(ctx) {
        // Draw crystal shards
        this.crystalShards.forEach(shard => {
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 8;
            ctx.save();
            ctx.translate(shard.x, shard.y);
            ctx.rotate(shard.angle);
            ctx.fillRect(-6, -6, 12, 12);
            ctx.restore();
        });
    }
    
    /**
     * Factory method to create bosses with enhanced positioning
     */
    static createBossForWave(wave, canvasWidth, canvasHeight) {
        const bossWave = Math.floor((wave - 1) / 5) + 1;
        const bossTypes = Object.keys(GameConfig.BOSS.TYPES);
        const bossType = bossTypes[(bossWave - 1) % bossTypes.length];
        
        // Spawn at center with guaranteed visibility
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        const boss = new Boss(centerX, centerY, bossType);
        
        // Apply wave scaling but cap damage for early boss waves
        const scaling = GameConfig.DERIVED.getScalingForWave(wave);
        boss.health *= scaling.health * 1.2; // Slightly reduced health scaling
        boss.maxHealth = boss.health;
        
        // More aggressive damage scaling but capped for early waves
        if (wave === 5) {
            boss.damage = Math.min(boss.damage * scaling.damage, 15); // Lower cap for wave 5
        } else if (wave <= 15) {
            boss.damage = Math.min(boss.damage * scaling.damage, 25); // Progressive cap
        } else {
            boss.damage *= scaling.damage;
        }
        
        console.log(`Created ${bossType} boss for wave ${wave}: HP=${boss.health}, Damage=${boss.damage}, Position=(${boss.x}, ${boss.y})`);
        
        return boss;
    }
}