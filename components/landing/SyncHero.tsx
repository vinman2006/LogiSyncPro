'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  chaosColor: string;
  syncColor: string;
  currentColor: string;
  state: 'CHAOS' | 'TRANSITION' | 'SYNC';
  syncProgress: number; // 0 to 1
  assignedLaneY: number;
  assignedLaneSpeed: number;
  noiseSeed: number;
  noisePhase: number;
}

// Chaos palette (warm, mixed, energetic)
const CHAOS_PALETTE = [
  '#F87171', // coral
  '#FB923C', // orange
  '#FBBF24', // amber
  '#A3E635', // lime
  '#C084FC', // violet
  '#F472B6', // pink
  '#E879F9', // fuchsia
  '#FCD34D', // yellow
];

// Sync palette (cool, calm, brand)
const SYNC_PALETTE = [
  '#38BDF8', // sky
  '#00C9B1', // teal
  '#818CF8', // indigo
  '#67E8F9', // cyan
  '#6EE7B7', // emerald
  '#93C5FD', // light blue
  '#34D399', // green
  '#60A5FA', // blue
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return [r, g, b];
}

function interpolateColor(c1: string, c2: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  const clamped = Math.max(0, Math.min(1, t));
  const r = Math.round(r1 + (r2 - r1) * clamped);
  const g = Math.round(g1 + (g2 - g1) * clamped);
  const b = Math.round(b1 + (b2 - b1) * clamped);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function SyncHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    // Threshold & Lanes
    let headlineCenterY = 0;
    let headlineTop = 0;
    let lanes: number[] = [];
    let laneSpeeds: number[] = [];
    const NUM_LANES = 6;

    const updateDimensions = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Measure headline threshold position
      if (headlineRef.current) {
        const hRect = headlineRef.current.getBoundingClientRect();
        headlineTop = hRect.top - rect.top;
        headlineCenterY = headlineTop + hRect.height * 0.45;
      } else {
        headlineTop = height * 0.40;
        headlineCenterY = height * 0.48;
      }

      // Sync lanes evenly distributed from top down to just above the headline
      lanes = [];
      laneSpeeds = [];
      const topBoundary = Math.max(36, height * 0.06);
      const bottomBoundary = Math.max(topBoundary + 80, headlineTop - 28);
      const step = (bottomBoundary - topBoundary) / (NUM_LANES - 1);

      for (let i = 0; i < NUM_LANES; i++) {
        lanes.push(Math.round(topBoundary + i * step));
        // Subtly varied speeds per lane (0.6px to 1.2px / frame)
        laneSpeeds.push(0.65 + ((i * 137) % 100) / 160);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    // Particle Count: 280 on desktop, 160 on mobile
    const particleCount = window.innerWidth < 640 ? 160 : 280;
    const particles: Particle[] = [];

    const spawnChaosParticle = (id: number, forceBottom = false): Particle => {
      const chaosColor = CHAOS_PALETTE[Math.floor(Math.random() * CHAOS_PALETTE.length)];
      const syncColor = SYNC_PALETTE[Math.floor(Math.random() * SYNC_PALETTE.length)];
      const radius = 2.4 + Math.random() * 3.2; // 2.4px to 5.6px
      const opacity = 0.48 + Math.random() * 0.42; // 0.48 to 0.90

      // Spawn across full canvas width
      const x = Math.random() * width;

      // Spawn in bottom half
      const minSpawnY = headlineCenterY + 40;
      const maxSpawnY = Math.max(minSpawnY + 50, height - 20);
      const y = forceBottom
        ? maxSpawnY - Math.random() * 60
        : minSpawnY + Math.random() * (maxSpawnY - minSpawnY);

      // Random velocity with upward bias
      const vx = (Math.random() - 0.5) * 1.5;
      const vy = -(0.45 + Math.random() * 0.95);

      return {
        id,
        x,
        y,
        vx,
        vy,
        radius,
        opacity,
        chaosColor,
        syncColor,
        currentColor: chaosColor,
        state: 'CHAOS',
        syncProgress: 0,
        assignedLaneY: lanes[0] || 50,
        assignedLaneSpeed: laneSpeeds[0] || 0.8,
        noiseSeed: Math.random() * 1000,
        noisePhase: Math.random() * Math.PI * 2,
      };
    };

    // Pre-seed some particles across the lifecycle for an immediate lively scene
    for (let i = 0; i < particleCount; i++) {
      if (i < particleCount * 0.35) {
        // Pre-populate some sync particles in lanes above the headline
        const laneIdx = i % NUM_LANES;
        const p = spawnChaosParticle(i);
        p.state = 'SYNC';
        p.syncProgress = 1;
        p.x = Math.random() * width;
        p.assignedLaneY = lanes[laneIdx] || 50;
        p.y = p.assignedLaneY;
        p.assignedLaneSpeed = laneSpeeds[laneIdx] || 0.85;
        p.vx = p.assignedLaneSpeed;
        p.vy = 0;
        p.currentColor = p.syncColor;
        particles.push(p);
      } else {
        // Chaos particles in bottom half
        particles.push(spawnChaosParticle(i));
      }
    }

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // ─── 1. Optional subtle sync lane guidelines (very faint) ───
      ctx.save();
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)'; // Extremely faint light guide lines
      for (const laneY of lanes) {
        ctx.beginPath();
        ctx.moveTo(0, laneY);
        ctx.lineTo(width, laneY);
        ctx.stroke();
      }
      ctx.restore();

      const transitionBandHalf = 42; // ~84px band around headlineCenterY
      const bandTop = headlineCenterY - transitionBandHalf;
      const bandBottom = headlineCenterY + transitionBandHalf;

      // ─── 2. Update & draw each particle ───
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.state === 'CHAOS') {
          // Organic drift via Perlin-like noise
          p.noisePhase += 0.022;
          p.vx += Math.sin(p.noisePhase + p.noiseSeed) * 0.06;
          p.vy += Math.cos(p.noisePhase * 0.8 + p.noiseSeed) * 0.035;

          // Slight upward bias
          if (p.vy > -0.25) {
            p.vy -= 0.035;
          }

          // Clamp max velocity
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > 1.6) {
            p.vx = (p.vx / speed) * 1.6;
            p.vy = (p.vy / speed) * 1.6;
          }

          p.x += p.vx;
          p.y += p.vy;

          // Wall bounce (left/right)
          if (p.x < p.radius) {
            p.x = p.radius;
            p.vx = Math.abs(p.vx);
          } else if (p.x > width - p.radius) {
            p.x = width - p.radius;
            p.vx = -Math.abs(p.vx);
          }

          // Bottom bounce with reduced velocity (vy *= -0.6)
          if (p.y > height - p.radius) {
            p.y = height - p.radius;
            p.vy = -Math.abs(p.vy) * 0.6;
          }

          // Check entry into Transition Zone (from below)
          if (p.y <= bandBottom) {
            p.state = 'TRANSITION';
            const laneIndex = Math.floor(Math.random() * NUM_LANES);
            p.assignedLaneY = lanes[laneIndex];
            p.assignedLaneSpeed = laneSpeeds[laneIndex];
          }

          p.currentColor = p.chaosColor;
        } else if (p.state === 'TRANSITION') {
          // Inside transition band: steer toward assigned horizontal lane
          p.syncProgress = Math.min(1, p.syncProgress + 0.038);

          // Steer vy toward (laneY - y) * 0.07
          const desiredVy = (p.assignedLaneY - p.y) * 0.07;
          p.vy += (desiredVy - p.vy) * 0.15;

          // Lerp vx toward fixed rightward lane speed
          p.vx += (p.assignedLaneSpeed - p.vx) * 0.08;

          p.x += p.vx;
          p.y += p.vy;

          // Cross-fade color from chaos → sync when syncProgress > 0.45
          if (p.syncProgress > 0.45) {
            const crossFadeT = (p.syncProgress - 0.45) / 0.55;
            p.currentColor = interpolateColor(p.chaosColor, p.syncColor, crossFadeT);
          } else {
            p.currentColor = p.chaosColor;
          }

          // Exit transition band into pure Sync state
          if (p.syncProgress >= 1 || p.y <= bandTop) {
            p.state = 'SYNC';
            p.syncProgress = 1;
            p.vy = 0;
            p.vx = p.assignedLaneSpeed;
            p.currentColor = p.syncColor;
          }
        } else if (p.state === 'SYNC') {
          // Gliding smoothly in horizontal lane
          p.vx = p.assignedLaneSpeed;
          p.x += p.vx;

          // Lock to exact laneY with subtle smooth micro-float
          p.y += (p.assignedLaneY - p.y) * 0.1;

          p.currentColor = p.syncColor;

          // When it exits the right edge: recycle as a fresh chaos particle at bottom
          if (p.x > width + 12) {
            particles[i] = spawnChaosParticle(p.id, true);
          }
        }

        // Draw particle dot with glow
        ctx.save();
        ctx.globalAlpha = p.opacity;

        if (p.state === 'SYNC') {
          ctx.shadowBlur = 5.5;
          ctx.shadowColor = p.syncColor;
        } else if (p.state === 'TRANSITION') {
          ctx.shadowBlur = 3;
          ctx.shadowColor = p.currentColor;
        } else {
          ctx.shadowBlur = 1.5;
          ctx.shadowColor = p.chaosColor;
        }

        ctx.fillStyle = p.currentColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[640px] md:min-h-[720px] lg:min-h-[760px] bg-white overflow-hidden flex flex-col justify-center items-center select-none"
    >
      {/* ─── FULL-BLEED PARTICLE CANVAS (The Transformation Engine) ─── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      {/* ─── CENTER CONTENT / THE THRESHOLD ─── */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto pointer-events-auto">
        {/* Headline: LogiSync PRO (Static & Heavy — Transformation Threshold) */}
        <h1
          ref={headlineRef}
          className="font-black tracking-[-0.03em] leading-none select-none flex items-baseline justify-center"
          style={{
            fontSize: 'clamp(52px, 9vw, 120px)',
            gap: '0.18em',
          }}
        >
          <span style={{ color: '#0A0A0A', fontWeight: 900 }}>LogiSync</span>
          <span
            style={{
              fontWeight: 900,
              background: 'linear-gradient(135deg, #00C9B1, #2563EB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            PRO
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="mt-3 sm:mt-4 text-center select-none"
          style={{
            color: '#6B7280',
            fontSize: 'clamp(13px, 1.4vw, 17px)',
            fontWeight: 400,
            maxWidth: '400px',
            lineHeight: 1.5,
          }}
        >
          AI-powered logistics. Built for Indian MSMEs.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6 sm:mt-8">
          {/* Primary CTA */}
          <Link
            href="/auth/register"
            className="transition-all hover:opacity-85 active:scale-95 shadow-sm"
            style={{
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '9999px',
              padding: '11px 22px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Start Free Trial →
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/dashboard"
            className="transition-all hover:bg-neutral-50 active:scale-95 shadow-xs flex items-center gap-2"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              color: '#374151',
              fontSize: '14px',
              borderRadius: '9999px',
              padding: '11px 20px',
              textDecoration: 'none',
            }}
          >
            <span
              className="inline-block rounded-full"
              style={{
                width: '8px',
                height: '8px',
                backgroundColor: '#22C55E',
                animation: 'demoPulse 1.8s infinite',
              }}
            />
            <span>Interactive Demo</span>
          </Link>
        </div>
      </div>

      {/* ─── LABEL CHIPS ─── */}

      {/* Bottom-left: Chaos [ ● Chaos   HIGH ENTROPY ] */}
      <div
        className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 md:bottom-6 md:left-8 z-20 pointer-events-none flex items-center gap-1.5 sm:gap-2 shadow-xs bg-white border border-red-100 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2"
      >
        <span
          className="inline-block rounded-full w-2 h-2 bg-red-400"
          style={{
            animation: 'chaosPulse 1.4s ease-in-out infinite',
          }}
        />
        <span
          className="text-xs sm:text-sm text-neutral-900"
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          Chaos
        </span>
        <span
          className="hidden xs:inline-block font-mono uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 ml-0.5"
        >
          HIGH ENTROPY
        </span>
      </div>

      {/* Bottom-right: Sync [ ● Sync   0% ENTROPY ] */}
      <div
        className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 md:bottom-6 md:right-8 z-20 pointer-events-none flex items-center gap-1.5 sm:gap-2 shadow-xs bg-white border border-blue-100 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2"
      >
        {/* Blue dot: calm, static, NO pulse */}
        <span
          className="inline-block rounded-full w-2 h-2 bg-sky-400"
        />
        <span
          className="text-xs sm:text-sm text-neutral-900"
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
          }}
        >
          Sync
        </span>
        <span
          className="hidden xs:inline-block font-mono uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 ml-0.5"
        >
          0% ENTROPY
        </span>
      </div>

      {/* Keyframe animations for dots */}
      <style jsx>{`
        @keyframes chaosPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.45);
          }
        }
        @keyframes demoPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
          }
        }
      `}</style>
    </section>
  );
}
