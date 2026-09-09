'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

type BallState =
  | { kind: 'CYLINDER' }
  | { kind: 'PIPE'; t: number; startX: number; startY: number }
  | { kind: 'LANE'; laneIdx: number; laneY: number; speed: number; x: number };

interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  color: string;
  state: BallState;
  noisePhase: number;
  noiseSeed: number;
}

const BALL_COLORS = [
  '#F87171', '#FB923C', '#FBBF24', '#A3E635',
  '#C084FC', '#F472B6', '#38BDF8', '#00C9B1',
  '#E879F9', '#67E8F9', '#6EE7B7', '#FCD34D',
];

function rnd(min: number, max: number) { return min + Math.random() * (max - min); }

function cubicBezier(
  t: number,
  p0: [number, number], p1: [number, number],
  p2: [number, number], p3: [number, number],
): [number, number] {
  const mt = 1 - t, mt2 = mt * mt, mt3 = mt2 * mt, t2 = t * t, t3 = t2 * t;
  return [
    mt3 * p0[0] + 3 * mt2 * t * p1[0] + 3 * mt * t2 * p2[0] + t3 * p3[0],
    mt3 * p0[1] + 3 * mt2 * t * p1[1] + 3 * mt * t2 * p2[1] + t3 * p3[1],
  ];
}

export default function SyncHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const headlineRef  = useRef<HTMLHeadingElement>(null);
  const rafId        = useRef<number | null>(null);

  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    let cylX = 0, cylY = 0, cylW = 0, cylH = 0;
    let funnelExitX = 0, funnelExitY = 0;
    let textL = 0, textR = 0, textCX = 0, textCY = 0, textH = 0;
    let nozzleX = 0, nozzleY = 0;
    const NUM_LANES = 7;
    let lanes: number[] = [];
    let laneSpeeds: number[] = [];
    let pipeP0: [number, number] = [0, 0];
    let pipeP1: [number, number] = [0, 0];
    let pipeP2: [number, number] = [0, 0];
    let pipeP3: [number, number] = [0, 0];
    let nozzlePaths: Array<[[number, number], [number, number], [number, number], [number, number]]> = [];

    const layout = () => {
      const rect = container.getBoundingClientRect();
      W = rect.width; H = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = `${W}px`; canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);

      let hL = W * 0.2, hT = H * 0.38, hR = W * 0.8, hB = H * 0.58;
      if (headlineRef.current) {
        const hr = headlineRef.current.getBoundingClientRect();
        const cr = container.getBoundingClientRect();
        hL = hr.left - cr.left; hT = hr.top - cr.top;
        hR = hr.right - cr.left; hB = hr.bottom - cr.top;
      }
      textL = hL; textR = hR;
      textCX = (hL + hR) / 2; textCY = (hT + hB) / 2; textH = hB - hT;

      const isMobile = W < 640;
      cylW = isMobile ? W * 0.14 : Math.min(W * 0.11, 100);
      cylH = isMobile ? H * 0.36 : Math.min(H * 0.46, 280);
      cylX = isMobile ? W * 0.03 : Math.max(W * 0.04, 24);
      cylY = textCY - cylH * 0.5;

      funnelExitX = cylX + cylW / 2;
      funnelExitY = cylY + cylH + 14;

      pipeP0 = [funnelExitX, funnelExitY];
      pipeP1 = [funnelExitX - cylW * 0.2, funnelExitY + cylH * 0.4];
      pipeP2 = [textL - W * 0.05, textCY + textH * 0.1];
      pipeP3 = [textL, textCY];

      nozzleX = textR; nozzleY = textCY;

      lanes = []; laneSpeeds = [];
      const spread = Math.min(H * 0.38, 210);
      for (let i = 0; i < NUM_LANES; i++) {
        lanes.push((textCY - spread / 2) + (i / (NUM_LANES - 1)) * spread);
        laneSpeeds.push(0.6 + rnd(0, 0.55));
      }

      nozzlePaths = [];
      const fanEndX = nozzleX + W * 0.10;
      for (let i = 0; i < NUM_LANES; i++) {
        const ly = lanes[i];
        nozzlePaths.push([
          [nozzleX,           nozzleY],
          [nozzleX + W*0.03,  nozzleY + (ly - nozzleY) * 0.3],
          [nozzleX + W*0.07,  ly],
          [fanEndX,           ly],
        ]);
      }
    };

    layout();
    window.addEventListener('resize', layout);

    const BALL_COUNT = W < 640 ? 90 : 175;
    const balls: Ball[] = [];

    const makeCylinderBall = (id: number): Ball => {
      const color = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
      const radius = rnd(2.8, 5.2);
      const pad = radius + 2;
      return {
        id, color, radius,
        x: cylX + pad + Math.random() * Math.max(0, cylW - pad * 2),
        y: cylY + pad + Math.random() * Math.max(0, cylH - pad * 2),
        vx: rnd(-0.8, 0.8), vy: rnd(-0.8, 0.8),
        opacity: rnd(0.55, 0.92),
        state: { kind: 'CYLINDER' },
        noisePhase: rnd(0, Math.PI * 2), noiseSeed: rnd(0, 1000),
      };
    };

    for (let i = 0; i < BALL_COUNT; i++) {
      if (i < BALL_COUNT * 0.55) {
        balls.push(makeCylinderBall(i));
      } else {
        const laneIdx = i % NUM_LANES;
        const ly      = lanes[laneIdx] ?? H * 0.3;
        const sp      = laneSpeeds[laneIdx] ?? 0.8;
        const color   = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
        const lx      = rnd(nozzleX + W * 0.10, W + 40);
        balls.push({
          id: i, color, radius: rnd(2.8, 5.2), opacity: rnd(0.55, 0.92),
          x: lx, y: ly, vx: sp, vy: 0,
          state: { kind: 'LANE', laneIdx, laneY: ly, speed: sp, x: lx },
          noisePhase: 0, noiseSeed: 0,
        });
      }
    }

    let pipeEmitTimer = 0;
    const PIPE_EMIT_INTERVAL = 28;

    const drawCylinder = () => {
      const rx = cylW / 2, ry = rx * 0.22, cx = cylX + rx;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cylX, cylY + ry);
      ctx.lineTo(cylX, cylY + cylH);
      ctx.arcTo(cylX, cylY + cylH + ry * 2, cx, cylY + cylH + ry * 2, rx);
      ctx.arcTo(cylX + cylW, cylY + cylH + ry * 2, cylX + cylW, cylY + cylH, rx);
      ctx.lineTo(cylX + cylW, cylY + ry);
      ctx.ellipse(cx, cylY + ry, rx, ry, 0, 0, Math.PI);
      ctx.closePath();
      const bg = ctx.createLinearGradient(cylX, 0, cylX + cylW, 0);
      bg.addColorStop(0, 'rgba(220,230,255,0.13)');
      bg.addColorStop(0.5, 'rgba(240,245,255,0.06)');
      bg.addColorStop(1, 'rgba(210,225,255,0.14)');
      ctx.fillStyle = bg; ctx.fill();
      ctx.strokeStyle = 'rgba(15,23,42,0.14)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cylY + ry, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(15,23,42,0.18)'; ctx.lineWidth = 1; ctx.stroke();
      const eg = ctx.createLinearGradient(cylX, 0, cylX + cylW, 0);
      eg.addColorStop(0, 'rgba(255,255,255,0.5)');
      eg.addColorStop(0.08, 'rgba(255,255,255,0)');
      eg.addColorStop(0.92, 'rgba(255,255,255,0)');
      eg.addColorStop(1, 'rgba(255,255,255,0.3)');
      ctx.fillStyle = eg; ctx.fillRect(cylX, cylY, cylW, cylH + ry);
      const fw = cylW * 0.22;
      ctx.beginPath();
      ctx.moveTo(cylX, cylY + cylH + ry * 0.7);
      ctx.lineTo(cx - fw, cylY + cylH + ry + 10);
      ctx.lineTo(cx - fw, funnelExitY);
      ctx.lineTo(cx + fw, funnelExitY);
      ctx.lineTo(cx + fw, cylY + cylH + ry + 10);
      ctx.closePath();
      ctx.fillStyle = 'rgba(200,215,240,0.14)';
      ctx.strokeStyle = 'rgba(15,23,42,0.11)';
      ctx.fill(); ctx.stroke();
      ctx.restore();
    };

    const drawPipe = () => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pipeP0[0], pipeP0[1]);
      ctx.bezierCurveTo(pipeP1[0], pipeP1[1], pipeP2[0], pipeP2[1], pipeP3[0], pipeP3[1]);
      ctx.strokeStyle = 'rgba(15,23,42,0.09)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pipeP0[0], pipeP0[1]);
      ctx.bezierCurveTo(pipeP1[0], pipeP1[1], pipeP2[0], pipeP2[1], pipeP3[0], pipeP3[1]);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    };

    const drawNozzle = () => {
      ctx.save();
      for (const [p0, p1, p2, p3] of nozzlePaths) {
        ctx.beginPath();
        ctx.moveTo(p0[0], p0[1]);
        ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
        ctx.strokeStyle = 'rgba(15,23,42,0.055)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 10]);
        ctx.stroke();
      }
      ctx.restore();
    };

    const pipePos = (t: number): [number, number] => cubicBezier(t, pipeP0, pipeP1, pipeP2, pipeP3);
    const nozzlePos = (laneIdx: number, t: number): [number, number] => {
      const [p0, p1, p2, p3] = nozzlePaths[laneIdx] ?? nozzlePaths[0];
      return cubicBezier(t, p0, p1, p2, p3);
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      drawCylinder(); drawPipe(); drawNozzle();
      pipeEmitTimer++;

      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];

        if (b.state.kind === 'CYLINDER') {
          b.noisePhase += 0.025;
          b.vx += Math.sin(b.noisePhase + b.noiseSeed) * 0.07;
          b.vy += Math.cos(b.noisePhase * 0.75 + b.noiseSeed) * 0.05;
          const spd = Math.hypot(b.vx, b.vy);
          if (spd > 1.5) { b.vx = b.vx / spd * 1.5; b.vy = b.vy / spd * 1.5; }
          b.x += b.vx; b.y += b.vy;
          const pad = b.radius + 1;
          if (b.x < cylX + pad)        { b.x = cylX + pad;        b.vx =  Math.abs(b.vx); }
          if (b.x > cylX + cylW - pad) { b.x = cylX + cylW - pad; b.vx = -Math.abs(b.vx); }
          if (b.y < cylY + pad)        { b.y = cylY + pad;        b.vy =  Math.abs(b.vy); }
          if (b.y > cylY + cylH - pad) { b.y = cylY + cylH - pad; b.vy = -Math.abs(b.vy); }

          if (pipeEmitTimer >= PIPE_EMIT_INTERVAL) {
            let closest = -1, closestDist = Infinity;
            for (let j = 0; j < balls.length; j++) {
              if (balls[j].state.kind !== 'CYLINDER') continue;
              const dx = balls[j].x - funnelExitX, dy = balls[j].y - funnelExitY;
              const d = Math.hypot(dx, dy);
              if (d < closestDist) { closestDist = d; closest = j; }
            }
            if (closest === i) {
              b.state = { kind: 'PIPE', t: 0, startX: b.x, startY: b.y };
              pipeEmitTimer = 0;
            }
          }
        } else if (b.state.kind === 'PIPE') {
          b.state.t += 0.018;
          const [px, py] = pipePos(Math.min(b.state.t, 1));
          b.x = px; b.y = py;
          if (b.state.t >= 1) {
            const laneIdx = Math.floor(Math.random() * NUM_LANES);
            const ly = lanes[laneIdx] ?? textCY;
            const sp = laneSpeeds[laneIdx] ?? 0.8;
            b.state = { kind: 'LANE', laneIdx, laneY: ly, speed: sp, x: nozzleX };
          }
        } else if (b.state.kind === 'LANE') {
          const s = b.state;
          const fanEndX = nozzleX + W * 0.10;
          if (s.x < fanEndX) {
            const fanT = (s.x - nozzleX) / (fanEndX - nozzleX);
            const [fx, fy] = nozzlePos(s.laneIdx, Math.max(0, Math.min(1, fanT)));
            b.x = fx; b.y = fy; s.x += s.speed * 0.9;
          } else {
            b.x += s.speed; b.y += (s.laneY - b.y) * 0.08; s.x = b.x;
          }
          if (b.x > W + 20) {
            balls[i] = makeCylinderBall(b.id);
          }
        }

        ctx.save();
        ctx.globalAlpha = b.opacity;
        if (b.state.kind === 'LANE')       { ctx.shadowBlur = 6; ctx.shadowColor = b.color; }
        else if (b.state.kind === 'PIPE')  { ctx.shadowBlur = 3; ctx.shadowColor = b.color; }
        else                                { ctx.shadowBlur = 1.5; ctx.shadowColor = b.color; }
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      rafId.current = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', layout);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[640px] md:min-h-[720px] lg:min-h-[760px] bg-white overflow-hidden flex flex-col justify-center items-center select-none"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-10"
      />

      <div className="relative z-20 flex flex-col items-center text-center px-4 max-w-5xl mx-auto pointer-events-auto">
        <h1
          ref={headlineRef}
          className="font-black tracking-[-0.03em] leading-none select-none flex items-baseline justify-center"
          style={{ fontSize: 'clamp(52px, 9vw, 120px)', gap: '0.18em' }}
        >
          <span style={{ color: '#0A0A0A', fontWeight: 900 }}>LogiSync</span>
          <span style={{ fontWeight: 900, background: 'linear-gradient(135deg, #00C9B1, #2563EB)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PRO
          </span>
        </h1>

        <p className="mt-3 sm:mt-4 text-center select-none" style={{ color: '#6B7280', fontSize: 'clamp(13px, 1.4vw, 17px)', fontWeight: 400, maxWidth: '400px', lineHeight: 1.5 }}>
          AI-powered logistics. Built for Indian MSMEs.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-6 sm:mt-8">
          <Link href="/auth/register" className="transition-all hover:opacity-85 active:scale-95 shadow-sm" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF', fontSize: '14px', fontWeight: 500, borderRadius: '9999px', padding: '11px 22px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Start Free Trial \u2192
          </Link>
          <Link href="/dashboard" className="transition-all hover:bg-neutral-50 active:scale-95 shadow-xs flex items-center gap-2" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', color: '#374151', fontSize: '14px', borderRadius: '9999px', padding: '11px 20px', textDecoration: 'none' }}>
            <span className="inline-block rounded-full" style={{ width: '8px', height: '8px', backgroundColor: '#22C55E', animation: 'demoPulse 1.8s infinite' }} />
            <span>Interactive Demo</span>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 md:bottom-6 md:left-8 z-20 pointer-events-none flex items-center gap-1.5 sm:gap-2 shadow-xs bg-white border border-red-100 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2">
        <span className="inline-block rounded-full w-2 h-2 bg-red-400" style={{ animation: 'chaosPulse 1.4s ease-in-out infinite' }} />
        <span className="text-xs sm:text-sm text-neutral-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Chaos</span>
        <span className="hidden xs:inline-block font-mono uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 ml-0.5">HIGH ENTROPY</span>
      </div>

      <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 md:bottom-6 md:right-8 z-20 pointer-events-none flex items-center gap-1.5 sm:gap-2 shadow-xs bg-white border border-blue-100 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2">
        <span className="inline-block rounded-full w-2 h-2 bg-sky-400" />
        <span className="text-xs sm:text-sm text-neutral-900" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Sync</span>
        <span className="hidden xs:inline-block font-mono uppercase text-[9px] sm:text-[10px] tracking-wider text-neutral-400 ml-0.5">0% ENTROPY</span>
      </div>

      <style>{`
        @keyframes chaosPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.45)} }
        @keyframes demoPulse { 0%{box-shadow:0 0 0 0 rgba(34,197,94,.4)} 70%{box-shadow:0 0 0 6px rgba(34,197,94,0)} 100%{box-shadow:0 0 0 0 rgba(34,197,94,0)} }
      `}</style>
    </section>
  );
}
