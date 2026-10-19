import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Calendar,
  Check,
  X
} from 'lucide-react';

export default function ExamPrepPage() {
  const { isDark } = useTheme();

  // Mock exams data with state handlers (all subjects from Notes)
  const [exams, setExams] = useState([
    {
      id: 'ex-1',
      title: 'Advanced Data Mining & KDD Certification',
      subject: 'Data Mining',
      date: '2026-11-15',
      totalChapters: 8,
      completedChapters: 5,
      confidence: 80,
      status: 'upcoming'
    },
    {
      id: 'ex-2',
      title: 'Machine Learning Mid-Term Exam',
      subject: 'Machine Learning',
      date: '2026-11-28',
      totalChapters: 12,
      completedChapters: 7,
      confidence: 65,
      status: 'upcoming'
    },
    {
      id: 'ex-3',
      title: 'Database Systems Final Exam',
      subject: 'Database Systems',
      date: '2026-12-10',
      totalChapters: 6,
      completedChapters: 6,
      confidence: 95,
      status: 'completed'
    },
    {
      id: 'ex-4',
      title: 'Operating Systems Certification',
      subject: 'Operating Systems',
      date: '2026-12-18',
      totalChapters: 10,
      completedChapters: 4,
      confidence: 70,
      status: 'upcoming'
    },
    {
      id: 'ex-5',
      title: 'Computer Networks Comprehensive Exam',
      subject: 'Computer Networks',
      date: '2027-01-10',
      totalChapters: 9,
      completedChapters: 3,
      confidence: 60,
      status: 'upcoming'
    }
  ]);

  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'confidence'
  const [selectedExamId, setSelectedExamId] = useState('ex-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New exam form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newChaptersCount, setNewChaptersCount] = useState(6);

  // Syllabus tracker chapters
  const [chapters, setChapters] = useState([
    { id: 'ch-1', examId: 'ex-1', title: 'Chapter 1: Introduction to KDD & Data Preprocessing', status: 'completed', confidence: 5, hoursSpent: 4.5, notes: 'Normalization & imputation.' },
    { id: 'ch-2', examId: 'ex-1', title: 'Chapter 2: Exploratory Data Analysis & Statistics', status: 'completed', confidence: 4, hoursSpent: 3.0, notes: 'Variance & covariance.' },
    { id: 'ch-3', examId: 'ex-1', title: 'Chapter 3: Classification - Decision Trees & Naive Bayes', status: 'completed', confidence: 4, hoursSpent: 6.0, notes: 'Gini impurity & entropy.' },
    { id: 'ch-4', examId: 'ex-1', title: 'Chapter 4: Advanced Classification - SVMs & Neural Nets', status: 'in_progress', confidence: 3, hoursSpent: 5.5, notes: 'Kernel tricks.' },
    { id: 'ch-5', examId: 'ex-1', title: 'Chapter 5: Association Rule Mining (Apriori & FP-Growth)', status: 'in_progress', confidence: 3, hoursSpent: 4.0, notes: 'Support & confidence.' },
    { id: 'ch-6', examId: 'ex-1', title: 'Chapter 6: Cluster Analysis (K-Means, DBSCAN)', status: 'not_started', confidence: 2, hoursSpent: 0, notes: 'Pending.' },
    { id: 'ch-7', examId: 'ex-1', title: 'Chapter 7: Outlier Detection & Anomaly Mining', status: 'not_started', confidence: 1, hoursSpent: 0, notes: 'Pending.' },
    { id: 'ch-8', examId: 'ex-1', title: 'Chapter 8: Mining Data Streams & Graph Mining', status: 'not_started', confidence: 1, hoursSpent: 0, notes: 'Pending.' },
    // Exam 2 chapters (Machine Learning)
    { id: 'ch-9', examId: 'ex-2', title: 'Chapter 1: Linear Regression & Cost Functions', status: 'completed', confidence: 5, hoursSpent: 3.5, notes: 'Gradient descent.' },
    { id: 'ch-10', examId: 'ex-2', title: 'Chapter 2: Logistic Regression & Regularization', status: 'completed', confidence: 4, hoursSpent: 4.0, notes: 'L1 & L2 penalties.' },
    { id: 'ch-11', examId: 'ex-2', title: 'Chapter 3: Neural Networks & Backpropagation', status: 'in_progress', confidence: 3, hoursSpent: 5.0, notes: 'Activation functions.' },
    // Exam 3 chapters (Database Systems)
    { id: 'ch-12', examId: 'ex-3', title: 'Chapter 1: Relational Algebra & SQL Optimization', status: 'completed', confidence: 5, hoursSpent: 5.0, notes: 'Execution plans.' },
    { id: 'ch-13', examId: 'ex-3', title: 'Chapter 2: Transactions, ACID & Concurrency Control', status: 'completed', confidence: 5, hoursSpent: 4.0, notes: 'Two-phase locking.' },
    // Exam 4 chapters (Operating Systems)
    { id: 'ch-14', examId: 'ex-4', title: 'Chapter 1: Processes, Threads & CPU Scheduling', status: 'completed', confidence: 4, hoursSpent: 4.5, notes: 'Round robin & SJF.' },
    { id: 'ch-15', examId: 'ex-4', title: 'Chapter 2: Synchronization, Semaphores & Deadlocks', status: 'in_progress', confidence: 3, hoursSpent: 3.5, notes: 'Bankers algorithm.' },
    // Exam 5 chapters (Computer Networks)
    { id: 'ch-16', examId: 'ex-5', title: 'Chapter 1: OSI & TCP/IP Reference Models', status: 'completed', confidence: 5, hoursSpent: 3.0, notes: 'Encapsulation & layers.' },
    { id: 'ch-17', examId: 'ex-5', title: 'Chapter 2: Routing Protocols (BGP, OSPF)', status: 'in_progress', confidence: 3, hoursSpent: 4.0, notes: 'Distance vector vs link state.' }
  ]);

  const toggleChapterStatus = (chId) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === chId) {
        const nextStatus = ch.status === 'not_started' ? 'in_progress' : ch.status === 'in_progress' ? 'completed' : 'not_started';
        return { ...ch, status: nextStatus };
      }
      return ch;
    }));
  };

  const updateConfidence = (chId, newConf) => {
    setChapters(prev => prev.map(ch => ch.id === chId ? { ...ch, confidence: newConf } : ch));
  };

  const handleAddExam = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject.trim()) return;

    const newExId = `ex-${Date.now()}`;
    const newExamObj = {
      id: newExId,
      title: newTitle,
      subject: newSubject,
      date: newDate || '2026-12-31',
      totalChapters: Number(newChaptersCount) || 5,
      completedChapters: 0,
      confidence: 50,
      status: 'upcoming'
    };

    // Create initial chapters for this exam
    const generatedChapters = Array.from({ length: Number(newChaptersCount) || 5 }, (_, i) => ({
      id: `ch-${Date.now()}-${i}`,
      examId: newExId,
      title: `Chapter ${i + 1}: Core Concepts & Practice`,
      status: 'not_started',
      confidence: 3,
      hoursSpent: 0,
      notes: 'New syllabus chapter.'
    }));

    setExams(prev => [newExamObj, ...prev]);
    setChapters(prev => [...generatedChapters, ...prev]);
    setSelectedExamId(newExId);
    setNewTitle('');
    setNewSubject('');
    setNewDate('');
    setIsAddModalOpen(false);
  };

  const currentExam = exams.find(e => e.id === selectedExamId) || exams[0];
  const examChapters = chapters.filter(ch => ch.examId === selectedExamId);
  const filteredChapters = examChapters.filter(ch => ch.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const completedCount = examChapters.filter(ch => ch.status === 'completed').length;
  const totalCount = examChapters.length;
  const avgConfidence = totalCount > 0 ? Math.round(examChapters.reduce((acc, curr) => acc + curr.confidence, 0) / totalCount) : 0;

  return (
    <div className={`flex-1 min-h-screen p-8 transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'}`}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1 text-[#B46A72]">
            <GraduationCap size={16} />
            <span>Academic Excellence</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Exam Prep & Syllabus Tracker</h1>
          <p className="text-sm opacity-70 mt-1">Manage exam countdowns, syllabus mastery chapters, and confidence metrics.</p>
        </div>
      </div>

      {/* Exam Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {exams.map(exam => {
          const isSelected = exam.id === selectedExamId;
          const exChs = chapters.filter(c => c.examId === exam.id);
          const compChs = exChs.filter(c => c.status === 'completed').length;
          const totChs = exChs.length || 1;
          const pct = Math.round((compChs / totChs) * 100);

          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? isDark
                    ? 'bg-[#3B1319] border-[#B46A72] shadow-lg ring-1 ring-[#B46A72]'
                    : 'bg-white border-[#B46A72] shadow-md ring-2 ring-[#B46A72]/30'
                  : isDark
                    ? 'bg-[#280B0F]/60 border-[#3B1319] hover:border-[#7B694E]/50'
                    : 'bg-white/80 border-[#F7C8D3] hover:border-[#B46A72]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  exam.status === 'upcoming'
                    ? 'bg-[#B46A72]/10 text-[#B46A72] border border-[#B46A72]/30'
                    : 'bg-[#A8B58A]/20 text-[#6B7C50] border border-[#A8B58A]/40'
                }`}>
                  {exam.subject}
                </span>
                <span className="flex items-center gap-1 text-xs opacity-75">
                  <Calendar size={13} />
                  {exam.date}
                </span>
              </div>

              <h3 className="font-display font-bold text-lg mb-2 line-clamp-1">{exam.title}</h3>

              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-xs opacity-80 font-medium">
                  <span>Syllabus Covered</span>
                  <span>{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/10 overflow-hidden">
                  <div
                    className="h-full bg-[#B46A72] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-inherit text-xs opacity-70">
                <span>{compChs}/{exChs.length} Chapters</span>
                <span className="font-semibold text-[#B46A72]">Avg Conf: {Math.round(exChs.reduce((a,b)=>a+b.confidence,0)/(exChs.length||1))}/5</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div className={`rounded-2xl border p-6 ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'}`}>

        {/* Search Bar & Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-inherit">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg">Syllabus & Confidence Checklist</h3>
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#B46A72]/15 text-[#B46A72] font-semibold">
              {completedCount}/{totalCount} Completed • {avgConfidence}/5 Avg Conf
            </span>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" size={16} />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border outline-none transition-all ${
                isDark
                  ? 'bg-[#1E080C] border-[#3B1319] text-[#C6B39A] focus:border-[#B46A72]'
                  : 'bg-[#FFF5F6]/50 border-[#F7C8D3] text-[#2D3A47] focus:border-[#B46A72]'
              }`}
            />
          </div>
        </div>

        {/* Syllabus Table / List */}
        <div className="mt-6 space-y-3">
          {filteredChapters.length === 0 ? (
            <div className="text-center py-12 opacity-60">
              <BookOpen size={36} className="mx-auto mb-2 opacity-50" />
              <p>No chapters found matching your query for this exam.</p>
            </div>
          ) : (
            filteredChapters.map(ch => (
              <div
                key={ch.id}
                className={`flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${
                  isDark ? 'bg-[#1E080C]/50 border-[#3B1319]' : 'bg-[#FFF5F6]/40 border-[#F7C8D3]/60'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <button
                    onClick={() => toggleChapterStatus(ch.id)}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                      ch.status === 'completed'
                        ? 'bg-[#6B7C50] border-[#6B7C50] text-white'
                        : ch.status === 'in_progress'
                        ? 'bg-[#B46A72]/20 border-[#B46A72] text-[#B46A72]'
                        : isDark ? 'border-[#7B694E]/40' : 'border-[#2D3A47]/30'
                    }`}
                    title="Click to cycle status"
                  >
                    {ch.status === 'completed' && <Check size={14} />}
                    {ch.status === 'in_progress' && <Clock size={12} />}
                  </button>

                  <div>
                    <h4 className={`font-semibold text-sm md:text-base ${ch.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                      {ch.title}
                    </h4>
                    <p className="text-xs opacity-70 mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {ch.hoursSpent} hrs studied
                      </span>
                      <span>•</span>
                      <span>{ch.notes}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-inherit">
                  {/* Status Badge */}
                  <span className={`text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide ${
                    ch.status === 'completed'
                      ? 'bg-[#6B7C50]/20 text-[#6B7C50]'
                      : ch.status === 'in_progress'
                      ? 'bg-[#B46A72]/15 text-[#B46A72]'
                      : 'bg-black/10 opacity-60'
                  }`}>
                    {ch.status.replace('_', ' ')}
                  </span>

                  {/* Confidence Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => updateConfidence(ch.id, star)}
                        className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold transition-colors cursor-pointer ${
                          star <= ch.confidence
                            ? 'bg-[#B46A72] text-white shadow-sm'
                            : isDark ? 'bg-[#3B1319] text-[#C6B39A]/40' : 'bg-[#F7C8D3]/40 text-[#2D3A47]/40'
                        }`}
                        title={`Confidence Level ${star}/5`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
