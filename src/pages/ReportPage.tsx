import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ConcernList from '../components/ConcernList';
import EmotionTimeline from '../components/EmotionTimeline';
import ReportCard from '../components/ReportCard';
import SummaryBox from '../components/SummaryBox';
import { MentalHealthReport } from '../types/report';

const API_URL = import.meta.env.VITE_API_URL;
const RECENT_SESSION_KEY = 'mentalhealth:recentSessions';

function rememberSession(sessionId: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SESSION_KEY) ?? '[]') as string[];
    const next = [sessionId, ...parsed.filter((id) => id !== sessionId)].slice(0, 20);
    localStorage.setItem(RECENT_SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore localStorage parse errors
  }
}

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState<MentalHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const sessionId = useMemo(() => searchParams.get('sessionId')?.trim() ?? '', [searchParams]);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    const fetchReport = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}/api/mentalhealth/report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });

        if (!response.ok) {
          throw new Error('Report API error');
        }

        const data: MentalHealthReport = await response.json();

        if (isMounted) {
          setReport(data);
          rememberSession(sessionId);
        }
      } catch (requestError) {
        console.error(requestError);
        if (isMounted) {
          setError('리포트를 불러오지 못했습니다. 세션 ID를 확인한 뒤 다시 시도해주세요.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchReport();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">상담 리포트</h1>
          <p className="mt-1 text-sm text-slate-500">세션 요약과 감정 흐름을 한눈에 확인해보세요.</p>
        </div>
        <Link to="/dashboard" className="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
          대시보드로 이동
        </Link>
      </header>

      {!sessionId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          sessionId가 필요합니다. 예: <code>/mentalhealth/report?sessionId=abc123</code>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">리포트를 분석 중입니다...</p>}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {report && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ReportCard title="전체 요약" description="대화 전반의 핵심 흐름">
            <SummaryBox summary={report.summary} />
          </ReportCard>

          <ReportCard title="감정 흐름" description="대화 중 정서 변화 타임라인">
            <EmotionTimeline emotions={report.emotionalFlow} />
          </ReportCard>

          <ReportCard title="주요 고민" description="핵심 고민과 정리된 발화">
            <div className="space-y-4">
              <ConcernList title="고민 항목" items={report.concerns} emptyText="주요 고민이 비어 있습니다." />
              <ConcernList title="핵심 진술" items={report.keyStatements} emptyText="핵심 진술이 비어 있습니다." />
            </div>
          </ReportCard>

          <ReportCard title="관계 요소" description="대화 내 관계 관련 맥락">
            <ConcernList items={report.relationships} emptyText="관계 요소가 비어 있습니다." />
          </ReportCard>

          <div className="md:col-span-2">
            <ReportCard title="상담사 메모" description="다음 상담을 위한 참고 메모">
              <SummaryBox summary={report.notesForCounselor} />
            </ReportCard>
          </div>
        </div>
      )}
    </main>
  );
}
