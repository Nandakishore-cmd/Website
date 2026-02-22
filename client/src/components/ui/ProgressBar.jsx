export default function ProgressBar({ value, max = 1, label, showPercentage = true, className = '' }) {
  const percentage = Math.round((value / max) * 100);
  const getColor = (pct) => {
    if (pct < 35) return 'bg-green-500';
    if (pct < 65) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1">
          {label && <span className="text-sm text-gray-600">{label}</span>}
          {showPercentage && <span className="text-sm font-medium text-gray-700">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getColor(percentage)}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}
