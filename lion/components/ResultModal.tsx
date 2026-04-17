'use client';

import { useEffect, useState } from 'react';
import { WheelSection } from '@/lib/wheelData';

interface ResultModalProps {
  section: WheelSection | null;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  delay: number;
  color: string;
  size: number;
  duration: number;
}

const COLORS = ['#FFD700', '#FF4500', '#FF0000', '#FFA500', '#FF69B4', '#00FFFF'];

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    duration: 1.5 + Math.random() * 1,
  }));
}

export default function ResultModal({ section, onClose }: ResultModalProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (section) {
      setParticles(generateParticles(40));
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [section]);

  if (!section) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      {/* Confetti particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-particle fixed top-0 pointer-events-none"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            boxShadow: `0 0 4px ${p.color}`,
          }}
        />
      ))}

      {/* Modal */}
      <div
        className="relative rounded-2xl overflow-hidden mx-4 text-center"
        style={{
          background: 'linear-gradient(135deg, #0A0A1A 0%, #1A0A0A 100%)',
          border: '3px solid #FFD700',
          boxShadow: '0 0 40px #FFD700, 0 0 80px rgba(255,215,0,0.3)',
          maxWidth: 420,
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="py-4 px-6" style={{ background: 'rgba(255,215,0,0.1)', borderBottom: '1px solid rgba(255,215,0,0.3)' }}>
          <p className="text-yellow-400 text-sm font-bold tracking-widest uppercase">🎰 Result 🎰</p>
        </div>

        {/* Result banner */}
        <div
          className="py-10 px-8"
          style={{ backgroundColor: section.color }}
        >
          <div
            className="text-5xl font-black mb-2 tracking-wide"
            style={{
              color: section.textColor,
              textShadow: section.textColor === '#FFD700'
                ? '0 0 10px #FFD700, 0 0 20px #FFD700'
                : '0 2px 8px rgba(0,0,0,0.8)',
            }}
          >
            {section.label}
          </div>
          <div
            className="text-lg font-semibold tracking-widest uppercase opacity-80"
            style={{ color: section.textColor }}
          >
            {section.sublabel}
          </div>
        </div>

        {/* Footer */}
        <div className="py-6 px-6">
          <button
            onClick={onClose}
            className="px-10 py-3 rounded-full font-black tracking-widest uppercase text-gray-900 text-base
              bg-gradient-to-b from-yellow-400 to-yellow-600 border-2 border-yellow-300
              transition-all hover:scale-105 active:scale-95 cursor-pointer"
            style={{ boxShadow: '0 0 15px #FFD700' }}
          >
            다시 돌리기
          </button>
          <p className="text-gray-500 text-xs mt-3">클릭하여 닫기</p>
        </div>
      </div>
    </div>
  );
}
