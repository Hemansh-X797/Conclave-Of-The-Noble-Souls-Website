import React, { useEffect, useRef } from 'react';

const LoadingCrest = ({ 
  pathway = 'default',
  size = 'medium',
  message,
  progress,
  className = ''
}) => {
  const spinnerRef = useRef(null);

  useEffect(() => {
    if (!spinnerRef.current) return;
    
    let rotation = 0;
    let animationId;
    
    const animate = () => {
      rotation += 0.3;
      spinnerRef.current.style.transform = `rotate(${rotation}deg)`;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  const pathwayConfig = {
    gaming: { primary: '#00BFFF', glow: 'rgba(0, 191, 255, 0.4)', symbol: '⚔' },
    lorebound: { primary: '#FF1493', glow: 'rgba(255, 20, 147, 0.4)', symbol: '✦' },
    productive: { primary: '#C0C0C0', glow: 'rgba(192, 192, 192, 0.4)', symbol: '⚡' },
    news: { primary: '#E0115F', glow: 'rgba(224, 17, 95, 0.4)', symbol: '◆' },
    default: { primary: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)', symbol: '♛' }
  };

  const config = pathwayConfig[pathway];
  const sizeMap = { small: 48, medium: 64, large: 88, hero: 120 };
  const dimension = sizeMap[size];

  return (
    <div 
      className={`${className} ${pathway}-realm`}
      data-cursor="loading"
      data-pathway={pathway}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}
    >
      <div style={{
        position: 'relative',
        width: dimension,
        height: dimension
      }}>
        <div
          ref={spinnerRef}
          style={{
            width: dimension,
            height: dimension,
            border: `2px solid ${config.primary}`,
            borderTop: `2px solid transparent`,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${config.primary}20, transparent, ${config.primary}40)`,
            boxShadow: `0 0 20px ${config.glow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          <span style={{
            fontSize: dimension * 0.25,
            color: config.primary,
            fontFamily: 'Cinzel Decorative, serif',
            textShadow: `0 0 8px ${config.glow}`
          }}>
            {config.symbol}
          </span>
        </div>
      </div>

      {message && (
        <div style={{
          fontSize: Math.min(16, dimension * 0.2),
          color: config.primary,
          fontFamily: 'Josefin Sans, sans-serif',
          fontWeight: '300',
          textAlign: 'center',
          letterSpacing: '0.5px',
          textShadow: `0 0 6px ${config.glow}`
        }}>
          {message}
        </div>
      )}

      {typeof progress === 'number' && (
        <div style={{
          width: dimension,
          height: 2,
          background: `${config.primary}20`,
          borderRadius: 1,
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(Math.max(progress, 0), 100)}%`,
            background: config.primary,
            transition: 'width 0.3s ease',
            boxShadow: `0 0 4px ${config.glow}`
          }} />
        </div>
      )}

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          div { animation: none !important; }
        }
      `}</style>
    </div>
  );
};

export const LoadingOverlay = ({ isVisible, ...props }) => {
  if (!isVisible) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999
    }}>
      <LoadingCrest size="hero" {...props} />
    </div>
  );
};

export default LoadingCrest;