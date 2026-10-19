import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
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
  const { isDark } = useTheme();

  // Student Telemetry State for ML Prediction
  const [studentRecord, setStudentRecord] = useState({
    weeklyHours: 32.5,
    streakDays: 7,
    avgConfidence: 4.2,
    completionRate: 82
  });

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
    <div className={`flex-1 min-h-screen p-8 transition-colors ${isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'}`}>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-1 text-[#B46A72]">
            <BarChart2 size={16} />
            <span>Performance Metrics & ML Training</span>
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Analytics & AI Model Dashboard</h1>
          <p className="text-sm opacity-70 mt-1">Train student telemetry models, simulate success probabilities, and track study milestones.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
            isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3]'
          }`}>
            🤖 ML Predictive Engine v2.4 Active
          </span>
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
                isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{stat.label}</span>
                <div className={`p-2.5 rounded-xl bg-black/5 ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <h3 className="text-3xl font-display font-bold tracking-tight">{stat.value}</h3>
                <span className="text-xs font-semibold text-[#6B7C50] flex items-center gap-0.5">
                  <TrendingUp size={12} /> {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ML Model Training & Telemetry Simulator Section */}
      <div className={`p-6 rounded-2xl border mb-8 ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-inherit mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-[#B46A72] text-white">
              <Brain size={22} />
            </span>
            <div>
              <h3 className="font-display font-bold text-lg">Student Success Analytics Engine</h3>
              <p className="text-xs opacity-70">Monitor study telemetry features, performance trends, and exam pass probabilities.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTrainModel}
              disabled={isTraining}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer ${
                isTraining ? 'bg-amber-600 text-white opacity-80' : 'bg-[#B46A72] hover:bg-[#9f5960] text-white'
              }`}
            >
              <Play size={14} /> {isTraining ? `Training Epoch ${trainingEpoch}/15...` : 'Train Model Weights'}
            </button>
            <button
              onClick={handleResetModel}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isDark ? 'border-[#3B1319] hover:bg-[#3B1319]' : 'border-[#F7C8D3] hover:bg-[#FFF5F6]'
              }`}
              title="Reset weights"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Telemetry Sliders / Controls */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <Cpu size={16} className="text-[#B46A72]" /> Student Telemetry Controls
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="opacity-75">Weekly Study Hours ({studentRecord.weeklyHours}h)</span>
                  <span className="font-bold">{studentRecord.weeklyHours}h</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="0.5"
                  value={studentRecord.weeklyHours}
                  onChange={(e) => setStudentRecord({ ...studentRecord, weeklyHours: Number(e.target.value) })}
                  className="w-full accent-[#B46A72]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="opacity-75">Study Streak Days ({studentRecord.streakDays} Days)</span>
                  <span className="font-bold">{studentRecord.streakDays}d</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="21"
                  step="1"
                  value={studentRecord.streakDays}
                  onChange={(e) => setStudentRecord({ ...studentRecord, streakDays: Number(e.target.value) })}
                  className="w-full accent-[#B46A72]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="opacity-75">Average Confidence ({studentRecord.avgConfidence}/5)</span>
                  <span className="font-bold">{studentRecord.avgConfidence}/5</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={studentRecord.avgConfidence}
                  onChange={(e) => setStudentRecord({ ...studentRecord, avgConfidence: Number(e.target.value) })}
                  className="w-full accent-[#B46A72]"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="opacity-75">Syllabus Completion Rate ({studentRecord.completionRate}%)</span>
                  <span className="font-bold">{studentRecord.completionRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={studentRecord.completionRate}
                  onChange={(e) => setStudentRecord({ ...studentRecord, completionRate: Number(e.target.value) })}
                  className="w-full accent-[#B46A72]"
                />
              </div>
            </div>
          </div>

          {/* Model Weights & Loss Metrics */}
          <div className={`p-4 rounded-2xl border space-y-4 ${isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-[#FFF5F6]/60 border-[#F7C8D3]'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">Model Loss & Convergence</h4>
              <span className="text-xs font-mono font-bold text-[#6B7C50]">Loss: {currentLoss}</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="opacity-70">Weight (Study Hours):</span>
                <span>{modelWeights.studyHours.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Weight (Streak):</span>
                <span>{modelWeights.streakLength.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Weight (Confidence):</span>
                <span>{modelWeights.confidenceRating.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Weight (Completion):</span>
                <span>{modelWeights.completionRate.toFixed(3)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-inherit flex items-center justify-between text-xs">
              <span className="opacity-70">Trained Epochs:</span>
              <span className="font-bold">{trainingEpoch} / 15</span>
            </div>
          </div>

          {/* Prediction Output & Recommendations */}
          <div className="flex flex-col justify-between">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-[#FFF5F6]/60 border-[#F7C8D3]'}`}>
              <div className="flex items-center gap-2 mb-2 text-[#B46A72] font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} /> Predicted Exam Success Probability
              </div>
              <div className="text-4xl font-display font-black tracking-tight mb-1 text-inherit">
                {successProbability}%
              </div>
              <p className="text-xs opacity-70">
                {successProbability >= 80 ? '🟢 Excellent trajectory. High probability of top exam scores.' : successProbability >= 60 ? '🟡 Good progress. Focus on weak subjects to boost score.' : '🔴 Action required. Increase study hours & chapter completion.'}
              </p>
            </div>

            <div className="mt-3">
              <h5 className="text-xs font-bold uppercase tracking-wider opacity-70 mb-2">AI Recommendations:</h5>
              <div className="space-y-1.5 text-xs">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B46A72] mt-1.5 shrink-0" />
                    <div>
                      <span className="font-bold">{rec.title}:</span> <span className="opacity-80">{rec.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Weekly Study Hours Bar Chart */}
        <div className={`lg:col-span-2 p-6 rounded-2xl border ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg">Weekly Study Hours</h3>
              <p className="text-xs opacity-60 mt-0.5">Total hours spent across all subjects this week</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#B46A72]/10 text-[#B46A72]">
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
                    className="w-full max-w-[44px] rounded-t-xl bg-[#B46A72] transition-all group-hover:bg-[#9f5960]"
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-xs font-medium opacity-70 pb-1">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Study Recommendations */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'}`}>
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B46A72] mb-3">
              <Sparkles size={16} />
              <span>AI Study Coach</span>
            </div>
            <h3 className="font-display font-bold text-lg mb-2">Smart Insights</h3>
            <p className="text-sm opacity-80 leading-relaxed mb-4">
              You are most productive during morning hours (9 AM - 12 PM). Your weakest subject is <strong className="text-[#B46A72]">Computer Networks</strong> — recommend spending 2 hours reviewing TCP/IP protocols today.
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-xs leading-relaxed ${isDark ? 'bg-[#1E080C] border-[#3B1319]' : 'bg-[#FFF5F6] border-[#F7C8D3]'}`}>
            <p className="font-semibold mb-1">🎯 Goal for today:</p>
            <p className="opacity-75">Complete 2 chapters of Exam Prep & clear 5 mistake notebook items.</p>
          </div>
        </div>

      </div>

      {/* Subject Completion Rates */}
      <div className={`p-6 rounded-2xl border ${isDark ? 'bg-[#280B0F] border-[#3B1319]' : 'bg-white border-[#F7C8D3] shadow-sm'}`}>
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
                  <span className="font-bold text-[#B46A72]">{subj.progress}%</span>
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-black/10 overflow-hidden">
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
