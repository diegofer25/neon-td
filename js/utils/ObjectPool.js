/**
 * @fileoverview Object pool for performance optimization
 */

export class ObjectPool {
    /**
     * @param {Function} createFn - Function to create new objects
     * @param {Function} resetFn - Function to reset objects for reuse
     * @param {number} initialSize - Initial pool size
     * @param {number} maxSize - Maximum pool size
     */
    constructor(createFn, resetFn, initialSize = 10, maxSize = 100) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
        this.pool = [];
        this.active = [];
        
        // Pre-populate pool
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }
    
    /**
     * Get an object from the pool
     * @param {...any} args - Arguments to pass to reset function
     * @returns {any} Pooled object
     */
    get(...args) {
        let obj;
        
        if (this.pool.length > 0) {
            obj = this.pool.pop();
            this.resetFn(obj, ...args);
        } else {
            obj = this.createFn();
            this.resetFn(obj, ...args);
        }
        
        this.active.push(obj);
        return obj;
    }
    
    /**
     * Return an object to the pool
     * @param {any} obj - Object to return
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index > -1) {
            this.active.splice(index, 1);
            
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        }
    }
    
    /**
     * Release all active objects
     */
    releaseAll() {
        while (this.active.length > 0) {
            const obj = this.active.pop();
            if (this.pool.length < this.maxSize) {
                this.pool.push(obj);
            }
        }
    }
    
    /**
     * Get statistics about pool usage
     * @returns {{pooled: number, active: number, total: number}}
     */
    getStats() {
        return {
            pooled: this.pool.length,
            active: this.active.length,
            total: this.pool.length + this.active.length
        };
    }
}
