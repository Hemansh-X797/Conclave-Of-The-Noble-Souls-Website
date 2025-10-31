import { useEffect, useState, useRef, useCallback } from 'react';
import '@/styles/cursors.css'

const AdvancedNobleCursor = ({ 
  enableParticles = true, 
  particleCount = 20,
  enableTrails = true,
  trailLength = 8,
  enableClickFeedback = true,
  performanceMode = false,
  debugMode = false 
}) => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [currentPathway, setCurrentPathway] = useState('default');
  const [cursorState, setCursorState] = useState('default');
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  // Refs for cursor elements
  const defaultDotRef = useRef(null);
  const defaultRingRef = useRef(null);
  const gamingCursorRef = useRef(null);
  const loreboundCursorRef = useRef(null);
  const productiveCursorRef = useRef(null);
  const newsCursorRef = useRef(null);
  const particleSystemRef = useRef(null);
  
  // Animation and particle management refs
  const animationIdRef = useRef(null);
  const particlePoolRef = useRef([]);
  const trailPointsRef = useRef([]);
  const mouseVelocityRef = useRef({ x: 0, y: 0 });
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0) ||
                            window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(isMobileDevice);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Pathway detection system
  const detectPathway = useCallback((element) => {
    if (!element) return 'default';
    
    // Check for explicit pathway data attributes
    const pathwayAttr = element.dataset?.pathway || element.closest('[data-pathway]')?.dataset?.pathway;
    if (pathwayAttr) return pathwayAttr;
    
    // Check for pathway class names
    const pathwayClass = element.className?.match(/pathway-(gaming|lorebound|productive|news)/)?.[1];
    if (pathwayClass) return pathwayClass;
    
    // Check parent elements
    const pathwayParent = element.closest('.pathway-gaming, .pathway-lorebound, .pathway-productive, .pathway-news');
    if (pathwayParent) {
      return pathwayParent.className.match(/pathway-(gaming|lorebound|productive|news)/)?.[1] || 'default';
    }
    
    return 'default';
  }, []);

  // Enhanced particle creation system
  const createParticle = useCallback((x, y, pathway = 'default') => {
    if (!enableParticles || isMobile || performanceMode) return;
    
    const existingParticles = document.querySelectorAll('.cursor-particle-active');
    if (existingParticles.length > particleCount) return;

    let particle;
    
    // Create pathway-specific particles
    switch (pathway) {
      case 'gaming':
        particle = createGamingParticle(x, y);
        break;
      case 'lorebound':
        particle = createLoreboundParticle(x, y);
        break;
      case 'productive':
        particle = createProductiveParticle(x, y);
        break;
      case 'news':
        particle = createNewsParticle(x, y);
        break;
      default:
        particle = createDefaultParticle(x, y);
    }

    if (particle) {
      document.body.appendChild(particle);
      
      // Auto cleanup
      setTimeout(() => {
        if (particle.parentNode) particle.remove();
      }, 2500);
    }
  }, [enableParticles, particleCount, isMobile, performanceMode]);

  // Default particle creation
  const createDefaultParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'cursor-trail-particle cursor-particle-active';
    particle.style.cssText = `
      position: fixed;
      left: ${x - 2}px;
      top: ${y - 2}px;
      width: 4px;
      height: 4px;
      background: var(--cursor-noble-trail);
      border-radius: 50%;
      pointer-events: none;
      z-index: 999996;
      box-shadow: 0 0 8px var(--cursor-noble-glow);
    `;
    return particle;
  };

  // Gaming pathway particle creation
  const createGamingParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'gaming-energy-particle cursor-particle-active';
    
    const types = ['line-vertical', 'line-horizontal', 'dot'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let styles = `
      position: fixed;
      left: ${x - 3}px;
      top: ${y - 4}px;
      pointer-events: none;
      z-index: 999996;
      border-radius: ${type === 'dot' ? '50%' : '1px'};
    `;
    
    switch (type) {
      case 'line-vertical':
        styles += `
          width: 3px;
          height: 8px;
          background: linear-gradient(180deg, var(--cursor-gaming-primary) 0%, transparent 100%);
        `;
        break;
      case 'line-horizontal':
        styles += `
          width: 8px;
          height: 3px;
          background: linear-gradient(90deg, var(--cursor-gaming-secondary) 0%, transparent 100%);
        `;
        break;
      case 'dot':
        styles += `
          width: 4px;
          height: 4px;
          background: var(--cursor-gaming-accent);
        `;
        break;
    }
    
    particle.style.cssText = styles;
    return particle;
  };

  // Lorebound mystical particle creation
  const createLoreboundParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'lorebound-mystical-particle cursor-particle-active';
    
    const randomOffset = () => (Math.random() - 0.5) * 20;
    const sizes = [3, 5, 7];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    const colors = ['var(--cursor-lorebound-primary)', 'var(--cursor-lorebound-mystical)', 'var(--cursor-lorebound-secondary)'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.cssText = `
      position: fixed;
      left: ${x - size/2 + randomOffset()}px;
      top: ${y - size/2 + randomOffset()}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 999996;
      box-shadow: 
        0 0 10px var(--cursor-lorebound-glow),
        0 0 20px var(--cursor-lorebound-shadow),
        inset 0 0 5px rgba(255, 255, 255, 0.3);
    `;
    return particle;
  };

  // Productive pathway particle creation
  const createProductiveParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'productive-efficiency-particle cursor-particle-active';
    
    const types = ['vertical', 'horizontal', 'dot'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let styles = `
      position: fixed;
      left: ${x - 2}px;
      top: ${y - 6}px;
      pointer-events: none;
      z-index: 999996;
      border-radius: ${type === 'dot' ? '50%' : '1px'};
    `;
    
    switch (type) {
      case 'vertical':
        styles += `
          width: 2px;
          height: 12px;
          background: linear-gradient(180deg, var(--cursor-productive-primary) 0%, var(--cursor-productive-accent) 50%, transparent 100%);
        `;
        break;
      case 'horizontal':
        styles += `
          width: 8px;
          height: 2px;
          background: linear-gradient(90deg, var(--cursor-productive-secondary) 0%, var(--cursor-productive-accent) 50%, transparent 100%);
        `;
        break;
      case 'dot':
        styles += `
          width: 4px;
          height: 4px;
          background: var(--cursor-productive-accent);
        `;
        break;
    }
    
    particle.style.cssText = styles;
    return particle;
  };

  // News pathway particle creation
  const createNewsParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.className = 'news-electric-particle cursor-particle-active';
    
    const types = ['spark-vertical', 'spark-horizontal', 'electric-dot'];
    const type = types[Math.floor(Math.random() * types.length)];
    const randomOffset = () => (Math.random() - 0.5) * 10;
    
    let styles = `
      position: fixed;
      left: ${x - 3 + randomOffset()}px;
      top: ${y - 3 + randomOffset()}px;
      pointer-events: none;
      z-index: 999996;
      box-shadow: 0 0 6px var(--cursor-news-glow);
    `;
    
    switch (type) {
      case 'spark-vertical':
        styles += `
          width: 2px;
          height: 6px;
          background: linear-gradient(180deg, var(--cursor-news-electric) 0%, var(--cursor-news-primary) 50%, transparent 100%);
          border-radius: 1px;
        `;
        break;
      case 'spark-horizontal':
        styles += `
          width: 6px;
          height: 2px;
          background: linear-gradient(90deg, var(--cursor-news-secondary) 0%, var(--cursor-news-electric) 50%, transparent 100%);
          border-radius: 1px;
        `;
        break;
      case 'electric-dot':
        styles += `
          width: 3px;
          height: 3px;
          background: var(--cursor-news-electric);
          border-radius: 50%;
        `;
        break;
    }
    
    particle.style.cssText = styles;
    return particle;
  };

  // Click feedback system
  const createClickFeedback = useCallback((x, y, pathway = 'default') => {
    if (!enableClickFeedback || isMobile) return;
    
    const ring = document.createElement('div');
    ring.className = `cursor-click-ring ${pathway}`;
    ring.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
    `;
    
    document.body.appendChild(ring);
    
    // Auto cleanup
    setTimeout(() => {
      if (ring.parentNode) ring.remove();
    }, 600);
  }, [enableClickFeedback, isMobile]);

  // Mouse velocity calculation
  const updateVelocity = useCallback((x, y) => {
    mouseVelocityRef.current = {
      x: x - lastMousePosRef.current.x,
      y: y - lastMousePosRef.current.y
    };
    lastMousePosRef.current = { x, y };
  }, []);

  // Enhanced cursor position and state management
  useEffect(() => {
    if (isMobile) return;

    let targetPos = { x: 0, y: 0 };
    let currentPos = { x: 0, y: 0 };
    let particleTimer = 0;
    let trailTimer = 0;

    const updateCursor = (e) => {
      targetPos.x = e.clientX;
      targetPos.y = e.clientY;
      
      updateVelocity(e.clientX, e.clientY);
      
      // Update cursor position state
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Detect pathway
      const element = e.target;
      const detectedPathway = detectPathway(element);
      if (detectedPathway !== currentPathway) {
        setCurrentPathway(detectedPathway);
      }

      // Throttled particle creation
      particleTimer++;
      const particleFrequency = performanceMode ? 8 : 4;
      if (particleTimer % particleFrequency === 0) {
        createParticle(e.clientX, e.clientY, detectedPathway);
      }

      // Trail system
      if (enableTrails && !performanceMode) {
        trailTimer++;
        if (trailTimer % 2 === 0) {
          trailPointsRef.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
          if (trailPointsRef.current.length > trailLength) {
            trailPointsRef.current.shift();
          }
        }
      }
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isButton = target.tagName === 'BUTTON' || target.closest('button') || target.classList.contains('cursor-hover-target');
      const isLink = target.tagName === 'A' || target.closest('a');
      const isText = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'INPUT', 'TEXTAREA', 'LABEL'].includes(target.tagName);
      const hasDataCursor = target.closest('[data-cursor]');
      
      if (hasDataCursor) {
        setCursorState(hasDataCursor.dataset.cursor);
      } else if (isButton || isLink) {
        setCursorState('hover');
        setIsHoveringButton(true);
      } else if (isText) {
        setCursorState('text');
      } else {
        setCursorState('default');
        setIsHoveringButton(false);
      }
    };

    const handleMouseOut = (e) => {
      const relatedTarget = e.relatedTarget;
      if (!relatedTarget) {
        setCursorState('default');
        setIsHoveringButton(false);
        return;
      }

      const isButton = relatedTarget.tagName === 'BUTTON' || relatedTarget.closest('button');
      const isLink = relatedTarget.tagName === 'A' || relatedTarget.closest('a');
      const isText = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'INPUT', 'TEXTAREA', 'LABEL'].includes(relatedTarget.tagName);
      const hasDataCursor = relatedTarget.closest('[data-cursor]');
      
      if (!hasDataCursor && !isButton && !isLink && !isText) {
        setCursorState('default');
        setIsHoveringButton(false);
      }
    };

    const handleMouseDown = (e) => {
      setIsClicking(true);
      createClickFeedback(e.clientX, e.clientY, currentPathway);
      
      // Brief loading state for feedback
      const originalState = cursorState;
      setCursorState('loading');
      setTimeout(() => setCursorState(originalState), 200);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth cursor animation loop
    const animateCursor = () => {
      const lerpSpeed = currentPathway === 'news' ? 0.15 : 0.12;
      currentPos.x += (targetPos.x - currentPos.x) * lerpSpeed;
      currentPos.y += (targetPos.y - currentPos.y) * lerpSpeed;

      // Update cursor elements based on current pathway and state
      updateCursorElements(targetPos, currentPos);

      animationIdRef.current = requestAnimationFrame(animateCursor);
    };

    const updateCursorElements = (immediate, smooth) => {
      // Hide all cursors first
      hideAllCursors();

      switch (currentPathway) {
        case 'gaming':
          updateGamingCursor(immediate, smooth);
          break;
        case 'lorebound':
          updateLoreboundCursor(immediate, smooth);
          break;
        case 'productive':
          updateProductiveCursor(immediate, smooth);
          break;
        case 'news':
          updateNewsCursor(immediate, smooth);
          break;
        default:
          updateDefaultCursor(immediate, smooth);
      }
    };

    const hideAllCursors = () => {
      if (defaultDotRef.current) defaultDotRef.current.style.opacity = '0';
      if (defaultRingRef.current) defaultRingRef.current.style.opacity = '0';
      if (gamingCursorRef.current) gamingCursorRef.current.style.opacity = '0';
      if (loreboundCursorRef.current) loreboundCursorRef.current.style.opacity = '0';
      if (productiveCursorRef.current) productiveCursorRef.current.style.opacity = '0';
      if (newsCursorRef.current) newsCursorRef.current.style.opacity = '0';
    };

    const updateDefaultCursor = (immediate, smooth) => {
      if (defaultDotRef.current && defaultRingRef.current) {
        defaultDotRef.current.style.opacity = isVisible ? '0.9' : '0';
        defaultRingRef.current.style.opacity = isVisible ? '0.6' : '0';
        
        defaultDotRef.current.style.transform = `translate(${immediate.x - 4}px, ${immediate.y - 4}px)`;
        defaultRingRef.current.style.transform = `translate(${smooth.x - 14}px, ${smooth.y - 14}px)`;
        
        // Apply state classes
        defaultDotRef.current.className = `conclave-cursor-dot ${cursorState}`;
        defaultRingRef.current.className = `conclave-cursor-ring ${cursorState}`;
      }
    };

    const updateGamingCursor = (immediate, smooth) => {
      if (gamingCursorRef.current) {
        gamingCursorRef.current.style.opacity = isVisible ? '1' : '0';
        gamingCursorRef.current.style.transform = `translate(${smooth.x}px, ${smooth.y}px)`;
        
        // Apply state classes
        let className = 'conclave-cursor-gaming';
        if (isHoveringButton) className += ' hover-button';
        if (isClicking) className += ' clicking';
        
        gamingCursorRef.current.className = className;
      }
    };

    const updateLoreboundCursor = (immediate, smooth) => {
      if (loreboundCursorRef.current) {
        loreboundCursorRef.current.style.opacity = isVisible ? '1' : '0';
        loreboundCursorRef.current.style.transform = `translate(${smooth.x}px, ${smooth.y}px)`;
        
        // Apply state classes
        let className = 'conclave-cursor-lorebound';
        if (cursorState === 'hover' || isHoveringButton) className += ' hover';
        
        loreboundCursorRef.current.className = className;
      }
    };

    const updateProductiveCursor = (immediate, smooth) => {
      if (productiveCursorRef.current) {
        productiveCursorRef.current.style.opacity = isVisible ? '1' : '0';
        productiveCursorRef.current.style.transform = `translate(${smooth.x}px, ${smooth.y}px)`;
        
        // Apply state classes
        let className = 'conclave-cursor-productive';
        if (cursorState === 'hover' || isHoveringButton) className += ' hover';
        if (isClicking) className += ' clicking';
        
        productiveCursorRef.current.className = className;
      }
    };

    const updateNewsCursor = (immediate, smooth) => {
      if (newsCursorRef.current) {
        newsCursorRef.current.style.opacity = isVisible ? '1' : '0';
        newsCursorRef.current.style.transform = `translate(${smooth.x}px, ${smooth.y}px)`;
        
        // Apply state classes
        let className = 'conclave-cursor-news';
        if (cursorState === 'hover' || isHoveringButton) className += ' hover';
        if (isClicking) className += ' clicking';
        
        newsCursorRef.current.className = className;
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', updateCursor, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mousedown', handleMouseDown, { passive: true });
    document.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Start animation loop
    animateCursor();

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Cleanup particles
      document.querySelectorAll('.cursor-particle-active').forEach(p => p.remove());
    };
  }, [currentPathway, cursorState, isVisible, isMobile, isClicking, isHoveringButton, 
      detectPathway, createParticle, createClickFeedback, updateVelocity, 
      enableTrails, enableClickFeedback, performanceMode, trailLength]);

  // Cleanup particles periodically
  useEffect(() => {
    if (isMobile || performanceMode) return;
    
    const cleanupInterval = setInterval(() => {
      const particles = document.querySelectorAll('.cursor-particle-active');
      particles.forEach(particle => {
        const opacity = parseFloat(getComputedStyle(particle).opacity);
        if (opacity < 0.1) {
          particle.remove();
        }
      });
    }, 2000);

    return () => clearInterval(cleanupInterval);
  }, [isMobile, performanceMode]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      {/* Cursor preloader for performance */}
      <div className="cursor-preloader" aria-hidden="true" />
      
      {/* Particle system container */}
      <div 
        ref={particleSystemRef} 
        className="cursor-particle-system" 
        aria-hidden="true" 
      />

      {/* Debug info */}
      {debugMode && (
        <div 
          className="cursor-debug-mode"
          data-cursor-state={`${currentPathway}-${cursorState}-${isClicking ? 'clicking' : 'idle'}`}
        />
      )}

      {/* Default Noble Cursor (fallback) */}
      <div
        ref={defaultDotRef}
        className={`conclave-cursor-dot ${cursorState}`}
        style={{ 
          opacity: currentPathway === 'default' && isVisible ? '0.9' : '0',
          transition: 'opacity 0.2s ease'
        }}
        aria-hidden="true"
      />
      <div
        ref={defaultRingRef}
        className={`conclave-cursor-ring ${cursorState}`}
        style={{ 
          opacity: currentPathway === 'default' && isVisible ? '0.6' : '0',
          transition: 'opacity 0.2s ease'
        }}
        aria-hidden="true"
      />

      {/* Gaming Cursor */}
      <div
        ref={gamingCursorRef}
        className="conclave-cursor-gaming"
        style={{ 
          opacity: currentPathway === 'gaming' && isVisible ? '1' : '0',
          transition: 'opacity 0.3s ease'
        }}
        aria-hidden="true"
      />

      {/* Lorebound Cursor */}
      <div
        ref={loreboundCursorRef}
        className="conclave-cursor-lorebound"
        style={{ 
          opacity: currentPathway === 'lorebound' && isVisible ? '1' : '0',
          transition: 'opacity 0.3s ease'
        }}
        aria-hidden="true"
      />

      {/* Productive Cursor */}
      <div
        ref={productiveCursorRef}
        className="conclave-cursor-productive"
        style={{ 
          opacity: currentPathway === 'productive' && isVisible ? '1' : '0',
          transition: 'opacity 0.3s ease'
        }}
        aria-hidden="true"
      />

      {/* News Cursor */}
      <div
        ref={newsCursorRef}
        className="conclave-cursor-news"
        style={{ 
          opacity: currentPathway === 'news' && isVisible ? '1' : '0',
          transition: 'opacity 0.3s ease'
        }}
        aria-hidden="true"
      />

      {/* Performance monitoring (debug mode only) */}
      {debugMode && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          fontFamily: 'monospace',
          fontSize: '12px',
          zIndex: 1000000,
          pointerEvents: 'none'
        }}>
          <div>Pathway: {currentPathway}</div>
          <div>State: {cursorState}</div>
          <div>Position: {Math.round(cursorPos.x)}, {Math.round(cursorPos.y)}</div>
          <div>Velocity: {Math.round(mouseVelocityRef.current.x)}, {Math.round(mouseVelocityRef.current.y)}</div>
          <div>Clicking: {isClicking ? 'Yes' : 'No'}</div>
          <div>Hovering Button: {isHoveringButton ? 'Yes' : 'No'}</div>
          <div>Performance Mode: {performanceMode ? 'On' : 'Off'}</div>
        </div>
      )}
    </>
  );
};

export default AdvancedNobleCursor;

/* =============== -END- =============== */