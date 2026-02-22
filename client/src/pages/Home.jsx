import { Link } from 'react-router-dom';
import { Pen, Search, Bot, Shield, Zap, Lock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const features = [
  {
    icon: Pen,
    title: 'AI Humanizer',
    description: 'Transform AI-generated text into natural, human-sounding content that bypasses detection.',
    link: '/humanizer',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    icon: Search,
    title: 'AI Detector',
    description: 'Advanced multi-signal detection engine combining statistical, linguistic, and AI-powered analysis.',
    link: '/detector',
    color: 'text-purple-600 bg-purple-100',
  },
  {
    icon: Bot,
    title: 'Agent Dashboard',
    description: 'Autonomous agents that research, monitor, and continuously improve detection accuracy.',
    link: '/agents',
    color: 'text-orange-600 bg-orange-100',
  },
];

const stats = [
  { icon: Zap, label: 'Multi-Signal Detection', value: '4 Analyzers' },
  { icon: Shield, label: 'Weighted Scoring', value: 'Adaptive' },
  { icon: Lock, label: 'Graceful Fallback', value: 'Always Available' },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Write Smarter with{' '}
              <span className="text-brand-200">SafeWrite.ai</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-brand-100 leading-relaxed">
              Detect AI-generated text with precision. Humanize content with style.
              Powered by advanced multi-signal analysis and autonomous improvement agents.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/detector">
                <Button size="lg" className="bg-white text-brand-700 hover:bg-brand-50 w-full sm:w-auto">
                  Try Detector
                </Button>
              </Link>
              <Link to="/humanizer">
                <Button size="lg" variant="outline" className="border-brand-300 text-white hover:bg-brand-700 w-full sm:w-auto">
                  Try Humanizer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 justify-center">
                <Icon className="h-5 w-5 text-brand-600" />
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Powerful Tools</h2>
          <p className="mt-3 text-lg text-gray-500">Everything you need for AI text analysis and transformation</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, description, link, color }) => (
            <Link key={title} to={link}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className={`inline-flex p-3 rounded-lg ${color} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500">{description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
