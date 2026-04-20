interface SuggestedQuestionListProps {
  questions: string[];
}

export default function SuggestedQuestionList({ questions }: SuggestedQuestionListProps) {
  const copyQuestion = async (question: string) => {
    try {
      await navigator.clipboard.writeText(question);
    } catch (error) {
      console.error(error);
      window.alert('클립보드 복사에 실패했습니다. 직접 선택해 복사해주세요.');
    }
  };

  if (!questions.length) {
    return <p className="text-sm text-slate-500">추천 질문이 없습니다.</p>;
  }

  return (
    <ul className="space-y-2">
      {questions.slice(0, 5).map((question, index) => (
        <li key={`${question}-${index}`}>
          <button
            type="button"
            onClick={() => void copyQuestion(question)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-sky-200 hover:bg-sky-50"
            title="클릭하면 질문이 복사됩니다"
          >
            Q{index + 1}. {question}
          </button>
        </li>
      ))}
    </ul>
  );
}
