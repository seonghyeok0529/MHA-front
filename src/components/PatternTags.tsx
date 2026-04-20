interface PatternTagsProps {
  patterns: string[];
  maxCount?: number;
}

export default function PatternTags({ patterns, maxCount }: PatternTagsProps) {
  const visible = maxCount ? patterns.slice(0, maxCount) : patterns;

  if (!visible.length) {
    return <p className="text-sm text-slate-500">감지된 패턴이 없습니다.</p>;
  }

  return (
    <ul className="flex flex-wrap gap-2">
      {visible.map((pattern, index) => (
        <li key={`${pattern}-${index}`} className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 ring-1 ring-teal-100">
          {pattern}
        </li>
      ))}
    </ul>
  );
}
