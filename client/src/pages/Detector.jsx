import { useState } from 'react';
import { Search } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import ScoreGauge from '../components/ui/ScoreGauge';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import HighlightedText from '../components/ui/HighlightedText';
import GradientText from '../components/ui/GradientText';
import { useDetect } from '../hooks/useDetect';

const SIGNAL_LABELS = {
  statistical: 'Statistical Analysis',
  linguistic: 'Linguistic Analysis',
  sentenceLevel: 'Sentence-Level Analysis',
  stylometric: 'Stylometric Analysis',
  coherence: 'Coherence Analysis',
  fingerprint: 'AI Fingerprint Detection',
  readabilityForensics: 'Readability Forensics',
};

export default function Detector() {
  const [text, setText] = useState('');
  const { data, loading, error, detect, reset } = useDetect();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  const handleAnalyze = () => {
    if (text.trim().length > 0) {
      detect(text);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Search className="h-8 w-8 text-purple-400" />
          AI <GradientText>Detector</GradientText>
        </h1>
        <p className="mt-2 text-gray-400">7-signal indigenous analysis — runs 100% on your CPU, no API keys.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input */}
        <Card>
          <TextArea
            value={text}
            onChange={(e) => { setText(e.target.value); reset(); }}
            placeholder="Paste your text here — no character limits..."
            rows={14}
            label="Text to analyze"
          />
          <div className="mt-4 flex gap-3">
            <Button onClick={handleAnalyze} loading={loading} disabled={text.trim().length === 0}>
              Analyze Text
            </Button>
            <Button variant="ghost" onClick={() => { setText(''); reset(); }}>
              Clear
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {loading && (
            <Card className="flex flex-col items-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-400">Analyzing with 7 signals...</p>
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
                  {data.metadata?.signals && (
                    <p className="mt-1 text-xs text-gray-600">
                      {data.metadata.signals} signals | {data.metadata.processingTimeMs}ms | {data.metadata.wordCount} words
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-200">7-Signal Breakdown</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowBreakdown(!showBreakdown)}>
                    {showBreakdown ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>

                <div className="space-y-3">
                  {Object.entries(SIGNAL_LABELS).map(([key, label]) => {
                    const signal = data.breakdown?.[key];
                    if (!signal) return null;
                    return (
                      <ProgressBar key={key} value={signal.composite} label={label} />
                    );
                  })}
                </div>

                {showBreakdown && (
                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Effective Weights</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(data.effectiveWeights || {}).map(([key, val]) => (
                        <div key={key} className="flex justify-between bg-white/[0.03] px-3 py-1.5 rounded-lg">
                          <span className="text-gray-500">{key}</span>
                          <span className="font-mono text-gray-300">{(val * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Sentence highlighting */}
              {data.sentenceScores && data.sentenceScores.length > 0 && (
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-200">Sentence Highlighting</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowHighlight(!showHighlight)}>
                      {showHighlight ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showHighlight && (
                    <div className="text-sm leading-relaxed">
                      <HighlightedText sentenceScores={data.sentenceScores} />
                      <div className="mt-4 flex gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30" /> Human</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/30" /> Mixed</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30" /> AI</span>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {!data && !loading && (
            <Card className="text-center py-14">
              <Search className="h-12 w-12 text-gray-600 mx-auto" />
              <p className="mt-3 text-gray-500">Results will appear here</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
