import { CLASSIFICATION_COLORS } from '../../utils/constants';

export default function Badge({ classification, className = '' }) {
  const colors = CLASSIFICATION_COLORS[classification] || CLASSIFICATION_COLORS.MIXED;
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${colors.bg} ${colors.text} ${colors.border} ${className}`}>
      {classification}
    </span>
  );
}
