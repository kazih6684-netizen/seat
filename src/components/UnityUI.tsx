import React, { useEffect, useState } from 'react';

export function Background() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      bottom: `${Math.random() * 20}%`,
      dur: `${6 + Math.random() * 8}s`,
      delay: `${Math.random() * 8}s`,
      size: `${2 + Math.random() * 4}px`
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
      <div className="bg-grid absolute inset-0"></div>
      <div className="absolute top-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-gold/10 blur-[80px] animate-pulse"></div>
      <div className="absolute bottom-[-100px] right-[-80px] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[80px] animate-pulse delay-3000"></div>
      
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: p.size,
            height: p.size,
            animation: `floatUp ${p.dur} ${p.delay} ease-in-out infinite`
          }}
        />
      ))}
    </div>
  );
}

export function GoldButton({ children, onClick, disabled, loading, className, type = 'button' }: any) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        relative w-full py-4 rounded-xl font-cinzel font-bold text-lg tracking-wider
        gold-gradient text-navy-mid shadow-lg
        active:scale-[0.98] transition-all duration-200 overflow-hidden
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        flex items-center justify-center
        ${className}
      `}
    >
      {loading ? (
        <div className="flex justify-center gap-1.5 items-center h-6">
          <div className="w-2 h-2 bg-navy-mid rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-navy-mid rounded-full animate-bounce delay-150"></div>
          <div className="w-2 h-2 bg-navy-mid rounded-full animate-bounce delay-300"></div>
        </div>
      ) : children}
    </button>
  );
}
