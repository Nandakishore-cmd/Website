import { CheckCircle, XCircle, Clock } from 'lucide-react';
import Button from '../ui/Button';

const STATUS_STYLES = {
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  approved: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

export default function FindingsPanel({ proposals = [], onApprove, onReject }) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-gray-600 mx-auto" />
        <p className="mt-2 text-sm text-gray-500">No proposals yet. Agents will submit findings as they discover improvements.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {proposals.map((proposal) => {
        const status = STATUS_STYLES[proposal.status] || STATUS_STYLES.pending;
        const StatusIcon = status.icon;

        return (
          <div
            key={proposal.id}
            className={`p-4 rounded-xl bg-white/[0.02] border ${status.border} hover:bg-white/[0.04] transition-colors`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-purple-300">{proposal.agent}</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                    <StatusIcon className="h-3 w-3" />
                    {proposal.status}
                  </span>
                </div>
                <h4 className="font-medium text-gray-200">{proposal.description}</h4>
                {proposal.rationale && (
                  <p className="mt-1 text-sm text-gray-500">{proposal.rationale}</p>
                )}
                <p className="mt-2 text-xs text-gray-600">
                  {new Date(proposal.createdAt).toLocaleString()}
                </p>
              </div>
              {proposal.status === 'pending' && (
                <div className="flex gap-2 ml-4">
                  <Button size="sm" onClick={() => onApprove(proposal.id)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => onReject(proposal.id)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
