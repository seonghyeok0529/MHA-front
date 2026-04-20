import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ConcernList from '../components/ConcernList';
import ReportCard from '../components/ReportCard';
import SummaryBox from '../components/SummaryBox';
import { fetchDualReports } from '../lib/reportApi';
import { ProfessionalReport } from '../types/report';

export default function ProfessionalReportPage() {
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState<ProfessionalReport | null>(null);
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
          setReport(data.professionalReport);
        }
      } catch (requestError) {
        console.error(requestError);
        if (isMounted) {
          setError('전문가 리포트를 불러오지 못했습니다. sessionId를 확인한 뒤 다시 시도해주세요.');
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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">전문가 사전 요약 리포트</h1>
          <p className="mt-1 text-sm text-slate-500">사실 기반으로 구조화된 상담 전 참고 정보입니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/mentalhealth/result?sessionId=${encodeURIComponent(sessionId)}`}
            className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
          >
            사용자용 보기
          </Link>
          <Link to="/dashboard" className="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            대시보드
          </Link>
        </div>
      </header>

      {!sessionId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
          sessionId가 필요합니다. 예: <code>/mentalhealth/report?sessionId=abc123</code>
        </div>
      )}

      {isLoading && <p className="text-sm text-slate-500">전문가용 리포트를 구성하고 있습니다...</p>}
      {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      {report && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <ReportCard title="Chief Complaints" description="반복 언급된 주된 어려움">
            <ConcernList items={report.chiefComplaints} emptyText="주요 호소 내용이 없습니다." />
          </ReportCard>

          <ReportCard title="Emotional Patterns" description="대화에서 관찰된 정서 표현 패턴">
            <ConcernList items={report.emotionalPatterns} emptyText="정서 패턴이 없습니다." />
          </ReportCard>

          <ReportCard title="Functional Changes" description="수면·업무·학업·일상 기능 관련 변화">
            <ConcernList items={report.functionalChanges} emptyText="기능 변화 정보가 없습니다." />
          </ReportCard>

          <ReportCard title="Environmental Factors" description="관계/환경 문맥에서 등장한 요인">
            <ConcernList items={report.environmentalFactors} emptyText="환경 요인 정보가 없습니다." />
          </ReportCard>

          <ReportCard title="Conversation Patterns" description="표현 방식/반복 주제 등 대화 형태 정보">
            <ConcernList items={report.conversationPatterns} emptyText="대화 패턴 정보가 없습니다." />
          </ReportCard>

          <ReportCard title="Follow-up Questions" description="초기 면담 시 확인이 필요한 질문 목록">
            <ConcernList items={report.followUpQuestions} emptyText="후속 질문 목록이 없습니다." />
          </ReportCard>

          <div className="md:col-span-2">
            <ReportCard title="Notes" description="기타 메모 (해석/진단 제외)">
              <SummaryBox summary={report.notes} />
            </ReportCard>
          </div>
        </div>
      )}
    </main>
  );
}
