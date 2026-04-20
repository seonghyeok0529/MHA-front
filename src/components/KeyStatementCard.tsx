interface KeyStatementCardProps {
  statement: string;
}

export default function KeyStatementCard({ statement }: KeyStatementCardProps) {
  return (
    <article className="rounded-xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm">
      <p className="text-sm leading-relaxed text-slate-700">“{statement}”</p>
    </article>
  );
}
