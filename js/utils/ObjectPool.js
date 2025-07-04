/**
 * @fileoverview Object pool for performance optimization
 * Manages reusable objects to reduce garbage collection overhead
 */

export class ObjectPool {
    /**
     * Creates a new object pool
     * @param {Function} createFn - Function to create new objects
     * @param {Function} resetFn - Function to reset objects for reuse
     * @param {number} [initialSize=10] - Initial pool size
     * @param {number} [maxSize=100] - Maximum pool size
     * @throws {Error} If createFn or resetFn are not functions
     */
    constructor(createFn, resetFn, initialSize = 10, maxSize = 100) {
        if (typeof createFn !== 'function') {
            throw new Error('createFn must be a function');
        }
        if (typeof resetFn !== 'function') {
            throw new Error('resetFn must be a function');
        }
        if (initialSize < 0 || maxSize < 0 || initialSize > maxSize) {
            throw new Error('Invalid pool size parameters');
        }

        this.createFn = createFn;
        this.resetFn = resetFn;
        this.maxSize = maxSize;
        /** @type {Array<any>} Available objects in pool */
        this.pool = [];
        /** @type {Array<any>} Currently active objects */
        this.active = [];
        
        // Pre-populate pool with initial objects
        this._populatePool(initialSize);
    }
    
    /**
     * Pre-populates the pool with initial objects
     * @private
     * @param {number} size - Number of objects to create
     */
    _populatePool(size) {
        for (let i = 0; i < size; i++) {
            try {
                this.pool.push(this.createFn());
            } catch (error) {
                console.error('Failed to create initial pool object:', error);
            }
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
     * @returns {boolean} True if object was successfully returned to pool
     */
    release(obj) {
        const index = this.active.indexOf(obj);
        if (index === -1) {
            console.warn('Attempted to release object not in active pool');
            return false;
        }
        
        this.active.splice(index, 1);
        
        if (this.pool.length < this.maxSize) {
            this.pool.push(obj);
            return true;
        }
        
        return false; // Pool full, object discarded
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
     * Clear all objects from pool and active list
     */
    clear() {
        this.pool.length = 0;
        this.active.length = 0;
    }
    
    /**
     * Get pool efficiency metrics
     * @returns {{efficiency: number, pooled: number, active: number, total: number}}
     */
    getStats() {
        const total = this.pool.length + this.active.length;
        return {
            pooled: this.pool.length,
            active: this.active.length,
            total,
            efficiency: total > 0 ? (this.pool.length / total) : 0
        };
    }
}
