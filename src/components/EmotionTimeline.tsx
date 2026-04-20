interface EmotionTimelineProps {
  emotions: string[];
}

export default function EmotionTimeline({ emotions }: EmotionTimelineProps) {
  if (!emotions.length) {
    return <p className="text-sm text-slate-500">감정 흐름 데이터가 없습니다.</p>;
  }

  return (
    <ol className="space-y-3">
      {emotions.map((emotion, index) => (
        <li key={`${emotion}-${index}`} className="flex items-start gap-3">
          <span className="mt-1 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-sky-100 px-2 text-xs font-semibold text-sky-700">
            {index + 1}
          </span>
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{emotion}</div>
        </li>
      ))}
    </ol>
  );
}
