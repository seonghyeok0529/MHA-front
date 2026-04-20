interface SummaryBoxProps {
  summary: string;
}

export default function SummaryBox({ summary }: SummaryBoxProps) {
  return (
    <div className="rounded-xl bg-emerald-50/70 p-4 text-[15px] leading-relaxed text-slate-700">
      {summary || '요약 정보가 없습니다.'}
    </div>
  );
}
