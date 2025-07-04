export class Particle {
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
    
    isDead() {
        return this.life <= 0;
    }
    
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
        
        const renderRadius = this.radius * this.scale;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, renderRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // Static factory methods for different particle types
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
