export default function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div className={`bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] ${padding ? 'p-6' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}
