import { useState } from 'react';
import { Pen, ArrowRight, Copy, Check } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useHumanize } from '../hooks/useHumanize';
import { STYLES, INTENSITIES } from '../utils/constants';

export default function Humanizer() {
  const [text, setText] = useState('');
  const [style, setStyle] = useState('natural');
  const [intensity, setIntensity] = useState('medium');
  const [copied, setCopied] = useState(false);
  const { data, loading, error, humanize, reset } = useHumanize();

  const handleHumanize = () => {
    if (text.trim().length >= 50) {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Pen className="h-8 w-8 text-brand-600" />
          AI Humanizer
        </h1>
        <p className="mt-2 text-gray-500">Transform AI-generated text into natural, human-sounding content.</p>
      </div>

      {/* Options */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
            <div className="flex gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    style === s.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Intensity</label>
            <div className="flex gap-2">
              {INTENSITIES.map((i) => (
                <button
                  key={i.value}
                  onClick={() => setIntensity(i.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    intensity === i.value
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <h3 className="font-semibold text-gray-900 mb-3">Original Text</h3>
          <TextArea
            value={text}
            onChange={(e) => { setText(e.target.value); reset(); }}
            placeholder="Paste AI-generated text here (minimum 50 characters)..."
            minLength={50}
            rows={14}
          />
          <div className="mt-4">
            <Button onClick={handleHumanize} loading={loading} disabled={text.trim().length < 50}>
              <span className="flex items-center gap-2">
                Humanize <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-900">Humanized Text</h3>
            {data?.humanized && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-16">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-500">Humanizing your text...</p>
            </div>
          )}

          {data?.humanized && !loading && (
            <div className="bg-gray-50 rounded-lg p-4 min-h-[280px]">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{data.humanized}</p>
              <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-400">
                Provider: {data.provider} | Style: {data.style} | Intensity: {data.intensity}
              </div>
            </div>
          )}

          {!data && !loading && (
            <div className="flex flex-col items-center py-16 text-gray-300">
              <Pen className="h-12 w-12" />
              <p className="mt-3 text-gray-400">Humanized text will appear here</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
