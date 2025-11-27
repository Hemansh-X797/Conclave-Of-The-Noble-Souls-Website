// ============================================================================
// PARTICLE TRAIL COMPONENT
// Location: /src/components/effects/ParticleTrail.jsx
// Luxury particles trailing AdvancedNobleCursor
// ============================================================================

'use client';

import React, { useEffect, useRef, useState } from 'react';

export function ParticleTrail({
  particleCount = 30,
  particleSize = 4,
  particleLife = 1000, // ms
  particleColors = ['#FFD700', '#FFA500', '#FF6347'],
  trailLength = 20,
  enabled = true,
  className = ''
}) {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const particles = useRef([]);
  const animationId = useRef(null);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
                     window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!enabled || isMobile) {
return;
}

    const canvas = canvasRef.current;
    if (!canvas) {
return;
}

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (x, y) => ({
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: particleLife,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        size: particleSize * (0.5 + Math.random() * 0.5)
      });

    const handleMouseMove = (e) => {
      if (particles.current.length >= particleCount) {
return;
}
      
      for (let i = 0; i < 2; i++) {
        particles.current.push(createParticle(e.clientX, e.clientY));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter(particle => {
        particle.life -= 16; // Assuming 60fps
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity

        if (particle.life <= 0) {
return false;
}

        const alpha = particle.life / particleLife;
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationId.current) {
cancelAnimationFrame(animationId.current);
}
    };
  }, [enabled, isMobile, particleCount, particleSize, particleLife, particleColors]);

  if (!enabled || isMobile) {
return null;
}

  return (
    <canvas
      ref={canvasRef}
      className={`particle-trail-canvas ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 999995 // Below NobleCursor (999996)
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * PARTICLE TRAIL:
 * 
 * <ParticleTrail
 *   particleCount={30}
 *   particleColors={['#FFD700', '#FFA500']}
 *   particleLife={1000}
 * />
 * 
 */