/**
 * @fileoverview Mathematical utility functions for game calculations
 * 
 * This module provides optimized mathematical functions commonly used in game development,
 * including vector operations, collision detection, random number generation, and
 * interpolation functions. All functions are static for performance and ease of use.
 * 
 * @example
 * // Distance calculations
 * const dist = MathUtils.distance(x1, y1, x2, y2);
 * const distSq = MathUtils.distanceSquared(x1, y1, x2, y2); // Faster for comparisons
 * 
 * // Collision detection
 * if (MathUtils.circleCollision(bullet, enemy)) {
 *   // Handle collision
 * }
 * 
 * // Random values
 * const randomAngle = MathUtils.random(0, MathUtils.TAU);
 * const randomEnemy = MathUtils.randomChoice(enemies);
 */

export class MathUtils {
    // Mathematical constants for improved readability and performance
    /** @type {number} Full circle in radians (2π) - more intuitive than Math.PI * 2 */
    static TAU = Math.PI * 2;
    
    /** @type {number} Quarter circle in radians (π/2) - useful for perpendicular calculations */
    static HALF_PI = Math.PI * 0.5;
    
    /** @type {number} Floating point comparison epsilon for approximate equality */
    static EPSILON = 1e-10;

    // Vector and geometric calculations
    
    /**
     * Calculates squared distance between two points (faster than distance for comparisons)
     * 
     * Use this instead of distance() when you only need to compare distances,
     * as it avoids the expensive square root operation. Particularly useful
     * for finding nearest objects or checking if distance is within a threshold.
     * 
     * @param {number} x1 - First point x coordinate
     * @param {number} y1 - First point y coordinate  
     * @param {number} x2 - Second point x coordinate
     * @param {number} y2 - Second point y coordinate
     * @returns {number} Squared distance between the points
     * 
     * @example
     * // Find nearest enemy (more efficient than using distance)
     * let nearestEnemy = null;
     * let nearestDistSq = Infinity;
     * for (const enemy of enemies) {
     *   const distSq = MathUtils.distanceSquared(player.x, player.y, enemy.x, enemy.y);
     *   if (distSq < nearestDistSq) {
     *     nearestDistSq = distSq;
     *     nearestEnemy = enemy;
     *   }
     * }
     * 
     * // Check if within range (compare squared distances)
     * const rangeSq = attackRange * attackRange;
     * if (MathUtils.distanceSquared(x1, y1, x2, y2) <= rangeSq) {
     *   // Within range
     * }
     */
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
    
    /**
     * Calculates actual distance between two points
     * 
     * @param {number} x1 - First point x coordinate
     * @param {number} y1 - First point y coordinate
     * @param {number} x2 - Second point x coordinate
     * @param {number} y2 - Second point y coordinate
     * @returns {number} Distance between the points in the same units as input coordinates
     * 
     * @example
     * // Calculate actual distance for display or precise calculations
     * const dist = MathUtils.distance(player.x, player.y, target.x, target.y);
     * console.log(`Target is ${dist.toFixed(1)} units away`);
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculates angle from first point to second point
     * 
     * Returns the angle in radians that a vector from point 1 to point 2 makes
     * with the positive x-axis. Useful for aiming, rotation, and direction calculations.
     * 
     * @param {number} x1 - Source point x coordinate
     * @param {number} y1 - Source point y coordinate
     * @param {number} x2 - Target point x coordinate
     * @param {number} y2 - Target point y coordinate
     * @returns {number} Angle in radians (-π to π, where 0 is right, π/2 is down)
     * 
     * @example
     * // Aim player toward mouse cursor
     * const angle = MathUtils.angleBetween(player.x, player.y, mouseX, mouseY);
     * player.rotation = angle;
     * 
     * // Fire projectile toward target
     * const fireAngle = MathUtils.angleBetween(turret.x, turret.y, enemy.x, enemy.y);
     * const bullet = new Projectile(turret.x, turret.y, fireAngle);
     */
    static angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    /**
     * Normalizes a 2D vector to unit length (magnitude of 1)
     * 
     * Converts any vector to have a length of 1 while preserving its direction.
     * Essential for movement calculations where you want consistent speed
     * regardless of input magnitude.
     * 
     * @param {number} x - Vector x component
     * @param {number} y - Vector y component
     * @returns {{x: number, y: number}} Normalized vector with magnitude 1, or {0,0} if input was zero vector
     * 
     * @example
     * // Normalize player input for consistent movement speed
     * const inputX = keys.right - keys.left; // -1, 0, or 1
     * const inputY = keys.down - keys.up;    // -1, 0, or 1
     * const normalized = MathUtils.normalize(inputX, inputY);
     * player.x += normalized.x * player.speed * deltaTime;
     * player.y += normalized.y * player.speed * deltaTime;
     * 
     * // Create unit vector in specific direction
     * const direction = MathUtils.normalize(targetX - sourceX, targetY - sourceY);
     * const velocity = { x: direction.x * speed, y: direction.y * speed };
     */
    static normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
    
    /**
     * Normalizes angle to range [0, 2π] (0 to TAU)
     * 
     * Ensures angles are in a consistent range for calculations and comparisons.
     * Useful for rotation animations and angle arithmetic.
     * 
     * @param {number} angle - Angle in radians (can be any value)
     * @returns {number} Equivalent angle in range [0, 2π]
     * 
     * @example
     * // Ensure rotation stays in valid range
     * player.rotation += rotationSpeed * deltaTime;
     * player.rotation = MathUtils.normalizeAngle(player.rotation);
     * 
     * // Calculate shortest rotation between angles
     * const targetAngle = MathUtils.normalizeAngle(desiredAngle);
     * const currentAngle = MathUtils.normalizeAngle(player.rotation);
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += this.TAU;
        while (angle >= this.TAU) angle -= this.TAU;
        return angle;
    }
    
    // Collision detection methods
    
    /**
     * Checks collision between two circular objects
     * 
     * Most common collision detection in 2D games. Objects are considered
     * colliding if the distance between their centers is less than the sum
     * of their radii.
     * 
     * @param {Object} obj1 - First object with x, y, and radius properties
     * @param {Object} obj2 - Second object with x, y, and radius properties
     * @returns {boolean} True if the circles are overlapping
     * 
     * @example
     * // Check bullet hitting enemy
     * if (MathUtils.circleCollision(bullet, enemy)) {
     *   enemy.takeDamage(bullet.damage);
     *   bullet.destroy();
     * }
     * 
     * // Check player collision with pickup
     * for (const pickup of pickups) {
     *   if (MathUtils.circleCollision(player, pickup)) {
     *     pickup.apply(player);
     *     pickups.remove(pickup);
     *   }
     * }
     */
    static circleCollision(obj1, obj2) {
        const distance = this.distance(obj1.x, obj1.y, obj2.x, obj2.y);
        return distance < (obj1.radius + obj2.radius);
    }
    
    /**
     * Checks collision between two axis-aligned rectangles
     * 
     * Uses the separating axis theorem for rectangles. Rectangles are
     * considered colliding if they overlap on both x and y axes.
     * 
     * @param {Object} rect1 - First rectangle with x, y, width, height properties
     * @param {Object} rect2 - Second rectangle with x, y, width, height properties  
     * @returns {boolean} True if rectangles overlap
     * 
     * @example
     * // Check if player is within a trigger area
     * const triggerArea = { x: 100, y: 100, width: 50, height: 50 };
     * const playerRect = { x: player.x - 10, y: player.y - 10, width: 20, height: 20 };
     * if (MathUtils.rectCollision(playerRect, triggerArea)) {
     *   triggerEvent();
     * }
     * 
     * // UI element collision detection
     * if (MathUtils.rectCollision(cursor, button)) {
     *   button.highlight();
     * }
     */
    static rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Random number generation
    
    /**
     * Generates random floating-point number in specified range
     * 
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (exclusive)
     * @returns {number} Random number in range [min, max)
     * 
     * @example
     * // Random spawn position
     * const x = MathUtils.random(0, canvas.width);
     * const y = MathUtils.random(0, canvas.height);
     * 
     * // Random particle velocity
     * const speed = MathUtils.random(50, 150);
     * const angle = MathUtils.random(0, MathUtils.TAU);
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Generates random integer in specified range (inclusive)
     * 
     * @param {number} min - Minimum value (inclusive)
     * @param {number} max - Maximum value (inclusive)
     * @returns {number} Random integer in range [min, max]
     * 
     * @example
     * // Random enemy type (0, 1, or 2)
     * const enemyType = MathUtils.randomInt(0, 2);
     * 
     * // Random damage variation
     * const damage = baseDamage + MathUtils.randomInt(-2, 2);
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Selects random element from array
     * 
     * @param {Array} array - Array to choose from
     * @returns {any} Random element from array, or undefined if array is empty
     * 
     * @example
     * // Random enemy spawn type
     * const enemyTypes = ['basic', 'fast', 'tank'];
     * const selectedType = MathUtils.randomChoice(enemyTypes);
     * 
     * // Random power-up from available options
     * const availablePowerUps = getAvailablePowerUps();
     * const powerUp = MathUtils.randomChoice(availablePowerUps);
     */
    static randomChoice(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return undefined;
        }
        return array[this.randomInt(0, array.length - 1)];
    }
    
    // Utility methods
    
    /**
     * Constrains value to specified range
     * 
     * Ensures a value doesn't go below minimum or above maximum.
     * Essential for bounds checking and UI constraints.
     * 
     * @param {number} value - Value to constrain
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {number} Value clamped to [min, max] range
     * 
     * @example
     * // Keep player within screen bounds
     * player.x = MathUtils.clamp(player.x, 0, canvas.width);
     * player.y = MathUtils.clamp(player.y, 0, canvas.height);
     * 
     * // Limit health to valid range
     * player.health = MathUtils.clamp(player.health, 0, player.maxHealth);
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * Linear interpolation between two values
     * 
     * Smoothly transitions between two values based on a parameter t.
     * Essential for animations, easing, and smooth transitions.
     * 
     * @param {number} a - Start value (when t = 0)
     * @param {number} b - End value (when t = 1)
     * @param {number} t - Interpolation parameter (0 = start, 1 = end, values outside [0,1] extrapolate)
     * @returns {number} Interpolated value
     * 
     * @example
     * // Smooth camera movement
     * camera.x = MathUtils.lerp(camera.x, target.x, 0.1);
     * camera.y = MathUtils.lerp(camera.y, target.y, 0.1);
     * 
     * // Color transition
     * const red = MathUtils.lerp(startColor.r, endColor.r, progress);
     * const green = MathUtils.lerp(startColor.g, endColor.g, progress);
     * const blue = MathUtils.lerp(startColor.b, endColor.b, progress);
     * 
     * // Animation with easing
     * const easedT = t * t * (3 - 2 * t); // Smooth step
     * const position = MathUtils.lerp(startPos, endPos, easedT);
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Checks if two floating-point values are approximately equal
     * 
     * Floating-point arithmetic can introduce small errors, making exact
     * equality comparisons unreliable. This function handles the comparison
     * with a small tolerance value.
     * 
     * @param {number} a - First value to compare
     * @param {number} b - Second value to compare
     * @param {number} [epsilon=EPSILON] - Tolerance for comparison (default: 1e-10)
     * @returns {boolean} True if values are approximately equal within tolerance
     * 
     * @example
     * // Safe floating-point comparison
     * if (MathUtils.approximately(player.x, targetX)) {
     *   console.log('Player reached target');
     * }
     * 
     * // Check if animation is complete
     * if (MathUtils.approximately(currentValue, targetValue, 0.01)) {
     *   animationComplete = true;
     * }
     * 
     * // Velocity near zero check
     * if (MathUtils.approximately(velocity.x, 0) && MathUtils.approximately(velocity.y, 0)) {
     *   object.isMoving = false;
     * }
     */
    static approximately(a, b, epsilon = this.EPSILON) {
        return Math.abs(a - b) < epsilon;
    }
}
