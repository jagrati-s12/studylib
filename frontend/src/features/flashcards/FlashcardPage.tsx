import { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  RotateCw,
  CheckCircle2,
  Award,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import type { Subject } from '@/types';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subjectName: string;
}

const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    question: 'What is KDD in Data Mining?',
    answer: 'Knowledge Discovery in Databases is the process of discovering useful knowledge from data. It includes data cleaning, integration, selection, transformation, data mining, pattern evaluation, and knowledge presentation.',
    subjectName: 'Data Mining',
  },
  {
    id: '2',
    question: 'Explain Gini Impurity in Decision Trees.',
    answer: 'Gini impurity measures how often a randomly chosen element from the set would be incorrectly labeled if it were randomly labeled according to the distribution of labels in the subset.',
    subjectName: 'Machine Learning',
  },
  {
    id: '3',
    question: 'What is the difference between Supervised and Unsupervised Learning?',
    answer: 'Supervised learning uses labeled data to train models to predict outcomes, whereas unsupervised learning uses unlabeled data to find hidden patterns or intrinsic structures.',
    subjectName: 'Machine Learning',
  },
  {
    id: '4',
    question: 'What is a Primary Key in Relational Databases?',
    answer: 'A primary key is a field (or combination of fields) that uniquely identifies each record in a database table. It cannot contain null values and must be unique.',
    subjectName: 'Database Systems',
  },
];

export default function FlashcardsPage() {
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'flashcards' | 'quiz'>('flashcards');

  // Quiz state
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    api.getSubjects().then(setSubjects);
  }, []);

  const filteredCards = SAMPLE_FLASHCARDS.filter((card) => {
    if (selectedSubjectId === 'all') return true;
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    return subj ? card.subjectName.toLowerCase().includes(subj.name.toLowerCase()) : true;
  });

  const currentCard = filteredCards[currentIndex] || SAMPLE_FLASHCARDS[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const quizQuestions = [
    {
      question: 'Which step comes first in the KDD process?',
      options: ['Data Mining', 'Data Cleaning & Integration', 'Pattern Evaluation', 'Knowledge Presentation'],
      correct: 1,
    },
    {
      question: 'What metric is commonly used in CART decision trees for splitting?',
      options: ['Mean Squared Error', 'Gini Impurity', 'Euclidean Distance', 'Cosine Similarity'],
      correct: 1,
    },
    {
      question: 'Which machine learning technique deals with reward and punishment?',
      options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Transfer Learning'],
      correct: 2,
    },
  ];

  const handleQuizAnswer = (questionIdx: number, optionIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIdx]: optionIdx }));
  };

  const submitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score += 1;
    });
    setQuizScore(score);
    setQuizCompleted(true);
  };

  return (
    <div
      className={`min-h-screen p-8 max-w-5xl mx-auto space-y-8 ${
        isDark ? 'bg-[#280B0F] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B46A72] text-white flex items-center justify-center shadow-md">
            <Brain size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold tracking-tight text-inherit">
                Flashcards & Quizzes
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B46A72]/20 text-[#B46A72] border border-[#B46A72]/30">
                v2.0 AI Ready
              </span>
            </div>
            <p className="text-sm opacity-70">
              Master your study materials with active recall flashcards and interactive practice tests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-1 rounded-xl flex items-center border ${isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]'}`}>
            <button
              onClick={() => { setMode('flashcards'); setQuizCompleted(false); }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'flashcards' ? 'bg-[#B46A72] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Flashcards
            </button>
            <button
              onClick={() => setMode('quiz')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'quiz' ? 'bg-[#B46A72] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Practice Quiz
            </button>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#C6B39A]' : 'bg-white border-[#F7C8D3] text-[#2D3A47]'
            }`}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {mode === 'flashcards' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs font-semibold opacity-70 px-2">
            <span>Subject: <strong className="text-inherit">{currentCard.subjectName}</strong></span>
            <span>Card {currentIndex + 1} of {filteredCards.length}</span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`w-full min-h-[320px] rounded-3xl border p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 shadow-lg relative overflow-hidden group ${
              isDark
                ? 'bg-[#3B1319]/70 border-[#7B694E]/40 hover:border-[#B46A72]'
                : 'bg-white border-[#F7C8D3] hover:border-[#B46A72] shadow-sm'
            }`}
          >
            <div className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full bg-[#B46A72]/20 text-[#B46A72]">
              {isFlipped ? 'Answer' : 'Question (Click to Flip)'}
            </div>

            <div className="my-auto space-y-4 max-w-xl">
              <p className="text-xl font-display font-semibold leading-relaxed">
                {isFlipped ? currentCard.answer : currentCard.question}
              </p>
            </div>

            <div className="absolute bottom-4 text-xs opacity-50 flex items-center gap-1.5">
              <RotateCw size={14} /> Click anywhere on card to flip
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handlePrev}
              className={`px-5 py-3 rounded-2xl border font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                isDark ? 'bg-[#3B1319] border-[#7B694E]/40 hover:bg-[#7B694E]/40' : 'bg-white border-[#F7C8D3] hover:bg-[#F7C8D3]/30'
              }`}
            >
              <ChevronLeft size={18} /> Previous Card
            </button>
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-2xl bg-[#B46A72] hover:bg-[#A05563] text-white font-semibold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Next Card</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {!quizCompleted ? (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#B46A72]/10 border border-[#B46A72]/30 flex items-center gap-3">
                <Sparkles size={20} className="text-[#B46A72]" />
                <p className="text-xs font-medium">
                  Answer all questions below to test your understanding of your indexed lecture notes.
                </p>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <div
                  key={qIdx}
                  className={`p-6 rounded-2xl border space-y-4 ${
                    isDark ? 'bg-[#3B1319]/60 border-[#7B694E]/40' : 'bg-white border-[#F7C8D3] shadow-sm'
                  }`}
                >
                  <h3 className="text-base font-display font-semibold">
                    {qIdx + 1}. {q.question}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedAnswers[qIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleQuizAnswer(qIdx, optIdx)}
                          className={`p-3.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#B46A72] text-white border-[#B46A72] shadow-sm font-semibold'
                              : isDark
                              ? 'bg-[#1F080C] border-[#3B1319] hover:bg-[#7B694E]/30 text-[#C6B39A]'
                              : 'bg-white border-slate-200 hover:bg-[#F7C8D3]/30 text-slate-700'
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle2 size={16} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={submitQuiz}
                  className="px-8 py-3 rounded-2xl bg-[#B46A72] hover:bg-[#A05563] text-white font-semibold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Award size={18} /> Submit Quiz & View Score
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`p-10 rounded-3xl border text-center space-y-6 ${
                isDark ? 'bg-[#3B1319]/70 border-[#7B694E]/40' : 'bg-white border-[#F7C8D3] shadow-md'
              }`}
            >
              <div className="w-20 h-20 rounded-full bg-[#B46A72]/20 text-[#B46A72] flex items-center justify-center mx-auto shadow-inner">
                <Award size={40} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-display font-bold">Quiz Completed!</h2>
                <p className="text-sm opacity-70">
                  You scored <strong className="text-inherit">{quizScore}</strong> out of <strong className="text-inherit">{quizQuestions.length}</strong> correct.
                </p>
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={() => { setQuizCompleted(false); setSelectedAnswers({}); }}
                  className="px-6 py-3 rounded-2xl bg-[#B46A72] text-white font-semibold text-sm hover:bg-[#A05563] shadow-md transition-all cursor-pointer"
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
