/**
 * @fileoverview Mathematical utility functions for game calculations
 */

export class MathUtils {
    // Mathematical constants
    static TAU = Math.PI * 2;
    static HALF_PI = Math.PI * 0.5;
    static EPSILON = 1e-10;

    // Vector and geometric calculations
    
    /**
     * Calculate squared distance (faster than distance for comparisons)
     * @param {number} x1 - First point x coordinate
     * @param {number} y1 - First point y coordinate  
     * @param {number} x2 - Second point x coordinate
     * @param {number} y2 - Second point y coordinate
     * @returns {number} Squared distance
     */
    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
    
    /**
     * Calculate distance between two points
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number} Distance
     */
    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate angle between two points
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @returns {number} Angle in radians
     */
    static angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    /**
     * Normalize a vector
     * @param {number} x 
     * @param {number} y 
     * @returns {{x: number, y: number}} Normalized vector
     */
    static normalize(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    }
    
    /**
     * Normalize angle to range [0, 2π]
     * @param {number} angle - Angle in radians
     * @returns {number} Normalized angle
     */
    static normalizeAngle(angle) {
        while (angle < 0) angle += this.TAU;
        while (angle >= this.TAU) angle -= this.TAU;
        return angle;
    }
    
    // Collision detection methods
    
    /**
     * Check if two circles are colliding
     * @param {Object} obj1 - Object with x, y, radius
     * @param {Object} obj2 - Object with x, y, radius
     * @returns {boolean} True if colliding
     */
    static circleCollision(obj1, obj2) {
        const distance = this.distance(obj1.x, obj1.y, obj2.x, obj2.y);
        return distance < (obj1.radius + obj2.radius);
    }
    
    /**
     * Check if two axis-aligned rectangles are colliding
     * @param {Object} rect1 - Rectangle with x, y, width, height
     * @param {Object} rect2 - Rectangle with x, y, width, height  
     * @returns {boolean} True if rectangles overlap
     */
    static rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    // Random number generation
    
    /**
     * Generate random number between min and max
     * @param {number} min 
     * @param {number} max 
     * @returns {number} Random number
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Generate random integer between min and max (inclusive)
     * @param {number} min 
     * @param {number} max 
     * @returns {number} Random integer
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Choose random element from array
     * @param {Array} array - Array to choose from
     * @returns {any} Random element or undefined if array is empty
     */
    static randomChoice(array) {
        if (!Array.isArray(array) || array.length === 0) {
            return undefined;
        }
        return array[this.randomInt(0, array.length - 1)];
    }
    
    // Utility methods
    
    /**
     * Clamp a value between min and max
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number} Clamped value
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * Linear interpolation
     * @param {number} a 
     * @param {number} b 
     * @param {number} t 
     * @returns {number} Interpolated value
     */
    static lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    /**
     * Check if value is approximately equal (within epsilon)
     * @param {number} a - First value
     * @param {number} b - Second value
     * @param {number} [epsilon=EPSILON] - Tolerance
     * @returns {boolean} True if values are approximately equal
     */
    static approximately(a, b, epsilon = this.EPSILON) {
        return Math.abs(a - b) < epsilon;
    }
}
