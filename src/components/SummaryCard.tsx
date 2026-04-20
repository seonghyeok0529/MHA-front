interface SummaryCardProps {
  summary?: string;
  title?: string;
}

export default function SummaryCard({ summary, title = '대화 요약' }: SummaryCardProps) {
  return (
    <section className="rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-slate-700">{summary || '요약 정보가 없습니다.'}</p>
    </section>
  );
}
