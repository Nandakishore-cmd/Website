export default function GradientText({ children, className = '', from = 'from-purple-400', via = 'via-cyan-400', to = 'to-blue-400' }) {
  return (
    <span className={`bg-gradient-to-r ${from} ${via} ${to} bg-clip-text text-transparent ${className}`}>
      {children}
    </span>
  );
}
