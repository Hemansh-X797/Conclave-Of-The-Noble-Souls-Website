// ============================================================================
// THE CONCLAVE REALM - COSMIC FLUID BACKGROUND SYSTEM
// Location: /src/components/pathways/productive/FluidBackground.tsx
// ============================================================================
// Purpose: luxury-inspired fluid simulation with solar flare effects
// Physics: Surface tension, gravity, energy conservation
// Position: Originates at 35% from left, flows down continuously
// ============================================================================

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * @interface FluidConfig
 * @description Configuration for fluid physics and appearance
 */
interface FluidConfig {
  // Visual properties
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    glow: string;
  };
  opacity: number;
  glowIntensity: number;
  
  // fluid properties
  viscosity: number;
  surfaceTension: number;
  gravity: number;
  flowRate: number;
  expandRate: number;
  
  // Behavior
  originX: number; // Percentage from left (0-100)
  originY: number; // Pixels from top
  portalSize: number;
  streamWidth: number;
  
  // Solar flares
  flareFrequency: number; // Seconds between flares
  flareIntensity: number;
  flareRadius: number;
  flareParticles: number;
}

/**
 * @interface FluidParticle
 * @description Individual fluid particle data
 */
interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  isFlare: boolean;
}

/**
 * @interface FluidBackgroundProps
 * @description Props for FluidBackground component
 */
interface FluidBackgroundProps {
  /** Target element to flow around (card element) */
  targetElement?: HTMLElement | null;
  /** Enable/disable fluid simulation */
  enabled?: boolean;
  /** Enable sound effects */
  enableSound?: boolean;
  /** Custom configuration */
  config?: Partial<FluidConfig>;
  /** Callback when fluid hits target */
  onFluidImpact?: () => void;
}

/**
 * @component FluidBackground
 * @description Cosmic fluid that flows from top-left, hits card, flows around it, then waterfalls down
 */
export default function FluidBackground({
  targetElement,
  enabled = true,
  enableSound = true,
  config: customConfig,
  onFluidImpact
}: FluidBackgroundProps) {
  // ============================================================================
  // REFS & STATE
  // ============================================================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<FluidParticle[]>([]);
  const lastFlareTimeRef = useRef<number>(0);
  const impactedRef = useRef<boolean>(false);
  
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  const defaultConfig: FluidConfig = {
    colors: {
      primary: '#50C878',    // Emerald green
      secondary: '#00BFFF',  // Deep sky blue
      tertiary: '#6A0DAD',   // Blue violet
      glow: '#FFD700'        // Gold
    },
    opacity: 0.7,
    glowIntensity: 0.9,
    
    viscosity: 0.75,
    surfaceTension: 0.85,
    gravity: 0.8,
    flowRate: 60,
    expandRate: 1.3,
    
    originX: 35, // 35% from left
    originY: -50,
    portalSize: 80,
    streamWidth: 40,
    
    flareFrequency: 3,
    flareIntensity: 1.5,
    flareRadius: 120,
    flareParticles: 40
  };
  
  const config: FluidConfig = { ...defaultConfig, ...customConfig };
  
  // ============================================================================
  // CANVAS SETUP
  // ============================================================================
  
  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasRef.current) return;
      
      const dpr = window.devicePixelRatio || 1;
      const rect = canvasRef.current.getBoundingClientRect();
      
      canvasRef.current.width = rect.width * dpr;
      canvasRef.current.height = rect.height * dpr;
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
      
      setCanvasSize({ width: rect.width, height: rect.height });
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);
  
  // ============================================================================
  // PARTICLE CREATION
  // ============================================================================
  
  const createFluidParticle = useCallback((
    x: number,
    y: number,
    vx: number = 0,
    vy: number = 1,
    isFlare: boolean = false
  ): FluidParticle => {
    return {
      x,
      y,
      vx,
      vy,
      radius: isFlare ? Math.random() * 3 + 1 : Math.random() * 4 + 2,
      alpha: isFlare ? 1 : 0.7,
      lifetime: 0,
      maxLifetime: isFlare ? 120 : 300,
      isFlare
    };
  }, []);
  
  const spawnFluidStream = useCallback(() => {
    if (!canvasSize.width) return;
    
    const originX = (canvasSize.width * config.originX) / 100;
    const originY = config.originY;
    
    // Spawn multiple particles for continuous stream
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * config.streamWidth;
      const particle = createFluidParticle(
        originX + offsetX,
        originY,
        (Math.random() - 0.5) * 0.5,
        config.flowRate / 60 // Convert to pixels per frame
      );
      particlesRef.current.push(particle);
    }
  }, [canvasSize.width, config.originX, config.originY, config.streamWidth, config.flowRate, createFluidParticle]);
  
  const createSolarFlare = useCallback(() => {
    if (!canvasSize.width || !enabled) return;
    
    // Random point along the fluid stream
    const fluidParticles = particlesRef.current.filter(p => !p.isFlare);
    if (fluidParticles.length === 0) return;
    
    const sourceParticle = fluidParticles[Math.floor(Math.random() * fluidParticles.length)];
    
    // Create burst of flare particles
    for (let i = 0; i < config.flareParticles; i++) {
      const angle = (Math.PI * 2 * i) / config.flareParticles;
      const speed = Math.random() * 3 + 2;
      
      const flareParticle = createFluidParticle(
        sourceParticle.x,
        sourceParticle.y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        true
      );
      
      particlesRef.current.push(flareParticle);
    }
    
    // Play sound if enabled
    if (enableSound) {
      try {
        const audio = new Audio('/Audio/solar-flare.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {}); // Ignore errors
      } catch (error) {
        // Silent fail
      }
    }
  }, [canvasSize.width, config.flareParticles, enabled, enableSound, createFluidParticle]);
  
  // ============================================================================
  // PHYSICS UPDATE
  // ============================================================================
  
  const getTargetBounds = useCallback(() => {
    if (!targetElement) return null;
    
    const rect = targetElement.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2
    };
  }, [targetElement]);
  
  const updateParticle = useCallback((particle: FluidParticle, deltaTime: number) => {
    const targetBounds = getTargetBounds();
    
    // Apply gravity
    particle.vy += config.gravity * deltaTime;
    
    // Apply viscosity (drag)
    particle.vx *= (1 - config.viscosity * deltaTime);
    particle.vy *= (1 - config.viscosity * deltaTime);
    
    // Expansion while falling (non-flare particles)
    if (!particle.isFlare && particle.y < (canvasSize.height * 0.4)) {
      particle.vx += (Math.random() - 0.5) * config.expandRate * deltaTime;
    }
    
    // Check collision with target element
    if (targetBounds && !particle.isFlare) {
      const padding = 10; // Pixels of padding around card
      
      // Top border collision
      if (
        particle.y + particle.radius >= targetBounds.top - padding &&
        particle.y - particle.radius <= targetBounds.top + padding &&
        particle.x >= targetBounds.left - padding &&
        particle.x <= targetBounds.right + padding
      ) {
        // Particle hits top of card
        particle.y = targetBounds.top - padding;
        particle.vy = 0;
        
        // Flow left or right based on which side is closer
        const distToLeft = particle.x - targetBounds.left;
        const distToRight = targetBounds.right - particle.x;
        
        particle.vx = distToLeft < distToRight ? -2 : 2;
        
        // Trigger impact callback once
        if (!impactedRef.current && onFluidImpact) {
          onFluidImpact();
          impactedRef.current = true;
        }
      }
      
      // Left border - flow down
      if (
        particle.x >= targetBounds.left - padding &&
        particle.x <= targetBounds.left + padding &&
        particle.y >= targetBounds.top &&
        particle.y <= targetBounds.bottom
      ) {
        particle.x = targetBounds.left - padding;
        particle.vx = 0;
        particle.vy = config.flowRate / 60;
      }
      
      // Right border - flow down
      if (
        particle.x >= targetBounds.right - padding &&
        particle.x <= targetBounds.right + padding &&
        particle.y >= targetBounds.top &&
        particle.y <= targetBounds.bottom
      ) {
        particle.x = targetBounds.right + padding;
        particle.vx = 0;
        particle.vy = config.flowRate / 60;
      }
      
      // Bottom corners - waterfall
      if (particle.y >= targetBounds.bottom) {
        if (
          (particle.x >= targetBounds.left - padding && particle.x <= targetBounds.left + padding) ||
          (particle.x >= targetBounds.right - padding && particle.x <= targetBounds.right + padding)
        ) {
          particle.vy = config.gravity * 2; // Accelerate waterfall
          particle.alpha *= 0.98; // Fade as it falls
        }
      }
    }
    
    // Update position
    particle.x += particle.vx;
    particle.y += particle.vy;
    
    // Surface tension (attract nearby particles)
    if (!particle.isFlare) {
      const nearbyParticles = particlesRef.current.filter(p => {
        if (p === particle || p.isFlare) return false;
        const dx = p.x - particle.x;
        const dy = p.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 30;
      });
      
      nearbyParticles.forEach(other => {
        const dx = other.x - particle.x;
        const dy = other.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
          const force = config.surfaceTension * 0.01;
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
        }
      });
    }
    
    // Update lifetime
    particle.lifetime += 1;
    
    // Fade out near end of life
    if (particle.lifetime > particle.maxLifetime * 0.8) {
      particle.alpha *= 0.95;
    }
    
    // Flare particles fade faster
    if (particle.isFlare) {
      particle.alpha *= 0.97;
    }
  }, [canvasSize.height, config.gravity, config.viscosity, config.expandRate, config.flowRate, config.surfaceTension, getTargetBounds, onFluidImpact]);
  
  // ============================================================================
  // RENDERING
  // ============================================================================
  
  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: FluidParticle
  ) => {
    ctx.save();
    
    if (particle.isFlare) {
      // Flare particles - golden glow
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 3
      );
      gradient.addColorStop(0, `rgba(255, 215, 0, ${particle.alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 140, 0, ${particle.alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Fluid particles - gradient
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.radius * 2
      );
      
      gradient.addColorStop(0, `rgba(80, 200, 120, ${particle.alpha * config.opacity})`);
      gradient.addColorStop(0.5, `rgba(0, 191, 255, ${particle.alpha * config.opacity * 0.8})`);
      gradient.addColorStop(1, `rgba(106, 13, 173, ${particle.alpha * config.opacity * 0.3})`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Glow effect
      if (config.glowIntensity > 0) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = config.colors.glow;
        ctx.globalAlpha = particle.alpha * config.glowIntensity * 0.3;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }, [config.opacity, config.glowIntensity, config.colors.glow]);
  
  const drawPortal = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!canvasSize.width) return;
    
    const originX = (canvasSize.width * config.originX) / 100;
    const originY = config.originY + 50; // Offset to be visible
    const time = Date.now() * 0.001;
    
    // Rotating portal ring
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(time);
    
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const x = Math.cos(angle) * config.portalSize / 2;
      const y = Math.sin(angle) * config.portalSize / 2;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 10);
      gradient.addColorStop(0, 'rgba(80, 200, 120, 0.8)');
      gradient.addColorStop(1, 'rgba(80, 200, 120, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }, [canvasSize.width, config.originX, config.originY, config.portalSize]);
  
  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================
  
  const animate = useCallback(() => {
    if (!canvasRef.current || !enabled) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Spawn new particles
    spawnFluidStream();
    
    // Update particles
    const deltaTime = 1 / 60; // Assume 60fps
    particlesRef.current.forEach(particle => {
      updateParticle(particle, deltaTime);
    });
    
    // Remove dead particles
    particlesRef.current = particlesRef.current.filter(
      p => p.lifetime < p.maxLifetime && p.alpha > 0.01 && p.y < canvasSize.height + 100
    );
    
    // Draw portal
    drawPortal(ctx);
    
    // Draw particles
    particlesRef.current.forEach(particle => {
      drawParticle(ctx, particle);
    });
    
    // Solar flares
    const currentTime = Date.now() / 1000;
    if (currentTime - lastFlareTimeRef.current > config.flareFrequency) {
      createSolarFlare();
      lastFlareTimeRef.current = currentTime;
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [
    enabled,
    canvasSize.width,
    canvasSize.height,
    spawnFluidStream,
    updateParticle,
    drawPortal,
    drawParticle,
    createSolarFlare,
    config.flareFrequency
  ]);
  
  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  
  useEffect(() => {
    if (enabled && canvasSize.width > 0) {
      animate();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, canvasSize.width, animate]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  if (!enabled) return null;
  
  return (
    <canvas
      ref={canvasRef}
      className="fluid-background-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}