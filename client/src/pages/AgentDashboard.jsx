import { Bot, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import GradientText from '../components/ui/GradientText';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ActivityFeed from '../components/agents/ActivityFeed';
import AgentStatusCard from '../components/agents/AgentStatusCard';
import FindingsPanel from '../components/agents/FindingsPanel';
import { useAgents } from '../hooks/useAgents';
import { useAgentStream } from '../hooks/useAgentStream';

const agentInfo = [
  {
    name: 'Research Agent',
    description: 'Monitors arXiv papers, GitHub repos, and web sources for AI detection advances',
    tasks: ['arXiv paper scraping', 'GitHub monitoring', 'Web scraping', 'Dataset collection'],
  },
  {
    name: 'Coding Agent',
    description: 'Tunes detection parameters, tracks accuracy, and proposes improvements',
    tasks: ['Health monitoring', 'Accuracy tracking', 'Parameter tuning', 'Pattern updating'],
  },
];

export default function AgentDashboard() {
  const { proposals, loading, error, approve, reject, refresh } = useAgents();
  const { events, connected } = useAgentStream();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-500">Loading agent data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-400" />
            Agent <GradientText from="from-blue-400" via="via-purple-400" to="to-cyan-400">Dashboard</GradientText>
          </h1>
          <p className="mt-2 text-gray-400 flex items-center gap-2">
            {connected ? (
              <><Wifi className="h-4 w-4 text-green-400" /> Live — SSE connected</>
            ) : (
              <><WifiOff className="h-4 w-4 text-yellow-400" /> Reconnecting...</>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-yellow-500/20">
          <p className="text-sm text-yellow-400">Could not connect to agents: {error}</p>
        </Card>
      )}

      {/* Agent Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {agentInfo.map((agent) => (
          <AgentStatusCard
            key={agent.name}
            name={agent.name}
            description={agent.description}
            tasks={agent.tasks}
            active={connected}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Activity Feed */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            Live Activity
            {connected && <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />}
          </h2>
          <Card>
            <ActivityFeed events={events} />
          </Card>
        </div>

        {/* Proposals */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Proposals</h2>
          <Card>
            <FindingsPanel proposals={proposals} onApprove={approve} onReject={reject} />
          </Card>
        </div>
      </div>
    </div>
  );
}
