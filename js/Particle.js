/**
 * Represents a visual particle for game effects like explosions, sparks, trails, and healing effects.
 * Particles have position, velocity, lifecycle, and visual properties that animate over time.
 */
export class Particle {
    /**
     * Creates a new particle instance.
     * @param {number} x - Initial X position in pixels
     * @param {number} y - Initial Y position in pixels
     * @param {number} vx - Initial velocity in X direction (pixels per second)
     * @param {number} vy - Initial velocity in Y direction (pixels per second)
     * @param {number} life - Particle lifetime in milliseconds
     * @param {string} [color='#fff'] - Particle color in CSS format
     */
    constructor(x, y, vx, vy, life, color = '#fff') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.maxLife = life;
        this.life = life;
        this.color = color;
        this.glowColor = color;
        
        // Visual properties
        this.radius = 2 + Math.random() * 3;
        this.alpha = 1;
        this.gravity = 0; // Can add gravity effect
        this.friction = 0.98; // Slight slowdown over time
        
        // Animation properties
        this.scaleStart = 1;
        this.scaleEnd = 0.1;
        this.alphaStart = 1;
        this.alphaEnd = 0;
    }
    
    /**
     * Updates the particle's position, velocity, and visual properties.
     * @param {number} delta - Time elapsed since last update in milliseconds
     */
    update(delta) {
        // Update position (convert from pixels per second to pixels per frame)
        this.x += this.vx * (delta / 1000);
        this.y += this.vy * (delta / 1000);
        
        // Apply gravity
        this.vy += this.gravity * (delta / 1000);
        
        // Apply friction
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // Update life
        this.life -= delta;
        
        // Update visual properties based on life
        const lifePercent = this.life / this.maxLife;
        this.alpha = this.alphaStart + (this.alphaEnd - this.alphaStart) * (1 - lifePercent);
        this.scale = this.scaleStart + (this.scaleEnd - this.scaleStart) * (1 - lifePercent);
    }
    
    /**
     * Checks if the particle has expired.
     * @returns {boolean} True if the particle's life has reached zero or below
     */
    isDead() {
        return this.life <= 0;
    }
    
    /**
     * Renders the particle to the canvas with glow effects.
     * @param {CanvasRenderingContext2D} ctx - Canvas 2D rendering context
     */
    draw(ctx) {
        if (this.isDead()) return;
        
        ctx.save();
        
        // Set alpha
        ctx.globalAlpha = Math.max(0, this.alpha);
        
        // Set glow effect
        ctx.shadowColor = this.glowColor;
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Draw particle
        ctx.fillStyle = this.color;
        
        const renderRadius = Math.max(0, this.radius * this.scale);
        
        // Only draw if radius is positive
        if (renderRadius > 0) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, renderRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    /**
     * Creates an explosion effect with particles radiating outward from a center point.
     * @param {number} x - Explosion center X coordinate
     * @param {number} y - Explosion center Y coordinate
     * @param {number} [count=8] - Number of particles to create
     * @param {string} [color='#0ff'] - Particle color in CSS format
     * @returns {Particle[]} Array of explosion particles
     */
    static createExplosion(x, y, count = 8, color = '#0ff') {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
            const speed = 50 + Math.random() * 100;
            const life = 300 + Math.random() * 500;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                color
            );
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * Creates spark particles that fall downward with gravity effect.
     * @param {number} x - Spark origin X coordinate
     * @param {number} y - Spark origin Y coordinate
     * @param {number} [count=5] - Number of spark particles to create
     * @param {string} [color='#ff0'] - Spark color in CSS format
     * @returns {Particle[]} Array of spark particles
     */
    static createSparks(x, y, count = 5, color = '#ff0') {
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 20 + Math.random() * 40;
            const life = 200 + Math.random() * 300;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                color
            );
            
            particle.radius = 1 + Math.random() * 2;
            particle.gravity = 30; // Sparks fall down
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * Creates a muzzle flash effect for weapon firing.
     * @param {number} x - Muzzle position X coordinate
     * @param {number} y - Muzzle position Y coordinate
     * @param {number} angle - Firing direction angle in radians
     * @param {string} [color='#fff'] - Flash color in CSS format
     * @returns {Particle[]} Array of muzzle flash particles
     */
    static createMuzzleFlash(x, y, angle, color = '#fff') {
        const particles = [];
        const count = 3;
        
        for (let i = 0; i < count; i++) {
            const spreadAngle = angle + (Math.random() - 0.5) * 0.5;
            const speed = 30 + Math.random() * 20;
            const life = 100 + Math.random() * 100;
            
            const particle = new Particle(
                x, y,
                Math.cos(spreadAngle) * speed,
                Math.sin(spreadAngle) * speed,
                life,
                color
            );
            
            particle.radius = 1 + Math.random();
            particle.friction = 0.9; // Quick slowdown
            
            particles.push(particle);
        }
        
        return particles;
    }
    
    /**
     * Creates a single trail particle for projectile effects.
     * @param {number} x - Trail origin X coordinate
     * @param {number} y - Trail origin Y coordinate
     * @param {number} vx - Parent object velocity X (pixels per second)
     * @param {number} vy - Parent object velocity Y (pixels per second)
     * @param {string} [color='#fff'] - Trail color in CSS format
     * @returns {Particle} Single trail particle
     */
    static createTrail(x, y, vx, vy, color = '#fff') {
        const life = 150 + Math.random() * 100;
        
        const particle = new Particle(
            x + (Math.random() - 0.5) * 5,
            y + (Math.random() - 0.5) * 5,
            vx * 0.1 + (Math.random() - 0.5) * 10,
            vy * 0.1 + (Math.random() - 0.5) * 10,
            life,
            color
        );
        
        particle.radius = 1 + Math.random();
        particle.friction = 0.95;
        
        return particle;
    }
    
    /**
     * Creates healing effect particles that float upward.
     * @param {number} x - Heal effect center X coordinate
     * @param {number} y - Heal effect center Y coordinate
     * @param {string} [color='#0f0'] - Healing color in CSS format
     * @returns {Particle[]} Array of healing particles
     */
    static createHealEffect(x, y, color = '#0f0') {
        const particles = [];
        const count = 6;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 30 + Math.random() * 20;
            const life = 800 + Math.random() * 400;
            
            const particle = new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                life,
                color
            );
            
            particle.gravity = -20; // Float upward
            particle.radius = 2 + Math.random() * 2;
            
            particles.push(particle);
        }
        
        return particles;
    }
}
