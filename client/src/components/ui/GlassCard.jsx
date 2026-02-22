export default function GlassCard({ children, className = '', glow = false, ...props }) {
  return (
    <div
      className={`relative bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.08] shadow-lg ${
        glow ? 'shadow-purple-500/10' : ''
      } ${className}`}
      {...props}
    >
      {glow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 pointer-events-none" />
      )}
      <div className="relative p-6">{children}</div>
    </div>
  );
}
