// ============================================================================
// TEXT SCRAMBLE COMPONENT
// Location: /src/components/effects/TextScramble.jsx
// Matrix text effect
// ============================================================================

export function TextScramble({
  text = '',
  scrambleSpeed = 50, // ms per character
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  revealDelay = 0,
  onComplete = null,
  trigger = 'mount', // mount, hover, visible
  className = '',
  style = {},
  as = 'span'
}) {
  const [displayText, setDisplayText] = useState('');
  const [isScrambling, setIsScrambling] = useState(false);
  const elementRef = useRef(null);
  const Tag = as;

  const scramble = () => {
    if (isScrambling) {
return;
}
    
    setIsScrambling(true);
    let iteration = 0;
    const textLength = text.length;

    const interval = setInterval(() => {
      setDisplayText((prev) => text.split('').map((char, index) => {
          if (index < iteration) {
            return text[index];
          }
          return characters[Math.floor(Math.random() * characters.length)];
        }).join(''));

      if (iteration >= textLength) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
        if (onComplete) {
onComplete();
}
      }

      iteration += 1 / 3;
    }, scrambleSpeed);
  };

  useEffect(() => {
    if (trigger === 'mount') {
      setTimeout(scramble, revealDelay);
    }
  }, [trigger, revealDelay]);

  useEffect(() => {
    if (trigger === 'visible' && elementRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(scramble, revealDelay);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );

      observer.observe(elementRef.current);
      return () => observer.disconnect();
    }
  }, [trigger, revealDelay]);

  const handleHover = () => {
    if (trigger === 'hover') {
      scramble();
    }
  };

  return (
    <Tag
      ref={elementRef}
      className={`text-scramble ${className}`}
      style={{
        fontFamily: 'var(--font-orbitron), monospace',
        letterSpacing: '0.05em',
        ...style
      }}
      onMouseEnter={trigger === 'hover' ? handleHover : undefined}
    >
      {displayText || text}
    </Tag>
  );
}

// ============================================================================
// PRESET EXPORTS
// ============================================================================

// Particle Trail Presets
export function GoldParticleTrail(props) {
  return (
    <ParticleTrail
      particleColors={['#FFD700', '#FFA500', '#FFFF00']}
      {...props}
    />
  );
}

export function GamingParticleTrail(props) {
  return (
    <ParticleTrail
      particleColors={['#00BFFF', '#00CED1', '#87CEEB']}
      {...props}
    />
  );
}

export function LoreboundParticleTrail(props) {
  return (
    <ParticleTrail
      particleColors={['#6A0DAD', '#9D4EDD', '#8A2BE2']}
      {...props}
    />
  );
}

// Text Scramble Presets
export function AnnouncementScramble({ children, ...props }) {
  return (
    <TextScramble
      text={children}
      scrambleSpeed={40}
      trigger="visible"
      as="h2"
      {...props}
    />
  );
}

export function HeroScramble({ children, ...props }) {
  return (
    <TextScramble
      text={children}
      scrambleSpeed={30}
      trigger="mount"
      revealDelay={500}
      as="h1"
      {...props}
    />
  );
}

// Background Reveal Presets
export function FadeInSection({ children, ...props }) {
  return (
    <BackgroundMaskReveal
      direction="bottom"
      threshold={0.2}
      duration={0.8}
      {...props}
    >
      {children}
    </BackgroundMaskReveal>
  );
}

export function SlideInSection({ children, ...props }) {
  return (
    <BackgroundMaskReveal
      direction="left"
      threshold={0.3}
      duration={1}
      {...props}
    >
      {children}
    </BackgroundMaskReveal>
  );
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * TEXT SCRAMBLE:
 * 
 * <TextScramble
 *   text="The Conclave Realm"
 *   trigger="visible"
 *   scrambleSpeed={50}
 *   as="h1"
 * />
 * 
 * Or with children:
 * 
 * <AnnouncementScramble>
 *   New Tournament Starting Soon!
 * </AnnouncementScramble>
 */