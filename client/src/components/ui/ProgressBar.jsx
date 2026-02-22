export default function ProgressBar({ value, max = 1, label, showPercentage = true, className = '' }) {
  const percentage = Math.round((value / max) * 100);
  const getColor = (pct) => {
    if (pct < 35) return 'from-green-500 to-green-400';
    if (pct < 65) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  const getGlow = (pct) => {
    if (pct < 35) return 'shadow-green-500/30';
    if (pct < 65) return 'shadow-yellow-500/30';
    return 'shadow-red-500/30';
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-gray-300">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-white/[0.06] rounded-full h-2">
        <div
          className={`h-2 rounded-full bg-gradient-to-r ${getColor(percentage)} shadow-sm ${getGlow(percentage)} transition-all duration-700`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}
