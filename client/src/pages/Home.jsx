import { Link } from 'react-router-dom';
import { Pen, Search, Bot, Shield, Zap, Lock, Cpu, Wifi } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import GradientText from '../components/ui/GradientText';

const features = [
  {
    icon: Search,
    title: 'AI Detector',
    description: '7-signal indigenous detection engine. Statistical, linguistic, stylometric, coherence, fingerprint analysis — all running on YOUR CPU.',
    link: '/detector',
    gradient: 'from-purple-500/20 to-purple-600/5',
    iconColor: 'text-purple-400',
  },
  {
    icon: Pen,
    title: 'AI Humanizer',
    description: 'Local transformer model + rule engine + self-verification loop. Beats every existing humanizer — no API keys needed.',
    link: '/humanizer',
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Bot,
    title: 'Agent Dashboard',
    description: 'Autonomous agents that research, monitor, and continuously improve detection accuracy with real-time activity feed.',
    link: '/agents',
    gradient: 'from-blue-500/20 to-blue-600/5',
    iconColor: 'text-blue-400',
  },
];

const stats = [
  { icon: Zap, label: '7-Signal Detection', value: '7 Analyzers' },
  { icon: Cpu, label: '100% Local CPU', value: 'Indigenous' },
  { icon: Lock, label: 'Zero API Keys', value: 'Offline Ready' },
  { icon: Wifi, label: 'No Internet', value: 'After Install' },
];

export default function Home() {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-36">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-8 animate-slide-up">
              <Cpu className="h-4 w-4" />
              100% Indigenous — Zero APIs — Runs on YOUR machine
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Write Smarter with{' '}
              <GradientText className="font-extrabold">SafeWrite.ai</GradientText>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Detect AI-generated text with 7-signal precision. Humanize content with a local transformer model.
              Everything runs on your CPU — no cloud, no API keys, no limits.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/detector">
                <GlowButton size="lg">
                  <Search className="h-5 w-5 mr-2" /> Try Detector
                </GlowButton>
              </Link>
              <Link to="/humanizer">
                <GlowButton size="lg" variant="outline">
                  <Pen className="h-5 w-5 mr-2" /> Try Humanizer
                </GlowButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 justify-center">
                <Icon className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-200">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Powerful <GradientText>Indigenous</GradientText> Tools
          </h2>
          <p className="mt-4 text-lg text-gray-400">Everything runs locally. No internet required after first install.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, link, gradient, iconColor }) => (
            <Link key={title} to={link}>
              <GlassCard glow className="h-full hover:border-purple-500/20 transition-all duration-300 group cursor-pointer">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-4`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
              </GlassCard>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
