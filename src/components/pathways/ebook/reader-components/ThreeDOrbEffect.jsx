// ============================================================================
// 3D ORB EFFECT COMPONENT - PROCEDURAL READING COMPANION
// Rotating crystalline orb that responds to reading progress and speed
// Location: /src/components/pathways/ebook/reader-components/ThreeDOrbEffect.jsx
// ============================================================================

'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * ThreeDOrbEffect - Procedural 3D orb with reading-responsive behavior
 * 
 * @param {Object} props
 * @param {number} props.scrollProgress - Reading progress (0-100)
 * @param {number} props.readingSpeed - Pages per hour
 * @param {string} props.moodColor - Current mood color (hex)
 * @param {boolean} props.isReading - Whether actively reading
 */
export default function ThreeDOrbEffect({
  scrollProgress = 0,
  readingSpeed = 0,
  moodColor = '#9D4EDD',
  isReading = false
}) {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);
  const rotationRef = useRef({ x: 0, y: 0, z: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 400 });
  
  // ============================================
  // PARTICLE SYSTEM
  // ============================================
  useEffect(() => {
    // Initialize particles based on progress
    const particleCount = Math.floor((scrollProgress / 100) * 50) + 10;
    const newParticles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 80 + Math.random() * 40;
      
      newParticles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: (Math.random() - 0.5) * 100,
        size: 2 + Math.random() * 3,
        speed: 0.5 + Math.random() * 1.5,
        angle: Math.random() * Math.PI * 2,
        life: Math.random()
      });
    }
    
    particlesRef.current = newParticles;
  }, [scrollProgress]);

  // ============================================
  // CANVAS SETUP
  // ============================================
  useEffect(() => {
    const handleResize = () => {
      const size = Math.min(window.innerWidth * 0.25, 400);
      setCanvasSize({ width: size, height: size });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================
  // MAIN ANIMATION LOOP
  // ============================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
return;
}
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;
    ctx.scale(dpr, dpr);
    
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    // Calculate rotation speed based on reading speed
    const rotationSpeed = isReading ? 
      (readingSpeed < 20 ? 0.002 : // Violet - Deep Focus (slow rotation)
       readingSpeed < 40 ? 0.004 : // Green - Normal (medium rotation)
       readingSpeed < 60 ? 0.008 : // Blue - Fast (faster rotation)
       0.015) : 0.001; // Red - Intense (very fast rotation)
    
    // Pulse speed based on reading activity
    const pulseSpeed = isReading ? 0.05 : 0.02;
    let time = 0;
    
    const animate = () => {
      time += 0.01;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
      
      // Update rotation
      rotationRef.current.y += rotationSpeed;
      rotationRef.current.x += rotationSpeed * 0.5;
      rotationRef.current.z += rotationSpeed * 0.3;
      
      // Draw outer glow
      const glowSize = 80 + Math.sin(time * pulseSpeed) * 20;
      const gradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowSize
      );
      gradient.addColorStop(0, `${moodColor}40`);
      gradient.addColorStop(0.5, `${moodColor}20`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw core orb with icosphere geometry
      drawIcosphere(ctx, centerX, centerY, 50, moodColor, time, pulseSpeed);
      
      // Draw particles
      drawParticles(ctx, centerX, centerY, time, moodColor);
      
      // Draw progress ring
      drawProgressRing(ctx, centerX, centerY, 65, scrollProgress, moodColor);
      
      // Draw inner energy core
      const coreSize = 15 + Math.sin(time * pulseSpeed * 2) * 5;
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreSize
      );
      coreGradient.addColorStop(0, '#FFFFFF');
      coreGradient.addColorStop(0.5, moodColor);
      coreGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Add sparkle effects on chapter milestones
      if (scrollProgress % 10 < 1 && scrollProgress > 0) {
        drawSparkles(ctx, centerX, centerY, time, moodColor);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasSize, scrollProgress, readingSpeed, moodColor, isReading]);

  // ============================================
  // ICOSPHERE DRAWING
  // ============================================
  function drawIcosphere(ctx, cx, cy, radius, color, time, pulseSpeed) {
    const vertices = generateIcosphereVertices(radius);
    const rotatedVertices = vertices.map(v => rotateVertex(v, rotationRef.current));
    
    // Sort by z-depth for proper rendering
    const sorted = rotatedVertices.sort((a, b) => b.z - a.z);
    
    // Draw faces
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < sorted.length - 2; i += 3) {
      const v1 = sorted[i];
      const v2 = sorted[i + 1];
      const v3 = sorted[i + 2];
      
      // Calculate face normal for lighting
      const brightness = (v1.z + v2.z + v3.z) / 3 / radius;
      const alpha = 0.1 + brightness * 0.2;
      
      ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.moveTo(cx + v1.x, cy + v1.y);
      ctx.lineTo(cx + v2.x, cy + v2.y);
      ctx.lineTo(cx + v3.x, cy + v3.y);
      ctx.closePath();
      ctx.fill();
    }
    
    // Draw edges
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < sorted.length - 1; i += 2) {
      const v1 = sorted[i];
      const v2 = sorted[i + 1];
      
      ctx.beginPath();
      ctx.moveTo(cx + v1.x, cy + v1.y);
      ctx.lineTo(cx + v2.x, cy + v2.y);
      ctx.stroke();
    }
    
    // Draw vertices (connection points)
    ctx.globalAlpha = 0.8;
    sorted.forEach(v => {
      const size = 2 + (v.z / radius) * 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx + v.x, cy + v.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
  }

  // ============================================
  // ICOSPHERE VERTEX GENERATION
  // ============================================
  function generateIcosphereVertices(radius) {
    const vertices = [];
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const a = radius / Math.sqrt(1 + phi * phi);
    const b = phi * a;
    
    // 12 vertices of icosahedron
    const positions = [
      [-a, b, 0], [a, b, 0], [-a, -b, 0], [a, -b, 0],
      [0, -a, b], [0, a, b], [0, -a, -b], [0, a, -b],
      [b, 0, -a], [b, 0, a], [-b, 0, -a], [-b, 0, a]
    ];
    
    positions.forEach(([x, y, z]) => {
      vertices.push({ x, y, z });
    });
    
    return vertices;
  }

  // ============================================
  // VERTEX ROTATION
  // ============================================
  function rotateVertex(vertex, rotation) {
    let { x, y, z } = vertex;
    
    // Rotate around Y axis
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const tx = x * cosY - z * sinY;
    const tz = x * sinY + z * cosY;
    x = tx;
    z = tz;
    
    // Rotate around X axis
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const ty = y * cosX - z * sinX;
    z = y * sinX + z * cosX;
    y = ty;
    
    return { x, y, z };
  }

  // ============================================
  // PARTICLE DRAWING
  // ============================================
  function drawParticles(ctx, cx, cy, time, color) {
    ctx.globalAlpha = 0.6;
    
    particlesRef.current.forEach((particle, index) => {
      // Update particle position
      particle.angle += particle.speed * 0.01;
      particle.life += 0.01;
      
      const x = cx + Math.cos(particle.angle) * (particle.x + Math.sin(time + index) * 10);
      const y = cy + Math.sin(particle.angle) * (particle.y + Math.cos(time + index) * 10);
      
      const alpha = Math.sin(particle.life) * 0.5 + 0.5;
      const size = particle.size * (1 + Math.sin(time + index) * 0.3);
      
      // Draw particle
      const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
      particleGradient.addColorStop(0, color);
      particleGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = particleGradient;
      ctx.globalAlpha = alpha * 0.6;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw connection line to nearby particles
      particlesRef.current.slice(index + 1, index + 4).forEach(otherParticle => {
        const ox = cx + Math.cos(otherParticle.angle) * otherParticle.x;
        const oy = cy + Math.sin(otherParticle.angle) * otherParticle.y;
        const dist = Math.hypot(x - ox, y - oy);
        
        if (dist < 50) {
          ctx.strokeStyle = color;
          ctx.globalAlpha = (1 - dist / 50) * 0.2;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(ox, oy);
          ctx.stroke();
        }
      });
    });
    
    ctx.globalAlpha = 1;
  }

  // ============================================
  // PROGRESS RING
  // ============================================
  function drawProgressRing(ctx, cx, cy, radius, progress, color) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (progress / 100) * Math.PI * 2;
    
    // Background ring
    ctx.strokeStyle = `${color}20`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Progress ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.stroke();
    
    // Progress indicator dot
    const dotX = cx + Math.cos(endAngle) * radius;
    const dotY = cy + Math.sin(endAngle) * radius;
    
    const dotGradient = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6);
    dotGradient.addColorStop(0, '#FFFFFF');
    dotGradient.addColorStop(0.5, color);
    dotGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = dotGradient;
    ctx.beginPath();
    ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // ============================================
  // SPARKLE EFFECTS
  // ============================================
  function drawSparkles(ctx, cx, cy, time, color) {
    const sparkleCount = 8;
    const sparkleRadius = 70;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2 + time;
      const x = cx + Math.cos(angle) * sparkleRadius;
      const y = cy + Math.sin(angle) * sparkleRadius;
      
      const size = 3 + Math.sin(time * 5 + i) * 2;
      
      // Draw sparkle cross
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = Math.abs(Math.sin(time * 2 + i));
      
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="orb-container">
      <canvas ref={canvasRef} className="orb-canvas" />
      
      {/* Info Display */}
      <div className="orb-info">
        <div className="orb-progress" style={{ color: moodColor }}>
          {Math.round(scrollProgress)}%
        </div>
        {readingSpeed > 0 && (
          <div className="orb-speed">
            {readingSpeed} p/h
          </div>
        )}
      </div>
      
      <style jsx>{`
        .orb-container {
          position: fixed;
          top: 50%;
          right: 2rem;
          transform: translateY(-50%);
          z-index: 50;
          pointer-events: none;
          filter: drop-shadow(0 0 20px ${moodColor}40);
        }

        .orb-canvas {
          display: block;
          opacity: 0.8;
        }

        .orb-info {
          position: absolute;
          bottom: -3rem;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          font-family: var(--font-cinzel);
          white-space: nowrap;
        }

        .orb-progress {
          font-size: 1.25rem;
          font-weight: 700;
          text-shadow: 0 0 10px currentColor;
        }

        .orb-speed {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        @media (max-width: 1200px) {
          .orb-container {
            right: 1rem;
          }
        }

        @media (max-width: 1024px) {
          .orb-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}