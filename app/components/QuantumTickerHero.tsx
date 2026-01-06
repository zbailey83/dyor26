"use client";

import React, { useRef, useMemo, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Micro-interaction button (Center Feature)
// Micro-interaction button (Center Feature)
const ShopButton = ({ containerRef, theme }: { containerRef: React.RefObject<HTMLDivElement | null>; theme: string }) => {
  const buttonWrapperRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: containerRef });

  // Refs to store the wandering tweens so we can pause/kill them
  const xTween = useRef<gsap.core.Tween | null>(null);
  const yTween = useRef<gsap.core.Tween | null>(null);
  const rotTween = useRef<gsap.core.Tween | null>(null);

  // Helper to animate letters with different intensities
  const animateLetters = (state: 'calm' | 'hover') => {
    if (!buttonWrapperRef.current) return;
    const letters = buttonWrapperRef.current.querySelectorAll('.floating-letter');

    // Kill existing animations on letters to prevent conflicts
    gsap.killTweensOf(letters);

    letters.forEach((letter, i) => {
      let baseX = 0;
      let baseY = 0;

      if (state === 'hover') {
        // Push out logic: D(0), Y(1), O(2), R(3)
        // D: Top-Left, Y: Top-Right, O: Bottom-Left, R: Bottom-Right
        const isLeft = i === 0 || i === 2;
        const isTop = i === 0 || i === 1;

        // Push out by ~15px
        baseX = isLeft ? -15 : 15;
        baseY = isTop ? -8 : 8; // Less vertical push since they are already stacked
      }

      gsap.to(letter, {
        x: `random(${baseX - 3}, ${baseX + 3})`, // Float around the new base position
        y: `random(${baseY - 3}, ${baseY + 3})`,
        rotation: "random(-5, 5)",
        duration: "random(2, 4)",
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        overwrite: "auto"
      });
    });
  };

  useGSAP(() => {
    if (!buttonWrapperRef.current) return;

    // Initial Start - Calm
    animateLetters('calm');

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
    // 1. Button Scale/Glow
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

    // 2. Expand Letters
    animateLetters('hover');
  });

  const onLeave = contextSafe((e: React.MouseEvent<HTMLButtonElement>) => {
    // 1. Reset Button Scale/Glow
    gsap.to(e.currentTarget, {
      scale: 1,
      boxShadow: "0 0 0px rgba(255,255,255,0)",
      duration: 0.4,
      ease: "power3.out",
    });

    // 2. Calm Letters
    animateLetters('calm');
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

      // Animate floating SVGs
      gsap.utils.toArray(".floating-svg").forEach((svg: any, i) => {
        // Random initial position along the orbital path
        const initialOffset = Math.random() * 100;

        // Different speeds for variety
        const speed = 35 + (i * 5);

        // Animate along the path
        gsap.to(svg, {
          motionPath: {
            path: i % 3 === 0 ? "#orbit-1" : "#orbit-2", // Alternate between paths
            autoRotate: false,
            start: initialOffset / 100,
            end: (initialOffset + 100) / 100,
          },
          duration: speed,
          repeat: -1,
          ease: "none",
        });

        // Add subtle floating motion perpendicular to path
        gsap.to(svg, {
          y: "random(-8, 8)",
          x: "random(-8, 8)",
          rotation: "random(-15, 15)",
          scale: "random(0.8, 1.2)",
          duration: "random(3, 6)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        // Opacity pulse for ethereal effect
        gsap.to(svg, {
          opacity: "random(0.4, 0.8)",
          duration: "random(2, 4)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
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

          {/* Floating SVGs */}
          <g className="floating-svg" transform="translate(0, 0)">
            <g transform="scale(0.08) translate(-400, -400)">
              <path d="M642 614l-78.9-78.9V285.4H406.3V600l124.8 124.8c30.6 30.6 80.3 30.6 110.9 0 30.6-30.5 30.6-80.2 0-110.8z" fill="#20B573" />
              <path d="M439.7 534.5c-9.6 0-18.5 3.5-25.9 9.5V595.2l42.9 42.9c16.7-8 28.6-27.3 28.6-49.9 0.1-29.6-20.4-53.7-45.6-53.7zM543.2 717.4L646.8 618s49.4 57.4 6.5 106c-42.8 48.6-91.7 21.7-110.1-6.6z" fill="#2ECC71" />
              <path d="M662.5 605.7l-76.7-81.9V281.4c0-9.6-7.8-17.4-17.4-17.4H411.6c-9.6 0-17.4 7.8-17.4 17.4V596c0 4.6 1.8 9.1 5.1 12.3l127.7 133c18.1 18.1 42.2 28.1 67.8 28.1s49.7-10 67.8-28.1c37.3-37.4 37.3-98.2-0.1-135.6zM533.6 298.8H551V386h-17.4v-87.2z m-34.9 0h17.4V386h-17.4v-87.2z m-34.8 0h17.4V386h-17.4v-87.2z m-34.9 0h17.4V386H429v-87.2z m0 241.1h0.2c27.8 0 50.5 22.6 50.5 50.5 0 13.2-5.2 25.7-14.2 35L429 588.8v-48.9z m48.8 97.7c12.2-12.6 19.3-29.4 19.3-47.3 0-37.4-30.5-67.9-67.9-67.9h-0.2v-119h122V531c0 4.6 1.8 9.1 5.1 12.3l72.8 78.1L541 706l-63.2-68.4z m160.1 79c-11.5 11.5-26.8 17.9-43.1 17.9-15.5 0-30-5.8-41.3-16.2l87.7-84.4c20.3 23.9 19.3 60.1-3.3 82.7z" fill="rgba(255,255,255,0.6)" />
            </g>
          </g>

          <g className="floating-svg" transform="translate(0, 0)">
            <g transform="scale(0.08) translate(-400, -400)">
              <path d="M628.8 324.4h-65.4c-6.3 22.1-26.4 38.3-50.3 38.3-23.8 0-43.9-16.2-50.3-38.3h-65.4l-127.8 93.7 66.4 95.7 61.4-43.4v232.8h231.2V470.3l61.4 43.4 66.4-95.7-127.6-93.6z" fill="#CDE9E3" />
              <path d="M628.8 713.9H397.5c-6 0-10.8-4.8-10.8-10.8V491.2l-44.4 31.4c-2.4 1.7-5.3 2.3-8.1 1.8-2.8-0.5-5.4-2.1-7-4.5l-66.4-95.7c-3.3-4.8-2.2-11.4 2.5-14.9l127.8-93.7c1.9-1.4 4.1-2.1 6.4-2.1h65.4c4.8 0 9.1 3.2 10.4 7.8 5.1 17.9 21.5 30.4 39.9 30.4 18.3 0 34.7-12.5 39.9-30.4 1.3-4.6 5.6-7.8 10.4-7.8h65.4c2.3 0 4.5 0.7 6.4 2.1L763 409.3c4.7 3.5 5.8 10.1 2.5 14.9l-66.4 95.7c-1.6 2.4-4.2 4-7 4.5-2.9 0.5-5.8-0.2-8.1-1.8l-44.4-31.4v211.9c0 6-4.8 10.8-10.8 10.8z m-220.5-21.6H618v-222c0-4 2.3-7.8 5.8-9.6 3.6-1.9 7.9-1.6 11.2 0.8l52.5 37.1 54.2-78-116.5-85.4H571c-10 22.9-32.7 38.3-57.9 38.3-25.2 0-47.9-15.4-57.9-38.3H401l-116.5 85.4 54.2 78 52.5-37.1c3.3-2.3 7.6-2.6 11.2-0.8 3.6 1.9 5.8 5.6 5.8 9.6v222h0.1z" fill="rgba(255,255,255,0.6)" />
            </g>
          </g>

          <g className="floating-svg" transform="translate(0, 0)">
            <g transform="scale(0.08) translate(-400, -400)">
              <path d="M454.4 273.4h126.5v480.7H454.4z" fill="#F7BE29" />
              <path d="M644.2 513.8c0 69.9-56.6 126.5-126.5 126.5s-126.5-56.6-126.5-126.5 56.6-126.5 126.5-126.5c69.9-0.1 126.5 56.6 126.5 126.5z" fill="#FAE274" />
              <path d="M517.7 511.1v-67c0-3.5-2.8-6.3-6.3-6.3s-6.3 2.8-6.3 6.3v69.6c0 0.8 0.2 1.6 0.5 2.4 0.3 0.8 0.8 1.5 1.4 2.1l54.8 54.8c1.2 1.2 2.9 1.9 4.5 1.9s3.2-0.6 4.5-1.9c2.5-2.5 2.5-6.5 0-8.9l-53.1-53z" fill="rgba(255,255,255,0.8)" />
              <path d="M645.1 475.2c-9.5-32.8-30.7-60.7-58.8-78.7V273.4c0-7-5.7-12.7-12.7-12.7H447.1c-7 0-12.7 5.7-12.7 12.7v124.5c-37.5 25-62.2 67.6-62.2 115.9 0 48.3 24.7 90.9 62.2 115.9v124.5c0 7 5.7 12.7 12.7 12.7h126.5c7 0 12.7-5.7 12.7-12.7V631c28.1-18 49.4-45.9 58.8-78.7 10.3-2.3 18.1-11.5 18.1-22.5v-32.1c0-11-7.8-20.2-18.1-22.5zM459.7 286h101.2v12.7H459.7V286z m0 25.3h101.2V324H459.7v-12.7z m0 25.3h101.2v12.7H459.7v-12.7z m0 25.3h101.2v21.8c-15.4-5.9-32.1-9.1-49.5-9.1-18.3 0-35.7 3.6-51.7 10v-22.7z m101.2 379.6H459.7v-12.6h101.2v12.6z m0-25.3H459.7v-12.7h101.2v12.7z m0-25.3H459.7v-12.7h101.2v12.7z m0-25.3H459.7v-22.7c16 6.4 33.4 10 51.7 10 17.5 0 34.1-3.3 49.5-9.1v21.8z m45.4-145.5h18.6c-3.2 57.7-49.5 104-107.3 107.2v-18.6c0-3.5-2.8-6.3-6.3-6.3s-6.3 2.8-6.3 6.3v18.6c-57.7-3.2-104-49.5-107.2-107.2h18.6c3.5 0 6.3-2.8 6.3-6.3s-2.8-6.3-6.3-6.3h-18.6c3.2-57.7 49.5-104 107.2-107.2v18.6c0 3.5 2.8 6.3 6.3 6.3s6.3-2.8 6.3-6.3v-18.6c57.7 3.2 104.1 49.5 107.3 107.2h-18.6c-3.5 0-6.3 2.8-6.3 6.3 0 3.4 2.8 6.3 6.3 6.3z" fill="rgba(255,255,255,0.6)" />
            </g>
          </g>

          {/* Additional floating instances for more density */}
          <g className="floating-svg" transform="translate(0, 0)">
            <g transform="scale(0.06) translate(-400, -400)">
              <path d="M642 614l-78.9-78.9V285.4H406.3V600l124.8 124.8c30.6 30.6 80.3 30.6 110.9 0 30.6-30.5 30.6-80.2 0-110.8z" fill="rgba(32, 181, 115, 0.7)" />
              <path d="M439.7 534.5c-9.6 0-18.5 3.5-25.9 9.5V595.2l42.9 42.9c16.7-8 28.6-27.3 28.6-49.9 0.1-29.6-20.4-53.7-45.6-53.7zM543.2 717.4L646.8 618s49.4 57.4 6.5 106c-42.8 48.6-91.7 21.7-110.1-6.6z" fill="rgba(46, 204, 113, 0.7)" />
            </g>
          </g>

          <g className="floating-svg" transform="translate(0, 0)">
            <g transform="scale(0.06) translate(-400, -400)">
              <path d="M628.8 324.4h-65.4c-6.3 22.1-26.4 38.3-50.3 38.3-23.8 0-43.9-16.2-50.3-38.3h-65.4l-127.8 93.7 66.4 95.7 61.4-43.4v232.8h231.2V470.3l61.4 43.4 66.4-95.7-127.6-93.6z" fill="rgba(205, 233, 227, 0.7)" />
            </g>
          </g>

          <g className="floating-svg" transform="translate(0, 0)">
            <g transform="scale(0.06) translate(-400, -400)">
              <path d="M454.4 273.4h126.5v480.7H454.4z" fill="rgba(247, 190, 41, 0.7)" />
              <path d="M644.2 513.8c0 69.9-56.6 126.5-126.5 126.5s-126.5-56.6-126.5-126.5 56.6-126.5 126.5-126.5c69.9-0.1 126.5 56.6 126.5 126.5z" fill="rgba(250, 226, 116, 0.7)" />
            </g>
          </g>
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
