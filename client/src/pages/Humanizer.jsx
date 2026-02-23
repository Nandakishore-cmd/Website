import { useState } from 'react';
import { Pen, ArrowRight, Copy, Check, Cpu } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import GradientText from '../components/ui/GradientText';
import { useHumanize } from '../hooks/useHumanize';
import { STYLES, INTENSITIES } from '../utils/constants';

export default function Humanizer() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('natural');
  const [intensity, setIntensity] = useState('medium');
  const [copied, setCopied] = useState(false);
  const { data, loading, error, progress, humanize, reset } = useHumanize();

  const handleHumanize = () => {
    if (text.trim().length > 0) {
      humanize(text, { style, intensity });
    }
  };

  const handleCopy = async () => {
    if (data?.humanized) {
      await navigator.clipboard.writeText(data.humanized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Pen className="h-8 w-8 text-cyan-400" />
          AI <GradientText from="from-cyan-400" via="via-blue-400" to="to-purple-400">Humanizer</GradientText>
        </h1>
        <p className="mt-2 text-gray-400 flex items-center gap-2">
          <Cpu className="h-4 w-4" />
          Local transformer model + rule engine — 100% indigenous, no API keys.
        </p>
      </div>

      {/* Options */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Style</label>
            <div className="flex gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    style === s.value
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300 border border-white/[0.06]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Strength</label>
            <div className="flex gap-2">
              {INTENSITIES.map((i) => (
                <button
                  key={i.value}
                  onClick={() => setIntensity(i.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    intensity === i.value
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/20'
                      : 'bg-white/[0.05] text-gray-400 hover:bg-white/[0.08] hover:text-gray-300 border border-white/[0.06]'
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Input / Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-200 mb-3">Original Text</h3>
          <TextArea
            value={text}
            onChange={(e) => { setText(e.target.value); reset(); }}
            placeholder="Paste AI-generated text here — no limits..."
            rows={14}
          />
          <div className="mt-4">
            <Button onClick={handleHumanize} loading={loading} disabled={text.trim().length === 0}>
              <span className="flex items-center gap-2">
                Humanize <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-200">Humanized Text</h3>
            {data?.humanized && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-16">
              <LoadingSpinner size="lg" />
              {progress ? (
                <>
                  <p className="mt-4 text-gray-300 font-medium">{progress.detail}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Stage: {progress.stage} | {Math.round(progress.elapsed / 1000)}s elapsed
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-4 text-gray-400">Starting humanization...</p>
                  <p className="mt-1 text-xs text-gray-600">{intensity === 'heavy' ? 'Preparing self-verification loop...' : 'Initializing transforms...'}</p>
                </>
              )}
            </div>
          )}

          {data?.humanized && !loading && (
            <div className="bg-white/[0.03] rounded-xl p-4 min-h-[280px] border border-white/[0.06]">
              <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{data.humanized}</p>
              <div className="mt-4 pt-3 border-t border-white/[0.06] text-xs text-gray-500 flex flex-wrap gap-3">
                <span>Engine: {data.provider || 'indigenous'}</span>
                <span>Style: {data.style}</span>
                <span>Strength: {data.intensity}</span>
                {data.metadata?.processingTimeMs && <span>{data.metadata.processingTimeMs}ms</span>}
                {data.metadata?.selfVerification && (
                  <span className={data.metadata.selfVerification.passed ? 'text-green-400' : 'text-yellow-400'}>
                    Verification: {data.metadata.selfVerification.passed ? 'Passed' : `Score ${Math.round(data.metadata.selfVerification.score * 100)}%`}
                  </span>
                )}
              </div>
            </div>
          )}

          {!data && !loading && (
            <div className="flex flex-col items-center py-16 text-gray-600">
              <Pen className="h-12 w-12" />
              <p className="mt-3 text-gray-500">Humanized text will appear here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
