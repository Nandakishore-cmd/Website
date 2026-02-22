/**
 * Renders text with per-sentence color highlighting based on AI scores.
 * Green = human-like, Yellow = mixed, Red = AI-like
 */
export default function HighlightedText({ sentenceScores = [] }) {
  if (!sentenceScores || sentenceScores.length === 0) return null;

  const getColor = (score) => {
    if (score < 0.35) return 'bg-green-500/15 text-green-300 border-green-500/20';
    if (score < 0.65) return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/20';
    return 'bg-red-500/15 text-red-300 border-red-500/20';
  };

  return (
    <div className="space-y-1 leading-relaxed">
      {sentenceScores.map((item, i) => (
        <span
          key={i}
          className={`inline rounded px-1 py-0.5 border ${getColor(item.score)} transition-colors`}
          title={`AI Score: ${Math.round(item.score * 100)}%`}
        >
          {item.text}{' '}
        </span>
      ))}
    </div>
  );
}
