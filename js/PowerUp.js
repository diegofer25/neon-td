/**
 * PowerUp System
 * 
 * Manages the power-up mechanics for the tower defense game.
 * Provides weighted random selection, stacking logic, and categorization
 * of various player upgrades including offense, defense, and utility enhancements.
 * 
 * @fileoverview Core power-up system with weighted selection and stack management
 * @author Game Development Team
 * @version 1.0.0
 */

/**
 * Represents a power-up that can be applied to enhance player capabilities
 * 
 * @class PowerUp
 * @description Encapsulates power-up data and behavior, including application logic,
 * weighting for random selection, and stacking rules.
 */
export class PowerUp {
    /**
     * Creates a new PowerUp instance
     * 
     * @param {string} name - Display name of the power-up
     * @param {string} description - Detailed description of the power-up's effects
     * @param {string} icon - Emoji or symbol representing the power-up visually
     * @param {Function} apply - Function that applies the power-up effect to a player
     * @param {number} [weight=1] - Selection weight (higher = more likely to appear)
     * @param {boolean} [stackable=true] - Whether multiple instances can be applied
     * 
     * @example
     * const damageBoost = new PowerUp(
     *   "Damage Boost",
     *   "+50% bullet damage", 
     *   "⚡",
     *   (player) => { player.damageMod *= 1.5; },
     *   3,
     *   true
     * );
     */
    constructor(name, description, icon, apply, weight = 1, stackable = true) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.apply = apply;
        this.weight = weight;
        this.stackable = stackable;
    }
    
    /**
     * Selects random power-ups using weighted probability
     * 
     * @static
     * @param {number} [count=3] - Number of power-ups to select
     * @param {string[]} [playerPowerUps=[]] - Array of non-stackable power-up names the player owns
     * @returns {PowerUp[]} Array of selected power-ups
     * 
     * @description Uses weighted random selection to choose power-ups. Non-stackable
     * power-ups are filtered out if already owned. Selection avoids duplicates
     * within the same selection batch.
     * 
     * @example
     * const selectedPowerUps = PowerUp.getRandomPowerUps(3, ["Piercing Shots"]);
     */
    static getRandomPowerUps(count = 3, playerPowerUps = []) {
        // Filter out non-stackable power-ups that the player already has
        const available = PowerUp.ALL_POWERUPS.filter(powerUp => {
            if (powerUp.stackable) {
                return true; // Stackable power-ups are always available
            } else {
                return !playerPowerUps.includes(powerUp.name); // Non-stackable only if not owned
            }
        });
        
        const selected = [];
        
        // Weighted random selection using cumulative probability
        for (let i = 0; i < count && available.length > 0; i++) {
            const totalWeight = available.reduce((sum, powerUp) => sum + powerUp.weight, 0);
            let random = Math.random() * totalWeight;
            
            // Find the selected power-up using weighted probability
            for (let j = 0; j < available.length; j++) {
                random -= available[j].weight;
                if (random <= 0) {
                    selected.push(available[j]);
                    available.splice(j, 1); // Remove to avoid duplicates in same selection
                    break;
                }
            }
        }
        
        return selected;
    }
}

/**
 * Complete collection of all available power-ups in the game
 * 
 * @static
 * @type {PowerUp[]}
 * @description Organized by rarity through weight values:
 * - Weight 3: Common power-ups (appear frequently)
 * - Weight 2: Uncommon power-ups (moderate appearance rate)  
 * - Weight 1: Rare power-ups (appear infrequently)
 */
PowerUp.ALL_POWERUPS = [
    // === COMMON POWER-UPS (Weight: 3) ===
    new PowerUp(
        "Damage Boost",
        "+50% bullet damage",
        "⚡",
        (player) => {
            player.damageMod *= 1.5;
            player.powerUpStacks["Damage Boost"]++;
        },
        3 // Common
    ),
    
    new PowerUp(
        "Fire Rate",
        "+25% attack speed",
        "🔥",
        (player) => {
            player.fireRateMod *= 1.25;
            player.powerUpStacks["Fire Rate"]++;
        },
        3 // Common
    ),
    
    new PowerUp(
        "Speed Boost",
        "+30% projectile speed",
        "💨",
        (player) => {
            player.projectileSpeedMod *= 1.3;
            player.powerUpStacks["Speed Boost"]++;
        },
        3 // Common
    ),
    
    // === UNCOMMON POWER-UPS (Weight: 2) ===
    new PowerUp(
        "Piercing Shots",
        "Bullets pierce through enemies (-25% damage per enemy hit)",
        "🎯",
        (player) => {
            player.hasPiercing = true;
            console.log('Piercing Shots power-up applied! Player now has piercing:', player.hasPiercing);
        },
        2, // Uncommon
        false // Non-stackable
    ),
    
    new PowerUp(
        "Triple Shot",
        "Fire 3 bullets in a spread",
        "🔱",
        (player) => {
            player.hasTripleShot = true;
        },
        2, // Uncommon
        false // Non-stackable
    ),
    
    new PowerUp(
        "Max Health",
        "+20% max health and heal to full",
        "💖",
        (player) => {
            const healthIncrease = Math.floor(player.maxHp * 0.2); // 20% increase
            player.maxHp += healthIncrease;
            player.hp = player.maxHp;
            player.powerUpStacks["Max Health"]++;
        },
        2 // Uncommon
    ),
    
    new PowerUp(
        "Slow Field",
        "Enemies move slower near you (+15% slow, +20 radius) [Max 6 stacks]",
        "❄️",
        (player) => {
            if (player.slowFieldStrength < player.maxSlowFieldStacks) {
                player.hasSlowField = true;
                player.slowFieldStrength += 1; // Each stack increases strength
                player.slowFieldRadius += 20; // Each stack increases radius by 20
            }
        },
        2 // Uncommon
    ),
    
    new PowerUp(
        "Shield",
        "Gain 50 shield points",
        "🛡️",
        (player) => {
            if (!player.hasShield) {
                player.hasShield = true;
                player.maxShieldHp = 50;
                player.shieldHp = 50;
            } else {
                player.maxShieldHp += 25;
                player.shieldHp += 25;
            }
            player.powerUpStacks["Shield"]++;
        },
        2 // Uncommon
    ),
    
    new PowerUp(
        "Full Heal",
        "Restore all health",
        "✨",
        (player) => {
            player.hp = player.maxHp;
            if (player.hasShield) {
                player.shieldHp = player.maxShieldHp;
            }
        },
        2 // Uncommon
    ),
    
    // === RARE POWER-UPS (Weight: 1) ===
    new PowerUp(
        "Life Steal",
        "Heal 10% of enemy max health on kill",
        "🧛",
        (player) => {
            player.hasLifeSteal = true;
        },
        1, // Rare
        false // Non-stackable
    ),
    
    new PowerUp(
        "Regeneration",
        "+5 health per second",
        "💚",
        (player) => {
            player.hpRegen += 5;
            player.powerUpStacks["Regeneration"]++;
        },
        1 // Rare
    ),
    
    new PowerUp(
        "Shield Regen",
        "+10 shield per second",
        "🔋",
        (player) => {
            if (!player.hasShield) {
                player.hasShield = true;
                player.maxShieldHp = 25;
                player.shieldHp = 25;
            }
            player.shieldRegen += 10;
            player.powerUpStacks["Shield Regen"]++;
        },
        1 // Rare
    ),
    
    new PowerUp(
        "Explosive Shots",
        "Bullets explode on impact",
        "💥",
        (player) => {
            player.explosiveShots = true;
        },
        1, // Rare
        false // Non-stackable
    ),
    
    new PowerUp(
        "Bigger Explosions",
        "+50% explosion radius and damage",
        "☄️",
        (player) => {
            player.explosionRadius *= 1.5;
            player.explosionDamage *= 1.5;
            player.powerUpStacks["Bigger Explosions"]++;
        },
        1 // Rare - only useful with explosive shots
    ),
    
    new PowerUp(
        "Double Damage",
        "+100% bullet damage",
        "⚔️",
        (player) => {
            player.damageMod *= 2;
            player.powerUpStacks["Double Damage"]++;
        },
        1 // Rare
    ),
    
    new PowerUp(
        "Rapid Fire",
        "+50% attack speed",
        "🌪️",
        (player) => {
            player.fireRateMod *= 1.5;
            player.powerUpStacks["Rapid Fire"]++;
        },
        1 // Rare
    )
];

/**
 * Categorization of power-ups by their primary function
 * 
 * @static
 * @type {Object.<string, string[]>}
 * @description Organizes power-ups into logical groups for filtering,
 * UI organization, and potential future balancing features.
 * 
 * Categories:
 * - OFFENSE: Damage, firing rate, and projectile enhancements
 * - DEFENSE: Health, shields, and survivability improvements  
 * - UTILITY: Special abilities and field effects
 */
PowerUp.CATEGORIES = {
    OFFENSE: [
        "Damage Boost", "Fire Rate", "Piercing Shots", "Triple Shot", 
        "Speed Boost", "Explosive Shots", "Bigger Explosions", 
        "Double Damage", "Rapid Fire"
    ],
    DEFENSE: [
        "Max Health", "Shield", "Regeneration", "Shield Regen", 
        "Full Heal"
    ],
    UTILITY: [
        "Life Steal", "Slow Field"
    ]
};

/**
 * Retrieves power-ups belonging to a specific category
 * 
 * @static
 * @param {string} category - Category name (OFFENSE, DEFENSE, or UTILITY)
 * @returns {PowerUp[]} Array of power-ups in the specified category
 * 
 * @example
 * const offensivePowerUps = PowerUp.getByCategory('OFFENSE');
 * const defensivePowerUps = PowerUp.getByCategory('DEFENSE');
 */
PowerUp.getByCategory = function(category) {
    const categoryNames = PowerUp.CATEGORIES[category] || [];
    return PowerUp.ALL_POWERUPS.filter(powerUp => 
        categoryNames.includes(powerUp.name)
    );
};
