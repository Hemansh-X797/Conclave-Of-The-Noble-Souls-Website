// ============================================================================
// THE CONCLAVE REALM - 3D NEWS CAROUSEL
// Location: /src/components/pathways/news/NewsCarousel3D.tsx
// ============================================================================
// Purpose: 3D rotating carousel with procedural geometry (no external models)
// Interaction: Scroll on desktop, swipe on mobile
// Categories: Technology, General, Science, Politics, Business, Health, Entertainment, Discussions
// ============================================================================

'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * @interface NewsCategory
 * @description News category configuration
 */
interface NewsCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  geometryType: 'spaceship' | 'sphere' | 'helix' | 'pillar' | 'chart' | 'heart' | 'reel' | 'bubble';
}

/**
 * @interface NewsCarousel3DProps
 * @description Props for NewsCarousel3D component
 */
interface NewsCarousel3DProps {
  /** Enable sound effects */
  enableSound?: boolean;
  /** Callback when category is selected */
  onCategorySelect?: (categoryId: string) => void;
  /** Initial rotation angle */
  initialRotation?: number;
}

/**
 * @component NewsCarousel3D
 * @description 3D rotating carousel with procedural geometric objects
 */
export default function NewsCarousel3D({
  enableSound = true,
  onCategorySelect,
  initialRotation = 0
}: NewsCarousel3DProps) {
  // ============================================================================
  // REFS & STATE
  // ============================================================================
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const rotationRef = useRef<number>(initialRotation);
  const targetRotationRef = useRef<number>(initialRotation);
  const lastScrollY = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const frontCategoryRef = useRef<string>('');
  const router = useRouter();
  
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [frontCategory, setFrontCategory] = useState<NewsCategory | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // ============================================================================
  // CATEGORIES CONFIGURATION
  // ============================================================================
  
  const categories: NewsCategory[] = [
    {
      id: 'technology',
      name: 'Technology News',
      description: 'Latest updates on AI, tech & innovation',
      color: '#00BFFF',
      icon: '🚀',
      geometryType: 'spaceship'
    },
    {
      id: 'general',
      name: 'General News',
      description: 'World news & current events',
      color: '#FFD700',
      icon: '🌐',
      geometryType: 'sphere'
    },
    {
      id: 'science',
      name: 'Science News',
      description: 'Discovery & research updates',
      color: '#9370DB',
      icon: '🔬',
      geometryType: 'helix'
    },
    {
      id: 'politics',
      name: 'Politics News',
      description: 'Government & governance',
      color: '#DC143C',
      icon: '🏛️',
      geometryType: 'pillar'
    },
    {
      id: 'business',
      name: 'Business News',
      description: 'Markets & economy',
      color: '#50C878',
      icon: '📈',
      geometryType: 'chart'
    },
    {
      id: 'health',
      name: 'Health News',
      description: 'Wellness & medicine',
      color: '#FF69B4',
      icon: '❤️',
      geometryType: 'heart'
    },
    {
      id: 'entertainment',
      name: 'Entertainment News',
      description: 'Media & culture',
      color: '#FFA500',
      icon: '🎬',
      geometryType: 'reel'
    },
    {
      id: 'discussions',
      name: 'News Discussions',
      description: 'Community talk',
      color: '#00CED1',
      icon: '💬',
      geometryType: 'bubble'
    }
  ];
  
  const totalCategories = categories.length;
  const radius = 250; // Radius of circular orbit
  const objectSize = 60; // Base size of objects
  
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
  // PROCEDURAL GEOMETRY DRAWING
  // ============================================================================
  
  const drawSpaceship = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    
    // Futuristic spaceship shape
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.6, size * 0.3);
    ctx.lineTo(0, size * 0.7);
    ctx.lineTo(-size * 0.6, size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // Wings
    ctx.beginPath();
    ctx.moveTo(size * 0.4, 0);
    ctx.lineTo(size * 0.8, size * 0.5);
    ctx.lineTo(size * 0.2, size * 0.2);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, 0);
    ctx.lineTo(-size * 0.8, size * 0.5);
    ctx.lineTo(-size * 0.2, size * 0.2);
    ctx.closePath();
    ctx.fill();
  };
  
  const drawSphere = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Globe with latitude/longitude lines
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColorBrightness(color, -30));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    
    // Grid lines
    ctx.strokeStyle = adjustColorBrightness(color, 40);
    ctx.lineWidth = 1;
    
    // Latitude lines
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.ellipse(0, i * size * 0.25, size, size * 0.2, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Longitude lines
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.3, size, (Math.PI * i) / 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  };
  
  const drawHelix = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // DNA helix
    const points = 20;
    const time = Date.now() * 0.001;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    
    // Double helix
    for (let strand = 0; strand < 2; strand++) {
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * Math.PI * 4 + time + strand * Math.PI;
        const x = Math.sin(t) * size * 0.5;
        const y = (i / points - 0.5) * size * 2;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    
    // Connecting rungs
    ctx.strokeStyle = adjustColorBrightness(color, 30);
    ctx.lineWidth = 2;
    for (let i = 0; i <= points; i += 2) {
      const t = (i / points) * Math.PI * 4 + time;
      const x1 = Math.sin(t) * size * 0.5;
      const x2 = Math.sin(t + Math.PI) * size * 0.5;
      const y = (i / points - 0.5) * size * 2;
      
      ctx.beginPath();
      ctx.moveTo(x1, y);
      ctx.lineTo(x2, y);
      ctx.stroke();
    }
  };
  
  const drawPillar = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Classical column
    const gradient = ctx.createLinearGradient(-size * 0.4, 0, size * 0.4, 0);
    gradient.addColorStop(0, adjustColorBrightness(color, -20));
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, adjustColorBrightness(color, -20));
    
    ctx.fillStyle = gradient;
    
    // Column shaft
    ctx.fillRect(-size * 0.4, -size, size * 0.8, size * 2);
    
    // Capital (top)
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.6, -size * 1.2, size * 1.2, size * 0.2);
    ctx.fillRect(-size * 0.5, -size, size, size * 0.15);
    
    // Base (bottom)
    ctx.fillRect(-size * 0.6, size * 0.8, size * 1.2, size * 0.2);
    ctx.fillRect(-size * 0.5, size * 0.65, size, size * 0.15);
    
    // Flutes (vertical grooves)
    ctx.strokeStyle = adjustColorBrightness(color, -30);
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * size * 0.15, -size);
      ctx.lineTo(i * size * 0.15, size);
      ctx.stroke();
    }
  };
  
  const drawChart = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // 3D bar chart
    const bars = 5;
    const barWidth = size * 0.3;
    const spacing = size * 0.4;
    
    for (let i = 0; i < bars; i++) {
      const height = (Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.7) * size;
      const x = (i - bars / 2) * spacing + spacing / 2;
      
      // 3D effect - side
      ctx.fillStyle = adjustColorBrightness(color, -30);
      ctx.beginPath();
      ctx.moveTo(x + barWidth / 2, -height);
      ctx.lineTo(x + barWidth / 2 + size * 0.1, -height + size * 0.1);
      ctx.lineTo(x + barWidth / 2 + size * 0.1, size * 0.1);
      ctx.lineTo(x + barWidth / 2, 0);
      ctx.closePath();
      ctx.fill();
      
      // Front face
      ctx.fillStyle = color;
      ctx.fillRect(x - barWidth / 2, -height, barWidth, height);
      
      // Top face
      ctx.fillStyle = adjustColorBrightness(color, 30);
      ctx.beginPath();
      ctx.moveTo(x - barWidth / 2, -height);
      ctx.lineTo(x + barWidth / 2, -height);
      ctx.lineTo(x + barWidth / 2 + size * 0.1, -height + size * 0.1);
      ctx.lineTo(x - barWidth / 2 + size * 0.1, -height + size * 0.1);
      ctx.closePath();
      ctx.fill();
    }
  };
  
  const drawHeart = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Beating heart
    const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    ctx.scale(scale, scale);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColorBrightness(color, -30));
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size, -size * 0.5, -size * 0.5, -size, 0, -size * 0.3);
    ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.5, 0, size * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // Pulse lines
    ctx.strokeStyle = adjustColorBrightness(color, 50);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, 0);
    ctx.lineTo(-size * 0.1, 0);
    ctx.lineTo(0, -size * 0.4);
    ctx.lineTo(size * 0.1, size * 0.2);
    ctx.lineTo(size * 0.3, 0);
    ctx.stroke();
  };
  
  const drawReel = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Film reel
    const rotation = Date.now() * 0.001;
    ctx.rotate(rotation);
    
    // Outer ring
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.15;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
    ctx.stroke();
    
    // Film holes
    ctx.fillStyle = color;
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const x = Math.cos(angle) * size * 0.8;
      const y = Math.sin(angle) * size * 0.8;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Center hub
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    
    // Spokes
    ctx.strokeStyle = adjustColorBrightness(color, -30);
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const angle = (Math.PI * i) / 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * size * 0.7, Math.sin(angle) * size * 0.7);
      ctx.stroke();
    }
  };
  
  const drawBubble = (ctx: CanvasRenderingContext2D, size: number, color: string) => {
    // Chat bubble with multiple colors
    const colors = ['#00CED1', '#FF69B4', '#FFD700', '#9370DB'];
    
    for (let i = 0; i < 3; i++) {
      const offset = (i - 1) * size * 0.4;
      const bubbleSize = size * (0.8 - i * 0.2);
      
      const gradient = ctx.createRadialGradient(offset, -offset * 0.5, 0, offset, -offset * 0.5, bubbleSize);
      gradient.addColorStop(0, colors[i]);
      gradient.addColorStop(1, adjustColorBrightness(colors[i], -30));
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(offset, -offset * 0.5, bubbleSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.beginPath();
      ctx.arc(offset - bubbleSize * 0.3, -offset * 0.5 - bubbleSize * 0.3, bubbleSize * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // Helper function to adjust color brightness
  const adjustColorBrightness = (color: string, amount: number): string => {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  
  // ============================================================================
  // DRAWING FUNCTION
  // ============================================================================
  
  const drawObject = useCallback((
    ctx: CanvasRenderingContext2D,
    category: NewsCategory,
    angle: number,
    centerX: number,
    centerY: number
  ) => {
    ctx.save();
    
    // Calculate 3D position
    const x = centerX + Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const y = centerY;
    
    // Calculate scale based on z-depth (perspective)
    const scale = 1 + z / 1000;
    const size = objectSize * scale;
    
    // Calculate opacity based on z-depth
    const opacity = 0.3 + (z + radius) / (radius * 2) * 0.7;
    
    ctx.translate(x, y);
    ctx.globalAlpha = opacity;
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, size * 1.5, size * 0.8, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw object based on type
    ctx.globalAlpha = opacity;
    
    switch (category.geometryType) {
      case 'spaceship':
        drawSpaceship(ctx, size, category.color);
        break;
      case 'sphere':
        drawSphere(ctx, size, category.color);
        break;
      case 'helix':
        drawHelix(ctx, size, category.color);
        break;
      case 'pillar':
        drawPillar(ctx, size, category.color);
        break;
      case 'chart':
        drawChart(ctx, size, category.color);
        break;
      case 'heart':
        drawHeart(ctx, size, category.color);
        break;
      case 'reel':
        drawReel(ctx, size, category.color);
        break;
      case 'bubble':
        drawBubble(ctx, size, category.color);
        break;
    }
    
    // Glow effect for front object
    if (z > radius * 0.7) {
      ctx.shadowBlur = 30;
      ctx.shadowColor = category.color;
    }
    
    ctx.restore();
    
    return { z, x, y, scale, category };
  }, []);
  
  // ============================================================================
  // SCROLL/SWIPE HANDLERS
  // ============================================================================
  
  const handleScroll = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * 0.005;
    targetRotationRef.current += delta;
  }, []);
  
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);
  
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      const deltaY = touchStartY.current - e.touches[0].clientY;
      targetRotationRef.current += deltaY * 0.01;
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);
  
  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================
  
  const animate = useCallback(() => {
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Smooth rotation
    rotationRef.current += (targetRotationRef.current - rotationRef.current) * 0.1;
    
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    // Draw all objects
    const objects = categories.map((category, index) => {
      const baseAngle = (Math.PI * 2 * index) / totalCategories;
      const angle = baseAngle + rotationRef.current;
      return drawObject(ctx, category, angle, centerX, centerY);
    });
    
    // Find front object
    const frontObject = objects.reduce((front, obj) => 
      obj.z > front.z ? obj : front
    );
    
    // Update front category
    if (frontObject.category.id !== frontCategoryRef.current) {
      frontCategoryRef.current = frontObject.category.id;
      setFrontCategory(frontObject.category);
      
      // Play sound
      if (enableSound) {
        try {
          const audio = new Audio('/Audio/newsrotation.mp3');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (error) {
          // Silent fail
        }
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  }, [canvasSize, categories, totalCategories, drawObject, enableSound]);
  
  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  
  useEffect(() => {
    if (canvasSize.width > 0) {
      animate();
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [canvasSize.width, animate]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.addEventListener('wheel', handleScroll, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      canvas.removeEventListener('wheel', handleScroll);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [handleScroll, handleTouchStart, handleTouchMove]);
  
  // ============================================================================
  // CLICK HANDLER
  // ============================================================================
  
  const handleClick = () => {
    if (!frontCategory || isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (onCategorySelect) {
      onCategorySelect(frontCategory.id);
    }
    
    // Navigate after wormhole effect (handled externally)
    setTimeout(() => {
      router.push(`/pathways/news/${frontCategory.id}`);
    }, 1500);
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="news-carousel-container">
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '600px',
          cursor: frontCategory ? 'pointer' : 'default',
          background: 'radial-gradient(circle at 50% 50%, #0A0A0F, #000000)'
        }}
      />
      
      {frontCategory && (
        <div className="category-label">
          <span className="category-icon">{frontCategory.icon}</span>
          <h3 className="text-h3">{frontCategory.name}</h3>
          <p className="text-body-sm text-secondary">{frontCategory.description}</p>
          <p className="text-label-xs" style={{ marginTop: '0.5rem', opacity: 0.6 }}>
            {typeof window !== 'undefined' && 'ontouchstart' in window ? 'Swipe' : 'Scroll'} to rotate • Click to enter
          </p>
        </div>
      )}
      
      <style jsx>{`
        .news-carousel-container {
          position: relative;
          width: 100%;
        }
        
        .category-label {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          padding: 1.5rem 2rem;
          background: rgba(10, 10, 15, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          min-width: 300px;
        }
        
        .category-icon {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        
        @media (max-width: 768px) {
          .category-label {
            min-width: 250px;
            padding: 1rem 1.5rem;
          }
          
          .category-icon {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}