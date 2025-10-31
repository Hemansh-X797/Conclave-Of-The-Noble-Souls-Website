// src/components/ui/PathwayShowcase.jsx
"use client";

/**
 * PathwayShowcase.jsx

 *
 * - Pure client component
 * - Uses your global design_system.css + typography.css (already in layout.jsx)
 * - Requires framer-motion + clsx + next/image + next/link
 * - Integrates with NobleCursor via data-cursor on hoverable elements
 * - Uses your LuxuryButton.jsx (place this after LuxuryButton so imports resolve)
 *
 * IMAGES :
 *   /public/Assets/Images/Pathways/PathwayButtons/Otaku_button.jpg        (gaming)
 *   /public/Assets/Images/Pathways/PathwayButtons/Productive_button.jpg   (productive)
 *   /public/Assets/Images/Pathways/PathwayButtons/news_button.png         (news)
 *   /public/Assets/Images/Pathways/PathwayButtons/pexels-pixabay-159.jpg  (lorebound) ← replace with your actual filename
 */

import { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import LuxuryButton from "@/components/ui/LuxuryButton";

// ---------------------------------------------
// Config
// ---------------------------------------------

const PATHWAYS = [
  {
    id: "lorebound",
    slug: "/pathways/lorebound",
    label: "LOREBOUND SANCTUM",
    eyebrow: "A CENTURY OF POWER AND INFLUENCE",
    title: "A Library of Legends",
    blurb:
      "Enter a sanctum where myths breathe and ink glows. Traverse curated epics, rare tomes, and living lore crafted by scholars and dreamers.",
    cta: "Enter Library",
    cursor: "lorebound",
    // TODO: change to your exact filename:
    image: "/Assets/Images/Pathways/PathwayButtons/pexels-pixabay-159.jpg",
  },
  {
    id: "gaming",
    slug: "/pathways/gaming",
    label: "GAMING REALM",
    eyebrow: "DISCOVER SPECTRE",
    title: "Precision. Velocity. Glory.",
    blurb:
      "A competitive arena tuned for reflex and finesse. Calibrated challenges, live leaderboards, and electric moments under neon skies.",
    cta: "Enter Battle",
    cursor: "gaming",
    image: "/Assets/Images/Pathways/PathwayButtons/Otaku_button.jpg",
  },
  {
    id: "productive",
    slug: "/pathways/productive",
    label: "PRODUCTIVE NEXUS",
    eyebrow: "DISCOVER BESPOKE",
    title: "Systems That Serve You",
    blurb:
      "Design daily rituals with handcrafted tools. Focus suites, ritual trackers, and flow-state layouts—precision-engineered to feel inevitable.",
    cta: "Start Momentum",
    cursor: "productive",
    image: "/Assets/Images/Pathways/PathwayButtons/Productive_button.jpg",
  },
  // Optional fourth card (news)
  {
    id: "news",
    slug: "/pathways/news",
    label: "HERALD’S COURT",
    eyebrow: "SIGNALS & DISPATCHES",
    title: "Truth, Curated",
    blurb:
      "Deep dives without the noise. Signal-rich briefings, original analysis, and contextual layers that respect your attention.",
    cta: "Read Briefings",
    cursor: "news",
    image: "/Assets/Images/Pathways/PathwayButtons/news_button.png",
  },
];

// ---------------------------------------------
// Helpers: magnetic hover + parallax tilt
// ---------------------------------------------

function useMagnetic(strength = 0.25) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  const handleMove = (e, rect) => {
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    x.set((mx - cx) * strength);
    y.set((my - cy) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { x: sx, y: sy, handleMove, handleLeave };
}

function useParallaxTilt(maxRotate = 6) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 18 });
  const sry = useSpring(ry, { stiffness: 200, damping: 18 });

  const onMove = (e, rect) => {
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * maxRotate); // rotateY follows X movement
    rx.set(-(py - 0.5) * maxRotate); // rotateX follows Y movement
  };

  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return { rx: srx, ry: sry, onMove, onLeave };
}

// ---------------------------------------------
// Card
// ---------------------------------------------

/**
 * @param {Object} props
 * @param {typeof PATHWAYS[number]} props.item
 * @param {number} props.index
 * @param {boolean} [props.withDivider=true]
 * @param {boolean} [props.onHoverCursor=true]
 */
function ShowcaseCard({
  item,
  index,
  withDivider = true,
  onHoverCursor = true,
}) {
  const ref = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { x, y, handleMove, handleLeave } = useMagnetic(0.35);
  const { rx, ry, onMove, onLeave } = useParallaxTilt(8);

  // subtle inner glow based on hover
  const glowOpacity = useTransform(x, [-30, 0, 30], [0.1, 0.25, 0.1]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const el = node ;
    const onEnter = () => setHovered(true);
    const onExit = () => setHovered(false);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onExit);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onExit);
    };
  }, []);

  const handlePointerMove = (e) => {
    const rect = (ref.current).getBoundingClientRect();
    handleMove(e, rect);
    onMove(e, rect);
  };

  const handlePointerLeave = () => {
    handleLeave();
    onLeave();
  };

  return (
    <>
      <motion.article
        ref={ref}
        data-cursor={onHoverCursor ? item.cursor : "hover"}
        className={clsx(
          "group relative flex flex-col bg-[rgba(8,8,10,0.6)]",
          "rounded-2xl overflow-hidden border border-white/8",
          // glass layering
          "backdrop-blur-xl",
          // spacing roughly like RR tiles
          "min-h-[560px]"
        )}
        style={{
          // parallax tilt
          rotateX: rx ,
          rotateY: ry ,
          transformStyle: "preserve-3d",
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.7, delay: 0.05 * index, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Hero image */}
        <div className="relative h-[320px] w-full overflow-hidden">
          <motion.div
            className="absolute inset-0"
            style={{ x, y }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className={clsx(
                "object-cover object-center",
                "scale-105",
                "transition-transform duration-700",
                "group-hover:scale-110"
              )}
            />
          </motion.div>

          {/* top gradient and label */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute left-0 top-0 p-5">
            <span
              className={clsx(
                "text-overline font-semibold tracking-[0.18em]",
                "text-[12px] md:text-[13px]",
                "text-[var(--noble-white-85,rgba(248,248,255,.85))]"
              )}
            >
              {item.label}
            </span>
          </div>

          {/* subtle shimmering line */}
          <motion.span
            aria-hidden
            className="absolute inset-x-6 bottom-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,215,0,0.7), transparent)",
              opacity: glowOpacity ,
            }}
          />
        </div>

        {/* Content */}
        <div
          className={clsx(
            "relative grid grid-rows-[auto_auto_1fr_auto] gap-4",
            "p-6 md:p-7 lg:p-8"
          )}
          style={{ transform: "translateZ(30px)" }}
        >
          <p
            className={clsx(
              "text-caption tracking-wider uppercase",
              "text-[var(--noble-white-70,rgba(248,248,255,.7))]"
            )}
          >
            {item.eyebrow}
          </p>

          <h3
            className={clsx(
              "text-h4 md:text-h3 text-gradient-divine",
              "text-[var(--noble-white,white)]"
            )}
          >
            {item.title}
          </h3>

          <p
            className={clsx(
              "text-body text-[15px] leading-relaxed",
              "text-[var(--noble-white-85,rgba(248,248,255,.85))]"
            )}
          >
            {item.blurb}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Link href={item.slug} className="contents">
              <LuxuryButton
                variant="gold"
                className="!rounded-xl !px-6 !py-2.5 !text-[13px] !tracking-[0.12em] !font-semibold"
                onClick={() => {}}
              >
                {item.cta}
              </LuxuryButton>
            </Link>

            <Link
              href={item.slug}
              className="text-sm text-[var(--cns-gold,#FFD700)] hover:underline underline-offset-4"
            >
              Learn more →
            </Link>
          </div>
        </div>

        {/* Glow ring */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-2xl"
          style={{
            background:
              "radial-gradient(1200px 200px at var(--mx,50%) 0%, rgba(255,215,0,0.08), transparent 60%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity .35s ease",
          }}
          onPointerMove={(e) => {
            const r = (ref.current).getBoundingClientRect();
            const mx = ((e.clientX - r.left) / r.width) * 100;
            (e.currentTarget.style ).setProperty("--mx", `${mx}%`);
          }}
        />

        {/* Edges / corners */}
        <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/10" />
        <span className="pointer-events-none absolute inset-0 rounded-2xl border border-white/5" />
        <CornerFlourish />
      </motion.article>

      {/* Vertical divider like RR tiles (optional when using a simple grid-gap) */}
      {withDivider && (
        <div
          aria-hidden
          className="hidden lg:block w-px self-stretch bg-gradient-to-b from-transparent via-white/10 to-transparent"
        />
      )}
    </>
  );
}

// ---------------------------------------------
// Corner Flourish (decorative)
// ---------------------------------------------

function CornerFlourish() {
  return (
    <>
      <span className="pointer-events-none absolute left-4 top-4 h-10 w-10 rounded-full border border-white/15" />
      <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 rounded-full border border-white/10" />
      <span className="pointer-events-none absolute left-4 bottom-4 h-6 w-6 rounded-full border border-white/10" />
      <span className="pointer-events-none absolute right-4 bottom-4 h-10 w-10 rounded-full border border-white/15" />
    </>
  );
}

// ---------------------------------------------
// Section wrapper
// ---------------------------------------------

export default function PathwayShowcase({
  title = "EXPLORE FURTHER",
  subtitle = "CONTINUE YOUR JOURNEY",
  items = PATHWAYS,
  showNews = true, // toggle 4th card easily
  className,

}) {
  const visible = showNews ? items : items.filter((i) => i.id !== "news");

  return (
    <section
      className={clsx(
        "relative w-full",
        "py-16 md:py-20 lg:py-24",
        "bg-[var(--noble-black,#0a0a0a)]"
      )}
    >
      {/* Backdrop treatments */}
      <BackgroundLuxury />

      <div className={clsx("container mx-auto max-w-7xl px-6 lg:px-8", className)}>
        {/* Headline */}
        <header className="mb-12 md:mb-14 text-center">
          <h2
            className={clsx(
              "text-h3 md:text-h2 tracking-[0.12em] uppercase text-[var(--noble-white,white)]",
              "text-glow-soft"
            )}
          >
            {title}
          </h2>
          <p
            className={clsx(
              "mt-3 text-caption tracking-[0.22em] uppercase",
              "text-[var(--noble-white-70,rgba(248,248,255,.7))]"
            )}
          >
            {subtitle}
          </p>
        </header>

        {/* Grid (RR vibe: 3 across on desktop; we support 4 with wrap) */}
        <div
          className={clsx(
            "relative",
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            "gap-8 lg:gap-10"
          )}
        >
          {visible.map((item, i) => (
            <ShowcaseCard
              key={item.id}
              item={item}
              index={i}
              // put vertical divider between logical columns on large screens
              withDivider={false}
              onHoverCursor
            />
          ))}
        </div>

        {/* Bottom CTA row (optional) */}
        <motion.div
          className="mt-14 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <LuxuryButton variant="gold" className="!px-8 !py-3">
            View All Pathways
          </LuxuryButton>
          <Link
            href="/about"
            className="text-sm text-[var(--noble-white-80,rgba(248,248,255,.8))] hover:text-[var(--cns-gold,#FFD700)] transition-colors"
          >
            Learn about the system →
          </Link>
        </motion.div>
      </div>

      {/* Local CSS for keyframes / effects that Tailwind can't express cleanly */}
      <style jsx>{`
        :global(.container) {
          /* ensures consistent max-width without Tailwind's plugin */
        }
        @media (min-width: 1280px) {
          :global(.container) {
            max-width: 80rem;
          }
        }

        /* background sparkles are handled in BackgroundLuxury component */
      `}</style>
    </section>
  );
}

// ---------------------------------------------
// Rich background luxury effects (non-intrusive)
// ---------------------------------------------

function BackgroundLuxury() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gold diagonal sheen */}
      <div
        className="absolute -left-1/2 top-[-10%] h-[130%] w-[80%] -rotate-12"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.05) 35%, rgba(255,215,0,0.1) 50%, rgba(255,215,0,0.05) 65%, transparent 100%)",
          filter: "blur(20px)",
        }}
      />
      {/* soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_-10%,rgba(255,215,0,.06),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_110%,rgba(255,215,0,.06),transparent)]" />

      {/* Noise for texture */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
          maskImage:
            "radial-gradient(circle at 50% 0%, black 40%, transparent 70%), radial-gradient(circle at 50% 100%, black 35%, transparent 70%)",
        }}
      />
    </div>
  );
}

