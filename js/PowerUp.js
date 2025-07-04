export class PowerUp {
    constructor(name, description, icon, apply, weight = 1, stackable = true) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.apply = apply;
        this.weight = weight;
        this.stackable = stackable;
    }
    
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
        
        // Weighted random selection
        for (let i = 0; i < count && available.length > 0; i++) {
            const totalWeight = available.reduce((sum, powerUp) => sum + powerUp.weight, 0);
            let random = Math.random() * totalWeight;
            
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

// Define all available power-ups
PowerUp.ALL_POWERUPS = [
    new PowerUp(
        "Damage Boost",
        "+50% bullet damage",
        "⚡",
        (player) => {
            player.damageMod *= 1.5;
        },
        3 // Common
    ),
    
    new PowerUp(
        "Fire Rate",
        "+25% attack speed",
        "🔥",
        (player) => {
            player.fireRateMod *= 1.25;
        },
        3 // Common
    ),
    
    new PowerUp(
        "Piercing Shots",
        "Bullets pierce through enemies",
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
        "+25 max health and heal to full",
        "💖",
        (player) => {
            player.maxHp += 25;
            player.hp = player.maxHp;
        },
        2 // Uncommon
    ),
    
    new PowerUp(
        "Speed Boost",
        "+30% projectile speed",
        "💨",
        (player) => {
            player.projectileSpeedMod *= 1.3;
        },
        3 // Common
    ),
    
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
        "Slow Field",
        "Enemies move 30% slower near you",
        "❄️",
        (player) => {
            player.hasSlowField = true;
        },
        2, // Uncommon
        false // Non-stackable
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
        },
        2 // Uncommon
    ),
    
    new PowerUp(
        "Regeneration",
        "+5 health per second",
        "💚",
        (player) => {
            player.hpRegen += 5;
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
        },
        1 // Rare - only useful with explosive shots
    ),
    
    new PowerUp(
        "Double Damage",
        "+100% bullet damage",
        "⚔️",
        (player) => {
            player.damageMod *= 2;
        },
        1 // Rare
    ),
    
    new PowerUp(
        "Rapid Fire",
        "+50% attack speed",
        "🌪️",
        (player) => {
            player.fireRateMod *= 1.5;
        },
        1 // Rare
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
    )
];

// Organize power-ups by category for potential future use
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

// Helper function to get power-ups by category
PowerUp.getByCategory = function(category) {
    const categoryNames = PowerUp.CATEGORIES[category] || [];
    return PowerUp.ALL_POWERUPS.filter(powerUp => 
        categoryNames.includes(powerUp.name)
    );
};
