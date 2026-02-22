import { Activity } from 'lucide-react';

export default function AgentStatusCard({ name, description, tasks = [], active = false }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.08] p-6 hover:border-purple-500/15 transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <span className={`inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-green-400 shadow-sm shadow-green-400/50 animate-pulse' : 'bg-gray-600'}`} />
        <h3 className="font-semibold text-white">{name}</h3>
      </div>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task} className="flex items-center gap-2 text-sm text-gray-500">
            <Activity className="h-3.5 w-3.5 text-gray-600" />
            {task}
          </div>
        ))}
      </div>
    </div>
  );
}
