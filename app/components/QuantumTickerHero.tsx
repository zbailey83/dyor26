"use client";

import React, { useRef, useMemo, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Micro-interaction button (Center Feature)
const ShopButton = ({ containerRef, theme }: { containerRef: React.RefObject<HTMLDivElement | null>; theme: string }) => {
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: containerRef });

  // Refs to store the wandering tweens so we can pause/kill them
  const xTween = useRef<gsap.core.Tween | null>(null);
  const yTween = useRef<gsap.core.Tween | null>(null);
  const rotTween = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    if (!buttonWrapperRef.current) return;

    // Floating letters animation
    const letters = buttonWrapperRef.current.querySelectorAll('.floating-letter');
    letters.forEach((letter) => {
      gsap.to(letter, {
        x: "random(-4, 4)",
        y: "random(-4, 4)",
        rotation: "random(-5, 5)",
        duration: "random(2, 4)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    // Function to start the random wandering for the button itself
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
      boxShadow: `0 0 40px ${theme === 'blue' ? 'rgba(59, 130, 246, 0.6)' :
        theme === 'green' ? 'rgba(34, 197, 94, 0.6)' :
          theme === 'red' ? 'rgba(239, 68, 68, 0.6)' :
            'rgba(255,255,255,0.4)'
        }`,
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

  // Dynamic classes for the button based on theme
  const getButtonStyles = () => {
    // Glassmorphism: semi-transparent background + blur
    const base = "group relative flex h-40 w-40 items-center justify-center rounded-full border border-dashed backdrop-blur-2xl transition-all duration-500 hover:border-solid";

    switch (theme) {
      case 'blue': return `${base} bg-blue-500/20 border-blue-400/30 hover:bg-blue-500/30 hover:border-blue-300 ring-1 ring-blue-400/20`;
      case 'green': return `${base} bg-green-500/20 border-green-400/30 hover:bg-green-500/30 hover:border-green-300 ring-1 ring-green-400/20`;
      case 'red': return `${base} bg-red-500/20 border-red-400/30 hover:bg-red-500/30 hover:border-red-300 ring-1 ring-red-400/20`;
      default: return `${base} bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/50 ring-1 ring-white/10`;
    }
  };

  return (
    <div
      ref={buttonWrapperRef}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 will-change-transform"
    >
      <button
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className={getButtonStyles()}
      >
        <div className="z-10 flex flex-col items-center justify-center font-sans text-5xl font-black leading-[0.85] tracking-tighter text-zinc-100 drop-shadow-md">
          {/* DY Row */}
          <div className="flex">
            <span className="floating-letter inline-block origin-center">D</span>
            <span className="floating-letter inline-block origin-center">Y</span>
          </div>
          {/* OR Row */}
          <div className="flex">
            <span className="floating-letter inline-block origin-center">O</span>
            <span className="floating-letter inline-block origin-center">R</span>
          </div>
        </div>

        {/* Animated ring pulse - tinted by theme */}
        <div className={`absolute inset-0 -z-10 animate-ping rounded-full opacity-30 duration-1000 ${theme === 'blue' ? 'bg-blue-500' :
          theme === 'green' ? 'bg-green-500' :
            theme === 'red' ? 'bg-red-500' :
              'bg-zinc-500'
          }`} />
      </button>
    </div>
  );
};

export default function QuantumTickerHero() {
  const container = useRef<HTMLDivElement>(null);
  const textPath1Ref = useRef<SVGTextPathElement>(null);
  const textPath2Ref = useRef<SVGTextPathElement>(null);

  // Theme state: 'default' | 'blue' | 'green' | 'red'
  const [theme, setTheme] = useState('default');

  // Ribbons Data - Increased repetition for smoother coverage
  const ribbon1Text = "DO YOUR OWN RESEARCH ".repeat(12);
  const ribbon2Text = "DYOR APPAREL ".repeat(12);

  // Generate randomized spans for that "glitch/decrypted" feel
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

  // Determine Background Color Logic
  // Using deep/rich colors for the "Theme"
  const getThemeBg = () => {
    switch (theme) {
      case 'blue': return 'bg-blue-950';
      case 'green': return 'bg-green-950';
      case 'red': return 'bg-red-950';
      default: return 'bg-[#050505]';
    }
  };

  const getThemeGradient = () => {
    switch (theme) {
      case 'blue': return 'linearGradient(to bottom, #1e3a8a, #000000)'; // Example
      // Actually let's just stick to the requested "dark-grey/black" -> "button's color" transition logic
      // The easiest way is to change the main div's background class.
      default: return '';
    }
  };

  return (
    <div
      ref={container}
      className={`relative flex h-screen w-full items-center justify-center overflow-hidden font-mono selection:bg-white/20 transition-colors duration-1000 ${getThemeBg()}`}
    >
      {/* Ambient Background Glow - Adjust based on theme? */}
      <div className={`absolute inset-0 opacity-40 pointer-events-none transition-colors duration-1000 ${theme === 'default' ? 'bg-[radial-gradient(circle_at_center,#1a1a1a_0%,#050505_70%)]' :
        theme === 'blue' ? 'bg-[radial-gradient(circle_at_center,#1d4ed8_0%,#172554_70%)]' :
          theme === 'green' ? 'bg-[radial-gradient(circle_at_center,#15803d_0%,#14532d_70%)]' :
            'bg-[radial-gradient(circle_at_center,#b91c1c_0%,#7f1d1d_70%)]' /* red */
        }`} />

      {/* Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] pointer-events-none" />

      {/* Central Feature */}
      <ShopButton containerRef={container} theme={theme} />

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

      {/* Theme/Color Switcher */}
      <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-4 z-40">
        <button
          onClick={() => setTheme('default')}
          className={`h-6 w-6 rounded-full border border-white/20 bg-zinc-950 transition-all hover:scale-125 hover:border-white ${theme === 'default' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
          aria-label="Default Black Theme"
        />
        <button
          onClick={() => setTheme('blue')}
          className={`h-6 w-6 rounded-full border border-white/20 bg-blue-600 transition-all hover:scale-125 hover:border-white ${theme === 'blue' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
          aria-label="Blue Theme"
        />
        <button
          onClick={() => setTheme('green')}
          className={`h-6 w-6 rounded-full border border-white/20 bg-green-600 transition-all hover:scale-125 hover:border-white ${theme === 'green' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
          aria-label="Green Theme"
        />
        <button
          onClick={() => setTheme('red')}
          className={`h-6 w-6 rounded-full border border-white/20 bg-red-600 transition-all hover:scale-125 hover:border-white ${theme === 'red' ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}
          aria-label="Red Theme"
        />
      </div>
    </div>
  );
}
