import { PropsWithChildren } from 'react';

interface ReportCardProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export default function ReportCard({ title, description, children }: ReportCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </header>
      {children}
    </section>
  );
}
