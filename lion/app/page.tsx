'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import SpinButton from '@/components/SpinButton';
import ResultModal from '@/components/ResultModal';
import { WHEEL_SECTIONS, WheelSection } from '@/lib/wheelData';

// Canvas component must be client-only (no SSR)
const RouletteWheel = dynamic(() => import('@/components/RouletteWheel'), { ssr: false });

export default function Home() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelSection | null>(null);

  const handleSpinComplete = useCallback((sectionIndex: number) => {
    setIsSpinning(false);
    setResult(WHEEL_SECTIONS[sectionIndex]);
  }, []);

  const handleSpin = useCallback(() => {
    if (isSpinning) return;
    setResult(null);
    setIsSpinning(true);
  }, [isSpinning]);

  const handleClose = useCallback(() => {
    setResult(null);
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-8"
      style={{ background: 'radial-gradient(ellipse at center, #1a0a0a 0%, #0A0A0F 60%, #000000 100%)' }}
    >
      {/* Vegas Title */}
      <div className="text-center mb-6 title-flicker">
        <h1
          className="text-4xl sm:text-5xl font-black tracking-widest uppercase neon-gold"
          style={{ color: '#FFD700', fontFamily: 'var(--font-noto-kr), sans-serif' }}
        >
          🎰 음주 룰렛 🎰
        </h1>
        <p
          className="mt-1 text-sm tracking-[0.3em] uppercase"
          style={{ color: 'rgba(255,215,0,0.5)' }}
        >
          Las Vegas Style · Drinking Game
        </p>
      </div>

      {/* Decorative top line */}
      <div
        className="w-64 h-px mb-6"
        style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
      />

      {/* Roulette Wheel */}
      <div className="relative flex items-center justify-center">
        <RouletteWheel
          isSpinning={isSpinning}
          onSpinComplete={handleSpinComplete}
        />
      </div>

      {/* Spin Button */}
      <SpinButton onClick={handleSpin} disabled={isSpinning} />

      {/* Decorative bottom line */}
      <div
        className="w-64 h-px mt-8"
        style={{ background: 'linear-gradient(90deg, transparent, #FFD700, transparent)' }}
      />

      <p className="mt-4 text-xs tracking-widest" style={{ color: 'rgba(255,215,0,0.3)' }}>
        책임감 있게 즐기세요 · Drink Responsibly
      </p>

      {/* Result Modal */}
      <ResultModal section={result} onClose={handleClose} />
    </main>
  );
}
