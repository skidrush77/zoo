'use client';

import { useRef, useEffect, useCallback } from 'react';
import { WHEEL_SECTIONS, SECTION_COUNT, SECTION_ANGLE } from '@/lib/wheelData';
import {
  PhysicsState,
  createSpinState,
  easeOutExponential,
  getCurrentVelocity,
  getWinnerIndex,
  SPIN_DURATION,
} from '@/lib/physics';
import { AudioEngine } from '@/lib/audioEngine';

interface RouletteWheelProps {
  isSpinning: boolean;
  onSpinComplete: (sectionIndex: number) => void;
}

const audioEngine = new AudioEngine();

export default function RouletteWheel({ isSpinning, onSpinComplete }: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentAngleRef = useRef<number>(-Math.PI / 2);
  const physicsRef = useRef<PhysicsState | null>(null);
  const animationRef = useRef<number>(0);
  const prevSectionRef = useRef<number>(-1);
  const isSpinningRef = useRef<boolean>(false);

  const drawWheel = useCallback((ctx: CanvasRenderingContext2D, angle: number, timestamp: number) => {
    const canvas = ctx.canvas;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) - 30;

    ctx.clearRect(0, 0, W, H);

    // Outer decorative glow ring
    const outerGlow = ctx.createRadialGradient(cx, cy, radius + 5, cx, cy, radius + 28);
    outerGlow.addColorStop(0, 'rgba(255,215,0,0.4)');
    outerGlow.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 28, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    // Draw sections
    WHEEL_SECTIONS.forEach((section, i) => {
      const startAngle = angle + i * SECTION_ANGLE;
      const endAngle = startAngle + SECTION_ANGLE;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = section.color;
      ctx.fill();

      // Radial gradient overlay for depth
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
      grad.addColorStop(0, 'rgba(255,255,255,0.08)');
      grad.addColorStop(0.6, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,0.25)');
      ctx.fillStyle = grad;
      ctx.fill();

      // Section border
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,215,0,0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text
      const textAngle = startAngle + SECTION_ANGLE / 2;
      const textRadius = radius * 0.62;
      const tx = cx + textRadius * Math.cos(textAngle);
      const ty = cy + textRadius * Math.sin(textAngle);

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(textAngle + Math.PI / 2);

      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      ctx.fillStyle = section.textColor;
      ctx.font = `bold ${Math.round(radius * 0.095)}px "Noto Sans KR", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(section.label, 0, -8);

      ctx.font = `${Math.round(radius * 0.065)}px sans-serif`;
      ctx.fillStyle = section.textColor === '#FFD700' ? 'rgba(255,215,0,0.8)' : 'rgba(255,255,255,0.7)';
      ctx.fillText(section.sublabel, 0, 10);

      ctx.restore();
    });

    // Outer gold ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Decorative lights around outer ring
    const numLights = 24;
    const lightRadius = radius + 16;
    for (let i = 0; i < numLights; i++) {
      const a = (i / numLights) * Math.PI * 2;
      const lx = cx + lightRadius * Math.cos(a);
      const ly = cy + lightRadius * Math.sin(a);
      const blinkPhase = (timestamp / 350 + i * 0.42) % (Math.PI * 2);
      const brightness = (Math.sin(blinkPhase) + 1) / 2;

      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0
        ? `rgba(255,215,0,${0.3 + brightness * 0.7})`
        : `rgba(255,80,80,${0.3 + brightness * 0.7})`;
      ctx.shadowColor = i % 2 === 0 ? '#FFD700' : '#FF5050';
      ctx.shadowBlur = 6 + brightness * 10;
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, radius * 0.18);
    hubGrad.addColorStop(0, '#FFF8DC');
    hubGrad.addColorStop(0.4, '#FFD700');
    hubGrad.addColorStop(1, '#B8860B');
    ctx.fillStyle = hubGrad;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.18, 0, Math.PI * 2);
    ctx.strokeStyle = '#FFF8DC';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer (top center, fixed)
    const pW = 18;
    const pH = 38;
    ctx.save();
    ctx.translate(cx, 0);
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.moveTo(0, pH);
    ctx.lineTo(-pW, 4);
    ctx.lineTo(pW, 4);
    ctx.closePath();
    ctx.fillStyle = '#FFD700';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
  }, []);

  const animate = useCallback((timestamp: number) => {
    const physics = physicsRef.current;
    const canvas = canvasRef.current;
    if (!physics || !canvas) return;

    if (physics.startTime === 0) {
      physics.startTime = timestamp;
    }

    const elapsed = timestamp - physics.startTime;
    const t = Math.min(elapsed / SPIN_DURATION, 1);
    const easedProgress = easeOutExponential(t);
    const currentAngle = physics.startAngle + physics.totalRotation * easedProgress;

    // Detect section boundary crossing for tick sound
    const normalizedAngle = ((currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const currentSection = Math.floor(normalizedAngle / SECTION_ANGLE) % SECTION_COUNT;
    if (prevSectionRef.current !== currentSection && prevSectionRef.current !== -1) {
      const velocity = getCurrentVelocity(t);
      audioEngine.playTick(velocity);
    }
    prevSectionRef.current = currentSection;

    currentAngleRef.current = currentAngle;

    const ctx = canvas.getContext('2d');
    if (ctx) drawWheel(ctx, currentAngle, timestamp);

    if (t < 1) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      audioEngine.stopBGM();
      audioEngine.playLandingTick();
      const winner = getWinnerIndex(currentAngle);
      isSpinningRef.current = false;
      setTimeout(() => {
        audioEngine.playFanfare();
        onSpinComplete(winner);
      }, 400);
    }
  }, [drawWheel, onSpinComplete]);

  // Start spin when isSpinning becomes true
  useEffect(() => {
    if (isSpinning && !isSpinningRef.current) {
      isSpinningRef.current = true;
      audioEngine.resume();
      audioEngine.startBGM();

      const state = createSpinState(currentAngleRef.current);
      physicsRef.current = state;
      prevSectionRef.current = -1;

      cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [isSpinning, animate]);

  // Initial draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const size = Math.min(window.innerWidth * 0.88, 520);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      document.fonts.ready.then(() => {
        drawWheel(ctx, currentAngleRef.current, 0);
      });
    }

    return () => cancelAnimationFrame(animationRef.current);
  }, [drawWheel]);

  return (
    <canvas
      ref={canvasRef}
      className="drop-shadow-2xl"
      style={{ maxWidth: '100%' }}
    />
  );
}
