import { Game } from './Game.js';

// Global game instance
let game = null;
let lastTime = 0;
let animationId = null;

// Audio elements
const audio = {
    bgm: null,
    sfx: {
        shoot: null,
        explode: null,
        hurt: null,
        powerup: null,
        click: null
    },
    enabled: true
};

// Input handling
const input = {
    mouseX: 0,
    mouseY: 0,
    mouseDown: false,
    keys: {},
    canvas: null
};

// Initialize the game
function init() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    input.canvas = canvas;

    // Set up responsive canvas
    setupCanvas();
    
    // Initialize game
    game = new Game(canvas, ctx);
    
    // Set up input handlers
    setupInputHandlers();
    
    // Set up resize handler
    window.addEventListener('resize', handleResize);
    
    // Load audio
    loadAudio();
    
    // Check for saved mute preference
    if (localStorage.getItem('mute') === 'true') {
        toggleMute();
    }

    // Show start screen
    document.getElementById('startScreen').classList.add('show');
}

// Set up canvas dimensions and scaling
function setupCanvas() {
    const canvas = input.canvas;
    const container = document.getElementById('gameContainer');
    
    // Calculate optimal canvas size maintaining aspect ratio
    const targetAspectRatio = 4/3; // 800/600 = 4/3
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const containerAspectRatio = containerWidth / containerHeight;
    
    let canvasWidth, canvasHeight;
    
    if (containerAspectRatio > targetAspectRatio) {
        // Container is wider, fit to height
        canvasHeight = Math.min(containerHeight * 0.9, 600);
        canvasWidth = canvasHeight * targetAspectRatio;
    } else {
        // Container is taller, fit to width
        canvasWidth = Math.min(containerWidth * 0.9, 800);
        canvasHeight = canvasWidth / targetAspectRatio;
    }
    
    // Ensure minimum size for playability
    const minWidth = 320;
    const minHeight = minWidth / targetAspectRatio;
    
    if (canvasWidth < minWidth) {
        canvasWidth = minWidth;
        canvasHeight = minHeight;
    }
    
    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    // Set up canvas for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
    
    // Scale canvas for high DPI
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
}

// Handle window resize
let resizeTimeout;
function handleResize() {
    // Debounce resize events to avoid excessive recalculations
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (game) {
            setupCanvas();
            // Update game dimensions
            game.updateCanvasSize();
        }
    }, 100);
}

// Set up input event handlers
function setupInputHandlers() {
    const canvas = input.canvas;

    // Keep basic mouse/touch events for UI interaction (but not for aiming)
    canvas.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });

    // Keyboard events (mainly for pause)
    document.addEventListener('keydown', (e) => {
        input.keys[e.code] = true;
        
        // Handle pause
        if (e.code === 'KeyP' && game && game.gameState === 'playing') {
            togglePause();
        }
        
        // Prevent spacebar from scrolling
        if (e.code === 'Space') {
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        input.keys[e.code] = false;
    });

    // Mute button
    document.getElementById('muteBtn').addEventListener('click', toggleMute);

    // Prevent context menu on canvas
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
}

// Load audio files
function loadAudio() {
    // Create audio elements (placeholder for now - you'll need actual audio files)
    audio.bgm = new Audio();
    audio.bgm.loop = true;
    audio.bgm.volume = 0.3;
    
    // Create SFX audio elements
    Object.keys(audio.sfx).forEach(key => {
        audio.sfx[key] = new Audio();
        audio.sfx[key].volume = 0.5;
    });
    
    // For demo purposes, we'll skip actual audio files
    // In a real implementation, you'd load actual audio files here
}

// Play sound effect
function playSFX(soundName) {
    if (!audio.enabled || !audio.sfx[soundName]) return;
    
    try {
        const sound = audio.sfx[soundName].cloneNode();
        sound.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Start the game
function startGame() {
    document.getElementById('startScreen').classList.remove('show');
    
    // Start background music
    if (audio.enabled && audio.bgm) {
        audio.bgm.play().catch(e => console.log('BGM play failed:', e));
    }
    
    // Reset and start game
    game.start();
    
    // Start game loop
    gameLoop();
}

// Restart the game
function restartGame() {
    document.getElementById('gameOver').classList.remove('show');
    game.restart();
    gameLoop();
}

// Toggle pause
function togglePause() {
    if (game.gameState === 'playing') {
        game.pause();
        document.getElementById('pauseScreen').classList.add('show');
    } else if (game.gameState === 'paused') {
        game.resume();
        document.getElementById('pauseScreen').classList.remove('show');
        gameLoop();
    }
}

// Toggle mute
function toggleMute() {
    audio.enabled = !audio.enabled;
    const muteBtn = document.getElementById('muteBtn');
    
    if (audio.enabled) {
        muteBtn.textContent = '🔊';
        if (audio.bgm) audio.bgm.volume = 0.3;
    } else {
        muteBtn.textContent = '🔇';
        if (audio.bgm) audio.bgm.volume = 0;
    }
    
    localStorage.setItem('mute', !audio.enabled);
}

// Main game loop
function gameLoop(timestamp = 0) {
    if (game.gameState === 'paused') return;
    
    const delta = timestamp - lastTime;
    lastTime = timestamp;
    
    // Update game
    game.update(delta, input);
    
    // Render game
    game.render();
    
    // Update HUD
    updateHUD();
    
    // Continue loop if game is running
    if (game.gameState === 'playing' || game.gameState === 'powerup') {
        animationId = requestAnimationFrame(gameLoop);
    } else if (game.gameState === 'gameover') {
        showGameOver();
    }
}

// Update HUD elements
function updateHUD() {
    // Update health bar
    const healthPercentage = Math.max(0, (game.player.hp / game.player.maxHp) * 100);
    document.getElementById('healthFill').style.width = healthPercentage + '%';
    document.getElementById('healthText').textContent = `${Math.max(0, Math.floor(game.player.hp))}/${game.player.maxHp}`;
    
    // Update wave counter with progress
    const totalEnemies = game.enemiesSpawned + game.enemiesToSpawn;
    const remainingEnemies = game.enemies.length + game.enemiesToSpawn;
    document.getElementById('wave').textContent = `Wave: ${game.wave} (${remainingEnemies}/${totalEnemies})`;
    
    // Update stats display
    updateStatsDisplay();
}

// Update player stats display
function updateStatsDisplay() {
    // Calculate current attack damage
    const baseDamage = 10;
    const currentAttack = Math.floor(baseDamage * game.player.damageMod);
    updateStatValue('attackValue', currentAttack);
    
    // Calculate current defense (total HP including shield)
    const currentDefense = game.player.maxHp + (game.player.hasShield ? game.player.maxShieldHp : 0);
    updateStatValue('defenseValue', currentDefense);
    
    // Calculate current attack speed multiplier
    const currentSpeed = game.player.fireRateMod.toFixed(1);
    updateStatValue('speedValue', `${currentSpeed}x`);
}

// Update individual stat value with highlight effect on change
function updateStatValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    const oldValue = element.textContent;
    
    if (oldValue !== newValue.toString()) {
        element.textContent = newValue;
        
        // Add highlight effect for stat increases
        element.style.color = '#0f0';
        element.style.textShadow = '0 0 10px #0f0';
        element.style.transform = 'scale(1.1)';
        
        // Remove highlight after animation
        setTimeout(() => {
            element.style.color = '#fff';
            element.style.textShadow = '0 0 3px #fff';
            element.style.transform = 'scale(1)';
        }, 500);
    }
}

// Show game over screen
function showGameOver() {
    document.getElementById('finalWave').textContent = game.wave;
    document.getElementById('gameOver').classList.add('show');
    
    // Stop background music
    if (audio.bgm) {
        audio.bgm.pause();
        audio.bgm.currentTime = 0;
    }
}

// Floating text system
function createFloatingText(text, x, y, className = 'damage') {
    const textElement = document.createElement('div');
    textElement.className = `floating-text ${className}`;
    textElement.textContent = text;
    textElement.style.left = x + 'px';
    textElement.style.top = y + 'px';
    
    document.getElementById('floatingTexts').appendChild(textElement);
    
    // Remove after animation
    setTimeout(() => {
        if (textElement.parentNode) {
            textElement.parentNode.removeChild(textElement);
        }
    }, 1000);
}

// Screen flash effect
function screenFlash() {
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    document.getElementById('gameContainer').appendChild(flash);
    
    setTimeout(() => {
        if (flash.parentNode) {
            flash.parentNode.removeChild(flash);
        }
    }, 200);
}

// Export functions for global access
window.startGame = startGame;
window.restartGame = restartGame;
window.togglePause = togglePause;
window.toggleMute = toggleMute;
window.playSFX = playSFX;
window.createFloatingText = createFloatingText;
window.screenFlash = screenFlash;
window.game = () => game;
window.input = input;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
