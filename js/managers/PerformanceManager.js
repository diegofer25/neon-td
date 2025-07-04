/**
 * @fileoverview Performance monitoring and optimization
 */

export class PerformanceManager {
    constructor() {
        this.frameTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.fpsHistory = [];
        this.maxHistory = 60;
        
        // Performance thresholds
        this.lowFpsThreshold = 30;
        this.criticalFpsThreshold = 15;
        
        // Optimization flags
        this.enableParticleOptimization = false;
        this.enableTrailOptimization = false;
        this.reduceParticleCount = false;
    }
    
    /**
     * Update performance metrics
     * @param {number} deltaTime - Frame delta time
     */
    update(deltaTime) {
        this.frameTime = deltaTime;
        this.frameCount++;
        
        // Update FPS every second
        const now = performance.now();
        if (now - this.lastFpsUpdate >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            // Track FPS history
            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > this.maxHistory) {
                this.fpsHistory.shift();
            }
            
            // Update optimization flags
            this.updateOptimizationFlags();
        }
    }
    
    /**
     * Update optimization flags based on performance
     */
    updateOptimizationFlags() {
        const avgFps = this.getAverageFps();
        
        if (avgFps < this.criticalFpsThreshold) {
            this.enableParticleOptimization = true;
            this.enableTrailOptimization = true;
            this.reduceParticleCount = true;
        } else if (avgFps < this.lowFpsThreshold) {
            this.enableParticleOptimization = true;
            this.enableTrailOptimization = false;
            this.reduceParticleCount = false;
        } else {
            this.enableParticleOptimization = false;
            this.enableTrailOptimization = false;
            this.reduceParticleCount = false;
        }
    }
    
    /**
     * Get average FPS over recent history
     * @returns {number} Average FPS
     */
    getAverageFps() {
        if (this.fpsHistory.length === 0) return 60;
        return this.fpsHistory.reduce((sum, fps) => sum + fps, 0) / this.fpsHistory.length;
    }
    
    /**
     * Get performance statistics
     * @returns {Object} Performance stats
     */
    getStats() {
        return {
            currentFps: this.fps,
            averageFps: this.getAverageFps(),
            frameTime: this.frameTime,
            optimizations: {
                particles: this.enableParticleOptimization,
                trails: this.enableTrailOptimization,
                reducedParticles: this.reduceParticleCount
            }
        };
    }
    
    /**
     * Check if performance optimization is needed
     * @returns {boolean} True if optimization needed
     */
    needsOptimization() {
        return this.enableParticleOptimization || this.enableTrailOptimization;
    }
}
