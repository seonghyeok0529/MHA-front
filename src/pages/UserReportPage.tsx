import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ConcernList from '../components/ConcernList';
import ReportCard from '../components/ReportCard';
import SummaryBox from '../components/SummaryBox';
import { fetchDualReports } from '../lib/reportApi';
import { UserReport } from '../types/report';

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

export default function UserReportPage() {
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState<UserReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const sessionId = useMemo(() => searchParams.get('sessionId')?.trim() ?? '', [searchParams]);

  useEffect(() => {
    if (!sessionId) return;

    let isMounted = true;

    const loadReport = async () => {
      setIsLoading(true);
      setError('');

      try {
        const data = await fetchDualReports(sessionId);

        if (isMounted) {
          setReport(data.userReport);
          rememberSession(sessionId);
        }
      } catch (requestError) {
        console.error(requestError);
        if (isMounted) {
          setError('결과 리포트를 불러오지 못했습니다. sessionId를 확인한 뒤 다시 시도해주세요.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">나를 이해하는 리포트</h1>
          <p className="mt-1 text-sm text-slate-500">내 마음의 흐름을 부드럽게 정리한 결과입니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/mentalhealth/report?sessionId=${encodeURIComponent(sessionId)}`}
            className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
          >
            전문가용 보기
          </Link>
          <Link to="/dashboard" className="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            대시보드
          </Link>
        </div>
      </header>

      {!sessionId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          sessionId가 필요합니다. 예: <code>/mentalhealth/result?sessionId=abc123</code>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">당신의 리포트를 정리하고 있어요...</p>}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {report && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ReportCard title="한 줄 요약" description="지금의 마음을 가장 잘 보여주는 문장">
            <SummaryBox summary={report.summaryLine} />
          </ReportCard>

          <ReportCard title="지금 중요한 주제" description="대화에서 자주 드러난 핵심 이야기">
            <ConcernList items={report.keyTopics} emptyText="정리된 주제가 아직 없습니다." />
          </ReportCard>

          <ReportCard title="감정" description="대화에서 표현된 감정의 결">
            <ConcernList items={report.emotions} emptyText="표현된 감정이 아직 없습니다." />
          </ReportCard>

          <ReportCard title="생활의 변화" description="최근에 달라졌다고 언급된 부분">
            <ConcernList items={report.lifeChanges} emptyText="생활 변화 내용이 아직 없습니다." />
          </ReportCard>

          <ReportCard title="버거움" description="힘들거나 부담으로 느껴진 지점">
            <ConcernList items={report.burdens} emptyText="버거움으로 정리된 내용이 없습니다." />
          </ReportCard>

          <ReportCard title="지지 자원" description="버팀목이 되었던 사람·환경·습관">
            <ConcernList items={report.supports} emptyText="지지 자원 정보가 없습니다." />
          </ReportCard>

          <div className="md:col-span-2">
            <ReportCard title="다음 대화에서 다루면 좋은 주제" description="다음 상담에서 꺼내볼 수 있는 이야기">
              <ConcernList items={report.nextConversationTopics} emptyText="다음 대화 주제가 아직 없습니다." />
            </ReportCard>
          </div>
        </div>
      )}
    </main>
  );
}
