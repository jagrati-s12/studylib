import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  BookMarked,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bookmark,
  RotateCcw,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Filter,
  Search,
  BookOpen,
  Award
} from 'lucide-react';

export default function QuestionBankPage() {
  const { isDark } = useTheme();

  // Mock questions for Question Bank & Mistake Notebook
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      subject: 'Data Mining',
      topic: 'Classification Algorithms',
      question: 'Which of the following splitting criteria is used in standard C4.5 Decision Trees instead of Gini Impurity?',
      options: [
        'Information Gain Ratio',
        'Mean Squared Error',
        'Euclidean Distance',
        'Chi-Square Statistics'
      ],
      correctAnswer: 0,
      explanation: 'C4.5 uses Information Gain Ratio to overcome the bias of Information Gain toward multivalued attributes.',
      userAnswer: 1, // incorrect
      isBookmarked: true,
      isMistake: true,
      status: 'incorrect'
    },
    {
      id: 'q-2',
      subject: 'Machine Learning',
      topic: 'Neural Networks & Gradient Descent',
      question: 'What is the primary purpose of adding L2 Regularization (Weight Decay) to a loss function?',
      options: [
        'To speed up training convergence time',
        'To penalize large weights and prevent overfitting',
        'To eliminate the need for a learning rate',
        'To automatically drop dead neurons'
      ],
      correctAnswer: 1,
      explanation: 'L2 regularization adds a penalty proportional to the sum of squared weights, discouraging complex models and preventing overfitting.',
      userAnswer: 1, // correct
      isBookmarked: false,
      isMistake: false,
      status: 'correct'
    },
    {
      id: 'q-3',
      subject: 'Database Systems',
      topic: 'Query Optimization & Indexing',
      question: 'Which B+ Tree property ensures efficient range queries compared to standard Hash Indexes?',
      options: [
        'Keys are stored in sorted order with leaf node pointers',
        'Every node has an equal number of children',
        'Search time is always O(1) constant time',
        'Nodes never split during insertions'
      ],
      correctAnswer: 0,
      explanation: 'B+ trees link leaf nodes sequentially in sorted order, enabling rapid sequential range scans.',
      userAnswer: 2, // incorrect
      isBookmarked: true,
      isMistake: true,
      status: 'incorrect'
    },
    {
      id: 'q-4',
      subject: 'Operating Systems',
      topic: 'Process Scheduling & Synchronization',
      question: 'Which scheduling algorithm can suffer from the "convoy effect" where short processes wait behind a long CPU-bound process?',
      options: [
        'Shortest Job First (SJF)',
        'First-Come, First-Served (FCFS)',
        'Round Robin (RR)',
        'Multilevel Feedback Queue'
      ],
      correctAnswer: 1,
      explanation: 'FCFS suffers from the convoy effect when a CPU-bound job arrives first.',
      userAnswer: 1, // correct
      isBookmarked: false,
      isMistake: false,
      status: 'correct'
    }
  ]);

  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'mistakes' | 'bookmarked'
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['All', 'Data Mining', 'Machine Learning', 'Database Systems', 'Operating Systems'];

  const filteredQuestions = questions.filter(q => {
    const matchesSubject = selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase()) || q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'mistakes') return matchesSubject && matchesSearch && q.isMistake;
    if (activeTab === 'bookmarked') return matchesSubject && matchesSearch && q.isBookmarked;
    return matchesSubject && matchesSearch;
  });

  const currentQ = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (idx) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    const isCorrect = idx === currentQ.correctAnswer;
    setQuestions(prev => prev.map(q => {
      if (q.id === currentQ.id) {
        return {
          ...q,
          userAnswer: idx,
          status: isCorrect ? 'correct' : 'incorrect',
          isMistake: !isCorrect ? true : q.isMistake
        };
      }
      return q;
    }));
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setCurrentIndex(prev => (prev + 1) % filteredQuestions.length);
  };

  const toggleBookmark = (qId) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, isBookmarked: !q.isBookmarked } : q));
  };

  const removeMistake = (qId) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, isMistake: false } : q));
  };

  const mistakeCount = questions.filter(q => q.isMistake).length;
  const bookmarkedCount = questions.filter(q => q.isBookmarked).length;

  return (
    <div className={`flex-1 min-h-screen p-8 transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'}`}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1 text-[#B46A72]">
            <BookMarked size={16} />
            <span>Interactive Assessment</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Question Bank & Mistake Notebook</h1>
          <p className="text-sm opacity-70 mt-1">Practice MCQs, review incorrect answers in your Mistake Notebook, and master concepts.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-black/5 p-1 rounded-2xl border border-inherit">
          <button
            onClick={() => { setActiveTab('practice'); setCurrentIndex(0); setSelectedOption(null); setShowExplanation(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'practice'
                ? 'bg-[#B46A72] text-white shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            Practice Quiz
          </button>
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'mistakes'
                ? 'bg-[#B46A72] text-white shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span>Mistakes Notebook</span>
            <span className="w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center font-bold">{mistakeCount}</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarked')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'bookmarked'
                ? 'bg-[#B46A72] text-white shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
          >
            <span>Saved ({bookmarkedCount})</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-60 mr-2 flex items-center gap-1">
          <Filter size={14} /> Subject:
        </span>
        {subjects.map(subj => (
          <button
            key={subj}
            onClick={() => { setSelectedSubject(subj); setCurrentIndex(0); setSelectedOption(null); setShowExplanation(false); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              selectedSubject === subj
                ? 'bg-[#B46A72] text-white border-[#B46A72] shadow-sm'
                : isDark
                  ? 'bg-[#280B0F] border-[#3B1319] text-[#C6B39A] hover:bg-[#3B1319]'
                  : 'bg-white border-[#F7C8D3] text-[#2D3A47] hover:bg-[#FFF5F6]'
            }`}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Main View Area */}
      {activeTab === 'practice' ? (
        filteredQuestions.length === 0 ? (
          <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'}`}>
            <BookOpen size={40} className="mx-auto mb-3 opacity-40 text-[#B46A72]" />
            <h3 className="font-bold text-lg mb-1">No questions found</h3>
            <p className="text-sm opacity-70">Try selecting another subject or filter.</p>
          </div>
        ) : (
          <div className={`max-w-3xl mx-auto rounded-3xl border p-8 shadow-xl ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'}`}>

            {/* Question Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-inherit">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#B46A72]/10 text-[#B46A72] border border-[#B46A72]/30">
                  {currentQ.subject}
                </span>
                <span className="text-xs opacity-60 font-medium">{currentQ.topic}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold opacity-70">
                  Question {currentIndex + 1} of {filteredQuestions.length}
                </span>
                <button
                  onClick={() => toggleBookmark(currentQ.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    currentQ.isBookmarked
                      ? 'bg-[#B46A72] text-white'
                      : isDark ? 'bg-[#3B1319] text-[#C6B39A]' : 'bg-[#F7C8D3]/40 text-[#2D3A47]'
                  }`}
                  title="Bookmark question"
                >
                  <Bookmark size={16} />
                </button>
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-xl font-display font-bold mb-6 leading-relaxed">
              {currentQ.question}
            </h2>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = isDark ? 'bg-[#1E080C] border-[#3B1319] text-[#C6B39A]' : 'bg-[#FFF5F6]/60 border-[#F7C8D3] text-[#2D3A47]';

                if (showExplanation) {
                  if (idx === currentQ.correctAnswer) {
                    btnStyle = 'bg-[#6B7C50]/20 border-[#6B7C50] text-[#6B7C50] font-semibold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-[#B46A72]/20 border-[#B46A72] text-[#B46A72] line-through';
                  }
                } else if (selectedOption === idx) {
                  btnStyle = 'bg-[#B46A72] text-white border-[#B46A72]';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between font-medium text-sm ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
                        showExplanation && idx === currentQ.correctAnswer
                          ? 'bg-[#6B7C50] text-white border-[#6B7C50]'
                          : 'border-inherit opacity-70'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>

                    {showExplanation && idx === currentQ.correctAnswer && (
                      <CheckCircle2 size={18} className="text-[#6B7C50]" />
                    )}
                    {showExplanation && idx === selectedOption && idx !== currentQ.correctAnswer && (
                      <XCircle size={18} className="text-[#B46A72]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation Box */}
            {showExplanation && (
              <div className={`p-5 rounded-2xl border mb-6 animate-fadeIn ${
                selectedOption === currentQ.correctAnswer
                  ? isDark ? 'bg-[#6B7C50]/10 border-[#6B7C50]/30' : 'bg-[#6B7C50]/10 border-[#6B7C50]/30'
                  : isDark ? 'bg-[#3B1319]/50 border-[#B46A72]/40' : 'bg-[#B46A72]/10 border-[#B46A72]/30'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Sparkles size={16} className={selectedOption === currentQ.correctAnswer ? 'text-[#6B7C50]' : 'text-[#B46A72]'} />
                  <span>{selectedOption === currentQ.correctAnswer ? 'Correct!' : 'Incorrect. Explanation:'}</span>
                </div>
                <p className="text-sm opacity-90 leading-relaxed">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Button */}
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                disabled={!showExplanation}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
                  showExplanation
                    ? 'bg-[#B46A72] text-white shadow-md hover:bg-[#9f5960]'
                    : 'bg-black/10 opacity-40 cursor-not-allowed'
                }`}
              >
                <span>Next Question</span>
                <ArrowRight size={16} />
              </button>
            </div>

          </div>
        )
      ) : (
        /* Mistake Notebook & Saved List */
        <div className="space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-lg">
              {activeTab === 'mistakes' ? 'Mistake Notebook (Review & Master)' : 'Bookmarked Questions'}
            </h3>
            <span className="text-xs opacity-60 font-medium">
              {filteredQuestions.length} items found
            </span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className={`p-12 text-center rounded-2xl border ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'}`}>
              <Award size={40} className="mx-auto mb-3 opacity-40 text-[#6B7C50]" />
              <h3 className="font-bold text-lg mb-1">No items here!</h3>
              <p className="text-sm opacity-70">You're doing fantastic. Keep practicing to maintain zero mistakes.</p>
            </div>
          ) : (
            filteredQuestions.map(q => (
              <div
                key={q.id}
                className={`p-6 rounded-2xl border space-y-4 transition-all ${
                  isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#B46A72]/10 text-[#B46A72]">
                      {q.subject}
                    </span>
                    <span className="text-xs opacity-60">{q.topic}</span>
                  </div>

                  {activeTab === 'mistakes' && (
                    <button
                      onClick={() => removeMistake(q.id)}
                      className="text-xs font-semibold text-[#6B7C50] hover:underline flex items-center gap-1"
                    >
                      <Check size={14} /> Mark as Mastered
                    </button>
                  )}
                </div>

                <h4 className="font-display font-bold text-base">{q.question}</h4>

                <div className={`p-4 rounded-xl border text-sm ${
                  isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-[#FFF5F6]/50 border-[#F7C8D3]/50'
                }`}>
                  <p className="font-semibold text-[#B46A72] mb-1">Correct Answer:</p>
                  <p className="opacity-90">{q.options[q.correctAnswer]}</p>
                  <p className="font-semibold text-[#6B7C50] mt-3 mb-1">Explanation:</p>
                  <p className="opacity-90">{q.explanation}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}
