import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const handleManualSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextSessionId = sessionInput.trim();
    if (!nextSessionId) return;
    navigate(`/mentalhealth/result?sessionId=${encodeURIComponent(nextSessionId)}`);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">리포트 대시보드</h1>
          <p className="mt-1 text-sm text-slate-500">세션을 선택하면 바로 상담 리포트로 이동합니다.</p>
        </div>
        <Link to="/chat" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50">
          새 상담 시작
        </Link>
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
            리포트 보기
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800">세션 목록</h2>
        {isLoading && <p className="mt-3 text-sm text-slate-500">세션 목록을 불러오는 중...</p>}
        {error && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{error}</p>}

        <ul className="mt-4 space-y-2">
          {dedupedSessions.map((session) => (
            <li key={session.sessionId}>
              <Link
                to={`/mentalhealth/result?sessionId=${encodeURIComponent(session.sessionId)}`}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 transition hover:bg-slate-100"
              >
                <span className="font-medium text-slate-700">{session.sessionId}</span>
                <span className="text-xs text-slate-500">{formatDate(session.updatedAt ?? session.createdAt)}</span>
              </Link>
            </li>
          ))}
          {!isLoading && dedupedSessions.length === 0 && <li className="text-sm text-slate-500">표시할 세션이 없습니다.</li>}
        </ul>
      </section>
    </main>
  );
}
