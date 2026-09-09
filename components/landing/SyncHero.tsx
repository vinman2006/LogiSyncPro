'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  state: 'CHAOS' | 'TRANSITION_UP' | 'ORDERED' | 'TRANSITION_DOWN';
  targetLaneY: number;
  laneIndex: number;
  laneSpeed: number;
  chaosWobblePhase: number;
  transitionProgress: number;
  transitionStartX: number;
  transitionStartY: number;
  pulseAlpha: number;
}

const PALETTE = [
  '#FF6B6B', // Coral
  '#0D9488', // Teal
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#10B981', // Soft Green
  '#0284C7', // Sky Blue
  '#EC4899', // Rose Pink
];

export default function SyncHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let groundLineY = 0;

    // Ordered lanes configuration (above ground line)
    let lanes: number[] = [];
    const NUM_LANES = 4;
    const LANE_SPACING = 28;

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Ground line positioned at ~50% of the canvas height
      groundLineY = Math.floor(height * 0.52);

      // Lanes positioned above ground line
      lanes = [];
      for (let i = 0; i < NUM_LANES; i++) {
        lanes.push(groundLineY - 24 - (NUM_LANES - 1 - i) * LANE_SPACING);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize particles
    const PARTICLE_COUNT = Math.min(Math.max(Math.floor(window.innerWidth / 14), 70), 120);
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isInitialOrdered = i < PARTICLE_COUNT * 0.45;
      const laneIndex = i % NUM_LANES;
      const radius = 3 + Math.random() * 5.5; // 3px to 8.5px
      const color = PALETTE[i % PALETTE.length];

      if (isInitialOrdered) {
        // Start in ordered horizontal lanes
        const x = Math.random() * (width || 1000);
        const y = lanes[laneIndex] || (groundLineY - 40);
        const laneSpeed = (laneIndex % 2 === 0 ? 1 : -1) * (1.1 + laneIndex * 0.22);
        particles.push({
          id: i,
          x,
          y,
          vx: laneSpeed,
          vy: 0,
          radius,
          color,
          state: 'ORDERED',
          targetLaneY: y,
          laneIndex,
          laneSpeed,
          chaosWobblePhase: Math.random() * Math.PI * 2,
          transitionProgress: 1,
          transitionStartX: x,
          transitionStartY: y,
          pulseAlpha: 0,
        });
      } else {
        // Start in chaotic field below the line
        const x = 30 + Math.random() * ((width || 1000) - 60);
        const y = groundLineY + 20 + Math.random() * Math.max(height - groundLineY - 40, 60);
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.8 + Math.random() * 1.5;
        const laneSpeed = (laneIndex % 2 === 0 ? 1 : -1) * (1.1 + laneIndex * 0.22);

        particles.push({
          id: i,
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          color,
          state: 'CHAOS',
          targetLaneY: lanes[laneIndex] || (groundLineY - 40),
          laneIndex,
          laneSpeed,
          chaosWobblePhase: Math.random() * Math.PI * 2,
          transitionProgress: 0,
          transitionStartX: x,
          transitionStartY: y,
          pulseAlpha: 0,
        });
      }
    }

    // Mouse coordinates for gentle interaction
    let mouseX = -9999;
    let mouseY = -9999;
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.67, 2.5);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // ── 1. DRAW BACKGROUND LANE GUIDES (Sync Zone) ──
      ctx.save();
      for (let i = 0; i < lanes.length; i++) {
        const laneY = lanes[i];
        ctx.beginPath();
        ctx.setLineDash([4, 12]);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)'; // Soft subtle grid track
        ctx.moveTo(30, laneY);
        ctx.lineTo(width - 30, laneY);
        ctx.stroke();

        // Direction indicators along lanes
        const isRight = i % 2 === 0;
        ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
        ctx.font = '9px JetBrains Mono, monospace';
        if (isRight) {
          ctx.fillText(`LANE 0${i + 1} ➔`, 34, laneY - 5);
        } else {
          ctx.fillText(`◀ LANE 0${i + 1}`, width - 100, laneY - 5);
        }
      }
      ctx.restore();

      // ── 2. DRAW GROUND LINE (The Sync Threshold) ──
      ctx.save();
      // Faint ambient blue glow behind line
      const glowGrad = ctx.createRadialGradient(
        width / 2, groundLineY, 10,
        width / 2, groundLineY, width * 0.45
      );
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
      glowGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.08)');
      glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, groundLineY - 14, width, 28);

      // Very faint, thin blue gradient line running across the width
      const lineGrad = ctx.createLinearGradient(0, groundLineY, width, groundLineY);
      lineGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      lineGrad.addColorStop(0.12, 'rgba(56, 189, 248, 0.35)');
      lineGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.85)'); // Vibrant center
      lineGrad.addColorStop(0.88, 'rgba(56, 189, 248, 0.35)');
      lineGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.beginPath();
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, groundLineY);
      ctx.lineTo(width, groundLineY);
      ctx.stroke();

      // Soft threshold badge in the center
      const badgeText = 'SYNC THRESHOLD · LOGISYNC KERNEL';
      ctx.font = '600 9px JetBrains Mono, monospace';
      const badgeWidth = ctx.measureText(badgeText).width + 20;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.fillRect(width / 2 - badgeWidth / 2, groundLineY - 8, badgeWidth, 16);
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width / 2 - badgeWidth / 2, groundLineY - 8, badgeWidth, 16);
      ctx.fillStyle = '#0284C7';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, width / 2, groundLineY);
      ctx.restore();

      // ── 3. UPDATE & DRAW PARTICLES ──
      for (const p of particles) {
        // Mouse influence
        const dxMouse = p.x - mouseX;
        const dyMouse = p.y - mouseY;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

        if (p.state === 'CHAOS') {
          // Chaotic erratic movement
          p.chaosWobblePhase += 0.06 * dt;
          p.vx += (Math.random() - 0.5) * 0.18 * dt;
          p.vy += (Math.random() - 0.5) * 0.18 * dt;

          // Clamp chaotic speed
          const speed = Math.hypot(p.vx, p.vy);
          if (speed > 2.2) {
            p.vx = (p.vx / speed) * 2.2;
            p.vy = (p.vy / speed) * 2.2;
          }

          // Gentle mouse evasion in chaos field
          if (distMouse < 90 && distMouse > 0) {
            const push = ((90 - distMouse) / 90) * 0.8;
            p.vx += (dxMouse / distMouse) * push;
            p.vy += (dyMouse / distMouse) * push;
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Boundary bouncing in Chaos Zone (below ground line)
          const margin = p.radius + 6;
          if (p.x < margin) {
            p.x = margin;
            p.vx = Math.abs(p.vx) * 0.9;
          } else if (p.x > width - margin) {
            p.x = width - margin;
            p.vx = -Math.abs(p.vx) * 0.9;
          }

          if (p.y > height - margin) {
            p.y = height - margin;
            p.vy = -Math.abs(p.vy) * 0.9;
          }

          // Natural transition: When chaotic particle drifts within 35px of ground line,
          // it gets captured into the Sync Zone!
          if (p.y <= groundLineY + 25 && p.vy < 0) {
            // Chance to transition upward
            p.state = 'TRANSITION_UP';
            p.transitionProgress = 0;
            p.transitionStartX = p.x;
            p.transitionStartY = p.y;
            p.pulseAlpha = 1.0; // Trigger synchronization ring
          } else if (p.y < groundLineY + 6) {
            // Force bounce downward if not transitioning
            p.y = groundLineY + 7;
            p.vy = Math.abs(p.vy);
          }
        } else if (p.state === 'TRANSITION_UP') {
          // Smooth Bezier / cubic transition from Chaos into designated ordered lane
          p.transitionProgress += 0.018 * dt;
          const t = Math.min(p.transitionProgress, 1);
          // Cubic ease-out
          const ease = 1 - Math.pow(1 - t, 3);

          p.y = p.transitionStartY + (p.targetLaneY - p.transitionStartY) * ease;
          p.x += p.laneSpeed * dt;

          if (t >= 1) {
            p.state = 'ORDERED';
            p.y = p.targetLaneY;
            p.vy = 0;
            p.vx = p.laneSpeed;
          }
        } else if (p.state === 'ORDERED') {
          // Smooth, synchronized horizontal motion along parallel lanes
          p.y = p.targetLaneY;
          p.vx = p.laneSpeed;
          p.x += p.vx * dt;

          // Loop recycling: when particle exits either side of screen
          if (p.laneSpeed > 0 && p.x > width + 30) {
            // Send back down to chaos pool from the left bottom
            p.state = 'CHAOS';
            p.x = 20 + Math.random() * 80;
            p.y = groundLineY + 30 + Math.random() * (height - groundLineY - 50);
            p.vx = 0.8 + Math.random();
            p.vy = (Math.random() - 0.5) * 1.5;
          } else if (p.laneSpeed < 0 && p.x < -30) {
            // Send back down to chaos pool from the right bottom
            p.state = 'CHAOS';
            p.x = width - 40 - Math.random() * 80;
            p.y = groundLineY + 30 + Math.random() * (height - groundLineY - 50);
            p.vx = -(0.8 + Math.random());
            p.vy = (Math.random() - 0.5) * 1.5;
          }
        }

        // Draw particle pulse when crossing threshold
        if (p.pulseAlpha > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + (1 - p.pulseAlpha) * 16, 0, Math.PI * 2);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = p.pulseAlpha * 0.65;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.restore();
          p.pulseAlpha -= 0.03 * dt;
        }

        // Draw particle dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.state === 'ORDERED' ? 6 : 2;
        ctx.fill();

        // Subtle specular highlight for tactile, Figma-like dot quality
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.32, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.shadowBlur = 0;
        ctx.fill();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[64vh] md:min-h-[72vh] lg:min-h-[76vh] bg-white flex flex-col justify-between items-center overflow-hidden pt-24 pb-4 select-none"
    >
      {/* ─── TYPOGRAPHIC CENTERPIECE (Massive 900 Weight) ─── */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 pt-4 md:pt-8 w-full max-w-7xl mx-auto">
        {/* Massive Headline */}
        <h1 className="font-black tracking-[-0.045em] text-neutral-950 leading-[0.9] text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] xl:text-[9rem] flex items-center justify-center flex-wrap gap-x-3 md:gap-x-5">
          <span className="drop-shadow-xs">LogiSync</span>
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-teal-500 via-sky-500 to-blue-600">
            PRO
          </span>
        </h1>

        {/* Subheadline: Thin, muted gray (#888), centered, ~18px */}
        <p className="text-[#888888] font-normal text-base md:text-[18px] tracking-normal mt-3 max-w-xl mx-auto leading-relaxed">
          AI-powered logistics. Built for Indian MSMEs.
        </p>

        {/* Minimal Action Chips / Indicators */}
        <div className="flex items-center gap-3 mt-4">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-xs font-semibold tracking-wide transition-all shadow-sm hover:shadow-md hover:scale-105"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200/80 text-neutral-700 text-xs font-medium transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Interactive Demo</span>
          </Link>
        </div>
      </div>

      {/* ─── CANVAS PARTICLE FIELD (The Hero Element) ─── */}
      <div className="relative w-full flex-1 min-h-[360px] md:min-h-[420px] pointer-events-auto">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
        />

        {/* ─── HANDWRITTEN / CHALK ANNOTATION LABELS ─── */}

        {/* TOP-RIGHT: "Sync" pointing down-left toward ordered lanes */}
        <div className="absolute top-6 right-6 md:right-16 lg:right-24 z-30 pointer-events-none flex flex-col items-end">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-neutral-200/90 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
            <span className="font-handwriting text-2xl md:text-3xl font-bold text-neutral-900 tracking-wide">
              Sync
            </span>
            <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider pl-1 border-l border-neutral-200">
              0% Entropy
            </span>
          </div>

          {/* Curved chalk-style arrow pointing down-left */}
          <svg
            className="w-20 h-16 md:w-28 md:h-20 text-sky-500 mt-1 mr-4 overflow-visible"
            viewBox="0 0 100 70"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M85 5 C 60 5, 25 20, 15 52"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="1 0"
              className="opacity-80"
            />
            {/* Arrowhead */}
            <path
              d="M8 44 L 15 54 L 25 48"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* BOTTOM-LEFT: "Chaos" pointing down-right toward scattered particles */}
        <div className="absolute bottom-6 left-6 md:left-16 lg:left-24 z-30 pointer-events-none flex flex-col items-start">
          {/* Curved chalk-style arrow pointing down-right */}
          <svg
            className="w-20 h-16 md:w-28 md:h-20 text-rose-500 mb-1 ml-4 overflow-visible"
            viewBox="0 0 100 70"
            fill="none"
            stroke="currentColor"
          >
            <path
              d="M15 15 C 30 15, 65 25, 80 50"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="1 0"
              className="opacity-80"
            />
            {/* Arrowhead */}
            <path
              d="M72 43 L 82 52 L 85 40"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-xs border border-neutral-200/90 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-handwriting text-2xl md:text-3xl font-bold text-neutral-900 tracking-wide">
              Chaos
            </span>
            <span className="text-[10px] font-mono font-medium text-neutral-400 uppercase tracking-wider pl-1 border-l border-neutral-200">
              High Entropy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
