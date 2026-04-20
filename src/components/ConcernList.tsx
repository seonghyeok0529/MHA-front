interface ConcernListProps {
  title?: string;
  items: string[];
  emptyText?: string;
}

export default function ConcernList({ title, items, emptyText = '항목이 없습니다.' }: ConcernListProps) {
  return (
    <div>
      {title && <h3 className="mb-2 text-sm font-semibold text-slate-700">{title}</h3>}
      {items.length ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}
