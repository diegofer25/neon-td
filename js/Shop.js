import { GameConfig } from './config/GameConfig.js';
import { PowerUp } from './PowerUp.js';

export class Shop {
    constructor() {
        // Use centralized configuration
        this.powerUpPrices = GameConfig.POWERUP_PRICES;
        this.stackLimits = GameConfig.STACK_LIMITS;
        
        // Track current tab and shop state
        this.currentTab = 'offense';
        this.currentPlayer = null;
        this.currentOnPurchase = null;
    }

    // Get price for a power-up, with stacking multiplier
    getPowerUpPrice(powerUpName, currentStacks = 0) {
        const basePrice = this.powerUpPrices[powerUpName] || 20;
        
        // Ensure stacks is not negative (safety check)
        const validStacks = Math.max(0, currentStacks);
        
        // Increase price for each stack (stackable power-ups get more expensive)
        const stackMultiplier = 1 + (validStacks * GameConfig.ECONOMY.SHOP_STACK_PRICE_MULTIPLIER);
        
        return Math.max(1, Math.floor(basePrice * stackMultiplier)); // Minimum price of 1 coin
    }

    // Check if player can afford a power-up
    canAfford(powerUpName, currentStacks, playerCoins) {
        return playerCoins >= this.getPowerUpPrice(powerUpName, currentStacks);
    }

    // Get current stacks for stackable power-ups
    getCurrentStacks(powerUpName, player) {
        // Check if player has a stack tracker for this power-up
        if (player.powerUpStacks && player.powerUpStacks[powerUpName] !== undefined) {
            return player.powerUpStacks[powerUpName];
        }
        
        // Fallback to legacy calculation for non-tracked power-ups
        switch(powerUpName) {
            case "Max Health":
                return Math.round((player.maxHp - 100) / 20); // Approximation
            case "Shield":
                return player.hasShield ? Math.floor((player.maxShieldHp - 50) / 25) + 1 : 0;
            case "Regeneration":
                return player.hpRegen / 5;
            case "Shield Regen":
                return player.shieldRegen / 10;
            case "Bigger Explosions":
                return Math.round(Math.log(player.explosionRadius / 50) / Math.log(1.5));
            case "Full Heal":
                return 0; // Always available at base price
            case "Slow Field":
                return player.slowFieldStrength;
            default:
                return 0;
        }
    }

    // Show shop interface
    showShop(player, coins, onPurchase, onContinue) {
        const modal = document.getElementById('powerUpModal');
        
        // Store current state
        this.currentPlayer = player;
        this.currentOnPurchase = onPurchase;
        
        // Update modal title to show coins
        modal.querySelector('h2').textContent = `Power-Up Shop (Coins: ${coins})`;
        
        // Set up tab functionality
        this.setupTabs(player, coins, onPurchase);
        
        // Set up close button
        this.setupCloseButton(onContinue);
        
    // Show the current tab
        this.showTab(this.currentTab, player, coins, onPurchase);
        
        // Ensure the correct tab button is marked as active
        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-tab="${this.currentTab}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        modal.classList.add('show');
    }
    
    // Refresh the current shop display
    refreshShop() {
        if (this.currentPlayer && this.currentOnPurchase) {
            const modal = document.getElementById('powerUpModal');
            modal.querySelector('h2').textContent = `Power-Up Shop (Coins: ${this.currentPlayer.coins})`;
            this.showTab(this.currentTab, this.currentPlayer, this.currentPlayer.coins, this.currentOnPurchase);
        }
    }

    // Setup tab button functionality
    setupTabs(player, coins, onPurchase) {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');
                
                // Update current tab
                const tabName = button.getAttribute('data-tab');
                this.currentTab = tabName;
                
                // Show the corresponding tab content
                this.showTab(tabName, player, coins, onPurchase);
            });
        });
    }

    // Setup close button
    setupCloseButton(onContinue) {
        const closeButton = document.querySelector('.shop-close-btn');
        
        // Remove any existing event listeners
        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);
        
        newCloseButton.addEventListener('click', () => {
            onContinue ? onContinue() : this.closeShop();
        });
    }

    // Show cards for a specific tab
    showTab(tabName, player, coins, onPurchase) {
        const cardsContainer = document.getElementById('powerUpCards');
        
        // Clear existing cards
        cardsContainer.innerHTML = '';
        
        // Map tab names to categories
        const categoryMap = {
            'offense': 'OFFENSE',
            'defense': 'DEFENSE', 
            'utility': 'UTILITY'
        };
        
        const category = categoryMap[tabName];
        if (!category) return;
        
        const categoryPowerUps = this.getPowerUpsByCategory(category, player);
        
        // Add power-ups for this category
        categoryPowerUps.forEach(powerUp => {
            const currentStacks = this.getCurrentStacks(powerUp.name, player);
            const price = this.getPowerUpPrice(powerUp.name, currentStacks);
            const canAfford = this.canAfford(powerUp.name, currentStacks, coins);
            const isMaxed = this.isPowerUpMaxed(powerUp.name, player);

            const card = document.createElement('div');
            card.className = `card shop-card ${!canAfford ? 'unaffordable' : ''} ${isMaxed ? 'maxed' : ''}`;
            
            let stackInfo = '';
            if (powerUp.stackable && currentStacks > 0) {
                stackInfo = ` (Lv.${currentStacks})`;
            }

            let statusText = '';
            if (isMaxed) {
                statusText = '<div class="status-text maxed">MAXED</div>';
            } else if (!canAfford) {
                statusText = '<div class="status-text unaffordable">Can\'t Afford</div>';
            }

            card.innerHTML = `
                <div class="card-icon">${powerUp.icon}</div>
                <div class="card-title">${powerUp.name}${stackInfo}</div>
                <div class="card-description">${powerUp.description}</div>
                <div class="card-price">${price} coins</div>
                ${statusText}
            `;
            
            if (canAfford && !isMaxed) {
                card.addEventListener('click', () => {
                    onPurchase(powerUp, price);
                    // Refresh the shop after purchase
                    setTimeout(() => {
                        this.refreshShop();
                    }, 50); // Small delay to ensure purchase is processed
                });
            }
            
            cardsContainer.appendChild(card);
        });
        
        // If no power-ups available, show a message
        if (categoryPowerUps.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-tab-message';
            emptyMessage.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #888; font-size: 14px;">
                    <p>No power-ups available in this category</p>
                    <p>All upgrades are maxed out!</p>
                </div>
            `;
            cardsContainer.appendChild(emptyMessage);
        }
    }

    // Get power-ups by category, filtering out maxed non-stackable ones
    getPowerUpsByCategory(category, player) {
        const categoryNames = {
            'OFFENSE': [
                "Damage Boost", "Fire Rate", "Piercing Shots", "Triple Shot", 
                "Speed Boost", "Explosive Shots", "Bigger Explosions", 
                "Double Damage", "Rapid Fire"
            ],
            'DEFENSE': [
                "Max Health", "Shield", "Regeneration", "Shield Regen", 
                "Full Heal"
            ],
            'UTILITY': [
                "Life Steal", "Slow Field"
            ]
        };

        const powerUpNames = categoryNames[category] || [];
        return PowerUp.ALL_POWERUPS.filter(powerUp => {
            if (!powerUpNames.includes(powerUp.name)) return false;
            
            // Filter out maxed power-ups
            return !this.isPowerUpMaxed(powerUp.name, player);
        });
    }

    // Check if a power-up is at maximum level
    isPowerUpMaxed(powerUpName, player) {
        const nonStackablePowerUps = player.getNonStackablePowerUps();
        
        // Non-stackable power-ups are maxed if player already has them
        if (nonStackablePowerUps.includes(powerUpName)) {
            return true;
        }

        // Check specific stackable power-up limits using stack tracker
        const currentStacks = this.getCurrentStacks(powerUpName, player);
        const maxStacks = this.stackLimits[powerUpName];
        
        if (maxStacks !== undefined) {
            return currentStacks >= maxStacks;
        }
        
        // Special cases
        if (powerUpName === "Slow Field") {
            return player.isSlowFieldMaxed();
        }
        
        return false; // No limit for other stackable power-ups
    }

    closeShop() {
        document.getElementById('powerUpModal').classList.remove('show');
    }
}
