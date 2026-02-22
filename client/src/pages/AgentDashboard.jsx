import { Bot, Activity, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAgents } from '../hooks/useAgents';

function StatusIndicator({ active }) {
  return (
    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-green-500' : 'bg-gray-300'}`} />
  );
}

const agentInfo = [
  { name: 'Research Agent', description: 'Monitors arXiv papers, GitHub repos, and web sources for AI detection advances', tasks: ['arXiv scraping', 'GitHub monitoring', 'Web scraping', 'Dataset collection'] },
  { name: 'Coding Agent', description: 'Tunes detection parameters, tracks accuracy, and proposes improvements', tasks: ['Health monitoring', 'Accuracy tracking', 'Parameter tuning', 'Pattern updating'] },
];

export default function AgentDashboard() {
  const { status, proposals, loading, error, approve, reject, refresh } = useAgents();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-center text-gray-500">Loading agent data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bot className="h-8 w-8 text-brand-600" />
            Agent Dashboard
          </h1>
          <p className="mt-2 text-gray-500">Monitor autonomous agents and review their proposals.</p>
        </div>
        <Button variant="outline" onClick={refresh}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <p className="text-sm text-yellow-800">Could not connect to agents: {error}</p>
        </Card>
      )}

      {/* Agent Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {agentInfo.map((agent) => (
          <Card key={agent.name}>
            <div className="flex items-center gap-3 mb-3">
              <StatusIndicator active={status?.agents?.length > 0} />
              <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">{agent.description}</p>
            <div className="space-y-2">
              {agent.tasks.map((task) => (
                <div key={task} className="flex items-center gap-2 text-sm text-gray-600">
                  <Activity className="h-3.5 w-3.5 text-gray-400" />
                  {task}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Proposals */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Proposals</h2>
      {proposals.length === 0 ? (
        <Card className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-3 text-gray-400">No proposals yet. Agents will submit proposals as they discover improvements.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <Card key={proposal.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-brand-600">{proposal.agent}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      proposal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      proposal.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{proposal.description}</h4>
                  {proposal.rationale && (
                    <p className="mt-1 text-sm text-gray-500">{proposal.rationale}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {new Date(proposal.createdAt).toLocaleString()}
                  </p>
                </div>
                {proposal.status === 'pending' && (
                  <div className="flex gap-2 ml-4">
                    <Button size="sm" onClick={() => approve(proposal.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(proposal.id)}>
                      <XCircle className="h-4 w-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
