// 魚種知識小測驗：隨機出題並即時顯示對錯與解說。
import { useState } from "react";
import type { FishQuizQuestion } from "../types/fishing";

interface QuizTestFormProps {
  questions: FishQuizQuestion[];
}

function shuffleQuestions(questions: FishQuizQuestion[]): FishQuizQuestion[] {
  const shuffledQuestions = [...questions];

  for (let index = shuffledQuestions.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledQuestions[index], shuffledQuestions[randomIndex]] = [
      shuffledQuestions[randomIndex],
      shuffledQuestions[index],
    ];
  }

  return shuffledQuestions;
}

export function QuizTestForm({ questions }: QuizTestFormProps) {
  const [shuffledQuestions] = useState(() => shuffleQuestions(questions));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [scorePulse, setScorePulse] = useState(false);
  const currentQuestion =
    shuffledQuestions[questionIndex % shuffledQuestions.length];

  const handleAnswer = (answer: string): void => {
    if (!currentQuestion || result) {
      return;
    }

    const answerIsCorrect = answer === currentQuestion.answer;
    setSelectedAnswer(answer);
    if (answerIsCorrect) {
      setScore((previousScore) => previousScore + 1);
      setScorePulse(true);
      window.setTimeout(() => setScorePulse(false), 700);
    }

    setIsCorrect(answerIsCorrect);
    setResult(
      answerIsCorrect
        ? `答對：${currentQuestion.explain}`
        : `答錯：正確答案是「${currentQuestion.answer}」。${currentQuestion.explain}`,
    );
  };

  const goToNextQuestion = (): void => {
    setQuestionIndex((previousIndex) => previousIndex + 1);
    setResult("");
    setIsCorrect(null);
    setSelectedAnswer(null);
  };

  return (
    <article className="rounded-3xl border border-sky-200/20 bg-gradient-to-br from-cyan-500/14 via-sky-400/6 to-slate-900/14 p-6 backdrop-blur-md sm:p-8">
      <h3 className="font-display text-xl text-amber-100">魚種小測驗</h3>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-cyan-100">
          Q{(questionIndex % shuffledQuestions.length) + 1}
          <span className="ml-3 text-sm text-slate-400">
            ({(questionIndex % shuffledQuestions.length) + 1}/
            {shuffledQuestions.length})
          </span>
        </p>

        <p className="mt-6 text-slate-100">{currentQuestion.question}</p>
        <div className="mt-8 grid gap-4">
          {currentQuestion.options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <span
                className={`w-5 shrink-0 text-center ${result && selectedAnswer === option ? (isCorrect ? "text-green-400" : "text-red-400") : ""}`}
                aria-hidden="true"
              >
                {result && selectedAnswer === option
                  ? isCorrect
                    ? "✔︎"
                    : "✖︎"
                  : ""}
              </span>
              <button
                type="button"
                onClick={() => handleAnswer(option)}
                disabled={Boolean(result)}
                className={`flex-1 rounded-xl border px-3 py-2 text-left text-sm transition hover:bg-cyan-200/10 disabled:cursor-not-allowed ${selectedAnswer === option ? "border-cyan-200/50 bg-cyan-200/15 text-cyan-200" : `border-white/15 ${result ? "opacity-60" : ""}`}`}
              >
                {option}
              </button>
            </div>
          ))}
        </div>
        {result ? (
          <p
            className={`mt-7 text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}
          >
            {result}
          </p>
        ) : null}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`text-sm text-slate-300 ${scorePulse ? "score-pulse" : ""}`}
            >
              累積答對 {score} 題
            </span>
          </div>
          <button
            type="button"
            onClick={goToNextQuestion}
            className="rounded-full border border-cyan-200/30 px-3 py-1.5 text-sm text-cyan-100 transition hover:bg-cyan-200/10"
          >
            下一題
          </button>
        </div>
      </div>
    </article>
  );
}
