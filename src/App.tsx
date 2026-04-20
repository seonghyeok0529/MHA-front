import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ReportPage from './pages/ReportPage';

type Role = 'user' | 'assistant';

interface ChatMessage {
  id: number;
  role: Role;
  content: string;
}

interface ChatResponse {
  reply?: string;
  message?: string;
}

const API_URL = import.meta.env.VITE_API_URL;

function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-800 sm:text-4xl">사전 상담 대화</h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-calm-600">편하게 이야기해 주세요. 정답은 없습니다.</p>
      <Link
        to="/chat"
        className="mt-10 rounded-full bg-slate-700 px-7 py-3 text-base font-medium text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        대화 시작하기
      </Link>
    </main>
  );
}

function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      content: '안녕하세요. 오늘은 어떤 마음으로 이곳에 오셨는지, 편하게 이야기해 주세요.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const [typingSource, setTypingSource] = useState('');
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const createSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Session API error');
        }

        const data: { sessionId?: string } = await response.json();
        if (!data.sessionId) {
          throw new Error('Session ID missing');
        }

        if (isMounted) {
          setSessionId(data.sessionId);
        }
      } catch (sessionError) {
        console.error(sessionError);
        if (isMounted) {
          setError('세션을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
    };

    void createSession();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!typingSource) return;

    setTypedMessage('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedMessage(typingSource.slice(0, index));

      if (index >= typingSource.length) {
        window.clearInterval(timer);
        setTypedMessage('');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            content: typingSource,
          },
        ]);
        setTypingSource('');
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [typingSource]);

  const canSubmit = input.trim().length > 0 && !isLoading && !typingSource && Boolean(sessionId);

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;

    event.preventDefault();
    if (!canSubmit) return;

    event.currentTarget.form?.requestSubmit();
  };

  const visibleMessages = useMemo(() => {
    if (!typingSource || !typedMessage) return messages;
    return [...messages, { id: -1, role: 'assistant' as const, content: typedMessage }];
  }, [messages, typedMessage, typingSource]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;
    if (!sessionId) return;

    const userMessage = input.trim();
    setInput('');
    setError('');
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          messages: [
            ...messages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
            {
              role: 'user',
              content: userMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('API error');
      }

      const data: ChatResponse = await response.json();
      const assistantReply = data.reply ?? data.message ?? '이야기해 주셔서 감사합니다. 조금 더 들려주실 수 있을까요?';
      setTypingSource(assistantReply);
    } catch (requestError) {
      console.error(requestError);
      setError('잠시 문제가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">사전 상담 대화</h1>
        <p className="mt-2 text-sm leading-relaxed text-calm-600">평가하지 않는 대화 공간입니다. 떠오르는 이야기를 천천히 적어주세요.</p>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto rounded-2xl bg-white/70 p-4 sm:p-6">
        {visibleMessages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <article key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <p
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm sm:max-w-[70%] ${
                  isUser ? 'bg-slate-700 text-white' : 'bg-slate-100 text-calm-700'
                }`}
              >
                {message.content}
              </p>
            </article>
          );
        })}

        {isLoading && (
          <p className="text-sm text-calm-600" aria-live="polite">
            답장을 준비하고 있어요...
          </p>
        )}
      </section>

      <form onSubmit={sendMessage} className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <label htmlFor="message" className="mb-2 block text-sm text-calm-600">
          편하게, 생각나는 만큼만 적어주세요.
        </label>
        <textarea
          id="message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleTextareaKeyDown}
          rows={3}
          placeholder="예: 요즘 마음이 자주 무거워지는 느낌이 들어요..."
          className="w-full resize-none rounded-xl border border-slate-200 p-3 text-base leading-relaxed text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          disabled={isLoading || Boolean(typingSource)}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-calm-600">천천히 생각하고 작성하셔도 괜찮아요.</p>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-slate-700 px-5 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            보내기
          </button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {sessionId && <p className="mt-3 text-xs text-slate-500">세션 ID: {sessionId}</p>}
      </form>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
