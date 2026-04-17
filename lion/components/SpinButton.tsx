'use client';

interface SpinButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export default function SpinButton({ onClick, disabled }: SpinButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        mt-8 px-12 py-4 text-xl font-black tracking-widest uppercase
        rounded-full border-4 border-yellow-300
        bg-gradient-to-b from-yellow-400 via-yellow-500 to-yellow-700
        text-gray-900
        transition-all duration-200
        ${disabled
          ? 'opacity-40 cursor-not-allowed shadow-none'
          : 'cursor-pointer hover:scale-105 active:scale-95'
        }
      `}
      style={disabled ? {} : {
        boxShadow: '0 0 20px #FFD700, 0 0 40px #FFD700, 0 0 5px #fff inset',
      }}
    >
      {disabled ? '🎰 돌아가는 중...' : '🎰 돌려라!'}
    </button>
  );
}
