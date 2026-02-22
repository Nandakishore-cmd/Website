const CLASSIFICATION_STYLES = {
  HUMAN: 'bg-green-500/15 text-green-400 border-green-500/25 shadow-green-500/10',
  MIXED: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25 shadow-yellow-500/10',
  AI: 'bg-red-500/15 text-red-400 border-red-500/25 shadow-red-500/10',
};

export default function Badge({ classification, className = '' }) {
  const style = CLASSIFICATION_STYLES[classification] || CLASSIFICATION_STYLES.MIXED;
  return (
    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm ${style} ${className}`}>
      {classification}
    </span>
  );
}
