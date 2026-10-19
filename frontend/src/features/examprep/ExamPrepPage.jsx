import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
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
  const { isDark, isNotion } = useTheme();

  const [exams, setExams] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('syllabus'); // 'syllabus' | 'confidence'
  const [selectedExamId, setSelectedExamId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New exam form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newChaptersCount, setNewChaptersCount] = useState(6);

  useEffect(() => {
    async function loadData() {
      try {
        const subjects = await api.getSubjects();
        const allTopics = await api.getAllTopics();

        // Build exams for every subject in Notes
        const generatedExams = subjects.map((sub, index) => {
          const subTopics = allTopics.filter(t => t.subject_id === sub.id);
          const compCount = subTopics.filter(t => t.status === 'done' || t.status === 'completed').length;
          const totCount = subTopics.length || 5;
          const avgConf = subTopics.length > 0 ? Math.round(subTopics.reduce((acc, curr) => acc + (curr.confidence || 4), 0) / subTopics.length) : 4;

          return {
            id: `ex-${sub.id}`,
            subjectId: sub.id,
            title: `${sub.name} Comprehensive Certification & Final Exam`,
            subject: sub.name,
            date: `2026-12-${String(10 + index).padStart(2, '0')}`,
            totalChapters: totCount,
            completedChapters: compCount,
            confidence: avgConf * 20, // percentage for display
            status: index === 2 ? 'completed' : 'upcoming'
          };
        });

        // Build chapters corresponding to topics for each subject
        const generatedChapters = [];
        subjects.forEach(sub => {
          const subTopics = allTopics.filter(t => t.subject_id === sub.id);
          const exId = `ex-${sub.id}`;

          if (subTopics.length > 0) {
            subTopics.forEach((t, i) => {
              generatedChapters.push({
                id: `ch-${t.id}`,
                examId: exId,
                title: `Chapter ${t.serial_number || i + 1}: ${t.title}`,
                status: t.status === 'done' ? 'completed' : t.status === 'in_progress' ? 'in_progress' : 'not_started',
                confidence: t.confidence || ((i % 3) + 3),
                hoursSpent: (i + 1) * 1.5,
                notes: t.note || 'Syllabus chapter notes.'
              });
            });
          } else {
            // Fallback default chapters if subject has no topics
            for (let i = 1; i <= 5; i++) {
              generatedChapters.push({
                id: `ch-${sub.id}-${i}`,
                examId: exId,
                title: `Chapter ${i}: Core Principles & Practice`,
                status: i === 1 ? 'completed' : 'not_started',
                confidence: 4,
                hoursSpent: i * 2,
                notes: 'Fundamental concepts.'
              });
            }
          }
        });

        setExams(generatedExams);
        setChapters(generatedChapters);
        if (generatedExams.length > 0) {
          setSelectedExamId(generatedExams[0].id);
        }
        setLoading(false);
      } catch (err) {
        console.error('Failed to load exam prep data from notes:', err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

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
  const avgConfidence = totalCount > 0 ? (examChapters.reduce((acc, curr) => acc + curr.confidence, 0) / totalCount).toFixed(1) : 0;

  if (loading) {
    return (
      <div className={`flex-1 min-h-screen p-8 flex items-center justify-center ${
        isNotion
          ? isDark ? 'bg-[#191919] text-[#D4D4D4]' : 'bg-[#FFFFFF] text-[#37352F]'
          : isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'
      }`}>
        <div className="text-center">
          <GraduationCap size={40} className={`animate-bounce mx-auto mb-3 ${isNotion ? (isDark ? 'text-white' : 'text-[#37352F]') : 'text-[#B46A72]'}`} />
          <p className="font-semibold text-lg">Syncing exam prep with all Notes subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 min-h-screen p-8 transition-colors ${
      isNotion
        ? isDark ? 'bg-[#191919] text-[#D4D4D4]' : 'bg-[#FFFFFF] text-[#37352F]'
        : isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'
    }`}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1 ${
            isNotion ? (isDark ? 'text-[#D4D4D4]' : 'text-[#37352F]') : 'text-[#B46A72]'
          }`}>
            <GraduationCap size={16} />
            <span>Academic Excellence</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Exam Prep & Syllabus Tracker</h1>
          <p className="text-sm opacity-70 mt-1">Synchronized with every subject in Notes: track exam countdowns, syllabus mastery, and confidence metrics.</p>
        </div>
      </div>

      {/* Exam Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {exams.map(exam => {
          const isSelected = exam.id === selectedExamId;
          const exChs = chapters.filter(c => c.examId === exam.id);
          const compChs = exChs.filter(c => c.status === 'completed').length;
          const totChs = exChs.length || 1;
          const pct = Math.round((compChs / totChs) * 100);
          const avgStar = exChs.length > 0 ? (exChs.reduce((a, b) => a + (b.confidence || 3), 0) / exChs.length).toFixed(1) : 0;

          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? isNotion
                    ? isDark
                      ? 'bg-[#252525] border-[#D4D4D4] shadow-lg ring-1 ring-[#D4D4D4]'
                      : 'bg-white border-[#37352F] shadow-md ring-2 ring-[#37352F]/10'
                    : isDark
                    ? 'bg-[#3B1319] border-[#B46A72] shadow-lg ring-1 ring-[#B46A72]'
                    : 'bg-white border-[#B46A72] shadow-md ring-2 ring-[#B46A72]/30'
                  : isNotion
                    ? isDark
                      ? 'bg-[#202020] border-[#373737] hover:border-[#D4D4D4]/40'
                      : 'bg-white border-[#E9E9E7] hover:border-[#37352F]/30 shadow-sm'
                    : isDark
                    ? 'bg-[#280B0F]/60 border-[#3B1319] hover:border-[#7B694E]/50'
                    : 'bg-white/80 border-[#F7C8D3] hover:border-[#B46A72]/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  exam.status === 'upcoming'
                    ? isNotion
                      ? 'bg-[#2383E2]/10 text-[#2383E2] border border-[#2383E2]/30'
                      : 'bg-[#B46A72]/10 text-[#B46A72] border border-[#B46A72]/30'
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
                <div className="w-full h-2 rounded-full bg-black/10 dark:bg-black/30 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isNotion ? (isDark ? 'bg-[#D4D4D4]' : 'bg-[#37352F]') : 'bg-[#B46A72]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-inherit text-xs opacity-70">
                <span>{compChs}/{exChs.length} Chapters</span>
                <span className={`font-semibold ${isNotion ? '' : 'text-[#B46A72]'}`}>Avg Conf: {avgStar}/5</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Card */}
      <div className={`rounded-2xl border p-6 ${
        isNotion
          ? isDark ? 'bg-[#202020] border-[#373737]' : 'bg-white border-[#E9E9E7] shadow-sm'
          : isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'
      }`}>

        {/* Search Bar & Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-inherit">
          <div className="flex items-center gap-2">
            <h3 className="font-display font-bold text-lg">
              {currentExam ? `${currentExam.subject} Syllabus Checklist` : 'Syllabus Checklist'}
            </h3>
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              isNotion
                ? isDark ? 'bg-[#252525] text-[#D4D4D4] border border-[#373737]' : 'bg-[#EFEFED] text-[#37352F] border border-[#E9E9E7]'
                : 'bg-[#B46A72]/15 text-[#B46A72]'
            }`}>
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
                isNotion
                  ? isDark
                    ? 'bg-[#191919] border-[#373737] text-[#D4D4D4] focus:border-[#D4D4D4]'
                    : 'bg-white border-[#E9E9E7] text-[#37352F] focus:border-[#37352F]'
                  : isDark
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
                  isNotion
                    ? isDark
                      ? 'bg-[#191919] border-[#373737]'
                      : 'bg-[#F7F7F5] border-[#E9E9E7]'
                    : isDark
                      ? 'bg-[#1E080C]/50 border-[#3B1319]'
                      : 'bg-[#FFF5F6]/40 border-[#F7C8D3]/60'
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

