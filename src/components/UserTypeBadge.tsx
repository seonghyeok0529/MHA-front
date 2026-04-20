import { UserType } from '../types/report';

interface UserTypeBadgeProps {
  userType?: UserType;
}

const typeStyles: Record<UserType, { label: string; className: string }> = {
  low: {
    label: '낮음',
    className: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  },
  medium: {
    label: '중간',
    className: 'bg-sky-100 text-sky-700 ring-sky-200',
  },
  high: {
    label: '높음',
    className: 'bg-amber-100 text-amber-700 ring-amber-200',
  },
};

export default function UserTypeBadge({ userType }: UserTypeBadgeProps) {
  if (!userType) {
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">미분류</span>;
  }

  const style = typeStyles[userType];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${style.className}`}>
      위험도 {style.label}
    </span>
  );
}
