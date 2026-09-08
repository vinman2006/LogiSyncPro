'use client';

import React, { useId, useEffect, useRef, useCallback } from 'react';

export interface SparklesCoreProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleColors?: string[];
  className?: string;
  particleDensity?: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  opacitySpeed: number;
  color: string;
}

// Default vibrant multi-color palette for sparkling effects
export const DEFAULT_SPARKLE_COLORS = [
  '#4F46E5', // Indigo
  '#0EA5E9', // Sky Blue
  '#F97316', // Bright Orange
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
];

export const SparklesCore: React.FC<SparklesCoreProps> = ({
  id,
  background = 'transparent',
  minSize = 0.6,
  maxSize = 1.6,
  speed = 0.8,
  particleColor,
  particleColors,
  className,
  particleDensity = 1200,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const dimensionsRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });
  const generatedId = useId();
  const canvasId = id || generatedId;

  // Resolve palette
  const resolvedColors = React.useMemo(() => {
    if (particleColors && particleColors.length > 0) return particleColors;
    if (particleColor) return [particleColor];
    return DEFAULT_SPARKLE_COLORS;
  }, [particleColor, particleColors]);

  const initParticles = useCallback(
    (width: number, height: number) => {
      const density = particleDensity || 1200;
      const count = Math.min(900, Math.max(50, Math.floor((width * height * density) / 220000)));
      particlesRef.current = Array.from({ length: count }, () => {
        const chosenColor = resolvedColors[Math.floor(Math.random() * resolvedColors.length)];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * (maxSize - minSize) + minSize,
          speedX: (Math.random() - 0.5) * speed * 0.3,
          speedY: (Math.random() - 0.5) * speed * 0.3,
          opacity: Math.random() * 0.75 + 0.25,
          opacitySpeed: (Math.random() * 0.015 + 0.006) * (Math.random() > 0.5 ? 1 : -1),
          color: chosenColor,
        };
      });
    },
    [minSize, maxSize, speed, particleDensity, resolvedColors]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, dpr } = dimensionsRef.current;
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width * dpr, height * dpr);

    ctx.save();
    ctx.scale(dpr, dpr);

    const particles = particlesRef.current;
    const len = particles.length;

    for (let i = 0; i < len; i++) {
      const p = particles[i];

      // Update position
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap edges
      if (p.x < 0) p.x = width;
      else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      else if (p.y > height) p.y = 0;

      // Twinkle opacity
      p.opacity += p.opacitySpeed;
      if (p.opacity >= 1) {
        p.opacity = 1;
        p.opacitySpeed = -Math.abs(p.opacitySpeed);
      } else if (p.opacity <= 0.15) {
        p.opacity = 0.15;
        p.opacitySpeed = Math.abs(p.opacitySpeed);
      }

      // Draw particle with its unique color
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (width === 0 || height === 0) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      dimensionsRef.current = { width, height, dpr };

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      initParticles(width, height);
    };

    resize();
    animationRef.current = requestAnimationFrame(animate);

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      observer.disconnect();
    };
  }, [animate, initParticles]);

  return (
    <div ref={containerRef} className={className} style={{ background }}>
      <canvas ref={canvasRef} id={canvasId} className="block w-full h-full" />
    </div>
  );
};

export interface SparklesPreviewProps {
  title?: string;
  className?: string;
  theme?: 'light' | 'dark';
  particleColors?: string[];
}

export function SparklesPreview({
  title = 'LogiSyncPRO',
  className = '',
  theme = 'light',
  particleColors = DEFAULT_SPARKLE_COLORS,
}: SparklesPreviewProps) {
  const isLight = theme === 'light';

  return (
    <div
      className={`h-[40rem] w-full flex flex-col items-center justify-center overflow-hidden rounded-md ${
        isLight ? 'bg-white text-neutral-950' : 'bg-black text-white'
      } ${className}`}
    >
      <h1
        className={`md:text-7xl text-3xl lg:text-9xl font-bold text-center relative z-20 tracking-tight select-none ${
          isLight ? 'text-neutral-950' : 'text-white'
        }`}
      >
        {title}
      </h1>
      <div className="w-[40rem] max-w-full h-40 relative">
        {/* Gradients */}
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[5px] w-1/4 blur-sm" />
        <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* Multi-colored Core component */}
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.6}
          particleDensity={1200}
          className="w-full h-full"
          particleColors={particleColors}
        />

        {/* Radial Gradient matching background */}
        <div
          className={`absolute inset-0 w-full h-full pointer-events-none ${isLight ? 'bg-white' : 'bg-black'}`}
          style={{
            maskImage: 'radial-gradient(350px 200px at top, transparent 20%, white)',
            WebkitMaskImage: 'radial-gradient(350px 200px at top, transparent 20%, white)',
          }}
        />
      </div>
    </div>
  );
}
