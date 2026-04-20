import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatternTags from '../components/PatternTags';
import UserTypeBadge from '../components/UserTypeBadge';
import { SessionListItem } from '../types/report';

const API_URL = import.meta.env.VITE_API_URL;
const RECENT_SESSION_KEY = 'mentalhealth:recentSessions';

function formatDate(value?: string) {
  if (!value) return '날짜 정보 없음';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionInput, setSessionInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const loadSessions = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_URL}/api/mentalhealth/sessions`);

        if (!response.ok) {
          throw new Error('Session list API error');
        }

        const data: { sessions?: SessionListItem[] } = await response.json();
        if (isMounted) {
          setSessions(data.sessions ?? []);
        }
      } catch (requestError) {
        console.error(requestError);

        try {
          const parsed = JSON.parse(localStorage.getItem(RECENT_SESSION_KEY) ?? '[]') as string[];
          if (isMounted) {
            setSessions(parsed.map((sessionId) => ({ sessionId })));
            setError('서버 세션 목록 대신 최근 조회 세션을 표시합니다.');
          }
        } catch {
          if (isMounted) {
            setError('세션 목록을 불러오지 못했습니다. sessionId를 직접 입력해주세요.');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSessions();

    return () => {
      isMounted = false;
    };
  }, []);

  const dedupedSessions = useMemo(() => {
    const seen = new Set<string>();
    return sessions.filter((session) => {
      if (!session.sessionId || seen.has(session.sessionId)) return false;
      seen.add(session.sessionId);
      return true;
    });
  }, [sessions]);

  const openReport = (sessionId: string) => {
    navigate(`/mentalhealth/report?sessionId=${encodeURIComponent(sessionId)}`);
  };

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSessionId = sessionInput.trim();
    if (!nextSessionId) return;
    openReport(nextSessionId);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-800">상담 의사결정 대시보드</h1>
        <p className="mt-2 text-sm text-slate-500">세션을 열어 핵심 요약·패턴·위험도를 빠르게 파악하고 바로 상담 질문을 준비하세요.</p>
      </header>

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">sessionId로 바로 이동</h2>
        <form onSubmit={handleManualSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={sessionInput}
            onChange={(event) => setSessionInput(event.target.value)}
            placeholder="예: 7f8e-xxxx"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button type="submit" className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800">
            리포트 열기
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">세션 목록</h2>
        {isLoading && <p className="mt-3 text-sm text-slate-500">세션 목록을 불러오는 중...</p>}
        {error && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}

        <ul className="mt-4 space-y-3">
          {dedupedSessions.map((session) => (
            <li key={session.sessionId}>
              <button
                type="button"
                onClick={() => openReport(session.sessionId)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-sky-200 hover:bg-sky-50/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-800">세션 {session.sessionId}</p>
                  <UserTypeBadge userType={session.userType} />
                </div>

                <p
                  className="mt-2 text-sm leading-relaxed text-slate-600"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {session.summary || '요약 정보가 없어 상세 리포트에서 확인이 필요합니다.'}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <PatternTags patterns={session.patterns ?? []} maxCount={2} />
                  <span className="text-xs text-slate-500">{formatDate(session.createdAt ?? session.updatedAt)}</span>
                </div>
              </button>
            </li>
          ))}
          {!isLoading && dedupedSessions.length === 0 && <li className="text-sm text-slate-500">표시할 세션이 없습니다.</li>}
        </ul>
      </section>
    </main>
  );
}
