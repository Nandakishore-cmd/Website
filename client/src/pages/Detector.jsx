import { useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import ScoreGauge from '../components/ui/ScoreGauge';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useDetect } from '../hooks/useDetect';

export default function Detector() {
  const [text, setText] = useState('');
  const { data, loading, error, detect, reset } = useDetect();
  const [showBreakdown, setShowBreakdown] = useState(false);

  const handleAnalyze = () => {
    if (text.trim().length >= 50) {
      detect(text);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Search className="h-8 w-8 text-brand-600" />
          AI Detector
        </h1>
        <p className="mt-2 text-gray-500">Paste text below to analyze whether it was written by a human or AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <Card>
          <TextArea
            value={text}
            onChange={(e) => { setText(e.target.value); reset(); }}
            placeholder="Paste your text here (minimum 50 characters)..."
            minLength={50}
            rows={12}
            label="Text to analyze"
          />
          <div className="mt-4 flex gap-3">
            <Button onClick={handleAnalyze} loading={loading} disabled={text.trim().length < 50}>
              Analyze Text
            </Button>
            <Button variant="outline" onClick={() => { setText(''); reset(); }}>
              Clear
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {loading && (
            <Card className="flex flex-col items-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500">Analyzing text...</p>
            </Card>
          )}

          {data && !loading && (
            <>
              <Card className="text-center">
                <ScoreGauge score={data.score} />
                <div className="mt-4">
                  <Badge classification={data.classification} />
                  <p className="mt-2 text-sm text-gray-500">
                    Confidence: {Math.round(data.confidence * 100)}%
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Analysis Breakdown</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowBreakdown(!showBreakdown)}>
                    {showBreakdown ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {data.breakdown.statistical && (
                    <ProgressBar value={data.breakdown.statistical.composite} label="Statistical Analysis" />
                  )}
                  {data.breakdown.linguistic && (
                    <ProgressBar value={data.breakdown.linguistic.composite} label="Linguistic Analysis" />
                  )}
                  {data.breakdown.aiMeta ? (
                    <ProgressBar value={data.breakdown.aiMeta.composite} label={`AI Meta (${data.breakdown.aiMeta.provider})`} />
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">AI Meta Detection</span>
                      <span className="text-gray-400">Unavailable</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">ML Model</span>
                    <span className="text-gray-400">Coming soon</span>
                  </div>
                </div>

                {showBreakdown && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Effective Weights</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(data.effectiveWeights || {}).map(([key, val]) => (
                        <div key={key} className="flex justify-between bg-gray-50 px-3 py-1.5 rounded">
                          <span className="text-gray-600">{key}</span>
                          <span className="font-mono text-gray-900">{(val * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-400">
                      Processed in {data.metadata?.processingTimeMs}ms | {data.metadata?.wordCount} words
                    </div>
                  </div>
                )}
              </Card>
            </>
          )}

          {!data && !loading && (
            <Card className="text-center py-12">
              <Search className="h-12 w-12 text-gray-300 mx-auto" />
              <p className="mt-3 text-gray-400">Results will appear here</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
