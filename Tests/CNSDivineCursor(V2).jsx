import { useEffect, useState, useRef, useCallback } from 'react';

const NobleCursor = ({ 
  enableParticles = true, 
  particleCount = 15,
  enableSounds = false,
  customColors = {} 
}) => {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [cursorState, setCursorState] = useState('default');
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const animationIdRef = useRef(null);

  // Detect mobile devices and disable custom cursor
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0);
      setIsMobile(isMobileDevice);
    };
    checkMobile();
  }, []);

  // Get ring size for proper centering
  const getRingSize = useCallback((state) => {
    const sizes = {
      default: 20,
      hover: 50,
      text: 30,
      loading: 40,
      gaming: 65,
      lorebound: 70,
      productive: 45,
      news: 75
    };
    return sizes[state] || 20;
  }, []);

  // Optimized particle creation with object pooling
  const createParticle = useCallback((x, y) => {
    if (!enableParticles || isMobile) return;
    
    const activeParticles = document.querySelectorAll('.cursor-particle');
    if (activeParticles.length > particleCount) return;

    const particle = document.createElement('div');
    particle.className = 'cursor-particle';
    particle.style.cssText = `
      position: fixed;
      left: ${x - 1}px;
      top: ${y - 1}px;
      width: 2px;
      height: 2px;
      background: ${getParticleColor()};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      opacity: 0.5;
      animation: fadeParticle 1.2s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    setTimeout(() => {
      if (particle.parentNode) particle.remove();
    }, 1200);
  }, [enableParticles, particleCount, cursorState]);

  const getParticleColor = useCallback(() => {
    const colors = {
      default: '#ffd700',
      hover: '#f8f8ff',
      gaming: '#00bfff',
      lorebound: '#ff1493',
      productive: '#c0c0c0',
      news: '#e0115f',
      loading: '#ffd700'
    };
    return colors[cursorState] || '#ffd700';
  }, [cursorState]);

  useEffect(() => {
    if (isMobile) return;

    let targetPos = { x: 0, y: 0 };
    let currentPos = { x: 0, y: 0 };
    let particleTimer = 0;

    const updateCursor = (e) => {
      targetPos.x = e.clientX;
      targetPos.y = e.clientY;
      
      // Throttled particle creation for performance
      particleTimer++;
      if (particleTimer % 4 === 0) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const animateCursor = () => {
      // Smooth magnetic interpolation - adjusted for different cursor states
      const lerpSpeed = cursorState === 'loading' ? 0.08 : 0.12;
      currentPos.x += (targetPos.x - currentPos.x) * lerpSpeed;
      currentPos.y += (targetPos.y - currentPos.y) * lerpSpeed;

      if (dotRef.current && ringRef.current) {
        // Dot follows immediately and stays centered
        dotRef.current.style.transform = `translate(${targetPos.x - 4}px, ${targetPos.y - 4}px)`;
        
        // Ring follows with magnetic delay - properly centered on cursor
        const ringSize = getRingSize(cursorState);
        ringRef.current.style.transform = `translate(${currentPos.x - ringSize/2}px, ${currentPos.y - ringSize/2}px)`;
      }

      animationIdRef.current = requestAnimationFrame(animateCursor);
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('[data-cursor]');
      const isText = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'INPUT', 'TEXTAREA', 'A', 'LABEL'].includes(e.target.tagName);
      const isButton = e.target.tagName === 'BUTTON' || e.target.closest('button');
      
      if (target) {
        setCursorState(target.dataset.cursor);
      } else if (isButton && !target) {
        setCursorState('hover');
      } else if (isText) {
        setCursorState('text');
      }
    };

    const handleMouseOut = (e) => {
      const target = e.relatedTarget?.closest('[data-cursor]');
      const isText = e.relatedTarget && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'INPUT', 'TEXTAREA', 'A', 'LABEL'].includes(e.relatedTarget.tagName);
      const isButton = e.relatedTarget && (e.relatedTarget.tagName === 'BUTTON' || e.relatedTarget.closest('button'));
      
      if (!target && !isText && !isButton) {
        setCursorState('default');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    const handleClick = () => {
      // Brief loading state on click for better feedback
      const originalState = cursorState;
      setCursorState('loading');
      setTimeout(() => setCursorState(originalState), 200);
    };

    document.addEventListener('mousemove', updateCursor, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('click', handleClick, { passive: true });

    animateCursor();

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('click', handleClick);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      // Cleanup any remaining particles
      document.querySelectorAll('.cursor-particle').forEach(p => p.remove());
    };
  }, [createParticle, cursorState, isMobile, getRingSize]);

  // Don't render on mobile
  if (isMobile) return null;

  return (
    <>
      <style>{`
        * {
          cursor: none !important;
        }

        .cns-cursor-dot {
          width: 8px;
          height: 8px;
          background: #ffd700;
          border-radius: 50%;
          position: fixed;
          pointer-events: none;
          z-index: 10000;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: ${isVisible ? '0.9' : '0'};
          will-change: transform;
        }

        .cns-cursor-ring {
          width: 50px;
          height: 50px;
          position: fixed;
          pointer-events: none;
          z-index: 9999;
          transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
          opacity: ${isVisible ? '0.6' : '0'};
          will-change: transform;
        }

        /* DEFAULT STATE */
        .cns-cursor-dot.default {
          width: 8px;
          height: 8px;
          background: #ffd700;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
        }

        .cns-cursor-ring.default {
          width: 20px;
          height: 20px;
          border: 1px solid #ffd700;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.2);
        }

        /* HOVER STATE */
        .cns-cursor-dot.hover {
          width: 4px;
          height: 4px;
          background: #f8f8ff;
          box-shadow: 0 0 12px rgba(248, 248, 255, 0.6);
        }

        .cns-cursor-ring.hover {
          width: 50px;
          height: 50px;
          border: 2px solid #ffd700;
          border-radius: 50%;
          box-shadow: 0 0 25px rgba(255, 215, 0, 0.5);
        }

        /* TEXT STATE */
        .cns-cursor-dot.text {
          display: none;
        }

        .cns-cursor-ring.text {
          width: 2px;
          height: 30px;
          border-radius: 2px;
          border: 1px solid #ffd700;
          box-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
        }

        /* LOADING STATE */
        .cns-cursor-dot.loading {
          width: 6px;
          height: 6px;
          background: #ffd700;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
          animation: loadingPulse 1.5s ease-in-out infinite;
        }

        .cns-cursor-ring.loading {
          width: 40px;
          height: 40px;
          border: 2px solid transparent;
          border-top: 2px solid #ffd700;
          border-right: 2px solid #ffd700;
          border-radius: 50%;
          animation: loadingSpin 1s linear infinite;
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
        }

        @keyframes loadingPulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 1; }
        }

        @keyframes loadingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ===== ENHANCED PATHWAY CURSORS ===== */

        /* GAMING PATHWAY - Enhanced Targeting System */
        .cns-cursor-dot.gaming {
          width: 4px;
          height: 4px;
          background: #00bfff;
          box-shadow: 0 0 20px rgba(0, 191, 255, 0.9);
          animation: gamingPulse 1.8s ease-in-out infinite;
        }

        .cns-cursor-ring.gaming {
          width: 65px;
          height: 65px;
          border: none;
          background: none;
          position: relative;
          animation: gamingRotate 3s linear infinite;
        }

        .cns-cursor-ring.gaming::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 45px;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00bfff, transparent);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.7);
        }

        .cns-cursor-ring.gaming::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 2px;
          height: 45px;
          background: linear-gradient(180deg, transparent, #00bfff, transparent);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 15px rgba(0, 191, 255, 0.7);
        }

        @keyframes gamingPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.5); opacity: 1; }
        }

        @keyframes gamingRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* LOREBOUND PATHWAY - Enhanced Mystical Rune */
        .cns-cursor-dot.lorebound {
          width: 6px;
          height: 6px;
          background: #ff1493;
          border-radius: 50%;
          box-shadow: 0 0 25px rgba(255, 20, 147, 0.8);
          animation: loreboundFloat 2.5s ease-in-out infinite;
        }

        .cns-cursor-ring.lorebound {
          width: 70px;
          height: 70px;
          border: none;
          background: none;
          position: relative;
          animation: loreboundRotate 6s linear infinite;
        }

        .cns-cursor-ring.lorebound::before {
          content: '✦';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 35px;
          color: #ff1493;
          text-shadow: 
            0 0 20px rgba(255, 20, 147, 0.8),
            0 0 40px rgba(255, 20, 147, 0.4);
          animation: loreboundGlow 3s ease-in-out infinite alternate;
        }

        .cns-cursor-ring.lorebound::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 50px;
          height: 50px;
          border: 1px solid rgba(255, 20, 147, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: loreboundRipple 2s ease-out infinite;
        }

        @keyframes loreboundFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }

        @keyframes loreboundRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes loreboundGlow {
          from { 
            text-shadow: 0 0 20px rgba(255, 20, 147, 0.6), 0 0 40px rgba(255, 20, 147, 0.3);
            transform: translate(-50%, -50%) scale(1);
          }
          to { 
            text-shadow: 0 0 30px rgba(255, 20, 147, 1), 0 0 60px rgba(255, 20, 147, 0.5);
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes loreboundRipple {
          0% { 
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1.4);
            opacity: 0;
          }
        }

        /* PRODUCTIVE PATHWAY - Perfect Silver Circle with Subtle Animation */
        .cns-cursor-dot.productive {
          width: 5px;
          height: 5px;
          background: #c0c0c0;
          border-radius: 50%;
          box-shadow: 0 0 15px rgba(192, 192, 192, 0.6);
          animation: productivePulse 3s ease-in-out infinite;
        }

        .cns-cursor-ring.productive {
          width: 45px;
          height: 45px;
          border: 2px solid #c0c0c0;
          border-radius: 50%;
          background: none;
          position: relative;
          box-shadow: 
            0 0 20px rgba(192, 192, 192, 0.3),
            inset 0 0 10px rgba(192, 192, 192, 0.1);
          animation: productiveGlow 4s ease-in-out infinite;
        }

        .cns-cursor-ring.productive::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 1px;
          background: #c0c0c0;
          transform: translate(-50%, -50%);
          opacity: 0.6;
          box-shadow: 0 0 8px rgba(192, 192, 192, 0.4);
        }

        .cns-cursor-ring.productive::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 1px;
          height: 20px;
          background: #c0c0c0;
          transform: translate(-50%, -50%);
          opacity: 0.6;
          box-shadow: 0 0 8px rgba(192, 192, 192, 0.4);
        }

        @keyframes productivePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes productiveGlow {
          0%, 100% { 
            box-shadow: 
              0 0 20px rgba(192, 192, 192, 0.3),
              inset 0 0 10px rgba(192, 192, 192, 0.1);
          }
          50% { 
            box-shadow: 
              0 0 30px rgba(192, 192, 192, 0.5),
              inset 0 0 15px rgba(192, 192, 192, 0.2);
          }
        }

        /* NEWS PATHWAY - Enhanced Lightning Energy */
        .cns-cursor-dot.news {
          width: 7px;
          height: 7px;
          background: #e0115f;
          box-shadow: 0 0 25px rgba(224, 17, 95, 0.9);
          animation: newsEnergy 1.2s ease-in-out infinite;
        }

        .cns-cursor-ring.news {
          width: 75px;
          height: 75px;
          border: none;
          background: none;
          position: relative;
          animation: newsStatic 0.1s linear infinite;
        }

        .cns-cursor-ring.news::before {
          content: '⚡';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 40px;
          color: #e0115f;
          text-shadow: 
            0 0 25px rgba(224, 17, 95, 0.9),
            0 0 50px rgba(224, 17, 95, 0.5);
          animation: newsLightning 0.6s ease-in-out infinite alternate;
        }

        .cns-cursor-ring.news::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 60px;
          height: 60px;
          border: 1px solid rgba(224, 17, 95, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: newsShockwave 1.5s ease-out infinite;
        }

        @keyframes newsEnergy {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.3); }
          75% { transform: scale(0.8); }
        }

        @keyframes newsStatic {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(2deg); }
        }

        @keyframes newsLightning {
          from { 
            text-shadow: 0 0 25px rgba(224, 17, 95, 0.7), 0 0 50px rgba(224, 17, 95, 0.3);
            transform: translate(-50%, -50%) rotate(-1deg) scale(0.95);
          }
          to { 
            text-shadow: 0 0 35px rgba(224, 17, 95, 1), 0 0 70px rgba(224, 17, 95, 0.6);
            transform: translate(-50%, -50%) rotate(1deg) scale(1.05);
          }
        }

        @keyframes newsShockwave {
          0% { 
            transform: translate(-50%, -50%) scale(0.7);
            opacity: 0.8;
          }
          100% { 
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0;
          }
        }

        /* Optimized particle system */
        @keyframes fadeParticle {
          0% { 
            opacity: 0.5; 
            transform: scale(1) translateY(0); 
          }
          50% { 
            opacity: 0.2; 
            transform: scale(1.5) translateY(-5px); 
          }
          100% { 
            opacity: 0; 
            transform: scale(0) translateY(-10px); 
          }
        }

        /* Respect reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          .cns-cursor-dot, .cns-cursor-ring {
            animation: none !important;
            transition: opacity 0.2s ease !important;
          }
          
          .cns-cursor-ring.gaming,
          .cns-cursor-ring.lorebound,
          .cns-cursor-ring.news {
            animation: none !important;
          }
          
          .cns-cursor-ring.gaming::before,
          .cns-cursor-ring.gaming::after,
          .cns-cursor-ring.lorebound::before,
          .cns-cursor-ring.lorebound::after,
          .cns-cursor-ring.news::before,
          .cns-cursor-ring.news::after {
            animation: none !important;
          }
        }
      `}</style>

      {/* Cursor Elements */}
      <div
        ref={dotRef}
        className={`cns-cursor-dot ${cursorState}`}
      />
      <div
        ref={ringRef}
        className={`cns-cursor-ring ${cursorState}`}
      />
    </>
  );
};

export default NobleCursor;