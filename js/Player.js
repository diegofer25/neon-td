import { PowerUp } from './PowerUp.js';
import { Projectile } from './Projectile.js';
import { GameConfig } from './config/GameConfig.js';
import { createFloatingText, playSFX } from './main.js';
import { MathUtils } from './utils/MathUtils.js';

/**
 * Player character class for the neon tower defense game
 * 
 * Handles all player-related functionality including:
 * - Character state management (health, shields, position)
 * - Combat system (auto-targeting, firing, damage calculations)
 * - Power-up system (stackable and non-stackable abilities)
 * - Visual effects (muzzle flash, glow effects, slow field)
 * - Economy system (coin collection and spending)
 * 
 * @class Player
 */
export class Player {
    /**
     * Creates a new player instance with default stats and power-ups
     * 
     * @param {number} x - Initial x coordinate position
     * @param {number} y - Initial y coordinate position
     * @example
     * const player = new Player(400, 300); // Center of 800x600 canvas
     */
    constructor(x, y) {
        this._initializePosition(x, y);
        this._initializeStats();
        this._initializePowerUps();
        this._initializeStackTracking();
    }
    
    /**
     * Initialize player position and basic geometric properties
     * 
     * @private
     * @param {number} x - Initial x coordinate
     * @param {number} y - Initial y coordinate
     */
    _initializePosition(x, y) {
        /** @type {number} Current x position */
        this.x = x;
        /** @type {number} Current y position */
        this.y = y;
        /** @type {number} Player collision radius */
        this.radius = GameConfig.PLAYER.RADIUS;
        /** @type {number} Current facing angle in radians */
        this.angle = 0;
        
        // Rotation system properties
        /** @type {number|null} Target angle the player is rotating towards */
        this.targetAngle = null;
        /** @type {boolean} Whether player is currently rotating to face a target */
        this.isRotating = false;
        /** @type {number} Time spent rotating towards current target */
        this.rotationTime = 0;
        /** @type {Object|null} Current enemy target being tracked */
        this.currentTarget = null;
    }
    
    /**
     * Initialize player combat and health statistics
     * 
     * @private
     */
    _initializeStats() {
        /** @type {number} Maximum health points */
        this.maxHp = GameConfig.PLAYER.MAX_HP;
        /** @type {number} Current health points */
        this.hp = this.maxHp;
        /** @type {number} Time remaining until next shot (milliseconds) */
        this.fireCooldown = 0;
        /** @type {number} Base time between shots (milliseconds) */
        this.baseFireRate = GameConfig.PLAYER.BASE_FIRE_RATE;
        /** @type {number} Player's currency amount */
        this.coins = 0;
        
        // Combat modifiers (multipliers)
        /** @type {number} Damage multiplier (1.0 = normal damage) */
        this.damageMod = 1;
        /** @type {number} Fire rate multiplier (2.0 = twice as fast) */
        this.fireRateMod = 1;
        /** @type {number} Projectile speed multiplier */
        this.projectileSpeedMod = 1;
        /** @type {number} Rotation speed multiplier (2.0 = twice as fast rotation) */
        this.rotationSpeedMod = 1;
    }
    
    /**
     * Initialize all power-up flags and related properties
     * 
     * @private
     */
    _initializePowerUps() {
        // Boolean power-up flags
		/** @type {number} The number of enemies projectiles can pierce. 0 = no piercing. */
		this.piercingLevel = 0;
		/** @type {boolean} Whether player fires three projectiles per shot */
		this.hasTripleShot = false;
		/** @type {boolean} Whether player heals when killing enemies */
		this.hasLifeSteal = false;
		/** @type {boolean} Whether slow field is active */
		this.hasSlowField = false;
		/** @type {boolean} Whether shield protection is active */
		this.hasShield = false;
		/** @type {boolean} Whether projectiles explode on impact */
		this.explosiveShots = false;
		
		// Numeric power-up properties
		/** @type {number} Current shield health points */
		this.shieldHp = 0;
		/** @type {number} Maximum shield health points */
		this.maxShieldHp = 0;
		/** @type {number} Health regeneration per second */
		this.hpRegen = 0;
		/** @type {number} Shield regeneration per second */
		this.shieldRegen = 0;
		/** @type {number} Explosion radius for explosive shots */
		this.explosionRadius = 50;
		/** @type {number} Explosion damage for explosive shots */
		this.explosionDamage = 20;
		/** @type {number} Coin reward multiplier (1.0 = normal rewards) */
		this.coinMagnetMultiplier = 1.0;
		
		// Lucky Shots power-up configuration
		/** @type {Object|null} Lucky shots configuration object */
		this.luckyShots = null;
		
		// Slow field configuration
		/** @type {number} Radius of slow field effect */
		this.slowFieldRadius = GameConfig.PLAYER.SLOW_FIELD_BASE_RADIUS;
		/** @type {number} Current slow field strength (stack count) */
		this.slowFieldStrength = 0;
		/** @type {number} Maximum allowed slow field stacks */
		this.maxSlowFieldStacks = GameConfig.PLAYER.MAX_SLOW_FIELD_STACKS;
		
		// Immolation Aura configuration
		/** @type {Object|null} Immolation Aura configuration object */
		this.immolationAura = null;
		
		// Shield Boss Counter Power-ups
		/** @type {boolean} Whether Shield Breaker is active */
		this.hasShieldBreaker = false;
		/** @type {number} Shield damage multiplier */
		this.shieldBreakerDamage = 1.0;
		/** @type {number} Shield regeneration delay */
		this.shieldRegenDelay = 0;
		/** @type {number} Shield breaker stack count */
		this.shieldBreakerStacks = 0;
		
		/** @type {boolean} Whether Adaptive Targeting is active */
		this.hasAdaptiveTargeting = false;
		/** @type {number} Extended targeting range */
		this.targetingRange = 200;
		/** @type {boolean} Whether projectiles have homing ability */
		this.hasHomingShots = false;
		
		/** @type {boolean} Whether Barrier Phase is active */
		this.hasBarrierPhase = false;
		/** @type {number} Barrier Phase cooldown timer */
		this.barrierPhaseCooldown = 0;
		/** @type {number} Maximum cooldown for Barrier Phase */
		this.barrierPhaseMaxCooldown = 60000;
		/** @type {number} Duration of invulnerability */
		this.barrierPhaseDuration = 3000;
		/** @type {boolean} Whether currently invulnerable */
		this.barrierPhaseActive = false;
		/** @type {number} Health threshold to trigger barrier */
		this.barrierPhaseThreshold = 0.25;
		
		/** @type {Object|null} Overcharge Burst configuration */
		this.overchargeBurst = null;
		
		/** @type {Object|null} Emergency Heal configuration */
		this.emergencyHeal = null;
    }
    
    /**
     * Initialize tracking object for stackable power-ups
     * 
     * @private
     */
    _initializeStackTracking() {
        /** @type {Object.<string, number>} Power-up stack counts by name */
        this.powerUpStacks = {};
        PowerUp.POWER_UP_STACK_NAMES.forEach(name => {
            this.powerUpStacks[name] = 0;
        });
    }
    
    /**
     * Reset player to initial state (called on game restart)
     * Clears all power-ups, resets health, and restores default values
     * 
     * @public
     */
    reset() {
        this.hp = this.maxHp;
        this.fireCooldown = 0;
        this.angle = 0;
        
        // Reset rotation system
        this.targetAngle = null;
        this.isRotating = false;
        this.rotationTime = 0;
        this.currentTarget = null;
        
        // Reset all power-up modifiers
        this.damageMod = 1;
        this.fireRateMod = 1;
        this.projectileSpeedMod = 1;
        this.rotationSpeedMod = 1;
        
        this.piercingLevel = 0;
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
        this.slowFieldRadius = GameConfig.PLAYER.SLOW_FIELD_BASE_RADIUS;
        this.slowFieldStrength = 0;
        this.maxSlowFieldStacks = GameConfig.PLAYER.MAX_SLOW_FIELD_STACKS;
        
        // Reset coin multiplier
        this.coinMagnetMultiplier = 1.0;
        
        // Reset Lucky Shots
        this.luckyShots = null;
        
        // Reset Immolation Aura
        this.immolationAura = null;
        
        // Reset Shield Boss Counter Power-ups
        this.hasShieldBreaker = false;
        this.shieldBreakerDamage = 1.0;
        this.shieldRegenDelay = 0;
        this.shieldBreakerStacks = 0;
        
        this.hasAdaptiveTargeting = false;
        this.targetingRange = 200;
        this.hasHomingShots = false;
        
        this.hasBarrierPhase = false;
        this.barrierPhaseCooldown = 0;
        this.barrierPhaseMaxCooldown = 60000;
        this.barrierPhaseDuration = 3000;
        this.barrierPhaseActive = false;
        this.barrierPhaseThreshold = 0.25;
        
        this.overchargeBurst = null;
        this.emergencyHeal = null;
        
        // Reset coins
        this.coins = 0;
        
        // Reset power-up stacks
        this.powerUpStacks = {};
        PowerUp.POWER_UP_STACK_NAMES.forEach(name => {
            this.powerUpStacks[name] = 0;
        });
    }
    
    /**
     * Update player state each frame
     * Handles rotation, targeting, firing, regeneration, and power-up effects
     * 
     * @param {number} delta - Time elapsed since last frame (milliseconds)
     * @param {Object} input - Input state object (currently unused)
     * @param {import('./Game.js').Game} game - Game instance containing enemies, projectiles, particles
     */
    update(delta, input, game) {
        // Skip all updates if game is not in playing state
        if (game.gameState !== 'playing') return;
        
        // Find and acquire target
        const nearestEnemy = this.findNearestEnemy(game.enemies);
        
        if (nearestEnemy) {
            this._updateTargeting(nearestEnemy, delta);
            this._updateRotation(delta);
            this._updateFiring(game);
        } else {
            // No enemies - stop rotating and clear target
            this.isRotating = false;
            this.currentTarget = null;
            this.targetAngle = null;
            this.rotationTime = 0;
        }
        
        // Update fire cooldown timer
        if (this.fireCooldown > 0) {
            this.fireCooldown -= delta;
        }
        
        // Apply regeneration effects over time
        if (this.hpRegen > 0) {
            this.heal(this.hpRegen * (delta / 1000));
        }
        
        if (this.shieldRegen > 0 && this.hasShield) {
            this.healShield(this.shieldRegen * (delta / 1000));
        }
        
        // Apply area-of-effect slow field to nearby enemies
        if (this.hasSlowField && this.slowFieldStrength > 0) {
            this.applySlowField(game.enemies);
        }
        
        // Apply Immolation Aura damage to nearby enemies
        if (this.immolationAura && this.immolationAura.active) {
            this.applyImmolationAura(game.enemies, delta);
        }
        
        // Update Barrier Phase cooldown
        if (this.hasBarrierPhase && this.barrierPhaseCooldown > 0) {
            this.barrierPhaseCooldown -= delta;
        }
        
        // Check for Barrier Phase activation
        if (this.hasBarrierPhase && !this.barrierPhaseActive && 
            this.hp / this.maxHp <= this.barrierPhaseThreshold && 
            this.barrierPhaseCooldown <= 0) {
            this.activateBarrierPhase();
        }
        
        // Update Barrier Phase duration
        if (this.barrierPhaseActive) {
            this.barrierPhaseDuration -= delta;
            if (this.barrierPhaseDuration <= 0) {
                this.barrierPhaseActive = false;
            }
        }
        
        // Update Emergency Heal cooldown
        if (this.emergencyHeal && this.emergencyHeal.cooldown > 0) {
            this.emergencyHeal.cooldown -= delta;
        }
        
        // Check for Emergency Heal activation
        if (this.emergencyHeal && this.emergencyHeal.active && 
            this.hp / this.maxHp <= this.emergencyHeal.healThreshold && 
            this.emergencyHeal.cooldown <= 0) {
            this.activateEmergencyHeal();
        }
    }
    
    /**
     * Update targeting system - track current target and decide when to switch
     * 
     * @private
     * @param {Object} nearestEnemy - Closest enemy to player
     * @param {number} delta - Time elapsed since last frame
     */
    _updateTargeting(nearestEnemy, delta) {
        // Check if we should switch targets
        const shouldSwitchTarget = !this.currentTarget || 
                                 this.currentTarget !== nearestEnemy ||
                                 this.currentTarget.health <= 0 ||
                                 this.rotationTime > GameConfig.PLAYER.MAX_ROTATION_TIME;
        
        if (shouldSwitchTarget) {
            this.currentTarget = nearestEnemy;
            this.isRotating = true;
            this.rotationTime = 0;
        }
        
        // Update target angle with predictive aiming for moving enemies
        if (this.currentTarget) {
            this.targetAngle = this._calculatePredictiveAngle(this.currentTarget);
        }
        
        // Update rotation timer if currently rotating
        if (this.isRotating) {
            this.rotationTime += delta;
        }
    }
    
    /**
     * Update player rotation towards target angle
     * 
     * @private
     * @param {number} delta - Time elapsed since last frame
     */
    _updateRotation(delta) {
        if (this.targetAngle === null) return;
        
        // Check if already facing target within tolerance
        if (MathUtils.isAngleWithinTolerance(this.angle, this.targetAngle, GameConfig.PLAYER.FIRING_TOLERANCE)) {
            this.isRotating = false;
            this.rotationTime = 0;
            return;
        }
        
        // Mark as rotating if we're not within tolerance
        this.isRotating = true;
        
        // Calculate rotation amount for this frame with rotation speed modifier
        const baseRotationSpeed = GameConfig.PLAYER.ROTATION_SPEED;
        const modifiedRotationSpeed = baseRotationSpeed * this.rotationSpeedMod;
        const maxRotation = modifiedRotationSpeed * (delta / 1000);
        
        // Use smooth angle interpolation with speed limiting
        const angleDiff = MathUtils.angleDifference(this.angle, this.targetAngle);
        const rotationAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxRotation);
        
        this.angle = MathUtils.normalizeAngle(this.angle + rotationAmount);
    }
    
    /**
     * Update firing logic - fire when reasonably aimed, even during minor adjustments
     * 
     * @private
     * @param {Object} game - Game instance
     */
    _updateFiring(game) {
        // Fire if we have a target, are off cooldown, and are reasonably aimed
        const hasValidTarget = this.currentTarget && this.currentTarget.health > 0;
        const isOffCooldown = this.fireCooldown <= 0;
        
        // Use current predictive angle for firing check to ensure accuracy
        const currentPredictiveAngle = this._calculatePredictiveAngle(this.currentTarget);
        const isReasonablyAimed = currentPredictiveAngle !== null && 
            MathUtils.isAngleWithinTolerance(this.angle, currentPredictiveAngle, GameConfig.PLAYER.FIRING_TOLERANCE);
        
        if (hasValidTarget && isOffCooldown && isReasonablyAimed) {
            // Use the predictive angle for firing to ensure we hit moving targets
            this.fireProjectile(game, currentPredictiveAngle);
            this.fireCooldown = this.getFireInterval();
        }
    }
    
    /**
     * Find the optimal target enemy using priority-based selection algorithm
     * Prioritizes enemies based on distance and health remaining
     * Only targets enemies within the visible game area
     * 
     * @param {Array<import('./Enemy.js').Enemy>} enemies - Array of enemy objects to evaluate
     * @returns {Object|null} Best target enemy or null if none available
     * 
     * @example
     * const target = player.findNearestEnemy(game.enemies);
     * if (target) {
     *   console.log(`Targeting enemy at (${target.x}, ${target.y})`);
     * }
     */
    findNearestEnemy(enemies) {
        if (!Array.isArray(enemies) || enemies.length === 0) {
            return null;
        }
        
        // Get canvas dimensions for boundary checking
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('gameCanvas'));
        if (!canvas) return null;
        
        const targetingMargin = 10; // Don't target enemies too close to edge
        const minX = targetingMargin;
        const minY = targetingMargin;
        const maxX = canvas.width - targetingMargin;
        const maxY = canvas.height - targetingMargin;
        
        let bestTarget = null;
        let bestPriority = Infinity;
        
        for (const enemy of enemies) {
            if (enemy.dying) continue; // Skip enemies already dying
            
            // Skip enemies outside the visible targeting area
            if (enemy.x < minX || enemy.x > maxX || enemy.y < minY || enemy.y > maxY) {
                continue;
            }
            
            const distance = this._calculateDistanceTo(enemy);
            // Lower health enemies get higher priority (lower score)
            const healthFactor = (enemy.maxHealth - enemy.health) * 0.1;
            const priority = distance - healthFactor;
            
            if (priority < bestPriority) {
                bestPriority = priority;
                bestTarget = enemy;
            }
        }
        
        return bestTarget;
    }
    
    /**
     * Calculate Euclidean distance to another entity
     * 
     * @private
     * @param {Object} entity - Entity with position properties
     * @param {number} entity.x - Entity x coordinate
     * @param {number} entity.y - Entity y coordinate
     * @returns {number} Distance to entity in pixels
     */
    _calculateDistanceTo(entity) {
        const dx = entity.x - this.x;
        const dy = entity.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate predictive angle to lead moving targets
     * 
     * @private
     * @param {Object} target - Target enemy with position and velocity
     * @returns {number} Predicted angle to intercept the target
     */
    _calculatePredictiveAngle(target) {
        if (!target) return null;
        
        // Calculate basic angle to current position
        const basicAngle = MathUtils.angleBetween(this.x, this.y, target.x, target.y);
        
        // If target has no velocity data or is not moving, use basic angle
        if (!target.vx || !target.vy || (Math.abs(target.vx) < 0.1 && Math.abs(target.vy) < 0.1)) {
            return basicAngle;
        }
        
        // Calculate time for projectile to reach target
        const distance = this._calculateDistanceTo(target);
        const projectileSpeed = GameConfig.PLAYER.BASE_PROJECTILE_SPEED * this.projectileSpeedMod;
        const timeToTarget = distance / projectileSpeed;
        
        // Predict where target will be when projectile arrives
        const predictedX = target.x + (target.vx * timeToTarget);
        const predictedY = target.y + (target.vy * timeToTarget);
        
        // Return angle to predicted position
        return MathUtils.angleBetween(this.x, this.y, predictedX, predictedY);
    }
    
    /**
     * Calculate effective fire interval based on current fire rate modifier
     * 
     * @returns {number} Time between shots in milliseconds
     * @example
     * // With fireRateMod = 2.0, fires twice as fast
     * const interval = player.getFireInterval(); // Returns baseFireRate / 2
     */
    getFireInterval() {
        return this.baseFireRate / this.fireRateMod;
    }
    
    /**
     * Fire projectile(s) based on current power-up configuration
     * Handles single shots, triple shots, and all projectile modifications
     * 
     * @param {import('./Game.js').Game} game - Game instance for adding projectiles and effects
     * @param {number} [overrideAngle] - Optional angle override for predictive firing
     */
    fireProjectile(game, overrideAngle = null) {
        const damage = GameConfig.PLAYER.BASE_DAMAGE * this.damageMod;
        const firingAngle = overrideAngle !== null ? overrideAngle : this.angle;
        
        // Check for Overcharge Burst
        let isOverchargeBurst = false;
        if (this.overchargeBurst && this.overchargeBurst.active) {
            this.overchargeBurst.shotCounter++;
            if (this.overchargeBurst.shotCounter >= this.overchargeBurst.burstInterval) {
                isOverchargeBurst = true;
                this.overchargeBurst.shotCounter = 0;
            }
        }
        
        if (isOverchargeBurst) {
            this._fireOverchargeBurst(game, damage, firingAngle);
        } else if (this.hasTripleShot) {
            this._fireTripleShot(game, damage, firingAngle);
        } else {
            this._fireSingleShot(game, damage, firingAngle);
        }
        
        this.createMuzzleFlash(game);
        
        // Play shoot sound effect if available
        playSFX('shoot');
    }
    
    /**
     * Fire three projectiles in a spread pattern
     * 
     * @private
     * @param {Object} game - Game instance
     * @param {number} damage - Base damage per projectile
     * @param {number} centerAngle - Center angle for the triple shot
     */
    _fireTripleShot(game, damage, centerAngle) {
        const spreadAngle = Math.PI / 12; // 15 degrees spread

        // Calculate damage for side projectiles
        const tripleShotStacks = this.powerUpStacks["Triple Shot"] || 1;
        const damageModifier = Math.min(0.2 + (tripleShotStacks - 1) * 0.1, 1.0);

        // Main projectile (center)
        this._fireSingleShot(game, damage, centerAngle);

        // Side projectiles
        const leftAngle = centerAngle - spreadAngle;
        const rightAngle = centerAngle + spreadAngle;

        const leftProjectile = this._createProjectile(leftAngle, damage * damageModifier);
        leftProjectile.isExtra = true;
        game.projectiles.push(leftProjectile);

        const rightProjectile = this._createProjectile(rightAngle, damage * damageModifier);
        rightProjectile.isExtra = true;
        game.projectiles.push(rightProjectile);
    }
    
    /**
     * Fire a single projectile straight ahead
     * 
     * @private
     * @param {Object} game - Game instance
     * @param {number} damage - Projectile damage
     * @param {number} angle - Firing angle
     */
    _fireSingleShot(game, damage, angle) {
        const projectile = this._createProjectile(angle, damage);
        game.projectiles.push(projectile);
    }
    
    /**
     * Fire an overcharged burst projectile with enhanced damage
     * 
     * @private
     * @param {Object} game - Game instance
     * @param {number} damage - Base projectile damage
     * @param {number} angle - Firing angle
     */
    _fireOverchargeBurst(game, damage, angle) {
        const burstDamage = damage * this.overchargeBurst.burstDamageMultiplier;
        const projectile = this._createProjectile(angle, burstDamage);
        
        // Special properties for overcharge burst
        projectile.isOverchargeBurst = true;
        projectile.ignoresShields = this.overchargeBurst.ignoresShields;
        projectile.glowColor = '#ffff00'; // Bright yellow for overcharge burst
        projectile.size = 8; // Larger projectile
        
        game.projectiles.push(projectile);
        
        console.log('Overcharge Burst fired!');
    }
    
    /**
     * Create a projectile with current power-up modifications applied
     * 
     * @private
     * @param {number} angle - Projectile trajectory angle in radians
     * @param {number} damage - Base damage value
     * @returns {Projectile} Fully configured projectile instance
     */
    _createProjectile(angle, damage) {
        const projectile = new Projectile(
            this.x, this.y, angle, damage, this.projectileSpeedMod
        );
        
        this._applyProjectileModifications(projectile);
        return projectile;
    }
    
    /**
     * Apply power-up modifications to a projectile instance
     * 
     * @private
     * @param {Projectile} projectile - Projectile to modify
     */
    _applyProjectileModifications(projectile) {
        if (this.piercingLevel > 0) {
            projectile.piercing = true;
            projectile.piercingCount = this.piercingLevel;
            projectile.originalDamage = projectile.damage; // Store original damage for reduction calculation
            projectile.enemiesHit = 0; // Track how many enemies this projectile has hit
        }
        
        if (this.explosiveShots) {
            projectile.explosive = true;
            projectile.explosionRadius = this.explosionRadius;
            projectile.explosionDamage = this.explosionDamage;
        }
        
        // Apply Shield Breaker effects
        if (this.hasShieldBreaker) {
            projectile.hasShieldBreaker = true;
            projectile.shieldBreakerDamage = this.shieldBreakerDamage;
            projectile.shieldRegenDelay = this.shieldRegenDelay;
        }
        
        // Apply Adaptive Targeting homing effect
        if (this.hasHomingShots) {
            projectile.hasHoming = true;
            projectile.homingStrength = 0.1; // Slight homing effect
        }
        
        // Apply Lucky Shots critical hit chance
        if (this.luckyShots && this.luckyShots.active) {
            const critRoll = Math.random();
            if (critRoll < this.luckyShots.chance) {
                projectile.isCritical = true;
                projectile.damage *= 2; // Double damage for critical hits
                
                // Visual indicator for critical projectiles
                projectile.glowColor = '#ffff00'; // Golden glow for crits
                projectile.isCriticalVisual = true;
            }
        }
    }
    
    /**
     * Create visual muzzle flash effect when firing
     * Spawns particles at the gun barrel tip
     * 
     * @param {import('./Game.js').Game} game - Game instance for adding particles
     */
    createMuzzleFlash(game) {
        // Calculate position at gun barrel tip
        const flashDistance = this.radius + GameConfig.PLAYER.MUZZLE_FLASH_DISTANCE;
        const flashX = this.x + Math.cos(this.angle) * flashDistance;
        const flashY = this.y + Math.sin(this.angle) * flashDistance;
        
        // Create small white particles with random spread using game's particle pool
        for (let i = 0; i < GameConfig.PLAYER.MUZZLE_FLASH_PARTICLES; i++) {
            const angle = this.angle + (Math.random() - 0.5) * 0.5; // ±0.25 radian spread
            const speed = 30 + Math.random() * 20; // 30-50 pixel/second speed
            const life = 100 + Math.random() * 100; // 100-200ms lifetime
            
            // Use game's particle pool instead of creating new Particle
            const particle = game.particlePool.get(
                flashX, flashY,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                '#fff'
            );
            
            game.particles.push(particle);
        }
    }
    
    /**
     * Apply damage to player, prioritizing shield absorption
     * Shield absorbs damage first, then health takes remaining damage
     * 
     * @param {number} amount - Total damage amount to apply
     * @throws {Error} If amount is negative
     * 
     * @example
     * player.takeDamage(25); // Applies 25 damage to shield first, then health
     */
    takeDamage(amount) {
        if (amount < 0) {
            throw new Error('Damage amount cannot be negative');
        }
        
        // Check if Barrier Phase is active (invulnerability)
        if (this.barrierPhaseActive) {
            return; // No damage taken during barrier phase
        }
        
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
    
    /**
     * Heal the player by specified amount, capped at maximum health
     * Creates visual floating text effect if available
     * 
     * @param {number} amount - Amount of health to restore
     * @throws {Error} If amount is negative
     * 
     * @example
     * player.heal(15); // Restores 15 HP, shows "+15 health" floating text
     */
    heal(amount) {
        if (amount < 0) {
            throw new Error('Heal amount cannot be negative');
        }
        
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }
    
    /**
     * Heal the player's shield by specified amount, capped at maximum
     * Only works if shield power-up is active
     * 
     * @param {number} amount - Amount of shield to restore
     * @returns {boolean} True if healing occurred, false if no shield
     */
    healShield(amount) {
        if (!this.hasShield) return false;
        this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + amount);
        return true;
    }
    
    /**
     * Activate Barrier Phase for temporary invulnerability
     * Player becomes invulnerable for a short duration
     */
    activateBarrierPhase() {
        this.barrierPhaseActive = true;
        this.barrierPhaseCooldown = this.barrierPhaseMaxCooldown;
        this.barrierPhaseDuration = 3000; // Reset duration to 3 seconds
        
        // Visual indicator - could add particle effects here
        console.log('Barrier Phase activated! Invulnerable for 3 seconds!');
    }
    
    /**
     * Activate Emergency Heal to restore health
     * Automatically heals player when health is critically low
     */
    activateEmergencyHeal() {
        const healAmount = Math.floor(this.maxHp * this.emergencyHeal.healTarget);
        this.hp = Math.min(this.maxHp, healAmount);
        this.emergencyHeal.cooldown = this.emergencyHeal.maxCooldown;
        
        console.log(`Emergency Heal activated! Restored to ${Math.floor(this.emergencyHeal.healTarget * 100)}% health!`);
    }
    
    /**
     * Apply slow field effect to all enemies within range
     * Slows enemy movement based on stack count (15% per stack, max 90%)
     * 
     * @param {Array<import('./Enemy.js').Enemy>} enemies - Array of enemy objects to affect
     */
    applySlowField(enemies) {
        if (this.slowFieldStrength <= 0) return; // No slow field effect
        
        // Calculate effective slow factor
        // Each stack = 10% more slow, capped at 60% slow (6 stacks max)
        const slowFactor = Math.max(0.1, 1 - (this.slowFieldStrength * 0.10));
        
        enemies.forEach(enemy => {
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.slowFieldRadius) {
                enemy.slowFactor = slowFactor;
            } else {
                enemy.slowFactor = 1; // Normal speed outside field
            }
        });
    }
    
    /**
     * Apply Immolation Aura burn damage to nearby enemies
     * Deals percentage-based damage over time to all enemies within range
     * 
     * @param {Array<Object>} enemies - Array of enemy objects to affect
     * @param {number} delta - Time elapsed since last frame (milliseconds)
     */
    applyImmolationAura(enemies, delta) {
        if (!this.immolationAura || !this.immolationAura.active) return;
        
        const damagePerSecond = this.immolationAura.damagePercent;
        const range = this.immolationAura.range;
        const deltaSeconds = delta / 1000;
        
        enemies.forEach(enemy => {
            if (enemy.dying) return; // Skip dying enemies
            
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= range) {
                // Apply burn damage as percentage of enemy's max health
                const burnDamage = enemy.maxHealth * damagePerSecond * deltaSeconds;
                enemy.health -= burnDamage;
                
                // Ensure enemy doesn't go below 0 health
                if (enemy.health <= 0) {
                    enemy.health = 0;
                    enemy.dying = true;
                }
            }
        });
    }
    
    /**
     * Handle life steal effect when an enemy is killed
     * Heals player for 10% of enemy's maximum health if life steal is active
     * 
     * @param {Object} enemy - The killed enemy object
     * @param {number} enemy.maxHealth - Enemy's maximum health value
     */
    onEnemyKill(enemy) {
        if (this.hasLifeSteal) {
            const healAmount = enemy.maxHealth * 0.01; // Heal 1% of enemy's max health
            this.heal(healAmount);
        }
    }
    
    /**
     * Get list of non-stackable power-ups currently owned by player
     * Used by shop system to prevent duplicate purchases
     * 
     * @returns {string[]} Array of power-up names that cannot be purchased again
     * 
     * @example
     * const owned = player.getNonStackablePowerUps();
     * // Returns: ["Life Steal", "Explosive Shots"] if player has those
     */
    getNonStackablePowerUps() {
        const owned = [];
        
        if (this.hasLifeSteal) owned.push("Life Steal");
        if (this.explosiveShots) owned.push("Explosive Shots");
        if (this.hasAdaptiveTargeting) owned.push("Adaptive Targeting");
        if (this.hasBarrierPhase) owned.push("Barrier Phase");
        
        // Add slow field if it's at maximum stacks
        if (this.isSlowFieldMaxed()) owned.push("Slow Field");
        
        return owned;
    }
    
    /**
     * Check if slow field power-up is at maximum stack count
     * 
     * @returns {boolean} True if slow field cannot be upgraded further
     */
    isSlowFieldMaxed() {
        return this.slowFieldStrength >= this.maxSlowFieldStacks;
    }

    /**
     * Add coins to the player's total with visual feedback
     * Creates floating text showing coin gain
     * 
     * @param {number} amount - Number of coins to add (must be positive)
     * @throws {Error} If amount is negative or not a number
     * 
     * @example
     * player.addCoins(10); // Adds 10 coins, shows "+10 coins" text
     */
    addCoins(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Coin amount must be a positive number');
        }
        
        this.coins += amount;
        
        // Create floating text effect if UI system is available
        const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('gameCanvas'));
        const rect = canvas.getBoundingClientRect();
        createFloatingText(
            `+${amount.toFixed(1)} coins`,
            this.x * (rect.width / canvas.width) + rect.left,
            (this.y - 40) * (rect.height / canvas.height) + rect.top,
            'coins'
        );
    }

    /**
     * Attempt to spend coins from player's total
     * 
     * @param {number} amount - Number of coins to spend
     * @returns {boolean} True if transaction successful, false if insufficient funds
     * @throws {Error} If amount is negative or not a number
     * 
     * @example
     * if (player.spendCoins(50)) {
     *   console.log("Purchase successful!");
     * } else {
     *   console.log("Not enough coins!");
     * }
     */
    spendCoins(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            throw new Error('Spend amount must be a positive number');
        }
        
        if (this.coins >= amount) {
            this.coins -= amount;
            return true;
        }
        return false;
    }

    /**
     * Render the player and all associated visual effects
     * Draws player body, gun barrel, shield, slow field, immolation aura, and rotation indicators
     * 
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
     * 
     * @example
     * const ctx = canvas.getContext('2d');
     * player.draw(ctx); // Renders player at current position
     */
    draw(ctx) {
        // Save context for transformations
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Set glow effect - change color when rotating
        const glowColor = this.isRotating ? '#ff6d00' : '#ff2dec';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw player body (triangle shape) - change color when rotating
        const bodyColor = this.isRotating ? '#ff6d00' : '#ff2dec';
        ctx.fillStyle = bodyColor;
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
        
        // Draw targeting indicator when rotating
        if (this.isRotating && this.targetAngle !== null && this.currentTarget) {
            ctx.save();
            ctx.strokeStyle = '#ff6d00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.globalAlpha = 0.7;
            
            // Draw line to target
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.currentTarget.x, this.currentTarget.y);
            ctx.stroke();
            
            // Draw target angle indicator
            ctx.strokeStyle = '#ff6d00';
            ctx.lineWidth = 3;
            ctx.setLineDash([]);
            ctx.globalAlpha = 0.5;
            
            const indicatorLength = this.radius + 25;
            const targetX = this.x + Math.cos(this.targetAngle) * indicatorLength;
            const targetY = this.y + Math.sin(this.targetAngle) * indicatorLength;
            
            ctx.beginPath();
            ctx.moveTo(this.x + Math.cos(this.targetAngle) * this.radius, 
                      this.y + Math.sin(this.targetAngle) * this.radius);
            ctx.lineTo(targetX, targetY);
            ctx.stroke();
            
            ctx.restore();
        }
        
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
        
        // Draw Immolation Aura if active
        if (this.immolationAura && this.immolationAura.active) {
            ctx.save();
            
            // Create pulsing fire effect
            const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() / 300);
            const stackCount = this.powerUpStacks["Immolation Aura"] || 1;
            
            // Gradient from center to edge for fire effect
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.immolationAura.range
            );
            gradient.addColorStop(0, `rgba(255, 69, 0, ${0.3 * pulseIntensity})`);
            gradient.addColorStop(0.5, `rgba(255, 140, 0, ${0.2 * pulseIntensity})`);
            gradient.addColorStop(1, `rgba(255, 69, 0, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.immolationAura.range, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw outer ring with fire colors
            ctx.strokeStyle = `rgba(255, 69, 0, ${pulseIntensity * 0.8})`;
            ctx.lineWidth = 2 + stackCount; // Thicker with more stacks
            ctx.shadowColor = '#ff4500';
            ctx.shadowBlur = 10 + stackCount * 2;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.immolationAura.range, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // Draw Barrier Phase if active
        if (this.barrierPhaseActive) {
            ctx.save();
            
            // Create shimmering barrier effect
            const shimmerIntensity = 0.7 + 0.3 * Math.sin(Date.now() / 100);
            const barrierRadius = this.radius + 25;
            
            // Outer barrier ring
            ctx.strokeStyle = `rgba(255, 255, 255, ${shimmerIntensity})`;
            ctx.lineWidth = 4;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 20;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, barrierRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Inner barrier ring
            ctx.strokeStyle = `rgba(200, 200, 255, ${shimmerIntensity * 0.6})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 10;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, barrierRadius - 8, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
}
