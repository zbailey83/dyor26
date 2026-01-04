"use client";

import React, { useRef, useMemo } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Micro-interaction button (Center Feature)
// Micro-interaction button (Center Feature)
const ShopButton = ({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) => {
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: containerRef });

  // Refs to store the wandering tweens so we can pause/kill them
  const xTween = useRef<gsap.core.Tween | null>(null);
  const yTween = useRef<gsap.core.Tween | null>(null);
  const rotTween = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    if (!buttonWrapperRef.current) return;

    // Function to start the random wandering
    const startWandering = () => {
      // Kill any existing specific follow tweens on the element to avoid conflict
      gsap.killTweensOf(buttonWrapperRef.current);

      xTween.current = gsap.to(buttonWrapperRef.current, {
        x: "random(-100, 100)",
        duration: "random(3, 5)",
        ease: "sine.inOut",
        repeat: -1,
        repeatRefresh: true,
        yoyo: true,
      });

      yTween.current = gsap.to(buttonWrapperRef.current, {
        y: "random(-100, 100)",
        duration: "random(4, 6)",
        ease: "sine.inOut",
        repeat: -1,
        repeatRefresh: true,
        yoyo: true,
      });

      rotTween.current = gsap.to(buttonWrapperRef.current, {
        rotation: "random(-10, 10)",
        duration: "random(5, 10)",
        ease: "sine.inOut",
        repeat: -1,
        repeatRefresh: true,
        yoyo: true
      });
    };

    // Initial Start
    startWandering();

    // Mouse Move Logic for "Magnetic" Effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonWrapperRef.current) return;

      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Calculate mouse offset from center
      const offsetX = e.clientX - centerX;
      const offsetY = e.clientY - centerY;

      // Define "Floating Zone" proximity radius (approx 180px)
      const isWithinZone = Math.abs(offsetX) < 180 && Math.abs(offsetY) < 180;

      if (isWithinZone) {
        // Enforce Magnetic Pull
        // 1. Pause Wandering
        xTween.current?.pause();
        yTween.current?.pause();
        rotTween.current?.pause();

        // 2. Slow drift toward cursor (Magnetic Follow)
        // We use overwrite: "auto" to safely supersede the paused tweens
        gsap.to(buttonWrapperRef.current, {
          x: offsetX * 0.5, // 0.5 for a "heavy", damped magnetic feeling
          y: offsetY * 0.5,
          rotation: offsetX * 0.05,
          duration: 1.2,
          ease: "power2.out",
          overwrite: "auto"
        });

      } else {
        // Resume Wandering if we effectively "left" the zone and aren't wandering
        if (xTween.current?.paused()) {
          startWandering();
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);

  }, { scope: buttonWrapperRef });

  const onHover = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      boxShadow: "0 0 30px rgba(255,255,255,0.2)",
      duration: 0.4,
      ease: "power3.out",
    });
  });

  const onLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      boxShadow: "0 0 0px rgba(255,255,255,0)",
      duration: 0.4,
      ease: "power3.out",
    });
  });

  return (
    <div
      ref={buttonWrapperRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 will-change-transform" // Added will-change-transform
    >
      <button
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className="group relative flex h-32 w-32 items-center justify-center rounded-full border border-zinc-700 bg-black/80 backdrop-blur-xl transition-colors hover:border-zinc-400"
      >
        <span className="z-10 text-center font-mono text-xs font-bold uppercase tracking-widest text-zinc-100">
          Enter<br />Shop
        </span>
        {/* Animated ring pulse */}
        <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-zinc-800 opacity-20 duration-1000" />
      </button>
    </div>
  );
};

export default function QuantumTickerHero() {
  const container = useRef<HTMLDivElement>(null);
  const textPath1Ref = useRef<SVGTextPathElement>(null);
  const textPath2Ref = useRef<SVGTextPathElement>(null);

  // Ribbons Data - Increased repetition for smoother coverage
  const ribbon1Text = "DO YOUR OWN RESEARCH ".repeat(12);
  const ribbon2Text = "DYOR APPAREL ".repeat(12);

  // Generate randomized spans for that "glitch/decrypted" look
  const generateSpans = (text: string) => {
    return text.split("").map((char, i) => {
      // Subtle opacity flickering for "code" feel
      const opacity = Math.random() > 0.85 ? 0.6 : 1;
      return (
        <tspan key={i} fillOpacity={opacity}>
          {char === " " ? "\u00A0" : char}
        </tspan>
      );
    });
  };

  const spans1 = useMemo(() => generateSpans(ribbon1Text), [ribbon1Text]);
  const spans2 = useMemo(() => generateSpans(ribbon2Text), [ribbon2Text]);

  useGSAP(
    () => {
      // Orbital Animation 1 (Clockwise)
      if (textPath1Ref.current) {
        gsap.to(textPath1Ref.current, {
          attr: { startOffset: "-100%" },
          duration: 40, // Slower for smoothness
          repeat: -1,
          ease: "none",
        });
      }

      // Orbital Animation 2 (Counter-Clockwise)
      if (textPath2Ref.current) {
        gsap.to(textPath2Ref.current, {
          attr: { startOffset: "100%" },
          duration: 45, // Slower for smoothness
          repeat: -1,
          ease: "none",
        });
      }

      // Float animation for the whole container to add zero-gravity feel
      gsap.to(".orbit-container", {
        y: -15, // Reduced movement range
        rotation: 1, // Reduced rotation range
        duration: 8, // Slower float
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

    },
    { scope: container }
  );

  return (
    <div
      ref={container}
      className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#050505] font-mono selection:bg-white/20"
    >
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#050505_70%)] opacity-40 pointer-events-none" />

      {/* Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />

      {/* Central Feature */}
      <ShopButton containerRef={container} />

      {/* The Orbiting Ribbons */}
      <div className="orbit-container absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform">
        <svg
          className="h-[120vh] w-[120vh] max-w-none"
          viewBox="0 0 1000 1000"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="ribbonGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#71717a" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#71717a" />
            </linearGradient>
            <linearGradient id="ribbonGradient2" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#52525b" />
              <stop offset="50%" stopColor="#a1a1aa" />
              <stop offset="100%" stopColor="#52525b" />
            </linearGradient>
          </defs>

          {/* Orbit Path 1: Tilted Ellipse */}
          <path
            id="orbit-1"
            d="M 150,500 
                   C 150,200 850,200 850,500 
                   C 850,800 150,800 150,500"
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            vectorEffect="non-scaling-stroke"
            transform="rotate(-15, 500, 500)"
          />

          {/* Orbit Path 2: Opposite Tilted Ellipse */}
          <path
            id="orbit-2"
            d="M 150,500 
                   C 150,800 850,800 850,500 
                   C 850,200 150,200 150,500"
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            vectorEffect="non-scaling-stroke"
            transform="rotate(15, 500, 500)"
          />

          {/* Ribbon 1 Text */}
          <text
            className="text-xl font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
            fill="url(#ribbonGradient1)"
            dy="-10"
            style={{ textRendering: "optimizeLegibility" }}
          >
            <textPath
              ref={textPath1Ref}
              href="#orbit-1"
              startOffset="0%"
              spacing="auto"
            >
              {spans1}
            </textPath>
          </text>

          {/* Ribbon 2 Text */}
          <text
            className="text-xl font-bold uppercase tracking-[0.2em] drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            fill="url(#ribbonGradient2)"
            dy="20"
            style={{ textRendering: "optimizeLegibility" }}
          >
            <textPath
              ref={textPath2Ref}
              href="#orbit-2"
              startOffset="0%"
              spacing="auto"
            >
              {spans2}
            </textPath>
          </text>
        </svg>
      </div>
    </div>
  );
}
