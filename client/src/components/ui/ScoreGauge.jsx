import AnimatedGauge from './AnimatedGauge';

export default function ScoreGauge({ score, size = 180, label = 'AI Score' }) {
  return <AnimatedGauge score={score} size={size} label={label} />;
}
