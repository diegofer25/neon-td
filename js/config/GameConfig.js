/**
 * @fileoverview Centralized game configuration
 * Contains all game constants and derived calculations
 */

/**
 * Validates that a value is within specified bounds
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @param {string} name - Name for error messages
 * @throws {Error} If value is out of bounds
 */
function validateRange(value, min, max, name) {
    if (value < min || value > max) {
        throw new Error(`${name} must be between ${min} and ${max}, got ${value}`);
    }
}

/**
 * Main game configuration object
 * All game constants should be defined here for easy balancing
 */
export const GameConfig = {
    // Rendering and display settings
    CANVAS: {
        TARGET_ASPECT_RATIO: 4/3,
        MIN_WIDTH: 320,
        MAX_WIDTH: 800,
        MAX_HEIGHT: 600,
        
        // Validate canvas dimensions
        validateDimensions(width, height) {
            validateRange(width, this.MIN_WIDTH, this.MAX_WIDTH, 'Canvas width');
            validateRange(height, this.MIN_WIDTH * 0.75, this.MAX_HEIGHT, 'Canvas height');
        }
    },

    // Player character settings
    PLAYER: {
        BASE_HP: 100,
        BASE_DAMAGE: 10,
        BASE_FIRE_RATE: 300, // milliseconds
        RADIUS: 20,
        BASE_PROJECTILE_SPEED: 400,
        
        // Player ability constants
        PIERCING_COUNT: 2,
        TRIPLE_SHOT_SPREAD: 0.3, // radians
        LIFE_STEAL_PERCENTAGE: 0.1
    },

    // Enemy configuration
    ENEMY: {
        BASE_HEALTH: 50,
        BASE_SPEED: 50,
        BASE_DAMAGE: 10,
        RADIUS: 15,
        SPAWN_MARGIN: 50,
        
        // Enemy variant multipliers
        VARIANTS: {
            FAST: { health: 0.5, speed: 2.0, damage: 1.5 },
            TANK: { health: 3.0, speed: 0.5, damage: 2.5 }
        }
    },

    // Wave progression and difficulty scaling
    WAVE: {
        BASE_ENEMY_COUNT: 4,
        ENEMY_COUNT_SCALING: 2,
        
        // Exponential scaling factors per wave
        SCALING_FACTORS: {
            HEALTH: 1.15,
            SPEED: 1.1, 
            DAMAGE: 1.15
        },
        
        // Spawn timing
        BASE_SPAWN_INTERVAL: 800,
        MIN_SPAWN_INTERVAL: 300,
        SPAWN_INTERVAL_REDUCTION: 20
    },

    // Power-up pricing
    POWERUP_PRICES: {
        "Damage Boost": 15,
        "Fire Rate": 12,
        "Piercing Shots": 35,
        "Triple Shot": 40,
        "Max Health": 20,
        "Speed Boost": 10,
        "Life Steal": 50,
        "Slow Field": 25,
        "Shield": 30,
        "Regeneration": 45,
        "Shield Regen": 40,
        "Explosive Shots": 60,
        "Bigger Explosions": 35,
        "Double Damage": 80,
        "Rapid Fire": 55,
        "Full Heal": 25
    },

    // Stack limits for stackable power-ups
    STACK_LIMITS: {
        "Damage Boost": 10,
        "Fire Rate": 8,
        "Speed Boost": 6,
        "Double Damage": 5,
        "Rapid Fire": 5,
        "Max Health": 10,
        "Shield": 8,
        "Regeneration": 10,
        "Shield Regen": 8,
        "Bigger Explosions": 6,
        "Slow Field": 6
    },

    // Audio settings
    AUDIO: {
        BGM_VOLUME: 0.3,
        SFX_VOLUME: 0.5
    },

    // Visual effects
    VFX: {
        PARTICLE_LIMITS: {
            MAX_PARTICLES: 200,
            MAX_PROJECTILES: 100
        },
        SCREEN_SHAKE: {
            PLAYER_HIT_INTENSITY: 10,
            PLAYER_HIT_DURATION: 300,
            EXPLOSION_INTENSITY: 5,
            EXPLOSION_DURATION: 200
        },
        GRID_SIZE: 50,
        GRID_ALPHA: 0.1
    },

    // Economy
    ECONOMY: {
        BASE_COIN_REWARD: 1,
        WAVE_COIN_MULTIPLIER: 0.2,
        WAVE_COMPLETION_BASE_COINS: 10,
        WAVE_COMPLETION_WAVE_BONUS: 2,
        PERFORMANCE_BONUS_DIVISOR: 5,
        SHOP_STACK_PRICE_MULTIPLIER: 0.5
    },

    // Game balance constants
    BALANCE: {
        MAX_WAVE_SCALING: 5.0, // Cap scaling to prevent infinite growth
        COIN_INFLATION_FACTOR: 1.05, // Slight price increases per wave
        PERFORMANCE_BONUS_THRESHOLD: 0.8 // Minimum enemies killed ratio for bonus
    }
};

// Enhanced derived calculations with validation
GameConfig.DERIVED = {
    /**
     * Calculate enemy count for a given wave
     * @param {number} wave - Wave number (1-based)
     * @returns {number} Number of enemies to spawn
     */
    getEnemyCountForWave(wave) {
        if (wave < 1) throw new Error('Wave number must be >= 1');
        
        return Math.floor(
            GameConfig.WAVE.BASE_ENEMY_COUNT + 
            wave * GameConfig.WAVE.ENEMY_COUNT_SCALING
        );
    },
    
    /**
     * Calculate spawn interval for a given wave
     * @param {number} wave - Wave number (1-based)
     * @returns {number} Spawn interval in milliseconds
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
     * Calculate scaling multipliers for a given wave
     * @param {number} wave - Wave number (1-based)
     * @returns {{health: number, speed: number, damage: number}} Scaling factors
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
     * Calculate adjusted power-up price based on current wave
     * @param {string} powerUpName - Name of the power-up
     * @param {number} wave - Current wave number
     * @param {number} stacks - Current stacks of this power-up
     * @returns {number} Adjusted price
     */
    getAdjustedPowerUpPrice(powerUpName, wave, stacks = 0) {
        const basePrice = GameConfig.POWERUP_PRICES[powerUpName] || 20;
        const waveInflation = Math.pow(GameConfig.BALANCE.COIN_INFLATION_FACTOR, wave - 1);
        const stackMultiplier = 1 + (stacks * GameConfig.ECONOMY.SHOP_STACK_PRICE_MULTIPLIER);
        
        return Math.max(1, Math.floor(basePrice * waveInflation * stackMultiplier));
    }
};

// Configuration validation on module load
Object.freeze(GameConfig);
Object.freeze(GameConfig.DERIVED);
