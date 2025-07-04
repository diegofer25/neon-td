import { Player } from "./Player.js";
import { Particle } from "./Particle.js";
import { Shop } from "./Shop.js";
import { GameConfig } from "./config/GameConfig.js";
import { ObjectPool } from "./utils/ObjectPool.js";
import { PerformanceManager } from "./managers/PerformanceManager.js";
import { CollisionSystem } from "./systems/CollisionSystem.js";
import { WaveManager } from "./systems/WaveManager.js";
import { EffectsManager } from "./systems/EffectsManager.js";
import { EntityManager } from "./systems/EntityManager.js";

/**
 * Main game class - now focused on coordination between systems rather than direct management.
 *
 * This refactored Game class delegates responsibilities to specialized systems:
 * - CollisionSystem: Handles all collision detection and responses
 * - WaveManager: Manages wave progression and enemy spawning
 * - EffectsManager: Handles visual effects and screen shake
 * - EntityManager: Manages entity lifecycle and updates
 */
export class Game {
	static STATES = {
		MENU: "menu",
		PLAYING: "playing",
		PAUSED: "paused",
		POWERUP: "powerup",
		GAMEOVER: "gameover",
	};

	/**
	 * Creates a new game instance and initializes all subsystems.
	 */
	constructor(canvas, ctx) {
		if (!canvas || !ctx) {
			throw new Error("Canvas and context are required");
		}

		this.canvas = canvas;
		this.ctx = ctx;
		this.gameState = Game.STATES.MENU;

		this._initializeEntities();
		this._initializeManagers();
		this._initializeSystems();
		this._initializeGameState();
		this._initializeShop();

		this.init();
	}

	/**
	 * Initialize all game entity arrays.
	 * @private
	 */
	_initializeEntities() {
		this.player = null;
		this.enemies = [];
		this.projectiles = [];
		this.particles = [];
	}

	/**
	 * Initialize performance managers and object pools.
	 * @private
	 */
	_initializeManagers() {
		this.performanceManager = new PerformanceManager();
		this._initializeObjectPools();
	}

	/**
	 * Initialize all game systems.
	 * @private
	 */
	_initializeSystems() {
		this.collisionSystem = new CollisionSystem(this);
		this.waveManager = new WaveManager(this);
		this.effectsManager = new EffectsManager(this);
		this.entityManager = new EntityManager(this);
	}

	/**
	 * Initialize object pools for high-frequency objects.
	 * @private
	 */
	_initializeObjectPools() {
		this.particlePool = new ObjectPool(
			() => new Particle(0, 0, 0, 0, 0),
			this._resetParticle.bind(this),
			50,
			200
		);
	}

	/**
	 * Reset particle properties for object pool reuse.
	 * @private
	 */
	_resetParticle(particle, x, y, vx, vy, life, color) {
		particle.x = x;
		particle.y = y;
		particle.vx = vx;
		particle.vy = vy;
		particle.life = life;
		particle.maxLife = life;
		particle.color = color || "#fff";
		particle.glowColor = color || "#fff";
		particle._destroy = false;
		particle._fromPool = true;
	}

	/**
	 * Initialize core game state variables.
	 * @private
	 */
	_initializeGameState() {
		this.wave = 0;
		this.score = 0;
	}

	/**
	 * Initialize the shop system for power-ups.
	 * @private
	 */
	_initializeShop() {
		this.shop = new Shop();
	}

	/**
	 * Initialize the game world and create the player.
	 */
	init() {
		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;
		this.player = new Player(centerX, centerY);
	}

	/**
	 * Start a new game session.
	 */
	start() {
		this.gameState = "playing";
		this.wave = 1;
		this.score = 0;
		this.enemies = [];
		this.projectiles = [];
		this.particles = [];

		this.player.reset();
		this.waveManager.reset();
		this.waveManager.startWave(this.wave);
	}

	/**
	 * Restart the current game session.
	 */
	restart() {
		this.init();
		this.start();
	}

	/**
	 * Pause the game and preserve current state.
	 */
	pause() {
		this.gameState = "paused";
	}

	/**
	 * Resume the game from paused state.
	 */
	resume() {
		this.gameState = "playing";
	}

	/**
	 * Update canvas-dependent positions when canvas size changes.
	 */
	updateCanvasSize() {
		const centerX = this.canvas.width / 2;
		const centerY = this.canvas.height / 2;

		if (this.player) {
			this.player.x = centerX;
			this.player.y = centerY;
		}

		// Update enemy positions to maintain relative positions from center
		this.enemies.forEach((enemy) => {
			const dx = enemy.x - centerX;
			const dy = enemy.y - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			// If enemy is off-screen due to resize, move it to visible area
			const maxDistance =
				Math.max(this.canvas.width, this.canvas.height) / 2 + 50;
			if (distance > maxDistance) {
				const angle = Math.atan2(dy, dx);
				enemy.x = centerX + Math.cos(angle) * maxDistance;
				enemy.y = centerY + Math.sin(angle) * maxDistance;
			}
		});

		// Remove projectiles and particles that are now off-screen
		this.projectiles = this.projectiles.filter((proj) => {
			return (
				proj.x >= 0 &&
				proj.x <= this.canvas.width &&
				proj.y >= 0 &&
				proj.y <= this.canvas.height
			);
		});
	}

	/**
	 * Main game update loop - now delegates to specialized systems.
	 */
	update(delta, input) {
		if (this.gameState !== "playing") return;

		// Update core managers
		this.performanceManager.update(delta);

		// Update all game systems
		this.effectsManager.update(delta);
		this.waveManager.update(delta);
		this.entityManager.updateAll(delta, input);

		// Handle collisions
		this.collisionSystem.checkAllCollisions();

		// Check game over
		if (this.player.hp <= 0) {
			this.gameState = "gameover";
		}
	}

	/**
	 * Handle wave completion logic and transition to shop.
	 */
	completeWave() {
		this.gameState = "powerup";

		// Calculate and award coins
		const totalCoins = this.waveManager.calculateWaveReward();
		this.player.addCoins(totalCoins);

		this.showShop();
	}

	/**
	 * Display the shop interface for power-up purchases.
	 */
	showShop() {
		this.shop.showShop(
			this.player,
			this.player.coins,
			(powerUp, price) => this.purchasePowerUp(powerUp, price),
			() => this.continueToNextWave()
		);
	}

	/**
	 * Process a power-up purchase from the shop.
	 */
	purchasePowerUp(powerUp, price) {
		if (this.player.spendCoins(price)) {
			powerUp.apply(this.player);
			if (window.playSFX) window.playSFX("powerup");
		}
	}

	/**
	 * Continue to the next wave after shopping phase.
	 */
	continueToNextWave() {
		this.shop.closeShop();
		this.wave++;
		this.gameState = "playing";

		setTimeout(() => {
			this.waveManager.startWave(this.wave);
		}, 1000);
	}

	// Delegate methods to effects manager
	addScreenShake(intensity, duration) {
		this.effectsManager.addScreenShake(intensity, duration);
	}

	createExplosion(x, y, particleCount = 8) {
		this.effectsManager.createExplosion(x, y, particleCount);
	}

	createExplosionRing(x, y, radius) {
		this.effectsManager.createExplosionRing(x, y, radius);
	}

	/**
	 * Render all game elements to the canvas.
	 */
	render() {
		const ctx = this.ctx;

		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Apply screen shake from effects manager
		ctx.save();
		ctx.translate(
			this.effectsManager.screenShake.offsetX,
			this.effectsManager.screenShake.offsetY
		);

		this.drawBackground();

		// Draw entities
		this.particles.forEach((particle) => particle.draw(ctx));
		this.enemies.forEach((enemy) => enemy.draw(ctx));
		this.projectiles.forEach((projectile) => projectile.draw(ctx));
		this.player.draw(ctx);

		// Draw spawn warning if enemies are incoming
		if (this.waveManager.enemiesToSpawn > 0) {
			this.drawSpawnWarning(ctx);
		}

		ctx.restore();
	}

	/**
	 * Draw the background neon grid effect.
	 */
	drawBackground() {
		// Skip drawing grid if performance is low
		if (this.performanceManager.needsOptimization()) return;

		const ctx = this.ctx;
		const gridSize = GameConfig.VFX.GRID_SIZE;

		ctx.strokeStyle = `rgba(0, 255, 255, ${GameConfig.VFX.GRID_ALPHA})`;
		ctx.lineWidth = 1;

		// Draw vertical lines
		for (let x = 0; x < this.canvas.width; x += gridSize) {
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, this.canvas.height);
			ctx.stroke();
		}

		// Draw horizontal lines
		for (let y = 0; y < this.canvas.height; y += gridSize) {
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(this.canvas.width, y);
			ctx.stroke();
		}
	}

	/**
	 * Draw visual warning when enemies are about to spawn.
	 */
	drawSpawnWarning(ctx) {
		const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() / 200);
		const warningColor = `rgba(255, 165, 0, ${pulseIntensity * 0.3})`;

		ctx.strokeStyle = warningColor;
		ctx.lineWidth = 4;
		ctx.setLineDash([10, 10]);

		const margin = 20;
		ctx.strokeRect(
			margin,
			margin,
			this.canvas.width - margin * 2,
			this.canvas.height - margin * 2
		);

		ctx.setLineDash([]); // Reset line dash

		// Draw enemy count text
		ctx.fillStyle = "#ff0";
		ctx.font = '16px "Press Start 2P", monospace';
		ctx.textAlign = "center";
		ctx.shadowColor = "#ff0";
		ctx.shadowBlur = 10;

		const text = `Incoming: ${this.waveManager.enemiesToSpawn}`;
		ctx.fillText(text, this.canvas.width / 2, 40);

		// Reset text properties
		ctx.textAlign = "left";
		ctx.shadowBlur = 0;
	}
}
