/**
 * PowerUp System
 *
 * Manages the power-up mechanics for the tower defense game.
 * Provides categorization of various player upgrades including offense, 
 * defense, and utility enhancements for the shop system.
 *
 * @fileoverview Core power-up system with shop integration and stack management
 */

/**
 * Represents a power-up that can be applied to enhance player capabilities
 *
 * @class PowerUp
 * @description Encapsulates power-up data and behavior, including application logic
 * and stacking rules for the shop-based purchase system.
 */
export class PowerUp {
	/**
	 * Available power-up types that can be stacked
	 * @static
	 * @readonly
	 * @type {string[]}
	 */
	static POWER_UP_STACK_NAMES = [
		"Damage Boost",
		"Fire Rate",
		"Speed Boost",
		"Turn Speed",
		"Double Damage",
		"Rapid Fire",
		"Max Health",
		"Shield",
		"Regeneration",
		"Shield Regen",
		"Bigger Explosions",
		"Coin Magnet",
		"Lucky Shots",
		"Immolation Aura",
		"Multishot",
		"Chain Lightning",
		"Ricochet",
	];

	/**
	 * Complete collection of all available power-ups in the game
	 *
	 * @static
	 * @type {PowerUp[]}
	 * @description Power-ups are now purchased from the shop rather than randomly selected.
	 * All power-ups are available for purchase when requirements are met.
	 */
	static ALL_POWERUPS = [
		new PowerUp(
			"Damage Boost",
			"+25% bullet damage",
			"⚡",
			(player) => {
				player.damageMod *= 1.25;
				player.powerUpStacks["Damage Boost"]++;
			}
		),

		new PowerUp(
			"Fire Rate",
			"+12.5% attack speed",
			"🔥",
			(player) => {
				player.fireRateMod *= 1.125;
				player.powerUpStacks["Fire Rate"]++;
			}
		),

		new PowerUp(
			"Speed Boost",
			"+15% projectile speed",
			"💨",
			(player) => {
				player.projectileSpeedMod *= 1.15;
				player.powerUpStacks["Speed Boost"]++;
			}
		),

		new PowerUp(
			"Turn Speed",
			"+10% rotation speed for faster targeting",
			"🌀",
			(player) => {
				player.turnSpeed *= 1.1;
				player.powerUpStacks["Turn Speed"] = (player.powerUpStacks["Turn Speed"] || 0) + 1;
			}
		),

		new PowerUp(
			"Piercing Shots",
			"Projectiles pierce +1 enemy. Damage reduced by 25% for each pierce.",
			"🎯",
			(player) => {
				player.piercingLevel = (player.piercingLevel || 0) + 1;
			}
		),

		new PowerUp(
			"Triple Shot",
			"Fire 3 bullets in a spread",
			"🔱",
			(player) => {
				player.hasTripleShot = true;
			},
			false
		),

		new PowerUp(
			"Max Health",
			"+10% max health and heal to full",
			"💖",
			(player) => {
				const healthIncrease = Math.floor(player.maxHp * 0.1); // 10% increase
				player.maxHp += healthIncrease;
				player.hp = player.maxHp;
				player.powerUpStacks["Max Health"]++;
			}
		),

		new PowerUp(
			"Slow Field",
			"Enemies move slower near you (+10% slow, +20 radius) [Max 6 stacks]",
			"❄️",
			(player) => {
				if (player.slowFieldStrength < player.maxSlowFieldStacks) {
					player.hasSlowField = true;
					player.slowFieldStrength += 1; // Each stack increases strength
					player.slowFieldRadius += 20; // Each stack increases radius by 20
				}
			}
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
			}
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
			}
		),

		new PowerUp(
			"Life Steal",
			"Heal 1% of enemy max health on kill",
			"🧛",
			(player) => {
				player.hasLifeSteal = true;
			},
			false
		),

		new PowerUp(
			"Regeneration",
			"+1 health per second",
			"💚",
			(player) => {
				player.hpRegen += 1; // 1 health per second
				player.powerUpStacks["Regeneration"]++;
			}
		),

		new PowerUp(
			"Shield Regen",
			"+2 shield per second",
			"🔋",
			(player) => {
				if (!player.hasShield) {
					player.hasShield = true;
					player.maxShieldHp = 25;
					player.shieldHp = 25;
				}
				player.shieldRegen += 2;
				player.powerUpStacks["Shield Regen"]++;
			}
		),

		new PowerUp(
			"Explosive Shots",
			"Bullets explode on impact",
			"💥",
			(player) => {
				player.explosiveShots = true;
			},
			false
		),

		new PowerUp(
			"Bigger Explosions",
			"+25% explosion radius and damage (enhances Explosive Shots)",
			"☄️",
			(player) => {
				player.explosionRadius *= 1.25;
				player.explosionDamage *= 1.25;
				player.powerUpStacks["Bigger Explosions"]++;
			}
		),

		new PowerUp(
			"Double Damage",
			"+50% bullet damage",
			"⚔️",
			(player) => {
				player.damageMod *= 1.5;
				player.powerUpStacks["Double Damage"]++;
			}
		),

		new PowerUp(
			"Rapid Fire",
			"+25% attack speed",
			"🌪️",
			(player) => {
				player.fireRateMod *= 1.25;
				player.powerUpStacks["Rapid Fire"]++;
			}
		),

		new PowerUp(
			"Coin Magnet",
			"+20% coin rewards from enemy kills",
			"🧲",
			(player) => {
				if (!player.coinMagnetMultiplier) {
					player.coinMagnetMultiplier = 1;
				}
				player.coinMagnetMultiplier += 0.2;
				player.powerUpStacks["Coin Magnet"]++;
			}
		),

		new PowerUp(
			"Lucky Shots",
			"10% chance for bullets to deal double damage (stacks increase chance)",
			"🍀",
			(player) => {
				if (!player.luckyShots) {
					player.luckyShots = { chance: 0, active: true };
				}
				player.luckyShots.chance += 0.1; // 10% chance per stack
				player.powerUpStacks["Lucky Shots"]++;
			}
		),

		new PowerUp(
			"Immolation Aura",
			"All nearby enemies take 1% of their max health as burn damage per second",
			"🔥",
			(player) => {
				if (!player.immolationAura) {
					player.immolationAura = {
						active: true,
						damagePercent: 0.01, // 1% burn damage per second
						range: 100, // Aura radius
					};
				} else {
					player.immolationAura.damagePercent += 0.01; // Increase burn damage by 1% per stack
					player.immolationAura.range += 20; // Increase aura radius by 20
				}
				player.powerUpStacks["Immolation Aura"]++;
			}
		),

		new PowerUp(
			"Time Dilation",
			"Briefly slow down time when health drops below 25%",
			"⏰",
			(player) => {
				player.hasTimeDilation = true;
			},
			false
		),

		new PowerUp(
			"Phantom Dash",
			"Become briefly invulnerable when taking damage (8 second cooldown)",
			"👻",
			(player) => {
				if (!player.phantomDash) {
					player.phantomDash = {
						active: true,
						cooldown: 0,
						maxCooldown: 8000,
						invulnTime: 1000,
					};
				}
			},
			false
		),

		new PowerUp(
			"Multishot",
			"+1 additional projectile fired (separate from triple shot)",
			"🎆",
			(player) => {
				if (!player.multishotCount) {
					player.multishotCount = 0;
				}
				player.multishotCount += 1;
				player.powerUpStacks["Multishot"]++;
			}
		),

		new PowerUp(
			"Chain Lightning",
			"Enemies damaged by bullets have 30% chance to electrify nearby enemies",
			"⚡",
			(player) => {
				if (!player.chainLightning) {
					player.chainLightning = {
						active: true,
						chance: 0.3,
						range: 80,
						damage: 15,
					};
				} else {
					player.chainLightning.chance = Math.min(
						0.8,
						player.chainLightning.chance + 0.2
					);
					player.chainLightning.damage += 10;
				}
				player.powerUpStacks["Chain Lightning"]++;
			}
		),

		new PowerUp(
			"Ricochet",
			"Bullets bounce off screen edges and gain +25% damage per bounce",
			"🏀",
			(player) => {
				if (!player.ricochet) {
					player.ricochet = { active: true, damageMultiplier: 1.25 };
				} else {
					player.ricochet.damageMultiplier += 0.15; // Additional 15% per stack
				}
				player.powerUpStacks["Ricochet"]++;
			}
		),
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
	static CATEGORIES = {
		OFFENSE: [
			"Damage Boost",
			"Fire Rate",
			"Piercing Shots",
			"Triple Shot",
			"Speed Boost",
			"Turn Speed",
			"Explosive Shots",
			"Bigger Explosions",
			"Double Damage",
			"Rapid Fire",
		],
		DEFENSE: [
			"Max Health",
			"Shield",
			"Regeneration",
			"Shield Regen",
			"Full Heal",
		],
		UTILITY: [
			"Life Steal",
			"Slow Field",
			"Coin Magnet",
			"Lucky Shots",
			"Immolation Aura",
			"Time Dilation",
			"Phantom Dash",
			"Multishot",
			"Chain Lightning",
			"Ricochet",
		],
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
	static getByCategory = function (category) {
		const categoryNames = PowerUp.CATEGORIES[category] || [];
		return PowerUp.ALL_POWERUPS.filter((powerUp) =>
			categoryNames.includes(powerUp.name)
		);
	};

	/**
	 * Creates a new PowerUp instance
	 *
	 * @param {string} name - Display name of the power-up
	 * @param {string} description - Detailed description of the power-up's effects
	 * @param {string} icon - Emoji or symbol representing the power-up visually
	 * @param {Function} apply - Function that applies the power-up effect to a player
	 * @param {boolean} [stackable=true] - Whether multiple instances can be applied
	 *
	 * @example
	 * const damageBoost = new PowerUp(
	 *   "Damage Boost",
	 *   "+50% bullet damage",
	 *   "⚡",
	 *   (player) => { player.damageMod *= 1.5; },
	 *   true
	 * );
	 */
	constructor(name, description, icon, apply, stackable = true) {
		this.name = name;
		this.description = description;
		this.icon = icon;
		this.apply = apply;
		this.stackable = stackable;
	}
}
