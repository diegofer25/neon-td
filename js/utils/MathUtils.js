/**
 * @fileoverview Mathematical utility functions
 */

export class MathUtils {
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
     * Check if a point is within canvas bounds
     * @param {number} x 
     * @param {number} y 
     * @param {number} canvasWidth 
     * @param {number} canvasHeight 
     * @param {number} margin 
     * @returns {boolean} True if within bounds
     */
    static isInBounds(x, y, canvasWidth, canvasHeight, margin = 0) {
        return x >= -margin && 
               x <= canvasWidth + margin && 
               y >= -margin && 
               y <= canvasHeight + margin;
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
}
