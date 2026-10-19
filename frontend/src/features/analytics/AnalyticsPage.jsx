import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import {
  BarChart2,
  TrendingUp,
  Clock,
  Flame,
  CheckCircle2,
  Award,
  Sparkles,
  Cpu,
  Play,
  RotateCcw,
  ShieldCheck,
  Brain
} from 'lucide-react';
import { studentModel, historicalTrainingDataset } from './mlModelEngine';

export default function AnalyticsPage() {
  const { isDark, isNotion } = useTheme();

  // Student Telemetry State for ML Prediction
  const [studentRecord, setStudentRecord] = useState({
    weeklyHours: 12.5,
    streakDays: 7,
    avgConfidence: 4.3,
    completionRate: 82,
    totalSessions: 0,
    totalStudyMinutes: 0,
    subjectsCount: 0,
    topicsCount: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const data = await api.getAnalytics();
        if (data) {
          setStudentRecord({
            weeklyHours: data.weeklyHours || 12.5,
            streakDays: data.streakDays || 7,
            avgConfidence: data.avgConfidence || 4.3,
            completionRate: data.completionRate || 82,
            totalSessions: data.totalSessions || 0,
            totalStudyMinutes: data.totalStudyMinutes || 0,
            subjectsCount: data.subjectsCount || 0,
            topicsCount: data.topicsCount || 0
          });
        }
      } catch (err) {
        console.error('Failed to load live backend analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  // ML Training Simulation State
  const [isTraining, setIsTraining] = useState(false);
  const [trainingEpoch, setTrainingEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(0.4852);
  const [modelWeights, setModelWeights] = useState({ ...studentModel.weights });

  // Calculated Exam Success Probability (ESP)
  const successProbability = studentModel.predictSuccess(studentRecord);
  const recommendations = studentModel.getRecommendations(studentRecord);

  // Trigger Training Epochs
  const handleTrainModel = () => {
    setIsTraining(true);
    let epoch = 0;
    const interval = setInterval(() => {
      epoch += 1;
      const result = studentModel.trainEpoch(historicalTrainingDataset);
      setTrainingEpoch(epoch);
      setCurrentLoss(result.loss);
      setModelWeights({ ...result.weights });

      if (epoch >= 15) {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 150);
  };

  const handleResetModel = () => {
    studentModel.weights = { studyHours: 0.35, streakLength: 0.20, confidenceRating: 0.25, completionRate: 0.20 };
    studentModel.bias = -0.5;
    setModelWeights({ ...studentModel.weights });
    setTrainingEpoch(0);
    setCurrentLoss(0.4852);
  };

  // Mock analytics stats
  const stats = [
    { label: 'Total Study Hours', value: `${studentRecord.weeklyHours} hrs`, change: '+12% this week', icon: Clock, color: 'text-[#B46A72]' },
    { label: 'Current Streak', value: `${studentRecord.streakDays} Days`, change: 'Personal best!', icon: Flame, color: 'text-[#E0A96D]' },
    { label: 'Completion Rate', value: `${studentRecord.completionRate}%`, change: '+5.4% vs last week', icon: CheckCircle2, color: 'text-[#6B7C50]' },
    { label: 'Exam Success (AI)', value: `${successProbability}%`, change: 'High confidence', icon: Award, color: 'text-[#3b82f6]' },
  ];

  const subjectProgress = [
    { name: 'Data Mining', progress: 85, color: '#3b82f6', hours: 14.5, topics: '10/12' },
    { name: 'Machine Learning', progress: 70, color: '#8b5cf6', hours: 12.0, topics: '8/12' },
    { name: 'Database Systems', progress: 95, color: '#22c55e', hours: 10.5, topics: '6/6' },
    { name: 'Operating Systems', progress: 60, color: '#ef4444', hours: 7.5, topics: '6/10' },
    { name: 'Computer Networks', progress: 45, color: '#14b8a6', hours: 4.0, topics: '4/9' },
  ];

  const weeklyActivity = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 6.2 },
    { day: 'Wed', hours: 3.8 },
    { day: 'Thu', hours: 7.0 },
    { day: 'Fri', hours: 5.5 },
    { day: 'Sat', hours: 8.0 },
    { day: 'Sun', hours: 3.5 },
  ];

  const maxHours = Math.max(...weeklyActivity.map(w => w.hours));

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
            <BarChart2 size={16} />
            <span>Performance Metrics</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Analytics & Study Performance</h1>
          <p className="text-sm opacity-70 mt-1">Track study hours, weekly milestones, and subject mastery progress.</p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all ${
                isNotion
                  ? isDark ? 'bg-[#202020] border-[#373737]' : 'bg-white border-[#E9E9E7] shadow-sm'
                  : isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{stat.label}</span>
                <div className={`p-2.5 rounded-xl ${isNotion ? (isDark ? 'bg-[#252525]' : 'bg-black/5') : 'bg-black/5'} ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-display font-bold tracking-tight">{stat.value}</h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp size={12} /> {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Weekly Study Hours Bar Chart */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${
          isNotion
            ? isDark ? 'bg-[#202020] border-[#373737]' : 'bg-white border-[#E9E9E7] shadow-sm'
            : isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg">Weekly Study Hours</h3>
              <p className="text-xs opacity-60 mt-0.5">Total hours spent across all subjects this week</p>
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              isNotion
                ? isDark ? 'bg-[#252525] text-[#D4D4D4] border border-[#373737]' : 'bg-[#EFEFED] text-[#37352F] border border-[#E9E9E7]'
                : 'bg-[#B46A72]/10 text-[#B46A72]'
            }`}>
              Avg 5.5 hrs/day
            </span>
          </div>

          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2 border-b border-inherit">
            {weeklyActivity.map((item, idx) => {
              const heightPercent = (item.hours / maxHours) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.hours}h
                  </span>
                  <div
                    className={`w-full max-w-[44px] rounded-t-xl transition-all ${
                      isNotion
                        ? isDark ? 'bg-[#D4D4D4] group-hover:bg-white' : 'bg-[#37352F] group-hover:bg-[#202020]'
                        : 'bg-[#B46A72] group-hover:bg-[#9f5960]'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-medium opacity-70 pb-1">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Study Recommendations */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
          isNotion
            ? isDark ? 'bg-[#202020] border-[#373737]' : 'bg-white border-[#E9E9E7] shadow-sm'
            : isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'
        }`}>
          <div>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-3 ${
              isNotion ? (isDark ? 'text-amber-400' : 'text-[#37352F]') : 'text-[#B46A72]'
            }`}>
              <Sparkles size={16} />
              <span>AI Study Coach</span>
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Smart Insights</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              You are most productive during morning hours (9 AM - 12 PM). Your weakest subject is <strong>Computer Networks</strong> — recommend spending 2 hours reviewing TCP/IP protocols today.
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
            isNotion
              ? isDark ? 'bg-[#191919] border-[#373737]' : 'bg-[#F7F7F5] border-[#E9E9E7]'
              : isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-[#FFF5F6] border-[#F7C8D3]'
          }`}>
            <p className="font-semibold mb-1">🎯 Goal for today:</p>
            <p className="opacity-75">Complete 2 chapters of Exam Prep & clear 5 mistake notebook items.</p>
          </div>
        </div>

      </div>

      {/* Subject Completion Rates */}
      <div className={`p-6 rounded-2xl border ${
        isNotion
          ? isDark ? 'bg-[#202020] border-[#373737]' : 'bg-white border-[#E9E9E7] shadow-sm'
          : isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'
      }`}>
        <h3 className="font-display font-bold text-lg mb-6">Subject Completion Rates</h3>

        <div className="space-y-5">
          {subjectProgress.map((subj, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: subj.color }} />
                  <span>{subj.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs opacity-80">
                  <span>{subj.hours} hrs</span>
                  <span>{subj.topics} topics</span>
                  <span className="font-bold">{subj.progress}%</span>
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-black/10 dark:bg-black/30 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${subj.progress}%`, backgroundColor: subj.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
