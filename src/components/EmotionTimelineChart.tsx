import { EmotionalTimelinePoint } from '../types/report';

interface EmotionTimelineChartProps {
  points: EmotionalTimelinePoint[];
}

const chartWidth = 520;
const chartHeight = 180;
const padding = 18;

export default function EmotionTimelineChart({ points }: EmotionTimelineChartProps) {
  if (!points.length) {
    return <p className="text-sm text-slate-500">감정 타임라인 데이터가 없습니다.</p>;
  }

  const maxIntensity = Math.max(...points.map((point) => point.intensity), 1);
  const xStep = points.length === 1 ? chartWidth / 2 : (chartWidth - padding * 2) / (points.length - 1);

  const coordinates = points.map((point, index) => {
    const x = padding + index * xStep;
    const y = chartHeight - padding - (point.intensity / maxIntensity) * (chartHeight - padding * 2);
    return { ...point, x, y };
  });

  const linePath = coordinates.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x},${point.y}`).join(' ');

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white p-3">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label="감정 강도 타임라인" className="h-48 min-w-[460px] w-full">
          <defs>
            <linearGradient id="emotion-line" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>

          <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="1" />
          <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#cbd5e1" strokeWidth="1" />

          <path d={linePath} fill="none" stroke="url(#emotion-line)" strokeWidth="3" strokeLinecap="round" />
          {coordinates.map((point) => (
            <g key={`${point.step}-${point.emotion}`}>
              <circle cx={point.x} cy={point.y} r="4" fill="#0f766e" />
              <text x={point.x} y={chartHeight - 2} textAnchor="middle" fontSize="10" fill="#475569">
                {point.step}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {points.map((point) => (
          <li key={`${point.step}-${point.emotion}-meta`} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <span className="font-semibold">{point.step}단계</span> · {point.emotion} (강도 {point.intensity})
          </li>
        ))}
      </ul>
    </div>
  );
}
