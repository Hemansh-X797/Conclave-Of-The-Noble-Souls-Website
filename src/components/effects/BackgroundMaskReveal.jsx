// ============================================================================
// BACKGROUND MASK REVEAL COMPONENT
// Location: /src/components/effects/BackgroundMaskReveal.jsx
// Luxury dual background effect
// ============================================================================

export function BackgroundMaskReveal({
  children,
  threshold = 0.1,
  direction = 'bottom', // top, bottom, left, right
  revealPercentage = 100,
  ease = 'ease-out',
  duration = 0.6,
  className = '',
  style = {}
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const maskDirection = {
    bottom: `linear-gradient(to bottom, black ${revealPercentage}%, transparent ${revealPercentage + 10}%)`,
    top: `linear-gradient(to top, black ${revealPercentage}%, transparent ${revealPercentage + 10}%)`,
    left: `linear-gradient(to left, black ${revealPercentage}%, transparent ${revealPercentage + 10}%)`,
    right: `linear-gradient(to right, black ${revealPercentage}%, transparent ${revealPercentage + 10}%)`
  };

  return (
    <div
      ref={sectionRef}
      className={`background-mask-reveal ${className}`}
      style={{
        maskImage: isVisible ? maskDirection[direction] : 'none',
        webkitMaskImage: isVisible ? maskDirection[direction] : 'none',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all ${duration}s ${ease}`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * BACKGROUND MASK REVEAL:
 * 
 * <BackgroundMaskReveal direction="bottom" threshold={0.2}>
 *   <section>
 *     <h2>Your Content</h2>
 *     <p>Reveals on scroll</p>
 *   </section>
 * </BackgroundMaskReveal>
 * 
 */
