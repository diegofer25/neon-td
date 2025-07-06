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
        const health = GameConfig.BOSS.BASE_HEALTH * (1 + (wave / 5) * 0.5);
        const damage = GameConfig.BOSS.BASE_DAMAGE * (1 + (wave / 5) * 0.2);

        const centerX = game.canvas.width / 2;
        const centerY = game.canvas.height / 2;
        const spawnRadius = Math.max(game.canvas.width, game.canvas.height) / 2 + GameConfig.ENEMY.SPAWN_MARGIN;
        const angle = Math.random() * Math.PI * 2;
        const x = centerX + Math.cos(angle) * spawnRadius;
        const y = centerY + Math.sin(angle) * spawnRadius;

        return new Boss(x, y, health, damage, game);
    }
}
