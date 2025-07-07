import { Enemy } from './Enemy.js';
import { GameConfig } from './config/GameConfig.js';
import { Projectile } from './Projectile.js';

export class Boss extends Enemy {
    constructor(x, y, health, damage, game) {
        super(x, y, GameConfig.BOSS.SPEED, health, damage);
        this.game = game;
        this.radius = GameConfig.BOSS.RADIUS;
        this.color = '#ff00ff'; // Bright magenta for the boss
        this.glowColor = '#ff00ff';
        this.isBoss = true;
        this.maxHealth = health;

        // Boss-specific properties
        this.attackTimer = 0;
        this.attackCooldown = GameConfig.BOSS.ATTACK_COOLDOWN;
        this.currentAttack = null;
        this.minionSpawnTimer = 0;
        this.minionSpawnCooldown = GameConfig.BOSS.MINION_SPAWN_COOLDOWN;
    }

    update(delta, player) {
        // Override basic enemy movement
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Store previous position for velocity calculation
        this.prevX = this.x;
        this.prevY = this.y;

        if (distance > 200) { // Keep some distance
            const normalizedDx = dx / distance;
            const normalizedDy = dy / distance;
            const actualSpeed = this.speed * (delta / 1000);
            this.x += normalizedDx * actualSpeed;
            this.y += normalizedDy * actualSpeed;
        }
        
        // Calculate velocity in pixels per second for predictive targeting
        const deltaSeconds = delta / 1000;
        if (deltaSeconds > 0) {
            this.vx = (this.x - this.prevX) / deltaSeconds;
            this.vy = (this.y - this.prevY) / deltaSeconds;
        } else {
            this.vx = 0;
            this.vy = 0;
        }


        this.attackTimer += delta;
        this.minionSpawnTimer += delta;

        if (this.attackTimer >= this.attackCooldown) {
            this.chooseAttack();
            this.executeAttack(player);
            this.attackTimer = 0;
        }

        if (this.minionSpawnTimer >= this.minionSpawnCooldown) {
            this.spawnMinions();
            this.minionSpawnTimer = 0;
        }
    }

    chooseAttack() {
        const attacks = ['projectileBurst', 'charge'];
        this.currentAttack = attacks[Math.floor(Math.random() * attacks.length)];
    }

    executeAttack(player) {
        switch (this.currentAttack) {
            case 'projectileBurst':
                this.projectileBurst();
                break;
            case 'charge':
                this.charge(player);
                break;
        }
    }

    projectileBurst() {
        const projectileCount = 16;
        for (let i = 0; i < projectileCount; i++) {
            const angle = (Math.PI * 2 / projectileCount) * i;
            const projectile = new Projectile(
                this.x,
                this.y,
                angle,
                10 // damage
            );
            projectile.isEnemyProjectile = true;
            this.game.projectiles.push(projectile);
        }
    }

    charge(player) {
        const chargeSpeed = this.speed * 3;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            this.vx = (dx / distance) * chargeSpeed;
            this.vy = (dy / distance) * chargeSpeed;
        }


        setTimeout(() => {
            this.vx = 0;
            this.vy = 0;
        }, 500);
    }

    spawnMinions() {
        const minionCount = 2;
        for (let i = 0; i < minionCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spawnX = this.x + Math.cos(angle) * 100;
            const spawnY = this.y + Math.sin(angle) * 100;
            const minion = Enemy.createFastEnemy(spawnX, spawnY, 1);
            this.game.enemies.push(minion);
        }
    }

    draw(ctx) {
        // Custom boss drawing
        ctx.save();
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;

        // Pulsating effect
        const pulse = Math.sin(Date.now() / 200) * 5;
        const size = this.radius + pulse;

        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        this.drawBossHealthBar(ctx);
    }

    drawBossHealthBar(ctx) {
        const barWidth = this.game.canvas.width * 0.6;
        const barHeight = 20;
        const barX = (this.game.canvas.width - barWidth) / 2;
        const barY = 20;
        const healthPercent = this.health / this.maxHealth;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        ctx.fillStyle = '#ff00ff';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS', this.game.canvas.width / 2, barY + 15);
    }

    static createBoss(game) {
        const wave = game.wave;
        const health = GameConfig.BOSS.BASE_HEALTH * (1 + (wave / 10) * 0.5);
        const damage = GameConfig.BOSS.BASE_DAMAGE * (1 + (wave / 10) * 0.2);

        const centerX = game.canvas.width / 2;
        const centerY = game.canvas.height / 2;
        const spawnRadius = Math.max(game.canvas.width, game.canvas.height) / 2 + GameConfig.ENEMY.SPAWN_MARGIN;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * spawnRadius;
        const y = centerY + Math.sin(angle) * spawnRadius;

        // Alternate between boss types based on wave number
        if (wave % 20 === 0) {
            return new ShieldBoss(x, y, health, damage, game);
        } else {
            return new Boss(x, y, health, damage, game);
        }
    }
}

/**
 * Shield Boss variant with defensive abilities and unique attack patterns
 */
export class ShieldBoss extends Boss {
    constructor(x, y, health, damage, game) {
        super(x, y, health, damage, game);
        
        // Shield Boss specific properties
        this.color = '#00ffff'; // Cyan color for shield boss
        this.glowColor = '#00ffff';
        this.bossType = 'Shield';
        
        // Shield mechanics
        this.maxShield = health * 0.5; // Shield is 50% of max health
        this.shield = this.maxShield;
        this.shieldRegenRate = this.maxShield * 0.02; // 2% per second
        this.shieldRegenCooldown = 3000; // 3 seconds after taking damage
        this.lastDamageTime = 0;
        
        // Shield phases
        this.shieldActive = true;
        this.vulnerabilityPhase = false;
        this.vulnerabilityTimer = 0;
        this.vulnerabilityDuration = 5000; // 5 seconds vulnerable after shield breaks
        
        // Unique attack patterns
        this.laserChargeTimer = 0;
        this.laserChargeDuration = 2000; // 2 second charge time
        this.isChargingLaser = false;
        this.shieldBurstCooldown = 8000; // 8 seconds
        this.shieldBurstTimer = 0;
    }
    
    update(delta, player) {
        // Update shield regeneration
        this.updateShield(delta);
        
        // Override movement - shield boss moves in a circular pattern
        this.circularMovement(delta, player);
        
        // Handle attack patterns
        this.updateAttacks(delta, player);
        
        // Handle vulnerability phase
        this.updateVulnerabilityPhase(delta);
    }
    
    updateShield(delta) {
        const currentTime = Date.now();
        
        // Regenerate shield if not damaged recently and shield is not full
        if (this.shield < this.maxShield && 
            currentTime - this.lastDamageTime > this.shieldRegenCooldown) {
            this.shield = Math.min(this.maxShield, 
                this.shield + (this.shieldRegenRate * delta / 1000));
        }
        
        // Check if shield is broken
        if (this.shield <= 0 && this.shieldActive) {
            this.shieldActive = false;
            this.vulnerabilityPhase = true;
            this.vulnerabilityTimer = 0;
            // Create shield break explosion effect
            this.game.createExplosion(this.x, this.y, 16);
            this.game.addScreenShake(15, 400);
        }
        
        // Reactivate shield after vulnerability phase
        if (this.vulnerabilityPhase && this.vulnerabilityTimer >= this.vulnerabilityDuration) {
            this.shieldActive = true;
            this.vulnerabilityPhase = false;
            this.shield = this.maxShield;
        }
    }
    
    circularMovement(delta, player) {
        const centerX = this.game.canvas.width / 2;
        const centerY = this.game.canvas.height / 2;
        const orbitRadius = 250;
        
        // Store previous position
        this.prevX = this.x;
        this.prevY = this.y;
        
        // Circular movement around center
        const time = Date.now() / 1000;
        const speed = this.vulnerabilityPhase ? 0.5 : 0.3; // Move faster when vulnerable
        
        this.x = centerX + Math.cos(time * speed) * orbitRadius;
        this.y = centerY + Math.sin(time * speed) * orbitRadius;
        
        // Calculate velocity
        const deltaSeconds = delta / 1000;
        if (deltaSeconds > 0) {
            this.vx = (this.x - this.prevX) / deltaSeconds;
            this.vy = (this.y - this.prevY) / deltaSeconds;
        }
    }
    
    updateAttacks(delta, player) {
        this.attackTimer += delta;
        this.laserChargeTimer += delta;
        this.shieldBurstTimer += delta;
        
        // Shield burst attack - only when shield is active
        if (this.shieldActive && this.shieldBurstTimer >= this.shieldBurstCooldown) {
            this.shieldBurst();
            this.shieldBurstTimer = 0;
        }
        
        // Laser attack - more frequent when vulnerable
        const laserCooldown = this.vulnerabilityPhase ? 3000 : 5000;
        if (this.laserChargeTimer >= laserCooldown) {
            this.startLaserCharge(player);
            this.laserChargeTimer = 0;
        }
        
        // Execute charged laser
        if (this.isChargingLaser && this.laserChargeTimer >= this.laserChargeDuration) {
            this.fireLaser(player);
            this.isChargingLaser = false;
            this.laserChargeTimer = 0;
        }
        
        // Regular projectile attacks
        if (this.attackTimer >= this.attackCooldown) {
            this.chooseAttack();
            this.executeAttack(player);
            this.attackTimer = 0;
        }
    }
    
    updateVulnerabilityPhase(delta) {
        if (this.vulnerabilityPhase) {
            this.vulnerabilityTimer += delta;
        }
    }
    
    chooseAttack() {
        const attacks = this.vulnerabilityPhase ? 
            ['projectileBurst', 'spiralShot', 'rapidFire'] : 
            ['projectileBurst', 'spiralShot'];
        this.currentAttack = attacks[Math.floor(Math.random() * attacks.length)];
    }
    
    executeAttack(player) {
        switch (this.currentAttack) {
            case 'projectileBurst':
                this.projectileBurst();
                break;
            case 'spiralShot':
                this.spiralShot();
                break;
            case 'rapidFire':
                this.rapidFire(player);
                break;
        }
    }
    
    spiralShot() {
        const projectileCount = 8;
        const spiralOffset = (Date.now() / 100) % (Math.PI * 2);
        
        for (let i = 0; i < projectileCount; i++) {
            const angle = (Math.PI * 2 / projectileCount) * i + spiralOffset;
            const projectile = new Projectile(
                this.x,
                this.y,
                angle,
                15 // Higher damage
            );
            projectile.isEnemyProjectile = true;
            projectile.speed = GameConfig.BOSS.PROJECTILE_SPEED * 0.8; // Slower but more damage
            this.game.projectiles.push(projectile);
        }
    }
    
    rapidFire(player) {
        const projectileCount = 5;
        const baseAngle = Math.atan2(player.y - this.y, player.x - this.x);
        const spread = 0.4; // Spread in radians
        
        for (let i = 0; i < projectileCount; i++) {
            const angle = baseAngle + (spread * (i - 2) / 2);
            const projectile = new Projectile(
                this.x,
                this.y,
                angle,
                12
            );
            projectile.isEnemyProjectile = true;
            projectile.speed = GameConfig.BOSS.PROJECTILE_SPEED * 1.5; // Faster projectiles
            this.game.projectiles.push(projectile);
        }
    }
    
    shieldBurst() {
        // Create expanding ring of projectiles
        const rings = 3;
        const projectilesPerRing = 12;
        
        for (let ring = 0; ring < rings; ring++) {
            setTimeout(() => {
                for (let i = 0; i < projectilesPerRing; i++) {
                    const angle = (Math.PI * 2 / projectilesPerRing) * i;
                    const projectile = new Projectile(
                        this.x,
                        this.y,
                        angle,
                        8
                    );
                    projectile.isEnemyProjectile = true;
                    projectile.speed = GameConfig.BOSS.PROJECTILE_SPEED * (0.6 + ring * 0.2);
                    this.game.projectiles.push(projectile);
                }
            }, ring * 300); // 300ms delay between rings
        }
    }
    
    startLaserCharge(player) {
        this.isChargingLaser = true;
        this.laserChargeTimer = 0;
        this.laserTargetX = player.x;
        this.laserTargetY = player.y;
    }
    
    fireLaser(player) {
        // Fire a powerful laser beam
        const laserLength = 800;
        const angle = Math.atan2(this.laserTargetY - this.y, this.laserTargetX - this.x);
        
        // Create multiple projectiles along the laser path
        const projectileCount = 15;
        for (let i = 1; i <= projectileCount; i++) {
            const distance = (laserLength / projectileCount) * i;
            const x = this.x + Math.cos(angle) * distance;
            const y = this.y + Math.sin(angle) * distance;
            
            setTimeout(() => {
                const projectile = new Projectile(x, y, angle, 20);
                projectile.isEnemyProjectile = true;
                projectile.speed = 0; // Stationary laser segments
                projectile.life = 500; // Short duration
                this.game.projectiles.push(projectile);
            }, i * 50); // Staggered appearance
        }
        
        // Screen shake for laser impact
        this.game.addScreenShake(8, 300);
    }
    
    takeDamage(damage) {
        this.lastDamageTime = Date.now();
        
        if (this.shieldActive && this.shield > 0) {
            // Damage goes to shield first
            const shieldDamage = Math.min(damage, this.shield);
            this.shield -= shieldDamage;
            damage -= shieldDamage;
        }
        
        // Remaining damage goes to health
        if (damage > 0) {
            this.health = Math.max(0, this.health - damage);
        }
    }
    
    draw(ctx) {
        ctx.save();
        
        // Draw shield effect when active
        if (this.shieldActive && this.shield > 0) {
            ctx.shadowColor = this.glowColor;
            ctx.shadowBlur = 30;
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 4;
            
            const shieldRadius = this.radius + 15;
            const shieldAlpha = 0.3 + (this.shield / this.maxShield) * 0.4;
            
            // Shield ring
            ctx.globalAlpha = shieldAlpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, shieldRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Shield hexagon pattern
            ctx.globalAlpha = shieldAlpha * 0.5;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const x1 = this.x + Math.cos(angle) * shieldRadius;
                const y1 = this.y + Math.sin(angle) * shieldRadius;
                const x2 = this.x + Math.cos(angle + Math.PI / 3) * shieldRadius;
                const y2 = this.y + Math.sin(angle + Math.PI / 3) * shieldRadius;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
        
        ctx.globalAlpha = 1;
        
        // Draw boss body
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.vulnerabilityPhase ? '#ff4444' : this.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        
        // Pulsating effect (slower when shielded)
        const pulseSpeed = this.shieldActive ? 300 : 150;
        const pulse = Math.sin(Date.now() / pulseSpeed) * 5;
        const size = this.radius + pulse;
        
        // Draw main body with geometric pattern
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw inner geometric design
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI / 4) * i;
            const innerRadius = size * 0.3;
            const outerRadius = size * 0.7;
            
            ctx.beginPath();
            ctx.moveTo(
                this.x + Math.cos(angle) * innerRadius,
                this.y + Math.sin(angle) * innerRadius
            );
            ctx.lineTo(
                this.x + Math.cos(angle) * outerRadius,
                this.y + Math.sin(angle) * outerRadius
            );
            ctx.stroke();
        }
        
        // Draw laser charging effect
        if (this.isChargingLaser) {
            const chargeProgress = this.laserChargeTimer / this.laserChargeDuration;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3 + chargeProgress * 5;
            ctx.globalAlpha = 0.5 + chargeProgress * 0.5;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.laserTargetX, this.laserTargetY);
            ctx.stroke();
        }
        
        ctx.restore();
        
        this.drawShieldBossHealthBar(ctx);
    }
    
    drawShieldBossHealthBar(ctx) {
        const barWidth = this.game.canvas.width * 0.6;
        const barHeight = 20;
        const barX = (this.game.canvas.width - barWidth) / 2;
        const barY = 20;
        const healthPercent = this.health / this.maxHealth;
        const shieldPercent = this.shield / this.maxShield;
        
        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health bar
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Shield bar (overlaid)
        if (this.shieldActive && this.shield > 0) {
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(barX, barY, barWidth * shieldPercent, barHeight);
        }
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Text
        ctx.fillStyle = '#fff';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        const bossText = this.vulnerabilityPhase ? 'SHIELD BOSS - VULNERABLE!' : 'SHIELD BOSS';
        ctx.fillText(bossText, this.game.canvas.width / 2, barY + 15);
    }
}
