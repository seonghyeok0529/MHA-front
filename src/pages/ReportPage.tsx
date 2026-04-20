import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmotionTimelineChart from '../components/EmotionTimelineChart';
import KeyStatementCard from '../components/KeyStatementCard';
import PatternTags from '../components/PatternTags';
import SuggestedQuestionList from '../components/SuggestedQuestionList';
import SummaryCard from '../components/SummaryCard';
import UserTypeBadge from '../components/UserTypeBadge';
import { MentalHealthReport } from '../types/report';

const API_URL = import.meta.env.VITE_API_URL;
const RECENT_SESSION_KEY = 'mentalhealth:recentSessions';
const NOTE_STORAGE_KEY = 'mentalhealth:counselorNotes';

function rememberSession(sessionId: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_SESSION_KEY) ?? '[]') as string[];
    const next = [sessionId, ...parsed.filter((id) => id !== sessionId)].slice(0, 20);
    localStorage.setItem(RECENT_SESSION_KEY, JSON.stringify(next));
  } catch {
    // ignore localStorage parse errors
  }
}

function loadSavedNote(sessionId: string) {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY) ?? '{}') as Record<string, string>;
    return parsed[sessionId] ?? '';
  } catch {
    return '';
  }
}

export default function ReportPage() {
  const [searchParams] = useSearchParams();
  const [report, setReport] = useState<MentalHealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
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
          setNotes(loadSavedNote(sessionId) || data.notesForCounselor || '');
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

  const handleSaveNotes = () => {
    if (!sessionId) return;

    try {
      const parsed = JSON.parse(localStorage.getItem(NOTE_STORAGE_KEY) ?? '{}') as Record<string, string>;
      parsed[sessionId] = notes;
      localStorage.setItem(NOTE_STORAGE_KEY, JSON.stringify(parsed));
      window.alert('상담사 노트를 저장했습니다.');
    } catch (storageError) {
      console.error(storageError);
      window.alert('노트 저장에 실패했습니다.');
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">상담 리포트</h1>
          <p className="mt-1 text-sm text-slate-500">요약, 패턴, 질문 제안을 기반으로 다음 상담 개입 포인트를 준비하세요.</p>
        </div>
        <Link to="/mentalhealth/dashboard" className="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
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
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <UserTypeBadge userType={report.userType} />
                <p className="text-xs text-slate-500">세션 ID: {sessionId}</p>
              </div>
              <SummaryCard summary={report.summary} title="핵심 요약" />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">감정 타임라인</h2>
                <p className="mt-1 text-sm text-slate-500">대화 단계별 감정 및 강도 변화</p>
                <div className="mt-4">
                  <EmotionTimelineChart points={report.emotionalTimeline} />
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">패턴 감지</h2>
                <p className="mt-1 text-sm text-slate-500">반복되는 감정/행동 패턴</p>
                <div className="mt-4">
                  <PatternTags patterns={report.patterns} />
                </div>
              </article>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">핵심 진술</h2>
              <p className="mt-1 text-sm text-slate-500">상담 개입에 바로 활용할 핵심 문장</p>
              {report.keyStatements.length ? (
                <div className="mt-4 grid gap-3">
                  {report.keyStatements.map((statement, index) => (
                    <KeyStatementCard key={`${statement}-${index}`} statement={statement} />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">핵심 진술이 비어 있습니다.</p>
              )}
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">주요 고민</h2>
                {report.concerns.length ? (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
                    {report.concerns.map((concern, index) => (
                      <li key={`${concern}-${index}`}>{concern}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">고민 항목이 없습니다.</p>
                )}
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-800">관계 맥락</h2>
                {report.relationships.length ? (
                  <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
                    {report.relationships.map((relationship, index) => (
                      <li key={`${relationship}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2">
                        {relationship}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">관계 요소가 없습니다.</p>
                )}
              </article>
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">추천 상담 질문</h2>
              <p className="mt-1 text-sm text-slate-500">클릭하면 클립보드로 복사됩니다.</p>
              <div className="mt-4">
                <SuggestedQuestionList questions={report.suggestedQuestions} />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">상담사 노트</h2>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={8}
                className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="다음 상담에서 다룰 포인트를 기록하세요."
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="mt-3 w-full rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                노트 저장
              </button>
            </section>
          </aside>
        </div>
      )}
    </main>
  );
}
