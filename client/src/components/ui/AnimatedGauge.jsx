import { useState, useEffect } from 'react';

export default function AnimatedGauge({ score, size = 180, label = 'AI Score' }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let frame;
    const duration = 1200;
    const start = performance.now();

    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setAnimatedScore(score * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const percentage = Math.round(animatedScore * 100);
  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius;
  const offset = circumference - (animatedScore * circumference);

  const getColor = (s) => {
    if (s < 0.35) return { stroke: '#22c55e', shadow: '0 0 20px rgba(34,197,94,0.4)' };
    if (s < 0.65) return { stroke: '#eab308', shadow: '0 0 20px rgba(234,179,8,0.4)' };
    return { stroke: '#ef4444', shadow: '0 0 20px rgba(239,68,68,0.4)' };
  };

  const { stroke, shadow } = getColor(score);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        {/* Background arc */}
        <path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Animated score arc */}
        <path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ filter: `drop-shadow(${shadow})`, transition: 'stroke 0.5s' }}
        />
        {/* Score text */}
        <text
          x={size / 2}
          y={size / 2 - 2}
          textAnchor="middle"
          className="text-4xl font-bold"
          fill={stroke}
          style={{ filter: `drop-shadow(${shadow})` }}
        >
          {percentage}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 18}
          textAnchor="middle"
          className="text-xs"
          fill="rgba(255,255,255,0.4)"
        >
          {label}
        </text>
      </svg>
    </div>
  );
}
