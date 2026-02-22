import { Activity, Search, Code, Zap, Heart, TrendingUp } from 'lucide-react';

const TYPE_CONFIG = {
  scan: { icon: Search, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  found: { icon: Zap, color: 'text-green-400', bg: 'bg-green-500/10' },
  health: { icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  tune: { icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  accuracy: { icon: Activity, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  update: { icon: Code, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
};

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - new Date(timestamp)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function ActivityFeed({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-8 w-8 text-gray-600 mx-auto" />
        <p className="mt-2 text-sm text-gray-500">Waiting for agent activity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {events.map((event) => {
        const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.scan;
        const Icon = config.icon;

        return (
          <div
            key={event.id}
            className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors animate-fade-in"
          >
            <div className={`p-1.5 rounded-lg ${config.bg} flex-shrink-0`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-purple-300">{event.agent}</span>
                <span className="text-xs text-gray-600">{timeAgo(event.timestamp)}</span>
              </div>
              <p className="text-sm text-gray-300 mt-0.5 truncate">{event.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
