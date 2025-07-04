/**
 * @fileoverview Centralized game configuration
 */

export const GameConfig = {
    // Canvas and rendering
    CANVAS: {
        TARGET_ASPECT_RATIO: 4/3,
        MIN_WIDTH: 320,
        MAX_WIDTH: 800,
        MAX_HEIGHT: 600
    },

    // Player configuration
    PLAYER: {
        BASE_HP: 100,
        BASE_DAMAGE: 10,
        BASE_FIRE_RATE: 300,
        RADIUS: 20,
        BASE_PROJECTILE_SPEED: 400
    },

    // Enemy configuration  
    ENEMY: {
        BASE_HEALTH: 50,
        BASE_SPEED: 50,
        BASE_DAMAGE: 10,
        RADIUS: 15,
        SPAWN_MARGIN: 50
    },

    // Wave scaling
    WAVE: {
        BASE_ENEMY_COUNT: 4,
        ENEMY_COUNT_SCALING: 2,
        HEALTH_SCALING: 1.15,
        SPEED_SCALING: 1.1,
        DAMAGE_SCALING: 1.15,
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
    }
};

// Derived configurations
GameConfig.DERIVED = {
    getEnemyCountForWave: (wave) => 
        Math.floor(GameConfig.WAVE.BASE_ENEMY_COUNT + wave * GameConfig.WAVE.ENEMY_COUNT_SCALING),
    
    getSpawnIntervalForWave: (wave) => 
        Math.max(
            GameConfig.WAVE.MIN_SPAWN_INTERVAL, 
            GameConfig.WAVE.BASE_SPAWN_INTERVAL - (wave * GameConfig.WAVE.SPAWN_INTERVAL_REDUCTION)
        ),
    
    getScalingForWave: (wave) => ({
        health: Math.pow(GameConfig.WAVE.HEALTH_SCALING, wave - 1),
        speed: Math.pow(GameConfig.WAVE.SPEED_SCALING, wave - 1),
        damage: Math.pow(GameConfig.WAVE.DAMAGE_SCALING, wave - 1)
    })
};
