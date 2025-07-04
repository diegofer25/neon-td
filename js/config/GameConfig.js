/**
 * @fileoverview Centralized game configuration and balance settings
 * 
 * This module contains all game constants, balance parameters, and configuration
 * settings. Centralizing these values makes it easy to tune gameplay, maintain
 * balance, and ensure consistency across the entire game.
 * 
 * Configuration is organized into logical groups:
 * - CANVAS: Display and rendering settings
 * - PLAYER: Player character stats and abilities
 * - ENEMY: Enemy behavior and scaling
 * - WAVE: Wave progression and difficulty
 * - POWERUP_PRICES: Shop pricing for all power-ups
 * - STACK_LIMITS: Maximum stacks for upgradeable power-ups
 * - VFX: Visual effects and performance settings
 * - ECONOMY: Coin rewards and economic balance
 * - BALANCE: High-level balance constraints
 * 
 * @example
 * // Using configuration values
 * const playerHealth = GameConfig.PLAYER.BASE_HP;
 * const enemyCount = GameConfig.DERIVED.getEnemyCountForWave(5);
 * const powerUpPrice = GameConfig.POWERUP_PRICES["Damage Boost"];
 * 
 * // Validating dimensions
 * GameConfig.CANVAS.validateDimensions(800, 600);
 */

/**
 * Validates that a numeric value is within specified bounds
 * 
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @param {string} name - Descriptive name for error messages
 * @throws {Error} If value is outside the valid range
 */
function validateRange(value, min, max, name) {
    if (value < min || value > max) {
        throw new Error(`${name} must be between ${min} and ${max}, got ${value}`);
    }
}

/**
 * Main game configuration object containing all game constants and settings
 * 
 * This object is frozen to prevent accidental modification during runtime.
 * All values should be carefully considered as they affect game balance.
 */
export const GameConfig = {
    /**
     * Canvas and display configuration
     * 
     * Controls the game's visual presentation and responsive behavior.
     * The game maintains a 4:3 aspect ratio for consistent gameplay
     * across different screen sizes.
     */
    CANVAS: {
        /** @type {number} Target aspect ratio (width/height) for consistent gameplay */
        TARGET_ASPECT_RATIO: 4/3,
        
        /** @type {number} Minimum canvas width in pixels for playability */
        MIN_WIDTH: 320,
        
        /** @type {number} Maximum canvas width in pixels to prevent UI scaling issues */
        MAX_WIDTH: 800,
        
        /** @type {number} Maximum canvas height in pixels */
        MAX_HEIGHT: 600,
        
        /**
         * Validates canvas dimensions against game requirements
         * 
         * @param {number} width - Proposed canvas width
         * @param {number} height - Proposed canvas height
         * @throws {Error} If dimensions are outside valid ranges
         */
        validateDimensions(width, height) {
            validateRange(width, this.MIN_WIDTH, this.MAX_WIDTH, 'Canvas width');
            validateRange(height, this.MIN_WIDTH * 0.75, this.MAX_HEIGHT, 'Canvas height');
        }
    },

    /**
     * Player character configuration
     * 
     * Base stats for the player character. These values are modified
     * by power-ups during gameplay but serve as the starting point
     * and reference for balance calculations.
     */
    PLAYER: {
        /** @type {number} Starting and base health points */
        BASE_HP: 100,
        /** @type {number} Base damage per projectile before modifiers */
        BASE_DAMAGE: 10,
        /** @type {number} Base fire rate in milliseconds between shots */
        BASE_FIRE_RATE: 1000,
        /** @type {number} Player collision radius in pixels */
        RADIUS: 20,
        /** @type {number} Base projectile speed in pixels per second */
        BASE_PROJECTILE_SPEED: 400,
        // Player-specific ability constants
        /** @type {number} Number of enemies piercing shots can hit */
        PIERCING_COUNT: 3,
        /** @type {number} Damage reduction per enemy pierced (0.25 = 25% reduction) */
        PIERCING_DAMAGE_REDUCTION: 0.25,
        /** @type {number} Angle spread for triple shot in radians */
        TRIPLE_SHOT_SPREAD: 0.3,
        /** @type {number} Percentage of enemy max health restored on kill with life steal */
        LIFE_STEAL_PERCENTAGE: 0.1,
        // Player rotation and aiming system
        /** @type {number} Player rotation speed in radians per second */
        ROTATION_SPEED: Math.PI * 2, // 360 degrees per second
        /** @type {number} Angular tolerance for firing in radians (approximately 5 degrees) */
        FIRING_TOLERANCE: Math.PI / 36,
        /** @type {number} Maximum time to spend rotating before giving up on target in milliseconds */
        MAX_ROTATION_TIME: 1500,
        /** @type {number} Maximum health points */
        MAX_HP: 100,
        /** @type {number} Base radius for slow field effect */
        SLOW_FIELD_BASE_RADIUS: 80,
        /** @type {number} Maximum slow field stack count */
        MAX_SLOW_FIELD_STACKS: 6,
        /** @type {number} Number of particles in muzzle flash effect */
        MUZZLE_FLASH_PARTICLES: 3,
        /** @type {number} Distance from player center to muzzle flash */
        MUZZLE_FLASH_DISTANCE: 10
    },

    /**
     * Enemy configuration and behavior
     * 
     * Base stats for enemy units. Different enemy types use multipliers
     * on these base values, and wave scaling further modifies them.
     */
    ENEMY: {
        /** @type {number} Base health points for standard enemies */
        BASE_HEALTH: 10,
        
        /** @type {number} Base movement speed in pixels per second */
        BASE_SPEED: 40,
        
        /** @type {number} Base damage dealt to player on contact */
        BASE_DAMAGE: 10,
        
        /** @type {number} Enemy collision radius in pixels */
        RADIUS: 15,
        
        /** @type {number} Distance outside screen bounds where enemies spawn */
        SPAWN_MARGIN: 50,
        
        /**
         * Enemy variant multipliers for creating different enemy types
         * 
         * Each variant applies these multipliers to base stats:
         * - FAST: Low health, high speed glass cannons
         * - TANK: High health, low speed bullet sponges
         */
        VARIANTS: {
            FAST: { health: 0.5, speed: 2.0, damage: 1.5 },
            TANK: { health: 3.0, speed: 0.5, damage: 2.5 }
        }
    },

    /**
     * Wave progression and difficulty scaling
     * 
     * Controls how the game becomes more challenging over time.
     * Linear enemy count growth combined with exponential stat scaling
     * creates a smooth but accelerating difficulty curve.
     */
    WAVE: {
        /** @type {number} Number of enemies in wave 1 */
        BASE_ENEMY_COUNT: 4,
        
        /** @type {number} Additional enemies per wave (linear growth) */
        ENEMY_COUNT_SCALING: 2,
        
        /**
         * Exponential scaling factors applied each wave
         * 
         * Each wave multiplies enemy stats by these factors.
         * Values > 1.0 increase difficulty, < 1.0 would decrease it.
         */
        SCALING_FACTORS: {
            /** @type {number} Health multiplier per wave (15% increase) */
            HEALTH: 1.5,
            
            /** @type {number} Speed multiplier per wave (12% increase) */
            SPEED: 1.12,
            
            /** @type {number} Damage multiplier per wave (10% increase) */
            DAMAGE: 1.10
        },
        
        // Enemy spawn timing controls
        
        /** @type {number} Initial time between enemy spawns in milliseconds */
        BASE_SPAWN_INTERVAL: 800,
        
        /** @type {number} Minimum spawn interval to prevent overwhelming spam */
        MIN_SPAWN_INTERVAL: 300,
        
        /** @type {number} Reduction in spawn interval per wave in milliseconds */
        SPAWN_INTERVAL_REDUCTION: 20
    },

    /**
     * Power-up shop pricing
     * 
     * Base prices in coins for each power-up. Actual prices may be modified
     * by stacking multipliers and wave-based inflation. Prices are balanced
     * around the expected coin income per wave.
     */
    POWERUP_PRICES: {
        // Common offensive upgrades (affordable early game)
        "Damage Boost": 15,
        "Fire Rate": 12,
        "Speed Boost": 10,
        "Turn Speed": 18,
        
        // Defensive options (moderate cost)
        "Max Health": 20,
        "Shield": 30,
        "Full Heal": 25,
        
        // Advanced abilities (higher cost, more impactful)
        "Piercing Shots": 35,
        "Triple Shot": 40,
        "Explosive Shots": 60,
        
        // Rare and powerful upgrades (premium pricing)
        "Life Steal": 50,
        "Double Damage": 80,
        "Rapid Fire": 55,
        
        // Utility and support abilities
        "Slow Field": 25,
        "Regeneration": 45,
        "Shield Regen": 40,
        "Bigger Explosions": 35,
        "Coin Magnet": 20,
        "Lucky Shots": 30,
        "Immolation Aura": 55,
        "Time Dilation": 70,
        "Phantom Dash": 60,
        "Multishot": 45,
        "Chain Lightning": 65,
        "Ricochet": 35
    },

    /**
     * Maximum stack limits for upgradeable power-ups
     * 
     * Prevents infinite scaling while allowing meaningful progression.
     * Limits are set to provide significant power increases without
     * breaking game balance in later waves.
     */
    STACK_LIMITS: {
        // Damage scaling (multiplicative effects)
        "Damage Boost": 10,    // Up to 15x damage (1.5^10)
        "Double Damage": 5,    // Up to 32x damage (2^5)
        
        // Attack speed (multiplicative effects)
        "Fire Rate": 8,        // Up to 6.3x attack speed (1.25^8)
        "Rapid Fire": 5,       // Up to 7.6x attack speed (1.5^5)
        
        // Movement and aiming (multiplicative effects)
        "Turn Speed": 8,       // Up to 4.3x rotation speed (1.2^8)
        
        // Health and defense (additive effects)
        "Max Health": 10,      // Up to 300% base health
        "Shield": 8,           // Up to 250 shield points
        
        // Regeneration (additive effects)
        "Regeneration": 10,    // Up to 50 HP/second
        "Shield Regen": 8,     // Up to 80 shield/second
        
        // Other utility abilities
        "Speed Boost": 6,      // Up to 4.7x projectile speed
        "Bigger Explosions": 6, // Up to 11.4x explosion size
        "Slow Field": 6,       // Up to 90% enemy slow
        
        // New utility power-up limits
        "Coin Magnet": 8,      // Up to 5x coin rewards (1 + 8*0.5)
        "Lucky Shots": 5,      // Up to 50% crit chance
        "Immolation Aura": 10,   // Up to 20 damage per second
        "Multishot": 4,        // Up to 4 additional projectiles
        "Chain Lightning": 6,  // Up to 80% chance, 75 damage
        "Ricochet": 8          // Up to 2.45x damage multiplier per bounce
    },

    // Audio configuration
    AUDIO: {
        /** @type {number} Background music volume (0.0 to 1.0) */
        BGM_VOLUME: 0.3,
        
        /** @type {number} Sound effects volume (0.0 to 1.0) */
        SFX_VOLUME: 0.5
    },

    /**
     * Visual effects and performance settings
     * 
     * Controls the intensity and limits of visual effects to maintain
     * performance across different devices.
     */
    VFX: {
        /**
         * Particle system limits to prevent performance issues
         */
        PARTICLE_LIMITS: {
            /** @type {number} Maximum particles active at once */
            MAX_PARTICLES: 200,
            
            /** @type {number} Maximum projectiles active at once */
            MAX_PROJECTILES: 100
        },
        
        /**
         * Screen shake configuration for different events
         */
        SCREEN_SHAKE: {
            /** @type {number} Screen shake intensity when player is hit */
            PLAYER_HIT_INTENSITY: 10,
            
            /** @type {number} Duration of player hit screen shake in milliseconds */
            PLAYER_HIT_DURATION: 300,
            
            /** @type {number} Screen shake intensity for explosions */
            EXPLOSION_INTENSITY: 5,
            
            /** @type {number} Duration of explosion screen shake in milliseconds */
            EXPLOSION_DURATION: 200
        },
        
        /** @type {number} Background grid line spacing in pixels */
        GRID_SIZE: 50,
        
        /** @type {number} Background grid opacity (0.0 to 1.0) */
        GRID_ALPHA: 0.1
    },

    /**
     * Economic system configuration
     * 
     * Controls coin rewards, pricing inflation, and economic balance.
     * Designed to provide steady progression while maintaining challenge.
     */
    ECONOMY: {
        /** @type {number} Base coins awarded per enemy kill (reduced for better balance) */
        BASE_COIN_REWARD: 0.5,
        
        /** @type {number} Additional coins per wave level (multiplier, reduced by half) */
        WAVE_COIN_MULTIPLIER: 0.1,
        
        /** @type {number} Base coins for completing a wave */
        WAVE_COMPLETION_BASE_COINS: 10,
        
        /** @type {number} Additional coins per wave completed */
        WAVE_COMPLETION_WAVE_BONUS: 2,
        
        /** @type {number} Divisor for performance bonus calculation */
        PERFORMANCE_BONUS_DIVISOR: 5,
        
        /** @type {number} Price increase multiplier per stack of power-ups */
        SHOP_STACK_PRICE_MULTIPLIER: 0.5
    },

    /**
     * High-level balance constraints
     * 
     * These limits prevent runaway scaling and maintain game balance
     * even in very long play sessions.
     */
    BALANCE: {
        /** @type {number} Maximum multiplier for wave scaling to prevent infinite growth */
        MAX_WAVE_SCALING: 5.0,
        
        /** @type {number} Price inflation factor per wave (compound growth) */
        COIN_INFLATION_FACTOR: 1.05,
        
        /** @type {number} Minimum kill ratio for performance bonus (0.0 to 1.0) */
        PERFORMANCE_BONUS_THRESHOLD: 0.8
    }
};

/**
 * Derived calculations and complex configuration functions
 * 
 * These functions compute values based on the base configuration,
 * providing a clean interface for wave-based scaling and dynamic
 * value calculation.
 */
GameConfig.DERIVED = {
    /**
     * Calculates the number of enemies to spawn for a given wave
     * 
     * Uses linear scaling to provide steady increase in enemy count.
     * Formula: BASE_ENEMY_COUNT + (wave * ENEMY_COUNT_SCALING)
     * 
     * @param {number} wave - Wave number (1-based indexing)
     * @returns {number} Number of enemies to spawn this wave
     * @throws {Error} If wave number is less than 1
     * 
     * @example
     * const wave5Enemies = GameConfig.DERIVED.getEnemyCountForWave(5);
     * // Returns: 4 + (5 * 2) = 14 enemies
     */
    getEnemyCountForWave(wave) {
        if (wave < 1) throw new Error('Wave number must be >= 1');
        
        return Math.floor(
            GameConfig.WAVE.BASE_ENEMY_COUNT + 
            wave * GameConfig.WAVE.ENEMY_COUNT_SCALING
        );
    },
    
    /**
     * Calculates spawn interval between enemies for a given wave
     * 
     * Enemies spawn faster in later waves to maintain pressure.
     * Interval decreases linearly but has a minimum threshold.
     * 
     * @param {number} wave - Wave number (1-based indexing)
     * @returns {number} Spawn interval in milliseconds
     * @throws {Error} If wave number is less than 1
     * 
     * @example
     * const wave10Interval = GameConfig.DERIVED.getSpawnIntervalForWave(10);
     * // Returns: max(300, 800 - (10 * 20)) = 600ms
     */
    getSpawnIntervalForWave(wave) {
        if (wave < 1) throw new Error('Wave number must be >= 1');
        
        const reduction = wave * GameConfig.WAVE.SPAWN_INTERVAL_REDUCTION;
        return Math.max(
            GameConfig.WAVE.MIN_SPAWN_INTERVAL,
            GameConfig.WAVE.BASE_SPAWN_INTERVAL - reduction
        );
    },
    
    /**
     * Calculates enemy stat scaling multipliers for a given wave
     * 
     * Uses exponential scaling to create increasing difficulty.
     * Each stat scales independently based on its factor.
     * Scaling is capped to prevent infinite growth.
     * 
     * @param {number} wave - Wave number (1-based indexing)
     * @returns {{health: number, speed: number, damage: number}} Scaling multipliers
     * @throws {Error} If wave number is less than 1
     * 
     * @example
     * const wave5Scaling = GameConfig.DERIVED.getScalingForWave(5);
     * // Returns: { health: 1.75, speed: 1.46, damage: 1.75 }
     * // (approximately, using 1.15^4 for health/damage, 1.1^4 for speed)
     */
    getScalingForWave(wave) {
        if (wave < 1) throw new Error('Wave number must be >= 1');
        
        const { SCALING_FACTORS } = GameConfig.WAVE;
        const waveIndex = wave - 1; // Convert to 0-based for calculations
        
        return {
            health: Math.min(
                Math.pow(SCALING_FACTORS.HEALTH, waveIndex),
                GameConfig.BALANCE.MAX_WAVE_SCALING
            ),
            speed: Math.min(
                Math.pow(SCALING_FACTORS.SPEED, waveIndex),
                GameConfig.BALANCE.MAX_WAVE_SCALING
            ),
            damage: Math.min(
                Math.pow(SCALING_FACTORS.DAMAGE, waveIndex),
                GameConfig.BALANCE.MAX_WAVE_SCALING
            )
        };
    },
    
    /**
     * Calculates adjusted power-up price with wave inflation and stacking
     * 
     * Prices increase over time to maintain economic balance as players
     * earn more coins. Stacking multiplier makes repeated purchases
     * more expensive to encourage build diversity.
     * 
     * @param {string} powerUpName - Name of the power-up (must exist in POWERUP_PRICES)
     * @param {number} wave - Current wave number for inflation calculation
     * @param {number} [stacks=0] - Current number of stacks owned
     * @returns {number} Final price in coins (minimum 1)
     * 
     * @example
     * // Base price calculation
     * const basePrice = GameConfig.DERIVED.getAdjustedPowerUpPrice("Damage Boost", 1, 0);
     * // Returns: 15 coins (base price, no inflation or stacking)
     * 
     * // With inflation and stacking
     * const lateGamePrice = GameConfig.DERIVED.getAdjustedPowerUpPrice("Damage Boost", 10, 3);
     * // Returns: ~31 coins (15 * 1.05^9 * (1 + 3*0.5))
     */
    getAdjustedPowerUpPrice(powerUpName, wave, stacks = 0) {
        const basePrice = GameConfig.POWERUP_PRICES[powerUpName] || 20;
        const waveInflation = Math.pow(GameConfig.BALANCE.COIN_INFLATION_FACTOR, wave - 1);
        const stackMultiplier = 1 + (stacks * GameConfig.ECONOMY.SHOP_STACK_PRICE_MULTIPLIER);
        
        return Math.max(1, Math.floor(basePrice * waveInflation * stackMultiplier));
    }
};

// Freeze configuration objects to prevent runtime modification
// This ensures game balance remains consistent throughout play
Object.freeze(GameConfig);
Object.freeze(GameConfig.DERIVED);
