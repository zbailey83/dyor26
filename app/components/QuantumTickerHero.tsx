"use client";

import React, { useRef, useMemo, useState, Suspense } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Canvas } from "@react-three/fiber";
import { useLoader, useFrame } from "@react-three/fiber";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import * as THREE from "three";

// 3D Glasses Component
const FloatingGlasses = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Load just the OBJ file without materials
  const obj = useLoader(OBJLoader, '/GlassesOBJ.obj');

  // Animation loop
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
    }
  });

  // Clone and apply material
  const glassesClone = useMemo(() => {
    if (obj) {
      const clone = obj.clone();
      clone.scale.setScalar(0.3); // Smaller scale for better fit

      // Apply a simple material to all meshes
      clone.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = new THREE.MeshPhongMaterial({
            color: 0x444444,
            shininess: 100,
            transparent: true,
            opacity: 0.8
          });
        }
      });

      return clone;
    }
    return null;
  }, [obj]);

  if (!glassesClone) return null;

  return (
    <group ref={groupRef}>
      <primitive object={glassesClone} />
    </group>
  );
};

// Fallback simple glasses shape if OBJ fails to load
const SimpleGlasses = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.5;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left lens */}
      <mesh position={[-0.3, 0, 0]}>
        <ringGeometry args={[0.15, 0.25, 16]} />
        <meshPhongMaterial color={0x333333} transparent opacity={0.7} />
      </mesh>
      {/* Right lens */}
      <mesh position={[0.3, 0, 0]}>
        <ringGeometry args={[0.15, 0.25, 16]} />
        <meshPhongMaterial color={0x333333} transparent opacity={0.7} />
      </mesh>
      {/* Bridge */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2]} />
        <meshPhongMaterial color={0x222222} />
      </mesh>
    </group>
  );
};

// Multiple Floating Glasses positioned around the ribbons
const GlassesField = () => {
  const positions: [number, number, number][] = [
    [-4, 2, -2],
    [4, -1, -1],
    [-3, -2, 1],
    [5, 1, -3],
    [-2, 3, 2],
    [3, -3, -2]
  ];

  return (
    <>
      {positions.map((position, index) => (
        <group key={index} position={position}>
          <Suspense fallback={<SimpleGlasses />}>
            <FloatingGlasses />
          </Suspense>
        </group>
      ))}
    </>
  );
};

// 3D Scene Container
const ThreeDScene = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />
        <Suspense fallback={null}>
          <GlassesField />
        </Suspense>
      </Canvas>
    </div>
  );
};

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

      {/* 3D Floating Glasses */}
      <ThreeDScene />

      {/* The Orbiting Ribbons */}
      <div className="orbit-container absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform">
        <svg
          className="h-[80vh] w-[80vh] max-w-none"
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

          {/* Orbit Path 1: Tilted Ellipse - Reduced by 66% */}
          <path
            id="orbit-1"
            d="M 300,500 
                   C 300,350 700,350 700,500 
                   C 700,650 300,650 300,500"
            fill="none"
            stroke="rgba(255,255,255,0.02)"
            vectorEffect="non-scaling-stroke"
            transform="rotate(-15, 500, 500)"
          />

          {/* Orbit Path 2: Opposite Tilted Ellipse - Reduced by 66% */}
          <path
            id="orbit-2"
            d="M 300,500 
                   C 300,650 700,650 700,500 
                   C 700,350 300,350 300,500"
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
