import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, LayoutDashboard, Code2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [selectedMode, setSelectedMode] = useState('notes');

  const handleLaunch = (e) => {
    e.preventDefault();
    if (selectedMode === 'notes') {
      navigate('/notes');
    } else {
      navigate('/dsatracker');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${
      isDark ? 'bg-[#1E080C] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'
    }`}>
      <div className={`w-full max-w-xl rounded-3xl border p-8 shadow-2xl backdrop-blur-md ${
        isDark ? 'bg-[#280B0F]/90 border-[#3B1319]' : 'bg-white/90 border-[#F7C8D3]'
      }`}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#B46A72] text-white shadow-md mb-4">
            <GraduationCapIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-display font-bold tracking-tight mb-2">Welcome to Notie & DSA Hub</h1>
          <p className="text-sm opacity-70 max-w-sm mx-auto">
            Choose your learning environment to begin your study session today.
          </p>
        </div>

        {/* Option Cards */}
        <form onSubmit={handleLaunch} className="space-y-4 mb-8">

          {/* Option 1: Standard Dashboard & Notes App */}
          <div
            onClick={() => setSelectedMode('notes')}
            className={`group cursor-pointer rounded-2xl border p-5 transition-all flex items-start gap-4 ${
              selectedMode === 'notes'
                ? 'border-[#B46A72] bg-[#B46A72]/10 ring-2 ring-[#B46A72]/30'
                : isDark ? 'border-[#3B1319] bg-[#1E080C] hover:border-[#B46A72]/50' : 'border-[#F7C8D3] bg-[#FFF5F6]/40 hover:border-[#B46A72]/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              selectedMode === 'notes' ? 'bg-[#B46A72] text-white' : 'bg-surface-200 text-surface-600'
            }`}>
              <LayoutDashboard size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base">1. Standard Notes & Study Workspace</h3>
                {selectedMode === 'notes' && <CheckCircle2 size={18} className="text-[#B46A72]" />}
              </div>
              <p className="text-xs opacity-70 leading-relaxed">
                Your full dashboard with subject indexing, folder manager, dual-screen PDF & Markdown reader, Pomodoro, and Quiz bank.
              </p>
            </div>
          </div>

          {/* Option 2: DSA Tracker (index.html inspired) */}
          <div
            onClick={() => setSelectedMode('dsa')}
            className={`group cursor-pointer rounded-2xl border p-5 transition-all flex items-start gap-4 ${
              selectedMode === 'dsa'
                ? 'border-[#B46A72] bg-[#B46A72]/10 ring-2 ring-[#B46A72]/30'
                : isDark ? 'border-[#3B1319] bg-[#1E080C] hover:border-[#B46A72]/50' : 'border-[#F7C8D3] bg-[#FFF5F6]/40 hover:border-[#B46A72]/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
              selectedMode === 'dsa' ? 'bg-[#B46A72] text-white' : 'bg-surface-200 text-surface-600'
            }`}>
              <Code2 size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-base">2. Advanced DSA Practice & Interview Tracker</h3>
                {selectedMode === 'dsa' && <CheckCircle2 size={18} className="text-[#B46A72]" />}
              </div>
              <p className="text-xs opacity-70 leading-relaxed">
                High-performance interview question tracker, difficulty filters, pattern breakdowns, and interactive coding problem sheets.
              </p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-3.5 px-6 rounded-2xl bg-[#B46A72] hover:bg-[#9f5960] text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Launch Environment</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs opacity-60 pt-4 border-t border-inherit">
          <span>Notie & DSA Practice Hub v2.5</span>
          <button
            type="button"
            onClick={toggleTheme}
            className="hover:underline font-medium"
          >
            Toggle {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>

      </div>
    </div>
  );
}

function GraduationCapIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  );
}
